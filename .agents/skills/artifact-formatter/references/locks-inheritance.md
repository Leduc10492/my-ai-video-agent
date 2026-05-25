# Locks Inheritance

Locks are production constraints that should survive downstream transformations.

## Inheritance Rule

1. Read global locks from `deliverables/00_admin/locks.md`.
2. Read upstream artifact locks.
3. Preserve `must_keep` and `must_avoid` unless the user explicitly changes the creative direction.
4. Add stage-specific locks only when they clarify output quality.

## Common Stage Locks

- Script: story structure, point of view, core props, budget.
- Asset guide: character DNA, costume, props, era.
- Style guide: color temperature, lighting, performance tone.
- Storyboard: shot count, duration, narrative beats, visual continuity.
- Board prompts: line-art style, character DNA, grid layout.
- Art prompts: platform, aspect ratio, visual consistency.
- Video prompts: motion logic, platform constraints, input type.

## Regression Rule

If an upstream lock changes, list downstream artifacts that may need regeneration before editing them.
