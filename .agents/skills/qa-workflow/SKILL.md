---
name: qa-workflow
description: Run quality assurance for the file-based AI video workflow, including artifact metadata checks, stage QA, regression checks after upstream changes, and persistent QA report creation.
---

# QA Workflow

Use this skill when the user asks to check quality, continue safely, modify an upstream artifact, or validate project state before generating downstream outputs.

This is the current default implementation for the `qa.primary` slot in `.agents/skill_registry.md`.

## Output Language

Default to Simplified Chinese for all user-facing QA output unless the user explicitly requests another language.

This includes chat findings, persistent QA reports, table headers, issue descriptions, evidence, suggested fixes, downstream impact, and status summaries. Keep file paths, artifact IDs, version suffixes, skill IDs, status tokens, and P0/P1/P2/P3 severity labels unchanged.

## Inputs

- `deliverables/00_admin/locks.md`
- `.agents/skill_registry.md` when checking workflow architecture or replacement skills
- Latest relevant deliverables in the affected stage
- Upstream deliverables listed in artifact metadata
- `qa-checklists` for stage-specific checks

## Trigger Points

Run QA:

1. before entering a downstream stage
2. after editing any upstream artifact
3. before saving a new version
4. after generating art/video prompts
5. when user asks "检查一下", "有没有问题", "当前状态", or "能不能继续"

## QA Modes

| Mode | When | Output |
| --- | --- | --- |
| State check | User asks progress/current state | concise status in chat |
| Stage QA | One stage just finished | issue list + optional report |
| Regression QA | Upstream changed | impacted downstream list |
| Final QA | Before delivery/export | persistent report recommended |

## Structural Checks

Always check:

- production deliverables use `_v{N}.md`
- artifact metadata exists
- artifact `version` matches filename suffix
- `upstream` IDs exist in current or archived artifacts
- required upstream files exist
- `locks` are not contradicted
- latest numeric version is used
- default skills listed in `.agents/skill_registry.md` exist and preserve canonical output paths

For generated image work, also run `scripts/validate-generated-assets.ps1`. This separates draft review images from production-ready reference-bound keyframes.

## Stage Checks

Use `qa-checklists` sections:

- script
- asset/style guide
- storyboard
- storyboard prompts
- art prompts
- generated assets
- video prompts
- regression matrix

## Persistent QA Reports

For anything beyond a quick chat check, save a report under:

`deliverables/00_admin/qa_reports/qa_report_<stage>_v{N}.md`

Use this report shape:

```markdown
# QA 报告: <阶段>
- 日期: YYYY-MM-DD
- 范围: <检查的文件>
- 结果: pass / pass-with-warnings / blocked

## 问题清单

| 优先级 | 文件 | 问题 | 证据 | 建议修复 | 状态 |
| --- | --- | --- | --- | --- | --- |

## 下游影响

| 变更 artifact | 受影响 artifact | 必要动作 |
| --- | --- | --- |
```

If the user only asks for a quick read, report in chat and do not create a file unless useful.

## Priority Scale

- P0: blocks the workflow or violates hard locks.
- P1: likely causes visible inconsistency or wrong output.
- P2: quality improvement recommended.
- P3: optional polish.

## Output Principles

- Lead with blockers.
- Separate structural problems from creative opinions.
- Give concrete file paths and affected shot/beat IDs.
- Do not rewrite creative content during QA unless the user asks for fixes.
- Use Chinese section names such as `结构问题`, `连续性问题`, `生产可行性`, `创作口味建议`, and `下游影响` when they make the report easier to scan.
