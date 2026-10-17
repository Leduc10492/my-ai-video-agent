import { notFound } from "next/navigation";

import { WorkspaceGrid, type TaskPreview } from "@/components/workspace-grid";
import { jobPreviews } from "@/lib/jobs/store";
import { loadEpisode } from "@/lib/workspace";

export function EpisodeFrame({
  projectId,
  episodeId,
  active,
  tasks,
  children,
}: {
  projectId: string;
  episodeId: string;
  active: string;
  tasks?: TaskPreview[];
  children: React.ReactNode;
}) {
  const episode = loadEpisode(projectId, episodeId);
  if (!episode) notFound();
  const shown = tasks ?? jobPreviews(projectId, episodeId);
  return (
    <WorkspaceGrid steps={episode.rail} active={active} packet={episode.packets[active] ?? episode.packets.script} tasks={shown}>
      {children}
    </WorkspaceGrid>
  );
}
