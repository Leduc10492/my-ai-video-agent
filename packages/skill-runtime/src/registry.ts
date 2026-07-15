import { readFile } from "node:fs/promises";
import type { SkillRegistryEntry } from "./contracts.js";

function stripCode(value: string): string {
  return value.trim().replace(/^`|`$/g, "");
}

export function parseSkillRegistry(markdown: string): SkillRegistryEntry[] {
  const rows: SkillRegistryEntry[] = [];
  for (const line of markdown.split(/\r?\n/)) {
    if (!line.trim().startsWith("|")) continue;
    const cells = line.split("|").slice(1, -1).map((cell) => cell.trim());
    if (cells.length < 4 || cells[0] === "Slot" || cells.every((cell) => /^-+$/.test(cell))) continue;
    const [slot, skillId, owner, output] = cells;
    if (!slot || !skillId || !owner || output === undefined) continue;
    rows.push({ slot: stripCode(slot), skillId: stripCode(skillId), owner: stripCode(owner), output });
  }
  return rows;
}

export async function readSkillRegistry(file: string): Promise<SkillRegistryEntry[]> {
  return parseSkillRegistry(await readFile(file, "utf8"));
}

export function registrySkillForSlot(entries: readonly SkillRegistryEntry[], slot: string): string | undefined {
  return entries.find((entry) => entry.slot === slot)?.skillId;
}
