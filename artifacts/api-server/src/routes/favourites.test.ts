import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { eq } from "drizzle-orm";
import { db, dataProductsTable, favouritesTable, pool } from "@workspace/db";
import app from "../app";

/**
 * Favourites API tests.
 *
 * These run against the development database. To avoid clobbering real
 * favourites, the existing favourites rows are snapshotted before the suite
 * and restored afterwards. A dedicated temporary data product is created for
 * the tests and removed at the end.
 */

let savedFavouriteIds: number[] = [];
let testProductId: number;
let nonExistentProductId: number;

async function currentFavouriteIds(): Promise<number[]> {
  const rows = await db
    .select({ dataProductId: favouritesTable.dataProductId })
    .from(favouritesTable);
  return rows.map((r) => r.dataProductId);
}

beforeAll(async () => {
  savedFavouriteIds = await currentFavouriteIds();

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
  // Restore the original favourites exactly
  await db.delete(favouritesTable);
  if (savedFavouriteIds.length > 0) {
    await db
      .insert(favouritesTable)
      .values(savedFavouriteIds.map((dataProductId) => ({ dataProductId })));
  }
  await pool.end();
});

beforeEach(async () => {
  // Each test starts from an empty favourites table
  await db.delete(favouritesTable);
});

describe("GET /api/favourites", () => {
  it("returns an empty list when there are no favourites", async () => {
    const res = await request(app).get("/api/favourites");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ productIds: [] });
  });

  it("returns favourited product ids", async () => {
    await db.insert(favouritesTable).values({ dataProductId: testProductId });
    const res = await request(app).get("/api/favourites");
    expect(res.status).toBe(200);
    expect(res.body.productIds).toEqual([testProductId]);
  });
});

describe("PUT /api/favourites/:productId", () => {
  it("adds a favourite and returns the full list", async () => {
    const res = await request(app).put(`/api/favourites/${testProductId}`);
    expect(res.status).toBe(200);
    expect(res.body.productIds).toContain(testProductId);
    expect(await currentFavouriteIds()).toContain(testProductId);
  });

  it("is idempotent when the product is already favourited", async () => {
    await request(app).put(`/api/favourites/${testProductId}`);
    const res = await request(app).put(`/api/favourites/${testProductId}`);
    expect(res.status).toBe(200);
    expect(
      res.body.productIds.filter((id: number) => id === testProductId),
    ).toHaveLength(1);
  });

  it("rejects invalid product ids with 400", async () => {
    for (const bad of ["abc", "-1", "0", "1.5"]) {
      const res = await request(app).put(`/api/favourites/${bad}`);
      expect(res.status, `id=${bad}`).toBe(400);
    }
    expect(await currentFavouriteIds()).toEqual([]);
  });

  it("returns 404 for a non-existent product", async () => {
    const res = await request(app).put(
      `/api/favourites/${nonExistentProductId}`,
    );
    expect(res.status).toBe(404);
    expect(await currentFavouriteIds()).toEqual([]);
  });
});

describe("DELETE /api/favourites/:productId", () => {
  it("removes a favourite and returns the remaining list", async () => {
    await db.insert(favouritesTable).values({ dataProductId: testProductId });
    const res = await request(app).delete(`/api/favourites/${testProductId}`);
    expect(res.status).toBe(200);
    expect(res.body.productIds).not.toContain(testProductId);
    expect(await currentFavouriteIds()).toEqual([]);
  });

  it("succeeds even when the product was not favourited", async () => {
    const res = await request(app).delete(`/api/favourites/${testProductId}`);
    expect(res.status).toBe(200);
    expect(res.body.productIds).toEqual([]);
  });

  it("rejects invalid product ids with 400", async () => {
    const res = await request(app).delete("/api/favourites/not-a-number");
    expect(res.status).toBe(400);
  });

  it("does not remove other favourites", async () => {
    await db.insert(favouritesTable).values({ dataProductId: testProductId });
    const res = await request(app).delete(
      `/api/favourites/${nonExistentProductId}`,
    );
    expect(res.status).toBe(200);
    expect(res.body.productIds).toContain(testProductId);
  });
});

describe("POST /api/favourites/sync", () => {
  it("merges valid ids, skipping non-existent products", async () => {
    const res = await request(app)
      .post("/api/favourites/sync")
      .send({ productIds: [testProductId, nonExistentProductId] });
    expect(res.status).toBe(200);
    expect(res.body.productIds).toContain(testProductId);
    expect(res.body.productIds).not.toContain(nonExistentProductId);
  });

  it("does not drop existing favourites when merging", async () => {
    await db.insert(favouritesTable).values({ dataProductId: testProductId });
    const res = await request(app)
      .post("/api/favourites/sync")
      .send({ productIds: [] });
    expect(res.status).toBe(200);
    expect(res.body.productIds).toContain(testProductId);
  });

  it("deduplicates and ignores invalid ids in the payload", async () => {
    const res = await request(app)
      .post("/api/favourites/sync")
      .send({ productIds: [testProductId, testProductId, -5, 0] });
    expect(res.status).toBe(200);
    expect(
      res.body.productIds.filter((id: number) => id === testProductId),
    ).toHaveLength(1);
  });

  it("rejects a malformed body with 400", async () => {
    const res = await request(app)
      .post("/api/favourites/sync")
      .send({ productIds: "nope" });
    expect(res.status).toBe(400);
  });
});
