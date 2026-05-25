# QA Report: Codex Rules Cleanup
- date: 2026-05-20
- scope: `AGENTS.md`, root docs, `.codex/agents/`, selected workflow skills, generated asset validation script
- result: pass-with-notes

## Changes Checked

| Area | Result |
| --- | --- |
| `AGENTS.md` generic Codex entrypoint | Pass |
| Test project identity removed from top-level rules | Pass |
| Codex local-role execution clarified | Pass |
| Generated asset path contract unified | Pass |
| Root docs refreshed | Pass |
| Skill reference files still present | Pass |
| Empty/prompt-only project state allowed by generated asset validator | Pass by inspection |

## Findings

| Priority | File | Issue | Evidence | Suggested Fix | Status |
| --- | --- | --- | --- | --- | --- |
| P2 | `scripts/*.ps1` | PowerShell scripts cannot be executed in this local environment because `pwsh` is unavailable. | `command -v pwsh` returned no path during audit. | Add shell/Python equivalents or document `pwsh` setup. | Open |
| P3 | Former flat agent docs | Some legacy wording remained for historical clarity. | Later replaced by directory-based Codex subagent specs under `.codex/agents/<id>.toml`. | No active action; see `qa_report_workflow_dir_rename_20260521.md`. | Superseded |

## Notes

- A search for the previous test project character names and hardcoded generated keyframe folder returned no matches in active rule docs after cleanup.
- `deliverables/` still contains only admin files and empty stage directories.
- Deep skill examples were changed to neutral placeholder characters.
