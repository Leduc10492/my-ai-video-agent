---
name: artifact-formatter
description: Format deliverable files with standard Artifact metadata (id, version, upstream, locks). Use when creating or validating any deliverable file.
---

# Artifact Formatter

Ensure all deliverable files have consistent metadata and follow standard paths.

## When to Use

- Creating new deliverable files
- Validating existing file format
- Checking upstream dependencies

## Artifact Metadata Template

All deliverables MUST include this frontmatter:

```markdown
# Artifact: <Type>
- id: A-<yyyymmdd>-<nnn>
- version: v<number>
- upstream: [<upstream artifact ids>]
- locks:
  - must_keep: [required elements]
  - must_avoid: [prohibited content]
  - budget_notes: [constraints]

---

[Content here]
```

## Field Specifications

### ID Format
- Pattern: `A-yyyymmdd-nnn`
- Example: `A-20260121-001`
- Rule: New ID per file, same ID across versions

### Version Format
- Pattern: `v1`, `v2`, `v3`...
- Start: `v1`
- Increment: +1 per update

### Upstream
- List of artifact IDs this file depends on
- Empty for root artifacts (script)
- Example: `[A-20260121-001]`

### Locks
```markdown
locks:
  must_keep:
    - Core plot points (from script)
    - Character traits (from script)
  must_avoid:
    - Violence (global)
    - Political content (global)
  budget_notes:
    - Duration: 5 minutes
    - Max scenes: 8
```

## Standard File Paths (Contract)

**DO NOT modify these paths**:

### Admin (00_admin/)
```
deliverables/00_admin/README.md
deliverables/00_admin/locks.md
deliverables/00_admin/changelog.md
```

### Script Stage (10_story/)
```
deliverables/10_story/01_script_v{N}.md
deliverables/10_story/01_audit_report_v{N}.md
```

### Guides (20_guides/)
```
deliverables/20_guides/02_asset_guide_v{N}.md
deliverables/20_guides/02_style_guide_v{N}.md
```

### Storyboard (30_breakdown/, 40_boards/)
```
deliverables/30_breakdown/03_storyboard_v{N}.md
deliverables/40_boards/04_storyboard_prompts_v{N}.md
deliverables/40_boards/generated/
```

### Art (50_art/)
```
deliverables/50_art/05_art_prompts_v{N}.md
deliverables/50_art/generated/
deliverables/50_art/generated_ref_v{N}/
```

### Video (60_motion/)
```
deliverables/60_motion/06_video_prompts_v{N}.md
deliverables/60_motion/generated/
```

## Dependency Graph

```
01_script_v{N}.md (root)
    ↓
    ├→ 01_audit_report_v{N}.md
    ├→ 02_asset_guide_v{N}.md
    ├→ 02_style_guide_v{N}.md
    └→ 03_storyboard_v{N}.md
           ↓
           ├→ 04_storyboard_prompts_v{N}.md
           ├→ 05_art_prompts_v{N}.md ← 02_*_guide_v{N}.md
           └→ 06_video_prompts_v{N}.md ← 05_art_prompts_v{N}.md / generated_ref_v{N}/ (optional)
```

## Validation Checklist

- [ ] Path matches standard contract
- [ ] ID format correct (A-yyyymmdd-nnn)
- [ ] Version format correct (v1, v2...)
- [ ] Upstream IDs exist and valid
- [ ] Locks inherited from upstream

## Common Errors

| Error | Correct |
|-------|---------|
| `02_asset_guides.md` | `02_asset_guide.md` |
| `deliverables/guides/` | `deliverables/20_guides/` |
| upstream: `01_script_v1.md` | upstream: `[A-20260121-001]` |

**File templates**: See `references/file-templates.md`

**Locks inheritance**: See `references/locks-inheritance.md`
