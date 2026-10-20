import fs from "node:fs";
import path from "node:path";
import { atomic, check, id, now, sha } from "./files.mjs";
import { registrySkills, registryText, skillInputs, skillStages } from "./skill-settings.mjs";
import { platformRoot, defaultWorkspaceRoot, defaultTemplateRoot, defaultDataDir } from "./installation.mjs";
import { createFilmLayout, projectManifestFile, projectLayout, portableInstructions } from "../../.agents/project-layout.mjs";

export { platformRoot, defaultWorkspaceRoot, defaultDataDir };
const json = file => JSON.parse(fs.readFileSync(file, "utf8"));
const inside = (root, target) => target === root || target.startsWith(root + path.sep);
const quote = value => `'${value.replaceAll("'", "'\\''")}'`;
function copyTemplateTree(source, target, ancestors = new Set()) {
  const real = fs.realpathSync(source);
  check(!ancestors.has(real), "项目模板包含循环链接");
  const stat = fs.statSync(real);
  if (stat.isDirectory()) {
    fs.mkdirSync(target, { recursive: true });
    const parents = new Set([...ancestors, real]);
    for (const name of fs.readdirSync(real)) copyTemplateTree(path.join(real, name), path.join(target, name), parents);
  } else {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(real, target, fs.constants.COPYFILE_EXCL);
  }
}

export function projectFolder(name) {
  check(typeof name === "string" && name.trim() && name.trim().length <= 120,
    "请填写项目名称（最多 120 字）");
  const value = name.trim();
  check(!/[\\/\x00-\x1f]/.test(value) && ![".", ".."].includes(value),
    "项目名称不能包含路径分隔符或控制字符");
  return value;
}

const bridge = `
<!-- workbench-project-context -->
## 工作台与 Codex 创作

- 本文件所在目录是独立视频项目根目录。先读取 \`project.json\` 确认项目身份；对话一旦绑定本项目，不随平台页面切换到其他项目。
- 每个创作阶段开始前重新读取本项目 \`.agents/skill_registry.md\`，按表中精确路径加载 Skill；不要沿用聊天中记住的旧配置或父目录模板。
- 对项目绑定 Skill，同时读取入口和入口的 source 链接。只有本轮确实已提供原 Skill 全文时才跳过重复读取；“已随入口注入”不能作为普通对话已收到原文的证据。
- 创作前核对 \`deliverables/0_admin/workflow_state.json\`，使用准确的工作稿或已确认生产版本。用户只授权一个阶段时，不继续生成媒体或执行后续阶段。
- 外部对话产生的分镜和资产需要按本项目文件契约保存，并在工作台载入或导入；不要直接改写 SQLite，也不要把聊天输出宣称为已载入、已接受或已生成媒体。
<!-- /workbench-project-context -->
`;

export function ensureProjectFiles(project, { template = defaultTemplateRoot } = {}) {
  const file = projectManifestFile(project.root);
  if (fs.existsSync(file)) {
    const manifest = json(file);
    check(manifest.format === 1 && manifest.kind === "video-project", "不是受支持的视频项目");
    check(manifest.project_id === project.project_id, "项目身份与工作区索引不一致", 409);
  } else {
    atomic(file, {
      format: 1, kind: "video-project", project_id: project.project_id,
      name: project.name, created_at: project.created_at,
    });
  }
  const agents = path.join(project.root, "AGENTS.md");
  const original = fs.existsSync(agents)
    ? fs.readFileSync(agents, "utf8")
    : fs.readFileSync(fs.existsSync(path.join(template, "project-template.json"))
      ? path.join(template, "AGENTS.md") : path.join(template, "workbench/templates/video-project/AGENTS.md"), "utf8");
  if (!original.includes("<!-- workbench-project-context -->")) {
    const content = original.trimEnd() + "\n" + bridge;
    atomic(agents, projectLayout(project.root) ? portableInstructions(content).replaceAll("`project.json`", "`.project/project.json`") : content, fs.existsSync(agents));
  }
}

