# Artifact: Art Prompts (Reference-Aware Keyframes)
- id: A-20260126-001
- version: v3
- upstream: [A-20260122-004, A-20260121-003, A-20260502-001]
- locks:
  - must_keep:
    - ?????????? `deliverables/20_guides/refs/` ??????? identity anchor
    - ?? DNA ???????????????
    - ?????? -> ? -> ???? -> ????
    - ??????????/???????/??
  - must_avoid:
    - ? text-only prompt ???? production keyframes
    - ???????????????????
    - ????????????????
    - ?????????????
  - budget_notes:
    - Platform: image reference-bound generation
    - Total shots: 49
    - Aspect ratio: 16:9
    - Output target: `deliverables/50_art/generated_ref_v1/`

---

# BIPOLAR MV Reference-Aware Art Prompts v3

## ????

???????????????????????????????????????????????????? prompt?

??????

- `deliverables/20_guides/refs/mizore_reference.png` as `Mizore identity reference`
- `deliverables/20_guides/refs/nozomi_reference.png` as `Nozomi school identity reference`
- ???????? `nozomi_reference.png` as `Nozomi adult identity adaptation reference`

???????avoid identity drift, changed hairstyle, changed uniform colors, extra main characters, villain-like Nozomi, melodramatic crying, warped hands, random text, logo, watermark, vertical text.

---

### Shot 001

**Source**: `deliverables/30_breakdown/03_storyboard_v2.md`, Shot 001  
**Section**: Prologue / airport present and Walkman transition  
**Source beat**: **Beat 1 | 全景 | 固定仰角 | 4秒**  
**Platform**: image reference-bound generation  
**Mode**: single final-frame keyframe  
**Output target**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_001_ref_v1.png`

**reference_images**:
- none; environment, prop, or crowd shot without named-character identity anchor

**reference_roles**:
- no named-character reference required; preserve composition and prop design from the prompt

**identity_lock**:
- no named-character reference required; preserve composition and prop design from the prompt

**reference_limitations**:
- No character identity reference is required for this shot.

**Prompt**:
```text
Use the loaded reference images exactly as labeled above. Kansai International Airport interior, iconic curved steel ceiling structure, floor-to-ceiling glass curtain wall, overcast lead-gray sky outside, fine snowflakes drifting past terminal lights like white dust, cold winter morning atmosphere, architectural photography, cinematic composition, muted cool tones 5500K, film grain texture, melancholic mood --ar 16:9 --v 6 --style raw --s 250
Reference priority: identity reference images first, asset-guide DNA second, shot-specific composition and lighting third. Preserve character identity, face shape, hair silhouette, costume logic, and restrained expression range across the full film.
```

**Negative / Avoid**:
```text
identity drift, changed hairstyle, changed face, changed costume colors, extra main characters, villain-like Nozomi, melodramatic crying, exaggerated acting, warped hands, unreadable important props, random text, logo, watermark, vertical text
```

---

### Shot 002

**Source**: `deliverables/30_breakdown/03_storyboard_v2.md`, Shot 002  
**Section**: Prologue / airport present and Walkman transition  
**Source beat**: **Beat 1 | 中景 | 跟拍平移 | 3秒**  
**Platform**: image reference-bound generation  
**Mode**: single final-frame keyframe  
**Output target**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_002_ref_v1.png`

**reference_images**:
- `deliverables/20_guides/refs/nozomi_reference.png` as Nozomi adult identity adaptation reference

**reference_roles**:
- Nozomi adult identity adaptation reference: Use Nozomi school reference only for face, freckles, hairline, and identity continuity; adapt age, coat, gray scarf, white headphones, and adult airport styling from the asset guide.

**identity_lock**:
- Nozomi adult identity adaptation reference: Use Nozomi school reference only for face, freckles, hairline, and identity continuity; adapt age, coat, gray scarf, white headphones, and adult airport styling from the asset guide.

**reference_limitations**:
- Adult Nozomi does not yet have a dedicated adult reference image; use the Nozomi reference only for identity continuity and follow the asset guide for adult styling.
- Do not let airport adult styling change Nozomi into a different person.

**Prompt**:
```text
Use the loaded reference images exactly as labeled above. Japanese young adult woman walking on airport moving walkway, black hair in low ponytail, wispy bangs, wearing elegant tailored black wool coat, gray scarf covering half of face, carrying black Chanel 19 quilted bag with chain strap, crowds of travelers around her, from behind, sense of isolation amid busy terminal, cool lighting 5500K, cinematic depth of field, film grain texture --ar 16:9 --v 6 --style raw --s 200
Reference priority: identity reference images first, asset-guide DNA second, shot-specific composition and lighting third. Preserve character identity, face shape, hair silhouette, costume logic, and restrained expression range across the full film.
```

**Negative / Avoid**:
```text
identity drift, changed hairstyle, changed face, changed costume colors, extra main characters, villain-like Nozomi, melodramatic crying, exaggerated acting, warped hands, unreadable important props, random text, logo, watermark, vertical text
```

---

### Shot 003

**Source**: `deliverables/30_breakdown/03_storyboard_v2.md`, Shot 003  
**Section**: Prologue / airport present and Walkman transition  
**Source beat**: **Beat 2 | 特写 | 固定 | 2秒**  
**Platform**: image reference-bound generation  
**Mode**: single final-frame keyframe  
**Output target**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_003_ref_v1.png`

**reference_images**:
- `deliverables/20_guides/refs/nozomi_reference.png` as Nozomi adult identity adaptation reference

**reference_roles**:
- Nozomi adult identity adaptation reference: Use Nozomi school reference only for face, freckles, hairline, and identity continuity; adapt age, coat, gray scarf, white headphones, and adult airport styling from the asset guide.

**identity_lock**:
- Nozomi adult identity adaptation reference: Use Nozomi school reference only for face, freckles, hairline, and identity continuity; adapt age, coat, gray scarf, white headphones, and adult airport styling from the asset guide.

**reference_limitations**:
- Adult Nozomi does not yet have a dedicated adult reference image; use the Nozomi reference only for identity continuity and follow the asset guide for adult styling.
- Do not let airport adult styling change Nozomi into a different person.

**Prompt**:
```text
Use the loaded reference images exactly as labeled above. Close-up side profile of Japanese woman's ear wearing white over-ear noise-canceling headphones, sleek modern design, soft skin texture, black hair visible, sense of isolation and blocking out the world, cool blue-gray lighting, shallow depth of field, minimalist composition, film grain --ar 16:9 --v 6 --style raw --s 150
Reference priority: identity reference images first, asset-guide DNA second, shot-specific composition and lighting third. Preserve character identity, face shape, hair silhouette, costume logic, and restrained expression range across the full film.
```

**Negative / Avoid**:
```text
identity drift, changed hairstyle, changed face, changed costume colors, extra main characters, villain-like Nozomi, melodramatic crying, exaggerated acting, warped hands, unreadable important props, random text, logo, watermark, vertical text
```

---

### Shot 004

**Source**: `deliverables/30_breakdown/03_storyboard_v2.md`, Shot 004  
**Section**: Prologue / airport present and Walkman transition  
**Source beat**: **Beat 2 | 特写 | 固定 | 2秒**  
**Platform**: image reference-bound generation  
**Mode**: single final-frame keyframe  
**Output target**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_004_ref_v1.png`

**reference_images**:
- `deliverables/20_guides/refs/nozomi_reference.png` as Nozomi adult identity adaptation reference

**reference_roles**:
- Nozomi adult identity adaptation reference: Use Nozomi school reference only for face, freckles, hairline, and identity continuity; adapt age, coat, gray scarf, white headphones, and adult airport styling from the asset guide.

**identity_lock**:
- Nozomi adult identity adaptation reference: Use Nozomi school reference only for face, freckles, hairline, and identity continuity; adapt age, coat, gray scarf, white headphones, and adult airport styling from the asset guide.

**reference_limitations**:
- Adult Nozomi does not yet have a dedicated adult reference image; use the Nozomi reference only for identity continuity and follow the asset guide for adult styling.
- Do not let airport adult styling change Nozomi into a different person.

**Prompt**:
```text
Use the loaded reference images exactly as labeled above. Close-up of woman's shoulder carrying black Chanel 19 handbag, quilted leather texture catching cold light, metallic chain strap gently swaying with walking motion, elegant sophisticated style, symbol of adult world, cool lighting reflecting on leather, shallow depth of field, fashion photography style --ar 16:9 --v 6 --style raw --s 200
Reference priority: identity reference images first, asset-guide DNA second, shot-specific composition and lighting third. Preserve character identity, face shape, hair silhouette, costume logic, and restrained expression range across the full film.
```

**Negative / Avoid**:
```text
identity drift, changed hairstyle, changed face, changed costume colors, extra main characters, villain-like Nozomi, melodramatic crying, exaggerated acting, warped hands, unreadable important props, random text, logo, watermark, vertical text
```

---

### Shot 005

**Source**: `deliverables/30_breakdown/03_storyboard_v2.md`, Shot 005  
**Section**: Prologue / airport present and Walkman transition  
**Source beat**: **Beat 3 | 特写 | 慢动作固定 | 5秒**  
**Platform**: image reference-bound generation  
**Mode**: single final-frame keyframe  
**Output target**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_005_ref_v1.png`

**reference_images**:
- `deliverables/20_guides/refs/nozomi_reference.png` as Nozomi adult identity adaptation reference

**reference_roles**:
- Nozomi adult identity adaptation reference: Use Nozomi school reference only for face, freckles, hairline, and identity continuity; adapt age, coat, gray scarf, white headphones, and adult airport styling from the asset guide.

**identity_lock**:
- Nozomi adult identity adaptation reference: Use Nozomi school reference only for face, freckles, hairline, and identity continuity; adapt age, coat, gray scarf, white headphones, and adult airport styling from the asset guide.

**reference_limitations**:
- Adult Nozomi does not yet have a dedicated adult reference image; use the Nozomi reference only for identity continuity and follow the asset guide for adult styling.
- Do not let airport adult styling change Nozomi into a different person.

**Prompt**:
```text
Use the loaded reference images exactly as labeled above. Japanese young adult woman turning back at airplane boarding gate doorway, black hair in low ponytail, wispy bangs, amber brown eyes with transparent gaze, mature sophisticated face showing neither longing nor struggle, only calm confirmation of farewell, gray scarf draped over shoulder, subtle polite arc on lips, slow motion effect, soft backlighting from boarding bridge, cool tones 5500K, emotional turning point, cinematic portrait, film grain --ar 16:9 --v 6 --style raw --s 300
Reference priority: identity reference images first, asset-guide DNA second, shot-specific composition and lighting third. Preserve character identity, face shape, hair silhouette, costume logic, and restrained expression range across the full film.
```

**Negative / Avoid**:
```text
identity drift, changed hairstyle, changed face, changed costume colors, extra main characters, villain-like Nozomi, melodramatic crying, exaggerated acting, warped hands, unreadable important props, random text, logo, watermark, vertical text
```

---

### Shot 006

**Source**: `deliverables/30_breakdown/03_storyboard_v2.md`, Shot 006  
**Section**: Prologue / airport present and Walkman transition  
**Source beat**: **Beat 4 | 中景 | 固定窗外视角 | 3秒**  
**Platform**: image reference-bound generation  
**Mode**: single final-frame keyframe  
**Output target**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_006_ref_v1.png`

