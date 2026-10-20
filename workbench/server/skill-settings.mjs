import fs from "node:fs";
import path from "node:path";
import { atomic, check, contained, id, now, sha } from "./files.mjs";

export const skillStages = [
  {
    slot: "script.primary",
    label: "剧本创作",
    description: "创作 / 改写入口；审核时也会使用。",
    contract: "返回剧本 Markdown 产物，保留本地剧本版本与原文边界。",
  },
  {
    slot: "story.mckee_router",
    label: "剧本审核",
    description: "与剧本 Skill 配合，提供结构审阅与问题清单。",
    contract: "只返回审计和修订建议，由剧本阶段保存同版本审核报告。",
  },
  {
    slot: "guides.primary",
    label: "资产拆分",
    description: "角色、场景、道具与风格资料。",
    contract:
      "按 outputSchema 返回 assets、style、continuity_rules 和 open_gaps；服务保存 Markdown/JSON。保留标准文件名与真实 tag。",
  },
  {
    slot: "shotlist.breakdown",
    label: "分镜设计",
    description: "Scene、镜头设计和生成片段编组。",
    contract:
      "按 outputSchema 返回本场 Shot Rows、Envelope 编组、空间和连续性设计；服务分配编号并增量合并。不编译 Prompt 或生成媒体。",
  },
  {
    slot: "shotlist.prompt_compiler",
    label: "视频 Prompt",
    description: "把已确认的镜头编组编译为生成 Prompt。",
    contract:
      "COMPILE MODE：每个已批准 Envelope 对应一段独立中文 Prompt；保留时长、镜头、台词、真实 tag 和首尾状态。不得改写上游设计或装配 HTML。",
  },
  {
    slot: "shotlist.html_assembler",
    label: "生产 HTML",
    description: "整理既有分镜、Prompt 和素材引用。",
    contract:
      "只装配已有设计与编译结果，保持 Scene → Shot Row → Prompt Envelope 映射，Prompt 原文不重写。",
  },
];
const bindingFile = "workbench-binding.json";
const adapterVersion = 1;
function stageAdapter(slot) {
  if (slot === "shotlist.prompt_compiler")
    return "\n## Source And Language Override\n\n- Prompt content only: compiler owns the generation Prompt payload; artifact metadata stays outside that payload.\n- **Simplified Chinese prompts only.** Preserve exact dialogue, attached tags and approved control strings.\n- The current project's approved Scene, Shot Row and Prompt Envelope plan is authoritative.\n";
  if (slot === "shotlist.html_assembler")
    return "\n## Assembly Boundary\n\nConsume the already compiled Seedance Prompt set. Assembly preserves it byte-for-byte and keeps the six production columns and Scene → Shot Row → Prompt Envelope mapping from the project contract. Never regenerate Prompt text during HTML assembly.\n";
  return "";
}
const entryId = (file) => sha(path.resolve(file));
const inside = (root, file) =>
  file === root || file.startsWith(root + path.sep);
const read = (file) => fs.readFileSync(file, "utf8");

export function registryText(root) {
  return read(contained(root, ".agents/skill_registry.md"));
}
export function readBinding(directory) {
  const file = path.join(directory, bindingFile);
  if (!fs.existsSync(file)) return null;
  const data = JSON.parse(read(file));
  check(data.format === 1, "未知 Skill 绑定格式");
  return data;
}
export function registrySkills(root) {
  return [...registryText(root).matchAll(/^\| `([^`]+)` \| `([^`]+)`/gm)].map(
    ([, slot, name]) => {
      const file = contained(root, `.agents/skills/${name}/SKILL.md`);
      let binding = null,
        error = null;
      try {
        binding = readBinding(path.dirname(file));
      } catch (e) {
        error = e.message;
      }
      return {
        slot,
        name,
        path: file,
        available: fs.existsSync(file) && !error,
        sha256: fs.existsSync(file) ? sha(fs.readFileSync(file)) : null,
        ...(binding
          ? { display_name: binding.source.name, source: binding.source }
          : {}),
        ...(error ? { error } : {}),
      };
    },
  );
}

