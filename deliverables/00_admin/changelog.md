# Changelog

## [2026-07-11] - Workflow v2 Regression

### Changed
- Archived the active v1 breakdown and scene package locally, then generated `03_shotlist_breakdown_v2.md` and `scenes-078-085_096-098_v2/`.
- Reassigned shot rows to scene-native `RNN` identifiers and reserved new Prompt Envelope IDs `P429-P451`.
- Restored 078/079 and 096/097 as distinct HTML scene sections; only scene-098 is split into two explicit action-phase sections.
- Repaired source-dialogue fidelity for all 23 lines in the selected v10 scenes, including the two checkpoint lines in `scene-081`.
- Migrated reference state to `asset_origin`, `reference_binding`, `reference_approval`, and `output_status`.
- Added deterministic build and fidelity checks under `tools/` plus the retained raw candidate fixture under `fixtures/`.

### Verified
- Main workflow/package validator: 0 errors, 0 warnings.
- Source screenplay fidelity: 23/23 selected dialogue lines present in exactly one executable Prompt Envelope.
- Package shape: 52 shot rows, 23 Prompt Envelopes, `P429-P451`, 15 seconds, 21:9.

## [2026-06-28] - Scene-Native Shotlist Test Package

### Changed
- Rebuilt the retained v10 shotlist HTML under `deliverables/30_shotlist/scenes/scenes-078-085_096-098_v1/`.
- Added `deliverables/30_shotlist/03_shotlist_breakdown_v1.md` as the current upstream shotlist breakdown.
- Preserved prompt IDs `P377-P428` and the P389 Seedance test output inside the new scene-native package.

### Removed
- Removed the legacy aggregate shotlist folder from the active test tree.
- Removed unrelated moodboard campaign output from this branch.

## [2026-06-28] - Test Folder Cleanup

### Changed
- Restored the latest full `Your Name.` comparison script package from historical commit `de1db029`.
- Kept only the latest useful test chain: script v10, audit v10, DOCX export, generated references, scene-native shotlist HTML, and P389 Seedance test output.

### Removed
- Removed older script drafts, older audit reports, older workflow QA reports, and retired board/art/motion history from this test folder.
