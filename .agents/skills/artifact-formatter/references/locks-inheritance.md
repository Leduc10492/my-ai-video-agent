# Locks Inheritance

Locks are production constraints that should survive downstream transformations.

## Inheritance Rule

1. Read global locks from `deliverables/0_admin/locks.md`.
2. Read upstream artifact locks.
3. Preserve `must_keep` and `must_avoid` unless the user explicitly changes the creative direction.
4. Add stage-specific locks only when they clarify output quality.

## Common Stage Locks

- Script: story structure, point of view, core props, budget.
- Asset guide: character DNA, costume, props, era.
- Style guide: color temperature, lighting, performance tone.
- Shotlist breakdown: scene order, action beats, asset needs, spatial-blocking queue.
- Shotlist HTML: prompt-envelope grouping, camera blocking, reference status, failure locks.
- E-conte previews: prompt-envelope ID, rough staging readability, non-keyframe status.
- Generated tests: source `P###`, platform settings, reference mode, known limitations.

## Regression Rule

If an upstream lock changes, list downstream artifacts that may need regeneration before editing them.
