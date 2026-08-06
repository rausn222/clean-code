import {
  db,
  subscriptionPlansTable,
  DEFAULT_SUBSCRIPTION_PLAN_TEMPLATES,
} from "@workspace/db";

export { DEFAULT_SUBSCRIPTION_PLAN_TEMPLATES };

type Db = typeof db;
type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];

/**
 * Insert the default subscription plans for a data product.
 * Accepts a transaction so provisioning is atomic with product creation.
 */
export async function provisionDefaultPlans(
  executor: Db | Tx,
  dataProductId: number,
) {
  return executor
    .insert(subscriptionPlansTable)
    .values(
      DEFAULT_SUBSCRIPTION_PLAN_TEMPLATES.map((t) => ({ ...t, dataProductId })),
    )
    .returning();
}
