import { test } from "node:test";
import assert from "node:assert/strict";
import { timelineForPreview, previewMediaUrl } from "../src/lib/timeline-media.ts";
import { bindTimeline } from "../server/timeline.mjs";

test("audio preview uses a stable absolute URL and preserves portable project data", () => {
  const source = "/api/projects/p/media/abc-123";
  const project = {
    tracks: [{ elements: [
      { id: "e-1", type: "audio", props: { src: source, time: 0 }, metadata: { take_id: "abc-123" } },
      { id: "e-2", type: "video", props: { src: source }, metadata: { take_id: "abc-123" } },
      { id: "e-3", type: "text", props: { text: "保留字幕" } },
    ] }],
  };
  const preview = timelineForPreview(project, "http://127.0.0.1:4310");
  const supplied = preview.tracks[0].elements[0].props.src;
  // HTMLMediaElement.src is URL-resolved even when assigned a relative path.
  const browserSrc = new URL(supplied, "http://127.0.0.1:4310").href;
  assert.equal(supplied, browserSrc);
  assert.equal(project.tracks[0].elements[0].props.src, source);
  assert.deepEqual(bindTimeline({ project: preview }, "p").project, project);
  assert.equal(timelineForPreview(project, "http://localhost:9999").tracks[0].elements[0].props.src,
    "http://localhost:9999" + source);
});

test("existing absolute media and non-media content remain unchanged", () => {
  for (const src of ["https://example.test/a.mp4", "blob:http://localhost/id", "data:image/png;base64,AA=="]) {
    assert.equal(previewMediaUrl(src, "http://localhost:4310"), src);
  }
  assert.deepEqual(timelineForPreview({ tracks: [{ elements: [] }] }, "http://localhost"),
    { tracks: [{ elements: [] }] });
});
