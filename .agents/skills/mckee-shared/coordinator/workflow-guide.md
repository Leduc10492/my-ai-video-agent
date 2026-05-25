# Workflow Selection Guide

## Quick Decision Tree

```
Want to CREATE a new story from scratch?
└─ Yes → mckee-create

User has existing script/outline?
├─ Yes → Want diagnosis? → mckee-audit
│        Want fix plan? → mckee-rewrite-plan
│        Want alternatives? → mckee-variations
│
└─ No → Working on a single scene? → mckee-scene-doctor
         Need to expand/adjust rhythm? → mckee-expand-pace
         Need McKee quotes? → mckee-source
```

## Detailed Workflow Descriptions

### mckee-create ✨ NEW
**When to use:**
- User wants to write a NEW story from scratch
- Has premise/idea but needs structure and development
- Requests like: "write a story about X", "create a script", "help me develop this concept"

**Output:** Complete story/script with McKee structure analysis

### mckee-audit
**When to use:**
- User has a complete or near-complete draft
- Needs comprehensive diagnosis of structural problems
- Wants prioritized list of issues (P0-P3 severity)
- Requests like: "review my script", "what's broken", "audit this story"

**Output:** Ranked issues with evidence, impact, and fixes

### mckee-rewrite-plan
**When to use:**
- User knows problems exist and needs a fix strategy
- Wants phased approach (structure → scenes → polish)
- Requests like: "how to fix this", "rewrite plan", "revision strategy"

**Output:** Multi-phase plan with structural fixes, scene triage, polish tasks

### mckee-scene-doctor
**When to use:**
- User focusing on a single scene or moment
- Scene feels flat, unclear, or lacks impact
- Requests like: "fix this scene", "this moment doesn't work", "scene feels off"

**Output:** Scene table with desire, opposition, turn, aftermath, and fixes

### mckee-expand-pace
**When to use:**
- Draft structure is sound but rhythm/density needs adjustment
- Need to add beats, control information flow, adjust tension
- Requests like: "add tension", "expand this", "slow down here", "exposition problems"

**Output:** Beat additions, rhythm adjustments, exposition strategy

### mckee-variations
**When to use:**
- User wants creative alternatives
- Exploring different story engines or climaxes
- Requests like: "what if...", "give me alternatives", "different endings"

**Output:** Multiple variations maintaining principles but changing conflict engines

### mckee-source
**When to use:**
- User explicitly requests original McKee quotes
- Needs citation for a principle
- Wants to verify what McKee says about a topic
- Requests like: "what does McKee say about...", "quote from the book", "original text"

**Output:** Relevant quotes with chapter references

## Token Efficiency

| Workflow | Typical Token Load |
|----------|-------------------|
| **mckee-create** | **~15K** |
| mckee-audit | ~2.5K |
| mckee-rewrite-plan | ~1.5K |
| mckee-scene-doctor | ~1K |
| mckee-expand-pace | ~1.5K |
| mckee-variations | ~1K |
| mckee-source | ~95K (only when needed) |

## Workflow Combinations

Common sequences:
1. **mckee-create** → **mckee-audit** (create then refine)
2. **mckee-audit** → **mckee-rewrite-plan** → **mckee-scene-doctor** (full revision)
3. **mckee-scene-doctor** → **mckee-expand-pace** (scene-level refinement)
4. **mckee-audit** → **mckee-variations** (explore alternatives after diagnosis)
