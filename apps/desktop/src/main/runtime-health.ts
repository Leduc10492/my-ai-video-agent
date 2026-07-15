import { access } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { RuntimeHealthDto } from "../shared/ipc";
import { CredentialVault } from "./credential-vault";

const execFileAsync = promisify(execFile);
const BUNDLED_CODEX = "/Applications/ChatGPT.app/Contents/Resources/codex";

async function canAccess(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export async function resolveCodexExecutable(): Promise<string | null> {
  if (process.env.AI_DIRECTOR_CODEX_PATH && await canAccess(process.env.AI_DIRECTOR_CODEX_PATH)) {
    return process.env.AI_DIRECTOR_CODEX_PATH;
  }
  if (await canAccess(BUNDLED_CODEX)) return BUNDLED_CODEX;
  try {
    const { stdout } = await execFileAsync("/usr/bin/which", ["codex"], { timeout: 2_000 });
    const path = stdout.trim();
    return path && await canAccess(path) ? path : null;
  } catch {
    return null;
  }
}

export async function readRuntimeHealth(vault: CredentialVault): Promise<RuntimeHealthDto> {
  const executablePath = await resolveCodexExecutable();
  let version: string | undefined;
  let loggedIn = false;
  let message: string | undefined;
  if (executablePath) {
    try {
      const versionResult = await execFileAsync(executablePath, ["--version"], { timeout: 3_000 });
      version = versionResult.stdout.trim().replace(/^codex-cli\s+/i, "");
      const loginResult = await execFileAsync(executablePath, ["login", "status"], { timeout: 3_000 });
      loggedIn = /logged in/i.test(`${loginResult.stdout}\n${loginResult.stderr}`);
      if (!loggedIn) message = "Codex 已安装，但尚未登录 ChatGPT。";
    } catch (error) {
      message = error instanceof Error ? error.message : "无法读取 Codex 状态。";
    }
  } else {
    message = "未找到本机 Codex。可以安装/登录 Codex，或配置 OpenAI API Key。";
  }

  const configured = await vault.has();
  const metadata = await vault.readMetadata();
  return {
    codex: {
      installed: Boolean(executablePath),
      executablePath: executablePath ?? undefined,
      version,
      loggedIn,
      defaultModel: "gpt-5.6-sol",
      defaultEffort: "medium",
      message
    },
    apiKey: {
      configured,
      lastTestedAt: metadata.lastTestedAt,
      status: configured ? metadata.status : "not-configured",
      message: configured ? metadata.message : "未配置 OpenAI API Key。"
    }
  };
}
