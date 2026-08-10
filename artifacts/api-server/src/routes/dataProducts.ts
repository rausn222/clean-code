import { Router, type IRouter } from "express";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import {
  db,
  consumersTable,
  dataProductsTable,
  glossaryFieldsTable,
  productRunsTable,
  sampleRowsTable,
  subscriptionPlansTable,
  subscriptionsTable,
  type DataProductRow,
  type ProductRunRow,
  type SubscriptionPlanRow,
  type SubscriptionRow,
} from "@workspace/db";
import {
  CreateDataProductBody,
  ListDataProductsQueryParams,
  UpdateDataProductStatusBody,
} from "@workspace/api-zod";
import { logger } from "../lib/logger";
import { provisionDefaultPlans } from "../lib/defaultSubscriptionPlans";

const router: IRouter = Router();

function serializeRun(
  run: ProductRunRow,
  executionIdById?: Map<number, string | null>,
) {
  return {
    id: run.id,
    dataProductId: run.dataProductId,
    status: run.status,
    message: run.message,
    startedAt: run.startedAt.toISOString(),
    endedAt: run.endedAt ? run.endedAt.toISOString() : null,
    durationSeconds: run.durationSeconds,
    rowsProcessed: run.rowsProcessed,
    executionId: run.executionId,
    cost: run.cost,
    errors: run.errors,
    qualityCheck: run.qualityCheck,
    rerunOfId: run.rerunOfId,
    rerunOfExecutionId:
      run.rerunOfId != null
        ? (executionIdById?.get(run.rerunOfId) ?? null)
        : null,
    rerunTrigger: run.rerunTrigger,
  };
}

function newExecutionId(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const stamp = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
  const hex = () => Math.floor(Math.random() * 0xffff).toString(16).padStart(4, "0");
  return `${stamp}_${hex()}${hex()}-${hex()}-${hex()}-${hex()}-${hex()}${hex()}${hex()}`;
}

/** Finalize a simulated run; on failure, auto-trigger a linked rerun entry. */
async function finalizeSimulatedRun(runId: number, delayMs: number) {
  const shouldFail = Math.random() < 0.25;
  if (shouldFail) {
    await db
      .update(productRunsTable)
      .set({
        status: "failed",
        message:
          "Step 2/9 (source_extract) timed out: connection to source system dropped.",
        endedAt: new Date(),
        durationSeconds: Math.round(delayMs / 1000) + 34,
        rowsProcessed: null,
        errors: 1 + Math.floor(Math.random() * 3),
        qualityCheck: "N/A",
        cost: (0.5 + Math.random() * 1.5).toFixed(3),
      })
      .where(eq(productRunsTable.id, runId));

    // Automatic rerun right after the failure
    const [failedRun] = await db
      .select()
      .from(productRunsTable)
      .where(eq(productRunsTable.id, runId));
    if (!failedRun) return;
    const [autoRerun] = await db
      .insert(productRunsTable)
      .values({
        dataProductId: failedRun.dataProductId,
        status: "running",
        executionId: newExecutionId(),
        rerunOfId: runId,
        rerunTrigger: "auto",
      })
      .returning();
    const rerunDelay = 4000 + Math.floor(Math.random() * 4000);
    setTimeout(() => {
      void completeRunSuccessfully(autoRerun!.id, rerunDelay).catch((err) =>
        logger.error({ err, runId: autoRerun!.id }, "Failed to finalize auto rerun"),
      );
    }, rerunDelay);
    return;
  }
  await completeRunSuccessfully(runId, delayMs);
}