**reference_images**:
- `deliverables/20_guides/refs/nozomi_reference.png` as Nozomi adult identity adaptation reference

**reference_roles**:
- Nozomi adult identity adaptation reference: Use Nozomi school reference only for face, freckles, hairline, and identity continuity; adapt age, coat, gray scarf, white headphones, and adult airport styling from the asset guide.

**identity_lock**:
- Nozomi adult identity adaptation reference: Use Nozomi school reference only for face, freckles, hairline, and identity continuity; adapt age, coat, gray scarf, white headphones, and adult airport styling from the asset guide.

**reference_limitations**:
- Adult Nozomi does not yet have a dedicated adult reference image; use the Nozomi reference only for identity continuity and follow the asset guide for adult styling.
- Do not let airport adult styling change Nozomi into a different person.

**Prompt**:
```text
Use the loaded reference images exactly as labeled above. Interior airplane cabin window seat, Japanese woman sitting by window looking out, airplane wing extending into view, heavy snow falling outside, snowflakes leaving diagonal white streaks on glass, blurring ground lights below, claustrophobic enclosed space, muted engine hum atmosphere, cool blue interior lighting, sense of departure and compression, cinematic framing, film grain texture --ar 16:9 --v 6 --style raw --s 200
Reference priority: identity reference images first, asset-guide DNA second, shot-specific composition and lighting third. Preserve character identity, face shape, hair silhouette, costume logic, and restrained expression range across the full film.
```

**Negative / Avoid**:
```text
identity drift, changed hairstyle, changed face, changed costume colors, extra main characters, villain-like Nozomi, melodramatic crying, exaggerated acting, warped hands, unreadable important props, random text, logo, watermark, vertical text
```

---

### Shot 007

**Source**: `deliverables/30_breakdown/03_storyboard_v2.md`, Shot 007  
**Section**: Prologue / airport present and Walkman transition  
**Source beat**: **Beat 4 | 特写 | 微距俯视 | 3秒**  
**Platform**: image reference-bound generation  
**Mode**: single final-frame keyframe  
**Output target**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_007_ref_v1.png`

**reference_images**:
- `deliverables/20_guides/refs/nozomi_reference.png` as Nozomi adult identity adaptation reference

**reference_roles**:
- Nozomi adult identity adaptation reference: Use Nozomi school reference only for face, freckles, hairline, and identity continuity; adapt age, coat, gray scarf, white headphones, and adult airport styling from the asset guide.

**identity_lock**:
- Nozomi adult identity adaptation reference: Use Nozomi school reference only for face, freckles, hairline, and identity continuity; adapt age, coat, gray scarf, white headphones, and adult airport styling from the asset guide.

**reference_limitations**:
- Adult Nozomi does not yet have a dedicated adult reference image; use the Nozomi reference only for identity continuity and follow the asset guide for adult styling.
- Do not let airport adult styling change Nozomi into a different person.

**Prompt**:
```text
Use the loaded reference images exactly as labeled above. Extreme close-up overhead shot of smartphone screen in woman's hands, music player interface displayed, song title "Gone by Ofelia K" clearly visible on screen, woman's lap slightly visible, airplane interior background blur, cool blue lighting, shallow depth of field, digital device detail, narrative symbol, cinematic macro photography --ar 16:9 --v 6 --style raw --s 150
Reference priority: identity reference images first, asset-guide DNA second, shot-specific composition and lighting third. Preserve character identity, face shape, hair silhouette, costume logic, and restrained expression range across the full film.
```

**Negative / Avoid**:
```text
identity drift, changed hairstyle, changed face, changed costume colors, extra main characters, villain-like Nozomi, melodramatic crying, exaggerated acting, warped hands, unreadable important props, random text, logo, watermark, vertical text
```

---

### Shot 008

**Source**: `deliverables/30_breakdown/03_storyboard_v2.md`, Shot 008  
**Section**: Prologue / airport present and Walkman transition  
**Source beat**: **Beat 5 | 极特写 | 固定 | 3秒**  
**Platform**: image reference-bound generation  
**Mode**: single final-frame keyframe  
**Output target**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_008_ref_v1.png`

**reference_images**:
- none; environment, prop, or crowd shot without named-character identity anchor

**reference_roles**:
- no named-character reference required; preserve composition and prop design from the prompt

**identity_lock**:
- no named-character reference required; preserve composition and prop design from the prompt

**reference_limitations**:
- No character identity reference is required for this shot.

**Prompt**:
```text
Use the loaded reference images exactly as labeled above. Extreme close-up of vintage Sony Walkman cassette player, silver metallic body, visible cassette tape slowly rotating through window, subtle mechanical sound texture, early 2000s nostalgia, contrast with modern iPhone, warm orange-brown tint on device, transition element between time periods, macro photography, shallow depth of field, film grain --ar 16:9 --v 6 --style raw --s 250
Reference priority: identity reference images first, asset-guide DNA second, shot-specific composition and lighting third. Preserve character identity, face shape, hair silhouette, costume logic, and restrained expression range across the full film.
```

**Negative / Avoid**:
```text
identity drift, changed hairstyle, changed face, changed costume colors, extra main characters, villain-like Nozomi, melodramatic crying, exaggerated acting, warped hands, unreadable important props, random text, logo, watermark, vertical text
```

---

### Shot 009

**Source**: `deliverables/30_breakdown/03_storyboard_v2.md`, Shot 009  
**Section**: Prologue / airport present and Walkman transition  
**Source beat**: **Beat 5-6 | 全景 | 缓慢后拉 | 5秒**  
**Platform**: image reference-bound generation  
**Mode**: single final-frame keyframe  
**Output target**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_009_ref_v1.png`

**reference_images**:
- `deliverables/20_guides/refs/mizore_reference.png` as Mizore identity reference

**reference_roles**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.

**identity_lock**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.

**reference_limitations**:
- Reference images define identity; prompt text defines shot-specific action, costume state, lighting, and setting.

**Prompt**:
```text
Use the loaded reference images exactly as labeled above. Wide shot slowly pulling back, Japanese high school girl with long straight black hair and blunt bangs resting by classroom window, head pillowed on her arms, eyes closed, breathing evenly, wearing white sailor uniform with light blue trim, snow falling silently outside accumulating on window frame, single streak of cold light falling on her hair, like a specimen frozen in time, dimly lit empty classroom, melancholic isolation, contrast with airport scene, cool blue tones, dolly out movement, cinematic composition, film grain texture --ar 16:9 --v 6 --style raw --s 300
Reference priority: identity reference images first, asset-guide DNA second, shot-specific composition and lighting third. Preserve character identity, face shape, hair silhouette, costume logic, and restrained expression range across the full film.
```

**Negative / Avoid**:
```text
identity drift, changed hairstyle, changed face, changed costume colors, extra main characters, villain-like Nozomi, melodramatic crying, exaggerated acting, warped hands, unreadable important props, random text, logo, watermark, vertical text
```

---

### Shot 010

**Source**: `deliverables/30_breakdown/03_storyboard_v2.md`, Shot 010  
**Section**: Act 1 / school announcement and withdrawal  
**Source beat**: **Beat 7 | 中景 | 固定平视 | 4秒**  
**Platform**: image reference-bound generation  
**Mode**: single final-frame keyframe  
**Output target**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_010_ref_v1.png`

**reference_images**:
- none; environment, prop, or crowd shot without named-character identity anchor

**reference_roles**:
- no named-character reference required; preserve composition and prop design from the prompt

**identity_lock**:
- no named-character reference required; preserve composition and prop design from the prompt

**reference_limitations**:
- No character identity reference is required for this shot.

**Prompt**:
```text
Use the loaded reference images exactly as labeled above. Japanese high school classroom interior, teacher standing at podium making announcement, students seated at desks reacting naturally, some nodding some whispering, warm natural daylight through windows, typical school day atmosphere, focus on teacher speaking, Japanese classroom details, warm tones 3800K transitioning cooler, slice of life documentary style, cinematic framing --ar 16:9 --v 6 --style raw --s 200
Reference priority: identity reference images first, asset-guide DNA second, shot-specific composition and lighting third. Preserve character identity, face shape, hair silhouette, costume logic, and restrained expression range across the full film.
```

**Negative / Avoid**:
```text
identity drift, changed hairstyle, changed face, changed costume colors, extra main characters, villain-like Nozomi, melodramatic crying, exaggerated acting, warped hands, unreadable important props, random text, logo, watermark, vertical text
```

---

### Shot 011

**Source**: `deliverables/30_breakdown/03_storyboard_v2.md`, Shot 011  
**Section**: Act 1 / school announcement and withdrawal  
**Source beat**: **Beat 7 | 特写 | 固定 | 3秒**  
**Platform**: image reference-bound generation  
**Mode**: single final-frame keyframe  
**Output target**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_011_ref_v1.png`

**reference_images**:
- `deliverables/20_guides/refs/mizore_reference.png` as Mizore identity reference

**reference_roles**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.

**identity_lock**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.

**reference_limitations**:
- Reference images define identity; prompt text defines shot-specific action, costume state, lighting, and setting.

**Prompt**:
```text
Use the loaded reference images exactly as labeled above. Close-up of Japanese high school girl's face, long straight black hair with blunt bangs, hazel gray eyes, moment of shock freezing on face, restrained stunned expression, hand unconsciously gripping pen tightly, pale complexion, controlled internal reaction, shallow depth of field on eyes, warm light shifting cooler, emotional weight, subtle acting, cinematic portrait --ar 16:9 --v 6 --style raw --s 250
Reference priority: identity reference images first, asset-guide DNA second, shot-specific composition and lighting third. Preserve character identity, face shape, hair silhouette, costume logic, and restrained expression range across the full film.
```

**Negative / Avoid**:
```text
identity drift, changed hairstyle, changed face, changed costume colors, extra main characters, villain-like Nozomi, melodramatic crying, exaggerated acting, warped hands, unreadable important props, random text, logo, watermark, vertical text
```

---

### Shot 012

**Source**: `deliverables/30_breakdown/03_storyboard_v2.md`, Shot 012  
**Section**: Act 1 / school announcement and withdrawal  
**Source beat**: **Beat 8 | 中景 | 主观镜头 | 2秒**  
**Platform**: image reference-bound generation  
**Mode**: single final-frame keyframe  
**Output target**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_012_ref_v1.png`

