# Agent runtime

Main-process-only runtime for the local Codex App Server. Do not import this package from the Electron renderer.

## Launch

```ts
const binary = await resolveCodexBinary();
const launch = provider === "local-codex"
  ? buildLocalCodexLaunchConfig({ binary, cwd: runDirectory })
  : buildByokCodexLaunchConfig({ binary, cwd: runDirectory, codexHome });
const client = CodexAppServerClient.launch(launch);
```

For the API-key channel, create the isolated home with `prepareIsolatedCodexHome`, retrieve the safeStorage-encrypted key only in Electron main, then call `client.loginWithApiKey(key)`. The BYOK launch pins `cli_auth_credentials_store="keyring"`, so Codex does not fall back to plaintext `auth.json`. Passing `apiKey` to `buildByokCodexLaunchConfig` is supported for headless environments but should not be used as a renderer-to-main transport.

`CodexAppServerClient` exposes `initialize`, `accountRead`, `loginWithApiKey`, `modelList`, `skillsList`, `setExtraSkillRoots`, `threadStart`, `turnStart`, `interruptTurn`, and `close`. It emits `notification`, `serverRequest`, `diagnostic`, `protocolError`, and `closed`.

## Jobs

Create `AgentJobManager` with a provider-aware `clientFactory`. Call `start`, subscribe to `job` and `stream`, and use `waitForTerminal` or `cancel`. `recoverInterrupted` converts persisted queued/running jobs to interrupted after an app restart. Locks are enforced for every `stage:scopeId` pair.

The generic `DRAFT_OPERATIONS_OUTPUT_SCHEMA` produces `{ summary, operations }`. Production stages should pass a stricter entity-specific output schema. `validateDraftResult` preserves the summary, while `validateDraftOperations` is the compatibility helper that returns only operations.

## Protocol notes

- Current App Server stdio uses newline-delimited JSON; the parser also accepts `Content-Length` frames.
- Runtime workspace roots require `experimentalApi: true` during initialization.
- Structured results arrive in the completed `agentMessage` item; `turn/completed` carries terminal status. The job manager joins both events.
- The local launch explicitly uses `gpt-5.6-sol`, medium reasoning, and the default (non-priority) service tier unless overridden.
- The local channel removes exported API keys so it keeps the existing ChatGPT login. The BYOK channel uses an isolated `CODEX_HOME`.
