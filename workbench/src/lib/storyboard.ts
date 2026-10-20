export type Shot = {
  id: string;
  scene: string;
  title?: string;
  description?: string;
  camera?: string;
  sound?: string;
  references?: string[];
  [key: string]: unknown;
};
export type Envelope = {
  id: string;
  scene: string;
  asset_name: string;
  duration_seconds: number;
  source_rows: string[];
  prompt: string;
  markers?: { id: string; title: string; time: number }[];
  [key: string]: unknown;
};
export type Board = {
  envelopes: Envelope[];
  shots?: Shot[];
  sha256?: string;
  path?: string;
  [key: string]: unknown;
};
export type ShotSelection = {
  scene: string;
  rowId: string;
  envelopeId: string;
  clipId?: string;
  takeId?: string;
};
export type BoardRow = {
  key: string;
  shot: Shot;
  envelope: Envelope;
  selection: ShotSelection;
};
export const shotKey = (scene: string, rowId: string) =>
  JSON.stringify([scene, rowId]);
export function boardRows(board?: Board | null): BoardRow[] {
  return (board?.envelopes || []).flatMap((envelope) =>
    envelope.source_rows.map((rowId) => ({
      key: shotKey(envelope.scene, rowId),
      shot: board?.shots?.find(
        (s) => s.scene === envelope.scene && s.id === rowId,
      ) || { id: rowId, scene: envelope.scene },
      envelope,
      selection: { scene: envelope.scene, rowId, envelopeId: envelope.id },
    })),
  );
}
export function boardContent(board: Board): Board {
  const { sha256, path, imported_at, expected_sha256, ...content } = board;
  return content as Board;
}
export function shotStatus(data: any, env: Envelope) {
  const asset = data.assets.find((a: any) => a.asset_name === env.asset_name);
  if (asset?.selected_take_id) return "已采用";
  if (data.takes.some((t: any) => t.asset_name === env.asset_name))
    return "待选 take";
  const jobs = data.jobs.filter(
    (j: any) => j.request?.asset_name === env.asset_name,
  );
  const last = jobs.at(-1);
  if (
    last &&
    [
      "queued",
      "submitting",
      "submitted",
      "running",
      "generated",
      "downloading",
    ].includes(last.status)
  )
    return "生成中";
  if (
    last &&
    [
      "failed",
      "submission_unknown",
      "needs_attention",
      "download_failed",
    ].includes(last.status)
  )
    return "需处理";
  if (
    data.batches.some(
      (b: any) =>
        b.status === "awaiting_approval" &&
        b.request?.items?.some((i: any) => i.asset_name === env.asset_name),
    )
  )
    return "待确认批次";
  return env.prompt.trim() ? "Prompt 就绪" : "待编译";
}
export function shotTake(data: any, env: Envelope) {
  const asset = data.assets.find((a: any) => a.asset_name === env.asset_name);
  return (
    data.takes.find((t: any) => t.take_id === asset?.selected_take_id) ||
    data.takes.filter((t: any) => t.asset_name === env.asset_name).at(-1)
  );
}
