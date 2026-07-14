---
name: qa-workflow
description: Run human-readable quality assurance for the shotlist-first AI video workflow, including source coverage, directing, prompt-envelope, HTML, preview, and generated-output review.
---

# QA Workflow

## Slot Compatibility

- slot: `qa.primary`
- contract_version: `1`
- canonical_outputs:
  - `deliverables/00_admin/qa_reports/qa_report_<stage>_v{N}.md`
- qa_handoff: `none`
- state_contract: `reference-state-v2`

Use this skill when the user asks to check quality, continue safely, modify an upstream artifact, validate project state before generating downstream outputs, or review Seedance/Higgsfield shotlist batches.

This is the current default implementation for the `qa.primary` slot in `.agents/skill_registry.md`.

## Output Language

Default to Simplified Chinese for all user-facing QA output unless the user explicitly requests another language.

This includes chat findings, persistent QA reports, table headers, issue descriptions, evidence, suggested fixes, downstream impact, and status summaries. Keep technical tokens such as paths, artifact IDs, reference-state values, scene labels, shot-row IDs, `P###`, and `P0/P1/P2/P3` unchanged.

## Inputs

- `deliverables/00_admin/locks.md`
- `.agents/skill_registry.md` when checking workflow architecture or replacement skills
- Latest relevant deliverables in the affected stage
- Upstream deliverables listed in artifact metadata
- Scene package shotlist HTML and preview manifest when applicable
- Generated asset or generated video test manifests when applicable
- `qa-checklists` for stage-specific checks

## Trigger Points

Run QA:

1. before entering Phase 4 shotlist HTML generation
2. after dense scene prompt drafting
3. before splitting or merging any overloaded scene scope
4. after shotlist HTML and previews are complete
5. after real video generation tests are saved
6. after editing any upstream artifact
7. before saving a new production version
8. when user asks "检查一下", "有没有问题", "当前状态", or "能不能继续"

## QA Modes

| Mode | When | Output |
| --- | --- | --- |
| State check | User asks progress/current state | concise status in chat |
| Stage QA | One stage just finished | issue list + optional report |
| Scene QA | A scene's prompt envelopes are drafted | scene / shot-row / `P###` findings before previews or generated tests |
| Regression QA | Upstream changed | impacted downstream list |
| Final QA | Before delivery/export | persistent report recommended |

## Structural Checks

Always check:

- production deliverables use `_v{N}` naming where applicable
- artifact metadata exists
- artifact `version` matches the filename suffix
- `upstream` IDs exist in current or archived artifacts
- required upstream files exist
- `locks` are not contradicted
- latest numeric version is used
- default skills listed in `.agents/skill_registry.md` exist and preserve canonical output paths

For shotlist work, also check:

- `03_shotlist_breakdown_v{N}.md` exists before large Phase 4 work, or legacy input is explicitly marked as migration source
- screenplay scene labels, shot rows, prompt-envelope IDs, and source scene mapping are consistent
- prompt envelopes include reference facts, planted camera, first-frame composition, physical action path, unique micro-beats, shot-specific failure locks, adjacent-beat boundary, and reference status
- shot rows use `<scene-label>-R<NN>`, prompt envelopes use reserved `P###` IDs, and mappings are explicit
- preview manifest entries match HTML prompt envelopes
- HTML preview paths are relative and files exist
- shotlist HTML lives under `deliverables/30_shotlist/scenes/<scene-scope>_v{N}/`
- common references come from `deliverables/20_assets/`, while scene package `assets/` contains only scene-specific additions or explicit overrides
- generated video tests are labeled with source prompt envelope, all four reference-state fields, and known limitations

For generated image/video work, validate manifests and paths directly: source `P###`, reference mode, scene package location, relative preview paths, file existence, and known limitations.

## Stage Checks

Use `qa-checklists` sections:

- script
- asset/style guide
- shotlist breakdown
- shotlist prompt envelope
- shotlist HTML/preview
- generated assets and generated video tests
- regression matrix

## Persistent QA Reports

Save a report only when the user explicitly asks for a persistent QA artifact. Otherwise report findings in chat.

When requested, save it under:

`deliverables/00_admin/qa_reports/qa_report_<stage>_v{N}.md`

Use this report shape:

```markdown
# Artifact: QA Report
- id: A-<yyyymmdd>-<nnn>
- version: v<number>
- upstream: [<artifact ids>]
- locks:
  - must_keep: []
  - must_avoid: []
  - budget_notes: []

---

# QA 报告: <阶段>
- 日期: YYYY-MM-DD
- 范围: <检查的文件、scene/row/P range>
- 结果: pass / pass-with-warnings / blocked

## 问题清单

| 优先级 | 文件 / ID | 问题 | 证据 | 建议修复 | 状态 |
| --- | --- | --- | --- | --- | --- |

## 分类结论

| 分类 | 结论 |
| --- | --- |
| 结构 | ... |
| 空间连续性 | ... |
| Prompt 可执行性 | ... |
| Reference Status | ... |
| 平台生产风险 | ... |
| 创作口味建议 | ... |

## 下游影响

| 变更 artifact | 受影响 artifact | 必要动作 |
| --- | --- | --- |
```

For structural checks, inspect the actual artifact headers, source IDs, Shot Row and Prompt mappings, HTML content, relative paths, and referenced files. Structural consistency is evidence only; creative prompt quality, spatial logic, and source fidelity require scene-level review.

## Priority Scale

- P0: blocks the workflow or violates hard locks.
- P1: likely causes visible inconsistency or wrong output.
- P2: quality improvement recommended.
- P3: optional polish.

## Output Principles

- Lead with blockers.
- Separate structure, spatial continuity, prompt executability, reference status, platform production risk, and taste recommendations.
- Give concrete file paths and affected scene labels, shot rows, and `P###` IDs.
- Do not rewrite creative content during QA unless the user asks for fixes.
- Do not replace `sketch-shotlist-workflow` internal hard gates; QA verifies that those gates were applied and catches missed failures.
