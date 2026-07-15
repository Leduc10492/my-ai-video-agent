import type {
  DependencyEdge,
  DraftOperation,
  DraftProposal,
  PromptEnvelope,
  ShotEnvelopeLink,
  ShotRow,
  StaleMarker,
} from "./schemas.js";

export class RevisionConflictError extends Error {
  readonly code = "REVISION_CONFLICT";

  constructor(
    readonly entityType: string,
    readonly entityId: string,
    readonly expectedRevision: string | undefined,
    readonly actualRevision: string | undefined,
  ) {
    super(`Revision conflict for ${entityType}:${entityId}; expected ${expectedRevision ?? "none"}, found ${actualRevision ?? "none"}`);
    this.name = "RevisionConflictError";
  }
}

export class DraftAcceptanceError extends Error {
  readonly code = "DRAFT_NOT_ACCEPTED";

  constructor(message = "Agent output is a candidate until the user explicitly accepts it") {
    super(message);
    this.name = "DraftAcceptanceError";
  }
}

export class EnvelopeRegroupingError extends Error {
  readonly code = "INVALID_ENVELOPE_REGROUPING";

  constructor(message: string) {
    super(message);
    this.name = "EnvelopeRegroupingError";
  }
}

export function assertBaseRevision(
  entityType: string,
  entityId: string,
  expectedRevision: string | undefined,
  actualRevision: string | undefined,
): void {
  if (expectedRevision !== actualRevision) {
    throw new RevisionConflictError(entityType, entityId, expectedRevision, actualRevision);
  }
}

export function acceptDraftProposal(
  proposal: DraftProposal,
  operationIds: readonly string[] = proposal.operations.map(({ id }) => id),
  decidedAt = new Date().toISOString(),
): DraftProposal {
  if (proposal.status !== "candidate") {
    throw new DraftAcceptanceError(`Only candidate proposals can be accepted; current status is ${proposal.status}`);
  }

  const validIds = new Set(proposal.operations.map(({ id }) => id));
  const acceptedOperationIds = [...new Set(operationIds)];
  for (const id of acceptedOperationIds) {
    if (!validIds.has(id)) throw new DraftAcceptanceError(`Unknown draft operation: ${id}`);
  }
  if (acceptedOperationIds.length === 0) {
    throw new DraftAcceptanceError("At least one operation must be explicitly accepted");
  }

  return {
    ...proposal,
    status: acceptedOperationIds.length === proposal.operations.length ? "accepted" : "partially_accepted",
    acceptedOperationIds,
    decidedAt,
  };
}

export function acceptedOperations(proposal: DraftProposal): DraftOperation[] {
  if (proposal.status !== "accepted" && proposal.status !== "partially_accepted") {
    throw new DraftAcceptanceError();
  }
  const accepted = new Set(proposal.acceptedOperationIds);
  return proposal.operations.filter(({ id }) => accepted.has(id));
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nested]) => [key, canonicalize(nested)]),
    );
  }
  return value;
}

export function canonicalStringify(value: unknown): string {
  return JSON.stringify(canonicalize(value));
}

export function assertShotRowsUnchanged(before: readonly ShotRow[], after: readonly ShotRow[]): void {
  if (before.length !== after.length) {
    throw new EnvelopeRegroupingError("Prompt regrouping cannot add or remove Shot Rows");
  }

  const afterById = new Map(after.map((row) => [row.id, row]));
  for (const row of before) {
    const next = afterById.get(row.id);
    if (!next) throw new EnvelopeRegroupingError(`Prompt regrouping removed Shot Row ${row.id}`);
    if (canonicalStringify(row) !== canonicalStringify(next)) {
      throw new EnvelopeRegroupingError(`Prompt regrouping modified Shot Row ${row.id}`);
    }
  }
}

export interface EnvelopeGrouping {
  promptEnvelopeId: string;
  shotRowIds: readonly string[];
}

/**
 * Rebuilds only the mapping layer. Every Shot Row must remain linked at least once,
 * and duplicate rows inside one Envelope are rejected.
 */
