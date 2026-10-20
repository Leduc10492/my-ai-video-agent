import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { createApp } from "../server/app.mjs";
import { command, registerFile } from "../server/media.mjs";
import { importStoryboard, templateRoot } from "../server/workflow.mjs";
import { assemble, validateTimeline } from "../server/timeline.mjs";
import { renderExport } from "../server/render.mjs";
import { id, atomic } from "../server/files.mjs";
const runId = new Date().toISOString().replaceAll(":", "-"),
  directory = path.resolve("test-results", runId),
  root = path.join(directory, "project");
fs.mkdirSync(root, { recursive: true });
fs.cpSync(path.join(templateRoot, ".agents"), path.join(root, ".agents"), {
  recursive: true,
});
const { app, stores, projects } = await createApp({
  dataDir: path.join(directory, "registry"),
  initialRoot: root,
  runWorker: false,
});
await app.listen({ host: "127.0.0.1", port: 0 });
const project = projects[0],
  store = stores.get(project.project_id),
  port = app.server.address().port;
try {
  store.meta("settings", { width: 320, height: 180, fps: 24 });
  const takes = [];
  for (const [index, frequency] of [440, 880].entries()) {
    const name = index ? "scene-001_P002" : "@char_Exact-Name_A",
      file = path.join(directory, name + ".mp4");
    await command("ffmpeg", [
      "-v",
      "error",
      "-f",
      "lavfi",
      "-i",
      "testsrc2=size=320x180:rate=24:duration=4",
      "-f",
      "lavfi",
      "-i",
      `sine=frequency=${frequency}:sample_rate=48000:duration=4`,
      "-c:v",
      "libx264",
      "-preset",
      "ultrafast",
      "-pix_fmt",
      "yuv420p",
      "-c:a",
      "aac",
      "-movflags",
      "+faststart",
      "-shortest",
      "-n",
      file,
    ]);
    takes.push(
      await registerFile(store, file, {
        scene: "scene-001",
        tag: index ? "" : "@My_Manual-TAG",
      }),
    );
  }
  const response = await fetch(
    `http://127.0.0.1:${port}/api/projects/${project.project_id}/media/${takes[0].take_id}`,
    { headers: { Range: "bytes=0-99", Origin: "http://127.0.0.1:9999" } },
  );
  assert.equal(response.status, 206);
  assert.equal((await response.arrayBuffer()).byteLength, 100);
  assert.equal(
    response.headers.get("access-control-allow-origin"),
    "http://127.0.0.1:9999",
  );
  for (const take of takes) {
    const a = store.get("asset", take.asset_name);
    store.put("asset", a.asset_name, { ...a, selected_take_id: take.take_id });
  }
  assert.equal(store.get("asset", "@char_Exact-Name_A").tag, "@My_Manual-TAG");
  importStoryboard(store, {
    envelopes: takes.map((t, i) => ({
      id: `P00${i + 1}`,
      scene: "scene-001",
      asset_name: t.asset_name,
      source_rows: [`R${i + 1}`],
      duration_seconds: 2,
      prompt: "Synthetic QA only",
    })),
  });
  const assembled = store.saveTimeline(
    assemble(store, project.project_id),
    0,
    "assembly",
  );
  const cut = structuredClone(assembled.project);
  cut.tracks[0].elements.forEach((e, i) => {
    e.s = i;
    e.e = i + 1;
    e.props.time = i ? 0.5 : 1;
  });
  const saved = store.saveTimeline(validateTimeline(store, cut), 1);
  assert.deepEqual(store.timeline(saved.revision).project, cut);
  const job = store.createJob(
    { kind: "render", revision: saved.revision },
    id(),
  );
  store.updateJob(job.job_id, { status: "running" });
  await renderExport(store, project.project_id, saved, job, port);
  const finished = store.get("job", job.job_id);
  assert.equal(finished.status, "completed");
  const output = path.join(root, finished.files.mp4);
  const analysis = JSON.parse(
    await command("ffprobe", [
      "-v",
      "error",
      "-show_streams",
      "-show_format",
      "-of",
      "json",
      output,
    ]),
  );
  const video = analysis.streams.find((s) => s.codec_type === "video"),
    audio = analysis.streams.find((s) => s.codec_type === "audio");
  assert.equal(video.r_frame_rate, "24/1");
  assert.equal(Number(video.nb_frames), 48);
  assert.ok(Math.abs(Number(audio.duration) - 2) < 0.05);
  // Inspect decoded audio independently: first half must be 440Hz, second 880Hz.
  const raw = path.join(directory, "audio.f32");
  await command("ffmpeg", [
    "-v",
    "error",
    "-i",
    output,
    "-ac",
    "1",
    "-ar",
    "48000",
    "-f",
    "f32le",
    "-n",
    raw,
  ]);
  const bytes = fs.readFileSync(raw),
    samples = new Float32Array(
      bytes.buffer,
      bytes.byteOffset,
      bytes.byteLength / 4,
    );
  const crossings = (start, end) => {
    let n = 0;
    for (let i = Math.floor(start * 48000) + 1; i < end * 48000; i++)
      if (samples[i - 1] <= 0 && samples[i] > 0) n++;
    return n / (end - start);
  };
  assert.ok(Math.abs(crossings(0.2, 0.8) - 440) < 5);
  assert.ok(Math.abs(crossings(1.2, 1.8) - 880) < 5);
  const report = {
    passed: true,
    scope: "synthetic local media; no external generation",
    directory,
    output,
    projectId: project.project_id,
    root,
    video: {
      width: video.width,
      height: video.height,
      fps: video.r_frame_rate,
      frames: video.nb_frames,
      duration: video.duration,
    },
    audio: {
      duration: audio.duration,
      first_half_hz: crossings(0.2, 0.8),
      second_half_hz: crossings(1.2, 1.8),
    },
    checks: [
      "exact filename + manual tag",
      "HTTP Range 206",
      "source in-points",
      "save and reopen",
      "24fps 48-frame export",
      "AAC audio duration and order",
    ],
  };
  atomic(path.join(directory, "report.json"), report);
  console.log(JSON.stringify(report, null, 2));
} finally {
  await app.close();
}
