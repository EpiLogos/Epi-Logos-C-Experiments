import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { classifyPattern, assertNotReified, MYTHOS_CF } from "../modules/mythos-pattern.ts";
import { agentForCf } from "../modules/dispatch-validate.ts";

// Verification obligation (track 10.T10): "pattern-classification tests."
// Mythos owns pattern diagnosis + strange-attractor naming. Real module, no mocks.

describe("Mythos pattern classification", () => {
  it("names a strange attractor once observations recur (>= 2)", () => {
    const c = classifyPattern({
      observations: ["test fails on tz boundary", "test fails on dst shift"],
      attractor: "timezone-dependent temporal assertion",
    });
    assert.equal(c.classified, true);
    assert.equal(c.recurrence, 2);
    assert.equal(c.attractor, "timezone-dependent temporal assertion");
    assert.equal(c.agent, "mythos");
    assert.equal(c.cf, MYTHOS_CF);
  });

  it("does not call a single occurrence a pattern", () => {
    const c = classifyPattern({ observations: ["one flake"], attractor: "maybe-flaky" });
    assert.equal(c.classified, false);
    assert.equal(c.recurrence, 1);
  });

  it("always holds the classification provisionally (map, not territory)", () => {
    const c = classifyPattern({ observations: ["a", "b", "c"], attractor: "shape" });
    assert.equal(c.provisional, true);
  });

  it("requires a strange-attractor name", () => {
    assert.throws(() => classifyPattern({ observations: ["a", "b"], attractor: "" }), /strange-attractor name/);
  });
});

describe("Mythos reification pathology guard", () => {
  it("passes a provisionally-held classification", () => {
    const c = classifyPattern({ observations: ["a", "b"], attractor: "shape" });
    assert.equal(assertNotReified(c).ok, true);
  });

  it("refuses asserting the attractor AS the territory (reification)", () => {
    const c = classifyPattern({ observations: ["a", "b"], attractor: "shape" });
    const r = assertNotReified(c, { claimedAsTerritory: true });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Reification|territory/i);
  });
});

describe("Mythos is grounded in the live constitutional roster", () => {
  it("MYTHOS_CF (0/1/2/3) resolves back to the mythos agent", () => {
    assert.equal(MYTHOS_CF, "(0/1/2/3)");
    assert.equal(agentForCf(MYTHOS_CF), "mythos");
  });
});
