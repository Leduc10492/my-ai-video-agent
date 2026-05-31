# Agent And Skill Placement Guide

This guide explains where this project's skills and subagents should live, and how to decide what can become global later.

## Recommendation

Keep the current workflow skills and subagents project-local for now. Promote only mature, reusable capability skills to global scope after they prove useful across multiple projects.

The reason is that many current skills and subagents are tied to this project's file contract:

- `deliverables/`
- `archives/`
- artifact metadata
- `locks.md`
- `.agents/skill_registry.md`
- stage-specific output paths

Those rules are project-specific and should stay with the project.

## Placement Matrix

| Type | Recommended Location | Reason |
| --- | --- | --- |
| Project routing rules | Project `AGENTS.md` | Each project can have different outputs, locks, and stage rules |
| Subagent roles | Project `.codex/agents/` | Read/write scopes and stage responsibilities depend on the project structure |
| Workflow skills | Project `.agents/skills/` | Skills such as `screenwriter-workflow`, `guide-workflow`, `shotlist-breakdown-workflow`, `sketch-shotlist-workflow`, and `qa-workflow` depend on local paths |
| Reusable method skills | Global, after validation | McKee analysis and generic shotlist-builder method references can be useful across projects |
| Platform knowledge | Prefer global skill plus project wrapper | Seedance/Higgsfield prompt knowledge can be reused, while the project wrapper owns local output paths and QA gates |

## Practical Model

Treat this repository as a workflow template package.

For a new project, copy:

- `AGENTS.md`
- `.agents/`
- `.codex/`
- the canonical `deliverables/` and `archives/` structure

Then update:

- `deliverables/00_admin/locks.md`
- project-specific deliverables
- `.agents/skill_registry.md`, if the project uses different shotlist or QA implementations

## When To Promote A Skill To Global

Promote a skill to global only when all of these are true:

1. It has worked in at least two or three projects without structural edits.
2. It does not hardcode project paths such as `deliverables/30_breakdown/`.
3. It provides a reusable capability rather than a full project workflow.
4. It can be selected through `.agents/skill_registry.md` without changing canonical output paths.

Good global candidates:

- McKee analysis and rewrite methods
- generic shotlist-builder prompt-quality rules
- reusable Seedance/Higgsfield platform knowledge

Better project-local candidates:

- `screenwriter-workflow`
- `guide-workflow`
- `shotlist-breakdown-workflow`
- `sketch-shotlist-workflow`
- `artifact-formatter`
- `version-management`
- `qa-workflow`

## Subagent Guidance

Keep subagents project-local by default.

Subagents define ownership boundaries:

- what they can read
- what they can write
- which stage they own
- which deliverables they produce
- how they report downstream impact

Those boundaries depend on the project structure. A global subagent is more likely to write to the wrong path or assume the wrong artifact contract.

## Replacement Pattern

Use `.agents/skill_registry.md` as the assembly layer.

For shotlist breakdown:

```markdown
| `shotlist.breakdown` | `new-breakdown-skill` | `storyboard-director` | `deliverables/30_breakdown/03_shotlist_breakdown_v{N}.md` |
```

For Seedance/Higgsfield HTML:

```markdown
| `shotlist.primary` | `new-shotlist-skill` | `storyboard-director` | `deliverables/60_motion/Shotlist_<scope>_ZH_v{N}.html` |
```

The replacement skill must still satisfy the slot interface:

- accepts latest script, guides, locks, and optional scope
- preserves `SB###` and `P###` IDs
- preserves shot row order and source scene mapping
- writes or supports the canonical output path
- records reference mode and known limitations
- runs internal prompt hard gates or documents equivalent gating
- hands off to `qa.primary`

Do not introduce a separate board-prompt, art-prompt, or standalone video-prompt chain unless the user explicitly approves a new migration.

## Bottom Line

Project-local should own workflow, storage, routing, and QA.

Global should own reusable capabilities that can plug into a project through `.agents/skill_registry.md`.
