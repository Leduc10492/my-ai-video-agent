import { createHash, randomUUID } from "node:crypto";
import { z } from "zod";
import type { SqliteDatabase, SqlValue } from "./sqlite.js";
import { withTransaction } from "./sqlite.js";
import {
  AgentRunSchema,
  DependencyEdgeSchema,
  DraftProposalSchema,
  RevisionSchema,
  ShotEnvelopeLinkSchema,
  SkillBindingSchema,
  StaleMarkerSchema,
  assertBaseRevision,
  canonicalStringify,
  computeStaleMarkers,
  type AgentRun,
  type DependencyEdge,
  type DraftProposal,
  type Revision,
  type RevisionAuthor,
  type ShotEnvelopeLink,
  type SkillBinding,
  type StaleMarker,
} from "@ai-director/domain";

export interface PersistedEntity {
  id: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  currentRevisionId?: string;
  archivedAt?: string;
}

interface EntityRow {
  id: string;
  data_json: string;
}

export interface RevisionMetadata {
  author: RevisionAuthor;
  message?: string;
  expectedRevision?: string | null;
  upstreamRevisionIds?: string[];
  upstreamHashes?: Record<string, string>;
  skill?: { id: string; version: string; contentHash: string };
  provider?: "local-codex" | "openai-key";
  model?: string;
  createdAt?: string;
  revisionId?: string;
}

export interface ListEntitiesOptions {
  projectId: string;
  parentId?: string;
  includeArchived?: boolean;
  limit?: number;
  offset?: number;
}

export function sha256(value: unknown): string {
  return createHash("sha256").update(canonicalStringify(value)).digest("hex");
}

function parentIdOf(type: string, entity: Record<string, unknown>): string | null {
  switch (type) {
    case "episode": return entity.projectId as string;
    case "act": return (entity.episodeId as string | undefined) ?? entity.projectId as string;
    case "sequence": return entity.actId as string;
    case "scene": return entity.sequenceId as string;
    case "beat": return entity.sceneId as string;
    case "scriptBlock": return (entity.beatId as string | undefined) ?? (entity.sceneId as string | undefined) ?? null;
    case "asset": return (entity.sceneId as string | undefined) ?? entity.projectId as string;
    case "assetUsage": return entity.assetId as string;
    case "referenceState": return entity.assetId as string;
    case "draftImage": return entity.promptEnvelopeId as string;
    case "shotRow": return entity.sceneId as string;
    case "promptEnvelope": return entity.sceneId as string;
    case "task": return (entity.relatedEntityId as string | undefined) ?? entity.projectId as string;
    case "qaFinding": return (entity.entityId as string | undefined) ?? entity.projectId as string;
    default: return null;
  }
}

function ordinalOf(entity: Record<string, unknown>): number | null {
  return typeof entity.ordinal === "number" ? entity.ordinal : null;
}

function inTransaction<T>(db: SqliteDatabase, work: () => T): T {
  return withTransaction(db, work);
}

export class EntityRepository<T extends PersistedEntity> {
  constructor(
    private readonly db: SqliteDatabase,
    readonly entityType: string,
    private readonly schema: z.ZodType<T, z.ZodTypeDef, unknown>,
  ) {}

  get(id: string): T | undefined {
    const row = this.db.prepare("SELECT id, data_json FROM entities WHERE id = ? AND entity_type = ?")
      .get(id, this.entityType) as EntityRow | undefined;
    return row ? this.schema.parse(JSON.parse(row.data_json)) : undefined;
  }

  require(id: string): T {
    const entity = this.get(id);
    if (!entity) throw new Error(`${this.entityType}:${id} not found`);
    return entity;
  }

  list(options: ListEntitiesOptions): T[] {
    const filters = ["project_id = ?", "entity_type = ?"];
    const values: SqlValue[] = [options.projectId, this.entityType];
    if (!options.includeArchived) filters.push("archived_at IS NULL");
    if (options.parentId !== undefined) {
      filters.push("parent_id = ?");
      values.push(options.parentId);
    }
    const limit = Math.min(Math.max(options.limit ?? 10_000, 1), 100_000);
    const offset = Math.max(options.offset ?? 0, 0);
    const rows = this.db.prepare(`
      SELECT id, data_json FROM entities
      WHERE ${filters.join(" AND ")}
      ORDER BY COALESCE(ordinal, 999999999), created_at, id
      LIMIT ? OFFSET ?
    `).all(...values, limit, offset) as unknown as EntityRow[];
    return rows.map((row) => this.schema.parse(JSON.parse(row.data_json)));
  }

