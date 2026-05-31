# Quick Start

This project is Codex-first. Use [AGENTS.md](AGENTS.md) as the active rule source.

## How To Work

Tell Codex the stage you want:

```text
I want to create a 3 minute sci-fi short from this concept...
```

```text
Use this script and make a shotlist breakdown.
```

```text
Generate a Seedance shotlist HTML for SB010-SB018.
```

```text
Run QA on the current shotlist batch.
```

Codex will execute the relevant role workflow in the current thread by default.

If you explicitly ask for subagents, parallel agents, or delegation, Codex should use the matching spec under `.codex/agents/<id>.toml`:

- `project-director`
- `script-writer`
- `guide-director`
- `storyboard-director` (shotlist-first visual planning and production)
- `qa-check`

Replaceable skill implementations are listed in `.agents/skill_registry.md`. The active visual path uses `shotlist.breakdown` and `shotlist.primary`.

`.codex/` and `.agents/` are hidden on macOS by default. In Finder, press `Cmd+Shift+.` to show hidden directories.

## Normal Sequence

1. Script: `deliverables/10_story/01_script_v{N}.md`
2. Optional audit: `deliverables/10_story/01_audit_report_v{N}.md`
3. Asset guide: `deliverables/20_assets/02_asset_guide_v{N}.md`
4. Style guide: `deliverables/20_assets/02_style_guide_v{N}.md`
5. Shotlist breakdown: `deliverables/30_shotlist/03_shotlist_breakdown_v{N}.md`
6. Scene shotlist HTML: `deliverables/30_shotlist/scenes/<scope>_v{N}/Shotlist_<scope>_ZH_v{N}.html`
7. E-conte previews: `deliverables/30_shotlist/scenes/<scope>_v{N}/previews/`
8. QA report when useful: `deliverables/00_admin/qa_reports/`

## Generated Assets

```text
deliverables/20_assets/refs/                                      common reference images declared by asset guide
deliverables/20_assets/generated_ref_vN/                           common generated references, draft or approved by manifest
deliverables/30_shotlist/scenes/<scope>_vN/assets/                 scene-specific assets only
deliverables/30_shotlist/scenes/<scope>_vN/previews/               rough e-conte previews
deliverables/30_shotlist/scenes/<scope>_vN/generated/              generated clips or platform exports
```

Every generated folder should have a `README.md` or manifest with:

- source artifact
- asset count
- reference mode
- shot range or file pattern
- known limitations

## Reference Image Rule

For production character continuity, local reference images declared in the latest asset guide or generated-reference manifest must be loaded or attached before generation. Text DNA alone only supports draft outputs.

Use these manifest values consistently:

- `source`: input references
- `text_dna_draft`: output using text DNA only
- `text_only_draft`: draft generated without image references
- `prompt_only`: prompt or preview prompt exists but image/video output was not generated
- `image_reference_bound`: production candidate generated with required image references attached

## Version Rule

When creating a new version:

1. Read the highest current version in `deliverables/<stage>/`.
2. Move the old current file to `archives/<stage>/`.
3. Save the new file as `_v{N+1}`.
4. Update artifact metadata.
5. Update `deliverables/00_admin/changelog.md`.

## Current State

The active workflow is shotlist-first. Legacy local creative artifacts may remain under `deliverables/`, but new visual production should use shotlist breakdown plus Seedance/Higgsfield HTML.
