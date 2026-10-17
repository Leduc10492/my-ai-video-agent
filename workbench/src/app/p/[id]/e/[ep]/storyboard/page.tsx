import { notFound } from "next/navigation";

import { EpisodeFrame } from "@/components/episode-frame";
import { Storyboard } from "@/components/storyboard-view";
import { loadBoard } from "@/lib/production";

export default async function StoryboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; ep: string }>;
  searchParams: Promise<{ view?: string; shot?: string }>;
}) {
  const { id, ep } = await params;
  const query = await searchParams;
  const board = loadBoard(id, ep);
  if (!board) notFound();
  const view = query.view === "table" || query.view === "prompt" ? query.view : "board";
  return (
    <EpisodeFrame projectId={id} episodeId={ep} active={view === "prompt" ? "prompt" : "storyboard"}>
      <Storyboard
        title={board.title}
        example={board.example}
        gateOpen={board.gateOpen}
        stale={board.stale}
        auditDetail={board.auditDetail}
        scenes={board.scenes}
        envelopes={board.envelopes}
        initialView={view}
        initialShot={query.shot ?? null}
      />
    </EpisodeFrame>
  );
}
