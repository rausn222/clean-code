import { integer, pgTable, serial, timestamp, unique, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { dataProductsTable } from "./dataProducts";
import { usersTable } from "./auth";

export const favouritesTable = pgTable(
  "favourites",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    dataProductId: integer("data_product_id")
      .notNull()
      .references(() => dataProductsTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [unique("favourites_user_product_unique").on(t.userId, t.dataProductId)],
);

export const insertFavouriteSchema = createInsertSchema(favouritesTable).omit({
  id: true,
  createdAt: true,
});
export type InsertFavourite = z.infer<typeof insertFavouriteSchema>;
export type FavouriteRow = typeof favouritesTable.$inferSelect;
