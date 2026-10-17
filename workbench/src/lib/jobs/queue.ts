/**
 * Adapted from LingyiChen-AI/AIComicBuilder (Apache-2.0)
 * src/lib/task-queue/queue.ts — atomic UPDATE … WHERE (SELECT … LIMIT 1).
 * Generation jobs are not claimed here. Approval happens in the request that the person confirms.
 * Nothing in this queue calls a paid API.
 */
import { eq, sql } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { jobs } from "@/lib/db/schema";
import { codexExecEnabled } from "@/lib/jobs/codex-runner";
import { logJob } from "@/lib/jobs/store";

export function claimQueuedJob() {
  const db = getDb();
  const claimed = db
    .update(jobs)
    .set({ status: "running" })
    .where(eq(jobs.id, sql`(SELECT id FROM jobs WHERE status = 'queued' ORDER BY created_at ASC LIMIT 1)`))
    .returning()
    .all();
  return claimed[0] ?? null;
}

export function tickQueue() {
  const claimed = claimQueuedJob();
  if (!claimed) return { claimed: null as string | null };
  const db = getDb();
  if (claimed.type === "generate") {
    db.update(jobs)
      .set({
        status: "failed",
        error: "生成不能跳过批准，也不能由队列直接调用付费接口。",
        actualCost: 0,
      })
      .where(eq(jobs.id, claimed.id))
      .run();
    logJob(claimed.id, "拒绝执行：没有批准，且工作台不扣费。");
    return { claimed: claimed.id };
  }
  const reason = codexExecEnabled()
    ? "模式 B 的开关开着，这一版仍然不拉起 codex exec。"
    : "模式 B 默认关闭。任务只保留提示词，没有执行。";
  db.update(jobs)
    .set({ status: "succeeded", result: reason, actualCost: 0 })
    .where(eq(jobs.id, claimed.id))
    .run();
  logJob(claimed.id, reason);
  return { claimed: claimed.id };
}
