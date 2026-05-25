# QA Report: Workflow Slot Architecture

- date: 2026-05-25
- scope: `AGENTS.md`, `.codex/agents/`, `.agents/skill_registry.md`, `.agents/skills/`, root docs, admin changelog
- result: pass with tooling caveat

---

## Summary

The workflow architecture now has explicit guide-stage ownership and a replaceable skill assembly layer:

- `.codex/agents/guide-director.toml` owns asset/style guide creation.
- `.agents/skills/guide-workflow/SKILL.md` defines guide-stage inputs, outputs, reference handling, and QA.
- `.agents/skill_registry.md` defines stable slots for guide, storyboard prompt adapter, art prompt/platform adapter, video prompt/motion adapter, artifact, version, and QA behavior.
- Stage agents now read the registry before selecting replaceable skill implementations.

## Structural Checks

| Check | Result | Notes |
| --- | --- | --- |
| `AGENTS.md` includes skill registry as a rule source | Pass | Registry is now part of active routing rules |
| Custom agents exist | Pass | 7 TOML configs under `.codex/agents/` |
| Agent thread limit matches role count | Pass | `.codex/config.toml` sets `max_threads = 7` |
| Repo skills exist | Pass | 22 `SKILL.md` files under `.agents/skills/` |
| Guide stage has owner and skill | Pass | `guide-director` + `guide-workflow` added |
| Registry defaults point to real skills/agents | Pass | Equivalent local validation checked 22 skills and 7 agents |
| Canonical deliverable paths unchanged | Pass | No new production path pattern introduced |
| `deliverables/*/archive/` absent | Pass | No noncanonical archive directories found |
| Current production deliverables | Pass | None present outside admin, consistent with workflow-only state |

## Continuity Checks

| Check | Result | Notes |
| --- | --- | --- |
| Asset/style guide stage precedes visual prompt work | Pass | `AGENTS.md` normal workflow and `script-workflow` handoff updated |
| Storyboard prompt generation is replaceable | Pass | `storyboard.prompt_adapter` defaults to `storyboard-nanobanana` |
| Video prompt generation is replaceable | Pass | `video.prompt_builder` and `video.motion_adapter` slots defined |
| Reference image contract preserved | Pass | Registry and guide workflow keep local refs as production anchors |
| Historical QA/changelog records preserved | Pass | Historical `.cursor`/`workflow` mentions remain only in archives/admin history |

## Production Feasibility

| Check | Result | Notes |
| --- | --- | --- |
| Replacement process is explicit | Pass | Registry lists update steps and compatibility requirements |
| Replacement cannot silently change output paths | Pass | Slot rules require canonical output paths unless migrated intentionally |
| Guide outputs support downstream prompts | Pass | Asset guide covers DNA/refs/props/locations; style guide covers palette/light/texture/composition |
| QA coverage includes guide and registry changes | Pass | `qa-checklists` now includes guide stage and registry regression rows |

## Caveat

PowerShell validation scripts were not executed because `pwsh` is not installed in this environment. Equivalent local checks were run for skill/agent counts, frontmatter, reference existence, registry references, production deliverable emptiness, and noncanonical archive directories.

## Follow-Up

Add a portable non-PowerShell registry validator if this project will regularly run on machines without `pwsh`.
