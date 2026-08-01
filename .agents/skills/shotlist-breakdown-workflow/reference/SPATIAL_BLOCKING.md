# Breakdown Spatial Blocking — Top-Down Schema

**Rule:** before writing any prompt with 2+ characters, key props on a specific surface, or complex camera geometry — produce a top-down (bird's-eye) SVG schema and get user approval. AI video models hallucinate spatial relationships unless they're declared in absolute terms; the schema is how you lock blocking before the prompt is written.

## 1. When to draw a schema

Draw it for:
- Any scene with 2+ characters in the same location
- Any scene with a key prop on a specific surface (device, artifact, weapon, photo)
- Any scene where camera geometry matters (which shot from where)
- Any time the user requests a position change — redraw immediately

Skip it for:
- Single-character close-ups in a generic location
- Inserts/cutaways with no character relationship
- Pure environmental shots

## 2. What goes on the schema

- **Room/location outline** with labeled walls, tables, screens, bridges, etc.
- **Each character** as a colored circle with their initial (G, R, J, Re, etc.)
- **Eyeline arrow** from each character (where they're looking)
- **Props** as distinct icons (e.g., 📡 for the device, 📷 for camera-in-scene, 📄 for paper)
- **Distances** between key objects (~Xm)
- **Surface labels** (FL/FR/BL/BR — front-left, front-right, back-left, back-right, relative to a stated main view)
- **Main axis** (e.g., "north–south = entrance to screen") for orientation
- **Camera position(s)** for each shot in the scene — separate icon, labeled

## 3. How to render

Use an available diagram or canvas tool, or create a simple SVG/Markdown coordinate plan when no visual tool is available. Use a stable legend and consistent character colors across the selected scope. The schema must remain readable without depending on a specific tool name.

After rendering, ask in Chinese: **"这个站位和道具位置对吗？需要改哪里？"** Iterate until the spatial plan is approved.

## 4. After approval — downstream handoff packet

The approved schema remains the planning source of truth. Pass a mode-aware spatial-fact packet to the orchestrating Agent and selected Prompt compiler:

- **T2V / text-only:** positions, distances, axis, facing, and occlusion needed to construct the shot.
- **I2V / R2V:** visible starting state carried by the opening image plus the required movement delta, target position, contact, axis, or occlusion.

The packet records only relationships the current action, camera move, or known failure risk depends on:
- Distances in meters
- Cardinal directions or "north/south/east/west" relative to the declared main view
- Who occludes whom
- Which direction each character faces
- Any heights or eyelines that the model might get wrong

The selected Prompt compiler owns the final wording and placement of these facts.

## 5. Position changes

If the user revises a position after approval, redraw the schema, obtain re-approval, and send the latest spatial-fact packet back through Prompt compilation. For I2V, mark which starting relationships are already visible in the attached opening image.
