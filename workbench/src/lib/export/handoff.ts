import { existsSync } from "node:fs";
import path from "node:path";

import { packZip } from "@/lib/export/pack";
import { costTotals } from "@/lib/jobs/store";
import { loadBoard, loadLibrary } from "@/lib/production";
import { loadEpisode, loadProject } from "@/lib/workspace";

export type ExportParts = {
  script: boolean;
  html: boolean;
  prompts: boolean;
  media: boolean;
  docx: boolean;
};

function episodeIds(projectId: string, episodeId: string, scope: "episode" | "project") {
  const project = loadProject(projectId);
  if (!project) return [];
  if (scope === "project") return project.episodes.map((episode) => episode.id);
  return [episodeId];
}

export async function buildExport(input: {
  projectId: string;
  episodeId: string;
  scope: "episode" | "project";
  parts: ExportParts;
}) {
  const project = loadProject(input.projectId);
  if (!project) return null;
  const ids = episodeIds(input.projectId, input.episodeId, input.scope);
  const totals = costTotals(input.projectId);
  const lines = [
    `# 交接单 · ${project.title}`,
    "",
    project.example ? "示例数据。不要把这份文件当成已经生成的成片。" : "当前仓库。",
    "",
    `范围：${input.scope === "project" ? "全剧" : "本集"}`,
    `估价合计：${totals.estimate.toFixed(2)} 美元`,
    `实际花费：${totals.actual.toFixed(2)} 美元`,
    "工作台没有调用 Higgsfield，也没有别的付费接口。成片要由制片在外面另跑。",
    "",
  ];
  const entries: { name: string; filePath?: string; text?: string }[] = [];
  let docxSkipped = false;

  for (const episodeId of ids) {
    const episode = loadEpisode(input.projectId, episodeId);
    const board = loadBoard(input.projectId, episodeId);
    if (!episode) continue;
    lines.push(`## 第 ${episode.episodeNumber} 集 · ${episode.episodeTitle}`, "");
    lines.push(episode.gateOpen ? "审核已通过。" : `审核未通过：${episode.auditDetail}`, "");
    if (episode.stale) lines.push("下游已过期。这份交接不触发重跑。", "");
    const current = episode.scripts.at(-1);
    if (input.parts.script && current) {
      lines.push("剧本已放进压缩包。", "");
      entries.push({
        name: `${episodeId}/${current.relativePath}`,
        text: current.text,
      });
      if (input.parts.docx) {
        docxSkipped = !current.text.includes("## Screenplay");
      }
    }
    if (input.parts.prompts && board) {
      for (const envelope of board.envelopes) {
        lines.push(`### ${envelope.id}`, "", envelope.prompt, "");
      }
      const episodeJson = project.episodes.find((item) => item.id === episodeId);
      if (episodeJson) {
        const root = path.resolve(project.root, episodeJson.dir);
        for (const scene of board.scenes) {
          const filePath = path.join(root, "3_shotlist", `${scene.id}_v1`, "prompts.md");
          if (!existsSync(filePath)) continue;
          entries.push({ name: `${episodeId}/3_shotlist/${scene.id}_v1/prompts.md`, filePath });
        }
      }
    }
    if (input.parts.html) {
      lines.push("中文分镜表 HTML：这一集示例里没有单独导出的 HTML 文件。", "");
    }
  }

  if (input.parts.media) {
    const library = loadLibrary(input.projectId);
    lines.push("## 锚点", "");
    for (const character of library?.characters ?? []) {
      lines.push(`- ${character.name}：${character.anchor}${character.sha256 ? ` · ${character.sha256}` : ""}`);
      if (character.imagePath) {
        const filePath = path.join(project.assetsDir, "refs", character.id, "anchor.png");
        if (existsSync(filePath)) entries.push({ name: character.imagePath, filePath });
      }
    }
    lines.push("");
  }

  if (input.parts.docx) {
    lines.push(docxSkipped || !input.parts.script ? "DOCX 已跳过：剧本没有 ## Screenplay 围栏，导出脚本无法开工。" : "DOCX 未生成。", "");
  }
  lines.push("剪映草稿不在这一版里。", "");

  const markdown = lines.join("\n");
  entries.unshift({ name: "handoff.md", text: markdown });
  const buffer = await packZip(entries.filter((entry) => entry.text !== undefined || entry.filePath));
  const filename = `${project.id}-${input.scope}.zip`;
  return { buffer, filename };
}
