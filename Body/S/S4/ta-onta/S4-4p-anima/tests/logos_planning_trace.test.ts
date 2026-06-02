import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { buildPlanningTrace, assertPorous, LOGOS_CF } from "../modules/logos-scope.ts";
import { agentForCf } from "../modules/dispatch-validate.ts";

// Verification obligation (track 10.T8): "planning trace tests."
// Logos owns scoping/boundary/definition outputs. Real module, no mocks.

const SAMPLE = {
  definition: "the Chronos carrier interface",
  boundaries: ["does not perform review", "does not define content templates"],
  scope: ["Day/NOW triggers", "Kairos additive enrichment"],
  purpose: "give every dispatch a temporal frame so S4' work is time-aware",
};

describe("Logos planning trace — scoping/boundary/definition output", () => {
  it("emits the define → bound → scope order", () => {
    const t = buildPlanningTrace(SAMPLE);
    assert.equal(t.steps[0], "define: the Chronos carrier interface");
    const firstBound = t.steps.findIndex((s) => s.startsWith("bound:"));
    const firstScope = t.steps.findIndex((s) => s.startsWith("scope:"));
    assert.ok(firstBound > 0, "boundaries follow the definition");
    assert.ok(firstScope > firstBound, "scope follows boundaries");
  });

  it("carries the definition, boundaries, and scope through to the trace", () => {
    const t = buildPlanningTrace(SAMPLE);
    assert.equal(t.definition, SAMPLE.definition);
    assert.deepEqual(t.boundaries, SAMPLE.boundaries);
    assert.deepEqual(t.scope, SAMPLE.scope);
    assert.equal(t.agent, "logos");
    assert.equal(t.cf, LOGOS_CF);
  });

  it("refuses a trace with no definition (CT1 is mandatory)", () => {
    assert.throws(() => buildPlanningTrace({ ...SAMPLE, definition: "" }), /non-empty definition/);
  });

  it("a boundary-only trace still enumerates every boundary as a step", () => {
    const t = buildPlanningTrace({ ...SAMPLE, scope: [] });
    const bounds = t.steps.filter((s) => s.startsWith("bound:"));
    assert.equal(bounds.length, SAMPLE.boundaries.length);
  });
});

describe("Logos Archon-tyranny pathology guard", () => {
  it("passes a trace that names the household it serves", () => {
    assert.equal(assertPorous(buildPlanningTrace(SAMPLE)).ok, true);
  });

  it("refuses a trace that sets boundaries with no purpose (autonomous law)", () => {
    const tyrannical = buildPlanningTrace({ ...SAMPLE, purpose: "" });
    const r = assertPorous(tyrannical);
    assert.equal(r.ok, false);
    assert.match(r.error!, /Archon-tyranny|purpose|household/i);
  });
});

describe("Logos is grounded in the live constitutional roster", () => {
  it("LOGOS_CF (0/1) resolves back to the logos agent", () => {
    assert.equal(LOGOS_CF, "(0/1)");
    assert.equal(agentForCf(LOGOS_CF), "logos");
  });
});
