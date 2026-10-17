import { createGenerationJob, approveJob, rejectJob } from "@/lib/jobs/store";
import { tickQueue } from "@/lib/jobs/queue";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    action?: string;
    jobId?: string;
    confirmedOverCap?: boolean;
    projectId?: string;
    episodeId?: string;
    title?: string;
    estCost?: number;
  } | null;
  if (!body?.action) return Response.json({ error: "缺少动作。" }, { status: 400 });

  if (body.action === "tick") {
    return Response.json(tickQueue());
  }
  if (body.action === "approve" && body.jobId) {
    const result = approveJob(body.jobId, Boolean(body.confirmedOverCap));
    if ("error" in result) return Response.json(result, { status: result.status });
    return Response.json(result);
  }
  if (body.action === "reject" && body.jobId) {
    const result = rejectJob(body.jobId);
    if ("error" in result) return Response.json(result, { status: result.status });
    return Response.json(result);
  }
  if (body.action === "create") {
    const title = body.title?.trim() ?? "";
    const estCost = Number(body.estCost);
    if (!body.projectId || !body.episodeId || !title || !Number.isFinite(estCost) || estCost < 0) {
      return Response.json({ error: "项目、集、标题和估价都要有。" }, { status: 400 });
    }
    const id = createGenerationJob({
      projectId: body.projectId,
      episodeId: body.episodeId,
      title,
      estCost,
    });
    return Response.json({ id });
  }
  return Response.json({ error: "不认识这个动作。" }, { status: 400 });
}
