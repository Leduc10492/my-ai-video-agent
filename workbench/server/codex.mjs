import { spawn } from "node:child_process";
import { createInterface } from "node:readline";
import { EventEmitter } from "node:events";
import { check, id, now } from "./files.mjs";
import { skills, scriptStatus } from "./workflow.mjs";
import fs from "node:fs";
import { contained, sha } from "./files.mjs";
import { makePacket, planSchemas } from "./skill-packets.mjs";
import { skillInputs } from "./skill-settings.mjs";
import { skillThreadName, skillThreadProject } from "./skill-threads.mjs";
import { projectLayout, portableInstructions } from "../../.agents/project-layout.mjs";

export class CodexClient extends EventEmitter {
  constructor() {
    super();
    this.sequence = 0;
    this.pending = new Map();
    this.requests = new Map();
    this.contexts = new Map();
    this.projectThreads = new Map();
    this.ready = null;
  }
  async start() {
    if (this.ready) return this.ready;
    this.ready = (async () => {
      this.child = spawn(
        process.env.CODEX_BIN || "codex",
        ["app-server", "--listen", "stdio://"],
        { stdio: ["pipe", "pipe", "pipe"] },
      );
      this.child.stderr.on("data", () => {});
      this.child.on("error", (error) => this.fail(error));
      this.child.on("exit", () =>
        this.fail(new Error("Codex App Server 已退出，请重新连接")),
      );
      createInterface({ input: this.child.stdout }).on("line", (line) => {
        let data;
        try {
          data = JSON.parse(line);
        } catch {
          return;
        }
        if (data.method) {
          if (data.id !== undefined) {
            const supported = [
              "item/commandExecution/requestApproval",
              "item/fileChange/requestApproval",
              "item/permissions/requestApproval",
              "execCommandApproval",
              "applyPatchApproval",
              "item/tool/requestUserInput",
              "mcpServer/elicitation/request",
            ];
            if (!supported.includes(data.method)) {
              this.child.stdin.write(
                JSON.stringify({
                  id: data.id,
                  error: {
                    code: -32601,
                    message: `工作台不支持 ${data.method}，本次请求未执行`,
                  },
                }) + "\n",
              );
              this.emit("unsupportedRequest", data);
              return;
            }
            const requestId = id(),
              threadId = data.params?.threadId;
            const pending = {
              request_id: requestId,
              rpc_id: data.id,
              method: data.method,
              params: data.params,
              thread_id: threadId,
              created_at: now(),
            };
            this.requests.set(requestId, pending);
            this.emit("request", pending);
          } else {
            if (data.method === "serverRequest/resolved")
              for (const [key, request] of this.requests)
                if (request.rpc_id === data.params?.requestId)
                  this.requests.delete(key);
            this.emit("notification", data);
          }
        } else if (this.pending.has(data.id)) {
          const waiter = this.pending.get(data.id);
          this.pending.delete(data.id);
          clearTimeout(waiter.timer);
          data.error
            ? waiter.reject(new Error(data.error.message))
            : waiter.resolve(data.result);
        }
      });
      const result = await this.rpc(
        "initialize",
        {
          clientInfo: { name: "film_workbench", version: "0.1.0" },
          capabilities: { experimentalApi: true },
        },
        30000,
      );
      this.child.stdin.write(
        JSON.stringify({ method: "initialized", params: {} }) + "\n",
      );
      return result;
    })();
    try {
      return await this.ready;
    } catch (e) {
      this.ready = null;
      throw e;
    }
  }
  fail(error) {
    for (const pending of this.pending.values()) {
      clearTimeout(pending.timer);
      pending.reject(error);
    }
    this.pending.clear();
    this.requests.clear();
    this.contexts.clear();
    this.projectThreads.clear();
    this.ready = null;
    this.emit("disconnected", error);
  }
  rpc(method, params, timeout = 120000) {
    const requestId = ++this.sequence;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(requestId);
        reject(new Error(`${method} 超时；结果未知，请先核对`));
      }, timeout);
      this.pending.set(requestId, { resolve, reject, timer });
      this.child.stdin.write(
        JSON.stringify({ id: requestId, method, params }) + "\n",
      );
    });
  }
  async request(method, params, timeout) {
    await this.start();
    return this.rpc(method, params, timeout);
  }
  async context(root) {
    await this.start();
    if (!this.contexts.has(root))
      this.contexts.set(
        root,
        this.rpc("thread/start", {
          cwd: root,
          ephemeral: true,
          approvalPolicy: "on-request",
          sandbox: "read-only",
        }).then((r) => {
          this.projectThreads.set(r.thread.id, root);
          return r.thread.id;
        }),
      );
    try {
      return await this.contexts.get(root);
    } catch (e) {
      this.contexts.delete(root);
      throw e;
    }
  }
  async mcp(root, tool, args) {
    const threadId = await this.context(root);
    const result = await this.request(
      "mcpServer/tool/call",
      { threadId, server: "codex_apps", tool, arguments: args },
      180000,
    );
    if (result.isError)
      throw new Error(
        result.content
          ?.filter((c) => c.type === "text")
          .map((c) => c.text)
          .join("\n") || "MCP 调用失败",
      );
    if (result.structuredContent) return result.structuredContent;
    const text = result.content
      ?.filter((c) => c.type === "text")
      .map((c) => c.text)
      .join("\n");
    try {
      return JSON.parse(text);
    } catch {
      return { text };
    }
  }
  answer(requestId, result) {
    const request = this.requests.get(requestId);
    check(request, "请求已失效，请重新连接", 409);
    if (request.method === "item/permissions/requestApproval") {
      check(
        ["accept", "decline"].includes(result.decision),
        "权限审批结果无效",
      );
      result = {
        permissions:
          result.decision === "accept" ? request.params.permissions : {},
        scope: "turn",
      };
    } else if (
      ["execCommandApproval", "applyPatchApproval"].includes(request.method)
    ) {
      check(
        ["accept", "decline", "cancel"].includes(result.decision),
        "审批结果无效",
      );
      result = {
        decision:
          result.decision === "accept"
            ? "approved"
            : result.decision === "cancel"
              ? "abort"
              : { denied: { rejection: "用户拒绝本次操作" } },
      };
    } else if (request.method.includes("requestApproval"))
      check(
        ["accept", "decline", "cancel"].includes(result.decision),
        "审批结果无效",
      );
    else if (request.method === "item/tool/requestUserInput")
      check(
        result.answers && typeof result.answers === "object",
        "需要问题答案",
      );
    else if (request.method === "mcpServer/elicitation/request") {
      check(
        ["accept", "decline", "cancel"].includes(result.action),
        "授权结果无效",
      );
      const mode = request.params?.request?.mode || request.params?.mode;
      check(
        result.action !== "accept" ||
          !["openai/userVerification", "url"].includes(mode),
        "请在原生授权界面完成验证；工作台不会代替身份验证确认",
      );
    } else
      throw new Error(
        `暂不支持自动处理 ${request.method}，请在 Codex 中处理此请求`,
      );
    this.child.stdin.write(
      JSON.stringify({ id: request.rpc_id, result }) + "\n",
    );
    this.requests.delete(requestId);
  }
  close() {
    this.child?.kill();
  }
}

