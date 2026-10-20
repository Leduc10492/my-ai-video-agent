---
name: version-management
description: Safely save versioned deliverables and resolve exact working or production references. Use for local script imports, edits, explicit selection, recovery, and archive operations.
---

# Version Management

## Slot Compatibility

- slot: `version.manager`
- contract_version: `1`
- canonical_outputs:
  - `archives/<stage>/ plus the next deliverables/<stage>/ version`
- qa_handoff: `qa.primary`
- state_contract: `local-script-state-v1`

Preserve existing artifact families, stage paths, and creative content. Deterministic helpers handle files and references; the owning Skill and user supply creative decisions and real review evidence.

## Local Scripts

Read [references/local-script-workflow.md](references/local-script-workflow.md) for initialization, Notion capture, local editing, production selection, Scene identity, and recovery. The executable entry is `scripts/workflow-state.mjs`; only the main-thread project-director invokes its mutations. Other roles return candidate artifacts, base hashes, exact differences, and affected ranges.

- First Notion import creates local source truth. Continue, repeat a link, and direct dialogue/story edits use local files without remote reads. Only an explicit Notion update permits reading the source; a sync/writeback request is separate.
- `working_script` and `production_inputs` are distinct exact references. Never choose either by highest filename suffix. Production requires the selected script's same-version audit and hash-bound acceptance/autonomous scope.
- Partial refresh advances only the requested range baselines. Full refresh preserves old files. No text change means no new script version or downstream invalidation.
- Explicitly selected archived scripts/audits remain valid inputs. Read only the named versions, not all history.

## Safe Save Order

1. Resolve the selected input and verify its hash. In an old project, use the user's exact file or a verified current reference; register a sole candidate, or list ambiguous candidates.
2. For a changed artifact, allocate the next unused number across its active and archived family. Include candidate files left by interrupted saves. Maximum suffix is a naming tool only.
3. Write a new file/package without overwriting the selected version. Verify readable content and hashes. Preserve the artifact ID, locks, upstream dependencies, tags, and metadata.
4. The coordinator atomically switches the intended reference only after new files are complete. Saving a draft does not switch production or transfer acceptance.
5. Archive only after the switch, if useful. Copy and verify first, update exact references, then preserve original-path compatibility. Never move the only valid input before a potentially failing save. Record the transition in state and, when useful, the changelog.

For script/audit archives, the helper preserves an original-path symlink and the resolver also supports the canonical archive path. Older HTML/manifest links continue to resolve. Do not delete these compatibility links while existing production packages still use them. On filesystems without symlinks, retain the original verified file copy; report that archival cleanup is incomplete.

For other stage artifacts, use the same save-before-switch order with their explicit handoff/manifest references. Do not imply the phase-1 script helper implements a complete Scene-package transaction or run scheduler.

## Paths And Versions

All stage directories use single digits: `1_story`, `2_assets`, `3_shotlist`; admin state stays in `deliverables/0_admin`. Filenames keep `01_`, `02_`, `03_` prefixes and simple `_v{N}` suffixes.

| Family | Active path |
| --- | --- |
| Script | `deliverables/1_story/01_script_v{N}.md` |
| Audit | `deliverables/1_story/01_audit_report_v{N}.md` |
| Asset/style guide | `deliverables/2_assets/02_asset_guide_v{N}.md`, `02_style_guide_v{N}.md` |
| Scene package | `deliverables/3_shotlist/<scene-label>_v{N}/` |

Scene folder, Breakdown, HTML, manifest, and generated-test mappings share a package version. Archive the package as a whole; never increment only its HTML suffix. Preserve relative links to shared assets and upstream inputs when moving a package.

## Legacy And Recovery

- A legacy `03_storyboard_v{N}.md` is migration input. New planning remains one direct Scene folder, with the same artifact family when appropriate.
- To restore a script, explicitly select a verified archived version as working, or save its content as a new unused version. Production stays independently selected. The next edit scans active and archived names, so rollback cannot reuse an existing version number.
- Missing input: list exact available candidates; do not silently create `v1` while other family versions exist.
- Existing archive with different content: preserve both and report the conflict. Do not overwrite it.
- Interrupted save: inspect state and candidate files with `status`; `recover` releases only a demonstrably dead local writer lock. Uncommitted files are not promoted. Use explicit previous-state restoration only after verifying that backup.

See [references/versioning-spec.md](references/versioning-spec.md) for the cross-stage naming contract and [references/changelog-format.md](references/changelog-format.md) for optional human-readable history.
