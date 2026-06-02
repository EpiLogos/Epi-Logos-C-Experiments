import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import {
  computeDayId,
  nowPath,
  directionForRun,
  temporalFrame,
} from "../modules/temporal-frame.ts";

describe("Chronos temporal frame — Build Contract", () => {
  // Local-component date → independent of the runner's timezone.
  const june2 = new Date(2026, 5, 2);

  it("computeDayId yields canonical DD-MM-YYYY", () => {
    assert.equal(computeDayId(june2), "02-06-2026");
  });

  it("nowPath anchors at Idea/Empty/Present/{dayId}/{sessionId}/now.md", () => {
    assert.equal(
      nowPath("02-06-2026", "20260602-103000-main"),
      "Idea/Empty/Present/02-06-2026/20260602-103000-main/now.md",
    );
  });

  it("nowPath refuses a missing day id or session id", () => {
    assert.throws(() => nowPath("", "s"), /dayId is required/);
    assert.throws(() => nowPath("02-06-2026", ""), /sessionId is required/);
  });

  it("directionForRun folds Night' back to Möbius, flows everything else outward", () => {
    assert.equal(directionForRun("Day"), "Day");
    assert.equal(directionForRun("cron"), "Day");
    assert.equal(directionForRun("manual"), "Day");
    assert.equal(directionForRun("Night'"), "Night'");
  });

  it("temporalFrame assembles day id, NOW path, session, direction, run kind", () => {
    const f = temporalFrame({ sessionId: "20260602-103000-main", runKind: "Day", when: june2 });
    assert.deepEqual(f, {
      dayId: "02-06-2026",
      nowPath: "Idea/Empty/Present/02-06-2026/20260602-103000-main/now.md",
      sessionId: "20260602-103000-main",
      csDirection: "Day",
      runKind: "Day",
    });
  });

  it("temporalFrame distinguishes a Night' rehear run", () => {
    const f = temporalFrame({ sessionId: "20260602-235900-mobius", runKind: "Night'", when: june2 });
    assert.equal(f.runKind, "Night'");
    assert.equal(f.csDirection, "Night'");
  });

  it("temporalFrame honours an explicit CS direction override (cron Night' pass)", () => {
    const f = temporalFrame({
      sessionId: "cron-mobius",
      runKind: "cron",
      when: june2,
      csDirection: "Night'",
    });
    assert.equal(f.runKind, "cron");
    assert.equal(f.csDirection, "Night'");
  });

  it("temporalFrame refuses a dispatch with no session id", () => {
    assert.throws(() => temporalFrame({ sessionId: "", runKind: "Day" }), /sessionId is required/);
  });
});
