# QA Report: Your Name v10 Comparison And DOCX Export

- date: 2026-05-30
- current script: `deliverables/10_story/01_script_v10.md`
- current audit: `deliverables/10_story/01_audit_report_v10.md`
- exported docx: `deliverables/10_story/01_script_v10_standard_screenplay.docx`
- comparison PDF: `deliverables/10_story/Your-Name-Screenplay.pdf`
- result: v10 passes the current structural comparison gate and has been exported as the standard screenplay-format candidate

---

## Evidence Checked

| Evidence | Result |
| --- | --- |
| Uploaded PDF page count | 132 pages |
| Uploaded PDF extracted text | about 5,061 lines |
| Uploaded PDF slugline/transition candidates | about 164 |
| v9 screenplay body lines | about 1,571 lines |
| v9 slugline/transition candidates | about 65 |
| v10 screenplay body lines | about 2,150 lines |
| v10 slugline/transition candidates | about 102 |
| v10 dialogue cue candidates | about 199 |
| v10 target runtime | 107 minutes |

## Gate Result

Pass for standard screenplay DOCX export.

v10 does not claim textual equivalence to the uploaded PDF. It passes because the prior blocker was structural compression, and that blocker has been addressed: the screenplay now has enough separate scene units for a feature-length animation workflow, with the body-swap middle, investigation, rescue logistics, and adult aftermath split into executable dramatic beats.

## Comparison Judgment

| Area | Judgment |
| --- | --- |
| Macro structure | Pass: full spine from longing through exchange, loss, search, rescue, erasure, and recognition. |
| Runtime | Pass: 107-minute target maintained after expansion. |
| Scene density | Pass with note: v10 reaches the working target of 95-110 scene/transition units; raw PDF line count remains higher. |
| Causality | Pass: clues motivate search, shrine crossing motivates return, return motivates evacuation action. |
| Character agency | Pass: both Ren and Yuna make costly choices; side characters produce pressure or solutions. |
| Copyright distance | Pass: no copied names, dialogue, exact wording, song cues, or protected expression from the PDF. |
| Production feasibility | Pass: recurring locations and clear action blocks support storyboard and animation planning. |

## DOCX QA

| Check | Result |
| --- | --- |
| DOCX created | Pass: `deliverables/10_story/01_script_v10_standard_screenplay.docx` exists. |
| DOCX package structure | Pass: contains `word/document.xml`, styles, header, and expected Word parts. |
| Paragraph count | Pass: 2,149 paragraph nodes in the exported Word document. |
| First-page visual check | Pass: Quick Look thumbnail shows readable Courier screenplay formatting, bold scene headings, and no obvious overlap. |
| Full LibreOffice render | Not completed: local renderer could not find `soffice` on this machine. |
| Export bug avoided | Pass: a stricter task-level export regenerated the DOCX after the reusable exporter misclassified short action lines as character cues. The reusable skill files were not modified. |

## Remaining Notes

1. The DOCX is the current standard-format candidate, not proof that the uploaded PDF is official.
2. Further improvement should be dialogue and silence polish inside existing scenes, not more plot expansion.
3. Downstream guides/storyboards should use `01_script_v10.md` as the Markdown source of truth and the DOCX only as the formatted reading/export copy.
