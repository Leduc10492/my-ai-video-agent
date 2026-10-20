import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { importMarkdown, exportMarkdown, applyProposal, paragraphTypes } from "../shared/screenplay.ts";
import { saveScript, scriptStatus } from "../server/workflow.mjs";

const source = fs.readFileSync(new URL("./fixtures/screenplay.md", import.meta.url), "utf8");
const semantics = d => d.blocks.map(({ type, text, level }) => ({ type, text, ...(["scene", "section"].includes(type) ? { level: level || 3 } : {}) }));
const document = blocks => ({ version: 1, blocks: blocks.map((b, i) => ({ id: `b${i}`, ...b })) });

test("real project Markdown identifies 7 scenes and Chinese dialogue without guessing screen messages", () => {
  const doc = importMarkdown(source);
  assert.equal(doc.blocks.filter(b => b.type === "scene").length, 7);
  assert.equal(doc.blocks.filter(b => b.type === "character").length, 23);
  const cue = doc.blocks.findIndex(b => b.type === "character" && b.text === "老周");
  assert.equal(doc.blocks[cue + 1].type, "dialogue");
  assert.equal(doc.blocks[cue + 1].text, "规矩。");
  assert.equal(doc.blocks.find(b => b.text.includes("房东：小林，房租最晚周五。")).type, "raw");
  assert.equal(doc.blocks.find(b => b.text.includes("第 3 场人质：群演 07 号")).type, "raw");
  assert.ok(doc.blocks.find(b => b.text.startsWith("| # | 场 |")));
  assert.deepEqual(semantics(importMarkdown(exportMarkdown(doc))), semantics(doc));
  assert.equal(exportMarkdown(importMarkdown(exportMarkdown(doc))), exportMarkdown(doc));
  assert.doesNotMatch(exportMarkdown(doc), /data-block-id|"blocks":|# Artifact:/);
});

test("all paragraph types survive Markdown export including multiline text and literal markup", () => {
  const doc = document([
    ...paragraphTypes.map(p => ({ type: p.type, text: p.type === "scene" ? "内景 客厅 日" : "名字 *literal* `code` <tag> & **粗体**" })),
    { type: "dialogue", text: "第一行\n\n# 这是台词\n**不是角色**\n> 引用\n  缩进\n末尾\\" },
    { type: "action", text: "" },
    { type: "action", text: "第 99 场 · 这是正文而非场景" },
    { type: "raw", text: "> 短信不是对白" },
    { type: "section", text: "备注", level: 2 },
    { type: "section", text: "", level: 1 },
    { type: "section", text: "第 1 场 · 仅是备注标题", level: 2 },
    { type: "action", text: "章节之外的动作" },
    { type: "scene", text: "场景：客厅\n补充说明" },
    { type: "raw", text: "| A | B |\n|---|---|\n| 1 | 2 |" },
  ]);
  const output = exportMarkdown(doc);
  assert.deepEqual(semantics(importMarkdown(output)), semantics(doc));
  assert.equal(exportMarkdown(importMarkdown(output)), output);
});

test("front matter and code fences stay literal; Markdown emphasis is not treated as a character cue", () => {
  const doc = importMarkdown('---\ntitle: 测试\n---\n\n### 第 1 场 · 屋内 · 夜\n\n```md\n### 第 2 场 · 代码\n**甲**：不是对白\n```\n\n**门关上了。**\n\n**甲**（低声）：你好。');
  assert.equal(doc.blocks.filter(b => b.type === "scene").length, 1);
  assert.equal(doc.blocks.find(b => b.text === "**门关上了。**").type, "action");
  assert.deepEqual(doc.blocks.slice(-3).map(b => b.type), ["character", "parenthetical", "dialogue"]);
  assert.deepEqual(semantics(importMarkdown(exportMarkdown(doc))), semantics(doc));
});

test("AI patch preserves unrelated typing and rejects changed, deleted, duplicate or unknown targets", () => {
  const before = document([{ type: "dialogue", text: "规矩。" }, { type: "action", text: "关门。" }]);
  const proposal = { summary: "改一句", edits: [{ id: "b0", replacement: [{ type: "dialogue", text: "先说规矩。" }] }] };
  const current = structuredClone(before); current.blocks[1].text = "关上门。";
  const next = applyProposal(current, before, proposal);
  assert.equal(next.blocks[0].text, "先说规矩。");
  assert.equal(next.blocks[1].text, "关上门。");
  assert.equal(current.blocks[0].text, "规矩。");
  current.blocks[0].text = "手改优先。";
  assert.throws(() => applyProposal(current, before, proposal), /手动修改/);
  const deleted = document([{ type: "action", text: "其余" }]); deleted.blocks[0].id = "other";
  assert.throws(() => applyProposal(deleted, before, proposal), /不存在/);
  assert.throws(() => applyProposal(before, before, { ...proposal, edits: [...proposal.edits, ...proposal.edits] }), /重复/);
  assert.throws(() => applyProposal(before, before, { ...proposal, edits: [{ ...proposal.edits[0], id: "unknown" }] }), /不存在/);
  const split = applyProposal(before, before, { summary: "拆分", edits: [{ id: "b0", replacement: [{ type: "dialogue", text: "规矩。" }, { type: "parenthetical", text: "（停顿）" }] }] });
  assert.equal(new Set(split.blocks.map(b => b.id)).size, 3);
});

test("saved editor Markdown keeps scene identity through heading edits and rejects a stale draft", t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "screenplay-save-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  saveScript(root, { body: exportMarkdown(document([{ type: "scene", text: "客厅 日" }, { type: "action", text: "他走进来。" }])) });
  const initial = scriptStatus(root), ref = initial.state.working_script;
  assert.equal(ref.scene_map.length, 1);
  const next = saveScript(root, { body: initial.body.replace("客厅 日", "客厅 夜"), expected_sha256: ref.sha256, scene_bindings: { 1: ref.scene_map[0].label } });
  assert.equal(next.state.working_script.scene_map[0].label, ref.scene_map[0].label);
  assert.equal(next.state.production_inputs, null);
  assert.equal(fs.readFileSync(path.join(root, ref.path), "utf8").includes("客厅 日"), true);
  assert.throws(() => saveScript(root, { body: "过期草稿", expected_sha256: ref.sha256 }), /已变化/);
});
