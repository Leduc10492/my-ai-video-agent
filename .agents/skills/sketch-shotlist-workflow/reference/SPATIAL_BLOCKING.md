# Spatial Blocking — Top-Down Schema

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

After rendering, ask in Chinese: **"这个站位和道具位置对吗？需要改哪里？"** Iterate until approved before writing any prompt.

## 4. After approval — translating the schema into the prompt

Every prompt for that scene includes a `⚠️空间布局` block that mirrors the approved schema:

```
⚠️空间布局（MAIN VIEW=从 [direction]，俯视图布局）：
位置A：[Character1]靠/站在 [exact location]——[detail, e.g. height, angle]
位置B：[Character2]站在 [exact location]——[detail]
位置C：[Prop]放置在 [exact location]——[detail]
⚠️[Critical alignment rules: distances, axes, mirroring, occlusion]
```

Example:
```
⚠️空间布局（MAIN VIEW=从入口看向背景墙）：
位置A：@image1站在入口内侧偏左，面朝空间中央。
位置B：@image2站在中央轴线，距@image1约3米，面朝@image1。
位置C：@image3位于@image2后方1.5米，部分被@image2遮挡。
⚠️@image1与@image2不得交换左右位置；@image3必须保持后景遮挡关系。
```

Always include in the prompt:
- Distances in meters
- Cardinal directions or "north/south/east/west" relative to the declared main view
- Who occludes whom
- Which direction each character faces
- Any heights or eyelines that the model might get wrong

## 5. Position changes

If the user revises a position after approval — **redraw the schema first**, get re-approval, then update the prompt. Do not edit the prompt's `空间布局` block from memory; always work from the latest approved schema.
