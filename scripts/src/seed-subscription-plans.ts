/**
 * One-off seed: create subscription plans for data products that have none.
 * Run: pnpm --filter @workspace/scripts exec tsx src/seed-subscription-plans.ts
 */
import {
  db,
  dataProductsTable,
  subscriptionPlansTable,
  subscriptionsTable,
  DEFAULT_SUBSCRIPTION_PLAN_TEMPLATES,
} from "@workspace/db";
import { eq } from "drizzle-orm";

const PLAN_TEMPLATES = DEFAULT_SUBSCRIPTION_PLAN_TEMPLATES;

async function main() {
  const products = await db.select().from(dataProductsTable);
  let seededProducts = 0;
  for (const product of products) {
    const existing = await db
      .select()
      .from(subscriptionPlansTable)
      .where(eq(subscriptionPlansTable.dataProductId, product.id));
    if (existing.length > 0) continue;
    const inserted = await db
      .insert(subscriptionPlansTable)
      .values(PLAN_TEMPLATES.map((t) => ({ ...t, dataProductId: product.id })))
      .returning();
    // Give the first product an active subscription (subscribed 9.5 months ago,
    // so it is close to expiry) to demonstrate days-remaining/expiring states.
    if (seededProducts === 0 && inserted[0]) {
      const subscribedAt = new Date();
      subscribedAt.setDate(subscribedAt.getDate() - 289);
      await db.insert(subscriptionsTable).values({
        planId: inserted[0].id,
        subscribedAt,
        autoRenew: true,
      });
    }
    seededProducts++;
    console.log(`Seeded ${inserted.length} plans for product #${product.id} (${product.name})`);
  }
  console.log(`Done. Seeded plans for ${seededProducts} product(s).`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
