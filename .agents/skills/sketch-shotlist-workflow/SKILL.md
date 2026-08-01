---
name: sketch-shotlist-workflow
description: Assemble one approved Scene Breakdown and an already compiled Seedance Prompt set into the final Chinese shotlist HTML and package manifest. This Skill owns HTML integration only; Prompt wording belongs to shotlist.prompt_compiler.
---

# Sketch Shotlist Workflow

This is the final HTML assembly stage for one Scene package. The active production chain reaches this Skill only after `shotlist.breakdown` has approved the Scene plan and `shotlist.prompt_compiler` has returned one Prompt for every approved Prompt Envelope.

The final HTML is the reader-facing integration artifact. It combines the approved Shot Rows, source excerpts, asset/reference summary, and compiled Seedance Prompts without changing the creative decisions owned by upstream Skills.

## Slot Compatibility

- slot: `shotlist.html_assembler`
- contract_version: `2`
- canonical_outputs:
  - `deliverables/3_shotlist/<scene-label>_v{N}/Shotlist_<scene-label>_ZH_v{N}.html`
  - `deliverables/3_shotlist/<scene-label>_v{N}/manifest.md`
- required_upstream_slots:
  - `shotlist.breakdown`
  - `shotlist.prompt_compiler`
- qa_handoff: `qa.primary`
- state_contract: `reference-state-v2`

## Ownership Boundary

| Owner | Responsibility |
| --- | --- |
| `shotlist.breakdown` | Scene analysis, Shot Rows, Prompt Envelopes, grouping, IDs, blocking, dialogue mapping, asset needs |
| `shotlist.prompt_compiler` | Final model-facing Prompt structure and wording |
| `shotlist.html_assembler` | HTML layout, manifest, metadata placement, and byte-for-byte Prompt embedding |
| `qa.primary` | Independent source, mapping, state, purity, and rendered-HTML verification |

Prompt compilation is a separate upstream Skill call. This HTML Skill receives compiled Prompt text as input and preserves it byte-for-byte. Camera language, action phrasing, performance detail, lighting, color, sound, style, and Prompt locks remain under the selected Prompt compiler's control.

The active workflow ends with the text-based HTML shotlist. Generated line-art storyboard images, e-conte sheets, preview manifests, and preview-image columns are outside the current workflow.

## Required Inputs

Use the latest numeric version for the selected Scene unless the user names an exact file:

- `deliverables/3_shotlist/<scene-label>_v{N}/03_shotlist_breakdown_<scene-label>_v{N}.md`
- the exact script and audit named by that Breakdown
- one compiled Prompt result for every approved `P###` Prompt Envelope
- the resolved `shotlist.prompt_compiler` implementation name
- exact `P### -> source Shot Rows -> Prompt text` mapping
- optional common asset/style guides under `deliverables/2_assets/`
- optional Scene-specific asset manifest under the Scene package `assets/`
- the four independent reference-state fields for the Scene package

Each compiled Prompt result contains:

- reserved `P###`
- source `<scene-label>-R<NN>` rows
- compiler implementation name
- exact Prompt text returned by that compiler

When a compiled Prompt result is missing, return the missing `P###` list to the orchestrating Agent so it can call `shotlist.prompt_compiler`. HTML assembly resumes after the complete compiled Prompt set exists.

## Outputs

Save current production files directly under `deliverables/3_shotlist/<scene-label>_v{N}/`:

- the upstream `03_shotlist_breakdown_<scene-label>_v{N}.md`
- `Shotlist_<scene-label>_ZH_v{N}.html`
- `manifest.md`
- `assets/asset_manifest.md` when Scene-specific assets exist
- `generated/` only for separately authorized downstream video-test records

The package contains exactly one screenplay Scene. Common reusable assets stay under `deliverables/2_assets/`; the Scene `assets/` folder contains Scene-only additions or explicit overrides.

The HTML and manifest carry matching Artifact metadata. The manifest also records the resolved Prompt compiler, Prompt IDs, source-row mapping, counts, and reference-state fields.

