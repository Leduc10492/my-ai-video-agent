# Artifact: Shotlist Breakdown

- id: `A-20260628-001`
- version: `v1`
- upstream: [`A-20260530-004`, `A-20260530-005`]
- source_script: `deliverables/10_story/01_script_v10.md`
- source_audit: `deliverables/10_story/01_audit_report_v10.md`
- workflow_slot: `shotlist.primary`
- workflow_path: `shotlist-breakdown-workflow -> sketch-shotlist-workflow`
- output_package: `deliverables/30_shotlist/scenes/scenes-078-085_096-098_v1/`
- status: `text_dna_draft`

## Locks

### Must Keep

- Use v10 script scene numbers as the production split language.
- Keep prompt IDs `P377-P428` for continuity with the retained P389 Seedance test.
- Keep reference status as `text_dna_draft`; the images guide tone and blocking, but are not final locked production references.
- Keep `P389` mapped to `scene-081`, checkpoint authority bending, because it is the only retained generated motion test.

### Must Avoid

- Do not use legacy storyboard-style IDs as new package names, section names, or current split units.
- Do not claim image-reference-bound production lock.
- Do not revive older history, older QA reports, or unrelated moodboard outputs in the active test tree.

# 《无名之绳》v10 — Scene-Native Shotlist Breakdown v1

## Scene Inventory

| Scene | Script header | Primary characters | Location / axis | Emotional register | Asset needs |
| --- | --- | --- | --- | --- | --- |
| `scene-078` | `EXT. SCHOOL GYM - NIGHT` | Hana, Teacher, Sora, Asa, children | School gym south door into shelter floor | Unofficial action starts becoming order | `nagi_school_gym`, `hana`, `teacher`, `sora`, `asa`, `children_crowd`, `red_cord_prop` |
| `scene-079` | `INT. SCHOOL GYM - NIGHT` | Hana, Teacher, Sora, Asa, children | Gym mats, north wall, emergency lights | Shelter procedure is improvised in real time | Same gym shelter set |
| `scene-080` | `EXT. NAGI BRIDGE - NIGHT` | Daichi, elders, police officer | Rain bridge, farm cart, checkpoint line | Stalled traffic is forced into moral movement | `nagi_bridge`, `daichi`, `elders_cart`, `police_officer` |
| `scene-081` | `EXT. BRIDGE CHECKPOINT - NIGHT` | Daichi, police officer, elders | East-side red barricade, uphill escape direction | Authority hesitates, then bends | Same bridge checkpoint set |
| `scene-082` | `EXT. NAGI STREET - NIGHT` | Yuna, old vendor, crowd | Festival street, wet slope, stall corridor | Theft becomes evacuation choreography | `nagi_festival_street`, `yuna_teen`, `old_vendor`, `children_crowd` |
| `scene-083` | `INT. TOWN HALL - NIGHT` | Yuna, Mayor, aides | Mayor office, desk, phones, monitoring screens | Illegitimate warning becomes official order | `town_hall_office`, `mayor`, `town_hall_aides`, `yuna_teen` |
| `scene-084` | `EXT. NAGI - NIGHT` | Townspeople, responders, Yuna/Hana/Sora axis | Town-to-hill evacuation route | Private panic becomes public movement | `nagi_festival_street`, `nagi_bridge`, `children_crowd` |
| `scene-085` | `EXT. SCHOOL HILL - NIGHT` | Evacuees, Yuna/Hana/Sora axis | Hill safe zone looking down at town | Survival meets impact and whiteout | `school_hill_impact`, `children_crowd`, `red_cord_prop` |
| `scene-096` | `INT. SUBWAY - MORNING` | Adult Ren | Subway car and platform flow | Recognition begins without certainty | `tokyo_subway_streets`, `adult_ren`, `adult_yuna`, `red_cord_prop` |
| `scene-097` | `EXT. TOKYO STREETS - CONTINUOUS` | Adult Ren, Adult Yuna | Rain city crosswalk and bus occlusion | Pursuit narrows into near contact | Same Tokyo street set |
| `scene-098` | `EXT. SHRINE STAIRS - LATE AFTERNOON` | Adult Ren, Adult Yuna | Rain-wet shrine stair central axis | Memory surfaces through breath, gesture, and red cord | `shrine_stairs`, `adult_ren`, `adult_yuna`, `red_cord_prop` |

