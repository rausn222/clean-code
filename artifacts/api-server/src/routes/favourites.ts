import { Router, type IRouter } from "express";
import { eq, inArray } from "drizzle-orm";
import { db, dataProductsTable, favouritesTable } from "@workspace/db";
import { SyncFavouritesBody } from "@workspace/api-zod";

const router: IRouter = Router();

async function listFavouriteIds(): Promise<number[]> {
  const rows = await db
    .select({ dataProductId: favouritesTable.dataProductId })
    .from(favouritesTable)
    .orderBy(favouritesTable.id);
  return rows.map((r) => r.dataProductId);
}

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

router.get("/favourites", async (_req, res) => {
  res.json({ productIds: await listFavouriteIds() });
});

router.put("/favourites/:productId", async (req, res) => {
  const id = parseId(req.params["productId"] ?? "");
  if (!id) {
    res.status(400).json({ error: "Invalid product id" });
    return;
  }
  const [product] = await db
    .select({ id: dataProductsTable.id })
    .from(dataProductsTable)
    .where(eq(dataProductsTable.id, id));
  if (!product) {
    res.status(404).json({ error: "Data product not found" });
    return;
  }
  await db
    .insert(favouritesTable)
    .values({ dataProductId: id })
    .onConflictDoNothing();
  res.json({ productIds: await listFavouriteIds() });
});

router.delete("/favourites/:productId", async (req, res) => {
  const id = parseId(req.params["productId"] ?? "");
  if (!id) {
    res.status(400).json({ error: "Invalid product id" });
    return;
  }
  await db.delete(favouritesTable).where(eq(favouritesTable.dataProductId, id));
  res.json({ productIds: await listFavouriteIds() });
});

router.post("/favourites/sync", async (req, res) => {
  const parsed = SyncFavouritesBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const requested = [...new Set(parsed.data.productIds)].filter(
    (id) => Number.isInteger(id) && id > 0,
  );
  if (requested.length > 0) {
    // Only merge ids that reference existing products
    const existing = await db
      .select({ id: dataProductsTable.id })
      .from(dataProductsTable)
      .where(inArray(dataProductsTable.id, requested));
    if (existing.length > 0) {
      await db
        .insert(favouritesTable)
        .values(existing.map((p) => ({ dataProductId: p.id })))
        .onConflictDoNothing();
    }
  }
  res.json({ productIds: await listFavouriteIds() });
});

export default router;
