import fs from "node:fs";
import path from "node:path";
import { check, contained, id, now, sha, assetName } from "./files.mjs";
import { command, registerFile, download, digest } from "./media.mjs";

// Providers implement discover, upload, submit, query, result. Requests are immutable after approval.
export class HiggsfieldProvider {
  constructor(client) {
    this.client = client;
    this.name = "higgsfield";
  }
  async discover(root, type) {
    let after,
      items = [];
    do {
      const result = await this.client.mcp(root, "higgsfield.models_list", {
        ...(type ? { type } : {}),
        limit: 100,
        ...(after ? { after } : {}),
      });
      check(!result.error, result.error);
      items.push(...(result.items || []));
      after = result.next_page_token;
    } while (after && items.length < 500);
    return items;
  }
  model(root, model_id) {
    return this.client.mcp(root, "higgsfield.models_get", { model_id });
  }
  async preflight(root, input) {
    check(
      Array.isArray(input.items) &&
        input.items.length > 0 &&
        input.items.length <= 50,
      "一个批次需要 1–50 项",
    );
    const models = new Map();
    for (const item of input.items) {
      check(typeof item.params?.model === "string", "需要明确模型");
      if (!models.has(item.params.model))
        models.set(
          item.params.model,
          await this.model(root, item.params.model),
        );
      validateModelRequest(item, models.get(item.params.model));
    }
  }
  async upload(root, take) {
    const cli = process.env.HIGGSFIELD_BIN || "higgsfield";
    const [accountText, workspaceText, profile, workspaces] = await Promise.all(
      [
        command(cli, ["account", "status", "--json"]),
        command(cli, ["workspace", "status", "--json"]),
        this.client.mcp(root, "higgsfield.get_profile", {}),
        this.client.mcp(root, "higgsfield.list_workspaces", {}),
      ],
    );
    const account = JSON.parse(accountText),
      workspace = JSON.parse(workspaceText),
      selected = workspaces.workspaces?.find((w) => w.is_selected);
    check(
      account.email &&
        profile.email &&
        account.email.toLowerCase() === profile.email.toLowerCase() &&
        selected?.id === workspace.id,
      "Higgsfield CLI 与 MCP 的账户或 workspace 不一致，尚未上传；请先在官方客户端核对连接",
    );
    if (
      take.external?.media_id &&
      take.external.account_id === profile.id &&
      take.external.workspace_id === selected.id &&
      take.external.source_sha256 === take.sha256
    )
      return take.external;
    const file = contained(root, take.path);
    check(
      (await digest(file)) === take.sha256,
      "本地媒体已被外部修改，请重新导入后再上传",
    );
    const output = JSON.parse(
      await command(cli, ["upload", "create", file, "--json"]),
    );
    const mediaId =
      output.id || output.media_id || output.media?.id || output.data?.id;
    check(mediaId, "上传返回中缺少媒体 ID，请核对 Higgsfield CLI 的上传记录");
    return {
      provider: this.name,
      media_id: mediaId,
      account_id: profile.id,
      workspace_id: selected.id,
      source_sha256: take.sha256,
      uploaded_at: now(),
    };
  }
  submit(root, request) {
    return this.client.mcp(root, `higgsfield.generate_${request.kind}`, {
      params: { ...request.params, prompt: request.prompt, count: 1 },
    });
  }
  async query(root, jobs) {
    return this.client.mcp(root, "higgsfield.jobs_wait", {
      jobs: jobs.map((j, index) => ({ index, job_id: j.remote_id })),
      timeout_seconds: 0,
    });
  }
  result(remote) {
    return (
      remote.result_url ||
      remote.results?.rawUrl ||
      remote.results?.[0]?.rawUrl ||
      remote.results?.url ||
      remote.rawUrl
    );
  }
}

