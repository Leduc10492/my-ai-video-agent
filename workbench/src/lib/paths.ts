import { existsSync, realpathSync } from "node:fs";
import path from "node:path";

import type { DataSource } from "@/lib/source";

export function repoRoot() {
  const candidates = [
    process.env.WORKBENCH_REPO_ROOT,
    path.resolve(process.cwd(), ".."),
    process.cwd(),
  ].filter((value): value is string => Boolean(value));

  for (const candidate of candidates) {
    if (existsSync(path.join(candidate, ".agents", "skill_registry.md"))) {
      return realpathSync(candidate);
    }
  }

  throw new Error("找不到仓库根目录。工作台需要上一级目录里的 .agents/skill_registry.md。");
}

export function deliverablesRoot(source: DataSource) {
  const root = repoRoot();
  return source === "example"
    ? path.join(root, "workbench", "example", "deliverables")
    : path.join(root, "deliverables");
}

export function contentType(filePath: string) {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === ".html") return "text/html; charset=utf-8";
  if (extension === ".md") return "text/markdown; charset=utf-8";
  if (extension === ".json") return "application/json; charset=utf-8";
  if (extension === ".txt") return "text/plain; charset=utf-8";
  return "application/octet-stream";
}

export function resolveInside(root: string, relativePath: string) {
  const trimmed = relativePath.replace(/^[/\\]+/, "");
  if (!trimmed || trimmed.includes("\0")) {
    throw new Error("路径无效");
  }
  const resolvedRoot = realpathSync(root);
  const full = path.resolve(resolvedRoot, trimmed);
  const relative = path.relative(resolvedRoot, full);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("路径越界");
  }
  if (!existsSync(full)) {
    throw new Error("找不到文件");
  }
  const real = realpathSync(full);
  const fromRoot = path.relative(resolvedRoot, real);
  if (fromRoot.startsWith("..") || path.isAbsolute(fromRoot)) {
    throw new Error("路径越界");
  }
  return real;
}
