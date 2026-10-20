import { useId, useRef, useState } from "react";
import { CheckCircle2, CircleHelp, Loader2 } from "lucide-react";
import {
  Badge,
  Button,
  Dialog,
  Field,
  Select,
  Textarea,
  cn,
} from "./components/ui";
import { post, uid } from "./lib/api";
import { stageLaunch } from "../shared/stage-launch";

const labels: Record<string, string> = {
  script: "创作 / 改写",
  audit: "审核剧本",
  assets: "提取资产",
  storyboard: "制作分镜",
  prompts: "编译 Prompt",
  html: "生产 HTML",
};
const startLabels: Record<string, string> = {
  script: "开始创作 / 改写",
  audit: "开始审核剧本",
  assets: "开始提取资产",
  storyboard: "开始制作分镜",
  prompts: "开始编译 Prompt",
  html: "开始装配 HTML",
};

export default function StageLauncher({
  stage,
  base,
  data,
  scene,
  dirty,
  instruction,
  onInstruction,
  onClose,
  onAudit,
  onReview,
  onEditor,
  onSettings,
  onTasks,
  onSave,
  run,
}: {
  stage: string;
  base: string;
  data: any;
  scene: string;
  dirty: boolean;
  instruction: string;
  onInstruction: (v: string) => void;
  onClose: () => void;
  onAudit: () => void;
  onReview: () => void;
  onEditor: () => void;
  onSettings: () => void;
  onTasks: () => void;
  onSave: () => Promise<void>;
  run: (action: () => Promise<any>, message?: string) => Promise<any>;
}) {
  const canPlan = ["assets", "storyboard"].includes(stage);
  const [mode, setMode] = useState(canPlan ? "" : "production");
  const [sceneScope, setSceneScope] = useState(scene);
  const [effort, setEffort] = useState("medium");
  const [concurrency, setConcurrency] = useState("2");
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const requestKey = useRef(uid());
  const purposeRef = useRef<HTMLButtonElement>(null);
  const scopeRef = useRef<HTMLSelectElement>(null);
  const launchStatusId = useId();
  const launch = stageLaunch({
    stage,
    mode,
    script: data.script,
    dirty,
    instruction,
    sceneScope,
    skills: data.skills || [],
  });
  const ref = data.script.state?.working_script;
  const production = data.script.state?.production_inputs?.script;
  const disabled = !launch.ready || submitting || saving;
  const actions = {
    save: {
      label: "保存工作稿",
      run: async () => {
        setSaving(true);
        try {
          await onSave();
        } finally {
          setSaving(false);
        }
      },
    },
    editor: { label: "前往剧本正文", run: onEditor },
    audit: { label: "去审核当前剧本", run: onAudit },
    review: { label: "审阅并确认版本", run: onReview },
    settings: { label: "打开项目设置", run: onSettings },
    mode: { label: "选择本次用途", run: () => purposeRef.current?.focus() },
    scope: { label: "选择可用场景", run: () => scopeRef.current?.focus() },
  };
  return (
    <Dialog
      open={!!stage}
      onOpenChange={(value) => !value && !submitting && onClose()}
      title={labels[stage] || "运行阶段"}
      description="选择本次输入与范围，结果将在任务面板中审阅并保存。"
      className="flex max-w-2xl flex-col overflow-hidden"
    >
      <div className="min-h-0 space-y-5 overflow-y-auto pb-5 pr-1">
        {canPlan && (
          <div>
            <p className="mb-2 text-sm font-medium">
              本次用途{" "}
              {!mode && <span className="text-muted-foreground">· 请选择</span>}
            </p>
            <div
              role="radiogroup"
              aria-label="本次用途"
              className="grid gap-3 sm:grid-cols-2"
            >
              {[
                {
                  value: "planning",
                  title: "规划草案",
                  detail: "使用当前工作稿，只做资产拆分或分镜设计。",
                  state: ref
                    ? `工作稿 v${ref.version} · ${data.script.audit ? "审核已保存" : "待审核"}`
                    : "待保存工作稿",
                },
                {
                  value: "production",
                  title: "正式生产",
                  detail: "使用已经审阅并确认的生产版本。",
                  state: production
                    ? `生产版本 v${production.version}`
                    : "尚未确认生产版本",
                },
              ].map((option) => (
                <button
                  key={option.value}
                  ref={option.value === "planning" ? purposeRef : undefined}
                  role="radio"
                  aria-checked={mode === option.value}
                  disabled={submitting || saving}
                  onClick={() => setMode(option.value)}
                  className={cn(
                    "rounded-2xl border p-4 text-left transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    mode === option.value &&
                      "border-foreground bg-muted/50 ring-1 ring-foreground",
                  )}
                >
                  <span className="flex items-center justify-between text-sm font-medium">
                    {option.title}
                    {mode === option.value && <CheckCircle2 size={16} />}
                  </span>
                  <span className="mt-2 block text-xs leading-5 text-muted-foreground">
                    {option.detail}
                  </span>
                  <span className="mt-3 block text-xs">{option.state}</span>
                </button>
              ))}
            </div>
            {mode === "planning" && (
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                保留审核问题与素材缺口；这次选择不会确认生产版本或启动媒体生成。
              </p>
            )}
          </div>
        )}
        {(!canPlan || mode) && launch.source && (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">本次输入</span>
            <Badge>
              {launch.usesProduction ? "生产版本" : "工作稿"} v
              {launch.source.version}
            </Badge>
            {launch.usesProduction && ref?.sha256 !== launch.source.sha256 && (
              <span className="text-xs text-muted-foreground">
                当前工作稿为 v{ref?.version}，本次使用已确认的旧生产版。
              </span>
            )}
          </div>
        )}
        {stage === "storyboard" && mode && (
          <Field label="场景范围">
            <Select
              ref={scopeRef}
              value={sceneScope}
              onChange={(e) => setSceneScope(e.target.value)}
              disabled={submitting || !launch.source}
            >
              <option value="all">
                {launch.source
                  ? `全部可处理场景（${launch.availableScenes.length} 场）`
                  : launch.usesProduction
                    ? "先确认生产版本，再选择场景"
                    : "先保存工作稿，再选择场景"}
              </option>
              {sceneScope !== "all" &&
                !launch.availableScenes.some((s) => s.label === sceneScope) && (
                  <option value={sceneScope} disabled>
                    {sceneScope} · 此版本不可用
                  </option>
                )}
              {launch.availableScenes.map((s) => (
                <option key={s.label} value={s.label}>
                  {s.label} · {s.header.replace(/^#{1,6}\s+/, "")}
                </option>
              ))}
            </Select>
            <p className="text-xs leading-5 text-muted-foreground">
              每场独立设计，完成后整批审阅。场景依赖尚未确定的空间设计时，请先处理前场。
            </p>
          </Field>
        )}
        <Field
          label={stage === "script" ? "创作 / 改写要求" : "补充要求（可选）"}
        >
          <Textarea
            value={instruction}
            onChange={(e) => onInstruction(e.target.value)}
            disabled={submitting}
            placeholder={
              stage === "script"
                ? "故事 idea，或希望修改的内容、目标时长和需要保留的约束…"
                : "可填写这次要重点处理的问题；留空会按所选阶段和场景执行。"
            }
            className="min-h-24"
          />
        </Field>
        <details className="rounded-xl border px-4 py-3">
          <summary className="cursor-pointer text-sm">
            执行选项{" "}
            <span className="ml-2 text-xs text-muted-foreground">
              {effort === "medium"
                ? "标准"
                : effort === "high"
                  ? "深入"
                  : "最高"}
              {stage === "storyboard" && sceneScope === "all"
                ? ` · 同时 ${concurrency} 场`
                : ""}
            </span>
          </summary>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Field label="推理投入">
              <Select
                value={effort}
                onChange={(e) => setEffort(e.target.value)}
                disabled={submitting}
              >
                <option value="medium">标准</option>
                <option value="high">深入</option>
                <option value="max">最高</option>
              </Select>
            </Field>
            {stage === "storyboard" && sceneScope === "all" && (
              <Field label="同时处理">
                <Select
                  value={concurrency}
                  onChange={(e) => setConcurrency(e.target.value)}
                  disabled={submitting}
                >
                  <option value="1">逐场执行</option>
                  <option value="2">2 个 Scene</option>
                  <option value="3">3 个 Scene</option>
                </Select>
              </Field>
            )}
          </div>
        </details>
      </div>
      <div className="shrink-0 space-y-3 border-t pt-4">
        <div id={launchStatusId} role="status" aria-live="polite" aria-atomic="true">
          {saving || submitting ? (
            <div className="rounded-xl bg-muted/40 p-3 text-sm">
              <p className="flex items-center gap-2 font-medium">
                <Loader2 size={16} className="animate-spin" />
                {saving ? "正在保存工作稿，暂时无法开始。" : "正在提交任务，暂时无法重复启动。"}
              </p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {saving
                  ? "下一步：等待保存完成，启动条件会自动更新。"
                  : "下一步：等待提交结果；成功后会打开任务面板查看进度。"}
              </p>
            </div>
          ) : !launch.ready ? (
            <div
              aria-label="暂时无法开始的原因与下一步"
              className="max-h-[30vh] space-y-3 overflow-y-auto rounded-2xl border bg-muted/30 p-4"
            >
              <p className="flex items-center gap-2 text-sm font-medium">
                <CircleHelp size={16} />
                暂时无法开始{launch.issues.length > 1 && ` · ${launch.issues.length} 项待完成`}
              </p>
              {launch.issues.map((issue) => (
                <div key={issue.code} className="space-y-2">
                  <p className="text-sm font-medium leading-6">{issue.message}</p>
                  <p className="text-xs leading-5 text-muted-foreground">
                    下一步：{issue.nextStep}
                  </p>
                  {issue.detail && (
                    <details className="text-xs text-muted-foreground">
                      <summary className="cursor-pointer">查看详情</summary>
                      <p className="mt-1 break-words">{issue.detail}</p>
                    </details>
                  )}
                  {issue.action && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={saving || submitting}
                      onClick={actions[issue.action].run}
                    >
                      {actions[issue.action].label}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="flex items-center gap-1.5 text-sm">
              <CheckCircle2 size={14} />
              已就绪，可以开始
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground">
            <span>AI 执行需要联网。</span>
            <button
              className="ml-1 underline underline-offset-2"
              onClick={onTasks}
            >
              查看任务
            </button>
          </div>
          <Button
            disabled={disabled}
            aria-describedby={launchStatusId}
            onClick={async () => {
              if (disabled) return;
              setSubmitting(true);
              try {
                await run(async () => {
                  await post(
                    `${base}/${stage === "storyboard" ? "skill-batches" : "skills/run"}`,
                    {
                      stage,
                      mode,
                      expected_sha256: launch.source?.sha256,
                      effort,
                      ...(stage === "storyboard"
                        ? {
                            scenes: launch.scenes,
                            concurrency: Number(concurrency),
                          }
                        : {}),
                      instruction: launch.requestInstruction,
                      request_key: requestKey.current,
                    },
                  );
                  onTasks();
                  onClose();
                }, "Skill 已加入任务面板");
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {(saving || submitting) && <Loader2 size={14} className="animate-spin" />}
            {saving ? "正在保存…" : submitting ? "正在启动…" : startLabels[stage]}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
