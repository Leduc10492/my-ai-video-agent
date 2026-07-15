import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { EventEmitter } from "node:events";
import type { AppServerLaunchConfig } from "./launch.js";
import { encodeJsonRpcMessage, JsonRpcMessageParser, type JsonRpcFraming, type JsonRpcMessage } from "./framing.js";

export class JsonRpcRequestError extends Error {
  constructor(
    message: string,
    readonly code: number,
    readonly data?: unknown,
  ) {
    super(message);
    this.name = "JsonRpcRequestError";
  }
}

interface PendingRequest {
  method: string;
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
  timer: NodeJS.Timeout;
}

export type SpawnAppServer = (
  command: string,
  args: readonly string[],
  options: AppServerLaunchConfig["options"],
) => ChildProcessWithoutNullStreams;

export interface CodexClientOptions {
  framing?: JsonRpcFraming;
  requestTimeoutMs?: number;
  spawnImpl?: SpawnAppServer;
}

export interface SkillTurnInput {
  type: "skill";
  name: string;
  path: string;
}

export interface TextTurnInput {
  type: "text";
  text: string;
  text_elements: [];
}

export type TurnInput = TextTurnInput | SkillTurnInput;

export interface TurnStartOptions {
  threadId: string;
  prompt: string;
  skill: { id: string; path: string };
  outputSchema: Record<string, unknown>;
  model?: string;
  effort?: "low" | "medium" | "high" | "xhigh";
  cwd?: string;
  runtimeWorkspaceRoots?: string[];
  approvalPolicy?: "never" | "on-request" | "untrusted";
  sandboxPolicy?: Record<string, unknown>;
}

export class CodexAppServerClient extends EventEmitter {
  #process: ChildProcessWithoutNullStreams;
  #framing: JsonRpcFraming;
  #requestTimeoutMs: number;
  #parser = new JsonRpcMessageParser();
  #nextRequestId = 1;
  #pending = new Map<number | string, PendingRequest>();
  #closed = false;
  #sensitiveValues: string[];

  private constructor(process: ChildProcessWithoutNullStreams, options: CodexClientOptions, sensitiveValues: string[]) {
    super();
    this.#process = process;
    this.#framing = options.framing ?? "newline";
    this.#requestTimeoutMs = options.requestTimeoutMs ?? 30_000;
    this.#sensitiveValues = sensitiveValues.filter((value) => value.length >= 4);
    process.stdout.on("data", (chunk: Buffer) => this.#receive(chunk));
    process.stderr.on("data", (chunk: Buffer) => this.emit("diagnostic", this.#sanitize(chunk.toString("utf8"))));
    process.once("error", (error) => this.#closeWithError(error));
    process.once("exit", (code, signal) => this.#closeWithError(new Error(`Codex App Server exited (${code ?? signal ?? "unknown"}).`)));
  }

  static launch(config: AppServerLaunchConfig, options: CodexClientOptions = {}): CodexAppServerClient {
    const spawnImpl = options.spawnImpl ?? ((command, args, spawnOptions) => spawn(command, args, spawnOptions) as ChildProcessWithoutNullStreams);
    const env = config.options.env ?? {};
    const sensitiveValues = config.secretEnvironmentKeys
      .map((key) => env[key])
      .filter((value): value is string => typeof value === "string");
    return new CodexAppServerClient(spawnImpl(config.command, config.args, config.options), options, sensitiveValues);
  }

  get closed(): boolean {
    return this.#closed;
  }

  async initialize(clientInfo = { name: "ai-director-workbench", version: "0.1.0" }): Promise<unknown> {
    const result = await this.request("initialize", {
      clientInfo: { title: "AI Director Workbench", ...clientInfo },
      // Runtime workspace roots are required to confine a run to its staged
      // project sandbox and currently sit behind the negotiated API capability.
      capabilities: { experimentalApi: true, requestAttestation: false },
    });
    this.notify("initialized");
    return result;
  }

  request<T = unknown>(method: string, params: unknown = {}, timeoutMs = this.#requestTimeoutMs): Promise<T> {
    if (this.#closed) return Promise.reject(new Error("Codex App Server is closed."));
    const id = this.#nextRequestId++;
    const message: JsonRpcMessage = { jsonrpc: "2.0", id, method, params };
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.#pending.delete(id);
        reject(new Error(`Codex App Server request timed out: ${method}`));
      }, timeoutMs);
      this.#pending.set(id, { method, resolve: (value) => resolve(value as T), reject, timer });
      this.#process.stdin.write(encodeJsonRpcMessage(message, this.#framing), (error) => {
        if (!error) return;
        clearTimeout(timer);
        this.#pending.delete(id);
        reject(error);
      });
    });
  }

