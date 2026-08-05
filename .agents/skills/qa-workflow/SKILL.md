---
name: qa-workflow
description: Run human-readable quality assurance for the shotlist-first AI video workflow, including source coverage, directing, Prompt compilation, final HTML, and generated-output review.
---

# QA Workflow

## Slot Compatibility

- slot: `qa.primary`
- contract_version: `1`
- canonical_outputs:
  - `deliverables/0_admin/qa_reports/qa_report_<stage>_v{N}.md`
- qa_handoff: `none`
- state_contract: `reference-state-v2`

Use this skill when the user asks to check quality, continue safely, modify an upstream artifact, validate project state before generating downstream outputs, or review Seedance/Higgsfield shotlist batches.

This is the current default implementation for the `qa.primary` slot in `.agents/skill_registry.md`.

## Output Language

Default to Simplified Chinese for all user-facing QA output unless the user explicitly requests another language.

This includes chat findings, persistent QA reports, table headers, issue descriptions, evidence, suggested fixes, downstream impact, and status summaries. Keep technical tokens such as paths, artifact IDs, reference-state values, scene labels, shot-row IDs, `P###`, and `P0/P1/P2/P3` unchanged.

## Inputs

- `deliverables/0_admin/locks.md`
- `.agents/skill_registry.md` when checking workflow architecture or replacement skills
- Latest relevant deliverables in the affected stage
- Upstream deliverables listed in artifact metadata
- Scene package shotlist HTML and manifest
- Generated asset or generated video test manifests when applicable
- `qa-checklists` for stage-specific checks

## Interaction Mode Contract

Resolve `interaction_mode` from `AGENTS.md` and include it in every stage conclusion:

- `interactive`: report P0—P3 with evidence and repair options. Do not repair creative artifacts or advance the owning stage until the user accepts the risk or selects a repair. A structural pass is presented as eligible for approval, not as approval itself.
- `autonomous`: QA is part of a repair loop, not a terminal report. Route each finding to the owning Skill, verify the actual revision, and re-run the affected QA. Block the stage while any P0/P1 or fixable P2 that affects downstream completeness remains. Apply or route clear low-risk P3 polish when it improves completeness without changing canon.

Missing production references are stage-dependent: they are not screenplay-structure P0/P1, but they block production-mode image/video work. In autonomous mode, return them to `guides.primary` for reference generation and QA rather than merely carrying them into final QA. Final QA must not be the first place a detectable stage problem appears.

## Trigger Points

Run QA:

1. after the selected Scene Breakdown is complete and before HTML generation
2. after each dense or split-required Scene prompt batch
3. before splitting or merging any overloaded scene scope
4. after shotlist HTML assembly is complete
5. after real video generation tests are saved
6. after editing any upstream artifact
7. before saving a new production version
8. when user asks "检查一下", "有没有问题", "当前状态", or "能不能继续"

## QA Modes

| Mode | When | Output |
| --- | --- | --- |
| State check | User asks progress/current state | concise status in chat |
| Stage QA | One stage just finished | issue list + optional report |
| Scene QA | A Scene's Prompt Envelopes are compiled | Scene / Shot Row / `P###` findings before HTML assembly or generated tests |
| Regression QA | Upstream changed | impacted downstream list |
| Final QA | Before delivery/export | persistent report recommended |

In autonomous mode, every Stage QA result also includes `repair_required`, `repair_owner`, `recheck_scope`, and the evidence that the recheck passed. A `pass-with-warnings` result may advance only when remaining warnings are non-fixable external blockers or explicitly out-of-scope P3 items.

## Structural Checks

Always check:

- production deliverables use `_v{N}` naming where applicable
- artifact metadata exists
- artifact `version` matches the filename suffix
- `upstream` IDs exist in current or archived artifacts
- required upstream files exist
- the current script and audit versions match, and unresolved P0/P1 findings block guides and shotlist production
- `locks` are not contradicted
- latest numeric version is used
- default skills listed in `.agents/skill_registry.md` exist and preserve canonical output paths

For shotlist work, also check:

