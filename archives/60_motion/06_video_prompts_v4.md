# Artifact: Video Prompts (Image-to-Video Keyframe Bound)
- id: A-20260202-001
- version: v4
- upstream: [A-20260122-004, A-20260121-003, A-20260502-001, A-20260126-001]
- locks:
  - must_keep:
    - ?????????? `generated_ref_v1` ???? reference-bound keyframe
    - input type ??? image-to-video
    - ?? source image ?????????????????
    - ???????????????????????
  - must_avoid:
    - ?? `text_only_draft` keyframes ?????
    - ???????????????????
    - ??????????????????
    - ???????????????logo?watermark?vertical text
  - budget_notes:
    - Platform default: Runway Gen-3 image-to-video
    - Compatible notes: Pika image-to-video / SVD subtle animation
    - Source keyframes: `deliverables/50_art/generated_ref_v1/`
    - Scope: Full film, Shot 001-049
    - Aspect ratio: 16:9

---

# BIPOLAR MV Video Prompts v4

## ????

???? text-to-video ?? image-to-video??????? `source_keyframe` ?????motion prompt ??????????????

???????preserve the source image character identity, face, hairstyle, costume, composition, lighting, and color temperature. Add only subtle cinematic motion, micro-expression, environmental movement, and motivated camera movement.

???????avoid changed identity, changed hairstyle, changed costume, redesigned face, extra main characters, villain-like Nozomi, melodramatic crying, unstable random camera movement, warped hands, random text, logo, watermark, vertical text.

---

### Shot 001

**source_keyframe**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_001_ref_v1.png`  
**input_type**: image-to-video  
**duration**: 4s  
**camera**: static low-angle wide  
**identity_preservation**: Preserve full source image composition, lighting, prop design, and environment.  
**motion_scope**: snow drifts outside airport glass; camera motion should remain static low-angle wide; purpose is establish cold present.

**Motion Prompt**:
```text
Use the source keyframe as the locked visual reference. Cold Kansai airport ceiling and glass wall, fine snow outside, quiet empty distance, minimal movement.
Motion: snow drifts outside airport glass. Camera: static low-angle wide. Duration: 4s. Preserve the source image identity, face, hairstyle, costume, composition, lighting, and color temperature. Add only subtle micro-expression, hair or fabric movement, environmental motion, and motivated camera drift that fits the keyframe.
```

**Negative / Avoid**:
```text
changed identity, changed face, changed hairstyle, changed costume, redesigned background, extra main characters, exaggerated acting, melodramatic crying, unstable random camera movement, warped hands, random text, logo, watermark, vertical text
```

---

### Shot 002

**source_keyframe**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_002_ref_v1.png`  
**input_type**: image-to-video  
**duration**: 3s  
**camera**: slow tracking  
**identity_preservation**: Preserve source image identity for Nozomi; do not alter face, hair silhouette, costume logic, body proportion, or core expression.  
**motion_scope**: adult Nozomi walks alone on moving walkway; camera motion should remain slow tracking; purpose is isolate Nozomi.

**Motion Prompt**:
```text
Use the source keyframe as the locked visual reference. Adult Nozomi in dark coat and gray scarf walks forward through blurred crowd, detached and calm.
Motion: adult Nozomi walks alone on moving walkway. Camera: slow tracking. Duration: 3s. Preserve the source image identity, face, hairstyle, costume, composition, lighting, and color temperature. Add only subtle micro-expression, hair or fabric movement, environmental motion, and motivated camera drift that fits the keyframe.
```

**Negative / Avoid**:
```text
changed identity, changed face, changed hairstyle, changed costume, redesigned background, extra main characters, exaggerated acting, melodramatic crying, unstable random camera movement, warped hands, random text, logo, watermark, vertical text
```

---

### Shot 003

**source_keyframe**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_003_ref_v1.png`  
**input_type**: image-to-video  
**duration**: 2s  
**camera**: static close-up  
**identity_preservation**: Preserve source image identity for Nozomi; do not alter face, hair silhouette, costume logic, body proportion, or core expression.  
**motion_scope**: tiny hair and headphone movement; camera motion should remain static close-up; purpose is sound isolation.

**Motion Prompt**:
```text
Use the source keyframe as the locked visual reference. Close-up of white headphones over Nozomi's ear, outside sound visually sealed away.
Motion: tiny hair and headphone movement. Camera: static close-up. Duration: 2s. Preserve the source image identity, face, hairstyle, costume, composition, lighting, and color temperature. Add only subtle micro-expression, hair or fabric movement, environmental motion, and motivated camera drift that fits the keyframe.
```

**Negative / Avoid**:
```text
changed identity, changed face, changed hairstyle, changed costume, redesigned background, extra main characters, exaggerated acting, melodramatic crying, unstable random camera movement, warped hands, random text, logo, watermark, vertical text
```

---

### Shot 004

**source_keyframe**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_004_ref_v1.png`  
**input_type**: image-to-video  
**duration**: 2s  
**camera**: static insert  
**identity_preservation**: Preserve source image identity for Nozomi; do not alter face, hair silhouette, costume logic, body proportion, or core expression.  
**motion_scope**: handbag chain sways slightly; camera motion should remain static insert; purpose is adult-world symbol.

**Motion Prompt**:
```text
Use the source keyframe as the locked visual reference. Black quilted chain bag on dark coat, cold metallic highlights, subtle walking sway.
Motion: handbag chain sways slightly. Camera: static insert. Duration: 2s. Preserve the source image identity, face, hairstyle, costume, composition, lighting, and color temperature. Add only subtle micro-expression, hair or fabric movement, environmental motion, and motivated camera drift that fits the keyframe.
```

**Negative / Avoid**:
```text
changed identity, changed face, changed hairstyle, changed costume, redesigned background, extra main characters, exaggerated acting, melodramatic crying, unstable random camera movement, warped hands, random text, logo, watermark, vertical text
```

---

### Shot 005

**source_keyframe**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_005_ref_v1.png`  
**input_type**: image-to-video  
**duration**: 5s  
**camera**: static close-up, slow-motion feel  
**identity_preservation**: Preserve source image identity for Nozomi; do not alter face, hair silhouette, costume logic, body proportion, or core expression.  
**motion_scope**: Nozomi turns back once; camera motion should remain static close-up, slow-motion feel; purpose is farewell beat.

**Motion Prompt**:
```text
Use the source keyframe as the locked visual reference. Nozomi turns her head toward camera, transparent composed farewell, no tears, restrained.
Motion: Nozomi turns back once. Camera: static close-up, slow-motion feel. Duration: 5s. Preserve the source image identity, face, hairstyle, costume, composition, lighting, and color temperature. Add only subtle micro-expression, hair or fabric movement, environmental motion, and motivated camera drift that fits the keyframe.
```

**Negative / Avoid**:
```text
changed identity, changed face, changed hairstyle, changed costume, redesigned background, extra main characters, exaggerated acting, melodramatic crying, unstable random camera movement, warped hands, random text, logo, watermark, vertical text
```

---

### Shot 006

**source_keyframe**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_006_ref_v1.png`  
**input_type**: image-to-video  
**duration**: 3s  
**camera**: static medium  
**identity_preservation**: Preserve source image identity for Nozomi; do not alter face, hair silhouette, costume logic, body proportion, or core expression.  
**motion_scope**: snow streaks outside plane window; camera motion should remain static medium; purpose is enclosed departure.

