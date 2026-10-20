# Audio and dialogue
Write only sound and dialogue explicitly present in the current render interval. A full script may explain context but never authorizes dialogue, sound, voice-over, music, or subtitles from another interval. Include an earlier line only when the user explicitly authorizes it as non-playing prior audio context.

## Source-provenance gate

An audible item may be introduced only by:

- the current selected interval
- an approved internal shot plan for that interval

A first-frame continuity state or a minimal local guard for a diagnosed failure may constrain the timing, source, synchronization, or suppression of an already authorized audible item. Neither one authorizes new dialogue, ambience, effects, music, narration, or offscreen voice.

Do not carry in later dialogue, earlier ambience, an absent character's voice, unrequested narration or music, old-prompt audio, or counterfactual states such as `has not replied yet`.

## Exact dialogue

- Speak only dialogue supplied verbatim by the user or current-interval script, or reliably transcribed from reference audio explicitly assigned to dialogue content. Ask instead of guessing an uncertain word.
- By default, enclose each line in `{}` with only spoken text inside; preserve a user-specified schema or dialogue notation.
- Preserve wording exactly. Do not translate, polish, correct, complete fragments, expand, or add names, interjections, ad-libs, or replies.
- Treat a user-approved translation as new authorized dialogue.
- Speak a character name only when it already appears inside the authorized line.
- When the source says only `he apologizes` or `she tries to speak`, render visible performance or ask for the line; never invent words.

Use this form:

```text
@SPEAKER + visible trigger or authored time + optional delivery + {verbatim dialogue}
```

Example:

```text
After the finger stop described in SHOT 1, @WOMAN says in a low, steady voice: {I know.}
```

## Language, speaker, and lip sync

- Write the prompt body in the user's language unless another output language is requested; preserve dialogue in its source language.
- Name a dialogue language only when the user specifies it or the current prompt creates a real multilingual ambiguity. The script used by the line is not sufficient reason to label its language.
- Never infer language variety or accent from text, appearance, location, or filename. Bind a specified accent to one exact speaker.
- Bind every spoken line to one speaker and one clear trigger.
- Bind speech-shaped lip sync to the assigned speaker and line. Preserve authored silent mouth reactions or breathing; they do not authorize invented words or voice.
- Allow overlapping spoken lip sync only when overlapping dialogue is explicit.
- In a dialogue-free interval, do not invent speaking mouth motion, voice-over, narration, or offscreen voice. Keep explicitly authored silent mouthing or non-vocal mouth actions in the visible performance.
- Write speaking, delivery, lip-sync, and listener-silence instructions only in `AUDIO`. Keep `SHOT` or `SEGMENT` limited to the visible trigger and non-vocal reaction.

## Sound, ambience, music, and audio references

- Include only sounds with a clear source inside the current interval, or sounds explicitly requested by the user.
- For ambience, identify the spatial source and useful distance. For an effect, bind the sound to the exact action and trigger, and to the contact point when contact produces it.
- Identify music as diegetic music or non-diegetic score and name its source when diegetic. Never convert ambience into music or add a score automatically.
- Ambience may duck naturally under dialogue when clarity is needed; do not invent studio, microphone, or mixing specifications.
- Assign each reference audio exactly one or more explicitly approved duties: dialogue content, speaker timbre, music, ambience, sound effect, or action or edit rhythm. It controls nothing else. When several source speakers, spans, sounds, or cues exist, map the chosen source element to the exact output speaker, line, sound, execution block, or cut. For rhythm duties, keep actions in `SHOT` or `SEGMENT` and cuts in `FORMAT MODE`; use `AUDIO` only to map named audio cues or beats to those blocks or cuts.

## Content markers

In the default format, dialogue uses `{}`. Follow a user-specified schema or literal notation instead when provided. Use other markers only when they help separate authorized content:

- music: `()`
- sound effects: `<>`
- dialogue: `{}`
- subtitles or exact visible text: `【】`

These are platform-neutral content delimiters inside the written prompt, not claims that a target model exposes matching control syntax.

Do not force all four marker types into every prompt. Inside `<>`, write character names and `@tags` normally.
When a marker is used, preserve the literal characters shown above in every prompt language; never replace `()` or `<>` with full-width punctuation.
## Subtitles and visible text

- Dialogue does not create subtitles automatically.
- Use `【】` only when the user requests subtitles or exact visible text, and preserve the supplied text exactly. Put subtitles in `AUDIO`; put non-subtitle visible text in the relevant `SHOT` or `SEGMENT` at its first appearance.
- When dialogue is present and subtitle suppression materially needs locking, place `No subtitles or speaker labels appear on screen.` beside the affected line; do not expand it into a general negative list.
- Use a prepared image asset or post-production for story-critical long text, complex layouts, formulas, or product specifications.

## Timing

- Preserve authored onset, duration, and cutoff for dialogue, ambience, effects, music, subtitles, and reference-audio rhythm. When only total duration is known, align them to a visible trigger or named execution block instead of inventing exact seconds.
- Ensure the line can finish naturally within the current action and interval. If it is clearly too long, ask whether to shorten, extend, or split it; never delete words silently.
- Add pauses only when authored or visibly required for the performance. Never impose a default silent second or an arbitrary early start.

## Prior audio context

Only when the user explicitly supplies or approves an earlier line for emotional continuity, write:

```text
Prior audio context only, not visual content: "Verbatim earlier line."
```

Do not replay it or allow mentioned people, objects, or events to enter the current image.

## AUDIO section

In the default format, place approved dialogue, voice, ambience, effects, music, reference-audio duties, prior audio context, and local subtitle or audio locks in one English-titled section:

```text
AUDIO
```

Write the section body in the prompt language while preserving verbatim dialogue, `@tags`, visible text, and technical strings. Use a shot label, authored time, or brief visible trigger only when needed for synchronization. Keep `AUDIO` for an active audio-reference duty or explicitly authorized prior audio context even when neither plays. Otherwise omit the section when the current interval has neither approved audible content nor a material audio or subtitle boundary. Never fill it for structural completeness.
## Final check
Check affected audio once: verbatim sourced dialogue, assigned speakers and triggers, no unapproved speech, preserved silent performance, no inferred accent, current sound sources, action synchronization, authored timing, limited audio-reference duties, authorized subtitles, and no neighboring-scene leakage. Keep analysis, QA, and material missing-input notes outside copyable generation text; use the main skill's delivery rule.
