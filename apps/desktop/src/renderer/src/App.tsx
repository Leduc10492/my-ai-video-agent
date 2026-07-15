import { useEffect, useMemo, useRef, useState } from "react";
import {
  Aperture,
  Archive,
  ArrowCounterClockwise,
  Brain,
  CaretDown,
  CaretRight,
  Check,
  CheckCircle,
  CirclesThreePlus,
  ClockCounterClockwise,
  FolderOpen,
  GearSix,
  House,
  ImageSquare,
  ListChecks,
  MagicWand,
  Minus,
  Plus,
  Rows,
  SidebarSimple,
  Sparkle,
  SpinnerGap,
  SquaresFour,
  Stop,
  UserCircle,
  Warning,
  X
} from "@phosphor-icons/react";
import { appBridge, hasNativeBridge } from "./bridge";
import { Badge, Button, IconButton, Meter } from "./components";
import {
  assets,
  draftImages,
  hierarchy,
  initialBreakdown,
  initialEnvelopes,
  initialScriptBlocks,
  initialSkills,
  initialTasks,
  projects as demoProjects,
  qaFindings,
  shots
} from "./data";
import type {
  AgentCandidate,
  AgentRuntimePreference,
  AssetItem,
  BreakdownProposal,
  DraftImageItem,
  HierarchyNode,
  ProjectSummary,
  PromptEnvelope,
  QaFinding,
  ScriptBlock,
  ShotRow,
  SkillItem,
  Stage,
  TaskItem,
  WorkspaceSnapshot
} from "./types";
import {
  AssetsView,
  BreakdownView,
  DashboardView,
  QaView,
  ScriptView,
  SkillsView,
  StoryboardView,
  TasksView
} from "./views";

const stageMeta: Record<Stage, { label: string; eyebrow: string; skill: string; scope: string }> = {
  script: { label: "剧本", eyebrow: "文本工作台", skill: "screenwriter-workflow", scope: "S001 · 当前场" },
  assets: { label: "资产", eyebrow: "共享资料库", skill: "guide-workflow", scope: "全项目资产" },
  breakdown: { label: "拆解", eyebrow: "结构提案", skill: "shotlist-breakdown-workflow", scope: "第一幕 · 6 场" },
  storyboard: { label: "分镜", eyebrow: "导演设计", skill: "sketch-shotlist-workflow", scope: "S001 · 5 镜" },
  qa: { label: "QA", eyebrow: "质量审阅", skill: "qa-workflow", scope: "当前项目" },
  tasks: { label: "任务", eyebrow: "项目管理", skill: "不使用 Agent", scope: "当前项目" },
  skills: { label: "设置", eyebrow: "运行配置", skill: "Skill 管理", scope: "当前项目" }
};

const mainStages: Array<{ id: Stage; icon: typeof Rows }> = [
  { id: "script", icon: SquaresFour },
  { id: "assets", icon: ImageSquare },
  { id: "breakdown", icon: CirclesThreePlus },
  { id: "storyboard", icon: Rows },
  { id: "qa", icon: CheckCircle }
];

const slotByStage: Partial<Record<Stage, string>> = {
  script: "script.primary",
  assets: "guides.primary",
  breakdown: "shotlist.breakdown",
  storyboard: "shotlist.primary",
  qa: "qa.primary"
};

function HierarchyTree({ tree, selectedScene, onSceneSelect }: { tree: HierarchyNode[]; selectedScene: string; onSceneSelect: (id: string) => void }) {
  const [openNodes, setOpenNodes] = useState<Set<string>>(() => new Set(tree.flatMap((node) => [node.id, ...(node.children ?? []).map((child) => child.id)])));
  useEffect(() => {
    setOpenNodes(new Set(tree.flatMap((node) => [node.id, ...(node.children ?? []).map((child) => child.id)])));
  }, [tree]);
  const toggle = (id: string) => {
    const next = new Set(openNodes);
    if (next.has(id)) next.delete(id); else next.add(id);
    setOpenNodes(next);
  };

  const renderNode = (node: HierarchyNode, depth: number) => {
    const hasChildren = Boolean(node.children?.length);
    if (!hasChildren) return <button key={node.id} type="button" className={`tree-row tree-row--scene ${selectedScene === node.id ? "is-selected" : ""}`} style={{ marginLeft: `${Math.min(depth * 8 + 9, 33)}px` }} onClick={() => onSceneSelect(node.id)}><span className="scene-status-dot" /><span>{node.label}</span><small>{node.meta}</small></button>;
    return <div key={node.id} className={`tree-level ${depth === 0 ? "tree-level--act" : "tree-level--sequence"}`}><button type="button" className={`tree-row ${depth === 0 ? "tree-row--act" : "tree-row--sequence"}`} onClick={() => toggle(node.id)}>{openNodes.has(node.id) ? <CaretDown size={13} /> : <CaretRight size={13} />}<span>{node.label}</span><small>{node.meta}</small></button>{openNodes.has(node.id) ? node.children?.map((child) => renderNode(child, depth + 1)) : null}</div>;
  };

  return <div className="hierarchy-tree">{tree.length ? tree.map((node) => renderNode(node, 0)) : <div className="tree-empty"><SquaresFour size={20} /><span>导入剧本后会在这里建立幕、戏和场。</span></div>}</div>;
}

