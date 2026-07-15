import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync } from "node:fs";
import { cp, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, isAbsolute, join, relative, resolve } from "node:path";
import { promisify } from "node:util";
import { app, BrowserWindow, dialog, ipcMain, protocol, session, shell } from "electron";
import { z } from "zod";
import {
  ApplyImportInputSchema,
  AssignSkillSlotInputSchema,
  BindSkillInputSchema,
  CancelAgentInputSchema,
  CreatePromptEnvelopeInputSchema,
  CreateProjectInputSchema,
  CreateStructureInputSchema,
  DraftDecisionInputSchema,
  ExportProjectInputSchema,
  ImportTextInputSchema,
  IPC,
  ProjectIdInputSchema,
  PatchEntityInputSchema,
  ReplaceMappingInputSchema,
  RestoreRevisionInputSchema,
  RuntimeModelSchema,
  RuntimePreferenceSchema,
  RunAgentInputSchema,
  SaveApiKeyInputSchema,
  SkillIdentityInputSchema,
  SetSkillEnabledInputSchema,
  UpdateSkillContentInputSchema,
  UpsertTaskInputSchema,
  type AgentEventDto,
  type BootstrapDto
} from "../shared/ipc";
import { AgentController } from "./agent-controller";
import { CredentialVault } from "./credential-vault";
import { createExportPayload, defaultPdfName, defaultProjectPackageName, toProductionExport } from "./export-service";
import { readRuntimeHealth, resolveCodexExecutable } from "./runtime-health";
import { WorkspaceService } from "./workspace-service";
import { exportProductionHtml } from "@ai-director/import-export";
import { backupDatabase, type ProjectDatabase } from "@ai-director/storage";
import { installAssetProtocol } from "./asset-protocol";

const execFileAsync = promisify(execFile);
let mainWindow: BrowserWindow | null = null;
let workspace: WorkspaceService | null = null;
let agentController: AgentController | null = null;
const allowedExportPaths = new Set<string>();
const projectRootSelections = new Map<string, { rootPath: string; webContentsId: number; expiresAt: number }>();

protocol.registerSchemesAsPrivileged([
  { scheme: "aidirector-asset", privileges: { secure: true, standard: true, supportFetchAPI: true, bypassCSP: false } }
]);

if (!app.isPackaged) {
  const configuredPath = process.env.AI_DIRECTOR_DEV_USER_DATA_PATH?.trim();
  const developmentUserDataPath = configuredPath
    ? resolve(configuredPath)
    : join(app.getPath("appData"), "@ai-director", "desktop-dev");
  mkdirSync(developmentUserDataPath, { recursive: true });
  app.setPath("userData", developmentUserDataPath);
}

function showOpenDialog(options: Electron.OpenDialogOptions): Promise<Electron.OpenDialogReturnValue> {
  return mainWindow ? dialog.showOpenDialog(mainWindow, options) : dialog.showOpenDialog(options);
}

function showSaveDialog(options: Electron.SaveDialogOptions): Promise<Electron.SaveDialogReturnValue> {
  return mainWindow ? dialog.showSaveDialog(mainWindow, options) : dialog.showSaveDialog(options);
}

function resolveCoreSkillRoot(): string {
  if (app.isPackaged) return join(process.resourcesPath, "core-workflow", "skills");
  const candidates = [
    resolve(app.getAppPath(), "../../.agents/skills"),
    resolve(process.cwd(), ".agents/skills")
  ];
  return candidates.find(existsSync) ?? candidates[0]!;
}

function assertTrustedIpcSender(event: Electron.IpcMainInvokeEvent): void {
  if (!mainWindow || event.sender !== mainWindow.webContents || event.senderFrame !== mainWindow.webContents.mainFrame) {
    throw new Error("已拒绝非主窗口发起的请求。");
  }
  const expected = new URL(mainWindow.webContents.getURL());
  const actual = new URL(event.senderFrame.url);
  const sameDocument = expected.protocol === "file:"
    ? actual.protocol === "file:" && actual.pathname === expected.pathname
    : actual.origin === expected.origin;
  if (!sameDocument) throw new Error("已拒绝来源不匹配的请求。");
}

function register<T>(channel: string, handler: (event: Electron.IpcMainInvokeEvent, input: T) => unknown): void {
  ipcMain.removeHandler(channel);
  ipcMain.handle(channel, async (event, input: T) => {
    assertTrustedIpcSender(event);
    return handler(event, input);
  });
}

