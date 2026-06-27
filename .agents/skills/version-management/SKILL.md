---
name: version-management
description: Archive old versions and update version numbers for active deliverables. Use when saving a new version of scripts, audits, guides, shotlist breakdowns, shotlist HTML, or QA reports.
---

# Version Management

Archive old versions and update version numbers for active deliverable files.

## When to Use

- Saving a new version of any active production deliverable
- User requests "save new version" or "archive current version"
- After major revisions are approved
- Migrating a legacy planning file into `03_shotlist_breakdown_v{N}.md`

## Quick Reference

| Parameter | Description | Example |
| --- | --- | --- |
| file_path | Current file path with version | `deliverables/10_story/01_script_v2.md` |
| change_description | What changed | `Added prompt-envelope batch gates` |
| stage_name | Workflow stage | `Shotlist Breakdown` |

## Core Workflow

### Step 1: Read Current Version

Extract version from file frontmatter:

```markdown
- version: v2
```

### Step 2: Archive Current File

Archive with version suffix:

```text
deliverables/10_story/01_script_v2.md -> archives/10_story/01_script_v2.md
```

### Step 3: Save New Version

Save new file with incremented version in filename:

- Filename: `01_script_v2.md` -> `01_script_v3.md`
- Frontmatter version: `v2` -> `v3`
- Keep same artifact ID
- Inherit or consciously update locks

### Step 4: Update Changelog

Append to `deliverables/00_admin/changelog.md`:

```markdown
## [2026-01-21] - Shotlist Breakdown

### Changed
- `03_shotlist_breakdown_v2.md` -> `03_shotlist_breakdown_v3.md`
  - Tightened batch ranges and spatial-blocking gates.
  - Archived: `archives/30_shotlist/03_shotlist_breakdown_v2.md`
  - Current: `deliverables/30_shotlist/03_shotlist_breakdown_v3.md`
```

### Step 5: Confirm

Output confirmation message with:

- file updated
- old version archived location
- new version number

## Version Number Format

| Frontmatter | Filename Suffix | Example |
| --- | --- | --- |
| version: v1 | `_v1` | both use simple numbers |
| version: v2 | `_v2` | v2, not v002 |
| version: v10 | `_v10` | v10, not v010 |

## Archive Directory Structure

All archived files go to `archives/`, not `deliverables/*/archive/`.

```text
archives/
├── 10_story/
│   ├── 01_script_v1.md
│   └── 01_script_v2.md
├── 30_shotlist/
│   ├── 03_shotlist_breakdown_v1.md
│   └── scenes/
│       └── scene-021_v1/
│           └── Shotlist_scene-021_ZH_v1.html

deliverables/
├── 10_story/
│   └── 01_script_v3.md
└── 30_shotlist/
    ├── 03_shotlist_breakdown_v2.md
    └── scenes/
        └── scene-021_v2/
            └── Shotlist_scene-021_ZH_v2.html
```

## Active File Paths

| Stage | Current Path Pattern | Example |
| --- | --- | --- |
| Script | `deliverables/10_story/01_script_v{N}.md` | `01_script_v3.md` |
| Audit | `deliverables/10_story/01_audit_report_v{N}.md` | `01_audit_report_v1.md` |
| Asset Guide | `deliverables/20_assets/02_asset_guide_v{N}.md` | `02_asset_guide_v2.md` |
| Style Guide | `deliverables/20_assets/02_style_guide_v{N}.md` | `02_style_guide_v1.md` |
| Shotlist Breakdown | `deliverables/30_shotlist/03_shotlist_breakdown_v{N}.md` | `03_shotlist_breakdown_v1.md` |
| Shotlist HTML | `deliverables/30_shotlist/scenes/<scene-scope>_v{N}/Shotlist_<scene-scope>_ZH_v{N}.html` | `Shotlist_scene-021_ZH_v1.html` |

## Legacy Migration

When migrating an existing `03_storyboard_v{N}.md` planning file:

1. Treat it as source input, not the new output name.
2. Preserve the artifact ID if it is the same planning artifact family.
3. Save the next current version as `03_shotlist_breakdown_v{N+1}.md`.
4. Archive the old planning file under `archives/30_shotlist/`.
5. Record the migration in changelog.

## Error Handling

| Scenario | Action |
| --- | --- |
| File not found | Skip archive, save as `v1` |
| Archive dir missing | Create automatically |
| Archive exists | Stop and ask before overwrite unless user explicitly approved force |

## Version Rollback

When user requests "restore to v2":

1. Archive current version.
2. Copy `archives/.../file_v2.*` to the matching deliverables stage.
3. Rename to the next version number.
4. Update frontmatter version.
5. Log in changelog as restored.

**Detailed specs**: See `references/versioning-spec.md`

**Changelog format**: See `references/changelog-format.md`
