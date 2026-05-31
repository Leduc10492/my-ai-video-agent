# Plan Types

Shot-plan taxonomy used in the shotlist. Keep the `data-plan` attribute and filter values in English for stable JS filtering. Visible labels default to Simplified Chinese unless the user explicitly requests English output. Older Cyrillic-coded HTMLs will need their filter JS updated; new shotlists use the codes below.

## Mapping

| Code | Default visible label | Badge class | Use for |
|---|---|---|---|
| `WS` | 远景 | `p-ws` | Establishing, full body, location-heavy |
| `MS` | 中景 | `p-ms` | Waist-up, dialogue, two-shots |
| `CU` | 近景/特写 | `p-cu` | Head-and-shoulders, reactions |
| `ECU` | 大特写 | `p-ecu` | ECU on eyes, hands, props, screens |
| `MACRO` | 微距 | `p-macro` | Pores, droplets, fabric textures |
| `PAN` | 摇镜 | `p-pan` | Slow horizontal/vertical pans |
| `OS` | 画外声 | `p-os` | Audio cue, no visual change |
| `VO` | 旁白 | `p-vo` | Voice over the prior visual |
| `VO+MS` | 旁白 + 中景 | `p-vo` | VO during a medium shot |
| `DISSOLVE` | 叠化 | `p-dis` | Transition between scenes |

## Usage

The HTML row uses the code in `data-plan` and the badge class for color, and shows the Chinese label in the badge text by default:

```html
<tr data-scene="21" data-plan="ECU">
  <td class="c-num">21.4</td>
  <td class="c-plan"><span class="badge p-ecu">大特写</span></td>
  ...
</tr>
```

The plan filter dropdown uses the code as `<option value>` and the Chinese label as the visible option text by default:

```html
<option value="ECU">大特写</option>
```

## When to invent a new code

Don't. If a shot doesn't fit, pick the closest existing code. The taxonomy is intentionally coarse — fine-grained distinctions go in the Camera column ("Push-in", "Slow pan", "Handheld dolly", etc.) not the Plan column.

## Camera column conventions

Free-form Chinese by default. Common entries:
- `固定机位`
- `手持`
- `远景 / 固定`
- `缓慢推进`
- `缓慢拉远`
- `轨道左至右` / `轨道右至左`
- `慢摇`
- `升 crane` / `降 crane`
- `顶拍定格`
- `一镜到底，50mm`
- `从内部手持拍摄`
- `—` for transitions like dissolves
