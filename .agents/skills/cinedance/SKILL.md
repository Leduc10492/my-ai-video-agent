---
name: cinedance
description: Compile one approved Prompt Envelope into a Chinese cinematic video prompt using CINEDANCE. Preserve the project shot plan, exact dialogue, references, and ending.
---

# CINEDANCE V4.13 — Modular 4-D Prompt Compiler

Turn the current scene or shot plan into a compact AI-video prompt. Add only controls that affect the image, motion, continuity, or approved sound. Prompt writing does not itself authorize generation, publishing, or changing upstream assets.

## Source And Language Override

Project-local integration of the installed CINEDANCE V4.13. The modular 4-D method below and its reference modules remain intact. This project adapter takes precedence over standalone format and mode defaults.

- **Simplified Chinese prompts only.** Translate section labels and directing prose; preserve exact source dialogue in its original language, real attachment tags, approved STYLE PREFIX, LUT names, technical strings, and authored timing verbatim.
- Use **COMPILE MODE** for `shotlist.prompt_compiler`. Shot design and Envelope grouping belong to `shotlist.breakdown`; the standalone DIRECT MODE is not activated by this slot. Return unresolved upstream choices to the caller rather than silently redesigning shots.
- Output one standalone prompt in a code block per approved Envelope. The caller keeps `P###`, source Rows, compiler identity, and asset file routes outside the copyable text.
- Preserve the approved color hierarchy, camera plan, scope, duration, first/final state, sound policy, and asset duties. Do not introduce measurements, FOV conversion, a new color ratio, or new model settings merely to fit a template.

## Slot Contract

- slot: `shotlist.prompt_compiler`
- contract_version: `1`
- caller: orchestrating Agent after `shotlist.breakdown`
- input unit: one approved Prompt Envelope packet
- output unit: one standalone Simplified Chinese video Prompt for the specified model (currently Seedance)
- writes: none; return the compiled text to the caller

This Skill compiles Prompt content only. Preserve `Scene -> Shot Row -> Prompt Envelope`, Scene scope, Shot Row order, Envelope grouping, reserved Prompt IDs, asset filenames/routes, and exact active tag mapping/load order. Do not modify HTML, manifest, QA, or production-state metadata. The HTML assembler embeds the returned text unchanged.

The caller supplies the current Envelope's approved generation mode, source Rows, exact dialogue (speaker, addressee, delivery/lip-sync mode), timing, blocking, camera plan, endpoint, active attachment tags with reference duties and verified fitness, and applicable asset/style facts. Missing production-critical evidence returns an ambiguity packet to the caller. For an explicitly authorized text-only draft, keep assumptions and missing-input notes outside the prompt; do not invent tags or claim reference verification. No reference inspection or generation is implied by compilation.

## Scope and authority

The latest explicit user instruction and still-valid authorization govern the task. Module steps, headings, ordering, and content markers are defaults; preserve a requested schema, language, local-edit boundary, and exact control strings, including approved STYLE PREFIX and LUT names. Do not reformat an existing prompt merely to fit this template.

Complete requested changes without asking for the same approval again. Ask only about an unresolved choice that materially changes the result; first provide the concrete proposal or unaffected work that can be completed. If a rule blocks progress, name and link its file, quote the applicable sentence, and explain the unresolved choice outside the generation prompt.

## Select the operating mode

- **COMPILE MODE:** The user supplies shots, cuts, timing, camera, blocking, layout video, keyframes, or a prompt to rewrite. Preserve the authored shot contract except for the changes the user requests or authorizes.
- **DIRECT MODE:** No shot plan is committed, or the user explicitly asks for coverage or shot design. Create the minimum shot structure needed.

Within that scope, resolve source conflicts by latest explicit instruction, assigned reference duty, verified UI setting, then necessary neutral inference. Never invent platform capabilities, handles, parameters, or native syntax.

For a local edit, retain the existing text and structure outside the requested change. Load only modules affected by that change, check the changed span and its relevant dependencies, then return the requested excerpt or complete prompt. Do not rebuild the whole sequence or audit unrelated history.

## Load modules by responsibility

Read only the modules whose triggers apply. A module supplies internal writing or review capability; it does not automatically create a same-named output section.

- **`references/style-prefix.md`** — establishing or revising a reusable look, extracting a style reference, or repairing style drift. Copy an unchanged approved prefix verbatim.
- **`references/asset-references.md`** — assigning or changing image, video, audio, identity, location, prop, style, layout, or before/after reference duties.
- **`references/spatial-blocking-continuity.md`** — first-frame occupancy, multiple subjects, geography, gaze, orientation, prop-hand state, or cut continuity.
- **`references/camera-optics.md`** — framing, camera path, perspective, lens character, focus, handheld behavior, or optical drift.
- **`references/action-physics.md`** — consequential movement, contact, prop interaction, material response, or weak physical motion.
- **`references/performance.md`** — emotional beats, reactions, listening, restrained feeling, dialogue performance, or acting failures.
- **`references/lighting.md`** — source direction, exposure, shadow geometry, changing light, atmosphere, or lighting drift.
- **`references/audio-dialogue.md`** — dialogue, voice, ambience, effects, music, reference audio, subtitles, exact visible text, or authorized prior audio context.
- **`references/director-review.md`** — DIRECT MODE, structural complexity or failure, competing action/camera requirements, or a proposed shot-contract change.
- **`references/prompt-finalization.md`** — a new prompt, substantial rewrite, or whole-prompt quality review. For a bounded edit, use D4 on the affected content.
- **`references/contamination-cleanup.md`** — superseded decisions, stale handles, competing references or state windows, or neighboring-scene leakage. An ordinary local correction does not require a history-wide cleanup.

