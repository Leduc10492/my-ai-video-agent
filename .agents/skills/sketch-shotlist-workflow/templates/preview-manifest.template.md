# Artifact: Preview Manifest
- id: `{ARTIFACT_ID}`
- version: `{VERSION}`
- upstream: [`{SCENE_PACKAGE_ARTIFACT_ID}`]
- locks:
  - must_keep: []
  - must_avoid: []
  - budget_notes: []

---

- source_html: `{SHOTLIST_HTML_PATH}`
- source_breakdown: `{SOURCE_BREAKDOWN_PATH}`
- scope: `{SCOPE}`
- prompt_envelope_count: `{PROMPT_ENVELOPE_COUNT}`
- preview_count: `{PREVIEW_COUNT}`
- asset_origin: `{user_provided | generated_from_text | generated_from_references | mixed}`
- reference_binding: `{none | text_only | images_attached}`
- reference_approval: `{draft | reviewed | locked}`
- output_status: `{prompt_only | smoke_test | review_ready | production_approved}`
- image_tool: `{TOOL_OR_PLATFORM_OR_NONE}`
- limitations:
  - `{LIMITATION}`

| Prompt ID | Source rows | Duration | Preview path | Status | Notes |
| --- | --- | ---: | --- | --- | --- |
| `{PROMPT_ID}` | `{ROW_IDS}` | `{SECONDS}s` | `{RELATIVE_PREVIEW_PATH_OR_NONE}` | `{ok | missing | prompt_only | needs_regen}` | `{NOTES}` |
