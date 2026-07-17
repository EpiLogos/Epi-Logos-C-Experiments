import { describe, it } from "node:test";
import { strict as assert } from "node:assert";

import {
  Q_REVIEW_NIGHT_PASS_METHOD,
  qReviewNightPassRequest,
} from "../modules/q-review-night-pass.ts";

describe("Aletheia Q-review night-pass request", () => {
  it("carries temporal context only, never a caller-authored corpus", () => {
    assert.deepEqual(qReviewNightPassRequest("15-07-2026", 17), {
      type: "req",
      id: 2,
      method: Q_REVIEW_NIGHT_PASS_METHOD,
      params: {
        day_id: "15-07-2026",
        last_review_epoch: 17,
      },
    });
  });

  it("refuses unsafe temporal context before touching the gateway", () => {
    assert.throws(() => qReviewNightPassRequest("../15-07-2026"), /safe non-empty day_id/);
    assert.throws(() => qReviewNightPassRequest("15-07-2026", -1), /non-negative integer/);
  });
});
