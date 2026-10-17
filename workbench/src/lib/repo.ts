import { cache } from "react";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

import {
  canonicalOutputs,
  extractRuleLines,
  highestVersion,
  parseAgent,
  parseFrontmatter,
  parseRegistry,
  sceneLabelsFromScript,
} from "@/lib/parse";
import { deliverablesRoot, repoRoot, resolveInside } from "@/lib/paths";
import type { DataSource } from "@/lib/source";
import { sourceLabel } from "@/lib/source";
import { buildStages } from "@/lib/status";
import type {
  AgentDocument,
  Inventory,
  RouteContext,
  SkillDocument,
  SkillSummary,
} from "@/lib/types";

function walk(directory: string, root = directory): { path: string; source: string }[] {
  if (!statSafe(directory)) return [];
  const files: { path: string; source: string }[] = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const full = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) continue;
    if (entry.isDirectory()) {
      files.push(...walk(full, root));
      continue;
    }
    const relative = path.relative(root, full).split(path.sep).join("/");
    if (!entry.name.endsWith(".md") && !entry.name.endsWith(".toml") && !entry.name.endsWith(".html")) {
      files.push({ path: relative, source: "" });
      continue;
    }
    files.push({ path: relative, source: readFileSync(full, "utf8") });
  }
  return files;
}

function statSafe(target: string) {
  try {
    return statSync(target).isDirectory();
  } catch {
    return false;
  }
}

function readText(filePath: string) {
  return readFileSync(filePath, "utf8");
}

export type TreeNode = {
  name: string;
  path: string;
  type: "file" | "dir";
  children?: TreeNode[];
};

function buildTree(directory: string, root: string): TreeNode[] {
  if (!statSafe(directory)) return [];
  const entries = readdirSync(directory, { withFileTypes: true })
    .filter((entry) => !entry.name.startsWith(".") && !entry.isSymbolicLink())
    .sort((a, b) => {
      if (a.isDirectory() !== b.isDirectory()) return a.isDirectory() ? -1 : 1;
      return a.name.localeCompare(b.name, "zh-CN", { numeric: true });
    });
  return entries.map((entry) => {
    const full = path.join(directory, entry.name);
    const relative = path.relative(root, full).split(path.sep).join("/");
    if (entry.isDirectory()) {
      return { name: entry.name, path: relative, type: "dir" as const, children: buildTree(full, root) };
    }
    return { name: entry.name, path: relative, type: "file" as const };
  });
}

