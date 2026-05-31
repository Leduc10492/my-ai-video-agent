# HTML Template

  The output is an HTML file plus an optional sibling preview image folder. Use the exact CSS/JS from the team's house template unless preview embedding requires a minimal additive class. Default visible UI text to Simplified Chinese unless the user explicitly requests another language.

## Structure

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>分镜表 — 场景 {SCOPE}（含 Seedance 2.0 提示词）</title>
  <style>{HOUSE_CSS}</style>
</head>
<body>
<div class="container">
  <header class="top">
    <h1>分镜表 — <span>场景 {SCOPE}（含 Seedance 2.0 提示词）</span></h1>
    <div class="sub">为 {USERNAME} 准备 · {N_SCENES} 场 · {N_SHOTS} 个镜头 · 含中文电影化提示词</div>
    <div class="stats">
      <div class="stat"><div class="v">{N_SCENES}</div><div class="l">场景</div></div>
      <div class="stat"><div class="v">{N_SHOTS}</div><div class="l">镜头总数</div></div>
      <div class="stat"><div class="v">{N_PLANS}</div><div class="l">镜头类型</div></div>
    </div>
  </header>

  <div class="toolbar">
    <input type="text" id="search" placeholder="搜索文本、对白、地点...">
    <select id="planFilter">
      <option value="">全部镜头类型</option>
      {PLAN_OPTIONS}
    </select>
    <button onclick="window.print()">打印 / PDF</button>
    <button class="clear" onclick="resetFilters()">重置</button>
  </div>

  <div class="toc">
    <div class="toc-row"><span class="toc-label">场景</span>{TOC_LINKS}</div>
  </div>

  <h2 class="block-title first">场景 {SCOPE}</h2>

  {SCENE_BLOCKS}

  <div class="empty-state" id="emptyState" style="display:none;">没有找到结果。可以试试重置筛选。</div>
</div>
<script>{HOUSE_JS}</script>
</body>
</html>
```

## Per-scene block

```html
<section class="scene pal-red" id="sc{N}">
  <div class="scene-head">
    <div class="scene-num-row">
      <span class="scene-num">场景 {N}</span>
    </div>
    <h2 class="scene-title">{INT_EXT_HEADER}</h2>
    <div class="scene-meta">
      <span><b>地点:</b> {LOCATION_DESC}</span>
      <span><b>情绪:</b> <i>{MOOD}</i></span>
      <span class="shot-count">{N_SHOTS} 个镜头</span>
    </div>
  </div>
  <div class="table-wrap">
    <table class="shotlist">
      <colgroup>
        <col style="width:60px"><col style="width:120px"><col style="width:120px"><col style="width:auto"><col style="width:24%"><col style="width:32%"><col style="width:18%">
      </colgroup>
      <thead>
        <tr><th>#</th><th>镜头类型</th><th>机位</th><th>动作</th><th>剧本内容</th><th>Seedance 2.0 提示词</th><th>线稿预览</th></tr>
      </thead>
      <tbody>
        {SHOT_ROWS_WITH_PROMPTS}
      </tbody>
    </table>
  </div>
</section>
```

## Shot row + prompt cell

The first row of a prompt group carries the rowspanned `c-script` and `c-prompt` cells. Subsequent rows in the same group only have `c-num`, `c-plan`, `c-cam`, `c-act`.

```html
<tr data-scene="{N}" data-plan="{PLAN_CODE}">
  <td class="c-num">{SHOT_NUM}</td>
  <td class="c-plan"><span class="badge p-{PLAN_CLASS}">{PLAN_LABEL}</span></td>
  <td class="c-cam">{CAMERA_NOTE}</td>
  <td class="c-act">{ACTION_BEAT_ZH}</td>
  <td class="c-script" rowspan="{GROUP_SIZE}">
    <div class="script-inner">{FULL_SCENE_TEXT_ZH_OR_SOURCE}</div>
  </td>
  <td class="c-prompt" rowspan="{GROUP_SIZE}">
    <div style="font-size:11px; line-height:1.6;">
      {PROMPT_BLOCKS}
    </div>
  </td>
  <td class="c-preview" rowspan="{GROUP_SIZE}">
    <div class="preview-stack">
      {PREVIEW_BLOCKS}
    </div>
  </td>
