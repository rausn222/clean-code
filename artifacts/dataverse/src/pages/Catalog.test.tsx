import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Catalog from "./Catalog";

/**
 * UI-level regression test: when a favourite add/remove request fails
 * (e.g. server unreachable), the optimistic star state must revert instead
 * of silently keeping a state the server never saw.
 */

const summary = {
  totalProducts: 1,
  publishedCount: 1,
  draftCount: 0,
  healthyCount: 0,
  failedCount: 0,
  domains: [{ domain: "Sales", count: 1 }],
};

const products = [
  {
    id: 1,
    name: "Orders",
    urn: "urn:test:orders",
    description: "Order data",
    domain: "Sales",
    status: "published",
    latestRun: null,
  },
];

type FetchMode = { failMutations: boolean; fullOutage: boolean };
const mode: FetchMode = { failMutations: false, fullOutage: false };

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// Server-side favourites state simulated by the fetch stub
let serverFavourites: number[] = [];

beforeEach(() => {
  serverFavourites = [];
  mode.failMutations = false;
  mode.fullOutage = false;
  localStorage.clear();
  // Keep the guided tour closed so its overlay doesn't block interactions
  localStorage.setItem("dataverse-catalog-tour-done", "1");

  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.pathname
            : input.url;
      const method = (init?.method ?? "GET").toUpperCase();

      if (url.includes("/api/auth/user")) {
        return jsonResponse({ user: { id: "test-user", email: "test@example.com" } });
      }
      if (url.includes("/api/catalog/summary")) return jsonResponse(summary);
      if (url.includes("/api/data-products")) return jsonResponse(products);
      if (url.includes("/api/favourites")) {
        if (mode.fullOutage) {
          // Simulate a completely unreachable favourites API (all methods)
          await new Promise((r) => setTimeout(r, 100));
          throw new TypeError("Failed to fetch");
        }
        if (method === "GET") {
          return jsonResponse({ productIds: serverFavourites });
        }
        if (mode.failMutations) {
          // Delay so the optimistic UI state is observable before rollback
          await new Promise((r) => setTimeout(r, 200));
          return jsonResponse({ error: "Service unavailable" }, 503);
        }
        const idMatch = url.match(/\/api\/favourites\/(\d+)/);
        const id = idMatch ? Number(idMatch[1]) : null;
        if (method === "PUT" && id) {
          if (!serverFavourites.includes(id)) serverFavourites.push(id);
        }
        if (method === "DELETE" && id) {
          serverFavourites = serverFavourites.filter((f) => f !== id);
        }
        return jsonResponse({ productIds: serverFavourites });
      }
      return jsonResponse({ error: "Not found" }, 404);
    }),
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function renderCatalog() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <Catalog />
    </QueryClientProvider>,
  );
}

function getStar() {
  // Re-query on every use: rows re-render (and re-sort) when favourites
  // change, so a held element reference can go stale.
  return screen.getByRole("button", {
    name: /add to favourites|remove from favourites/i,
  });
}

async function findStar() {
  return await screen.findByRole("button", {
    name: /add to favourites|remove from favourites/i,
  });
}

async function expectStarPressed(pressed: boolean) {
  await waitFor(() =>
    expect(getStar().getAttribute("aria-pressed")).toBe(String(pressed)),
  );
}

describe("Catalog favourites star", () => {
  it("keeps the star favourited when the add request succeeds", async () => {
    renderCatalog();
    const star = await findStar();
    expect(star.getAttribute("aria-pressed")).toBe("false");

    fireEvent.click(getStar());
    // Optimistic update flips (react-query batches notifications)
    await expectStarPressed(true);

    // Stays favourited after the server confirms
    await waitFor(() => expect(serverFavourites).toContain(1));
    await expectStarPressed(true);
  });

  it("reverts the star when the add request fails", async () => {
    mode.failMutations = true;
    renderCatalog();
    await findStar();

    fireEvent.click(getStar());
    // Optimistic update flips first...
    await expectStarPressed(true);

    // ...then rolls back to the server truth (not favourited) on error
    await expectStarPressed(false);
  });

  it("restores the star when a remove request fails", async () => {
    serverFavourites = [1];
    renderCatalog();
    await findStar();
    await expectStarPressed(true);

    mode.failMutations = true;
    fireEvent.click(getStar());
    // Optimistic removal...
    await expectStarPressed(false);

    // ...rolled back: the favourite is still there because the server kept it
    await expectStarPressed(true);
  });

  it("restores the last known-good state when the server is fully unreachable", async () => {
    serverFavourites = [1];
    renderCatalog();
    await findStar();
    await expectStarPressed(true);

    // Every favourites request (GET included) now fails at the network level
    mode.fullOutage = true;
    fireEvent.click(getStar());
    // Optimistic removal shows briefly...
    await expectStarPressed(false);

    // ...but rolls back to the pre-mutation snapshot even though the
    // revalidation refetch also fails — the favourite must not disappear.
    await expectStarPressed(true);
    // And it stays that way (no late flip once the failed refetch settles)
    await new Promise((r) => setTimeout(r, 300));
    await expectStarPressed(true);
  });
});