// Resolve immutable project snapshots at execution time, rather than following a global update.
export function skillInputs(selected) {
  return selected.flatMap((s) => {
    const binding = readBinding(path.dirname(s.path));
    if (!binding) return [{ type: "skill", name: s.name, path: s.path }];
    const root = path.dirname(s.path);
    check(binding.slot === s.slot, "Skill 绑定阶段不一致，请重新配置", 409);
    for (const f of binding.files) {
      const file = contained(root, f.path);
      check(
        fs.existsSync(file) && sha(fs.readFileSync(file)) === f.sha256,
        "项目 Skill 副本已改变，请重新检查兼容性",
        409,
      );
    }
    return [
      { type: "skill", name: s.name, path: s.path },
      {
        type: "skill",
        name: binding.source.name,
        path: contained(root, binding.entry),
      },
    ];
  });
}

function frontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  check(m, "SKILL.md 缺少有效的 frontmatter");
  const name = m[1]
    .match(/^name:\s*(.+)$/m)?.[1]
    ?.trim()
    .replace(/^["']|["']$/g, "");
  check(name && /^[\w:.-]+$/.test(name), "Skill 名称缺失或无效");
  check(/^description:\s*\S/m.test(m[1]), "Skill 缺少 description");
  return { name, body: text.slice(m[0].length) };
}

function dependencies(text) {
  const refs = new Map();
  const add = (value, required) => {
    const ref = value
      .trim()
      .replace(/^<|>$/g, "")
      .replace(/\s+["'].*$/, "")
      .split("#")[0]
      .split("?")[0];
    if (
      !ref ||
      /^(?:https?:|mailto:|data:|app:|#|\/|~)/i.test(ref) ||
      /[{}*<>$]/.test(ref)
    )
      return;
    if (/^(?:deliverables|output|outputs|archives)\//.test(ref)) return;
    refs.set(ref, required || refs.get(ref) || false);
  };
  for (const m of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) add(m[1], true);
  for (const m of text.matchAll(
    /`((?:\.\.?\/|references?\/|scripts\/|templates\/|assets\/)[^`\n]+\.(?:md|json|html|py|mjs|js|ts|png|jpg|svg))`/g,
  ))
    add(m[1], false);
  return [...refs].map(([ref, required]) => ({ ref, required }));
}

function inspectProjectFiles(root, entry) {
  const queue = [entry],
    seen = new Set(),
    files = [],
    issues = [];
  while (queue.length) {
    const file = queue.shift();
    if (seen.has(file)) continue;
    seen.add(file);
    check(seen.size <= 1000, "项目 Skill 引用文件过多，请先精简依赖");
    const safe = contained(root, path.relative(root, file)),
      content = fs.readFileSync(safe);
    files.push([path.relative(root, file), sha(content)]);
    if (!file.endsWith(".md")) continue;
    for (const { ref, required } of dependencies(content.toString("utf8"))) {
      let target = path.resolve(path.dirname(file), ref);
      if (!fs.existsSync(target) && !required)
        target = path.resolve(path.dirname(entry), ref);
      if (!fs.existsSync(target)) {
        issues.push({
          level: required ? "error" : "warning",
          text: `未找到${required ? "链接" : "文中提及的资源"}：${path.basename(file)} → ${ref}`,
        });
        continue;
      }
      if (!inside(root, target)) {
        issues.push({
          level: "error",
          text: `项目 Skill 引用了项目外文件：${ref}`,
        });
        continue;
      }
      if (fs.statSync(target).isFile()) queue.push(target);
    }
  }
  return {
    sha256: sha(files.sort((a, b) => a[0].localeCompare(b[0]))),
    issues,
  };
}

function collectBundle(candidate, catalog) {
  const roots = new Map(),
    files = new Map(),
    issues = [],
    pending = [];
  let bytes = 0;
  const knownRoots = catalog
    .filter((c) => c.enabled && fs.existsSync(c.path))
    .map((c) => fs.realpathSync(path.dirname(c.path)));
  const rootName = new Map();
  const addRoot = (directory) => {
    directory = fs.realpathSync(directory);
    if (roots.has(directory)) return;
    const name = path.basename(directory);
    check(
      !rootName.has(name) || rootName.get(name) === directory,
      `依赖目录重名：${name}，需要先适配`,
    );
    rootName.set(name, directory);
    roots.set(directory, name);
    const visit = (dir) => {
      for (const entry of fs
        .readdirSync(dir, { withFileTypes: true })
        .sort((a, b) => a.name.localeCompare(b.name))) {
        if (
          [
            ".git",
            "node_modules",
            ".venv",
            "__pycache__",
            ".DS_Store",
          ].includes(entry.name)
        )
          continue;
        const file = path.join(dir, entry.name),
          real = fs.realpathSync(file),
          stat = fs.statSync(file);
        check(
          inside(directory, real),
          `目录中有指向外部的链接：${path.relative(directory, file)}`,
        );
        if (stat.isDirectory()) {
          check(!entry.isSymbolicLink(), "不支持目录内的循环或目录软链接");
          visit(file);
        } else if (stat.isFile()) {
          bytes += stat.size;
          check(
            bytes <= 96 * 1024 * 1024 && files.size < 5000,
            "Skill 资源超过 96 MB 或 5000 个文件，请先精简资源",
          );
          const content = fs.readFileSync(file),
            relative = `source/${name}/${path.relative(directory, file)}`;
          files.set(file, {
            path: relative,
            content,
            sha256: sha(content),
            size: content.length,
            mode: stat.mode & 0o777,
          });
        }
      }
    };
    visit(directory);
    pending.push(path.join(directory, "SKILL.md"));
  };
  const primary = fs.realpathSync(path.dirname(candidate.path));
  addRoot(primary);
  const visited = new Set();
  while (pending.length) {
    const file = pending.shift();
    if (visited.has(file)) continue;
    visited.add(file);
    const owner = [...roots.keys()].find((r) => inside(r, file));
    for (const { ref, required } of dependencies(read(file))) {
      let target = path.resolve(path.dirname(file), ref);
      if (!fs.existsSync(target) && !required)
        target = path.resolve(owner, ref);
      if (!fs.existsSync(target)) {
        issues.push({
          level: required ? "error" : "warning",
          text: `未找到${required ? "链接" : "文中提及的资源"}：${path.basename(file)} → ${ref}`,
        });
        continue;
      }
      const real = fs.realpathSync(target);
      if (![...roots.keys()].some((r) => inside(r, real))) {
        const dependency = knownRoots.find((r) => inside(r, real));
        if (!dependency) {
          issues.push({
            level: "error",
            text: `依赖在 Skill 目录之外，无法固定到项目：${ref}`,
          });
          continue;
        }
        // Sibling layout is retained exactly; links to a different installation tree need adaptation.
        if (path.dirname(dependency) !== path.dirname(primary)) {
          issues.push({
            level: "error",
            text: `跨安装目录依赖需要适配：${ref}`,
          });
          continue;
        }
        addRoot(dependency);
      }
      if (real.endsWith(".md") && fs.statSync(real).isFile())
        pending.push(real);
    }
  }
  const list = [...files.values()].sort((a, b) => a.path.localeCompare(b.path));
  return {
    files: list,
    entry: `source/${path.basename(primary)}/SKILL.md`,
    bytes,
    sha256: sha(list.map(({ path, sha256, mode }) => [path, sha256, mode])),
    issues,
    dependencies: [...roots.values()].filter(
      (n) => n !== path.basename(primary),
    ),
  };
}

const related = {
  "script.primary": /screenwrit|screenplay|story|剧本|编剧|故事/i,
  "story.mckee_router": /audit|review|mckee|审核|审阅|诊断/i,
  "guides.primary":
    /asset|image|character|reference|style|资产|素材|角色|图像|图片/i,
  "shotlist.breakdown": /shotlist|storyboard|director|分镜|导演|镜头设计/i,
  "shotlist.prompt_compiler": /prompt|seedance|cinedance|视频|提示词/i,
  "shotlist.html_assembler": /html|assembl|shotlist|分镜|汇总/i,
};

export class SkillSettings {
  constructor(client) {
    this.client = client;
    this.catalogs = new Map();
    this.saving = new Set();
  }
  async catalog(root, refresh = false) {
    const cached = this.catalogs.get(root);
    if (!refresh && cached && Date.now() - cached.at < 60000)
      return cached.value;
    const response = await this.client.request(
      "skills/list",
      { cwds: [root], forceReload: true },
      20000,
    );
    const group = response.data?.find((d) => path.resolve(d.cwd) === root);
    check(group, "Codex 未返回当前项目的 Skill 列表，请刷新重试");
    const candidates = new Map();
    for (const s of group.skills || []) {
      if (
        !s.path ||
        !path.isAbsolute(s.path) ||
        path.basename(s.path) !== "SKILL.md"
      )
        continue;
      const localParts = path
        .relative(path.join(root, ".agents/skills"), s.path)
        .split(path.sep);
      if (
        localParts.length > 2 &&
        !localParts[0].startsWith(".") &&
        fs.existsSync(
          path.join(root, ".agents/skills", localParts[0], bindingFile),
        )
      )
        continue;
      // A repository Skill must belong to this project, not an inherited unrelated checkout.
      if (s.scope === "repo" && !inside(root, path.resolve(s.path))) continue;
      const key = entryId(s.path);
      let binding = null;
      try {
        binding = readBinding(path.dirname(s.path));
      } catch {}
      candidates.set(key, {
        candidate_id: key,
        name: binding?.source.name || s.name,
        path: s.path,
        description: binding?.source.description || s.description || "",
        enabled: s.enabled !== false,
        ...(binding
          ? {
              original_path: binding.source.path,
              source_sha256: binding.source.sha256,
            }
          : {}),
        source: binding
          ? "snapshot"
          : s.pluginId
            ? "plugin"
            : s.scope === "repo"
              ? "project"
              : s.scope === "system"
                ? "system"
                : "local",
        plugin_id: s.pluginId || null,
      });
    }
    // Registered entries remain visible even when discovery reports a broken file.
    for (const s of registrySkills(root))
      if (!candidates.has(entryId(s.path)))
        candidates.set(entryId(s.path), {
          candidate_id: entryId(s.path),
          name: s.display_name || s.name,
          path: s.path,
          description: "当前项目已注册的 Skill",
          enabled: s.available,
          source: "project",
        });
    const value = {
      candidates: [...candidates.values()].sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
      discovery_errors: group.errors || [],
    };
    this.catalogs.set(root, { at: Date.now(), value });
    return value;
  }
  active(store) {
    return (
      store
        .list("job")
        .some(
          (j) =>
            j.kind === "skill" &&
            ["queued", "starting", "running"].includes(j.status),
        ) ||
      store
        .list("skill_batch")
        .some((b) =>
          b.items.some((i) => !["completed", "applied"].includes(i.status)),
        )
    );
  }
  async state(store, refresh = false) {
    const catalog = await this.catalog(store.root, refresh),
      registry = registrySkills(store.root);
    return {
      ...catalog,
      registry_sha256: sha(registryText(store.root)),
      busy: this.active(store),
      stages: skillStages.map((stage) => {
        const current = registry.find((s) => s.slot === stage.slot);
        return {
          ...stage,
          current: current
            ? { ...current, candidate_id: entryId(current.path) }
            : null,
        };
      }),
    };
  }
  async inspect(store, input, refresh = false) {
    check(
      input.expected_sha256 === sha(registryText(store.root)),
      "项目 Skill 配置已变化，请重新载入后检查",
      409,
    );
    check(
      Array.isArray(input.changes) &&
        input.changes.length > 0 &&
        input.changes.length <= skillStages.length,
      "请选择需要更换的阶段",
    );
    check(
      new Set(input.changes.map((c) => c.slot)).size === input.changes.length,
      "同一阶段不能重复配置",
    );
    const catalog = await this.catalog(store.root, refresh),
      registry = registrySkills(store.root),
      prepared = [];
    for (const change of input.changes) {
      const stage = skillStages.find((s) => s.slot === change.slot),
        current = registry.find((s) => s.slot === change.slot);
      check(stage && current, "当前 Registry 没有这个可配置阶段");
      const candidate = catalog.candidates.find(
        (c) => c.candidate_id === change.candidate_id,
      );
      check(candidate, "所选 Skill 不在当前本机发现列表中，请刷新", 409);
      const issues = [],
        record = {
          slot: change.slot,
          label: stage.label,
          candidate,
          issues,
          contract: stage.contract,
        };
      try {
        check(
          candidate.enabled,
          "此 Skill 已禁用或无法加载，请先在 Codex 中启用 / 修复",
        );
        const text = read(candidate.path);
        frontmatter(text);
        record.source_sha256 = sha(text);
        const relative = path.relative(
          path.join(store.root, ".agents/skills"),
          candidate.path,
        );
        const isProject =
          /^[^/]+\/SKILL\.md$/.test(relative) && !relative.startsWith("..");
        if (isProject) {
          record.registry_name = relative.split("/")[0];
          record.mode = "project";
          // Reusing an existing managed binding verifies its full snapshot too.
          const binding = readBinding(path.dirname(candidate.path));
          if (binding) {
            check(
              binding.slot === stage.slot,
              "该项目副本属于另一个阶段，请选择原始安装的 Skill",
            );
            skillInputs([
              {
                slot: stage.slot,
                name: record.registry_name,
                path: candidate.path,
              },
            ]);
            record.bundle_sha256 = binding.source.bundle_sha256;
          } else {
            const local = inspectProjectFiles(store.root, candidate.path);
            record.bundle_sha256 = local.sha256;
            issues.push(...local.issues);
          }
        } else {
          const bundle = collectBundle(candidate, catalog.candidates);
          record.bundle = bundle;
          record.bundle_sha256 = bundle.sha256;
          record.mode = "snapshot";
          issues.push(...bundle.issues);
          const label =
            candidate.name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-|-$/g, "")
              .slice(0, 22) || "skill";
          record.registry_name = `wb-${stage.slot.replace(/[^a-z]/g, "-").slice(0, 15)}-${label}-${sha([adapterVersion, stage.slot, bundle.sha256]).slice(0, 12)}`;
        }
        if (
          !related[stage.slot].test(
            candidate.name + " " + candidate.description,
          )
        )
          issues.push({
            level: "warning",
            text: "名称和用途没有明确覆盖这个阶段，请确认你的选择；未把关键词匹配当作效果验证。",
          });
        if (/mcp|联网|登录|upload|higgsfield|external tool/i.test(text))
          issues.push({
            level: "warning",
            text: "包含外部工具或服务说明；本次没有验证这些服务的登录和执行能力。",
          });
        issues.push({
          level: "info",
          text:
            record.mode === "snapshot"
              ? "完整 Skill 与可解析的本地依赖将固定到当前项目；原安装不改动。"
              : "使用当前项目内的 Skill 文件。",
        });
        issues.push({
          level: "info",
          text: "静态检查不验证创作质量；切换后仍需以实际场景结果验收。",
        });
        record.status = issues.some((i) => i.level === "error")
          ? "blocked"
          : "ready";
      } catch (e) {
        issues.push({ level: "error", text: e.message });
        record.status = "blocked";
      }
      prepared.push(record);
    }
    const reports = prepared.map(({ bundle, ...r }) => ({
      ...r,
      ...(bundle
        ? {
            file_count: bundle.files.length,
            bytes: bundle.bytes,
            dependencies: bundle.dependencies,
          }
        : {}),
    }));
    const digest = sha({
      registry: input.expected_sha256,
      adapter: adapterVersion,
      reports,
    });
    return {
      prepared,
      public: {
        check_sha256: digest,
        can_save: reports.every((r) => r.status === "ready"),
        busy: this.active(store),
        reports,
      },
    };
  }
  async save(store, input) {
    check(!this.saving.has(store.root), "项目 Skill 正在保存，请稍后刷新", 409);
    this.saving.add(store.root);
    try {
      const result = await this.inspect(store, input, true);
      check(
        result.public.check_sha256 === input.check_sha256,
        "Skill 或依赖在检查后发生变化，请重新检查兼容性",
        409,
      );
      check(result.public.can_save, "兼容性检查尚有阻断项");
      check(
        !this.active(store),
        "当前有未完成的 Skill 任务或批次，请结束后再保存配置",
        409,
      );
      const before = registryText(store.root);
      check(
        sha(before) === input.expected_sha256,
        "配置已被其他窗口修改，请重新载入",
        409,
      );
      for (const r of result.prepared)
        if (r.bundle) this.install(store.root, r);
      const replacements = new Map(
        result.prepared.map((r) => [r.slot, r.registry_name]),
      );
      let after = before.replace(
        /^(\| `([^`]+)` \| )`[^`]+`/gm,
        (line, prefix, slot) =>
          replacements.has(slot)
            ? `${prefix}\`${replacements.get(slot)}\``
            : line,
      );
      if (!after.includes("<!-- workbench-skill-settings -->"))
        after = after.replace(
          /^(\| Slot \|)/m,
          "<!-- workbench-skill-settings -->\n当前运行配置以本表为准，历史替换说明不覆盖本表。设置页保存表示已完成本地文件与阶段接口检查，不代表真实场景效果、生产批准或视觉 QA 已通过。\n\n$1",
        );
      const stamp = now(),
        history = `deliverables/0_admin/skill-config/${stamp.replace(/[:.]/g, "-")}-${id().slice(0, 8)}`;
      atomic(contained(store.root, `${history}/registry.before.md`), before);
      atomic(contained(store.root, `${history}/registry.after.md`), after);
      atomic(contained(store.root, `${history}/change.json`), {
        at: stamp,
        before_sha256: sha(before),
        after_sha256: sha(after),
        reports: result.public.reports,
      });
      atomic(contained(store.root, ".agents/skill_registry.md"), after, true);
      this.catalogs.delete(store.root);
      return {
        saved: true,
        registry_sha256: sha(after),
        skills: registrySkills(store.root),
        history,
      };
    } finally {
      this.saving.delete(store.root);
    }
  }
  install(root, r) {
    const directory = contained(root, `.agents/skills/${r.registry_name}`),
      stage = skillStages.find((s) => s.slot === r.slot);
    const source = {
      name: r.candidate.name,
      description: r.candidate.description,
      path: r.candidate.path,
      sha256: r.source_sha256,
      bundle_sha256: r.bundle_sha256,
    };
    const wrapper = `---\nname: ${r.registry_name}\ndescription: ${JSON.stringify(`Project binding for ${stage.label}; use the selected ${source.name} skill within the current workflow stage.`)}\n---\n\n# ${stage.label} · 项目绑定\n\n- slot: \`${r.slot}\`\n- source: [${source.name}](${r.bundle.entry})\n\n本项目明确选择以上 Skill 的创作方法，原 Skill 已与本入口一起注入，不需要重复读取。其相对资源路径以来源 SKILL.md 所在目录为准。\n\n## 阶段接口\n\n${stage.contract}\n\n用户指令、当前项目 Registry、生产契约和本次 outputSchema 决定阶段范围与输出形式。来源 Skill 中的默认输出模板按本阶段接口适配；不启动其他阶段或自行替换 Registry 中的其他 Skill。不把创作、素材、空间或视觉 QA 状态假定为已批准。媒体生成、上传与发布不属于本阶段。来源 Skill 的生产 Prompt 只保留影响输出的内容，不包含此处元数据。\n`;
    const adaptedWrapper = wrapper + stageAdapter(r.slot);
    const files = [
      ...r.bundle.files,
      {
        path: "SKILL.md",
        content: Buffer.from(adaptedWrapper),
        sha256: sha(adaptedWrapper),
        size: Buffer.byteLength(adaptedWrapper),
      },
    ];
    const manifest = {
      format: 1,
      adapter_version: adapterVersion,
      slot: r.slot,
      source,
      entry: r.bundle.entry,
      files: files.map(({ content, ...f }) => f),
    };
    if (fs.existsSync(directory)) {
      const previous = readBinding(directory);
      check(
        previous && sha(previous) === sha(manifest),
        "同名项目 Skill 已存在且内容不同，未覆盖",
        409,
      );
      skillInputs([
        {
          slot: r.slot,
          name: r.registry_name,
          path: path.join(directory, "SKILL.md"),
        },
      ]);
      return;
    }
    // Registry switches only after the entire verified bundle is on disk.
    const staging = contained(root, `.agents/skills/.import-${id()}`);
    try {
      fs.mkdirSync(staging, { recursive: true });
      for (const f of files) {
        const file = contained(staging, f.path);
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, f.content, { flag: "wx", mode: 0o600 });
        if (f.mode !== undefined) fs.chmodSync(file, f.mode);
      }
      atomic(path.join(staging, bindingFile), manifest);
      fs.renameSync(staging, directory);
    } finally {
      if (fs.existsSync(staging))
        fs.rmSync(staging, { recursive: true, force: true });
    }
  }
}