function isInside(parent: string, child: string): boolean {
  const path = relative(resolve(parent), resolve(child));
  return path === "" || (!path.startsWith("..") && !isAbsolute(path));
}

async function createPdf(html: string): Promise<Buffer> {
  const window = new BrowserWindow({
    show: false,
    webPreferences: {
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  try {
    await window.loadURL(`data:text/html;charset=utf-8;base64,${Buffer.from(html, "utf8").toString("base64")}`);
    return await window.webContents.printToPDF({ printBackground: true, pageSize: "A4", preferCSSPageSize: true });
  } finally {
    window.destroy();
  }
}

async function createSafeProjectPackage(
  projectRoot: string,
  projectName: string,
  destination: string,
  database: ProjectDatabase
): Promise<void> {
  const temporaryRoot = await mkdtemp(join(tmpdir(), "ai-director-export-"));
  const safeFolderName = projectName.replace(/[\\/:*?\"<>|]/g, "-").trim() || "AI-Director-Project";
  const packageRoot = join(temporaryRoot, safeFolderName);
  const forbiddenNames = new Set([".DS_Store", ".git", ".env", ".npmrc", ".pypirc", "auth.json"]);
  const filter = (source: string): boolean => {
    const name = basename(source);
    if (source === join(projectRoot, "assets") || source === join(projectRoot, "deliverables")) return true;
    return !forbiddenNames.has(name) && !/(?:secret|credential|api[-_]?key|access[-_]?token)/i.test(name);
  };
  try {
    await mkdir(join(packageRoot, ".ai-director"), { recursive: true, mode: 0o700 });
    await cp(join(projectRoot, ".ai-director", "project.json"), join(packageRoot, ".ai-director", "project.json"));
    await backupDatabase(database.db, join(packageRoot, ".ai-director", "project.db"));
    for (const directory of ["assets", "deliverables"]) {
      const source = join(projectRoot, directory);
      if (existsSync(source)) await cp(source, join(packageRoot, directory), { recursive: true, filter });
    }
    await execFileAsync("/usr/bin/ditto", ["-c", "-k", "--sequesterRsrc", "--keepParent", packageRoot, destination]);
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
}

async function installIpcHandlers(userDataPath: string): Promise<void> {
  if (!workspace || !agentController) throw new Error("Application services are not ready.");
  const service = workspace;
  const controller = agentController;
  const vault = new CredentialVault(userDataPath);

  register(IPC.bootstrap, async (): Promise<BootstrapDto> => ({
    appVersion: app.getVersion(),
    platform: process.platform,
    projects: await service.listProjects(),
    runtime: await readRuntimeHealth(vault),
    skills: (await service.listSkills()).map((skill) => service.toSkillSummary(skill)),
    activeProjectId: await service.catalog.activeProjectId()
  }));
  register(IPC.projectList, () => service.listProjects());
  register(IPC.projectChooseRoot, async (event) => {
    const result = await showOpenDialog({
      title: "选择或新建项目文件夹",
      properties: ["openDirectory", "createDirectory", "promptToCreate"]
    });
    const rootPath = result.filePaths[0];
    if (result.canceled || !rootPath) return null;
    const token = randomUUID();
    projectRootSelections.set(token, { rootPath, webContentsId: event.sender.id, expiresAt: Date.now() + 10 * 60_000 });
    for (const [candidate, selection] of projectRootSelections) {
      if (selection.expiresAt < Date.now()) projectRootSelections.delete(candidate);
    }
    return { token, displayPath: basename(rootPath) };
  });
  register(IPC.projectCreate, (event, input) => {
    const parsed = CreateProjectInputSchema.parse(input);
    const selection = projectRootSelections.get(parsed.rootToken);
    projectRootSelections.delete(parsed.rootToken);
    if (!selection || selection.expiresAt < Date.now() || selection.webContentsId !== event.sender.id) {
      throw new Error("项目文件夹授权已过期，请重新选择。");
    }
    return service.createProject(parsed, selection.rootPath);
  });
  register(IPC.projectImportExisting, async () => {
    const result = await showOpenDialog({
      title: "导入现有 AI 导演项目",
      properties: ["openDirectory"]
    });
    return result.canceled || !result.filePaths[0] ? null : service.importExisting(result.filePaths[0]);
  });
  register(IPC.projectOpen, (_event, input) => service.openProject(ProjectIdInputSchema.parse(input).projectId));
  register(IPC.projectArchive, async (_event, input) => {
    const parsed = z.object({ projectId: z.string().min(1), archived: z.boolean() }).parse(input);
    await service.catalog.update(parsed.projectId, { archived: parsed.archived, currentStage: parsed.archived ? "已归档" : "剧本" });
  });
  register(IPC.scriptChooseAndPreview, async (_event, input) => {
    const { projectId } = ProjectIdInputSchema.parse(input);
    const result = await showOpenDialog({
      title: "选择剧本",
      properties: ["openFile"],
      filters: [{ name: "支持的剧本", extensions: ["txt", "md", "markdown", "fountain", "fdx", "docx", "pdf"] }]
    });
    return result.canceled || !result.filePaths[0] ? null : service.stageScriptFile(projectId, result.filePaths[0]);
  });
  register(IPC.scriptPreviewText, (_event, input) => {
    const parsed = ImportTextInputSchema.parse(input);
    return service.stagePastedScript(parsed.projectId, parsed.sourceName, parsed.text);
  });
  register(IPC.scriptApplyImport, (_event, input) => service.applyScriptImport(ApplyImportInputSchema.parse(input)));
  register(IPC.agentHealth, () => readRuntimeHealth(vault));
  register(IPC.agentRun, (_event, input) => controller.run(RunAgentInputSchema.parse(input)));
  register(IPC.agentCancel, async (_event, input) => controller.cancel(CancelAgentInputSchema.parse(input).runId));
  register(IPC.draftAccept, async (_event, input) => {
    const parsed = DraftDecisionInputSchema.parse(input);
    const store = await service.getStore(parsed.projectId);
    const result = await store.acceptAndApplyDraftWithSnapshot(parsed.proposalId, {
      operationIds: parsed.operationIds,
      actor: "用户"
    });
    const bundle = store.getBundle(parsed.projectId);
    await service.catalog.update(parsed.projectId, { staleCount: bundle.stale.length });
    return { proposal: result.proposal, bundle: service.sanitizeBundleForRenderer(bundle) };
  });
  register(IPC.draftReject, async (_event, input) => {
    const parsed = DraftDecisionInputSchema.parse(input);
    const store = await service.getStore(parsed.projectId);
    return store.drafts.reject(parsed.proposalId);
  });
  register(IPC.revisionRestore, async (_event, input) => {
    const parsed = RestoreRevisionInputSchema.parse(input);
    const store = await service.getStore(parsed.projectId);
    const revision = store.restoreRevision(parsed.revisionId, "用户");
    return { revision, bundle: service.sanitizeBundleForRenderer(store.getBundle(parsed.projectId)) };
  });
  register(IPC.entityPatch, async (_event, input) => {
    const parsed = PatchEntityInputSchema.parse(input);
    const store = await service.getStore(parsed.projectId);
    const repository = store.repository(parsed.entityType);
    const current = repository.require(parsed.entityId);
    const result = store.commitAndInvalidate(parsed.entityType, {
      ...current,
      ...parsed.patch,
      id: current.id,
      projectId: current.projectId,
      updatedAt: new Date().toISOString()
    }, {
      author: { type: "user", name: "用户" },
      expectedRevision: parsed.baseRevision ?? current.currentRevisionId ?? null,
      message: "用户在工作台中修改内容"
    });
    return { result, bundle: service.sanitizeBundleForRenderer(store.getBundle(parsed.projectId)) };
  });
  register(IPC.taskUpsert, async (_event, input) => {
    const parsed = UpsertTaskInputSchema.parse(input);
    const store = await service.getStore(parsed.projectId);
    const now = new Date().toISOString();
    const id = parsed.id ?? `task_${randomUUID()}`;
    const current = parsed.id ? store.tasks.get(parsed.id) : undefined;
    const task = {
      ...current,
      ...parsed,
      id,
      projectId: parsed.projectId,
      createdAt: current?.createdAt ?? now,
      updatedAt: now
    };
    const result = store.commitAndInvalidate("task", task, {
      author: { type: "user", name: "用户" },
      expectedRevision: current?.currentRevisionId ?? null,
      message: current ? "更新任务" : "创建任务"
    });
    const bundle = store.getBundle(parsed.projectId);
    await service.catalog.update(parsed.projectId, { openTaskCount: bundle.tasks.filter((item) => item.status !== "done").length });
    return { result, bundle: service.sanitizeBundleForRenderer(bundle) };
  });
  register(IPC.mappingReplace, async (_event, input) => {
    const parsed = ReplaceMappingInputSchema.parse(input);
    const store = await service.getStore(parsed.projectId);
    const now = new Date().toISOString();
    const result = store.replaceShotEnvelopeMapping(parsed.projectId, parsed.sceneId, parsed.links.map((link) => ({
      id: `link_${randomUUID()}`,
      projectId: parsed.projectId,
      ...link,
      createdAt: now
    })));
    return { result, bundle: service.sanitizeBundleForRenderer(store.getBundle(parsed.projectId)) };
  });
  register(IPC.structureCreate, async (_event, input) => {
    const parsed = CreateStructureInputSchema.parse(input);
    const store = await service.getStore(parsed.projectId);
    const now = new Date().toISOString();
    const metadata = { author: { type: "user" as const, name: "用户" }, expectedRevision: null, message: `新建${parsed.kind}` };
    if (parsed.kind === "act") {
      if (parsed.parentId) {
        const episode = store.episodes.require(parsed.parentId);
        if (episode.projectId !== parsed.projectId) throw new Error("不能跨项目新建幕。");
      }
      const siblings = store.acts.list({ projectId: parsed.projectId });
      store.commitAndInvalidate("act", {
        id: `act_${randomUUID()}`,
        projectId: parsed.projectId,
        episodeId: parsed.parentId,
        title: parsed.title,
        number: siblings.length + 1,
        dramaticPurpose: "待完善",
        ordinal: siblings.length,
        createdAt: now,
        updatedAt: now
      }, metadata);
    } else if (parsed.kind === "sequence") {
      if (!parsed.parentId) throw new Error("新建戏需要先选择所属幕。");
      const act = store.acts.require(parsed.parentId);
      if (act.projectId !== parsed.projectId) throw new Error("不能跨项目新建戏。");
      const siblings = store.sequences.list({ projectId: parsed.projectId, parentId: act.id });
      store.commitAndInvalidate("sequence", {
        id: `sequence_${randomUUID()}`,
        projectId: parsed.projectId,
        actId: act.id,
        title: parsed.title,
        number: siblings.length + 1,
        dramaticQuestion: "待完善",
        synopsis: "",
        ordinal: siblings.length,
        createdAt: now,
        updatedAt: now
      }, metadata);
    } else {
      if (!parsed.parentId) throw new Error("新建场需要先选择所属戏。");
      const sequence = store.sequences.require(parsed.parentId);
      if (sequence.projectId !== parsed.projectId) throw new Error("不能跨项目新建场。");
      const siblings = store.scenes.list({ projectId: parsed.projectId, parentId: sequence.id });
      const allScenes = store.scenes.list({ projectId: parsed.projectId });
      store.commitAndInvalidate("scene", {
        id: `scene_${randomUUID()}`,
        projectId: parsed.projectId,
        sequenceId: sequence.id,
        sceneNumber: String(allScenes.length + 1).padStart(3, "0"),
        heading: parsed.title,
        location: parsed.title,
        timeOfDay: "",
        interiorExterior: "OTHER" as const,
        synopsis: "",
        dramaticValueBefore: "",
        dramaticValueAfter: "",
        estimatedSeconds: 0,
        ordinal: siblings.length,
        createdAt: now,
        updatedAt: now
      }, metadata);
      await service.catalog.update(parsed.projectId, { sceneCount: allScenes.length + 1 });
    }
    return service.sanitizeBundleForRenderer(store.getBundle(parsed.projectId));
  });
  register(IPC.promptEnvelopeCreate, async (_event, input) => {
    const parsed = CreatePromptEnvelopeInputSchema.parse(input);
    const store = await service.getStore(parsed.projectId);
    const scene = store.scenes.require(parsed.sceneId);
    if (scene.projectId !== parsed.projectId) throw new Error("不能跨项目新建 Prompt Envelope。");
    const siblings = store.promptEnvelopes.list({ projectId: parsed.projectId, parentId: scene.id });
    const now = new Date().toISOString();
    store.commitAndInvalidate("promptEnvelope", {
      id: `envelope_${randomUUID()}`,
      projectId: parsed.projectId,
      sceneId: scene.id,
      envelopeNumber: `P${String(siblings.length + 1).padStart(3, "0")}`,
      ordinal: siblings.length,
      title: parsed.title,
      targetModel: "gpt-image-2",
      durationSeconds: 4,
      promptZh: "在这里整理完整的中文生产 Prompt。",
      negativePrompt: "",
      assetIds: [],
      sourceScriptBlockIds: [],
      generationReliability: "medium" as const,
      createdAt: now,
      updatedAt: now
    }, { author: { type: "user", name: "用户" }, expectedRevision: null, message: "新建 Prompt Envelope" });
    return service.sanitizeBundleForRenderer(store.getBundle(parsed.projectId));
  });
  register(IPC.skillList, async (_event, input) => {
    const { projectId } = z.object({ projectId: z.string().min(1).optional() }).parse(input ?? {});
    const skills = await service.listSkills();
    if (!projectId) return skills.map((skill) => service.toSkillSummary(skill));
    return Promise.all(skills.map(async (skill) => service.toSkillSummary(skill, await service.skillEnabled(projectId, skill.id, skill.manifest.version))));
  });
  register(IPC.skillImport, async () => {
    const result = await showOpenDialog({
      title: "导入本地 Skill 文件夹",
      properties: ["openDirectory"]
    });
    if (result.canceled || !result.filePaths[0]) return null;
    return service.toSkillSummary(await service.importSkillFolder(result.filePaths[0]));
  });
  register(IPC.skillClone, async (_event, input) => {
    const { skillId } = z.object({ skillId: z.string().min(1) }).parse(input);
    return service.toSkillSummary(await service.cloneSkill(skillId));
  });
  register(IPC.skillAssignSlot, async (_event, input) => {
    const parsed = AssignSkillSlotInputSchema.parse(input);
    return service.toSkillSummary(await service.assignSkillSlot(parsed.skillId, parsed.version, parsed.slot, parsed.expectedContentHash));
  });
  register(IPC.skillReadContent, async (_event, input) => {
    const parsed = SkillIdentityInputSchema.parse(input);
    return service.readSkillContent(parsed.skillId, parsed.version);
  });
  register(IPC.skillUpdateContent, async (_event, input) => {
    const parsed = UpdateSkillContentInputSchema.parse(input);
    return service.toSkillSummary(await service.updateSkillContent(parsed.skillId, parsed.version, parsed.expectedContentHash, parsed.content));
  });
  register(IPC.skillSetEnabled, async (_event, input) => {
    const parsed = SetSkillEnabledInputSchema.parse(input);
    return service.toSkillSummary(
      await service.setSkillEnabled(parsed.projectId, parsed.skillId, parsed.version, parsed.enabled),
      parsed.enabled
    );
  });
  register(IPC.skillBind, async (_event, input) => service.bindSkill(BindSkillInputSchema.parse(input)));
  register(IPC.settingsGetRuntimePreference, async (_event, input) => {
    const { projectId } = ProjectIdInputSchema.parse(input);
    const store = await service.getStore(projectId);
    const saved = store.settings.get(projectId, "runtimePreference");
    const parsed = RuntimePreferenceSchema.safeParse(saved);
    return parsed.success ? parsed.data : RuntimePreferenceSchema.parse({ projectId });
  });
  register(IPC.settingsSetRuntimePreference, async (_event, input) => {
    const parsed = RuntimePreferenceSchema.parse(input);
    const store = await service.getStore(parsed.projectId);
    store.settings.set(parsed.projectId, "runtimePreference", parsed);
    return parsed;
  });
  register(IPC.settingsSaveApiKey, async (_event, input) => {
    const parsed = SaveApiKeyInputSchema.parse(input);
    await vault.store(parsed.apiKey);
    const result = parsed.testConnection
      ? await controller.testByokConnection(parsed.model)
      : { status: "unchecked" as const, message: "密钥已保存，尚未测试。", lastTestedAt: undefined };
    await vault.writeMetadata(result);
    return result;
  });
  register(IPC.settingsRemoveApiKey, async () => {
    await vault.remove();
    await controller.logoutByok().catch(() => undefined);
  });
  register(IPC.settingsTestApiKey, async (_event, input) => {
    const { model } = z.object({ model: RuntimeModelSchema }).parse(input);
    const result = await controller.testByokConnection(model);
    await vault.writeMetadata(result);
    return result;
  });
  register(IPC.exportSave, async (_event, input) => {
    const parsed = ExportProjectInputSchema.parse(input);
    const project = await service.catalog.get(parsed.projectId);
    const store = await service.getStore(parsed.projectId);
    const bundle = store.getBundle(parsed.projectId);

    if (parsed.kind === "project-package") {
      store.database.checkpoint("FULL");
      const result = await showSaveDialog({
        title: "导出完整项目包",
        defaultPath: join(dirname(project.rootPath), defaultProjectPackageName(project.name)),
        filters: [{ name: "ZIP 项目包", extensions: ["zip"] }]
      });
      if (result.canceled || !result.filePath) return null;
      if (isInside(project.rootPath, result.filePath)) throw new Error("项目包不能保存到项目自身目录中。");
      await createSafeProjectPackage(project.rootPath, project.name, result.filePath, store.database);
      allowedExportPaths.add(result.filePath);
      return result.filePath;
    }

    let data: string | Buffer;
    let defaultName: string;
    let filters: Array<{ name: string; extensions: string[] }>;
    if (parsed.kind === "pdf") {
      data = await createPdf(exportProductionHtml(toProductionExport(bundle)));
      defaultName = defaultPdfName(project.name);
      filters = [{ name: "PDF", extensions: ["pdf"] }];
    } else {
      const payload = await createExportPayload(parsed.kind, bundle);
      data = payload.data;
      defaultName = payload.defaultName;
      filters = payload.filters;
    }
    const result = await showSaveDialog({
      title: "导出已批准版本",
      defaultPath: join(project.rootPath, "deliverables", defaultName),
      filters
    });
    if (result.canceled || !result.filePath) return null;
    await writeFile(result.filePath, data);
    allowedExportPaths.add(result.filePath);
    return result.filePath;
  });
  register(IPC.revealPath, async (_event, input) => {
    const { path } = z.object({ path: z.string().min(1) }).parse(input);
    const projects = await service.catalog.list();
    const allowed = projects.some((project) => isInside(project.rootPath, path)) || allowedExportPaths.has(resolve(path));
    if (!allowed) throw new Error("只能在访达中显示已注册项目或本次导出的文件。");
    shell.showItemInFolder(path);
    return true;
  });
}

function configureSessionSecurity(): void {
  session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => callback(false));
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const development = !app.isPackaged;
    const policy = development
      ? "default-src 'self' http://localhost:*; script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:*; style-src 'self' 'unsafe-inline' http://localhost:*; img-src 'self' data: blob: aidirector-asset:; connect-src 'self' ws://localhost:* http://localhost:*"
      : "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: aidirector-asset:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'";
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [policy]
      }
    });
  });
}

