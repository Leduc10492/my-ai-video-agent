import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  ActSchema,
  AssetSchema,
  AssetUsageSchema,
  BeatSchema,
  DraftImageSchema,
  EntitySchemas,
  EpisodeSchema,
  ProjectSchema,
  PromptEnvelopeSchema,
  QaFindingSchema,
  ReferenceStateSchema,
  RevisionSchema,
  SceneSchema,
  ScriptBlockSchema,
  SequenceSchema,
  ShotEnvelopeLinkSchema,
  ShotRowSchema,
  TaskSchema,
  acceptDraftProposal,
  acceptedOperations,
  createDemoProject,
  type Act,
  type Asset,
  type AssetUsage,
  type Beat,
  type DemoProjectGraph,
  type DependencyEdge,
  type DraftImage,
  type DraftProposal,
  type EntityType,
  type Episode,
  type Project,
  type PromptEnvelope,
  type QaFinding,
  type ReferenceState,
  type Revision,
  type Scene,
  type ScriptBlock,
  type Sequence,
  type ShotEnvelopeLink,
  type ShotRow,
  type Task,
} from "@ai-director/domain";
import { ProjectDatabase, openProjectDatabase, type OpenDatabaseOptions } from "./database.js";
import {
  AgentRunRepository,
  DependencyRepository,
  DraftProposalRepository,
  EntityRepository,
  ProjectSettingsRepository,
  RevisionRepository,
  ShotEnvelopeLinkRepository,
  SkillBindingRepository,
  insertRevision,
  sha256,
  type PersistedEntity,
  type RevisionMetadata,
} from "./repositories.js";

export interface ProjectBundle {
  project: Project;
  episodes: Episode[];
  acts: Act[];
  sequences: Sequence[];
  scenes: Scene[];
  beats: Beat[];
  scriptBlocks: ScriptBlock[];
  assets: Asset[];
  assetUsages: AssetUsage[];
  references: ReferenceState[];
  draftImages: DraftImage[];
  shotRows: ShotRow[];
  promptEnvelopes: PromptEnvelope[];
  links: ShotEnvelopeLink[];
  tasks: Task[];
  qaFindings: QaFinding[];
  stale: ReturnType<DependencyRepository["listStale"]>;
  skillBindings: ReturnType<SkillBindingRepository["list"]>;
  recentRuns: ReturnType<AgentRunRepository["list"]>;
  draftProposals: ReturnType<DraftProposalRepository["list"]>;
}

export interface AcceptDraftOptions {
  operationIds?: string[];
  actor?: string;
  decidedAt?: string;
  staleReason?: string;
}

interface DynamicRepository extends EntityRepository<PersistedEntity> {}

export class DirectorStore {
  readonly projects: EntityRepository<Project>;
  readonly episodes: EntityRepository<Episode>;
  readonly acts: EntityRepository<Act>;
  readonly sequences: EntityRepository<Sequence>;
  readonly scenes: EntityRepository<Scene>;
  readonly beats: EntityRepository<Beat>;
  readonly scriptBlocks: EntityRepository<ScriptBlock>;
  readonly assets: EntityRepository<Asset>;
  readonly assetUsages: EntityRepository<AssetUsage>;
  readonly references: EntityRepository<ReferenceState>;
  readonly draftImages: EntityRepository<DraftImage>;
  readonly shotRows: EntityRepository<ShotRow>;
  readonly promptEnvelopes: EntityRepository<PromptEnvelope>;
  readonly tasks: EntityRepository<Task>;
  readonly qaFindings: EntityRepository<QaFinding>;
  readonly links: ShotEnvelopeLinkRepository;
  readonly revisions: RevisionRepository;
  readonly dependencies: DependencyRepository;
  readonly runs: AgentRunRepository;
  readonly drafts: DraftProposalRepository;
  readonly skills: SkillBindingRepository;
  readonly settings: ProjectSettingsRepository;

  private readonly entityRepositories: Record<EntityType, DynamicRepository>;