**reference_images**:
- `deliverables/20_guides/refs/nozomi_reference.png` as Nozomi school identity reference

**reference_roles**:
- Nozomi school identity reference: Preserve Nozomi warm face, light freckles, bright but restrained expression range, high ponytail, wispy bangs, and teal-bow sailor uniform when in school scenes.

**identity_lock**:
- Nozomi school identity reference: Preserve Nozomi warm face, light freckles, bright but restrained expression range, high ponytail, wispy bangs, and teal-bow sailor uniform when in school scenes.

**reference_limitations**:
- Reference images define identity; prompt text defines shot-specific action, costume state, lighting, and setting.

**Prompt**:
```text
Use the loaded reference images exactly as labeled above. POV shot from seated student perspective looking across classroom at another desk, either empty seat or girl with high ponytail busy packing belongings not looking back, sense of searching for connection and finding none, classroom interior with other students, natural school lighting, feeling of disconnection, subjective camera, soft focus edges, transitional cool tones --ar 16:9 --v 6 --style raw --s 150
Reference priority: identity reference images first, asset-guide DNA second, shot-specific composition and lighting third. Preserve character identity, face shape, hair silhouette, costume logic, and restrained expression range across the full film.
```

**Negative / Avoid**:
```text
identity drift, changed hairstyle, changed face, changed costume colors, extra main characters, villain-like Nozomi, melodramatic crying, exaggerated acting, warped hands, unreadable important props, random text, logo, watermark, vertical text
```

---

### Shot 013

**Source**: `deliverables/30_breakdown/03_storyboard_v2.md`, Shot 013  
**Section**: Act 1 / school announcement and withdrawal  
**Source beat**: **Beat 9 | 特写 | 俯视微距 | 4秒**  
**Platform**: image reference-bound generation  
**Mode**: single final-frame keyframe  
**Output target**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_013_ref_v1.png`

**reference_images**:
- `deliverables/20_guides/refs/mizore_reference.png` as Mizore identity reference

**reference_roles**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.

**identity_lock**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.

**reference_limitations**:
- Reference images define identity; prompt text defines shot-specific action, costume state, lighting, and setting.

**Prompt**:
```text
Use the loaded reference images exactly as labeled above. Overhead close-up of smartphone screen showing messaging app, Japanese text being typed "烟火那天你会来吗？" (Will you come to the fireworks that day?), finger hovering over send button, then entire message being deleted, hesitation and retreat captured, cool blue phone screen light, emotional weight of unsent message, subtle finger movement, intimate documentary style --ar 16:9 --v 6 --style raw --s 200
Reference priority: identity reference images first, asset-guide DNA second, shot-specific composition and lighting third. Preserve character identity, face shape, hair silhouette, costume logic, and restrained expression range across the full film.
```

**Negative / Avoid**:
```text
identity drift, changed hairstyle, changed face, changed costume colors, extra main characters, villain-like Nozomi, melodramatic crying, exaggerated acting, warped hands, unreadable important props, random text, logo, watermark, vertical text
```

---

### Shot 014

**Source**: `deliverables/30_breakdown/03_storyboard_v2.md`, Shot 014  
**Section**: Act 1 / school announcement and withdrawal  
**Source beat**: **Beat 10 | 特写 | 固定 | 3秒**  
**Platform**: image reference-bound generation  
**Mode**: single final-frame keyframe  
**Output target**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_014_ref_v1.png`

**reference_images**:
- `deliverables/20_guides/refs/mizore_reference.png` as Mizore identity reference

**reference_roles**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.

**identity_lock**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.

**reference_limitations**:
- Reference images define identity; prompt text defines shot-specific action, costume state, lighting, and setting.

**Prompt**:
```text
Use the loaded reference images exactly as labeled above. Close-up of hands pulling folded paper from school bag compartment, A4 white form paper - Japanese career survey form, blank unfilled, multiple visible fold creases on edges showing repeated handling, paper texture detail, sense of avoidance and directionlessness, shallow depth of field, cool lighting, documentary intimacy --ar 16:9 --v 6 --style raw --s 150
Reference priority: identity reference images first, asset-guide DNA second, shot-specific composition and lighting third. Preserve character identity, face shape, hair silhouette, costume logic, and restrained expression range across the full film.
```

**Negative / Avoid**:
```text
identity drift, changed hairstyle, changed face, changed costume colors, extra main characters, villain-like Nozomi, melodramatic crying, exaggerated acting, warped hands, unreadable important props, random text, logo, watermark, vertical text
```

---

### Shot 015

**Source**: `deliverables/30_breakdown/03_storyboard_v2.md`, Shot 015  
**Section**: Act 1 / school announcement and withdrawal  
**Source beat**: **Beat 10 | 中景 | 固定 | 2秒**  
**Platform**: image reference-bound generation  
**Mode**: single final-frame keyframe  
**Output target**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_015_ref_v1.png`

**reference_images**:
- `deliverables/20_guides/refs/mizore_reference.png` as Mizore identity reference

**reference_roles**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.

**identity_lock**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.

**reference_limitations**:
- Reference images define identity; prompt text defines shot-specific action, costume state, lighting, and setting.

**Prompt**:
```text
Use the loaded reference images exactly as labeled above. Japanese high school girl with long straight black hair, hazel gray eyes, wearing sailor uniform, sitting at classroom desk, pushing folded paper back deep into school bag, avoidance body language, choosing not to face the future, classroom background soft focus, natural light shifting cooler, restrained emotion, slice of life framing --ar 16:9 --v 6 --style raw --s 200
Reference priority: identity reference images first, asset-guide DNA second, shot-specific composition and lighting third. Preserve character identity, face shape, hair silhouette, costume logic, and restrained expression range across the full film.
```

**Negative / Avoid**:
```text
identity drift, changed hairstyle, changed face, changed costume colors, extra main characters, villain-like Nozomi, melodramatic crying, exaggerated acting, warped hands, unreadable important props, random text, logo, watermark, vertical text
```

---

### Shot 016

**Source**: `deliverables/30_breakdown/03_storyboard_v2.md`, Shot 016  
**Section**: Act 1 / school announcement and withdrawal  
**Source beat**: **Beat 11 | 全景 | 跟拍 | 4秒**  
**Platform**: image reference-bound generation  
**Mode**: single final-frame keyframe  
**Output target**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_016_ref_v1.png`

**reference_images**:
- `deliverables/20_guides/refs/mizore_reference.png` as Mizore identity reference
- `deliverables/20_guides/refs/nozomi_reference.png` as Nozomi school identity reference

**reference_roles**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.
- Nozomi school identity reference: Preserve Nozomi warm face, light freckles, bright but restrained expression range, high ponytail, wispy bangs, and teal-bow sailor uniform when in school scenes.

**identity_lock**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.
- Nozomi school identity reference: Preserve Nozomi warm face, light freckles, bright but restrained expression range, high ponytail, wispy bangs, and teal-bow sailor uniform when in school scenes.

**reference_limitations**:
- Reference images define identity; prompt text defines shot-specific action, costume state, lighting, and setting.

**Prompt**:
```text
Use the loaded reference images exactly as labeled above. Wide shot of Japanese high school corridor, girl with long straight black hair trying to catch up with girl with high ponytail ahead, ponytail girl being stopped by teacher or surrounded by classmates, long-hair girl stopping in place as stream of students flows past her, physical distance symbolizing emotional distance, natural school lighting, sense of isolation in crowd, tracking shot feeling, cinematic composition --ar 16:9 --v 6 --style raw --s 250
Reference priority: identity reference images first, asset-guide DNA second, shot-specific composition and lighting third. Preserve character identity, face shape, hair silhouette, costume logic, and restrained expression range across the full film.
```

**Negative / Avoid**:
```text
identity drift, changed hairstyle, changed face, changed costume colors, extra main characters, villain-like Nozomi, melodramatic crying, exaggerated acting, warped hands, unreadable important props, random text, logo, watermark, vertical text
```

---

### Shot 017

**Source**: `deliverables/30_breakdown/03_storyboard_v2.md`, Shot 017  
**Section**: Act 1 / school announcement and withdrawal  
**Source beat**: **Beat 12 | 中景 | 跟拍 | 3秒**  
**Platform**: image reference-bound generation  
**Mode**: single final-frame keyframe  
**Output target**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_017_ref_v1.png`

**reference_images**:
- `deliverables/20_guides/refs/mizore_reference.png` as Mizore identity reference
- `deliverables/20_guides/refs/nozomi_reference.png` as Nozomi school identity reference

**reference_roles**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.
- Nozomi school identity reference: Preserve Nozomi warm face, light freckles, bright but restrained expression range, high ponytail, wispy bangs, and teal-bow sailor uniform when in school scenes.

**identity_lock**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.
- Nozomi school identity reference: Preserve Nozomi warm face, light freckles, bright but restrained expression range, high ponytail, wispy bangs, and teal-bow sailor uniform when in school scenes.

**reference_limitations**:
- Reference images define identity; prompt text defines shot-specific action, costume state, lighting, and setting.

**Prompt**:
```text
Use the loaded reference images exactly as labeled above. Two Japanese high school girls walking in corridor, girl with high ponytail in foreground walking ahead, girl with long straight black hair and blunt bangs half-step behind, long-hair girl's lips slightly moving as if about to speak but no words come out, ponytail girl continues forward without looking back, unspoken words swallowed, communication failure, depth composition, cool lighting, emotional tension --ar 16:9 --v 6 --style raw --s 200
Reference priority: identity reference images first, asset-guide DNA second, shot-specific composition and lighting third. Preserve character identity, face shape, hair silhouette, costume logic, and restrained expression range across the full film.
```

**Negative / Avoid**:
```text
identity drift, changed hairstyle, changed face, changed costume colors, extra main characters, villain-like Nozomi, melodramatic crying, exaggerated acting, warped hands, unreadable important props, random text, logo, watermark, vertical text
```

---

### Shot 018

**Source**: `deliverables/30_breakdown/03_storyboard_v2.md`, Shot 018  
**Section**: Act 1 / school announcement and withdrawal  
**Source beat**: **Beat 13 | 中景 | 固定 | 3秒**  
**Platform**: image reference-bound generation  
**Mode**: single final-frame keyframe  
**Output target**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_018_ref_v1.png`