**Motion Prompt**:
```text
Use the source keyframe as the locked visual reference. Nozomi sits by airplane window, wing outside, snow lines across glass, quiet cabin pressure.
Motion: snow streaks outside plane window. Camera: static medium. Duration: 3s. Preserve the source image identity, face, hairstyle, costume, composition, lighting, and color temperature. Add only subtle micro-expression, hair or fabric movement, environmental motion, and motivated camera drift that fits the keyframe.
```

**Negative / Avoid**:
```text
changed identity, changed face, changed hairstyle, changed costume, redesigned background, extra main characters, exaggerated acting, melodramatic crying, unstable random camera movement, warped hands, random text, logo, watermark, vertical text
```

---

### Shot 007

**source_keyframe**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_007_ref_v1.png`  
**input_type**: image-to-video  
**duration**: 3s  
**camera**: top-down macro  
**identity_preservation**: Preserve source image identity for Nozomi; do not alter face, hair silhouette, costume logic, body proportion, or core expression.  
**motion_scope**: phone screen glow and thumb movement; camera motion should remain top-down macro; purpose is music trigger.

**Motion Prompt**:
```text
Use the source keyframe as the locked visual reference. Smartphone music player interface glows in dim cabin, simple playback UI, song begins the transition.
Motion: phone screen glow and thumb movement. Camera: top-down macro. Duration: 3s. Preserve the source image identity, face, hairstyle, costume, composition, lighting, and color temperature. Add only subtle micro-expression, hair or fabric movement, environmental motion, and motivated camera drift that fits the keyframe.
```

**Negative / Avoid**:
```text
changed identity, changed face, changed hairstyle, changed costume, redesigned background, extra main characters, exaggerated acting, melodramatic crying, unstable random camera movement, warped hands, random text, logo, watermark, vertical text
```

---

### Shot 008

**source_keyframe**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_008_ref_v1.png`  
**input_type**: image-to-video  
**duration**: 3s  
**camera**: static extreme close-up  
**identity_preservation**: Preserve full source image composition, lighting, prop design, and environment.  
**motion_scope**: cassette spools rotate; camera motion should remain static extreme close-up; purpose is time-shift symbol.

**Motion Prompt**:
```text
Use the source keyframe as the locked visual reference. Vintage silver Walkman, cassette wheels rotating, mechanical time bridge.
Motion: cassette spools rotate. Camera: static extreme close-up. Duration: 3s. Preserve the source image identity, face, hairstyle, costume, composition, lighting, and color temperature. Add only subtle micro-expression, hair or fabric movement, environmental motion, and motivated camera drift that fits the keyframe.
```

**Negative / Avoid**:
```text
changed identity, changed face, changed hairstyle, changed costume, redesigned background, extra main characters, exaggerated acting, melodramatic crying, unstable random camera movement, warped hands, random text, logo, watermark, vertical text
```

---

### Shot 009

**source_keyframe**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_009_ref_v1.png`  
**input_type**: image-to-video  
**duration**: 5s  
**camera**: slow dolly out  
**identity_preservation**: Preserve source image identity for Mizore; do not alter face, hair silhouette, costume logic, body proportion, or core expression.  
**motion_scope**: Mizore sleeps still by window; camera motion should remain slow dolly out; purpose is reveal inner world.

**Motion Prompt**:
```text
Use the source keyframe as the locked visual reference. Mizore asleep at classroom window, snow outside, cold light isolates her like a specimen.
Motion: Mizore sleeps still by window. Camera: slow dolly out. Duration: 5s. Preserve the source image identity, face, hairstyle, costume, composition, lighting, and color temperature. Add only subtle micro-expression, hair or fabric movement, environmental motion, and motivated camera drift that fits the keyframe.
```

**Negative / Avoid**:
```text
changed identity, changed face, changed hairstyle, changed costume, redesigned background, extra main characters, exaggerated acting, melodramatic crying, unstable random camera movement, warped hands, random text, logo, watermark, vertical text
```

---

### Shot 010

**source_keyframe**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_010_ref_v1.png`  
**input_type**: image-to-video  
**duration**: 4s  
**camera**: static medium  
**identity_preservation**: Preserve full source image composition, lighting, prop design, and environment.  
**motion_scope**: teacher speaks, students react subtly; camera motion should remain static medium; purpose is deliver information.

**Motion Prompt**:
```text
Use the source keyframe as the locked visual reference. Classroom announcement, teacher at podium, students whisper, warm light starts fading cold.
Motion: teacher speaks, students react subtly. Camera: static medium. Duration: 4s. Preserve the source image identity, face, hairstyle, costume, composition, lighting, and color temperature. Add only subtle micro-expression, hair or fabric movement, environmental motion, and motivated camera drift that fits the keyframe.
```

**Negative / Avoid**:
```text
changed identity, changed face, changed hairstyle, changed costume, redesigned background, extra main characters, exaggerated acting, melodramatic crying, unstable random camera movement, warped hands, random text, logo, watermark, vertical text
```

---

### Shot 011

**source_keyframe**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_011_ref_v1.png`  
**input_type**: image-to-video  
**duration**: 3s  
**camera**: static close-up  
**identity_preservation**: Preserve source image identity for Mizore; do not alter face, hair silhouette, costume logic, body proportion, or core expression.  
**motion_scope**: Mizore grips pencil, eyes freeze; camera motion should remain static close-up; purpose is impact.

**Motion Prompt**:
```text
Use the source keyframe as the locked visual reference. Mizore's restrained shock, fingers tighten on pencil, no outward collapse.
Motion: Mizore grips pencil, eyes freeze. Camera: static close-up. Duration: 3s. Preserve the source image identity, face, hairstyle, costume, composition, lighting, and color temperature. Add only subtle micro-expression, hair or fabric movement, environmental motion, and motivated camera drift that fits the keyframe.
```

**Negative / Avoid**:
```text
changed identity, changed face, changed hairstyle, changed costume, redesigned background, extra main characters, exaggerated acting, melodramatic crying, unstable random camera movement, warped hands, random text, logo, watermark, vertical text
```

---

### Shot 012

**source_keyframe**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_012_ref_v1.png`  
**input_type**: image-to-video  
**duration**: 2s  
**camera**: Mizore POV  
**identity_preservation**: Preserve source image identity for Nozomi school; do not alter face, hair silhouette, costume logic, body proportion, or core expression.  
**motion_scope**: Nozomi absent or packing, not looking back; camera motion should remain Mizore POV; purpose is missed connection.

