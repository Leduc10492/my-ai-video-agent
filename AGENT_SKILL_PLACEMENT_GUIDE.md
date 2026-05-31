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
| Workflow skills | Project `.agents/skills/` | Skills such as `guide-workflow`, `storyboard-workflow`, `sketch-shotlist-workflow`, and `video-prompt-workflow` depend on local paths |
| Reusable method skills | Global, after validation | McKee analysis, platform prompt rules, or motion design can be useful across projects |
| Platform adapter skills | Prefer global skill plus project registry selection | Banana storyboard prompts or video platform prompts can be reused, while the project registry maps them into this workflow |

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
- `.agents/skill_registry.md`, if the project uses different prompt or generation skills

## When To Promote A Skill To Global

Promote a skill to global only when all of these are true:

1. It has worked in at least two or three projects without structural edits.
2. It does not hardcode project paths such as `deliverables/30_breakdown/`.
3. It provides a reusable capability rather than a full project workflow.
4. It can be selected through `.agents/skill_registry.md` without changing canonical output paths.

Good global candidates:

- McKee analysis and rewrite methods
- Storyboard prompt adapters for a specific platform
- Art platform prompt rules
- Video platform prompt rules
- Motion design language

Better project-local candidates:

- `screenwriter-workflow`
- `script-workflow`
- `guide-workflow`
- `storyboard-workflow`
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

For example, to replace the Banana storyboard prompt skill, update the `storyboard.prompt_adapter` slot:

```markdown
| `storyboard.prompt_adapter` | `new-storyboard-skill` | `storyboard-director` | `deliverables/40_boards/04_storyboard_prompts_v{N}.md` |
```

The replacement skill must still satisfy the slot interface:

- accepts the latest storyboard and guide inputs
- preserves canonical shot IDs
- writes or supports `04_storyboard_prompts_v{N}.md`
- records batch ranges and reference mode
- respects the image reference contract
- does not change project storage paths unless the user explicitly asks for a migration

Use the same pattern for video:

```markdown
| `video.prompt_builder` | `new-video-prompt-skill` | `animation-director` | `deliverables/60_motion/06_video_prompts_v{N}.md` |
```

For Higgsfield/Seedance shotlist HTML, use the project-local `shotlist.primary` slot instead of editing the global Higgsfield skill:

```markdown
| `shotlist.primary` | `sketch-shotlist-workflow` | `storyboard-director` / `animation-director` | `deliverables/60_motion/Shotlist_<scope>_ZH_v{N}.html` |
```

That slot may reuse global platform knowledge, but it owns project-specific output paths, preview manifests, and embedded e-conte image handling.

## Bottom Line

Project-local should own workflow, storage, routing, and QA.

Global should own reusable capabilities that can plug into a project through `.agents/skill_registry.md`.
