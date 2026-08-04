/**
 * Backfill rerun links across ALL products: the platform automatically
 * re-executes a data product when a run fails, so every historical failed
 * run should be linked to the next run that followed it as an "auto" rerun.
 *
 * Idempotent: skips failed runs that already have a rerun linked, and never
 * links a run that is already a rerun of something else.
 */
import { asc } from "drizzle-orm";
import { db, productRunsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

async function main() {
  const runs = await db
    .select()
    .from(productRunsTable)
    .orderBy(asc(productRunsTable.dataProductId), asc(productRunsTable.startedAt));

  const byProduct = new Map<number, typeof runs>();
  for (const r of runs) {
    const list = byProduct.get(r.dataProductId) ?? [];
    list.push(r);
    byProduct.set(r.dataProductId, list);
  }

  let linked = 0;
  for (const [productId, list] of byProduct) {
    const alreadyRerunOf = new Set(
      list.filter((r) => r.rerunOfId != null).map((r) => r.rerunOfId),
    );
    for (let i = 0; i < list.length; i++) {
      const run = list[i]!;
      if (run.status !== "failed") continue;
      if (alreadyRerunOf.has(run.id)) continue; // already has a rerun
      // find the next chronological run that isn't itself a rerun
      const next = list
        .slice(i + 1)
        .find(
          (r) =>
            r.rerunOfId == null &&
            r.startedAt != null &&
            run.startedAt != null &&
            r.startedAt > run.startedAt,
        );
      if (!next) continue;
      await db
        .update(productRunsTable)
        .set({ rerunOfId: run.id, rerunTrigger: "auto" })
        .where(eq(productRunsTable.id, next.id));
      alreadyRerunOf.add(run.id);
      // mark next as a rerun locally so it can't be reused as a link target
      next.rerunOfId = run.id;
      linked++;
      console.log(
        `product ${productId}: linked run ${next.id} as auto rerun of failed run ${run.id}`,
      );
    }
  }
  console.log(`Done. Linked ${linked} auto rerun(s).`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
