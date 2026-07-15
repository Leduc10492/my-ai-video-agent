import { randomUUID } from "node:crypto";
import { EventEmitter } from "node:events";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  AgentJobManager,
  CodexAppServerClient,
  DRAFT_OPERATIONS_OUTPUT_SCHEMA,
  buildByokCodexLaunchConfig,
  buildLocalCodexLaunchConfig,
  prepareIsolatedCodexHome,
  resolveCodexBinary,
  type AgentJobRecord,
  type AgentJobRequest,
  type JobClient
} from "@ai-director/agent-runtime";
import type { AgentRun, DraftOperation, DraftProposal, SkillCapability } from "@ai-director/domain";
import { resolvePinnedSkill, resolveSkillDependencies } from "@ai-director/skill-runtime";
import type { DirectorStore, ProjectBundle } from "@ai-director/storage";
import { RuntimePreferenceSchema, type AgentEventDto, type RunAgentInput, type RuntimeModel } from "../shared/ipc";
import { CredentialVault } from "./credential-vault";
import { WorkspaceService } from "./workspace-service";

export interface AgentControllerOptions {
  userDataPath: string;
  workspace: WorkspaceService;
  vault: CredentialVault;
  codexBinary?: string;
}

function toDomainStatus(status: AgentJobRecord["status"]): AgentRun["status"] {
  if (status === "running" || status === "queued" || status === "failed" || status === "cancelled" || status === "interrupted") return status;
  return "completed";
}

function eventKind(status: AgentJobRecord["status"]): AgentEventDto["kind"] {
  return status === "running" ? "started" : status;
}

function statusMessage(status: AgentJobRecord["status"]): string {
  const messages: Record<AgentJobRecord["status"], string> = {
    queued: "任务已进入本地运行队列。",
    running: "Codex 正在读取已固定的上游版本与 Skill。",
    completed: "候选修改已生成，等待你的审阅。",
    failed: "运行未完成，正式数据没有改变。",
    cancelled: "运行已取消，正式数据没有改变。",
    interrupted: "运行被中断，可基于当前版本重新执行。"
  };
  return messages[status];
}

function progressFor(status: AgentJobRecord["status"]): number {
  return status === "queued" ? 5 : status === "running" ? 24 : 100;
}

function parsePayload(payload: unknown): unknown {
  if (typeof payload !== "string") return payload;
  try {
    return JSON.parse(payload) as unknown;
  } catch {
    throw new Error("候选操作的 payload 不是有效 JSON，已拒绝保存该结果。");
  }
}

function wrapClient(client: CodexAppServerClient, apiKey?: string): JobClient {
  client.on("serverRequest", (request: { reject: (code: number, message: string) => void }) => {
    request.reject(-32000, "AI Director does not grant interactive permission escalation during an unattended run.");
  });
  return {
    initialize: async () => {
      const result = await client.initialize();
      if (apiKey) await client.loginWithApiKey(apiKey);
      return result;
    },
    threadStart: client.threadStart.bind(client),
    turnStart: client.turnStart.bind(client),
    interruptTurn: client.interruptTurn.bind(client),
    close: client.close.bind(client),
    on: client.on.bind(client)
  };
}

interface ScopedContext {
  context: Record<string, unknown>;
  allowedEntityIds: Set<string>;
  upstreamRevisions: string[];
}

function revisionIds(entities: Array<{ currentRevisionId?: string }>): string[] {
  return entities.map((entity) => entity.currentRevisionId).filter((id): id is string => Boolean(id));
}

