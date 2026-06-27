# Deliverables Admin

This directory is the reusable starter state for a new file-based AI video workflow project.

It should stay project-neutral on `main`. Do not store story-specific scripts, reference images, generated previews, video tests, or historical project QA reports here.

## Files

| Path | Purpose |
| --- | --- |
| `locks.md` | Project-specific constraints for the current active production run. Starts empty. |
| `changelog.md` | Version/history log for newly created deliverables. Starts with template guidance only. |
| `qa_reports/README.md` | Explains where persistent QA reports should be saved when a project creates them. |

## Canonical Production Paths

```text
deliverables/
├── 00_admin/
│   ├── README.md
│   ├── locks.md
│   ├── changelog.md
│   └── qa_reports/
├── 10_story/
│   ├── 01_script_v{N}.md
│   └── 01_audit_report_v{N}.md
├── 20_assets/
│   ├── 02_asset_guide_v{N}.md
│   ├── 02_style_guide_v{N}.md
│   ├── refs/
│   └── generated_ref_v{N}/
└── 30_shotlist/
    ├── 03_shotlist_breakdown_v{N}.md
    └── scenes/
        └── <scene-scope>_v{N}/
            ├── Shotlist_<scene-scope>_ZH_v{N}.html
            ├── manifest.md
            ├── assets/
            ├── previews/
            ├── generated/
            └── qa/
```

## Starter Rule

`main` is a clean workflow package. Concrete project output belongs in a project fork, a generated worktree, or a copied project instance.