export const stageSlots = {
  script: ["script.primary"],
  audit: ["script.primary", "story.mckee_router"],
  assets: ["guides.primary"],
  storyboard: ["shotlist.breakdown"],
  prompts: ["shotlist.prompt_compiler"],
  html: ["shotlist.html_assembler"],
};
export const artifactSchema = {
  type: "object",
  properties: {
    summary: { type: "string" },
    artifacts: {
      type: "array",
      items: {
        type: "object",
        properties: { path: { type: "string" }, content: { type: "string" } },
        required: ["path", "content"],
        additionalProperties: false,
      },
    },
  },
  required: ["summary", "artifacts"],
  additionalProperties: false,
};
export async function startSkill(client, store, input) {
  check(stageSlots[input.stage], "未知工作流阶段");
  check(
    input.effort === undefined ||
      ["low", "medium", "high", "xhigh", "max"].includes(input.effort),
    "未知推理投入",
  );
  check(
    typeof input.instruction === "string" && input.instruction.trim(),
    "请填写本阶段要求",
  );
  const previous = store.db
    .prepare("SELECT job_id FROM dedupe WHERE key=?")
    .get(input.request_key || "");
  if (previous) return store.get("job", previous.job_id);
  const registry = skills(store.root),
    selected = stageSlots[input.stage].map((slot) =>
      registry.find((s) => s.slot === slot),
    );
  check(
    selected.every((s) => s?.available),
    "Registry 指向的 Skill 文件缺失",
  );
  const selectedInputs = skillInputs(selected);
  const current = scriptStatus(store.root);
  const planning = input.mode === "planning";
  check(
    input.mode === undefined || ["planning", "production"].includes(input.mode),
    "未知执行范围",
  );
  if (planning) {
    check(
      ["assets", "storyboard"].includes(input.stage),
      "规划模式仅支持资产拆分和分镜设计",
    );
    check(
      current.state?.working_script && current.audit,
      "先保存并审核当前剧本，再做规划草案",
    );
    check(
      input.expected_sha256 === current.state.working_script.sha256,
      "工作稿已更新，请重新载入规划输入",
      409,
    );
  }
  const productionStage = ["assets", "storyboard", "prompts", "html"].includes(
    input.stage,
  );
  if (productionStage && !planning)
    check(current.state?.production_inputs, "先审核并确认剧本生产版本");
  const scriptInput =
    productionStage && !planning
      ? current.state.production_inputs.script
      : (current.state?.working_script ?? null);
  if (productionStage && !planning && input.scene) {
    const scope = current.state.production_inputs.authorization?.scope || [];
    check(
      scope.includes("*") || scope.includes(input.scene),
      "Scene 超出已确认生产范围",
      409,
    );
  }
  let audit = current.audit;
  if (productionStage && !planning) {
    const ref = current.state.production_inputs.audit;
    if (ref?.path) {
      const text = fs.readFileSync(contained(store.root, ref.path), "utf8");
      check(sha(text) === ref.sha256, "生产审计文件已改变", 409);
      audit = { ...ref, text };
    }
  }
  const structured = !!planSchemas[input.stage] && input.protocol !== "legacy";
  const prepared = structured
    ? makePacket(store, input, scriptInput, audit, selected)
    : null;
  const effort = input.effort || "medium";
  const boardInput = store.meta("storyboard");
  const job = store.createJob(
    {
      kind: "skill",
      stage: input.stage,
      effort,
      model: input.model || null,
      scene: input.scene || null,
      batch_id: input.batch_id || null,
      protocol: structured ? "workbench-plan-v1" : "artifacts-v1",
      ...(prepared || {}),
      metrics: {
        queued_at: now(),
        tool_calls: 0,
        input_chars: prepared ? JSON.stringify(prepared.packet).length : null,
      },
      mode: planning ? "planning" : "production",
      instruction: input.instruction,
      skills: selected,
      input_script: scriptInput,
      input_storyboard: boardInput
        ? { path: boardInput.path, sha256: boardInput.sha256 }
        : null,
    },
    input.request_key,
  );
  if (job.status !== "queued") return job;
  store.updateJob(job.job_id, { status: "starting" });
  try {
    const projectId = await skillThreadProject(client, store.root);
    const thread = await client.request("thread/start", {
      cwd: store.root,
      ...(projectId ? { projectId } : {}),
      // Durable history is required for recovery; SkillRunner archives settled turns.
      ephemeral: false,
      serviceName: "film_workbench",
      sandbox: "read-only",
      approvalPolicy: "on-request",
      ...(input.model ? { model: input.model } : {}),
      developerInstructions: structured
        ? "你在本地影视工作台执行一个有完整输入快照的设计任务。精确 Registry Skill 已随本轮注入，请使用其创作方法，不重复读取同一 Skill。本轮输出协议由 outputSchema 和输入包指定：仅返回一份结构化设计，不返回 artifacts、Markdown、HTML、文件路径、完整工程或其他 Scene；服务负责元数据、编号、版本、渲染、保存与合并，不能自行写文件。原文、资产和状态已由服务按路径/哈希核验；不为这些程序操作重新扫描目录、计算哈希或研究存储实现。输入包是本任务的完整上下文，不检索无关历史或旧项目。仅遇到输入明确缺失且影响创作的事实时，按输入中精确路径补读所需小段；不要整批 cat，也不要使用需要临时文件的 heredoc。未知创作事实作为候选/风险，不能改写 canon；保留原台词、文件名与真实 tag。保留摄影、空间、对白和连续性判断；每个事实只表达一次。禁止生成媒体、上传、发布和发送消息。不得推断用户已接受参考或通过视觉 QA。只完成指定阶段，不调用子 Agent，不追加后续流程。"
        : "你在本地影视工作台内执行单一阶段。读取指定项目 Registry 与精确 Skill 路径。只读项目；所有拟保存的 Markdown/HTML/JSON 文件以最终结构化输出 artifacts 返回，由本地服务在用户审阅后保存，禁止自行写 workflow_state。不要调用生成、发布、发送消息、上传或其他外部写入工具。只完成用户指定阶段，真实图像缺失时明确缺口，不假定 QA 通过。Prompt 只包含影响生成结果的内容。保留文件名和真实 tag。",
    });
    store.updateJob(job.job_id, {
      thread_id: thread.thread.id,
      thread_project_id: projectId || null,
      thread_title: skillThreadName(store, job),
      status: "running",
      actual_model: thread.model || thread.thread.model || input.model || null,
      metrics: { ...job.metrics, thread_started_at: now() },
    });
    await client.request("thread/name/set", {
      threadId: thread.thread.id,
      name: skillThreadName(store, job),
    });
    client.emit?.("skill/registered", {
      store,
      job: store.get("job", job.job_id),
    });
    const text = `阶段：${input.stage}\n用户要求：${input.instruction}\n本阶段必须使用的剧本引用：${JSON.stringify(scriptInput)}\n已确认生产输入及范围：${JSON.stringify(current.state?.production_inputs ?? null)}\n${productionStage && !planning ? "资产、分镜和 Prompt 只使用已确认生产引用及其授权 Scene 范围，不能改用更新的工作稿。" : ""}\n结构化 UI 产物规则：资产阶段额外给 deliverables/2_assets/asset_inventory_vN.json，格式 {assets:[{asset_name,kind,scene,tag,prompt}]}。分镜和 Prompt 编译阶段额外给 deliverables/3_shotlist/storyboard_vN.json，格式 {envelopes:[{id,scene,asset_name,duration_seconds,source_rows:[ShotRowID],prompt,markers:[{id,title,time}]}]}。保持 Scene → Shot Row → Prompt Envelope；未批准 Prompt 留空，不把计划镜头标记当实际切点。N 使用不存在的下一个版本号；所有产物保留旧版本，不覆盖同名文件。其他阶段使用现有 Skill 的文件规范。遇到需要创作决定的缺口，summary 中说明，不猜测补全。`;
    const boardContext = `\n当前工作台分镜引用：${JSON.stringify(boardInput ? { path: boardInput.path, sha256: boardInput.sha256 } : null)}。如有引用，读取该文件中的镜头设计与素材关联，不静默改用其他分镜版本。分镜和 Prompt 编译阶段的 storyboard_vN.json 在 envelopes 之外增加 shots 数组：[{id,scene,title,description,camera,sound,references:[标准文件名]}]；每项对应一个 source_rows 中的 Shot Row，scene 与所属 Envelope 一致。保留每个 Shot Row，不能把整个多镜头 Envelope 的 Prompt 当作每个镜头的画面描述。references 只填写已知且明确关联的本地资产标识，真实平台 tag 保持原文。旧产物缺少这些详情时注明缺口，不从文件名猜画面。保留未修改 Scene 的既有 shots、envelopes 和扩展字段，返回可完整载入的分镜文件。`;
    const planningContext = planning
      ? `\n执行范围：用户明确选择仅做资产拆分/分镜设计草案，属于 text_only_draft。以以上工作稿精确引用和同版本审计 ${current.audit.path} 为输入；本次未选择或确认正式生产版本，前述正式生产输入要求不适用此规划任务。保留原剧本及其冲突，给可审阅的候选设计和风险，不虚构用户接受、参考锁定、视觉 QA 或正式生产就绪。必需图片缺失只记录为草案约束；不生成图片/视频，不编译生产 Prompt，所有 prompt 字段为空，tag 未提供时为空。按明确请求的 Scene 范围完成文本规划，不能把范围外流程当成门禁。结构化产物必须含 output_status:text_only_draft 和精确 source_script 引用。`
      : "";
    const turn = await client.request("turn/start", {
      threadId: thread.thread.id,
      effort,
      input: [
        ...selectedInputs,
        {
          type: "text",
          text: structured
            ? JSON.stringify(prepared.packet)
            : projectLayout(store.root)
              ? portableInstructions(text + boardContext + planningContext) + "\n本项目使用六类目录。分镜版本保存在 03_分镜/<scene>/vN/；生成视频进入 04_镜头/<scene>/。以本项目 .agents/production-contract.md 为路径依据。"
              : text + boardContext + planningContext,
          text_elements: [],
        },
      ],
      outputSchema: structured ? planSchemas[input.stage] : artifactSchema,
    });
    return store.updateJob(job.job_id, { turn_id: turn.turn.id });
  } catch (error) {
    const failed = store.updateJob(job.job_id, {
      status: "needs_attention",
      error: error.message,
    });
    client.emit?.("skill/settled", { store, job: failed });
    return failed;
  }
}
