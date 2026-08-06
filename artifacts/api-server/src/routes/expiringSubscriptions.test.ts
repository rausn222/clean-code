import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { eq } from "drizzle-orm";
import {
  db,
  dataProductsTable,
  subscriptionPlansTable,
  subscriptionsTable,
  pool,
} from "@workspace/db";
import app from "../app";

/**
 * Expiring-subscriptions endpoint tests.
 *
 * These run against the development database. A dedicated temporary data
 * product with its own plans/subscriptions is created and removed at the end
 * (plans and subscriptions cascade with the product). Assertions only look at
 * the test product's rows, so seeded/real data never affects the results.
 */

const RUN_ID = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

let testProductId: number;
const planIds: Record<string, number> = {};

/** Mirror of the server's expiry computation (subscribedAt + months). */
function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

/**
 * subscribedAt such that addMonths(subscribedAt, validityMonths) === expiresAt.
 * setMonth is not a clean inverse near month ends (e.g. Mar 30 - 1 month →
 * Mar 2), so apply a correction pass against the server's addMonths.
 */
function subscribedAtFor(expiresAt: Date, validityMonths: number): Date {
  let d = new Date(expiresAt);
  d.setMonth(d.getMonth() - validityMonths);
  for (let i = 0; i < 3; i++) {
    const diff = expiresAt.getTime() - addMonths(d, validityMonths).getTime();
    if (diff === 0) break;
    d = new Date(d.getTime() + diff);
  }
  return d;
}

async function createPlanWithSubscription(
  key: string,
  expiresAt: Date,
  autoRenew = false,
) {
  const [plan] = await db
    .insert(subscriptionPlansTable)
    .values({
      dataProductId: testProductId,
      name: `__test_plan_${key}_${RUN_ID}__`,
      channel: "REST-API",
      validityMonths: 1,
      callLimit: 100,
    })
    .returning({ id: subscriptionPlansTable.id });
  planIds[key] = plan!.id;
  await db.insert(subscriptionsTable).values({
    planId: plan!.id,
    subscribedAt: subscribedAtFor(expiresAt, 1),
    autoRenew,
  });
}

beforeAll(async () => {
  const [product] = await db
    .insert(dataProductsTable)
    .values({
      name: "__test_expiring_subs_product__",
      urn: `urn:test:expiring:${RUN_ID}`,
      description: "Temporary product created by expiring-subscriptions tests",
      domain: "Test",
      owner: "vitest",
    })
    .returning({ id: dataProductsTable.id });
  testProductId = product!.id;

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  // Expired 60 days ago — must NOT appear
  await createPlanWithSubscription("expired", new Date(now - 60 * day));
  // Expired one hour ago — must NOT appear
  await createPlanWithSubscription("justExpired", new Date(now - 60 * 60 * 1000));
  // Expires in one hour ("today") — must appear with daysLeft <= 1
  await createPlanWithSubscription("today", new Date(now + 60 * 60 * 1000));
  // Expires in ~15 days — must appear
  await createPlanWithSubscription("in15d", new Date(now + 15 * day), true);
  // Expires just inside the 30-day boundary — must appear
  await createPlanWithSubscription("boundary", new Date(now + 30 * day - 60 * 60 * 1000));
  // Expires in ~45 days — must NOT appear
  await createPlanWithSubscription("in45d", new Date(now + 45 * day));
});

afterAll(async () => {
  // Cascades to the plans and subscriptions created above
  await db
    .delete(dataProductsTable)
    .where(eq(dataProductsTable.id, testProductId));
  await pool.end();
});

describe("GET /api/subscriptions/expiring", () => {
  it("includes only unexpired subscriptions expiring within 30 days", async () => {
    const res = await request(app).get("/api/subscriptions/expiring");
    expect(res.status).toBe(200);

    const mine = (res.body as Array<{ planId: number }>).filter(
      (s) => s.planId && Object.values(planIds).includes(s.planId),
    );
    const includedPlanIds = mine.map((s) => s.planId).sort();
    expect(includedPlanIds).toEqual(
      [planIds["today"], planIds["in15d"], planIds["boundary"]]!.sort(),
    );
  });

  it("never reports already-expired subscriptions", async () => {
    const res = await request(app).get("/api/subscriptions/expiring");
    const returnedIds = (res.body as Array<{ planId: number }>).map(
      (s) => s.planId,
    );
    expect(returnedIds).not.toContain(planIds["expired"]);
    expect(returnedIds).not.toContain(planIds["justExpired"]);
  });

  it("reports correct metadata and non-negative daysLeft, sorted soonest first", async () => {
    const res = await request(app).get("/api/subscriptions/expiring");
    const mine = (
      res.body as Array<{
        planId: number;
        productName: string;
        planName: string;
        autoRenew: boolean;
        daysLeft: number;
        expiresAt: string;
      }>
    ).filter((s) => Object.values(planIds).includes(s.planId));

    for (const s of mine) {
      expect(s.productName).toBe("__test_expiring_subs_product__");
      expect(s.daysLeft).toBeGreaterThanOrEqual(0);
      expect(s.daysLeft).toBeLessThanOrEqual(30);
      expect(new Date(s.expiresAt).getTime()).toBeGreaterThan(Date.now());
    }

    const today = mine.find((s) => s.planId === planIds["today"]);
    expect(today!.daysLeft).toBeLessThanOrEqual(1);
    const in15d = mine.find((s) => s.planId === planIds["in15d"]);
    expect(in15d!.autoRenew).toBe(true);
    expect(in15d!.daysLeft).toBeGreaterThanOrEqual(14);
    expect(in15d!.daysLeft).toBeLessThanOrEqual(16);
    const boundary = mine.find((s) => s.planId === planIds["boundary"]);
    expect(boundary!.daysLeft).toBe(30);

    // Whole response is sorted by daysLeft ascending
    const all = (res.body as Array<{ daysLeft: number }>).map((s) => s.daysLeft);
    expect(all).toEqual([...all].sort((a, b) => a - b));
  });
});
