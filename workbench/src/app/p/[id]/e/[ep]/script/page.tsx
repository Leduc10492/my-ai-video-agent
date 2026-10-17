import { notFound } from "next/navigation";

import { EpisodeFrame } from "@/components/episode-frame";
import { ScriptAudit } from "@/components/script-audit";
import { loadEpisode } from "@/lib/workspace";

export default async function ScriptPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; ep: string }>;
  searchParams: Promise<{ step?: string }>;
}) {
  const { id, ep } = await params;
  const requested = (await searchParams).step;
  const episode = loadEpisode(id, ep);
  if (!episode) notFound();
  const initialStep = requested === "script" ? "script" : requested === "audit" || !episode.gateOpen ? "audit" : "script";
  return (
    <EpisodeFrame projectId={id} episodeId={ep} active={initialStep}>
      <ScriptAudit
        title={`第 ${episode.episodeNumber} 集 · ${episode.episodeTitle}`}
        example={episode.example}
        gateOpen={episode.gateOpen}
        stale={episode.stale}
        scriptHash={episode.scriptHash}
        baselineHash={episode.baselineHash}
        auditDetail={episode.auditDetail}
        scripts={episode.scripts}
        currentVersion={episode.currentVersion}
        auditVersion={episode.auditVersion}
        findings={episode.findings}
        initialStep={initialStep === "audit" ? "audit" : "script"}
      />
    </EpisodeFrame>
  );
}
