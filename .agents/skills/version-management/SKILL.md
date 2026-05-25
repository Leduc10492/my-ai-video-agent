---
name: version-management
description: Archive old versions and update version numbers for deliverables. Use when saving a new version of any deliverable file (script, storyboard, prompts).
---

# Version Management

Archive old versions and update version numbers for all deliverable files.

## When to Use

- Saving a new version of any deliverable
- User requests "save new version" or "archive current version"
- After major revisions are approved

## Quick Reference

| Parameter | Description | Example |
|-----------|-------------|---------|
| file_path | Current file path with version | `deliverables/10_story/01_script_v2.md` |
| change_description | What changed | "Fixed Crisis scene" |
| stage_name | Workflow stage | "Script Stage" |

## Core Workflow

### Step 1: Read Current Version

Extract version from file frontmatter:
```markdown
- version: v2
```

### Step 2: Archive Current File

```powershell
# Archive with version suffix
# 01_script_v2.md → archives/10_story/01_script_v2.md

Move-Item "deliverables/10_story/01_script_v2.md" `
          "archives/10_story/01_script_v2.md"
```

### Step 3: Save New Version

Save new file with incremented version in filename:
- Filename: 01_script_v2.md → 01_script_v3.md
- Frontmatter version: v2 → v3
- Keep same ID
- Inherit locks

### Step 4: Update Changelog

Append to `deliverables/00_admin/changelog.md`:

```markdown
## [2026-01-21] - Script Stage

### Changed
- 01_script: v2 → v3
  - Fixed Crisis scene
  - Archived: archives/10_story/01_script_v2.md
  - Current: deliverables/10_story/01_script_v3.md
```

### Step 5: Confirm

Output confirmation message with:
- File updated
- Old version archived location
- New version number

## Version Number Format

| Frontmatter | Filename Suffix | Example |
|-------------|-----------------|---------|
| version: v1 | 01_script_v1.md | Both use simple numbers |
| version: v2 | 01_script_v2.md | v2 (not v002) |
| version: v10 | 01_script_v10.md | v10 (not v010) |

## Archive Directory Structure

**CRITICAL**: All archived files go to `archives/` directory, NOT `deliverables/*/archive/`

**CRITICAL**: All files (both current and archived) include version suffix in filename

```
archives/               ✅ CORRECT - Archived versions
├── 10_story/
│   ├── 01_script_v1.md
│   └── 01_script_v2.md
├── 40_boards/
│   └── 04_storyboard_prompts_v1.md
└── 60_motion/
    └── 06_video_prompts_v1.md

deliverables/          ✅ CORRECT - Latest versions with version suffix
├── 10_story/
│   └── 01_script_v3.md        (current version)
├── 40_boards/
│   └── 04_storyboard_prompts_v2.md
└── 60_motion/
    └── 06_video_prompts_v2.md

deliverables/*/archive/  ❌ WRONG - Never use this pattern
01_script.md without version  ❌ WRONG - Always include version suffix
```

## Standard File Paths

All agents MUST use these exact paths (with version suffix):

| Stage | Current Path Pattern | Example |
|-------|---------------------|---------|
| Script | `deliverables/10_story/01_script_v{N}.md` | 01_script_v3.md |
| Audit | `deliverables/10_story/01_audit_report_v{N}.md` | 01_audit_report_v1.md |
| Asset Guide | `deliverables/20_guides/02_asset_guide_v{N}.md` | 02_asset_guide_v2.md |
| Style Guide | `deliverables/20_guides/02_style_guide_v{N}.md` | 02_style_guide_v1.md |
| Storyboard | `deliverables/30_breakdown/03_storyboard_v{N}.md` | 03_storyboard_v1.md |
| Board Prompts | `deliverables/40_boards/04_storyboard_prompts_v{N}.md` | 04_storyboard_prompts_v2.md |
| Art Prompts | `deliverables/50_art/05_art_prompts_v{N}.md` | 05_art_prompts_v1.md |
| Video Prompts | `deliverables/60_motion/06_video_prompts_v{N}.md` | 06_video_prompts_v2.md |

**Note**: {N} is the current version number (1, 2, 10, etc.)

## Error Handling

| Scenario | Action |
|----------|--------|
| File not found | Skip archive, save as v1 |
| Archive dir missing | Create automatically |
| Archive exists | Overwrite with warning |

## Version Rollback

When user requests "restore to v2":

1. Archive current version (e.g., 01_script_v3.md → archives/10_story/)
2. Copy `archives/.../file_v2.md` to deliverables
3. Rename to next version number (01_script_v2.md → 01_script_v4.md)
4. Update frontmatter version: v4
5. Log in changelog as "Restored"

**Detailed specs**: See `references/versioning-spec.md`

**Changelog format**: See `references/changelog-format.md`
