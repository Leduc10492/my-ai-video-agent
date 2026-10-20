import fs from "node:fs";
import { atomic, check, contained, id, now, sha } from "./files.mjs";
import { artifactSchema, startSkill } from "./codex.mjs";
import { archiveSkillThread } from "./skill-threads.mjs";
import { importStoryboard, scriptStatus } from "./workflow.mjs";
import {
  checkPlanBaseline,
  materializePlan,
  mergedScene,
  planSchemas,
  sourceScenes,
  validatePlan,
} from "./skill-packets.mjs";

function preflight(store, job, expected) {
  check(job?.status === "completed" && job.result, "尚无完整可审阅产物");
  check(expected === sha(job.result), "产物已更新，请重新审阅", 409);
  if (job.applied_at) return;
  checkPlanBaseline(store, job);
  if (job.packet && job.raw_result) validatePlan(job, job.raw_result);
  const seen = new Set();
  for (const a of job.result.artifacts || []) {
    check(
      /^deliverables\/(1_story|2_assets|3_shotlist)\/.+\.(md|html|json)$/.test(
        a.path,
      ) && typeof a.content === "string",
      "产物路径或内容不符合契约",
    );
    const file = contained(store.root, a.path);
    check(!seen.has(file), "同一结果包含重复产物路径");
    seen.add(file);
    check(
      !fs.existsSync(file) ||
        (job.apply_started?.sha256 === expected &&
          sha(fs.readFileSync(file)) === sha(a.content)),
      `文件已存在：${a.path}，请生成新版本`,
      409,
    );
  }
}

export function applySkillResult(store, jobId, expected) {
  const job = store.get("job", jobId);
  preflight(store, job, expected);
  if (job.applied_at) return job;
  // Persist ownership before file writes so a crash can resume without replacing user files.
  store.updateJob(jobId, { apply_started: { sha256: expected, at: now() } });
  for (const a of job.result.artifacts || []) {
    const file = contained(store.root, a.path);
    if (!fs.existsSync(file)) atomic(file, a.content);
  }
  return store.transaction(() => {
    if (job.packet && job.stage === "storyboard") {
      importStoryboard(store, mergedScene(store, job));
    } else if (job.packet && job.stage === "assets") {
      const data = job.result.structured;
      for (const item of data.assets) {
        const old = store.get("asset", item.asset_name);
        if (old)
          store.put("asset", old.asset_name, {
            ...old,
            ...item,
            ...Object.fromEntries(
              [
                "tag",
                "selected_take_id",
                "locked",
                "created_at",
                "prompt",
                "asset_origin",
                "reference_binding",
                "reference_approval",
              ]
                .filter((k) => Object.hasOwn(old, k))
                .map((k) => [k, old[k]]),
            ),
          });
        else store.ensureAsset(item);
      }
      store.meta("asset_inventory", {
        ...data,
        path: job.result.artifacts[0].path,
        sha256: sha(data),
      });
    }
    return store.updateJob(jobId, { applied_at: now() });
  });
}