async function completeRunSuccessfully(runId: number, delayMs: number) {
  await db
    .update(productRunsTable)
    .set({
      status: "success",
      message: "Pipeline completed successfully",
      endedAt: new Date(),
      durationSeconds: Math.round(delayMs / 1000) + 178,
      rowsProcessed: 12000 + Math.floor(Math.random() * 60000),
      errors: 0,
      qualityCheck: "Pass",
      cost: (2.5 + Math.random() * 2.5).toFixed(3),
    })
    .where(eq(productRunsTable.id, runId));
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
    productType: p.productType,
    provider: p.provider,
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

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

router.post("/data-products", async (req, res) => {
  const parsed = CreateDataProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const { name, description, domain, owner, urn, project, sourceAlignment, tags, productType, provider } =
    parsed.data;
  // Product creation and default-plan provisioning are atomic: a new data
  // product must never exist without its default subscription plans.
  const { product, planCount } = await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(dataProductsTable)
      .values({
        name,
        description,
        domain,
        owner,
        urn: urn ?? `urn:li:dataProduct:${slugify(domain)}:${slugify(name)}`,
        project: project ?? null,
        sourceAlignment: sourceAlignment ?? null,
        tags: tags ?? [],
        productType: productType ?? "internal",
        // Provider only makes sense for external products
        provider: productType === "external" ? (provider ?? null) : null,
      })
      .returning();
    const plans = await provisionDefaultPlans(tx, created!.id);
    return { product: created!, planCount: plans.length };
  });
  logger.info(
    { dataProductId: product.id, planCount },
    "Provisioned default subscription plans for new data product",
  );

  res.status(201).json(serializeProduct(product, null));
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
  const executionIdById = new Map(runs.map((r) => [r.id, r.executionId]));
  res.json(runs.map((r) => serializeRun(r, executionIdById)));
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
    .values({ dataProductId: id, status: "running", executionId: newExecutionId() })
    .returning();

  // Simulate pipeline completion after a short delay (may fail + auto rerun)
  const runId = run!.id;
  const delayMs = 4000 + Math.floor(Math.random() * 4000);
  setTimeout(() => {
    void finalizeSimulatedRun(runId, delayMs).catch((err) =>
      logger.error({ err, runId }, "Failed to finalize simulated run"),
    );
  }, delayMs);

  res.status(201).json(serializeRun(run!));
});

