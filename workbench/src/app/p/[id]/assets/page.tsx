import { notFound } from "next/navigation";

import { AssetLibrary } from "@/components/asset-library";
import { EpisodeFrame } from "@/components/episode-frame";
import { loadLibrary } from "@/lib/production";
import { loadEpisode, loadProject } from "@/lib/workspace";

export default async function AssetsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ep?: string; source?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const project = loadProject(id);
  const library = loadLibrary(id);
  if (!project || !library) notFound();
  const episodeId = query.ep ?? project.episodes[0]?.id;
  if (!episodeId) notFound();
  const episode = loadEpisode(id, episodeId);
  if (!episode) notFound();
  return (
    <EpisodeFrame projectId={id} episodeId={episodeId} active="assets">
      <AssetLibrary
        projectId={id}
        example={library.example}
        source={project.example ? "example" : "repo"}
        gateOpen={episode.gateOpen}
        stale={episode.stale}
        characters={library.characters}
        scenes={library.scenes}
        props={library.props}
      />
    </EpisodeFrame>
  );
}
