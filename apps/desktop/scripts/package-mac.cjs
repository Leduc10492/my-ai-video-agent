const { spawnSync } = require("node:child_process");
const { copyFileSync, mkdirSync, mkdtempSync, readdirSync, rmSync } = require("node:fs");
const { tmpdir } = require("node:os");
const { join, resolve } = require("node:path");

const appDirectory = resolve(__dirname, "..");
const releaseDirectory = resolve(appDirectory, "..", "..", "release");
const temporaryOutput = mkdtempSync(join(tmpdir(), "ai-director-release-"));
const passthrough = process.argv.slice(2);
const targets = passthrough.filter((argument) => !argument.startsWith("-"));
const options = passthrough.filter((argument) => argument.startsWith("-"));
const builderArguments = [
  "exec",
  "electron-builder",
  "--mac",
  ...targets,
  "--publish",
  "never",
  `--config.directories.output=${temporaryOutput}`,
  ...options
];

if (process.env.AI_DIRECTOR_SIGN_IDENTITY) {
  builderArguments.push(`--config.mac.identity=${process.env.AI_DIRECTOR_SIGN_IDENTITY}`);
}

try {
  const result = spawnSync("pnpm", builderArguments, {
    cwd: appDirectory,
    env: { ...process.env, COPYFILE_DISABLE: "1" },
    stdio: "inherit"
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`electron-builder 退出，状态码 ${result.status ?? 1}。`);

  mkdirSync(releaseDirectory, { recursive: true });
  const artifacts = readdirSync(temporaryOutput, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.(?:dmg|zip|blockmap|ya?ml)$/i.test(entry.name));
  for (const artifact of artifacts) {
    copyFileSync(join(temporaryOutput, artifact.name), join(releaseDirectory, artifact.name));
  }
  process.stdout.write(`已生成 ${artifacts.length} 个 macOS 构建产物到 ${releaseDirectory}\n`);
} finally {
  if (process.env.AI_DIRECTOR_KEEP_PACKAGE_TEMP !== "1") {
    rmSync(temporaryOutput, { recursive: true, force: true });
  } else {
    process.stdout.write(`保留临时构建目录：${temporaryOutput}\n`);
  }
}
