---
name: mckee-create
description: Create original stories using McKee principles. Generate scripts, outlines, or narrative concepts with clear structure, causality, and value change. Use when user requests story creation, script writing, plot development, or asks to "write a story about X".
---

# McKee Story Creator

## Overview

Create original stories guided by McKee principles: structure before style, causality over coincidence, value change through conflict.

## Output Language

Default to Simplified Chinese for all user-facing story creation output unless the user explicitly requests another language. Keep `INT.`, `EXT.`, screenplay transitions, file paths, artifact IDs, and fixed workflow tokens in their conventional form when useful.

## Quick Start

1. Clarify premise, genre, length, and target audience
2. Design value arc (what changes from start to end)
3. Build story spine (inciting incident → crisis → climax)
4. Develop scenes with conflict and turning points
5. Verify causality and obligatory scene delivery

## Core Creation Principles

1. **Start with value** - What shifts? (life/death, love/hate, freedom/slavery)
2. **Design from climax backward** - Where must this end? Then build toward it
3. **Inciting incident early** - Break equilibrium in first 1/4
4. **Causality lock** - Every event causes the next; no coincidence
5. **Protagonist desire** - Clear goal + will to pursue
6. **Conflict escalates** - Each scene intensifies opposition
7. **Crisis forces choice** - Test strongest opposing force
8. **Climax irreversible** - Permanent value change

## Creation Workflow

### 1. Premise & Setup
Ask user (if not provided):
- **Premise**: What's the story about in one sentence?
- **Genre**: Drama, thriller, comedy, etc.
- **Length**: 3-min short, 30-min episode, 2-hour feature?
- **Audience**: Who is this for?
- **Style reference**: Any director/film to emulate?

### 2. Value Arc Design
Identify primary value at stake:
- Life/death, love/hate, freedom/slavery, justice/injustice
- Map trajectory: starting state → ending state
- Ensure meaningful change (not circular)

### 3. Story Spine Construction
Build 5-part structure:
- **Inciting incident**: Dynamic event that breaks equilibrium (first 1/4)
- **Progressive complications**: Escalating obstacles
- **Crisis**: Mandatory choice scene (dilemma with cost)
- **Climax**: Irreversible decision/revelation
- **Resolution**: New equilibrium

**Causality check**: Inciting incident must cause climax

### 4. Act/Sequence Design
Choose model based on length:
- **< 15 min**: 3-act light
- **Feature**: 3-act with 8-sequence substructure
- **Episodic**: 4-6 sequences per episode

Mark major turning points (act breaks, sequence peaks)

### 5. Scene Development
For each scene:
- **Desire**: What does protagonist want now?
- **Opposition**: Who/what blocks it?
- **Tactics**: How protagonist tries to win
- **Turn**: What value reverses?
- **Aftermath**: What new problem created?

**Scene check**: If no value change, cut or redesign

### 6. Dialogue & Style
Only after structure locks:
- Keep dialogue functional (advances conflict or reveals character)
- Match style to genre and reference
- Show don't tell (dramatize exposition)

## Output Format

Deliver:
1. **Logline** (1-2 sentences)
2. **Story spine** (inciting incident, crisis, climax, resolution)
3. **Scene-by-scene outline** or **full script** (user's choice)
4. **McKee analysis** (value arc, causality chain, structure notes)

Optionally create:
- Beat sheet (detailed scene breakdown)
- Character profiles (desire, flaw, arc)
- Storyboards/shot lists (if visual medium)

## Common Pitfalls to Avoid

- ❌ Starting with dialogue/style before structure
- ❌ Passive protagonist (wants nothing, decides nothing)
- ❌ Coincidence-driven plot (convenient discoveries)
- ❌ Expository scenes (no conflict or value change)
- ❌ Off-screen inciting incident (must be on-screen)
- ❌ Weak crisis (choice without real cost)
- ❌ Reversible climax (can be undone)

## Style Adaptation

When user requests specific director/style:
- Study their signature elements (pacing, tone, visual motifs)
- Apply aesthetics AFTER structure is sound
- Never sacrifice causality for style

Example adaptations:
- **Tarantino**: Non-linear but causal; dialogue-heavy but functional
- **Nolan**: Complex timeline but strict logic; reveals as turns
- **Ghibli**: Gentle pacing but clear value arcs; nature as character
- **Koreeda (是枝裕和)**: Restrained emotion; daily moments; open endings

## References

- `../mckee-shared/core/story-spine.md` - Structural elements and definitions
- `../mckee-shared/analysis/scene-analysis.md` - Scene design method
- `../mckee-shared/core/principles.md` - Core McKee principles (brief)

## Output Directory

Save to standard deliverables structure:
- Path: `deliverables/10_story/01_script_v{N}.md`
- Use `artifact-formatter` for metadata
- Use `version-management` for archiving
- Task types: `script`, `outline`, `concept`

Decision log should include:
- Premise and constraints
- Value arc designed
- Key structural choices
- Style adaptations applied
