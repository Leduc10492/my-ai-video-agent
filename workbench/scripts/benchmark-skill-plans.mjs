// Real Codex benchmark against a copied project. Never edits the source project.
import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { createApp } from "../server/app.mjs";
import { atomic, sha } from "../server/files.mjs";
import { scriptStatus, importStoryboard } from "../server/workflow.mjs";
const [sourceArg, ...selected] = process.argv.slice(2);
if (!sourceArg || !selected.length)
  throw new Error(
    "Usage: node scripts/benchmark-skill-plans.mjs <project-root> scene-001 scene-002",
  );
const source = fs.realpathSync(sourceArg),
  scenes = selected;
const folder = path.resolve(
    "test-results",
    `skill-plans-${new Date().toISOString().replace(/[:.]/g, "-")}`,
  ),
  root = path.join(folder, "project");
fs.mkdirSync(root, { recursive: true });
fs.cpSync(path.join(source, ".agents"), path.join(root, ".agents"), {
  recursive: true,
});
fs.copyFileSync(path.join(source, "AGENTS.md"), path.join(root, "AGENTS.md"));
for (const stage of ["1_story", "2_assets"])
  fs.cpSync(
    path.join(source, "deliverables", stage),
    path.join(root, "deliverables", stage),
    { recursive: true },
  );
for (const name of ["workflow_state.json", "locks.md"]) {
  const file = path.join(source, "deliverables/0_admin", name);
  if (fs.existsSync(file)) {
    fs.mkdirSync(path.join(root, "deliverables/0_admin"), { recursive: true });
    fs.copyFileSync(file, path.join(root, "deliverables/0_admin", name));
  }
}
const sourceDb = new DatabaseSync(
  path.join(source, "deliverables/0_admin/workbench.sqlite"),
  { readOnly: true },
);
const originalState = fs.readFileSync(
  path.join(source, "deliverables/0_admin/workflow_state.json"),
);
const sourceAssets = sourceDb
  .prepare("SELECT data FROM records WHERE kind='asset'")
  .all()
  .map((r) => JSON.parse(r.data));
const board = JSON.parse(
  sourceDb.prepare("SELECT value FROM meta WHERE key='storyboard'").get()
    ?.value || "null",
);
const styleJob = sourceDb
  .prepare("SELECT data FROM records WHERE kind='job'")
  .all()
  .map((r) => JSON.parse(r.data))
  .filter((j) => j.stage === "assets" && j.applied_at)
  .sort((a, b) => b.applied_at.localeCompare(a.applied_at));
const styleArtifact = styleJob
  .flatMap((j) => j.result?.artifacts || [])
  .find((a) => /\/02_style_guide_v\d+\.md$/.test(a.path));
sourceDb.close();
const { app, stores, projects, skillRunner } = await createApp({
  dataDir: path.join(folder, "app"),
  initialRoot: root,
  runWorker: false,
});
await app.listen({
  host: "127.0.0.1",
  port: Number(process.env.BENCH_PORT || 4311),
});
const store = stores.get(projects[0].project_id);
if (styleArtifact)
  store.meta("style_reference", {
    path: styleArtifact.path,
    sha256: sha(styleArtifact.content),
  });
for (const a of sourceAssets)
  store.put("asset", a.asset_name, { ...a, selected_take_id: null });
if (board) {
  const {
    path: ignoredPath,
    imported_at,
    sha256,
    expected_sha256,
    ...content
  } = board;
  content.shots = content.shots.filter((s) => !scenes.includes(s.scene));
  content.envelopes = content.envelopes.filter(
    (e) => !scenes.includes(e.scene),
  );
  if (content.envelopes.length) importStoryboard(store, content);
}
const ref = scriptStatus(root).state.working_script;
const started = Date.now();
const batch = await skillRunner.startBatch(store, {
  scenes,
  concurrency: 2,
  mode: "planning",
  expected_sha256: ref.sha256,
  effort: "medium",
  model: "gpt-6-astra",
  request_key: `benchmark-${started}`,
  instruction:
    "使用提供的原文、原分镜行、已有资产进行完整可审阅的本场分镜设计。每轮对白逐字独立保留；具体写景别、机位方向、运动、人物与道具位置，给可读的空间候选。保留原剧情及冲突，不修改canon。第4场原#28包含推人质、冲撞曜光、撞出门、推人群，按可读动作拆成Shot Rows，再按连续性编组Envelope；玻璃变形、爆裂、悬停、落地的状态必须分明，不改变向内倾泻，不增加林默目睹悬停。原表秒数只作对照，按可信对白和动作设计时长，不把可修密度问题只留作风险。新镜头和Envelope用new-N，既有文件名与tag保持原文。不编译Prompt，不生成媒体。共享素材未提供图像时明确记录缺口。本轮是已授权的流程性能验证，完成指定Scene的设计后交回结构化数据供审阅，不等待其他阶段。",
});
const context = {
  folder,
  root,
  source,
  scenes,
  project_id: projects[0].project_id,
  batch_id: batch.batch_id,
  url: `http://127.0.0.1:${app.server.address().port}`,
  started_at: new Date(started).toISOString(),
};
atomic(path.join(folder, "context.json"), context);
console.log(JSON.stringify(context));
try {
  let last;
  while (Date.now() - started < 12 * 60 * 1000) {
    await new Promise((r) => setTimeout(r, 2000));
    const current = store.get("skill_batch", batch.batch_id);
    const progress = JSON.stringify(
      current.items.map((i) => [i.scene, i.status, i.error]),
    );
    if (progress !== last) {
      console.log(progress);
      last = progress;
    }
    if (["awaiting_review", "needs_attention"].includes(current.status)) {
      const jobs = store.list("job");
      const report = {
        ...context,
        finished_at: new Date().toISOString(),
        wall_ms: Date.now() - started,
        status: current.status,
        source_state_unchanged:
          sha(originalState) ===
          sha(
            fs.readFileSync(
              path.join(source, "deliverables/0_admin/workflow_state.json"),
            ),
          ),
        jobs: jobs.map(({ packet, output, ...j }) => ({
          ...j,
          output_chars: output?.length,
          packet_chars: JSON.stringify(packet).length,
        })),
      };
      atomic(path.join(folder, "result.json"), report);
      console.log(
        JSON.stringify({
          status: report.status,
          wall_ms: report.wall_ms,
          report: path.join(folder, "result.json"),
          jobs: jobs.map((j) => ({
            scene: j.scene,
            status: j.status,
            metrics: j.metrics,
            error: j.error,
          })),
        }),
      );
      break;
    }
  }
} finally {
  await app.close();
}
