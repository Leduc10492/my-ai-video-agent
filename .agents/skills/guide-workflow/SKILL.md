---
name: guide-workflow
description: Create and maintain visual asset and style guides for the file-based AI video workflow. Use when producing 02_asset_guide_v{N}.md, 02_style_guide_v{N}.md, registering local reference images, or preparing continuity anchors before shotlist breakdown and Seedance/Higgsfield work.
---

# Guide Workflow

Use this skill to create or revise the guide stage under `deliverables/20_guides/`.

## Required Inputs

- Latest script: `deliverables/10_story/01_script_v{N}.md`
- Optional audit report: `deliverables/10_story/01_audit_report_v{N}.md`
- Optional shotlist breakdown: `deliverables/30_breakdown/03_shotlist_breakdown_v{N}.md`
- Optional legacy planning input: `deliverables/30_breakdown/03_storyboard_v{N}.md`
- Global locks: `deliverables/00_admin/locks.md`
- Existing guide versions, if any
- User-provided reference images or style requirements, if any

If there is no script and the user has not supplied equivalent story context, stop and request the missing source. Do not invent character names, shot counts, platform choices, or reference image paths.

## Outputs

- Asset guide: `deliverables/20_guides/02_asset_guide_v{N}.md`
- Style guide: `deliverables/20_guides/02_style_guide_v{N}.md`
- Optional reference images under `deliverables/20_guides/refs/`

Both guide files are production deliverables and must use artifact metadata. Use `artifact-formatter` and `version-management` when saving.

## Asset Guide Contract

The asset guide owns continuity facts that downstream shotlist and generation stages must not reinterpret:

| Section | Required Content |
| --- | --- |
| Project context | Format, target duration, visual constraints from locks |
| Characters | Stable visual DNA, costume states, age/time variants, expression range |
| Character references | Local image path, role, status: provided / missing / draft / approved |
| Locations | Spatial layout, lighting logic, recurring background details |
| Props and motifs | Appearance, state changes, shots or beats where they appear |
| Continuity rules | What must remain stable across shotlist breakdown, prompt envelopes, previews, and generated video tests |
| Open gaps | Missing refs, unresolved costume/prop/location decisions |

For every named character, include a concise DNA line that downstream prompts can copy without generic substitutes.

## Style Guide Contract

The style guide owns visual language, not story facts:

| Section | Required Content |
| --- | --- |
| Visual thesis | One paragraph describing the intended look |
| Palette | Main colors, accent colors, forbidden colors if any |
| Lighting | Section-specific or emotional lighting rules |
| Texture and medium | Lens, grain, line quality, rendering style, material feel |
| Composition | Framing, camera distance tendencies, negative space, movement taste |
| Platform-neutral prompt tokens | Reusable descriptors for shotlist prompt envelopes and preview generation |
| Negative style rules | What should be avoided across platforms |

If the user requests platform-specific style syntax, keep it in a clearly labeled section and do not mix it with platform-neutral rules.

## Reference Image Handling

When registering local references:

1. Resolve every path relative to the repository root unless the user gives an absolute path.
2. Confirm each file exists before marking it approved.
3. Record the reference role, such as `<Character> identity reference`, `<Character> costume reference`, `<Prop> prop reference`, or `<Location> environment reference`.
4. If a required reference is missing, mark it `missing` and state which downstream stages are blocked for production use.
5. Do not treat Markdown image links as automatically loaded into an image model. Downstream image generation still must attach or load the files.

## Save Rules

- If no current guide exists, create `v1`.
- If revising a current guide, archive the previous version under `archives/20_guides/` and save the next version under `deliverables/20_guides/`.
- Preserve artifact IDs across versions of the same guide.
- Update `deliverables/00_admin/changelog.md`.
- After guide changes, list downstream artifacts that may need inspection: shotlist breakdowns, shotlist HTML, preview manifests, generated references, and generated video tests.

## QA Before Handoff

- Asset and style guides both exist unless the user explicitly requested only one.
- Artifact metadata exists and version matches filename.
- All local reference paths exist or are explicitly marked missing.
- Character DNA is specific enough to prevent generic labels.
- Style guide can support shotlist prompt envelopes, rough e-conte previews, and generated video tests.
- Open gaps and production blockers are visible before downstream generation.