  notify(method: string, params?: unknown): void {
    if (this.#closed) return;
    this.#process.stdin.write(encodeJsonRpcMessage(
      params === undefined ? { jsonrpc: "2.0", method } : { jsonrpc: "2.0", method, params },
      this.#framing,
    ));
  }

  respond(id: number | string, result: unknown): void {
    if (this.#closed) return;
    this.#process.stdin.write(encodeJsonRpcMessage({ jsonrpc: "2.0", id, result }, this.#framing));
  }

  respondError(id: number | string, code: number, message: string, data?: unknown): void {
    if (this.#closed) return;
    this.#process.stdin.write(encodeJsonRpcMessage({ jsonrpc: "2.0", id, error: { code, message, data } }, this.#framing));
  }

  accountRead(): Promise<unknown> {
    return this.request("account/read", { refreshToken: false });
  }

  loginWithApiKey(apiKey: string): Promise<unknown> {
    if (!apiKey.trim()) return Promise.reject(new Error("API key cannot be empty."));
    if (!this.#sensitiveValues.includes(apiKey)) this.#sensitiveValues.push(apiKey);
    return this.request("account/login/start", { type: "apiKey", apiKey });
  }

  accountLogout(): Promise<unknown> {
    return this.request("account/logout");
  }

  modelList(params: Record<string, unknown> = {}): Promise<unknown> {
    return this.request("model/list", params);
  }

  skillsList(params: Record<string, unknown> = {}): Promise<unknown> {
    return this.request("skills/list", params);
  }

  setExtraSkillRoots(roots: readonly string[]): Promise<unknown> {
    return this.request("skills/extraRoots/set", { extraRoots: [...roots] });
  }

  threadStart(params: Record<string, unknown> = {}): Promise<unknown> {
    return this.request("thread/start", params);
  }

  turnStart(options: TurnStartOptions): Promise<unknown> {
    const input: TurnInput[] = [
      { type: "skill", name: options.skill.id, path: options.skill.path },
      { type: "text", text: options.prompt, text_elements: [] },
    ];
    return this.request("turn/start", {
      threadId: options.threadId,
      input,
      outputSchema: options.outputSchema,
      model: options.model,
      effort: options.effort,
      cwd: options.cwd,
      runtimeWorkspaceRoots: options.runtimeWorkspaceRoots,
      approvalPolicy: options.approvalPolicy,
      sandboxPolicy: options.sandboxPolicy,
      serviceTier: "default",
    });
  }

  interruptTurn(threadId: string, turnId: string): Promise<unknown> {
    return this.request("turn/interrupt", { threadId, turnId });
  }

  async close(): Promise<void> {
    if (this.#closed) return;
    this.#closed = true;
    for (const pending of this.#pending.values()) {
      clearTimeout(pending.timer);
      pending.reject(new Error("Codex App Server was closed."));
    }
    this.#pending.clear();
    this.#process.stdin.end();
    if (!this.#process.killed) this.#process.kill("SIGTERM");
  }

  #receive(chunk: Buffer): void {
    let messages: JsonRpcMessage[];
    try {
      messages = this.#parser.push(chunk);
    } catch (error) {
      this.emit("protocolError", error);
      return;
    }
    for (const message of messages) {
      if (message.id !== undefined && ("result" in message || message.error)) {
        const pending = this.#pending.get(message.id);
        if (!pending) continue;
        clearTimeout(pending.timer);
        this.#pending.delete(message.id);
        if (message.error) pending.reject(new JsonRpcRequestError(this.#sanitize(message.error.message), message.error.code, message.error.data));
        else pending.resolve(message.result);
      } else if (message.method && message.id !== undefined) {
        this.emit("serverRequest", {
          id: message.id,
          method: message.method,
          params: message.params,
          respond: (result: unknown) => this.respond(message.id!, result),
          reject: (code: number, reason: string, data?: unknown) => this.respondError(message.id!, code, reason, data),
        });
      } else if (message.method) {
        this.emit("notification", message.method, message.params);
        this.emit(`notification:${message.method}`, message.params);
      }
    }
  }

  #closeWithError(error: Error): void {
    if (this.#closed) return;
    this.#closed = true;
    for (const pending of this.#pending.values()) {
      clearTimeout(pending.timer);
      pending.reject(new Error(this.#sanitize(error.message)));
    }
    this.#pending.clear();
    this.emit("closed", new Error(this.#sanitize(error.message)));
  }

  #sanitize(value: string): string {
    return this.#sensitiveValues.reduce((safe, secret) => safe.split(secret).join("[REDACTED]"), value);
  }
}