const loadSkills = cache(() => {
  const root = path.join(repoRoot(), ".agents", "skills");
  const directories = readdirSync(root, { withFileTypes: true }).filter(
    (entry) => entry.isDirectory() && !entry.isSymbolicLink(),
  );
  return directories.flatMap((entry) => {
    const skillPath = path.join(root, entry.name, "SKILL.md");
    try {
      statSync(skillPath);
    } catch {
      return [];
    }
    const source = readText(skillPath);
    const { data, body } = parseFrontmatter(source);
    const references = walk(path.join(root, entry.name))
      .filter((file) => file.path !== "SKILL.md" && file.path.endsWith(".md"))
      .map((file) => ({
        path: file.path,
        title: file.source.match(/^#\s+(.+)$/m)?.[1]?.trim() || file.path,
      }));
    const document: SkillDocument = {
      name: data.name || entry.name,
      description: data.description || "",
      slots: [],
      referenceCount: references.length,
      body,
      references,
    };
    return [{ document, outputs: canonicalOutputs(body) }];
  });
});

const loadAgents = cache((): AgentDocument[] => {
  const root = path.join(repoRoot(), ".codex", "agents");
  return readdirSync(root)
    .filter((name) => name.endsWith(".toml"))
    .sort()
    .map((name) => parseAgent(readText(path.join(root, name)), name));
});

const loadRegistry = cache(() => {
  const registry = readText(path.join(repoRoot(), ".agents", "skill_registry.md"));
  const skills = loadSkills();
  return parseRegistry(registry).map((row) => {
    const skill = skills.find((item) => item.document.name === row.skill);
    return {
      ...row,
      canonicalOutputs: skill?.outputs ?? [],
    };
  });
});

function attachSlots(document: SkillDocument) {
  const slots = loadRegistry()
    .filter((row) => row.skill === document.name)
    .map((row) => row.slot);
  return { ...document, slots };
}

export function listSkillSummaries(): SkillSummary[] {
  const registryOrder = loadRegistry().map((row) => row.skill);
  return loadSkills()
    .map((item) => {
      const document = attachSlots(item.document);
      return {
        name: document.name,
        description: document.description,
        slots: document.slots,
        referenceCount: document.referenceCount,
      };
    })
    .sort((a, b) => {
      const ai = registryOrder.indexOf(a.name);
      const bi = registryOrder.indexOf(b.name);
      if (ai !== -1 || bi !== -1) return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      return a.name.localeCompare(b.name);
    });
}

export function getSkill(name: string) {
  const found = loadSkills().find((item) => item.document.name === name);
  if (!found) return null;
  return attachSlots(found.document);
}

export function getSkillReference(name: string, relativePath: string) {
  const skillRoot = path.join(repoRoot(), ".agents", "skills", name);
  const full = resolveInside(skillRoot, relativePath);
  if (!full.endsWith(".md")) throw new Error("只预览 Markdown 参考文件");
  return readText(full);
}

export function listAgents() {
  return loadAgents();
}

export function getAgent(name: string) {
  return loadAgents().find((agent) => agent.name === name) ?? null;
}

export function ruleLines() {
  return extractRuleLines(readText(path.join(repoRoot(), "AGENTS.md")));
}

function inventoryFor(source: DataSource): Inventory {
  const root = deliverablesRoot(source);
  const files = walk(root).map((file) => file.path);
  const textOf = (relative: string | null) => {
    if (!relative) return null;
    return readText(path.join(root, relative));
  };
  const script = highestVersion(files, /^01_script_v(\d+)\.md$/);
  const audit = highestVersion(files, /^01_audit_report_v(\d+)\.md$/);
  const scriptText = textOf(script?.file ?? null);
  const basename = (file: string) => file.split("/").pop() ?? file;
  return {
    files,
    scriptVersion: script?.version ?? null,
    scriptPath: script?.file ?? null,
    scriptText,
    auditVersion: audit?.version ?? null,
    auditPath: audit?.file ?? null,
    auditText: textOf(audit?.file ?? null),
    assetGuides: files.filter((file) => /^02_asset_guide_v\d+\.md$/.test(basename(file))),
    styleGuides: files.filter((file) => /^02_style_guide_v\d+\.md$/.test(basename(file))),
    breakdowns: files.filter((file) => /(?:^|\/)03_shotlist_breakdown_.+\.md$/.test(file)),
    htmls: files.filter((file) => /(?:^|\/)Shotlist_.+_ZH_.+\.html$/.test(file)),
    qaReports: files.filter((file) => file.startsWith("0_admin/qa_reports/") && basename(file) !== "README.md" && file.endsWith(".md")),
    sceneLabels: sceneLabelsFromScript(scriptText),
  };
}

export function projectTitle(source: DataSource, inventory: Inventory) {
  const heading = inventory.scriptText?.match(/^#\s+(.+)$/m)?.[1]?.trim();
  if (heading) return heading.replace(/^剧本[:：]\s*/, "");
  return source === "example" ? "末班" : "当前仓库";
}

export function loadHome(source: DataSource) {
  const inventory = inventoryFor(source);
  const slots = loadRegistry();
  return {
    source,
    label: sourceLabel(source),
    title: projectTitle(source, inventory),
    stages: buildStages(slots, inventory),
    slots,
    rules: ruleLines(),
    sceneLabels: inventory.sceneLabels,
  };
}

export function loadRouteContext(source: DataSource): RouteContext {
  const inventory = inventoryFor(source);
  const slots = loadRegistry();
  const skillOutputs = Object.fromEntries(loadSkills().map((item) => [item.document.name, item.outputs]));
  return {
    source,
    sourceLabel: sourceLabel(source),
    slots,
    skillOutputs,
    agents: loadAgents().map((agent) => ({
      name: agent.name,
      description: agent.description,
      inputs: agent.inputs,
      outputs: agent.outputs,
      slots: agent.slots,
      skills: agent.skills,
    })),
    stages: buildStages(slots, inventory),
    ruleLines: ruleLines(),
    files: inventory.files,
  };
}

export function loadDeliverables(source: DataSource) {
  const root = deliverablesRoot(source);
  const tree = buildTree(root, root);
  const files = flattenFiles(tree);
  const preferred =
    files.find((file) => /Shotlist_.+\.html$/.test(file)) ??
    files.find((file) => file.endsWith(".md") && !file.endsWith("README.md")) ??
    files[0];
  return { tree, files, preferred };
}

function flattenFiles(nodes: TreeNode[]): string[] {
  return nodes.flatMap((node) => (node.type === "file" ? [node.path] : flattenFiles(node.children ?? [])));
}

export function readDeliverable(source: DataSource, relativePath: string) {
  const full = resolveInside(deliverablesRoot(source), relativePath);
  const extension = path.extname(full).toLowerCase();
  return {
    full,
    extension,
    text: extension === ".html" || extension === ".md" || extension === ".txt" ? readText(full) : null,
  };
}

export function catalog() {
  return {
    skills: listSkillSummaries(),
    agents: listAgents().map((agent) => ({
      name: agent.name,
      description: agent.description,
      slots: agent.slots,
    })),
  };
}
