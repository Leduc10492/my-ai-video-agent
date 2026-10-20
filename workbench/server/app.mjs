import Fastify from "fastify";
import multipart from "@fastify/multipart";
import staticFiles from "@fastify/static";
import fs from "node:fs";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { Store } from "./store.mjs";
import { assetDetails, updateAsset } from "./assets.mjs";
import {
  check,
  contained,
  atomic,
  id,
  now,
  sha,
  unwrapScript,
} from "./files.mjs";
import {
  scriptStatus,
  saveScript,
  chooseScript,
  approveScript,
  skills,
  importStoryboard,
  existingOutputs,
  templateRoot,
} from "./workflow.mjs";
import { registerFile } from "./media.mjs";
import { assemble, validateTimeline, bindTimeline } from "./timeline.mjs";
import { CodexClient, startSkill } from "./codex.mjs";
import { SkillRunner, applySkillResult } from "./skill-runner.mjs";
import {
  HiggsfieldProvider,
  JobRunner,
  createBatch,
  approveBatch,
} from "./providers.mjs";
import { renderExport } from "./render.mjs";
import { ScriptAssistant } from "./script-assistant.mjs";
import { SkillSettings } from "./skill-settings.mjs";
import { Workspace, defaultDataDir, defaultWorkspaceRoot, projectContext } from "./workspace.mjs";

