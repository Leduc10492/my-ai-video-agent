# QA Report: Hoshi no Koe Acquisition Action Plan

- date: 2026-05-30
- scope: actionable legal-source acquisition plan for `Voices of a Distant Star` / `ほしのこえ`
- related script: `deliverables/10_story/01_script_v5.md`
- result: actionable acquisition targets identified; detailed source comparison still pending source access

---

## Purpose

The project goal requires comparing the generated Screenwriter workflow script against original `ほしのこえ` source material. A verified legal downloadable screenplay has not been found. The next valid progress step is to acquire or inspect official storyboard/DVD materials that can function as a production-source proxy.

Do not use bootleg transcripts, subtitle scrapes, or unofficial full-text pages.

## Acquisition Targets

| Priority | Target | Why it matters | Current evidence | Action |
| --- | --- | --- | --- | --- |
| P0 | `DVD BOOK ほしのこえ`, ISBN `9784198615543` / `4198615543`, catalog `ALDV-0001` | Closest original package: book plus DVD, unpublished storyboard material, 79 pages. | Rakuten Books and CiNii confirm bibliographic data and complete unpublished storyboard description. Suruga-ya currently shows a used full-copy listing with stock, and Bunken Shoin shows a used copy with unopened DVD. | Buy/inspect a complete book-plus-DVD copy first; avoid disc-only listings because the book storyboard is the comparison target. |
| P0 | Original 2002 DVD `ほしのこえ`, JAN `4560107150030`, catalog `MZDV0001` / `MZDV-1` | The original DVD edition is a practical route to `動画コンテ`; avoid the service-price edition. | Bookoff shows a used DVD listing with stock, JAN `4560107150030`, catalog `MZDV0001`, and 2002-04-19 release data. Suruga-ya currently shows one used copy and lists `動画コンテ` in bonus video contents. | Buy/inspect the original DVD edition if the DVD BOOK route fails; verify package/disc menus include `動画コンテ` before intake. |
| P0 | `雲のむこう、約束の場所 新海誠絵コンテ集 3`, ISBN `9784041058817` | Official KADOKAWA storyboard book; CoMix Wave says the end matter fully includes `ほしのこえ` storyboards. This is the cleanest later storyboard-book route. | KADOKAWA product page confirms ISBN, 424 pages, 2017-12-20 publication, and `ほしのこえ` storyboard/interview inclusion. CoMix Wave news states the `ほしのこえ` storyboard is completely included. | Search/order by ISBN `9784041058817`; check KADOKAWA, Animate, Tower, Bookoff, Amazon Japan, Mercari/Yahoo Auctions, and local import routes. |
| P2 | Published novelizations / manga adaptations | Legal adjacent references, but not screenplay or storyboard equivalent. | Existing source report identifies these as context-only. | Use only for reception/context, not for screenplay function comparison. |

## Current Availability Snapshot

Checked on 2026-05-30.

| Route | Current availability | Interpretation |
| --- | --- | --- |
| Suruga-ya DVD BOOK `128009519` | Used full-copy listing visible, stock count 1, catalog `ALDV-0001`; page also offers cheaper disc-only states. | Strongest practical route because the book contains the storyboard. Choose full copy, not disc-only. |
| Bunken Shoin DVD BOOK `7029` | Used copy visible, DVD unopened, listed at 5,000 yen. | Backup route if Suruga-ya stock disappears. Verify book condition before ordering. |
| Suruga-ya original DVD `128005505` | Used copy visible, stock count 1, bonus contents list includes `動画コンテ`. | Fast practical backup route for source access. Verify disc/package after receipt. |
| Bookoff original DVD `0001269351` | Used copy visible, stock low, JAN `4560107150030`, catalog `MZDV0001`. | Practical backup DVD route; extras are less explicit on the page than Suruga-ya. |
| CDJournal original DVD record | Lists `MZDV-0001` and the bonus contents including `動画コンテ`. | Strong bibliographic confirmation for the original DVD's source value. |
| Tower Records storyboard book `5773437` | Product page says it cannot currently be ordered. | Useful bibliographic confirmation, not current purchase route. |
| Animate storyboard book `1499217` | Search result shows no stock. | Monitor only; not current route. |
| CoMix Wave / KADOKAWA storyboard book pages | Officially confirm contents and product identity. | Source legitimacy evidence; purchase may need secondary market. |

