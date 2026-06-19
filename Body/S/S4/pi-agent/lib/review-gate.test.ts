import { describe, it } from "node:test";
import { strict as assert } from "node:assert";

import {
  actorRequiresRecursiveSelfReviewFinalValidation,
  enforceReviewGate,
  pi,
} from "./review-gate.ts";

describe("12.T12.4 - Pi recursive-self-review gate", () => {
  it("blocks Anima recursive self-review until user final-validation passes", () => {
    const blocked = pi.enforceReviewGate({
      recursiveSelfReview: true,
      actor: "anima",
    });

    assert.equal(blocked.ok, false);
    assert.equal(blocked.userFinalValidationRequired, true);
    if (!blocked.ok) {
      assert.match(blocked.reason, /Pi review-routing gate/);
      assert.match(blocked.reason, /recursive self-review by anima/);
      assert.match(blocked.reason, /user final-validation/);
    }

    const passed = pi.enforceReviewGate({
      recursiveSelfReview: true,
      actor: "anima",
      userFinalValidation: true,
    });
    assert.equal(passed.ok, true);
    assert.equal(passed.userFinalValidationRequired, true);
  });

  it("normalizes recursive-self-review actors before applying the gate", () => {
    assert.equal(
      actorRequiresRecursiveSelfReviewFinalValidation({
        recursiveSelfReview: true,
        actor: " Anima ",
      }),
      true,
    );
    assert.equal(
      enforceReviewGate({ recursiveSelfReview: true, actor: "ANIMA" }).ok,
      false,
    );
  });

  it("does not block ordinary non-human-required review routing", () => {
    const result = enforceReviewGate({
      decision: "approve",
      actor: "anima",
      recursiveSelfReview: false,
      humanRequired: false,
    });

    assert.equal(result.ok, true);
    assert.equal(result.userFinalValidationRequired, false);
  });

  it("preserves human-required review law for committal agent verdicts", () => {
    for (const decision of ["approve", "reject", "revise", "apply", "applied"]) {
      const result = enforceReviewGate({
        decision,
        actor: "pi",
        humanRequired: true,
      });

      assert.equal(result.ok, false, `${decision} must be gated`);
      assert.equal(result.userFinalValidationRequired, true);
    }
  });

  it("allows non-committal defer while keeping final-validation required", () => {
    const result = enforceReviewGate({
      decision: "defer",
      actor: "anima",
      recursiveSelfReview: true,
    });

    assert.equal(result.ok, true);
    assert.equal(result.userFinalValidationRequired, true);
  });
});
