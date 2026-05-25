# Quick Start

This project is now Codex-first. Use [AGENTS.md](AGENTS.md) as the active rule source.

## How To Work

Tell Codex the stage you want:

```text
I want to create a 3 minute sci-fi short from this concept...
```

```text
Use this script and make a storyboard table.
```

```text
Generate Midjourney art prompts for shots 010-018.
```

```text
Run QA on the current workflow state.
```

Codex will execute the relevant role workflow in the current thread by default.

If you explicitly ask for subagents, parallel agents, or delegation, Codex should use the matching spec under `.codex/agents/<id>.toml`:

- `project-director`
- `script-writer`
- `guide-director`
- `storyboard-director`
- `artist-director`
- `animation-director`
- `qa-check`

Replaceable skill implementations are listed in `.agents/skill_registry.md`. For example, `storyboard.prompt_adapter` currently points to `storyboard-nanobanana`, and `video.prompt_builder` currently points to `video-prompt-workflow`.

`.codex/` and `.agents/` are hidden on macOS by default. In Finder, press `Cmd+Shift+.` to show hidden directories.

## Normal Sequence

1. Script: `deliverables/10_story/01_script_v{N}.md`
2. Optional audit: `deliverables/10_story/01_audit_report_v{N}.md`
3. Asset guide: `deliverables/20_guides/02_asset_guide_v{N}.md`
4. Style guide: `deliverables/20_guides/02_style_guide_v{N}.md`
5. Storyboard: `deliverables/30_breakdown/03_storyboard_v{N}.md`
6. Storyboard prompts: `deliverables/40_boards/04_storyboard_prompts_v{N}.md`
7. Art prompts: `deliverables/50_art/05_art_prompts_v{N}.md`
8. Video prompts: `deliverables/60_motion/06_video_prompts_v{N}.md`
9. QA report when useful: `deliverables/00_admin/qa_reports/`

## Generated Assets

```text
deliverables/20_guides/refs/          reference images declared by asset guide
deliverables/40_boards/generated/     storyboard sheets
deliverables/50_art/generated/        draft/review art keyframes
deliverables/50_art/generated_ref_vN/ production candidate reference-bound keyframes
deliverables/60_motion/generated/     generated clips or platform exports
```

Every generated folder should have a `README.md` or manifest with:

- source artifact
- asset count
- reference mode
- shot range or file pattern
- known limitations

## Reference Image Rule

For production character images, local reference images declared in the latest asset guide must be loaded or attached before generation. Text DNA alone only supports draft outputs.

Use these manifest values consistently:

- `source`: input references
- `text_dna_draft`: storyboard or rough image output using text DNA only
- `text_only_draft`: art/keyframe draft generated without image references
- `image_reference_bound`: production candidate generated with required image references attached

## Version Rule

When creating a new version:

1. Read the highest current version in `deliverables/<stage>/`.
2. Move the old current file to `archives/<stage>/`.
3. Save the new file as `_v{N+1}.md`.
4. Update artifact metadata.
5. Update `deliverables/00_admin/changelog.md`.

## Current State

The previous test content has been archived. `deliverables/` is ready for the next active project.
