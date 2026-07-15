import { EventEmitter } from "node:events";
import { PassThrough } from "node:stream";
import type { ChildProcessWithoutNullStreams } from "node:child_process";
import { describe, expect, it } from "vitest";
import {
  AgentJobManager,
  buildByokCodexLaunchConfig,
  CodexAppServerClient,
  encodeJsonRpcMessage,
  JsonRpcMessageParser,
  redactLaunchConfig,
  type AgentJobRequest,
} from "./index.js";

class FakeProcess extends EventEmitter {
  stdin = new PassThrough();
  stdout = new PassThrough();
  stderr = new PassThrough();
  killed = false;
  kill(): boolean {
    this.killed = true;
    return true;
  }
}

describe("JSON-RPC framing and client", () => {
  it("parses newline and Content-Length frames even when chunks are split", () => {
    const parser = new JsonRpcMessageParser();
    const newline = encodeJsonRpcMessage({ jsonrpc: "2.0", id: 1, result: { ok: true } }, "newline");
    expect(parser.push(newline)).toEqual([{ jsonrpc: "2.0", id: 1, result: { ok: true } }]);

    const framed = encodeJsonRpcMessage({ jsonrpc: "2.0", method: "event", params: { step: 1 } }, "content-length");
    const second = new JsonRpcMessageParser();
    expect(second.push(framed.subarray(0, 12))).toEqual([]);
    expect(second.push(framed.subarray(12))).toEqual([{ jsonrpc: "2.0", method: "event", params: { step: 1 } }]);
  });

  it("matches responses to requests and sends the exact skill path in turn input", async () => {
    const process = new FakeProcess();
    const writes: string[] = [];
    process.stdin.on("data", (chunk) => writes.push(chunk.toString("utf8")));
    const client = CodexAppServerClient.launch(
      { command: "fake", args: [], options: {}, secretEnvironmentKeys: [] },
      { spawnImpl: () => process as unknown as ChildProcessWithoutNullStreams },
    );
    const pending = client.turnStart({
      threadId: "thread-1",
      prompt: "Review scene 1",
      skill: { id: "screenwriter", path: "/project/skills/screenwriter/SKILL.md" },
      outputSchema: { type: "object" },
      model: "gpt-5.6-sol",
      effort: "medium",
    });
    await new Promise((resolve) => setImmediate(resolve));
    const sent = JSON.parse(writes[0] ?? "{}") as { id: number; params: { input: Array<Record<string, unknown>> } };
    expect(sent.params.input[0]).toEqual({ type: "skill", name: "screenwriter", path: "/project/skills/screenwriter/SKILL.md" });
    process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", id: sent.id, result: { turn: { id: "turn-1" } } })}\n`);
    await expect(pending).resolves.toEqual({ turn: { id: "turn-1" } });
    await client.close();
  });

  it("redacts the API key and isolates BYOK CODEX_HOME", () => {
    const config = buildByokCodexLaunchConfig({ codexHome: "/tmp/ai-director-codex", apiKey: "sk-secret", env: {} });
    expect(config.options.env?.CODEX_HOME).toBe("/tmp/ai-director-codex");
    expect((redactLaunchConfig(config).options as { env: Record<string, string> }).env.OPENAI_API_KEY).toBe("[REDACTED]");
    expect(JSON.stringify(redactLaunchConfig(config))).not.toContain("sk-secret");
    expect(config.args.join(" ")).toContain("gpt-5.6-sol");
    expect(config.args.join(" ")).toContain("medium");
    expect(config.args.join(" ")).toContain("service_tier");
    expect(config.args.join(" ")).toContain("cli_auth_credentials_store");
    expect(config.args.join(" ")).toContain("keyring");
  });

  it("does not inherit unrelated secrets in a BYOK process", () => {
    const config = buildByokCodexLaunchConfig({
      codexHome: "/tmp/ai-director-codex",
      env: { PATH: "/usr/bin", HOME: "/tmp/home", VENDOR_ACCESS_TOKEN: "hidden", RANDOM_VALUE: "drop-me" }
    });
    expect(config.options.env?.PATH).toBe("/usr/bin");
    expect(config.options.env?.HOME).toBe("/tmp/home");
    expect(config.options.env?.VENDOR_ACCESS_TOKEN).toBeUndefined();
    expect(config.options.env?.RANDOM_VALUE).toBeUndefined();
  });

  it("redacts a key supplied through the App Server login request", async () => {
    const process = new FakeProcess();
    const writes: string[] = [];
    process.stdin.on("data", (chunk) => writes.push(chunk.toString("utf8")));
    const client = CodexAppServerClient.launch(
      { command: "fake", args: [], options: {}, secretEnvironmentKeys: [] },
      { spawnImpl: () => process as unknown as ChildProcessWithoutNullStreams },
    );
    const diagnostic = new Promise<string>((resolve) => client.once("diagnostic", resolve));
    const pending = client.loginWithApiKey("sk-login-secret");
    await new Promise((resolve) => setImmediate(resolve));
    process.stderr.write("login failed for sk-login-secret");
    await expect(diagnostic).resolves.toBe("login failed for [REDACTED]");
    const sent = JSON.parse(writes[0] ?? "{}") as { id: number };
    process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", id: sent.id, result: { type: "apiKey" } })}\n`);
    await expect(pending).resolves.toEqual({ type: "apiKey" });
    await client.close();
  });
});

