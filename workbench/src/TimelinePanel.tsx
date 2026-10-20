import { useEffect, useMemo, useRef, useState } from "react";
import {
  LivePlayerProvider,
  TimelineProvider,
  VideoEditor,
  useTimelineContext,
  useLivePlayerContext,
} from "@twick/studio";
import { VideoElement, AudioElement, ImageElement } from "@twick/timeline";
import {
  Save,
  Download,
  WandSparkles,
  FileJson,
  Scissors,
  Undo2,
  Redo2,
  Plus,
  Volume2,
  History,
  Clapperboard,
  ArrowUpRight,
} from "lucide-react";
import {
  Button,
  Badge,
  Dialog,
  Field,
  Input,
  Select,
  Textarea,
} from "./components/ui";
import { api, post, uid, pretty } from "./lib/api";
import type { ShotSelection } from "./lib/storyboard";
import "./generated/twick.css";
const empty = () => ({
  version: 1,
  backgroundColor: "#000000",
  tracks: [{ id: `t-${uid()}`, name: "主画面", type: "element", elements: [] }],
  metadata: { markers: [] },
});
// Twick increments its internal version even when a click changes no content.
const contentSnapshot = (project: any) => {
  const { version, ...content } = project || {};
  return JSON.stringify(content);
};
export default function TimelinePanel({
  base,
  data,
  projectId,
  run,
  onDirty,
  onOpenShot,
  onStoryboard,
  focusEnvelope,
}: {
  base: string;
  data: any;
  projectId: string;
  onDirty: (dirty: boolean) => void;
  onOpenShot: (selection: ShotSelection) => void;
  onStoryboard: () => void;
  focusEnvelope: { id: string; nonce: number } | null;
  run: (a: () => Promise<any>, m?: string) => Promise<any>;
}) {
  const [initial, setInitial] = useState<any>(
      data.timeline?.project || empty(),
    ),
    [context, setContext] = useState(0),
    [revision, setRevision] = useState(data.timeline?.revision || 0),
    [loadedRevision, setLoadedRevision] = useState(
      data.timeline?.revision || 0,
    );
  const [dirty, setDirty] = useState(false);
  const projectFile = useRef<HTMLInputElement>(null);
  useEffect(() => {
    onDirty(dirty);
    return () => onDirty(false);
  }, [dirty, onDirty]);
  const requireSaved = () => {
    if (dirty) throw new Error("请先保存当前时间轴，再装配或载入其他版本。");
  };
  const load = (record: any) => {
    setInitial(record.project);
    setRevision(data.timeline?.revision || 0);
    setLoadedRevision(record.revision);
    setContext((v) => v + 1);
  };
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b px-5 py-3">
        <span className="mr-auto font-medium">
          剪辑时间轴{" "}
          <span className="ml-2 text-xs text-muted-foreground">
            Twick · {data.settings.width} × {data.settings.height} /{" "}
            {data.settings.fps}fps
          </span>
        </span>
        <Button variant="outline" size="sm" onClick={onStoryboard}>
          <Clapperboard />
          可视化分镜
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => projectFile.current?.click()}
        >
          <FileJson />
          导入工程
        </Button>
        <input
          ref={projectFile}
          type="file"
          accept=".json"
          className="hidden"
          aria-label="导入工程 JSON"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            void run(async () => {
              requireSaved();
              const imported = JSON.parse(await file.text());
              const record = await post(`${base}/timeline`, {
                project: imported.project || imported,
                expected_revision: data.timeline?.revision || 0,
              });
              load(record);
              setRevision(record.revision);
            }, "工程已导入为新版本，媒体引用已校验");
          }}
        />
        <Button
          variant="outline"
          size="sm"
          disabled={!data.storyboard}
          onClick={() =>
            run(async () => {
              requireSaved();
              const value = await post(`${base}/timeline/assemble`, {
                expected_revision: data.timeline?.revision || 0,
              });
              setInitial(value.project);
              setRevision(value.revision);
              setLoadedRevision(value.revision);
              setContext((v) => v + 1);
            }, "已装配为新的时间轴版本")
          }
        >
          <WandSparkles />
          装配新粗剪
        </Button>
        <Select
          className="w-36"
          aria-label="载入时间轴版本"
          value=""
          onChange={(e) => {
            const value = e.target.value;
            void run(async () => {
              requireSaved();
              load(await api(`${base}/timeline/${value}`));
            });
          }}
        >
          <option value="">载入历史版本</option>
          {data.revisions.map((r: any) => (
            <option key={r.revision} value={r.revision}>
              v{r.revision} · {r.source === "manual" ? "手动编辑" : "自动装配"}
            </option>
          ))}
        </Select>
      </div>
      <LivePlayerProvider>
        <TimelineProvider
          key={`${projectId}-${context}`}
          contextId={`${projectId}-${context}`}
          initialData={initial}
          resolution={{
            width: data.settings.width,
            height: data.settings.height,
          }}
          analytics={{ enabled: false }}
        >
          <Editor
            base={base}
            data={data}
            revision={revision}
            loadedRevision={loadedRevision}
            setRevision={(value: number) => {
              setRevision(value);
              setLoadedRevision(value);
            }}
            run={run}
            onDirty={setDirty}
            onOpenShot={onOpenShot}
            focusEnvelope={focusEnvelope}
          />
        </TimelineProvider>
      </LivePlayerProvider>
    </div>
  );
}
function Editor({
  base,
  data,
  revision,
  loadedRevision,
  setRevision,
  run,
  onDirty,
  onOpenShot,
  focusEnvelope,
}: any) {
  const {
    editor,
    selectedItem,
    present,
    canUndo,
    canRedo,
    changeLog,
    setSelectedItem,
  } = useTimelineContext();
  const player = useLivePlayerContext() as any;
  const shellRef = useRef<HTMLDivElement>(null);
  const [playerReady, setPlayerReady] = useState(false);
  useEffect(() => {
    // Twick's first render emits timeupdate(0) before duration. Seek only after
    // that render, otherwise the initial frame silently resets the playhead.
    const shell = shellRef.current;
    const ready = (event: Event) => {
      if ((event as CustomEvent<number>).detail > 0) setPlayerReady(true);
    };
    shell?.addEventListener("duration", ready, true);
    return () => shell?.removeEventListener("duration", ready, true);
  }, []);
  const [takeId, setTakeId] = useState(""),
    [focusNotice, setFocusNotice] = useState(""),
    [saved, setSaved] = useState(() => contentSnapshot(present)),
    [trimIn, setTrimIn] = useState("0"),
    [trimLength, setTrimLength] = useState("0");
  const selected = selectedItem as any,
    isClip = selected?.getId?.().startsWith("e-"),
    metadata = isClip ? selected.getMetadata() : null;
  const dirty = contentSnapshot(present) !== saved;
  const focusedRequest = useRef<number | null>(null);
  useEffect(() => {
    if (!focusEnvelope || focusedRequest.current === focusEnvelope.nonce)
      return;
    const track = editor
      .getProject()
      .tracks.find((t: any) =>
        t.elements.some(
          (e: any) => e.metadata?.envelope_id === focusEnvelope.id,
        ),
      );
    const clip = track?.elements.find(
      (e: any) => e.metadata?.envelope_id === focusEnvelope.id,
    );
    const element =
      clip && editor.getTrackById(track!.id)?.getElementById(clip.id);
    if (element) {
      if (!playerReady) return;
      focusedRequest.current = focusEnvelope.nonce;
      setSelectedItem(element as Parameters<typeof setSelectedItem>[0]);
      player.setSeekTime(element.getStart());
      player.setCurrentTime(element.getStart());
      setFocusNotice("");
    } else
      setFocusNotice(
        `${focusEnvelope.id} 尚未出现在当前时间轴。保存当前修改后，可装配新粗剪。`,
      );
  }, [focusEnvelope?.nonce, present, playerReady]);
  const hasEdited = useRef(false);
  useEffect(() => {
    // Twick hydrates defaults after mount without creating an undo entry.
    if (!canUndo && !hasEdited.current) setSaved(contentSnapshot(present));
    if (canUndo) hasEdited.current = true;
  }, [present, canUndo]);
  useEffect(() => {
    onDirty(dirty);
  }, [dirty, onDirty]);
  useEffect(() => {
    if (isClip) {
      setTrimIn(String(selected.getProps().time || 0));
      setTrimLength(String(selected.getEnd() - selected.getStart()));
    }
  }, [selectedItem, changeLog]);
  useEffect(() => {
    if (!dirty) return;
    const fn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", fn);
    return () => window.removeEventListener("beforeunload", fn);
  }, [dirty]);
  const save = async () => {
    hasEdited.current = true;
    const project = editor.getProject();
    const record = await post(`${base}/timeline`, {
      project,
      expected_revision: revision,
    });
    setRevision(record.revision);
    setSaved(contentSnapshot(present));
    return record;
  };
  const colors = useMemo(
    () =>
      Object.fromEntries(
        [
          "video",
          "audio",
          "image",
          "text",
          "caption",
          "icon",
          "emoji",
          "circle",
          "rect",
          "element",
          "fragment",
          "frameEffect",
          "filters",
          "transition",
          "animation",
          "effect",
        ].map((k) => [k, "#737373"]),
      ),
    [],
  );
  const add = async () => {
    const take = data.takes.find((t: any) => t.take_id === takeId);
    if (!take) return;
    const src = `/api${base}/media/${takeId}`,
      size = { width: data.settings.width, height: data.settings.height };
    const element: any =
      take.media.kind === "video"
        ? new VideoElement(src, size)
        : take.media.kind === "audio"
          ? new AudioElement(src)
          : new ImageElement(src, size);
    const track =
      editor.getTrackByName(take.media.kind === "audio" ? "音频" : "主画面") ||
      editor.addTrack(take.media.kind === "audio" ? "音频" : "主画面");
    const end = Math.max(0, ...track.getElements().map((e: any) => e.getEnd()));
    element
      .setStart(end)
      .setEnd(end + (take.media.duration || 5))
      .setMetadata({
        take_id: takeId,
        asset_name: take.asset_name,
        clip_id: element.getId(),
      });
    await editor.addElementToTrack(track, element);
  };
  return (
    <>
      {focusNotice && (
        <p role="status" className="border-b bg-muted/40 px-5 py-3 text-sm">
          {focusNotice}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2 border-b px-5 py-2">
        <Button
          size="icon"
          variant="ghost"
          aria-label="撤销"
          disabled={!canUndo}
          onClick={() => editor.undo()}
        >
          <Undo2 />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          aria-label="重做"
          disabled={!canRedo}
          onClick={() => editor.redo()}
        >
          <Redo2 />
        </Button>
        <Badge>
          {loadedRevision !== revision
            ? `历史 v${loadedRevision}`
            : `v${revision}`}{" "}
          {dirty ? "· 未保存" : ""}
        </Badge>
        <Select
          className="ml-2 max-w-60"
          value={takeId}
          onChange={(e) => setTakeId(e.target.value)}
          aria-label="插入素材"
        >
          <option value="">从资产库选择 take</option>
          {data.takes.map((t: any) => (
            <option key={t.take_id} value={t.take_id}>
              {t.filename} · {t.take_id.slice(0, 6)}
            </option>
          ))}
        </Select>
        <Button
          variant="outline"
          size="sm"
          disabled={!takeId}
          onClick={() => run(add)}
        >
          <Plus />
          插入
        </Button>
        <Button
          className="ml-auto"
          size="sm"
          variant="outline"
          onClick={() => run(save, "时间轴已保存为新版本")}
        >
          <Save />
          保存工程
        </Button>
        <Button
          size="sm"
          onClick={() =>
            run(async () => {
              const record = await save();
              await post(`${base}/exports`, {
                revision: record.revision,
                request_key: uid(),
              });
            }, "本地导出已开始，完成后在任务面板下载")
          }
        >
          <Download />
          导出 MP4
        </Button>
      </div>
      <div ref={shellRef} className="twick-shell overflow-hidden">
        <VideoEditor
          defaultPlayControls
          editorConfig={{
            videoProps: {
              width: data.settings.width,
              height: data.settings.height,
              backgroundColor: "#000000",
            },
            fps: data.settings.fps,
            canvasMode: true,
            elementColors: colors as any,
          }}
          rightPanel={
            <div className="w-60 space-y-4 overflow-auto p-4 text-sm">
              <h3 className="font-semibold">片段详情</h3>
              {isClip ? (
                <>
                  <p className="break-all text-xs">
                    {metadata?.asset_name || selected.getId()}
                  </p>
                  <p className="text-xs text-neutral-400">
                    take {metadata?.take_id?.slice(0, 10) || "缺失素材"}
                  </p>
                  {data.storyboard?.envelopes
                    ?.filter(
                      (e: any) =>
                        e.id === metadata?.envelope_id ||
                        (!metadata?.envelope_id &&
                          e.asset_name === metadata?.asset_name),
                    )
                    .map((env: any) => (
                      <div key={env.id} className="space-y-2">
                        <p className="text-xs text-muted-foreground">
                          关联分镜 · {env.id}
                        </p>
                        {env.source_rows.map((rowId: string) => (
                          <Button
                            key={rowId}
                            size="sm"
                            variant="outline"
                            className="w-full justify-between"
                            onClick={() =>
                              onOpenShot({
                                scene: env.scene,
                                rowId,
                                envelopeId: env.id,
                                clipId: selected.getId(),
                                takeId: metadata?.take_id,
                              })
                            }
                          >
                            {rowId} · 镜头详情
                            <ArrowUpRight />
                          </Button>
                        ))}
                      </div>
                    ))}
                  <Field label="素材入点（秒）">
                    <Input
                      type="number"
                      step={1 / data.settings.fps}
                      min={0}
                      value={trimIn}
                      onChange={(e) => setTrimIn(e.target.value)}
                    />
                  </Field>
                  <Field label="片段时长（秒）">
                    <Input
                      type="number"
                      step={1 / data.settings.fps}
                      min={1 / data.settings.fps}
                      value={trimLength}
                      onChange={(e) => setTrimLength(e.target.value)}
                    />
                  </Field>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      run(async () => {
                        const start = Number(trimIn),
                          length = Number(trimLength),
                          take = data.takes.find(
                            (t: any) => t.take_id === metadata?.take_id,
                          );
                        if (
                          !Number.isFinite(start) ||
                          !Number.isFinite(length) ||
                          start < 0 ||
                          length <= 0 ||
                          (take && start + length > take.media.duration + 0.01)
                        )
                          throw new Error("裁切超出素材范围");
                        selected.setProps({
                          ...selected.getProps(),
                          time: start,
                        });
                        selected.setEnd(selected.getStart() + length);
                        editor.updateElement(selected);
                      }, "裁切已应用，保存后生成新版本")
                    }
                  >
                    应用裁切
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      run(async () => {
                        await editor.splitElement(selected, player.currentTime);
                      })
                    }
                  >
                    <Scissors />
                    在播放头分割
                  </Button>
                  <Field label="音量">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={selected.getProps().volume ?? 1}
                      onChange={(e) => {
                        selected.setProps({
                          ...selected.getProps(),
                          volume: Number(e.target.value),
                          muted: false,
                        });
                        editor.updateElement(selected);
                      }}
                    />
                  </Field>
                  <label className="flex gap-2">
                    <input
                      type="checkbox"
                      checked={!!selected.getProps().muted}
                      onChange={(e) => {
                        const props = selected.getProps();
                        selected.setMetadata({
                          ...metadata,
                          unmuted_volume: props.muted
                            ? metadata?.unmuted_volume
                            : (props.volume ?? 1),
                        });
                        selected.setProps({
                          ...props,
                          muted: e.target.checked,
                          volume: e.target.checked
                            ? 0
                            : (metadata?.unmuted_volume ?? 1),
                        });
                        editor.updateElement(selected);
                      }}
                    />
                    静音
                  </label>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!takeId}
                    onClick={() =>
                      run(async () => {
                        const take = data.takes.find(
                          (t: any) => t.take_id === takeId,
                        );
                        if (
                          take.media.kind !== "video" ||
                          take.media.duration <
                            selected.getEnd() - selected.getStart()
                        )
                          throw new Error("请选择长度足够的视频 take");
                        if (metadata?.placeholder) {
                          const snapshot = editor.getProject();
                          for (const track of snapshot.tracks) {
                            track.elements = track.elements.map((e: any) =>
                              e.id === selected.getId()
                                ? {
                                    ...e,
                                    type: "video",
                                    props: {
                                      src: `/api${base}/media/${takeId}`,
                                      time: 0,
                                      volume: 1,
                                      muted: false,
                                      playbackRate: 1,
                                      loop: false,
                                    },
                                    frame: {
                                      size: [
                                        data.settings.width,
                                        data.settings.height,
                                      ],
                                    },
                                    mediaDuration: take.media.duration,
                                    objectFit: "contain",
                                    metadata: {
                                      ...metadata,
                                      take_id: takeId,
                                      asset_name: take.asset_name,
                                      placeholder: false,
                                    },
                                  }
                                : e,
                            );
                          }
                          editor.loadProjectSnapshot(snapshot);
                        } else {
                          if (!selected.setSrc)
                            throw new Error("请选择视频或缺失素材占位");
                          await selected.setSrc(`/api${base}/media/${takeId}`);
                          selected
                            .setStartAt(0)
                            .setMediaDuration(take.media.duration)
                            .setMetadata({
                              ...metadata,
                              take_id: takeId,
                              asset_name: take.asset_name,
                              placeholder: false,
                            });
                          editor.updateElement(selected);
                        }
                      }, "片段已换 take，旧版本保留")
                    }
                  >
                    用所选 take 替换
                  </Button>
                </>
              ) : (
                <p className="text-xs leading-6 text-neutral-400">
                  选择时间轴中的片段可裁切、分割、换 take
                  和调节音量。拖动片段可重新排序。
                </p>
              )}
              <div className="border-t border-neutral-700 pt-3">
                <p className="mb-2 text-xs font-medium">计划镜头标记</p>
                {(present?.metadata as any)?.markers?.map((m: any) => (
                  <p key={m.id} className="mb-2 text-xs text-neutral-400">
                    {m.time.toFixed(2)}s · {m.title}
                  </p>
                ))}
                <p className="text-xs text-neutral-500">
                  标记来自分镜计划，实际切点由你调整。
                </p>
              </div>
            </div>
          }
        />
      </div>
      {(present?.metadata as any)?.warnings?.length > 0 && (
        <div className="border-t px-5 py-2 text-xs text-muted-foreground">
          {(present?.metadata as any).warnings.join("；")}
        </div>
      )}
    </>
  );
}
