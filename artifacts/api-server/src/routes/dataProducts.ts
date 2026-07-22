import { Router, type IRouter } from "express";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import {
  db,
  consumersTable,
  dataProductsTable,
  glossaryFieldsTable,
  productRunsTable,
  sampleRowsTable,
  type DataProductRow,
  type ProductRunRow,
} from "@workspace/db";
import {
  ListDataProductsQueryParams,
  UpdateDataProductStatusBody,
} from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router: IRouter = Router();

function serializeRun(run: ProductRunRow) {
  return {
    id: run.id,
    dataProductId: run.dataProductId,
    status: run.status,
    message: run.message,
    startedAt: run.startedAt.toISOString(),
    endedAt: run.endedAt ? run.endedAt.toISOString() : null,
    durationSeconds: run.durationSeconds,
    rowsProcessed: run.rowsProcessed,
  };
}

async function latestRunFor(productId: number) {
  const runs = await db
    .select()
    .from(productRunsTable)
    .where(eq(productRunsTable.dataProductId, productId))
    .orderBy(desc(productRunsTable.startedAt))
    .limit(1);
  return runs[0] ?? null;
}

function serializeProduct(p: DataProductRow, latestRun: ProductRunRow | null) {
  return {
    id: p.id,
    name: p.name,
    urn: p.urn,
    description: p.description,
    domain: p.domain,
    owner: p.owner,
    status: p.status,
    version: p.version,
    schedule: p.schedule,
    project: p.project,
    sourceAlignment: p.sourceAlignment,
    tags: p.tags,
    latestRun: latestRun ? serializeRun(latestRun) : null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

router.get("/catalog/summary", async (_req, res) => {
  const products = await db.select().from(dataProductsTable);
  const domainCounts = new Map<string, number>();
  for (const p of products) {
    domainCounts.set(p.domain, (domainCounts.get(p.domain) ?? 0) + 1);
  }
  let healthyCount = 0;
  let failedCount = 0;
  for (const p of products) {
    const run = await latestRunFor(p.id);
    if (run?.status === "success") healthyCount++;
    if (run?.status === "failed") failedCount++;
  }
  res.json({
    totalProducts: products.length,
    publishedCount: products.filter((p) => p.status === "published").length,
    draftCount: products.filter((p) => p.status === "draft").length,
    healthyCount,
    failedCount,
    domains: [...domainCounts.entries()].map(([domain, count]) => ({
      domain,
      count,
    })),
  });
});

router.get("/data-products", async (req, res) => {
  const parsed = ListDataProductsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query parameters" });
    return;
  }
  const { search, domain, status } = parsed.data;
  const conditions = [];
  if (search) {
    conditions.push(
      or(
        ilike(dataProductsTable.name, `%${search}%`),
        ilike(dataProductsTable.description, `%${search}%`),
      ),
    );
  }
  if (domain) conditions.push(eq(dataProductsTable.domain, domain));
  if (status) conditions.push(eq(dataProductsTable.status, status));

  const products = await db
    .select()
    .from(dataProductsTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(dataProductsTable.updatedAt));

  const result = [];
  for (const p of products) {
    result.push(serializeProduct(p, await latestRunFor(p.id)));
  }
  res.json(result);
});

router.get("/data-products/:id", async (req, res) => {
  const id = parseId(req.params["id"] ?? "");
  if (!id) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [product] = await db
    .select()
    .from(dataProductsTable)
    .where(eq(dataProductsTable.id, id));
  if (!product) {
    res.status(404).json({ error: "Data product not found" });
    return;
  }
  res.json(serializeProduct(product, await latestRunFor(id)));
});

router.patch("/data-products/:id/status", async (req, res) => {
  const id = parseId(req.params["id"] ?? "");
  if (!id) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const parsed = UpdateDataProductStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const [updated] = await db
    .update(dataProductsTable)
    .set({ status: parsed.data.status })
    .where(eq(dataProductsTable.id, id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Data product not found" });
    return;
  }
  res.json(serializeProduct(updated, await latestRunFor(id)));
});

router.get("/data-products/:id/glossary", async (req, res) => {
  const id = parseId(req.params["id"] ?? "");
  if (!id) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const fields = await db
    .select()
    .from(glossaryFieldsTable)
    .where(eq(glossaryFieldsTable.dataProductId, id))
    .orderBy(glossaryFieldsTable.id);
  res.json(
    fields.map((f) => ({
      id: f.id,
      fieldName: f.fieldName,
      mandatory: f.mandatory,
      dataType: f.dataType,
      sourceTable: f.sourceTable,
      sourceColumn: f.sourceColumn,
      description: f.description,
    })),
  );
});

router.get("/data-products/:id/sample-data", async (req, res) => {
  const id = parseId(req.params["id"] ?? "");
  if (!id) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const rows = await db
    .select()
    .from(sampleRowsTable)
    .where(eq(sampleRowsTable.dataProductId, id))
    .orderBy(sampleRowsTable.id);
  const glossary = await db
    .select()
    .from(glossaryFieldsTable)
    .where(eq(glossaryFieldsTable.dataProductId, id))
    .orderBy(glossaryFieldsTable.id);
  const keys = rows.length > 0 ? Object.keys(rows[0]!.row) : [];
  const ordered = glossary
    .map((g) => g.fieldName)
    .filter((name) => keys.includes(name));
  const columns = [...ordered, ...keys.filter((k) => !ordered.includes(k))];
  res.json({ columns, rows: rows.map((r) => r.row) });
});

router.get("/data-products/:id/runs", async (req, res) => {
  const id = parseId(req.params["id"] ?? "");
  if (!id) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const runs = await db
    .select()
    .from(productRunsTable)
    .where(eq(productRunsTable.dataProductId, id))
    .orderBy(desc(productRunsTable.startedAt));
  res.json(runs.map(serializeRun));
});

router.post("/data-products/:id/runs", async (req, res) => {
  const id = parseId(req.params["id"] ?? "");
  if (!id) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [product] = await db
    .select()
    .from(dataProductsTable)
    .where(eq(dataProductsTable.id, id));
  if (!product) {
    res.status(404).json({ error: "Data product not found" });
    return;
  }
  const [run] = await db
    .insert(productRunsTable)
    .values({ dataProductId: id, status: "running" })
    .returning();

  // Simulate pipeline completion after a short delay
  const runId = run!.id;
  const delayMs = 4000 + Math.floor(Math.random() * 4000);
  setTimeout(() => {
    void (async () => {
      try {
        const durationSeconds = Math.round(delayMs / 1000) + 178;
        await db
          .update(productRunsTable)
          .set({
            status: "success",
            message: "Pipeline completed successfully",
            endedAt: new Date(),
            durationSeconds,
            rowsProcessed: 12000 + Math.floor(Math.random() * 60000),
          })
          .where(eq(productRunsTable.id, runId));
      } catch (err) {
        logger.error({ err, runId }, "Failed to finalize simulated run");
      }
    })();
  }, delayMs);

  res.status(201).json(serializeRun(run!));
});

router.get("/data-products/:id/consumers", async (req, res) => {
  const id = parseId(req.params["id"] ?? "");
  if (!id) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const consumers = await db
    .select()
    .from(consumersTable)
    .where(eq(consumersTable.dataProductId, id))
    .orderBy(desc(consumersTable.lastAccessAt));
  res.json(
    consumers.map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type,
      channel: c.channel,
      lastAccessAt: c.lastAccessAt.toISOString(),
    })),
  );
});

export default router;