## Reference-State Placement

The package records these independent fields:

- `asset_origin`: `user_provided`, `generated_from_text`, `generated_from_references`, or `mixed`
- `reference_binding`: `none`, `text_only`, or `images_attached`
- `reference_approval`: `draft`, `reviewed`, or `locked`
- `output_status`: `prompt_only`, `smoke_test`, `review_ready`, or `production_approved`

Place them in `manifest.md` and once in the Scene HTML header through `{{REFERENCE_SUMMARY}}`. The copyable Prompt block contains only the exact Prompt returned by `shotlist.prompt_compiler`.

## HTML Assembly Workflow

### Step 1 - Verify the approved Scene package

Match the Breakdown against its named script and audit:

- one exact screenplay Scene
- exact Scene header and source boundaries
- approved Shot Row order
- approved Prompt Envelope grouping
- reserved Prompt IDs
- exact source dialogue and dialogue-to-Row mapping
- approved asset routes and blocking state

Source or grouping ambiguity returns to `shotlist.breakdown` as a visible handoff packet.

### Step 2 - Verify compiled Prompt coverage

For every Prompt Envelope in the Breakdown:

1. Match one compiled result by reserved `P###`.
2. Match its source Shot Rows to the approved Envelope.
3. Confirm the recorded compiler implementation matches the Registry resolution used by the orchestrating Agent.
4. Preserve the returned Prompt text byte-for-byte.

The HTML stage may report a missing or mismatched compiled result. Prompt revision is routed back to `shotlist.prompt_compiler` with the affected Envelope packet.

### Step 3 - Assemble the final HTML

Use `assets/shotlist-house-template.html` and `templates/HTML_TEMPLATE.md`.

The HTML presents six production columns:

1. 镜头行
2. 类型
3. 机位
4. 动作
5. 剧本内容
6. Seedance 2.0 提示词

Preserve:

- `<scene-label>-R<NN>` for Shot Rows
- reserved `P###` for Prompt Envelopes
- Prompt Envelope `rowspan` grouping
- exact source excerpts and dialogue
- non-copyable dialogue mapping attributes on spoken Rows
- exact compiled Prompt text inside `<pre class="prompt-block">`
- copy, search, plan-filter, reset, print, and portable relative-path behavior

Visible reader-facing content defaults to Simplified Chinese. Stable IDs, paths, plan codes, CSS classes, data attributes, and source dialogue remain unchanged.

### Step 4 - Write the manifest

Record:

- artifact ID, version, and upstream IDs
- exact Scene label and source boundaries
- Shot Row count and IDs
- Prompt Envelope count and IDs
- `P### -> source Rows` mapping
- resolved Prompt compiler implementation
- common and Scene-specific asset routes
- all four reference-state fields
- known package limitations

## HTML Quality Gate

Before handoff, confirm:

- Breakdown, compiled Prompt set, HTML, and manifest refer to the same Scene and version.
- Every approved Shot Row appears once and in order.
- Every reserved `P###` appears once and maps to the approved source Rows.
- Every compiled Prompt is embedded byte-for-byte in its matching `<pre>` block.
- Exact source dialogue count, order, cue, text, addressee, and mode remain available through source cells and Row metadata.
- Reference-state metadata appears once in the HTML header and remains outside copyable Prompt blocks.
- HTML contains no unresolved placeholders.
- Search and plan filters preserve complete Prompt Envelope row groups.
- Manifest counts and IDs match the final HTML.
- The HTML contains the six production columns and no generated-storyboard preview column.

## QA Handoff

Run `qa.primary` after HTML assembly. Independent QA compares the raw script, Breakdown, compiled Prompt set, HTML, and manifest directly. It verifies source coverage, IDs, dialogue, asset routes, Prompt purity, metadata placement, and rendered HTML behavior while preserving the selected Prompt compiler's creative ownership.

Real video generation remains a separate user-authorized downstream action and is not triggered by completion of this HTML package.
