import { STAGE_DEFS } from "@/lib/stages";
import type { Inventory, SlotRecord, StageStatus, StageView } from "@/lib/types";

function slotOf(slots: SlotRecord[], id: string) {
  return slots.find((slot) => slot.slot === id);
}

function unresolved(content: string, level: "P0" | "P1") {
  const cleared = new RegExp(`未解决(?:的)?\\s*${level}\\s*[：:]\\s*(?:无|没有|零|0)(?!\\S)`);
  if (cleared.test(content)) return false;
  const open = new RegExp(`${level}[^\\n]{0,160}(未解决|未关闭|未修复|\\bopen\\b)`, "i");
  return open.test(content) ? true : "unknown";
}

function auditStatus(inventory: Inventory): { status: StageStatus; detail: string } {
  if (!inventory.auditPath || inventory.auditVersion === null) {
    return inventory.scriptPath
      ? { status: "阻断", detail: "已有剧本，但没有同版本审核报告。" }
      : { status: "未开始", detail: "还没有审核报告。" };
  }
  if (inventory.scriptVersion !== null && inventory.auditVersion !== inventory.scriptVersion) {
    return {
      status: "阻断",
      detail: `审核是 v${inventory.auditVersion}，剧本是 v${inventory.scriptVersion}，版本没有对齐。`,
    };
  }
  const text = inventory.auditText ?? "";
  const p0 = unresolved(text, "P0");
  const p1 = unresolved(text, "P1");
  if (p0 === true || p1 === true) {
    const openLevels = [p0 === true ? "P0" : null, p1 === true ? "P1" : null].filter(Boolean).join(" / ");
    return { status: "阻断", detail: `审核仍有未解决的 ${openLevels}。要先回到剧本修订或复审。` };
  }
  if (p0 === "unknown" || p1 === "unknown") {
    return { status: "进行中", detail: "有审核报告，但没有写明未解决的 P0 / P1 是否已清空。" };
  }
  return {
    status: "已通过",
    detail: `v${inventory.auditVersion} 与剧本对齐，未解决的 P0 / P1 都是无。`,
  };
}

export function buildStages(slots: SlotRecord[], inventory: Inventory): StageView[] {
  const audit = auditStatus(inventory);
  const sceneCount = inventory.sceneLabels.length;
  const breakdownCount = inventory.breakdowns.length;
  const htmlCount = inventory.htmls.length;

  return STAGE_DEFS.map((stage) => {
    const primary = slotOf(slots, stage.slot);
    const plugin = stage.pluginSlot ? slotOf(slots, stage.pluginSlot) : undefined;
    const base = {
      id: stage.id,
      label: stage.label,
      summary: stage.summary,
      slot: stage.slot,
      pluginSlot: stage.pluginSlot,
      skill: primary?.skill ?? "（注册表缺少）",
      pluginSkill: plugin?.skill,
      owner: primary?.owner ?? "（注册表缺少）",
      output: primary?.output ?? "",
    };

    if (stage.id === "script") {
      return {
        ...base,
        status: inventory.scriptPath ? "已完成" : "未开始",
        detail: inventory.scriptPath
          ? `当前剧本是 v${inventory.scriptVersion}。`
          : "deliverables/1_story/ 里还没有 01_script_v{N}.md。",
        evidence: inventory.scriptPath ? [inventory.scriptPath] : [],
      };
    }

    if (stage.id === "audit") {
      return {
        ...base,
        output: plugin?.output || base.output,
        detail: audit.detail,
        status: audit.status,
        evidence: inventory.auditPath ? [inventory.auditPath] : [],
      };
    }

    if (stage.id === "guides") {
      const files = [...inventory.assetGuides, ...inventory.styleGuides];
      const status: StageStatus =
        files.length === 0 ? "未开始" : inventory.assetGuides.length && inventory.styleGuides.length ? "已完成" : "进行中";
      return {
        ...base,
        status,
        detail:
          files.length === 0
            ? "还没有资产指南或风格指南。这一阶段按需要才写。"
            : `资产指南 ${inventory.assetGuides.length} 份，风格指南 ${inventory.styleGuides.length} 份。`,
        evidence: files,
      };
    }

    if (stage.id === "breakdown") {
      const status: StageStatus =
        breakdownCount === 0 ? "未开始" : sceneCount > 0 && breakdownCount < sceneCount ? "进行中" : "已完成";
      return {
        ...base,
        status,
        detail:
          breakdownCount === 0
            ? "还没有按 Scene 保存的分镜拆解。"
            : sceneCount > 0
              ? `剧本标出 ${sceneCount} 场，已有 ${breakdownCount} 场拆解。`
              : `已有 ${breakdownCount} 份分镜拆解。`,
        evidence: inventory.breakdowns,
      };
    }

    if (stage.id === "html") {
      const status: StageStatus =
        htmlCount === 0 ? "未开始" : sceneCount > 0 && htmlCount < sceneCount ? "进行中" : breakdownCount > htmlCount ? "进行中" : "已完成";
      return {
        ...base,
        status,
        detail:
          htmlCount === 0
            ? "还没有中文分镜表 HTML。"
            : `已有 ${htmlCount} 份分镜表，${breakdownCount} 份拆解。`,
        evidence: inventory.htmls,
      };
    }

    return {
      ...base,
      status: inventory.qaReports.length ? "已完成" : "未开始",
      detail: inventory.qaReports.length
        ? `保存了 ${inventory.qaReports.length} 份 QA 报告。`
        : "没有保存的 QA 报告。默认检查写在对话里。",
      evidence: inventory.qaReports,
    };
  });
}
