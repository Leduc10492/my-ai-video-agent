import { randomUUID } from "node:crypto";
import { EventEmitter } from "node:events";
import { AgentJobRequestSchema, type AgentJobRecord, type AgentJobRequest, type DraftValidationHook, validateDraftResult } from "./contracts.js";
import type { TurnStartOptions } from "./client.js";

export interface JobClient {
  initialize(): Promise<unknown>;
  threadStart(params?: Record<string, unknown>): Promise<unknown>;
  turnStart(params: TurnStartOptions): Promise<unknown>;
  interruptTurn(threadId: string, turnId: string): Promise<unknown>;
  close(): Promise<void>;
  on(event: "notification", listener: (method: string, params: unknown) => void): unknown;
}
export type JobClientFactory = (request: AgentJobRequest) => Promise<JobClient> | JobClient;

export interface JobManagerOptions {
  clientFactory: JobClientFactory;
  validateDraft?: DraftValidationHook;
  now?: () => Date;
  idFactory?: () => string;
}

function extractId(value: unknown, keys: readonly string[]): string | undefined {
  if (!value || typeof value !== "object") return undefined;
  for (const key of keys) {
    const candidate = (value as Record<string, unknown>)[key];
    if (typeof candidate === "string") return candidate;
  }
  const nested = (value as Record<string, unknown>).thread ?? (value as Record<string, unknown>).turn;
  return nested && typeof nested === "object" ? extractId(nested, ["id"]) : undefined;
}

function isCancelledJob(record: AgentJobRecord): boolean {
  // Status can change while an awaited App Server call is in flight.
  return record.status === "cancelled";
}

function isCompletedTurn(method: string): boolean {
  return /(?:turn\/completed|turn\.completed|turn\/complete)$/i.test(method);
}

function extractCompletedOutput(params: unknown, turnId?: string): unknown | undefined {
  if (!params || typeof params !== "object") return params;
  const record = params as Record<string, unknown>;
  const eventTurnId = extractId(record, ["turnId", "turn_id"]);
  if (turnId && eventTurnId && eventTurnId !== turnId) return undefined;
  return record.output ?? record.result ?? record;
}

function extractAgentMessage(method: string, params: unknown): unknown | undefined {
  if (!/(?:item\/completed|item\.completed)$/i.test(method) || !params || typeof params !== "object") return undefined;
  const item = (params as Record<string, unknown>).item;
  if (!item || typeof item !== "object") return undefined;
  const record = item as Record<string, unknown>;
  if (record.type !== "agentMessage" || typeof record.text !== "string") return undefined;
  try {
    return JSON.parse(record.text);
  } catch {
    return record.text;
  }
}

function extractTurnFailure(params: unknown): string | undefined {
  if (!params || typeof params !== "object") return undefined;
  const outer = params as Record<string, unknown>;
  const turn = outer.turn && typeof outer.turn === "object" ? outer.turn as Record<string, unknown> : outer;
  if (turn.status !== "failed") return undefined;
  const error = turn.error;
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    const message = (error as Record<string, unknown>).message;
    if (typeof message === "string") return message;
  }
  return "Codex reported that the turn failed.";
}

function extractAgentMessageFromTurn(params: unknown): unknown | undefined {
  if (!params || typeof params !== "object") return undefined;
  const outer = params as Record<string, unknown>;
  const turn = outer.turn && typeof outer.turn === "object" ? outer.turn as Record<string, unknown> : outer;
  if (!Array.isArray(turn.items)) return undefined;
  const item = [...turn.items].reverse().find((candidate) => (
    candidate && typeof candidate === "object" && (candidate as Record<string, unknown>).type === "agentMessage"
  )) as Record<string, unknown> | undefined;
  if (!item || typeof item.text !== "string") return undefined;
  try {
    return JSON.parse(item.text);
  } catch {
    return item.text;
  }
}

export class AgentJobManager extends EventEmitter {
  #records = new Map<string, AgentJobRecord>();
  #clients = new Map<string, JobClient>();
  #locks = new Map<string, string>();
  #latestOutputs = new Map<string, unknown>();
  #finishing = new Set<string>();
  #options: Required<Pick<JobManagerOptions, "now" | "idFactory">> & Omit<JobManagerOptions, "now" | "idFactory">;

