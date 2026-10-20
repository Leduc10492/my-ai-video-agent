# Lighting and exposure

Preserve the light established by the user's instructions and active references. Do not invent a key, fill, rim, color effect, practical, or exposure treatment merely to complete a lighting description.

Project-wide lighting philosophy belongs in `STYLE PREFIX`. Actual source, direction, shadow geometry, exposure, and change inside the current shot belong in its `SHOT` or `SEGMENT`. Do not output a standalone `LIGHTING` section.

## Describe the minimum local light geometry

When lighting materially shapes the shot, select the useful parts:

1. visible or implied source
2. source direction
3. camera position relative to the source
4. subject or environmental planes reached by the light
5. planes remaining dark
6. exposure priority
7. visible change or ending result

Example:

```text
Morning sun enters behind her from camera-right. The camera remains on her shadow side; a narrow rim traces the shoulder while exposure holds the bright street beyond.
```

Name the surface or atmosphere carrying the light. Prefer `late sun catches dust above the concrete` to abstract prestige phrases.

## Backlight, silhouette, and practicals

For contre-jour, place the subject between camera and brighter background, keep the camera on the intended shadow side, and specify how much bounce or contour remains visible. Do not automatically add crushed faces, eye lights, wet highlights, beauty fill, and multiple rim descriptions.

For a practical light, identify the fixture or visible source, the area it reaches, falloff, and the relevant exposure relationship. Do not let an unexplained off-camera light override an established practical setup.

## Changing or intermittent light

Tie a light change to its source or event: a door opening, lamp switching off, passing vehicle, muzzle flash, flickering sign, fire, or moving shadow. Describe what surface changes and what state remains afterward.

In a flicker or strobe scene, keep subject and camera motion continuous while only illumination changes intermittently. Use this control only when flicker is authored or a demonstrated failure requires clarification.

## Atmosphere and materials

Describe light through smoke, dust, haze, rain, glass, wet pavement, skin, fabric, metal, or other material only when that interaction is visible and relevant. Coordinate the atmosphere source and motion with `action-physics.md`; do not use lighting language to invent new weather or particles.

## Local failure controls

State positive geometry first. Add at most one local boundary such as `no frontal beauty fill` only when a known or strongly likely failure would destroy the intended lighting relationship. Do not append a generic lighting-negative list.

## Lighting check

- the light source or direction is supported by the request or reference
- camera, subject, and source geometry agree
- bright and dark planes are readable
- exposure priority is stated only when needed
- local light does not duplicate the project-wide STYLE PREFIX
- changing light has a cause and ending state
- no invented fill, rim, practical, particle, or color effect has entered the shot
