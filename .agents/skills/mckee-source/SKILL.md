---
name: mckee-source
description: Access Robert McKee's original book text for quotes, citations, and detailed principle explanations. Use ONLY when user explicitly requests original quotes, book references, or asks "what does McKee say about X" or "quote from the book".
---

# McKee Source Text

## Overview

Provides access to the complete original McKee book text for citation, quotation, and detailed principle lookup. **This skill loads ~95K tokens and should only be used when explicitly needed.**

## When to Use

**Use this skill when**:
- User explicitly asks: "What does McKee say about..."
- User requests: "Quote from the book"
- User needs: "Original text about X"
- User wants: "Chapter reference for Y"

**Do NOT use for**:
- General story advice (use other mckee-* skills instead)
- Structural diagnosis (use `mckee-audit`)
- Scene fixes (use `mckee-scene-doctor`)
- Planning rewrites (use `mckee-rewrite-plan`)

## Available Resources

### Complete Book Text
`references/mckee-story-book.md`

Contains the full text (~378KB) organized by chapters:
- The Story Problem
- The Structure Spectrum
- Structure and Setting
- Structure and Genre
- Structure and Character
- Structure and Meaning
- The Substance of Story
- The Principles of Story Design
- Story Climax
- Scene Design
- Scene Analysis
- Composition
- Crisis, Climax, and Resolution
- The Writer at Work

### Chapter Index
`../mckee-shared/source/mckee-source-map.md`

Quick lookup showing where to find specific topics within the book.

### Curated Excerpts
`../mckee-shared/source/excerpts.md`

Short, frequently-referenced passages for common questions.

## Usage Guidelines

### Citation Format
When quoting McKee:
- Keep quotes brief (< 100 words unless necessary)
- Provide chapter context
- Paraphrase when possible
- Use excerpts file first before full text

### Search Strategy
1. Check `../mckee-shared/source/excerpts.md` for common quotes
2. Use `../mckee-shared/source/mckee-source-map.md` to locate topic
3. Read relevant chapter section from full text
4. Quote or paraphrase with attribution

### Avoid
- Do not reproduce long passages (copyright)
- Do not use as substitute for analysis
- Do not default to this when other skills suffice

## Common Lookup Topics

Topics users frequently request:

**Structure concepts**:
- Inciting incident vs. crisis vs. climax
- Act design and turning points
- Causality and the "because" test
- Obligatory scene

**Scene principles**:
- Scene vs. sequence
- Beats and turning points
- Value change method

**Character and desire**:
- Conscious vs. unconscious desire
- Character arc and revelation
- True choice and cost

**Story design**:
- Gap between expectation and result
- Progressive complications
- Climactic vs. non-climactic endings

Use `../mckee-shared/source/mckee-source-map.md` to locate these topics.

## Example Usage

**User**: "What does McKee say about the crisis vs the climax?"

**Process**:
1. Check `../mckee-shared/source/mckee-source-map.md` → "Crisis, Climax, and Resolution" chapter
2. Read relevant section from full text
3. Provide brief quote with chapter reference
4. Paraphrase core distinction

**Response format**:
```
McKee distinguishes crisis from climax in the "Crisis, Climax, and Resolution" chapter:

[Brief relevant quote]

In essence: Crisis is the choice, climax is the consequence. The crisis asks the hard question; the climax answers it.
```

## Output Boundary

Output quotes and analysis directly in agent's response (no file creation needed)
Do not create deliverables, archives, or source quote files unless `screenwriter-workflow` explicitly wraps the result into a report.

## References

- `references/mckee-story-book.md` - Complete book text (~95K tokens, kept local due to size)
- `../mckee-shared/source/mckee-source-map.md` - Chapter and topic index
- `../mckee-shared/source/excerpts.md` - Frequently quoted passages
