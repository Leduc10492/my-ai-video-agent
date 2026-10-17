import { RunsTable, type JobView } from "@/components/runs-table";
import { JOB_STATUS_LABEL } from "@/lib/jobs/policy";
import { indexStats, listJobs } from "@/lib/jobs/store";
import { tickQueue } from "@/lib/jobs/queue";

export default function RunsPage() {
  tickQueue();
  const stats = indexStats();
  const jobs: JobView[] = listJobs().map((job) => ({
    id: job.id,
    title: job.title,
    status: job.status,
    statusLabel: JOB_STATUS_LABEL[job.status] ?? job.status,
    estCost: job.estCost,
    actualCost: job.actualCost,
    projectId: job.projectId,
    episodeId: job.episodeId,
    result: job.result,
  }));
  return <RunsTable jobs={jobs} files={stats.files} media={stats.media} />;
}
