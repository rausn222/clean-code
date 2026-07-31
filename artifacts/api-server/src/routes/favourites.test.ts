import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { and, eq } from "drizzle-orm";
import {
  db,
  dataProductsTable,
  favouritesTable,
  usersTable,
  pool,
} from "@workspace/db";
import app from "../app";
import { createSession, deleteSession } from "../lib/auth";

/**
 * Favourites API tests (per-user favourites).
 *
 * These run against the development database. All favourite rows are scoped
 * to a dedicated test user, so real users' favourites are never touched.
 * A dedicated temporary data product is created for the tests and removed at
 * the end (favourite rows cascade with it).
 */

// Unique per run so concurrent/shared-DB runs never collide
const RUN_ID = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
const TEST_USER_ID = `__vitest_favourites_user_${RUN_ID}__`;

let sid: string;
let authHeader: Record<string, string>;
let testProductId: number;
let nonExistentProductId: number;

async function currentFavouriteIds(): Promise<number[]> {
  const rows = await db
    .select({ dataProductId: favouritesTable.dataProductId })
    .from(favouritesTable)
    .where(eq(favouritesTable.userId, TEST_USER_ID));
  return rows.map((r) => r.dataProductId);
}

beforeAll(async () => {
  // favourites.user_id has a FK to users.id, so the test user must exist
  await db
    .insert(usersTable)
    .values({
      id: TEST_USER_ID,
      email: `vitest-favourites-${RUN_ID}@example.com`,
    })
    .onConflictDoNothing();

  sid = await createSession({
    user: {
      id: TEST_USER_ID,
      email: "vitest@example.com",
      firstName: "Vitest",
      lastName: "User",
      profileImageUrl: null,
    },
    access_token: "test-token",
    expires_at: Math.floor(Date.now() / 1000) + 3600,
  });
  authHeader = { Authorization: `Bearer ${sid}` };

  const [product] = await db
    .insert(dataProductsTable)
    .values({
      name: "__test_favourites_product__",
      urn: `urn:test:favourites:${Date.now()}`,
      description: "Temporary product created by favourites API tests",
      domain: "Test",
      owner: "vitest",
    })
    .returning({ id: dataProductsTable.id });
  testProductId = product!.id;
  // An id guaranteed not to reference any product
  nonExistentProductId = testProductId + 1_000_000;
});

afterAll(async () => {
  // Remove the temp product (cascades to any favourite rows referencing it)
  await db
    .delete(dataProductsTable)
    .where(eq(dataProductsTable.id, testProductId));
  // Remove any remaining rows belonging to the test user, then the session
  await db
    .delete(favouritesTable)
    .where(eq(favouritesTable.userId, TEST_USER_ID));
  await deleteSession(sid);
  // Removing the user cascades any remaining favourite rows
  await db.delete(usersTable).where(eq(usersTable.id, TEST_USER_ID));
  await pool.end();
});

beforeEach(async () => {
  // Each test starts with no favourites for the test user
  await db
    .delete(favouritesTable)
    .where(eq(favouritesTable.userId, TEST_USER_ID));
});

describe("authentication", () => {
  it("rejects unauthenticated requests with 401", async () => {
    const res = await request(app).get("/api/favourites");
    expect(res.status).toBe(401);
  });
});

describe("GET /api/favourites", () => {
  it("returns an empty list when there are no favourites", async () => {
    const res = await request(app).get("/api/favourites").set(authHeader);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ productIds: [] });
  });

  it("returns favourited product ids", async () => {
    await db
      .insert(favouritesTable)
      .values({ userId: TEST_USER_ID, dataProductId: testProductId });
    const res = await request(app).get("/api/favourites").set(authHeader);
    expect(res.status).toBe(200);
    expect(res.body.productIds).toEqual([testProductId]);
  });
});