- `03_shotlist_breakdown_<scene-label>_v{N}.md` exists in the selected Scene folder before HTML work, or legacy input is explicitly marked as migration source
- screenplay scene labels, shot rows, prompt-envelope IDs, and source scene mapping are consistent
- `shotlist.prompt_compiler` resolves through `.agents/skill_registry.md` to one existing Prompt-only Skill, and the package manifest records the resolved implementation
- each approved Prompt Envelope has one result from the resolved compiler, and the HTML embeds that result byte-for-byte
- all four reference-state fields appear exactly once in the Scene HTML header, match `manifest.md`, and never appear inside `.prompt-block`
- shot rows use `<scene-label>-R<NN>`, prompt envelopes use reserved `P###` IDs, and mappings are explicit
- spoken Rows expose source cue, exact text, addressee, and lip-sync/off-screen mode through non-copyable `<tr>` data attributes; Prompt Envelopes contain the exact line naturally but no Row IDs or QA mapping prose
- shotlist HTML and Breakdown live together under `deliverables/3_shotlist/<scene-label>_v{N}/`
- common references come from `deliverables/2_assets/`, while scene package `assets/` contains only scene-specific additions or explicit overrides
- generated video tests are labeled with source prompt envelope, all four reference-state fields, and known limitations

For generated asset/video work, validate manifests and paths directly: source artifact or `P###`, reference mode, package location, file existence, and known limitations.

## Independent Shotlist Validation

For a local Scene package or multi-Scene replay, run:

```bash
node .agents/skills/qa-workflow/scripts/validate-shotlist-project.mjs \
  --script <script-path> \
  --shotlist-root <deliverables/3_shotlist> \
  --require-complete
```

Use `--require-complete` for a full-screenplay replay so any missing Scene package blocks the run. Omit it when intentionally validating only the available Scene package or a partial production batch; the missing remainder is then reported as a warning.

The validator derives expected Scenes and source dialogue from the raw screenplay, then inspects Scene folders, HTML, and manifests directly. Do not use a renderer's in-memory objects, builder decisions, copied expected counts, or the builder manifest as the source of truth. Manifest values are claims to compare against independently counted files and HTML content.

Treat its result as structural evidence, not creative proof. Independently review speaker/addressee against current Scene action, adjacent exchange, eyeline, and blocking; review camera, performance, spatial continuity, and Prompt executability as human directing judgments. Validate at least one deliberately corrupted temporary copy so a missing/duplicate dialogue line, reused lip-sync Row, duplicate/gapped `P###`, unresolved placeholder, or broken Prompt-row grouping is proven to fail.

Keep three conclusions separate:

- structural proof: source coverage, IDs, paths, states, and file consistency
- browser proof: rendered HTML, copy/filter behavior, layout, and visible metadata state
- generation proof: saved image/video output from the named prompt and reference state

## Stage Checks

Use `qa-checklists` sections:

- script
- asset/style guide
- shotlist breakdown
- shotlist prompt envelope
- shotlist HTML
- generated assets and generated video tests
- regression matrix

## Persistent QA Reports

Save a report only when the user explicitly asks for a persistent QA artifact. Otherwise report findings in chat.

When requested, save it under:

`deliverables/0_admin/qa_reports/qa_report_<stage>_v{N}.md`

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

For dialogue, compare raw screenplay lines against the HTML in source order. Each source line must occur once, keep its raw speaker cue and exact wording, and occupy one lip-sync Shot Row/internal shot unless the source marks it `O.S.` / `V.O.`. Multiple lines may share one Prompt Envelope, but may not reuse the same lip-sync Row. Do not accept a guessed addressee, generic stand-in, or unexplained self-direction as a clean pass; inspect the Scene evidence and report ambiguity without inventing a new field or label.

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
- An explicit autonomous instruction counts as a request for bounded fixes. QA still routes creative changes to the owning Skill instead of silently rewriting them inside the report.
- Prompt rewrites return to the resolved `shotlist.prompt_compiler`; HTML fixes preserve the compiled Prompt text byte-for-byte.
