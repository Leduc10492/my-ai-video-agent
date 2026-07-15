import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { DraftProposalSchema, type AgentRun } from "@ai-director/domain";
import { DirectorStore } from "./store.js";

const openStores: DirectorStore[] = [];
const roots: string[] = [];

function createStore(): DirectorStore {
  const root = mkdtempSync(join(tmpdir(), "ai-director-storage-"));
  roots.push(root);
  const store = DirectorStore.open(root);
  openStores.push(store);
  return store;
}

function agentRun(
  projectId: string,
  id: string,
  upstreamRevisions: string[],
  scopeIds = ["scene_21"],
): AgentRun {
  return {
    id,
    projectId,
    stage: "shotlist.primary",
    scopeIds,
    status: "awaiting_approval",
    skill: { id: "sketch-shotlist-workflow", version: "1.0.0", path: ".agents/skills/sketch-shotlist-workflow", contentHash: "hash" },
    provider: "local-codex",
    model: "gpt-5.6-sol",
    effort: "medium",
    upstreamRevisions,
    createdAt: "2026-07-15T09:00:00.000Z",
    startedAt: "2026-07-15T09:00:01.000Z",
  };
}

afterEach(() => {
  while (openStores.length > 0) openStores.pop()?.close();
  while (roots.length > 0) {
    const root = roots.pop();
    if (root) rmSync(root, { recursive: true, force: true });
  }
});

