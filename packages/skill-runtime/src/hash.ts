import { createHash } from "node:crypto";
import { lstat, readFile, readdir, realpath } from "node:fs/promises";
import path from "node:path";

function isInside(root: string, candidate: string): boolean {
  const relative = path.relative(root, candidate);
  return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== "..");
}

async function collectFiles(root: string, current: string, files: string[]): Promise<void> {
  const entries = await readdir(current, { withFileTypes: true });
  entries.sort((left, right) => left.name.localeCompare(right.name));
  for (const entry of entries) {
    const absolute = path.join(current, entry.name);
    if (entry.isSymbolicLink()) {
      const resolved = await realpath(absolute);
      if (!isInside(root, resolved)) {
        throw new Error(`Skill contains a symbolic link that escapes its root: ${path.relative(root, absolute)}`);
      }
      throw new Error(`Symbolic links are not supported in skill packages: ${path.relative(root, absolute)}`);
    }
    if (entry.isDirectory()) {
      await collectFiles(root, absolute, files);
    } else if (entry.isFile()) {
      files.push(absolute);
    }
  }
}

export async function hashSkillDirectory(directory: string): Promise<string> {
  const root = await realpath(directory);
  const stat = await lstat(root);
  if (!stat.isDirectory()) throw new Error(`Skill path is not a directory: ${directory}`);

  const files: string[] = [];
  await collectFiles(root, root, files);
  const hash = createHash("sha256");
  for (const file of files) {
    const relative = path.relative(root, file).split(path.sep).join("/");
    const contents = await readFile(file);
    hash.update(relative, "utf8");
    hash.update("\0");
    hash.update(contents);
    hash.update("\0");
  }
  return hash.digest("hex");
}

export async function hashFile(file: string): Promise<string> {
  return createHash("sha256").update(await readFile(file)).digest("hex");
}