  constructor(readonly database: ProjectDatabase) {
    const db = database.db;
    this.projects = new EntityRepository<Project>(db, "project", ProjectSchema);
    this.episodes = new EntityRepository<Episode>(db, "episode", EpisodeSchema);
    this.acts = new EntityRepository<Act>(db, "act", ActSchema);
    this.sequences = new EntityRepository<Sequence>(db, "sequence", SequenceSchema);
    this.scenes = new EntityRepository<Scene>(db, "scene", SceneSchema);
    this.beats = new EntityRepository<Beat>(db, "beat", BeatSchema);
    this.scriptBlocks = new EntityRepository<ScriptBlock>(db, "scriptBlock", ScriptBlockSchema);
    this.assets = new EntityRepository<Asset>(db, "asset", AssetSchema);
    this.assetUsages = new EntityRepository<AssetUsage>(db, "assetUsage", AssetUsageSchema);
    this.references = new EntityRepository<ReferenceState>(db, "referenceState", ReferenceStateSchema);
    this.draftImages = new EntityRepository<DraftImage>(db, "draftImage", DraftImageSchema);
    this.shotRows = new EntityRepository<ShotRow>(db, "shotRow", ShotRowSchema);
    this.promptEnvelopes = new EntityRepository<PromptEnvelope>(db, "promptEnvelope", PromptEnvelopeSchema);
    this.tasks = new EntityRepository<Task>(db, "task", TaskSchema);
    this.qaFindings = new EntityRepository<QaFinding>(db, "qaFinding", QaFindingSchema);
    this.links = new ShotEnvelopeLinkRepository(db);
    this.revisions = new RevisionRepository(db);
    this.dependencies = new DependencyRepository(db);
    this.runs = new AgentRunRepository(db);
    this.drafts = new DraftProposalRepository(db);
    this.skills = new SkillBindingRepository(db);
    this.settings = new ProjectSettingsRepository(db);
    this.entityRepositories = {
      project: this.projects as DynamicRepository,
      episode: this.episodes as DynamicRepository,
      act: this.acts as DynamicRepository,
      sequence: this.sequences as DynamicRepository,
      scene: this.scenes as DynamicRepository,
      beat: this.beats as DynamicRepository,
      scriptBlock: this.scriptBlocks as DynamicRepository,
      asset: this.assets as DynamicRepository,
      assetUsage: this.assetUsages as DynamicRepository,
      referenceState: this.references as DynamicRepository,
      draftImage: this.draftImages as DynamicRepository,
      shotRow: this.shotRows as DynamicRepository,
      promptEnvelope: this.promptEnvelopes as DynamicRepository,
      task: this.tasks as DynamicRepository,
      qaFinding: this.qaFindings as DynamicRepository,
    };
    if (!database.readOnly) {
      for (const project of this.listProjects()) this.rebuildDependencies(project.id);
    }
  }

  static open(projectRoot: string, options?: OpenDatabaseOptions): DirectorStore {
    return new DirectorStore(openProjectDatabase(projectRoot, options));
  }

  repository(type: EntityType): DynamicRepository {
    return this.entityRepositories[type]!;
  }

  listProjects(): Project[] {
    const rows = this.database.db.prepare("SELECT data_json FROM entities WHERE entity_type = 'project' AND archived_at IS NULL ORDER BY updated_at DESC")
      .all() as { data_json: string }[];
    return rows.map(({ data_json }) => ProjectSchema.parse(JSON.parse(data_json)));
  }

  getBundle(projectId: string): ProjectBundle {
    const project = this.projects.require(projectId);
    return {
      project,
      episodes: this.episodes.list({ projectId }),
      acts: this.acts.list({ projectId }),
      sequences: this.sequences.list({ projectId }),
      scenes: this.scenes.list({ projectId }),
      beats: this.beats.list({ projectId }),
      scriptBlocks: this.scriptBlocks.list({ projectId }),
      assets: this.assets.list({ projectId }),
      assetUsages: this.assetUsages.list({ projectId }),
      references: this.references.list({ projectId }),
      draftImages: this.draftImages.list({ projectId }),
      shotRows: this.shotRows.list({ projectId }),
      promptEnvelopes: this.promptEnvelopes.list({ projectId }),
      links: this.links.list(projectId),
      tasks: this.tasks.list({ projectId }),
      qaFindings: this.qaFindings.list({ projectId }),
      stale: this.dependencies.listStale(projectId),
      skillBindings: this.skills.list(projectId),
      recentRuns: this.runs.list(projectId),
      draftProposals: this.drafts.list(projectId),
    };
  }

