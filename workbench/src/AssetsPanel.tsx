import { useEffect, useState } from "react";
import BatchReview from "./BatchReview";
import { AssetStatus, assetState } from "./AssetStatus";
import {
  Plus,
  Search,
  Upload,
  Sparkles,
  FileJson,
} from "lucide-react";
import {
  Button,
  Dialog,
  Field,
  Input,
  Select,
  Textarea,
  cn,
  Placeholder,
  EmptyState,
} from "./components/ui";
import { api, post, pretty } from "./lib/api";
export function mediaDetails(take: any) {
  const media = take?.media || {};
  const dimensions = media.width && media.height
    ? `${media.width} × ${media.height} 像素`
    : "";
  if (media.kind === "image") return dimensions || "图片";
  const duration = Number.isFinite(media.duration) && media.duration > 0
    ? `${media.duration.toFixed(1)} 秒`
    : "时长未知";
  return [dimensions, duration].filter(Boolean).join(" · ");
}
export function Media({
  take,
  base,
  controls = true,
}: {
  take: any;
  base: string;
  controls?: boolean;
}) {
  const src = `/api${base}/media/${take.take_id}`;
  return take.media.kind === "image" ? (
    <img alt={take.filename} src={src} className="size-full object-contain" />
  ) : take.media.kind === "video" ? (
    <video
      src={src}
      controls={controls}
      preload="metadata"
      className="size-full object-contain"
    />
  ) : (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <Placeholder kind="audio" compact />
      {controls && <audio className="w-full" src={src} controls />}
    </div>
  );
}
export default function AssetsPanel({
  base,
  data,
  scene,
  selected,
  onSelect,
  run,
}: {
  base: string;
  data: any;
  scene: string;
  selected: string;
  onSelect: (name: string) => void;
  run: (a: () => Promise<any>, m?: string) => Promise<any>;
}) {
  const [type, setType] = useState("all"),
    [status, setStatus] = useState("all"),
    [query, setQuery] = useState(""),
    [importOpen, setImportOpen] = useState(false),
    [files, setFiles] = useState<File[]>([]),
    [addTake, setAddTake] = useState(false),
    [generate, setGenerate] = useState(false),
    [structured, setStructured] = useState(""),
    [json, setJson] = useState("");
  const filtered = data.assets.filter(
    (a: any) =>
      (type === "all" || a.kind === type) &&
      (scene === "all" ||
        a.scene === scene ||
        (Array.isArray(a.scenes) && a.scenes.includes(scene))) &&
      `${a.asset_name} ${a.display_name || ""} ${a.description || ""}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (status === "all" ||
        assetState(a, data.takes.some((t: any) => t.asset_name === a.asset_name)) === status),
  );
  const assetsWithMedia = new Set(data.takes.map((t: any) => t.asset_name));
  return (
    <div className="assets-workspace flex min-h-0 flex-1 flex-col">
      <div className="panel-toolbar flex shrink-0 flex-wrap items-center gap-2 border-b px-6 py-3">
        <span className="mr-auto font-medium">
          资产库{" "}
          <span className="ml-2 text-xs text-muted-foreground">
            {data.assets.length} 项资产 · {data.assets.filter((a: any) => assetsWithMedia.has(a.asset_name)).length} 项已有素材
          </span>
        </span>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setStructured("inventory");
            setJson('{"assets": []}');
          }}
        >
          <FileJson />
          导入清单
        </Button>
        <Button size="sm" variant="outline" onClick={() => setImportOpen(true)}>
          <Upload />
          导入媒体
        </Button>
        <Button size="sm" onClick={() => setGenerate(true)}>
          <Plus />
          生成批次
        </Button>
      </div>
      <div className="panel-toolbar flex shrink-0 flex-wrap items-center gap-2 px-6 py-3">
        <div className="relative mr-auto min-w-36 flex-1">
          <Search
            size={14}
            className="absolute left-3 top-3 text-muted-foreground"
          />
          <Input
            className="pl-9"
            aria-label="搜索资产"
            placeholder="搜索资产名称"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Select
          className="w-28"
          aria-label="素材类型"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="all">全部类型</option>
          <option value="image">图片</option>
          <option value="video">视频</option>
          <option value="audio">音频</option>
        </Select>
        <Select
          className="w-28"
          aria-label="资产状态筛选"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all">全部状态</option>
          <option value="pending">待定</option>
          <option value="draft">草稿</option>
          <option value="accepted">已接受</option>
        </Select>
      </div>
      <div className="panel-scroll min-h-0 flex-1 overflow-auto px-6 pb-6">
        {filtered.length ? (
          <div className="asset-grid grid gap-4">
            {filtered.map((asset: any) => {
              const takes = data.takes.filter(
                  (t: any) => t.asset_name === asset.asset_name,
                ),
                take =
                  takes.find(
                    (t: any) => t.take_id === asset.selected_take_id,
                  ) || takes.at(-1);
              return (
                <button
                  key={asset.asset_name}
                  className={cn(
                    "asset-card group min-w-0 overflow-hidden rounded-2xl border bg-card text-left transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-ring",
                    selected === asset.asset_name && "ring-2 ring-foreground",
                  )}
                  onClick={() => onSelect(asset.asset_name)}
                >
                  <div className="relative flex aspect-video items-center justify-center overflow-hidden bg-muted/50">
                    {take ? (
                      <Media base={base} take={take} controls={false} />
                    ) : (
                      <Placeholder kind={asset.kind === "video" ? "video" : asset.kind === "audio" ? "audio" : "image"} />
                    )}
                  </div>
                  <div className="space-y-2 p-3">
                    <div
                      className="truncate text-sm font-medium"
                      title={asset.asset_name}
                    >
                      {asset.display_name || asset.asset_name}
                    </div>
                    {typeof asset.description === "string" && (
                      <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">
                        {asset.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {takes.length} {asset.kind === "image" ? "张图片" : asset.kind === "video" ? "段视频" : "段音频"} · {asset.scene || "共享参考"}
                      </span>
                    </div>
                    <AssetStatus status={assetState(asset, takes.length > 0)} />
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <EmptyState kind={data.assets.length ? "search" : "image"} title={data.assets.length ? "没有匹配的资产" : "暂无素材"}
            description={scene !== "all" ? `${scene} · 可切换场景或调整筛选` : undefined}>
            {data.assets.length && (query || type !== "all" || status !== "all") ? <Button variant="outline" onClick={() => { setQuery(""); setType("all"); setStatus("all"); }}>清除筛选</Button> :
            <Button
              variant="outline"
              onClick={() => setImportOpen(true)}
            >
              <Upload />
              导入媒体
            </Button>}
          </EmptyState>
        )}
      </div>
      <Dialog
        open={importOpen}
        onOpenChange={setImportOpen}
        title="导入本地媒体"
        description="复制到项目目录，保留原文件与名称。"
      >
        <div className="space-y-4">
          <Input
            type="file"
            multiple
            accept="image/*,video/*,audio/*"
            onChange={(e) => setFiles(Array.from(e.target.files || []))}
          />
          <p className="text-xs text-muted-foreground">
            Scene：{scene === "all" ? "共享资产" : scene}
          </p>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={addTake}
              onChange={(e) => setAddTake(e.target.checked)}
            />
            同名素材添加为已有资产的新版本
          </label>
          <ul className="max-h-40 overflow-auto text-xs">
            {files.map((f) => (
              <li key={f.name} className="py-1">
                {f.name}
              </li>
            ))}
          </ul>
          <Button
            disabled={!files.length}
            onClick={() =>
              run(async () => {
                const failed: File[] = [],
                  messages: string[] = [];
                for (const file of files) {
                  const form = new FormData();
                  form.append(
                    "metadata",
                    pretty({
                      scene: scene === "all" ? "" : scene,
                      add_take: addTake,
                    }),
                  );
                  form.append("file", file, file.name);
                  try {
                    await api(`${base}/import`, { method: "POST", body: form });
                  } catch (error) {
                    failed.push(file);
                    messages.push(
                      `${file.name}：${error instanceof Error ? error.message : String(error)}`,
                    );
                  }
                }
                setFiles(failed);
                if (failed.length)
                  throw new Error(
                    `已导入 ${files.length - failed.length} 项，失败文件保留供重试。${messages.join("；")}`,
                  );
                setImportOpen(false);
                setFiles([]);
              }, "媒体已校验并归档")
            }
          >
            导入 {files.length || ""} 个文件
          </Button>
        </div>
      </Dialog>
      <Dialog
        open={!!structured}
        onOpenChange={(o) => !o && setStructured("")}
        title="导入结构化资产清单"
        description="新增名称将在此确认；同名资产不会覆盖。"
      >
        <Textarea
          aria-label="资产清单 JSON"
          className="min-h-64 font-mono text-xs"
          value={json}
          onChange={(e) => setJson(e.target.value)}
        />
        <Button
          className="mt-4"
          onClick={() =>
            run(async () => {
              await post(`${base}/${structured}`, JSON.parse(json));
              setStructured("");
            }, "清单已保存")
          }
        >
          确认清单并导入
        </Button>
      </Dialog>
      <GenerationDialog
        open={generate}
        onOpenChange={setGenerate}
        base={base}
        data={data}
        scene={scene}
        selected={selected}
        run={run}
      />
    </div>
  );
}

export function GenerationDialog({
  open,
  onOpenChange,
  base,
  data,
  scene,
  selected = "",
  initialPrompt,
  envelope,
  run,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  base: string;
  data: any;
  scene: string;
  selected?: string;
  initialPrompt?: string;
  envelope?: any;
  run: (a: () => Promise<any>, m?: string) => Promise<any>;
}) {
  const [models, setModels] = useState<any[]>([]),
    [kind, setKind] = useState("image"),
    [model, setModel] = useState(""),
    [name, setName] = useState(""),
    [prompt, setPrompt] = useState(""),
    [duration, setDuration] = useState(5),
    [ratio, setRatio] = useState("16:9"),
    [payment, setPayment] = useState("unlim"),
    [refId, setRefId] = useState(""),
    [role, setRole] = useState("image"),
    [references, setReferences] = useState<any[]>([]),
    [extra, setExtra] = useState("{}"),
    [fromBoard, setFromBoard] = useState(false),
    [review, setReview] = useState<any>(null);
  const [requirements, setRequirements] = useState<any>(null),
    [modelError, setModelError] = useState("");
  useEffect(() => {
    let active = true;
    setRequirements(null);
    setModelError("");
    if (open && model)
      void api(`${base}/models/${encodeURIComponent(model)}`)
        .then((value) => {
          if (active) setRequirements(value);
        })
        .catch((error) => {
          if (active) setModelError(error.message);
        });
    return () => {
      active = false;
    };
  }, [open, model, base]);
  useEffect(() => {
    if (open && envelope) {
      setKind("video");
      setName(envelope.asset_name);
      setPrompt(envelope.prompt);
      setDuration(Math.ceil(envelope.duration_seconds));
      setModel("");
      setFromBoard(false);
      setReview(null);
      setReferences([]);
      return;
    }
    if (open && selected) {
      const selectedAsset = data.assets.find(
        (a: any) => a.asset_name === selected,
      );
      if (selectedAsset) {
        setKind(selectedAsset.kind === "audio" ? "image" : selectedAsset.kind);
        setName(selected);
        setPrompt(initialPrompt ?? selectedAsset.prompt ?? "");
        setModel("");
        setFromBoard(false);
        setReview(null);
        setReferences([]);
        setExtra("{}");
        setRefId("");
      }
    }
  }, [open, selected, envelope?.id]);
  const actualName = name || selected,
    asset = data.assets.find((a: any) => a.asset_name === actualName);
  return (
    <Dialog
      wide
      open={open}
      onOpenChange={onOpenChange}
      title={review ? "确认生成批次" : "准备生成批次"}
      description={
        review
          ? "确认以下文件名、Prompt、模型、参考和用量方式后提交整批。"
          : "模型目录通过当前 Higgsfield MCP 读取。素材结果归档到本机。"
      }
    >
      {review ? (
        <div className="space-y-4">
          <BatchReview request={review.request} />
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() =>
                run(async () => {
                  await post(`${base}/batches/${review.batch_id}/cancel`);
                  setReview(null);
                })
              }
            >
              返回修改
            </Button>
            <Button
              onClick={() =>
                run(async () => {
                  await post(`${base}/batches/${review.batch_id}/approve`, {
                    sha256: review.sha256,
                  });
                  setReview(null);
                  onOpenChange(false);
                }, "批次已确认，任务会在后台持续运行")
              }
            >
              确认名称与参数，提交整批
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="素材类型">
              <Select
                disabled={!!envelope}
                value={kind}
                onChange={(e) => {
                  setKind(e.target.value);
                  setModel("");
                }}
              >
                <option value="image">图片 / 参考资产</option>
                <option value="video">镜头视频</option>
              </Select>
            </Field>
            <Field label="标准文件名主干">
              <Input
                readOnly={!!envelope}
                value={actualName}
                onChange={(e) => setName(e.target.value)}
                placeholder="@char_Name 或已确认的视频文件名"
              />
            </Field>
          </div>
          <div className="flex items-end gap-3">
            <Field label="生成模型">
              <Select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="min-w-64"
              >
                <option value="">选择当前可用模型</option>
                {models
                  .filter((m) => m.output_type === kind)
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} · {m.id}
                    </option>
                  ))}
              </Select>
            </Field>
            <Button
              variant="outline"
              onClick={() =>
                run(async () => {
                  setModels(await api(`${base}/models`));
                }, "已读取当前模型目录")
              }
            >
              读取模型目录
            </Button>
          </div>
          {modelError && (
            <p className="text-sm text-destructive">{modelError}</p>
          )}
          {requirements && (
            <details className="rounded-md border p-3">
              <summary className="cursor-pointer text-sm">
                {requirements.name} · 当前参数与参考规则
              </summary>
              <pre className="mt-3 max-h-60 overflow-auto text-xs leading-5">
                {pretty({
                  aspect_ratios: requirements.aspect_ratios,
                  parameters: requirements.parameters,
                  medias: requirements.medias,
                })}
              </pre>
            </details>
          )}
          <div className="grid grid-cols-3 gap-3">
            <Field label="画幅">
              <Input value={ratio} onChange={(e) => setRatio(e.target.value)} />
            </Field>
            <Field label="时长（秒）">
              <Input
                type="number"
                min={1}
                value={duration}
                disabled={kind === "image"}
                onChange={(e) => setDuration(Number(e.target.value))}
              />
            </Field>
            <Field label="用量方式">
              <Select
                value={payment}
                onChange={(e) => setPayment(e.target.value)}
              >
                <option value="unlim">仅 Unlim（不可用则停止）</option>
                <option value="credits">使用 credits</option>
              </Select>
            </Field>
          </div>
          <Field label="生成 Prompt">
            <Textarea
              className="min-h-40"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="仅填写影响生成结果的内容，保留真实附件 tag。"
            />
          </Field>
          <div className="rounded-lg border p-3">
            <p className="mb-2 text-sm font-medium">参考素材与角色</p>
            <div className="flex flex-wrap gap-2">
              <Select
                className="min-w-48 flex-1"
                value={refId}
                onChange={(e) => setRefId(e.target.value)}
              >
                <option value="">选择已上传或已生成的素材</option>
                {data.takes
                  .filter(
                    (t: any) => t.external?.media_id || t.external?.job_id,
                  )
                  .map((t: any) => (
                    <option key={t.take_id} value={t.take_id}>
                      {t.filename} · {t.take_id.slice(0, 6)}
                    </option>
                  ))}
              </Select>
              <Select
                className="w-36"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                {[
                  "image",
                  "start_image",
                  "end_image",
                  "video",
                  "audio",
                  "ref_element",
                ].map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </Select>
              <Button
                variant="outline"
                disabled={!refId}
                onClick={() => {
                  const t = data.takes.find((t: any) => t.take_id === refId);
                  setReferences([
                    ...references,
                    { role, value: t.external.media_id || t.external.job_id },
                  ]);
                }}
              >
                添加
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              本地素材可在右侧详情中上传。角色由你明确指定。
            </p>
            {references.length > 0 && (
              <pre className="mt-2 text-xs">
                {pretty(references)}
                <button
                  className="ml-3 underline"
                  onClick={() => setReferences([])}
                >
                  清空
                </button>
              </pre>
            )}
          </div>
          <details>
            <summary className="cursor-pointer text-sm">
              模型扩展参数（JSON）
            </summary>
            <Textarea
              className="mt-2 font-mono text-xs"
              value={extra}
              onChange={(e) => setExtra(e.target.value)}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              例如 mode、resolution；核心 Prompt、模型和支付方式以表单为准。
            </p>
          </details>
          {kind === "video" && data.storyboard && !envelope && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={fromBoard}
                onChange={(e) => setFromBoard(e.target.checked)}
              />
              按当前分镜的全部 Envelopes 准备视频（生成时长向上取整到秒）
            </label>
          )}
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {asset ? "为已有资产添加新版本，保留旧版本" : "新增名称在下一步确认"} ·
              不创建云项目
            </p>
            <Button
              disabled={
                !model || (!fromBoard && (!actualName || !prompt.trim()))
              }
              onClick={() =>
                run(async () => {
                  const params = {
                    ...JSON.parse(extra),
                    model,
                    aspect_ratio: ratio,
                    use_unlim: payment === "unlim",
                    count: 1,
                    ...(kind === "video" ? { duration } : {}),
                    ...(references.length ? { medias: references } : {}),
                  };
                  const items =
                    fromBoard && kind === "video"
                      ? data.storyboard.envelopes.map((env: any) => ({
                          asset_name: env.asset_name,
                          scene: env.scene,
                          envelope_id: env.id,
                          kind,
                          prompt: env.prompt,
                          params: {
                            ...params,
                            duration: Math.ceil(env.duration_seconds),
                          },
                          add_take: !!data.assets.find(
                            (a: any) => a.asset_name === env.asset_name,
                          ),
                        }))
                      : [
                          {
                            asset_name: actualName,
                            scene: scene === "all" ? "" : scene,
                            ...(envelope ? { envelope_id: envelope.id } : {}),
                            kind,
                            prompt,
                            params,
                            add_take: !!asset,
                          },
                        ];
                  setReview(
                    await post(`${base}/batches`, {
                      items,
                      destination: "none",
                    }),
                  );
                })
              }
            >
              <Sparkles />
              查看整批方案
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
}
