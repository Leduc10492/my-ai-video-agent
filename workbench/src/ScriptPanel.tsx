import { useEffect, useRef, useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import {
  FileText,
  Save,
  Sparkles,
  GitCompareArrows,
  ShieldCheck,
  Clapperboard,
} from "lucide-react";
import { diffLines } from "diff";
import {
  Button,
  Badge,
  Dialog,
  Field,
  Select,
  Textarea,
} from "./components/ui";
import { api, post } from "./lib/api";
import StoryboardPanel from "./StoryboardPanel";
import StageLauncher from "./StageLauncher";
import ScreenplayEditor from "./ScreenplayEditor";
import type { ShotSelection } from "./lib/storyboard";
export default function ScriptPanel({
  base,
  data,
  scene,
  run,
  onDirty,
  view,
  onView,
  selection,
  onSelectShot,
  onTimeline,
  stageRequest,
  onSettings,
  onTasks,
}: {
  base: string;
  onSettings: () => void;
  onTasks: () => void;
  data: any;
  scene: string;
  onDirty: (dirty: boolean) => void;
  view: string;
  onView: (view: string) => void;
  selection: ShotSelection | null;
  onSelectShot: (selection: ShotSelection) => void;
  onTimeline: (id?: string) => void;
  stageRequest: { stage: string; instruction: string; nonce: number } | null;
  run: (action: () => Promise<any>, message?: string) => Promise<any>;
}) {
  const script = data.script,
    [body, setBody] = useState(script.body || ""),
    [dirty, setDirty] = useState(false),
    [stage, setStage] = useState(""),
    [instruction, setInstruction] = useState(""),
    [compare, setCompare] = useState(false),
    [oldBody, setOldBody] = useState(""),
    [review, setReview] = useState(false),
    [evidence, setEvidence] = useState(""),
    [noIssues, setNoIssues] = useState(false);
  useEffect(() => {
    if (stageRequest) {
      setStage(stageRequest.stage);
      setInstruction(stageRequest.instruction);
    }
  }, [stageRequest]);
  useEffect(() => {
    onDirty(dirty);
    return () => onDirty(false);
  }, [dirty, onDirty]);
  const ref = script.state?.working_script;
  const [baselineHash, setBaselineHash] = useState<string | null>(
    ref?.sha256 || null,
  );
  const dirtyRef = useRef(false),
    bodyRef = useRef(body);
  const bindings = useRef<Record<number, string>>({});
  bodyRef.current = body;
  const changeBody = (value: string) => {
    const changed = value !== (script.body || "");
    bodyRef.current = value;
    dirtyRef.current = changed;
    setBody(value);
    setDirty(changed);
    if (!changed) setBaselineHash(ref?.sha256 || null);
  };
  useEffect(() => {
    if (!dirtyRef.current) {
      setBody(script.body || "");
      setBaselineHash(ref?.sha256 || null);
    }
  }, [script.body, ref?.sha256]);
  useEffect(() => {
    if (!dirty) return;
    const fn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", fn);
    return () => window.removeEventListener("beforeunload", fn);
  }, [dirty]);
  const save = async () => {
    const snapshot = bodyRef.current;
    const result = await run(
      () =>
        post(`${base}/script`, {
          body: snapshot,
          expected_sha256: baselineHash,
          scene_bindings: bindings.current,
        }),
      "工作稿已保存为独立版本",
    );
    if (!result?.state?.working_script) return;
    setBaselineHash(result.state.working_script.sha256);
    if (bodyRef.current === snapshot) {
      dirtyRef.current = false;
      setDirty(false);
    }
  };
  const stages = [
    ["script", "创作 / 改写"],
    ["audit", "审核剧本"],
    ["assets", "提取资产"],
    ["storyboard", "制作分镜"],
    ["prompts", "编译 Prompt"],
    ["html", "生产 HTML"],
  ];
  return (
    <Tabs.Root
      value={view}
      onValueChange={onView}
      className="flex min-h-0 flex-1 flex-col"
    >
      <div className="flex flex-wrap items-center gap-3 border-b bg-card px-7 py-4">
        <Tabs.List
          className="segmented-control mr-auto"
          aria-label="剧本工作区"
        >
          <Tabs.Trigger
            value="text"
            className={view === "text" ? "active" : ""}
          >
            <FileText size={15} />
            剧本正文
          </Tabs.Trigger>
          <Tabs.Trigger
            value="board"
            className={view === "board" ? "active" : ""}
          >
            <Clapperboard size={15} />
            可视化分镜
          </Tabs.Trigger>
        </Tabs.List>
        {view === "text" && (
          <>
            {ref && <Badge>v{ref.version}</Badge>}
            <Badge>{dirty ? "有未保存修改" : ref ? "已保存" : "未导入"}</Badge>
            <Button
              variant="outline"
              size="sm"
              disabled={!ref}
              onClick={() => setCompare(true)}
            >
              <GitCompareArrows />
              版本比较
            </Button>
            <Button
              size="sm"
              disabled={!body.trim() || (!dirty && !!ref)}
              onClick={save}
            >
              <Save />
              保存新版本
            </Button>
          </>
        )}
        {view === "board" && (
          <Badge>{data.storyboard ? "分镜已载入" : "待制作"}</Badge>
        )}
      </div>
      <Tabs.Content
        value="text"
        forceMount
        className={view === "text" ? "flex min-h-0 flex-1 flex-col" : "hidden"}
      >
        {script.error && (
          <div className="m-6 rounded-lg border border-destructive p-4 text-destructive">
            {script.error}
          </div>
        )}
        <div className="flex flex-wrap gap-2 border-b bg-muted/30 px-6 py-3">
          {stages.map(([key, label]) => (
            <Button
              key={key}
              size="sm"
              variant="ghost"
              onClick={() => {
                setStage(key);
                setInstruction("");
              }}
            >
              <Sparkles />
              {label}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            className="ml-auto"
            disabled={!script.audit}
            onClick={() => setReview(true)}
          >
            <ShieldCheck />
            审核与确认
          </Button>
        </div>
        {script.candidates?.length > 0 && !ref && (
          <div className="m-6 rounded-lg border p-4">
            <p className="mb-3 font-medium">发现本地剧本，请选择工作版本</p>
            {script.candidates.map((file: string) => (
              <Button
                className="mr-2"
                variant="outline"
                key={file}
                onClick={() =>
                  run(() => post(`${base}/script/select`, { script: file }))
                }
              >
                {file.split("/").pop()}
              </Button>
            ))}
          </div>
        )}
        <ScreenplayEditor
          base={base}
          body={body}
          savedBody={script.body || ""}
          baselineHash={baselineHash}
          savedHash={ref?.sha256 || null}
          sceneMap={ref?.scene_map || []}
          sceneHeading={
            ref?.scene_map?.find((s: any) => s.label === scene)?.header
          }
          onChange={changeBody}
          onRecoverHash={setBaselineHash}
          onBindings={(value) => {
            bindings.current = value;
          }}
        />
        <div className="flex items-center justify-between border-t px-6 py-2 text-xs text-muted-foreground">
          <span>
            {body.length.toLocaleString()} 字符 ·{" "}
            {ref ? `已存档 ${ref.scene_map?.length || 0} 场` : "尚未存档"}
          </span>
          <span>
            {script.state?.production_inputs
              ? `生产版本 v${script.state.production_inputs.script.version}`
              : "生产版本尚未确认"}
          </span>
        </div>
      </Tabs.Content>
      <Tabs.Content
        value="board"
        forceMount
        className={view === "board" ? "flex min-h-0 flex-1 flex-col" : "hidden"}
      >
        <StoryboardPanel
          base={base}
          data={data}
          scene={scene}
          selection={selection}
          onSelect={onSelectShot}
          onTimeline={onTimeline}
          run={run}
          onStage={(value) => {
            setStage(value);
            setInstruction(
              scene === "all"
                ? ""
                : `只处理 ${scene}，保留已确认的镜头与素材约束。`,
            );
          }}
        />
      </Tabs.Content>
      <StageLauncher
        key={stage || "closed"}
        stage={stage}
        base={base}
        data={data}
        scene={scene}
        dirty={dirty}
        instruction={instruction}
        onInstruction={setInstruction}
        onClose={() => setStage("")}
        onSave={save}
        onAudit={() => {
          setStage("audit");
          setInstruction("");
        }}
        onReview={() => {
          setStage("");
          setReview(true);
        }}
        onEditor={() => {
          setStage("");
          onView("text");
        }}
        onSettings={() => {
          setStage("");
          onSettings();
        }}
        onTasks={() => {
          setStage("");
          onTasks();
        }}
        run={run}
      />
      <Dialog
        wide
        open={compare}
        onOpenChange={setCompare}
        title="剧本版本比较"
        description="比较已登记的版本与当前编辑内容。旧版本保持可恢复。"
      >
        <Select
          aria-label="比较版本"
          defaultValue=""
          onChange={(e) =>
            run(async () => {
              const value = await api(
                `${base}/script/version?key=${encodeURIComponent(e.target.value)}`,
              );
              setOldBody(value.body);
            })
          }
        >
          <option value="" disabled>
            选择历史版本
          </option>
          {script.versions?.map((v: any) => (
            <option key={v.sha256} value={`${v.artifact_id}@v${v.version}`}>
              v{v.version} · {v.sha256.slice(0, 12)}
            </option>
          ))}
        </Select>
        <div className="mt-4 max-h-[50vh] overflow-auto rounded-md border p-4 font-mono text-xs leading-6">
          {diffLines(oldBody, body).map((part, i) => (
            <pre
              key={i}
              className={
                part.added
                  ? "border-l-2 border-foreground bg-muted pl-3"
                  : part.removed
                    ? "pl-3 text-muted-foreground line-through"
                    : "pl-3"
              }
            >
              {part.added ? "+ " : part.removed ? "− " : ""}
              {part.value}
            </pre>
          ))}
        </div>
      </Dialog>
      <Dialog
        wide
        open={review}
        onOpenChange={setReview}
        title="确认剧本生产版本"
        description={`确认对象：v${ref?.version} · ${ref?.sha256?.slice(0, 12)}。接受记录绑定剧本和审核文件哈希。`}
      >
        <pre className="mb-5 max-h-72 overflow-auto rounded-md border bg-muted/30 p-4 text-xs leading-6">
          {script.audit?.text}
        </pre>
        <div className="space-y-4">
          <Field label="你的审阅结论">
            <Textarea
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              placeholder="已确认的内容、仍保留的建议及允许进入生产的范围…"
            />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={noIssues}
              onChange={(e) => setNoIssues(e.target.checked)}
            />
            已完整审阅同版本审核，没有未解决的 P0/P1
          </label>
          <Button
            disabled={!noIssues || !evidence.trim() || dirty}
            onClick={() =>
              run(async () => {
                await post(`${base}/script/approve`, {
                  script_sha256: ref.sha256,
                  audit_sha256: script.audit.sha256,
                  confirm_no_p0_p1: true,
                  evidence,
                });
                setReview(false);
              }, "生产版本已确认")
            }
          >
            确认并进入资产与分镜阶段
          </Button>
        </div>
      </Dialog>
    </Tabs.Root>
  );
}
