import { afterAll, describe, expect, it } from "vitest";
import request from "supertest";
import { eq } from "drizzle-orm";
import {
  db,
  dataProductsTable,
  subscriptionPlansTable,
  pool,
} from "@workspace/db";
import app from "../app";
import { DEFAULT_SUBSCRIPTION_PLAN_TEMPLATES as DEFAULT_PLAN_TEMPLATES } from "@workspace/db";

/**
 * Data product creation tests.
 *
 * These run against the development database. Created products are removed at
 * the end (subscription plans cascade with them).
 */

const RUN_ID = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
const createdProductIds: number[] = [];

afterAll(async () => {
  for (const id of createdProductIds) {
    await db.delete(dataProductsTable).where(eq(dataProductsTable.id, id));
  }
  await pool.end();
});

describe("POST /api/data-products", () => {
  it("creates a product and provisions the default subscription plans", async () => {
    const res = await request(app).post("/api/data-products").send({
      name: `Vitest Product ${RUN_ID}`,
      description: "Temporary product created by automated tests",
      domain: "engineering",
      owner: "vitest",
    });
    expect(res.status).toBe(201);
    createdProductIds.push(res.body.id);

    expect(res.body.name).toBe(`Vitest Product ${RUN_ID}`);
    expect(res.body.status).toBe("draft");
    expect(res.body.urn).toContain("urn:li:dataProduct:engineering:");

    const plans = await db
      .select()
      .from(subscriptionPlansTable)
      .where(eq(subscriptionPlansTable.dataProductId, res.body.id));
    expect(plans).toHaveLength(DEFAULT_PLAN_TEMPLATES.length);
    // Every template field must match the canonical templates exactly
    const stripped = plans
      .map(({ id: _id, dataProductId: _pid, ...rest }) => rest)
      .sort((a, b) => a.name.localeCompare(b.name));
    const expected = DEFAULT_PLAN_TEMPLATES.map((t) => ({ ...t }))
      .sort((a, b) => a.name.localeCompare(b.name));
    expect(stripped).toEqual(expected);

    // The subscription-plans endpoint shows them too (no empty tab)
    const planRes = await request(app).get(
      `/api/data-products/${res.body.id}/subscription-plans`,
    );
    expect(planRes.status).toBe(200);
    expect(planRes.body).toHaveLength(DEFAULT_PLAN_TEMPLATES.length);
    expect(planRes.body.every((p: { subscription: unknown }) => p.subscription === null)).toBe(
      true,
    );
  });

  it("rejects an invalid body", async () => {
    const res = await request(app)
      .post("/api/data-products")
      .send({ name: "", description: "x" });
    expect(res.status).toBe(400);
  });
});
