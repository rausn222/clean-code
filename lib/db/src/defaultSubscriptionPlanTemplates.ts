/**
 * Canonical default subscription plan templates.
 *
 * Single source of truth used by both the API server (when provisioning plans
 * for newly created data products) and the one-off backfill script
 * `scripts/src/seed-subscription-plans.ts`.
 */
export const DEFAULT_SUBSCRIPTION_PLAN_TEMPLATES = [
  {
    name: "Standard Access",
    channel: "Data Product",
    price: "Free",
    validityMonths: 12,
    type: "Recurring Subscription",
    frequency: "Daily",
    callLimit: 100000,
  },
  {
    name: "Postgres Direct",
    channel: "Postgres",
    price: "₹10 / month",
    validityMonths: 12,
    type: "One-time Subscription",
    frequency: null,
    callLimit: 10000,
  },
  {
    name: "Postgres Trial",
    channel: "Postgres",
    price: "₹1",
    validityMonths: 1,
    type: "One-time Subscription",
    frequency: null,
    callLimit: 1,
  },
  {
    name: "REST API Basic",
    channel: "REST-API",
    price: "Free",
    validityMonths: 12,
    type: "Recurring Subscription",
    frequency: "Daily",
    callLimit: 100000,
  },
] as const;
