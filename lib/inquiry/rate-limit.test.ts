import assert from "node:assert/strict";
import test from "node:test";

import { allowInquiry, resetInquiryLimits } from "./rate-limit.ts";

test("blocks the sixth inquiry from the same key", () => {
  resetInquiryLimits();
  for (let i = 0; i < 5; i += 1) assert.equal(allowInquiry("10.0.0.8", 1_000 + i), true);
  assert.equal(allowInquiry("10.0.0.8", 2_000), false);
  assert.equal(allowInquiry("10.0.0.9", 2_000), true);
});