class FakeJobClient extends EventEmitter {
  closed = false;
  interrupted: [string, string][] = [];
  async initialize(): Promise<object> { return {}; }
  async threadStart(): Promise<object> { return { thread: { id: "thread-1" } }; }
  async turnStart(): Promise<object> { return { turn: { id: "turn-1" } }; }
  async interruptTurn(threadId: string, turnId: string): Promise<object> {
    this.interrupted.push([threadId, turnId]);
    return {};
  }
  async close(): Promise<void> { this.closed = true; }
}

function jobRequest(scopeIds = ["scene-1"]): AgentJobRequest {
  return {
    projectId: "project-1",
    stage: "script.primary",
    scopeIds,
    skill: { id: "writer", version: "1.0.0", path: "/skills/writer/SKILL.md", contentHash: "a".repeat(64) },
    provider: "local-codex",
    model: "gpt-5.6-sol",
    effort: "medium",
    upstreamRevisions: ["revision-1"],
    prompt: "Improve the selected scene.",
    outputSchema: { type: "object" },
  };
}

describe("Agent job manager", () => {
  it("enforces one writer per stage and overlapping scope, streams, and validates completion", async () => {
    const client = new FakeJobClient();
    let counter = 0;
    const manager = new AgentJobManager({ clientFactory: () => client, idFactory: () => `job-${++counter}` });
    const first = await manager.start(jobRequest());
    await expect(manager.start(jobRequest())).rejects.toThrow(/already writing/);
    const stream = new Promise<{ method: string }>((resolve) => manager.once("stream", resolve));
    await new Promise((resolve) => setImmediate(resolve));
    client.emit("notification", "item/updated", { text: "thinking" });
    await expect(stream).resolves.toMatchObject({ method: "item/updated" });
    const terminal = manager.waitForTerminal(first.id, 1_000);
    client.emit("notification", "item/completed", {
      threadId: "thread-1",
      turnId: "turn-1",
      item: {
        type: "agentMessage",
        text: JSON.stringify({
          summary: "Updated one scene.",
          operations: [{ op: "patch", entityType: "Scene", entityId: "scene-1", baseRevision: "revision-1", payload: { title: "New" } }],
        }),
      },
    });
    client.emit("notification", "turn/completed", {
      threadId: "thread-1",
      turn: { id: "turn-1", status: "completed", items: [] },
    });
    await expect(terminal).resolves.toMatchObject({ status: "completed" });
    expect(manager.get(first.id)?.status).toBe("completed");
    expect(manager.get(first.id)?.summary).toBe("Updated one scene.");
    expect(manager.get(first.id)?.result).toHaveLength(1);
    await expect(manager.start(jobRequest())).resolves.toMatchObject({ status: "running" });
  });

  it("cancels a running turn and marks unfinished persisted jobs interrupted on recovery", async () => {
    const client = new FakeJobClient();
    const manager = new AgentJobManager({ clientFactory: () => client, idFactory: () => "job-cancel" });
    const started = await manager.start(jobRequest());
    await new Promise((resolve) => setImmediate(resolve));
    const cancelled = await manager.cancel(started.id);
    expect(cancelled.status).toBe("cancelled");
    expect(client.interrupted).toEqual([["thread-1", "turn-1"]]);
    const recovered = manager.recoverInterrupted([{ ...started, status: "running" }]);
    expect(recovered[0]?.status).toBe("interrupted");
    expect(recovered[0]?.error).toMatch(/stopped/);
  });
});