**Motion Prompt**:
```text
Use the source keyframe as the locked visual reference. Mizore looks toward Nozomi's place; attention does not return to her.
Motion: Nozomi absent or packing, not looking back. Camera: Mizore POV. Duration: 2s. Preserve the source image identity, face, hairstyle, costume, composition, lighting, and color temperature. Add only subtle micro-expression, hair or fabric movement, environmental motion, and motivated camera drift that fits the keyframe.
```

**Negative / Avoid**:
```text
changed identity, changed face, changed hairstyle, changed costume, redesigned background, extra main characters, exaggerated acting, melodramatic crying, unstable random camera movement, warped hands, random text, logo, watermark, vertical text
```

---

### Shot 013

**source_keyframe**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_013_ref_v1.png`  
**input_type**: image-to-video  
**duration**: 4s  
**camera**: top-down phone macro  
**identity_preservation**: Preserve source image identity for Mizore; do not alter face, hair silhouette, costume logic, body proportion, or core expression.  
**motion_scope**: typed message deleted; camera motion should remain top-down phone macro; purpose is swallowed question.

**Motion Prompt**:
```text
Use the source keyframe as the locked visual reference. Mizore deletes the message before sending, hesitation visible in finger pause.
Motion: typed message deleted. Camera: top-down phone macro. Duration: 4s. Preserve the source image identity, face, hairstyle, costume, composition, lighting, and color temperature. Add only subtle micro-expression, hair or fabric movement, environmental motion, and motivated camera drift that fits the keyframe.
```

**Negative / Avoid**:
```text
changed identity, changed face, changed hairstyle, changed costume, redesigned background, extra main characters, exaggerated acting, melodramatic crying, unstable random camera movement, warped hands, random text, logo, watermark, vertical text
```

---

### Shot 014

**source_keyframe**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_014_ref_v1.png`  
**input_type**: image-to-video  
**duration**: 3s  
**camera**: static insert  
**identity_preservation**: Preserve source image identity for Mizore; do not alter face, hair silhouette, costume logic, body proportion, or core expression.  
**motion_scope**: survey form pulled from bag; camera motion should remain static insert; purpose is future avoided.

**Motion Prompt**:
```text
Use the source keyframe as the locked visual reference. Blank survey form with creases, paper edge held tightly.
Motion: survey form pulled from bag. Camera: static insert. Duration: 3s. Preserve the source image identity, face, hairstyle, costume, composition, lighting, and color temperature. Add only subtle micro-expression, hair or fabric movement, environmental motion, and motivated camera drift that fits the keyframe.
```

**Negative / Avoid**:
```text
changed identity, changed face, changed hairstyle, changed costume, redesigned background, extra main characters, exaggerated acting, melodramatic crying, unstable random camera movement, warped hands, random text, logo, watermark, vertical text
```

---

### Shot 015

**source_keyframe**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_015_ref_v1.png`  
**input_type**: image-to-video  
**duration**: 2s  
**camera**: static medium  
**identity_preservation**: Preserve source image identity for Mizore; do not alter face, hair silhouette, costume logic, body proportion, or core expression.  
**motion_scope**: form pushed deep into bag; camera motion should remain static medium; purpose is avoidance.

**Motion Prompt**:
```text
Use the source keyframe as the locked visual reference. Mizore hides folded survey form, shoulders slightly inward.
Motion: form pushed deep into bag. Camera: static medium. Duration: 2s. Preserve the source image identity, face, hairstyle, costume, composition, lighting, and color temperature. Add only subtle micro-expression, hair or fabric movement, environmental motion, and motivated camera drift that fits the keyframe.
```

**Negative / Avoid**:
```text
changed identity, changed face, changed hairstyle, changed costume, redesigned background, extra main characters, exaggerated acting, melodramatic crying, unstable random camera movement, warped hands, random text, logo, watermark, vertical text
```

---

### Shot 016

**source_keyframe**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_016_ref_v1.png`  
**input_type**: image-to-video  
**duration**: 4s  
**camera**: tracking wide  
**identity_preservation**: Preserve source image identity for Mizore, Nozomi school; do not alter face, hair silhouette, costume logic, body proportion, or core expression.  
**motion_scope**: Mizore tries to approach; crowd interrupts; camera motion should remain tracking wide; purpose is blocked dialogue.

**Motion Prompt**:
```text
Use the source keyframe as the locked visual reference. Hallway flow separates Mizore from busy Nozomi, people pass between them.
Motion: Mizore tries to approach; crowd interrupts. Camera: tracking wide. Duration: 4s. Preserve the source image identity, face, hairstyle, costume, composition, lighting, and color temperature. Add only subtle micro-expression, hair or fabric movement, environmental motion, and motivated camera drift that fits the keyframe.
```

**Negative / Avoid**:
```text
changed identity, changed face, changed hairstyle, changed costume, redesigned background, extra main characters, exaggerated acting, melodramatic crying, unstable random camera movement, warped hands, random text, logo, watermark, vertical text
```

---

### Shot 017

**source_keyframe**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_017_ref_v1.png`  
**input_type**: image-to-video  
**duration**: 3s  
**camera**: tracking medium  
**identity_preservation**: Preserve source image identity for Mizore, Nozomi school; do not alter face, hair silhouette, costume logic, body proportion, or core expression.  
**motion_scope**: Mizore follows half-step behind; camera motion should remain tracking medium; purpose is unsaid question.

**Motion Prompt**:
```text
Use the source keyframe as the locked visual reference. Mizore's lips move but no words come out; Nozomi keeps walking forward.
Motion: Mizore follows half-step behind. Camera: tracking medium. Duration: 3s. Preserve the source image identity, face, hairstyle, costume, composition, lighting, and color temperature. Add only subtle micro-expression, hair or fabric movement, environmental motion, and motivated camera drift that fits the keyframe.
```

**Negative / Avoid**:
```text
changed identity, changed face, changed hairstyle, changed costume, redesigned background, extra main characters, exaggerated acting, melodramatic crying, unstable random camera movement, warped hands, random text, logo, watermark, vertical text
```

---

### Shot 018

**source_keyframe**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_018_ref_v1.png`  
**input_type**: image-to-video  
**duration**: 3s  
**camera**: static medium  
**identity_preservation**: Preserve source image identity for Mizore; do not alter face, hair silhouette, costume logic, body proportion, or core expression.  
**motion_scope**: Mizore pushes earbuds deeper; camera motion should remain static medium; purpose is escape into music.

**Motion Prompt**:
```text
Use the source keyframe as the locked visual reference. Mizore sits and seals herself into headphones, classroom light cools.
Motion: Mizore pushes earbuds deeper. Camera: static medium. Duration: 3s. Preserve the source image identity, face, hairstyle, costume, composition, lighting, and color temperature. Add only subtle micro-expression, hair or fabric movement, environmental motion, and motivated camera drift that fits the keyframe.
```

