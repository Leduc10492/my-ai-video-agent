import { notFound } from "next/navigation";

import { EpisodeFrame } from "@/components/episode-frame";
import { loadProject } from "@/lib/workspace";

export default async function AssetsPlaceholder({
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
    <EpisodeFrame projectId={id} episodeId={ep} active="assets">
      <div className="p-6 text-sm leading-6 text-muted-foreground">资产库还没装上角色、场景和道具。锁定原因已经写在左侧阶段上。</div>
    </EpisodeFrame>
  );
}
