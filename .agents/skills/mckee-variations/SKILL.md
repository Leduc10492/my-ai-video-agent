---
name: mckee-variations
description: Generate story variations using McKee principles. Create alternative conflict engines, climaxes, or story paths while maintaining causality and obligatory scenes. Use when user requests alternatives, asks "what if", explores different approaches, or wants creative options.
---

# McKee Story Variations

## Overview

Generate creative story alternatives by changing the conflict engine while maintaining core principles: inciting incident logic, obligatory scene, and causality.

## Output Language

Default to Simplified Chinese for all user-facing variation output unless the user explicitly requests another language. Keep file paths, artifact IDs, and fixed workflow tokens unchanged.

## Workflow (4 Steps)

### 1. Hold the Principle
**Fix these anchors** (do not change):
- **Inciting incident**: Keep the event that breaks equilibrium
- **Obligatory scene**: Keep the promised payoff
- **Protagonist**: Keep core character and story-level desire
- **Causality**: Maintain cause-effect chains

**Why**: These create audience expectation and story identity

### 2. Change the Conflict Engine
**Swap one or more**:
- **Antagonist**: Different opposing force or character
- **Constraint**: Different obstacle type (time, resource, rule)
- **Value at stake**: Different currency (life/death → freedom/slavery)
- **Inner conflict**: Different character flaw or fear

**Example**:
- Original: Protagonist must steal artifact from villain
- Variation: Protagonist must protect artifact from desperate ally

### 3. Preserve Causality
**For each variation**:
- Ensure new events still cause later events
- Maintain inciting incident → climax causal lock
- Verify turning points are motivated, not coincidental

**Test**: Can you trace cause-effect from inciting incident to climax?

### 4. Rebuild the Climax
**Match climax to new engine**:
- New antagonist → new crisis confrontation
- New value → new irreversible choice
- New constraint → new resolution method

**Rule**: Climax must resolve the NEW central conflict

## Variation Types

### Antagonist Swap
Keep story structure, change opposing force:
- Human → Nature
- External → Internal
- Villain → Well-meaning obstacle
- Single → Multiple distributed

### Value Swap
Keep events, change what's at stake:
- Survival → Dignity
- Love → Justice
- Wealth → Freedom
- External → Internal

### Constraint Swap
Keep goal, change limiting factor:
- Time pressure → Resource scarcity
- Physical obstacle → Social rule
- Knowledge gap → Moral dilemma

### Tone Swap
Keep structure, change emotional texture:
- Tragedy → Dark comedy
- Thriller → Mystery
- Action → Psychological

### Point-of-View Swap
Retell from different character:
- Antagonist perspective
- Secondary character perspective
- Multiple perspectives

## Output Format

Use the Variation Generator template:
```
固定锚点:
- 激励事件（固定）: [描述]
- 必有场景（固定）: [描述]
- 核心欲望（固定）: [描述]

方案A:
- 新冲突引擎: [改变了什么]
- 新中点或主要转折: [如何变化]
- 新危机选择: [主角面对什么]
- 新高潮: [冲突如何解决]
- 因果检查: [激励事件如何导致高潮]

方案B:
- 新冲突引擎: [改变了什么]
- 新中点或主要转折: [如何变化]
- 新危机选择: [主角面对什么]
- 新高潮: [冲突如何解决]
- 因果检查: [激励事件如何导致高潮]

方案C:
- [同上结构]
```

Full template in `../mckee-shared/templates/variations.md`.

## Principles for Variations

### What to Preserve
- Story spine structure (inciting incident, crisis, climax)
- Protagonist core desire
- Obligatory scene promise
- Causal chains (cause → effect)

### What to Change
- Source of conflict (antagonist, constraint, value)
- Tactics protagonist uses
- Specific turning point events
- Supporting characters or obstacles

### What to Verify
- Inciting incident still causes climax
- Value change is clear and meaningful
- Crisis tests the STRONGEST opposing force (not just any)
- Climax is irreversible

See `../mckee-shared/core/story-spine.md` for structural definitions.

## Common Variation Patterns

**Original → Variation examples**:

1. **External to internal**
   - Original: Hero fights villain for kingdom
   - Variation: Hero fights own ambition that endangers kingdom

2. **Opponent to ally**
   - Original: Protagonist vs. antagonist competition
   - Variation: Protagonist and antagonist forced to cooperate

3. **Success to failure** (or reverse)
   - Original: Protagonist wins goal but loses what matters
   - Variation: Protagonist loses goal but gains what matters

4. **Narrow to expand time/space**
   - Original: 24-hour crisis in one city
   - Variation: Same crisis over years across continents

## Output Directory

Work within standard deliverables structure:
- Read: `deliverables/10_story/01_script_v*.md`
- Output variations in agent's response (for user to choose)
- If user selects a variation, save to: `deliverables/10_story/01_script_v{N+1}.md`
- Archive old version using `version-management`

Variation notes should include:
- Anchors held constant
- Engines changed
- Causality verification
- Trade-offs per variation

## References

- `../mckee-shared/templates/variations.md` - Variation template
- `../mckee-shared/core/story-spine.md` - Structural anchors and definitions