function buildScopedContext(store: DirectorStore, bundle: ProjectBundle, scopeIds: string[]): ScopedContext {
  const allEntities = [
    bundle.project,
    ...bundle.episodes,
    ...bundle.acts,
    ...bundle.sequences,
    ...bundle.scenes,
    ...bundle.beats,
    ...bundle.scriptBlocks,
    ...bundle.assets,
    ...bundle.assetUsages,
    ...bundle.references,
    ...bundle.draftImages,
    ...bundle.shotRows,
    ...bundle.promptEnvelopes,
    ...bundle.tasks,
    ...bundle.qaFindings
  ];
  const entityById = new Map(allEntities.map((entity) => [entity.id, entity]));
  for (const scopeId of scopeIds) {
    if (!entityById.has(scopeId)) throw new Error(`运行范围 ${scopeId} 不属于当前项目。`);
  }
  const wholeProject = scopeIds.includes(bundle.project.id);
  const selected = new Set(scopeIds);
  const sceneIds = new Set<string>();
  const sequenceIds = new Set<string>();
  const actIds = new Set<string>();
  const episodeIds = new Set<string>();
  const assetIds = new Set<string>();

  if (wholeProject) {
    bundle.scenes.forEach((item) => sceneIds.add(item.id));
    bundle.sequences.forEach((item) => sequenceIds.add(item.id));
    bundle.acts.forEach((item) => actIds.add(item.id));
    bundle.episodes.forEach((item) => episodeIds.add(item.id));
    bundle.assets.forEach((item) => assetIds.add(item.id));
  } else {
    bundle.episodes.filter((item) => selected.has(item.id)).forEach((item) => episodeIds.add(item.id));
    bundle.acts.filter((item) => selected.has(item.id) || (item.episodeId && episodeIds.has(item.episodeId))).forEach((item) => actIds.add(item.id));
    bundle.sequences.filter((item) => selected.has(item.id) || actIds.has(item.actId)).forEach((item) => sequenceIds.add(item.id));
    bundle.scenes.filter((item) => selected.has(item.id) || sequenceIds.has(item.sequenceId)).forEach((item) => sceneIds.add(item.id));
    bundle.beats.filter((item) => selected.has(item.id)).forEach((item) => sceneIds.add(item.sceneId));
    bundle.scriptBlocks.filter((item) => selected.has(item.id)).forEach((item) => {
      if (item.sceneId) sceneIds.add(item.sceneId);
      if (item.beatId) {
        const beat = bundle.beats.find((candidate) => candidate.id === item.beatId);
        if (beat) sceneIds.add(beat.sceneId);
      }
    });
    bundle.shotRows.filter((item) => selected.has(item.id)).forEach((item) => sceneIds.add(item.sceneId));
    bundle.promptEnvelopes.filter((item) => selected.has(item.id)).forEach((item) => sceneIds.add(item.sceneId));
    bundle.draftImages.filter((item) => selected.has(item.id)).forEach((item) => {
      const envelope = bundle.promptEnvelopes.find((candidate) => candidate.id === item.promptEnvelopeId);
      if (envelope) sceneIds.add(envelope.sceneId);
    });
    bundle.assets.filter((item) => selected.has(item.id)).forEach((item) => assetIds.add(item.id));
    bundle.references.filter((item) => selected.has(item.id)).forEach((item) => assetIds.add(item.assetId));
    bundle.assetUsages.filter((item) => selected.has(item.id)).forEach((item) => assetIds.add(item.assetId));
  }

  const scenes = bundle.scenes.filter((item) => sceneIds.has(item.id));
  scenes.forEach((scene) => sequenceIds.add(scene.sequenceId));
  const sequences = bundle.sequences.filter((item) => sequenceIds.has(item.id));
  sequences.forEach((sequence) => actIds.add(sequence.actId));
  const acts = bundle.acts.filter((item) => actIds.has(item.id));
  acts.forEach((act) => { if (act.episodeId) episodeIds.add(act.episodeId); });
  const episodes = bundle.episodes.filter((item) => episodeIds.has(item.id));
  const beats = bundle.beats.filter((item) => sceneIds.has(item.sceneId));
  const beatIds = new Set(beats.map((item) => item.id));
  const scriptBlocks = bundle.scriptBlocks.filter((item) =>
    (item.sceneId ? sceneIds.has(item.sceneId) : false) || (item.beatId ? beatIds.has(item.beatId) : false)
  );
  const shotRows = bundle.shotRows.filter((item) => sceneIds.has(item.sceneId));
  const promptEnvelopes = bundle.promptEnvelopes.filter((item) => sceneIds.has(item.sceneId));
  promptEnvelopes.forEach((item) => item.assetIds.forEach((id) => assetIds.add(id)));
  bundle.assets.filter((item) => item.sceneId && sceneIds.has(item.sceneId)).forEach((item) => assetIds.add(item.id));
  bundle.assetUsages.filter((item) => sceneIds.has(item.entityId) || shotRows.some((shot) => shot.id === item.entityId) || promptEnvelopes.some((envelope) => envelope.id === item.entityId))
    .forEach((item) => assetIds.add(item.assetId));
  const assets = bundle.assets.filter((item) => assetIds.has(item.id));
  const assetUsages = bundle.assetUsages.filter((item) => assetIds.has(item.assetId));
  const references = bundle.references.filter((item) => assetIds.has(item.assetId));
  const envelopeIds = new Set(promptEnvelopes.map((item) => item.id));
  const draftImages = bundle.draftImages.filter((item) => envelopeIds.has(item.promptEnvelopeId));
  const shotIds = new Set(shotRows.map((item) => item.id));
  const links = bundle.links.filter((item) => shotIds.has(item.shotRowId) && envelopeIds.has(item.promptEnvelopeId));
  const allowedEntityIds = new Set<string>([
    bundle.project.id,
    ...episodes.map((item) => item.id), ...acts.map((item) => item.id), ...sequences.map((item) => item.id),
    ...scenes.map((item) => item.id), ...beats.map((item) => item.id), ...scriptBlocks.map((item) => item.id),
    ...assets.map((item) => item.id), ...assetUsages.map((item) => item.id), ...references.map((item) => item.id),
    ...draftImages.map((item) => item.id), ...shotRows.map((item) => item.id), ...promptEnvelopes.map((item) => item.id)
  ]);
  const tasks = bundle.tasks.filter((item) => wholeProject || selected.has(item.id) || Boolean(item.relatedEntityId && allowedEntityIds.has(item.relatedEntityId)));
  const qaFindings = bundle.qaFindings.filter((item) => wholeProject || selected.has(item.id) || Boolean(item.entityId && allowedEntityIds.has(item.entityId)));
  tasks.forEach((item) => allowedEntityIds.add(item.id));
  qaFindings.forEach((item) => allowedEntityIds.add(item.id));

  const includedEntities = [bundle.project, ...episodes, ...acts, ...sequences, ...scenes, ...beats, ...scriptBlocks, ...assets, ...assetUsages, ...references, ...draftImages, ...shotRows, ...promptEnvelopes, ...tasks, ...qaFindings];
  const mappingRevisions = scenes.map((scene) => store.revisions.listForEntity(bundle.project.id, "shotEnvelopeMapping", scene.id, 1)[0]?.id)
    .filter((id): id is string => Boolean(id));
  const upstreamRevisions = [...new Set([...revisionIds(includedEntities), ...mappingRevisions])];
  return {
    allowedEntityIds,
    upstreamRevisions,
    context: {
      schemaVersion: 1,
      project: bundle.project,
      scopeIds,
      upstreamRevisions,
      episodes,
      acts,
      sequences,
      scenes,
      beats,
      scriptBlocks,
      assets,
      assetUsages,
      references,
      draftImages,
      shotRows,
      promptEnvelopes,
      shotEnvelopeLinks: links,
      tasks,
      qaFindings,
      staleMarkers: bundle.stale.filter((item) => allowedEntityIds.has(item.entityId))
    }
  };
}

