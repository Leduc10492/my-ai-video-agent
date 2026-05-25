---
name: mckee-coordinator
description: McKee story principles coordinator. Routes story requests to specialized sub-skills (create, audit, rewrite, scene doctor, expand & pace, variations, source quotes). Use when user mentions McKee principles, story work, or narrative tasks without specifying which tool to use.
---

# McKee Coordinator

## Overview

This skill coordinates all McKee-based story work by routing requests to specialized sub-skills. Each sub-skill handles a specific workflow with minimal token overhead.

## Available Sub-Skills

1. **mckee-create** - Create original stories from scratch (NEW ✨)
2. **mckee-audit** - Diagnose story/act/scene issues and rank fixes
3. **mckee-rewrite-plan** - Build staged structural and scene-level changes
4. **mckee-scene-doctor** - Repair a single scene with desire, conflict, and turn
5. **mckee-expand-pace** - Add beats, control rhythm, manage exposition
6. **mckee-variations** - Generate creative alternatives under principled constraints
7. **mckee-source** - Access original McKee book text for quotes and citations

## Routing Logic

**If user request mentions:**
- **"write", "create", "generate story", "make a script"** → Use `mckee-create`
- "audit", "diagnose", "what's wrong", "review" → Use `mckee-audit`
- "rewrite", "plan", "fix structure", "revision strategy" → Use `mckee-rewrite-plan`
- "scene", "this scene", "fix this moment" → Use `mckee-scene-doctor`
- "expand", "pace", "rhythm", "beats", "exposition" → Use `mckee-expand-pace`
- "variations", "alternatives", "different approach", "what if" → Use `mckee-variations`
- "original text", "McKee says", "quote", "book reference" → Use `mckee-source`

**Important**: If user wants to CREATE a new story from scratch → Use `mckee-create`  
**If unclear, ask the user to clarify.**

## Core Principles (Priority Order)

All sub-skills follow these foundational principles:

1. **Story over prose** - Fix structure, causality, and motivation before style
2. **Value change** - Each scene and act must turn a value-charged condition
3. **Causality over coincidence** - Events should be motivated and linked
4. **Desire and conflict** - Protagonist pursuit meets escalating opposition
5. **Obligatory scene** - Promised payoff must be delivered
6. **Climax is irreversible** - Final turn permanently changes the story world
7. **Exposition serves conflict** - Reveal only what pressure demands
8. **Archetype, not stereotype** - Unique expression with universal stakes

See `../mckee-shared/core/principles.md` for detailed principle explanations.

## Act Model Decision

If user does not specify an act model:
- **Short form** (< 15 min): 3-act light (inciting incident, major turn, climax)
- **Feature/longform**: 3-act with 8-sequence substructure
- **Episodic**: 4-6 sequence beats per episode, plus season arc

## Output Directory Management

All sub-skills follow the standard deliverables structure:
- Current versions: `deliverables/10_story/`
- Archived versions: `archives/10_story/`
- File naming: `01_script_v{N}.md`, `01_audit_report_v{N}.md`

See `artifact-formatter` and `version-management` skills for details.

## Usage Examples

```
User: "Write me a 3-minute story about two people in the snow"
→ Trigger mckee-create

User: "Can you review my script and tell me what's broken?"
→ Trigger mckee-audit

User: "Help me plan how to fix the second act"
→ Trigger mckee-rewrite-plan

User: "This confrontation scene feels flat"
→ Trigger mckee-scene-doctor

User: "I need to add more tension before the climax"
→ Trigger mckee-expand-pace

User: "Give me 3 different ways this story could end"
→ Trigger mckee-variations

User: "What does McKee say about crisis vs climax?"
→ Trigger mckee-source
```

## References

- `../mckee-shared/core/principles.md` - Detailed explanation of 8 core principles
- `../mckee-shared/coordinator/workflow-guide.md` - When to use which sub-skill
