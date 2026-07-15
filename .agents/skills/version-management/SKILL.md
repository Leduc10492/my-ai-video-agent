---
name: version-management
description: Archive old versions and update version numbers for active deliverables. Use when saving a new version of scripts, audits, guides, shotlist breakdowns, shotlist HTML, or QA reports.
---

# Version Management

## Desktop Candidate Runtime

When the macOS app invokes this Skill in Candidate Runtime, these rules override all file-based input, save, versioning, archive, changelog, and handoff steps below:

- Use only `context.json` and `RUN_RULES.md` supplied in the current run directory as project and runtime inputs. Do not scan or read the repository, `deliverables/`, `archives/`, `.agents/skill_registry.md`, or any other project path, and do not infer omitted state.
- Treat the run as read-only. Do not create, edit, delete, move, rename, or archive files or directories; do not write SQLite or invoke shell/network side effects.
- Stay inside the supplied `scopeIds`. Propose operations only for scoped entities, or scoped descendants and links explicitly exposed by `context.json` and permitted by `RUN_RULES.md`. Report any needed out-of-scope change in `summary` instead of proposing it.
- Return exactly one JSON object conforming to `draft-operations.schema.json`, with `summary` and `operations` as its only top-level fields. Every item in `operations` is a `DraftOperation`; encode its `payload` as the JSON string required by the schema. Return no Markdown or commentary outside that JSON object.
- For `patch`, `reorder`, or `archive` on an existing entity, copy its `currentRevisionId` from `context.json` exactly into `baseRevision`. Use `baseRevision: null` for `create`, `link`, or `unlink` unless `RUN_RULES.md` supplies a different mapping contract. Never invent a revision ID; omit the operation and explain the limitation in `summary` when the required current revision is absent.
- The app validates and stores the candidate, obtains user approval, applies formal revisions and dependency invalidation, and owns version increments, archives, changelog updates, deliverable rendering, and all file writes. Do not perform or simulate those steps in Candidate Runtime.

## Slot Compatibility

- slot: `version.manager`
- contract_version: `1`
- canonical_outputs:
  - `archives/<stage>/ plus the next deliverables/<stage>/ version`
- qa_handoff: `qa.primary`
- state_contract: `n/a`

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

For a scene package, archive the entire directory:

```text
deliverables/30_shotlist/scenes/scene-021_v1/
  -> archives/30_shotlist/scenes/scene-021_v1/
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

The scene package folder, HTML, manifest, previews, and generated mappings share the same package version. Never increment only the HTML suffix.

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
