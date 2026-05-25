---
name: art-prompt-workflow
description: Generate still-image art prompts from storyboard artifacts. Use as the default art.prompt_builder slot for final-frame prompts, character-consistent keyframes, four-panel image sequences, or platform-specific prompt batches from a shot table.
---

# Art Prompt Workflow

Use this skill to create or revise `deliverables/50_art/05_art_prompts_v{N}.md`.

This is the current default implementation for the `art.prompt_builder` slot in `.agents/skill_registry.md`. Platform syntax should come from the `art.platform_adapter` slot, currently `art-platform-rules`.

## Required Inputs

- Latest storyboard: `deliverables/30_breakdown/03_storyboard_v{N}.md`
- Latest asset guide: `deliverables/20_guides/02_asset_guide_v{N}.md`
- Latest style guide: `deliverables/20_guides/02_style_guide_v{N}.md`
- Character reference images: local image links declared in the latest asset guide, normally under `deliverables/20_guides/refs/`
- Optional storyboard prompts: `deliverables/40_boards/04_storyboard_prompts_v{N}.md`
- Global locks: `deliverables/00_admin/locks.md`

Do not generate final art prompts without an asset guide. If the style guide is missing, stop and create or request one.

Do not generate production keyframes for named characters from text-only prompts when local character reference images exist. Text DNA is a supplement; the reference images are the identity anchor.

## Reference Image Binding

Before generating or regenerating any character image:

1. Resolve image references from the latest asset guide.
2. Confirm the image files exist on disk.
3. Load or attach the relevant images into the image-generation context.
4. Label each image role explicitly:
   - `<Character> identity reference`
   - `<Character> costume reference`
   - `<Character> age/style adaptation reference` when adapting one identity reference into another age or costume state
5. In the prompt, say how each reference should be used: preserve face, hair silhouette, expression range, body proportion, and uniform/costume logic.

If the platform cannot accept image references, mark outputs as `text_only_draft` and do not call them final continuity keyframes.

## Platform Choice

Ask only for missing choices:

- Platform: user requested platform, or one supported by the current `art.platform_adapter`
- Range: all / act-section / shot range / specific shots
- Mode: single image / four-panel sequence / keyframe set
- Visual target: final frame / keyframe / reference sheet / poster-like still

Load the current `art.platform_adapter` implementation and only the relevant platform reference when platform-specific detail is needed.

## Batch Strategy

Default batching:

| Scope | Batch unit |
| --- | --- |
| MV / short film | section or act, usually 6-10 shots |
| Dense montage | 4-6 shots |
| Character-critical scene | 2-4 shots |
| Four-panel expansion | one source shot per batch |

After each batch, check character DNA, style guide, props, and section color before continuing.

## Prompt Construction Fields

Each shot prompt should include:

1. Shot ID and source beat.
2. Reference image roles and paths for every named character in the shot.
3. Character DNA copied from asset guide, not generic labels.
4. Setting and era.
5. Composition and camera distance.
6. Action and micro-expression.
7. Lighting and color from style guide.
8. Props and motif state.
9. Platform-specific syntax.
10. Negative constraints.

## Output Template

```markdown
### Shot 010

**Source**: `03_storyboard_v1.md`, Shot 010
**Platform**: Midjourney v6
**Mode**: single final-frame still
**Continuity anchors**:
- Reference images:
  - `deliverables/20_guides/refs/...png` as `<character> identity reference`
- Character DNA: ...
- Style: ...
- Props: ...

**Prompt**:
```text
<platform-ready prompt>
```

**Negative / Avoid**:
- ...
```

For Jimeng, keep the prompt Chinese and atmospheric. For Midjourney, use compact English with final parameters. For Nano Banana, prefer structured JSON-like fields if consistency matters more than painterly style.

## Four-Panel Mode

When expanding one shot into four panels:

- Split the source action into A/B/C/D phases.
- Preserve character DNA in every panel.
- Keep camera grammar continuous unless the user asks for a montage.
- Add panel relationship notes: `setup`, `action`, `turn`, `result`.
- Do not create new story events that contradict the storyboard.

## QA Before Save

Run these checks before saving:

- Every local reference image linked from the asset guide exists.
- Every named-character generation plan names the relevant reference image path and role.
- If images have already been generated, the generated folder README records `reference_mode`.
- Every character prompt uses asset-guide DNA.
- Every section follows style-guide color and lighting.
- Key props appear with the correct state.
- Same character does not switch hair, uniform, facial features, or symbolic object.
- Platform syntax is not mixed between Jimeng/MJ/Nano Banana.
- Total shot range matches the requested scope.

## Save

Save to `deliverables/50_art/05_art_prompts_v{N}.md` with artifact metadata. Archive prior current version through `version-management` and append changelog.
