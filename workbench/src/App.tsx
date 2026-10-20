import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Clapperboard,
  FileText,
  Images,
  PanelsTopLeft,
  Plus,
  ChevronDown,
  Folder,
  Moon,
  Sun,
  Settings2,
  Circle,
  X,
  Loader2,
  RefreshCw,
  Check,
  ExternalLink,
  Copy,
  Info,
  MessageSquare,
} from "lucide-react";
import {
  ErrorContext,
  Badge,
  Button,
  Dialog,
  Field,
  Input,
  Select,
  Textarea,
  cn,
  EmptyState,
} from "./components/ui";
import { api, post, pretty } from "./lib/api";
import ScriptPanel from "./ScriptPanel";
import AssetsPanel, { GenerationDialog } from "./AssetsPanel";
import AssetInspector from "./AssetInspector";
import JobsPanel from "./JobsPanel";
import ShotInspector from "./ShotInspector";
import ProjectSettings from "./ProjectSettings";
import { ProjectDialog, CreationContext } from "./WorkspaceProjects";
import { boardRows, shotKey, type ShotSelection } from "./lib/storyboard";
const TimelinePanel = lazy(() => import("./TimelinePanel"));
export default function App() {
  const [projects, setProjects] = useState<any[]>([]),
    [projectId, setProjectId] = useState(
      localStorage.getItem("film-project") || "",
    ),
    [loadedData, setData] = useState<any>(null),
    [module, setModule] = useState("script"),
    [visited, setVisited] = useState<string[]>(["script"]),
    [scene, setScene] = useState("all"),
    [selected, setSelected] = useState(""),
    [dark, setDark] = useState(
      localStorage.getItem("film-theme-v2") === "dark",
    ),
    [jobsOpen, setJobsOpen] = useState(false),
    [newProject, setNewProject] = useState(false),
    [projectSwitcher, setProjectSwitcher] = useState(false),
    [assetOpen, setAssetOpen] = useState(false),
    [workspace, setWorkspace] = useState<any>(null),
    [projectsLoaded, setProjectsLoaded] = useState(false),
    [creationOpen, setCreationOpen] = useState(false),
    [settings, setSettings] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [output, setOutput] = useState<any>(null),
    [regenerate, setRegenerate] = useState(false),
    [generationPrompt, setGenerationPrompt] = useState<string | undefined>();
  // A new project must never mount editors with the previous project's body.
  const data = loadedData?.__projectId === projectId ? loadedData : null;
  const [htmlPreview, setHtmlPreview] = useState(false),
    [dirtyParts, setDirtyParts] = useState<Record<string, boolean>>({});
  const [scriptView, setScriptView] = useState("text"),
    [shotSelection, setShotSelection] = useState<ShotSelection | null>(null),
    [shotOpen, setShotOpen] = useState(false),
    [infoOpen, setInfoOpen] = useState(false),
    [focusEnvelope, setFocusEnvelope] = useState<{
      id: string;
      nonce: number;
    } | null>(null),
    [stageRequest, setStageRequest] = useState<{
      stage: string;
      instruction: string;
      nonce: number;
    } | null>(null);
  const shotDirty = useCallback(
    (value: boolean) => setDirtyParts((p) => ({ ...p, shot: value })),
    [],
  );
  const scriptDirty = useCallback(
    (value: boolean) => setDirtyParts((p) => ({ ...p, script: value })),
    [],
  );
  const timelineDirty = useCallback(
    (value: boolean) => setDirtyParts((p) => ({ ...p, timeline: value })),
    [],
  );
  const assetDirty = useCallback(
    (value: boolean) => setDirtyParts((p) => ({ ...p, asset: value })),
    [],
  );
  const canLeave = () => {
    if (Object.values(dirtyParts).some(Boolean)) {
      setError("还有未保存的剧本、素材详情、镜头或时间轴修改，请先保存后再切换项目。");
      return false;
    }
    return true;
  };
  const busyRef = useRef(false),
    currentProject = useRef(projectId);
  currentProject.current = projectId;
  const base = `/projects/${projectId}`,
    project = projects.find((p) => p.project_id === projectId);
  const refresh = async () => {
    if (!projectId) return;
    const value = await api(base);
    if (currentProject.current === projectId)
      setData({ ...value, __projectId: projectId });
  };
  useEffect(() => {
    Promise.all([api("/projects"), api("/workspace")])
      .then(async ([p, w]) => {
        setProjects(p);
        setWorkspace(w);
        const chosen = p.find((x: any) => x.project_id === w.active_project_id)
          || p.find((x: any) => x.project_id === projectId) || p[0];
        if (chosen) {
          if (!w.active_project_id) setWorkspace(await api("/workspace/active-project", {
            method: "PUT", body: JSON.stringify({ project_id: chosen.project_id }),
          }));
          setProjectId(chosen.project_id);
        }
        setProjectsLoaded(true);
      })
      .catch((e) => setError(e.message));
  }, []);
  useEffect(() => {
    if (!projects.some((p) => p.project_id === projectId)) return;
    setData(null);
    setScene("all");
    setSelected("");
    setAssetOpen(false);
    setInfoOpen(false);
    setShotOpen(false);
    setShotSelection(null);
    setFocusEnvelope(null);
    setStageRequest(null);
    setSettings(false);
    setCreationOpen(false);
    setDirtyParts({});
    setVisited(["script"]);
    setModule("script");
    localStorage.setItem("film-project", projectId);
    void refresh().catch((e) => {
      if (currentProject.current === projectId) setError(e.message);
    });
    const timer = setInterval(() => void refresh().catch(() => {}), 4000);
    return () => clearInterval(timer);
  }, [projectId, projects.length]);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("film-theme", dark ? "dark" : "light");
    localStorage.setItem("film-theme-v2", dark ? "dark" : "light");
  }, [dark]);
  useEffect(() => {
    if (notice) {
      const timer = setTimeout(() => setNotice(""), 4500);
      return () => clearTimeout(timer);
    }
  }, [notice]);
  const run = async (action: () => Promise<any>, message?: string) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError("");
    try {
      const value = await action();
      await refresh();
      if (message) setNotice(message);
      return value;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };
  const chooseModule = (value: string) => {
    if (value !== module && dirtyParts.asset) {
      setError("素材详情还有未保存的修改，请先保存或撤销编辑。");
      return;
    }
    setModule(value);
    setVisited((v) => [...new Set([...v, value])]);
  };
  const switchProject = (next: string) => {
    if (canLeave()) void run(async () => {
      setWorkspace(await api("/workspace/active-project", {
        method: "PUT", body: JSON.stringify({ project_id: next }),
      }));
      setProjectId(next);
      setProjectSwitcher(false);
    });
  };
  const openShot = (selection: ShotSelection) => {
    setError("");
    setShotSelection(selection);
    setShotOpen(true);
  };
  const goTimeline = (id?: string) => {
    setShotOpen(false);
    chooseModule("timeline");
    if (id) setFocusEnvelope({ id, nonce: Date.now() });
  };
  const asset = data?.assets.find((a: any) => a.asset_name === selected),
    takes = data?.takes.filter((t: any) => t.asset_name === selected) || [];
  const scenes = [
    ...new Set<string>([
      ...(data?.script.state?.working_script?.scene_map || []).map(
        (s: any) => s.label,
      ),
      ...(data?.storyboard?.envelopes || []).map((e: any) => e.scene),
      ...(data?.assets || []).map((a: any) => a.scene).filter(Boolean),
    ]),
  ];
  return (
    <ErrorContext.Provider value={error}>
      <div className="workbench-app flex h-dvh overflow-hidden p-3 gap-3 max-[900px]:p-2 max-[900px]:gap-2">
        <aside className="workbench-sidebar flex w-52 shrink-0 flex-col rounded-2xl border bg-card shadow-xs max-[900px]:w-14">
          <div className="flex h-16 shrink-0 items-center gap-3 px-4 max-[900px]:justify-center max-[900px]:px-0">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Clapperboard size={20} />
            </div>
            <div className="max-[900px]:hidden">
              <p className="text-sm font-semibold">影视工作台</p>
            </div>
          </div>
          <div className="shrink-0 border-b p-3 max-[900px]:hidden">
            <Select
              aria-label="选择项目"
              value={projectId}
              onChange={(e) => switchProject(e.target.value)}
              disabled={busy || !projects.length}
            >
              {projects.map((p) => (
                <option key={p.project_id} value={p.project_id}>
                  {p.name}
                </option>
              ))}
            </Select>
            <Button
              className="mt-2 w-full justify-start"
              variant="ghost"
              size="sm"
              onClick={() => {
                if (canLeave()) setNewProject(true);
              }}
            >
              <Plus />
              新建 / 打开项目
            </Button>
            <Button className="mt-1 w-full justify-start" variant="ghost" size="sm"
              disabled={!data} onClick={() => setCreationOpen(true)}>
              <MessageSquare />在 Codex 中创作
            </Button>
          </div>
          <div className="hidden justify-center border-b py-2 max-[900px]:flex">
            <Button variant="ghost" size="icon" aria-label="切换或新建项目" title={`${project?.name || "未选择项目"} · 切换项目`} onClick={() => setProjectSwitcher(true)}><Folder /></Button>
          </div>
          <nav aria-label="工作区" className="shrink-0 space-y-1 p-3 max-[900px]:p-2">
            {[
              ["script", "剧本", FileText],
              ["assets", "资产库", Images],
              ["timeline", "时间轴", PanelsTopLeft],
            ].map(([key, label, Icon]: any) => (
              <button
                key={key}
                aria-label={label}
                aria-current={module === key ? "page" : undefined}
                title={label}
                onClick={() => chooseModule(key)}
                className={cn(
                  "flex h-10 w-full items-center gap-3 rounded-xl px-3 text-sm text-muted-foreground transition-colors hover:bg-accent max-[900px]:justify-center max-[900px]:px-0",
                  module === key &&
                    "bg-primary font-medium text-primary-foreground hover:bg-primary/90",
                )}
              >
                <Icon size={17} />
                <span className="max-[900px]:hidden">{label}</span>
              </button>
            ))}
          </nav>
          <div className="min-h-0 flex-1 overflow-auto border-t px-3 py-4 max-[900px]:hidden">
            <p className="mb-3 px-3 text-[11px] font-medium text-muted-foreground">
              场景导航
            </p>
            <button
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs",
                scene === "all" && "bg-accent",
              )}
              onClick={() => setScene("all")}
            >
              <Folder size={13} />
              全部场景
              <span className="ml-auto text-muted-foreground">
                {scenes.length}
              </span>
            </button>
            {scenes.map((s) => (
              <button
                key={s}
                className={cn(
                  "mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs",
                  scene === s && "bg-accent",
                )}
                onClick={() => setScene(s)}
              >
                <Circle size={7} />
                {s}
              </button>
            ))}
            {!scenes.length && (
              <p className="px-3 py-3 text-xs leading-6 text-muted-foreground">
                暂无场景
              </p>
            )}
          </div>
          <div className="sidebar-footer mt-auto flex shrink-0 items-center gap-2 border-t p-3 max-[900px]:flex-col max-[900px]:px-2">
            <Button
              variant="ghost"
              size="icon"
              aria-label="切换明暗主题"
              onClick={() => setDark(!dark)}
            >
              {dark ? <Sun /> : <Moon />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="项目设置"
              disabled={!data}
              onClick={() => {
                setSettings(true);
              }}
            >
              <Settings2 />
            </Button>
          </div>
        </aside>
        <div className="workbench-content flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border bg-card shadow-xs">
          <header className="workbench-header flex h-14 shrink-0 items-center gap-3 border-b px-6">
            <span className="min-w-0 truncate text-sm font-medium" title={project?.name}>
              {project?.name || "影视工作台"}
            </span>
            <span className="header-divider text-muted-foreground">/</span>
            <span className="header-module shrink-0 text-sm text-muted-foreground">
              {
                (
                  {
                    script: "剧本",
                    assets: "资产库",
                    timeline: "时间轴",
                  } as any
                )[module]
              }
            </span>
            <div className="ml-auto flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
              <Select className="compact-scene-select hidden h-8 max-w-32 max-[900px]:block" aria-label="场景导航" value={scene} onChange={e => setScene(e.target.value)}>
                <option value="all">全部场景</option>
                {scenes.map(s => <option key={s}>{s}</option>)}
              </Select>
              <Button
                variant="ghost"
                size="icon"
                aria-label="项目信息与本地产物"
                disabled={!data}
                onClick={() => setInfoOpen(true)}
              >
                <Info />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="刷新本地状态"
                title={busy ? "处理中" : data ? "已连接 · 刷新" : "连接中 · 重试"}
                disabled={busy || !projectId}
                onClick={() => run(refresh)}
              >
                <RefreshCw className={busy ? "animate-spin" : ""} />
              </Button>
            </div>
          </header>
          {error && (
            <div
              role="alert"
              className="flex items-start gap-3 border-b border-destructive/25 bg-destructive/5 px-6 py-3 text-sm text-destructive"
            >
              <span className="flex-1">{error}</span>
              <button onClick={() => setError("")} aria-label="关闭错误">
                <X size={15} />
              </button>
            </div>
          )}
          <div
            className={cn(
              "flex min-h-0 flex-1",
              busy && "[&_button]:cursor-wait",
            )}
          >
            {!data && error ? (
              <div className="m-auto">
                <EmptyState kind="project" title="暂时无法连接" description="检查本地服务后重试。">
                  <Button onClick={() => window.location.reload()}><RefreshCw />重新连接</Button>
                </EmptyState>
              </div>
            ) : projectsLoaded && !projects.length ? (
              <div className="m-auto">
                <EmptyState kind="project" title="开始一个视频项目">
                <Button onClick={() => setNewProject(true)}><Plus />新建 / 打开项目</Button>
                </EmptyState>
              </div>
            ) : !data ? (
              <div className="m-auto flex gap-3 text-muted-foreground">
                <Loader2 className="animate-spin" size={18} />
                正在载入本地项目…
              </div>
            ) : (
              <>
                <main className="flex min-w-0 flex-1 flex-col overflow-auto">
                  {visited.map((v) => (
                    <div
                      key={`${projectId}-${v}`}
                      className={cn(
                        "min-h-0 flex-1 flex-col",
                        module === v ? "flex" : "hidden",
                      )}
                    >
                      {v === "script" ? (
                        <ScriptPanel
                          base={base}
                          data={data}
                          scene={scene}
                          run={run}
                          onDirty={scriptDirty}
                          view={scriptView}
                          onView={setScriptView}
                          selection={shotSelection}
                          onSelectShot={openShot}
                          onTimeline={goTimeline}
                          stageRequest={stageRequest}
                          onSettings={() => setSettings(true)}
                          onTasks={() => setJobsOpen(true)}
                        />
                      ) : v === "assets" ? (
                        <AssetsPanel
                          base={base}
                          data={data}
                          scene={scene}
                          selected={selected}
                          onSelect={(name: string) => {
                            if (name !== selected && dirtyParts.asset) {
                              setError("素材详情还有未保存的修改，请先保存或撤销编辑。");
                              return;
                            }
                            setSelected(name);
                            const matches = boardRows(data.storyboard).filter(
                              (r) => r.envelope.asset_name === name,
                            );
                            const row =
                              matches.find(
                                (r) =>
                                  r.shot.id === shotSelection?.rowId &&
                                  r.shot.scene === shotSelection?.scene,
                              ) || matches[0];
                            setAssetOpen(!row);
                            if (row) openShot(row.selection);
                          }}
                          run={run}
                        />
                      ) : (
                        <Suspense
                          fallback={
                            <div className="p-12 text-muted-foreground">
                              正在载入 Twick 编辑器…
                            </div>
                          }
                        >
                          <TimelinePanel
                            base={base}
                            projectId={projectId}
                            data={data}
                            run={run}
                            onDirty={timelineDirty}
                            focusEnvelope={focusEnvelope}
                            onOpenShot={openShot}
                            onStoryboard={() => {
                              chooseModule("script");
                              setScriptView("board");
                            }}
                          />
                        </Suspense>
                      )}
                    </div>
                  ))}
                </main>
                {(infoOpen || (assetOpen && asset)) && (
                  <Dialog open onOpenChange={(open) => {
                    if (open) return;
                    if (assetOpen && dirtyParts.asset) {
                      setError("素材详情还有未保存的修改，请先保存或撤销编辑。");
                      return;
                    }
                    setAssetOpen(false); setInfoOpen(false); setError("");
                  }} title={assetOpen ? "素材详情" : "项目信息"}
                    className="inspector-dialog left-auto right-3 top-3 flex h-[calc(100dvh-24px)] max-h-none w-[min(420px,calc(100%-24px))] translate-x-0 translate-y-0 flex-col overflow-hidden p-0 [&>.dialog-title]:px-5 [&>.dialog-title]:pt-5">
                    <div className="min-h-0 flex-1 overflow-auto border-t">
                    {assetOpen && asset ? (
                      <AssetInspector
                        key={`${base}:${selected}`}
                        asset={asset}
                        takes={takes}
                        base={base}
                        busy={busy}
                        run={run}
                        onDirtyChange={assetDirty}
                        onGenerate={(prompt) => {
                          setGenerationPrompt(prompt);
                          setRegenerate(true);
                        }}
                      />
                    ) : (
                      <div className="space-y-6 p-5">
                        <div className="space-y-3">
                          <p className="text-xs text-muted-foreground">
                            当前工作稿
                          </p>
                          <p className="text-sm">
                            {data.script.state
                              ? `v${data.script.state.working_script.version}`
                              : "尚未登记"}
                          </p>
                          <p className="break-all font-mono text-[10px] text-muted-foreground">
                            {data.script.state?.working_script?.sha256}
                          </p>
                        </div>
                        <div className="space-y-3 border-t pt-5">
                          <p className="text-xs text-muted-foreground">
                            已确认生产版本
                          </p>
                          <Badge>
                            {data.script.state?.production_inputs
                              ? `v${data.script.state.production_inputs.script.version}`
                              : "等待审核与确认"}
                          </Badge>
                        </div>
                        <div className="border-t pt-5">
                          <p className="mb-3 text-xs text-muted-foreground">
                            项目 SKILLS
                          </p>
                          {data.skills.map((s: any) => (
                            <p
                              key={s.slot}
                              title={s.path}
                              className="mb-2 flex items-center gap-2 text-xs"
                            >
                              <span
                                className={cn(
                                  "size-1 rounded-full",
                                  s.available
                                    ? "bg-foreground"
                                    : "bg-destructive",
                                )}
                              />
                              {s.display_name || s.name}
                            </p>
                          ))}
                        </div>
                        <div className="border-t pt-5">
                          <p className="mb-3 text-xs text-muted-foreground">
                            本地产物
                          </p>
                          <div className="space-y-2">
                            {data.outputs.slice(-15).map((o: any) => (
                              <button
                                className="flex w-full items-center gap-2 text-left text-xs text-muted-foreground hover:text-foreground"
                                key={o.path}
                                onClick={() =>
                                  run(async () =>
                                    setOutput({
                                      ...(await api(
                                        `${base}/output?path=${encodeURIComponent(o.path)}`,
                                      )),
                                      expected_board_sha256:
                                        data.storyboard?.sha256 || null,
                                    }),
                                  )
                                }
                              >
                                <FileText size={12} className="shrink-0" />
                                <span className="truncate">{o.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                        <p className="break-all text-[10px] leading-5 text-muted-foreground">
                          {project?.root}
                        </p>
                      </div>
                    )}
                    </div>
                  </Dialog>
                )}
              </>
            )}
          </div>
          {data && (
            <JobsPanel
              base={base}
              data={data}
              open={jobsOpen}
              setOpen={setJobsOpen}
              run={run}
            />
          )}
        </div>
        {data &&
          shotOpen &&
          shotSelection &&
          boardRows(data.storyboard).some(
            (r) => r.key === shotKey(shotSelection.scene, shotSelection.rowId),
          ) && (
            <ShotInspector
              key={`${projectId}-${shotKey(shotSelection.scene, shotSelection.rowId)}`}
              base={base}
              data={data}
              selection={shotSelection}
              onClose={() => setShotOpen(false)}
              run={run}
              onDirty={shotDirty}
              onTimeline={goTimeline}
              onAsset={(name) => {
                setSelected(name);
                setAssetOpen(true);
                setShotOpen(false);
                chooseModule("assets");
              }}
              onStage={(stage, instruction) => {
                setShotOpen(false);
                chooseModule("script");
                setStageRequest({ stage, instruction, nonce: Date.now() });
              }}
              onJobs={() => {
                setShotOpen(false);
                setJobsOpen(true);
              }}
            />
          )}
        {notice && (
          <div
            role="status"
            className="fixed bottom-16 left-1/2 z-[60] flex w-max max-w-[calc(100%-32px)] -translate-x-1/2 items-center gap-3 rounded-xl border bg-background px-5 py-3 text-sm shadow-lg"
          >
            <Check size={16} />
            {notice}
          </div>
        )}
        <Dialog open={projectSwitcher} onOpenChange={setProjectSwitcher} title="项目">
          <div className="space-y-4">
            <Select aria-label="切换项目" value={projectId} disabled={busy || !projects.length} onChange={e => switchProject(e.target.value)}>
              {projects.map(p => <option key={p.project_id} value={p.project_id}>{p.name}</option>)}
            </Select>
            <Button variant="outline" className="w-full" onClick={() => { if (canLeave()) { setProjectSwitcher(false); setNewProject(true); } }}><Plus />新建 / 打开项目</Button>
            <Button variant="ghost" className="w-full" disabled={!data} onClick={() => { setProjectSwitcher(false); setCreationOpen(true); }}><MessageSquare />在 Codex 中创作</Button>
          </div>
        </Dialog>
        <ProjectDialog
          open={newProject}
          onOpenChange={setNewProject}
          workspace={workspace}
          onCreated={async (project) => {
            setProjects(await api("/projects"));
            setWorkspace(await api("/workspace"));
            setProjectId(project.project_id);
            setNotice("项目已打开");
          }}
        />
        <Dialog open={creationOpen} onOpenChange={setCreationOpen}
          title="在 Codex 中创作" description={`当前绑定「${project?.name || ""}」`}>
          {creationOpen && <CreationContext key={base} base={base} />}
        </Dialog>
        <ProjectSettings
          key={base}
          open={settings}
          onOpenChange={setSettings}
          base={base}
          name={project?.name || "当前项目"}
          settings={data?.settings}
          onSaved={refresh}
        />
        <Dialog
          wide
          open={!!output}
          onOpenChange={(o) => !o && setOutput(null)}
          title={output?.path.split("/").pop() || "产物"}
        >
          <pre className="max-h-[60vh] overflow-auto rounded-lg border p-4 text-xs leading-6">
            {output?.content}
          </pre>
          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              onClick={() => void navigator.clipboard.writeText(output.content)}
            >
              <Copy />
              复制内容
            </Button>
            {output?.path.endsWith(".html") && (
              <Button variant="outline" onClick={() => setHtmlPreview(true)}>
                预览 HTML
              </Button>
            )}
            {/01_script_v\d+\.md$/.test(output?.path || "") && (
              <Button
                onClick={() =>
                  run(async () => {
                    if (dirtyParts.script)
                      throw new Error("请先保存编辑中的剧本，再切换工作稿");
                    await post(`${base}/script/select`, {
                      script: output.path,
                      expected_sha256: data.script.state?.working_script.sha256,
                    });
                    setOutput(null);
                  }, "工作稿已切换")
                }
              >
                登记为工作稿
              </Button>
            )}
            {/asset_inventory(?:_v\d+)?\.json$/.test(output?.path || "") && (
              <Button
                onClick={() =>
                  run(async () => {
                    await post(`${base}/inventory`, JSON.parse(output.content));
                    setOutput(null);
                  })
                }
              >
                确认清单并导入
              </Button>
            )}
            {/storyboard(?:_v\d+)?\.json$/.test(output?.path || "") && (
              <Button
                onClick={() =>
                  run(async () => {
                    await post(`${base}/storyboard`, {
                      ...JSON.parse(output.content),
                      expected_sha256: output.expected_board_sha256,
                    });
                    setOutput(null);
                  })
                }
              >
                确认分镜映射
              </Button>
            )}
          </div>
        </Dialog>
        <Dialog
          wide
          open={htmlPreview}
          onOpenChange={setHtmlPreview}
          title="HTML 预览"
        >
          <iframe
            title="本地产物预览"
            sandbox="allow-scripts"
            srcDoc={output?.content || ""}
            className="h-[70vh] w-full rounded-md border bg-white"
          />
        </Dialog>
        {data && (
          <GenerationDialog
            open={regenerate}
            onOpenChange={setRegenerate}
            base={base}
            data={data}
            scene={scene}
            selected={selected}
            initialPrompt={generationPrompt}
            run={run}
          />
        )}
      </div>
    </ErrorContext.Provider>
  );
}
