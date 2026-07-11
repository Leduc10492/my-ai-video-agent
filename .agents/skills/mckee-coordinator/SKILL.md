---
name: mckee-coordinator
description: Internal McKee story principles router for structure packets, audits, rewrite plans, scene repair, pacing, variations, and source quotes. Use when the user explicitly asks for McKee analysis/source material or when screenwriter-workflow requests McKee structure support. Do not use as the default screenplay creation entrance.
---

# McKee Coordinator

## Slot Compatibility

- slot: `story.mckee_router`
- contract_version: `1`
- canonical_outputs:
  - `structure, audit, rewrite, scene, pacing, variation, and source packets`
- qa_handoff: `script.primary`
- state_contract: `n/a`

## Overview

This skill coordinates McKee-based story support by routing requests to specialized sub-skills. It is not the screenplay-stage entrance. General script creation starts in `screenwriter-workflow`, which may call this coordinator after Story Bone intake.

## Output Language

Default to Simplified Chinese for all user-facing McKee outputs unless the user explicitly requests another language.

This applies to structure packets, audits, rewrite plans, scene diagnoses, pacing notes, variations, and chat summaries. Keep skill names, file paths, artifact IDs, McKee source quotes, and severity tokens such as `P0/P1/P2/P3` unchanged when needed.

## Available Sub-Skills

1. **mckee-create** - Create McKee structure packets for new or weak premises
2. **mckee-audit** - Diagnose story/act/scene issues and rank fixes
3. **mckee-rewrite-plan** - Build staged structural and scene-level changes
4. **mckee-scene-doctor** - Repair a single scene with desire, conflict, and turn
5. **mckee-expand-pace** - Add beats, control rhythm, manage exposition
6. **mckee-variations** - Generate creative alternatives under principled constraints
7. **mckee-source** - Access original McKee book text for quotes and citations

## Routing Logic

**If request or caller needs:**
- Explicit McKee creation support, or `screenwriter-workflow` asks for story-spine support → Use `mckee-create`
- "audit", "diagnose", "what's wrong", "review" → Use `mckee-audit`
- "rewrite", "plan", "fix structure", "revision strategy" → Use `mckee-rewrite-plan`
- "scene", "this scene", "fix this moment" → Use `mckee-scene-doctor`
- "expand", "pace", "rhythm", "beats", "exposition" → Use `mckee-expand-pace`
- "variations", "alternatives", "different approach", "what if" → Use `mckee-variations`
- "original text", "McKee says", "quote", "book reference" → Use `mckee-source`

**Important**: If the user generally wants to write or create a screenplay, use `screenwriter-workflow` first. `mckee-create` returns structure support only; it does not own final script artifacts.
**If unclear, return to `screenwriter-workflow` or ask one narrow clarification question.**

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

## Output Boundary

McKee sub-skills return packets: structure, audit, rewrite, scene, pacing, variation, or source notes. They do not save final `01_script_v{N}.md` or `01_audit_report_v{N}.md` artifacts directly unless wrapped by `script.primary`.

Use `screenwriter-workflow` for artifact ownership, versioning, changelog, archiving, and DOCX export.

## Usage Examples

```
Caller: `screenwriter-workflow` has a confirmed Story Bone but needs a McKee structure packet
→ Trigger mckee-create

User: "Use McKee to build the structure for this premise"
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
