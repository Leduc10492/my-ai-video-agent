# Shotlist Preview Manifest

- source_html: `{SHOTLIST_HTML_PATH}`
- source_script_or_storyboard: `{SOURCE_ARTIFACT_PATH}`
- scope: `{SCOPE}`
- version: `v{N}`
- prompt_envelope_count: `{PROMPT_ENVELOPE_COUNT}`
- preview_count: `{PREVIEW_COUNT}`
- reference_mode: `{text_only_draft | text_dna_draft | image_reference_bound | prompt_only}`
- image_tool: `{TOOL_OR_PLATFORM}`
- limitations:
  - `{LIMITATION}`

| Prompt ID | Source shots | Duration | Preview path | Reference mode | Status | Notes |
| --- | --- | ---: | --- | --- | --- | --- |
| `{PROMPT_ID}` | `{SHOT_IDS}` | `{SECONDS}s` | `{RELATIVE_PREVIEW_PATH}` | `{REFERENCE_MODE}` | `{ok | missing | prompt_only | needs_regen}` | `{NOTES}` |
