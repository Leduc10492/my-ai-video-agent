import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowCounterClockwise,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Article,
  CalendarBlank,
  Check,
  CheckCircle,
  CirclesThreePlus,
  Clock,
  Copy,
  Cube,
  DownloadSimple,
  Eye,
  FileArrowUp,
  FilmSlate,
  FilmStrip,
  FolderOpen,
  Funnel,
  GitDiff,
  HardDrives,
  Image,
  Images,
  Info,
  Key,
  LinkSimple,
  ListChecks,
  LockKey,
  MagicWand,
  MapPin,
  PencilSimple,
  Play,
  Plus,
  Quotes,
  Rows,
  ShieldCheck,
  Sparkle,
  SpinnerGap,
  SquaresFour,
  Trash,
  User,
  UserCircle,
  Warning,
  WarningCircle,
  X
} from "@phosphor-icons/react";
import { appBridge, hasNativeBridge } from "./bridge";
import { Badge, Button, Field, Meter, Modal, Segmented, Toggle, ViewHeader } from "./components";
import type { StageSlot } from "../../shared/ipc";
import type {
  AgentRuntimePreference,
  AssetItem,
  BreakdownProposal,
  DraftImageItem,
  ImportPreview,
  ProjectSummary,
  PromptEnvelope,
  QaFinding,
  RuntimeHealth,
  ScriptBlock,
  ShotRow,
  SkillItem,
  TaskItem,
  WorkspaceSnapshot
} from "./types";

