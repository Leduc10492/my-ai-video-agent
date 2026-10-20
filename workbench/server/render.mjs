import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { atomic, contained, check, walk } from "./files.mjs";
import { command, probe, digest } from "./media.mjs";
import { validateTimeline } from "./timeline.mjs";
import { projectRelative } from "../../.agents/project-layout.mjs";
const appRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
let renderTail = Promise.resolve();

export async function renderExport(store, projectId, timeline, job, port) {
  const action = renderTail.then(() =>
    runRender(store, projectId, timeline, job, port),
  );
  renderTail = action.catch(() => {});
  return action;
}
async function runRender(store, projectId, timeline, job, port) {
  process.env.DISABLE_TELEMETRY = "true";
  const executable = (name) => {
    const override = process.env[name.toUpperCase() + "_PATH"];
    if (override && path.isAbsolute(override)) return override;
    const found = (process.env.PATH || "")
      .split(path.delimiter)
      .map((dir) => path.join(dir, name))
      .find((file) => fs.existsSync(file));
    check(found, `找不到 ${name}，请先安装或设置绝对路径`);
    return found;
  };
  const ffmpegPath = executable("ffmpeg"),
    ffprobePath = executable("ffprobe");
  process.env.FFMPEG_PATH = ffmpegPath;
  process.env.FFPROBE_PATH = ffprobePath;
  const { renderVideo } = await import("@twick/renderer");
  const project = validateTimeline(store, structuredClone(timeline.project), {
    exporting: true,
  });
  const settings = timeline.settings,
    duration = Math.max(
      ...project.tracks.flatMap((t) => t.elements.map((e) => e.e)),
    );
  const manifest = [];
  for (const track of project.tracks)
    for (const element of track.elements)
      if (element.metadata?.take_id) {
        const take = store.get("take", element.metadata.take_id);
        check(
          (await digest(contained(store.root, take.path))) === take.sha256,
          `源媒体已被外部修改：${take.filename}`,
        );
        element.props.src = `http://127.0.0.1:${port}/api/projects/${projectId}/media/${take.take_id}`;
        if (element.props.muted || track.props?.muted) element.props.volume = 0;
        manifest.push({
          clip_id: element.id,
          take_id: take.take_id,
          asset_name: take.asset_name,
          path: take.path,
          sha256: take.sha256,
          start: element.s,
          end: element.e,
          source_in: element.props.time || 0,
        });
      }
  const browser =
    process.env.TWICK_BROWSER ||
    walk(
      path.join(os.homedir(), ".cache/puppeteer"),
      (name) => name === "chrome-headless-shell",
      6,
    ).at(-1);
  check(
    browser && fs.existsSync(browser),
    "未找到渲染浏览器。设置 TWICK_BROWSER 指向 Chrome Headless Shell；参见 workbench/README.md。",
  );
  const template = path.join(
    appRoot,
    `.local/render-projects/fps-${settings.fps}.ts`,
  );
  // 0.15.31's visualizer fixes fps at 30; renderer settings alone do not override that value.
  atomic(
    template,
    `import project from '@twick/visualizer/dist/project.js';\nproject.settings.rendering.fps = ${settings.fps};\nproject.settings.preview.fps = ${settings.fps};\nexport default project;\n`,
    true,
  );
  const directory = projectRelative(store.root, `deliverables/4_edit/exports/${job.job_id}`),
    absolute = contained(store.root, directory);
  fs.mkdirSync(absolute, { recursive: true });
  const rendered = await renderVideo({
    projectFile: template,
    variables: { input: { ...project, properties: { ...settings } } },
    settings: {
      outDir: absolute,
      outFile: "render-pass.mp4",
      workers: 1,
      logProgress: false,
      projectSettings: {
        exporter: { name: "@twick/core/wasm-effects" },
        size: { x: settings.width, y: settings.height },
        fps: settings.fps,
      },
      puppeteer: {
        executablePath: browser,
        args: ["--autoplay-policy=no-user-gesture-required"],
      },
      ffmpeg: { ffmpegPath, ffprobePath },
      // Resolve Twick's virtual client imports from this installation, regardless
      // of the shell/Finder/Codex working directory used to launch the service.
      viteConfig: { root: appRoot },
      viteServerOptions: { host: "127.0.0.1" },
    },
  });
  const final = path.join(absolute, "film.mp4");
  await command(process.env.FFMPEG_PATH || "ffmpeg", [
    "-v",
    "error",
    "-i",
    rendered,
    "-t",
    String(duration),
    "-map",
    "0:v:0",
    "-map",
    "0:a?",
    "-c:v",
    "copy",
    "-c:a",
    "aac",
    "-movflags",
    "+faststart",
    "-n",
    final,
  ]);
  const info = await probe(final);
  const [num, den] = info.fps.split("/").map(Number);
  check(
    Math.abs(num / den - settings.fps) < 0.01 &&
      Math.abs(info.duration - duration) < 2 / settings.fps,
    "导出帧率或时长不符合工程，保留日志供检查",
  );
  const streams = JSON.parse(
    await command(process.env.FFPROBE_PATH || "ffprobe", [
      "-v",
      "error",
      "-show_streams",
      "-of",
      "json",
      final,
    ]),
  ).streams;
  const video = streams.find((s) => s.codec_type === "video"),
    audio = streams.find((s) => s.codec_type === "audio");
  const expectsAudio = project.tracks.some((t) =>
    t.elements.some(
      (e) =>
        e.metadata?.take_id &&
        store.get("take", e.metadata.take_id)?.media.has_audio &&
        !e.props?.muted &&
        e.props?.volume !== 0,
    ),
  );
  check(
    !expectsAudio ||
      (audio &&
        Math.abs(Number(video.duration) - Number(audio.duration)) <
          2 / settings.fps),
    "导出音轨缺失或音画时长不一致",
  );
  atomic(path.join(absolute, "project.json"), {
    ...timeline,
    project: timeline.project,
  });
  atomic(path.join(absolute, "media-manifest.json"), {
    settings,
    duration,
    media: manifest,
    output: { ...info, sha256: await digest(final) },
  });
  store.updateJob(job.job_id, {
    status: "completed",
    files: {
      mp4: `${directory}/film.mp4`,
      json: `${directory}/project.json`,
      manifest: `${directory}/media-manifest.json`,
    },
    media: info,
  });
  fs.rmSync(rendered, { force: true });
}
