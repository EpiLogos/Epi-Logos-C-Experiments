import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import {
  synthesize,
  assertOpens,
  recursiveReview,
  assertGoverned,
  SOPHIA_CF,
} from "../modules/sophia-synthesis.ts";
import { agentForCf } from "../modules/dispatch-validate.ts";

// Verification obligation (track 10.T12): "recursive-governance tests."
// Sophia owns synthesis / recursive review / anti-hoarding. Real module, no mocks.

describe("Sophia synthesis opens, not closes", () => {
  it("a synthesis carries its P5' insight and opens P0' questions", () => {
    const s = synthesize({ insight: "carriers are owned per CF", opensQuestions: ["what owns mediation?"] });
    assert.equal(s.agent, "sophia");
    assert.equal(s.cf, SOPHIA_CF);
    assert.equal(s.round, 0);
    assert.equal(assertOpens(s).ok, true);
  });

  it("refuses a synthesis that opens no questions (Sophia's-error / hoarding)", () => {
    const closed = synthesize({ insight: "done, nothing more", opensQuestions: [] });
    const r = assertOpens(closed);
    assert.equal(r.ok, false);
    assert.match(r.error!, /Sophia's-error|opens|hoard|close/i);
  });

  it("requires a non-empty insight", () => {
    assert.throws(() => synthesize({ insight: "", opensQuestions: ["q"] }), /non-empty/);
  });
});

describe("Sophia recursive review (Klein-bottle P5'→P0')", () => {
  const r0 = synthesize({ insight: "insight-0", opensQuestions: ["q1", "q2"] });

  it("the next round is seeded by the prior round's questions and advances", () => {
    const r1 = recursiveReview(r0, { insight: "insight-1", opensQuestions: ["q3"] });
    assert.equal(r1.round, 1);
    assert.deepEqual(r1.seededBy, ["q1", "q2"]);
    assert.equal(assertGoverned(r0, r1).ok, true);
  });

  it("cannot recurse from a closed (hoarding) synthesis", () => {
    const closed = synthesize({ insight: "closed", opensQuestions: [] });
    assert.throws(() => recursiveReview(closed, { insight: "x", opensQuestions: ["q"] }), /closed synthesis/);
  });

  it("detects a round that did not advance", () => {
    const fake = { ...r0, seededBy: r0.questions }; // same round index
    const res = assertGoverned(r0, fake as typeof r0);
    assert.equal(res.ok, false);
    assert.match(res.error!, /did not advance/i);
  });

  it("detects a round not seeded by the prior questions (broken loop)", () => {
    const r1bad = recursiveReview(r0, { insight: "i1", opensQuestions: ["q3"] });
    const tampered = { ...r1bad, seededBy: ["unrelated"] };
    const res = assertGoverned(r0, tampered);
    assert.equal(res.ok, false);
    assert.match(res.error!, /recursive-governance broken/i);
  });

  it("detects a round that terminates the recursion (opens nothing)", () => {
    const terminal = { ...recursiveReview(r0, { insight: "i1", opensQuestions: ["q3"] }), questions: [] as string[] };
    const res = assertGoverned(r0, terminal);
    assert.equal(res.ok, false);
  });
});

describe("Sophia is grounded in the live constitutional roster", () => {
  it("SOPHIA_CF (5/0) resolves back to the sophia agent", () => {
    assert.equal(SOPHIA_CF, "(5/0)");
    assert.equal(agentForCf(SOPHIA_CF), "sophia");
  });
});