**reference_images**:
- `deliverables/20_guides/refs/mizore_reference.png` as Mizore identity reference

**reference_roles**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.

**identity_lock**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.

**reference_limitations**:
- Reference images define identity; prompt text defines shot-specific action, costume state, lighting, and setting.

**Prompt**:
```text
Use the loaded reference images exactly as labeled above. Japanese high school girl with long straight black hair and blunt bangs returning to classroom seat, pushing wired earbuds deeper into ears, wearing sailor uniform, vintage silver Walkman visible, escape mechanism activating, self-isolation gesture, natural school lighting transitioning cool, sense of withdrawal, slice of life composition --ar 16:9 --v 6 --style raw --s 200
Reference priority: identity reference images first, asset-guide DNA second, shot-specific composition and lighting third. Preserve character identity, face shape, hair silhouette, costume logic, and restrained expression range across the full film.
```

**Negative / Avoid**:
```text
identity drift, changed hairstyle, changed face, changed costume colors, extra main characters, villain-like Nozomi, melodramatic crying, exaggerated acting, warped hands, unreadable important props, random text, logo, watermark, vertical text
```

---

### Shot 019

**Source**: `deliverables/30_breakdown/03_storyboard_v2.md`, Shot 019  
**Section**: Act 1 / school announcement and withdrawal  
**Source beat**: **Beat 13 | 特写 | 固定 | 2秒**  
**Platform**: image reference-bound generation  
**Mode**: single final-frame keyframe  
**Output target**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_019_ref_v1.png`

**reference_images**:
- `deliverables/20_guides/refs/mizore_reference.png` as Mizore identity reference

**reference_roles**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.

**identity_lock**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.

**reference_limitations**:
- Reference images define identity; prompt text defines shot-specific action, costume state, lighting, and setting.

**Prompt**:
```text
Use the loaded reference images exactly as labeled above. Close-up of finger pressing play button on vintage Sony Walkman cassette player, silver metallic body, visible tape starting to rotate, sound wave ripple effect emanating in soft colors transitioning from cool to warm, visual transition element, entering memory sequence, macro detail, shallow depth of field, music as narrative device --ar 16:9 --v 6 --style raw --s 250
Reference priority: identity reference images first, asset-guide DNA second, shot-specific composition and lighting third. Preserve character identity, face shape, hair silhouette, costume logic, and restrained expression range across the full film.
```

**Negative / Avoid**:
```text
identity drift, changed hairstyle, changed face, changed costume colors, extra main characters, villain-like Nozomi, melodramatic crying, exaggerated acting, warped hands, unreadable important props, random text, logo, watermark, vertical text
```

---

### Shot 020

**Source**: `deliverables/30_breakdown/03_storyboard_v2.md`, Shot 020  
**Section**: Act 2 / warm memory and promise mismatch  
**Source beat**: **Beat 14 | 全景 | 固定 | 3秒**  
**Platform**: image reference-bound generation  
**Mode**: single final-frame keyframe  
**Output target**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_020_ref_v1.png`

**reference_images**:
- `deliverables/20_guides/refs/mizore_reference.png` as Mizore identity reference
- `deliverables/20_guides/refs/nozomi_reference.png` as Nozomi school identity reference

**reference_roles**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.
- Nozomi school identity reference: Preserve Nozomi warm face, light freckles, bright but restrained expression range, high ponytail, wispy bangs, and teal-bow sailor uniform when in school scenes.

**identity_lock**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.
- Nozomi school identity reference: Preserve Nozomi warm face, light freckles, bright but restrained expression range, high ponytail, wispy bangs, and teal-bow sailor uniform when in school scenes.

**reference_limitations**:
- Reference images define identity; prompt text defines shot-specific action, costume state, lighting, and setting.

**Prompt**:
```text
Use the loaded reference images exactly as labeled above. Wide shot of Japanese high school corridor with students, girl with black hair in high ponytail in foreground initiating conversation or extending hand first, girl with long straight black hair and blunt bangs in background following, establishing who leads the relationship, warm golden hour lighting 3200K, soft glow, nostalgic memory atmosphere, power dynamic established, cinematic composition --ar 16:9 --v 6 --style raw --s 300
Reference priority: identity reference images first, asset-guide DNA second, shot-specific composition and lighting third. Preserve character identity, face shape, hair silhouette, costume logic, and restrained expression range across the full film.
```

**Negative / Avoid**:
```text
identity drift, changed hairstyle, changed face, changed costume colors, extra main characters, villain-like Nozomi, melodramatic crying, exaggerated acting, warped hands, unreadable important props, random text, logo, watermark, vertical text
```

---

### Shot 021

**Source**: `deliverables/30_breakdown/03_storyboard_v2.md`, Shot 021  
**Section**: Act 2 / warm memory and promise mismatch  
**Source beat**: **Beat 15 | 中景 | 跟拍 | 5秒**  
**Platform**: image reference-bound generation  
**Mode**: single final-frame keyframe  
**Output target**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_021_ref_v1.png`

**reference_images**:
- `deliverables/20_guides/refs/mizore_reference.png` as Mizore identity reference
- `deliverables/20_guides/refs/nozomi_reference.png` as Nozomi school identity reference

**reference_roles**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.
- Nozomi school identity reference: Preserve Nozomi warm face, light freckles, bright but restrained expression range, high ponytail, wispy bangs, and teal-bow sailor uniform when in school scenes.

**identity_lock**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.
- Nozomi school identity reference: Preserve Nozomi warm face, light freckles, bright but restrained expression range, high ponytail, wispy bangs, and teal-bow sailor uniform when in school scenes.

**reference_limitations**:
- Reference images define identity; prompt text defines shot-specific action, costume state, lighting, and setting.

**Prompt**:
```text
Use the loaded reference images exactly as labeled above. Montage-style composition showing multiple scenes overlaid or rapid sequence, high ponytail girl always half-step ahead, long straight hair girl always half-step behind following, locations including school corridor street campus, consistent position relationship, warm golden lighting, dreamy nostalgic atmosphere, following pattern established, visual rhythm, cinematic tracking feel --ar 16:9 --v 6 --style raw --s 350
Reference priority: identity reference images first, asset-guide DNA second, shot-specific composition and lighting third. Preserve character identity, face shape, hair silhouette, costume logic, and restrained expression range across the full film.
```

**Negative / Avoid**:
```text
identity drift, changed hairstyle, changed face, changed costume colors, extra main characters, villain-like Nozomi, melodramatic crying, exaggerated acting, warped hands, unreadable important props, random text, logo, watermark, vertical text
```

---

### Shot 022

**Source**: `deliverables/30_breakdown/03_storyboard_v2.md`, Shot 022  
**Section**: Act 2 / warm memory and promise mismatch  
**Source beat**: **Beat 16 | 特写 | 固定 | 3秒**  
**Platform**: image reference-bound generation  
**Mode**: single final-frame keyframe  
**Output target**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_022_ref_v1.png`

**reference_images**:
- `deliverables/20_guides/refs/mizore_reference.png` as Mizore identity reference
- `deliverables/20_guides/refs/nozomi_reference.png` as Nozomi school identity reference

**reference_roles**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.
- Nozomi school identity reference: Preserve Nozomi warm face, light freckles, bright but restrained expression range, high ponytail, wispy bangs, and teal-bow sailor uniform when in school scenes.

**identity_lock**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.
- Nozomi school identity reference: Preserve Nozomi warm face, light freckles, bright but restrained expression range, high ponytail, wispy bangs, and teal-bow sailor uniform when in school scenes.

**reference_limitations**:
- Reference images define identity; prompt text defines shot-specific action, costume state, lighting, and setting.

**Prompt**:
```text
Use the loaded reference images exactly as labeled above. Close-up of two Japanese high school girls sharing wired earphones, one ear each, heads close together listening to same song, intimate connection symbol, high ponytail girl and long straight hair girl, warm soft lighting, shallow depth of field, earphone wire connecting them, tender moment, nostalgic atmosphere, golden hour glow --ar 16:9 --v 6 --style raw --s 300
Reference priority: identity reference images first, asset-guide DNA second, shot-specific composition and lighting third. Preserve character identity, face shape, hair silhouette, costume logic, and restrained expression range across the full film.
```

**Negative / Avoid**:
```text
identity drift, changed hairstyle, changed face, changed costume colors, extra main characters, villain-like Nozomi, melodramatic crying, exaggerated acting, warped hands, unreadable important props, random text, logo, watermark, vertical text
```

---

### Shot 023

**Source**: `deliverables/30_breakdown/03_storyboard_v2.md`, Shot 023  
**Section**: Act 2 / warm memory and promise mismatch  
**Source beat**: **Beat 16 | 中景 | 固定 | 5秒**  
**Platform**: image reference-bound generation  
**Mode**: single final-frame keyframe  
**Output target**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_023_ref_v1.png`

**reference_images**:
- `deliverables/20_guides/refs/mizore_reference.png` as Mizore identity reference
- `deliverables/20_guides/refs/nozomi_reference.png` as Nozomi school identity reference

**reference_roles**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.
- Nozomi school identity reference: Preserve Nozomi warm face, light freckles, bright but restrained expression range, high ponytail, wispy bangs, and teal-bow sailor uniform when in school scenes.

**identity_lock**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.
- Nozomi school identity reference: Preserve Nozomi warm face, light freckles, bright but restrained expression range, high ponytail, wispy bangs, and teal-bow sailor uniform when in school scenes.

**reference_limitations**:
- Reference images define identity; prompt text defines shot-specific action, costume state, lighting, and setting.

**Prompt**:
```text
Use the loaded reference images exactly as labeled above. Two Japanese high school girls, girl with long straight black hair and blunt bangs about to speak "Nozomi, after this...", girl with high ponytail's phone vibrating interrupting, ponytail girl checking screen gesturing to wait then removing earphone to take call, long-hair girl still wearing earphone unable to hear conversation watching ponytail girl's lips move and smile, core conflict moment interrupted communication, warm lighting contrasting emotional disconnect, priority revealed --ar 16:9 --v 6 --style raw --s 250
Reference priority: identity reference images first, asset-guide DNA second, shot-specific composition and lighting third. Preserve character identity, face shape, hair silhouette, costume logic, and restrained expression range across the full film.
```

**Negative / Avoid**:
```text
identity drift, changed hairstyle, changed face, changed costume colors, extra main characters, villain-like Nozomi, melodramatic crying, exaggerated acting, warped hands, unreadable important props, random text, logo, watermark, vertical text
```

---

### Shot 024

**Source**: `deliverables/30_breakdown/03_storyboard_v2.md`, Shot 024  
**Section**: Act 2 / warm memory and promise mismatch  
**Source beat**: **Beat 16 | 全景 | 固定 | 3秒**  
**Platform**: image reference-bound generation  
**Mode**: single final-frame keyframe  
**Output target**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_024_ref_v1.png`

