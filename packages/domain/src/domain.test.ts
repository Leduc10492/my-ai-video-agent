import { describe, expect, it } from "vitest";
import {
  DraftAcceptanceError,
  EnvelopeRegroupingError,
  RevisionConflictError,
  acceptDraftProposal,
  acceptedOperations,
  assertBaseRevision,
  computeStaleMarkers,
  createDemoProject,
  regroupShotEnvelopes,
} from "./index.js";

describe("draft acceptance", () => {
  it("requires explicit acceptance and supports local acceptance", () => {
    const proposal = {
      id: "proposal_1",
      projectId: "project_1",
      stage: "script.primary" as const,
      scopeIds: ["scene_1"],
      status: "candidate" as const,
      operations: [
        { id: "op_1", op: "patch" as const, entityType: "scene", entityId: "scene_1", baseRevision: "rev_1", payload: { synopsis: "new" } },
        { id: "op_2", op: "patch" as const, entityType: "scene", entityId: "scene_2", baseRevision: "rev_2", payload: { synopsis: "later" } },
      ],
      acceptedOperationIds: [],
      createdAt: "2026-07-15T00:00:00.000Z",
      summary: "候选修改",
    };
    expect(() => acceptedOperations(proposal)).toThrow(DraftAcceptanceError);
    const accepted = acceptDraftProposal(proposal, ["op_1"], "2026-07-15T00:01:00.000Z");
    expect(accepted.status).toBe("partially_accepted");
    expect(acceptedOperations(accepted).map(({ id }) => id)).toEqual(["op_1"]);
  });

  it("detects stale base revisions", () => {
    expect(() => assertBaseRevision("scene", "scene_1", "rev_old", "rev_current")).toThrow(RevisionConflictError);
  });
});

describe("Shot Row and Prompt Envelope separation", () => {
  it("regroups links without touching Shot Rows", () => {
    const demo = createDemoProject();
    const links = regroupShotEnvelopes(demo.shotRows, demo.promptEnvelopes, [
      { promptEnvelopeId: "env_p001", shotRowIds: ["shot_r01"] },
      { promptEnvelopeId: "env_p002", shotRowIds: ["shot_r02", "shot_r03"] },
    ]);
    expect(links).toHaveLength(3);
    expect(links.filter(({ promptEnvelopeId }) => promptEnvelopeId === "env_p002").map(({ shotRowId }) => shotRowId)).toEqual(["shot_r02", "shot_r03"]);
    expect(demo.shotRows).toHaveLength(3);
  });

  it("rejects an unlinked Shot Row", () => {
    const demo = createDemoProject();
    expect(() => regroupShotEnvelopes(demo.shotRows, demo.promptEnvelopes, [
      { promptEnvelopeId: "env_p001", shotRowIds: ["shot_r01", "shot_r02"] },
    ])).toThrow(EnvelopeRegroupingError);
  });
});

describe("dependency invalidation", () => {
  it("marks only transitive downstream entities", () => {
    const markers = computeStaleMarkers("p", [{ entityType: "scene", entityId: "s1" }], [
      { id: "d1", projectId: "p", upstreamEntityType: "scene", upstreamEntityId: "s1", downstreamEntityType: "shotRow", downstreamEntityId: "r1", relation: "derived", createdAt: "2026-07-15T00:00:00.000Z" },
      { id: "d2", projectId: "p", upstreamEntityType: "shotRow", upstreamEntityId: "r1", downstreamEntityType: "promptEnvelope", downstreamEntityId: "e1", relation: "mapped", createdAt: "2026-07-15T00:00:00.000Z" },
      { id: "d3", projectId: "p", upstreamEntityType: "scene", upstreamEntityId: "s2", downstreamEntityType: "shotRow", downstreamEntityId: "r2", relation: "derived", createdAt: "2026-07-15T00:00:00.000Z" },
    ], "剧本已修改");
    expect(markers.map(({ entityId }) => entityId)).toEqual(["r1", "e1"]);
  });
});
