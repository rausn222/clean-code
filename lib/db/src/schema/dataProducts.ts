import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const dataProductsTable = pgTable("data_products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  urn: text("urn").notNull(),
  description: text("description").notNull(),
  domain: text("domain").notNull(),
  owner: text("owner").notNull(),
  status: text("status").notNull().default("draft"),
  version: text("version").notNull().default("1.0.0"),
  schedule: text("schedule").notNull().default("Daily at 02:00 UTC"),
  productType: text("product_type").notNull().default("internal"), // "internal" | "external"
  provider: text("provider"), // external provider name (null for internal)
  project: text("project"),
  sourceAlignment: text("source_alignment"),
  tags: text("tags").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const glossaryFieldsTable = pgTable("glossary_fields", {
  id: serial("id").primaryKey(),
  dataProductId: integer("data_product_id")
    .notNull()
    .references(() => dataProductsTable.id, { onDelete: "cascade" }),
  fieldName: text("field_name").notNull(),
  mandatory: boolean("mandatory").notNull().default(false),
  dataType: text("data_type").notNull(),
  sourceTable: text("source_table").notNull(),
  sourceColumn: text("source_column").notNull(),
  description: text("description"),
});

export const sampleRowsTable = pgTable("sample_rows", {
  id: serial("id").primaryKey(),
  dataProductId: integer("data_product_id")
    .notNull()
    .references(() => dataProductsTable.id, { onDelete: "cascade" }),
  row: jsonb("row").$type<Record<string, string>>().notNull(),
});

export const productRunsTable = pgTable("product_runs", {
  id: serial("id").primaryKey(),
  dataProductId: integer("data_product_id")
    .notNull()
    .references(() => dataProductsTable.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("running"),
  message: text("message"),
  startedAt: timestamp("started_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  endedAt: timestamp("ended_at", { withTimezone: true }),
  durationSeconds: integer("duration_seconds"),
  rowsProcessed: integer("rows_processed"),
  executionId: text("execution_id"),
  cost: text("cost"),
  errors: integer("errors").notNull().default(0),
  qualityCheck: text("quality_check"),
  // Rerun linkage: set when this run re-executes a failed run
  rerunOfId: integer("rerun_of_id").references(
    (): AnyPgColumn => productRunsTable.id,
    { onDelete: "set null" },
  ),
  rerunTrigger: text("rerun_trigger"), // "auto" | "manual" (null when not a rerun)
}, (table) => [
  // At most one rerun per original run (Postgres unique indexes ignore NULLs)
  uniqueIndex("product_runs_rerun_of_unique").on(table.rerunOfId),
]);

export const consumersTable = pgTable("consumers", {
  id: serial("id").primaryKey(),
  dataProductId: integer("data_product_id")
    .notNull()
    .references(() => dataProductsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type").notNull(),
  channel: text("channel").notNull(),
  lastAccessAt: timestamp("last_access_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const subscriptionPlansTable = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  dataProductId: integer("data_product_id")
    .notNull()
    .references(() => dataProductsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  channel: text("channel").notNull(), // "Data Product" | "Postgres" | "REST-API"
  price: text("price").notNull().default("Free"),
  validityMonths: integer("validity_months").notNull(),
  type: text("type").notNull().default("Recurring Subscription"),
  frequency: text("frequency"),
  callLimit: integer("call_limit").notNull(),
});

export const subscriptionsTable = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  planId: integer("plan_id")
    .notNull()
    .references(() => subscriptionPlansTable.id, { onDelete: "cascade" }),
  subscribedAt: timestamp("subscribed_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  autoRenew: boolean("auto_renew").notNull().default(false),
  // Columns the consumer picked while subscribing (null = all columns)
  selectedColumns: text("selected_columns").array(),
});

export const insertDataProductSchema = createInsertSchema(
  dataProductsTable,
).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertDataProduct = z.infer<typeof insertDataProductSchema>;
export type DataProductRow = typeof dataProductsTable.$inferSelect;
export type GlossaryFieldRow = typeof glossaryFieldsTable.$inferSelect;
export type ProductRunRow = typeof productRunsTable.$inferSelect;
export type ConsumerRow = typeof consumersTable.$inferSelect;
export type SubscriptionPlanRow = typeof subscriptionPlansTable.$inferSelect;
export type SubscriptionRow = typeof subscriptionsTable.$inferSelect;
