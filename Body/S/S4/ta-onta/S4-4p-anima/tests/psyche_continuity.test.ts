import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import {
  openSession,
  handoff,
  assertContinuity,
  assertNotSchismogenic,
  PSYCHE_CF,
  DEFAULT_MAX_CARRY,
} from "../modules/psyche-continuity.ts";
import { agentForCf } from "../modules/dispatch-validate.ts";

// Verification obligation (track 10.T11): "continuity tests across session/handoff
// flows." Psyche owns continuity / NOW state / handoff. Real module, no mocks.

describe("Psyche NOW state", () => {
  it("derives the canonical NOW path from the Chronos temporal-frame law", () => {
    const s = openSession({ sessionId: "20260602-103000-main", dayId: "02-06-2026" });
    assert.equal(s.nowPath, "Idea/Empty/Present/02-06-2026/20260602-103000-main/now.md");
    assert.equal(s.agent, "psyche");
    assert.equal(s.cf, PSYCHE_CF);
  });
});

describe("Psyche handoff continuity", () => {
  const s1 = openSession({ sessionId: "20260602-090000-a", dayId: "02-06-2026", carryForward: ["thread-x"] });

  it("a handoff links the next session back to the prior (continuity)", () => {
    const s2 = handoff(s1, { sessionId: "20260602-140000-b", dayId: "02-06-2026", carryForward: ["thread-x"] });
    assert.equal(s2.priorSessionId, s1.sessionId);
    assert.equal(assertContinuity(s1, s2).ok, true);
    assert.equal(s2.nowPath, "Idea/Empty/Present/02-06-2026/20260602-140000-b/now.md");
  });

  it("handoff across a day boundary still preserves the continuity link", () => {
    const s2 = handoff(s1, { sessionId: "20260603-090000-c", dayId: "03-06-2026", carryForward: [] });
    assert.equal(s2.dayId, "03-06-2026");
    assert.equal(assertContinuity(s1, s2).ok, true);
  });

  it("refuses re-opening the same NOW (continuity without stagnation)", () => {
    assert.throws(
      () => handoff(s1, { sessionId: s1.sessionId, dayId: s1.dayId, carryForward: [] }),
      /stagnation/,
    );
  });

  it("detects a broken continuity link", () => {
    const orphan = openSession({ sessionId: "20260602-140000-b", dayId: "02-06-2026" }); // no priorSessionId
    const r = assertContinuity(s1, orphan);
    assert.equal(r.ok, false);
    assert.match(r.error!, /continuity broken/i);
  });
});

describe("Psyche schismogenesis pathology guard", () => {
  it("passes a curated carry-forward within the bound", () => {
    const s = openSession({
      sessionId: "s",
      dayId: "02-06-2026",
      carryForward: Array.from({ length: DEFAULT_MAX_CARRY }, (_, i) => `t${i}`),
    });
    assert.equal(assertNotSchismogenic(s).ok, true);
  });

  it("refuses an unbounded carry-forward (regulatory weight suffocates)", () => {
    const s = openSession({
      sessionId: "s",
      dayId: "02-06-2026",
      carryForward: Array.from({ length: DEFAULT_MAX_CARRY + 1 }, (_, i) => `t${i}`),
    });
    const r = assertNotSchismogenic(s);
    assert.equal(r.ok, false);
    assert.match(r.error!, /Schismogenesis|exceeds the bound/i);
  });
});

describe("Psyche is grounded in the live constitutional roster", () => {
  it("PSYCHE_CF (4.5/0) resolves back to the psyche agent", () => {
    assert.equal(PSYCHE_CF, "(4.5/0)");
    assert.equal(agentForCf(PSYCHE_CF), "psyche");
  });
});