**Negative / Avoid**:
```text
changed identity, changed face, changed hairstyle, changed costume, redesigned background, extra main characters, exaggerated acting, melodramatic crying, unstable random camera movement, warped hands, random text, logo, watermark, vertical text
```

---

### Shot 019

**source_keyframe**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_019_ref_v1.png`  
**input_type**: image-to-video  
**duration**: 2s  
**camera**: static close-up  
**identity_preservation**: Preserve source image identity for Mizore; do not alter face, hair silhouette, costume logic, body proportion, or core expression.  
**motion_scope**: Walkman play button pressed; camera motion should remain static close-up; purpose is memory starts.

**Motion Prompt**:
```text
Use the source keyframe as the locked visual reference. Finger presses play on Walkman, sound becomes transition into warm memory.
Motion: Walkman play button pressed. Camera: static close-up. Duration: 2s. Preserve the source image identity, face, hairstyle, costume, composition, lighting, and color temperature. Add only subtle micro-expression, hair or fabric movement, environmental motion, and motivated camera drift that fits the keyframe.
```

**Negative / Avoid**:
```text
changed identity, changed face, changed hairstyle, changed costume, redesigned background, extra main characters, exaggerated acting, melodramatic crying, unstable random camera movement, warped hands, random text, logo, watermark, vertical text
```

---

### Shot 020

**source_keyframe**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_020_ref_v1.png`  
**input_type**: image-to-video  
**duration**: 3s  
**camera**: static wide  
**identity_preservation**: Preserve source image identity for Mizore, Nozomi school; do not alter face, hair silhouette, costume logic, body proportion, or core expression.  
**motion_scope**: Nozomi initiates contact; camera motion should remain static wide; purpose is relationship origin.

**Motion Prompt**:
```text
Use the source keyframe as the locked visual reference. School hallway, Nozomi in front initiates, Mizore follows from behind.
Motion: Nozomi initiates contact. Camera: static wide. Duration: 3s. Preserve the source image identity, face, hairstyle, costume, composition, lighting, and color temperature. Add only subtle micro-expression, hair or fabric movement, environmental motion, and motivated camera drift that fits the keyframe.
```

**Negative / Avoid**:
```text
changed identity, changed face, changed hairstyle, changed costume, redesigned background, extra main characters, exaggerated acting, melodramatic crying, unstable random camera movement, warped hands, random text, logo, watermark, vertical text
```

---

### Shot 021

**source_keyframe**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_021_ref_v1.png`  
**input_type**: image-to-video  
**duration**: 5s  
**camera**: soft tracking montage  
**identity_preservation**: Preserve source image identity for Mizore, Nozomi school; do not alter face, hair silhouette, costume logic, body proportion, or core expression.  
**motion_scope**: repeated half-step walking; camera motion should remain soft tracking montage; purpose is pattern of following.

**Motion Prompt**:
```text
Use the source keyframe as the locked visual reference. Multiple warm memory spaces, Nozomi always half-step ahead, Mizore follows.
Motion: repeated half-step walking. Camera: soft tracking montage. Duration: 5s. Preserve the source image identity, face, hairstyle, costume, composition, lighting, and color temperature. Add only subtle micro-expression, hair or fabric movement, environmental motion, and motivated camera drift that fits the keyframe.
```

**Negative / Avoid**:
```text
changed identity, changed face, changed hairstyle, changed costume, redesigned background, extra main characters, exaggerated acting, melodramatic crying, unstable random camera movement, warped hands, random text, logo, watermark, vertical text
```

---

### Shot 022

**source_keyframe**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_022_ref_v1.png`  
**input_type**: image-to-video  
**duration**: 3s  
**camera**: static close-up  
**identity_preservation**: Preserve source image identity for Mizore, Nozomi school; do not alter face, hair silhouette, costume logic, body proportion, or core expression.  
**motion_scope**: shared earbud connection; camera motion should remain static close-up; purpose is intimacy.

**Motion Prompt**:
```text
Use the source keyframe as the locked visual reference. One earbud shared between Mizore and Nozomi, warm soft light, fragile connection.
Motion: shared earbud connection. Camera: static close-up. Duration: 3s. Preserve the source image identity, face, hairstyle, costume, composition, lighting, and color temperature. Add only subtle micro-expression, hair or fabric movement, environmental motion, and motivated camera drift that fits the keyframe.
```

**Negative / Avoid**:
```text
changed identity, changed face, changed hairstyle, changed costume, redesigned background, extra main characters, exaggerated acting, melodramatic crying, unstable random camera movement, warped hands, random text, logo, watermark, vertical text
```

---

### Shot 023

**source_keyframe**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_023_ref_v1.png`  
**input_type**: image-to-video  
**duration**: 5s  
**camera**: static medium  
**identity_preservation**: Preserve source image identity for Mizore, Nozomi school; do not alter face, hair silhouette, costume logic, body proportion, or core expression.  
**motion_scope**: Mizore begins to speak; phone interrupts; camera motion should remain static medium; purpose is priority crack.

**Motion Prompt**:
```text
Use the source keyframe as the locked visual reference. Mizore starts "Nozomi, later..." but Nozomi answers phone, Mizore remains unheard.
Motion: Mizore begins to speak; phone interrupts. Camera: static medium. Duration: 5s. Preserve the source image identity, face, hairstyle, costume, composition, lighting, and color temperature. Add only subtle micro-expression, hair or fabric movement, environmental motion, and motivated camera drift that fits the keyframe.
```

**Negative / Avoid**:
```text
changed identity, changed face, changed hairstyle, changed costume, redesigned background, extra main characters, exaggerated acting, melodramatic crying, unstable random camera movement, warped hands, random text, logo, watermark, vertical text
```

---

### Shot 024

**source_keyframe**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_024_ref_v1.png`  
**input_type**: image-to-video  
**duration**: 3s  
**camera**: static wide  
**identity_preservation**: Preserve source image identity for Mizore, Nozomi school; do not alter face, hair silhouette, costume logic, body proportion, or core expression.  
**motion_scope**: Nozomi leaves quickly; camera motion should remain static wide; purpose is unfinished words.

**Motion Prompt**:
```text
Use the source keyframe as the locked visual reference. Nozomi exits casually, Mizore still seated with one earbud, words unfinished.
Motion: Nozomi leaves quickly. Camera: static wide. Duration: 3s. Preserve the source image identity, face, hairstyle, costume, composition, lighting, and color temperature. Add only subtle micro-expression, hair or fabric movement, environmental motion, and motivated camera drift that fits the keyframe.
```

**Negative / Avoid**:
```text
changed identity, changed face, changed hairstyle, changed costume, redesigned background, extra main characters, exaggerated acting, melodramatic crying, unstable random camera movement, warped hands, random text, logo, watermark, vertical text
```

