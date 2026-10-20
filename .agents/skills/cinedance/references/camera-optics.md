# Camera and optics

Control the visible camera result with the fewest non-redundant instructions. Place shot size, optical result, physical camera placement, movement, focus, and ending composition inside the `SHOT` or `SEGMENT` that uses them. Do not output standalone `CAMERA` or `OPTICS` sections.

## Specify the camera as a physical path

Expand a named movement as:

`method + target + starting position or state + path + destination or ending composition`

Name one primary camera target for each continuous beat. Multiple visible subjects do not imply multiple camera targets.

Use one dominant camera behavior per beat. Combine movements only when their physical path is compatible and visually clear, such as a lateral track with a small pan maintaining composition. Reject contradictions such as fixed camera plus orbit, simultaneous push-in and pull-back, or a zoom used to imitate physical camera travel without authorization.

For a continuous take, define the complete path once. Later `SEGMENT` blocks state only the next landing, changed screen arrangement, action beat, focus change, and ending image. Repeat a path property only when it changes or must survive a fragile transition.

## Choose only useful optical outcomes

Select no more than the properties that materially affect the shot:

1. physical observation distance
2. foreground-to-background perspective relationship
3. background compression or environmental visibility
4. focus behavior when story-critical
5. distortion behavior when faces, architecture, or edge geometry require control

Do not stack camera distance, field of view, compression, bokeh, depth of field, distortion, and anti-drift when several phrases describe the same result. Simple framing language may be sufficient.

## Match lens character to content

- intimate face with surrounding space important: close wide perspective
- natural documentary action: normal perspective
- medium portrait or gentle isolation: short telephoto perspective
- tight emotion, distant observation, surveillance, or sports: telephoto perspective
- environmental action or strong near/far relationship: wide perspective
- large geography with straight architecture: wide rectilinear perspective
- macro or very small detail: use an insert when shot design or that structural change is authorized; otherwise preserve the authored shot structure

Do not mix incompatible lens characters inside one unbroken optical beat. Framing and lens character are separate: a close-up is not automatically telephoto, and an environmental shot is not automatically wide-angle.

## Optional diagonal-FOV anchors

Use a numeric anchor only when lens consistency has practical value:

- **107°:** very broad rectilinear environment and strong foreground scale
- **84°:** close camera, expanded depth, readable surroundings
- **47°:** natural proportions and moderate environmental context
- **29°:** stable portrait proportions and mild compression
- **18°:** strong isolation and background compression
- **8°:** distant observation and flattened depth

The anchor supports the visible outcome; it does not automatically specify aperture, distance, bokeh, or depth of field. Do not introduce another numeric value without a shot-specific reason.

## Focus and multi-shot consistency

Use focus changes only when they reveal, transfer attention, or clarify an authored action. Define one lens character within each continuous shot and change it only at a cut or an explicitly requested zoom.

Across continuity cuts, preserve geography, screen direction, gaze, body orientation, prop state, and light direction. Authored time jumps, montage, and location changes may establish new states. Do not repeat a lens lock at both the beginning and end of every shot. Use one local positive stability sentence only after optical drift occurs; add a local negative only if the same failure persists.

## Handheld behavior

Describe handheld movement as an operator carrying camera mass. Select one or two visible qualities: shoulder-mounted weight, restrained breathing, step response, small settling correction, or imperfect human reframing. Do not stack every handheld quality or automatically add `no gimbal`, `no drone`, `no digital jitter`, and similar exclusions.

## Camera and optics check

- the shot has one clear camera target
- start, path, and destination are physically compatible
- framing, physical distance, lens character, and focus do not contradict one another
- camera terminology does not outweigh the visible scene unless camera choreography is the primary event
- numeric data supports rather than replaces the visible result
- rejected lenses, rigs, angles, and coverage have not leaked into the prompt
- each continuous shot retains one coherent optical behavior
