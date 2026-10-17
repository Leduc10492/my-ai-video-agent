import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

import { auditDecision, parseFindings, type Finding } from "@/lib/findings";
import { packetFor, slotByStage } from "@/lib/packet";
import { repoRoot } from "@/lib/paths";
import { SLOT_DEFS } from "@/lib/slots";
import { hashScript, isDownstreamStale } from "@/lib/staleness";

export type WorkStatus = "未开始" | "可开始" | "进行中" | "待审核" | "已通过" | "阻断" | "已过期";

export type RailState = "ready" | "warn" | "idle" | "gated";

export type RailStep = {
  id: string;
  label: string;
  status: WorkStatus;
  rail: RailState;
  detail: string;
  href: string;
};

export type ScriptFile = { version: number; text: string; relativePath: string };

export type ProjectSummary = {
  id: string;
  title: string;
  logline: string;
  style: string;
  example: boolean;
  episodeCount: number;
  href: string;
};

export type EpisodeSummary = {
  id: string;
  number: number;
  title: string;
  href: string;
  audit: WorkStatus;
  downstream: WorkStatus;
  gateOpen: boolean;
  stale: boolean;
  detail: string;
};

export type EpisodeWorkspace = {
  projectId: string;
  projectTitle: string;
  logline: string;
  style: string;
  example: boolean;
  episodeId: string;
  episodeTitle: string;
  episodeNumber: number;
  gateOpen: boolean;
  stale: boolean;
  scriptHash: string;
  baselineHash: string | null;
  rail: RailStep[];
  scripts: ScriptFile[];
  currentVersion: number | null;
  auditVersion: number | null;
  auditText: string;
  findings: Finding[];
  auditDetail: string;
  sceneLabels: string[];
  packets: Record<string, string>;
};

type EpisodeJson = { id: string; number: number; title: string; dir: string };

type ProjectJson = {
  id: string;
  title: string;
  logline: string;
  style: string;
  assets: string;
  episodes: EpisodeJson[];
};

type LoadedProject = ProjectJson & {
  root: string;
  example: boolean;
  assetsDir: string;
};

const RAIL_META = [
  { id: "script", label: "剧本" },
  { id: "audit", label: "审核" },
  { id: "assets", label: "资产" },
  { id: "storyboard", label: "分镜" },
  { id: "prompt", label: "提示词" },
  { id: "generate", label: "生成" },
  { id: "qa", label: "QA" },
] as const;

export function railState(status: WorkStatus): RailState {
  if (status === "阻断") return "gated";
  if (status === "已通过") return "ready";
  if (status === "已过期" || status === "待审核" || status === "进行中") return "warn";
  return "idle";
}

export function exampleRoot() {
  return path.join(repoRoot(), "workbench", "example");
}

function readJson<T>(file: string): T {
  return JSON.parse(readFileSync(file, "utf8")) as T;
}

function walk(dir: string, root: string, out: string[]) {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, root, out);
    else out.push(path.relative(root, full).split(path.sep).join("/"));
  }
}

function latestMatch(files: string[], pattern: RegExp) {
  let best: { version: number; file: string } | null = null;
  for (const file of files) {
    const match = file.match(pattern);
    if (!match) continue;
    const version = Number(match[1]);
    if (!best || version > best.version) best = { version, file };
  }
  return best;
}

