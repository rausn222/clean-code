import { eq, isNull, and, lt } from "drizzle-orm";
import { db, productRunsTable } from "@workspace/db";
import app from "./app";
import { logger } from "./lib/logger";

/**
 * Startup reconciliation: simulated runs are finalized by in-process timers,
 * so a restart can leave runs stuck in "running" forever. Mark any stale
 * running runs (started >2 min ago and never finished) as failed.
 */
async function reconcileStaleRuns() {
  const cutoff = new Date(Date.now() - 2 * 60 * 1000);
  const stale = await db
    .update(productRunsTable)
    .set({
      status: "failed",
      message: "Run was interrupted by a server restart and did not complete.",
      endedAt: new Date(),
      errors: 1,
      qualityCheck: "N/A",
    })
    .where(
      and(
        eq(productRunsTable.status, "running"),
        isNull(productRunsTable.endedAt),
        lt(productRunsTable.startedAt, cutoff),
      ),
    )
    .returning({ id: productRunsTable.id });
  if (stale.length > 0) {
    logger.warn({ runIds: stale.map((r) => r.id) }, "Reconciled stale running runs");
  }
}

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  void reconcileStaleRuns().catch((err) =>
    logger.error({ err }, "Failed to reconcile stale runs"),
  );
});