describe("local-first project storage", () => {
  it("migrates, enables WAL, seeds a complete project, and snapshots", async () => {
    const store = createStore();
    const demo = store.seedDemo();
    const bundle = store.getBundle(demo.project.id);

    expect(store.database.databasePath).toContain(".ai-director/project.db");
    expect(store.database.db.prepare("PRAGMA journal_mode").get()).toMatchObject({ journal_mode: "wal" });
    expect(bundle.scenes).toHaveLength(2);
    expect(bundle.shotRows).toHaveLength(3);
    expect(bundle.links).toHaveLength(3);
    expect(bundle.promptEnvelopes.find(({ id }) => id === "env_p001")).toBeTruthy();
    expect(bundle.project.currentRevisionId).toMatch(/^rev_/);

    expect(store.dependencies.list(demo.project.id)).toEqual(expect.arrayContaining([
      expect.objectContaining({ upstreamEntityType: "scriptBlock", upstreamEntityId: "block_2", downstreamEntityType: "shotRow", downstreamEntityId: "shot_r01" }),
      expect.objectContaining({ upstreamEntityType: "scriptBlock", upstreamEntityId: "block_2", downstreamEntityType: "promptEnvelope", downstreamEntityId: "env_p001" }),
      expect.objectContaining({ upstreamEntityType: "asset", upstreamEntityId: "asset_lin", downstreamEntityType: "promptEnvelope", downstreamEntityId: "env_p001" }),
      expect.objectContaining({ upstreamEntityType: "shotRow", upstreamEntityId: "shot_r01", downstreamEntityType: "promptEnvelope", downstreamEntityId: "env_p001" }),
    ]));

    store.commitAndInvalidate("draftImage", {
      id: "draft_p001_1",
      projectId: demo.project.id,
      promptEnvelopeId: "env_p001",
      assetIds: [],
      filePath: "assets/generated/draft_p001_1.png",
      provider: "local-codex",
      model: "gpt-image-2",
      prompt: "Scene 021 分镜草稿",
      status: "candidate",
      createdAt: "2026-07-15T04:10:00.000Z",
      updatedAt: "2026-07-15T04:10:00.000Z",
    }, { author: { type: "user", name: "测试用户" }, expectedRevision: null });
    expect(store.dependencies.list(demo.project.id)).toContainEqual(expect.objectContaining({
      upstreamEntityType: "promptEnvelope",
      upstreamEntityId: "env_p001",
      downstreamEntityType: "draftImage",
      downstreamEntityId: "draft_p001_1",
    }));

    const snapshot = await store.database.createSnapshot("before-edit");
    expect(existsSync(snapshot)).toBe(true);
  });

  it("backfills the derived dependency graph when an existing writable project is reopened", () => {
    const store = createStore();
    const demo = store.seedDemo();
    const projectRoot = store.database.projectRoot;
    store.database.db.prepare("DELETE FROM dependency_edges WHERE project_id = ?").run(demo.project.id);
    expect(store.dependencies.list(demo.project.id)).toHaveLength(0);
    store.close();

    const reopened = DirectorStore.open(projectRoot);
    openStores.push(reopened);
    expect(reopened.dependencies.list(demo.project.id)).toContainEqual(expect.objectContaining({
      upstreamEntityType: "scriptBlock",
      upstreamEntityId: "block_2",
      downstreamEntityType: "shotRow",
      downstreamEntityId: "shot_r01",
    }));
  });

  it("applies only an explicitly accepted candidate and marks exact downstream dependencies stale", () => {
    const store = createStore();
    const demo = store.seedDemo();
    const scene = store.scenes.require("scene_21");
    const candidate = DraftProposalSchema.parse({
      id: "proposal_scene_patch",
      projectId: demo.project.id,
      stage: "script.primary",
      scopeIds: [scene.id],
      status: "candidate",
      operations: [{
        id: "op_scene_patch",
        op: "patch",
        entityType: "scene",
        entityId: scene.id,
        baseRevision: scene.currentRevisionId,
        payload: { synopsis: "林遥发现录像中的自己正在预告一场告别。" },
      }],
      createdAt: "2026-07-15T05:00:00.000Z",
      summary: "优化 Scene 021 梗概",
    });
    store.drafts.createCandidate(candidate);
    expect(store.scenes.require(scene.id).synopsis).toBe(scene.synopsis);

    const applied = store.acceptAndApplyDraft(candidate.id, {
      operationIds: ["op_scene_patch"],
      actor: "测试用户",
      decidedAt: "2026-07-15T05:01:00.000Z",
    });
    expect(applied.status).toBe("accepted");
    expect(store.scenes.require(scene.id).synopsis).toContain("预告一场告别");
    expect(store.dependencies.listStale(demo.project.id).map(({ entityId }) => entityId)).toContain("shot_r01");
    expect(store.dependencies.listStale(demo.project.id).map(({ entityId }) => entityId)).not.toContain("scene_22");
  });

  it("rolls back stale-base candidates without partially modifying formal data", () => {
    const store = createStore();
    const demo = store.seedDemo();
    const scene = store.scenes.require("scene_21");
    const candidate = DraftProposalSchema.parse({
      id: "proposal_conflict",
      projectId: demo.project.id,
      stage: "script.primary",
      scopeIds: [scene.id],
      status: "candidate",
      operations: [{
        id: "op_conflict",
        op: "patch",
        entityType: "scene",
        entityId: scene.id,
        baseRevision: "rev_outdated",
        payload: { heading: "错误覆盖" },
      }],
      createdAt: "2026-07-15T06:00:00.000Z",
      summary: "过时修改",
    });
    store.drafts.createCandidate(candidate);
    expect(() => store.acceptAndApplyDraft(candidate.id)).toThrow(/Revision conflict/);
    expect(store.scenes.require(scene.id).heading).toBe(scene.heading);
    expect(store.drafts.require(candidate.id).status).toBe("candidate");
  });

  it("rejects a candidate when an Agent Run upstream entity revision has drifted", () => {
    const store = createStore();
    const demo = store.seedDemo();
    const block = store.scriptBlocks.require("block_2");
    const scene = store.scenes.require("scene_21");
    const run = agentRun(demo.project.id, "run_upstream_drift", [block.currentRevisionId!]);
    store.runs.save(run);
    const candidate = DraftProposalSchema.parse({
      id: "proposal_upstream_drift",
      projectId: demo.project.id,
      runId: run.id,
      stage: "shotlist.primary",
      scopeIds: [scene.id],
      status: "candidate",
      operations: [{
        id: "op_upstream_drift",
        op: "patch",
        entityType: "scene",
        entityId: scene.id,
        baseRevision: scene.currentRevisionId,
        payload: { synopsis: "不应被接受的旧上游候选修改" },
      }],
      createdAt: "2026-07-15T09:01:00.000Z",
      summary: "基于旧剧本块生成的修改",
    });
    store.drafts.createCandidate(candidate);
    store.commitAndInvalidate("scriptBlock", { ...block, text: `${block.text} 她听见磁带轮转动。` }, {
      author: { type: "user", name: "测试用户" },
      expectedRevision: block.currentRevisionId,
      createdAt: "2026-07-15T09:02:00.000Z",
    });

    expect(() => store.acceptAndApplyDraft(candidate.id)).toThrow(/Upstream revision drift/);
    expect(store.scenes.require(scene.id).synopsis).toBe(scene.synopsis);
    expect(store.drafts.require(candidate.id).status).toBe("candidate");
  });

  it("treats the newest Shot–Envelope mapping revision as the current upstream", () => {
    const store = createStore();
    const demo = store.seedDemo();
    const envelope = store.promptEnvelopes.require("env_p001");
    const firstMapping = store.replaceShotEnvelopeMapping(
      demo.project.id,
      "scene_21",
      store.links.listForScene(demo.project.id, "scene_21"),
      "测试用户",
      "2026-07-15T09:10:00.000Z",
    ).revision;
    const run = agentRun(demo.project.id, "run_mapping_drift", [firstMapping.id]);
    store.runs.save(run);
    const candidate = DraftProposalSchema.parse({
      id: "proposal_mapping_drift",
      projectId: demo.project.id,
      runId: run.id,
      stage: "shotlist.primary",
      scopeIds: ["scene_21"],
      status: "candidate",
      operations: [{
        id: "op_mapping_drift",
        op: "patch",
        entityType: "promptEnvelope",
        entityId: envelope.id,
        baseRevision: envelope.currentRevisionId,
        payload: { title: "不应应用的旧编组结果" },
      }],
      createdAt: "2026-07-15T09:11:00.000Z",
      summary: "基于旧镜头编组生成的修改",
    });
    store.drafts.createCandidate(candidate);
    store.replaceShotEnvelopeMapping(
      demo.project.id,
      "scene_21",
      store.links.listForScene(demo.project.id, "scene_21"),
      "测试用户",
      "2026-07-15T09:12:00.000Z",
    );

    expect(() => store.acceptAndApplyDraft(candidate.id)).toThrow(/Upstream revision drift/);
    expect(store.promptEnvelopes.require(envelope.id).title).toBe(envelope.title);
    expect(store.drafts.require(candidate.id).status).toBe("candidate");
  });

  it("marks only the Shot Rows and Prompt Envelope sourced from a changed script block", () => {
    const store = createStore();
    const demo = store.seedDemo();
    const block = store.scriptBlocks.require("block_2");
    store.commitAndInvalidate("scriptBlock", { ...block, text: `${block.text} 放像机发出一声轻响。` }, {
      author: { type: "user", name: "测试用户" },
      expectedRevision: block.currentRevisionId,
      createdAt: "2026-07-15T09:20:00.000Z",
    });

    expect(store.dependencies.listStale(demo.project.id).map(({ entityId }) => entityId).sort()).toEqual([
      "env_p001",
      "shot_r01",
      "shot_r02",
    ]);
  });

  it("will not accept regrouping that leaves a Shot Row unmapped", () => {
    const store = createStore();
    const demo = store.seedDemo();
    const candidate = DraftProposalSchema.parse({
      id: "proposal_bad_regroup",
      projectId: demo.project.id,
      stage: "shotlist.primary",
      scopeIds: ["scene_21"],
      status: "candidate",
      operations: [{
        id: "op_unlink_r03",
        op: "unlink",
        entityType: "shotEnvelopeLink",
        entityId: "link_3",
        payload: { shotRowId: "shot_r03", promptEnvelopeId: "env_p002" },
      }],
      createdAt: "2026-07-15T07:00:00.000Z",
      summary: "错误的编组",
    });
    store.drafts.createCandidate(candidate);
    expect(() => store.acceptAndApplyDraft(candidate.id)).toThrow(/must remain mapped/);
    expect(store.links.listForShot(demo.project.id, "shot_r03")).toHaveLength(1);
  });

  it("revisions the mapping while preserving the exact Shot Row records", () => {
    const store = createStore();
    const demo = store.seedDemo();
    const before = store.shotRows.require("shot_r02");
    const candidate = DraftProposalSchema.parse({
      id: "proposal_safe_regroup",
      projectId: demo.project.id,
      stage: "shotlist.primary",
      scopeIds: ["scene_21"],
      status: "candidate",
      operations: [
        {
          id: "op_link_r02_p002",
          op: "link",
          entityType: "shotEnvelopeLink",
          payload: { id: "link_r02_p002", shotRowId: "shot_r02", promptEnvelopeId: "env_p002", orderInEnvelope: 0 },
        },
        {
          id: "op_unlink_r02_p001",
          op: "unlink",
          entityType: "shotEnvelopeLink",
          payload: { shotRowId: "shot_r02", promptEnvelopeId: "env_p001" },
        },
      ],
      createdAt: "2026-07-15T07:10:00.000Z",
      summary: "安全重新编组",
    });
    store.drafts.createCandidate(candidate);
    store.acceptAndApplyDraft(candidate.id, { decidedAt: "2026-07-15T07:11:00.000Z" });

    expect(store.shotRows.require(before.id)).toEqual(before);
    expect(store.links.listForShot(demo.project.id, before.id).map(({ promptEnvelopeId }) => promptEnvelopeId)).toEqual(["env_p002"]);
    expect(store.revisions.listForEntity(demo.project.id, "shotEnvelopeMapping", "scene_21")).toHaveLength(1);
  });

  it("recovers unfinished agent runs as interrupted after restart", () => {
    const store = createStore();
    const demo = store.seedDemo();
    const run: AgentRun = {
      id: "run_1",
      projectId: demo.project.id,
      stage: "shotlist.primary",
      scopeIds: ["scene_21"],
      status: "running",
      skill: { id: "sketch-shotlist-workflow", version: "1.0.0", path: ".agents/skills/sketch-shotlist-workflow", contentHash: "hash" },
      provider: "local-codex",
      model: "gpt-5.6-sol",
      effort: "medium",
      upstreamRevisions: [],
      createdAt: "2026-07-15T08:00:00.000Z",
      startedAt: "2026-07-15T08:00:01.000Z",
    };
    store.runs.save(run);
    const recovered = store.runs.recoverInterrupted(demo.project.id, "2026-07-15T08:02:00.000Z");
    expect(recovered).toHaveLength(1);
    expect(store.runs.get(run.id)?.status).toBe("interrupted");
  });
});
