/**
 * Seed run-history entries with execution ids, costs, and rerun pairs
 * (one failed run + auto rerun, one failed run + manual rerun per product).
 * Run: pnpm --filter @workspace/scripts exec tsx src/seed-run-history.ts
 */
import { db, dataProductsTable, productRunsTable } from "@workspace/db";
import { eq, isNotNull } from "drizzle-orm";

function executionIdAt(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const stamp = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
  const hex = () => Math.floor(Math.random() * 0xffff).toString(16).padStart(4, "0");
  return `${stamp}_${hex()}${hex()}-${hex()}-${hex()}-${hex()}-${hex()}${hex()}${hex()}`;
}

function daysAgo(n: number, hour: number, minute: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, minute, 0, 0);
  return d;
}

async function main() {
  // Backfill execution metadata on existing runs missing it
  const existing = await db.select().from(productRunsTable);
  for (const run of existing) {
    if (!run.executionId) {
      await db
        .update(productRunsTable)
        .set({
          executionId: executionIdAt(run.startedAt),
          cost: run.status === "failed" ? (0.5 + Math.random() * 1.5).toFixed(3) : (2.5 + Math.random() * 2.5).toFixed(3),
          errors: run.status === "failed" ? 1 + Math.floor(Math.random() * 3) : 0,
          qualityCheck: run.status === "failed" ? "N/A" : run.status === "success" ? "Pass" : null,
        })
        .where(eq(productRunsTable.id, run.id));
    }
  }
  console.log(`Backfilled execution metadata on ${existing.length} runs`);

  const products = await db.select().from(dataProductsTable).limit(3);
  const alreadySeeded = await db
    .select({ id: productRunsTable.id })
    .from(productRunsTable)
    .where(isNotNull(productRunsTable.rerunOfId));
  if (alreadySeeded.length > 0) {
    console.log("Rerun pairs already exist, skipping pair seeding");
    return;
  }

  for (const product of products) {
    // ---- auto rerun pair (2 days ago) ----
    const failStart = daysAgo(2, 8, 45);
    const [failedAuto] = await db
      .insert(productRunsTable)
      .values({
        dataProductId: product.id,
        status: "failed",
        message: "Step 2/9 (source_extract) timed out after 240s: connection to source system dropped.",
        startedAt: failStart,
        endedAt: new Date(failStart.getTime() + 4 * 60000),
        durationSeconds: 240,
        executionId: executionIdAt(failStart),
        cost: "0.870",
        errors: 1,
        qualityCheck: "N/A",
      })
      .returning();
    const autoStart = new Date(failStart.getTime() + 27 * 60000);
    await db.insert(productRunsTable).values({
      dataProductId: product.id,
      status: "success",
      message: "Pipeline completed successfully",
      startedAt: autoStart,
      endedAt: new Date(autoStart.getTime() + 17 * 60000),
      durationSeconds: 1020,
      rowsProcessed: 41200 + Math.floor(Math.random() * 9000),
      executionId: executionIdAt(autoStart),
      cost: "3.842",
      errors: 0,
      qualityCheck: "Pass",
      rerunOfId: failedAuto!.id,
      rerunTrigger: "auto",
    });

    // ---- manual rerun pair (3 days ago) ----
    const failStart2 = daysAgo(3, 8, 45);
    const [failedManual] = await db
      .insert(productRunsTable)
      .values({
        dataProductId: product.id,
        status: "failed",
        message: "Step 4/9 (dq_validation) exited with code 1: 3 rows violated rule NOT_NULL(engine_serial_no).",
        startedAt: failStart2,
        endedAt: new Date(failStart2.getTime() + 7 * 60000),
        durationSeconds: 420,
        executionId: executionIdAt(failStart2),
        cost: "1.920",
        errors: 3,
        qualityCheck: "Fail",
      })
      .returning();
    const manualStart = new Date(failStart2.getTime() + 3 * 3600000);
    await db.insert(productRunsTable).values({
      dataProductId: product.id,
      status: "success",
      message: "Pipeline completed successfully",
      startedAt: manualStart,
      endedAt: new Date(manualStart.getTime() + 17 * 60000),
      durationSeconds: 1020,
      rowsProcessed: 38900 + Math.floor(Math.random() * 9000),
      executionId: executionIdAt(manualStart),
      cost: "4.310",
      errors: 0,
      qualityCheck: "Pass",
      rerunOfId: failedManual!.id,
      rerunTrigger: "manual",
    });

    console.log(`Seeded rerun pairs for product ${product.id} (${product.name})`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