**reference_images**:
- `deliverables/20_guides/refs/mizore_reference.png` as Mizore identity reference
- `deliverables/20_guides/refs/nozomi_reference.png` as Nozomi school identity reference

**reference_roles**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.
- Nozomi school identity reference: Preserve Nozomi warm face, light freckles, bright but restrained expression range, high ponytail, wispy bangs, and teal-bow sailor uniform when in school scenes.

**identity_lock**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.
- Nozomi school identity reference: Preserve Nozomi warm face, light freckles, bright but restrained expression range, high ponytail, wispy bangs, and teal-bow sailor uniform when in school scenes.

**reference_limitations**:
- Reference images define identity; prompt text defines shot-specific action, costume state, lighting, and setting.

**Prompt**:
```text
Use the loaded reference images exactly as labeled above. Wide shot of scene aftermath, girl with high ponytail already packing belongings saying "Sorry I have to go! Let's talk next time!", walking away quickly, girl with long straight black hair still sitting in place, words never finished, warm lighting but sense of being left behind, visual isolation, nostalgic but melancholic, unfinished conversation --ar 16:9 --v 6 --style raw --s 250
Reference priority: identity reference images first, asset-guide DNA second, shot-specific composition and lighting third. Preserve character identity, face shape, hair silhouette, costume logic, and restrained expression range across the full film.
```

**Negative / Avoid**:
```text
identity drift, changed hairstyle, changed face, changed costume colors, extra main characters, villain-like Nozomi, melodramatic crying, exaggerated acting, warped hands, unreadable important props, random text, logo, watermark, vertical text
```

---

### Shot 025

**Source**: `deliverables/30_breakdown/03_storyboard_v2.md`, Shot 025  
**Section**: Act 2 / warm memory and promise mismatch  
**Source beat**: **Beat 18 | 中景 | 固定 | 4秒**  
**Platform**: image reference-bound generation  
**Mode**: single final-frame keyframe  
**Output target**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_025_ref_v1.png`

**reference_images**:
- `deliverables/20_guides/refs/mizore_reference.png` as Mizore identity reference
- `deliverables/20_guides/refs/nozomi_reference.png` as Nozomi school identity reference

**reference_roles**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.
- Nozomi school identity reference: Preserve Nozomi warm face, light freckles, bright but restrained expression range, high ponytail, wispy bangs, and teal-bow sailor uniform when in school scenes.

**identity_lock**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.
- Nozomi school identity reference: Preserve Nozomi warm face, light freckles, bright but restrained expression range, high ponytail, wispy bangs, and teal-bow sailor uniform when in school scenes.

**reference_limitations**:
- Reference images define identity; prompt text defines shot-specific action, costume state, lighting, and setting.

**Prompt**:
```text
Use the loaded reference images exactly as labeled above. Japanese high school music practice room doorway, girl with high ponytail packing silver flute casually saying "Oh right, the summer fireworks festival, let's go together", eyes not looking at other person focusing on putting sheet music in bag, casual offhand invitation, girl with long straight black hair visible in background, warm afternoon light, music room interior, unequal weight of invitation --ar 16:9 --v 6 --style raw --s 200
Reference priority: identity reference images first, asset-guide DNA second, shot-specific composition and lighting third. Preserve character identity, face shape, hair silhouette, costume logic, and restrained expression range across the full film.
```

**Negative / Avoid**:
```text
identity drift, changed hairstyle, changed face, changed costume colors, extra main characters, villain-like Nozomi, melodramatic crying, exaggerated acting, warped hands, unreadable important props, random text, logo, watermark, vertical text
```

---

### Shot 026

**Source**: `deliverables/30_breakdown/03_storyboard_v2.md`, Shot 026  
**Section**: Act 2 / warm memory and promise mismatch  
**Source beat**: **Beat 18 | 特写 | 固定 | 2秒**  
**Platform**: image reference-bound generation  
**Mode**: single final-frame keyframe  
**Output target**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_026_ref_v1.png`

**reference_images**:
- `deliverables/20_guides/refs/mizore_reference.png` as Mizore identity reference

**reference_roles**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.

**identity_lock**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.

**reference_limitations**:
- Reference images define identity; prompt text defines shot-specific action, costume state, lighting, and setting.

**Prompt**:
```text
Use the loaded reference images exactly as labeled above. Close-up of Japanese high school girl's face, long straight black hair with blunt bangs, hazel gray eyes, moment of pause then solemn serious nod, saying "Okay" with earnest weight, her seriousness contrasting with the casual invitation just received, warm soft lighting, shallow depth of field, subtle but significant expression, emotional investment --ar 16:9 --v 6 --style raw --s 250
Reference priority: identity reference images first, asset-guide DNA second, shot-specific composition and lighting third. Preserve character identity, face shape, hair silhouette, costume logic, and restrained expression range across the full film.
```

**Negative / Avoid**:
```text
identity drift, changed hairstyle, changed face, changed costume colors, extra main characters, villain-like Nozomi, melodramatic crying, exaggerated acting, warped hands, unreadable important props, random text, logo, watermark, vertical text
```

---

### Shot 027

**Source**: `deliverables/30_breakdown/03_storyboard_v2.md`, Shot 027  
**Section**: Act 2 / warm memory and promise mismatch  
**Source beat**: **Beat 18 | 全景 | 固定 | 3秒**  
**Platform**: image reference-bound generation  
**Mode**: single final-frame keyframe  
**Output target**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_027_ref_v1.png`

**reference_images**:
- `deliverables/20_guides/refs/mizore_reference.png` as Mizore identity reference
- `deliverables/20_guides/refs/nozomi_reference.png` as Nozomi school identity reference

**reference_roles**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.
- Nozomi school identity reference: Preserve Nozomi warm face, light freckles, bright but restrained expression range, high ponytail, wispy bangs, and teal-bow sailor uniform when in school scenes.

**identity_lock**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.
- Nozomi school identity reference: Preserve Nozomi warm face, light freckles, bright but restrained expression range, high ponytail, wispy bangs, and teal-bow sailor uniform when in school scenes.

**reference_limitations**:
- Reference images define identity; prompt text defines shot-specific action, costume state, lighting, and setting.

**Prompt**:
```text
Use the loaded reference images exactly as labeled above. Wide shot of Japanese high school music practice room, girl with high ponytail already heading to door with bag saying "We'll figure out details later - I have to go!", walking out quickly not looking back, girl with long straight black hair standing alone in practice room, pattern repeating being left behind again, warm afternoon light streaming through windows, isolation in warm space --ar 16:9 --v 6 --style raw --s 200
Reference priority: identity reference images first, asset-guide DNA second, shot-specific composition and lighting third. Preserve character identity, face shape, hair silhouette, costume logic, and restrained expression range across the full film.
```

**Negative / Avoid**:
```text
identity drift, changed hairstyle, changed face, changed costume colors, extra main characters, villain-like Nozomi, melodramatic crying, exaggerated acting, warped hands, unreadable important props, random text, logo, watermark, vertical text
```

---

### Shot 028

**Source**: `deliverables/30_breakdown/03_storyboard_v2.md`, Shot 028  
**Section**: Act 2 / warm memory and promise mismatch  
**Source beat**: **Beat 18 | 特写 | 微距俯视 | 4秒**  
**Platform**: image reference-bound generation  
**Mode**: single final-frame keyframe  
**Output target**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_028_ref_v1.png`

**reference_images**:
- `deliverables/20_guides/refs/mizore_reference.png` as Mizore identity reference

**reference_roles**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.

**identity_lock**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.

**reference_limitations**:
- Reference images define identity; prompt text defines shot-specific action, costume state, lighting, and setting.

**Prompt**:
```text
Use the loaded reference images exactly as labeled above. Overhead macro shot of smartphone calendar app, finger circling the fireworks festival date, then circling it again with another circle, treating casual words as serious promise, intimate detail shot, warm screen glow, shallow depth of field, emotional investment visible in simple action, weight imbalance captured --ar 16:9 --v 6 --style raw --s 200
Reference priority: identity reference images first, asset-guide DNA second, shot-specific composition and lighting third. Preserve character identity, face shape, hair silhouette, costume logic, and restrained expression range across the full film.
```

**Negative / Avoid**:
```text
identity drift, changed hairstyle, changed face, changed costume colors, extra main characters, villain-like Nozomi, melodramatic crying, exaggerated acting, warped hands, unreadable important props, random text, logo, watermark, vertical text
```

---

### Shot 029

**Source**: `deliverables/30_breakdown/03_storyboard_v2.md`, Shot 029  
**Section**: Act 2 / warm memory and promise mismatch  
**Source beat**: **Beat 20 | 中景 | 固定 | 3秒**  
**Platform**: image reference-bound generation  
**Mode**: single final-frame keyframe  
**Output target**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_029_ref_v1.png`

**reference_images**:
- `deliverables/20_guides/refs/mizore_reference.png` as Mizore identity reference
- `deliverables/20_guides/refs/nozomi_reference.png` as Nozomi school identity reference

**reference_roles**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.
- Nozomi school identity reference: Preserve Nozomi warm face, light freckles, bright but restrained expression range, high ponytail, wispy bangs, and teal-bow sailor uniform when in school scenes.

**identity_lock**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.
- Nozomi school identity reference: Preserve Nozomi warm face, light freckles, bright but restrained expression range, high ponytail, wispy bangs, and teal-bow sailor uniform when in school scenes.

**reference_limitations**:
- Reference images define identity; prompt text defines shot-specific action, costume state, lighting, and setting.

**Prompt**:
```text
Use the loaded reference images exactly as labeled above. Japanese high school corridor, girl with high ponytail walking ahead suddenly turning back to glance, the look more like polite confirmation than emotional waiting or care, but girl with long straight black hair and blunt bangs behind interprets it as "being seen", her lips curving into slight hopeful smile, misreading the moment, warm lighting beginning to shift cooler, beautiful memory ending point, false hope established --ar 16:9 --v 6 --style raw --s 250
Reference priority: identity reference images first, asset-guide DNA second, shot-specific composition and lighting third. Preserve character identity, face shape, hair silhouette, costume logic, and restrained expression range across the full film.
```

**Negative / Avoid**:
```text
identity drift, changed hairstyle, changed face, changed costume colors, extra main characters, villain-like Nozomi, melodramatic crying, exaggerated acting, warped hands, unreadable important props, random text, logo, watermark, vertical text
```

---

### Shot 030

**Source**: `deliverables/30_breakdown/03_storyboard_v2.md`, Shot 030  
**Section**: Act 3 / divergence, fireworks, realization  
**Source beat**: **Beat 21 | 特写 | 固定 | 4秒**  
**Platform**: image reference-bound generation  
**Mode**: single final-frame keyframe  
**Output target**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_030_ref_v1.png`

