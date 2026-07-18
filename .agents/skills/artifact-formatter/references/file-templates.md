# File Templates

Use these active production paths:

- Script: `deliverables/10_story/01_script_v{N}.md`
- Audit: `deliverables/10_story/01_audit_report_v{N}.md`
- Asset guide: `deliverables/20_assets/02_asset_guide_v{N}.md`
- Style guide: `deliverables/20_assets/02_style_guide_v{N}.md`
- Shotlist breakdown: `deliverables/30_shotlist/<scene-label>_v{N}/03_shotlist_breakdown_<scene-label>_v{N}.md`
- Shotlist HTML: `deliverables/30_shotlist/<scene-label>_v{N}/Shotlist_<scene-label>_ZH_v{N}.html`
- Scene package manifest: `deliverables/30_shotlist/<scene-label>_v{N}/manifest.md`
- Shotlist previews: `deliverables/30_shotlist/<scene-label>_v{N}/previews/manifest.md`
- Generated video tests: `deliverables/30_shotlist/<scene-label>_v{N}/generated/<run_id>/README.md`

Legacy `03_storyboard_v{N}.md`, global Breakdown files, and multi-Scene packages can be read from `archives/` as migration inputs. New planning is one Scene per direct Scene folder.

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
  -> <scene-label>_v{N}/03_shotlist_breakdown_<scene-label>_v{N}.md
      -> <scene-label>_v{N}/Shotlist_<scene-label>_ZH_v{N}.html
          -> <scene-label>_v{N}/previews/manifest.md
          -> <scene-label>_v{N}/generated/<run_id>/README.md
```
