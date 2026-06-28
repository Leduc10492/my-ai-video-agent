# Seedance P389 Generation Manifest

- source_artifact: `deliverables/30_shotlist/scenes/scenes-078-085_096-098_v1/Shotlist_scenes-078-085_096-098_ZH_v1.html`
- prompt_id: `P389`
- source_storyboard: `deliverables/30_shotlist/03_shotlist_breakdown_v1.md`
- model: `seedance_2_0`
- job_id: `966bc3bd-345b-480b-8a0a-70f0bf9c506c`
- remote_result: `https://d8j0ntlcm91z4.cloudfront.net/user_35SYyjgKtm7acYkQJ747p6AiTXk/hf_20260531_133710_966bc3bd-345b-480b-8a0a-70f0bf9c506c.mp4`
- local_video: `p389_seedance_2_0_720p.mp4`
- submitted_prompt: `p389_prompt_submitted.txt`
- settings: `21:9`, `15s`, `720p`, `std`, `drama`
- estimated_cost: `67.5 credits`
- reference_mode: `text_dna_draft`
- output_check: `15.09s`, `1470x630`, `h264`, `aac`

## References

| Prompt tag | Local source | Higgsfield upload id | Role |
| --- | --- | --- | --- |
| `@Image 1` | `deliverables/20_assets/generated_ref_v1/nagi_bridge.png` | `9c4fe32a-2946-47e9-91f2-01f3e51a5b69` | bridge/checkpoint scene reference |
| `@Image 2` | `deliverables/20_assets/generated_ref_v1/daichi.png` | `280f88a6-6b19-475a-8e90-2cb7337acba3` | Daichi character reference |
| `@Image 3` | `deliverables/20_assets/generated_ref_v1/elders_cart.png` | `26f2d9a6-b973-465a-aeab-091b441046e3` | elders cart reference |
| `@Image 4` | `deliverables/20_assets/generated_ref_v1/police_officer.png` | `f6b3cd3e-4364-4094-a538-4e878c1d1aaf` | police officer reference |

## Notes

- The first local-path submission stalled after upload and was stopped before any new video job appeared.
- The successful submission reused the uploaded image IDs and created the job without `--wait`, then waited separately with `higgsfield generate wait`.
- The prompt was adapted from the current scene-native P389 by normalizing `@image1` style handles to Higgsfield-style `@Image 1` handles and adding a leading reference declaration so the CLI would not interpret the prompt as an `@file` input.
- The Higgsfield response records the attached media as `start_image` roles. Treat this output as a motion/blocking test, not a continuity-approved production asset.
- `p389_rewrite_shotlist_builder_style.txt` is a corrected replacement prompt after review. The original submitted prompt under-described the required action: Daichi pointing to the elders and indicating the uphill route. It also leaked later beats from P390/P391 into P389.