function assertOperationWithinScope(
  source: { op: DraftOperation["op"]; entityType: string; entityId?: string; payload: unknown },
  payload: unknown,
  allowedEntityIds: Set<string>,
  projectId: string,
  wholeProject: boolean
): void {
  const body = payload && typeof payload === "object" && !Array.isArray(payload) ? payload as Record<string, unknown> : {};
  if (source.op === "link" || source.op === "unlink") {
    const shotRowId = typeof body.shotRowId === "string" ? body.shotRowId : "";
    const promptEnvelopeId = typeof body.promptEnvelopeId === "string" ? body.promptEnvelopeId : "";
    if (!allowedEntityIds.has(shotRowId) || !allowedEntityIds.has(promptEnvelopeId)) {
      throw new Error("候选编组超出了本次运行范围。");
    }
    return;
  }
  if (source.op !== "create") {
    if (!source.entityId || !allowedEntityIds.has(source.entityId)) throw new Error("候选修改超出了本次运行范围。");
    return;
  }
  if (body.projectId !== projectId) throw new Error("候选创建的数据不属于当前项目。");
  if (source.entityType === "project") throw new Error("Agent 不能创建或替换项目根实体。");
  if (wholeProject) return;
  const parentFields = ["episodeId", "actId", "sequenceId", "sceneId", "beatId", "assetId", "promptEnvelopeId", "relatedEntityId", "entityId"];
  const parents = parentFields.map((field) => body[field]).filter((value): value is string => typeof value === "string");
  if (!parents.some((id) => allowedEntityIds.has(id))) throw new Error("候选创建的数据没有位于本次运行范围内的父级。");
}

