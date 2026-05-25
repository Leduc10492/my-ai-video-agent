---
name: mckee-audit
description: Audit story structure using McKee principles. Diagnose story/act/scene issues, identify causality problems, rank fixes by severity (P0-P3). Use when user requests script review, story diagnosis, structural analysis, or asks "what's wrong with my story".
---

# McKee Story Audit

## Overview

Systematically diagnose structural, causal, and scene-level problems in scripts, outlines, or narrative prose. Rank issues by impact and provide evidence-based fixes.

## Workflow (6 Steps)

### 1. Intake
Identify:
- Medium (script, outline, prose, etc.)
- Length and format
- Current act or sequence model (if specified)

### 2. Story Spine Check
Locate and evaluate:
- **Inciting incident**: Dynamic event that breaks equilibrium
- **Crisis**: Mandatory scene testing strongest opposing force
- **Climax**: Irreversible decision or revelation
- **Resolution**: New equilibrium

### 3. Act/Sequence Map
Mark each major reversal and value shift:
- 3-act: Act 1 turn, Act 2 midpoint, Act 2 turn, Climax
- 8-sequence: Track peak of each sequence

### 4. Scene Pass
For each scene, verify:
- **Desire**: What does protagonist want now?
- **Opposition**: Who/what blocks it?
- **Turn**: What value reverses by end?
- **Value change**: Positive to negative (or reverse)

### 5. Causality Pass
Trace cause-effect chains:
- Does inciting incident cause the climax?
- Are turning points motivated or coincidental?
- Do character choices create consequences?

### 6. Output
Rank issues by severity:
- **P0**: Story spine broken (missing inciting incident or climax)
- **P1**: Act or sequence turns weak/absent
- **P2**: Scene turns weak; value change unclear
- **P3**: Exposition or dialogue problems

Use `../mckee-shared/templates/audit-report.md` for report format.

## Core Diagnostic Questions

Use `../mckee-shared/analysis/mckee-cards.md` for detailed audit questions organized by principle.

Quick checks:
- Is inciting incident on-screen and early (first quarter)?
- Does it flip a value and project an obligatory scene?
- Is there a clear causal link from inciting incident to climax?
- Do major choices force real costs (gain one value, lose another)?
- Are tension/relief waves building toward higher peaks?

See `../mckee-shared/analysis/checklists.md` for comprehensive diagnostic lists.

## Decision Rules

### Act Model Selection
If not specified:
- **< 15 min**: 3-act light
- **Feature/longform**: 3-act with 8-sequence substructure
- **Episodic**: 4-6 sequences per episode + season arc

See `../mckee-shared/analysis/mckee-workflows.md` for severity scale and decision rules.

## Output Format

Use the Audit Report template:
```
Title:
Medium/Format:
Act Model:
Logline:

Top Issues (ranked):
1) Issue: [description]
   Evidence: [specific examples]
   Impact: [why it matters]
   Severity: P0/P1/P2/P3
   Fix: [recommended solution]

Story Spine Check:
- Inciting incident: [evaluation]
- Crisis choice: [evaluation]
- Climax: [evaluation]
...
```

Full template in `../mckee-shared/templates/audit-report.md`.

## Output Directory

Save to standard deliverables structure:
- Input: `deliverables/10_story/01_script_v*.md` (read latest version)
- Output: `deliverables/10_story/01_audit_report_v{N}.md`
- Use `artifact-formatter` for metadata

Audit report should include:
- Goals and constraints
- Key principles applied
- Major issues found (P0-P3 prioritized)
- Recommended fix priority

## References

- `../mckee-shared/analysis/mckee-cards.md` - Principle cards with audit questions
- `../mckee-shared/analysis/mckee-workflows.md` - Severity scale and decision rules
- `../mckee-shared/templates/audit-report.md` - Standard audit report format
- `../mckee-shared/analysis/checklists.md` - Diagnostic checklists by story element
