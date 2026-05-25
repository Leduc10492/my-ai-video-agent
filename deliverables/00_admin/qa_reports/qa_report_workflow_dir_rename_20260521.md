# QA Report: Visible Workflow Directory Rename

- date: 2026-05-21
- scope: `AGENTS.md`, `workflow/`, root docs, helper scripts, admin changelog
- result: pass with tooling caveat

---

Superseded note: this was an intermediate migration. The current Codex-standard structure uses `.codex/agents/` and `.agents/skills/`; see `qa_report_codex_standard_structure_20260521.md`.

## Summary

The hidden workflow directory was renamed to visible `workflow/` during this intermediate pass. Later in the same day, the project moved to Codex-standard paths:

- `.codex/agents/<id>.toml`
- `.agents/skills/<skill>/SKILL.md`

The old tool-specific directory name is no longer required for the active workflow.

## Checks

| Check | Result | Notes |
| --- | --- | --- |
| Hidden workflow directory removed | Pass | No `.cursor` directory exists in the project root |
| Visible workflow directory existed at the time | Pass | Superseded by Codex-standard paths |
| Subagent specs existed at the time | Pass | Later converted to `.codex/agents/<id>.toml` |
| Skill runbooks existed at the time | Pass | Later moved to `.agents/skills/<skill>/` |
| Active docs updated at the time | Pass | Current docs now use `.codex/agents/` and `.agents/skills/` |
| Old path references | Pass | Only the changelog keeps the old hidden path as a rename note |
| Helper script path updated | Pass | `scripts/skill-audit.ps1` now reads `.agents/skills` and `.codex/agents` |
| Production deliverables touched | Pass | No archived creative content was restored or edited |

## Caveat

PowerShell validation scripts were not executed in this environment because `pwsh` is not installed. Equivalent shell checks should be used until PowerShell is available.

## Follow-Up

Add portable shell or Python equivalents for the current PowerShell helper scripts if the workflow will be used across machines without PowerShell.
