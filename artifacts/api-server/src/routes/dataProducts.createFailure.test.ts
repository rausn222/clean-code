import { afterAll, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { eq } from "drizzle-orm";
import { db, dataProductsTable, pool } from "@workspace/db";

/**
 * Verifies product creation is all-or-nothing: if default-plan provisioning
 * fails, the transaction rolls back and no data product is left behind.
 */

vi.mock("../lib/defaultSubscriptionPlans", () => ({
  provisionDefaultPlans: vi.fn(async () => {
    throw new Error("simulated plan provisioning failure");
  }),
}));

// Import app after the mock so the route picks up the mocked module
const { default: app } = await import("../app");

const NAME = `Vitest Rollback Product ${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

afterAll(async () => {
  // Safety net in case rollback ever regresses
  await db.delete(dataProductsTable).where(eq(dataProductsTable.name, NAME));
  await pool.end();
});

describe("POST /api/data-products (provisioning failure)", () => {
  it("rolls back the product when plan provisioning fails", async () => {
    const res = await request(app).post("/api/data-products").send({
      name: NAME,
      description: "Should never persist",
      domain: "engineering",
      owner: "vitest",
    });
    expect(res.status).toBe(500);

    const orphans = await db
      .select()
      .from(dataProductsTable)
      .where(eq(dataProductsTable.name, NAME));
    expect(orphans).toHaveLength(0);
  });
});