  count(projectId: string, includeArchived = false): number {
    const row = this.db.prepare(`
      SELECT COUNT(*) AS count FROM entities
      WHERE project_id = ? AND entity_type = ? ${includeArchived ? "" : "AND archived_at IS NULL"}
    `).get(projectId, this.entityType) as { count: number };
    return row.count;
  }

  commit(input: T, metadata: RevisionMetadata): { entity: T; revision: Revision } {
    const parsed = this.schema.parse(input);
    const existing = this.get(parsed.id);
    if (Object.prototype.hasOwnProperty.call(metadata, "expectedRevision")) {
      assertBaseRevision(this.entityType, parsed.id, metadata.expectedRevision ?? undefined, existing?.currentRevisionId);
    }
    const createdAt = metadata.createdAt ?? new Date().toISOString();
    const revisionId = metadata.revisionId ?? `rev_${randomUUID()}`;
    const snapshotForHash = { ...parsed, currentRevisionId: undefined, updatedAt: createdAt };
    const contentHash = sha256(snapshotForHash);
    const entity = this.schema.parse({
      ...parsed,
      createdAt: existing?.createdAt ?? parsed.createdAt,
      updatedAt: createdAt,
      currentRevisionId: revisionId,
    });
    const revision = RevisionSchema.parse({
      id: revisionId,
      projectId: entity.projectId,
      entityType: this.entityType,
      entityId: entity.id,
      parentRevisionId: existing?.currentRevisionId,
      author: metadata.author,
      createdAt,
      contentHash,
      upstreamRevisionIds: metadata.upstreamRevisionIds ?? [],
      upstreamHashes: metadata.upstreamHashes ?? {},
      skill: metadata.skill,
      provider: metadata.provider,
      model: metadata.model,
      snapshot: entity,
      message: metadata.message ?? "",
    });

    inTransaction(this.db, () => {
      this.upsertRow(entity);
      insertRevision(this.db, revision);
    });
    return { entity, revision };
  }

  patch(id: string, patch: Partial<T>, metadata: RevisionMetadata): { entity: T; revision: Revision } {
    const current = this.require(id);
    return this.commit({ ...current, ...patch, id: current.id, projectId: current.projectId } as T, metadata);
  }

  archive(id: string, metadata: RevisionMetadata): { entity: T; revision: Revision } {
    return this.patch(id, { archivedAt: metadata.createdAt ?? new Date().toISOString() } as Partial<T>, metadata);
  }

  restoreRevision(revision: Revision, metadata: RevisionMetadata): { entity: T; revision: Revision } {
    if (revision.entityType !== this.entityType) throw new Error(`Cannot restore ${revision.entityType} through ${this.entityType} repository`);
    const snapshot = this.schema.parse(revision.snapshot);
    const current = this.require(revision.entityId);
    return this.commit({ ...snapshot, currentRevisionId: current.currentRevisionId } as T, {
      ...metadata,
      expectedRevision: current.currentRevisionId,
      message: metadata.message ?? `Restore ${revision.id}`,
    });
  }

  /** Internal transaction-safe row writer. Public callers should use commit(). */
  upsertRow(entity: T): void {
    const parsed = this.schema.parse(entity);
    this.db.prepare(`
      INSERT INTO entities(
        id, project_id, entity_type, parent_id, ordinal, current_revision_id,
        archived_at, created_at, updated_at, data_json
      ) VALUES (
        @id, @projectId, @entityType, @parentId, @ordinal, @currentRevisionId,
        @archivedAt, @createdAt, @updatedAt, @dataJson
      )
      ON CONFLICT(id) DO UPDATE SET
        project_id = excluded.project_id,
        entity_type = excluded.entity_type,
        parent_id = excluded.parent_id,
        ordinal = excluded.ordinal,
        current_revision_id = excluded.current_revision_id,
        archived_at = excluded.archived_at,
        updated_at = excluded.updated_at,
        data_json = excluded.data_json
    `).run({
      id: parsed.id,
      projectId: parsed.projectId,
      entityType: this.entityType,
      parentId: parentIdOf(this.entityType, parsed as unknown as Record<string, unknown>),
      ordinal: ordinalOf(parsed as unknown as Record<string, unknown>),
      currentRevisionId: parsed.currentRevisionId ?? null,
      archivedAt: parsed.archivedAt ?? null,
      createdAt: parsed.createdAt,
      updatedAt: parsed.updatedAt,
      dataJson: JSON.stringify(parsed),
    });
  }
}