## Action Beat Map

| Scene group | Prompt range | Beat | Visual job | Notes |
| --- | --- | --- | --- | --- |
| `scene-078-079` | `P377-P382` | School gym shelter opens and stabilizes | Turn a chaotic arrival into readable evacuation order | Covers exterior entry plus interior shelter procedure. |
| `scene-080` | `P383-P387` | Farm cart and elders reach the bridge bottleneck | Establish rain, blocked cars, elders, and Daichi's pressure | Keep cart and elders visible; do not turn this into empty traffic texture. |
| `scene-081` | `P388-P393` | Daichi makes the officer understand the uphill route | Show authority bending without heroic overacting | `P389` is the retained generated test and must remain tied to this group. |
| `scene-082` | `P394-P398` | Yuna steals the cashbox to pull the street uphill | Convert a morally wrong action into spatial evacuation logic | Keep vendor and crowd geography clear. |
| `scene-083` | `P399-P404` | Yuna forces the town hall order | Move from denied warning to official instruction | Mayor must feel pressured, not instantly convinced. |
| `scene-084` | `P405-P409` | Nagi finally moves uphill | Connect bridge, street, and town-wide evacuation into one axis | Avoid montage that loses route continuity. |
| `scene-085` | `P410-P414` | Hill impact and whiteout | Make safety, distance, and loss readable in one geography | Use practical light logic until the final impact bloom. |
| `scene-096-097` | `P415-P419` | Adult Ren senses and follows Adult Yuna | Use subway and rain street occlusions to delay recognition | Do not reveal certainty too early. |
| `scene-098-pass` | `P420-P424` | Shrine stair pass-by turns into a stop | Let bodies recognize before words do | Maintain stair axis and red cord detail. |
| `scene-098-recognition` | `P425-P428` | Red cords align and the last question lands | Close on gesture, breath, and restrained eye contact | No added embrace, kiss, or full-name reveal. |

## Asset Request

### Characters

- `yuna_teen`: disaster-day Yuna, white shirt, dark blue skirt, light sweater at waist, red cord in hand.
- `adult_yuna`: adult Yuna, dark coat, map/file bag, red cord on bag strap.
- `adult_ren`: adult Ren, dark work/planning jacket, red cord at wrist.
- `hana`, `sora`, `asa`, `teacher`, `daichi`, `police_officer`, `old_vendor`, `mayor`, `town_hall_aides`, `children_crowd`: supporting continuity references for blocking tests.

### Locations And Props

- `nagi_school_gym`, `nagi_bridge`, `nagi_festival_street`, `town_hall_office`, `school_hill_impact`, `tokyo_subway_streets`, `shrine_stairs`.
- `elders_cart` and `red_cord_prop` are continuity-critical props.
- All current references live under `deliverables/20_assets/generated_ref_v1/` and remain `text_dna_draft`.

## Phase 3 Blocking Queue

| Queue | Scenes | Blocking question |
| --- | --- | --- |
| Gym shelter | `scene-078-079` | Can the south-door arrival, mat layout, north-wall shelter order, and red-cord anchor stay coherent? |
| Bridge checkpoint | `scene-080-081` | Can Daichi, cart elders, officer, red barricade, and uphill direction stay legible in rain? |
| Festival street | `scene-082` | Can the cashbox theft pull crowd attention uphill without becoming random chase action? |
| Town hall | `scene-083` | Can the mayor office staging show pressure, refusal, and order without readable screen text? |
| Evacuation axis | `scene-084-085` | Can bridge, street, gym, and hill resolve into one town-scale movement before impact? |
| Tokyo pursuit | `scene-096-097` | Can subway and street occlusions keep the recognition delayed but motivated? |
| Shrine stairs | `scene-098` | Can stair axis, two adult identities, and red cord correspondence stay clean through the final question? |

## Phase 4 Scope Recommendation

- Build package: `scenes-078-085_096-098_v1`.
- HTML: `deliverables/30_shotlist/scenes/scenes-078-085_096-098_v1/Shotlist_scenes-078-085_096-098_ZH_v1.html`.
- Prompt envelope count: `52`.
- Prompt IDs: `P377-P428`.
- Preview status: `prompt_only`.
- Generated test retained: `P389`, 15 seconds, 21:9, 720p.
