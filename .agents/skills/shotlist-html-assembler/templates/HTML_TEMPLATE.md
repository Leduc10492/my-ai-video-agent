# HTML Placeholder Contract

Use `../assets/shotlist-house-template.html` as the exact self-contained scaffold. Do not invent a separate house template.

## Required Document Placeholders

Replace every placeholder before delivery:

| Placeholder | Value |
| --- | --- |
| `{{ARTIFACT_ID}}` | Scene-package artifact ID from `manifest.md` |
| `{{ARTIFACT_VERSION}}` | Package version such as `v2` |
| `{{SOURCE_ARTIFACT_IDS}}` | Comma-separated upstream artifact IDs |
| `{{PROJECT_TITLE}}` | Current project title from the script/locks |
| `{{SCOPE}}` | Scene-native scope |
| `{{N_SCENES}}` | Screenplay scene count |
| `{{N_ROWS}}` | Shot-row count |
| `{{N_PROMPTS}}` | Prompt-envelope count |
| `{{REFERENCE_SUMMARY}}` | One concise Chinese Scene-level summary containing all four reference-state fields; render once in the HTML header, never inside a prompt block |
| `{{PLAN_OPTIONS}}` | Stable English values with Chinese visible labels |
| `{{TOC_LINKS}}` | Scene links |
| `{{ASSET_SUMMARY}}` | Chinese asset/reference table or summary |
| `{{SCENE_BLOCKS}}` | Rendered scene sections |

The final HTML must contain no unreplaced `{{...}}` tokens.

Because each current package contains exactly one screenplay Scene, the document-header `{{REFERENCE_SUMMARY}}` is the single Scene-level state marker. Keep it outside individual Prompt Envelopes, asset handles, warnings, and copyable Prompt text.

## Identifier Contract

- Shot rows use `data-row-id="<scene-label>-R<NN>"` and show that row ID in `.c-num`.
- Prompt blocks use unique reserved `P###` values in `data-prompt-id`, the prompt heading, copy button target, and `<pre id="P###">`.
- A prompt spanning multiple rows uses `rowspan`; later rows do not repeat the prompt block.
- `P###` values appear only as Prompt Envelope IDs; Shot Rows retain `<scene-label>-R<NN>`.
- A spoken-dialogue Row stores source mapping outside the copyable prompt on its `<tr>` as `data-dialogue-cue`, `data-dialogue-text`, `data-dialogue-addressee`, and `data-dialogue-mode="lip_sync"` or `"offscreen"`.
- The HTML assembler preserves the compiled Prompt text unchanged and stores Row/cue/addressee/mode mapping only in the non-copyable Row attributes.

## Scene Block

```html
<section class="scene" id="scene-021">
  <div class="scene-head">
    <div class="scene-num">scene-021</div>
    <h2 class="scene-title">INT. LOCATION - NIGHT</h2>
    <div class="scene-meta">
      <span><b>地点：</b>...</span>
      <span><b>情绪：</b>...</span>
      <span>3 条镜头行 / 1 条提示词</span>
    </div>
  </div>
  <div class="table-wrap">
    <table class="shotlist">
      <thead><tr><th>镜头行</th><th>类型</th><th>机位</th><th>动作</th><th>剧本内容</th><th>Seedance 2.0 提示词</th></tr></thead>
      <tbody>{{SHOT_ROWS}}</tbody>
    </table>
  </div>
</section>
```

## First Row Of A Prompt Group

```html
<tr data-scene="scene-021" data-row-id="scene-021-R01" data-plan="MS" data-dialogue-cue="ROKO" data-dialogue-text="Exact source line." data-dialogue-addressee="Lulu" data-dialogue-mode="lip_sync">
  <td class="c-num">scene-021-R01</td>
  <td class="c-plan"><span class="badge p-ms">中景</span></td>
  <td class="c-cam">50mm，入口内侧向背景墙</td>
  <td class="c-act">...</td>
  <td class="c-script" rowspan="3"><div class="script-inner">...</div></td>
  <td class="c-prompt" rowspan="3">
    <article class="prompt-card" data-prompt-id="P001">
      <div class="prompt-head"><b>提示词 P001</b><span>[MS-CU · 动作 + 反应]</span><button class="copy" type="button" data-copy-target="P001">复制</button></div>
      <pre class="prompt-block" id="P001">{{CHINESE_PROMPT}}</pre>
    </article>
  </td>
</tr>
```

Subsequent rows in the same prompt group contain only row ID, type, camera, and action cells.

## Prompt Embedding Boundary

`{{CHINESE_PROMPT}}` is the byte-for-byte output of the resolved `shotlist.prompt_compiler`. The HTML assembler injects no project-state heading, reference-state field, legacy label, Row ID, QA note, or workflow sentence into that output. Project metadata remains in the document header, Row attributes, and manifest.

## Final Checks

- Visible UI, scene headers, action cells, scene text, asset modules, tags, and notes are Simplified Chinese by default; compiled Prompt language follows the `shotlist.prompt_compiler` contract.
- Stable plan codes, paths, IDs, CSS classes, and JavaScript identifiers remain English/numeric.
- Copy, search, filter, print, and reset controls work.
- Search and plan filters operate on complete Prompt Envelope row groups. If any row in a `rowspan` group matches, keep the first row and its prompt/source cells visible with the whole group.
- HTML metadata matches `manifest.md`.
- All four reference-state fields appear exactly once in the Scene HTML header and never inside `.prompt-block`.
- Every prompt is copied byte-for-byte from its `<pre>` content.
