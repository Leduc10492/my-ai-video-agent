import type { SpawnOptionsWithoutStdio } from "node:child_process";
import { access, mkdir } from "node:fs/promises";
import path from "node:path";
import { DEFAULT_REASONING_EFFORT, DEFAULT_TEXT_MODEL, type ReasoningEffort } from "./contracts.js";

export interface AppServerLaunchConfig {
  command: string;
  args: string[];
  options: SpawnOptionsWithoutStdio;
  secretEnvironmentKeys: string[];
}

export interface LocalLaunchOptions {
  binary?: string;
  model?: string;
  effort?: ReasoningEffort;
  cwd?: string;
  env?: NodeJS.ProcessEnv;
}

const SAFE_ENVIRONMENT_KEYS = new Set([
  "PATH", "HOME", "USER", "LOGNAME", "SHELL",
  "TMPDIR", "TMP", "TEMP", "LANG", "LC_ALL", "TZ",
  "SSL_CERT_FILE", "SSL_CERT_DIR", "NODE_EXTRA_CA_CERTS", "NO_PROXY",
  "CODEX_HOME"
]);

function minimalEnvironment(source: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = {};
  for (const [key, value] of Object.entries(source)) {
    if (!value) continue;
    if (SAFE_ENVIRONMENT_KEYS.has(key) || key.startsWith("LC_")) env[key] = value;
  }
  return env;
}

function appServerArgs(
  model: string,
  effort: ReasoningEffort,
  additionalConfig: readonly [key: string, value: string][] = [],
): string[] {
  return [
    "-c",
    `model=${JSON.stringify(model)}`,
    "-c",
    `model_reasoning_effort=${JSON.stringify(effort)}`,
    "-c",
    'service_tier="default"',
    ...additionalConfig.flatMap(([key, value]) => ["-c", `${key}=${JSON.stringify(value)}`]),
    "app-server",
  ];
}

export function buildLocalCodexLaunchConfig(options: LocalLaunchOptions = {}): AppServerLaunchConfig {
  const model = options.model ?? DEFAULT_TEXT_MODEL;
  const effort = options.effort ?? DEFAULT_REASONING_EFFORT;
  const env = minimalEnvironment(options.env ?? process.env);
  // The local channel must preserve the user's existing ChatGPT login rather than
  // silently changing the billing source because a shell happened to export a key.
  delete env.OPENAI_API_KEY;
  delete env.CODEX_API_KEY;
  return {
    command: options.binary ?? "codex",
    args: appServerArgs(model, effort),
    options: {
      cwd: options.cwd,
      env,
    },
    secretEnvironmentKeys: [],
  };
}

export interface ByokLaunchOptions extends LocalLaunchOptions {
  codexHome: string;
  apiKey?: string;
}

export function buildByokCodexLaunchConfig(options: ByokLaunchOptions): AppServerLaunchConfig {
  if (!path.isAbsolute(options.codexHome)) throw new Error("BYOK CODEX_HOME must be an absolute path.");
  const env: NodeJS.ProcessEnv = { ...minimalEnvironment(options.env ?? process.env), CODEX_HOME: options.codexHome };
  const secretEnvironmentKeys: string[] = [];
  if (options.apiKey) {
    env.OPENAI_API_KEY = options.apiKey;
    secretEnvironmentKeys.push("OPENAI_API_KEY");
  }
  return {
    command: options.binary ?? "codex",
    args: appServerArgs(
      options.model ?? DEFAULT_TEXT_MODEL,
      options.effort ?? DEFAULT_REASONING_EFFORT,
      [["cli_auth_credentials_store", "keyring"]],
    ),
    options: { cwd: options.cwd, env },
    secretEnvironmentKeys,
  };
}

export function redactLaunchConfig(config: AppServerLaunchConfig): Record<string, unknown> {
  const env = { ...(config.options.env ?? {}) } as Record<string, string | undefined>;
  const keys = new Set([
    ...config.secretEnvironmentKeys,
    ...Object.keys(env).filter((key) => /(?:api[_-]?key|token|secret|password|credential)/i.test(key)),
  ]);
  for (const key of keys) if (key in env) env[key] = "[REDACTED]";
  return { command: config.command, args: [...config.args], options: { ...config.options, env }, secretEnvironmentKeys: [...config.secretEnvironmentKeys] };
}

export async function resolveCodexBinary(candidates: readonly string[] = []): Promise<string> {
  const possible = [
    ...candidates,
    process.env.CODEX_BINARY,
    "/Applications/ChatGPT.app/Contents/Resources/codex",
    "codex",
  ].filter((candidate): candidate is string => Boolean(candidate));
  for (const candidate of possible) {
    if (!path.isAbsolute(candidate)) return candidate;
    try {
      await access(candidate);
      return candidate;
    } catch {
      // Continue to the next well-known installation location.
    }
  }
  throw new Error("Codex CLI was not found. Install or open ChatGPT, or configure the Codex binary path.");
}

export async function prepareIsolatedCodexHome(codexHome: string): Promise<string> {
  if (!path.isAbsolute(codexHome)) throw new Error("BYOK CODEX_HOME must be an absolute path.");
  await mkdir(codexHome, { recursive: true, mode: 0o700 });
  return codexHome;
}
