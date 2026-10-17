import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

import { parseBreakdown, parsePrompts, shotColumn, type Envelope, type ShotRow } from "@/lib/shot-parse";
import { loadEpisode, loadProject } from "@/lib/workspace";

export type CharacterCard = {
  id: string;
  name: string;
  role: string;
  facts: string;
  costume: string;
  fingerprint: string;
  anchor: "已锁定" | "待确认" | "未出图";
  sha256: string | null;
  imagePath: string | null;
};

export type PlaceCard = { id: string; name: string; facts: string; note: string };
export type PropCard = { id: string; name: string; facts: string; owner: string };

export type BoardShot = ShotRow & { column: "事实" | "提示词包" | "已生成" | "已通过" };

export type SceneBoard = {
  id: string;
  title: string;
  shots: BoardShot[];
};

const ANCHORS = new Set(["已锁定", "待确认", "未出图"]);

function readCards<T>(dir: string, map: (id: string, json: Record<string, string>) => T): T[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => name.endsWith(".json"))
    .map((name) => {
      const json = JSON.parse(readFileSync(path.join(dir, name), "utf8")) as Record<string, string>;
      return map(name.replace(/\.json$/, ""), json);
    });
}

export function loadLibrary(projectId: string) {
  const project = loadProject(projectId);
  if (!project) return null;
  const refs = path.join(project.assetsDir, "refs");
  const characters: CharacterCard[] = [];
  if (existsSync(refs)) {
    for (const name of readdirSync(refs)) {
      const dir = path.join(refs, name);
      if (!statSync(dir).isDirectory()) continue;
      const lockFile = path.join(dir, "lock.json");
      if (!existsSync(lockFile)) continue;
      const lock = JSON.parse(readFileSync(lockFile, "utf8")) as Record<string, string>;
      const imageFile = path.join(dir, "anchor.png");
      const hasImage = existsSync(imageFile);
      const requested = ANCHORS.has(lock.anchor) ? (lock.anchor as CharacterCard["anchor"]) : "待确认";
      characters.push({
        id: name,
        name: lock.name ?? name,
        role: lock.role ?? "",
        facts: lock.facts ?? "",
        costume: lock.costume ?? "",
        fingerprint: lock.fingerprint ?? "",
        anchor: hasImage ? requested : "未出图",
        sha256: hasImage ? createHash("sha256").update(readFileSync(imageFile)).digest("hex") : null,
        imagePath: hasImage ? `2_assets/refs/${name}/anchor.png` : null,
      });
    }
  }
  characters.sort((a, b) => a.name.localeCompare(b.name, "zh"));
  return {
    example: project.example,
    characters,
    scenes: readCards<PlaceCard>(path.join(project.assetsDir, "scenes"), (id, json) => ({
      id,
      name: json.name ?? id,
      facts: json.facts ?? "",
      note: json.note ?? "",
    })),
    props: readCards<PropCard>(path.join(project.assetsDir, "props"), (id, json) => ({
      id,
      name: json.name ?? id,
      facts: json.facts ?? "",
      owner: json.owner ?? "",
    })),
  };
}

export function loadBoard(projectId: string, episodeId: string) {
  const project = loadProject(projectId);
  const episode = loadEpisode(projectId, episodeId);
  if (!project || !episode) return null;
  const episodeJson = project.episodes.find((item) => item.id === episodeId);
  if (!episodeJson) return null;
  const episodeDir = path.resolve(project.root, episodeJson.dir);
  const scenes: SceneBoard[] = [];
  const envelopes: Envelope[] = [];
  const files: string[] = [];
  const walk = (dir: string) => {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else files.push(full);
    }
  };
  walk(path.join(episodeDir, "3_shotlist"));
  for (const file of files) {
    if (file.endsWith("/prompts.md") || file.endsWith(`${path.sep}prompts.md`)) {
      envelopes.push(...parsePrompts(readFileSync(file, "utf8")));
    }
  }
  for (const file of files) {
    const match = path.basename(file).match(/^03_shotlist_breakdown_(.+)_v\d+\.md$/);
    if (!match) continue;
    const scene = match[1];
    const shots = parseBreakdown(readFileSync(file, "utf8"), scene).map((shot) => ({
      ...shot,
      column: shotColumn(shot, envelopes),
    }));
    scenes.push({ id: scene, title: scene, shots });
  }
  for (const label of episode.sceneLabels) {
    if (!scenes.some((scene) => scene.id === label)) scenes.push({ id: label, title: label, shots: [] });
  }
  scenes.sort((a, b) => a.id.localeCompare(b.id));
  return {
    example: episode.example,
    gateOpen: episode.gateOpen,
    stale: episode.stale,
    auditDetail: episode.auditDetail,
    title: `第 ${episode.episodeNumber} 集 · ${episode.episodeTitle}`,
    scenes,
    envelopes,
  };
}