describe("PUT /api/favourites/:productId", () => {
  it("adds a favourite and returns the full list", async () => {
    const res = await request(app)
      .put(`/api/favourites/${testProductId}`)
      .set(authHeader);
    expect(res.status).toBe(200);
    expect(res.body.productIds).toContain(testProductId);
    expect(await currentFavouriteIds()).toContain(testProductId);
  });

  it("is idempotent when the product is already favourited", async () => {
    await request(app).put(`/api/favourites/${testProductId}`).set(authHeader);
    const res = await request(app)
      .put(`/api/favourites/${testProductId}`)
      .set(authHeader);
    expect(res.status).toBe(200);
    expect(
      res.body.productIds.filter((id: number) => id === testProductId),
    ).toHaveLength(1);
  });

  it("rejects invalid product ids with 400", async () => {
    for (const bad of ["abc", "-1", "0", "1.5"]) {
      const res = await request(app)
        .put(`/api/favourites/${bad}`)
        .set(authHeader);
      expect(res.status, `id=${bad}`).toBe(400);
    }
    expect(await currentFavouriteIds()).toEqual([]);
  });

  it("returns 404 for a non-existent product", async () => {
    const res = await request(app)
      .put(`/api/favourites/${nonExistentProductId}`)
      .set(authHeader);
    expect(res.status).toBe(404);
    expect(await currentFavouriteIds()).toEqual([]);
  });
});

describe("DELETE /api/favourites/:productId", () => {
  it("removes a favourite and returns the remaining list", async () => {
    await db
      .insert(favouritesTable)
      .values({ userId: TEST_USER_ID, dataProductId: testProductId });
    const res = await request(app)
      .delete(`/api/favourites/${testProductId}`)
      .set(authHeader);
    expect(res.status).toBe(200);
    expect(res.body.productIds).not.toContain(testProductId);
    expect(await currentFavouriteIds()).toEqual([]);
  });

  it("succeeds even when the product was not favourited", async () => {
    const res = await request(app)
      .delete(`/api/favourites/${testProductId}`)
      .set(authHeader);
    expect(res.status).toBe(200);
    expect(res.body.productIds).toEqual([]);
  });

  it("rejects invalid product ids with 400", async () => {
    const res = await request(app)
      .delete("/api/favourites/not-a-number")
      .set(authHeader);
    expect(res.status).toBe(400);
  });

  it("does not remove other favourites", async () => {
    await db
      .insert(favouritesTable)
      .values({ userId: TEST_USER_ID, dataProductId: testProductId });
    const res = await request(app)
      .delete(`/api/favourites/${nonExistentProductId}`)
      .set(authHeader);
    expect(res.status).toBe(200);
    expect(res.body.productIds).toContain(testProductId);
  });
});

describe("POST /api/favourites/sync", () => {
  it("merges valid ids, skipping non-existent products", async () => {
    const res = await request(app)
      .post("/api/favourites/sync")
      .set(authHeader)
      .send({ productIds: [testProductId, nonExistentProductId] });
    expect(res.status).toBe(200);
    expect(res.body.productIds).toContain(testProductId);
    expect(res.body.productIds).not.toContain(nonExistentProductId);
  });

  it("does not drop existing favourites when merging", async () => {
    await db
      .insert(favouritesTable)
      .values({ userId: TEST_USER_ID, dataProductId: testProductId });
    const res = await request(app)
      .post("/api/favourites/sync")
      .set(authHeader)
      .send({ productIds: [] });
    expect(res.status).toBe(200);
    expect(res.body.productIds).toContain(testProductId);
  });

  it("rejects a malformed body with 400", async () => {
    const res = await request(app)
      .post("/api/favourites/sync")
      .set(authHeader)
      .send({ productIds: "not-an-array" });
    expect(res.status).toBe(400);
  });

  it("deduplicates and ignores invalid ids in the payload", async () => {
    const res = await request(app)
      .post("/api/favourites/sync")
      .set(authHeader)
      .send({ productIds: [testProductId, testProductId, -5, 0] });
    expect(res.status).toBe(200);
    expect(
      res.body.productIds.filter((id: number) => id === testProductId),
    ).toHaveLength(1);
  });
});
