import { SettingsForm } from "@/components/settings-form";
import { registrySkills } from "@/lib/packet";
import { listSkillDirectories } from "@/lib/skills-scan";
import { SLOT_DEFS } from "@/lib/slots";
import { repoRoot } from "@/lib/paths";
import path from "node:path";

export default function SettingsPage() {
  const registry = registrySkills();
  const repoSkills = listSkillDirectories(path.join(repoRoot(), ".agents", "skills"));
  const known = new Set(repoSkills.map((skill) => skill.name));
  const rows = SLOT_DEFS.map((slot) => {
    const registrySkill = registry.find((row) => row.slot === slot.slot)?.skill ?? null;
    const options = [...new Set([slot.lockedSkill, registrySkill, ...slot.box].filter((item): item is string => Boolean(item)))];
    return { ...slot, registrySkill, options };
  });
  return <SettingsForm rows={rows} repoSkills={repoSkills.filter((skill) => known.has(skill.name))} />;
}
