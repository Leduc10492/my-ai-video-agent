---
name: artifact-formatter
description: Format deliverable files with standard Artifact metadata (id, version, upstream, locks). Use when creating or validating any active production deliverable.
---

# Artifact Formatter

## Desktop Candidate Runtime

When the macOS app invokes this Skill in Candidate Runtime, these rules override all file-based input, save, versioning, archive, changelog, and handoff steps below:

- Use only `context.json` and `RUN_RULES.md` supplied in the current run directory as project and runtime inputs. Do not scan or read the repository, `deliverables/`, `archives/`, `.agents/skill_registry.md`, or any other project path, and do not infer omitted state.
- Treat the run as read-only. Do not create, edit, delete, move, rename, or archive files or directories; do not write SQLite or invoke shell/network side effects.
- Stay inside the supplied `scopeIds`. Propose operations only for scoped entities, or scoped descendants and links explicitly exposed by `context.json` and permitted by `RUN_RULES.md`. Report any needed out-of-scope change in `summary` instead of proposing it.
- Return exactly one JSON object conforming to `draft-operations.schema.json`, with `summary` and `operations` as its only top-level fields. Every item in `operations` is a `DraftOperation`; encode its `payload` as the JSON string required by the schema. Return no Markdown or commentary outside that JSON object.
- For `patch`, `reorder`, or `archive` on an existing entity, copy its `currentRevisionId` from `context.json` exactly into `baseRevision`. Use `baseRevision: null` for `create`, `link`, or `unlink` unless `RUN_RULES.md` supplies a different mapping contract. Never invent a revision ID; omit the operation and explain the limitation in `summary` when the required current revision is absent.
- The app validates and stores the candidate, obtains user approval, applies formal revisions and dependency invalidation, and owns version increments, archives, changelog updates, deliverable rendering, and all file writes. Do not perform or simulate those steps in Candidate Runtime.

## Slot Compatibility

- slot: `artifact.formatter`
- contract_version: `1`
- canonical_outputs:
  - `artifact metadata and canonical paths`
- qa_handoff: `qa.primary`
- state_contract: `reference-state-v2`

Ensure all active deliverable files have consistent metadata and follow the shotlist-first path contract.

## When to Use

- Creating new deliverable files
- Validating existing file format
- Checking upstream dependencies
- Migrating legacy planning files into the active shotlist breakdown path

## Artifact Metadata Template

All Markdown production deliverables must include this header:

```markdown
# Artifact: <Type>
- id: A-<yyyymmdd>-<nnn>
- version: v<number>
- upstream: [<upstream artifact ids>]
- locks:
  - must_keep:
    - ...
  - must_avoid:
    - ...
  - budget_notes:
    - ...

---
```

Scene-package HTML uses equivalent `<meta>` fields and relies on its sibling `manifest.md` as the canonical Artifact metadata record:

```html
<meta name="artifact-id" content="A-yyyymmdd-nnn">
<meta name="artifact-version" content="v2">
<meta name="source-artifact-ids" content="A-yyyymmdd-nnn,A-yyyymmdd-nnn">
```

## Field Specifications

### ID Format

- Pattern: `A-yyyymmdd-nnn`
- Example: `A-20260121-001`
- Rule: new ID per artifact family, same ID across versions

### Version Format

- Pattern: `v1`, `v2`, `v3`
- Start: `v1`
- Increment: +1 per update

### Upstream

- List of artifact IDs this file depends on
- Empty for root artifacts such as a first script
- Example: `[A-20260121-001]`

### Locks

```markdown
locks:
  must_keep:
    - Core plot points from script
  must_avoid:
    - Prohibited content or known failure modes
  budget_notes:
    - Duration: 5 minutes
```

## Standard File Paths

Do not modify these active paths unless the user explicitly approves a migration:

### Admin

```text
deliverables/00_admin/README.md
deliverables/00_admin/locks.md
deliverables/00_admin/changelog.md
```

### Script

```text
deliverables/10_story/01_script_v{N}.md
deliverables/10_story/01_audit_report_v{N}.md
```

### Guides

```text
deliverables/20_assets/02_asset_guide_v{N}.md
deliverables/20_assets/02_style_guide_v{N}.md
```

### Shotlist Breakdown

```text
deliverables/30_shotlist/03_shotlist_breakdown_v{N}.md
```

Legacy `03_storyboard_v{N}.md` files can be read from `archives/` as migration inputs. New planning artifacts should use the active shotlist breakdown path.

### Shotlist Production

```text
deliverables/30_shotlist/scenes/<scene-scope>_v{N}/Shotlist_<scene-scope>_ZH_v{N}.html
deliverables/30_shotlist/scenes/<scene-scope>_v{N}/manifest.md
deliverables/30_shotlist/scenes/<scene-scope>_v{N}/previews/manifest.md
deliverables/30_shotlist/scenes/<scene-scope>_v{N}/generated/<run_id>/README.md
```

Scene package revisions archive and replace the entire package directory, not only the HTML file.

## Reference State Fields

Generated assets, scene packages, previews, and generated tests record:

```markdown
- asset_origin: user_provided | generated_from_text | generated_from_references | mixed
- reference_binding: none | text_only | images_attached
- reference_approval: draft | reviewed | locked
- output_status: prompt_only | smoke_test | review_ready | production_approved
```

`image_reference_bound` is legacy shorthand for `reference_binding: images_attached`; it does not imply `reference_approval: locked`.

## Dependency Graph

```text
01_script_v{N}.md
  -> 01_audit_report_v{N}.md
  -> 02_asset_guide_v{N}.md + 02_style_guide_v{N}.md
  -> 03_shotlist_breakdown_v{N}.md
      -> scenes/<scene-scope>_v{N}/Shotlist_<scene-scope>_ZH_v{N}.html
          -> scenes/<scene-scope>_v{N}/previews/manifest.md
          -> scenes/<scene-scope>_v{N}/generated/<run_id>/README.md
```

## Validation Checklist

- [ ] Path matches active standard contract.
- [ ] ID format is correct.
- [ ] Version format is correct.
- [ ] Upstream IDs exist and are valid.
- [ ] Locks are inherited or consciously updated.
- [ ] All four reference-state fields are explicit for generated assets.
- [ ] Scene labels, shot rows, and `P###` IDs are preserved where applicable.
- [ ] Shot-row IDs use `<scene-label>-R<NN>` and are not reused as prompt IDs.

## Common Errors

| Error | Correct |
| --- | --- |
| `02_asset_guides.md` | `02_asset_guide_v{N}.md` |
| `deliverables/guides/` | `deliverables/20_assets/` |
| `03_storyboard_v{N}.md` as a new file | `03_shotlist_breakdown_v{N}.md` |
| upstream: `01_script_v1.md` | upstream: `[A-20260121-001]` |

**File templates**: See `references/file-templates.md`

**Locks inheritance**: See `references/locks-inheritance.md`
