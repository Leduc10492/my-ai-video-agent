# QA Report: Script DOCX Export

- date: 2026-05-30
- scope: `deliverables/10_story/01_script_v5_standard_screenplay.docx`
- source: `deliverables/10_story/01_script_v5.md`
- result: pass with render limitation

---

## Summary

The approved v5 script was exported as a derived standard screenplay-format DOCX. The Markdown script remains the source of truth; the DOCX is an export artifact for reading/submission. The earlier v4 DOCX was archived after v5 replaced the too-short 8-9 minute target with a corrected 22-24 minute short-animation target.

## Structural Checks

| Check | Result | Notes |
| --- | --- | --- |
| Source artifact exists | Pass | `01_script_v5.md` exists and is the current latest script |
| Audit approval exists | Pass | `01_audit_report_v5.md` approves DOCX export through the corrected 22-24 minute iteration quality gate |
| DOCX exists | Pass | `01_script_v5_standard_screenplay.docx` created |
| Standard page geometry | Pass | US Letter, 1.5 in left margin, 1 in right/top/bottom margins |
| Screenplay markers | Pass | `FADE IN:`, scene headings, dialogue blocks, `FADE OUT.` present |
| Copyright distance locks | Pass | Original names/ship/enemy terms are absent from the DOCX text |

## Visual / Render Checks

| Check | Result | Notes |
| --- | --- | --- |
| LibreOffice PNG render | Not run | `render_docx.py` failed because `soffice` is not installed in this environment |
| Quick Look preview | Pass | macOS Quick Look generated a clean first-page thumbnail after the spacing revision |
| Text extraction | Pass | `textutil` extracted the script text in the expected order |
| DOCX OOXML sanity | Pass | Required DOCX parts and key screenplay markers are present |

## Residual Risk

| Priority | Risk | Recommendation |
| --- | --- | --- |
| P2 | Full multi-page visual QA could not be completed without LibreOffice. | If exact pagination matters, install LibreOffice and rerun `render_docx.py` before external submission. |
| P3 | Chinese screenplay formatting uses standard screenplay indentation but Chinese glyph fallback is renderer-dependent. | Check once in Word/Pages before final production handoff if typography is mission-critical. |
