---
name: mckee-audit
description: Internal McKee audit plugin for story structure packets. Diagnose story/act/scene issues, identify causality problems, and rank fixes by severity (P0-P3). Use when screenwriter-workflow or mckee-coordinator requests McKee audit support, or when the user explicitly asks for McKee diagnosis. Returns an audit packet, not final audit artifact ownership.
---

# McKee Story Audit

## Overview

Systematically diagnose structural, causal, and scene-level problems in scripts, outlines, or narrative prose. Rank issues by impact and provide evidence-based fixes.

## Output Language

Default to Simplified Chinese for all user-facing audit output unless the user explicitly requests another language.

Use Chinese headings, table headers, issue descriptions, evidence, impact, and fix recommendations. Keep `P0/P1/P2/P3`, file paths, artifact IDs, and exact quoted source dialogue unchanged when needed for accuracy.

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
标题:
媒介/格式:
幕结构模型:
Logline:

核心问题（按优先级）:
1) 问题: [描述]
   证据: [具体例子]
   影响: [为什么重要]
   Severity: P0/P1/P2/P3
   修复建议: [推荐解决方案]

故事脊柱检查:
- 激励事件: [评估]
- 危机选择: [评估]
- 高潮: [评估]
...
```

Full template in `../mckee-shared/templates/audit-report.md`.

## Output Boundary

Return an audit packet to `screenwriter-workflow`.
Do not save `deliverables/1_story/01_audit_report_v{N}.md` directly.
Do not update artifact metadata, archives, or changelog directly.

Audit report should include:
- 目标与限制
- 已应用的关键原则
- 主要问题（P0-P3排序）
- 推荐修复优先级

## References

- `../mckee-shared/analysis/mckee-cards.md` - Principle cards with audit questions
- `../mckee-shared/analysis/mckee-workflows.md` - Severity scale and decision rules
- `../mckee-shared/templates/audit-report.md` - Standard audit report format
- `../mckee-shared/analysis/checklists.md` - Diagnostic checklists by story element