**reference_images**:
- none; environment, prop, or crowd shot without named-character identity anchor

**reference_roles**:
- no named-character reference required; preserve composition and prop design from the prompt

**identity_lock**:
- no named-character reference required; preserve composition and prop design from the prompt

**reference_limitations**:
- No character identity reference is required for this shot.

**Prompt**:
```text
Use the loaded reference images exactly as labeled above. Split screen or rapid cut montage of two schedule books, one showing increasingly packed schedule with club activities tutoring paperwork, other showing entries like "wait for Nozomi" "when Nozomi is free", time density contrast, cool and warm tones alternating, visual representation of diverging worlds, documentary intimate style, high contrast --ar 16:9 --v 6 --style raw --s 200
Reference priority: identity reference images first, asset-guide DNA second, shot-specific composition and lighting third. Preserve character identity, face shape, hair silhouette, costume logic, and restrained expression range across the full film.
```

**Negative / Avoid**:
```text
identity drift, changed hairstyle, changed face, changed costume colors, extra main characters, villain-like Nozomi, melodramatic crying, exaggerated acting, warped hands, unreadable important props, random text, logo, watermark, vertical text
```

---

### Shot 031

**Source**: `deliverables/30_breakdown/03_storyboard_v2.md`, Shot 031  
**Section**: Act 3 / divergence, fireworks, realization  
**Source beat**: **Beat 22 | 中景 | 固定 | 5秒**  
**Platform**: image reference-bound generation  
**Mode**: single final-frame keyframe  
**Output target**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_031_ref_v1.png`

**reference_images**:
- `deliverables/20_guides/refs/mizore_reference.png` as Mizore identity reference

**reference_roles**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.

**identity_lock**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.

**reference_limitations**:
- Reference images define identity; prompt text defines shot-specific action, costume state, lighting, and setting.

**Prompt**:
```text
Use the loaded reference images exactly as labeled above. Montage of Japanese high school girl with long straight black hair constantly adjusting her rhythm, arriving early at classroom waiting, staying late waiting to leave together, rearranging her practice and study time to fit into other person's gaps, watching her wristwatch frequently, increasing time anxiety, cool lighting, sense of accommodation and waiting, slice of life documentary --ar 16:9 --v 6 --style raw --s 200
Reference priority: identity reference images first, asset-guide DNA second, shot-specific composition and lighting third. Preserve character identity, face shape, hair silhouette, costume logic, and restrained expression range across the full film.
```

**Negative / Avoid**:
```text
identity drift, changed hairstyle, changed face, changed costume colors, extra main characters, villain-like Nozomi, melodramatic crying, exaggerated acting, warped hands, unreadable important props, random text, logo, watermark, vertical text
```

---

### Shot 032

**Source**: `deliverables/30_breakdown/03_storyboard_v2.md`, Shot 032  
**Section**: Act 3 / divergence, fireworks, realization  
**Source beat**: **Beat 23 | 全景 | 跟拍 | 4秒**  
**Platform**: image reference-bound generation  
**Mode**: single final-frame keyframe  
**Output target**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_032_ref_v1.png`

**reference_images**:
- `deliverables/20_guides/refs/mizore_reference.png` as Mizore identity reference
- `deliverables/20_guides/refs/nozomi_reference.png` as Nozomi school identity reference

**reference_roles**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.
- Nozomi school identity reference: Preserve Nozomi warm face, light freckles, bright but restrained expression range, high ponytail, wispy bangs, and teal-bow sailor uniform when in school scenes.

**identity_lock**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.
- Nozomi school identity reference: Preserve Nozomi warm face, light freckles, bright but restrained expression range, high ponytail, wispy bangs, and teal-bow sailor uniform when in school scenes.

**reference_limitations**:
- Reference images define identity; prompt text defines shot-specific action, costume state, lighting, and setting.

**Prompt**:
```text
Use the loaded reference images exactly as labeled above. Wide tracking shot of Japanese high school corridor or street, girl with high ponytail walking faster and faster, her back getting smaller in distance, girl with long straight black hair and blunt bangs trying to follow behind but gap widening, ponytail girl no longer turning back to check if other is keeping up, physical distance symbolizing emotional distance, chase failing, cool blue lighting, sense of losing pace --ar 16:9 --v 6 --style raw --s 250
Reference priority: identity reference images first, asset-guide DNA second, shot-specific composition and lighting third. Preserve character identity, face shape, hair silhouette, costume logic, and restrained expression range across the full film.
```

**Negative / Avoid**:
```text
identity drift, changed hairstyle, changed face, changed costume colors, extra main characters, villain-like Nozomi, melodramatic crying, exaggerated acting, warped hands, unreadable important props, random text, logo, watermark, vertical text
```

---

### Shot 033

**Source**: `deliverables/30_breakdown/03_storyboard_v2.md`, Shot 033  
**Section**: Act 3 / divergence, fireworks, realization  
**Source beat**: **Beat 24 | 特写 | 固定 | 3秒**  
**Platform**: image reference-bound generation  
**Mode**: single final-frame keyframe  
**Output target**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_033_ref_v1.png`

**reference_images**:
- `deliverables/20_guides/refs/mizore_reference.png` as Mizore identity reference

**reference_roles**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.

**identity_lock**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.

**reference_limitations**:
- Reference images define identity; prompt text defines shot-specific action, costume state, lighting, and setting.

**Prompt**:
```text
Use the loaded reference images exactly as labeled above. Close-up of hands writing fireworks festival time and location on paper, checking and rechecking details, anxious careful handwriting, girl with long straight black hair visible in soft focus, desk surface, natural cool lighting, sense of trying to hold onto something, documentary intimacy --ar 16:9 --v 6 --style raw --s 150
Reference priority: identity reference images first, asset-guide DNA second, shot-specific composition and lighting third. Preserve character identity, face shape, hair silhouette, costume logic, and restrained expression range across the full film.
```

**Negative / Avoid**:
```text
identity drift, changed hairstyle, changed face, changed costume colors, extra main characters, villain-like Nozomi, melodramatic crying, exaggerated acting, warped hands, unreadable important props, random text, logo, watermark, vertical text
```

---

### Shot 034

**Source**: `deliverables/30_breakdown/03_storyboard_v2.md`, Shot 034  
**Section**: Act 3 / divergence, fireworks, realization  
**Source beat**: **Beat 24 | 特写 | 微距俯视 | 4秒**  
**Platform**: image reference-bound generation  
**Mode**: single final-frame keyframe  
**Output target**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_034_ref_v1.png`

**reference_images**:
- `deliverables/20_guides/refs/mizore_reference.png` as Mizore identity reference

**reference_roles**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.

**identity_lock**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.

**reference_limitations**:
- Reference images define identity; prompt text defines shot-specific action, costume state, lighting, and setting.

**Prompt**:
```text
Use the loaded reference images exactly as labeled above. Overhead macro shot of smartphone messaging screen, fingers typing Japanese text "The fireworks day, still meeting at the agreed place?", deep breath moment then pressing send, message bubble flying out, breaking silence with proactive confirmation, cool blue phone light, intimate documentary style, emotional courage --ar 16:9 --v 6 --style raw --s 200
Reference priority: identity reference images first, asset-guide DNA second, shot-specific composition and lighting third. Preserve character identity, face shape, hair silhouette, costume logic, and restrained expression range across the full film.
```

**Negative / Avoid**:
```text
identity drift, changed hairstyle, changed face, changed costume colors, extra main characters, villain-like Nozomi, melodramatic crying, exaggerated acting, warped hands, unreadable important props, random text, logo, watermark, vertical text
```

---

### Shot 035

**Source**: `deliverables/30_breakdown/03_storyboard_v2.md`, Shot 035  
**Section**: Act 3 / divergence, fireworks, realization  
**Source beat**: **Beat 24 | 蒙太奇 | 多机位快切 | 3秒**  
**Platform**: image reference-bound generation  
**Mode**: single final-frame keyframe  
**Output target**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_035_ref_v1.png`

**reference_images**:
- `deliverables/20_guides/refs/mizore_reference.png` as Mizore identity reference

**reference_roles**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.

**identity_lock**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.

**reference_limitations**:
- Reference images define identity; prompt text defines shot-specific action, costume state, lighting, and setting.

**Prompt**:
```text
Use the loaded reference images exactly as labeled above. Rapid montage sequence of Japanese high school girl with long straight black hair checking phone repeatedly, during class checking phone, during meals checking phone, while walking checking phone, time passing in compressed cuts, waiting anxiety, no new messages, cool desaturated tones, documentary urgency --ar 16:9 --v 6 --style raw --s 200
Reference priority: identity reference images first, asset-guide DNA second, shot-specific composition and lighting third. Preserve character identity, face shape, hair silhouette, costume logic, and restrained expression range across the full film.
```

**Negative / Avoid**:
```text
identity drift, changed hairstyle, changed face, changed costume colors, extra main characters, villain-like Nozomi, melodramatic crying, exaggerated acting, warped hands, unreadable important props, random text, logo, watermark, vertical text
```

---

### Shot 036

**Source**: `deliverables/30_breakdown/03_storyboard_v2.md`, Shot 036  
**Section**: Act 3 / divergence, fireworks, realization  
**Source beat**: **Beat 24 | 特写 | 固定 | 3秒**  
**Platform**: image reference-bound generation  
**Mode**: single final-frame keyframe  
**Output target**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_036_ref_v1.png`

**reference_images**:
- `deliverables/20_guides/refs/mizore_reference.png` as Mizore identity reference

**reference_roles**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.

**identity_lock**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.

**reference_limitations**:
- Reference images define identity; prompt text defines shot-specific action, costume state, lighting, and setting.

