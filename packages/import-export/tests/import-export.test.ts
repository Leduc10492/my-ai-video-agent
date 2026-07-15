import { describe, expect, it } from "vitest";
import { exportProductionHtml, importPastedScript } from "../src";

describe("script import", () => {
  it("keeps source blocks and proposes scenes without committing structure", async () => {
    const result = await importPastedScript("外景 上海弄堂 - 夜\n\n阿宁\n别回头。\n\n内景 老屋 - 夜\n\n门自己开了。", "sample.txt");
    expect(result.sceneProposals).toHaveLength(2);
    expect(result.blocks.some((block) => block.kind === "dialogue")).toBe(true);
    expect(result.sourceHash).toHaveLength(64);
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
