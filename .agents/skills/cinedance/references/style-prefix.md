# Style Prefix

Use `STYLE PREFIX` as an independent reusable module only when the user supplies an established prefix, style reference, color card, reusable project look, or asks to repair style drift. It defines persistent render grammar; it does not describe the current shot plan. For a simple prompt, prefer one compact local style sentence when a reusable project lock would outweigh the execution content.

## Source priority

Build the module from the highest available source:

1. User-supplied STYLE PREFIX or explicit style specification
2. User-supplied style image, color card, or visual reference
3. Active project references with a consistent visible look
4. Script, genre, period, dramatic intent, and user preferences

Copy an approved or explicitly locked prefix verbatim, including LUT names and supplied control strings. Change only clauses covered by the current request; do not silently clean up or relocate an `Audio` clause in a locked block. When a new instruction conflicts with a locked clause, apply the authorized override or surface the smallest unresolved conflict outside the prompt. From a visual reference, extract only observable palette, contrast, exposure, source and shadow behavior, atmosphere, texture, perspective, composition, material rendering, and motion character. Do not infer camera brands, film stocks, sensors, shutter, frame rate, or resolution from appearance alone.

If a style-reference handle exists, bind its function under `ACTIVE REFERENCES` and also state the extracted visible result in `STYLE PREFIX`. The reference controls look only; it does not silently control identity, blocking, action, or shot design.

## Project lock and scene variation

When a reusable project lock is active, keep only the clauses that materially govern multiple scenes stable. These may include `Style`, `Cinematography`, `Lighting`, `Camera`, `Surface realism`, `Performance`, `Physics`, `Composition`, `Continuity`, and `Technical`.

Vary only clauses designated as scene-dependent; `Color` is not automatically editable. Keep the project's lighting philosophy stable here, but place actual local sources, direction, exposure, shadows, and light changes in the execution block. Create a prefix variant when the user requests or authorizes a different visual regime, such as dream, archive, flashback, or another medium.

Once approved, copy every stable clause verbatim into later prompts. Do not paraphrase the cinematography or tonal core from scene to scene.

When synthesizing a new prefix from one scene, generalize scene evidence into reusable categories: material classes rather than named props, a performance register rather than the current gesture, and a composition grammar rather than the current ending image. Except in the scene-specific `Color` clause, do not name active subjects, handles, props, locations, events, or camera paths.

When the project intentionally mixes fidelity classes, bind stylization by class rather than applying one geometry label globally. Characters and architecture may use moderate low-poly planes while vehicles retain recognizable automotive proportions and continuous body panels, and smoke, fire, water, or lens effects use their own softer volumetric language. A project medium does not automatically impose the same polygon reduction on every object or effect.

## Compact module

Write one compact paragraph of short labeled clauses. Omit every clause that has no project-wide effect; do not fill the template for completeness.

```text
STYLE PREFIX

Style: [medium, realism, texture, tonal character]. Cinematography: [named cinematographer only if supplied, otherwise observable photographic grammar]. Lighting: [persistent source philosophy, contrast, exposure, and shadow behavior]. Color: [scene palette and hierarchy]. Camera: [persistent lens character and motion rendering]. Surface realism: [skin, fabric, and material response]. Performance: [persistent acting register]. Physics: [persistent mass, contact, and inertia baseline]. Composition: [persistent framing grammar]. Continuity: [project-wide stability policy]. Technical: [only prompt-relevant visible behavior not controlled by the UI].
```

Use concrete outcomes instead of prestige or quality stacks. Preserve supplied names and exact control strings. Do not invent `8K`, frame rate, aspect ratio, model, resolution, or UI settings; include them when explicitly requested in the prompt. Outside a locked prefix, add negatives such as `no 3D render`, `no jitter`, or `no game engine` only for a requested look or demonstrated failure.

## Color hierarchy

Use a non-numeric palette when sufficient. When a color hierarchy is useful, 60/30/10 is an optional shorthand, not a required formula; preserve authored ratios and colors. For example:

```text
Color: 60% [dominant real hue and its large-surface carrier], 30% [secondary real hue and its subject or major-light carrier], 10% [accent real hue and its story-critical carrier].
```

- **60% dominant:** environment, background, or overall color field.
- **30% secondary:** principal subject, wardrobe, furniture, or major light field.
- **10% accent:** small story-critical prop, mark, costume detail, or contrast cue.

Treat the ratio as visual hierarchy, not pixel measurement. Name real hues and the scene elements carrying them. Derive all colors from the user's instructions or visible references. If neither exists, choose a coherent hierarchy from the script and stated intent. Never overwrite reference colors. Use a concise non-numeric palette instead when the scene is intentionally monochrome, neutral, or multicolored without a clear hierarchy.

## Boundary with the scene prompt

When authoring a new prefix, keep identity, events, shot sizes, camera paths, dialogue, audio policy, reactions, shot-specific physics, light positions, and local failure guards in their scene sections. This organization rule does not authorize rewriting an existing locked prefix; avoid duplicating a policy already preserved there.

Do not create a second `STYLE` section. Do not repeat the prefix inside `SCENE CONTEXT` or `GLOBAL CONTINUITY`.
