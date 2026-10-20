# Third-party components

- **Twick 0.15.31**: [upstream source](https://github.com/ncounterspecialist/twick/tree/3044c23e282b87c639c3f0b3fd5fb3fd972aa04c), [license](https://github.com/ncounterspecialist/twick/blob/3044c23e282b87c639c3f0b3fd5fb3fd972aa04c/LICENSE.md). This workbench is a personal local integration, not a hosted editor service. Upstream package notices remain in dependencies. Re-distribution / commercial hosting must follow Twick's license.
- **shadcn/ui patterns**, Radix UI, React, Vite, Fastify, Lucide, and supporting packages retain their upstream license files in the installed dependencies. The local UI uses the neutral color tokens and standard shadcn button/input/dialog patterns.

Local Twick adaptations:

1. `scripts/prepare-twick.mjs` generates a scoped CSS copy, removes remote font imports, constrains editor height, and uses neutral element colors. Remote demo libraries are not mounted. Timeline analytics and render telemetry are disabled.
2. The renderer uses Twick's `renderVideo`, the same engine used by `@twick/render-server`. A wrapper sets both visualizer preview and rendering fps; the unmodified render-server default retains 30fps internally in 0.15.31.
3. The final FFmpeg pass trims SDK tail frames to the canonical timeline length. The application verifies frame rate, full decode and audio/video duration before marking export complete.
4. `patches/fluent-ffmpeg@2.1.3.patch` adds support for the FFmpeg 8 `-formats` device column. It changes only the parser; it does not change media encoding.
5. Take metadata is retained independently of `ProjectJSON.assets`, which the SDK's editor currently drops. Split clips receive their own canonical clip ID at save time; take IDs stay stable.