---

### Shot 025

**source_keyframe**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_025_ref_v1.png`  
**input_type**: image-to-video  
**duration**: 4s  
**camera**: static medium  
**identity_preservation**: Preserve source image identity for Mizore, Nozomi school; do not alter face, hair silhouette, costume logic, body proportion, or core expression.  
**motion_scope**: Nozomi casually offers fireworks; camera motion should remain static medium; purpose is promise mismatch.

**Motion Prompt**:
```text
Use the source keyframe as the locked visual reference. Practice-room doorway, Nozomi casually mentions fireworks while packing sheet music.
Motion: Nozomi casually offers fireworks. Camera: static medium. Duration: 4s. Preserve the source image identity, face, hairstyle, costume, composition, lighting, and color temperature. Add only subtle micro-expression, hair or fabric movement, environmental motion, and motivated camera drift that fits the keyframe.
```

**Negative / Avoid**:
```text
changed identity, changed face, changed hairstyle, changed costume, redesigned background, extra main characters, exaggerated acting, melodramatic crying, unstable random camera movement, warped hands, random text, logo, watermark, vertical text
```

---

### Shot 026

**source_keyframe**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_026_ref_v1.png`  
**input_type**: image-to-video  
**duration**: 2s  
**camera**: static close-up  
**identity_preservation**: Preserve source image identity for Mizore; do not alter face, hair silhouette, costume logic, body proportion, or core expression.  
**motion_scope**: Mizore nods solemnly; camera motion should remain static close-up; purpose is unequal weight.

**Motion Prompt**:
```text
Use the source keyframe as the locked visual reference. Mizore answers "yes" with serious small nod, warm but fragile.
Motion: Mizore nods solemnly. Camera: static close-up. Duration: 2s. Preserve the source image identity, face, hairstyle, costume, composition, lighting, and color temperature. Add only subtle micro-expression, hair or fabric movement, environmental motion, and motivated camera drift that fits the keyframe.
```

**Negative / Avoid**:
```text
changed identity, changed face, changed hairstyle, changed costume, redesigned background, extra main characters, exaggerated acting, melodramatic crying, unstable random camera movement, warped hands, random text, logo, watermark, vertical text
```

---

### Shot 027

**source_keyframe**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_027_ref_v1.png`  
**input_type**: image-to-video  
**duration**: 3s  
**camera**: static wide  
**identity_preservation**: Preserve source image identity for Mizore, Nozomi school; do not alter face, hair silhouette, costume logic, body proportion, or core expression.  
**motion_scope**: Nozomi leaves without turning; camera motion should remain static wide; purpose is left behind again.

**Motion Prompt**:
```text
Use the source keyframe as the locked visual reference. Nozomi moves out of practice room, Mizore alone in warm empty space.
Motion: Nozomi leaves without turning. Camera: static wide. Duration: 3s. Preserve the source image identity, face, hairstyle, costume, composition, lighting, and color temperature. Add only subtle micro-expression, hair or fabric movement, environmental motion, and motivated camera drift that fits the keyframe.
```

**Negative / Avoid**:
```text
changed identity, changed face, changed hairstyle, changed costume, redesigned background, extra main characters, exaggerated acting, melodramatic crying, unstable random camera movement, warped hands, random text, logo, watermark, vertical text
```

---

### Shot 028

**source_keyframe**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_028_ref_v1.png`  
**input_type**: image-to-video  
**duration**: 4s  
**camera**: top-down insert  
**identity_preservation**: Preserve source image identity for Mizore; do not alter face, hair silhouette, costume logic, body proportion, or core expression.  
**motion_scope**: Mizore circles calendar twice; camera motion should remain top-down insert; purpose is promise internalized.

**Motion Prompt**:
```text
Use the source keyframe as the locked visual reference. Phone calendar, fireworks date circled twice, delicate hand movement.
Motion: Mizore circles calendar twice. Camera: top-down insert. Duration: 4s. Preserve the source image identity, face, hairstyle, costume, composition, lighting, and color temperature. Add only subtle micro-expression, hair or fabric movement, environmental motion, and motivated camera drift that fits the keyframe.
```

**Negative / Avoid**:
```text
changed identity, changed face, changed hairstyle, changed costume, redesigned background, extra main characters, exaggerated acting, melodramatic crying, unstable random camera movement, warped hands, random text, logo, watermark, vertical text
```

---

### Shot 029

**source_keyframe**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_029_ref_v1.png`  
**input_type**: image-to-video  
**duration**: 3s  
**camera**: static medium  
**identity_preservation**: Preserve source image identity for Mizore, Nozomi school; do not alter face, hair silhouette, costume logic, body proportion, or core expression.  
**motion_scope**: Nozomi glances back; Mizore smiles; camera motion should remain static medium; purpose is misread confirmation.

**Motion Prompt**:
```text
Use the source keyframe as the locked visual reference. Nozomi's casual check-back becomes Mizore's hopeful interpretation.
Motion: Nozomi glances back; Mizore smiles. Camera: static medium. Duration: 3s. Preserve the source image identity, face, hairstyle, costume, composition, lighting, and color temperature. Add only subtle micro-expression, hair or fabric movement, environmental motion, and motivated camera drift that fits the keyframe.
```

**Negative / Avoid**:
```text
changed identity, changed face, changed hairstyle, changed costume, redesigned background, extra main characters, exaggerated acting, melodramatic crying, unstable random camera movement, warped hands, random text, logo, watermark, vertical text
```

---

### Shot 030

**source_keyframe**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_030_ref_v1.png`  
**input_type**: image-to-video  
**duration**: 4s  
**camera**: fast insert montage  
**identity_preservation**: Preserve full source image composition, lighting, prop design, and environment.  
**motion_scope**: schedules fill differently; camera motion should remain fast insert montage; purpose is worlds diverge.

**Motion Prompt**:
```text
Use the source keyframe as the locked visual reference. Split rhythm: Nozomi's schedule expands outward, Mizore's notes orbit Nozomi.
Motion: schedules fill differently. Camera: fast insert montage. Duration: 4s. Preserve the source image identity, face, hairstyle, costume, composition, lighting, and color temperature. Add only subtle micro-expression, hair or fabric movement, environmental motion, and motivated camera drift that fits the keyframe.
```

**Negative / Avoid**:
```text
changed identity, changed face, changed hairstyle, changed costume, redesigned background, extra main characters, exaggerated acting, melodramatic crying, unstable random camera movement, warped hands, random text, logo, watermark, vertical text
```

---

### Shot 031