export function projectContext(project) {
  const root = fs.realpathSync(project.root);
  const registry = path.join(root, ".agents/skill_registry.md");
  const skills = registrySkills(root).map(skill => {
    let inputs = [], error = skill.error || null;
    try {
      check(skill.available, "Skill 入口缺失");
      inputs = skillInputs([skill]);
    } catch (e) { error = e.message; }
    return {
      slot: skill.slot,
      label: skillStages.find(stage => stage.slot === skill.slot)?.label || skill.slot,
      name: skill.display_name || skill.name,
      path: skill.path, sha256: skill.sha256,
      inputs, error,
    };
  });
  const prompt = [
    `本次创作绑定视频项目「${project.name}」。`,
    `项目根目录：${root}`,
    `项目 ID：${project.project_id}`,
    `先读取 ${path.join(root, "AGENTS.md")} 和 ${projectManifestFile(root)}。`,
    `每个阶段开始前重新读取 ${registry}，按最新映射加载对应 Skill；项目绑定入口及其 source 指向的完整 Skill 都需要读取，除非本轮已经提供全文。`,
    "本对话保持绑定该项目；其他窗口切换项目不改变本对话的创作目标。切换目标必须由我明确提出。",
    "按 workflow_state.json 核对输入版本，只完成我指定的阶段。保留文件名、真实 tag、对白和旧版本；未确认的生产状态不得自动通过。",
    "产物按本项目契约保存。需要显示在工作台的资产或分镜，说明并完成相应载入；不要直接修改 SQLite。",
    "",
    "我接下来要做：",
  ].join("\n");
  return {
    project_id: project.project_id, name: project.name, root,
    registry, registry_sha256: sha(registryText(root)),
    skills, prompt, command: `codex --cd ${quote(root)}`,
  };
}

export class Workspace {
  constructor({
    root = defaultWorkspaceRoot, dataDir = path.join(root, ".workbench"),
    projectsRoot, initialRoot = null, template = defaultTemplateRoot,
    legacyIndex = root === platformRoot ? path.join(platformRoot, "workbench/.local/projects.json") : null,
  } = {}) {
    this.root = fs.realpathSync(root);
    this.dataDir = path.resolve(dataDir);
    this.template = template;
    this.indexFile = path.join(this.dataDir, "projects.json");
    this.stateFile = path.join(this.dataDir, "workspace.json");
    fs.mkdirSync(this.dataDir, { recursive: true });
    this.state = fs.existsSync(this.stateFile)
      ? json(this.stateFile)
      : { format: 1, active_project_id: null, revision: 0 };
    check(this.state.format === 1, "不支持的工作区格式");
    this.projectsRoot = path.resolve(this.root, projectsRoot || this.state.projects_directory || "projects");
    fs.mkdirSync(this.projectsRoot, { recursive: true });
    this.projects = fs.existsSync(this.indexFile) ? json(this.indexFile).map(p => ({ ...p, root: path.resolve(this.root, p.root) })) : [];
    // Preserve the existing index until the explicit, verified migration runs.
    if (!fs.existsSync(this.indexFile) && legacyIndex && fs.existsSync(legacyIndex)) {
      this.projects = json(legacyIndex);
      this.legacyIndex = legacyIndex;
    }
    check(Array.isArray(this.projects), "项目索引格式错误");
    if (!this.projects.length && initialRoot) {
      const canonical = fs.realpathSync(initialRoot);
      const manifest = projectManifestFile(canonical);
      const saved = fs.existsSync(manifest) ? json(manifest) : null;
      this.projects.push({
        project_id: saved?.project_id || id(), name: saved?.name || path.basename(canonical),
        root: canonical, created_at: saved?.created_at || now(),
      });
    }
    this.persist();
  }

  persist() {
    atomic(this.indexFile, this.projects.map(p => this.state.portable && inside(this.root, p.root)
      ? { ...p, root: path.relative(this.root, p.root) } : p), true);
    this.state.projects_directory = path.relative(this.root, this.projectsRoot) || ".";
    atomic(this.stateFile, this.state, true);
  }

  get(projectId) {
    const project = this.projects.find(project => project.project_id === projectId);
    check(project, "项目不存在", 404);
    return project;
  }

  snapshot() {
    return {
      root: this.root, projects_root: this.projectsRoot,
      active_project_id: this.state.active_project_id,
      revision: this.state.revision,
      active_project: this.projects.find(p => p.project_id === this.state.active_project_id) || null,
    };
  }

