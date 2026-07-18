# Prompt Density

Group shot rows into practical variable-duration prompt envelopes without stretching short causal beats or overloading one generation. The selected generator duration is a cap, not a target.

## Starting Contract

Start from the breakdown `Prompt Envelope Plan`. Each planned envelope must already declare:

- reserved `P###` ID
- source `<scene-label>-R<NN>` rows
- outer start/end beat
- dialogue boundary
- character and asset set
- internal shot plan when needed
- intended duration and why the grouping fits that duration
- next beat reserved for the following envelope

Lock dialogue boundaries before the merge test. Extract source dialogue in order, map each spoken line to its own lip-sync Shot Row/internal shot, and keep source-marked `O.S.` / `V.O.` lines as explicit off-screen audio. Several lines may share an Envelope only when those individual shot boundaries remain intact.

If Phase 4 changes the plan, record the reason in `Prompt Density Notes` and the scene-package manifest.

## Merge Test

Merge adjacent rows into one envelope only when all are true:

1. Same character set is visible or immediately continuous.
2. Same location or camera-readable sub-location is used.
3. Spatial axis and blocking remain coherent.
4. Beats form one immediate emotional or causal turn.
5. Total staged action fits the selected generator cap without padding or invented holds.
6. The prompt remains executable after handles, blocking, dialogue, style, and failure locks are included.
7. Every source dialogue line keeps its own internal shot and source order; merging does not combine independent lines into one lip-sync performance.

Prefer one multi-shot envelope when separate clips would make a short cause-effect chain feel slow. Preserve row detail with internal `【镜头1】`, `【镜头2】`, and `【镜头3】` blocks rather than erasing the cuts.

Generic example:

- `【镜头1】`: Character A makes a precise warning gesture.
- `【镜头2】`: Character B follows the gesture and realizes the threat.
- `【镜头3】`: Character B performs the immediate release or refusal action.

These rows belong together only when they share cast, location, axis, and one uninterrupted causal turn.

## Split Test

Split when any condition applies:

1. Hard cut between locations or time periods.
2. Character entrance/exit changes the handle set materially.
3. Camera setup or reference set cannot remain coherent inside one envelope.
4. A performance arc needs an independent generation to land reliably.
5. A prop/screen insert needs independent focus control.
6. The model is likely to leak the next story action early.
7. A question, answer, reveal, or decision needs a protected dialogue boundary.
8. Combined prompt length or instruction density makes execution unreliable.

## Boundary Audit

Before drafting each prompt, answer:

- What exact action starts this envelope?
- What exact action ends it?
- Which previous beat is already complete?
- Which next beat is forbidden here?
- Which exact dialogue belongs here?
- What is the shortest believable duration for this grouping, and why?
- What is the main overload or leakage risk?

## Internal Cuts

A single envelope usually contains 1-3 internal shots. It may contain 4-5 fast internal shots only when every duration is explicit, the total remains within the selected generator cap, cast/location/axis stay stable, and scene-level review confirms the prompt is still executable. Every internal shot states its own duration, lens, camera position, background, action path, and performance detail. Internal shot boundaries do not automatically require separate prompt envelopes.

Use a one-shot envelope when one continuous performance or camera move carries the emotional turn. Use a multi-shot envelope when a few fast cuts express one uninterrupted unit.

## Decision Rule

Do not optimize for the fewest or most prompts. Choose the grouping with the lower production risk:

- split when one prompt would overload blocking, performance, dialogue, or references
- merge when separate clips would stretch one short causal turn or create redundant setup

When tests disagree with the plan, preserve the source rows, revise the envelope grouping, allocate new prompt IDs if identity changed, and record the reason.

## Tagging

Use short Chinese-readable tags while retaining stable plan codes, for example:

- `[MS-CU · 开门 + 反应]`
- `[ECU · 道具插入]`
- `[多镜头 · 警告 + 领会 + 放行]`

Use the plan codes in [PLAN_TYPES.md](PLAN_TYPES.md).
