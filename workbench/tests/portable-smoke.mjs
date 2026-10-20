// Run against a disposable, complete copy of a published workspace.
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
import { EventEmitter } from "node:events";

const root = process.env.PORTABLE_WORKSPACE;
assert.ok(root && path.isAbsolute(root), "PORTABLE_WORKSPACE is required");
const appRoot = path.join(root, "00_工作流/工作台");
const runtime = path.join(appRoot, "runtime", `${process.platform}-${process.arch}`);
process.env.FFMPEG_PATH = path.join(runtime, "ffmpeg");
process.env.FFPROBE_PATH = path.join(runtime, "ffprobe");
process.env.TWICK_BROWSER = path.join(runtime, "browser/chrome-headless-shell");
process.env.PATH = `${runtime}${path.delimiter}${process.env.PATH || ""}`;
const module = name => import(pathToFileURL(path.join(appRoot, "workbench/server", `${name}.mjs`)));
const { createApp } = await module("app");
const { command, registerFile, digest } = await module("media");
const { importStoryboard, saveScript, scriptStatus } = await module("workflow");
const { assemble, validateTimeline } = await module("timeline");
const { renderExport } = await module("render");
const { contained, id, atomic, sha } = await module("files");
const { projectContext } = await module("workspace");
class OfflineClient extends EventEmitter {
  requests = new Map(); projectThreads = new Map();
  async request() { throw new Error("No AI call in portability smoke test"); }
  close() {}
}
const { app, projects, stores } = await createApp({ runWorker: false, codexClient: new OfflineClient() });
await app.listen({ host: "127.0.0.1", port: 0 });
const port = app.server.address().port, report = { relocated_root: root, external_generation: false };
try {
  const existing = projects[0];
  assert.ok(existing.root.startsWith(root + path.sep));
  const context = projectContext(existing);
  assert.equal(context.skills.filter(s => s.error).length, 0);
  const initial = scriptStatus(existing.root);
  assert.ok(initial.body.length);
  const original = stores.get(existing.project_id);
  let media = 0;
  for (const take of original.list("take")) {
    assert.equal(await digest(contained(existing.root, take.path)), take.sha256);
    const response = await fetch(`http://127.0.0.1:${port}/api/projects/${existing.project_id}/media/${take.take_id}`, { headers: { Range: "bytes=0-31" } });
    assert.equal(response.status, 206); await response.arrayBuffer(); media++;
  }
  report.existing_media_checked = media;
  report.saved_skills = context.skills.length;
  const created = await app.inject({ method: "POST", url: "/api/projects", headers: { "X-Workbench": "1" }, payload: { mode: "create", name: "目录与剪辑验证" } });
  assert.equal(created.statusCode, 200, created.body);
  const project = created.json();
  await app.inject({ method: "GET", url: `/api/projects/${project.project_id}` });
  const store = stores.get(project.project_id);
  const savedScript = saveScript(project.root, { body: "INT. 测试房间 - 日\n\n测试者\n保持原文。\n" });
  assert.equal(savedScript.state.working_script.path, "01_剧本/剧本/01_script_v1.md");
  assert.ok(projectContext(project).skills.every(s => !s.error));
  const skills = await app.inject({ method: "GET", url: `/api/projects/${project.project_id}/skills/settings` });
  assert.equal(skills.statusCode, 200, skills.body);
  assert.ok(skills.json().candidates.length >= 10);
  report.offline_skill_catalog = skills.json().candidates.length;
  store.meta("settings", { width: 320, height: 180, fps: 24 });
  const takes = [];
  for (const [index, frequency] of [440, 880].entries()) {
    const file = path.join(project.root, ".project", `source-${index}.mp4`);
    await command(process.env.FFMPEG_PATH, ["-v","error","-f","lavfi","-i","testsrc2=size=320x180:rate=24:duration=4",
      "-f","lavfi","-i",`sine=frequency=${frequency}:sample_rate=48000:duration=4`,
      "-c:v","libx264","-preset","ultrafast","-pix_fmt","yuv420p","-c:a","aac","-shortest","-n",file]);
    const take = await registerFile(store, file, { scene: "scene-001", asset_name: `scene-001_P00${index + 1}`, tag: index ? "" : "@Manual_Exact-Tag" });
    assert.match(take.path, /^04_镜头\/scene-001\/scene-001_P00[12]\/take_001\//);
    takes.push(take);
    store.put("asset", take.asset_name, { ...store.get("asset", take.asset_name), selected_take_id: take.take_id });
  }
  importStoryboard(store, { envelopes: takes.map((take, index) => ({
    id:`P00${index + 1}`,scene:"scene-001",asset_name:take.asset_name,source_rows:[`R${index + 1}`],duration_seconds:2,prompt:"Synthetic local QA",
  })) });
  const assembled = store.saveTimeline(assemble(store, project.project_id), 0, "assembly");
  const cut = structuredClone(assembled.project);
  cut.tracks[0].elements.forEach((e,i) => { e.s=i; e.e=i+1; e.props.time=i ? 0.5 : 1; });
  const saved = store.saveTimeline(validateTimeline(store, cut), assembled.revision);
  assert.deepEqual(store.timeline(saved.revision).project, cut);
  assert.match(saved.path, /^05_剪辑\/工程\//);
  const job = store.createJob({ kind:"render",revision:saved.revision }, id());
  store.updateJob(job.job_id, { status:"running" });
  await renderExport(store, project.project_id, saved, job, port);
  const done = store.get("job",job.job_id);
  assert.equal(done.status,"completed");
  assert.match(done.files.mp4,/^06_导出\/审片\//);
  const output = contained(project.root,done.files.mp4);
  const probe = JSON.parse(await command(process.env.FFPROBE_PATH,["-v","error","-show_streams","-of","json",output]));
  const video = probe.streams.find(s=>s.codec_type==="video"), audio = probe.streams.find(s=>s.codec_type==="audio");
  assert.equal(video.r_frame_rate,"24/1"); assert.equal(Number(video.nb_frames),48);
  assert.ok(Math.abs(Number(audio.duration)-2)<0.05);
  const raw = path.join(project.root,".project/audio.f32");
  await command(process.env.FFMPEG_PATH,["-v","error","-i",output,"-ac","1","-ar","48000","-f","f32le","-n",raw]);
  const bytes=fs.readFileSync(raw), samples=new Float32Array(bytes.buffer,bytes.byteOffset,bytes.byteLength/4);
  const frequency=(start,end)=>{ let n=0;for(let i=Math.floor(start*48000)+1;i<end*48000;i++)if(samples[i-1]<=0&&samples[i]>0)n++;return n/(end-start); };
  assert.ok(Math.abs(frequency(.2,.8)-440)<5);assert.ok(Math.abs(frequency(1.2,1.8)-880)<5);
  assert.equal(fs.existsSync(path.join(project.root,"deliverables")),false);
  report.export={frames:Number(video.nb_frames),fps:video.r_frame_rate,audio_seconds:audio.duration,first_hz:frequency(.2,.8),second_hz:frequency(1.2,1.8)};
  report.passed=true;
  const evidence=process.env.PORTABLE_EVIDENCE;
  if(evidence) {
    fs.mkdirSync(evidence,{recursive:true});
    fs.copyFileSync(output,path.join(evidence,"复制后有声导出.mp4"));
    atomic(path.join(evidence,"report.json"),report,true);
  }
  console.log(JSON.stringify(report,null,2));
} finally { await app.close(); }