function sceneLabels(script: string) {
  return [...script.matchAll(/^##\s+场\s*(\d+)/gm)].map((match) => `scene-${match[1].padStart(3, "0")}`);
}

function isProductionFile(file: string) {
  const base = file.split("/").pop() ?? file;
  return base !== "README.md";
}

function loadExampleProject(file: string, root: string): LoadedProject {
  const json = readJson<ProjectJson>(file);
  return {
    ...json,
    root,
    example: true,
    assetsDir: path.join(root, json.assets),
  };
}

function repoProject(): LoadedProject {
  const root = path.join(repoRoot(), "deliverables");
  return {
    id: "repo",
    title: "当前仓库",
    logline: "读取仓库 deliverables/。没有同版本审核通过时，资产和分镜保持锁定。",
    style: "以仓库里的风格指南为准。没有指南时这一栏是空的。",
    assets: "2_assets",
    episodes: [{ id: "main", number: 1, title: "主线", dir: "." }],
    root,
    example: false,
    assetsDir: path.join(root, "2_assets"),
  };
}

export function loadProject(id: string): LoadedProject | null {
  if (id === "repo") return repoProject();
  if (id === "moban") {
    const root = exampleRoot();
    const file = path.join(root, "project.json");
    if (!existsSync(file)) return null;
    return loadExampleProject(file, root);
  }
  const draft = path.join(exampleRoot(), "drafts", id, "project.json");
  if (!existsSync(draft)) return null;
  return loadExampleProject(draft, path.dirname(draft));
}

export function listProjects(): ProjectSummary[] {
  const projects: ProjectSummary[] = [];
  const moban = loadProject("moban");
  if (moban) projects.push(toSummary(moban));
  projects.push(toSummary(repoProject()));
  const draftsDir = path.join(exampleRoot(), "drafts");
  if (existsSync(draftsDir)) {
    for (const name of readdirSync(draftsDir)) {
      const dir = path.join(draftsDir, name);
      if (!statSync(dir).isDirectory()) continue;
      const project = loadProject(name);
      if (project) projects.push(toSummary(project));
    }
  }
  return projects;
}

function toSummary(project: LoadedProject): ProjectSummary {
  const source = project.example ? "example" : "repo";
  return {
    id: project.id,
    title: project.title,
    logline: project.logline,
    style: project.style,
    example: project.example,
    episodeCount: project.episodes.length,
    href: `/p/${project.id}?source=${source}`,
  };
}

function sourceOf(project: LoadedProject) {
  return project.example ? "example" : "repo";
}

function hrefFor(project: LoadedProject, episode: EpisodeJson, leaf: string) {
  const base =
    leaf === "assets"
      ? `/p/${project.id}/assets`
      : leaf === "export"
        ? `/p/${project.id}/export`
        : leaf === "runs"
          ? "/runs"
          : `/p/${project.id}/e/${episode.id}/${leaf}`;
  const params = new URLSearchParams({ source: sourceOf(project), ep: episode.id });
  return `${base}?${params.toString()}`;
}

function readBaseline(episodeDir: string) {
  const file = path.join(episodeDir, "baseline.json");
  if (!existsSync(file)) return null;
  const json = readJson<{ scriptHash?: string }>(file);
  return json.scriptHash ?? null;
}

export function loadEpisode(projectId: string, episodeId: string): EpisodeWorkspace | null {
  const project = loadProject(projectId);
  if (!project) return null;
  const episode = project.episodes.find((item) => item.id === episodeId);
  if (!episode) return null;
  const episodeDir = path.resolve(project.root, episode.dir);
  const files: string[] = [];
  walk(episodeDir, episodeDir, files);
  const assetFiles: string[] = [];
  walk(project.assetsDir, project.assetsDir, assetFiles);

  const scripts = files
    .map((file) => {
      const match = file.match(/(?:^|\/)01_script_v(\d+)\.md$/);
      if (!match) return null;
      return {
        version: Number(match[1]),
        relativePath: file,
        text: readFileSync(path.join(episodeDir, file), "utf8"),
      };
    })
    .filter((item): item is ScriptFile => Boolean(item))
    .sort((a, b) => a.version - b.version);
  const current = scripts.at(-1) ?? null;
  const auditHit = latestMatch(files, /(?:^|\/)01_audit_report_v(\d+)\.md$/);
  const auditText = auditHit ? readFileSync(path.join(episodeDir, auditHit.file), "utf8") : "";
  const findings = auditText ? parseFindings(auditText) : [];
  const decision = auditDecision({
    hasScript: Boolean(current),
    hasAudit: Boolean(auditHit),
    scriptVersion: current?.version ?? null,
    auditVersion: auditHit?.version ?? null,
    auditText,
  });
  const scriptBody = current?.text ?? "";
  const scriptHash = hashScript(scriptBody);
  const baselineHash = readBaseline(episodeDir);
  const stale = Boolean(current) && isDownstreamStale(scriptBody, baselineHash);
  const scenes = sceneLabels(scriptBody);
  const breakdowns = files.filter((file) => /03_shotlist_breakdown_.+\.md$/.test(file) && isProductionFile(file));
  const htmls = files.filter((file) => /Shotlist_.+\.html$/.test(file));
  const prompts = files.filter((file) => file.endsWith("/prompts.md") || file === "prompts.md");
  const guides = assetFiles.filter((file) => /02_(asset|style)_guide_v\d+\.md$/.test(file));
  const qa = files.filter((file) => file.includes("qa_reports/") && isProductionFile(file) && file.endsWith(".md"));

  const assetsExist = guides.length > 0 || assetFiles.some((file) => file.includes("/refs/") || file.startsWith("refs/"));
  const boardExist = breakdowns.length > 0 || htmls.length > 0;
  const promptExist = prompts.length > 0;
  const partialBoard = scenes.length > 0 && breakdowns.length > 0 && breakdowns.length < scenes.length;

  const downstream = (exists: boolean, partial = false, emptyDetail: string, readyDetail: string): { status: WorkStatus; detail: string } => {
    if (!decision.gateOpen) return { status: "阻断", detail: decision.detail };
    if (!exists) return { status: "可开始", detail: emptyDetail };
    if (stale) {
      return {
        status: "已过期",
        detail: "剧本哈希和 baseline.json 不一致。文件还在，只标记已过期，不会自动重跑。",
      };
    }
    if (partial) return { status: "进行中", detail: readyDetail };
    return { status: "已通过", detail: readyDetail };
  };

  const assets = downstream(assetsExist, false, "审核已通过。还没有资产或风格指南。", `资产目录里有 ${guides.length} 份指南。`);
  const storyboard = downstream(
    boardExist,
    partialBoard,
    assetsExist ? "可以按 Scene 拆分镜。一次只做一场。" : "可以拆分镜。资产还没齐，先标成提醒，不锁定这一步。",
    partialBoard ? `剧本 ${scenes.length} 场，已有 ${breakdowns.length} 场拆解。` : `已有 ${breakdowns.length} 场拆解、${htmls.length} 份分镜表。`,
  );
  if (decision.gateOpen && !assetsExist && storyboard.status === "可开始") {
    storyboard.detail = "审核已通过，但资产还没有落盘。可以拆，只是连续性没有锚点。";
  }
  const prompt = downstream(promptExist, false, "最终提示词还没有 prompts.md。只有 cinedance-clean 能写这一份。", "prompts.md 已在 Scene 文件夹里。工作台只显示和复制。");
  const generate = decision.gateOpen
    ? { status: "可开始" as WorkStatus, detail: "生成默认关闭。先看估价，批准之后也只导出交接，不在这里扣费。" }
    : { status: "阻断" as WorkStatus, detail: decision.detail };
  const qaStatus: { status: WorkStatus; detail: string } = qa.length
    ? { status: "已通过", detail: `保存了 ${qa.length} 份 QA 报告。` }
    : { status: "未开始", detail: "没有保存的 QA 报告。默认检查写在对话里。" };

  const scriptStatus: { status: WorkStatus; detail: string } = current
    ? { status: "已通过", detail: `当前剧本是 v${current.version}。` }
    : { status: "未开始", detail: "这一集还没有 01_script_v{N}.md。" };

  const byId: Record<string, { status: WorkStatus; detail: string }> = {
    script: scriptStatus,
    audit: { status: decision.status, detail: decision.detail },
    assets,
    storyboard,
    prompt,
    generate,
    qa: qaStatus,
  };

  const leaf: Record<string, string> = {
    script: "script",
    audit: "script",
    assets: "assets",
    storyboard: "storyboard",
    prompt: "storyboard",
    generate: "runs",
    qa: "export",
  };

  const railOverride: Partial<Record<string, RailState>> = {};
  if (decision.gateOpen && !assetsExist && byId.storyboard.status === "可开始") {
    railOverride.storyboard = "warn";
    byId.storyboard.detail = "审核已通过，但资产还没有落盘。可以拆，连续性没有锚点。";
  }

  const rail: RailStep[] = RAIL_META.map((step) => ({
    id: step.id,
    label: step.label,
    status: byId[step.id].status,
    rail: railOverride[step.id] ?? railState(byId[step.id].status),
    detail: byId[step.id].detail,
    href: hrefFor(project, episode, leaf[step.id]) + (step.id === "audit" ? "&step=audit" : step.id === "prompt" ? "&view=prompt" : ""),
  }));

  const gates = [
    decision.gateOpen ? "同版本审核已通过，未解决的 P0 / P1 为无。" : decision.detail,
    stale ? "下游已过期。不要自动重跑资产、分镜或提示词。" : "剧本哈希未变，或这一集没有 baseline.json。",
  ];
  const inputs = [
    current ? `${episode.dir}/${current.relativePath}` : "还没有剧本",
    auditHit ? `${episode.dir}/${auditHit.file}` : "还没有审核报告",
    project.example ? "示例数据，路径在 workbench/example" : "当前仓库 deliverables/",
  ];
  const packets: Record<string, string> = {};
  for (const step of RAIL_META) {
    packets[step.id] = packetFor(slotByStage(step.id), { inputs, gates });
  }

  return {
    projectId: project.id,
    projectTitle: project.title,
    logline: project.logline,
    style: project.style,
    example: project.example,
    episodeId: episode.id,
    episodeTitle: episode.title,
    episodeNumber: episode.number,
    gateOpen: decision.gateOpen,
    stale,
    scriptHash,
    baselineHash,
    rail,
    scripts,
    currentVersion: current?.version ?? null,
    auditVersion: auditHit?.version ?? null,
    auditText,
    findings,
    auditDetail: decision.detail,
    sceneLabels: scenes,
    packets,
  };
}

export function listEpisodes(projectId: string): EpisodeSummary[] {
  const project = loadProject(projectId);
  if (!project) return [];
  return project.episodes.map((episode) => {
    const workspace = loadEpisode(projectId, episode.id);
    const audit = workspace?.rail.find((step) => step.id === "audit");
    const downstream = workspace?.rail.find((step) => step.status === "已过期") ?? workspace?.rail.find((step) => step.id === "storyboard");
    return {
      id: episode.id,
      number: episode.number,
      title: episode.title,
      href: `/p/${projectId}/e/${episode.id}/script?source=${sourceOf(project)}`,
      audit: audit?.status ?? "未开始",
      downstream: downstream?.status ?? "未开始",
      gateOpen: workspace?.gateOpen ?? false,
      stale: workspace?.stale ?? false,
      detail: audit?.detail ?? "",
    };
  });
}

export function loadProjectView(projectId: string) {
  const project = loadProject(projectId);
  if (!project) return null;
  return {
    id: project.id,
    title: project.title,
    logline: project.logline,
    style: project.style,
    example: project.example,
    episodes: listEpisodes(projectId),
    slots: SLOT_DEFS.map((slot) => slot.slot),
  };
}