async function createWindow(): Promise<void> {
  mainWindow = new BrowserWindow({
    width: 1540,
    height: 980,
    minWidth: 1180,
    minHeight: 760,
    show: false,
    backgroundColor: "#121716",
    titleBarStyle: "hiddenInset",
    trafficLightPosition: { x: 18, y: 18 },
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
      spellcheck: true
    }
  });
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https:\/\//i.test(url)) void shell.openExternal(url);
    return { action: "deny" };
  });
  mainWindow.webContents.on("will-navigate", (event, url) => {
    const developmentUrl = process.env.ELECTRON_RENDERER_URL;
    if (developmentUrl) {
      const expected = new URL(developmentUrl);
      const target = new URL(url);
      if (target.origin === expected.origin) return;
    }
    event.preventDefault();
  });
  mainWindow.once("ready-to-show", () => mainWindow?.show());
  if (!app.isPackaged && process.env.ELECTRON_RENDERER_URL) {
    await mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    await mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

app.whenReady().then(async () => {
  app.setAppUserModelId("studio.aidirector.workbench");
  const userDataPath = app.getPath("userData");
  const vault = new CredentialVault(userDataPath);
  workspace = new WorkspaceService({ userDataPath, coreSkillRoot: resolveCoreSkillRoot() });
  installAssetProtocol(workspace);
  agentController = new AgentController({
    userDataPath,
    workspace,
    vault,
    codexBinary: await resolveCodexExecutable() ?? undefined
  });
  agentController.on("event", (event: AgentEventDto) => {
    for (const window of BrowserWindow.getAllWindows()) window.webContents.send(IPC.agentEvent, event);
  });
  configureSessionSecurity();
  await installIpcHandlers(userDataPath);
  await createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) void createWindow();
  });
}).catch((error) => {
  dialog.showErrorBox("AI 导演工作台无法启动", error instanceof Error ? error.message : String(error));
  app.quit();
});

app.on("before-quit", () => {
  workspace?.close();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