export function DashboardView({
  projects,
  onOpenProject,
  onProjectCreated
}: {
  projects: ProjectSummary[];
  onOpenProject: (project: ProjectSummary) => void | Promise<void>;
  onProjectCreated: (project: ProjectSummary) => void | Promise<void>;
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [format, setFormat] = useState("短片");
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [openError, setOpenError] = useState("");

  const filtered = projects.filter((project) =>
    `${project.title}${project.subtitle}`.toLowerCase().includes(query.toLowerCase())
  );

  async function createProject() {
    if (!title.trim()) return;
    setCreating(true);
    setOpenError("");
    try {
      const project = await appBridge.createProject({ title: title.trim(), format });
      if (!project) return;
      setCreateOpen(false);
      setTitle("");
      await onProjectCreated(project);
    } catch (error) {
      setOpenError(error instanceof Error ? error.message : "无法创建项目。");
    } finally {
      setCreating(false);
    }
  }

  async function importProject() {
    setOpenError("");
    try {
      const imported = await appBridge.importProject();
      setImportOpen(false);
      if (imported) await onProjectCreated(imported);
    } catch (error) {
      setOpenError(error instanceof Error ? error.message : "无法导入项目。");
    }
  }

  async function openProject(project: ProjectSummary) {
    setOpeningId(project.id);
    setOpenError("");
    try {
      await onOpenProject(project);
    } catch (error) {
      setOpenError(error instanceof Error ? error.message : "无法打开项目。");
    } finally {
      setOpeningId(null);
    }
  }

  return (
    <main className="dashboard">
      <header className="dashboard__topbar app-drag-region">
        <div className="brand brand--dashboard">
          <span className="brand__mark"><FilmSlate size={22} weight="fill" /></span>
          <span>AI 导演工作台</span>
        </div>
        <div className="dashboard__status no-drag">
          <span className="connection-dot" />
          默认通道：本机 Codex
          <button type="button" onClick={() => setImportOpen(true)}>导入</button>
        </div>
      </header>

      <section className="dashboard__hero">
        <div>
          <p className="eyebrow">本地创作空间</p>
          <h1>把故事变成<br />可以拍的画面。</h1>
          <p className="dashboard__intro">
            从剧本结构到导演分镜，让每一次 AI 建议都有来路、能修改、可回退。
          </p>
          <div className="dashboard__hero-actions">
            <Button icon={Plus} variant="primary" onClick={() => setCreateOpen(true)}>
              新建项目
            </Button>
            <Button icon={FileArrowUp} onClick={() => setImportOpen(true)}>
              导入剧本
            </Button>
          </div>
        </div>
        <aside className="dashboard__principle-card">
          <span className="principle-card__icon"><ShieldCheck size={22} weight="duotone" /></span>
          <p>创作控制权属于你</p>
          <strong>AI 只提交候选修改，接受后才会写入新版本。</strong>
          <div className="principle-card__line" />
          <small>所有项目、素材与运行记录默认保存在本机。</small>
        </aside>
      </section>

      <section className="recent-projects">
        <div className="recent-projects__header">
          <div>
            <h2>最近项目</h2>
            <p>{projects.length} 个本地项目</p>
          </div>
          <label className="search-field search-field--light">
            <Funnel size={16} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="筛选项目"
              aria-label="筛选项目"
            />
          </label>
        </div>

        <div className="project-grid">
          <button className="new-project-card" type="button" onClick={() => setCreateOpen(true)}>
            <span><Plus size={24} /></span>
            <strong>开始一个新故事</strong>
            <small>空白项目、导入剧本或从现有项目复制</small>
          </button>
          {filtered.map((project) => (
            <button
              key={project.id}
              className="project-card"
              type="button"
              onClick={() => void openProject(project)}
            >
              <div className="project-card__cover">
                {project.cover ? <img src={project.cover} alt="" /> : <div className="project-cover-empty"><FilmSlate size={25} weight="duotone" /><span>尚未设置项目封面</span></div>}
                <Badge tone={project.status === "待审阅" ? "warning" : "success"}>
                  {project.status}
                </Badge>
                <span className="project-card__open">{openingId === project.id ? <SpinnerGap size={18} className="spin" /> : <ArrowRight size={18} />}</span>
              </div>
              <div className="project-card__body">
                <h3>{project.title}</h3>
                <p>{project.subtitle}</p>
                <Meter value={project.progress} />
                <div className="project-card__meta">
                  <span><FilmStrip size={14} /> {project.sceneCount} 场</span>
                  <span><Clock size={14} /> {project.updatedAt}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
        {filtered.length === 0 && projects.length === 0 ? <div className="dashboard-empty"><FolderOpen size={28} weight="duotone" /><h3>还没有本地项目</h3><p>新建一个空白项目，或导入现有工作流目录。</p><Button icon={Plus} variant="primary" onClick={() => setCreateOpen(true)}>新建第一个项目</Button></div> : null}
        {openError ? <div className="inline-error"><WarningCircle size={16} /> {openError}</div> : null}
      </section>

      <Modal
        open={createOpen}
        title="新建影视项目"
        eyebrow="本地项目"
        onClose={() => setCreateOpen(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>取消</Button>
            <Button icon={Plus} variant="primary" disabled={!title.trim() || creating} onClick={createProject}>
              {creating ? "正在创建" : "创建项目"}
            </Button>
          </>
        }
      >
        <div className="form-stack">
          <Field label="项目名称">
            <input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder="例如：潮汐来信" />
          </Field>
          <Field label="内容类型" hint="之后可在项目设置中修改">
            <select value={format} onChange={(event) => setFormat(event.target.value)}>
              <option>短片</option>
              <option>电影长片</option>
              <option>剧集</option>
              <option>品牌叙事</option>
              <option>音乐影像</option>
            </select>
          </Field>
          <div className="privacy-note">
            <LockKey size={19} weight="duotone" />
            <span><strong>默认保存在本机</strong><small>不会创建云端副本，也不需要产品账号。</small></span>
          </div>
          {openError ? <div className="inline-error"><WarningCircle size={16} /> {openError}</div> : null}
        </div>
      </Modal>

      <Modal
        open={importOpen}
        title="导入现有项目"
        eyebrow="本地工作区"
        onClose={() => setImportOpen(false)}
        footer={<Button variant="ghost" onClick={() => setImportOpen(false)}>稍后再说</Button>}
      >
        <div className="import-options">
          <button type="button" onClick={() => void importProject()}>
            <span><FolderOpen size={22} /></span>
            <div><strong>选择 AI 导演项目文件夹</strong><small>读取 .ai-director 数据库和已批准的 deliverables</small></div>
            <ArrowRight size={17} />
          </button>
          <button type="button" onClick={() => void importProject()}>
            <span><FolderOpen size={22} /></span>
            <div><strong>迁移旧工作流目录</strong><small>选择含 deliverables/ 的目录，在本机创建项目数据库</small></div>
            <ArrowRight size={17} />
          </button>
          <button type="button" onClick={() => { setImportOpen(false); setCreateOpen(true); }}>
            <span><Article size={22} /></span>
            <div><strong>从剧本开始</strong><small>先新建项目，再在剧本工作台导入并确认场景拆分</small></div>
            <ArrowRight size={17} />
          </button>
        </div>
        <p className="modal-hint"><Info size={15} /> 剧本文件属于项目内部导入；创建或打开项目后再进入剧本工作台。</p>
        {openError ? <div className="inline-error"><WarningCircle size={16} /> {openError}</div> : null}
      </Modal>
    </main>
  );
}

export function ScriptView({
  projectId,
  blocks,
  onChange,
  onCommitBlock,
  onWorkspaceChange
}: {
  projectId: string;
  blocks: ScriptBlock[];
  onChange: (blocks: ScriptBlock[]) => void;
  onCommitBlock: (blockId: string, content: string) => Promise<void>;
  onWorkspaceChange: (snapshot: WorkspaceSnapshot) => void;
}) {
  const [selectedId, setSelectedId] = useState(blocks[0]?.id ?? "");
  const [candidate, setCandidate] = useState(false);
  const [reviewMode, setReviewMode] = useState<"edit" | "diff">("edit");
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);
  const [selectedProposalIds, setSelectedProposalIds] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");
  const [saveState, setSaveState] = useState<"saved" | "dirty" | "saving" | "error">("saved");
  const selectedBlock = blocks.find((block) => block.id === selectedId) ?? blocks.find((block) => block.type === "action") ?? blocks[0];
  const original = selectedBlock?.content ?? "";
  const revised = original
    ? `${original.replace(/[。！？]$/, "")}。动作意图与视觉转折被进一步明确，同时保留原始信息。`
    : "";

  function updateBlock(id: string, content: string) {
    onChange(blocks.map((block) => (block.id === id ? { ...block, content } : block)));
    setSaveState("dirty");
  }

  async function commitBlock(id: string, content: string) {
    if (saveState === "saved") return;
    setSaveState("saving");
    try {
      await onCommitBlock(id, content);
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  }

  function acceptCandidate() {
    if (selectedBlock) updateBlock(selectedBlock.id, revised);
    setCandidate(false);
    setReviewMode("edit");
  }

  async function chooseScriptImport() {
    setImporting(true);
    setImportError("");
    try {
      const preview = await appBridge.chooseScriptImport(projectId);
      if (!preview) return;
      setImportPreview(preview);
      setSelectedProposalIds(preview.sceneProposals.map((proposal) => proposal.id));
    } catch (error) {
      setImportError(error instanceof Error ? error.message : "无法读取剧本文件。");
    } finally {
      setImporting(false);
    }
  }

  async function applyImport() {
    if (!importPreview || !selectedProposalIds.length) return;
    setImporting(true);
    setImportError("");
    try {
      const snapshot = await appBridge.applyScriptImport(projectId, importPreview, selectedProposalIds);
      onWorkspaceChange(snapshot);
      setImportPreview(null);
    } catch (error) {
      setImportError(error instanceof Error ? error.message : "无法写入剧本导入结果。");
    } finally {
      setImporting(false);
    }
  }

  function requestOptimization() {
    if (hasNativeBridge()) {
      document.querySelector<HTMLTextAreaElement>(".agent-prompt textarea")?.focus();
      return;
    }
    setCandidate(true);
    setReviewMode("diff");
  }

  return (
    <div className="view-shell script-view">
      <ViewHeader
        eyebrow="当前剧本"
        title={blocks.find((block) => block.type === "scene-heading")?.content || "剧本工作台"}
        description="剧本是当前项目的事实源。AI 建议只会以差异形式出现。"
        actions={
          <>
            <Button icon={FileArrowUp} onClick={() => void chooseScriptImport()} disabled={importing}>{importing ? "读取中" : "导入剧本"}</Button>
            <Segmented
              value={reviewMode}
              onChange={setReviewMode}
              ariaLabel="剧本查看模式"
              options={[{ value: "edit", label: "编辑" }, { value: "diff", label: "建议" }]}
            />
            <Button
              icon={Sparkle}
              variant="primary"
              disabled={!selectedBlock}
              onClick={requestOptimization}
            >
              {hasNativeBridge() ? "交给 AI 导演" : "优化选中段落"}
            </Button>
          </>
        }
      />

      <div className="script-toolbar">
        <span className={saveState === "error" ? "is-error" : ""}>{saveState === "saving" ? <SpinnerGap size={16} className="spin" /> : saveState === "error" ? <WarningCircle size={16} /> : <CheckCircle size={16} weight="fill" />} {saveState === "dirty" ? "有尚未写入的修改" : saveState === "saving" ? "正在创建 Revision" : saveState === "error" ? "保存失败，请重试" : "已保存到本机"}</span>
        <span>剧本 v4</span>
        <span>1,284 字</span>
        <span>预计 1'12\"</span>
      </div>

      {importError ? <div className="inline-error"><WarningCircle size={16} /> {importError}</div> : null}

      {!blocks.length ? (
        <div className="empty-state script-empty-state">
          <span><Article size={27} /></span>
          <h3>这个项目还没有剧本</h3>
          <p>选择支持的剧本文件后，会先展示场景拆分和风险提示；确认前不会写入。</p>
          <Button icon={FileArrowUp} variant="primary" onClick={() => void chooseScriptImport()} disabled={importing}>{importing ? "正在读取" : "选择剧本文件"}</Button>
        </div>
      ) : reviewMode === "diff" ? (
        <section className="diff-workspace">
          {candidate ? (
            <>
              <div className="diff-summary">
                <span className="diff-summary__icon"><GitDiff size={21} /></span>
                <div>
                  <strong>更清晰地建立人物、信件与灯塔的视觉因果</strong>
                  <p>只修改 1 个动作段落；未触碰对白、场景标题和其他场。</p>
                </div>
                <Badge tone="accent">候选修改</Badge>
              </div>
              <div className="diff-card">
                <div className="diff-pane diff-pane--old">
                  <div className="diff-pane__label"><X size={14} /> 原文</div>
                  <p>{original}</p>
                </div>
                <div className="diff-pane diff-pane--new">
                  <div className="diff-pane__label"><Check size={14} /> 建议</div>
                  <p>{revised}</p>
                </div>
              </div>
              <div className="diff-actions">
                <Button variant="ghost" onClick={() => { setCandidate(false); setReviewMode("edit"); }}>拒绝</Button>
                <Button onClick={() => setReviewMode("edit")}>返回编辑</Button>
                <Button icon={Check} variant="primary" onClick={acceptCandidate}>接受到本地编辑器</Button>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <span><GitDiff size={27} /></span>
              <h3>没有待审阅的修改</h3>
              <p>选中一个或多个剧本段落，让 AI 导演提交候选修改。</p>
              <Button icon={Sparkle} onClick={() => setCandidate(true)}>优化选中段落</Button>
            </div>
          )}
        </section>
      ) : (
        <section className="script-page" aria-label="语义化剧本编辑器">
          <div className="script-page__margin">01</div>
          <div className="script-blocks">
            {blocks.map((block) => (
              <div
                key={block.id}
                className={`script-block script-block--${block.type} ${selectedId === block.id ? "is-selected" : ""}`}
                onClick={() => setSelectedId(block.id)}
              >
                <span className="script-block__type">{block.label}</span>
                <textarea
                  rows={Math.max(1, Math.ceil(block.content.length / 38))}
                  value={block.content}
                  onFocus={() => setSelectedId(block.id)}
                  onChange={(event) => updateBlock(block.id, event.target.value)}
                  onBlur={(event) => void commitBlock(block.id, event.target.value)}
                  aria-label={`${block.label}内容`}
                />
                {selectedId === block.id && block.type === "action" ? (
                  <button
                    type="button"
                    className="block-ai-action"
                    onClick={(event) => { event.stopPropagation(); requestOptimization(); }}
                  >
                    <MagicWand size={14} /> 优化
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      )}

      <Modal
        open={Boolean(importPreview)}
        title="确认剧本与场景拆分"
        eyebrow={importPreview ? `${importPreview.sourceName} · ${importPreview.format}` : "剧本导入"}
        width="large"
        onClose={() => setImportPreview(null)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setImportPreview(null)}>取消，不写入</Button>
            <Button
              icon={Check}
              variant="primary"
              disabled={importing || !selectedProposalIds.length || Boolean(importPreview?.warnings.some((warning) => warning.blocking))}
              onClick={() => void applyImport()}
            >
              {importing ? "正在创建 Revision" : `确认导入 ${selectedProposalIds.length} 场`}
            </Button>
          </>
        }
      >
        {importPreview ? <div className="script-import-preview">
          <div className="import-preview-summary"><Article size={20} /><div><strong>{importPreview.blocks.length} 个语义块 · {importPreview.sceneProposals.length} 个场景建议</strong><small>只会写入你勾选的场景；原始文件不会被修改。</small></div></div>
          {importPreview.warnings.length ? <div className="import-warning-list">{importPreview.warnings.map((warning) => <div key={`${warning.code}-${warning.message}`} className={warning.blocking ? "is-blocking" : ""}><WarningCircle size={16} weight={warning.blocking ? "fill" : "regular"} /><span><strong>{warning.blocking ? "需要先处理" : "请留意"}</strong><small>{warning.message}</small></span></div>)}</div> : <div className="import-safe"><ShieldCheck size={17} /><span>没有检测到阻断问题，可以选择场景后导入。</span></div>}
          <div className="import-scene-list">
            <header><span>导入</span><span>场景建议</span><span>置信度</span></header>
            {importPreview.sceneProposals.map((proposal) => {
              const checked = selectedProposalIds.includes(proposal.id);
              return <label key={proposal.id} className={checked ? "is-selected" : ""}><input type="checkbox" checked={checked} onChange={() => setSelectedProposalIds(checked ? selectedProposalIds.filter((id) => id !== proposal.id) : [...selectedProposalIds, proposal.id])} /><span className="import-check"><Check size={12} /></span><span className="import-scene-copy"><strong>{String(proposal.ordinal + 1).padStart(2, "0")} · {proposal.heading}</strong><small>{proposal.blockIds.length} 个原文块{proposal.warnings.length ? ` · ${proposal.warnings.join("；")}` : ""}</small></span><span className="import-confidence"><strong>{Math.round(proposal.confidence * (proposal.confidence <= 1 ? 100 : 1))}%</strong><Meter value={proposal.confidence * (proposal.confidence <= 1 ? 100 : 1)} /></span></label>;
            })}
          </div>
          {importError ? <div className="inline-error"><WarningCircle size={16} /> {importError}</div> : null}
        </div> : null}
      </Modal>
    </div>
  );
}

export function AssetsView({ items: initialItems }: { items: AssetItem[] }) {
  const [filter, setFilter] = useState<"全部" | AssetItem["type"]>("全部");
  const [items, setItems] = useState(initialItems);
  const [selectedId, setSelectedId] = useState(initialItems[0]?.id ?? "");
  const filters: Array<"全部" | AssetItem["type"]> = ["全部", "角色", "地点", "道具", "风格"];
  const visible = filter === "全部" ? items : items.filter((item) => item.type === filter);
  const selected = items.find((item) => item.id === selectedId);
  const iconFor = { 角色: UserCircle, 地点: MapPin, 道具: Cube, 风格: Images } as const;

  useEffect(() => {
    setItems(initialItems);
    setSelectedId((current) => initialItems.some((item) => item.id === current) ? current : initialItems[0]?.id ?? "");
  }, [initialItems]);

  function addAsset() {
    const id = `asset-${Date.now()}`;
    const next: AssetItem = {
      id,
      type: "道具",
      name: "未命名资产",
      meta: "等待补充描述与参考图",
      status: "草稿",
      usage: hasNativeBridge() ? "未保存的本地草稿" : "网页预览草稿"
    };
    setItems([next, ...items]);
    setSelectedId(id);
  }

  return (
    <div className="view-shell">
      <ViewHeader
        eyebrow="共享资料库"
        title="资产与风格"
        description="角色、地点、道具和风格在项目内复用；场景专属补充会独立保存。"
        actions={<><Button icon={Sparkle} onClick={() => document.querySelector<HTMLTextAreaElement>(".agent-prompt textarea")?.focus()}>从剧本提取</Button><Button icon={Plus} variant="primary" onClick={addAsset}>新建资产草稿</Button></>}
      />

      <div className="filter-row">
        <div className="filter-tabs">
          {filters.map((item) => (
            <button key={item} type="button" className={filter === item ? "is-active" : ""} onClick={() => setFilter(item)}>
              {item}<span>{item === "全部" ? items.length : items.filter((asset) => asset.type === item).length}</span>
            </button>
          ))}
        </div>
        <Button icon={Funnel} variant="ghost">筛选</Button>
      </div>

      <div className="assets-layout">
        <div className="asset-grid">
          {visible.map((item) => {
            const ItemIcon = iconFor[item.type];
            return (
              <button key={item.id} type="button" className={`asset-card ${selectedId === item.id ? "is-selected" : ""}`} onClick={() => setSelectedId(item.id)}>
                <div className="asset-card__image">{item.image ? <img src={item.image} alt={`${item.name}参考`} /> : <div className="asset-reference-empty"><ItemIcon size={24} weight="duotone" /><span>未添加参考图</span></div>}<Badge tone={item.status === "已批准" ? "success" : item.status === "待补充" ? "warning" : "neutral"}>{item.status}</Badge></div>
                <div className="asset-card__body">
                  <span className="asset-card__type"><ItemIcon size={14} /> {item.type}</span>
                  <h3>{item.name}</h3>
                  <p>{item.meta}</p>
                  <small>{item.usage}</small>
                </div>
              </button>
            );
          })}
        </div>

        {selected ? (
          <aside className="asset-inspector">
            <div className="asset-inspector__image">{selected.image ? <img src={selected.image} alt={`${selected.name}参考大图`} /> : <div className="asset-reference-empty asset-reference-empty--large"><Image size={28} weight="duotone" /><strong>暂无已批准参考图</strong><span>添加真实参考后才会用于生成</span></div>}</div>
            <div className="asset-inspector__title"><div><p className="eyebrow">{selected.type}资产</p><h2>{selected.name}</h2></div><Button size="sm" icon={PencilSimple}>编辑</Button></div>
            <p>{selected.meta}</p>
            <dl className="detail-list"><div><dt>状态</dt><dd><Badge tone={selected.status === "已批准" ? "success" : "warning"}>{selected.status}</Badge></dd></div><div><dt>使用位置</dt><dd>{selected.usage}</dd></div><div><dt>版本</dt><dd>v3 · 今天 12:08</dd></div></dl>
            <div className="inspector-section"><div className="inspector-section__header"><strong>一致性要点</strong><span>3 条</span></div><ul className="plain-list"><li>深灰色防水外套，左肩有浅色磨损</li><li>低马尾，潮湿碎发贴近额角</li><li>银色旧相机始终斜挎在右侧</li></ul></div>
            <Button icon={LinkSimple} className="full-width">查看所有使用位置</Button>
          </aside>
        ) : null}
      </div>
    </div>
  );
}

export function BreakdownView({
  proposals,
  onChange
}: {
  proposals: BreakdownProposal[];
  onChange: (items: BreakdownProposal[]) => void;
}) {
  const [confirmed, setConfirmed] = useState(false);
  const selectedCount = proposals.filter((item) => item.selected).length;
  const toggle = (id: string) => onChange(proposals.map((item) => item.id === id ? { ...item, selected: !item.selected } : item));

  if (!proposals.length) {
    return <div className="view-shell"><ViewHeader eyebrow="结构提案" title="幕、戏与场拆分" description="Agent 会先生成可审阅的结构候选；确认前不会创建正式层级。" /><div className="empty-state breakdown-empty"><span><CirclesThreePlus size={27} /></span><h3>还没有结构拆分候选</h3><p>先导入剧本，再从右侧 AI 导演运行 shotlist.breakdown。</p><Button icon={Sparkle} variant="primary" onClick={() => document.querySelector<HTMLTextAreaElement>(".agent-prompt textarea")?.focus()}>在 AI 导演中开始</Button></div></div>;
  }

  return (
    <div className="view-shell">
      <ViewHeader
        eyebrow="自动拆分预览"
        title="先确认结构，再写入项目"
        description="Agent 提议了幕、戏、场的边界。任何条目在确认前都不是正式结构。"
        actions={<Button icon={ArrowCounterClockwise}>重新分析</Button>}
      />

      <div className="proposal-callout">
        <span><Sparkle size={20} weight="fill" /></span>
        <div><strong>检测到 3 幕、5 戏、14 场</strong><p>2 处边界需要你的判断。已按“连续时间、地点与角色状态”识别场。</p></div>
        <Badge tone="accent">GPT‑5.6 Sol · Medium</Badge>
      </div>

      <div className="breakdown-layout">
        <section className="proposal-list">
          <header><span>建议结构</span><span>原文范围</span><span>置信度</span></header>
          {proposals.map((proposal) => (
            <article key={proposal.id} className={`proposal-row ${proposal.selected ? "is-selected" : ""}`}>
              <label className="proposal-row__check"><input type="checkbox" checked={proposal.selected} onChange={() => toggle(proposal.id)} /><span><Check size={12} /></span></label>
              <div className="proposal-row__main"><Badge tone={proposal.type === "场" ? "info" : proposal.type === "戏" ? "accent" : "neutral"}>{proposal.type}</Badge><div><strong>{proposal.title}</strong><p>{proposal.note}</p></div></div>
              <span className="proposal-row__range">{proposal.range}</span>
              <div className="confidence"><strong>{proposal.confidence}%</strong><Meter value={proposal.confidence} /></div>
              <button type="button" className="row-action" aria-label={`编辑 ${proposal.title}`}><PencilSimple size={16} /></button>
            </article>
          ))}
        </section>

        <aside className="breakdown-summary">
          <p className="eyebrow">写入影响</p>
          <h3>{selectedCount} 个结构条目</h3>
          <div className="structure-preview"><div><span>3</span><small>幕</small></div><ArrowRight size={15} /><div><span>5</span><small>戏</small></div><ArrowRight size={15} /><div><span>14</span><small>场</small></div></div>
          <div className="safe-write"><ShieldCheck size={18} /><p><strong>可安全撤销</strong><small>确认后创建一个新 Revision，不会改写原始剧本文本。</small></p></div>
          {confirmed ? <div className="success-banner"><CheckCircle size={18} weight="fill" /><span>{hasNativeBridge() ? "选择已保留在当前预览；尚未写入正式结构。" : "网页预览已记录这次选择，没有写入文件。"}</span></div> : null}
          <Button icon={Check} variant="primary" className="full-width" disabled={!selectedCount || confirmed} onClick={() => setConfirmed(true)}>{confirmed ? "已保留选择" : `保留 ${selectedCount} 项选择`}</Button>
          <Button variant="ghost" className="full-width" onClick={() => onChange(proposals.map((item) => ({ ...item, selected: false })))}>全部取消</Button>
        </aside>
      </div>
    </div>
  );
}

export function StoryboardView({
  projectId,
  sceneId,
  shots,
  envelopes,
  draftImages,
  onEnvelopesChange,
  onMappingCommit,
  onEnvelopeCommit,
  onWorkspaceChange
}: {
  projectId: string;
  sceneId: string;
  shots: ShotRow[];
  envelopes: PromptEnvelope[];
  draftImages: DraftImageItem[];
  onEnvelopesChange: (items: PromptEnvelope[]) => void;
  onMappingCommit: (items: PromptEnvelope[]) => Promise<void>;
  onEnvelopeCommit: (envelope: PromptEnvelope, patch: Partial<Pick<PromptEnvelope, "name" | "model" | "duration" | "prompt">>) => Promise<void>;
  onWorkspaceChange: (snapshot: WorkspaceSnapshot) => void;
}) {
  const [selectedEnvelopeId, setSelectedEnvelopeId] = useState(envelopes[0]?.id ?? "");
  const [selectedShotId, setSelectedShotId] = useState<string | null>(null);
  const [confirmGenerate, setConfirmGenerate] = useState(false);
  const [provider, setProvider] = useState<"local-codex" | "openai-key">("local-codex");
  const [quantity, setQuantity] = useState(2);
  const [generating, setGenerating] = useState(false);
  const [generationRunId, setGenerationRunId] = useState<string | null>(null);
  const [generationProposalId, setGenerationProposalId] = useState<string | null>(null);
  const [generationMessage, setGenerationMessage] = useState("");
  const [mappingState, setMappingState] = useState<"idle" | "local" | "saving" | "saved" | "error">("idle");
  const [envelopeSaveState, setEnvelopeSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const selected = envelopes.find((item) => item.id === selectedEnvelopeId) ?? envelopes[0];
  const highlightedShotIds = new Set(selected?.shotIds ?? []);

  useEffect(() => {
    if (!envelopes.some((item) => item.id === selectedEnvelopeId)) setSelectedEnvelopeId(envelopes[0]?.id ?? "");
  }, [envelopes, selectedEnvelopeId]);

  useEffect(() => {
    if (!generationRunId || !hasNativeBridge()) return;
    return appBridge.onAgentEvent((event) => {
      if (event.runId !== generationRunId) return;
      setGenerationMessage(event.message);
      if (event.kind === "draft") {
        const payload = event.payload && typeof event.payload === "object" ? event.payload as Record<string, unknown> : {};
        setGenerationProposalId(typeof payload.proposalId === "string" ? payload.proposalId : null);
        setGenerating(false);
        setGenerationMessage("草稿图候选已生成。正式资产尚未改变。请审阅后接受或拒绝。");
      }
      if (["failed", "cancelled", "interrupted"].includes(event.kind)) setGenerating(false);
    });
  }, [generationRunId]);

  function updateSelected(patch: Partial<PromptEnvelope>) {
    onEnvelopesChange(envelopes.map((item) => item.id === selected?.id ? { ...item, ...patch } : item));
  }

  async function commitEnvelope(patch: Partial<Pick<PromptEnvelope, "name" | "model" | "duration" | "prompt">>) {
    if (!selected) return;
    if (hasNativeBridge() && !selected.entityId) {
      setEnvelopeSaveState("error");
      return;
    }
    setEnvelopeSaveState("saving");
    try {
      await onEnvelopeCommit(selected, patch);
      setEnvelopeSaveState("saved");
    } catch {
      setEnvelopeSaveState("error");
    }
  }

  async function commitMapping(items: PromptEnvelope[]) {
    setMappingState("saving");
    try {
      await onMappingCommit(items);
      setMappingState("saved");
    } catch {
      setMappingState("error");
    }
  }

  function toggleShotLink(shotId: string) {
    if (!selected) return;
    const exists = selected.shotIds.includes(shotId);
    const hasAnotherLink = envelopes.some((envelope) => envelope.id !== selected.id && envelope.shotIds.includes(shotId));
    if (exists && !hasAnotherLink) {
      setMappingState("error");
      return;
    }
    const shotIds = exists ? selected.shotIds.filter((id) => id !== shotId) : [...selected.shotIds, shotId];
    const next = envelopes.map((item) => item.id === selected.id ? { ...item, shotIds } : item);
    onEnvelopesChange(next);
    if (hasNativeBridge() && !selected.entityId) {
      setMappingState("local");
      return;
    }
    void commitMapping(next);
  }

  function moveEnvelope(direction: -1 | 1) {
    const index = envelopes.findIndex((item) => item.id === selected?.id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= envelopes.length) return;
    const copy = [...envelopes];
    const current = copy[index]!;
    copy[index] = copy[target]!;
    copy[target] = current;
    onEnvelopesChange(copy);
    setMappingState("local");
  }

  async function addEnvelope() {
    if (hasNativeBridge()) {
      if (!sceneId) {
        setMappingState("error");
        return;
      }
      try {
        const snapshot = await appBridge.createPromptEnvelope(projectId, sceneId, "新 Prompt Envelope");
        onWorkspaceChange(snapshot);
        const created = snapshot.envelopes.filter((item) => item.sceneId === sceneId).at(-1);
        if (created) setSelectedEnvelopeId(created.id);
        setMappingState("saved");
      } catch {
        setMappingState("error");
      }
      return;
    }
    const id = `P${String(envelopes.length + 1).padStart(3, "0")}`;
    onEnvelopesChange([...envelopes, { id, sceneId, name: "新 Prompt Envelope", shotIds: [], model: "gpt-image-2", duration: 4, prompt: "在这里整理完整的中文生产 Prompt。", status: "草稿" }]);
    setSelectedEnvelopeId(id);
    setMappingState("local");
  }

  async function generate() {
    setConfirmGenerate(false);
    setGenerating(true);
    setGenerationProposalId(null);
    setGenerationMessage("正在创建已授权的候选图像任务…");
    if (hasNativeBridge()) {
      try {
        const result = await appBridge.runAgent({
          projectId,
          stage: "shotlist.primary",
          scopeIds: [sceneId || projectId],
          skillId: "sketch-shotlist-workflow",
          provider,
          model: "gpt-5.6-sol",
          effort: "medium",
          prompt: `为 ${selected?.id ?? "当前 Envelope"} 生成 ${quantity} 张分镜草稿图。严格使用当前 Prompt 与已绑定参考资产，结果仅作为候选。`,
          imageGenerationConfirmed: true
        });
        setGenerationRunId(result.runId);
        setGenerationMessage("图像任务已进入隔离运行队列；不会自动成为正式资产。");
      } catch (error) {
        setGenerating(false);
        setGenerationMessage(error instanceof Error ? error.message : "无法启动图像生成任务。");
      }
      return;
    }
    window.setTimeout(() => {
      setGenerating(false);
      setGenerationMessage("网页预览已完成交互演示，没有生成或保存任何图片。");
    }, 900);
  }

  async function decideGeneratedDraft(accept: boolean) {
    if (!generationProposalId) return;
    try {
      if (accept) {
        const snapshot = await appBridge.acceptDraft(projectId, generationProposalId);
        if (snapshot) onWorkspaceChange(snapshot);
        setGenerationMessage("已接受候选并创建新 Revision。草稿图现在属于项目资产。");
      } else {
        await appBridge.rejectDraft(projectId, generationProposalId);
        setGenerationMessage("已拒绝候选，正式资产没有改变。");
      }
      setGenerationProposalId(null);
    } catch (error) {
      setGenerationMessage(error instanceof Error ? error.message : "无法处理草稿图候选。");
    }
  }

  if (!shots.length && !envelopes.length) {
    return <div className="view-shell storyboard-view"><ViewHeader eyebrow="当前场景" title="分镜与 Prompt 编组" description="Shot Row 与 Prompt Envelope 会保持独立并可追溯映射。" /><div className="empty-state storyboard-empty"><span><Rows size={27} /></span><h3>当前项目还没有分镜</h3><p>先完成剧本拆分，再由 AI 导演提交 Shot Row 与 Prompt Envelope 候选。</p><Button icon={Sparkle} variant="primary" onClick={() => document.querySelector<HTMLTextAreaElement>(".agent-prompt textarea")?.focus()}>在 AI 导演中创建候选</Button></div></div>;
  }

  return (
    <div className="view-shell storyboard-view">
      <ViewHeader
        eyebrow={sceneId ? `场景 · ${sceneId}` : "当前场景"}
        title="分镜与 Prompt 编组"
        description="镜头设计与生成范围彼此独立。调整 Envelope 不会删除或改写 Shot Row。"
        actions={<><Button icon={DownloadSimple} onClick={() => void appBridge.exportProject(projectId, "shot-csv")}>导出</Button><Button icon={Plus} variant="primary" onClick={() => void addEnvelope()}>新建 Envelope</Button></>}
      />

      <div className="storyboard-metrics">
        <span><Rows size={16} /> <strong>{shots.length}</strong> Shot Rows</span>
        <span><CirclesThreePlus size={16} /> <strong>{envelopes.length}</strong> Envelopes</span>
        <span><Clock size={16} /> <strong>{shots.reduce((sum, shot) => sum + shot.duration, 0)}s</strong> 设计时长</span>
        <span className="stale-indicator"><Warning size={16} weight="fill" /> 1 项需检查</span>
      </div>

      <div className="storyboard-grid">
        <section className="shot-panel">
          <header className="panel-heading"><div><p className="eyebrow">导演语言</p><h3>Shot Rows</h3></div><Badge tone="neutral">不随编组改变</Badge></header>
          <div className="shot-table">
            <div className="shot-table__header"><span>镜头</span><span>设计</span><span>时长</span></div>
            {shots.map((shot) => (
              <button
                key={shot.id}
                type="button"
                className={`shot-row ${highlightedShotIds.has(shot.id) ? "is-linked" : ""} ${selectedShotId === shot.id ? "is-selected" : ""}`}
                onClick={() => setSelectedShotId(selectedShotId === shot.id ? null : shot.id)}
              >
                <span className="shot-row__id"><strong>{shot.id}</strong><small>{shot.size}</small></span>
                <span className="shot-row__design"><strong>{shot.action}</strong><small>{shot.camera} · {shot.cutReason}</small></span>
                <span className="shot-row__duration">{shot.duration}s</span>
                {selectedShotId === shot.id ? <span className="shot-row__detail">表演：{shot.performance}</span> : null}
              </button>
            ))}
          </div>
        </section>

        <section className="mapping-panel">
          <header className="panel-heading"><div><p className="eyebrow">有序多对多</p><h3>编组映射</h3></div><div className="mini-actions"><button type="button" onClick={() => moveEnvelope(-1)} aria-label="上移 Envelope"><ArrowUp size={15} /></button><button type="button" onClick={() => moveEnvelope(1)} aria-label="下移 Envelope"><ArrowDown size={15} /></button></div></header>
          <div className="envelope-list">
            {envelopes.map((envelope, index) => (
              <button key={envelope.id} type="button" className={`envelope-card ${envelope.id === selected?.id ? "is-selected" : ""}`} onClick={() => setSelectedEnvelopeId(envelope.id)}>
                <span className="envelope-card__order">{String(index + 1).padStart(2, "0")}</span>
                <span className="envelope-card__body"><span><strong>{envelope.id}</strong><Badge tone={envelope.status === "需检查" ? "warning" : envelope.status === "就绪" ? "success" : "neutral"}>{envelope.status}</Badge></span><b>{envelope.name}</b><small>{envelope.shotIds.length ? envelope.shotIds.join(" · ") : "尚未关联镜头"}</small></span>
                <LinkSimple size={17} />
              </button>
            ))}
          </div>
          <div className={`mapping-legend mapping-legend--${mappingState}`}><Info size={15} /><span>{mappingState === "saving" ? "正在保存映射 Revision…" : mappingState === "saved" ? "映射已保存；Shot Row 内容保持不变。" : mappingState === "local" ? "这项调整只保留在当前界面，尚未写入项目。" : mappingState === "error" ? "每个 Shot Row 至少要保留一个 Envelope 映射；保存失败时当前界面状态会保留。" : "同一个 Shot Row 可以合法关联多个 Prompt Envelope。"}</span></div>
        </section>

        {selected ? (
          <aside className="prompt-inspector">
            <header className="panel-heading"><div><p className="eyebrow">生成范围</p><h3>{selected.id}</h3></div><Badge tone={selected.status === "需检查" ? "warning" : "success"}>{selected.status}</Badge></header>
            <Field label="Envelope 名称"><input value={selected.name} onChange={(event) => updateSelected({ name: event.target.value })} onBlur={(event) => void commitEnvelope({ name: event.target.value })} /></Field>
            <div className="two-field-row"><Field label="目标模型"><select value={selected.model} onChange={(event) => { updateSelected({ model: event.target.value }); void commitEnvelope({ model: event.target.value }); }}><option>gpt-image-2</option><option>Codex imagegen</option></select></Field><Field label="目标时长"><div className="number-input"><input type="number" min={1} max={15} value={selected.duration} onChange={(event) => updateSelected({ duration: Number(event.target.value) })} onBlur={(event) => void commitEnvelope({ duration: Number(event.target.value) })} /><span>秒</span></div></Field></div>
            <div className="inspector-section"><div className="inspector-section__header"><strong>覆盖 Shot Rows</strong><span>{selected.shotIds.length} 个</span></div><div className="shot-link-grid">{shots.map((shot) => <label key={shot.id} className={selected.shotIds.includes(shot.id) ? "is-checked" : ""}><input type="checkbox" checked={selected.shotIds.includes(shot.id)} onChange={() => toggleShotLink(shot.id)} /><span>{shot.id}</span></label>)}</div><small className="helper-text">这里只修改映射，Shot Row 的数量与内容保持不变。</small></div>
            <Field label="完整中文 Prompt" hint={`${selected.prompt.length} 字 · ${envelopeSaveState === "saving" ? "保存中" : envelopeSaveState === "saved" ? "已保存" : envelopeSaveState === "error" ? "保存失败" : "编辑后失焦保存"}`}><textarea className="prompt-textarea" rows={8} value={selected.prompt} onChange={(event) => updateSelected({ prompt: event.target.value })} onBlur={(event) => void commitEnvelope({ prompt: event.target.value })} /></Field>
            <div className="inspector-section storyboard-drafts"><div className="inspector-section__header"><strong>分镜草稿</strong><span>{draftImages.length} 个版本</span></div>{draftImages.length ? <div className="draft-grid">{draftImages.map((item) => <button key={item.id} type="button">{item.url ? <img src={item.url} alt={`${selected.id} ${item.label}`} /> : <div className="draft-reference-empty"><Image size={19} /><small>文件不可预览</small></div>}<span>{item.label}</span></button>)}</div> : <div className="draft-empty"><Image size={21} weight="duotone" /><span><strong>还没有草稿图</strong><small>确认通道和数量后才会生成。</small></span></div>}{generationMessage ? <div className={`generating-state ${!generating ? "is-complete" : ""}`}>{generating ? <SpinnerGap size={17} className="spin" /> : <Info size={17} />} {generationMessage}</div> : null}{generationProposalId ? <div className="generated-draft-actions"><Button size="sm" variant="ghost" onClick={() => void decideGeneratedDraft(false)}>拒绝</Button><Button size="sm" variant="primary" icon={Check} onClick={() => void decideGeneratedDraft(true)}>接受为正式资产</Button></div> : null}</div>
            <Button icon={Image} variant="primary" className="full-width" disabled={!selected.shotIds.length || generating} onClick={() => setConfirmGenerate(true)}>{generating ? "生成中" : "生成分镜草稿"}</Button>
          </aside>
        ) : null}
      </div>

      <Modal open={confirmGenerate} title="确认生成分镜草稿" eyebrow={selected?.id} onClose={() => setConfirmGenerate(false)} footer={<><Button variant="ghost" onClick={() => setConfirmGenerate(false)}>取消</Button><Button icon={Play} variant="primary" onClick={generate}>确认生成 {quantity} 张</Button></>}>
        <div className="generate-confirmation"><div className="generation-scope"><span><Rows size={18} /></span><div><strong>{selected?.shotIds.join("、")}</strong><small>当前 Envelope 覆盖的 Shot Rows</small></div></div><Field label="运行通道"><div className="provider-options"><button type="button" className={provider === "local-codex" ? "is-selected" : ""} onClick={() => setProvider("local-codex")}><HardDrives size={19} /><span><strong>本机 Codex</strong><small>使用现有 ChatGPT 登录与额度</small></span><CheckCircle size={17} /></button><button type="button" className={provider === "openai-key" ? "is-selected" : ""} onClick={() => setProvider("openai-key")}><Key size={19} /><span><strong>OpenAI API Key</strong><small>单独计费，不会静默切换</small></span><CheckCircle size={17} /></button></div></Field><Field label="生成数量"><Segmented value={String(quantity) as "1" | "2" | "4"} onChange={(value) => setQuantity(Number(value))} ariaLabel="生成数量" options={[{ value: "1", label: "1 张" }, { value: "2", label: "2 张" }, { value: "4", label: "4 张" }]} /></Field><div className="cost-notice"><ShieldCheck size={18} /><p>草稿先进入候选区。只有你点击“接受”后才会成为正式资产。</p></div></div>
      </Modal>
    </div>
  );
}

export function TasksView({ projectId, tasks, onChange, onWorkspaceChange }: { projectId: string; tasks: TaskItem[]; onChange: (tasks: TaskItem[]) => void; onWorkspaceChange: (snapshot: WorkspaceSnapshot) => void }) {
  const statuses: TaskItem["status"][] = ["待处理", "进行中", "待审阅", "已完成"];
  const [addOpen, setAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [savingTaskId, setSavingTaskId] = useState("");
  const [taskError, setTaskError] = useState("");
  const nextStatus = (status: TaskItem["status"]): TaskItem["status"] => statuses[Math.min(statuses.indexOf(status) + 1, statuses.length - 1)]!;
  const move = async (id: string) => {
    const current = tasks.find((item) => item.id === id);
    if (!current) return;
    const next = { ...current, status: nextStatus(current.status) };
    onChange(tasks.map((item) => item.id === id ? next : item));
    if (!hasNativeBridge()) return;
    setSavingTaskId(id);
    try {
      const snapshot = await appBridge.upsertTask(projectId, next);
      if (snapshot) onWorkspaceChange(snapshot);
    } catch (error) {
      onChange(tasks);
      setTaskError(error instanceof Error ? error.message : "无法更新任务。");
    } finally {
      setSavingTaskId("");
    }
  };
  const add = async () => {
    if (!newTitle.trim()) return;
    const task: TaskItem = { id: `local-${Date.now()}`, title: newTitle.trim(), owner: "我", priority: "P2", due: "未设置", scene: "全项目", status: "待处理" };
    if (!hasNativeBridge()) {
      onChange([...tasks, task]);
      setNewTitle("");
      setAddOpen(false);
      return;
    }
    setSavingTaskId(task.id);
    try {
      const snapshot = await appBridge.upsertTask(projectId, task, true);
      if (snapshot) onWorkspaceChange(snapshot);
      setNewTitle("");
      setAddOpen(false);
    } catch (error) {
      setTaskError(error instanceof Error ? error.message : "无法创建任务。");
    } finally {
      setSavingTaskId("");
    }
  };

  return (
    <div className="view-shell tasks-view">
      <ViewHeader eyebrow="项目协作" title="任务看板" description="把审阅、补充资产和修订工作绑定到具体场景与版本。" actions={<><Button icon={Funnel}>筛选</Button><Button icon={Plus} variant="primary" onClick={() => setAddOpen(true)}>新建任务</Button></>} />
      <div className="task-summary"><span><ListChecks size={17} /> {tasks.filter((item) => item.status !== "已完成").length} 项未完成</span><span><WarningCircle size={17} /> {tasks.filter((item) => item.priority === "P0").length} 项 P0</span><span><User size={17} /> {tasks.filter((item) => item.owner === "我").length} 项分配给我</span>{taskError ? <span className="task-save-error"><WarningCircle size={15} /> {taskError}</span> : null}</div>
      <div className="kanban-board">
        {statuses.map((status) => (
          <section key={status} className="kanban-column">
            <header><span className={`status-dot status-dot--${status}`} /><strong>{status}</strong><Badge>{tasks.filter((item) => item.status === status).length}</Badge></header>
            <div className="kanban-stack">
              {tasks.filter((item) => item.status === status).map((task) => (
                <article key={task.id} className="task-card">
                  <div className="task-card__top"><Badge tone={task.priority === "P0" ? "danger" : task.priority === "P1" ? "warning" : "neutral"}>{task.priority}</Badge><span>{task.scene}</span></div>
                  <h3>{task.title}</h3>
                  <div className="task-card__meta"><span><UserCircle size={15} /> {task.owner}</span><span><CalendarBlank size={15} /> {task.due}</span></div>
                  {status !== "已完成" ? <button type="button" disabled={savingTaskId === task.id} onClick={() => void move(task.id)}>{savingTaskId === task.id ? "保存中" : `移至${nextStatus(status)}`} <ArrowRight size={14} /></button> : <span className="completed-label"><CheckCircle size={15} weight="fill" /> 已完成</span>}
                </article>
              ))}
              {status === "待处理" ? <button className="add-task-inline" type="button" onClick={() => setAddOpen(true)}><Plus size={16} /> 添加任务</button> : null}
            </div>
          </section>
        ))}
      </div>
      <Modal open={addOpen} title="新建项目任务" onClose={() => setAddOpen(false)} footer={<><Button variant="ghost" onClick={() => setAddOpen(false)}>取消</Button><Button variant="primary" icon={Plus} disabled={!newTitle.trim() || Boolean(savingTaskId)} onClick={() => void add()}>{savingTaskId ? "保存中" : "创建任务"}</Button></>}><Field label="任务标题"><input autoFocus value={newTitle} onChange={(event) => setNewTitle(event.target.value)} placeholder="需要完成什么？" /></Field></Modal>
    </div>
  );
}

export function QaView({ projectId, findings, staleItems, onWorkspaceChange }: { projectId: string; findings: QaFinding[]; staleItems: WorkspaceSnapshot["staleItems"]; onWorkspaceChange: (snapshot: WorkspaceSnapshot) => void }) {
  const [filter, setFilter] = useState<"全部" | QaFinding["priority"]>("全部");
  const [items, setItems] = useState(findings);
  const visible = filter === "全部" ? items : items.filter((item) => item.priority === filter);
  const priorityTone = (priority: QaFinding["priority"]) => priority === "P0" ? "danger" : priority === "P1" ? "warning" : priority === "P2" ? "info" : "neutral";
  const open = items.filter((item) => item.status === "未处理");
  const score = Math.max(0, 100 - open.filter((item) => item.priority === "P0").length * 25 - open.filter((item) => item.priority === "P1").length * 12 - open.filter((item) => item.priority === "P2").length * 5 - open.filter((item) => item.priority === "P3").length * 2);

  useEffect(() => setItems(findings), [findings]);

  async function decideFinding(findingId: string, status: "已修复" | "已忽略") {
    setItems((current) => current.map((item) => item.id === findingId ? { ...item, status } : item));
    if (!hasNativeBridge()) return;
    const snapshot = await appBridge.patchQaFinding(projectId, findingId, status === "已修复" ? "resolved" : "dismissed");
    if (snapshot) onWorkspaceChange(snapshot);
  }

  return (
    <div className="view-shell qa-view">
      <ViewHeader eyebrow="质量与追溯" title="QA、影响与版本" description="同时检查创作覆盖、结构映射和上游修改带来的失效范围。" actions={<><Button icon={DownloadSimple} onClick={() => void appBridge.exportProject(projectId, "json")}>导出报告</Button><Button icon={ShieldCheck} variant="primary" onClick={() => document.querySelector<HTMLTextAreaElement>(".agent-prompt textarea")?.focus()}>在 AI 导演运行 QA</Button></>} />
      <div className="qa-overview"><div className="qa-score"><strong>{score}</strong><span>/100</span><p>{open.length ? `${open.length} 项等待处理` : "当前没有未处理发现"}</p></div><div className="qa-stat qa-stat--danger"><span>P0</span><strong>{open.filter((item) => item.priority === "P0").length}</strong><small>必须修复</small></div><div className="qa-stat qa-stat--warning"><span>P1</span><strong>{open.filter((item) => item.priority === "P1").length}</strong><small>建议本轮修复</small></div><div className="qa-stat"><span>发现</span><strong>{items.length}</strong><small>来自实际 QA 记录</small></div><div className="qa-stat"><span>过期</span><strong>{staleItems.length}</strong><small>受上游影响</small></div></div>
      <div className="qa-layout">
        <section className="qa-findings">
          <div className="section-toolbar"><div className="filter-tabs filter-tabs--compact">{(["全部", "P0", "P1", "P2", "P3"] as const).map((item) => <button key={item} type="button" className={filter === item ? "is-active" : ""} onClick={() => setFilter(item)}>{item}<span>{item === "全部" ? items.length : items.filter((finding) => finding.priority === item).length}</span></button>)}</div><span>{visible.length} 项发现</span></div>
          <div className="finding-list">{visible.length ? visible.map((finding) => <article key={finding.id} className={`finding-card ${finding.status !== "未处理" ? "is-resolved" : ""}`}><Badge tone={priorityTone(finding.priority)}>{finding.priority}</Badge><div><div className="finding-card__title"><strong>{finding.title}</strong><Badge tone={finding.status === "未处理" ? "warning" : "neutral"}>{finding.status}</Badge></div><p>{finding.detail}</p><small>{finding.scope}</small></div><div className="finding-card__actions">{finding.status === "未处理" ? <><Button size="sm" onClick={() => void decideFinding(finding.id, "已忽略")}>忽略</Button><Button size="sm" variant="primary" onClick={() => void decideFinding(finding.id, "已修复")}>标记修复</Button></> : <CheckCircle size={20} weight="fill" />}</div></article>) : <div className="qa-empty"><ShieldCheck size={24} weight="duotone" /><strong>没有 QA 发现</strong><span>运行 QA 后，实际问题会按 P0–P3 出现在这里。</span></div>}</div>
        </section>
        <aside className="impact-panel">
          <div className={`impact-alert ${staleItems.length ? "" : "is-clear"}`}>{staleItems.length ? <Warning size={19} weight="fill" /> : <CheckCircle size={19} weight="fill" />}<div><strong>{staleItems.length ? `${staleItems.length} 项下游需要检查` : "没有检测到过期产物"}</strong><p>{staleItems.length ? "上游变化没有自动覆盖这些内容。" : "当前依赖图中没有待处理的上游影响。"}</p></div></div>
          <h3>受影响的下游产物</h3>
          <div className="impact-flow">{staleItems.length ? staleItems.map((item, index) => <div key={`${item.entityType}-${item.entityId}`}><div className="impact-node"><Rows size={17} /><span><strong>{item.entityType} · {item.entityId}</strong><small>{item.reason}</small></span><Badge tone="warning">过期</Badge></div>{index < staleItems.length - 1 ? <div className="impact-line" /> : null}</div>) : <div className="impact-empty"><CheckCircle size={22} weight="duotone" /><span>没有需要修订或重生成的下游内容。</span></div>}</div>
          {staleItems.length ? <div className="impact-actions"><Button className="full-width">查看依赖详情</Button><Button variant="primary" className="full-width" onClick={() => document.querySelector<HTMLTextAreaElement>(".agent-prompt textarea")?.focus()}>修订受影响内容</Button></div> : null}
          <div className="version-history"><div className="inspector-section__header"><strong>版本恢复</strong></div><div className="version-empty"><Clock size={18} /><span>版本会在每次已确认写入时创建。选择具体产物后即可查看和恢复它的历史。</span></div></div>
        </aside>
      </div>
    </div>
  );
}

const assignableSkillSlots: Array<{ value: StageSlot; label: string }> = [
  { value: "script.primary", label: "剧本 · script.primary" },
  { value: "guides.primary", label: "资产 / 风格 · guides.primary" },
  { value: "shotlist.breakdown", label: "分镜拆解 · shotlist.breakdown" },
  { value: "shotlist.primary", label: "镜头与 Prompt · shotlist.primary" },
  { value: "qa.primary", label: "QA · qa.primary" },
  { value: "artifact.formatter", label: "产物格式 · artifact.formatter" },
  { value: "version.manager", label: "版本管理 · version.manager" }
];

function skillSelectionKey(skill: Pick<SkillItem, "id" | "version">): string {
  return `${skill.id}@${skill.version}`;
}

export function SkillsView({ projectId, initialItems, bindings, runtimePreference, onBindingsChange, onSkillsChange, onRuntimePreferenceChange }: {
  projectId: string;
  initialItems: SkillItem[];
  bindings: WorkspaceSnapshot["skillBindings"];
  runtimePreference: AgentRuntimePreference;
  onBindingsChange: (bindings: WorkspaceSnapshot["skillBindings"]) => void;
  onSkillsChange: (skills: SkillItem[]) => void;
  onRuntimePreferenceChange: (preference: AgentRuntimePreference) => Promise<void>;
}) {
  const [items, setItems] = useState(initialItems);
  const [selectedKey, setSelectedKey] = useState(initialItems[0] ? skillSelectionKey(initialItems[0]) : "");
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [health, setHealth] = useState<RuntimeHealth | null>(null);
  const apiKeyRef = useRef<HTMLInputElement>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [skillQuery, setSkillQuery] = useState("");
  const [slotSelection, setSlotSelection] = useState<StageSlot>("script.primary");
  const [bindingSlotSelection, setBindingSlotSelection] = useState<StageSlot>("script.primary");
  const [localBindings, setLocalBindings] = useState(bindings);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorContent, setEditorContent] = useState("");
  const [editorHash, setEditorHash] = useState("");
  const [editorReadOnly, setEditorReadOnly] = useState(true);
  const [editorState, setEditorState] = useState<"idle" | "loading" | "saving">("idle");
  const [editorError, setEditorError] = useState("");
  const [displayPreference, setDisplayPreference] = useState(runtimePreference);
  const preferenceRef = useRef(runtimePreference);
  const preferenceSaveChain = useRef<Promise<void>>(Promise.resolve());
  const provider = displayPreference.provider === "local-codex" ? "local" : "key";
  const selected = items.find((item) => skillSelectionKey(item) === selectedKey);
  const bindingSlot = selected?.slots.includes(bindingSlotSelection) ? bindingSlotSelection : selected?.slots[0] as StageSlot | undefined;
  const selectedIsBound = Boolean(selected && bindingSlot && localBindings.some((binding) => binding.slot === bindingSlot && binding.skillId === selected.id && binding.version === selected.version && (!binding.contentHash || binding.contentHash === selected.contentHash)));
  const slots = useMemo(() => Array.from(new Set([...items.filter((item) => item.slot !== "未分类").map((item) => item.slot), ...localBindings.map((binding) => binding.slot)])), [items, localBindings]);
  const visibleSkills = useMemo(() => {
    const query = skillQuery.trim().toLowerCase();
    if (!query) return items;
    return items.filter((item) => `${item.name} ${item.id} ${item.slot} ${item.source}`.toLowerCase().includes(query));
  }, [items, skillQuery]);

  useEffect(() => setLocalBindings(bindings), [bindings]);
  useEffect(() => {
    setDisplayPreference(runtimePreference);
    preferenceRef.current = runtimePreference;
  }, [runtimePreference]);
  useEffect(() => {
    const firstSlot = selected?.slots[0];
    if (firstSlot) setBindingSlotSelection(firstSlot as StageSlot);
  }, [selectedKey, selected?.slots]);

  useEffect(() => {
    let active = true;
    Promise.all([appBridge.getSkills(projectId), appBridge.getRuntimeHealth()]).then(([skills, runtime]) => {
      if (!active) return;
      setItems(skills);
      onSkillsChange(skills);
      setSelectedKey((current) => skills.some((item) => skillSelectionKey(item) === current) ? current : skills[0] ? skillSelectionKey(skills[0]) : "");
      setHealth(runtime);
    }).catch((error) => {
      if (active) setStatusMessage(error instanceof Error ? error.message : "无法加载运行设置。");
    });
    return () => { active = false; };
  }, [projectId, onSkillsChange]);

  async function importSkill() {
    setStatusMessage("");
    try {
      const imported = await appBridge.importSkill();
      if (!imported) return;
      const nextItems = [...items.filter((item) => skillSelectionKey(item) !== skillSelectionKey(imported)), imported];
      setItems(nextItems);
      onSkillsChange(nextItems);
      setSelectedKey(skillSelectionKey(imported));
      setStatusMessage(`已导入 ${imported.name}；选择 Slot 后才会参与运行。`);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Skill 导入失败。");
    }
  }

  async function testConnection() {
    setTestStatus("testing");
    setStatusMessage("");
    try {
      if (provider === "local") {
        const runtime = await appBridge.getRuntimeHealth();
        setHealth(runtime);
        setTestStatus(runtime.codex.installed && runtime.codex.loggedIn ? "success" : "error");
        setStatusMessage(runtime.codex.message ?? (runtime.codex.loggedIn ? "本机 Codex 运行时状态正常。" : "Codex 尚未登录。"));
      } else {
        const transientApiKey = apiKeyRef.current?.value.trim() ?? "";
        const apiKeyHealth = transientApiKey ? await appBridge.saveApiKey(transientApiKey, displayPreference.model) : await appBridge.testApiKey(displayPreference.model);
        setHealth((current) => current ? { ...current, apiKey: apiKeyHealth } : null);
        setTestStatus(apiKeyHealth.status === "ready" ? "success" : "error");
        setStatusMessage(apiKeyHealth.message ?? (apiKeyHealth.status === "ready" ? "API Key 已通过测试。" : "API Key 验证失败。"));
        if (apiKeyRef.current) apiKeyRef.current.value = "";
      }
    } catch (error) {
      setTestStatus("error");
      setStatusMessage(error instanceof Error ? error.message : "连接测试失败。");
    }
  }

  async function cloneSelected() {
    if (!selected) return;
    setStatusMessage("");
    try {
      const clone = await appBridge.cloneSkill(selected.id);
      if (!clone) return;
      const nextItems = [...items, clone];
      setItems(nextItems);
      onSkillsChange(nextItems);
      setSelectedKey(skillSelectionKey(clone));
      setStatusMessage(`已创建 ${clone.name} 的可编辑用户副本。`);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "无法复制核心 Skill。");
    }
  }

  async function assignSelectedSlot() {
    if (!selected || selected.slot !== "未分类") return;
    setStatusMessage("");
    try {
      const assigned = await appBridge.assignSkillSlot(selected, slotSelection);
      const nextItems = items.map((item) => skillSelectionKey(item) === skillSelectionKey(selected) ? assigned : item);
      setItems(nextItems);
      onSkillsChange(nextItems);
      setSelectedKey(skillSelectionKey(assigned));
      setStatusMessage(`${assigned.name} 已分类到 ${slotSelection}，现在可以绑定到项目。`);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "无法分配工作流 Slot。");
    }
  }

  async function changeRuntimePreference(patch: Partial<AgentRuntimePreference>) {
    setStatusMessage("");
    const next = { ...preferenceRef.current, ...patch };
    preferenceRef.current = next;
    setDisplayPreference(next);
    const save = preferenceSaveChain.current.catch(() => undefined).then(() => onRuntimePreferenceChange(next));
    preferenceSaveChain.current = save;
    try {
      await save;
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "无法保存运行设置。");
    }
  }

  async function bindSelected() {
    if (!selected || selected.slot === "未分类" || !bindingSlot) return;
    try {
      await appBridge.bindSkill(projectId, bindingSlot, selected);
      const nextBindings = [...localBindings.filter((binding) => binding.slot !== bindingSlot), { slot: bindingSlot, skillId: selected.id, version: selected.version, contentHash: selected.contentHash }];
      setLocalBindings(nextBindings);
      onBindingsChange(nextBindings);
      setStatusMessage(`${selected.name} v${selected.version} 已固定到 ${bindingSlot}。${selected.source === "核心" ? "" : "当前技术预览不会执行用户 Skill。"}`);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "无法绑定 Skill。");
    }
  }

  async function setSelectedEnabled(enabled: boolean) {
    if (!selected) return;
    setStatusMessage("");
    try {
      const updated = await appBridge.setSkillEnabled(projectId, selected, enabled);
      const nextItems = items.map((item) => skillSelectionKey(item) === skillSelectionKey(selected) ? updated : item);
      setItems(nextItems);
      onSkillsChange(nextItems);
      setStatusMessage(enabled ? `${updated.name} 已在当前项目启用。` : `${updated.name} 已停用；现有绑定会保留，但不会运行。`);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "无法更新 Skill 状态。");
    }
  }

  async function openSkillEditor() {
    if (!selected) return;
    setEditorOpen(true);
    setEditorState("loading");
    setEditorError("");
    setEditorContent("");
    setEditorHash("");
    setEditorReadOnly(true);
    try {
      const result = await appBridge.readSkillContent(selected);
      setEditorContent(result.content);
      setEditorHash(result.contentHash);
      setEditorReadOnly(result.readOnly);
    } catch (error) {
      setEditorError(error instanceof Error ? error.message : "无法读取 SKILL.md。");
    } finally {
      setEditorState("idle");
    }
  }

  async function saveSkillEditor() {
    if (!selected || editorReadOnly || editorState === "saving") return;
    setEditorState("saving");
    setEditorError("");
    try {
      const updated = await appBridge.updateSkillContent(selected, editorHash, editorContent);
      const nextItems = items.map((item) => skillSelectionKey(item) === skillSelectionKey(selected) ? updated : item);
      setItems(nextItems);
      onSkillsChange(nextItems);
      setSelectedKey(skillSelectionKey(updated));
      setEditorHash(updated.contentHash ?? editorHash);
      setEditorOpen(false);
      setStatusMessage(`${updated.name} 已保存并通过校验；如已绑定，请重新绑定以固定新的内容哈希。`);
    } catch (error) {
      setEditorError(error instanceof Error ? error.message : "无法保存 SKILL.md。");
    } finally {
      setEditorState("idle");
    }
  }

  return (
    <>
    <div className="view-shell settings-view">
      <ViewHeader eyebrow="项目设置" title="Skill 与运行通道" description="把 Agent 的工作依据固定到具体版本；运行记录会保存实际内容哈希。" actions={<Button icon={FileArrowUp} variant="primary" onClick={importSkill}>导入 Skill</Button>} />
      <div className="settings-layout">
        <section className="skill-browser">
          <header className="settings-section-title"><div><h2>工作流 Skill</h2><p>{items.length} 个已安装，{items.filter((item) => item.enabled).length} 个已启用</p></div></header>
          <div className="slot-binding-list">{slots.map((slot) => { const binding = localBindings.find((item) => item.slot === slot); const bound = binding ? items.find((item) => item.id === binding.skillId && item.version === binding.version) : undefined; return <div key={slot} className="slot-binding"><span className="slot-binding__slot">{slot}</span><span className="slot-binding__arrow"><ArrowRight size={14} /></span><button type="button" onClick={() => bound && setSelectedKey(skillSelectionKey(bound))}><span className={`source-dot source-dot--${bound?.source ?? "核心"}`} /><div><strong>{bound?.name ?? (binding ? `${binding.skillId}（未安装）` : "未绑定")}</strong><small>{binding ? `固定 v${binding.version}` : "选择一个 Skill"}</small></div></button></div>; })}</div>
          <div className="skill-library-header"><strong>Skill 资料库</strong><label className="search-field"><Funnel size={15} /><input aria-label="筛选 Skill" placeholder="筛选 Skill" value={skillQuery} onChange={(event) => setSkillQuery(event.target.value)} /></label></div>
          <div className="skill-list">{visibleSkills.length ? visibleSkills.map((item) => { const key = skillSelectionKey(item); return <button key={key} type="button" className={selectedKey === key ? "is-selected" : ""} onClick={() => setSelectedKey(key)}><span className={`skill-icon skill-icon--${item.source}`}><MagicWand size={18} /></span><span className="skill-list__body"><span><strong>{item.name}</strong><Badge tone={item.source === "核心" ? "neutral" : "accent"}>{item.source}</Badge></span><small>{item.slot} · v{item.version}</small></span>{item.enabled ? <CheckCircle size={18} weight="fill" className="enabled-icon" /> : <span className="disabled-label">未启用</span>}</button>; }) : <div className="skill-list-empty">没有匹配的 Skill</div>}</div>
        </section>

        <section className="skill-detail">
          {selected ? <>
            <header><div><p className="eyebrow">{selected.source} Skill</p><h2>{selected.name}</h2><code>{selected.id}</code></div><Toggle checked={selected.enabled} label={selected.enabled ? "已启用" : "未启用"} onChange={(enabled) => void setSelectedEnabled(enabled)} /></header>
            <p className="skill-description">{selected.description}</p>
            <dl className="detail-list"><div><dt>版本</dt><dd>{selected.version}</dd></div><div><dt>声明 Slot</dt><dd>{selected.slots.length ? selected.slots.join(" · ") : "未分类"}</dd></div><div><dt>内容哈希</dt><dd><code>{selected.contentHash ? selected.contentHash.slice(0, 12) : "运行时计算"}</code></dd></div><div><dt>入口</dt><dd><code>SKILL.md</code></dd></div></dl>
            <div className="inspector-section"><div className="inspector-section__header"><strong>声明的权限</strong><span>{selected.capabilities.length}</span></div><div className="capability-list">{selected.capabilities.map((item) => <Badge key={item} tone={item.includes("image") || item.includes("shell") ? "warning" : "neutral"}><LockKey size={12} /> {item}</Badge>)}</div></div>
            {selected.source === "核心" ? <div className="core-skill-note"><ShieldCheck size={18} /><p><strong>核心 Skill 为只读</strong><small>修改会创建一个项目专属的用户副本。</small></p></div> : null}
            {selected.source !== "核心" ? <div className="core-skill-note user-skill-note"><WarningCircle size={18} /><p><strong>用户 Skill 处于安全预览</strong><small>可以查看、编辑、校验和绑定；执行将在权限沙箱与计费确认完成后开放。</small></p></div> : null}
            {selected.slot === "未分类" ? <div className="slot-assignment"><Field label="选择工作流 Slot"><select value={slotSelection} onChange={(event) => setSlotSelection(event.target.value as StageSlot)}>{assignableSkillSlots.map((slot) => <option key={slot.value} value={slot.value}>{slot.label}</option>)}</select></Field><Button icon={LinkSimple} variant="primary" onClick={() => void assignSelectedSlot()}>确认分类</Button></div> : null}
            {selected.slots.length > 1 ? <div className="binding-slot-picker"><Field label="本次绑定到"><select value={bindingSlot ?? selected.slots[0]} onChange={(event) => setBindingSlotSelection(event.target.value as StageSlot)}>{selected.slots.map((slot) => <option key={slot} value={slot}>{slot}</option>)}</select></Field></div> : null}
            <div className="detail-actions"><Button icon={Eye} onClick={() => void openSkillEditor()}>查看 SKILL.md</Button>{selected.source === "核心" ? <Button icon={Copy} onClick={() => void cloneSelected()}>复制并编辑</Button> : null}<Button icon={LinkSimple} variant="primary" disabled={selected.slot === "未分类" || !selected.enabled} onClick={() => void bindSelected()}>{selectedIsBound ? "重新固定到项目" : "绑定到项目"}</Button></div>
          </> : <div className="empty-state"><span><MagicWand size={24} /></span><h3>没有可用 Skill</h3><p>导入本地 Skill 文件夹后再选择工作流 Slot。</p></div>}
        </section>

        <section className="runtime-settings">
          <header className="settings-section-title"><div><h2>Agent 运行通道</h2><p>每次运行前都会显示实际通道与模型。</p></div></header>
          <div className="provider-cards"><button type="button" className={provider === "local" ? "is-selected" : ""} onClick={() => void changeRuntimePreference({ provider: "local-codex" })}><span><HardDrives size={21} /></span><div><strong>本机 Codex</strong><small>使用现有 ChatGPT 登录</small><Badge tone={health?.codex.loggedIn ? "success" : "warning"}>{health?.codex.loggedIn ? "已连接" : "需检查"}</Badge></div><CheckCircle size={19} weight={provider === "local" ? "fill" : "regular"} /></button><button type="button" className={provider === "key" ? "is-selected" : ""} onClick={() => void changeRuntimePreference({ provider: "openai-key" })}><span><Key size={21} /></span><div><strong>OpenAI API Key</strong><small>由 macOS 钥匙串加密保护</small><Badge tone={health?.apiKey.status === "ready" ? "success" : health?.apiKey.status === "invalid" ? "danger" : "neutral"}>{health?.apiKey.status === "ready" ? "已连接" : health?.apiKey.status === "invalid" ? "无效" : "未配置"}</Badge></div><CheckCircle size={19} weight={provider === "key" ? "fill" : "regular"} /></button></div>
          <div className="runtime-form">
            <Field label="文本模型"><select value={displayPreference.model} onChange={(event) => void changeRuntimePreference({ model: event.target.value as AgentRuntimePreference["model"] })}><option value="gpt-5.6-sol">GPT‑5.6 Sol（默认）</option><option value="gpt-5.6-terra">GPT‑5.6 Terra</option><option value="gpt-5.6-luna">GPT‑5.6 Luna</option></select></Field>
            <Field label="推理强度"><Segmented value={displayPreference.effort} onChange={(effort) => void changeRuntimePreference({ effort })} ariaLabel="推理强度" options={[{ value: "low", label: "低" }, { value: "medium", label: "中" }, { value: "high", label: "高" }, { value: "xhigh", label: "极高" }]} /></Field>
            {provider === "key" ? <Field label="OpenAI API Key"><div className="secret-input"><Key size={16} /><input ref={apiKeyRef} type="password" autoComplete="off" placeholder={health?.apiKey.configured ? "已加密保存；留空可重新测试" : "sk-proj-••••••••"} /><Button size="sm" onClick={() => void testConnection()} disabled={testStatus === "testing"}>{testStatus === "testing" ? "测试中" : testStatus === "success" ? "连接成功" : "保存并测试"}</Button></div>{health?.apiKey.configured ? <button className="remove-key-button" type="button" onClick={async () => { try { await appBridge.removeApiKey(); setHealth((current) => current ? { ...current, apiKey: { configured: false, status: "not-configured" } } : current); setStatusMessage("已移除加密保存的 API Key。"); } catch (error) { setStatusMessage(error instanceof Error ? error.message : "无法移除 API Key。"); } }}>移除已保存的 Key</button> : null}</Field> : <div className="account-row"><UserCircle size={19} /><div><strong>{health?.codex.loggedIn ? "ChatGPT 账号已登录" : "需要登录 Codex"}</strong><small>{health?.codex.version ? `Codex CLI ${health.codex.version}` : "正在检查 App Server"}</small></div><Button size="sm" onClick={() => void testConnection()} disabled={testStatus === "testing"}>{testStatus === "testing" ? "检查中" : testStatus === "success" ? "状态正常" : "检查状态"}</Button></div>}
            {statusMessage ? <div className={`runtime-message runtime-message--${testStatus}`}><Info size={16} /><span>{statusMessage}</span></div> : null}
            <div className="runtime-default"><ShieldCheck size={18} /><p><strong>运行不会继承全局高消耗设置</strong><small>默认固定为 GPT‑5.6 Sol + Medium；Priority 与自动多 Agent 写入均关闭。</small></p></div>
          </div>
        </section>
      </div>
    </div>
    <Modal
      open={editorOpen}
      title={`${selected?.name ?? "Skill"} · SKILL.md`}
      eyebrow={editorReadOnly ? "只读核心 Skill" : "用户 Skill 编辑器"}
      width="large"
      onClose={() => { if (editorState !== "saving") setEditorOpen(false); }}
      footer={<><Button onClick={() => setEditorOpen(false)} disabled={editorState === "saving"}>关闭</Button>{!editorReadOnly ? <Button variant="primary" onClick={() => void saveSkillEditor()} disabled={editorState !== "idle" || !editorContent.trim()}>{editorState === "saving" ? "校验并保存中" : "校验并保存"}</Button> : null}</>}
    >
      <div className="skill-editor">
        <div className="skill-editor__meta"><span><code>{selected?.id}</code> · v{selected?.version}</span><Badge tone={editorReadOnly ? "neutral" : "accent"}>{editorReadOnly ? "只读" : "可编辑"}</Badge></div>
        {editorState === "loading" ? <div className="skill-editor__loading"><SpinnerGap size={18} className="spin" />正在读取 Skill…</div> : <textarea aria-label="SKILL.md 内容" value={editorContent} readOnly={editorReadOnly} spellCheck={false} onChange={(event) => setEditorContent(event.target.value)} />}
        {editorError ? <div className="inline-error"><WarningCircle size={16} weight="fill" /><span>{editorError}</span></div> : null}
        {!editorReadOnly && editorState !== "loading" ? <p className="skill-editor__hint"><ShieldCheck size={14} />保存前会重新校验 Manifest、权限、依赖与输出 Schema；校验失败不会覆盖原文件。</p> : null}
      </div>
    </Modal>
    </>
  );
}
