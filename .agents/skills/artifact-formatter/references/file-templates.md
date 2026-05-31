# File Templates

Use these active production paths:

- Script: `deliverables/10_story/01_script_v{N}.md`
- Audit: `deliverables/10_story/01_audit_report_v{N}.md`
- Asset guide: `deliverables/20_guides/02_asset_guide_v{N}.md`
- Style guide: `deliverables/20_guides/02_style_guide_v{N}.md`
- Shotlist breakdown: `deliverables/30_breakdown/03_shotlist_breakdown_v{N}.md`
- Shotlist HTML: `deliverables/60_motion/Shotlist_<scope>_ZH_v{N}.html`
- Shotlist previews: `deliverables/60_motion/shotlist_previews_<scope>_v{N}/manifest.md`
- Generated video tests: `deliverables/60_motion/generated/<run_id>/README.md`

Legacy `03_storyboard_v{N}.md` files can be read as migration inputs. New planning artifacts should use `03_shotlist_breakdown_v{N}.md`.

## Artifact Header

```markdown
# Artifact: <Type>
- id: A-yyyymmdd-nnn
- version: v1
- upstream: [A-yyyymmdd-nnn]
- locks:
  - must_keep:
    - ...
  - must_avoid:
    - ...
  - budget_notes:
    - ...

---
```

## Active Dependency Graph

```text
01_script_v{N}.md
  -> 01_audit_report_v{N}.md
  -> 02_asset_guide_v{N}.md + 02_style_guide_v{N}.md
  -> 03_shotlist_breakdown_v{N}.md
      -> Shotlist_<scope>_ZH_v{N}.html
          -> shotlist_previews_<scope>_v{N}/manifest.md
          -> generated/<run_id>/README.md
```