export class AgentController extends EventEmitter {
  readonly #workspace: WorkspaceService;
  readonly #vault: CredentialVault;
  readonly #userDataPath: string;
  readonly #codexBinary?: string;
  readonly #manager: AgentJobManager;
  readonly #proposalByJob = new Map<string, string>();

  constructor(options: AgentControllerOptions) {
    super();
    this.#workspace = options.workspace;
    this.#vault = options.vault;
    this.#userDataPath = options.userDataPath;
    this.#codexBinary = options.codexBinary;
    this.#manager = new AgentJobManager({
      clientFactory: (request) => this.createClient(request)
    });
    this.#manager.on("job", (record: AgentJobRecord) => {
      void this.persistAndEmit(record).catch((error) => {
        this.emitEvent({
          runId: record.id,
          kind: "failed",
          timestamp: new Date().toISOString(),
          progress: 100,
          message: error instanceof Error ? error.message : "无法保存 Agent 运行记录。"
        });
      });
    });
    this.#manager.on("stream", ({ jobId, method }: { jobId: string; method: string }) => {
      const progress = /turn\/started/i.test(method) ? 38 : /item\/started/i.test(method) ? 56 : /item\/completed/i.test(method) ? 78 : undefined;
      if (progress) {
        this.emitEvent({
          runId: jobId,
          kind: "progress",
          timestamp: new Date().toISOString(),
          progress,
          message: progress < 50 ? "已建立隔离任务，正在分析当前范围。" : progress < 70 ? "正在生成结构化候选修改。" : "正在校验候选操作与映射。"
        });
      }
    });
  }

  async run(input: RunAgentInput): Promise<{ runId: string }> {
    if (input.imageGenerationConfirmed || /(?:生成|制作|重绘).{0,8}(?:分镜|草稿)?(?:图|图片|画面)/u.test(input.prompt)) {
      throw new Error("草稿图运行通道正在进行计费前权限加固；当前技术预览不会发起图像生成。Shot Row 与 Prompt 可继续编辑。");
    }
    const summary = await this.#workspace.catalog.get(input.projectId);
    const store = await this.#workspace.getStore(input.projectId);
    const runtimePreference = RuntimePreferenceSchema.parse(store.settings.get(input.projectId, "runtimePreference") ?? { projectId: input.projectId });
    if (runtimePreference.provider !== input.provider || runtimePreference.model !== input.model || runtimePreference.effort !== input.effort) {
      throw new Error("项目运行设置已变化。请刷新工作台并确认通道、模型与推理强度后重试。");
    }
    const bundle = store.getBundle(input.projectId);
    const installed = await this.#workspace.listSkills();
    const binding = store.skills.get(input.projectId, input.stage);
    if (!binding) throw new Error(`当前项目尚未为 ${input.stage} 绑定 Skill。`);
    if (binding.skillId !== input.skillId) throw new Error("界面选择的 Skill 与项目固定版本不一致，请刷新后重试。");
    const disabledSkills = store.settings.get<string[]>(input.projectId, "disabledSkills") ?? [];
    if (disabledSkills.includes(`${binding.skillId}@${binding.skillVersion}`)) throw new Error("当前项目已停用这个 Skill；请先在 Skill 设置中重新启用。");
    const skill = resolvePinnedSkill({
      id: binding.skillId,
      version: binding.skillVersion,
      path: binding.skillPath,
      contentHash: binding.contentHash,
      slot: input.stage
    }, installed);
    if (skill.classification !== "core") {
      throw new Error("用户导入 Skill 的读取隔离尚未达到安全门槛；可以导入、编辑和绑定，但当前技术预览只执行内置核心 Skill。");
    }
    const outputSchema = JSON.parse(await readFile(join(skill.path, skill.manifest.outputSchema), "utf8")) as Record<string, unknown>;
    const scoped = buildScopedContext(store, bundle, input.scopeIds);
    const upstreamRevisions = scoped.upstreamRevisions;

    const sandboxId = randomUUID();
    const runRoot = join(summary.rootPath, ".ai-director", "runs", sandboxId);
    await mkdir(runRoot, { recursive: true, mode: 0o700 });
    const materializedSkillRoot = join(runRoot, ".agents", "skills");
    await mkdir(materializedSkillRoot, { recursive: true, mode: 0o700 });
    const materializedSkillPath = join(materializedSkillRoot, skill.id);
    await cp(skill.path, materializedSkillPath, { recursive: true, errorOnExist: true, force: false });
    for (const installedDependency of resolveSkillDependencies(skill.manifest, installed)) {
      if (installedDependency.classification !== "core") {
        throw new Error(`核心 Skill 依赖 ${installedDependency.id} 不是随应用审核分发的版本，已拒绝运行。`);
      }
      await cp(installedDependency.path, join(materializedSkillRoot, installedDependency.id), { recursive: true, errorOnExist: true, force: false });
    }
    await writeFile(join(runRoot, ".agents", "skill_registry.md"), [
      "# Materialized project Skill registry",
      "",
      ...bundle.skillBindings.map((item) => `- ${item.slot}: ${item.skillId}@${item.skillVersion}`)
    ].join("\n"), { encoding: "utf8", mode: 0o600 });
    await writeFile(join(runRoot, "context.json"), `${JSON.stringify(scoped.context, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
    await writeFile(join(runRoot, "RUN_RULES.md"), [
      "# AI Director isolated candidate run",
      "",
      "- `context.json` is the read-only upstream snapshot for this run.",
      "- Do not open or modify the project database or approved deliverables.",
      "- Return candidate operations only; the desktop app applies nothing without user acceptance.",
      "- Supported entity types are project, episode, act, sequence, scene, beat, scriptBlock, asset, assetUsage, referenceState, draftImage, shotRow, promptEnvelope, shotEnvelopeLink, task, and qaFinding.",
      "- Use entityType shotEnvelopeLink for link/unlink operations. A create payload must contain the complete valid entity, including id, projectId, timestamps, and its in-scope parent ID.",
      "- `payload` must be a JSON-encoded string matching the target entity shape.",
      "- Do not generate images unless the prompt explicitly says image generation is authorized."
    ].join("\n"), { encoding: "utf8", mode: 0o600 });

    const allowedCapabilities: SkillCapability[] = skill.manifest.capabilities.filter((capability) => {
      if (["project.read", "draft.propose", "asset.read"].includes(capability)) return true;
      return false;
    });
    const prompt = [
      "Read context.json and RUN_RULES.md before acting.",
      `Stage: ${input.stage}. Scope: ${input.scopeIds.join(", ")}.`,
      "Image generation is not authorized for this run.",
      "Every operation must keep entityId and baseRevision present (use null when not applicable). Encode payload as a valid JSON string.",
      "User objective:",
      input.prompt
    ].join("\n\n");
    const request: AgentJobRequest = {
      projectId: input.projectId,
      stage: input.stage,
      scopeIds: input.scopeIds,
      skill: {
        id: skill.id,
        version: skill.manifest.version,
        path: join(materializedSkillPath, skill.manifest.entry),
        contentHash: skill.contentHash
      },
      provider: runtimePreference.provider,
      model: runtimePreference.model,
      effort: runtimePreference.effort,
      upstreamRevisions,
      prompt,
      outputSchema,
      workingDirectory: runRoot,
      grantedCapabilities: allowedCapabilities,
      metadata: {
        sandboxId,
        imageGenerationConfirmed: false,
        wholeProject: input.scopeIds.includes(input.projectId),
        allowedEntityIds: [...scoped.allowedEntityIds]
      }
    };
    const record = await this.#manager.start(request);
    return { runId: record.id };
  }

  async cancel(runId: string): Promise<void> {
    await this.#manager.cancel(runId);
  }

  async testByokConnection(model: RuntimeModel): Promise<{ status: "ready" | "invalid"; message: string; lastTestedAt: string }> {
    const apiKey = await this.#vault.readForRuntime();
    if (!apiKey) throw new Error("尚未配置 OpenAI API Key。");
    const lastTestedAt = new Date().toISOString();
    const testRoot = join(this.#userDataPath, "connection-tests", randomUUID());
    await mkdir(testRoot, { recursive: true, mode: 0o700 });
    try {
      const skill = (await this.#workspace.listSkills()).find((candidate) => candidate.id === "artifact-formatter");
      if (!skill) throw new Error("缺少用于连接测试的核心 Skill。");
      const manager = new AgentJobManager({ clientFactory: (request) => this.createClient(request) });
      const record = await manager.start({
        projectId: "connection-test",
        stage: "artifact.formatter",
        scopeIds: ["connection-test"],
        skill: { id: skill.id, version: skill.manifest.version, path: skill.entryPath, contentHash: skill.contentHash },
        provider: "openai-key",
        model,
        effort: "low",
        upstreamRevisions: [],
        prompt: "Connection test only. Return summary 'Connection ready' and an empty operations array. Do not use tools or modify files.",
        outputSchema: DRAFT_OPERATIONS_OUTPUT_SCHEMA,
        workingDirectory: testRoot,
        grantedCapabilities: ["project.read", "draft.propose"]
      });
      const terminal = await manager.waitForTerminal(record.id, 90_000);
      if (terminal.status !== "completed") throw new Error(terminal.error ?? "最小结构化请求未完成。");
      return { status: "ready", message: "API Key 已通过隔离 Codex 的最小结构化请求验证。", lastTestedAt };
    } catch (error) {
      return {
        status: "invalid",
        message: error instanceof Error ? error.message : "API Key 验证失败。",
        lastTestedAt
      };
    } finally {
      await rm(testRoot, { recursive: true, force: true });
    }
  }

  async logoutByok(): Promise<void> {
    const profileRoot = join(this.#userDataPath, "codex-profiles", "openai-key");
    let client: CodexAppServerClient | undefined;
    try {
      const binary = await resolveCodexBinary(this.#codexBinary ? [this.#codexBinary] : []);
      const codexHome = await prepareIsolatedCodexHome(profileRoot);
      client = CodexAppServerClient.launch(buildByokCodexLaunchConfig({
        binary,
        cwd: this.#userDataPath,
        codexHome,
        model: "gpt-5.6-sol",
        effort: "low"
      }));
      await client.initialize();
      await client.accountLogout();
    } finally {
      await client?.close().catch(() => undefined);
      await rm(profileRoot, { recursive: true, force: true });
    }
  }

  private async createClient(request: AgentJobRequest): Promise<JobClient> {
    const binary = await resolveCodexBinary(this.#codexBinary ? [this.#codexBinary] : []);
    if (request.provider === "local-codex") {
      return wrapClient(CodexAppServerClient.launch(buildLocalCodexLaunchConfig({
        binary,
        cwd: request.workingDirectory,
        model: request.model,
        effort: request.effort
      })));
    }
    const apiKey = await this.#vault.readForRuntime();
    if (!apiKey) throw new Error("OpenAI API Key 尚未配置，未切换计费来源。");
    const codexHome = await prepareIsolatedCodexHome(join(this.#userDataPath, "codex-profiles", "openai-key"));
    const client = CodexAppServerClient.launch(buildByokCodexLaunchConfig({
      binary,
      cwd: request.workingDirectory,
      codexHome,
      model: request.model,
      effort: request.effort
    }));
    return wrapClient(client, apiKey);
  }

  private async persistAndEmit(record: AgentJobRecord): Promise<void> {
    const store = await this.#workspace.getStore(record.request.projectId);
    let outputProposalId = this.#proposalByJob.get(record.id);
    let status = toDomainStatus(record.status);
    let validationError: string | undefined;
    if (record.status === "completed" && !outputProposalId) {
      try {
        const allowedEntityIds = new Set(
          Array.isArray(record.request.metadata?.allowedEntityIds)
            ? record.request.metadata.allowedEntityIds.filter((id): id is string => typeof id === "string")
            : []
        );
        if (allowedEntityIds.size === 0) throw new Error("运行范围快照缺失，候选结果已拒绝。");
        const wholeProject = record.request.metadata?.wholeProject === true;
        const operations = (Array.isArray(record.result) ? record.result : []).map((operation) => {
          const source = operation as { op: DraftOperation["op"]; entityType: string; entityId?: string; baseRevision?: string; payload: unknown };
          if (source.entityType === "draftImage") throw new Error("当前运行通道未授权图像生成，草稿图候选已拒绝。");
          const payload = parsePayload(source.payload);
          assertOperationWithinScope(source, payload, allowedEntityIds, record.request.projectId, wholeProject);
          return {
            id: `operation_${randomUUID()}`,
            op: source.op,
            entityType: source.entityType,
            entityId: source.entityId,
            baseRevision: source.baseRevision,
            payload
          } satisfies DraftOperation;
        });
        outputProposalId = `proposal_${randomUUID()}`;
        const proposal: DraftProposal = {
          id: outputProposalId,
          projectId: record.request.projectId,
          runId: record.id,
          stage: record.request.stage,
          scopeIds: record.request.scopeIds,
          status: "candidate",
          operations,
          acceptedOperationIds: [],
          createdAt: record.finishedAt ?? new Date().toISOString(),
          summary: record.summary ?? "Agent 候选修改"
        };
        store.drafts.createCandidate(proposal);
        this.#proposalByJob.set(record.id, outputProposalId);
        status = "awaiting_approval";
      } catch (error) {
        validationError = error instanceof Error ? error.message : "候选结果超出运行范围，已拒绝。";
        status = "failed";
      }
    }
    const run: AgentRun = {
      id: record.id,
      projectId: record.request.projectId,
      stage: record.request.stage,
      scopeIds: record.request.scopeIds,
      status,
      skill: { ...record.request.skill, path: `run:${record.request.skill.id}@${record.request.skill.version}` },
      provider: record.request.provider,
      model: record.request.model,
      effort: record.request.effort,
      upstreamRevisions: record.request.upstreamRevisions,
      createdAt: record.createdAt,
      startedAt: record.startedAt,
      finishedAt: record.finishedAt,
      error: validationError ?? record.error,
      outputProposalId
    };
    store.runs.save(run);
    const kind = validationError ? "failed" : record.status === "completed" ? "draft" : eventKind(record.status);
    this.emitEvent({
      runId: record.id,
      kind,
      timestamp: new Date().toISOString(),
      progress: progressFor(record.status),
      message: validationError
        ? `候选结果未通过范围与权限校验，正式数据没有改变。${validationError}`
        : record.error ? `${statusMessage(record.status)} ${record.error}` : statusMessage(record.status),
      payload: outputProposalId ? { proposalId: outputProposalId, summary: record.summary, operationCount: Array.isArray(record.result) ? record.result.length : 0 } : undefined
    });
  }

  private emitEvent(event: AgentEventDto): void {
    this.emit("event", event);
  }
}
