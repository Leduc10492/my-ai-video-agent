# QA Report: Codex Subagent Spec Structure
- date: 2026-05-21
- scope: `AGENTS.md`, `.codex/agents/`, root docs, `scripts/skill-audit.ps1`
- result: pass-with-notes

Superseded note: this was an intermediate migration report. The current Codex-standard structure uses custom agent TOML configs at `.codex/agents/<id>.toml`; see `qa_report_codex_standard_structure_20260521.md`.

## Changes Checked

| Check | Result |
| --- | --- |
| Intermediate agent spec directory existed | Pass |
| Six intermediate subagent specs existed | Pass |
| Old flat role files removed | Pass |
| `AGENTS.md` contains explicit spawn policy | Pass |
| Root docs point to subagent spec paths | Pass |
| `scripts/skill-audit.ps1` recognized the intermediate spec structure | Pass by inspection |
| Skill `references/*.md` links still resolve | Pass by shell check |

## Current Custom Agents

| Subagent | Spec |
| --- | --- |
| `project-director` | `.codex/agents/project-director.toml` |
| `script-writer` | `.codex/agents/script-writer.toml` |
| `storyboard-director` | `.codex/agents/storyboard-director.toml` |
| `artist-director` | `.codex/agents/artist-director.toml` |
| `animation-director` | `.codex/agents/animation-director.toml` |
| `qa-check` | `.codex/agents/qa-check.toml` |

## Notes

- Codex still defaults to local execution unless the user asks for subagents, parallel agents, delegation, or names a specific subagent.
- Current custom agent configs define mission, reads, writes, skills, operating rules, and completion report requirements.
- Historical QA reports and changelog entries still mention prior intermediate structures; those are historical records, not current rules.
