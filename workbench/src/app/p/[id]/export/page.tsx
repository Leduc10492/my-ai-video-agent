import { notFound } from "next/navigation";

import { EpisodeFrame } from "@/components/episode-frame";
import { loadProject } from "@/lib/workspace";

export default async function ExportPlaceholder({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ep?: string }>;
}) {
  const { id } = await params;
  const project = loadProject(id);
  if (!project) notFound();
  const ep = (await searchParams).ep ?? project.episodes[0]?.id;
  if (!ep) notFound();
  return (
    <EpisodeFrame projectId={id} episodeId={ep} active="qa">
      <div className="p-6 text-sm leading-6 text-muted-foreground">导出交接单还没接上。QA 报告仍然以文件为准。</div>
    </EpisodeFrame>
  );
}