router.post("/data-products/:id/runs/:runId/rerun", async (req, res) => {
  const id = parseId(req.params["id"] ?? "");
  const runId = parseId(req.params["runId"] ?? "");
  if (!id || !runId) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [original] = await db
    .select()
    .from(productRunsTable)
    .where(
      and(eq(productRunsTable.id, runId), eq(productRunsTable.dataProductId, id)),
    );
  if (!original) {
    res.status(404).json({ error: "Run not found" });
    return;
  }
  if (original.status !== "failed") {
    res.status(409).json({ error: "Only failed runs can be re-executed" });
    return;
  }
  let rerun: ProductRunRow | undefined;
  try {
    // Unique index on rerun_of_id enforces one rerun per original run,
    // even under concurrent requests.
    [rerun] = await db
      .insert(productRunsTable)
      .values({
        dataProductId: id,
        status: "running",
        executionId: newExecutionId(),
        rerunOfId: runId,
        rerunTrigger: "manual",
      })
      .returning();
  } catch (err) {
    const pgCode = (err as { cause?: { code?: string }; code?: string });
    if (pgCode.code === "23505" || pgCode.cause?.code === "23505") {
      res.status(409).json({ error: "This run has already been re-executed" });
      return;
    }
    throw err;
  }
  const delayMs = 4000 + Math.floor(Math.random() * 4000);
  setTimeout(() => {
    void completeRunSuccessfully(rerun!.id, delayMs).catch((err) =>
      logger.error({ err, runId: rerun!.id }, "Failed to finalize manual rerun"),
    );
  }, delayMs);
  res
    .status(201)
    .json(
      serializeRun(rerun!, new Map([[original.id, original.executionId]])),
    );
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

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function serializePlan(
  plan: SubscriptionPlanRow,
  subscription: SubscriptionRow | null,
) {
  return {
    id: plan.id,
    dataProductId: plan.dataProductId,
    name: plan.name,
    channel: plan.channel,
    price: plan.price,
    validityMonths: plan.validityMonths,
    type: plan.type,
    frequency: plan.frequency,
    callLimit: plan.callLimit,
    subscription: subscription
      ? {
          id: subscription.id,
          subscribedAt: subscription.subscribedAt.toISOString(),
          expiresAt: addMonths(
            subscription.subscribedAt,
            plan.validityMonths,
          ).toISOString(),
          autoRenew: subscription.autoRenew,
          selectedColumns: subscription.selectedColumns ?? null,
        }
      : null,
  };
}

async function latestSubscriptionFor(planId: number) {
  const subs = await db
    .select()
    .from(subscriptionsTable)
    .where(eq(subscriptionsTable.planId, planId))
    .orderBy(desc(subscriptionsTable.subscribedAt))
    .limit(1);
  return subs[0] ?? null;
}

router.get("/subscriptions/expiring", async (_req, res) => {
  const rows = await db
    .select({
      subscription: subscriptionsTable,
      plan: subscriptionPlansTable,
      product: dataProductsTable,
    })
    .from(subscriptionsTable)
    .innerJoin(
      subscriptionPlansTable,
      eq(subscriptionsTable.planId, subscriptionPlansTable.id),
    )
    .innerJoin(
      dataProductsTable,
      eq(subscriptionPlansTable.dataProductId, dataProductsTable.id),
    );

  const now = new Date();
  const msPerDay = 24 * 60 * 60 * 1000;
  const expiring = rows
    .map(({ subscription, plan, product }) => {
      const expiresAt = addMonths(subscription.subscribedAt, plan.validityMonths);
      const msLeft = expiresAt.getTime() - now.getTime();
      const daysLeft = Math.max(0, Math.ceil(msLeft / msPerDay));
      return {
        msLeft,
        subscriptionId: subscription.id,
        planId: plan.id,
        planName: plan.name,
        dataProductId: product.id,
        productName: product.name,
        subscribedAt: subscription.subscribedAt.toISOString(),
        expiresAt: expiresAt.toISOString(),
        autoRenew: subscription.autoRenew,
        daysLeft,
      };
    })
    // Not yet expired, and expiring within the next 30 days
    .filter((s) => s.msLeft > 0 && s.daysLeft <= 30)
    .sort((a, b) => a.msLeft - b.msLeft)
    .map(({ msLeft: _msLeft, ...s }) => s);

  res.json(expiring);
});

router.get("/data-products/:id/subscription-plans", async (req, res) => {
  const id = parseId(req.params["id"] ?? "");
  if (!id) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const plans = await db
    .select()
    .from(subscriptionPlansTable)
    .where(eq(subscriptionPlansTable.dataProductId, id))
    .orderBy(subscriptionPlansTable.id);
  const result = [];
  for (const plan of plans) {
    result.push(serializePlan(plan, await latestSubscriptionFor(plan.id)));
  }
  res.json(result);
});

router.post("/subscription-plans/:planId/subscribe", async (req, res) => {
  const planId = parseId(req.params["planId"] ?? "");
  if (!planId) {
    res.status(400).json({ error: "Invalid plan id" });
    return;
  }
  const [plan] = await db
    .select()
    .from(subscriptionPlansTable)
    .where(eq(subscriptionPlansTable.id, planId));
  if (!plan) {
    res.status(404).json({ error: "Subscription plan not found" });
    return;
  }
  const rawColumns = (req.body as { selectedColumns?: unknown } | undefined)
    ?.selectedColumns;
  let selectedColumns: string[] | null = null;
  if (rawColumns !== undefined) {
    if (
      !Array.isArray(rawColumns) ||
      !rawColumns.every((c): c is string => typeof c === "string")
    ) {
      res.status(400).json({ error: "selectedColumns must be an array of strings" });
      return;
    }
    const deduped = [...new Set(rawColumns.map((c) => c.trim()).filter(Boolean))];
    if (deduped.length > 0) {
      // Validate against the product's glossary columns
      const glossary = await db
        .select({ fieldName: glossaryFieldsTable.fieldName })
        .from(glossaryFieldsTable)
        .where(eq(glossaryFieldsTable.dataProductId, plan.dataProductId));
      const valid = new Set(glossary.map((g) => g.fieldName));
      const unknown = deduped.filter((c) => !valid.has(c));
      if (unknown.length > 0) {
        res.status(400).json({
          error: `Unknown columns for this data product: ${unknown.join(", ")}`,
        });
        return;
      }
      selectedColumns = deduped;
    }
  }

  const existing = await latestSubscriptionFor(planId);
  let subscription: SubscriptionRow;
  if (existing) {
    // Renew: restart the term from now; keep prior column selection unless a new one was sent
    const [updated] = await db
      .update(subscriptionsTable)
      .set({
        subscribedAt: new Date(),
        ...(selectedColumns ? { selectedColumns } : {}),
      })
      .where(eq(subscriptionsTable.id, existing.id))
      .returning();
    subscription = updated!;
  } else {
    const [created] = await db
      .insert(subscriptionsTable)
      .values({
        planId,
        autoRenew: plan.type === "Recurring Subscription",
        selectedColumns,
      })
      .returning();
    subscription = created!;
  }
  res.json(serializePlan(plan, subscription));
});

export default router;
