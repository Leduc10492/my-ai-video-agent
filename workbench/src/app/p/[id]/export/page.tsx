import { notFound } from "next/navigation";

import { EpisodeFrame } from "@/components/episode-frame";
import { ExportForm } from "@/components/export-form";
import { loadProject } from "@/lib/workspace";

export default async function ExportPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ep?: string }>;
}) {
  const { id } = await params;
  const project = loadProject(id);
  if (!project) notFound();
  const episodeId = (await searchParams).ep ?? project.episodes[0]?.id;
  if (!episodeId) notFound();
  return (
    <EpisodeFrame projectId={id} episodeId={episodeId} active="qa">
      <ExportForm projectId={id} episodeId={episodeId} example={project.example} />
    </EpisodeFrame>
  );
}
