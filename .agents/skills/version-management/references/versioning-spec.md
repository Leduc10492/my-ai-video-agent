# Versioning Spec

## Selection And Allocation

Use simple `_v{N}` suffixes (`v1`, `v2`, `v10`), with a stable artifact ID across versions of the same family. Select inputs by explicit path, version, and hash. Highest suffix never proves working status, audit validity, or acceptance.

For a new changed version, inspect the entire family under both `deliverables/<stage>/` and `archives/<stage>/`. Reserve a number above all existing versions, including interrupted candidates. Do not assume the selected version is the largest.

## Safe Save

1. Verify the selected input and prepare a complete candidate without changing it.
2. Save the new artifact in its active stage with a matching filename/header version and preserved ID, upstream references, locks, and source text.
3. Read back and verify it before atomically switching the coordinator's explicit reference.
4. Optionally archive the previous artifact after the switch: copy, verify, update resolver references, retain old-path compatibility, then remove redundant storage only when links remain valid.
5. Record exact paths, hashes, and differences. Append a human-readable changelog when useful.

A new working script does not acquire an old production decision. For managed scripts use [local-script-workflow.md](local-script-workflow.md); other stage owners follow this order with their explicit manifests/handoffs.

## Scene Packages

The versioned unit is the entire directory:

- active: `deliverables/3_shotlist/scene-021_v2/`
- archived: `archives/3_shotlist/scene-021_v1/`

Keep Breakdown, `Shotlist_scene-021_ZH_v{N}.html`, manifest, Scene assets, generated tests, and Scene QA together. Preserve relative upstream/shared-asset links after archival relocation; retain the original package until all used references resolve. Phase 1 does not automate package transactions or run resumption.

## Recovery

Retain the last valid state until the new artifact is safely readable. After a failed write, do not select an orphan candidate just because it has the largest version number. Explicitly restoring an older working version keeps production independent; subsequent edits allocate a new unused number. Existing script/audit archive aliases and exact decision records stay readable.
