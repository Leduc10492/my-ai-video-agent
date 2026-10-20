import { useRef, useState } from "react";
import {
  ArrowRight,
  FileJson,
  Plus,
  Search,
  Sparkles,
  Upload,
  Clock3,
  Layers3,
} from "lucide-react";
import {
  Badge,
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
import {
  boardContent,
  boardRows,
  shotKey,
  shotStatus,
  shotTake,
  type Board,
  type ShotSelection,
} from "./lib/storyboard";
import { Media } from "./AssetsPanel";

export default function StoryboardPanel({
  base,
  data,
  scene,
  selection,
  onSelect,
  onStage,
  onTimeline,
  run,
}: {
  base: string;
  data: any;
  scene: string;
  selection: ShotSelection | null;
  onSelect: (selection: ShotSelection) => void;
  onStage: (stage: string) => void;
  onTimeline: (envelopeId?: string) => void;
  run: (a: () => Promise<any>, m?: string) => Promise<any>;
}) {
  const [query, setQuery] = useState(""),
    [filter, setFilter] = useState("all"),
    [importOpen, setImportOpen] = useState(false),
    [importText, setImportText] = useState(""),
    [candidate, setCandidate] = useState<Board | null>(null),
    [importError, setImportError] = useState(""),
    [source, setSource] = useState(""),
    [importHash, setImportHash] = useState<string | null>(null),
    [addOpen, setAddOpen] = useState(false),
    [newScene, setNewScene] = useState("scene-001"),
    [rowId, setRowId] = useState(""),
    [envelopeId, setEnvelopeId] = useState(""),
    [filename, setFilename] = useState(""),
    [title, setTitle] = useState(""),
    [duration, setDuration] = useState("5");
  const fileRef = useRef<HTMLInputElement>(null),
    addSnapshot = useRef<Board | null>(null);
  const board: Board | null = data.storyboard,
    rows = boardRows(board),
    outputs = data.outputs.filter((o: any) =>
      /\/storyboard(?:_v\d+)?\.json$/.test(o.path),
    );
  const filtered = rows.filter(
    (row) =>
      (scene === "all" || row.shot.scene === scene) &&
      `${row.shot.id} ${row.shot.title || ""} ${row.shot.description || ""} ${row.envelope.asset_name} ${row.envelope.prompt}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (filter === "all" || shotStatus(data, row.envelope) === filter),
  );
  const scenes = [...new Set(filtered.map((row) => row.shot.scene))];
  const adopted = (board?.envelopes || []).filter(
    (e) => shotStatus(data, e) === "已采用",
  ).length;
  const inspectImport = (text: string) => {
    setImportText(text);
    setCandidate(null);
    setImportError("");
    try {
      const value = JSON.parse(text);
      if (
        !value ||
        !Array.isArray(value.envelopes) ||
        !value.envelopes.length ||
        value.envelopes.some(
          (e: any) =>
            !e ||
            typeof e.id !== "string" ||
            typeof e.scene !== "string" ||
            typeof e.asset_name !== "string" ||
            typeof e.prompt !== "string" ||
            !Number.isFinite(e.duration_seconds) ||
            e.duration_seconds <= 0 ||
            !Array.isArray(e.source_rows) ||
            !e.source_rows.length ||
            e.source_rows.some((r: unknown) => typeof r !== "string"),
        )
      )
        throw new Error(
          "请选择包含 Scene、Shot Row 和 Prompt Envelope 的分镜 JSON。",
        );
      if (
        value.shots !== undefined &&
        (!Array.isArray(value.shots) ||
          value.shots.some(
            (s: any) =>
              !s ||
              typeof s.id !== "string" ||
              typeof s.scene !== "string" ||
              ["title", "description", "camera", "sound"].some(
                (k) => s[k] !== undefined && typeof s[k] !== "string",
              ) ||
              (s.references !== undefined &&
                (!Array.isArray(s.references) ||
                  s.references.some((r: unknown) => typeof r !== "string"))),
          ))
      )
        throw new Error(
          "镜头详情格式有误，请检查 shots 中的文字与参考文件名。",
        );
      setCandidate(value);
    } catch (e) {
      setImportError(e instanceof Error ? e.message : String(e));
    }
  };
  return (
    <div className="board-workspace flex min-h-0 flex-1 flex-col">
      <div className="panel-toolbar flex shrink-0 flex-wrap items-center justify-between gap-3 px-6 py-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-semibold">分镜</h2>
            {board?.output_status === "text_only_draft" && (
              <Badge>草案 · 待审阅</Badge>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {rows.length} 镜 · {board?.envelopes.length || 0} 片段 ·{" "}
            {adopted} 已采用
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setImportHash(board?.sha256 || null);
              setImportOpen(true);
              setCandidate(null);
              setSource("");
              setImportText("");
              setImportError("");
            }}
          >
            <Upload />
            载入分镜
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              addSnapshot.current = board ? structuredClone(board) : null;
              setNewScene(scene === "all" ? "scene-001" : scene);
              setRowId("");
              setEnvelopeId("");
              setFilename("");
              setTitle("");
              setAddOpen(true);
            }}
          >
            <Plus />
            添加镜头
          </Button>
          <Button
            onClick={() => onStage(rows.length ? "prompts" : "storyboard")}
          >
            <Sparkles />
            {rows.length ? "编译 Prompt" : "制作分镜"}
          </Button>
        </div>
      </div>
      {typeof board?.planning_notes === "string" && board.planning_notes && (
        <details className="board-notes mx-6 mb-3 shrink-0 rounded-xl border bg-card px-3 py-2 text-xs text-muted-foreground">
          <summary className="cursor-pointer">分镜备注</summary>
          <p className="mt-2 max-h-28 overflow-auto whitespace-pre-wrap leading-6">{board.planning_notes}</p>
        </details>
      )}
      <div className="board-filters mx-6 flex shrink-0 flex-wrap items-center gap-2">
        <div className="relative min-w-36 flex-1">
          <Search
            className="absolute left-3 top-3 text-muted-foreground"
            size={15}
          />
          <Input
            className="bg-card pl-9 shadow-none"
            aria-label="搜索分镜"
            placeholder="搜索镜头"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Select
          className="w-36"
          aria-label="分镜状态"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">全部制作状态</option>
          {[
            "待编译",
            "Prompt 就绪",
            "待确认批次",
            "生成中",
            "待选 take",
            "已采用",
            "需处理",
          ].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </Select>
        <Button variant="ghost" onClick={() => onTimeline()}>
          <Layers3 />
          时间轴
        </Button>
      </div>
      <div className="panel-scroll min-h-0 flex-1 overflow-auto px-6 pb-6 pt-5">
        {!filtered.length ? (
          <EmptyState kind={rows.length ? "search" : "video"} title={rows.length ? "没有匹配的镜头" : "暂无分镜"}
            description={scene !== "all" ? `${scene} · 可切换场景或调整筛选` : undefined}>
            {!!rows.length && (query || filter !== "all") && <Button variant="outline" onClick={() => { setQuery(""); setFilter("all"); }}>清除筛选</Button>}
            {!rows.length && (
              <Button
                variant="outline"
                onClick={() => onStage("storyboard")}
              >
                <Sparkles />
                制作分镜
              </Button>
            )}
          </EmptyState>
        ) : (
          scenes.map((label) => (
            <section className="mb-8" key={label}>
              <div className="mb-4 flex items-center gap-3">
                <span className="h-5 w-1 rounded-full bg-foreground" />
                <h3 className="text-sm font-semibold">{label}</h3>
                <span className="text-xs text-muted-foreground">
                  {filtered.filter((r) => r.shot.scene === label).length} 镜
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="shot-grid grid gap-4">
                {filtered
                  .filter((r) => r.shot.scene === label)
                  .map((row, index) => {
                    const take = shotTake(data, row.envelope),
                      state = shotStatus(data, row.envelope),
                      active =
                        selection &&
                        shotKey(selection.scene, selection.rowId) === row.key;
                    return (
                      <button
                        key={row.key}
                        onClick={() => onSelect(row.selection)}
                        aria-label={`打开镜头 ${row.shot.id}`}
                        className={cn(
                          "shot-card group min-w-0 overflow-hidden rounded-2xl border bg-card text-left shadow-xs transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          active && "border-foreground ring-1 ring-foreground",
                        )}
                      >
                        <div className="relative aspect-video overflow-hidden bg-muted/70">
                          {take ? (
                            <Media base={base} take={take} controls={false} />
                          ) : (
                            <Placeholder kind="video" className="h-full w-full" />
                          )}
                          <span className="absolute left-3 top-3 rounded-lg border bg-background/95 px-2.5 py-1 text-xs font-medium">
                            {row.shot.id}
                          </span>
                          <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-lg bg-background/95 px-2 py-1 text-xs">
                            <Clock3 size={11} />
                            {row.envelope.duration_seconds}s
                            {row.envelope.source_rows.length > 1
                              ? " / 整段"
                              : ""}
                          </span>
                        </div>
                        <div className="space-y-3 p-4">
                          <div className="flex items-start gap-2">
                            <h4 className="min-w-0 flex-1 truncate text-sm font-semibold">
                              {row.shot.title || `镜头 ${row.shot.id}`}
                            </h4>
                            <ArrowRight
                              size={15}
                              className="mt-0.5 text-muted-foreground transition-transform group-hover:translate-x-1"
                            />
                          </div>
                          <p className="line-clamp-2 min-h-10 text-xs leading-5 text-muted-foreground">
                            {row.shot.description ||
                              (row.envelope.prompt
                                ? `Prompt 摘要：${row.envelope.prompt}`
                                : "暂无画面描述")}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge
                              className={
                                state === "已采用"
                                  ? "bg-foreground text-background"
                                  : "bg-muted/60 border-transparent"
                              }
                            >
                              {state}
                            </Badge>
                            <span className="ml-auto text-xs text-muted-foreground">
                              {row.envelope.id}
                              {row.envelope.source_rows.length > 1 &&
                                " · 多镜头"}
                            </span>
                          </div>
                          <p
                            className="sr-only"
                            title={row.envelope.asset_name}
                          >
                            {row.envelope.asset_name}
                          </p>
                        </div>
                      </button>
                    );
                  })}
              </div>
            </section>
          ))
        )}
      </div>
      <Dialog
        wide
        open={importOpen}
        onOpenChange={setImportOpen}
        title="载入分镜"
        description="先查看工作流产物，再保存为新的分镜版本。已保存的剪辑保持独立。"
      >
        <div className="space-y-5">
          <div className="flex flex-wrap gap-3">
            <Select
              className="min-w-48 flex-1"
              aria-label="工作流分镜产物"
              value={source}
              onChange={(e) => {
                const value = e.target.value;
                setSource(value);
                if (value)
                  void run(async () => {
                    const out = await api(
                      `${base}/output?path=${encodeURIComponent(value)}`,
                    );
                    inspectImport(out.content);
                  });
              }}
            >
              <option value="">选择已保存的 Skill 分镜产物</option>
              {outputs.map((o: any) => (
                <option key={o.path} value={o.path}>
                  {o.path}
                </option>
              ))}
            </Select>
            <Button variant="outline" onClick={() => fileRef.current?.click()}>
              <Upload />
              选择 JSON 文件
            </Button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".json"
            aria-label="导入分镜文件"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (f)
                void f
                  .text()
                  .then(inspectImport)
                  .catch((e) => setImportError(e.message));
            }}
          />
          {!outputs.length && (
            <p className="text-sm text-muted-foreground">
              尚无已保存的结构化产物。分镜 Skill
              完成后，在任务面板审阅并保存，即可在这里载入。
            </p>
          )}
          <details>
            <summary className="cursor-pointer text-sm text-muted-foreground">
              高级：粘贴或查看 JSON
            </summary>
            <Textarea
              className="mt-3 min-h-48 font-mono text-xs"
              aria-label="分镜 JSON"
              value={importText}
              onChange={(e) => inspectImport(e.target.value)}
            />
          </details>
          {importError && (
            <p role="alert" className="text-sm text-destructive">
              {importError}
            </p>
          )}
          {candidate && (
            <div className="max-h-80 overflow-auto rounded-xl border">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted">
                  <tr>
                    {["Scene / 镜头", "画面", "生成片段", "计划时长"].map(
                      (t) => (
                        <th key={t} className="p-3 font-medium">
                          {t}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {boardRows(candidate).map((r) => (
                    <tr key={r.key} className="border-t">
                      <td className="p-3">
                        {r.shot.scene}
                        <br />
                        {r.shot.id}
                      </td>
                      <td className="max-w-72 p-3">
                        {r.shot.title || r.shot.description || "未提供画面描述"}
                      </td>
                      <td className="break-all p-3">
                        {r.envelope.id}
                        <p className="text-xs text-muted-foreground">
                          {r.envelope.asset_name}
                        </p>
                      </td>
                      <td className="p-3">{r.envelope.duration_seconds}s</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex justify-end">
            <Button
              disabled={!candidate}
              onClick={() =>
                run(async () => {
                  await post(`${base}/storyboard`, {
                    ...boardContent(candidate!),
                    expected_sha256: importHash,
                  });
                  setImportOpen(false);
                }, "分镜已载入，历史版本保留")
              }
            >
              <FileJson />
              确认载入分镜
            </Button>
          </div>
        </div>
      </Dialog>
      <Dialog
        open={addOpen}
        onOpenChange={setAddOpen}
        title="添加镜头"
        description="新镜头对应一个生成片段。文件名确认后固定，后续生成沿用此名称。"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Scene">
              <Input
                value={newScene}
                onChange={(e) => setNewScene(e.target.value)}
                placeholder="scene-001"
              />
            </Field>
            <Field label="Shot Row">
              <Input
                value={rowId}
                onChange={(e) => setRowId(e.target.value)}
                placeholder="S001"
              />
            </Field>
          </div>
          <Field label="镜头标题">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="这一镜要表达什么"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Prompt Envelope">
              <Input
                value={envelopeId}
                onChange={(e) => setEnvelopeId(e.target.value)}
                placeholder="P001"
              />
            </Field>
            <Field label="计划时长（秒）">
              <Input
                type="number"
                min="0.1"
                max="300"
                step="0.1"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </Field>
          </div>
          <Field
            label="标准文件名主干"
            hint="按项目命名规则填写，不包含扩展名。保留大小写、@、下划线和连字符。"
          >
            <Input
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="scene-001_P001"
            />
          </Field>
          <Button
            className="w-full"
            disabled={!rowId.trim() || !envelopeId.trim() || !filename.trim()}
            onClick={() =>
              run(async () => {
                const current = addSnapshot.current,
                  content = boardContent(current || { envelopes: [] });
                const env = {
                  id: envelopeId,
                  scene: newScene,
                  asset_name: filename,
                  duration_seconds: Number(duration),
                  source_rows: [rowId],
                  prompt: "",
                  markers: [],
                };
                await post(`${base}/storyboard`, {
                  ...content,
                  envelopes: [...content.envelopes, env],
                  shots: [
                    ...(content.shots || []),
                    { id: rowId, scene: newScene, title },
                  ],
                  expected_sha256: current?.sha256 || null,
                });
                setAddOpen(false);
              }, "镜头已添加，可继续编辑详情")
            }
          >
            确认名称并添加
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