**source_keyframe**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_031_ref_v1.png`  
**input_type**: image-to-video  
**duration**: 5s  
**camera**: static/montage  
**identity_preservation**: Preserve source image identity for Mizore; do not alter face, hair silhouette, costume logic, body proportion, or core expression.  
**motion_scope**: Mizore waits in repeated places; camera motion should remain static/montage; purpose is alignment effort.

**Motion Prompt**:
```text
Use the source keyframe as the locked visual reference. Mizore waits at classroom, practice room, hallway, checking watch more often.
Motion: Mizore waits in repeated places. Camera: static/montage. Duration: 5s. Preserve the source image identity, face, hairstyle, costume, composition, lighting, and color temperature. Add only subtle micro-expression, hair or fabric movement, environmental motion, and motivated camera drift that fits the keyframe.
```

**Negative / Avoid**:
```text
changed identity, changed face, changed hairstyle, changed costume, redesigned background, extra main characters, exaggerated acting, melodramatic crying, unstable random camera movement, warped hands, random text, logo, watermark, vertical text
```

---

### Shot 032

**source_keyframe**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_032_ref_v1.png`  
**input_type**: image-to-video  
**duration**: 4s  
**camera**: tracking wide  
**identity_preservation**: Preserve source image identity for Mizore, Nozomi school; do not alter face, hair silhouette, costume logic, body proportion, or core expression.  
**motion_scope**: Nozomi speeds ahead; camera motion should remain tracking wide; purpose is distance grows.

**Motion Prompt**:
```text
Use the source keyframe as the locked visual reference. Nozomi's back recedes, Mizore follows but cannot keep pace.
Motion: Nozomi speeds ahead. Camera: tracking wide. Duration: 4s. Preserve the source image identity, face, hairstyle, costume, composition, lighting, and color temperature. Add only subtle micro-expression, hair or fabric movement, environmental motion, and motivated camera drift that fits the keyframe.
```

**Negative / Avoid**:
```text
changed identity, changed face, changed hairstyle, changed costume, redesigned background, extra main characters, exaggerated acting, melodramatic crying, unstable random camera movement, warped hands, random text, logo, watermark, vertical text
```

---

### Shot 033

**source_keyframe**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_033_ref_v1.png`  
**input_type**: image-to-video  
**duration**: 3s  
**camera**: static close-up  
**identity_preservation**: Preserve source image identity for Mizore; do not alter face, hair silhouette, costume logic, body proportion, or core expression.  
**motion_scope**: Mizore writes fireworks details; camera motion should remain static close-up; purpose is preparation.

**Motion Prompt**:
```text
Use the source keyframe as the locked visual reference. Paper with time/place, Mizore carefully confirms details.
Motion: Mizore writes fireworks details. Camera: static close-up. Duration: 3s. Preserve the source image identity, face, hairstyle, costume, composition, lighting, and color temperature. Add only subtle micro-expression, hair or fabric movement, environmental motion, and motivated camera drift that fits the keyframe.
```

**Negative / Avoid**:
```text
changed identity, changed face, changed hairstyle, changed costume, redesigned background, extra main characters, exaggerated acting, melodramatic crying, unstable random camera movement, warped hands, random text, logo, watermark, vertical text
```

---

### Shot 034

**source_keyframe**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_034_ref_v1.png`  
**input_type**: image-to-video  
**duration**: 4s  
**camera**: phone macro  
**identity_preservation**: Preserve source image identity for Mizore; do not alter face, hair silhouette, costume logic, body proportion, or core expression.  
**motion_scope**: message sent; camera motion should remain phone macro; purpose is active choice.

**Motion Prompt**:
```text
Use the source keyframe as the locked visual reference. Mizore sends "still meeting for fireworks?", tiny breath before send.
Motion: message sent. Camera: phone macro. Duration: 4s. Preserve the source image identity, face, hairstyle, costume, composition, lighting, and color temperature. Add only subtle micro-expression, hair or fabric movement, environmental motion, and motivated camera drift that fits the keyframe.
```

**Negative / Avoid**:
```text
changed identity, changed face, changed hairstyle, changed costume, redesigned background, extra main characters, exaggerated acting, melodramatic crying, unstable random camera movement, warped hands, random text, logo, watermark, vertical text
```

---

### Shot 035

**source_keyframe**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_035_ref_v1.png`  
**input_type**: image-to-video  
**duration**: 3s  
**camera**: quick montage  
**identity_preservation**: Preserve source image identity for Mizore; do not alter face, hair silhouette, costume logic, body proportion, or core expression.  
**motion_scope**: Mizore checks phone repeatedly; camera motion should remain quick montage; purpose is waiting tension.

**Motion Prompt**:
```text
Use the source keyframe as the locked visual reference. Class, lunch, walking; phone checking repeats in tighter cuts.
Motion: Mizore checks phone repeatedly. Camera: quick montage. Duration: 3s. Preserve the source image identity, face, hairstyle, costume, composition, lighting, and color temperature. Add only subtle micro-expression, hair or fabric movement, environmental motion, and motivated camera drift that fits the keyframe.
```

**Negative / Avoid**:
```text
changed identity, changed face, changed hairstyle, changed costume, redesigned background, extra main characters, exaggerated acting, melodramatic crying, unstable random camera movement, warped hands, random text, logo, watermark, vertical text
```

---

### Shot 036

**source_keyframe**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_036_ref_v1.png`  
**input_type**: image-to-video  
**duration**: 3s  
**camera**: static close-up  
**identity_preservation**: Preserve source image identity for Mizore; do not alter face, hair silhouette, costume logic, body proportion, or core expression.  
**motion_scope**: reply appears; smile fails; camera motion should remain static close-up; purpose is warning sign.

**Motion Prompt**:
```text
Use the source keyframe as the locked visual reference. Nozomi's vague reply arrives, Mizore's mouth tries to lift but stops.
Motion: reply appears; smile fails. Camera: static close-up. Duration: 3s. Preserve the source image identity, face, hairstyle, costume, composition, lighting, and color temperature. Add only subtle micro-expression, hair or fabric movement, environmental motion, and motivated camera drift that fits the keyframe.
```

**Negative / Avoid**:
```text
changed identity, changed face, changed hairstyle, changed costume, redesigned background, extra main characters, exaggerated acting, melodramatic crying, unstable random camera movement, warped hands, random text, logo, watermark, vertical text
```

---

### Shot 037

**source_keyframe**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_037_ref_v1.png`  
**input_type**: image-to-video  
**duration**: 4s  
**camera**: static wide  
**identity_preservation**: Preserve source image identity for Mizore; do not alter face, hair silhouette, costume logic, body proportion, or core expression.  
**motion_scope**: Mizore arrives alone; camera motion should remain static wide; purpose is isolated anticipation.

**Motion Prompt**:
```text
Use the source keyframe as the locked visual reference. Fireworks crowd, pairs and groups around Mizore, she stands alone.
Motion: Mizore arrives alone. Camera: static wide. Duration: 4s. Preserve the source image identity, face, hairstyle, costume, composition, lighting, and color temperature. Add only subtle micro-expression, hair or fabric movement, environmental motion, and motivated camera drift that fits the keyframe.
```

**Negative / Avoid**:
```text
changed identity, changed face, changed hairstyle, changed costume, redesigned background, extra main characters, exaggerated acting, melodramatic crying, unstable random camera movement, warped hands, random text, logo, watermark, vertical text
```

---

### Shot 038

**source_keyframe**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_038_ref_v1.png`  
**input_type**: image-to-video  
**duration**: 3s  
**camera**: static insert  
**identity_preservation**: Preserve source image identity for Mizore; do not alter face, hair silhouette, costume logic, body proportion, or core expression.  
**motion_scope**: phone and watch checked; camera motion should remain static insert; purpose is time pressure.

