import fs from "node:fs";
import path from "node:path";
import { createHash, randomUUID } from "node:crypto";
import { projectRelative } from "../../.agents/project-layout.mjs";
export const sha = (value) =>
  createHash("sha256")
    .update(
      typeof value === "string" || Buffer.isBuffer(value)
        ? value
        : JSON.stringify(value),
    )
    .digest("hex");
export const id = () => randomUUID();
export const now = () => new Date().toISOString();
export function check(ok, message, statusCode = 400) {
  if (!ok) throw Object.assign(new Error(message), { statusCode });
}
export function contained(root, relative) {
  check(
    typeof relative === "string" && relative && !path.isAbsolute(relative),
    "需要项目内的相对路径",
  );
  relative = projectRelative(root, relative);
  const base = fs.realpathSync(root),
    target = path.resolve(base, relative);
  check(target.startsWith(base + path.sep), "路径超出项目");
  let ancestor = target;
  while (!fs.existsSync(ancestor)) ancestor = path.dirname(ancestor);
  const real = fs.realpathSync(ancestor);
  check(real === base || real.startsWith(base + path.sep), "链接指向项目外");
  return target;
}
export function assetName(value) {
  check(
    typeof value === "string" &&
      value.length > 0 &&
      value.length <= 180 &&
      value === value.trim() &&
      !/[\/\\\x00-\x1f]/.test(value) &&
      value !== "." &&
      value !== "..",
    "资产名必须是完整的文件名主干，不能含路径或控制字符",
  );
  return value;
}
export function atomic(file, data, replace = false) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temp = `${file}.${id()}.tmp`,
    content =
      typeof data === "string" || Buffer.isBuffer(data)
        ? data
        : JSON.stringify(data, null, 2) + "\n";
  const fd = fs.openSync(temp, "wx", 0o600);
  try {
    fs.writeFileSync(fd, content);
    fs.fsyncSync(fd);
  } finally {
    fs.closeSync(fd);
  }
  try {
    if (replace) fs.renameSync(temp, file);
    else {
      fs.linkSync(temp, file);
      fs.unlinkSync(temp);
    }
  } finally {
    if (fs.existsSync(temp)) fs.unlinkSync(temp);
  }
}
export function unwrapScript(text) {
  if (!text.startsWith("# Artifact:")) return text;
  const separator = /\r?\n---\r?\n(?:\r?\n)?/.exec(text);
  return separator ? text.slice(separator.index + separator[0].length) : text;
}
export function walk(root, filter, depth = 5) {
  if (!fs.existsSync(root) || depth < 0) return [];
  return fs
    .readdirSync(root, { withFileTypes: true })
    .flatMap((e) =>
      e.isDirectory()
        ? walk(path.join(root, e.name), filter, depth - 1)
        : e.isFile() && filter(e.name)
          ? [path.join(root, e.name)]
          : [],
    );
}
