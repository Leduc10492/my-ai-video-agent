import assert from "node:assert/strict";
import test from "node:test";

import { auditDecision, parseFindings } from "./findings.ts";
import { hashScript, isDownstreamStale } from "./staleness.ts";

test("P1 still open keeps the gate shut", () => {
  const text = "未解决的 P0：无\n未解决的 P1：未解决。原因没有落到动作上。\n### P0\n\n无\n\n### P1\n\n- 未解决：原因没有落到动作上。\n";
  const findings = parseFindings(text);
  assert.equal(findings.some((item) => item.level === "P1" && item.open), true);
  const decision = auditDecision({
    hasScript: true,
    hasAudit: true,
    scriptVersion: 1,
    auditVersion: 1,
    auditText: text,
  });
  assert.equal(decision.gateOpen, false);
  assert.equal(decision.status, "阻断");
});

test("cleared P0 and P1 open the gate", () => {
  const text = "未解决的 P0：无\n未解决的 P1：无\n### P0\n\n无\n\n### P1\n\n无\n";
  const decision = auditDecision({
    hasScript: true,
    hasAudit: true,
    scriptVersion: 2,
    auditVersion: 2,
    auditText: text,
  });
  assert.equal(decision.gateOpen, true);
  assert.equal(decision.status, "已通过");
});

test("hash mismatch marks stale and does not rewrite", () => {
  assert.equal(isDownstreamStale("下一稿", hashScript("上一稿")), true);
  assert.equal(isDownstreamStale("同一稿", hashScript("同一稿")), false);
  assert.equal(isDownstreamStale("没有基线", null), false);
});
