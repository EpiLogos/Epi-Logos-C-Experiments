import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import {
  buildLineage,
  assertProvenance,
  provenanceChain,
  type LineageTrace,
} from "../modules/anansi-lineage.ts";

// Verification obligation (track 10.T13): "lineage tests."
// Anansi owns the disclosure-lineage role. Real module, no mocks.

const TRACES: LineageTrace[] = [
  { note: "Chronos was intended to own temporal frame", source: "[[S4-3'-SPEC]]" },
  { note: "Chronos now also owns graphiti day-arc seam", source: "[[graphiti-day-arc]]" },
];

describe("Anansi disclosure lineage", () => {
  it("holds /Empty intention against /Present reality", () => {
    const l = buildLineage({ intended: "carrier owns temporal triggers", became: "carrier owns triggers + arc seam", traces: TRACES });
    assert.equal(l.agent, "anansi");
    assert.equal(l.intended, "carrier owns temporal triggers");
    assert.equal(l.became, "carrier owns triggers + arc seam");
  });

  it("requires both the intended and became poles", () => {
    assert.throws(() => buildLineage({ intended: "", became: "x", traces: [] }), /intended.*became/i);
    assert.throws(() => buildLineage({ intended: "x", became: "", traces: [] }), /intended.*became/i);
  });

  it("exposes the ordered wikilink provenance chain", () => {
    const l = buildLineage({ intended: "a", became: "b", traces: TRACES });
    assert.deepEqual(provenanceChain(l), ["[[S4-3'-SPEC]]", "[[graphiti-day-arc]]"]);
  });
});

describe("Anansi provenance (narrative-fog) guard", () => {
  it("passes a lineage where every trace carries [[wikilink]] provenance", () => {
    const l = buildLineage({ intended: "a", became: "b", traces: TRACES });
    assert.equal(assertProvenance(l).ok, true);
  });

  it("refuses a trace with no wikilink source (narrative fog)", () => {
    const l = buildLineage({
      intended: "a",
      became: "b",
      traces: [{ note: "vague recollection", source: "a meeting last week" }],
    });
    const r = assertProvenance(l);
    assert.equal(r.ok, false);
    assert.match(r.error!, /narrative-fog|provenance/i);
  });

  it("refuses an empty source string", () => {
    const l = buildLineage({ intended: "a", became: "b", traces: [{ note: "n", source: "" }] });
    assert.equal(assertProvenance(l).ok, false);
  });
});
