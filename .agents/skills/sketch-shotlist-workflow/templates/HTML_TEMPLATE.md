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

Because each current package contains exactly one screenplay Scene, the document-header `{{REFERENCE_SUMMARY}}` is the single Scene-level state marker. Do not repeat it in individual Prompt Envelopes, asset handles, warnings, preview cells, or copyable prompt text.

## Identifier Contract

- Shot rows use `data-row-id="<scene-label>-R<NN>"` and show that row ID in `.c-num`.
- Prompt blocks use unique reserved `P###` values in `data-prompt-id`, the prompt heading, copy button target, and `<pre id="P###">`.
- A prompt spanning multiple rows uses `rowspan`; later rows do not repeat the prompt block.
- Never display a `P###` value as a shot-row ID.

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
      <thead><tr><th>镜头行</th><th>类型</th><th>机位</th><th>动作</th><th>剧本内容</th><th>Seedance 2.0 提示词</th><th>线稿预览</th></tr></thead>
      <tbody>{{SHOT_ROWS}}</tbody>
    </table>
  </div>
</section>
```

## First Row Of A Prompt Group

```html
<tr data-scene="scene-021" data-row-id="scene-021-R01" data-plan="MS">
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
  <td class="c-preview" rowspan="3">{{PREVIEW_BLOCK}}</td>
</tr>
```

Subsequent rows in the same prompt group contain only row ID, type, camera, and action cells.

## Prompt Purity Contract

`{{CHINESE_PROMPT}}` contains only Seedance-executable direction. It must not contain project-state headings, fields, values, or legacy labels such as `⚠️参考状态`, `asset_origin`, `reference_binding`, `reference_approval`, `output_status`, `prompt_only`, `production_approved`, `text_dna_draft`, `image_reference_bound`, `文本DNA`, `未附图`, or `未获用户站位锁定`.

Reference handles may still state visible facts and model-facing use limits, such as `仅参考服装和体型，不参考背景`.

## Preview Rules

For a real preview, embed a package-relative image:

```html
<a class="preview-card" href="previews/P001.png" target="_blank" rel="noopener">
  <img src="previews/P001.png" alt="P001 线稿预览">
  <span>P001 · previews/P001.png</span>
</a>
```

For `output_status: prompt_only`, use a concise visible Chinese result such as `本轮未生成线稿预览`, instead of a broken `<img>` or another copy of the project status token.

## Final Checks

- Visible UI, scene headers, action cells, scene text, asset modules, tags, notes, and prompts are Simplified Chinese by default.
- Stable plan codes, paths, IDs, CSS classes, and JavaScript identifiers remain English/numeric.
- Copy, search, filter, print, and reset controls work.
- Search and plan filters operate on complete Prompt Envelope row groups. If any row in a `rowspan` group matches, keep the first row and its prompt/source/preview cells visible with the whole group.
- HTML metadata matches `manifest.md`.
- All four reference-state fields appear exactly once in the Scene HTML header and never inside `.prompt-block`.
- Every prompt is copied byte-for-byte from its `<pre>` content.
