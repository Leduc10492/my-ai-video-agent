---
name: mckee-rewrite-plan
description: Build McKee-based rewrite plans for scripts and narratives. Stage structural fixes, scene triage, and polish phases. Use when user requests revision strategy, rewrite planning, fix planning, or asks "how do I fix this story".
---

# McKee Rewrite Plan

## Overview

Produce a phased rewrite plan that prioritizes structural fixes, then scene-level changes, then polish. Ensures causality and value change before touching dialogue or style.

## Workflow (5 Steps)

### 1. Define Target
Clarify what this draft will change:
- Stakes adjustment?
- Tone shift?
- Structural repair?
- Character arc deepening?

### 2. Structural Fixes (Phase 1 - Highest Priority)
Address story spine issues first:
- **Inciting incident**: Is it on-screen, early, and value-flipping?
- **Act turns**: Do major reversals occur at key junctures?
- **Crisis**: Does it test the strongest opposing force?
- **Climax**: Is it irreversible and causal from inciting incident?

**Fix order**: Inciting incident → Act turns → Crisis → Climax → Resolution

### 3. Scene Triage (Phase 2)
Once structure is sound, address scene-level issues:
- **Cut**: Scenes with no value change (pure exposition)
- **Merge**: Adjacent scenes serving same function
- **Move**: Scenes placed for convenience rather than escalation
- **Rewrite**: Scenes with weak turns or unclear opposition

**Goal**: Restore progression and escalation

### 4. Rewrite Pass (Phase 3)
For each scene to rewrite:
1. Outline: Desire → Opposition → Tactics → Turn
2. Write: Draft the scene
3. Verify: Check value change and causality

### 5. Polish Last (Phase 4)
Only after structure and scenes lock:
- Dialogue refinement
- Prose style
- Description enhancement

**Rule**: Never polish unstable structure.

## Decision Rules

If user does not specify act model:
- Short form: 3-act light
- Feature/longform: 3-act with 8-sequence substructure
- Episodic: 4-6 sequences per episode + season arc

See `../mckee-shared/core/story-spine.md` for structural elements.

## Output Format

Use the Rewrite Plan template:
```
Goal:
Assumptions:

Phase 1: Structural Fixes
- Fix: [description with rationale]
- Fix: [description with rationale]

Phase 2: Scene Triage
- Cut: [scene X - reason]
- Merge: [scenes Y+Z - reason]
- Move: [scene W - reason]
- Rewrite: [scene V - reason]

Phase 3: Dialogue and Polish
- Task: [specific polish tasks]

Risks:
- [potential issues with this plan]
```

Full template in `../mckee-shared/templates/rewrite-plan.md`.

## Priority Hierarchy

Always follow this order:
1. **Story spine** (inciting incident, crisis, climax)
2. **Act/sequence structure**
3. **Scene causality and value change**
4. **Dialogue and prose**

**Never skip levels.** A broken structure cannot be fixed with better dialogue.

## Output Directory

Work within standard deliverables structure:
- Read: `deliverables/10_story/01_script_v*.md` and `01_audit_report_v*.md`
- Output plan in agent's response (not saved as separate file)
- Modified script saves to: `deliverables/10_story/01_script_v{N+1}.md`
- Archive old version using `version-management`

Rewrite plan should include:
- Revision goals
- Key structural changes
- Scene triage reasoning
- Risks and open questions

## References

- `../mckee-shared/templates/rewrite-plan.md` - Rewrite plan template
- `../mckee-shared/core/story-spine.md` - Structural elements and definitions
