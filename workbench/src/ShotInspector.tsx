import { useEffect, useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import {
  ArrowRight,
  Check,
  Clapperboard,
  Copy,
  Film,
  Link2,
  Save,
  Sparkles,
  X,
} from "lucide-react";
import {
  Badge,
  Button,
  Dialog,
  Field,
  Input,
  Textarea,
  cn,
} from "./components/ui";
import { api, post, pretty, time } from "./lib/api";
import {
  boardContent,
  boardRows,
  shotKey,
  shotStatus,
  type Board,
  type Envelope,
  type Shot,
  type ShotSelection,
} from "./lib/storyboard";
import { Media, GenerationDialog, mediaDetails } from "./AssetsPanel";

function loadDraft(key: string, selection: ShotSelection) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    return value?.shot?.id === selection.rowId &&
      value?.shot?.scene === selection.scene &&
      value?.envelope?.id === selection.envelopeId
      ? value
      : null;
  } catch {
    return null;
  }
}
export default function ShotInspector({
  base,
  data,
  selection,
  onClose,
  onTimeline,
  onAsset,
  onStage,
  onJobs,
  onDirty,
  run,
}: {
  base: string;
  data: any;
  selection: ShotSelection;
  onClose: () => void;
  onTimeline: (id: string) => void;
  onAsset: (name: string) => void;
  onStage: (stage: string, instruction: string) => void;
  onJobs: () => void;
  onDirty: (value: boolean) => void;
  run: (a: () => Promise<any>, m?: string) => Promise<any>;
}) {
  const key = `film-shot-draft:${base}:${shotKey(selection.scene, selection.rowId)}`;
  const current = boardRows(data.storyboard).find(
    (r) => r.key === shotKey(selection.scene, selection.rowId),
  )!;
  const [restored] = useState(() => loadDraft(key, selection));
  const [snapshot, setSnapshot] = useState<Board>(data.storyboard),
    [baseHash, setBaseHash] = useState<string>(
      restored?.baseHash || data.storyboard.sha256,
    ),
    [shot, setShot] = useState<Shot>(restored?.shot || current.shot),
    [envelope, setEnvelope] = useState<Envelope>(
      restored?.envelope || current.envelope,
    ),
    [tab, setTab] = useState("shot"),
    [generate, setGenerate] = useState(false),
    [takeId, setTakeId] = useState(
      selection.takeId ||
        data.assets.find(
          (a: any) => a.asset_name === current.envelope.asset_name,
        )?.selected_take_id ||
        "",
    ),
    [refQuery, setRefQuery] = useState("");
  const original = boardRows(snapshot).find(
    (r) => r.key === shotKey(selection.scene, selection.rowId),
  );
  const dirty =
    pretty(shot) !== pretty(original?.shot) ||
    pretty(envelope) !== pretty(original?.envelope) ||
    baseHash !== snapshot.sha256;
  const asset = data.assets.find(
    (a: any) => a.asset_name === envelope.asset_name,
  );
  const takes = data.takes.filter(
    (t: any) => t.asset_name === envelope.asset_name,
  );
  const viewed =
    data.takes.find((t: any) => t.take_id === takeId) ||
    takes.find((t: any) => t.take_id === asset?.selected_take_id) ||
    takes.at(-1);
  const refs = shot.references || [],
    relatedJobs = data.jobs.filter(
      (j: any) => j.request?.asset_name === envelope.asset_name,
    );
  const activeBatches = data.batches.filter(
    (b: any) =>
      b.status === "awaiting_approval" &&
      b.request?.items?.some((i: any) => i.asset_name === envelope.asset_name),
  );
  useEffect(() => {
    onDirty(dirty);
    return () => onDirty(false);
  }, [dirty, onDirty]);
  useEffect(() => {
    try {
      if (dirty)
        localStorage.setItem(key, JSON.stringify({ baseHash, shot, envelope }));
      else localStorage.removeItem(key);
    } catch {
      /* Server save remains available if browser storage is full. */
    }
  }, [key, dirty, baseHash, shot, envelope]);
  useEffect(() => {
    if (!dirty && current) {
      setSnapshot(data.storyboard);
      setBaseHash(data.storyboard.sha256);
      setShot(current.shot);
      setEnvelope(current.envelope);
    }
  }, [data.storyboard?.sha256]);
  const updateShot = (field: string, value: unknown) =>
    setShot((previous) => ({ ...previous, [field]: value }));
  const reset = () => {
    setSnapshot(data.storyboard);
    setBaseHash(data.storyboard.sha256);
    setShot(current.shot);
    setEnvelope(current.envelope);
    localStorage.removeItem(key);
  };
  const save = () =>
    run(async () => {
      const content = boardContent(snapshot);
      const found = (content.shots || []).some(
        (s) => s.scene === shot.scene && s.id === shot.id,
      );
      const shots = found
        ? content.shots!.map((s) =>
            s.scene === shot.scene && s.id === shot.id ? shot : s,
          )
        : [...(content.shots || []), shot];
      const saved = await post(`${base}/storyboard`, {
        ...content,
        shots,
        envelopes: content.envelopes.map((e) =>
          e.id === envelope.id ? envelope : e,
        ),
        expected_sha256: baseHash,
      });
      setSnapshot(saved);
      setBaseHash(saved.sha256);
      localStorage.removeItem(key);
    }, "镜头详情已保存为新分镜版本，已有 take 和剪辑保持不变");
  const tabs = [
    ["shot", "画面与声音"],
    ["refs", `参考素材 ${refs.length || ""}`],
    ["prompt", "Prompt"],
    ["takes", `生成版本 ${takes.length || ""}`],
  ];
  return (
    <>
      <Dialog
        wide
        className="shot-dialog max-w-6xl p-0"
        open
        onOpenChange={(o) => !o && onClose()}
        title={`${shot.id} · ${shot.title || "镜头详情"}`}
        description={`${shot.scene} / ${envelope.id} · ${envelope.source_rows.length > 1 ? `${envelope.source_rows.length} 个镜头共用一个生成片段` : "单镜头生成片段"}`}
      >
        <div className="grid min-h-0 lg:grid-cols-[minmax(300px,0.9fr)_minmax(0,1.1fr)]">
          <div className="space-y-5 border-b bg-muted/35 p-6 lg:border-b-0 lg:border-r">
            <div className="aspect-video overflow-hidden rounded-2xl border bg-muted shadow-xs">
              {viewed ? (
                <Media key={viewed.take_id} base={base} take={viewed} />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
                  <Film size={36} strokeWidth={1} />
                  <span className="text-sm">这个镜头还没有素材</span>
                  <span className="text-xs">
                    完成 Prompt 后，可准备生成批次
                  </span>
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{shotStatus(data, envelope)}</Badge>
              {Array.isArray(shot.source_shot_numbers) && (
                <Badge>原分镜 #{shot.source_shot_numbers.join(" / #")}</Badge>
              )}
              <Badge>
                {envelope.duration_seconds}s /{" "}
                {envelope.source_rows.length > 1 ? "整段计划" : "计划时长"}
              </Badge>
              {viewed && (
                <Badge>
                  {viewed.take_id === asset?.selected_take_id
                    ? "当前采用"
                    : "预览版本"}
                </Badge>
              )}
            </div>
            <div>
              <p className="mb-2 text-xs text-muted-foreground">标准文件名</p>
              <p className="break-all font-mono text-sm">
                {envelope.asset_name}
              </p>
            </div>
            {selection.clipId && (
              <p className="rounded-xl border bg-background p-3 text-xs leading-6 text-muted-foreground">
                从剪辑片段进入。这里采用新 take 只影响后续装配；当前片段仍引用{" "}
                {selection.takeId?.slice(0, 8) || "占位素材"}。
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={dirty}
                onClick={() => onTimeline(envelope.id)}
              >
                <Clapperboard />
                在时间轴定位
              </Button>
              {asset && (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={dirty}
                  onClick={() => onAsset(asset.asset_name)}
                >
                  资产库
                  <ArrowRight />
                </Button>
              )}
            </div>
            {takes.length > 0 && (
              <div>
                <p className="mb-3 text-xs text-muted-foreground">
                  点击查看素材版本
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {takes.map((take: any, i: number) => (
                    <button
                      key={take.take_id}
                      onClick={() => setTakeId(take.take_id)}
                      aria-label={`预览版本 ${i + 1}`}
                      className={cn(
                        "overflow-hidden rounded-xl border bg-background text-left",
                        viewed?.take_id === take.take_id &&
                          "ring-2 ring-foreground",
                      )}
                    >
                      <div className="pointer-events-none aspect-video">
                        <Media base={base} take={take} controls={false} />
                      </div>
                      <p className="flex items-center gap-1 p-2 text-xs">
                        版本 {i + 1}
                        {take.take_id === asset?.selected_take_id && (
                          <Check size={12} />
                        )}
                      </p>
                    </button>
                  ))}
                </div>
                <Button
                  className="mt-3 w-full"
                  variant="outline"
                  disabled={
                    !viewed ||
                    viewed.take_id === asset?.selected_take_id ||
                    viewed.asset_name !== envelope.asset_name
                  }
                  onClick={() =>
                    run(
                      () =>
                        post(`${base}/takes/${viewed.take_id}/adopt`, {
                          visual_status: "passed",
                        }),
                      "已选用此版本；现有剪辑不自动替换",
                    )
                  }
                >
                  <Check />
                  {viewed?.asset_name !== envelope.asset_name
                    ? "当前剪辑引用其他资产"
                    : viewed?.take_id === asset?.selected_take_id
                      ? "已选用此版本"
                      : "确认使用此版本"}
                </Button>
              </div>
            )}
          </div>
          <Tabs.Root className="min-w-0" value={tab} onValueChange={setTab}>
            <Tabs.List
              className="flex gap-1 overflow-x-auto border-b px-5 pt-3"
              aria-label="镜头详情分类"
            >
              {tabs.map(([id, title]) => (
                <Tabs.Trigger
                  key={id}
                  value={id}
                  className={cn(
                    "whitespace-nowrap border-b-2 border-transparent px-3 py-3 text-sm text-muted-foreground",
                    tab === id &&
                      "border-foreground font-medium text-foreground",
                  )}
                >
                  {title}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
            <Tabs.Content value={tab} className="min-h-80 space-y-5 p-6">
              {dirty && baseHash !== data.storyboard?.sha256 && (
                <p
                  role="alert"
                  className="rounded-xl border border-destructive/25 bg-destructive/5 p-3 text-sm text-destructive"
                >
                  分镜已被另一处更新。本地草稿仍保留；可先复制内容，再放弃草稿以载入新版本。
                </p>
              )}
              {tab === "shot" && (
                <>
                  {Array.isArray(shot.risks) && shot.risks.length > 0 && (
                    <div className="rounded-xl border bg-muted/50 p-3 text-sm leading-6">
                      <p className="mb-1 font-medium">待确认事项</p>
                      {shot.risks
                        .filter((r: unknown) => typeof r === "string")
                        .map((r: string, i: number) => (
                          <p key={i}>{r}</p>
                        ))}
                    </div>
                  )}
                  <Field label="镜头标题">
                    <Input
                      value={shot.title || ""}
                      onChange={(e) => updateShot("title", e.target.value)}
                      placeholder="用一句话概括这个镜头"
                    />
                  </Field>
                  <Field label="画面与动作">
                    <Textarea
                      className="min-h-32 leading-7"
                      value={shot.description || ""}
                      onChange={(e) =>
                        updateShot("description", e.target.value)
                      }
                      placeholder="主体、动作、表演与画面变化…"
                    />
                  </Field>
                  <Field label="景别与摄影机">
                    <Input
                      value={shot.camera || ""}
                      onChange={(e) => updateShot("camera", e.target.value)}
                      placeholder="景别、机位、运动、焦段…"
                    />
                  </Field>
                  <Field label="声音与台词">
                    <Textarea
                      value={shot.sound || ""}
                      onChange={(e) => updateShot("sound", e.target.value)}
                      placeholder="原台词、环境声、音乐或静默…"
                    />
                  </Field>
                  {Array.isArray(shot.dialogue) && shot.dialogue.length > 0 && (
                    <div className="rounded-xl border p-3 text-sm leading-7">
                      <p className="mb-2 text-xs text-muted-foreground">
                        原文对白 · 来源对照
                      </p>
                      {shot.dialogue
                        .filter((d: any) => typeof d?.text === "string")
                        .map((d: any, i: number) => (
                          <p key={i} className="whitespace-pre-wrap">
                            <span className="font-medium">
                              {typeof d.speaker_cue === "string"
                                ? d.speaker_cue
                                : "对白"}
                              ：
                            </span>
                            {d.text}
                          </p>
                        ))}
                    </div>
                  )}
                  <Field
                    label={`生成片段计划时长（秒）${envelope.source_rows.length > 1 ? " · 所有共用镜头合计" : ""}`}
                  >
                    <Input
                      className="max-w-40"
                      type="number"
                      min="0.1"
                      max="300"
                      step="0.1"
                      value={envelope.duration_seconds}
                      onChange={(e) =>
                        setEnvelope({
                          ...envelope,
                          duration_seconds: Number(e.target.value),
                        })
                      }
                    />
                  </Field>
                  <p className="text-xs leading-6 text-muted-foreground">
                    画面描述与生成 Prompt
                    分开保存。修改镜头设计后，请重新编译并审阅 Prompt。
                  </p>
                </>
              )}
              {tab === "refs" && (
                <>
                  <p className="text-sm leading-6 text-muted-foreground">
                    选择此镜头需要的本地参考。关联按标准文件名保存；生成前仍需核对真实附件与用途。
                  </p>
                  {refs.map((name) => {
                    const ref = data.assets.find(
                        (a: any) => a.asset_name === name,
                      ),
                      take = data.takes.find(
                        (t: any) => t.take_id === ref?.selected_take_id,
                      );
                    return (
                      <div
                        className="flex items-center gap-3 rounded-xl border p-3"
                        key={name}
                      >
                        <div className="pointer-events-none grid size-14 shrink-0 place-items-center overflow-hidden rounded-lg bg-muted">
                          {take ? (
                            <Media take={take} base={base} controls={false} />
                          ) : (
                            <Link2 size={18} />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="break-all text-sm">{name}</p>
                          <p className="mt-1 break-all text-xs text-muted-foreground">
                            {ref?.tag ||
                              (ref ? "未绑定平台 tag" : "尚未导入资产库")}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`移除参考 ${name}`}
                          onClick={() =>
                            updateShot(
                              "references",
                              refs.filter((r) => r !== name),
                            )
                          }
                        >
                          <X />
                        </Button>
                      </div>
                    );
                  })}
                  <Input
                    aria-label="搜索参考素材"
                    placeholder="搜索资产文件名…"
                    value={refQuery}
                    onChange={(e) => setRefQuery(e.target.value)}
                  />
                  <div className="max-h-52 space-y-1 overflow-auto">
                    {data.assets
                      .filter(
                        (a: any) =>
                          a.asset_name !== envelope.asset_name &&
                          !refs.includes(a.asset_name) &&
                          a.asset_name
                            .toLowerCase()
                            .includes(refQuery.toLowerCase()),
                      )
                      .map((a: any) => (
                        <button
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-muted"
                          key={a.asset_name}
                          onClick={() =>
                            updateShot("references", [...refs, a.asset_name])
                          }
                        >
                          <Link2 size={14} />
                          <span className="break-all">{a.asset_name}</span>
                        </button>
                      ))}
                    {data.assets.length === 0 && (
                      <p className="py-5 text-sm text-muted-foreground">
                        资产库为空，请先导入或生成参考素材。
                      </p>
                    )}
                  </div>
                </>
              )}
              {tab === "prompt" && (
                <>
                  <div className="rounded-xl border bg-muted/40 p-4">
                    <p className="text-sm font-medium">{envelope.id}</p>
                    <p className="mt-2 text-xs leading-6 text-muted-foreground">
                      对应镜头：{envelope.source_rows.join(" · ")}
                      。此处修改作用于整个生成片段，计划镜头标记不代表实际切点。
                    </p>
                  </div>
                  <Field
                    label="生成 Prompt"
                    hint="这里只保存影响画面和声音的内容，文件名与审核状态单独管理。"
                  >
                    <Textarea
                      className="min-h-64 leading-7"
                      value={envelope.prompt}
                      onChange={(e) =>
                        setEnvelope({ ...envelope, prompt: e.target.value })
                      }
                      placeholder="可手动编辑，或调用项目中的 Prompt 编译 Skill。"
                    />
                  </Field>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={dirty}
                      onClick={() =>
                        onStage(
                          "prompts",
                          `只处理 ${shot.scene} 的 Prompt Envelope ${envelope.id}，对应 Shot Rows：${envelope.source_rows.join("、")}。读取当前工作台分镜 ${snapshot.path}，保留现有镜头设计、参考与标准文件名 ${envelope.asset_name}，按 Registry 编译 Prompt。`,
                        )
                      }
                    >
                      <Sparkles />
                      调用 Prompt 编译
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        run(
                          () => navigator.clipboard.writeText(envelope.prompt),
                          "Prompt 已复制",
                        )
                      }
                    >
                      <Copy />
                      复制 Prompt
                    </Button>
                  </div>
                </>
              )}
              {tab === "takes" && (
                <>
                  <h3 className="font-medium">生成与采用记录</h3>
                  {viewed ? (
                    <div className="space-y-3 rounded-xl border p-4">
                      <p className="break-all text-sm">{viewed.filename}</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge>
                          技术检查：{viewed.technical_status || "已入库"}
                        </Badge>
                        <Badge>
                          视觉检查：
                          {viewed.visual_status === "passed"
                            ? "通过"
                            : "待检查"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {mediaDetails(viewed)}
                      </p>
                      <details>
                        <summary className="cursor-pointer text-xs text-muted-foreground">
                          来源、模型与生成时的 Prompt
                        </summary>
                        <pre className="mt-3 text-xs leading-6">
                          {pretty(viewed)}
                        </pre>
                      </details>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      尚无生成结果。准备批次后，可在确认卡片核对模型与用量方式。
                    </p>
                  )}
                  {activeBatches.length > 0 && (
                    <Button variant="outline" onClick={onJobs}>
                      查看 {activeBatches.length} 个待确认批次
                      <ArrowRight />
                    </Button>
                  )}
                  {relatedJobs.map((j: any) => (
                    <div key={j.job_id} className="rounded-xl border p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">
                          {j.request?.params?.model || "生成任务"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {time(j.created_at)}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {j.status}
                      </p>
                      {j.error && (
                        <p className="mt-2 text-xs text-destructive">
                          {j.error}
                        </p>
                      )}
                    </div>
                  ))}
                </>
              )}
            </Tabs.Content>
          </Tabs.Root>
        </div>
        <div className="sticky bottom-0 flex flex-wrap items-center gap-3 border-t bg-background px-6 py-4">
          <span className="mr-auto text-xs text-muted-foreground">
            {dirty ? "未保存修改 · 草稿暂存于此浏览器" : "已保存到本地项目"}
          </span>
          {dirty && (
            <Button variant="ghost" size="sm" onClick={reset}>
              放弃草稿
            </Button>
          )}
          <Button
            variant="outline"
            disabled={!envelope.prompt.trim() || dirty}
            onClick={() => setGenerate(true)}
          >
            <Sparkles />
            准备生成
          </Button>
          <Button disabled={!dirty} onClick={save}>
            <Save />
            保存镜头
          </Button>
        </div>
      </Dialog>
      <GenerationDialog
        open={generate}
        onOpenChange={setGenerate}
        base={base}
        data={data}
        scene={envelope.scene}
        selected={envelope.asset_name}
        envelope={envelope}
        run={run}
      />
    </>
  );
}
