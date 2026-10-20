# Contamination cleanup

Use this module when superseded decisions, stale handles, competing reference duties or state windows, or neighboring scenes may contaminate the current prompt. Check the affected content alongside finalization; a routine local correction does not require a history-wide pass. Cleanup removes pollution without adding coverage, redesigning a shot, or changing an authored event.

Use `CURRENT SPEC SNAPSHOT` and `REPLACED OR REMOVED` as the only authority. Do not compare the final prompt against an older prompt as if old content remains valid.

## 1. Clear interval leakage

Remove every person, prop, event, action, sound, pose, transition, location, or visual state outside `START -> IN-SCOPE EVENTS -> END`.

Delete out-of-interval concepts entirely. Do not preserve them as `not yet`, `no longer`, `still absent`, `does not appear`, or another counterfactual state unless the current camera or soundtrack can verify that absence and it materially shapes the shot.

## 2. Clear asset and state pollution

Remove:

- inactive or stale handles
- unused components of composite references
- identity traits copied from a location, style, staging, or motion reference
- backgrounds, poses, wardrobe, props, or lighting that belong to another asset duty
- before-state traits inside an after-state window and vice versa
- characters or objects imported from neighboring scenes
- layout-video appearance or orientation channels that were not assigned for inheritance

Confirm that every remaining referenced feature is visible, causal, or necessary for continuity in the current interval.

## 3. Clear audio leakage

Remove unapproved dialogue, paraphrased dialogue, neighboring-scene ambience, absent-character voices, invented narration, unrequested music, old audio-reference duties, inferred accents, automatic subtitles, and unauthorized speech-like mouth movement. Preserve authored silent mouth reactions and breathing.

In the default format, keep approved audible behavior in `AUDIO` and ordinary non-subtitle visible text in its execution block. Reuse audio checks already completed; after cleanup, recheck only affected dialogue, cues, and synchronization.

## 4. Clear cross-section duplication

Remove repeated full identity descriptions, camera mechanisms, action paths, final poses, light clauses, audio policies, and failure guards. Keep the most specific authoritative version.

Do not treat a stable handle, changed state, necessary cut inheritance, or brief point-of-use asset feature as duplication.

## 5. Clear correction residue

Remove:

- rejected alternatives and comparisons such as `rather than use a wide lens`
- internal reasoning and statements of intent that do not change visible behavior
- generic cinematic praise and quality stacks
- unsupported technical precision or platform syntax
- redundant UI-controlled settings, unless explicitly requested in the prompt
- bilingual synonyms and terminology glosses
- negative tails that repeat an existing positive result
- production notes, script headers, QA comments, and old prompt fragments

Replace an absence-based setup with the current drawable state when appropriate. Preserve a concise negative only when it defines a current, verifiable boundary more precisely than a positive sentence or protects against a demonstrated local failure.

## 6. Enforce the ending boundary

Confirm that nothing continues, reacts, speaks, transforms, or introduces a new subject after the latest authored final image or sound. Remove trailing setup for a later scene.

## Cleanup result

After cleanup:

- every named entity belongs to the current interval
- every asset feature belongs to an active duty and state window
- every sound is authorized and correctly located
- each control has one authoritative home
- no stale alternative competes with the selected camera, action, performance, or ending state
- the prompt remains complete after deletions