</tr>
{ADDITIONAL_ROWS_NO_RIGHT_CELLS}
```

## Prompt block (one per 15-sec prompt)

```html
<div style="border-top:1px solid #333; margin:12px 0 8px; padding-top:8px;">
  <b style="color:#22c55e;">提示词 {N}</b>
  <span style="color:#666; font-size:10px;">[{TAG}]</span>
  <button style="margin-left:8px;padding:2px 8px;background:#27272a;border:1px solid #3f3f46;border-radius:4px;color:#a1a1aa;font-size:10px;cursor:pointer" onclick="navigator.clipboard.writeText(this.parentElement.nextElementSibling.textContent)">复制</button>
</div>
<div class="prompt-block">{CHINESE_PROMPT}</div>
```

The `{TAG}` is a short bracketed shorthand like `[MS-CU · 开门 + 靴子]` or `[ECU · 拍立得 + Roko表情]` — use Chinese by default so the prompt group can be scanned quickly.

## Preview block (one per 15-sec prompt)

Show the actual image thumbnail in the HTML. Do not show only a file path.

```html
<div class="preview-card">
  <a href="{PREVIEW_PATH}" target="_blank" rel="noopener">
    <img src="{PREVIEW_PATH}" alt="{PROMPT_ID} 线稿预览 · {SHOT_RANGE}">
  </a>
  <div class="preview-meta">
    <b>{PROMPT_ID}</b>
    <span>{SHOT_RANGE}</span>
    <code>{PREVIEW_PATH}</code>
  </div>
</div>
```

Use relative paths such as `shotlist_previews_SB071_SB080_v1/P377.png` by default. Use base64 only when the user asks for a single portable HTML.

## CSS + JS

Reuse the team's house CSS/JS verbatim where possible. Do not modify palettes, fonts, or search/filter behavior. Director palette logic (`pal-black` / `pal-blue` / `pal-red`) defaults to `pal-red` for all scenes unless director assignment is explicitly requested.

Add only the minimal preview CSS if the house template lacks image styles:

```css
.preview-stack{display:flex;flex-direction:column;gap:10px}
.preview-card{border-top:1px solid #333;margin:12px 0 8px;padding-top:8px}
.preview-card img{display:block;width:100%;max-height:320px;object-fit:contain;background:#111;border:1px solid #333;border-radius:4px}
.preview-meta{margin-top:6px;font-size:10px;line-height:1.5;color:#a1a1aa}
.preview-meta span{display:block;color:#d4d4d8}
.preview-meta code{display:block;white-space:normal;word-break:break-all;color:#71717a}
```

**Note on plan codes:** keep English plan codes (`WS`, `MS`, `CU`, `ECU`, `MACRO`, `PAN`, `OS`, `VO`, `VO+MS`, `DISSOLVE`) in `data-plan` and filter `<option value>` for stable JS filtering. Visible badge labels and filter text should be Chinese by default. If reusing CSS from older Cyrillic-coded HTMLs, swap the badge classes (`p-op` → `p-ws`, `p-sp` → `p-ms`, `p-kp` → `p-cu`, `p-dkp` → `p-ecu`, `p-vyk` → `p-os`) — the colors stay the same; only class names change.

## Filter dropdown

```html
<select id="planFilter">
  <option value="">全部镜头类型</option>
  <option value="WS">远景</option>
  <option value="MS">中景</option>
  <option value="CU">近景/特写</option>
  <option value="ECU">大特写</option>
  <option value="MACRO">微距</option>
  <option value="PAN">摇镜</option>
  <option value="OS">画外声</option>
  <option value="VO">旁白</option>
  <option value="VO+MS">旁白 + 中景</option>
  <option value="DISSOLVE">叠化</option>
</select>
```
