# Asset references and responsibility mapping

Use only assets that have a visible, audible, structural, or direct causal responsibility inside the current render interval. Availability in the conversation, project, neighboring scene, or a composite sheet does not make an asset active.

## Build the active registry

For each active asset, record internally:

- exact supplied handle or UI label
- asset class
- adopted feature or state
- output responsibility
- active time or state window
- any competing source content that materially requires one local boundary

Do not activate an asset only because it was uploaded or mentioned earlier.

## Use one canonical identifier

- Preserve the exact supplied `@tag`, `@图片1`, `@视频1`, or other UI label everywhere.
- If a required handle is missing, name the gap outside copyable generation text. Use an unresolved slot such as `<ASSET_CHARACTER_LEAD>` only in an explicitly requested placeholder template; never present it as a bound, paste-ready reference.
- Otherwise use one stable semantic label for a deliberately text-only or anonymous subject.
- Never alternate among a handle, name, role, letter, and shortened variant for the same entity.
- If a staging reference uses proxy letters or colors, map each proxy once to the canonical identifier, then use the canonical identifier in the prompt.

Reusing the canonical identifier is identification, not semantic repetition.

## Assign closed responsibilities

Describe only content observable in the asset and only the duty adopted for the current interval.

Inspect referenced media when its appearance or contents are needed. A supplied description or mapping may support a text draft, but is not evidence that the media was viewed. Continue a requested text-only draft using stable semantic labels; request a missing asset only when its unavailable detail materially determines the result. Do not infer visual traits from filenames or uninspected tags.

- **Identity:** face, body, age, proportions, costume, unique anchors
- **Location:** architecture, materials, geography, atmosphere, landmarks, visible light evidence
- **Prop or product:** shape, scale, material, structure, orientation, current state
- **Vehicle:** model, proportions, markings, doors, damage, reflections, current state
- **Staging:** subject disposition and directional relationships, not identity or visual style
- **Style:** palette, contrast, texture, exposure behavior, material response, photographic grammar
- **Motion or layout:** selected subject paths, timing, camera channels, occlusions, cuts, or landings
- **Audio:** only the approved dialogue, voice, music, ambience, effect, or rhythm duty defined under `audio-dialogue.md`

Give each asset one independent duty statement. Never describe one asset through another asset, let a style or location asset override identity, or let an identity asset silently control blocking, camera, action, sound, or background.

## Separate temporal states

Bind before/after characters, wardrobe changes, transformed states, prop transfers, environment replacements, damage states, and character-count changes to non-overlapping windows unless simultaneous overlap is explicitly authored.

Do not combine mutually exclusive states in one reference definition. A canonical identifier may persist across the sequence, but the adopted visible state must be re-bound when its window changes.

## Map layout or reference-video duties

When a video or diagram supplies motion or layout, map only the channels the user selects or the source visibly establishes:

```text
PROXY MAP: <source subject or object> -> <output subject or object>
INHERIT: <selected screen path, depth or scale change, timing, speed, acceleration, occlusion, camera, cut, or landing channels>
TARGET-OWNED: <identity, appearance, material, articulation, physical orientation, sound, or other output-controlled channels>
TIME WINDOW: <start and end of inheritance>
```

Following a proxy's screen path does not automatically transfer its identity, material, articulation, rotation, or sound. Do not claim frame-exact replication.

## Reactivate only the useful feature

Define the adopted identity anchor or state under `ACTIVE REFERENCES`. Inside a `SHOT` or `SEGMENT`, briefly name only the asset feature currently visible or driving composition, action, material response, or light. Put an audio-driving feature only in `AUDIO`.

For a composite reference, using one component does not activate the rest of the sheet. Do not re-list a full face, wardrobe, location inventory, group description, or prop design in every execution block.

## Bound competing source content locally

Prefer a closed positive duty. If distracting source content is likely to compete, place at most one precise exclusion beside that asset. Do not repeat the excluded concept in the scene, continuity, or final constraints. When the user requests negative-free bindings, state adopted duties only.

## Asset-reference check

- every used asset is active in the current interval
- every active asset has one or more explicit limited duties
- every entity uses one canonical identifier
- mutually exclusive states have separate windows
- no reference silently controls an unassigned domain
- no unused component of a composite asset has leaked into the prompt
- point-of-use reactivation is brief and does not duplicate full identity text