  commitAndInvalidate<T extends PersistedEntity>(
    entityType: EntityType,
    entity: T,
    metadata: RevisionMetadata,
    staleReason = `${entityType} changed upstream`,
  ): { entity: T; revision: Revision } {
    return this.database.transaction(() => {
      const result = this.repository(entityType).commit(entity, metadata) as { entity: T; revision: Revision };
      this.dependencies.clearStale(entity.projectId, entityType, entity.id);
      this.dependencies.markDownstreamStale(entity.projectId, [{ entityType, entityId: entity.id }], staleReason, result.revision.createdAt);
      this.rebuildDependencies(entity.projectId);
      return result;
    });
  }

  restoreRevision(revisionId: string, actor = "用户"): Revision {
    return this.database.transaction(() => {
      const target = this.revisions.require(revisionId);
      const type = z.enum(Object.keys(EntitySchemas) as [EntityType, ...EntityType[]]).parse(target.entityType);
      const result = this.repository(type).restoreRevision(target, {
        author: { type: "user", name: actor },
        message: `恢复版本 ${revisionId}`,
      });
      this.dependencies.clearStale(target.projectId, type, target.entityId);
      this.dependencies.markDownstreamStale(target.projectId, [{ entityType: type, entityId: target.entityId }], "上游已恢复为历史版本", result.revision.createdAt);
      this.rebuildDependencies(target.projectId);
      return result.revision;
    });
  }

  replaceShotEnvelopeMapping(
    projectId: string,
    sceneId: string,
    links: ShotEnvelopeLink[],
    actor = "用户",
    createdAt = new Date().toISOString(),
  ): { links: ShotEnvelopeLink[]; revision: Revision } {
    return this.database.transaction(() => {
      const previousLinks = this.links.listForScene(projectId, sceneId);
      const nextLinks = this.links.replaceForScene(projectId, sceneId, links);
      const previous = this.revisions.listForEntity(projectId, "shotEnvelopeMapping", sceneId, 1)[0];
      const revision = RevisionSchema.parse({
        id: `rev_${randomUUID()}`,
        projectId,
        entityType: "shotEnvelopeMapping",
        entityId: sceneId,
        parentRevisionId: previous?.id,
        author: { type: "user", name: actor },
        createdAt,
        contentHash: sha256(nextLinks),
        upstreamRevisionIds: [],
        upstreamHashes: {},
        snapshot: nextLinks,
        message: "用户调整 Shot Row 与 Prompt Envelope 编组",
      });
      insertRevision(this.database.db, revision);
      const affectedEnvelopeIds = new Set([...previousLinks, ...nextLinks].map((link) => link.promptEnvelopeId));
      for (const envelopeId of affectedEnvelopeIds) {
        this.dependencies.clearStale(projectId, "promptEnvelope", envelopeId);
      }
      this.dependencies.markDownstreamStale(
        projectId,
        [...affectedEnvelopeIds].map((entityId) => ({ entityType: "promptEnvelope", entityId })),
        "Shot Row 与 Prompt Envelope 编组已变化",
        revision.createdAt,
      );
      this.rebuildDependencies(projectId);
      return { links: nextLinks, revision };
    });
  }

