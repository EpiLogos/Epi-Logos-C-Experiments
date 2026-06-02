import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import {
  detectPattern,
  assertAttributed,
  assertNotSeveredNovelty,
  attributionLine,
} from "../modules/zeithoven-autoresearch.ts";

// Verification obligation (track 10.T18): "autoresearch pattern tests with
// explicit subagent attribution." Zeithoven owns pattern-detection /
// improvement-context. Real module, no mocks.

const ENTRY = detectPattern({
  pattern: "carriers repeatedly inlined day-id computation",
  nextForm: "schedule a dedup sweep extracting shared temporal helpers",
  attribution: "lachesis",
  source: "[[02-06-2026 Night' disclosure]]",
});

describe("Zeithoven autoresearch pattern detection", () => {
  it("produces an attributed, source-anchored improvement context", () => {
    assert.equal(ENTRY.agent, "zeithoven");
    assert.equal(ENTRY.attribution, "lachesis");
    assert.ok(ENTRY.source.length > 0);
    assert.equal(assertAttributed(ENTRY).ok, true);
    assert.equal(assertNotSeveredNovelty(ENTRY).ok, true);
  });

  it("requires both a detected pattern and a next-form", () => {
    assert.throws(() => detectPattern({ pattern: "", nextForm: "x", attribution: "a", source: "s" }), /detected pattern/);
    assert.throws(() => detectPattern({ pattern: "p", nextForm: "", attribution: "a", source: "s" }), /next-form/);
  });

  it("renders an attribution line naming the surfacing subagent and source", () => {
    const line = attributionLine(ENTRY);
    assert.match(line, /via lachesis/);
    assert.match(line, /from \[\[02-06-2026 Night' disclosure\]\]/);
  });
});

describe("Zeithoven explicit-attribution invariant", () => {
  it("refuses an entry with no surfacing subagent named", () => {
    const anon = detectPattern({ pattern: "p", nextForm: "f", attribution: "", source: "s" });
    const r = assertAttributed(anon);
    assert.equal(r.ok, false);
    assert.match(r.error!, /attribution missing|surfacing subagent/i);
  });
});

describe("Zeithoven severed-novelty guard", () => {
  it("refuses a next-form with no source disclosure (novelty for its own sake)", () => {
    const severed = detectPattern({ pattern: "p", nextForm: "f", attribution: "atropos", source: "" });
    const r = assertNotSeveredNovelty(severed);
    assert.equal(r.ok, false);
    assert.match(r.error!, /severed-novelty|novelty for its own sake/i);
  });
});
