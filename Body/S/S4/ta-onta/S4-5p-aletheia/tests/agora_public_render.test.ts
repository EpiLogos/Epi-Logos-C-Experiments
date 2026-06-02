import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { stage, assertPreservesDistinction, type Voice } from "../modules/agora-staging.ts";

// Verification obligation (track 10.T17): "public/current render tests."
// Agora owns public/disclosure staging. Real module, no mocks.

const VOICES: Voice[] = [
  { source: "klotho", content: "traces spun" },
  { source: "lachesis", content: "sources measured" },
  { source: "atropos", content: "insight cut" },
];

describe("Agora public/current render", () => {
  it("renders many voices into one legible field, each distinct", () => {
    const r = stage({ voices: VOICES, surface: "public" });
    assert.equal(r.agent, "agora");
    assert.equal(r.surface, "public");
    assert.equal(r.voices.length, 3);
    for (const v of VOICES) assert.ok(r.field.includes(`## ${v.source}`), `${v.source} present`);
  });

  it("defaults to the current surface", () => {
    assert.equal(stage({ voices: VOICES }).surface, "current");
  });

  it("requires at least one voice", () => {
    assert.throws(() => stage({ voices: [] }), /at least one voice/);
  });

  it("requires every voice to name its source", () => {
    assert.throws(() => stage({ voices: [{ source: "", content: "anon" }] }), /name its source/);
  });
});

describe("Agora distinction-preservation guard", () => {
  it("passes a render that keeps every voice distinct", () => {
    assert.equal(assertPreservesDistinction(stage({ voices: VOICES })).ok, true);
  });

  it("refuses a render with duplicate sources merged", () => {
    const r = stage({ voices: VOICES });
    const tampered = { ...r, voices: [...r.voices, { source: "klotho", content: "dup" }] };
    const res = assertPreservesDistinction(tampered);
    assert.equal(res.ok, false);
    assert.match(res.error!, /distinction erased|duplicate/i);
  });

  it("refuses a render where a voice was dropped from the field (forced consensus)", () => {
    const r = stage({ voices: VOICES });
    const tampered = { ...r, field: "## klotho\ntraces spun" }; // lachesis/atropos erased
    const res = assertPreservesDistinction(tampered);
    assert.equal(res.ok, false);
    assert.match(res.error!, /dropped from the public field/i);
  });
});