  acceptAndApplyDraft(proposalId: string, options: AcceptDraftOptions = {}): DraftProposal {
    return this.database.transaction(() => {
      const candidate = this.drafts.require(proposalId);
      const run = candidate.runId ? this.runs.get(candidate.runId) : undefined;
      if (candidate.runId && !run) throw new Error(`Agent run ${candidate.runId} not found`);
      if (run) {
        if (run.projectId !== candidate.projectId) throw new Error(`Agent run ${run.id} belongs to another project`);
        this.assertUpstreamRevisionsCurrent(candidate.projectId, run.upstreamRevisions);
      }
      const accepted = acceptDraftProposal(candidate, options.operationIds, options.decidedAt);
      const operations = acceptedOperations(accepted);
      const changed: { entityType: string; entityId: string }[] = [];
      const mappingScenes = new Set<string>();
      const mappingEnvelopeIds = new Set<string>();
      const author = { type: "user" as const, name: options.actor ?? "用户" };

      for (const operation of operations) {
        if (operation.op === "link" || operation.op === "unlink") {
          const payload = z.object({
            id: z.string().optional(),
            shotRowId: z.string().min(1),
            promptEnvelopeId: z.string().min(1),
            orderInEnvelope: z.number().int().nonnegative().optional(),
          }).parse(operation.payload);
          const shot = this.shotRows.require(payload.shotRowId);
          const envelope = this.promptEnvelopes.require(payload.promptEnvelopeId);
          if (shot.projectId !== candidate.projectId || envelope.projectId !== candidate.projectId || shot.sceneId !== envelope.sceneId) {
            throw new Error("Shot–Envelope mappings cannot cross project or scene boundaries");
          }
          mappingScenes.add(shot.sceneId);
          mappingEnvelopeIds.add(envelope.id);
          if (operation.op === "link") {
            this.links.insertRow(ShotEnvelopeLinkSchema.parse({
              id: payload.id ?? operation.entityId ?? `link_${randomUUID()}`,
              projectId: candidate.projectId,
              shotRowId: payload.shotRowId,
              promptEnvelopeId: payload.promptEnvelopeId,
              orderInEnvelope: payload.orderInEnvelope ?? 0,
              createdAt: accepted.decidedAt,
            }));
          } else {
            this.links.deleteRow(candidate.projectId, payload.shotRowId, payload.promptEnvelopeId);
          }
          continue;
        }

        const entityType = z.enum(Object.keys(EntitySchemas) as [EntityType, ...EntityType[]]).parse(operation.entityType);
        const repository = this.repository(entityType);
        const entityId = operation.entityId ?? (typeof operation.payload === "object" && operation.payload !== null
          ? (operation.payload as { id?: string }).id : undefined);
        if (!entityId) throw new Error(`${operation.op} operation requires an entityId`);
        const metadata: RevisionMetadata = {
          author,
          expectedRevision: operation.baseRevision ?? null,
          message: `接受 Agent 候选修改 ${proposalId}`,
          upstreamRevisionIds: run?.upstreamRevisions ?? [],
          skill: run?.skill,
          provider: run?.provider,
          model: run?.model,
          createdAt: accepted.decidedAt,
        };

        if (operation.op === "create") {
          if (repository.get(entityId)) throw new Error(`${entityType}:${entityId} already exists`);
          const entity = EntitySchemas[entityType].parse(operation.payload) as PersistedEntity;
          if (entity.id !== entityId || entity.projectId !== candidate.projectId) throw new Error("Draft create identity does not match its proposal");
          repository.commit(entity, metadata);
        } else if (operation.op === "patch") {
          const current = repository.require(entityId);
          const patch = z.record(z.string(), z.unknown()).parse(operation.payload);
          repository.commit({ ...current, ...patch, id: current.id, projectId: current.projectId }, metadata);
        } else if (operation.op === "reorder") {
          const current = repository.require(entityId);
          const { ordinal } = z.object({ ordinal: z.number().nonnegative() }).parse(operation.payload);
          repository.commit({ ...current, ordinal } as PersistedEntity, metadata);
        } else if (operation.op === "archive") {
          repository.archive(entityId, metadata);
        } else {
          throw new Error(`Unsupported operation ${operation.op}`);
        }
        changed.push({ entityType, entityId });
      }

      for (const sceneId of mappingScenes) {
        this.assertSceneMappingComplete(candidate.projectId, sceneId);
        const snapshot = this.links.listForScene(candidate.projectId, sceneId);
        const previous = this.revisions.listForEntity(candidate.projectId, "shotEnvelopeMapping", sceneId, 1)[0];
        insertRevision(this.database.db, RevisionSchema.parse({
          id: `rev_${randomUUID()}`,
          projectId: candidate.projectId,
          entityType: "shotEnvelopeMapping",
          entityId: sceneId,
          parentRevisionId: previous?.id,
          author,
          createdAt: accepted.decidedAt,
          contentHash: sha256(snapshot),
          upstreamRevisionIds: run?.upstreamRevisions ?? [],
          upstreamHashes: {},
          skill: run?.skill,
          provider: run?.provider,
          model: run?.model,
          snapshot,
          message: `接受 Agent 候选编组 ${proposalId}`,
        }));
      }
      for (const envelopeId of mappingEnvelopeIds) changed.push({ entityType: "promptEnvelope", entityId: envelopeId });
      for (const item of changed) this.dependencies.clearStale(candidate.projectId, item.entityType, item.entityId);
      this.dependencies.markDownstreamStale(
        candidate.projectId,
        changed,
        options.staleReason ?? "已接受的上游候选修改需要检查下游",
        accepted.decidedAt,
      );
      this.rebuildDependencies(candidate.projectId);
      this.drafts.saveRow(accepted);
      return accepted;
    });
  }