Local camera, action, physics, performance, blocking, and lighting controls belong inside the relevant `SHOT` or `SEGMENT`. Do not output separate global `CAMERA`, `OPTICS`, `ACTION`, `PHYSICS`, `ACTING`, or `LIGHTING` sections. `AUDIO` is the only dedicated craft section. `STYLE PREFIX` remains an optional reusable project module.

## Internal 4-D workflow

Use this process internally, scaled to the requested scope. Do not expose snapshots or review status in the generation prompt.

### D1. Deconstruct the current version

- Build one `CURRENT SPEC SNAPSHOT`: task, authorized changes, format, duration or rhythm, active subjects and references, state windows, event order, camera, transition, ending, visible text, and audio.
- Maintain an internal `REPLACED OR REMOVED` list. Delete those states, assets, actions, sounds, poses, transitions, and old prompt fragments instead of turning them into negative instructions.
- When the user says “continue,” “rewrite,” or “based on the first version,” carry forward only still-active decisions. A requested return to one earlier feature does not revive other superseded details from that version.
- Lock the current render interval as `START -> IN-SCOPE EVENTS -> END`. End exactly on the latest requested image or sound.
- Separate mutually exclusive states by interval. A before-state image, transformed-state image, wardrobe change, prop transfer, environment replacement, or character-count change controls only its declared window.
- Preserve the shot contract outside authorized changes: counts, first/final states, causality, geography, prop ownership, cuts, timing, camera, style, and sound.
- Treat timestamps as rhythm allocation unless the task is a true edit with an inspectable master. Do not imply frame-accurate control.

### D2. Diagnose references and fragile controls

- Activate only references with a duty in this interval. Distinguish observed source content from supplied descriptions or design inference; never claim to have inspected unavailable media.
- Load modules for actual risks and affected controls, not for formal completeness. A missing reference does not block a requested text-only draft; do not invent its handle or claim its appearance is verified.
- Preserve authored counts and qualitative intent. Add exact measurements only when supplied, reference-derived, or necessary to fix a demonstrated failure.
- When `references/director-review.md` is triggered, run it after the risk map and before prompt compilation. Surface only a director-level choice that requires the user's decision; otherwise continue silently.

### D3. Develop the minimum payload

When the user has not specified a format, use only needed sections in this order:

```text
STYLE PREFIX
SCENE CONTEXT
ACTIVE REFERENCES
FORMAT MODE
SHOT 1 / SEGMENT 1
SHOT 2 / SEGMENT 2
AUDIO
GLOBAL CONTINUITY
POSITIVE CONSTRAINTS
```

Never emit an empty section. `STYLE PREFIX`, `SCENE CONTEXT`, `FORMAT MODE`, `AUDIO`, `GLOBAL CONTINUITY`, and `POSITIVE CONSTRAINTS` are conditional. Keep a supplied reusable STYLE PREFIX stable; otherwise use one compact local style sentence when sufficient.

Use `SHOT` for a cut or new camera setup and `SEGMENT` for a phase inside one unbroken take. Use one level unless the authored plan explicitly requires both.

For a new execution block, use the relevant parts of this order:

1. authored time range, if any
2. drawable opening image and active state
3. necessary spatial arrangement
4. camera target, start, path, focus, and ending position
5. trigger, action path, contact, prop interaction, and relevant physical response
6. camera-readable performance changes when relevant
7. observable ending state and relevant local light result

Give each block a clear focus: a dominant change, coherent authored action chain, or intentional held state. Do not add motion to a static shot or split authored actions to satisfy a count. Integrate only relevant module contributions.

Treat dialogue and sound as audio behavior. Place approved dialogue, speaker, delivery, lip sync, ambience, effects, music, and sound-to-action timing in one `AUDIO` section. Keep non-subtitle visible text in the execution block where it appears.

Give each control one authoritative home. Do not repeat full identity descriptions, camera mechanisms, style clauses, actions, final poses, audio policy, or rejected alternatives across sections.

### D4. Deliver and verify

- Check the affected output against `CURRENT SPEC SNAPSHOT`: active requirements retained, replaced content removed, exact dialogue/tags/control strings preserved, and state windows coherent.
- Check drawable opening, action or held state, camera, and ending. Continuity cuts inherit unchanged physical and emotional state; authored time jumps, montage, location changes, and transitions establish their requested new states.
- Finalize and clean up only as triggered above, combining overlapping checks into one pass. After a correction, recheck affected requirements; do not restart every module without a new issue.
- Omit redundant UI settings unless explicitly requested in the prompt. Claim no unsupported platform behavior.
- Deliver the prompt in the requested format. Add explanations only when requested or necessary to identify a material unresolved input; keep draft status, missing-input notes, approvals, and QA outside copyable generation text.
- Distinguish text draft, compiled prompt, generated output, visual QA, user acceptance, and publication. A prompt check proves only the text was checked.
