# Director review

Run this review after D2 builds the current-spec snapshot, active-reference plan, and risk map, but before D3 compiles the prompt. Review the authored shot plan; do not silently redesign it.

Use the review in DIRECT MODE, for structurally complex sequences, after a structural generation failure, or before proposing a change to shot count, timing, camera, action allocation, reveal, or generation unit.

## Review in dependency order

1. **Intent and ending value:** the current interval has one readable purpose and ends on the authored image, action, reaction, or sound.
2. **First frame and geography:** opening occupancy, subject relationships, landmarks, prop ownership, and screen direction are sufficient to understand the action.
3. **Action capacity:** the interval and camera can show the number of required action units, contacts, hand changes, transformations, and reactions.
4. **Performance capacity:** the shot size, duration, and visibility can carry each authored emotional turn and listening state.
5. **Camera execution:** the camera has a coherent target, start, physical path, destination, focus behavior, and motivation without competing movements.
6. **Editing and handoff:** continuity cuts preserve action phase, geography, gaze, prop state, light direction, and emotional progression. Authored time jumps, montage, or location changes establish the specified new states; inserts and reaction shots serve the authored purpose.
7. **Light and sound:** local light changes and audible events have sources, triggers, timing, and an ending state where relevant.
8. **Reference responsibility:** each active asset controls only its assigned duty. Do not claim unseen details as observed. An authorized new angle or text-only design does not require a matching reference view; flag a gap only when exact identity, markings, geometry, or another indispensable detail cannot be established.
9. **Generative load:** no single execution block asks for several independent dominant changes that compete for the same subject, hands, frame, or duration.

Do not use an uncalibrated numeric complexity score. State the specific competing relationship when a split or redesign may be required.

## Decision authority

### Neutral completion

Complete implied details and low-impact, reversible wording choices without pausing when they preserve the authored dramatic and editorial result. Examples include carrying an unchanged prop state across a continuity cut or naming an established gaze target. The existence of several equivalent phrasings is not a director-level fork.

Do not treat camera path, first-frame reveal, shot size, screen position, hand choice, landmark distance, micro-performance, or clip duration as automatically neutral. They may be director-level choices.

In DIRECT MODE, creating the first minimum viable shot design is the assigned task, not a change proposal. Choose coherent framing, camera placement, blocking, and action allocation without pausing when they preserve every supplied story fact and no missing preference creates materially different outcomes. Once the user accepts or edits that design, treat it as authored.

### Proposal requiring the user

First apply current and still-valid authorization: a requested camera change, approved revision, or explicitly delegated iteration does not need approval again. In COMPILE MODE, or after a design becomes authored, present a concrete proposal and wait only when it would exceed that authorization by changing:

- shot or segment count
- duration or action allocation
- cut order or transition type
- framing, camera side, angle, path, or focus strategy
- first-frame or reveal logic
- a reaction or establishing shot
- generation-unit boundaries or a split
- keyframe, first/last-frame, or reference strategy

Ask only about the smallest choice that materially changes the result.

In DIRECT MODE, pause only for a true unresolved fork that cannot be decided from the supplied intent without choosing a materially different dramatic, editorial, identity, asset, duration, or ending result.

### Locked decisions

Never change without explicit authorization:

- core story event or causal result
- verbatim dialogue
- character identity or relationship
- brand, logo, product structure, or authored visible text
- locked character, wardrobe, prop, location, or visual style
- user-authored total duration, shot order, key action, or ending image

## Review result

Keep the result internal unless the user requests a report:

- `PASS`: compile directly
- `PASS WITH NEUTRAL COMPLETION`: record only the necessary inference and compile
- `NEEDS USER CHOICE`: surface the smallest unresolved director-level decision; continue unaffected authorized work
- `RETURN TO INPUT`: identify the indispensable missing asset, contradictory locked fact, or upstream change that wording cannot solve. Supply a requested text-only draft when useful, without claiming the missing reference is verified

Do not create a separate review report for an ordinary successful prompt.
