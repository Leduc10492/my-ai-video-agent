import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const platformRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const file = path.join(platformRoot, "installation.json");
export const installation = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : null;
export const defaultWorkspaceRoot = installation ? path.resolve(platformRoot, installation.workspace) : platformRoot;
export const defaultTemplateRoot = installation ? path.resolve(platformRoot, installation.template) : platformRoot;
export const sharedSkillsRoot = installation ? path.resolve(platformRoot, installation.skills) : null;
export const defaultDataDir = path.join(defaultWorkspaceRoot, ".workbench");
