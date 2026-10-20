import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { pipeline } from "node:stream/promises";
import { Readable, Transform } from "node:stream";
import dns from "node:dns/promises";
import { check, contained, id, now } from "./files.mjs";

export function command(program, args, options = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(program, args, {
      ...options,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "",
      stderr = "";
    proc.stdout.on("data", (b) => {
      stdout += b;
    });
    proc.stderr.on("data", (b) => {
      stderr = (stderr + b).slice(-24000);
    });
    proc.on("error", reject);
    proc.on("close", (code) =>
      code === 0
        ? resolve(stdout)
        : reject(new Error(`${program} (${code}): ${stderr}`)),
    );
  });
}
export async function probe(file) {
  const info = JSON.parse(
    await command(process.env.FFPROBE_PATH || "ffprobe", [
      "-v",
      "error",
      "-show_format",
      "-show_streams",
      "-of",
      "json",
      file,
    ]),
  );
  const video = info.streams?.find(
      (s) => s.codec_type === "video" && !s.disposition?.attached_pic,
    ),
    audio = info.streams?.find((s) => s.codec_type === "audio");
  check(video || audio, "文件没有可解码的媒体轨道");
  const image =
    video && !Number(info.format.duration) && !Number(video.duration);
  const duration = Number(
    info.format.duration || video?.duration || audio?.duration || 0,
  );
  if (!image) check(duration > 0, "媒体时长无效");
  // Decode the complete file: metadata alone cannot establish a valid download.
  await command(process.env.FFMPEG_PATH || "ffmpeg", [
    "-v",
    "error",
    "-xerror",
    "-i",
    file,
    "-f",
    "null",
    "-",
  ]);
  return {
    kind: video ? (image ? "image" : "video") : "audio",
    duration,
    width: video?.width,
    height: video?.height,
    fps: video?.avg_frame_rate,
    has_audio: !!audio,
    sample_rate: audio ? Number(audio.sample_rate) : null,
    format: info.format.format_name,
    bytes: fs.statSync(file).size,
  };
}
export async function digest(file) {
  const h = createHash("sha256");
  for await (const chunk of fs.createReadStream(file)) h.update(chunk);
  return h.digest("hex");
}
export async function registerFile(store, source, input) {
  const original = path.basename(input.filename || source),
    extension = path.extname(original);
  check(
    /^\.(png|jpe?g|webp|avif|gif|mp4|mov|m4v|webm|mkv|mp3|wav|m4a|aac|ogg|flac)$/i.test(
      extension,
    ),
    "不支持的媒体扩展名",
  );
  const name = input.asset_name ?? original.slice(0, -extension.length);
  check(
    !input.scene || /^scene-[A-Za-z0-9_-]+$/.test(input.scene),
    "Scene 标识无效",
  );
  const info = await probe(source);
  const asset = store.ensureAsset(
    {
      asset_name: name,
      kind: info.kind,
      scene: input.scene || "",
      tag: input.tag || "",
      prompt: input.prompt || "",
    },
    { existing: input.add_take === true },
  );
  const takeId = input.take_id || id();
  check(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      takeId,
    ),
    "take_id 必须是 UUID",
  );
  check(!store.get("take", takeId), "take 已登记", 409);
  const base =
    info.kind === "video" && input.scene
      ? `deliverables/3_shotlist/${input.scene}/generated`
      : "deliverables/2_assets";
  check(
    !input.scene || /^scene-[A-Za-z0-9_-]+$/.test(input.scene),
    "Scene 标识无效",
  );
  const relative = `${base}/${asset.asset_name}/${takeId}/${asset.asset_name}${extension}`;
  const target = contained(store.root, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target, fs.constants.COPYFILE_EXCL);
  const take = {
    take_id: takeId,
    asset_name: asset.asset_name,
    path: relative,
    filename: asset.asset_name + extension,
    sha256: await digest(target),
    media: info,
    created_at: now(),
    technical_status: "checked",
    visual_status: "unreviewed",
    source: input.source || { type: "import", filename: original },
    prompt: input.prompt || "",
    model: input.model || null,
    job_id: input.job_id || null,
    external: input.external || null,
  };
  store.put("take", takeId, take);
  return take;
}

function isPrivate(address) {
  return (
    /^(127\.|10\.|192\.168\.|169\.254\.|0\.|172\.(1[6-9]|2\d|3[01])\.)/.test(
      address,
    ) || /^(::1|::ffff:|fc|fd|fe80)/i.test(address)
  );
}
export async function download(url, target) {
  let current = url;
  for (let redirects = 0; redirects < 6; redirects++) {
    const parsed = new URL(current);
    check(
      parsed.protocol === "https:" && !parsed.username && !parsed.password,
      "结果下载仅接受 HTTPS",
    );
    const addresses = await dns.lookup(parsed.hostname, { all: true });
    check(
      addresses.length && addresses.every((a) => !isPrivate(a.address)),
      "下载地址不能指向本地网络",
    );
    const response = await fetch(current, {
      redirect: "manual",
      signal: AbortSignal.timeout(600000),
    });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      current = new URL(response.headers.get("location"), current).href;
      continue;
    }
    check(response.ok && response.body, `下载失败：HTTP ${response.status}`);
    const expected = Number(response.headers.get("content-length"));
    check(!expected || expected < 4 * 1024 ** 3, "媒体文件超过 4 GB");
    fs.mkdirSync(path.dirname(target), { recursive: true });
    let size = 0;
    const limiter = new Transform({
      transform(chunk, encoding, done) {
        size += chunk.length;
        done(size > 4 * 1024 ** 3 ? new Error("文件超过 4 GB") : null, chunk);
      },
    });
    try {
      await pipeline(
        Readable.fromWeb(response.body),
        limiter,
        fs.createWriteStream(target, { flags: "wx" }),
      );
      check(size > 0 && (!expected || expected === size), "下载文件不完整");
      return {
        size,
        url: current,
        content_type: response.headers.get("content-type"),
      };
    } catch (error) {
      fs.rmSync(target, { force: true });
      throw error;
    }
  }
  throw new Error("下载重定向次数过多");
}
