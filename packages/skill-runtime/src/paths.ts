import path from "node:path";

export function isPathInside(root: string, candidate: string): boolean {
  const relative = path.relative(path.resolve(root), path.resolve(candidate));
  return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative));
}

export function resolveSkillRelativePath(root: string, relativePath: string): string {
  if (!relativePath || path.isAbsolute(relativePath)) {
    throw new Error(`Skill path must be relative: ${relativePath}`);
  }
  const resolved = path.resolve(root, relativePath);
  if (!isPathInside(root, resolved)) {
    throw new Error(`Skill path escapes package root: ${relativePath}`);
  }
  return resolved;
}

export function safeSkillFolderName(id: string, version?: string): string {
  const value = version ? `${id}@${version}` : id;
  if (!/^[a-z0-9][a-z0-9._@-]*$/i.test(value)) throw new Error(`Unsafe skill folder name: ${value}`);
  return value;
}
