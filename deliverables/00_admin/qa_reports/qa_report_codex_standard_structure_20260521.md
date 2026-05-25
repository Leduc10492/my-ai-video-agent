# QA Report: Codex Standard Project Structure

- date: 2026-05-21
- scope: `AGENTS.md`, `.codex/`, `.agents/`, root docs, helper scripts, admin changelog
- result: pass with tooling caveat

---

## Summary

The project has been migrated from the intermediate `workflow/` structure to Codex-standard project directories:

- `AGENTS.md`: project instruction entrypoint
- `.codex/agents/<id>.toml`: project-scoped Codex custom agents
- `.agents/skills/<skill>/SKILL.md`: repo-scoped Codex skills

The old `.cursor/` directory and intermediate `workflow/` directory are no longer present.

## Checks

| Check | Result | Notes |
| --- | --- | --- |
| `AGENTS.md` exists | Pass | Active project rule entrypoint |
| `.codex/config.toml` exists | Pass | Project agent settings present |
| Custom agents exist | Pass | 6 TOML configs under `.codex/agents/` |
| Repo skills exist | Pass | 21 `SKILL.md` files under `.agents/skills/` |
| Old directories removed | Pass | No `.cursor/` or `workflow/` directory exists |
| Active docs updated | Pass | Root docs use `.codex/agents/` and `.agents/skills/` |
| Helper script updated | Pass | `scripts/skill-audit.ps1` reads Codex-standard paths |
| Noncanonical empty generated dirs removed | Pass | `deliverables/` contains only canonical stage directories |
| Creative artifacts preserved | Pass | No archived creative content was restored or edited |

## Caveat

PowerShell validation scripts were not executed in this environment because `pwsh` is not installed. Equivalent shell checks were used for structure, counts, and reference existence.

## Follow-Up

Add portable shell or Python equivalents for the current PowerShell helper scripts if this workflow will be used on machines without PowerShell.
