import { Document, Packer, Paragraph } from "docx";
import { describe, expect, it } from "vitest";
import { exportProductionHtml, importPastedScript, importScriptBuffer } from "../src";

const numberedSceneHeadings = [
  "1. INT. 东京小型影像公司 - DAY",
  "2. EXT. 山手线站台 - NIGHT",
  "3. INT. 便利店 - NIGHT",
  "4. INTERCUT - DAY / NIGHT",
  "5. INT. 投币洗衣房 - LATE NIGHT",
  "6. INT. 投币洗衣房 - 02:00",
  "7. EXT. 隅田川步道 - NIGHT",
  "8. INT./EXT. 便利店 - DAWN"
];

describe("script import", () => {
  it("keeps source blocks and proposes scenes without committing structure", async () => {
    const result = await importPastedScript("外景 上海弄堂 - 夜\n\n阿宁\n别回头。\n\n内景 老屋 - 夜\n\n门自己开了。", "sample.txt");
    expect(result.sceneProposals).toHaveLength(2);
    expect(result.blocks.some((block) => block.kind === "dialogue")).toBe(true);
    expect(result.sourceHash).toHaveLength(64);
  });

  it("recognizes numbered, intercut, and mixed interior/exterior Markdown headings", async () => {
    const source = ["# 《你还是你吗？》", ...numberedSceneHeadings.flatMap((heading) => [`## ${heading}`, "动作。"])].join("\n\n");
    const result = await importScriptBuffer("05_screenplay.md", Buffer.from(source, "utf8"));

    expect(result.sceneProposals).toHaveLength(8);
    expect(result.sceneProposals.map((proposal) => proposal.ordinal)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    expect(result.sceneProposals.map((proposal) => proposal.heading)).toEqual(numberedSceneHeadings.map((heading) => heading.replace(/^\d+\.\s*/, "")));
    expect(result.blocks.filter((block) => block.kind === "scene-heading").map((block) => block.text)).toEqual(numberedSceneHeadings);
    expect(result.warnings.some((warning) => warning.code === "NO_SCENE_HEADINGS")).toBe(false);
  });

  it("recognizes the same numbered scene structure after DOCX text extraction", async () => {
    const document = new Document({
      sections: [{
        children: numberedSceneHeadings.flatMap((heading) => [new Paragraph(heading), new Paragraph("动作。")])
      }]
    });
    const result = await importScriptBuffer("你还是你吗_screenplay.docx", await Packer.toBuffer(document));

    expect(result.sceneProposals).toHaveLength(8);
    expect(result.sceneProposals[3]?.heading).toBe("INTERCUT - DAY / NIGHT");
    expect(result.sceneProposals[7]?.heading).toBe("INT./EXT. 便利店 - DAWN");
    expect(result.warnings.some((warning) => warning.code === "NO_SCENE_HEADINGS")).toBe(false);
  });
});

describe("production HTML export", () => {
  it("preserves Scene → Shot Row → Prompt Envelope mapping and source text", () => {
    const html = exportProductionHtml({
      projectName: "回声",
      version: "v1",
      exportedAt: "2026-07-15T00:00:00.000Z",
      sceneTitles: { S001: "老屋门口" },
      shots: [{ id: "R01", sceneId: "S001", ordinal: 1, size: "全景", camera: "固定", action: "阿宁停在门前", cutReason: "建立空间", sourceText: "门自己开了。" }],
      envelopes: [{ id: "P001", sceneId: "S001", ordinal: 1, targetModel: "Seedance", promptZh: "夜雨中的老屋。", shotRowIds: ["R01"] }]
    });
    expect(html).toContain("R01");
    expect(html).toContain("P001");
    expect(html).toContain("门自己开了。");
  });
});