**Prompt**:
```text
Use the loaded reference images exactly as labeled above. Close-up of phone screen lighting up with reply notification, message reading "Probably~ We'll see when it comes!" in Japanese, casual dismissive tone, then cut to girl's face with long straight black hair and blunt bangs, hazel gray eyes, attempting to smile but only slight twitch of lips, restrained disappointment, reaching into pocket touching Walkman, cool blue lighting, emotional deflation --ar 16:9 --v 6 --style raw --s 250
Reference priority: identity reference images first, asset-guide DNA second, shot-specific composition and lighting third. Preserve character identity, face shape, hair silhouette, costume logic, and restrained expression range across the full film.
```

**Negative / Avoid**:
```text
identity drift, changed hairstyle, changed face, changed costume colors, extra main characters, villain-like Nozomi, melodramatic crying, exaggerated acting, warped hands, unreadable important props, random text, logo, watermark, vertical text
```

---

### Shot 037

**Source**: `deliverables/30_breakdown/03_storyboard_v2.md`, Shot 037  
**Section**: Act 3 / divergence, fireworks, realization  
**Source beat**: **Beat 25 | 全景 | 固定 | 4秒**  
**Platform**: image reference-bound generation  
**Mode**: single final-frame keyframe  
**Output target**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_037_ref_v1.png`

**reference_images**:
- `deliverables/20_guides/refs/mizore_reference.png` as Mizore identity reference

**reference_roles**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.

**identity_lock**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.

**reference_limitations**:
- Reference images define identity; prompt text defines shot-specific action, costume state, lighting, and setting.

**Prompt**:
```text
Use the loaded reference images exactly as labeled above. Wide shot of Japanese summer fireworks festival venue at dusk, crowds gathering, paper lanterns and food stalls, couples friends families everywhere in pairs and groups, Japanese high school girl with long straight black hair standing alone in good viewing spot, isolation amid togetherness, warm stall lights contrasting her solitude, anticipation and loneliness --ar 16:9 --v 6 --style raw --s 300
Reference priority: identity reference images first, asset-guide DNA second, shot-specific composition and lighting third. Preserve character identity, face shape, hair silhouette, costume logic, and restrained expression range across the full film.
```

**Negative / Avoid**:
```text
identity drift, changed hairstyle, changed face, changed costume colors, extra main characters, villain-like Nozomi, melodramatic crying, exaggerated acting, warped hands, unreadable important props, random text, logo, watermark, vertical text
```

---

### Shot 038

**Source**: `deliverables/30_breakdown/03_storyboard_v2.md`, Shot 038  
**Section**: Act 3 / divergence, fireworks, realization  
**Source beat**: **Beat 25 | 特写 | 固定 | 3秒**  
**Platform**: image reference-bound generation  
**Mode**: single final-frame keyframe  
**Output target**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_038_ref_v1.png`

**reference_images**:
- `deliverables/20_guides/refs/mizore_reference.png` as Mizore identity reference

**reference_roles**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.

**identity_lock**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.

**reference_limitations**:
- Reference images define identity; prompt text defines shot-specific action, costume state, lighting, and setting.

**Prompt**:
```text
Use the loaded reference images exactly as labeled above. Close-up of hands checking smartphone with no new messages, then checking wristwatch, Japanese high school girl waiting, time passing, anticipation fading, warm ambient light from festival, intimate detail shot, shallow depth of field, growing anxiety --ar 16:9 --v 6 --style raw --s 200
Reference priority: identity reference images first, asset-guide DNA second, shot-specific composition and lighting third. Preserve character identity, face shape, hair silhouette, costume logic, and restrained expression range across the full film.
```

**Negative / Avoid**:
```text
identity drift, changed hairstyle, changed face, changed costume colors, extra main characters, villain-like Nozomi, melodramatic crying, exaggerated acting, warped hands, unreadable important props, random text, logo, watermark, vertical text
```

---

### Shot 039

**Source**: `deliverables/30_breakdown/03_storyboard_v2.md`, Shot 039  
**Section**: Act 3 / divergence, fireworks, realization  
**Source beat**: **Beat 25 | 中景 | 固定 | 4秒**  
**Platform**: image reference-bound generation  
**Mode**: single final-frame keyframe  
**Output target**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_039_ref_v1.png`

**reference_images**:
- `deliverables/20_guides/refs/mizore_reference.png` as Mizore identity reference

**reference_roles**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.

**identity_lock**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.

**reference_limitations**:
- Reference images define identity; prompt text defines shot-specific action, costume state, lighting, and setting.

**Prompt**:
```text
Use the loaded reference images exactly as labeled above. Japanese high school girl with long straight black hair and blunt bangs at fireworks festival, wearing sailor uniform, turning up volume on vintage silver Walkman, trying to fill waiting time with music, sky darkening, crowd growing around her, still alone, warm festival lights contrasting cool emotional state, wired earbuds in, music as escape mechanism, visual stillness amid movement --ar 16:9 --v 6 --style raw --s 250
Reference priority: identity reference images first, asset-guide DNA second, shot-specific composition and lighting third. Preserve character identity, face shape, hair silhouette, costume logic, and restrained expression range across the full film.
```

**Negative / Avoid**:
```text
identity drift, changed hairstyle, changed face, changed costume colors, extra main characters, villain-like Nozomi, melodramatic crying, exaggerated acting, warped hands, unreadable important props, random text, logo, watermark, vertical text
```

---

### Shot 040

**Source**: `deliverables/30_breakdown/03_storyboard_v2.md`, Shot 040  
**Section**: Act 3 / divergence, fireworks, realization  
**Source beat**: **Beat 26 | 全景 | 固定仰角 | 5秒**  
**Platform**: image reference-bound generation  
**Mode**: single final-frame keyframe  
**Output target**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_040_ref_v1.png`

**reference_images**:
- `deliverables/20_guides/refs/mizore_reference.png` as Mizore identity reference

**reference_roles**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.

**identity_lock**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.

**reference_limitations**:
- Reference images define identity; prompt text defines shot-specific action, costume state, lighting, and setting.

**Prompt**:
```text
Use the loaded reference images exactly as labeled above. Wide low angle shot of fireworks exploding in night sky, brilliant colors and patterns, below Japanese high school girl with long straight black hair still waiting, her face illuminated by firework light but expression empty hollow, beauty above contrasting emptiness within, crowds celebrating around her, dramatic lighting from explosions, high contrast, emotional climax approaching --ar 16:9 --v 6 --style raw --s 350
Reference priority: identity reference images first, asset-guide DNA second, shot-specific composition and lighting third. Preserve character identity, face shape, hair silhouette, costume logic, and restrained expression range across the full film.
```

**Negative / Avoid**:
```text
identity drift, changed hairstyle, changed face, changed costume colors, extra main characters, villain-like Nozomi, melodramatic crying, exaggerated acting, warped hands, unreadable important props, random text, logo, watermark, vertical text
```

---

### Shot 041

**Source**: `deliverables/30_breakdown/03_storyboard_v2.md`, Shot 041  
**Section**: Act 3 / divergence, fireworks, realization  
**Source beat**: **Beat 26 | 全景 | 固定 | 3秒**  
**Platform**: image reference-bound generation  
**Mode**: single final-frame keyframe  
**Output target**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_041_ref_v1.png`

**reference_images**:
- `deliverables/20_guides/refs/mizore_reference.png` as Mizore identity reference

**reference_roles**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.

**identity_lock**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.

**reference_limitations**:
- Reference images define identity; prompt text defines shot-specific action, costume state, lighting, and setting.

**Prompt**:
```text
Use the loaded reference images exactly as labeled above. Wide shot of fireworks festival aftermath, fireworks ended, crowds dispersing, Japanese high school girl with long straight black hair walking away alone, solitary figure from behind, emptying venue, warm lights fading, sense of unfulfilled waiting, quiet aftermath, melancholic resolution --ar 16:9 --v 6 --style raw --s 250
Reference priority: identity reference images first, asset-guide DNA second, shot-specific composition and lighting third. Preserve character identity, face shape, hair silhouette, costume logic, and restrained expression range across the full film.
```

**Negative / Avoid**:
```text
identity drift, changed hairstyle, changed face, changed costume colors, extra main characters, villain-like Nozomi, melodramatic crying, exaggerated acting, warped hands, unreadable important props, random text, logo, watermark, vertical text
```

---

### Shot 042

**Source**: `deliverables/30_breakdown/03_storyboard_v2.md`, Shot 042  
**Section**: Act 3 / divergence, fireworks, realization  
**Source beat**: **Beat 26 | 中景 | 固定 | 4秒**  
**Platform**: image reference-bound generation  
**Mode**: single final-frame keyframe  
**Output target**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_042_ref_v1.png`

**reference_images**:
- `deliverables/20_guides/refs/mizore_reference.png` as Mizore identity reference
- `deliverables/20_guides/refs/nozomi_reference.png` as Nozomi school identity reference

**reference_roles**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.
- Nozomi school identity reference: Preserve Nozomi warm face, light freckles, bright but restrained expression range, high ponytail, wispy bangs, and teal-bow sailor uniform when in school scenes.

**identity_lock**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.
- Nozomi school identity reference: Preserve Nozomi warm face, light freckles, bright but restrained expression range, high ponytail, wispy bangs, and teal-bow sailor uniform when in school scenes.

**reference_limitations**:
- Reference images define identity; prompt text defines shot-specific action, costume state, lighting, and setting.

**Prompt**:
```text
Use the loaded reference images exactly as labeled above. Japanese high school next day, girl with long straight black hair and blunt bangs overhearing conversation, girl with high ponytail telling other classmates "Something came up with family yesterday, couldn't notify everyone in time", casual explanation, long-hair girl's expression not angry but dawning understanding realization, not special just one of everyone, cool natural school lighting, priority becoming clear --ar 16:9 --v 6 --style raw --s 200
Reference priority: identity reference images first, asset-guide DNA second, shot-specific composition and lighting third. Preserve character identity, face shape, hair silhouette, costume logic, and restrained expression range across the full film.
```

**Negative / Avoid**:
```text
identity drift, changed hairstyle, changed face, changed costume colors, extra main characters, villain-like Nozomi, melodramatic crying, exaggerated acting, warped hands, unreadable important props, random text, logo, watermark, vertical text
```

---

### Shot 043

