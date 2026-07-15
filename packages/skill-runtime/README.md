# Skill runtime

Discovers Codex `SKILL.md` folders and applies the AI Director application contract.

- `discoverSkills` and `loadSkillDirectory` classify core, user, and unclassified skills and compute deterministic SHA-256 hashes.
- `readSkillRegistry` and `applyRegistrySlots` bridge legacy core skills to stable workflow slots.
- `importSkill` and `copyCoreSkillForEditing` copy into the user library only after path, symlink, manifest, dependency, and capability checks.
- `pinSkill`, `resolvePinnedSkill`, and `replaceSkillPin` keep projects on an exact version and content hash.
- `validateSkillPackage` includes dependency, capability, and Responses-compatible output-schema checks.
- `migrateLegacyAgentToml` and `migrateLegacyAgentFile` replace the obsolete `instructions` key while returning a non-blocking warning.

Core folders remain read-only at the application layer. An ordinary Codex skill without `director-skill.json` remains `uncategorized` after import until the user assigns a supported slot.