  /** Preferred UI entry point: captures a consistent pre-acceptance database snapshot first. */
  async acceptAndApplyDraftWithSnapshot(
    proposalId: string,
    options: AcceptDraftOptions = {},
  ): Promise<{ proposal: DraftProposal; snapshotPath: string }> {
    const snapshotPath = await this.database.createSnapshot(`before-accept-${proposalId}-${Date.now()}`);
    return { proposal: this.acceptAndApplyDraft(proposalId, options), snapshotPath };
  }

  seedDemo(now?: string): DemoProjectGraph {
    const demo = createDemoProject(now);
    if (this.projects.get(demo.project.id)) return demo;
    this.database.transaction(() => {
      const metadata = { author: { type: "system" as const, name: "示例项目" }, expectedRevision: null, message: "创建示例数据", createdAt: demo.project.createdAt };
      const groups: [EntityType, PersistedEntity[]][] = [
        ["project", [demo.project]], ["episode", demo.episodes], ["act", demo.acts],
        ["sequence", demo.sequences], ["scene", demo.scenes], ["beat", demo.beats],
        ["scriptBlock", demo.scriptBlocks], ["asset", demo.assets], ["referenceState", demo.references],
        ["draftImage", demo.draftImages], ["shotRow", demo.shotRows], ["promptEnvelope", demo.promptEnvelopes],
        ["task", demo.tasks], ["qaFinding", demo.qaFindings],
      ];
      for (const [type, entities] of groups) for (const entity of entities) this.repository(type).commit(entity, metadata);
      for (const scene of demo.scenes) {
        const sceneLinks = demo.links.filter((link) => demo.shotRows.find((shot) => shot.id === link.shotRowId)?.sceneId === scene.id);
        if (this.shotRows.list({ projectId: demo.project.id, parentId: scene.id }).length > 0) {
          this.links.replaceForScene(demo.project.id, scene.id, sceneLinks);
        }
      }
      this.rebuildDependencies(demo.project.id);
      demo.skillBindings.forEach((binding) => this.skills.bind(binding));
    });
    return demo;
  }

  close(): void {
    this.database.close();
  }

