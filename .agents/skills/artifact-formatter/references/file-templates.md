# Artifact File Templates

Use these templates when creating new deliverables.

## Standard Frontmatter

```markdown
# Artifact: <Type>
- id: A-<yyyymmdd>-<nnn>
- version: v<number>
- upstream: [<artifact ids>]
- locks:
  - must_keep:
    - ...
  - must_avoid:
    - ...
  - budget_notes:
    - ...

---
```

## Current Versioned Paths

- Script: `deliverables/10_story/01_script_v{N}.md`
- Audit: `deliverables/10_story/01_audit_report_v{N}.md`
- Asset guide: `deliverables/20_guides/02_asset_guide_v{N}.md`
- Style guide: `deliverables/20_guides/02_style_guide_v{N}.md`
- Storyboard: `deliverables/30_breakdown/03_storyboard_v{N}.md`
- Storyboard prompts: `deliverables/40_boards/04_storyboard_prompts_v{N}.md`
- Art prompts: `deliverables/50_art/05_art_prompts_v{N}.md`
- Video prompts: `deliverables/60_motion/06_video_prompts_v{N}.md`

## Body Sections

Prefer this order:

1. short project summary
2. source inputs and upstream versions
3. production content
4. QA notes or limitations
5. version history