**Source**: `deliverables/30_breakdown/03_storyboard_v2.md`, Shot 043  
**Section**: Act 3 / divergence, fireworks, realization  
**Source beat**: **Beat 27 | 全景 | 跟拍 | 3秒**  
**Platform**: image reference-bound generation  
**Mode**: single final-frame keyframe  
**Output target**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_043_ref_v1.png`

**reference_images**:
- `deliverables/20_guides/refs/mizore_reference.png` as Mizore identity reference

**reference_roles**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.

**identity_lock**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.

**reference_limitations**:
- Reference images define identity; prompt text defines shot-specific action, costume state, lighting, and setting.

**Prompt**:
```text
Use the loaded reference images exactly as labeled above. Wide tracking shot of Japanese street after school, girl with long straight black hair walking home alone, isolated figure on quiet residential street, contemplative mood, cool blue evening light, sense of processing and accepting, solitary journey --ar 16:9 --v 6 --style raw --s 200
Reference priority: identity reference images first, asset-guide DNA second, shot-specific composition and lighting third. Preserve character identity, face shape, hair silhouette, costume logic, and restrained expression range across the full film.
```

**Negative / Avoid**:
```text
identity drift, changed hairstyle, changed face, changed costume colors, extra main characters, villain-like Nozomi, melodramatic crying, exaggerated acting, warped hands, unreadable important props, random text, logo, watermark, vertical text
```

---

### Shot 044

**Source**: `deliverables/30_breakdown/03_storyboard_v2.md`, Shot 044  
**Section**: Act 3 / divergence, fireworks, realization  
**Source beat**: **Beat 27 | 特写 | 固定 | 3秒**  
**Platform**: image reference-bound generation  
**Mode**: single final-frame keyframe  
**Output target**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_044_ref_v1.png`

**reference_images**:
- `deliverables/20_guides/refs/mizore_reference.png` as Mizore identity reference

**reference_roles**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.

**identity_lock**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.

**reference_limitations**:
- Reference images define identity; prompt text defines shot-specific action, costume state, lighting, and setting.

**Prompt**:
```text
Use the loaded reference images exactly as labeled above. Extreme close-up of vintage Sony Walkman cassette player, finger pressing stop button or opening compartment to eject cassette tape, physical deliberate disconnection action, no tears no dramatic crying just quiet physical severance, mechanical click of stop, symbolic break, shallow depth of field, cool blue lighting, restrained closure --ar 16:9 --v 6 --style raw --s 250
Reference priority: identity reference images first, asset-guide DNA second, shot-specific composition and lighting third. Preserve character identity, face shape, hair silhouette, costume logic, and restrained expression range across the full film.
```

**Negative / Avoid**:
```text
identity drift, changed hairstyle, changed face, changed costume colors, extra main characters, villain-like Nozomi, melodramatic crying, exaggerated acting, warped hands, unreadable important props, random text, logo, watermark, vertical text
```

---

### Shot 045

**Source**: `deliverables/30_breakdown/03_storyboard_v2.md`, Shot 045  
**Section**: Act 3 / divergence, fireworks, realization  
**Source beat**: **Beat 27.5 | 全景 | 固定 | 5秒**  
**Platform**: image reference-bound generation  
**Mode**: single final-frame keyframe  
**Output target**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_045_ref_v1.png`

**reference_images**:
- `deliverables/20_guides/refs/mizore_reference.png` as Mizore identity reference

**reference_roles**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.

**identity_lock**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.

**reference_limitations**:
- Reference images define identity; prompt text defines shot-specific action, costume state, lighting, and setting.

**Prompt**:
```text
Use the loaded reference images exactly as labeled above. Wide shot of Japanese girl's bedroom, evening light through window, girl with long straight black hair and blunt bangs sitting at desk, pulling crumpled career survey form from deep in school bag, spreading it on desk surface, paper showing multiple fold creases and worn corners, staring at blank form, fingers unconsciously tracing paper surface, silent digestion moment, transitioning to acceptance, cool transitioning to neutral lighting --ar 16:9 --v 6 --style raw --s 250
Reference priority: identity reference images first, asset-guide DNA second, shot-specific composition and lighting third. Preserve character identity, face shape, hair silhouette, costume logic, and restrained expression range across the full film.
```

**Negative / Avoid**:
```text
identity drift, changed hairstyle, changed face, changed costume colors, extra main characters, villain-like Nozomi, melodramatic crying, exaggerated acting, warped hands, unreadable important props, random text, logo, watermark, vertical text
```

---

### Shot 046

**Source**: `deliverables/30_breakdown/03_storyboard_v2.md`, Shot 046  
**Section**: Epilogue / agency and forward motion  
**Source beat**: **Beat 28-29 | 中景 | 固定 | 5秒**  
**Platform**: image reference-bound generation  
**Mode**: single final-frame keyframe  
**Output target**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_046_ref_v1.png`

**reference_images**:
- `deliverables/20_guides/refs/mizore_reference.png` as Mizore identity reference

**reference_roles**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.

**identity_lock**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.

**reference_limitations**:
- Reference images define identity; prompt text defines shot-specific action, costume state, lighting, and setting.

**Prompt**:
```text
Use the loaded reference images exactly as labeled above. Japanese high school girl with long straight black hair and blunt bangs sitting at desk by window, soft natural bright light flooding space, picking up wrinkled but blank career survey form, holding pen with tip hovering over first blank space, no more hesitation no more waiting, eyes determined and clear, self-agency awakening, high key lighting 6000K, clean bright atmosphere, decisive moment --ar 16:9 --v 6 --style raw --s 300
Reference priority: identity reference images first, asset-guide DNA second, shot-specific composition and lighting third. Preserve character identity, face shape, hair silhouette, costume logic, and restrained expression range across the full film.
```

**Negative / Avoid**:
```text
identity drift, changed hairstyle, changed face, changed costume colors, extra main characters, villain-like Nozomi, melodramatic crying, exaggerated acting, warped hands, unreadable important props, random text, logo, watermark, vertical text
```

---

### Shot 047

**Source**: `deliverables/30_breakdown/03_storyboard_v2.md`, Shot 047  
**Section**: Epilogue / agency and forward motion  
**Source beat**: **Beat 29-30 | 特写 | 微距俯视 | 4秒**  
**Platform**: image reference-bound generation  
**Mode**: single final-frame keyframe  
**Output target**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_047_ref_v1.png`

**reference_images**:
- `deliverables/20_guides/refs/mizore_reference.png` as Mizore identity reference

**reference_roles**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.

**identity_lock**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.

**reference_limitations**:
- Reference images define identity; prompt text defines shot-specific action, costume state, lighting, and setting.

**Prompt**:
```text
Use the loaded reference images exactly as labeled above. Overhead macro shot of pen tip touching paper and beginning to write, handwritten characters appearing in blank form spaces, specific content not important focus on action of filling in, writing completed without crossing out without hesitant rewriting, then hands neatly folding form and putting away with clean decisive movements, prop arc completed, self-determination established, bright clean lighting, documentary intimacy --ar 16:9 --v 6 --style raw --s 250
Reference priority: identity reference images first, asset-guide DNA second, shot-specific composition and lighting third. Preserve character identity, face shape, hair silhouette, costume logic, and restrained expression range across the full film.
```

**Negative / Avoid**:
```text
identity drift, changed hairstyle, changed face, changed costume colors, extra main characters, villain-like Nozomi, melodramatic crying, exaggerated acting, warped hands, unreadable important props, random text, logo, watermark, vertical text
```

---

### Shot 048

**Source**: `deliverables/30_breakdown/03_storyboard_v2.md`, Shot 048  
**Section**: Epilogue / agency and forward motion  
**Source beat**: **Beat 30 | 特写 | 固定 | 3秒**  
**Platform**: image reference-bound generation  
**Mode**: single final-frame keyframe  
**Output target**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_048_ref_v1.png`

**reference_images**:
- `deliverables/20_guides/refs/mizore_reference.png` as Mizore identity reference

**reference_roles**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.

**identity_lock**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.

**reference_limitations**:
- Reference images define identity; prompt text defines shot-specific action, costume state, lighting, and setting.

**Prompt**:
```text
Use the loaded reference images exactly as labeled above. Close-up of vintage Sony Walkman cassette player, finger pressing play button, visible tape beginning to rotate forward not rewinding to start but continuing from current position, moving forward not looking back, music resuming, structural callback to opening, warm mechanical glow, symbolic forward motion, hope in continuation --ar 16:9 --v 6 --style raw --s 250
Reference priority: identity reference images first, asset-guide DNA second, shot-specific composition and lighting third. Preserve character identity, face shape, hair silhouette, costume logic, and restrained expression range across the full film.
```

**Negative / Avoid**:
```text
identity drift, changed hairstyle, changed face, changed costume colors, extra main characters, villain-like Nozomi, melodramatic crying, exaggerated acting, warped hands, unreadable important props, random text, logo, watermark, vertical text
```

---

### Shot 049

**Source**: `deliverables/30_breakdown/03_storyboard_v2.md`, Shot 049  
**Section**: Epilogue / agency and forward motion  
**Source beat**: **Beat 30 | 全景 | 固定 | 8秒**  
**Platform**: image reference-bound generation  
**Mode**: single final-frame keyframe  
**Output target**: `deliverables/50_art/generated_ref_v1/art_keyframe_shot_049_ref_v1.png`

**reference_images**:
- `deliverables/20_guides/refs/mizore_reference.png` as Mizore identity reference

**reference_roles**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.

**identity_lock**:
- Mizore identity reference: Preserve Mizore face shape, blunt bangs, long straight black hair, pale complexion, quiet downturned-eye expression range, school uniform silhouette or scene-specific outfit adaptation.

**reference_limitations**:
- Reference images define identity; prompt text defines shot-specific action, costume state, lighting, and setting.

**Prompt**:
```text
Use the loaded reference images exactly as labeled above. Wide shot of Japanese high school girl with long straight black hair standing up from desk, gathering belongings, morning sunlight streaming in through window, or alternatively airport scene with airplane visible taking off through window, girl's back to camera facing window facing forward facing light, posture forward-looking, music playing to completion creating structural loop with opening, emotional resolution, warm bright high key lighting, gentle hopeful farewell, cinematic ending composition --ar 16:9 --v 6 --style raw --s 350
Reference priority: identity reference images first, asset-guide DNA second, shot-specific composition and lighting third. Preserve character identity, face shape, hair silhouette, costume logic, and restrained expression range across the full film.
```

**Negative / Avoid**:
```text
identity drift, changed hairstyle, changed face, changed costume colors, extra main characters, villain-like Nozomi, melodramatic crying, exaggerated acting, warped hands, unreadable important props, random text, logo, watermark, vertical text
```

---

## Version History

| Version | Date | Change |
| --- | --- | --- |
| v1 | 2026-01-26 | Initial 49 Midjourney prompts |
| v2 | 2026-05-02 | Full workflow rerun; text-only keyframe prompts |
| v3 | 2026-05-07 | Added reference image binding fields and output targets for formal keyframe regeneration |
