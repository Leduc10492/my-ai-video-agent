#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { defaultWorkspaceRoot, projectContext } from "../server/workspace.mjs";
import { projectManifestFile } from "../../.agents/project-layout.mjs";

// Read-only: safe to run before each creative stage, including while the UI is closed.
try {
  const args = process.argv.slice(2);
  const value = flag => args.includes(flag) ? args[args.indexOf(flag) + 1] : undefined;
  const workspace = path.resolve(value("--workspace") || defaultWorkspaceRoot);
  const target = value("--project");
  const indexPath = path.join(workspace, ".workbench/projects.json");
  const projects = fs.existsSync(indexPath) ? JSON.parse(fs.readFileSync(indexPath, "utf8")).map(p => ({ ...p, root: path.resolve(workspace, p.root) })) : [];
  let project;
  if (target) {
    const matches = projects.filter(p => p.project_id === target || p.root === target || p.name === target);
    if (matches.length > 1) throw new Error("项目名称重复，请使用项目 ID 或绝对路径");
    project = matches[0];
    if (!project && path.isAbsolute(target) && fs.existsSync(projectManifestFile(target)))
      project = { ...JSON.parse(fs.readFileSync(projectManifestFile(target), "utf8")), root: target };
    if (!project) throw new Error("找不到指定项目，请核对项目 ID 或绝对路径");
  } else if (fs.existsSync(projectManifestFile(process.cwd()))) {
    project = { ...JSON.parse(fs.readFileSync(projectManifestFile(process.cwd()), "utf8")), root: process.cwd() };
  } else {
    const activeFile = path.join(workspace, ".workbench/active-project.json");
    if (!fs.existsSync(activeFile)) throw new Error("还没有当前视频项目，请在工作台选择项目，或传入 --project <项目绝对路径>");
    const active = JSON.parse(fs.readFileSync(activeFile, "utf8"));
    project = projects.find(p => p.project_id === active.project_id);
    if (!project) throw new Error("当前项目不在工作区索引中，请重新选择");
  }
  const context = projectContext(project);
  console.log(JSON.stringify(context, null, 2));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
