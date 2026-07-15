import type { SkillDescriptor, SkillPin, StageSlot } from "./contracts.js";

export function pinSkill(skill: SkillDescriptor, slot: StageSlot): SkillPin {
  if (!skill.manifest.slots.includes(slot)) throw new Error(`Skill ${skill.id}@${skill.manifest.version} does not support ${slot}.`);
  return { id: skill.id, version: skill.manifest.version, path: skill.path, contentHash: skill.contentHash, slot };
}

export function resolvePinnedSkill(pin: SkillPin, installed: readonly SkillDescriptor[]): SkillDescriptor {
  const matchingVersion = installed.filter((candidate) => candidate.id === pin.id && candidate.manifest.version === pin.version);
  if (!matchingVersion.length) throw new Error(`Pinned skill ${pin.id}@${pin.version} is not installed.`);
  const skill = matchingVersion.find((candidate) => candidate.contentHash === pin.contentHash);
  if (!skill) throw new Error(`Pinned skill ${pin.id}@${pin.version} has changed on disk.`);
  if (!skill.manifest.slots.includes(pin.slot)) throw new Error(`Pinned skill no longer supports ${pin.slot}.`);
  return skill;
}

export function replaceSkillPin(current: SkillPin, replacement: SkillDescriptor): SkillPin {
  return pinSkill(replacement, current.slot);
}
