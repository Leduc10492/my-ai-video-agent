import { useEffect, useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import {
  Check,
  SlidersHorizontal,
  Workflow,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
} from "lucide-react";
import {
  Badge,
  Button,
  Dialog,
  Field,
  Input,
  Select,
  cn,
} from "./components/ui";
import { api, post } from "./lib/api";

type Candidate = {
  candidate_id: string;
  name: string;
  description: string;
  path: string;
  source: string;
  enabled: boolean;
  plugin_id?: string;
  original_path?: string;
  source_sha256?: string;
};
type Stage = {
  slot: string;
  label: string;
  description: string;
  contract: string;
  current: any;
};
type Catalog = {
  registry_sha256: string;
  stages: Stage[];
  candidates: Candidate[];
  busy: boolean;
  discovery_errors: any[];
};
const sources: Record<string, string> = {
  local: "本地安装",
  project: "当前项目",
  snapshot: "项目固定版本",
  plugin: "已安装插件",
  system: "系统内置",
};
const tabsClass =
  "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-muted-foreground data-[state=active]:bg-background data-[state=active]:font-medium data-[state=active]:text-foreground data-[state=active]:shadow-sm";

function SkillsSettings({
  base,
  onSaved,
}: {
  base: string;
  onSaved: () => Promise<void>;
}) {
  const [catalog, setCatalog] = useState<Catalog | null>(null),
    [draft, setDraft] = useState<Record<string, string>>({});
  const [stageKey, setStageKey] = useState("script.primary"),
    [query, setQuery] = useState(""),
    [source, setSource] = useState("all");
  const [checking, setChecking] = useState(false),
    [saving, setSaving] = useState(false),
    [loading, setLoading] = useState(true);
  const [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [review, setReview] = useState<any>(null);
  useEffect(() => {
    let cancelled = false;
    api<Catalog>(`${base}/skills/settings`)
      .then((value) => {
        if (!cancelled) setCatalog(value);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [base]);
  const reload = async () => {
    setLoading(true);
    setError("");
    setReview(null);
    try {
      setCatalog(await api(`${base}/skills/settings?refresh=1`));
      setDraft({});
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };
  const stage = catalog?.stages.find((s) => s.slot === stageKey);
  const selectedId = draft[stageKey] || stage?.current?.candidate_id;
  const selected = catalog?.candidates.find(
    (c) => c.candidate_id === selectedId,
  );
  const selectedChecked = review?.reports?.some(
    (r: any) =>
      r.slot === stageKey &&
      r.candidate.candidate_id === selectedId &&
      r.status === "ready",
  );
  const selectionStatus = !draft[stageKey]
    ? "当前使用"
    : selectedChecked
      ? "检查通过，待保存"
      : "已选择，尚未生效";
  const changes = Object.entries(draft).map(([slot, candidate_id]) => ({
    slot,
    candidate_id,
  }));
  const choose = (candidate: Candidate) => {
    setDraft((prev) => {
      const next = { ...prev };
      if (candidate.candidate_id === stage?.current?.candidate_id)
        delete next[stageKey];
      else next[stageKey] = candidate.candidate_id;
      return next;
    });
    setReview(null);
    setNotice("");
    setError("");
  };
  const check = async () => {
    setChecking(true);
    setError("");
    setNotice("");
    setReview(null);
    try {
      setReview(
        await post(`${base}/skills/check`, {
          expected_sha256: catalog!.registry_sha256,
          changes,
        }),
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setChecking(false);
    }
  };
  const save = async () => {
    setSaving(true);
    setError("");
    try {
      await api(`${base}/skills/settings`, {
        method: "PUT",
        body: JSON.stringify({
          expected_sha256: catalog!.registry_sha256,
          changes,
          check_sha256: review.check_sha256,
        }),
      });
      // A successful registry write remains successful even if refreshing the catalog later fails.
      setNotice("已保存到当前项目，新任务将使用这份配置。");
      setDraft({});
      setReview(null);
      await onSaved();
      setCatalog(await api(`${base}/skills/settings?refresh=1`));
    } catch (e) {
      setReview(null);
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };
  const options = (catalog?.candidates || []).filter(
    (c) =>
      (source === "all" || c.source === source) &&
      `${c.name} ${c.description}`.toLowerCase().includes(query.toLowerCase()),
  );
  const busy = checking || saving || loading;
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-start justify-between gap-4 px-6 pb-4 pt-5">
        <div>
          <h3 className="font-semibold">Skills</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            为每个阶段选择本机已安装的 Skill。
          </p>
        </div>
        <Button variant="outline" size="sm" disabled={busy} onClick={reload}>
          <RefreshCw size={14} />
          重新载入
        </Button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-5 [scrollbar-gutter:stable]">
        <div className="space-y-4">
          {error && (
            <p
              role="alert"
              className="rounded-xl border border-destructive/30 p-3 text-sm text-destructive"
            >
              {error}
            </p>
          )}
          {notice && (
            <p
              role="status"
              className="flex items-center gap-2 rounded-xl border bg-muted/40 p-3 text-sm"
            >
              <Check size={16} />
              {notice}
            </p>
          )}
          {loading ? (
            <div
              role="status"
              className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground"
            >
              <Loader2 className="animate-spin" size={16} />
              正在读取本机 Skill…
            </div>
          ) : (
            catalog && (
              <>
                {catalog.discovery_errors.length > 0 && (
                  <details className="rounded-xl border p-3 text-xs">
                    <summary>
                      有 {catalog.discovery_errors.length} 个 Skill 未能正常发现
                    </summary>
                    {catalog.discovery_errors.map((e, i) => (
                      <p key={i} className="mt-2 break-all">
                        {e.path} · {e.message}
                      </p>
                    ))}
                  </details>
                )}
                <div className="space-y-4">
                  <nav
                    aria-label="Skill 工作流阶段"
                    className="grid grid-cols-3 gap-1 rounded-xl bg-muted/60 p-1 lg:grid-cols-6"
                  >
                    {catalog.stages.map((s) => (
                      <button
                        key={s.slot}
                        aria-pressed={stageKey === s.slot}
                        disabled={!s.current || busy}
                        onClick={() => {
                          setStageKey(s.slot);
                          setQuery("");
                        }}
                        className={cn(
                          "rounded-lg px-2 py-2.5 text-center text-xs text-muted-foreground hover:bg-background/70 disabled:opacity-40",
                          stageKey === s.slot &&
                            "bg-background font-medium text-foreground shadow-sm",
                        )}
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block">
                            {s.label}
                            {draft[s.slot] && (
                              <span className="ml-1 text-xs">· 待保存</span>
                            )}
                          </span>
                        </span>
                      </button>
                    ))}
                  </nav>
                  <div className="min-w-0 space-y-3 rounded-2xl border p-4">
                    <div>
                      <h3 className="font-medium">{stage?.label}</h3>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {stage?.description}
                      </p>
                    </div>
                    {selected && (
                      <div className="rounded-xl bg-muted/50 p-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium">
                            {selected.name}
                          </span>
                          <Badge>{selectionStatus}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {sources[selected.source]}
                          </span>
                        </div>
                        <p className="mt-2 text-xs leading-5 text-muted-foreground">
                          {selected.description}
                        </p>
                        <details className="mt-2 text-xs text-muted-foreground">
                          <summary className="cursor-pointer">
                            来源与阶段接口
                          </summary>
                          <p className="mt-2 break-all font-mono">
                            {selected.path}
                          </p>
                          {selected.original_path && (
                            <p className="mt-2 break-all">
                              原安装：{selected.original_path}
                              <span className="mt-1 block font-mono">
                                源文件 SHA-256：{selected.source_sha256}
                              </span>
                            </p>
                          )}
                          <p className="mt-2 leading-5">{stage?.contract}</p>
                        </details>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <div className="relative min-w-0 flex-1">
                        <Search
                          size={15}
                          className="absolute left-3 top-3 text-muted-foreground"
                        />
                        <Input
                          aria-label="搜索本地 Skill"
                          placeholder="搜索名称或用途…"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                      <Select
                        aria-label="Skill 来源"
                        className="w-32"
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                      >
                        <option value="all">全部来源</option>
                        {Object.entries(sources).map(([k, v]) => (
                          <option key={k} value={k}>
                            {v}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div
                      role="group"
                      aria-label="本机 Skill 列表"
                      className="max-h-60 overflow-auto rounded-xl border divide-y"
                    >
                      {options.length === 0 && (
                        <p className="p-6 text-center text-sm text-muted-foreground">
                          没有匹配的 Skill
                        </p>
                      )}
                      {options.map((c) => (
                        <button
                          key={c.candidate_id}
                          aria-label={`选择 ${c.name} · ${sources[c.source]}`}
                          aria-pressed={selectedId === c.candidate_id}
                          disabled={!c.enabled || busy}
                          onClick={() => choose(c)}
                          className={cn(
                            "flex w-full items-start gap-3 p-3 text-left hover:bg-muted/50 disabled:opacity-40",
                            selectedId === c.candidate_id && "bg-muted/60",
                          )}
                        >
                          <span
                            className={cn(
                              "mt-1 flex size-4 shrink-0 items-center justify-center rounded-full border",
                              selectedId === c.candidate_id &&
                                "border-foreground bg-foreground text-background",
                            )}
                          >
                            {selectedId === c.candidate_id && (
                              <Check size={11} />
                            )}
                          </span>
                          <span className="min-w-0">
                            <span className="flex flex-wrap items-center gap-2 text-sm font-medium">
                              {c.name}
                              <span className="text-xs font-normal text-muted-foreground">
                                {sources[c.source]}
                                {!c.enabled && " · 不可用"}
                              </span>
                            </span>
                            <span className="mt-1 line-clamp-2 block text-xs leading-5 text-muted-foreground">
                              {c.description}
                            </span>
                          </span>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      显示 {options.length} / {catalog.candidates.length} 个
                      Skill · 同名 Skill 按来源区分
                    </p>
                  </div>
                </div>
                {review && (
                  <div
                    aria-label="兼容性检查结果"
                    className="space-y-3 rounded-2xl border p-4"
                  >
                    <h3 className="flex items-center gap-2 text-sm font-medium">
                      <ShieldCheck size={16} />
                      兼容性检查
                    </h3>
                    {review.reports.map((r: any) => (
                      <div key={r.slot} className="rounded-xl bg-muted/40 p-3">
                        <p className="text-sm font-medium">
                          {r.label} → {r.candidate.name}
                          <span
                            className={cn(
                              "ml-2 text-xs",
                              r.status === "blocked" && "text-destructive",
                            )}
                          >
                            {r.status === "ready"
                              ? "静态检查完成 · 可保存"
                              : "需要处理"}
                          </span>
                        </p>
                        <p className="mt-2 text-xs leading-5">{r.contract}</p>
                        {r.file_count != null && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            固定 {r.file_count} 个文件 ·{" "}
                            {(r.bytes / 1024).toFixed(1)} KB
                            {r.dependencies.length
                              ? ` · 依赖：${r.dependencies.join("、")}`
                              : ""}
                          </p>
                        )}
                        <ul className="mt-2 space-y-1 text-xs leading-5 text-muted-foreground">
                          {r.issues.map((i: any, n: number) => (
                            <li
                              key={n}
                              className={
                                i.level === "error" ? "text-destructive" : ""
                              }
                            >
                              {i.level === "error"
                                ? "无法接入："
                                : i.level === "warning"
                                  ? "需留意："
                                  : ""}
                              {i.text}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
                {(review?.busy || catalog.busy) && (
                  <p className="text-xs text-muted-foreground">
                    当前有未完成的 Skill
                    任务或批次，可以先选择并检查，结束后再保存。
                  </p>
                )}
              </>
            )
          )}
        </div>
      </div>
      <div className="shrink-0 border-t bg-background px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            {changes.length
              ? `${changes.length} 个阶段待保存`
              : "当前配置已载入"}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={!changes.length || busy}
              onClick={check}
            >
              {checking && <Loader2 className="animate-spin" size={14} />}
              检查兼容性
            </Button>
            <Button
              disabled={
                !changes.length ||
                !review?.can_save ||
                busy ||
                review?.busy ||
                catalog?.busy
              }
              onClick={save}
            >
              {saving && <Loader2 className="animate-spin" size={14} />}
              保存到当前项目
            </Button>
          </div>
        </div>
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          仅保存到当前项目。编辑器的「对话修改」使用独立助手。
        </p>
      </div>
    </div>
  );
}

export default function ProjectSettings({
  open,
  onOpenChange,
  base,
  name,
  settings,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  base: string;
  name: string;
  settings: any;
  onSaved: () => Promise<void>;
}) {
  const [tab, setTab] = useState("spec"),
    [skillsVisited, setSkillsVisited] = useState(false),
    [spec, setSpec] = useState(settings),
    [error, setError] = useState(""),
    [saving, setSaving] = useState(false);
  useEffect(() => {
    if (open) {
      setSpec(settings);
      setError("");
    }
  }, [open]);
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      wide
      className="flex h-[min(780px,calc(100dvh-48px))] max-w-[1120px] flex-col overflow-hidden p-0 [&>.dialog-title]:px-6 [&>.dialog-title]:pt-5 [&>.dialog-description]:px-6"
      title="项目设置"
      description={`仅应用于「${name}」`}
    >
      <Tabs.Root
        value={tab}
        orientation="vertical"
        onValueChange={(value) => {
          setTab(value);
          if (value === "skills") setSkillsVisited(true);
        }}
        className="flex min-h-0 flex-1 border-t"
      >
        <Tabs.List
          aria-label="项目设置分类"
          className="flex w-40 shrink-0 flex-col gap-1 border-r bg-muted/30 p-3 sm:w-48"
        >
          <Tabs.Trigger value="spec" className={tabsClass}>
            <SlidersHorizontal size={16} />
            项目规格
          </Tabs.Trigger>
          <Tabs.Trigger value="skills" className={tabsClass}>
            <Workflow size={16} />
            Skills
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content
          forceMount
          value="spec"
          className="flex min-w-0 flex-1 flex-col outline-none data-[state=inactive]:hidden"
        >
          <div className="min-h-0 flex-1 overflow-auto p-6">
            <h3 className="font-semibold">项目规格</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              设置画面尺寸与帧率，用于剪辑工程和导出。
            </p>
            <section className="mt-6 rounded-2xl border p-5">
              <h4 className="mb-4 text-sm font-medium">画面与时间基准</h4>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  ["width", "宽度"],
                  ["height", "高度"],
                  ["fps", "帧率"],
                ].map(([key, label]) => (
                  <Field key={key} label={label}>
                    <Input
                      type="number"
                      min={1}
                      value={spec?.[key] ?? ""}
                      onChange={(e) =>
                        setSpec({ ...spec, [key]: Number(e.target.value) })
                      }
                    />
                  </Field>
                ))}
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                画面尺寸单位为像素，帧率单位为 fps。
              </p>
            </section>
            {error && (
              <p role="alert" className="mt-3 text-sm text-destructive">
                {error}
              </p>
            )}
          </div>
          <div className="flex shrink-0 justify-end border-t px-6 py-4">
            <Button
              disabled={saving}
              onClick={async () => {
                setSaving(true);
                setError("");
                try {
                  await api(`${base}/settings`, {
                    method: "PUT",
                    body: JSON.stringify(spec),
                  });
                  await onSaved();
                  onOpenChange(false);
                } catch (e) {
                  setError((e as Error).message);
                } finally {
                  setSaving(false);
                }
              }}
            >
              保存项目规格
            </Button>
          </div>
        </Tabs.Content>
        <Tabs.Content
          forceMount
          value="skills"
          className="min-h-0 min-w-0 flex-1 outline-none data-[state=inactive]:hidden"
        >
          {skillsVisited && (
            <SkillsSettings key={base} base={base} onSaved={onSaved} />
          )}
        </Tabs.Content>
      </Tabs.Root>
    </Dialog>
  );
}