  constructor(options: JobManagerOptions) {
    super();
    this.#options = { ...options, now: options.now ?? (() => new Date()), idFactory: options.idFactory ?? randomUUID };
  }

  list(): AgentJobRecord[] {
    return [...this.#records.values()].map((record) => structuredClone(record));
  }

  get(id: string): AgentJobRecord | undefined {
    const record = this.#records.get(id);
    return record ? structuredClone(record) : undefined;
  }

  waitForTerminal(id: string, timeoutMs = 0): Promise<AgentJobRecord> {
    const current = this.#records.get(id);
    if (!current) return Promise.reject(new Error(`Unknown Agent job: ${id}`));
    if (["completed", "failed", "cancelled", "interrupted"].includes(current.status)) {
      return Promise.resolve(structuredClone(current));
    }
    return new Promise((resolve, reject) => {
      let timer: NodeJS.Timeout | undefined;
      const listener = (record: AgentJobRecord): void => {
        if (record.id !== id || !["completed", "failed", "cancelled", "interrupted"].includes(record.status)) return;
        if (timer) clearTimeout(timer);
        this.off("job", listener);
        resolve(structuredClone(record));
      };
      this.on("job", listener);
      if (timeoutMs > 0) {
        timer = setTimeout(() => {
          this.off("job", listener);
          reject(new Error(`Timed out waiting for Agent job ${id}.`));
        }, timeoutMs);
      }
    });
  }

  async start(request: AgentJobRequest): Promise<AgentJobRecord> {
    AgentJobRequestSchema.parse(request);
    const id = this.#options.idFactory();
    const lockKeys = this.#lockKeys(request);
    const conflict = lockKeys.map((key) => this.#locks.get(key)).find(Boolean);
    if (conflict) throw new Error(`Another Agent run is already writing this stage and scope (${conflict}).`);
    for (const key of lockKeys) this.#locks.set(key, id);

    const record: AgentJobRecord = {
      id,
      request: structuredClone(request),
      status: "queued",
      createdAt: this.#options.now().toISOString(),
    };
    this.#records.set(id, record);
    this.#emitRecord(record);
    void this.#run(record, lockKeys);
    return structuredClone(record);
  }

  async cancel(id: string): Promise<AgentJobRecord> {
    const record = this.#records.get(id);
    if (!record) throw new Error(`Unknown Agent job: ${id}`);
    if (record.status === "queued") {
      record.status = "cancelled";
      record.finishedAt = this.#options.now().toISOString();
      this.#release(record);
      this.#emitRecord(record);
      return structuredClone(record);
    }
    if (record.status !== "running") return structuredClone(record);
    const client = this.#clients.get(id);
    if (client && record.threadId && record.turnId) await client.interruptTurn(record.threadId, record.turnId);
    record.status = "cancelled";
    record.finishedAt = this.#options.now().toISOString();
    this.#release(record);
    this.#clients.delete(id);
    this.#latestOutputs.delete(id);
    this.#emitRecord(record);
    await client?.close();
    return structuredClone(record);
  }

  recoverInterrupted(records: readonly AgentJobRecord[]): AgentJobRecord[] {
    const recovered = records.map((source) => {
      const record = structuredClone(source);
      if (record.status === "queued" || record.status === "running") {
        record.status = "interrupted";
        record.finishedAt = this.#options.now().toISOString();
        record.error = "The app or Agent runtime stopped before this run finished.";
      }
      this.#records.set(record.id, record);
      this.#emitRecord(record);
      return structuredClone(record);
    });
    return recovered;
  }

  async #run(record: AgentJobRecord, lockKeys: string[]): Promise<void> {
    let client: JobClient | undefined;
    try {
      if (isCancelledJob(record)) return;
      record.status = "running";
      record.startedAt = this.#options.now().toISOString();
      this.#emitRecord(record);
      client = await this.#options.clientFactory(record.request);
      if (isCancelledJob(record)) {
        await client.close();
        return;
      }
      this.#clients.set(record.id, client);
      client.on("notification", (method: string, params: unknown) => {
        this.emit("stream", { jobId: record.id, method, params });
        const message = extractAgentMessage(method, params);
        if (message !== undefined) this.#latestOutputs.set(record.id, message);
        if (isCompletedTurn(method) && record.status === "running") {
          const failure = extractTurnFailure(params);
          if (failure) {
            record.status = "failed";
            record.error = failure;
            record.finishedAt = this.#options.now().toISOString();
            this.#release(record);
            this.#clients.delete(record.id);
            this.#latestOutputs.delete(record.id);
            this.#emitRecord(record);
            void client?.close();
            return;
          }
          const direct = extractCompletedOutput(params, record.turnId);
          const output = direct && typeof direct === "object" && !Array.isArray(direct)
            && !("operations" in (direct as Record<string, unknown>))
            ? (this.#latestOutputs.get(record.id) ?? extractAgentMessageFromTurn(params))
            : direct;
          void this.#complete(record, output);
        }
      });
      await client.initialize();
      if (isCancelledJob(record)) return;
      const thread = await client.threadStart({
        cwd: record.request.workingDirectory,
        runtimeWorkspaceRoots: record.request.workingDirectory ? [record.request.workingDirectory] : undefined,
        model: record.request.model,
        serviceTier: "default",
        approvalPolicy: "never",
        sandbox: "read-only",
      });
      record.threadId = extractId(thread, ["threadId", "id"]);
      if (!record.threadId) throw new Error("Codex App Server did not return a thread ID.");
      if (isCancelledJob(record)) return;
      const turn = await client.turnStart({
        threadId: record.threadId,
        prompt: record.request.prompt,
        skill: { id: record.request.skill.id, path: record.request.skill.path },
        outputSchema: record.request.outputSchema,
        model: record.request.model,
        effort: record.request.effort,
        cwd: record.request.workingDirectory,
        runtimeWorkspaceRoots: record.request.workingDirectory ? [record.request.workingDirectory] : undefined,
        approvalPolicy: "never",
        sandboxPolicy: this.#sandboxPolicy(record.request),
      });
      record.turnId = extractId(turn, ["turnId", "id"]);
      if (!record.turnId) throw new Error("Codex App Server did not return a turn ID.");
      if (isCancelledJob(record)) return;
      this.#emitRecord(record);
    } catch (error) {
      if (!isCancelledJob(record)) {
        record.status = "failed";
        record.error = error instanceof Error ? error.message : String(error);
        record.finishedAt = this.#options.now().toISOString();
        this.#emitRecord(record);
      }
      this.#releaseKeys(record.id, lockKeys);
      await client?.close();
    }
  }

  async #complete(record: AgentJobRecord, output: unknown): Promise<void> {
    if (this.#finishing.has(record.id)) return;
    this.#finishing.add(record.id);
    try {
      const result = await validateDraftResult(output, this.#options.validateDraft);
      if (record.status !== "running") return;
      record.summary = result.summary;
      record.result = result.operations;
      record.status = "completed";
    } catch (error) {
      if (record.status !== "running") return;
      record.status = "failed";
      record.error = `Draft validation failed: ${error instanceof Error ? error.message : String(error)}`;
    } finally {
      this.#finishing.delete(record.id);
    }
    if (record.status !== "completed" && record.status !== "failed") return;
    record.finishedAt = this.#options.now().toISOString();
    this.#release(record);
    this.#emitRecord(record);
    const client = this.#clients.get(record.id);
    this.#clients.delete(record.id);
    this.#latestOutputs.delete(record.id);
    await client?.close();
  }

  #lockKeys(request: AgentJobRequest): string[] {
    return [...new Set(request.scopeIds)].sort().map((scopeId) => `${request.stage}:${scopeId}`);
  }

  #sandboxPolicy(request: AgentJobRequest): Record<string, unknown> {
    const capabilities = new Set(request.grantedCapabilities ?? []);
    const networkAccess = capabilities.has("network.request");
    if (!capabilities.has("shell.request") || !request.workingDirectory) {
      return { type: "readOnly", networkAccess };
    }
    return {
      type: "workspaceWrite",
      writableRoots: [request.workingDirectory],
      networkAccess,
      excludeTmpdirEnvVar: true,
      excludeSlashTmp: true,
    };
  }

  #release(record: AgentJobRecord): void {
    this.#releaseKeys(record.id, this.#lockKeys(record.request));
  }

  #releaseKeys(id: string, keys: readonly string[]): void {
    for (const key of keys) if (this.#locks.get(key) === id) this.#locks.delete(key);
  }

  #emitRecord(record: AgentJobRecord): void {
    this.emit("job", structuredClone(record));
  }
}