  rebuildDependencies(projectId: string): DependencyEdge[] {
    const scenes = this.scenes.list({ projectId });
    const scriptBlocks = this.scriptBlocks.list({ projectId });
    const assets = this.assets.list({ projectId });
    const shotRows = this.shotRows.list({ projectId });
    const promptEnvelopes = this.promptEnvelopes.list({ projectId });
    const draftImages = this.draftImages.list({ projectId });
    const links = this.links.list(projectId);
    const sceneIds = new Set(scenes.map(({ id }) => id));
    const scriptBlockIds = new Set(scriptBlocks.map(({ id }) => id));
    const assetIds = new Set(assets.map(({ id }) => id));
    const shotRowIds = new Set(shotRows.map(({ id }) => id));
    const promptEnvelopeIds = new Set(promptEnvelopes.map(({ id }) => id));
    const edges = new Map<string, DependencyEdge>();

    const addEdge = (
      upstreamEntityType: string,
      upstreamEntityId: string,
      downstreamEntityType: string,
      downstreamEntityId: string,
      relation: string,
      createdAt: string,
    ) => {
      const key = [upstreamEntityType, upstreamEntityId, downstreamEntityType, downstreamEntityId, relation].join("\u0000");
      edges.set(key, {
        id: `dep_${sha256({ projectId, upstreamEntityType, upstreamEntityId, downstreamEntityType, downstreamEntityId, relation }).slice(0, 40)}`,
        projectId,
        upstreamEntityType,
        upstreamEntityId,
        downstreamEntityType,
        downstreamEntityId,
        relation,
        createdAt,
      });
    };

    for (const shot of shotRows) {
      if (sceneIds.has(shot.sceneId)) {
        addEdge("scene", shot.sceneId, "shotRow", shot.id, "scene_to_shot", shot.createdAt);
      }
      for (const blockId of shot.sourceScriptBlockIds) {
        if (scriptBlockIds.has(blockId)) {
          addEdge("scriptBlock", blockId, "shotRow", shot.id, "script_to_shot", shot.createdAt);
        }
      }
    }

    for (const envelope of promptEnvelopes) {
      if (sceneIds.has(envelope.sceneId)) {
        addEdge("scene", envelope.sceneId, "promptEnvelope", envelope.id, "scene_to_prompt", envelope.createdAt);
      }
      for (const blockId of envelope.sourceScriptBlockIds) {
        if (scriptBlockIds.has(blockId)) {
          addEdge("scriptBlock", blockId, "promptEnvelope", envelope.id, "script_to_prompt", envelope.createdAt);
        }
      }
      for (const assetId of envelope.assetIds) {
        if (assetIds.has(assetId)) {
          addEdge("asset", assetId, "promptEnvelope", envelope.id, "asset_to_prompt", envelope.createdAt);
        }
      }
    }

    for (const link of links) {
      if (shotRowIds.has(link.shotRowId) && promptEnvelopeIds.has(link.promptEnvelopeId)) {
        addEdge("shotRow", link.shotRowId, "promptEnvelope", link.promptEnvelopeId, "shot_to_prompt", link.createdAt);
      }
    }

    for (const draftImage of draftImages) {
      if (promptEnvelopeIds.has(draftImage.promptEnvelopeId)) {
        addEdge("promptEnvelope", draftImage.promptEnvelopeId, "draftImage", draftImage.id, "prompt_to_draft_image", draftImage.createdAt);
      }
    }

    return this.dependencies.replaceAll(projectId, [...edges.values()]);
  }

  private assertUpstreamRevisionsCurrent(projectId: string, revisionIds: readonly string[]): void {
    for (const revisionId of new Set(revisionIds)) {
      const revision = this.revisions.require(revisionId);
      if (revision.projectId !== projectId) {
        throw new Error(`Upstream revision ${revision.id} belongs to another project`);
      }

      let currentRevisionId: string | undefined;
      if (revision.entityType === "shotEnvelopeMapping") {
        currentRevisionId = this.revisions.listForEntity(projectId, revision.entityType, revision.entityId, 1)[0]?.id;
      } else {
        const entityType = z.enum(Object.keys(EntitySchemas) as [EntityType, ...EntityType[]]).safeParse(revision.entityType);
        if (!entityType.success) {
          throw new Error(`Unsupported upstream revision entity type ${revision.entityType}`);
        }
        const entity = this.repository(entityType.data).get(revision.entityId);
        if (entity?.projectId === projectId) currentRevisionId = entity.currentRevisionId;
      }

      if (currentRevisionId !== revision.id) {
        throw new Error(
          `Upstream revision drift for ${revision.entityType}:${revision.entityId}; expected ${revision.id}, current ${currentRevisionId ?? "missing"}. Rerun against the latest project state.`,
        );
      }
    }
  }

  private assertSceneMappingComplete(projectId: string, sceneId: string): void {
    const shots = this.shotRows.list({ projectId, parentId: sceneId });
    const links = this.links.listForScene(projectId, sceneId);
    const linked = new Set(links.map(({ shotRowId }) => shotRowId));
    const missing = shots.filter(({ id }) => !linked.has(id)).map(({ id }) => id);
    if (missing.length > 0) throw new Error(`Every Shot Row must remain mapped after regrouping; missing: ${missing.join(", ")}`);
  }
}

export function openDirectorStore(projectRoot: string, options?: OpenDatabaseOptions): DirectorStore {
  return DirectorStore.open(projectRoot, options);
}
