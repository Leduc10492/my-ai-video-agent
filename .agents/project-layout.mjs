import fs from "node:fs";
import path from "node:path";

export const filmFolders = [
  "01_剧本/创意与大纲", "01_剧本/剧本", "01_剧本/审核",
  "02_资产/角色", "02_资产/场景", "02_资产/道具", "02_资产/风格参考", "02_资产/声音",
  "03_分镜", "04_镜头", "05_剪辑/工程", "05_剪辑/代理", "05_剪辑/缓存",
  "06_导出/审片", "06_导出/成片",
];
const cache = new Map();
export function projectLayout(root) {
  const file = path.join(root, ".project/layout.json");
  if (!fs.existsSync(file)) return null;
  const stat = fs.statSync(file), previous = cache.get(file);
  if (previous?.mtime === stat.mtimeMs && previous.size === stat.size) return previous.value;
  const value = JSON.parse(fs.readFileSync(file, "utf8"));
  if (value.format !== 1 || value.kind !== "film-project-layout") throw new Error("未知项目目录格式");
  cache.set(file, { mtime: stat.mtimeMs, size: stat.size, value });
  return value;
}
export function assetCategory(name, kind = "") {
  if (name.startsWith("@char")) return "角色";
  if (name.startsWith("@loc")) return "场景";
  if (name.startsWith("@prop")) return "道具";
  return kind === "audio" || /\.(wav|mp3|m4a|aac|flac|ogg)$/i.test(name) ? "声音" : "风格参考";
}
export function filmPath(relative) {
  if (relative === "deliverables/0_admin") return ".project";
  if (relative.startsWith("deliverables/0_admin/")) return relative.replace("deliverables/0_admin/", ".project/");
  if (relative === "deliverables/1_story") return "01_剧本/剧本";
  if (relative.startsWith("deliverables/1_story/")) {
    const tail = relative.slice("deliverables/1_story/".length);
    const section = /^01_script_/.test(tail) ? "剧本" : /^01_audit_/.test(tail) ? "审核" : "创意与大纲";
    return `01_剧本/${section}/${tail}`;
  }
  if (relative === "deliverables/2_assets") return "02_资产";
  if (relative.startsWith("deliverables/2_assets/")) {
    const tail = relative.slice("deliverables/2_assets/".length), first = tail.split("/")[0];
    if (first.startsWith("@")) return `02_资产/${assetCategory(first)}/${tail}`;
    return `02_资产/${tail}`;
  }
  if (relative === "deliverables/3_shotlist") return "03_分镜";
  if (relative.startsWith("deliverables/3_shotlist/")) {
    const tail = relative.slice("deliverables/3_shotlist/".length), [scene, ...rest] = tail.split("/");
    const match = scene.match(/^(scene-.+)_v(\d+)$/), label = match?.[1] || scene;
    if (rest[0] === "generated") return `04_镜头/${label}/${rest.slice(1).join("/")}`.replace(/\/$/, "");
    return `03_分镜/${label}${match ? `/v${match[2]}` : ""}${rest.length ? "/" + rest.join("/") : ""}`;
  }
  if (/^deliverables\/4_edit\/exports(?:\/|$)/.test(relative))
    return relative.replace("deliverables/4_edit/exports", "06_导出/审片");
  if (/^deliverables\/4_edit(?:\/|$)/.test(relative))
    return relative.replace("deliverables/4_edit", "05_剪辑/工程");
  if (/^archives(?:\/|$)/.test(relative)) return relative.replace(/^archives/, ".project/历史");
  return relative;
}
export function projectRelative(root, relative) {
  const layout = projectLayout(root);
  if (!layout || typeof relative !== "string") return relative;
  return layout.aliases?.[relative] || filmPath(relative);
}
export function outputRoots(root) {
  return projectLayout(root) ? ["01_剧本", "02_资产", "03_分镜"] : ["deliverables"];
}
export function canonicalScriptPath(relative, kind = "script") {
  const prefix = kind === "script" ? "01_script" : "01_audit_report";
  const section = kind === "script" ? "剧本" : "审核";
  return new RegExp(`^(?:(?:deliverables|archives)/1_story|01_剧本/${section}|\\.project/历史/1_story)/${prefix}_v[1-9]\\d*\\.md$`).test(relative);
}
export function archivePath(root, relative) {
  if (!projectLayout(root)) return relative.replace(/^deliverables\//, "archives/");
  if (relative.startsWith(".project/历史/")) return relative;
  return `.project/历史/1_story/${path.basename(relative)}`;
}
export function projectManifestFile(root) {
  const hidden = path.join(root, ".project/project.json");
  return fs.existsSync(hidden) || projectLayout(root) ? hidden : path.join(root, "project.json");
}
export function createFilmLayout(root) {
  for (const folder of [".project", ...filmFolders]) fs.mkdirSync(path.join(root, folder), { recursive: true });
  const file = path.join(root, ".project/layout.json");
  if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify({ format: 1, kind: "film-project-layout", aliases: {} }, null, 2) + "\n");
}
export function portableInstructions(text) {
  return text
    .replaceAll("deliverables/0_admin", ".project")
    .replace(/deliverables\/1_story\/(?=01_audit_)/g, "01_剧本/审核/")
    .replaceAll("deliverables/1_story", "01_剧本/剧本")
    .replaceAll("deliverables/2_assets", "02_资产")
    .replaceAll("deliverables/3_shotlist", "03_分镜")
    .replaceAll("deliverables/4_edit/exports", "06_导出/审片")
    .replaceAll("deliverables/4_edit", "05_剪辑/工程")
    .replaceAll("archives/", ".project/历史/");
}
export function encodeProjectPaths(root, value) {
  if (typeof value === "string") {
    if (value === root) return "project:/";
    if (value.startsWith(root + path.sep)) return "project:/" + path.relative(root, value);
    return value;
  }
  if (Array.isArray(value)) return value.map(v => encodeProjectPaths(root, v));
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k,v]) => [k,encodeProjectPaths(root,v)]));
  return value;
}
export function decodeProjectPaths(root, value) {
  if (typeof value === "string" && value.startsWith("project:/")) {
    const target = path.resolve(root, value.slice("project:/".length));
    if (target !== root && !target.startsWith(root + path.sep)) throw new Error("项目引用越界");
    return target;
  }
  if (Array.isArray(value)) return value.map(v => decodeProjectPaths(root, v));
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k,v]) => [k,decodeProjectPaths(root,v)]));
  return value;
}
