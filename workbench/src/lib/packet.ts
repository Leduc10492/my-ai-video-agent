import { readFileSync } from "node:fs";
import path from "node:path";

import { parseRegistry } from "@/lib/parse";
import { repoRoot } from "@/lib/paths";
import { SLOT_DEFS, type SlotDef } from "@/lib/slots";

export type PacketInput = {
  stageLabel: string;
  skill: string;
  skillPath: string;
  inRegistry: boolean;
  inputs: string[];
  outputs: string[];
  gates: string[];
  prohibitions: string[];
};

export function skillPathFor(skill: string, known: Set<string>) {
  if (known.has(skill)) return `.agents/skills/${skill}/SKILL.md`;
  return `盒子技能 ${skill}（不在本仓库 skill_registry.md）`;
}

export function registrySkills() {
  const source = readFileSync(path.join(repoRoot(), ".agents", "skill_registry.md"), "utf8");
  return parseRegistry(source);
}

export function resolveSkill(slot: SlotDef, registry: ReturnType<typeof registrySkills>) {
  if (slot.lockedSkill) return slot.lockedSkill;
  return registry.find((row) => row.slot === slot.slot)?.skill ?? slot.box[0] ?? "";
}

export function buildPacket(input: PacketInput) {
  return [
    "你在本仓库的主线程里工作。文件是唯一事实来源，不要另起平行流程。",
    "",
    `阶段：${input.stageLabel}`,
    `技能：${input.skill}`,
    `技能路径：${input.skillPath}`,
    input.inRegistry ? "技能来源：.agents/skill_registry.md" : "技能来源：盒子技能名，仅供设置对照，本仓库没有这份 SKILL.md。",
    "",
    "输入：",
    ...input.inputs.map((item) => `- ${item}`),
    "",
    "输出：",
    ...input.outputs.map((item) => `- ${item}`),
    "",
    "门禁：",
    ...input.gates.map((item) => `- ${item}`),
    "",
    "禁止：",
    ...input.prohibitions.map((item) => `- ${item}`),
  ].join("\n");
}

export function packetFor(slot: SlotDef, extras: { inputs: string[]; gates: string[] }) {
  const registry = registrySkills();
  const known = new Set(registry.map((row) => row.skill));
  const skill = resolveSkill(slot, registry);
  return buildPacket({
    stageLabel: slot.label,
    skill,
    skillPath: skillPathFor(skill, known),
    inRegistry: known.has(skill),
    inputs: extras.inputs,
    outputs: [slot.output],
    gates: extras.gates,
    prohibitions: slot.prohibitions,
  });
}

export function slotByStage(stageId: string) {
  return SLOT_DEFS.find((slot) => slot.stageId === stageId) ?? SLOT_DEFS[1];
}
