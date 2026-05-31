# QA Report: Source Comparison Readiness

- date: 2026-05-30
- scope: readiness check for comparing `deliverables/10_story/01_script_v5.md` against legally acquired `ほしのこえ` source material
- related files:
  - `deliverables/10_story/01_script_v5.md`
  - `deliverables/10_story/01_audit_report_v5.md`
- result: ready for task-level legal-source intake; blocked for source comparison until source is acquired

---

## Current Readiness

| Requirement | Status | Evidence | Next action |
| --- | --- | --- | --- |
| Generated script baseline | Ready | `01_script_v5.md` is current and estimates 23:25. | Keep v5 until a legal source map or readthrough requires v6. |
| Generated quality gate | Ready | `01_audit_report_v5.md` passes P0/P1/P2 gates and approves current DOCX export. | Re-run only after source-map findings or script change. |
| Generated comparison labels | Ready in script | `01_script_v5.md` defines runtime units S1-S14 in its runtime plan. | Use these generated units in future source function map. |
| Legal source acquisition plan | Ready | Acquisition action plan identifies P0/P1 source targets. | Acquire or inspect one legal source. |
| Task-level source intake note | Pending source | Source comparison is a project task, not a reusable Screenwriter skill mode. | Create a source intake note immediately after source access. |
| Source function map | Pending | No legal source units exist yet. | Create only after intake; label original units `S-001`, `S-002`, etc. |
| Original-quality comparison | Blocked | Legal source material is not present in workspace. | Do not claim original comparison until source is available. |

## Preferred Source Path

1. `DVD BOOK ほしのこえ`, ISBN `9784198615543`, catalog `ALDV-0001`
   - Strongest currently visible purchase route because it contains the book storyboard.
   - Suruga-ya currently shows a full-copy listing with stock count 1.
   - Bunken Shoin currently shows a backup used copy with unopened DVD.
   - Avoid disc-only states because they do not provide the storyboard-book material.
2. Original 2002 DVD `ほしのこえ`, JAN `4560107150030`, catalog `MZDV0001` / `MZDV-1`
   - Fast backup route.
   - Suruga-ya currently shows one used copy and lists `動画コンテ` in bonus contents.
   - CDJournal also lists `MZDV-0001` with `動画コンテ` in bonus contents.
3. `雲のむこう、約束の場所 新海誠絵コンテ集 3`, ISBN `9784041058817`
   - Best clean storyboard-book route.
   - Use if acquired or inspected legally.

## Intake-To-Comparison Procedure

When one source is available:

1. Create a task-level source intake note under `deliverables/00_admin/qa_reports/`.
2. Record access proof, edition identity, and source type.
3. Confirm whether the source is:
   - `storyboard_book`
   - `video_storyboard`
   - `dvd_extra`
   - `published_book`
4. Label source units as `S-001`, `S-002`, etc.
5. Do not paste original dialogue, storyboard captions, or shot wording into deliverables.
6. Create a project-specific source function map under `deliverables/00_admin/qa_reports/` or `deliverables/10_story/`.
7. Map legal source units against the generated S1-S14 runtime units in `01_script_v5.md`.
8. Create a new audit before creating `01_script_v6.md`.

## Source Function Map Decision Rules

| Finding | Required action |
| --- | --- |
| `function_match` across all P0/P1 functions | Keep v5; update audit only. |
| `function_gap` in inciting incident, crisis, climax, resolution, or controlling idea | Create rewrite plan and then `01_script_v6.md`. |
| `function_gap` in motif setup/payoff | Revise the affected generated units only. |
| `copyright_risk` | Revise away from source expression before any DOCX export. |
| Source has stronger runtime density but same function | Cut or combine generated units only if quality gate agrees. |
| Source-only function is outside v5's target runtime or story design | Record as taste/strategy note, not automatic rewrite. |

## Pre-Filled Generated Labels

| Label | Short function | Locked use |
| --- | --- | --- |
| S1 | Ordinary intimacy through blue radio, local weather, and sea tape | Compare to source opening intimacy setup. |
| S2 | Departure/inciting incident and impossible receiver promise | Compare to source separation promise. |
| S3 | Launch aftermath and first failed send | Compare to source first separation consequence. |
| S4 | First delayed message and receiver failure | Compare to source first visible time-delay cost. |
| S5 | Earth-side repair obligation appears | Compare to source Earth life continuing. |
| S6 | Space-side training and rule pressure | Compare to source space-side new-world pressure. |
| S7 | Two-year delay turns message into artifact | Compare to source delay escalation. |
| S8 | Present obligation competes with waiting | Compare to source Earth-side passage of time. |
| S9 | Space-side costly agency with radio object | Compare to source space-side active choice. |
| S10 | Public-signal reversal during typhoon | Compare to source equivalent midpoint/late complication function. |
| S11 | Old message arrives at the wrong emotional time | Compare to source time-delay emotional inversion. |
| S12 | One possible reply and transmitter setup | Compare to source crisis function. |
| S13 | Irreversible beacon/send climax | Compare to source climax communication function. |
| S14 | Failed closure and continued repair | Compare to source ending without literal closure. |

## Current Decision

Do not create `01_script_v6.md` from public metadata alone. The next valid state transition is:

`source acquired` -> `task-level source intake` -> `source unit labels` -> `source function map` -> `audit` -> optional `v6`.
