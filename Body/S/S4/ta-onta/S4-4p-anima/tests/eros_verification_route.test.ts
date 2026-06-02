import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import {
  buildErosRoute,
  assertVerificationBound,
  isVerificationBound,
  EROS_CF,
  type RouteStep,
} from "../modules/eros-route.ts";
import { agentForCf } from "../modules/dispatch-validate.ts";

// Verification obligation (track 10.T9): "verification-bound route tests."
// Eros owns execution/verification route semantics. Real module, no mocks.

describe("Eros verification-bound route", () => {
  it("accepts execute → verify (the dāna/pratigraha cycle)", () => {
    const steps: RouteStep[] = [
      { kind: "execute", what: "implement Chronos temporal frame" },
      { kind: "verify", what: "node --test temporal_frame.test.ts" },
    ];
    assert.equal(assertVerificationBound(buildErosRoute(steps)).ok, true);
    assert.equal(isVerificationBound(steps), true);
  });

  it("accepts interleaved execute/verify pairs", () => {
    const steps: RouteStep[] = [
      { kind: "execute", what: "write module" },
      { kind: "verify", what: "unit test module" },
      { kind: "execute", what: "wire into extension" },
      { kind: "verify", what: "syntax check + regression" },
    ];
    assert.equal(isVerificationBound(steps), true);
  });

  it("refuses execution with no trailing verification (Chrematistics)", () => {
    const steps: RouteStep[] = [{ kind: "execute", what: "ship without testing" }];
    const r = assertVerificationBound(buildErosRoute(steps));
    assert.equal(r.ok, false);
    assert.match(r.error!, /Chrematistics|verification-bound/i);
  });

  it("refuses a dangling final execute even when an earlier pair was bound", () => {
    const steps: RouteStep[] = [
      { kind: "execute", what: "a" },
      { kind: "verify", what: "test a" },
      { kind: "execute", what: "b (never verified)" },
    ];
    assert.equal(isVerificationBound(steps), false);
  });

  it("refuses a route with no execution step at all", () => {
    const steps: RouteStep[] = [{ kind: "verify", what: "verify nothing" }];
    const r = assertVerificationBound(buildErosRoute(steps));
    assert.equal(r.ok, false);
    assert.match(r.error!, /no execution step/i);
  });

  it("an empty route is rejected at construction", () => {
    assert.throws(() => buildErosRoute([]), /at least one step/);
  });
});

describe("Eros is grounded in the live constitutional roster", () => {
  it("EROS_CF (0/1/2) resolves back to the eros agent", () => {
    assert.equal(EROS_CF, "(0/1/2)");
    assert.equal(agentForCf(EROS_CF), "eros");
  });
});