export class SkillRunner {
  constructor(client, { flushMs = 750 } = {}) {
    this.client = client;
    this.flushMs = flushMs;
    this.entries = new Map();
    this.stores = new Set();
    this.pumping = new Set();
    this.archiving = new Map();
    this.closed = false;
    this.registerListener = ({ store, job }) => this.register(store, job);
    this.settledListener = ({ store, job }) => void this.archive(store, job.job_id);
    this.notificationListener = (event) => this.onEvent(event);
    this.disconnectListener = () => this.disconnected();
    client.on("skill/registered", this.registerListener);
    client.on("skill/settled", this.settledListener);
    client.on("notification", this.notificationListener);
    client.on("disconnected", this.disconnectListener);
  }
  recover(store) {
    this.stores.add(store);
    for (const job of store.list("job"))
      if (
        job.kind === "skill" &&
        ["queued", "starting", "running"].includes(job.status)
      ) {
        store.updateJob(job.job_id, {
          status: "interrupted",
          error: "服务已重启；恢复时先核对原会话，不重复提交。",
        });
      }
    for (const batch of store.list("skill_batch")) {
      batch.items = batch.items.map((item) => {
        if (item.job_id || item.status !== "starting") return item;
        const previous = store.db
          .prepare("SELECT job_id FROM dedupe WHERE key=?")
          .get(`${batch.batch_id}:${item.scene}`);
        return {
          ...item,
          job_id: previous?.job_id || null,
          status: previous ? "interrupted" : "queued",
        };
      });
      batch.resume_required = batch.items.some(
        (item) => !["completed", "applied"].includes(item.status),
      );
      store.put("skill_batch", batch.batch_id, batch);
      this.refreshBatch(store, batch.batch_id);
    }
    for (const job of store.list("job"))
      if (job.kind === "skill" && ["completed", "needs_attention"].includes(job.status))
        void this.archive(store, job.job_id);
  }
  archive(store, jobId) {
    const job = store.get("job", jobId);
    if (this.archiving.has(job?.thread_id)) return this.archiving.get(job.thread_id);
    if (
      this.closed || !job?.thread_id || job.thread_archived_at ||
      !["completed", "needs_attention"].includes(job.status)
    ) return Promise.resolve();
    const pending = (async () => {
      try {
        const history = await this.client.request("thread/read", {
          threadId: job.thread_id, includeTurns: true,
        }, 15000);
        if (
          history.thread.status?.type === "active" ||
          history.thread.turns?.some((turn) => turn.status === "inProgress")
        ) return; // A timed-out submission may still be running; never cancel it for cleanup.
        await archiveSkillThread(this.client, store.root, job.thread_id);
        const entry = this.entries.get(job.thread_id);
        if (entry) {
          this.flush(entry);
          this.entries.delete(job.thread_id);
        }
        store.updateJob(jobId, { thread_archived_at: now(), thread_archive_error: null });
      } catch (error) {
        // Sidebar cleanup must never discard a saved result or trigger another model turn.
        store.updateJob(jobId, { thread_archive_error: error.message });
      }
    })().finally(() => this.archiving.delete(job.thread_id));
    this.archiving.set(job.thread_id, pending);
    return pending;
  }
  register(store, job) {
    this.stores.add(store);
    if (!job.thread_id) return;
    const old = this.entries.get(job.thread_id);
    if (old?.timer) clearTimeout(old.timer);
    this.entries.set(job.thread_id, {
      store,
      jobId: job.job_id,
      output: job.output || "",
      metrics: job.metrics || {},
      timer: null,
    });
  }
  flush(entry) {
    if (entry.timer) clearTimeout(entry.timer);
    entry.timer = null;
    entry.metrics.flush_count = (entry.metrics.flush_count || 0) + 1;
    return entry.store.updateJob(entry.jobId, {
      output: entry.output,
      metrics: entry.metrics,
    });
  }
  schedule(entry) {
    if (!entry.timer)
      entry.timer = setTimeout(() => {
        if (!this.closed) this.flush(entry);
      }, this.flushMs).unref();
  }
  accept(store, job, raw) {
    const result = job.packet ? materializePlan(store, job, raw) : raw;
    check(Array.isArray(result.artifacts), "Skill 未返回完整产物");
    return store.updateJob(job.job_id, {
      result,
      result_sha256: sha(result),
      raw_result: job.packet ? raw : null,
    });
  }
  onEvent({ method, params }) {
    const entry = this.entries.get(params?.threadId);
    if (!entry || this.closed) return;
    const { store, jobId } = entry,
      job = store.get("job", jobId);
    const turn = params.turnId || params.turn?.id;
    if (job.turn_id && turn && turn !== job.turn_id) return;
    const at = now();
    if (method === "turn/started") {
      entry.metrics.turn_started_at ||= at;
      store.updateJob(jobId, {
        turn_id: params.turn.id,
        status: "running",
        metrics: entry.metrics,
      });
    }
    if (method === "thread/tokenUsage/updated") {
      entry.metrics.token_usage = params.tokenUsage;
      this.schedule(entry);
    }
    if (
      method === "item/started" &&
      ["commandExecution", "mcpToolCall"].includes(params.item?.type)
    ) {
      entry.metrics.tool_calls = (entry.metrics.tool_calls || 0) + 1;
      this.schedule(entry);
    }
    if (method === "item/agentMessage/delta") {
      entry.metrics.first_output_at ||= at;
      entry.metrics.last_output_at = at;
      entry.output += params.delta || "";
      entry.metrics.output_chars = entry.output.length;
      this.schedule(entry);
    }
    if (method === "item/completed" && params.item?.type === "agentMessage") {
      entry.output = params.item.text;
      entry.metrics.output_chars = entry.output.length;
      entry.metrics.first_output_at ||= at;
      entry.metrics.last_output_at = at;
      this.schedule(entry);
    }
    if (method !== "turn/completed") return;
    entry.metrics.completed_at = at;
    entry.metrics.elapsed_ms =
      Date.parse(at) -
      Date.parse(entry.metrics.turn_started_at || job.created_at);
    entry.metrics.attempts = [
      ...(entry.metrics.attempts || []),
      {
        turn_id: job.turn_id,
        started_at: entry.metrics.turn_started_at || job.created_at,
        completed_at: at,
        elapsed_ms: entry.metrics.elapsed_ms,
        status: params.turn.status,
      },
    ];
    entry.metrics.total_execution_ms = entry.metrics.attempts.reduce(
      (n, a) => n + a.elapsed_ms,
      0,
    );
    this.flush(entry);
    try {
      check(
        params.turn.status === "completed",
        params.turn.error?.message || "本阶段未完成",
      );
      this.accept(
        store,
        store.get("job", jobId),
        JSON.parse(entry.output.replace(/^```json\s*|\s*```$/g, "")),
      );
      store.updateJob(jobId, { status: "completed", error: null });
    } catch (error) {
      store.updateJob(jobId, {
        status: "needs_attention",
        error: error.message,
      });
    }
    this.entries.delete(params.threadId);
    void this.archive(store, jobId);
    if (job.batch_id) {
      this.refreshBatch(store, job.batch_id);
      void this.pump(store, job.batch_id);
    }
  }
  async resume(store, jobId, instruction = "") {
    let job = store.get("job", jobId);
    check(job?.kind === "skill" && job.thread_id, "任务没有可恢复的会话");
    await this.archiving.get(job.thread_id);
    job = store.get("job", jobId);
    if (job.status === "completed") {
      await this.archive(store, jobId);
      return store.get("job", jobId);
    }
    // Read archived history first. A finished turn needs no unarchive or inference.
    const history = await this.client.request("thread/read", {
      threadId: job.thread_id,
      includeTurns: true,
    });
    const prior =
      history.thread.turns?.find((t) => t.id === job.turn_id) ||
      history.thread.turns?.at(-1);
    if (prior?.status === "completed") {
      const message = [...(prior.items || [])]
        .reverse()
        .find((i) => i.type === "agentMessage");
      try {
        this.accept(store, job, JSON.parse(message.text));
        store.updateJob(jobId, {
          status: "completed",
          error: null,
          output: message.text,
          metrics: { ...job.metrics, recovered_at: now() },
        });
        if (job.batch_id) this.refreshBatch(store, job.batch_id);
        await this.archive(store, jobId);
        return store.get("job", jobId);
      } catch (e) {
        // Invalid output may be corrected in the original thread; no replacement thread is created.
        job = store.updateJob(jobId, { error: e.message });
      }
    }
    const resume = () => this.client.request("thread/resume", {
      threadId: job.thread_id,
      cwd: store.root,
    });
    try {
      await resume();
    } catch (error) {
      // Also covers legacy workbench threads archived outside this process.
      if (!/\bis archived\b/i.test(error.message)) throw error;
      await this.client.request("thread/unarchive", { threadId: job.thread_id });
      await resume();
    }
    job = store.updateJob(jobId, { thread_archived_at: null, thread_archive_error: null });
    if (prior?.status === "inProgress") {
      this.register(store, job);
      return store.updateJob(jobId, { status: "running", error: null });
    }
    job = store.updateJob(jobId, {
      turn_id: null,
      status: "running",
      output: "",
      result: null,
      result_sha256: null,
      metrics: {
        ...job.metrics,
        resumed_at: now(),
        turn_started_at: null,
        first_output_at: null,
        last_output_at: null,
        completed_at: null,
        elapsed_ms: null,
        output_chars: 0,
      },
    });
    this.register(store, job);
    const turn = await this.client.request("turn/start", {
      threadId: job.thread_id,
      effort: job.effort || "medium",
      input: [
        {
          type: "text",
          text: `${instruction || "继续原阶段，仅修复未通过的结果。"}\n最近检查：${job.error || "任务中断"}\n沿用原输入快照和输出 schema，不重新扫描项目或返回其他 Scene。`,
          text_elements: [],
        },
      ],
      outputSchema: job.packet ? planSchemas[job.stage] : artifactSchema,
    });
    return store.updateJob(jobId, { turn_id: turn.turn.id, error: null });
  }
  async startBatch(store, input) {
    const duplicate = store
      .list("skill_batch")
      .find((b) => b.request_key === input.request_key);
    if (duplicate) return duplicate;
    check(
      typeof input.request_key === "string" && input.request_key.length > 5,
      "需要稳定的请求键",
    );
    check(
      typeof input.instruction === "string" && input.instruction.trim(),
      "请填写分镜要求",
    );
    check(["planning", "production"].includes(input.mode), "需要明确执行范围");
    const current = scriptStatus(store.root),
      ref =
        input.mode === "planning"
          ? current.state?.working_script
          : current.state?.production_inputs?.script;
    check(ref, "先保存并审核/确认所选剧本");
    check(ref.sha256 === input.expected_sha256, "剧本已更新，请重新载入", 409);
    check(input.mode !== "planning" || current.audit, "先完成同版本审核");
    const scenes = sourceScenes(store.root, ref).scenes.map((s) => s.label);
    check(
      Array.isArray(input.scenes) &&
        input.scenes.length &&
        input.scenes.length <= 100 &&
        new Set(input.scenes).size === input.scenes.length &&
        input.scenes.every((s) => scenes.includes(s)),
      "请选择有效且不重复的 Scene",
    );
    const scope = current.state?.production_inputs?.authorization?.scope || [];
    check(
      input.mode === "planning" ||
        input.scenes.every((s) => scope.includes("*") || scope.includes(s)),
      "Scene 超出已确认生产范围",
      409,
    );
    const concurrency = input.concurrency ?? 2;
    check([1, 2, 3].includes(concurrency), "同时执行数量需要在 1–3 之间");
    check(
      input.effort === undefined ||
        ["low", "medium", "high", "xhigh", "max"].includes(input.effort),
      "未知推理投入",
    );
    const batch = {
      batch_id: id(),
      request_key: input.request_key,
      status: "running",
      created_at: now(),
      concurrency,
      request: {
        ...input,
        stage: "storyboard",
        effort: input.effort || "medium",
      },
      items: input.scenes.map((scene) => ({
        scene,
        job_id: null,
        status: "queued",
      })),
    };
    store.put("skill_batch", batch.batch_id, batch);
    void this.pump(store, batch.batch_id);
    return batch;
  }
  refreshBatch(store, batchId) {
    const batch = store.get("skill_batch", batchId);
    if (!batch) return;
    const items = batch.items.map((item) => {
      const j = item.job_id && store.get("job", item.job_id);
      return j
        ? {
            ...item,
            status: j.applied_at
              ? "applied"
              : item.retry_requested &&
                  ["interrupted", "needs_attention"].includes(j.status)
                ? "queued"
                : j.status,
            error: j.error || null,
          }
        : item;
    });
    const finished = items.every((i) =>
      ["completed", "applied"].includes(i.status),
    );
    const active = items.some((i) =>
      ["queued", "starting", "running"].includes(i.status),
    );
    return store.put("skill_batch", batchId, {
      ...batch,
      items,
      updated_at: now(),
      status: items.every((i) => i.status === "applied")
        ? "applied"
        : finished
          ? "awaiting_review"
          : active && !batch.resume_required
            ? "running"
            : "needs_attention",
    });
  }
  async pump(store, batchId) {
    const key = `${store.root}:${batchId}`;
    if (this.closed || this.pumping.has(key)) return;
    this.pumping.add(key);
    try {
      const batch = this.refreshBatch(store, batchId);
      if (!batch || batch.resume_required) return;
      const active = batch.items.filter((i) =>
        ["starting", "running"].includes(i.status),
      ).length;
      const next = batch.items
        .filter((i) => i.status === "queued")
        .slice(0, Math.max(0, batch.concurrency - active));
      for (const item of next) {
        item.status = "starting";
        item.retry_requested = false;
        if (item.job_id) store.updateJob(item.job_id, { status: "starting" });
      }
      store.put("skill_batch", batchId, batch);
      await Promise.all(
        next.map(async (item) => {
          try {
            const job = item.job_id
              ? await this.resume(store, item.job_id)
              : await startSkill(this.client, store, {
                  ...batch.request,
                  scene: item.scene,
                  batch_id: batchId,
                  request_key: `${batchId}:${item.scene}`,
                });
            const latest = store.get("skill_batch", batchId);
            latest.items = latest.items.map((i) =>
              i.scene === item.scene
                ? { ...i, job_id: job.job_id, status: job.status }
                : i,
            );
            store.put("skill_batch", batchId, latest);
          } catch (e) {
            if (item.job_id)
              store.updateJob(item.job_id, {
                status: "needs_attention",
                error: e.message,
              });
            const latest = store.get("skill_batch", batchId);
            latest.items = latest.items.map((i) =>
              i.scene === item.scene
                ? { ...i, status: "needs_attention", error: e.message }
                : i,
            );
            store.put("skill_batch", batchId, latest);
          }
        }),
      );
      this.refreshBatch(store, batchId);
    } finally {
      this.pumping.delete(key);
    }
    const batch = store.get("skill_batch", batchId);
    if (
      !this.closed &&
      batch.items.some((i) => i.status === "queued") &&
      batch.items.filter((i) => ["starting", "running"].includes(i.status))
        .length < batch.concurrency
    )
      void this.pump(store, batchId);
  }
  async resumeBatch(store, batchId) {
    const batch = store.get("skill_batch", batchId);
    check(batch, "批次不存在", 404);
    batch.resume_required = false;
    batch.items = batch.items.map((item) =>
      ["interrupted", "needs_attention"].includes(item.status)
        ? {
            ...item,
            retry_requested: !!item.job_id,
            status: item.job_id ? item.status : "queued",
            error: null,
          }
        : item,
    );
    store.put("skill_batch", batchId, batch);
    this.refreshBatch(store, batchId);
    void this.pump(store, batchId);
    return store.get("skill_batch", batchId);
  }
  batchHash(store, batchId) {
    const batch = store.get("skill_batch", batchId);
    check(batch, "批次不存在", 404);
    return sha(
      batch.items.map((i) => {
        const j = i.job_id && store.get("job", i.job_id);
        return [i.scene, i.job_id, j?.result_sha256 || null];
      }),
    );
  }
  applyBatch(store, batchId, expected) {
    const batch = this.refreshBatch(store, batchId);
    check(batch, "批次不存在", 404);
    check(
      expected === this.batchHash(store, batchId),
      "批次结果已变化，请重新审阅",
      409,
    );
    check(
      ["awaiting_review", "applied"].includes(batch.status),
      "先完成或恢复本批次所有 Scene",
    );
    const jobs = batch.items.map((i) => store.get("job", i.job_id));
    for (const job of jobs) preflight(store, job, job.result_sha256);
    for (const job of jobs)
      applySkillResult(store, job.job_id, job.result_sha256);
    return this.refreshBatch(store, batchId);
  }
  disconnected() {
    for (const entry of this.entries.values()) {
      this.flush(entry);
      entry.store.updateJob(entry.jobId, {
        status: "interrupted",
        error: "连接断开；恢复时先核对原会话。",
      });
    }
    this.entries.clear();
    for (const s of this.stores)
      for (const b of s.list("skill_batch")) {
        const current = this.refreshBatch(s, b.batch_id);
        if (!["awaiting_review", "applied"].includes(current.status)) {
          s.put("skill_batch", b.batch_id, {
            ...current,
            resume_required: true,
          });
          this.refreshBatch(s, b.batch_id);
        }
      }
  }
  async close() {
    this.disconnected();
    this.closed = true;
    this.client.off("skill/registered", this.registerListener);
    this.client.off("skill/settled", this.settledListener);
    this.client.off("notification", this.notificationListener);
    this.client.off("disconnected", this.disconnectListener);
    await Promise.allSettled(this.archiving.values());
  }
}
