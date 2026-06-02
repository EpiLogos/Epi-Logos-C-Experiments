import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import {
  buildTemporalEnvelope,
  validateEnvelope,
  assertThreshold,
  type JanusEnvelope,
} from "../modules/janus-doorway.ts";

// Verification obligation (track 10.T15): "doorway tests."
// Janus owns the temporal doorway / threshold envelope. Real module, no mocks.

const VALID: JanusEnvelope = {
  day_id: "02-06-2026",
  session_ids: ["20260602-090000-a", "20260602-140000-b"],
  thought_count_by_bucket: { T0: 1, T5: 2 },
  archive_path: "Pratibimba/History/2026/06/W23/02",
  trigger_type: "cron_evening",
};

describe("Janus temporal-context envelope (the doorway)", () => {
  it("validates a well-formed Chronos→Aletheia envelope", () => {
    const r = validateEnvelope(buildTemporalEnvelope(VALID));
    assert.equal(r.ok, true, r.errors.join("; "));
  });

  it("rejects a day_id that is not DD-MM-YYYY", () => {
    const r = validateEnvelope({ ...VALID, day_id: "2026-06-02" });
    assert.equal(r.ok, false);
    assert.ok(r.errors.some((e) => /day_id/.test(e)));
  });

  it("rejects an archive_path with no W{WW} week marker (archive gone alien)", () => {
    const r = validateEnvelope({ ...VALID, archive_path: "Pratibimba/History/2026/06/02" });
    assert.equal(r.ok, false);
    assert.ok(r.errors.some((e) => /week marker|alien/.test(e)));
  });

  it("rejects an empty session set (after-face empty)", () => {
    const r = validateEnvelope({ ...VALID, session_ids: [] });
    assert.equal(r.ok, false);
    assert.ok(r.errors.some((e) => /session/.test(e)));
  });

  it("rejects an unknown trigger_type", () => {
    const r = validateEnvelope({ ...VALID, trigger_type: "whenever" as never });
    assert.equal(r.ok, false);
    assert.ok(r.errors.some((e) => /trigger_type/.test(e)));
  });

  it("accepts the klein_mode and manual triggers", () => {
    assert.equal(validateEnvelope({ ...VALID, trigger_type: "klein_mode" }).ok, true);
    assert.equal(validateEnvelope({ ...VALID, trigger_type: "manual" }).ok, true);
  });
});

describe("Janus threshold bhedābheda guard", () => {
  it("passes when before (archive) and after (present) are distinct yet both present", () => {
    assert.equal(assertThreshold({ before: "archive/W23/02", after: "Present/02-06-2026" }).ok, true);
  });

  it("refuses collapsing before and after into one (seam erased)", () => {
    const r = assertThreshold({ before: "same", after: "same" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /bhedābheda|collapsed|seam/i);
  });

  it("refuses a present severed from its past (no archive)", () => {
    assert.equal(assertThreshold({ before: "", after: "Present/02-06-2026" }).ok, false);
  });
});