## Verification Before Use

Before any acquired source is used for comparison:

1. Create a task-level source intake note under `deliverables/00_admin/qa_reports/`.
2. Record proof of lawful access: order receipt, library access note, owned disc/book, or user-provided licensed scan.
3. Confirm edition identity: ISBN, JAN, catalog number, publisher, page count, disc menu, or library record.
4. Mark source type:
   - `storyboard_book`
   - `video_storyboard`
   - `dvd_extra`
   - `published_book`
5. Build a source unit index without copying original dialogue, exact captions, or exact shot text into deliverables.

## Comparison Work Once Source Is Available

Use a task-level comparison pass after the Screenwriter output is ready:

1. Create source unit labels: `S-001`, `S-002`, etc.
2. Create generated script labels: `G-001`, `G-002`, etc.
3. Build a project-specific source function map under `deliverables/00_admin/qa_reports/` or `deliverables/10_story/`.
4. Compare:
   - scene/storyboard function
   - value movement
   - protagonist action
   - opposing force
   - motif/object role
   - escalation role
   - runtime density
   - ending function
5. Mark rows as `function_match`, `function_gap`, `source_only`, `generated_only`, or `copyright_risk`.
6. Save a new audit before creating `01_script_v6.md`.

## Current Script Decision

`01_script_v5.md` stays current. It has passed the corrected 22-24 minute iteration quality gate and current DOCX export. Do not create `v6` unless:

- a legal source function map reveals a function-level gap;
- a legal source comparison reveals copyright-distance risk;
- a new quality gate finds a P0-P2 issue in the generated script.

## Source URLs

- CoMix Wave storyboard-book news: `https://www.cwfilms.jp/news/article/20171219-150055.html`
- KADOKAWA storyboard book: `https://www.kadokawa.co.jp/product/321703000824/`
- Tower Records storyboard book: `https://tower.jp/item/5773437`
- Animate storyboard book: `https://www.animate-onlineshop.jp/pn/%E3%80%90%E3%81%9D%E3%81%AE%E4%BB%96%28%E6%9B%B8%E7%B1%8D%29%E3%80%91%E9%9B%B2%E3%81%AE%E3%82%80%E3%81%93%E3%81%86%E3%80%81%E7%B4%84%E6%9D%9F%E3%81%AE%E5%A0%B4%E6%89%80%2B%E6%96%B0%E6%B5%B7%E8%AA%A0%E7%B5%B5%E3%82%B3%E3%83%B3%E3%83%86%E9%9B%86%2B3/pd/1499217/`
- Bookoff original DVD listing: `https://shopping.bookoff.co.jp/used/0001269351`
- Suruga-ya original DVD listing: `https://www.suruga-ya.com/ja/product/128005505`
- CDJournal original DVD listing: `https://artist.cdjournal.com/d/the-voices-of-a-distant-star/4205060026`
- Rakuten Books DVD BOOK record: `https://books.rakuten.co.jp/rb/1486089/`
- CiNii DVD BOOK record: `https://ci.nii.ac.jp/ncid/BA64242579?l=en`
- Suruga-ya DVD BOOK listing: `https://www.suruga-ya.jp/product/detail/128009519`
- Bunken Shoin DVD BOOK listing: `https://bunken-shoin.co.jp/im/show/im/7029.html`
- Maruzen DVD BOOK record: `https://www.maruzenjunkudo.co.jp/products/9784198615543`

## Residual Blocker

The project still lacks a legally acquired original source artifact. Until one of the P0/P1 targets is obtained or inspected, full original source comparison cannot be completed.
