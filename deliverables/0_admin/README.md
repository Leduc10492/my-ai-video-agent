# Deliverables Admin

This directory is the reusable starter state for a new file-based AI video workflow project.

A fresh GitHub clone already contains project-neutral starter directories for `1_story`, `2_assets`, and `3_shotlist`. Create the active project's files directly inside them; no parent `main/test` split is required.

All stage directories use one-digit prefixes: `0_admin`, `1_story`, `2_assets`, and `3_shotlist`. The two-digit prefixes remain only on files inside those directories.

It should stay project-neutral on `main`. Do not store story-specific scripts, reference images, generated previews, video tests, or historical project QA reports here.

## Files

| Path | Purpose |
| --- | --- |
| `locks.md` | Project-specific constraints for the current active production run. Starts empty. |
| `changelog.md` | Version/history log for newly created deliverables. Starts with template guidance only. |
| `qa_reports/README.md` | Explains where persistent QA reports should be saved when a project creates them. |
| `qa_reports/workflow_audit_20260718.md` | Latest reusable workflow audit and clean-clone evidence. |

## Canonical Production Paths

```text
deliverables/
├── 0_admin/
│   ├── README.md
│   ├── locks.md
│   ├── changelog.md
│   └── qa_reports/
├── 1_story/
│   ├── 01_script_v{N}.md
│   └── 01_audit_report_v{N}.md
├── 2_assets/
│   ├── 02_asset_guide_v{N}.md
│   ├── 02_style_guide_v{N}.md
│   ├── refs/
│   └── generated_ref_v{N}/
└── 3_shotlist/
    └── <scene-label>_v{N}/
        ├── 03_shotlist_breakdown_<scene-label>_v{N}.md
        ├── Shotlist_<scene-label>_ZH_v{N}.html
        ├── manifest.md
        ├── spatial_blocking.md
        ├── assets/
        ├── previews/
        └── generated/
```

## Starter Rule

The GitHub `main` branch is a clean workflow starter. After cloning it as a new project directory, concrete project output belongs directly in that clone's `deliverables/` tree.

The production hierarchy is `Scene -> Shot Row -> Prompt Envelope`. Only Scene is a directory level; Shot Rows and Prompt Envelopes remain mappings inside the Scene files.
