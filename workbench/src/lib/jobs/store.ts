import { desc, eq } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { approvals, costLedger, fileIndex, jobLogs, jobs, media } from "@/lib/db/schema";
import { JOB_STATUS_LABEL, needsSecondConfirm } from "@/lib/jobs/policy";

export type JobRow = typeof jobs.$inferSelect;

export function logJob(jobId: string, message: string) {
  getDb().insert(jobLogs).values({ jobId, message, createdAt: Date.now() }).run();
}

export function listJobs() {
  return getDb().select().from(jobs).orderBy(desc(jobs.createdAt)).all();
}

export function listLogs(jobId: string) {
  return getDb().select().from(jobLogs).where(eq(jobLogs.jobId, jobId)).orderBy(desc(jobLogs.id)).all();
}

export function costTotals(projectId: string) {
  const rows = getDb().select().from(jobs).where(eq(jobs.projectId, projectId)).all();
  return {
    estimate: rows.reduce((sum, row) => sum + row.estCost, 0),
    actual: rows.reduce((sum, row) => sum + row.actualCost, 0),
  };
}

export function jobPreviews(projectId: string, episodeId: string) {
  return listJobs()
    .filter((job) => job.projectId === projectId && job.episodeId === episodeId)
    .slice(0, 6)
    .map((job) => ({
      id: job.id,
      title: job.title,
      status: JOB_STATUS_LABEL[job.status] ?? job.status,
      estimate: `${job.estCost.toFixed(2)} 美元`,
    }));
}

export function createGenerationJob(input: { projectId: string; episodeId: string; title: string; estCost: number }) {
  const id = `job-${Date.now().toString(36)}`;
  const now = Date.now();
  const db = getDb();
  db.insert(jobs)
    .values({
      id,
      projectId: input.projectId,
      episodeId: input.episodeId,
      type: "generate",
      status: "awaiting_approval",
      title: input.title,
      estCost: input.estCost,
      actualCost: 0,
      retries: 0,
      maxRetries: 2,
      error: null,
      result: null,
      createdAt: now,
    })
    .run();
  db.insert(approvals)
    .values({
      id: `ap-${id}`,
      jobId: id,
      estimate: input.estCost,
      decision: "pending",
      note: "新建的生成申请。还没批准，也没扣费。",
      createdAt: now,
    })
    .run();
  logJob(id, "已提交生成申请。先看估价。");
  return id;
}

export function approveJob(id: string, confirmedOverCap: boolean) {
  const db = getDb();
  const job = db.select().from(jobs).where(eq(jobs.id, id)).get();
  if (!job) return { error: "找不到任务。", status: 404 as const };
  if (job.status !== "awaiting_approval") return { error: "这个任务不在待批准。", status: 400 as const };
  if (job.type === "generate" && needsSecondConfirm(job.estCost) && !confirmedOverCap) {
    return { error: "估价超过 10 美元，需要再确认一次。仍然不会扣费。", status: 409 as const };
  }
  db.update(jobs)
    .set({ status: "succeeded", actualCost: 0, result: "已记录批准。未调用付费接口，实际花费 0。" })
    .where(eq(jobs.id, id))
    .run();
  db.update(approvals)
    .set({ decision: "approved", note: "人已批准。工作台没有花钱。" })
    .where(eq(approvals.jobId, id))
    .run();
  db.insert(costLedger)
    .values({ jobId: id, estimate: job.estCost, actual: 0, note: "批准只记账，不扣费。", createdAt: Date.now() })
    .run();
  logJob(id, "已批准。实际花费 0。没有请求 Higgsfield 或其他付费接口。");
  return { ok: true as const };
}

export function rejectJob(id: string) {
  const db = getDb();
  const job = db.select().from(jobs).where(eq(jobs.id, id)).get();
  if (!job) return { error: "找不到任务。", status: 404 as const };
  if (job.status !== "awaiting_approval") return { error: "这个任务不在待批准。", status: 400 as const };
  db.update(jobs).set({ status: "cancelled", actualCost: 0, result: "已拒绝。没有扣费。" }).where(eq(jobs.id, id)).run();
  db.update(approvals).set({ decision: "rejected", note: "人拒绝了这次生成。" }).where(eq(approvals.jobId, id)).run();
  logJob(id, "已拒绝。实际花费 0。");
  return { ok: true as const };
}

export function indexStats() {
  const db = getDb();
  return {
    files: db.select().from(fileIndex).all().length,
    media: db.select().from(media).all().length,
  };
}

export function ledgerFor(jobId: string) {
  return getDb().select().from(costLedger).where(eq(costLedger.jobId, jobId)).all();
}
