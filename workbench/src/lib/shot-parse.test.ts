import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { parseBreakdown, parsePrompts, shotColumn } from "./shot-parse.ts";

const root = new URL("../../example/episodes/ep-01/3_shotlist/scene-001_v1/", import.meta.url);

test("breakdown keeps shot rows and envelopes", () => {
  const shots = parseBreakdown(readFileSync(new URL("03_shotlist_breakdown_scene-001_v1.md", root), "utf8"), "scene-001");
  assert.equal(shots.length, 4);
  assert.equal(shots[2].line, "末班还有四十分钟。");
  assert.equal(shots[0].envelope, "ENV-001");
});

test("prompts are copied from the file, not composed", () => {
  const source = readFileSync(new URL("prompts.md", root), "utf8");
  const envelopes = parsePrompts(source);
  assert.equal(envelopes.length, 2);
  assert.deepEqual(envelopes[0].checklist, ["双手可见", "轴线不翻", "没有画外音"]);
  assert.ok(source.includes(envelopes[0].prompt));
  assert.equal(shotColumn(parseBreakdown("#\n| SR01 | 全景 | 跑 | 无 | 先看清 | ENV-001 |", "scene-001")[0], envelopes), "提示词包");
});
