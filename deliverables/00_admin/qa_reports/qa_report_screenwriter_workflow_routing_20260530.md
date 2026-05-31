# QA Report: Screenwriter Workflow Routing

- date: 2026-05-30
- scope: `AGENTS.md`, `.codex/agents/script-writer.toml`, `.agents/skill_registry.md`, `.agents/skills/screenwriter-workflow/`, script/McKee docs
- result: pass

---

## Summary

The script stage now has a Screenwriter-first controller:

- `script.primary` defaults to `screenwriter-workflow`.
- `script-writer` routes stage work through `screenwriter-workflow`.
- McKee skills remain available as structure plugins through `story.mckee_router`.
- `script-workflow` remains as legacy compatibility, not the default creation entrance.

## Structural Checks

| Check | Result | Notes |
| --- | --- | --- |
| New default skill exists | Pass | `.agents/skills/screenwriter-workflow/SKILL.md` exists |
| Registry points to real skill | Pass | `script.primary` maps to `screenwriter-workflow` |
| McKee router preserved | Pass | `story.mckee_router` remains `mckee-coordinator` |
| Skill count updated | Pass | 23 `SKILL.md` files under `.agents/skills/` |
| Old workflow preserved | Pass | `script-workflow` marked as legacy compatibility |
| Canonical script paths unchanged | Pass | `deliverables/10_story/01_script_v{N}.md` and `01_audit_report_v{N}.md` unchanged |

## Continuity Checks

| Check | Result | Notes |
| --- | --- | --- |
| Screenwriter mode owns user-facing writing | Pass | New skill requires concise screenplay form, Chinese output, one-version iteration |
| McKee no longer competes as final script owner | Pass | Registry and new skill define McKee outputs as structure packets |
| Campbell and Aristotle retained | Pass | New skill keeps them as secondary diagnosis frames |
| Downstream impact still reported | Pass | `screenwriter-workflow` handoff requires downstream artifact impact |

## Production Feasibility

| Check | Result | Notes |
| --- | --- | --- |
| Artifact contract preserved | Pass | Metadata, archive, version, changelog rules remain tied to `deliverables/10_story/` |
| Optional `.docx` exports scoped correctly | Pass | Markdown remains source of truth; `.docx` is derived only on request |
| Codex discovery includes new skill | Pass | `codex debug prompt-input` listed `screenwriter-workflow` and legacy `script-workflow` |
| Diff hygiene | Pass | `git diff --check` reported no whitespace errors |

## Residual Risk

| Priority | Risk | Recommendation |
| --- | --- | --- |
| P2 | The global `screenwriter` skill and repo-local `screenwriter-workflow` can both trigger for broad writing prompts. | Prefer repo-local `screenwriter-workflow` inside this project because it preserves artifact/version rules. |
| P3 | `script-workflow` still contains old McKee-first body text after its legacy notice. | Keep for compatibility unless historical references become confusing in practice. |