function ProjectSidebar({
  collapsed,
  selectedScene,
  activeStage,
  tree,
  staleCount,
  onSceneSelect,
  onCreateStructure,
  onStageChange,
  onCollapse
}: {
  collapsed: boolean;
  selectedScene: string;
  activeStage: Stage;
  tree: HierarchyNode[];
  staleCount: number;
  onSceneSelect: (id: string) => void;
  onCreateStructure: (kind: "act" | "sequence" | "scene", title: string) => Promise<void>;
  onStageChange: (stage: Stage) => void;
  onCollapse: () => void;
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [structureKind, setStructureKind] = useState<"act" | "sequence" | "scene">("scene");
  const [structureTitle, setStructureTitle] = useState("");
  const [structureError, setStructureError] = useState("");
  const [creatingStructure, setCreatingStructure] = useState(false);

  async function submitStructure() {
    if (!structureTitle.trim()) return;
    setCreatingStructure(true);
    setStructureError("");
    try {
      await onCreateStructure(structureKind, structureTitle.trim());
      setStructureTitle("");
      setShowCreate(false);
    } catch (error) {
      setStructureError(error instanceof Error ? error.message : "无法创建项目结构。");
    } finally {
      setCreatingStructure(false);
    }
  }

  if (collapsed) {
    return (
      <aside className="project-sidebar project-sidebar--collapsed">
        <IconButton icon={SidebarSimple} label="展开项目结构" onClick={onCollapse} />
        <IconButton icon={SquaresFour} label="项目结构" active />
        <IconButton icon={ListChecks} label="任务" active={activeStage === "tasks"} onClick={() => onStageChange("tasks")} />
        <IconButton icon={ClockCounterClockwise} label="版本历史" />
      </aside>
    );
  }

  return (
    <aside className="project-sidebar">
      <div className="sidebar-heading">
        <div><p className="eyebrow">项目结构</p><h2>故事导航</h2></div>
        <IconButton icon={SidebarSimple} label="收起项目结构" onClick={onCollapse} />
      </div>
      <div className="sidebar-view-switcher">
        <button type="button" className="is-active"><SquaresFour size={15} weight="fill" /> 结构</button>
        <button type="button" onClick={() => onStageChange("tasks")} className={activeStage === "tasks" ? "is-active" : ""}><ListChecks size={15} /> 任务</button>
      </div>
      <div className="tree-scroll">
        <HierarchyTree tree={tree} selectedScene={selectedScene} onSceneSelect={onSceneSelect} />
        <button type="button" className="add-structure-button" onClick={() => setShowCreate((value) => !value)}><Plus size={14} /> 新建幕、戏或场</button>
        {showCreate ? <div className="structure-create-form">
          <select aria-label="结构类型" value={structureKind} onChange={(event) => setStructureKind(event.target.value as typeof structureKind)}>
            <option value="act">幕</option><option value="sequence">戏</option><option value="scene">场</option>
          </select>
          <input aria-label="结构名称" placeholder={structureKind === "scene" ? "例如：内景 · 厨房 · 夜" : "输入名称"} value={structureTitle} onChange={(event) => setStructureTitle(event.target.value)} />
          {structureError ? <small>{structureError}</small> : null}
          <div><button type="button" onClick={() => setShowCreate(false)}>取消</button><button type="button" disabled={!structureTitle.trim() || creatingStructure} onClick={() => void submitStructure()}>{creatingStructure ? "创建中…" : "创建"}</button></div>
        </div> : null}
      </div>
      <div className="sidebar-footer-card">
        <div><span>{staleCount ? <Warning size={14} weight="fill" /> : <CheckCircle size={14} weight="fill" />}</span><strong>{staleCount ? `${staleCount} 项需要检查` : "下游状态正常"}</strong></div>
        <p>{staleCount ? "上游变化没有自动覆盖下游内容，请在 QA 中选择处理方式。" : "目前没有检测到需要检查的上游影响。"}</p>
        <button type="button" onClick={() => onStageChange("qa")}>查看影响 <CaretRight size={13} /></button>
      </div>
    </aside>
  );
}

function AgentPanel({ activeStage, projectId, scopeId, tasks, skillBinding, activeSkill, runtimePreference, onWorkspaceChange, onOpenSkills }: {
  activeStage: Stage;
  projectId: string;
  scopeId: string;
  tasks: TaskItem[];
  skillBinding?: WorkspaceSnapshot["skillBindings"][number];
  activeSkill?: SkillItem;
  runtimePreference: AgentRuntimePreference;
  onWorkspaceChange: (snapshot: WorkspaceSnapshot) => void;
  onOpenSkills: () => void;
}) {
  const [objective, setObjective] = useState("");
  const [state, setState] = useState<"idle" | "running" | "candidate">("idle");
  const [progress, setProgress] = useState(0);
  const [runId, setRunId] = useState<string | null>(null);
  const [candidate, setCandidate] = useState<AgentCandidate | null>(null);
  const [proposalId, setProposalId] = useState<string | null>(null);
  const [eventMessage, setEventMessage] = useState("");
  const [runError, setRunError] = useState("");
  const activeRunId = useRef<string | null>(null);
  const expectingRun = useRef(false);
  const meta = stageMeta[activeStage];
  const stageCanRun = activeStage !== "tasks" && activeStage !== "skills";
  const skillBlockReason = stageCanRun && (!skillBinding || !activeSkill)
    ? "当前阶段的固定 Skill 未安装或尚未绑定。"
    : stageCanRun && !activeSkill?.enabled
      ? "当前阶段绑定的 Skill 已停用。"
      : stageCanRun && activeSkill?.source !== "核心"
        ? "用户 Skill 当前可编辑和绑定，但技术预览暂不执行。"
        : "";
  const canRun = stageCanRun && !skillBlockReason;
  const activeSkillId = skillBinding?.skillId ?? meta.skill;
  const activeSkillLabel = skillBinding ? `${activeSkill?.name ?? skillBinding.skillId} · v${skillBinding.version}` : activeSkillId;
  const modelLabel = runtimePreference.model === "gpt-5.6-sol" ? "GPT‑5.6 Sol" : runtimePreference.model;
  const effortLabel = { low: "Low", medium: "Medium", high: "High", xhigh: "XHigh" }[runtimePreference.effort];
  const providerLabel = runtimePreference.provider === "local-codex" ? "本机 Codex" : "OpenAI Key";

  useEffect(() => appBridge.onAgentEvent((event) => {
    if (!expectingRun.current) return;
    if (activeRunId.current && event.runId !== activeRunId.current) return;
    if (!activeRunId.current) {
      activeRunId.current = event.runId;
      setRunId(event.runId);
    }
    setEventMessage(event.message);
    if (typeof event.progress === "number") setProgress(event.progress);
    if (event.kind === "draft") {
      const payload = event.payload && typeof event.payload === "object" ? event.payload as Record<string, unknown> : {};
      const id = typeof payload.proposalId === "string" ? payload.proposalId : null;
      setProposalId(id);
      setCandidate({
        title: typeof payload.summary === "string" && payload.summary ? payload.summary : `已完成${meta.label}候选修改`,
        summary: "结构化候选已保存在项目运行记录中。正式数据仍未改变。",
        operationCount: typeof payload.operationCount === "number" ? payload.operationCount : 0
      });
      setProgress(100);
      setState("candidate");
      expectingRun.current = false;
    }
    if (["failed", "cancelled", "interrupted"].includes(event.kind)) {
      setRunError(event.message);
      setState("idle");
      expectingRun.current = false;
    }
  }), [meta.label]);

  async function startRun() {
    if (!canRun) return;
    setState("running");
    setProgress(12);
    setCandidate(null);
    setProposalId(null);
    setRunError("");
    setEventMessage("正在创建隔离运行任务…");
    activeRunId.current = null;
    expectingRun.current = true;
    try {
      const result = await appBridge.runAgent({
        projectId,
        stage: slotByStage[activeStage] ?? "script.primary",
        scopeIds: [scopeId || projectId],
        skillId: activeSkillId,
        provider: runtimePreference.provider,
        prompt: objective || `审阅并优化${meta.label}`,
        model: runtimePreference.model,
        effort: runtimePreference.effort,
        imageGenerationConfirmed: false
      });
      activeRunId.current = result.runId;
      setRunId(result.runId);
      if (!hasNativeBridge()) {
        window.setTimeout(() => setProgress(62), 350);
        window.setTimeout(() => {
          setProgress(100);
          setState("candidate");
          expectingRun.current = false;
          setCandidate({ title: `已完成${meta.label}交互预览`, summary: "网页预览没有写入项目数据。", operationCount: 3 });
        }, 850);
      }
    } catch (error) {
      expectingRun.current = false;
      setState("idle");
      setRunError(error instanceof Error ? error.message : "Agent 运行启动失败。");
    }
  }

  async function cancelRun() {
    if (runId) await appBridge.cancelAgent(runId);
    setState("idle");
    setProgress(0);
    setRunId(null);
    activeRunId.current = null;
    expectingRun.current = false;
  }

  async function acceptCandidate() {
    try {
      if (proposalId && hasNativeBridge()) {
        const snapshot = await appBridge.acceptDraft(projectId, proposalId);
        if (snapshot) onWorkspaceChange(snapshot);
      }
      setState("idle");
      setCandidate(null);
      setProposalId(null);
      setObjective("");
    } catch (error) {
      setRunError(error instanceof Error ? error.message : "无法接受候选修改。");
    }
  }

  async function rejectCandidate() {
    try {
      if (proposalId && hasNativeBridge()) await appBridge.rejectDraft(projectId, proposalId);
      setState("idle");
      setCandidate(null);
      setProposalId(null);
    } catch (error) {
      setRunError(error instanceof Error ? error.message : "无法拒绝候选修改。");
    }
  }

  if (activeStage === "skills") {
    return (
      <aside className="agent-panel agent-panel--context">
        <header className="agent-panel__header"><div className="agent-avatar"><GearSix size={20} weight="duotone" /></div><div><p className="eyebrow">运行设置</p><h2>项目配置</h2></div></header>
        <div className="context-message"><ShieldCheckIcon /><div><strong>项目绑定已固定</strong><p>Skill 升级不会自动改变现有项目。每次运行会保存版本和内容哈希。</p></div></div>
        <dl className="agent-detail-list"><div><dt>文本模型</dt><dd>{modelLabel}</dd></div><div><dt>推理</dt><dd>{effortLabel}</dd></div><div><dt>通道</dt><dd>{providerLabel}</dd></div></dl>
      </aside>
    );
  }

  if (activeStage === "tasks") {
    const openTasks = tasks.filter((task) => task.status !== "已完成");
    const nextTask = openTasks.sort((a, b) => a.priority.localeCompare(b.priority))[0];
    return (
      <aside className="agent-panel agent-panel--context">
        <header className="agent-panel__header"><div className="agent-avatar"><ListChecks size={20} weight="duotone" /></div><div><p className="eyebrow">任务摘要</p><h2>今天的工作</h2></div></header>
        <div className="today-summary"><strong>{openTasks.length}</strong><span>项任务需要你处理</span><Meter value={tasks.length ? tasks.filter((task) => task.status === "已完成").length / tasks.length * 100 : 0} /><small>已完成 {tasks.filter((task) => task.status === "已完成").length} / {tasks.length}</small></div>
        {nextTask ? <div className="next-task"><Badge tone={nextTask.priority === "P0" ? "danger" : "warning"}>{nextTask.priority}</Badge><p><strong>{nextTask.title}</strong><small>{nextTask.scene} · {nextTask.due}</small></p></div> : <div className="context-message"><CheckCircle size={20} /><div><strong>当前任务已清空</strong><p>没有需要继续处理的项目任务。</p></div></div>}
        <Button variant="primary" className="full-width">开始处理</Button>
      </aside>
    );
  }

  return (
    <aside className="agent-panel">
      <header className="agent-panel__header">
        <div className="agent-avatar"><Aperture size={21} weight="duotone" /></div>
        <div><p className="eyebrow">AI 导演</p><h2>{state === "running" ? "正在工作" : state === "candidate" ? "等待你审阅" : "准备就绪"}</h2></div>
        <span className={`agent-state-dot agent-state-dot--${state}`} />
      </header>

      <div className="agent-scope">
        <div><span>本次范围</span><strong>{scopeId || projectId}</strong></div>
        <button type="button">更改</button>
      </div>

      {runError ? <div className="agent-run-error"><Warning size={15} weight="fill" /><span>{runError}</span></div> : null}
      {skillBlockReason ? <div className="agent-run-error agent-skill-block"><Warning size={15} weight="fill" /><span>{skillBlockReason}</span><button type="button" onClick={onOpenSkills}>打开 Skill 设置</button></div> : null}

      {state === "idle" ? (
        <>
          <label className="agent-prompt">
            <span>你想让 Agent 做什么？</span>
            <textarea value={objective} onChange={(event) => setObjective(event.target.value)} rows={5} placeholder={activeStage === "script" ? "例如：收紧开场节奏，保留所有原始信息…" : activeStage === "storyboard" ? "例如：为这场设计有明确切镜理由的 Shot Rows…" : `审阅当前${meta.label}并提出改进…`} />
            <small>⌘ ↵ 运行</small>
          </label>
          <div className="quick-intents">
            <span>常用目标</span>
            <button type="button" onClick={() => setObjective("检查当前范围的完整性与因果关系")}>检查完整性</button>
            <button type="button" onClick={() => setObjective("给出三个不改变核心意图的优化方案")}>生成变体</button>
            <button type="button" onClick={() => setObjective("只修复 P0 和 P1 问题，不做额外润色")}>修复高优先级</button>
          </div>
        </>
      ) : state === "running" ? (
        <div className="run-progress">
          <div className="run-progress__visual"><span><SpinnerGap size={22} className="spin" /></span><div><strong>正在读取上游与 Skill</strong><small>{eventMessage || "运行只会写入隔离候选区"}</small></div></div>
          <Meter value={progress} />
          <div className="run-events"><span className="is-complete"><Check size={13} /> 已锁定 {scopeId || projectId}</span><span className={progress > 40 ? "is-complete" : ""}>{progress > 40 ? <Check size={13} /> : <Minus size={13} />} 已加载 {activeSkillId}</span><span className={progress > 76 ? "is-complete" : ""}>{progress > 76 ? <Check size={13} /> : <Minus size={13} />} 生成结构化 Draft</span></div>
          <Button icon={Stop} variant="danger" className="full-width" onClick={cancelRun}>停止运行</Button>
        </div>
      ) : candidate ? (
        <div className="agent-candidate">
          <span className="candidate-icon"><MagicWand size={21} weight="duotone" /></span>
          <h3>{candidate.title}</h3>
          <p>{candidate.summary}</p>
          <div className="candidate-stats"><span><strong>{candidate.operationCount}</strong> 个候选操作</span><span><CheckCircle size={15} weight="fill" /> Schema 已通过</span></div>
          <button className="review-diff-button" type="button"><span><Sparkle size={16} /> 查看候选差异</span><CaretRight size={15} /></button>
          <div className="candidate-actions"><Button variant="ghost" onClick={() => void rejectCandidate()}>拒绝</Button><Button variant="primary" icon={Check} onClick={() => void acceptCandidate()}>接受全部</Button></div>
        </div>
      ) : null}

      <div className="agent-config-card">
        <div><span className="skill-glyph"><MagicWand size={15} /></span><span><small>当前 Skill</small><strong>{activeSkillLabel}</strong></span><CaretRight size={14} /></div>
        <div><span className="model-glyph"><Brain size={15} /></span><span><small>模型与通道</small><strong>{modelLabel} · {effortLabel} · {providerLabel}</strong></span><CaretRight size={14} /></div>
      </div>

      {state === "idle" ? <Button icon={Sparkle} variant="primary" className="full-width agent-run-button" disabled={!canRun} onClick={startRun}>{skillBlockReason ? "当前 Skill 不可运行" : "运行 Agent"}</Button> : null}
      <p className="agent-safety"><CheckCircle size={14} weight="fill" /> 正式数据不会被静默覆盖</p>
    </aside>
  );
}

function ShieldCheckIcon() {
  return <CheckCircle size={20} weight="duotone" />;
}

function findFirstLeaf(nodes: HierarchyNode[]): string | null {
  for (const node of nodes) {
    if (!node.children?.length) return node.id;
    const nested = findFirstLeaf(node.children);
    if (nested) return nested;
  }
  return null;
}

function hierarchyHasNode(nodes: HierarchyNode[], id: string): boolean {
  return nodes.some((node) => node.id === id || (node.children ? hierarchyHasNode(node.children, id) : false));
}

function hierarchyPath(nodes: HierarchyNode[], id: string, parents: HierarchyNode[] = []): HierarchyNode[] {
  for (const node of nodes) {
    const path = [...parents, node];
    if (node.id === id) return path;
    const nested = node.children ? hierarchyPath(node.children, id, path) : [];
    if (nested.length) return nested;
  }
  return [];
}

function inferredNodeKind(node: HierarchyNode): HierarchyNode["kind"] {
  if (node.kind) return node.kind;
  if (node.id.startsWith("act")) return "act";
  if (node.id.startsWith("sequence")) return "sequence";
  if (node.id.startsWith("scene")) return "scene";
  return undefined;
}

function appendHierarchyNode(nodes: HierarchyNode[], parentId: string | undefined, node: HierarchyNode): HierarchyNode[] {
  if (!parentId) return [...nodes, node];
  return nodes.map((item) => item.id === parentId
    ? { ...item, children: [...(item.children ?? []), node] }
    : { ...item, children: item.children ? appendHierarchyNode(item.children, parentId, node) : item.children });
}

export function App() {
  const native = hasNativeBridge();
  const browserPreview = !native && window.location.protocol !== "file:";
  const [startupError, setStartupError] = useState("");
  const [projects, setProjects] = useState<ProjectSummary[]>(() => browserPreview ? demoProjects : []);
  const [currentProject, setCurrentProject] = useState<ProjectSummary | null>(null);
  const [activeStage, setActiveStage] = useState<Stage>("script");
  const [selectedScene, setSelectedScene] = useState("scene-001");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [agentCollapsed, setAgentCollapsed] = useState(false);
  const [scriptBlocks, setScriptBlocks] = useState<ScriptBlock[]>(() => browserPreview ? initialScriptBlocks : []);
  const [assetItems, setAssetItems] = useState<AssetItem[]>(() => browserPreview ? assets : []);
  const [breakdown, setBreakdown] = useState<BreakdownProposal[]>(() => browserPreview ? initialBreakdown : []);
  const [shotRows, setShotRows] = useState<ShotRow[]>(() => browserPreview ? shots : []);
  const [envelopes, setEnvelopes] = useState<PromptEnvelope[]>(() => browserPreview ? initialEnvelopes : []);
  const [tasks, setTasks] = useState<TaskItem[]>(() => browserPreview ? initialTasks : []);
  const [qaItems, setQaItems] = useState<QaFinding[]>(() => browserPreview ? qaFindings : []);
  const [tree, setTree] = useState<HierarchyNode[]>(() => browserPreview ? hierarchy : []);
  const [draftImageItems, setDraftImageItems] = useState<DraftImageItem[]>(() => browserPreview ? draftImages : []);
  const [staleItems, setStaleItems] = useState<WorkspaceSnapshot["staleItems"]>([]);
  const [skillBindings, setSkillBindings] = useState<WorkspaceSnapshot["skillBindings"]>([]);
  const [installedSkills, setInstalledSkills] = useState<SkillItem[]>(() => browserPreview ? initialSkills : []);
  const [runtimePreference, setRuntimePreference] = useState<AgentRuntimePreference>({ provider: "local-codex", model: "gpt-5.6-sol", effort: "medium" });
  const openProjectRequest = useRef(0);
  const currentProjectIdRef = useRef<string | null>(null);

  function applyWorkspace(snapshot: WorkspaceSnapshot) {
    setScriptBlocks(snapshot.scriptBlocks);
    setAssetItems(snapshot.assets);
    setShotRows(snapshot.shots);
    setEnvelopes(snapshot.envelopes);
    setTasks(snapshot.tasks);
    setQaItems(snapshot.qaFindings);
    setTree(snapshot.hierarchy);
    setDraftImageItems(snapshot.draftImages);
    setStaleItems(snapshot.staleItems);
    setSkillBindings(snapshot.skillBindings);
    const firstScene = findFirstLeaf(snapshot.hierarchy);
    setSelectedScene((current) => current && hierarchyHasNode(snapshot.hierarchy, current) ? current : firstScene ?? "");
  }

  async function openProject(project: ProjectSummary) {
    const requestId = ++openProjectRequest.current;
    const [snapshot, preference, skills] = await Promise.all([
      appBridge.openProject(project.id),
      appBridge.getRuntimePreference(project.id),
      appBridge.getSkills(project.id)
    ]);
    if (requestId !== openProjectRequest.current) return;
    if (snapshot) applyWorkspace(snapshot);
    setInstalledSkills(skills);
    setRuntimePreference(preference);
    setCurrentProject(project);
  }

  async function addAndOpenProject(project: ProjectSummary) {
    setProjects((current) => [project, ...current.filter((item) => item.id !== project.id)]);
    await openProject(project);
  }

  async function commitScriptBlock(blockId: string, content: string) {
    if (!currentProject || !native) return;
    const snapshot = await appBridge.patchScriptBlock(currentProject.id, blockId, content);
    if (snapshot) applyWorkspace(snapshot);
  }

  async function commitMapping(items: PromptEnvelope[]) {
    if (!currentProject || !native || !selectedScene) return;
    const snapshot = await appBridge.replaceMapping(currentProject.id, selectedScene, shotRows, items);
    if (snapshot) applyWorkspace(snapshot);
  }

  async function createStructure(kind: "act" | "sequence" | "scene", title: string) {
    if (!currentProject) throw new Error("请先打开项目。");
    const path = hierarchyPath(tree, selectedScene);
    const parentKind = kind === "sequence" ? "act" : kind === "scene" ? "sequence" : undefined;
    const parent = parentKind ? [...path].reverse().find((node) => inferredNodeKind(node) === parentKind) : undefined;
    if (parentKind && !parent) throw new Error(kind === "scene" ? "请先在项目树中选择一场已有场景，以确定所属戏。" : "请先选择一个幕中的场景，以确定所属幕。");
    if (native) {
      applyWorkspace(await appBridge.createStructure(currentProject.id, kind, parent?.id, title));
      return;
    }
    const id = `${kind}-preview-${Date.now()}`;
    const node: HierarchyNode = { id, kind, label: title, meta: kind === "scene" ? "0s" : "0 场", children: kind === "scene" ? undefined : [] };
    setTree((current) => appendHierarchyNode(current, parent?.id, node));
  }

  function updateSelectedSceneEnvelopes(items: PromptEnvelope[]) {
    setEnvelopes((current) => {
      const outsideScene = current.filter((envelope) => envelope.sceneId !== selectedScene);
      return [...outsideScene, ...items.map((envelope) => ({ ...envelope, sceneId: envelope.sceneId ?? selectedScene }))];
    });
  }

  async function commitEnvelope(envelope: PromptEnvelope, patch: Partial<Pick<PromptEnvelope, "name" | "model" | "duration" | "prompt">>) {
    if (!currentProject || !native) return;
    const snapshot = await appBridge.patchPromptEnvelope(currentProject.id, envelope, patch);
    if (snapshot) applyWorkspace(snapshot);
  }

  useEffect(() => {
    let active = true;
    appBridge.listProjects()
      .then((items) => { if (active) setProjects(items); })
      .catch((error) => { if (active) setStartupError(error instanceof Error ? error.message : "桌面服务没有启动。"); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    currentProjectIdRef.current = currentProject?.id ?? null;
  }, [currentProject?.id]);

  const selectedSceneShots = useMemo(() => shotRows.filter((shot) => shot.sceneId === selectedScene), [selectedScene, shotRows]);
  const selectedSceneEnvelopes = useMemo(() => envelopes.filter((envelope) => envelope.sceneId === selectedScene), [envelopes, selectedScene]);
  const selectedSceneEnvelopeIds = useMemo(() => new Set(selectedSceneEnvelopes.flatMap((envelope) => [envelope.id, envelope.entityId].filter((id): id is string => Boolean(id)))), [selectedSceneEnvelopes]);
  const selectedSceneDraftImages = useMemo(() => draftImageItems.filter((image) => Boolean(image.promptEnvelopeId && selectedSceneEnvelopeIds.has(image.promptEnvelopeId))), [draftImageItems, selectedSceneEnvelopeIds]);

  const activeView = useMemo(() => {
    switch (activeStage) {
      case "script": return <ScriptView projectId={currentProject?.id ?? "preview"} blocks={scriptBlocks} onChange={setScriptBlocks} onCommitBlock={commitScriptBlock} onWorkspaceChange={applyWorkspace} />;
      case "assets": return <AssetsView items={assetItems} />;
      case "breakdown": return <BreakdownView proposals={breakdown} onChange={setBreakdown} />;
      case "storyboard": return <StoryboardView projectId={currentProject?.id ?? "preview"} sceneId={selectedScene} shots={selectedSceneShots} envelopes={selectedSceneEnvelopes} draftImages={selectedSceneDraftImages} onEnvelopesChange={updateSelectedSceneEnvelopes} onMappingCommit={commitMapping} onEnvelopeCommit={commitEnvelope} onWorkspaceChange={applyWorkspace} />;
      case "qa": return <QaView projectId={currentProject?.id ?? "preview"} findings={qaItems} staleItems={staleItems} onWorkspaceChange={applyWorkspace} />;
      case "tasks": return <TasksView projectId={currentProject?.id ?? "preview"} tasks={tasks} onChange={setTasks} onWorkspaceChange={applyWorkspace} />;
      case "skills": return <SkillsView
        projectId={currentProject?.id ?? "preview"}
        initialItems={installedSkills}
        bindings={skillBindings}
        runtimePreference={runtimePreference}
        onBindingsChange={setSkillBindings}
        onSkillsChange={setInstalledSkills}
        onRuntimePreferenceChange={async (preference) => {
          const projectId = currentProject?.id ?? "preview";
          const saved = await appBridge.setRuntimePreference(projectId, preference);
          if (currentProjectIdRef.current === projectId || projectId === "preview") setRuntimePreference(saved);
        }}
      />;
    }
  }, [activeStage, assetItems, breakdown, currentProject?.id, installedSkills, qaItems, runtimePreference, scriptBlocks, selectedScene, selectedSceneDraftImages, selectedSceneEnvelopes, selectedSceneShots, skillBindings, staleItems, tasks]);

  const activeSkillBinding = skillBindings.find((binding) => binding.slot === slotByStage[activeStage]);
  const activeSkill = activeSkillBinding ? installedSkills.find((skill) => skill.id === activeSkillBinding.skillId && skill.version === activeSkillBinding.version) : undefined;

  if (startupError) {
    return <main className="startup-blocker"><div><Warning size={28} weight="fill" /><p className="eyebrow">启动检查未通过</p><h1>无法连接本机项目服务</h1><p>{startupError}</p><button type="button" onClick={() => window.location.reload()}>重新加载</button></div></main>;
  }

  if (!currentProject) {
    return <DashboardView projects={projects} onOpenProject={openProject} onProjectCreated={(created) => { void addAndOpenProject(created); }} />;
  }

  return (
    <div className="desktop-app">
      <header className="workbench-topbar app-drag-region">
        <div className="workbench-brand no-drag">
          <button type="button" className="brand__mark" aria-label="返回项目首页" onClick={() => setCurrentProject(null)}><Aperture size={20} weight="fill" /></button>
          <button type="button" className="breadcrumb" onClick={() => setCurrentProject(null)}><span>{currentProject.title}</span><CaretDown size={13} /></button>
          <span className="breadcrumb-divider">/</span>
          <span className="current-location">{activeStage === "tasks" || activeStage === "skills" ? stageMeta[activeStage].label : selectedScene || "尚未选择场景"}</span>
        </div>

        <nav className="stage-nav no-drag" aria-label="工作阶段">
          {mainStages.map(({ id, icon: Icon }) => (
            <button key={id} type="button" className={activeStage === id ? "is-active" : ""} onClick={() => setActiveStage(id)}>
              <Icon size={16} weight={activeStage === id ? "fill" : "regular"} />
              <span>{stageMeta[id].label}</span>
              {id === "qa" && qaItems.filter((item) => item.status === "未处理").length ? <i>{qaItems.filter((item) => item.status === "未处理").length}</i> : null}
            </button>
          ))}
        </nav>

        <div className="workbench-actions no-drag">
          <div className="save-state"><CheckCircle size={15} weight="fill" /> 本地项目</div>
          <button type="button" aria-label="项目任务" className={`topbar-task-button ${activeStage === "tasks" ? "is-active" : ""}`} onClick={() => setActiveStage("tasks")}><ListChecks size={18} />{tasks.filter((item) => item.status !== "已完成").length ? <span>{tasks.filter((item) => item.status !== "已完成").length}</span> : null}</button>
          <IconButton icon={GearSix} label="Skill 与运行设置" active={activeStage === "skills"} onClick={() => setActiveStage("skills")} />
          <button type="button" className={`user-avatar ${activeStage === "skills" ? "is-active" : ""}`} aria-label="账户与本机状态" onClick={() => setActiveStage("skills")}><UserCircle size={22} weight="duotone" /></button>
        </div>
      </header>

      <div className={`workbench-body ${sidebarCollapsed ? "is-sidebar-collapsed" : ""} ${agentCollapsed ? "is-agent-collapsed" : ""}`}>
        <ProjectSidebar collapsed={sidebarCollapsed} tree={tree} staleCount={staleItems.length} selectedScene={selectedScene} activeStage={activeStage} onSceneSelect={(id) => { setSelectedScene(id); if (activeStage === "tasks" || activeStage === "skills") setActiveStage("script"); }} onCreateStructure={createStructure} onStageChange={setActiveStage} onCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className="workbench-main">{activeView}</main>
        {agentCollapsed ? <aside className="agent-panel-collapsed"><IconButton icon={Aperture} label="展开 AI 导演" onClick={() => setAgentCollapsed(false)} /><span>AI 导演</span></aside> : <div className="agent-panel-wrap"><button type="button" className="collapse-agent" aria-label="收起 AI 导演" onClick={() => setAgentCollapsed(true)}><CaretRight size={14} /></button><AgentPanel activeStage={activeStage} projectId={currentProject.id} scopeId={activeStage === "assets" || activeStage === "qa" ? currentProject.id : selectedScene} tasks={tasks} skillBinding={activeSkillBinding} activeSkill={activeSkill} runtimePreference={runtimePreference} onWorkspaceChange={applyWorkspace} onOpenSkills={() => setActiveStage("skills")} /></div>}
      </div>

      <footer className="workbench-statusbar">
        <div><span className="connection-dot" /> 当前通道：{runtimePreference.provider === "local-codex" ? "本机 Codex" : "OpenAI API Key"}</div>
        <div><FolderOpen size={13} /> 项目保存在本机</div>
        <div className="statusbar-spacer" />
        {staleItems.length ? <div className="stale-status"><Warning size={13} weight="fill" /> {staleItems.length} 项下游需要检查</div> : <div><CheckCircle size={13} weight="fill" /> 下游状态正常</div>}
        <div><Archive size={13} /> 事务写入与自动快照</div>
        <button type="button" onClick={() => setCurrentProject(null)}><House size={13} /> 项目首页</button>
      </footer>
    </div>
  );
}
