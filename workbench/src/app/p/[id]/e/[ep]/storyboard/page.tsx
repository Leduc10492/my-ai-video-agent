import { EpisodeFrame } from "@/components/episode-frame";

export default async function StoryboardPlaceholder({ params }: { params: Promise<{ id: string; ep: string }> }) {
  const { id, ep } = await params;
  return (
    <EpisodeFrame projectId={id} episodeId={ep} active="storyboard">
      <div className="p-6 text-sm leading-6 text-muted-foreground">分镜看板还没装上。左侧会说明这一步是锁定、已过期，还是可以开始。</div>
    </EpisodeFrame>
  );
}