export function validateModelRequest(item, model) {
  check(
    model?.id === item.params.model && model.output_type === item.kind,
    "模型与素材类型不匹配，或模型已不可用",
  );
  const params = item.params,
    prefix = `${item.asset_name} · ${model.id}`;
  if (params.aspect_ratio && model.aspect_ratios?.length)
    check(
      model.aspect_ratios.includes(params.aspect_ratio),
      `${prefix} 不支持画幅 ${params.aspect_ratio}，请选择 ${model.aspect_ratios.join(" / ")}`,
    );
  if (params.duration !== undefined)
    check(
      Number.isInteger(params.duration) && params.duration > 0,
      `${prefix} 的生成时长需要整数秒；分镜计划时长仍可单独保留小数`,
    );
  for (const param of model.parameters || []) {
    const value = params[param.name];
    check(
      param.required !== "required" || value !== undefined,
      `${prefix} 缺少 ${param.name}`,
    );
    if (value === undefined || (value === null && param.nullable)) continue;
    if (param.type === "number")
      check(
        typeof value === "number" && Number.isFinite(value),
        `${param.name} 需要数值`,
      );
    if (["boolean", "bool"].includes(param.type))
      check(typeof value === "boolean", `${param.name} 需要 true / false`);
    if (param.type === "string")
      check(typeof value === "string", `${param.name} 需要字符串`);
    if (param.options?.length)
      check(
        param.options.includes(value),
        `${prefix} 的 ${param.name} 仅支持 ${param.options.join(" / ")}`,
      );
    if (param.min !== undefined)
      check(
        value >= param.min,
        `${prefix} 的 ${param.name} 最小为 ${param.min}`,
      );
    if (param.max !== undefined)
      check(
        value <= param.max,
        `${prefix} 的 ${param.name} 最大为 ${param.max}`,
      );
  }
  if (model.id === "seedance_2_5") {
    const mode = params.mode || "t2v",
      refs = params.medias || [];
    check(
      mode !== "t2v" || refs.length === 0,
      "t2v 不接收参考素材，请明确选择 omni_reference 等模式",
    );
    check(
      mode !== "omni_reference" || refs.length > 0,
      "omni_reference 需要参考素材",
    );
    if (["video_edit", "video_extension"].includes(mode))
      check(
        refs.some((r) => r.role === "video"),
        "编辑或延长模式需要视频参考",
      );
    check(
      mode !== "video_extension" || params.extension_mode,
      "延长视频需要明确 extension_mode",
    );
  }
}

export function createBatch(store, input) {
  check(
    Array.isArray(input.items) &&
      input.items.length > 0 &&
      input.items.length <= 50,
    "一个批次需要 1–50 项",
  );
  const request = structuredClone(input);
  for (const item of request.items) {
    assetName(item.asset_name);
    check(["image", "video"].includes(item.kind), "首版生成支持图片和视频");
    check(
      typeof item.prompt === "string" && item.prompt.trim(),
      "每项需要已编译的 Prompt",
    );
    check(
      typeof item.params?.model === "string" && item.params.model,
      "每项需要明确模型",
    );
    check(
      typeof item.params.use_unlim === "boolean",
      "请明确使用 Unlim 或 credits",
    );
    check(
      !item.params.get_cost && !item.params.folder_id,
      "生成批次不接受计价请求或未确认的云项目目录",
    );
    check(
      !item.params.medias ||
        (Array.isArray(item.params.medias) &&
          item.params.medias.every(
            (ref) =>
              [
                "image",
                "start_image",
                "end_image",
                "video",
                "audio",
                "ref_element",
              ].includes(ref.role) &&
              typeof ref.value === "string" &&
              ref.value.length > 0,
          )),
      "参考素材角色或绑定无效",
    );
    check(
      item.params.count === undefined || item.params.count === 1,
      "每项生成一个 take；多 take 请使用独立条目",
    );
    check(!item.scene || /^scene-[\w-]+$/.test(item.scene), "Scene 标识无效");
    if (item.envelope_id) {
      const board = store.meta("storyboard");
      const envelope = board?.envelopes.find((e) => e.id === item.envelope_id);
      check(
        envelope &&
          envelope.prompt === item.prompt &&
          envelope.asset_name === item.asset_name,
        "Prompt 与分镜版本不匹配",
      );
      item.board_hash = board.sha256;
    }
    const existing = store.get("asset", item.asset_name);
    check(!existing || existing.kind === item.kind, "已有资产类型冲突");
    if (existing)
      check(
        item.add_take === true,
        `同名资产 ${item.asset_name} 已存在，请明确添加 take`,
      );
  }
  const batch = {
    batch_id: id(),
    request,
    sha256: sha(request),
    status: "awaiting_approval",
    created_at: now(),
  };
  return store.put("batch", batch.batch_id, batch);
}