**Motion Prompt**:
```text
Use the source keyframe as the locked visual reference. Empty screen, wristwatch, night deepening.
Motion: phone and watch checked. Camera: static insert. Duration: 3s. Preserve the source image identity, face, hairstyle, costume, composition, lighting, and color temperature. Add only subtle micro-expression, hair or fabric movement, environmental motion, and motivated camera drift that fits the keyframe.
```

**Negative / Avoid**:
```text
changed identity, changed face, changed hairstyle, changed costume, redesigned background, extra main characters, exaggerated acting, melodramatic crying, unstable random camera movement, warped hands, random text, logo, watermark, vertical text
```

---

### Shot 039

**source_keyframe**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_039_ref_v1.png`  
**input_type**: image-to-video  
**duration**: 4s  
**camera**: static medium  
**identity_preservation**: Preserve source image identity for Mizore; do not alter face, hair silhouette, costume logic, body proportion, or core expression.  
**motion_scope**: Walkman volume raised; camera motion should remain static medium; purpose is music as buffer.

**Motion Prompt**:
```text
Use the source keyframe as the locked visual reference. Mizore turns up Walkman to fill the wait, crowd flows around her.
Motion: Walkman volume raised. Camera: static medium. Duration: 4s. Preserve the source image identity, face, hairstyle, costume, composition, lighting, and color temperature. Add only subtle micro-expression, hair or fabric movement, environmental motion, and motivated camera drift that fits the keyframe.
```

**Negative / Avoid**:
```text
changed identity, changed face, changed hairstyle, changed costume, redesigned background, extra main characters, exaggerated acting, melodramatic crying, unstable random camera movement, warped hands, random text, logo, watermark, vertical text
```

---

### Shot 040

**source_keyframe**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_040_ref_v1.png`  
**input_type**: image-to-video  
**duration**: 5s  
**camera**: static low-angle wide  
**identity_preservation**: Preserve source image identity for Mizore; do not alter face, hair silhouette, costume logic, body proportion, or core expression.  
**motion_scope**: fireworks bloom; Mizore still waits; camera motion should remain static low-angle wide; purpose is emotional peak.

**Motion Prompt**:
```text
Use the source keyframe as the locked visual reference. Fireworks light Mizore's blank face, beauty contrasts absence.
Motion: fireworks bloom; Mizore still waits. Camera: static low-angle wide. Duration: 5s. Preserve the source image identity, face, hairstyle, costume, composition, lighting, and color temperature. Add only subtle micro-expression, hair or fabric movement, environmental motion, and motivated camera drift that fits the keyframe.
```

**Negative / Avoid**:
```text
changed identity, changed face, changed hairstyle, changed costume, redesigned background, extra main characters, exaggerated acting, melodramatic crying, unstable random camera movement, warped hands, random text, logo, watermark, vertical text
```

---

### Shot 041

**source_keyframe**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_041_ref_v1.png`  
**input_type**: image-to-video  
**duration**: 3s  
**camera**: static wide  
**identity_preservation**: Preserve source image identity for Mizore; do not alter face, hair silhouette, costume logic, body proportion, or core expression.  
**motion_scope**: crowd leaves, Mizore exits alone; camera motion should remain static wide; purpose is waiting collapses.

**Motion Prompt**:
```text
Use the source keyframe as the locked visual reference. Fireworks end, emptying ground, Mizore's small solitary back.
Motion: crowd leaves, Mizore exits alone. Camera: static wide. Duration: 3s. Preserve the source image identity, face, hairstyle, costume, composition, lighting, and color temperature. Add only subtle micro-expression, hair or fabric movement, environmental motion, and motivated camera drift that fits the keyframe.
```

**Negative / Avoid**:
```text
changed identity, changed face, changed hairstyle, changed costume, redesigned background, extra main characters, exaggerated acting, melodramatic crying, unstable random camera movement, warped hands, random text, logo, watermark, vertical text
```

---

### Shot 042

**source_keyframe**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_042_ref_v1.png`  
**input_type**: image-to-video  
**duration**: 4s  
**camera**: static medium  
**identity_preservation**: Preserve source image identity for Mizore, Nozomi school; do not alter face, hair silhouette, costume logic, body proportion, or core expression.  
**motion_scope**: Mizore overhears Nozomi explain; camera motion should remain static medium; purpose is priority revealed.

**Motion Prompt**:
```text
Use the source keyframe as the locked visual reference. Next day school, Nozomi speaks to classmates; Mizore understands without anger.
Motion: Mizore overhears Nozomi explain. Camera: static medium. Duration: 4s. Preserve the source image identity, face, hairstyle, costume, composition, lighting, and color temperature. Add only subtle micro-expression, hair or fabric movement, environmental motion, and motivated camera drift that fits the keyframe.
```

**Negative / Avoid**:
```text
changed identity, changed face, changed hairstyle, changed costume, redesigned background, extra main characters, exaggerated acting, melodramatic crying, unstable random camera movement, warped hands, random text, logo, watermark, vertical text
```

---

### Shot 043

**source_keyframe**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_043_ref_v1.png`  
**input_type**: image-to-video  
**duration**: 3s  
**camera**: tracking wide  
**identity_preservation**: Preserve source image identity for Mizore; do not alter face, hair silhouette, costume logic, body proportion, or core expression.  
**motion_scope**: Mizore walks home alone; camera motion should remain tracking wide; purpose is aftermath.

**Motion Prompt**:
```text
Use the source keyframe as the locked visual reference. Quiet street, Mizore walks with contained emptiness.
Motion: Mizore walks home alone. Camera: tracking wide. Duration: 3s. Preserve the source image identity, face, hairstyle, costume, composition, lighting, and color temperature. Add only subtle micro-expression, hair or fabric movement, environmental motion, and motivated camera drift that fits the keyframe.
```

**Negative / Avoid**:
```text
changed identity, changed face, changed hairstyle, changed costume, redesigned background, extra main characters, exaggerated acting, melodramatic crying, unstable random camera movement, warped hands, random text, logo, watermark, vertical text
```

---

### Shot 044

**source_keyframe**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_044_ref_v1.png`  
**input_type**: image-to-video  
**duration**: 3s  
**camera**: static close-up  
**identity_preservation**: Preserve source image identity for Mizore; do not alter face, hair silhouette, costume logic, body proportion, or core expression.  
**motion_scope**: Walkman stop/eject action; camera motion should remain static close-up; purpose is rupture.

