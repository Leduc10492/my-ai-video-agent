import { notFound } from "next/navigation";

import { WorkspaceGrid, type TaskPreview } from "@/components/workspace-grid";
import { loadEpisode } from "@/lib/workspace";

export function EpisodeFrame({
  projectId,
  episodeId,
  active,
  tasks = [],
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
  return (
    <WorkspaceGrid steps={episode.rail} active={active} packet={episode.packets[active] ?? episode.packets.script} tasks={tasks}>
      {children}
    </WorkspaceGrid>
  );
}
