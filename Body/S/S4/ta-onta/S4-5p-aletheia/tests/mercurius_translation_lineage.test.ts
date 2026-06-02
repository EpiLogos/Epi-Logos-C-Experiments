import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import {
  translate,
  assertPreservesCharge,
  carryAcrossMobius,
} from "../modules/mercurius-translation.ts";

// Verification obligation (track 10.T16): "translation-lineage tests."
// Mercurius owns translation/mediation as living passage. Real module, no mocks.

describe("Mercurius translation lineage", () => {
  it("carries a signal across a domain boundary with origin charge intact", () => {
    const t = translate({
      signal: "kairos sun-decan transition",
      from: "S3'/Temporal",
      to: "S1'/Definition",
      originCharge: "decan-qualified temporal signal",
    });
    assert.equal(t.agent, "mercurius");
    assert.deepEqual(t.lineage, ["S3'/Temporal", "S1'/Definition"]);
    assert.equal(assertPreservesCharge(t).ok, true);
  });

  it("records intermediate hops in the lineage", () => {
    const t = translate({
      signal: "s",
      from: "A",
      to: "C",
      originCharge: "charge",
      via: ["B"],
    });
    assert.deepEqual(t.lineage, ["A", "B", "C"]);
  });

  it("requires a signal and both domains", () => {
    assert.throws(() => translate({ signal: "", from: "A", to: "B", originCharge: "c" }), /signal/);
    assert.throws(() => translate({ signal: "s", from: "", to: "B", originCharge: "c" }), /from-domain|to-domain/);
  });
});

describe("Mercurius flattening-equivalence guard", () => {
  it("refuses a translation that dropped the charge of origin", () => {
    const t = translate({ signal: "s", from: "A", to: "B", originCharge: "" });
    const r = assertPreservesCharge(t);
    assert.equal(r.ok, false);
    assert.match(r.error!, /flattening|charge of origin/i);
  });

  it("refuses a same-domain 'translation' (no passage)", () => {
    const t = translate({ signal: "s", from: "A", to: "A", originCharge: "c" });
    assert.equal(assertPreservesCharge(t).ok, false);
  });
});

describe("Mercurius Möbius-seam carry (P5' → P0')", () => {
  it("carries P5' Insight to next-cycle P0' Questions preserving its charge", () => {
    const t = carryAcrossMobius({ insight: "carriers own CF roles", charge: "constitutional ownership" });
    assert.equal(t.from, "P5'");
    assert.equal(t.to, "P0'");
    assert.ok(t.lineage.includes("möbius-seam"));
    assert.equal(assertPreservesCharge(t).ok, true);
  });
});
