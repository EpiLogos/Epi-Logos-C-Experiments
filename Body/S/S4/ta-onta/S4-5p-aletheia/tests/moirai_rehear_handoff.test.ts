import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import {
  gatherRehear,
  assertCompleteRehear,
  missingAspects,
  handoffToEpii,
  type RehearOutputs,
} from "../modules/moirai-rehear.ts";

// Verification obligation (track 10.T14): "rehear/handoff tests."
// Moirai owns the rehear / Night' handoff (gather → release). Real module, no mocks.

const FULL: RehearOutputs = {
  klotho: "trace: temporal-frame extracted",
  lachesis: "source: S4-3'-SPEC build contract",
  atropos: "insight: carrier owns day-id/NOW-path law",
};

describe("Moirai rehear gather", () => {
  it("gathers all three aspects into a Night' rehear bundle", () => {
    const b = gatherRehear(FULL);
    assert.equal(b.agent, "moirai");
    assert.equal(b.cs_direction, "Night'");
    assert.equal(b.p1_traces, FULL.klotho);
    assert.equal(b.p4_sources, FULL.lachesis);
    assert.equal(b.p5_insight, FULL.atropos);
  });

  it("reports which aspects are missing", () => {
    assert.deepEqual(missingAspects({ klotho: "t" }), ["lachesis", "atropos"]);
    assert.deepEqual(missingAspects(FULL), []);
  });
});

describe("Moirai rehear completeness invariant (avaroha → ascent)", () => {
  it("refuses to gather an incomplete rehear (cut depends on full descent)", () => {
    assert.throws(() => gatherRehear({ klotho: "t", lachesis: "s" }), /incomplete rehear|missing/i);
  });

  it("assertCompleteRehear names the missing aspect", () => {
    const r = assertCompleteRehear({ klotho: "t", atropos: "i" });
    assert.equal(r.ok, false);
    assert.deepEqual(r.missing, ["lachesis"]);
  });

  it("an empty-string aspect counts as missing", () => {
    assert.equal(assertCompleteRehear({ ...FULL, atropos: "   " }).ok, false);
  });
});

describe("Moirai Night' handoff to Epii (ascent into release)", () => {
  it("releases the bundle as a rehear-closure handoff targeting Epii", () => {
    const h = handoffToEpii(gatherRehear(FULL));
    assert.equal(h.closure_kind, "rehear");
    assert.equal(h.target, "epii");
    assert.equal(h.cs_direction, "Night'");
    assert.equal(h.p5_insight, FULL.atropos);
  });
});
