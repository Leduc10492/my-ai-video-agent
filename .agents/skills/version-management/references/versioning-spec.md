# Versioning Spec

## Version Pattern

Current and archived deliverables both use `_v{N}` suffixes.

Example:

- current: `deliverables/30_breakdown/03_shotlist_breakdown_v2.md`
- archived: `archives/30_breakdown/03_shotlist_breakdown_v1.md`

Use simple numeric suffixes: `v1`, `v2`, `v10`. Do not use `v001`.

## Save New Version

1. Find the highest current version in `deliverables/<stage>/`.
2. Move that current file to `archives/<stage>/`.
3. Write the new file to `deliverables/<stage>/` with version number incremented by one.
4. Update frontmatter `version`.
5. Keep the same artifact `id`.
6. Preserve or update `upstream` and `locks`.
7. Append changelog entry.

## New Artifact

If no previous file exists, write `v1` directly to `deliverables/<stage>/` and create the archive directory if needed.

## Rollback

When restoring an archived version, do not overwrite history. Archive the current version first, then copy the selected archived content into a new highest version.