**Motion Prompt**:
```text
Use the source keyframe as the locked visual reference. Mizore presses stop or ejects cassette, physical quiet break.
Motion: Walkman stop/eject action. Camera: static close-up. Duration: 3s. Preserve the source image identity, face, hairstyle, costume, composition, lighting, and color temperature. Add only subtle micro-expression, hair or fabric movement, environmental motion, and motivated camera drift that fits the keyframe.
```

**Negative / Avoid**:
```text
changed identity, changed face, changed hairstyle, changed costume, redesigned background, extra main characters, exaggerated acting, melodramatic crying, unstable random camera movement, warped hands, random text, logo, watermark, vertical text
```

---

### Shot 045

**source_keyframe**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_045_ref_v1.png`  
**input_type**: image-to-video  
**duration**: 5s  
**camera**: static wide  
**identity_preservation**: Preserve source image identity for Mizore; do not alter face, hair silhouette, costume logic, body proportion, or core expression.  
**motion_scope**: survey form placed on desk; camera motion should remain static wide; purpose is digestion.

**Motion Prompt**:
```text
Use the source keyframe as the locked visual reference. Mizore sits alone, takes creased blank survey form out and finally faces it.
Motion: survey form placed on desk. Camera: static wide. Duration: 5s. Preserve the source image identity, face, hairstyle, costume, composition, lighting, and color temperature. Add only subtle micro-expression, hair or fabric movement, environmental motion, and motivated camera drift that fits the keyframe.
```

**Negative / Avoid**:
```text
changed identity, changed face, changed hairstyle, changed costume, redesigned background, extra main characters, exaggerated acting, melodramatic crying, unstable random camera movement, warped hands, random text, logo, watermark, vertical text
```

---

### Shot 046

**source_keyframe**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_046_ref_v1.png`  
**input_type**: image-to-video  
**duration**: 5s  
**camera**: static medium  
**identity_preservation**: Preserve source image identity for Mizore; do not alter face, hair silhouette, costume logic, body proportion, or core expression.  
**motion_scope**: Mizore lifts pen over form; camera motion should remain static medium; purpose is decision point.

**Motion Prompt**:
```text
Use the source keyframe as the locked visual reference. High-key morning light, Mizore centered, pen pauses over survey form.
Motion: Mizore lifts pen over form. Camera: static medium. Duration: 5s. Preserve the source image identity, face, hairstyle, costume, composition, lighting, and color temperature. Add only subtle micro-expression, hair or fabric movement, environmental motion, and motivated camera drift that fits the keyframe.
```

**Negative / Avoid**:
```text
changed identity, changed face, changed hairstyle, changed costume, redesigned background, extra main characters, exaggerated acting, melodramatic crying, unstable random camera movement, warped hands, random text, logo, watermark, vertical text
```

---

### Shot 047

**source_keyframe**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_047_ref_v1.png`  
**input_type**: image-to-video  
**duration**: 4s  
**camera**: macro insert  
**identity_preservation**: Preserve source image identity for Mizore; do not alter face, hair silhouette, costume logic, body proportion, or core expression.  
**motion_scope**: pen writes, form folded cleanly; camera motion should remain macro insert; purpose is active future.

**Motion Prompt**:
```text
Use the source keyframe as the locked visual reference. Pen touches paper, writing appears, no crossing out, form folded with care.
Motion: pen writes, form folded cleanly. Camera: macro insert. Duration: 4s. Preserve the source image identity, face, hairstyle, costume, composition, lighting, and color temperature. Add only subtle micro-expression, hair or fabric movement, environmental motion, and motivated camera drift that fits the keyframe.
```

**Negative / Avoid**:
```text
changed identity, changed face, changed hairstyle, changed costume, redesigned background, extra main characters, exaggerated acting, melodramatic crying, unstable random camera movement, warped hands, random text, logo, watermark, vertical text
```

---

### Shot 048

**source_keyframe**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_048_ref_v1.png`  
**input_type**: image-to-video  
**duration**: 3s  
**camera**: static close-up  
**identity_preservation**: Preserve source image identity for Mizore; do not alter face, hair silhouette, costume logic, body proportion, or core expression.  
**motion_scope**: Walkman plays forward; camera motion should remain static close-up; purpose is time moves.

**Motion Prompt**:
```text
Use the source keyframe as the locked visual reference. Walkman play pressed, cassette moves forward, no rewind.
Motion: Walkman plays forward. Camera: static close-up. Duration: 3s. Preserve the source image identity, face, hairstyle, costume, composition, lighting, and color temperature. Add only subtle micro-expression, hair or fabric movement, environmental motion, and motivated camera drift that fits the keyframe.
```

**Negative / Avoid**:
```text
changed identity, changed face, changed hairstyle, changed costume, redesigned background, extra main characters, exaggerated acting, melodramatic crying, unstable random camera movement, warped hands, random text, logo, watermark, vertical text
```

---

### Shot 049

**source_keyframe**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_049_ref_v1.png`  
**input_type**: image-to-video  
**duration**: 8s  
**camera**: static wide  
**identity_preservation**: Preserve source image identity for Mizore; do not alter face, hair silhouette, costume logic, body proportion, or core expression.  
**motion_scope**: Mizore stands toward light; camera motion should remain static wide; purpose is resolution.

**Motion Prompt**:
```text
Use the source keyframe as the locked visual reference. Mizore faces window or distant plane light, back to camera, quiet forward posture.
Motion: Mizore stands toward light. Camera: static wide. Duration: 8s. Preserve the source image identity, face, hairstyle, costume, composition, lighting, and color temperature. Add only subtle micro-expression, hair or fabric movement, environmental motion, and motivated camera drift that fits the keyframe.
```

**Negative / Avoid**:
```text
changed identity, changed face, changed hairstyle, changed costume, redesigned background, extra main characters, exaggerated acting, melodramatic crying, unstable random camera movement, warped hands, random text, logo, watermark, vertical text
```

---

## Platform Adaptation Notes

| Platform | Use |
| --- | --- |
| Runway Gen-3 | Use source keyframe plus motion prompt; keep camera movement minimal and motivated. |
| Pika | Use the same keyframe and add explicit timing phrases such as `over 3 seconds`, `then`, and `ending on`. |
| SVD | Use only subtle motion; keep motion amplitude low and prioritize identity preservation. |

## Version History

| Version | Date | Change |
| --- | --- | --- |
| v1 | 2026-02-02 | Initial first-section video prompts |
| v2 | 2026-02-02 | Optimized Shot 001-019 |
| v3 | 2026-05-02 | Full workflow rerun; expanded to Shot 001-049 |
| v4 | 2026-05-07 | Bound every shot to reference-aware keyframe paths for image-to-video workflow |
