#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { platformRoot } from "../server/installation.mjs";
import { atomic, check, sha, walk } from "../server/files.mjs";
import { copyVideoProject, adaptProjectRules } from "../server/portable-project.mjs";

const args = process.argv.slice(2);
const option = key => args.includes(key) ? args[args.indexOf(key) + 1] : null;
const destination = option("--destination"), update = args.includes("--update");
check(destination && path.isAbsolute(destination), "用法：node workbench/scripts/publish-workspace.mjs --destination <总文件夹绝对路径> [--project <项目ID>] [--update]");
const root = path.resolve(destination);
check(!root.startsWith(platformRoot + path.sep) && root !== platformRoot, "正式目录需要独立于开发 checkout");
check(update ? fs.existsSync(path.join(root, ".workbench/workspace.json")) : !fs.existsSync(root),
  update ? "没有可更新的正式工作区" : "目标总文件夹已存在，不覆盖；更新时使用 --update");
if (update) {
  try {
    const config = JSON.parse(fs.readFileSync(path.join(root, "00_工作流/工作台/installation.json"), "utf8"));
    const response = await fetch(`http://127.0.0.1:${process.env.PORT || config.port || 4310}/api/workspace`, { signal: AbortSignal.timeout(1000) });
    const running = await response.json();
    check(running.root !== root, "请先关闭正式工作台，再执行更新");
  } catch (error) { if (error.statusCode) throw error; }
}
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const stage = path.join(root, ".workbench", `release-${stamp}`);
fs.mkdirSync(stage, { recursive: true });
const flow = path.join(stage, "00_工作流"), app = path.join(flow, "工作台"), template = path.join(flow, "项目模板");
const copy = (from, to) => {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.cpSync(from, to, { recursive: true, verbatimSymlinks: true, mode: fs.constants.COPYFILE_FICLONE });
};
const git = (...command) => spawnSync("git", command, { cwd: platformRoot, encoding: "utf8" }).stdout?.trim() || "";
let installed = false, oldFlow = null;
try {
  check(fs.existsSync(path.join(platformRoot, "workbench/dist/index.html")), "请先 pnpm workbench:build");
  fs.mkdirSync(app, { recursive: true }); fs.mkdirSync(template, { recursive: true });
  for (const file of ["package.json", "pnpm-lock.yaml"]) copy(path.join(platformRoot, file), path.join(app, file));
  for (const file of ["server", "scripts", "shared", "dist", "src", "public", "patches", "package.json", "pnpm-lock.yaml", "tsconfig.json", "vite.config.ts", "index.html", "README.md", "THIRD_PARTY.md", "templates"]) {
    const from = path.join(platformRoot, "workbench", file);
    if (fs.existsSync(from)) copy(from, path.join(app, "workbench", file));
  }
  // Dependencies and the current OS/architecture runtime are internal to the
  // package; no symbolic link points to the developer checkout.
  for (const folder of ["node_modules", "workbench/node_modules"]) {
    if (fs.existsSync(path.join(platformRoot, folder))) copy(path.join(platformRoot, folder), path.join(app, folder));
  }
  copy(path.join(platformRoot, ".agents"), path.join(template, ".agents"));
  copy(path.join(platformRoot, ".codex"), path.join(template, ".codex"));
  copy(path.join(platformRoot, "workbench/templates/video-project/AGENTS.md"), path.join(template, "AGENTS.md"));
  adaptProjectRules(template, platformRoot);
  atomic(path.join(template, "project-template.json"), { format: 1, layout: "film-v1" });
  fs.renameSync(path.join(template, ".agents/skills"), path.join(flow, "Skills"));
  copy(path.join(platformRoot, ".agents/project-layout.mjs"), path.join(flow, "project-layout.mjs"));
  fs.symlinkSync("../../Skills", path.join(template, ".agents/skills"));
  copy(path.join(template, ".agents"), path.join(app, ".agents"));
  fs.unlinkSync(path.join(app, ".agents/skills"));
  fs.symlinkSync("../../Skills", path.join(app, ".agents/skills"));
  atomic(path.join(app, "installation.json"), {
    format: 1, workspace: "../..", template: "../项目模板", skills: "../Skills", port: 4311,
  });
  const runtime = path.join(app, "runtime", `${process.platform}-${process.arch}`);
  fs.mkdirSync(runtime, { recursive: true });
  copy(process.execPath, path.join(runtime, "node"));
  for (const name of ["ffmpeg", "ffprobe"]) {
    const binary = (process.env.PATH || "").split(path.delimiter).map(d => path.join(d, name)).find(f => fs.existsSync(f));
    if (binary && process.platform === "darwin") {
      const libs = spawnSync("otool", ["-L", binary], { encoding: "utf8" }).stdout || "";
      const external = libs.split("\n").slice(1).filter(l => l.trim() && !/^\s+\/(?:System\/Library|usr\/lib)\//.test(l));
      if (!external.length) copy(fs.realpathSync(binary), path.join(runtime, name));
    }
  }
  const chrome = walk(path.join(os.homedir(), ".cache/puppeteer"), name => name === "chrome-headless-shell", 6).at(-1);
  if (chrome) copy(path.dirname(chrome), path.join(runtime, "browser"));
  const codeFiles = walk(path.join(app, "workbench/server"), () => true, 2).concat(walk(path.join(app, "workbench/dist"), () => true, 3));
  atomic(path.join(flow, "release.json"), {
    format: 1, project_layout: "film-v1", packaged_at: new Date().toISOString(),
    source_repository: git("remote", "get-url", "origin"), source_revision: git("rev-parse", "HEAD"),
    includes_uncommitted_changes: Boolean(git("status", "--porcelain")),
    runtime: `${process.platform}-${process.arch}`, node_version: process.version,
    content_sha256: sha(codeFiles.map(file => [path.relative(app, file), sha(fs.readFileSync(file))])),
  });
  // Smoke load the packaged source before replacing any installed program.
  const probe = spawnSync(path.join(runtime, "node"), ["--input-type=module", "-e",
    "await import('./workbench/server/app.mjs'); console.log('package import ok')"], { cwd: app, encoding: "utf8" });
  check(probe.status === 0, `工作台打包检查失败：${probe.stderr}`);
  const targetFlow = path.join(root, "00_工作流");
  if (update) {
    oldFlow = path.join(root, ".workbench", "更新备份", stamp, "00_工作流");
    fs.mkdirSync(path.dirname(oldFlow), { recursive: true }); fs.renameSync(targetFlow, oldFlow);
  }
  fs.renameSync(flow, targetFlow); installed = true;
  let migrated = null;
  if (!update) {
    const index = JSON.parse(fs.readFileSync(path.join(platformRoot, ".workbench/projects.json"), "utf8"));
    const state = JSON.parse(fs.readFileSync(path.join(platformRoot, ".workbench/workspace.json"), "utf8"));
    const targetId = option("--project") || state.active_project_id;
    const project = index.find(p => p.project_id === targetId);
    check(project, "没有找到需要复制的当前视频项目");
    const target = path.join(root, project.name);
    migrated = copyVideoProject(path.resolve(platformRoot, project.root), target, { runtimeRoot: platformRoot });
    atomic(path.join(root, ".workbench/projects.json"), [{ project_id: project.project_id, name: project.name, root: project.name, created_at: project.created_at }]);
    atomic(path.join(root, ".workbench/workspace.json"), { format: 1, portable: true, projects_directory: ".", revision: 1, active_project_id: project.project_id });
    atomic(path.join(root, ".workbench/active-project.json"), {
      format: 1, project_id: project.project_id, name: project.name, root: project.name, registry: `${project.name}/.agents/skill_registry.md`,
    });
    atomic(path.join(root, "AGENTS.md"), `# 我的AI视频

本目录是正式创作工作区。公共程序、Skills 和模板在 \`00_工作流/\`；每部作品与它并列。开发测试与历史备份保留在原开发区。

- 开始创作先绑定用户指定的作品，其次沿用本对话已绑定的作品；尚未绑定时运行 \`node "00_工作流/工作台/workbench/scripts/project-context.mjs"\` 获取当前项目。
- 后续使用 \`--project <项目ID或绝对路径>\` 重新读取实时配置；其他窗口切换不改变已绑定目标。
- 读取作品的 \`AGENTS.md\`、\`.project/project.json\` 和 \`.agents/skill_registry.md\`，每阶段按精确路径加载入口与 source Skill。
- 六类目录由项目契约指定。只完成用户授权的阶段，保留文件名、真实 tag、对白、旧版本及人的创作决定权。
- 根目录 \`.workbench/\` 保存相对路径索引；不要把复制前的绝对路径写入执行配置。整个目录可移动；通过启动入口使用当前位置。
- 更新公共工作流使用经过验证的发布包；项目内的 Skills 与生产状态不自动升级。参见 \`使用说明.md\`。
`);
  }
  const shell = `#!/bin/zsh
set -eu
workspace_dir="$(cd "$(dirname "$0")" && pwd)"
machine_arch="$(uname -m)"
[[ "$machine_arch" = "x86_64" ]] && machine_arch="x64"
node_bin="$workspace_dir/00_工作流/工作台/runtime/darwin-$machine_arch/node"
if [[ ! -x "$node_bin" ]]; then
  node_bin="$(command -v node || true)"
fi
if [[ -z "$node_bin" ]]; then
  echo "当前电脑缺少 Node.js 24 或更新版本，请先安装。"
  read "?按回车关闭"; exit 1
fi
cd "$workspace_dir"
exec "$node_bin" "$workspace_dir/00_工作流/工作台/workbench/scripts/launch.mjs"
`;
  atomic(path.join(root, "启动工作台.command"), shell, true); fs.chmodSync(path.join(root, "启动工作台.command"), 0o755);
  atomic(path.join(root, "使用说明.md"), `# 我的AI视频

双击 **启动工作台.command**。保持启动窗口打开；按 Ctrl+C 可停止。正式版默认地址 http://127.0.0.1:4311/ ，与开发版 4310 分开。如另一个正式副本占用端口，先关闭它或设置 PORT；程序不会擅自关闭其他工作区。

每部作品与 00_工作流 并列。作品内容分为 01_剧本、02_资产、03_分镜、04_镜头、05_剪辑、06_导出。工作台中新建项目会自动建立这些目录。

## 复制、搬迁与备份

- 先停止工作台，再完整复制“我的AI视频”，包括隐藏目录。Finder 整体复制会保留隐藏文件；不要只挑选六个可见目录。
- 在这台 Mac 上复制到其他位置可直接启动。当前发布包附带 ${process.platform}-${process.arch} 的 Node、可用的 FFmpeg/ffprobe 和渲染浏览器，以及程序依赖。
- 其他操作系统或不同芯片的电脑需要 Node.js 24+、pnpm 和对应平台依赖；在 00_工作流/工作台/workbench 运行 pnpm install --frozen-lockfile，并配置 FFmpeg/ffprobe、Chrome Headless Shell。不能把本机二进制当作跨系统安装包。
- Codex、Higgsfield 的安装、登录和服务权限属于各台电脑，不能靠复制项目获得。没有这些连接时仍可浏览已有文件，AI 创作及生成需要连接。
- 相对路径索引按当前位置解析。已经打开的旧 Codex 对话及外部剪辑软件若记住旧绝对路径，需要重新打开新项目根目录或重连媒体。
- 不把同一个副本同时当作两个地方同步写入的项目；这些是独立副本。

## 更新工作台

GitHub 更新在开发仓库进行，不在作品总目录执行 git pull。先在开发仓库切到需要的已发布版本并保留未提交修改，运行验证和构建，再执行：

\`\`\`sh
pnpm workbench:build
node workbench/scripts/publish-workspace.mjs --destination "/你的路径/我的AI视频" --update
\`\`\`

更新前关闭正式工作台。该命令仅替换 00_工作流；旧程序和公共 Skills 自动保存到 .workbench/更新备份/。已有作品、项目 Skill 快照、ID、素材和时间轴不变。项目采用新版 Skill 仍通过项目设置检查后保存。

当前发布可能包含尚未提交的开发修改，版本信息见 00_工作流/release.json；git pull 本身不会获得这些未发布改动。
`, true);
  fs.rmSync(stage, { recursive: true, force: true });
  console.log(JSON.stringify({ root, update, backup: oldFlow, migrated }, null, 2));
} catch (error) {
  if (update && oldFlow) {
    if (installed) fs.rmSync(path.join(root, "00_工作流"), { recursive: true, force: true });
    fs.renameSync(oldFlow, path.join(root, "00_工作流"));
  } else if (!update) {
    fs.rmSync(root, { recursive: true, force: true });
  }
  if (fs.existsSync(stage)) fs.rmSync(stage, { recursive: true, force: true });
  throw error;
}