export function regroupShotEnvelopes(
  shotRows: readonly ShotRow[],
  envelopes: readonly PromptEnvelope[],
  groups: readonly EnvelopeGrouping[],
  options: { now?: string; idFactory?: (envelopeId: string, shotId: string, order: number) => string } = {},
): ShotEnvelopeLink[] {
  const shotIds = new Set(shotRows.map(({ id }) => id));
  const envelopeIds = new Set(envelopes.map(({ id }) => id));
  const linkedShotIds = new Set<string>();
  const now = options.now ?? new Date().toISOString();
  const projectIds = new Set([...shotRows, ...envelopes].map(({ projectId }) => projectId));
  if (projectIds.size !== 1) throw new EnvelopeRegroupingError("Rows and envelopes must belong to one project");
  const projectId = shotRows[0]?.projectId ?? envelopes[0]?.projectId;
  if (!projectId) throw new EnvelopeRegroupingError("At least one Shot Row and one Prompt Envelope are required");

  const links: ShotEnvelopeLink[] = [];
  for (const group of groups) {
    if (!envelopeIds.has(group.promptEnvelopeId)) {
      throw new EnvelopeRegroupingError(`Unknown Prompt Envelope ${group.promptEnvelopeId}`);
    }
    const local = new Set<string>();
    group.shotRowIds.forEach((shotRowId, orderInEnvelope) => {
      if (!shotIds.has(shotRowId)) throw new EnvelopeRegroupingError(`Unknown Shot Row ${shotRowId}`);
      if (local.has(shotRowId)) {
        throw new EnvelopeRegroupingError(`Shot Row ${shotRowId} is duplicated in ${group.promptEnvelopeId}`);
      }
      local.add(shotRowId);
      linkedShotIds.add(shotRowId);
      links.push({
        id: options.idFactory?.(group.promptEnvelopeId, shotRowId, orderInEnvelope)
          ?? `link_${group.promptEnvelopeId}_${shotRowId}_${orderInEnvelope}`,
        projectId,
        promptEnvelopeId: group.promptEnvelopeId,
        shotRowId,
        orderInEnvelope,
        createdAt: now,
      });
    });
  }

  const unlinked = shotRows.filter(({ id }) => !linkedShotIds.has(id)).map(({ id }) => id);
  if (unlinked.length > 0) {
    throw new EnvelopeRegroupingError(`Every Shot Row needs an Envelope mapping; missing: ${unlinked.join(", ")}`);
  }
  return links;
}

function dependencyKey(entityType: string, entityId: string): string {
  return `${entityType}\u0000${entityId}`;
}

/** Returns the transitive downstream set, without marking unrelated scopes stale. */
export function computeStaleMarkers(
  projectId: string,
  changes: readonly { entityType: string; entityId: string }[],
  edges: readonly DependencyEdge[],
  reason: string,
  markedAt = new Date().toISOString(),
): StaleMarker[] {
  const outgoing = new Map<string, DependencyEdge[]>();
  for (const edge of edges) {
    if (edge.projectId !== projectId) continue;
    const key = dependencyKey(edge.upstreamEntityType, edge.upstreamEntityId);
    outgoing.set(key, [...(outgoing.get(key) ?? []), edge]);
  }

  const queue = [...changes];
  const roots = new Map(changes.map((change) => [dependencyKey(change.entityType, change.entityId), change]));
  const seen = new Set(queue.map((item) => dependencyKey(item.entityType, item.entityId)));
  const markers = new Map<string, StaleMarker>();

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) break;
    const root = roots.get(dependencyKey(current.entityType, current.entityId)) ?? current;
    for (const edge of outgoing.get(dependencyKey(current.entityType, current.entityId)) ?? []) {
      const downstreamKey = dependencyKey(edge.downstreamEntityType, edge.downstreamEntityId);
      if (!markers.has(downstreamKey)) {
        markers.set(downstreamKey, {
          projectId,
          entityType: edge.downstreamEntityType,
          entityId: edge.downstreamEntityId,
          sourceEntityType: root.entityType,
          sourceEntityId: root.entityId,
          reason,
          markedAt,
        });
      }
      if (!seen.has(downstreamKey)) {
        seen.add(downstreamKey);
        roots.set(downstreamKey, root);
        queue.push({ entityType: edge.downstreamEntityType, entityId: edge.downstreamEntityId });
      }
    }
  }

  return [...markers.values()];
}