  select(projectId) {
    const project = this.get(projectId);
    check(fs.existsSync(path.join(project.root, ".agents/skill_registry.md")),
      "项目目录或 Skill Registry 不存在，请重新打开该项目", 409);
    this.state.active_project_id = projectId;
    this.state.revision++;
    this.state.selected_at = now();
    // This is only an entry point for an unbound conversation, never a running task's cwd.
    atomic(path.join(this.dataDir, "active-project.json"), {
      format: 1, project_id: project.project_id, name: project.name,
      root: this.state.portable ? path.relative(this.root, project.root) : fs.realpathSync(project.root),
      registry: this.state.portable ? path.join(path.relative(this.root, project.root), ".agents/skill_registry.md") : path.join(fs.realpathSync(project.root), ".agents/skill_registry.md"),
      selected_at: this.state.selected_at,
    }, true);
    this.persist();
    return this.snapshot();
  }

  add(input) {
    const mode = input.mode || (input.root ? "open" : "create");
    check(["open", "create"].includes(mode), "请选择新建或打开项目");
    let root, manifest, name;
    if (mode === "open") {
      check(typeof input.root === "string" && path.isAbsolute(input.root) && fs.existsSync(input.root),
        "请输入已存在的视频项目文件夹的绝对路径");
      root = fs.realpathSync(input.root);
      check(root !== this.root && root !== fs.realpathSync(this.template),
        "这是平台工作区，请打开 projects 下的具体视频项目");
      const previous = this.projects.find(p => fs.existsSync(p.root) && fs.realpathSync(p.root) === root);
      if (previous) return previous;
      check(!this.projects.some(p => {
        if (!fs.existsSync(p.root)) return false;
        const other = fs.realpathSync(p.root);
        return other !== this.root && (inside(other, root) || inside(root, other));
      }), "视频项目之间不能互相嵌套，请选择独立根目录");
      check(fs.existsSync(path.join(root, ".agents/skill_registry.md")), "所选文件夹没有项目 Skill Registry");
      if (fs.existsSync(projectManifestFile(root))) {
        manifest = json(projectManifestFile(root));
        check(manifest.format === 1 && manifest.kind === "video-project", "不是受支持的视频项目");
      }
      name = projectFolder(manifest?.name || input.name || path.basename(root));
    } else {
      name = projectFolder(input.name);
      check(!input.root || (typeof input.root === "string" && path.isAbsolute(input.root)),
        "项目保存位置需要绝对路径");
      root = path.resolve(input.root || path.join(this.projectsRoot, name));
      check(!fs.existsSync(root), "目标文件夹已存在，请使用「打开已有项目」或选择其他位置", 409);
      // Resolve the nearest existing parent before checking aliases into another project.
      let ancestor = path.dirname(root);
      while (!fs.existsSync(ancestor)) ancestor = path.dirname(ancestor);
      root = path.join(fs.realpathSync(ancestor), path.relative(ancestor, root));
      check(!inside(path.join(this.root, "workbench"), root) && !inside(this.dataDir, root),
        "请选择 projects 下或其他独立文件夹，不能存进平台程序与运行目录");
      check(!this.state.portable || (!inside(this.template, root) && !inside(path.join(this.root, "00_工作流"), root)),
        "视频项目应与 00_工作流 并列，不能存进工作流目录");
      check(!this.projects.some(p => fs.existsSync(p.root) &&
        inside(fs.realpathSync(p.root), root) && fs.realpathSync(p.root) !== this.root),
      "不能在另一个视频项目内部新建项目");
      fs.mkdirSync(root, { recursive: true });
    }
    const project = {
      project_id: manifest?.project_id || id(), name, root,
      created_at: manifest?.created_at || now(),
    };
    check(!this.projects.some(p => p.project_id === project.project_id),
      "该项目 ID 已登记在另一位置，请先核对是否复制了同一个项目", 409);
    try {
      if (mode === "create") {
        copyTemplateTree(path.join(this.template, ".agents"), path.join(root, ".agents"));
        if (fs.existsSync(path.join(this.template, ".codex")))
          copyTemplateTree(path.join(this.template, ".codex"), path.join(root, ".codex"));
        if (this.state.portable) createFilmLayout(root);
        else for (const stage of ["0_admin", "1_story", "2_assets", "3_shotlist", "4_edit"])
          fs.mkdirSync(path.join(root, "deliverables", stage), { recursive: true });
      }
      ensureProjectFiles(project, { template: this.template });
      this.projects.push(project);
      this.persist();
      return project;
    } catch (error) {
      const added = this.projects.findIndex(p => p.project_id === project.project_id);
      if (added >= 0) this.projects.splice(added, 1);
      if (mode === "create") fs.rmSync(root, { recursive: true, force: true });
      throw error;
    }
  }
}
