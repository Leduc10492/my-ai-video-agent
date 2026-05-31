# File Templates

Use these active production paths:

- Script: `deliverables/10_story/01_script_v{N}.md`
- Audit: `deliverables/10_story/01_audit_report_v{N}.md`
- Asset guide: `deliverables/20_assets/02_asset_guide_v{N}.md`
- Style guide: `deliverables/20_assets/02_style_guide_v{N}.md`
- Shotlist breakdown: `deliverables/30_shotlist/03_shotlist_breakdown_v{N}.md`
- Shotlist HTML: `deliverables/30_shotlist/scenes/<scope>_v{N}/Shotlist_<scope>_ZH_v{N}.html`
- Scene package manifest: `deliverables/30_shotlist/scenes/<scope>_v{N}/manifest.md`
- Shotlist previews: `deliverables/30_shotlist/scenes/<scope>_v{N}/previews/manifest.md`
- Generated video tests: `deliverables/30_shotlist/scenes/<scope>_v{N}/generated/<run_id>/README.md`

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
      -> scenes/<scope>_v{N}/Shotlist_<scope>_ZH_v{N}.html
          -> scenes/<scope>_v{N}/previews/manifest.md
          -> scenes/<scope>_v{N}/generated/<run_id>/README.md
```
