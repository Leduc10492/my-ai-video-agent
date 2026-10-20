import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { platformRoot, defaultWorkspaceRoot, installation } from "../server/installation.mjs";

const runtime = path.join(platformRoot, "runtime", `${process.platform}-${process.arch}`);
process.env.PATH = [runtime, path.join(process.env.HOME || "", ".local/bin"), "/opt/homebrew/bin", "/usr/local/bin", process.env.PATH].filter(Boolean).join(path.delimiter);
for (const [variable, file] of [["FFMPEG_PATH", "ffmpeg"], ["FFPROBE_PATH", "ffprobe"], ["TWICK_BROWSER", "browser/chrome-headless-shell"]]) {
  if (!process.env[variable] && fs.existsSync(path.join(runtime, file))) process.env[variable] = path.join(runtime, file);
}
if (!process.env.CODEX_BIN) {
  const candidates = ["/Applications/ChatGPT.app/Contents/Resources/codex-cli/CodexCLI.app/Contents/MacOS/codex", "/Applications/Codex.app/Contents/Resources/codex"];
  const binary = candidates.find(file => fs.existsSync(file));
  if (binary) process.env.CODEX_BIN = binary;
}
const port = Number(process.env.PORT || installation?.port || 4310), url = `http://127.0.0.1:${port}`;
const open = () => {
  if (process.platform === "darwin" && process.env.WORKBENCH_NO_OPEN !== "1")
    spawn("open", [url], { stdio: "ignore" }).unref();
};
let existing;
try {
  const response = await fetch(`${url}/api/workspace`, { signal: AbortSignal.timeout(1200) });
  if (response.ok) existing = await response.json();
} catch {}
if (existing) {
  if (path.resolve(existing.root) !== defaultWorkspaceRoot) {
    console.error(`端口 ${port} 正由另一个工作区使用：${existing.root}\n先关闭它，或设置 PORT 使用其他端口。本次没有修改或关闭其他工作区。`);
    process.exitCode = 1;
  } else { console.log(`工作台已运行：${url}`); open(); }
} else {
  const { createApp } = await import("../server/app.mjs");
  const { app } = await createApp();
  await app.listen({ host: "127.0.0.1", port });
  console.log(`工作区：${defaultWorkspaceRoot}\n工作台：${url}\n关闭此窗口或按 Ctrl+C 可停止服务。`);
  open();
  for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, async () => {
    await app.close(); process.exit(0);
  });
}