export async function createApp({
  dataDir = process.env.WORKBENCH_DATA_DIR || defaultDataDir,
  workspaceRoot = dataDir === defaultDataDir ? defaultWorkspaceRoot : path.dirname(dataDir),
  projectsRoot,
  initialRoot = null,
  provider: injectedProvider,
  runWorker = true,
  codexClient,
} = {}) {
  const app = Fastify({ logger: false, bodyLimit: 8 * 1024 * 1024 });
  const client = codexClient || new CodexClient(),
    provider = injectedProvider || new HiggsfieldProvider(client),
    runner = new JobRunner(provider);
  const scriptAssistant = new ScriptAssistant(client);
  const skillRunner = new SkillRunner(client);
  const skillSettings = new SkillSettings(client);
  const workspace = new Workspace({ root: workspaceRoot, dataDir, projectsRoot, initialRoot });
  const projects = workspace.projects;
  const stores = new Map();
  function project(key) {
    const p = projects.find((p) => p.project_id === key);
    check(p, "项目不存在", 404);
    return p;
  }
  function store(key) {
    const p = project(key);
    if (!stores.has(key)) {
      const s = new Store(p.root);
      s.projectName = p.name;
      runner.recover(s);
      scriptAssistant.recover(s);
      skillRunner.recover(s);
      stores.set(key, s);
    }
    return stores.get(key);
  }
  const route = (method, url, handler) =>
    app.route({
      method,
      url: `/api/projects/:projectId${url}`,
      handler: (req, reply) =>
        handler(
          store(req.params.projectId),
          req,
          reply,
          project(req.params.projectId),
        ),
    });
  app.addHook("onRequest", async (req) => {
    const host = req.headers.host?.split(":")[0];
    check(["127.0.0.1", "localhost"].includes(host), "仅允许本机访问", 403);
    const origin = req.headers.origin;
    if (origin) {
      let url;
      try {
        url = new URL(origin);
      } catch {}
      check(
        url && ["127.0.0.1", "localhost"].includes(url.hostname),
        "拒绝跨站访问",
        403,
      );
    }
    if (!["GET", "HEAD", "OPTIONS"].includes(req.method))
      check(req.headers["x-workbench"] === "1", "缺少本地工作台请求标识", 403);
  });
  app.setErrorHandler((err, req, reply) =>
    reply
      .code(err.statusCode || (err.code?.startsWith("SQLITE") ? 409 : 400))
      .send({ error: err.message }),
  );
  await app.register(multipart, {
    limits: { fileSize: 4 * 1024 ** 3, files: 1 },
  });
  const dist = path.join(templateRoot, "workbench/dist");
  fs.mkdirSync(dist, { recursive: true });
  await app.register(staticFiles, {
    root: dist,
    wildcard: false,
    decorateReply: true,
  });
  app.get("/api/health", () => ({
    ok: true,
    service: "film-workbench",
    local: true,
  }));
  app.get("/api/projects", () => projects);
  app.get("/api/workspace", () => workspace.snapshot());
  app.put("/api/workspace/active-project", req =>
    workspace.select(req.body.project_id));
  app.post("/api/projects", async (req) => {
    const project = workspace.add(req.body);
    workspace.select(project.project_id);
    return project;
  });
  route("GET", "/context", (s, req, reply, project) => projectContext(project));
  route("GET", "", (s, req, reply, pj) => {
    let script;
    try {
      script = scriptStatus(s.root);
    } catch (e) {
      script = { error: e.message, body: "", state: null, versions: [] };
    }
    const takes = s.list("take");
    return {
      settings: s.settings(),
      script,
      assets: s.list("asset").map((asset) => assetDetails(asset, takes)),
      takes,
      jobs: s.list("job").map(({ packet, raw_result, ...job }) => job),
      skill_batches: s.list("skill_batch").map((b) => ({
        ...b,
        result_sha256: skillRunner.batchHash(s, b.batch_id),
      })),
      batches: s.list("batch"),
      storyboard: s.meta("storyboard"),
      timeline: bindTimeline(s.timeline(), pj.project_id),
      revisions: s.history(),
      skills: skills(s.root),
      outputs: existingOutputs(s.root),
      pending: [...client.requests.values()]
        .filter(
          (r) =>
            client.projectThreads.get(r.thread_id) === s.root ||
            s.list("job").some((j) => j.thread_id === r.thread_id),
        )
        .map(({ rpc_id, ...r }) => r),
    };
  });
  route("PUT", "/settings", (s, req) => {
    const { width, height, fps } = req.body;
    check(
      [width, height, fps].every(Number.isInteger) &&
        width >= 128 &&
        width <= 3840 &&
        height >= 128 &&
        height <= 3840 &&
        width % 2 === 0 &&
        height % 2 === 0 &&
        fps >= 12 &&
        fps <= 60,
      "需要偶数画幅（128–3840）及 12–60fps",
    );
    s.meta("settings", { width, height, fps });
    return s.settings();
  });
  route("GET", "/skills/settings", (s, req) =>
    skillSettings.state(s, req.query.refresh === "1"),
  );
  route(
    "POST",
    "/skills/check",
    async (s, req) => (await skillSettings.inspect(s, req.body)).public,
  );
  route("PUT", "/skills/settings", (s, req) => skillSettings.save(s, req.body));
  route("POST", "/script", (s, req) => saveScript(s.root, req.body));
  route("GET", "/script/edits", (s) => scriptAssistant.list(s));
  route("POST", "/script/edits", (s, req) =>
    scriptAssistant.start(s, req.body),
  );
  route("GET", "/script/edits/:editId", (s, req) => {
    const entry = s.get("script_edit", req.params.editId);
    check(entry, "修改记录不存在", 404);
    return entry;
  });
  route("POST", "/script/edits/:editId/cancel", (s, req) =>
    scriptAssistant.cancel(s, req.params.editId),
  );
  route("POST", "/script/select", (s, req) => chooseScript(s.root, req.body));
  route("POST", "/script/approve", (s, req) => approveScript(s.root, req.body));
  route("GET", "/script/version", (s, req) => {
    const ref = scriptStatus(s.root).versions.find(
      (v) => `${v.artifact_id}@v${v.version}` === req.query.key,
    );
    check(ref, "版本不存在");
    let file = contained(s.root, ref.path);
    if (!fs.existsSync(file))
      file = contained(
        s.root,
        ref.path.replace(/^deliverables\//, "archives/"),
      );
    const text = fs.readFileSync(file, "utf8");
    check(sha(text) === ref.sha256, "版本文件哈希不一致");
    return { ...ref, body: unwrapScript(text) };
  });
  route("GET", "/output", (s, req, reply) => {
    check(
      existingOutputs(s.root).some((o) => o.path === req.query.path),
      "文件不在产物清单中",
    );
    return {
      path: req.query.path,
      content: fs.readFileSync(contained(s.root, req.query.path), "utf8"),
    };
  });
  route("POST", "/storyboard", (s, req) => importStoryboard(s, req.body));
  route("POST", "/inventory", (s, req) => {
    check(Array.isArray(req.body.assets), "需要 assets 数组");
    return s.transaction(() =>
      req.body.assets.map((a) => s.ensureAsset(a, { existing: false })),
    );
  });
  route("POST", "/import", async (s, req) => {
    const part = await req.file();
    check(part, "请选择媒体文件");
    const metadata = part.fields.metadata?.value
      ? JSON.parse(part.fields.metadata.value)
      : {};
    const temp = contained(
      s.root,
      `deliverables/0_admin/workbench/uploads/${id()}.part`,
    );
    fs.mkdirSync(path.dirname(temp), { recursive: true });
    try {
      await pipeline(part.file, fs.createWriteStream(temp, { flags: "wx" }));
      check(!part.file.truncated, "文件超过限制");
      return await registerFile(s, temp, {
        ...metadata,
        filename: part.filename,
      });
    } finally {
      fs.rmSync(temp, { force: true });
    }
  });
  route("GET", "/media/:takeId", (s, req, reply) => {
    const take = s.get("take", req.params.takeId);
    check(take, "take 不存在", 404);
    contained(s.root, take.path);
    if (req.headers.origin)
      reply.header("Access-Control-Allow-Origin", req.headers.origin);
    reply.header("Cache-Control", "private, max-age=31536000, immutable");
    return reply.sendFile(take.path, s.root);
  });
  route("POST", "/takes/:takeId/adopt", (s, req) => {
    const take = s.get("take", req.params.takeId);
    check(take, "take 不存在");
    return updateAsset(s, take.asset_name, {
      review_status: "accepted",
      selected_take_id: take.take_id,
      visual_status:
        req.body?.visual_status === "passed" ? "passed" : "unreviewed",
      expected_revision: req.body?.expected_revision,
    });
  });
  route("POST", "/takes/:takeId/upload", async (s, req) => {
    const take = s.get("take", req.params.takeId);
    check(take, "take 不存在");
    const external = await provider.upload(s.root, take);
    s.put("take", take.take_id, { ...s.get("take", take.take_id), external });
    return external;
  });
  route("PATCH", "/assets/:assetName", (s, req) => {
    return updateAsset(s, req.params.assetName, req.body);
  });
  route("GET", "/models", (s, req) =>
    provider.discover(s.root, req.query.type),
  );
  route("GET", "/models/:model", (s, req) =>
    provider.model(s.root, req.params.model),
  );
  route("POST", "/batches", async (s, req) => {
    if (provider.preflight) await provider.preflight(s.root, req.body);
    return createBatch(s, req.body);
  });
  route("POST", "/batches/:batchId/cancel", (s, req) => {
    const batch = s.get("batch", req.params.batchId);
    check(batch?.status === "awaiting_approval", "只能取消尚未提交的批次");
    return s.put("batch", batch.batch_id, {
      ...batch,
      status: "rejected",
      rejected_at: now(),
    });
  });
  route("POST", "/batches/:batchId/approve", (s, req) =>
    approveBatch(s, req.params.batchId, req.body.sha256),
  );
  route("POST", "/jobs/:jobId/reconcile", (s, req) => {
    const job = s.get("job", req.params.jobId);
    check(job?.kind === "generation", "不是生成任务");
    check(
      ["submission_unknown", "needs_attention"].includes(job.status),
      "当前任务无需绑定远端 ID",
    );
    check(
      /^[0-9a-f-]{36}$/i.test(req.body.remote_id),
      "请输入核实过的远端任务 UUID",
    );
    return s.updateJob(job.job_id, {
      status: "submitted",
      remote_id: req.body.remote_id,
      reconciliation: { at: now(), evidence: req.body.evidence },
      error: null,
    });
  });
  route("POST", "/jobs/:jobId/retry-download", (s, req) => {
    const job = s.get("job", req.params.jobId);
    check(job?.status === "download_failed", "当前任务没有下载失败");
    return s.updateJob(job.job_id, { status: "generated", error: null });
  });
  route("POST", "/jobs/:jobId/choice", (s, req) => {
    const job = s.get("job", req.params.jobId);
    check(
      job?.status === "awaiting_choice" &&
        typeof req.body.use_unlim === "boolean",
      "没有待选择的支付方式",
    );
    return s.updateJob(job.job_id, {
      status: "queued",
      request: {
        ...job.request,
        params: { ...job.request.params, use_unlim: req.body.use_unlim },
      },
      choice_decision: { at: now(), use_unlim: req.body.use_unlim },
    });
  });
  route("POST", "/skills/run", (s, req) => startSkill(client, s, req.body));
  route("POST", "/skills/:jobId/continue", (s, req) =>
    skillRunner.resume(s, req.params.jobId, req.body.instruction),
  );
  route("POST", "/skills/:jobId/apply", (s, req) =>
    applySkillResult(s, req.params.jobId, req.body.sha256),
  );
  route("POST", "/skill-batches", (s, req) =>
    skillRunner.startBatch(s, req.body),
  );
  route("POST", "/skill-batches/:batchId/continue", (s, req) =>
    skillRunner.resumeBatch(s, req.params.batchId),
  );
  route("POST", "/skill-batches/:batchId/apply", (s, req) =>
    skillRunner.applyBatch(s, req.params.batchId, req.body.sha256),
  );
  app.post("/api/requests/:requestId/answer", (req) => {
    client.answer(req.params.requestId, req.body);
    return { ok: true };
  });
  route("POST", "/timeline/assemble", (s, req, p, pj) =>
    s.saveTimeline(
      validateTimeline(s, assemble(s, pj.project_id)),
      req.body.expected_revision,
      "assembly",
    ),
  );
  route("POST", "/timeline", (s, req, reply, pj) =>
    s.saveTimeline(
      bindTimeline(
        { project: validateTimeline(s, req.body.project) },
        pj.project_id,
      ).project,
      req.body.expected_revision,
      "manual",
    ),
  );
  route("GET", "/timeline/:revision", (s, req, reply, pj) => {
    const value = s.timeline(req.params.revision);
    check(value, "版本不存在", 404);
    return bindTimeline(value, pj.project_id);
  });
  route("POST", "/exports", async (s, req, reply, pj) => {
    const timeline = s.timeline(req.body.revision);
    check(timeline, "请先保存时间轴");
    validateTimeline(s, timeline.project, { exporting: true });
    const job = s.createJob(
      { kind: "render", revision: timeline.revision },
      req.body.request_key,
    );
    if (job.status === "queued") {
      s.updateJob(job.job_id, { status: "running" });
      renderExport(
        s,
        pj.project_id,
        timeline,
        job,
        app.server.address().port,
      ).catch((error) =>
        s.updateJob(job.job_id, { status: "failed", error: error.message }),
      );
    }
    return s.get("job", job.job_id);
  });
  route("GET", "/exports/:jobId/:format", (s, req, reply) => {
    const job = s.get("job", req.params.jobId);
    check(job?.status === "completed" && job.kind === "render", "导出尚未完成");
    const file = job.files?.[req.params.format];
    check(file, "文件不存在", 404);
    contained(s.root, file);
    return reply.sendFile(file, s.root);
  });
  for (const p of projects) {
    try {
      store(p.project_id);
    } catch {}
  }
  const interval = runWorker
    ? setInterval(() => {
        for (const s of stores.values()) runner.tick(s).catch(() => {});
      }, 5000)
    : null;
  app.setNotFoundHandler((req, reply) =>
    req.url.startsWith("/api/")
      ? reply.code(404).send({ error: "接口不存在" })
      : reply.sendFile(
          req.url === "/"
            ? "index.html"
            : req.url.split("?")[0].replace(/^\//, ""),
          dist,
        ),
  );
  app.addHook("onClose", async () => {
    runner.closed = true;
    if (interval) clearInterval(interval);
    await skillRunner.close();
    client.close();
    for (const s of stores.values()) s.close();
  });
  return { app, stores, projects, client, runner, skillRunner, workspace };
}
