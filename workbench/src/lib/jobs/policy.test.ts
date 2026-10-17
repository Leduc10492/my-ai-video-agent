import assert from "node:assert/strict";
import test from "node:test";

import { needsSecondConfirm } from "./policy.ts";

test("estimates over 10 dollars need a second confirm", () => {
  assert.equal(needsSecondConfirm(2.4), false);
  assert.equal(needsSecondConfirm(10), false);
  assert.equal(needsSecondConfirm(12), true);
});
