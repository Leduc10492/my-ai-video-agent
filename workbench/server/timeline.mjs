import { id, check } from "./files.mjs";

export function mediaUrl(projectId, takeId) {
  return `/api/projects/${projectId}/media/${takeId}`;
}
export function bindTimeline(record, projectId) {
  if (!record) return null;
  const rebound = structuredClone(record);
  for (const track of rebound.project.tracks)
    for (const el of track.elements) {
      const takeId =
        el.metadata?.take_id ||
        String(el.props?.src || "").match(/\/media\/([\w-]+)/)?.[1];
      if (takeId && el.props) el.props.src = mediaUrl(projectId, takeId);
    }
  return rebound;
}
export function emptyTimeline() {
  return {
    version: 1,
    backgroundColor: "#000000",
    tracks: [
      { id: `t-${id()}`, name: "主画面", type: "element", elements: [] },
    ],
    metadata: { markers: [] },
  };
}
export function assemble(store, projectId) {
  const board = store.meta("storyboard");
  check(board?.envelopes?.length, "先导入或制作包含 Prompt Envelopes 的分镜");
  const project = emptyTimeline(),
    track = project.tracks[0],
    fps = store.settings().fps,
    warnings = [];
  let cursor = 0;
  for (const env of board.envelopes) {
    const asset = store.get("asset", env.asset_name);
    const take = asset?.selected_take_id
      ? store.get("take", asset.selected_take_id)
      : null;
    const planned = Math.round(env.duration_seconds * fps) / fps;
    const duration = take
      ? Math.min(planned, Math.floor(take.media.duration * fps) / fps)
      : planned;
    check(duration > 0, `时长无效：${env.id}`);
    const metadata = {
      clip_id: `e-${id()}`,
      take_id: take?.take_id || null,
      asset_name: env.asset_name,
      envelope_id: env.id,
      scene: env.scene,
      planned_duration: planned,
      placeholder: !take,
      source_in: 0,
      source_out: duration,
    };
    if (!take)
      warnings.push(`${env.id} 缺少已采用的 take，保留 ${planned}s 占位`);
    if (take && duration < planned)
      warnings.push(
        `${env.id} 只有 ${duration}s，短于计划 ${planned}s；未补帧或变速`,
      );
    const element = take
      ? {
          id: metadata.clip_id,
          trackId: track.id,
          type: "video",
          s: cursor,
          e: cursor + duration,
          props: {
            src: mediaUrl(projectId, take.take_id),
            time: 0,
            playbackRate: 1,
            volume: 1,
            muted: false,
            loop: false,
          },
          frame: { size: [store.settings().width, store.settings().height] },
          mediaDuration: take.media.duration,
          objectFit: "contain",
          metadata,
        }
      : {
          id: metadata.clip_id,
          trackId: track.id,
          type: "text",
          s: cursor,
          e: cursor + duration,
          props: {
            text: `缺失素材 · ${env.id}`,
            fill: "#a3a3a3",
            fontSize: 48,
          },
          metadata,
        };
    track.elements.push(element);
    project.metadata.markers.push({
      id: `${env.id}-start`,
      title: `${env.id} · ${env.source_rows.join(" / ")}`,
      time: cursor,
      planned: true,
    });
    for (const marker of env.markers ?? []) {
      check(
        Number.isFinite(marker.time) &&
          marker.time >= 0 &&
          marker.time < planned,
        "计划镜头标记越界",
      );
      project.metadata.markers.push({
        ...marker,
        time: cursor + marker.time,
        planned: true,
      });
    }
    cursor += duration;
  }
  project.metadata = {
    ...project.metadata,
    board_hash: board.sha256,
    warnings,
  };
  return project;
}

export function validateTimeline(store, project, { exporting = false } = {}) {
  check(
    project && Array.isArray(project.tracks) && project.tracks.length <= 100,
    "时间轴数据无效",
  );
  const ids = new Set();
  for (const track of project.tracks) {
    track.type ??= "element";
    check(Array.isArray(track.elements), "轨道数据无效");
    for (const el of track.elements) {
      check(typeof el.id === "string" && !ids.has(el.id), "clip_id 必须唯一");
      ids.add(el.id);
      check(
        Number.isFinite(el.s) &&
          Number.isFinite(el.e) &&
          el.s >= 0 &&
          el.e > el.s &&
          el.e <= 24 * 3600,
        "剪辑入出点无效",
      );
      if (exporting)
        check(!el.metadata?.placeholder, "时间轴仍有缺失素材，请先替换占位");
      if (["video", "audio", "image"].includes(el.type)) {
        // Recover copied/split element metadata from our stable take URL, never from a filename guess.
        const urlTake = String(el.props?.src || "").match(
          /\/media\/([\w-]+)(?:\?|$)/,
        )?.[1];
        const takeId = el.metadata?.take_id || urlTake;
        const take = takeId && store.get("take", takeId);
        check(take, `片段 ${el.id} 未绑定项目 take`);
        check(take.media.kind === el.type, "片段类型与绑定的 take 不一致");
        check(!urlTake || urlTake === takeId, "媒体地址与 take 不一致");
        const start = Number(el.props?.time ?? 0),
          rate = Number(el.props?.playbackRate ?? 1);
        check(
          Number.isFinite(start) &&
            start >= 0 &&
            Number.isFinite(rate) &&
            rate > 0 &&
            rate <= 8,
          "源素材入点或速度无效",
        );
        if (el.type !== "image")
          check(
            start + (el.e - el.s) * rate <= take.media.duration + 0.06,
            `${take.filename} 的裁切超出素材时长；请缩短片段`,
          );
        check(!el.props?.loop, "禁止自动循环补齐素材");
        el.metadata = {
          ...el.metadata,
          clip_id: el.id,
          take_id: takeId,
          asset_name: take.asset_name,
          source_in: start,
          source_out: start + (el.e - el.s) * rate,
        };
      }
    }
  }
  if (exporting) check(ids.size > 0, "空时间轴不能导出");
  return project;
}

export function replaceTake(store, projectId, project, clipId, takeId) {
  const take = store.get("take", takeId);
  check(take, "take 不存在");
  const element = project.tracks
    .flatMap((t) => t.elements)
    .find((el) => el.id === clipId);
  check(element, "剪辑不存在");
  check(take.media.kind === "video", "主画面需要视频 take");
  check(
    take.media.duration + 0.001 >= element.e - element.s,
    "所选 take 短于当前片段，请先缩短片段",
  );
  return {
    ...element,
    type: "video",
    props: {
      src: mediaUrl(projectId, takeId),
      time: 0,
      playbackRate: 1,
      volume: 1,
      muted: false,
      loop: false,
    },
    metadata: {
      ...element.metadata,
      clip_id: element.id,
      take_id: takeId,
      asset_name: take.asset_name,
      placeholder: false,
    },
  };
}