export function insertRevision(db: SqliteDatabase, revisionInput: Revision): void {
  const revision = RevisionSchema.parse(revisionInput);
  db.prepare(`
    INSERT INTO revisions(
      id, project_id, entity_type, entity_id, parent_revision_id, author_json,
      created_at, content_hash, upstream_revision_ids_json, upstream_hashes_json,
      skill_json, provider, model, snapshot_json, message
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    revision.id, revision.projectId, revision.entityType, revision.entityId,
    revision.parentRevisionId ?? null, JSON.stringify(revision.author), revision.createdAt,
    revision.contentHash, JSON.stringify(revision.upstreamRevisionIds), JSON.stringify(revision.upstreamHashes),
    revision.skill ? JSON.stringify(revision.skill) : null, revision.provider ?? null,
    revision.model ?? null, JSON.stringify(revision.snapshot), revision.message,
  );
}

function revisionFromRow(row: Record<string, unknown>): Revision {
  return RevisionSchema.parse({
    id: row.id,
    projectId: row.project_id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    parentRevisionId: row.parent_revision_id ?? undefined,
    author: JSON.parse(row.author_json as string),
    createdAt: row.created_at,
    contentHash: row.content_hash,
    upstreamRevisionIds: JSON.parse(row.upstream_revision_ids_json as string),
    upstreamHashes: JSON.parse(row.upstream_hashes_json as string),
    skill: row.skill_json ? JSON.parse(row.skill_json as string) : undefined,
    provider: row.provider ?? undefined,
    model: row.model ?? undefined,
    snapshot: JSON.parse(row.snapshot_json as string),
    message: row.message,
  });
}

export class RevisionRepository {
  constructor(private readonly db: SqliteDatabase) {}

  get(id: string): Revision | undefined {
    const row = this.db.prepare("SELECT * FROM revisions WHERE id = ?").get(id) as Record<string, unknown> | undefined;
    return row ? revisionFromRow(row) : undefined;
  }

  require(id: string): Revision {
    const revision = this.get(id);
    if (!revision) throw new Error(`Revision ${id} not found`);
    return revision;
  }

  listForEntity(projectId: string, entityType: string, entityId: string, limit = 200): Revision[] {
    const rows = this.db.prepare(`
      SELECT * FROM revisions WHERE project_id = ? AND entity_type = ? AND entity_id = ?
      ORDER BY created_at DESC, rowid DESC LIMIT ?
    `).all(projectId, entityType, entityId, limit) as Record<string, unknown>[];
    return rows.map(revisionFromRow);
  }
}

export class ShotEnvelopeLinkRepository {
  constructor(private readonly db: SqliteDatabase) {}

  get(id: string): ShotEnvelopeLink | undefined {
    const row = this.db.prepare("SELECT * FROM shot_envelope_links WHERE id = ?").get(id) as Record<string, unknown> | undefined;
    return row ? this.fromRow(row) : undefined;
  }

  list(projectId: string): ShotEnvelopeLink[] {
    const rows = this.db.prepare(`
      SELECT * FROM shot_envelope_links
      WHERE project_id = ?
      ORDER BY prompt_envelope_id, order_in_envelope, id
    `).all(projectId) as Record<string, unknown>[];
    return rows.map((row) => this.fromRow(row));
  }

  listForEnvelope(projectId: string, promptEnvelopeId: string): ShotEnvelopeLink[] {
    const rows = this.db.prepare(`
      SELECT * FROM shot_envelope_links WHERE project_id = ? AND prompt_envelope_id = ?
      ORDER BY order_in_envelope, id
    `).all(projectId, promptEnvelopeId) as Record<string, unknown>[];
    return rows.map((row) => this.fromRow(row));
  }

  listForShot(projectId: string, shotRowId: string): ShotEnvelopeLink[] {
    const rows = this.db.prepare(`
      SELECT * FROM shot_envelope_links WHERE project_id = ? AND shot_row_id = ?
      ORDER BY prompt_envelope_id, order_in_envelope
    `).all(projectId, shotRowId) as Record<string, unknown>[];
    return rows.map((row) => this.fromRow(row));
  }

  listForScene(projectId: string, sceneId: string): ShotEnvelopeLink[] {
    const rows = this.db.prepare(`
      SELECT l.* FROM shot_envelope_links l
      JOIN entities s ON s.id = l.shot_row_id AND s.entity_type = 'shotRow'
      WHERE l.project_id = ? AND s.parent_id = ?
      ORDER BY l.prompt_envelope_id, l.order_in_envelope
    `).all(projectId, sceneId) as Record<string, unknown>[];
    return rows.map((row) => this.fromRow(row));
  }

  replaceForScene(projectId: string, sceneId: string, linksInput: readonly ShotEnvelopeLink[]): ShotEnvelopeLink[] {
    const links = linksInput.map((link) => ShotEnvelopeLinkSchema.parse(link));
    const sceneShots = this.db.prepare("SELECT id FROM entities WHERE project_id = ? AND entity_type = 'shotRow' AND parent_id = ? AND archived_at IS NULL")
      .all(projectId, sceneId) as { id: string }[];
    const validShotIds = new Set(sceneShots.map(({ id }) => id));
    const validEnvelopeIds = new Set(
      (this.db.prepare("SELECT id FROM entities WHERE project_id = ? AND entity_type = 'promptEnvelope' AND parent_id = ? AND archived_at IS NULL")
        .all(projectId, sceneId) as { id: string }[]).map(({ id }) => id),
    );
    for (const link of links) {
      if (link.projectId !== projectId || !validShotIds.has(link.shotRowId) || !validEnvelopeIds.has(link.promptEnvelopeId)) {
        throw new Error(`Invalid cross-scene link ${link.id}`);
      }
    }
    const linkedShots = new Set(links.map(({ shotRowId }) => shotRowId));
    const missing = [...validShotIds].filter((id) => !linkedShots.has(id));
    if (missing.length > 0) throw new Error(`Every Shot Row must remain mapped; missing: ${missing.join(", ")}`);

    inTransaction(this.db, () => {
      this.db.prepare(`DELETE FROM shot_envelope_links WHERE project_id = ? AND shot_row_id IN (
        SELECT id FROM entities WHERE project_id = ? AND entity_type = 'shotRow' AND parent_id = ?
      )`).run(projectId, projectId, sceneId);
      for (const link of links) this.insertRow(link);
    });
    return this.listForScene(projectId, sceneId);
  }

  insertRow(linkInput: ShotEnvelopeLink): void {
    const link = ShotEnvelopeLinkSchema.parse(linkInput);
    this.db.prepare(`
      INSERT INTO shot_envelope_links(id, project_id, shot_row_id, prompt_envelope_id, order_in_envelope, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(project_id, shot_row_id, prompt_envelope_id) DO UPDATE SET
        id = excluded.id, order_in_envelope = excluded.order_in_envelope
    `).run(link.id, link.projectId, link.shotRowId, link.promptEnvelopeId, link.orderInEnvelope, link.createdAt);
  }

  deleteRow(projectId: string, shotRowId: string, promptEnvelopeId: string): void {
    this.db.prepare("DELETE FROM shot_envelope_links WHERE project_id = ? AND shot_row_id = ? AND prompt_envelope_id = ?")
      .run(projectId, shotRowId, promptEnvelopeId);
  }

  private fromRow(row: Record<string, unknown>): ShotEnvelopeLink {
    return ShotEnvelopeLinkSchema.parse({
      id: row.id, projectId: row.project_id, shotRowId: row.shot_row_id,
      promptEnvelopeId: row.prompt_envelope_id, orderInEnvelope: row.order_in_envelope,
      createdAt: row.created_at,
    });
  }
}

export class DependencyRepository {
  constructor(private readonly db: SqliteDatabase) {}

  put(edgeInput: DependencyEdge): DependencyEdge {
    const edge = DependencyEdgeSchema.parse(edgeInput);
    this.db.prepare(`
      INSERT INTO dependency_edges(
        id, project_id, upstream_entity_type, upstream_entity_id,
        downstream_entity_type, downstream_entity_id, relation, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(project_id, upstream_entity_type, upstream_entity_id, downstream_entity_type, downstream_entity_id, relation)
      DO UPDATE SET id = excluded.id
    `).run(edge.id, edge.projectId, edge.upstreamEntityType, edge.upstreamEntityId, edge.downstreamEntityType, edge.downstreamEntityId, edge.relation, edge.createdAt);
    return edge;
  }

  list(projectId: string): DependencyEdge[] {
    const rows = this.db.prepare("SELECT * FROM dependency_edges WHERE project_id = ? ORDER BY created_at, id")
      .all(projectId) as Record<string, unknown>[];
    return rows.map((row) => DependencyEdgeSchema.parse({
      id: row.id, projectId: row.project_id,
      upstreamEntityType: row.upstream_entity_type, upstreamEntityId: row.upstream_entity_id,
      downstreamEntityType: row.downstream_entity_type, downstreamEntityId: row.downstream_entity_id,
      relation: row.relation, createdAt: row.created_at,
    }));
  }

  replaceAll(projectId: string, edgeInputs: readonly DependencyEdge[]): DependencyEdge[] {
    const edges = edgeInputs.map((edge) => DependencyEdgeSchema.parse(edge));
    for (const edge of edges) {
      if (edge.projectId !== projectId) {
        throw new Error(`Dependency edge ${edge.id} belongs to ${edge.projectId}, not ${projectId}`);
      }
    }
    inTransaction(this.db, () => {
      this.db.prepare("DELETE FROM dependency_edges WHERE project_id = ?").run(projectId);
      for (const edge of edges) this.put(edge);
    });
    return edges;
  }

  markDownstreamStale(
    projectId: string,
    changed: readonly { entityType: string; entityId: string }[],
    reason: string,
    markedAt = new Date().toISOString(),
  ): StaleMarker[] {
    const markers = computeStaleMarkers(projectId, changed, this.list(projectId), reason, markedAt);
    const statement = this.db.prepare(`
      INSERT INTO stale_markers(
        project_id, entity_type, entity_id, source_entity_type, source_entity_id, reason, marked_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(project_id, entity_type, entity_id) DO UPDATE SET
        source_entity_type = excluded.source_entity_type,
        source_entity_id = excluded.source_entity_id,
        reason = excluded.reason,
        marked_at = excluded.marked_at
    `);
    inTransaction(this.db, () => {
      for (const marker of markers) statement.run(marker.projectId, marker.entityType, marker.entityId, marker.sourceEntityType, marker.sourceEntityId, marker.reason, marker.markedAt);
    });
    return markers;
  }

  listStale(projectId: string): StaleMarker[] {
    const rows = this.db.prepare("SELECT * FROM stale_markers WHERE project_id = ? ORDER BY marked_at DESC")
      .all(projectId) as Record<string, unknown>[];
    return rows.map((row) => StaleMarkerSchema.parse({
      projectId: row.project_id, entityType: row.entity_type, entityId: row.entity_id,
      sourceEntityType: row.source_entity_type, sourceEntityId: row.source_entity_id,
      reason: row.reason, markedAt: row.marked_at,
    }));
  }

  clearStale(projectId: string, entityType: string, entityId: string): boolean {
    return this.db.prepare("DELETE FROM stale_markers WHERE project_id = ? AND entity_type = ? AND entity_id = ?")
      .run(projectId, entityType, entityId).changes > 0;
  }
}

export class AgentRunRepository {
  constructor(private readonly db: SqliteDatabase) {}

  save(runInput: AgentRun): AgentRun {
    const run = AgentRunSchema.parse(runInput);
    this.db.prepare(`
      INSERT INTO agent_runs(id, project_id, stage, status, created_at, started_at, finished_at, data_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        status = excluded.status, started_at = excluded.started_at,
        finished_at = excluded.finished_at, data_json = excluded.data_json
    `).run(run.id, run.projectId, run.stage, run.status, run.createdAt, run.startedAt ?? null, run.finishedAt ?? null, JSON.stringify(run));
    return run;
  }

  get(id: string): AgentRun | undefined {
    const row = this.db.prepare("SELECT data_json FROM agent_runs WHERE id = ?").get(id) as { data_json: string } | undefined;
    return row ? AgentRunSchema.parse(JSON.parse(row.data_json)) : undefined;
  }

  list(projectId: string, limit = 200): AgentRun[] {
    const rows = this.db.prepare("SELECT data_json FROM agent_runs WHERE project_id = ? ORDER BY created_at DESC LIMIT ?")
      .all(projectId, limit) as { data_json: string }[];
    return rows.map(({ data_json }) => AgentRunSchema.parse(JSON.parse(data_json)));
  }

  recoverInterrupted(projectId?: string, now = new Date().toISOString()): AgentRun[] {
    const filters = ["status IN ('queued', 'running', 'awaiting_approval')"];
    const values: SqlValue[] = [];
    if (projectId) { filters.push("project_id = ?"); values.push(projectId); }
    const rows = this.db.prepare(`SELECT data_json FROM agent_runs WHERE ${filters.join(" AND ")}`).all(...values) as { data_json: string }[];
    const recovered = rows.map(({ data_json }) => AgentRunSchema.parse({ ...JSON.parse(data_json), status: "interrupted", finishedAt: now }));
    inTransaction(this.db, () => recovered.forEach((run) => this.save(run)));
    return recovered;
  }
}

export class DraftProposalRepository {
  constructor(private readonly db: SqliteDatabase) {}

  createCandidate(input: DraftProposal): DraftProposal {
    const proposal = DraftProposalSchema.parse(input);
    if (proposal.status !== "candidate") throw new Error("New agent output must be stored as a candidate proposal");
    this.saveRow(proposal);
    return proposal;
  }

  get(id: string): DraftProposal | undefined {
    const row = this.db.prepare("SELECT data_json FROM draft_proposals WHERE id = ?").get(id) as { data_json: string } | undefined;
    return row ? DraftProposalSchema.parse(JSON.parse(row.data_json)) : undefined;
  }

  require(id: string): DraftProposal {
    const proposal = this.get(id);
    if (!proposal) throw new Error(`Draft proposal ${id} not found`);
    return proposal;
  }

  list(projectId: string, limit = 200): DraftProposal[] {
    return (this.db.prepare("SELECT data_json FROM draft_proposals WHERE project_id = ? ORDER BY created_at DESC LIMIT ?")
      .all(projectId, limit) as { data_json: string }[])
      .map(({ data_json }) => DraftProposalSchema.parse(JSON.parse(data_json)));
  }

  reject(id: string, decidedAt = new Date().toISOString()): DraftProposal {
    const proposal = this.require(id);
    if (proposal.status !== "candidate") throw new Error(`Cannot reject ${proposal.status} proposal`);
    const rejected = DraftProposalSchema.parse({ ...proposal, status: "rejected", decidedAt });
    this.saveRow(rejected);
    return rejected;
  }

  saveRow(input: DraftProposal): void {
    const proposal = DraftProposalSchema.parse(input);
    this.db.prepare(`
      INSERT INTO draft_proposals(id, project_id, run_id, stage, status, created_at, decided_at, data_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET status = excluded.status, decided_at = excluded.decided_at, data_json = excluded.data_json
    `).run(proposal.id, proposal.projectId, proposal.runId ?? null, proposal.stage, proposal.status, proposal.createdAt, proposal.decidedAt ?? null, JSON.stringify(proposal));
  }
}

export class SkillBindingRepository {
  constructor(private readonly db: SqliteDatabase) {}

  bind(input: SkillBinding): SkillBinding {
    const binding = SkillBindingSchema.parse(input);
    this.db.prepare(`
      INSERT INTO skill_bindings(id, project_id, slot, skill_id, skill_version, content_hash, data_json)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(project_id, slot) DO UPDATE SET
        id = excluded.id, skill_id = excluded.skill_id, skill_version = excluded.skill_version,
        content_hash = excluded.content_hash, data_json = excluded.data_json
    `).run(binding.id, binding.projectId, binding.slot, binding.skillId, binding.skillVersion, binding.contentHash, JSON.stringify(binding));
    return binding;
  }

  get(projectId: string, slot: SkillBinding["slot"]): SkillBinding | undefined {
    const row = this.db.prepare("SELECT data_json FROM skill_bindings WHERE project_id = ? AND slot = ?")
      .get(projectId, slot) as { data_json: string } | undefined;
    return row ? SkillBindingSchema.parse(JSON.parse(row.data_json)) : undefined;
  }

  list(projectId: string): SkillBinding[] {
    return (this.db.prepare("SELECT data_json FROM skill_bindings WHERE project_id = ? ORDER BY slot")
      .all(projectId) as { data_json: string }[]).map(({ data_json }) => SkillBindingSchema.parse(JSON.parse(data_json)));
  }
}

export class ProjectSettingsRepository {
  constructor(private readonly db: SqliteDatabase) {}

  set(projectId: string, key: string, value: unknown, now = new Date().toISOString()): void {
    this.db.prepare(`
      INSERT INTO project_settings(project_id, key, value_json, updated_at) VALUES (?, ?, ?, ?)
      ON CONFLICT(project_id, key) DO UPDATE SET value_json = excluded.value_json, updated_at = excluded.updated_at
    `).run(projectId, key, JSON.stringify(value), now);
  }

  get<T = unknown>(projectId: string, key: string): T | undefined {
    const row = this.db.prepare("SELECT value_json FROM project_settings WHERE project_id = ? AND key = ?")
      .get(projectId, key) as { value_json: string } | undefined;
    return row ? JSON.parse(row.value_json) as T : undefined;
  }
}
