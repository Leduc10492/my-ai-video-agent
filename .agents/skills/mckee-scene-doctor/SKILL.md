---
name: mckee-scene-doctor
description: Internal McKee scene-doctor plugin for scene repair packets. Fix desire, opposition, turning points, and value change when screenwriter-workflow or mckee-coordinator requests McKee scene support, or when the user explicitly asks for McKee scene diagnosis. Returns repair notes, not final script artifact ownership.
---

# McKee Scene Doctor

## Overview

Diagnose and repair a single scene to ensure it has clear desire, meaningful opposition, a turning point, and measurable value change.

## Output Language

Default to Simplified Chinese for all user-facing scene diagnosis and repair notes unless the user explicitly requests another language. Keep scene IDs, file paths, artifact IDs, and screenplay labels unchanged when useful.

## Workflow (4 Steps)

### 1. Clarify Desire
**What does the character want NOW in this scene?**

Requirements:
- Conscious and specific (not vague)
- Achievable within the scene
- Related to story-level desire but immediate

Bad: "wants happiness"
Good: "wants to convince Sarah to leave town tonight"

### 2. Identify Opposition
**Who or what blocks the desire, and how?**

Opposition sources:
- **Antagonist**: Another character with conflicting goal
- **Inner conflict**: Character's own fear, flaw, or contradiction
- **Environmental**: Physical obstacles, time pressure, social rules

Strong opposition:
- Has motive and capability
- Forces difficult choices
- Escalates through the scene

### 3. Locate the Turn
**What value reverses by the end of the scene?**

A turn is:
- A shift from positive to negative (or reverse)
- Caused by conflict, not coincidence
- Meaningful for the character's desire

Scene value check:
- Opening value state: [positive/negative]
- Closing value state: [negative/positive]
- If identical → scene is likely exposition, not dramatic

### 4. Establish Aftermath
**How does this outcome force the next action?**

The scene's result should:
- Create a new problem or pressure
- Eliminate an easy option
- Reveal new information that changes plans
- Force character to adapt or escalate

**Avoid**: Scene ends with everything the same.

## Scene Analysis Method

Use the five-step beat analysis from `../mckee-shared/analysis/scene-analysis.md`:

1. Identify conflict driver and opposing forces
2. Mark opening value state
3. Break scene into beats (action/reaction exchanges)
4. Mark ending value state
5. Locate turning point where value flips

## Output Format

Use the Scene Doctor Table:
```
场景ID: [名称或编号]
场景目标: [这场戏在故事里要完成什么]
主角欲望: [具体、当下、可执行的目标]
阻力: [谁/什么阻挡，以及如何阻挡]
策略: [主角如何尝试获胜]
开场价值: [例如 Hope+, Freedom-]
收场价值: [例如 Hope-, Freedom+]
转折: [价值翻转的时刻/选择]
后果: [制造出的下一层压力]

建议修改:
- [具体修复1]
- [具体修复2]
```

Full template in `../mckee-shared/templates/scene-doctor.md`.

## Common Scene Problems

**Problem**: Character talks about desire instead of pursuing it
**Fix**: Replace dialogue with action that tests opposition

**Problem**: Conflict is verbal-only with no stakes
**Fix**: Add consequence - what does character lose if they fail?

**Problem**: Scene ends where it began (no turn)
**Fix**: Identify the value at stake and force it to reverse

**Problem**: Opposition gives up too easily
**Fix**: Give antagonist stronger motive or capability

**Problem**: Turn caused by coincidence or new information dump
**Fix**: Turn must come from character choice under pressure

See `../mckee-shared/analysis/scene-analysis.md` for detailed analysis method.

## Output Boundary

Return scene repair notes to `screenwriter-workflow`.
Do not save modified scripts directly.
Do not archive previous versions or update changelog directly.

Scene repair notes should include:
- Scene diagnosis
- Value identified
- Turn repair strategy
- Risks or alternatives

## References

- `../mckee-shared/analysis/scene-analysis.md` - Five-step scene analysis method
- `../mckee-shared/templates/scene-doctor.md` - Scene doctor table template