export function approveBatch(store, batchId, hash) {
  const batch = store.get("batch", batchId);
  check(batch, "批次不存在", 404);
  check(batch.sha256 === hash, "批次内容已变化，必须重新确认", 409);
  if (batch.status === "approved")
    return store.list("job").filter((j) => j.batch_id === batchId);
  check(batch.status === "awaiting_approval", "当前批次不可提交");
  const jobs = [];
  // Each item is committed before any external call. A crash while approving can safely resume here.
  for (const [index, item] of batch.request.items.entries()) {
    if (item.board_hash)
      check(
        store.meta("storyboard")?.sha256 === item.board_hash,
        "分镜已更新，请生成新的待确认批次",
        409,
      );
    const asset = store.ensureAsset(item, { existing: true });
    store.put("asset", asset.asset_name, { ...asset, locked: true });
    jobs.push(
      store.createJob(
        {
          kind: "generation",
          provider: "higgsfield",
          batch_id: batchId,
          index,
          request: item,
          destination: batch.request.destination || "none",
          approval_hash: hash,
        },
        `${batchId}:${index}`,
      ),
    );
  }
  store.put("batch", batchId, {
    ...batch,
    status: "approved",
    approved_at: now(),
  });
  return jobs;
}

export class JobRunner {
  constructor(provider) {
    this.provider = provider;
    this.active = new Set();
    this.closed = false;
  }
  recover(store) {
    for (const job of store.list("job")) {
      if (job.kind === "generation" && job.status === "submitting")
        store.updateJob(job.job_id, {
          status: job.remote_id ? "submitted" : "submission_unknown",
          error: "服务曾在提交时中断，请核对远端任务后绑定 ID；不会重复提交。",
        });
      if (job.kind === "generation" && job.status === "downloading")
        store.updateJob(job.job_id, { status: "generated" });
      if (job.kind === "render" && job.status === "running")
        store.updateJob(job.job_id, {
          status: "interrupted",
          error: "本地渲染被中断，可重新导出",
        });
      if (job.kind === "skill" && ["running", "starting"].includes(job.status))
        store.updateJob(job.job_id, {
          status: "interrupted",
          error: "服务曾中断。恢复时先读取原会话，核对是否已完成。",
        });
    }
  }
  async tick(store) {
    if (this.closed || this.active.has(store.root)) return;
    this.active.add(store.root);
    try {
      const queued = store
        .list("job")
        .filter((j) => j.kind === "generation" && j.status === "queued")
        .slice(0, 2);
      await Promise.all(queued.map((job) => this.submit(store, job)));
      const waiting = store
        .list("job")
        .filter((j) => j.kind === "generation" && j.status === "submitted")
        .sort((a, b) => (a.last_polled_at || 0) - (b.last_polled_at || 0))
        .slice(0, 8);
      if (waiting.length && Date.now() >= (store.meta("next_poll_at") || 0)) {
        try {
          for (const job of waiting)
            store.updateJob(job.job_id, { last_polled_at: Date.now() });
          const response = await this.provider.query(store.root, waiting);
          store.meta(
            "next_poll_at",
            Date.now() +
              Math.max(5, Number(response.poll_after_seconds) || 5) * 1000,
          );
          for (const remote of response.jobs || []) {
            const job = waiting.find((j) => j.remote_id === remote.job_id);
            if (!job) continue;
            if (remote.exr_url)
              store.updateJob(job.job_id, {
                status: "needs_attention",
                remote,
                error:
                  "该模型返回 EXR ZIP；result_url 是输入视频，不能登记成输出。请在供应商下载 EXR 并另行处理。",
              });
            else if (remote.status === "completed")
              store.updateJob(job.job_id, {
                status: "generated",
                remote,
                result_url: this.provider.result(remote),
                error: null,
              });
            else if (
              ["failed", "canceled", "nsfw", "ip_detected"].includes(
                remote.status,
              )
            )
              store.updateJob(job.job_id, {
                status: "failed",
                remote,
                error: remote.error || remote.status,
                retryable: false,
              });
            else if (remote.status === "lookup_failed")
              store.updateJob(job.job_id, {
                status: remote.retryable ? "submitted" : "needs_attention",
                remote,
                error: remote.error,
              });
            else
              store.updateJob(job.job_id, {
                remote_status: remote.status,
                error: null,
              });
          }
        } catch (e) {
          store.meta("next_poll_at", Date.now() + 15000);
          for (const job of waiting)
            store.updateJob(job.job_id, {
              error: `查询失败，将继续查询：${e.message}`,
            });
        }
      }
      for (const job of store
        .list("job")
        .filter((j) => j.kind === "generation" && j.status === "generated"))
        await this.collect(store, job);
    } finally {
      this.active.delete(store.root);
    }
  }
  async submit(store, job) {
    // A batch still awaiting confirmation can have prepared rows after a process crash.
    if (store.get("batch", job.batch_id)?.status !== "approved") return;
    store.updateJob(job.job_id, { status: "submitting", submitted_at: now() });
    try {
      const response = await this.provider.submit(store.root, job.request);
      if (response.unlim_choice) {
        store.updateJob(job.job_id, {
          status: "awaiting_choice",
          choice: response.unlim_choice,
          response,
        });
        return;
      }
      const remote = response.results?.find((r) => r.id);
      if (!remote) {
        store.updateJob(job.job_id, {
          status: "submission_unknown",
          response,
          error: response.error || "返回没有任务 ID，需要核对远端记录",
        });
        return;
      }
      const state = ["failed", "canceled", "nsfw", "ip_detected"].includes(
        remote.status,
      )
        ? "failed"
        : remote.status === "completed"
          ? "generated"
          : "submitted";
      store.updateJob(job.job_id, {
        status: state,
        remote_id: remote.id,
        remote,
        result_url: this.provider.result(remote),
        response,
      });
    } catch (error) {
      store.updateJob(job.job_id, {
        status: "submission_unknown",
        error: error.message,
      });
    }
  }
  async collect(store, job) {
    const already = store.list("take").find((t) => t.job_id === job.job_id);
    if (already) {
      store.updateJob(job.job_id, {
        status: "checked",
        take_id: already.take_id,
      });
      return;
    }
    if (!job.result_url) {
      store.updateJob(job.job_id, {
        status: "needs_attention",
        error: "远端完成但没有可下载地址",
      });
      return;
    }
    const temp = contained(
      store.root,
      `deliverables/0_admin/workbench/downloads/${job.job_id}.part`,
    );
    store.updateJob(job.job_id, { status: "downloading" });
    try {
      fs.rmSync(temp, { force: true });
      const receipt = await download(job.result_url, temp);
      const contentExtension = {
        "image/png": ".png",
        "image/jpeg": ".jpg",
        "image/webp": ".webp",
        "image/avif": ".avif",
        "image/gif": ".gif",
        "video/mp4": ".mp4",
        "video/quicktime": ".mov",
        "video/webm": ".webm",
      }[receipt.content_type?.split(";")[0]];
      const ext =
        contentExtension ||
        path
          .extname(new URL(receipt.url).pathname)
          .match(/^\.(png|jpg|jpeg|webp|avif|gif|mp4|mov|webm)$/i)?.[0];
      check(ext, "无法确定实际媒体扩展名，保留远端结果供核对");
      const take = await registerFile(store, temp, {
        ...job.request,
        add_take: true,
        filename: job.request.asset_name + ext,
        model: job.request.params.model,
        job_id: job.job_id,
        source: {
          type: "higgsfield",
          remote_job_id: job.remote_id,
          url: job.result_url,
        },
        external: { provider: "higgsfield", job_id: job.remote_id },
      });
      store.updateJob(job.job_id, {
        status: "checked",
        take_id: take.take_id,
        error: null,
      });
    } catch (error) {
      store.updateJob(job.job_id, {
        status: "download_failed",
        error: error.message,
      });
    } finally {
      fs.rmSync(temp, { force: true });
    }
  }
}
