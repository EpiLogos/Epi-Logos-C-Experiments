import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import {
  buildTemporalEnvelope,
  validateEnvelope,
  assertThreshold,
  janus_track_spreads,
  janus_evaluate_aliveness,
  janus_spread_resolved,
  janus_weight_session,
  type JanusEnvelope,
  type OracleSpreadPosition,
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

const BASE_POSITION: OracleSpreadPosition = {
  spread_id: "spread-12",
  position_idx: 0,
  card_id: 1,
  card_kind: "tarot_major",
  card_name: "The Magician",
  drawn_at: "2026-06-01T09:00:00.000Z",
  drawn_in_session: "session-a",
  live_state: "generating",
  recognition_count: 0,
  klein_face: "prospective",
  ruling_planet: "Mercury",
  decan: "Gemini I",
};

describe("Janus OracleSpread aliveness tracking", () => {
  it("tracks live recognitions from real note text by card, planet, decan, and live-spread highlight", () => {
    const tracked = janus_track_spreads({
      session_id: "session-a",
      positions: [
        BASE_POSITION,
        {
          ...BASE_POSITION,
          position_idx: 1,
          card_id: 17,
          card_name: "The Star",
          ruling_planet: "Saturn",
          decan: "Aquarius III",
        },
      ],
      daily_notes: [
        {
          session_id: "session-a",
          noted_at: "2026-06-03T12:00:00.000Z",
          body: "live-spread: The Magician keeps showing as Mercury speech in Gemini I.",
        },
        {
          session_id: "session-a",
          noted_at: "2026-05-30T12:00:00.000Z",
          body: "The Star appeared before the spread was placed and must not count.",
        },
      ],
    });

    assert.equal(tracked[0].recognition_count, 1);
    assert.equal(tracked[0].last_recognition_at, "2026-06-03T12:00:00.000Z");
    assert.equal(tracked[1].recognition_count, 0);
  });

  it("marks unrecognised positions as muting after 14 days unless a target aspect is active within seven days", () => {
    const stale = janus_evaluate_aliveness({
      spread_id: "spread-12",
      now: "2026-06-16T10:00:00.000Z",
      positions: [BASE_POSITION],
    });
    const aspectHeld = janus_evaluate_aliveness({
      spread_id: "spread-12",
      now: "2026-06-16T10:00:00.000Z",
      positions: [
        {
          ...BASE_POSITION,
          target_aspect: {
            planet_a: 2,
            aspect_kind: "trine",
            planet_b_or_natal: 0,
            exact_at: "2026-06-20T10:00:00.000Z",
          },
        },
      ],
    });

    assert.equal(stale[0].live_state, "muting");
    assert.equal(stale[0].state_changed_at, "2026-06-16T10:00:00.000Z");
    assert.equal(aspectHeld[0].live_state, "generating");
  });

  it("mutes positions after seven more days without recognition and reopens mute positions at target-aspect exactness", () => {
    const muted = janus_evaluate_aliveness({
      spread_id: "spread-12",
      now: "2026-06-23T11:00:00.000Z",
      positions: [
        {
          ...BASE_POSITION,
          live_state: "muting",
          state_changed_at: "2026-06-16T10:00:00.000Z",
        },
      ],
    });
    const reopened = janus_evaluate_aliveness({
      spread_id: "spread-12",
      now: "2026-06-23T11:00:00.000Z",
      positions: [
        {
          ...BASE_POSITION,
          live_state: "mute",
          state_changed_at: "2026-06-16T10:00:00.000Z",
          target_aspect: {
            planet_a: 2,
            aspect_kind: "conjunction",
            planet_b_or_natal: 0,
            exact_at: "2026-06-23T20:00:00.000Z",
          },
        },
      ],
    });

    assert.equal(muted[0].live_state, "mute");
    assert.equal(reopened[0].live_state, "generating");
  });

  it("resolves a spread only when every position is mute", () => {
    assert.equal(
      janus_spread_resolved({
        spread_id: "spread-12",
        now: "2026-06-24T00:00:00.000Z",
        positions: [
          { ...BASE_POSITION, live_state: "mute" },
          { ...BASE_POSITION, position_idx: 1, live_state: "mute" },
        ],
      }).resolved,
      true,
    );
    assert.equal(
      janus_spread_resolved({
        spread_id: "spread-12",
        now: "2026-06-24T00:00:00.000Z",
        positions: [
          { ...BASE_POSITION, live_state: "mute" },
          { ...BASE_POSITION, position_idx: 1, live_state: "muting" },
        ],
      }).resolved,
      false,
    );
  });
});

describe("Janus Klein weighting", () => {
  it("computes c_3_klein_weighting from live kairos degrees and explicit motion signals", () => {
    const weighted = janus_weight_session({
      session_id: "session-a",
      M4_Temporal_Now: {
        planet_degrees: [20, 22, 81, 130, 240, 302, 315, 10, 44, 288],
      },
      natal_planet_degrees: [110, 0, 0, 0, 0, 0, 314, 0, 0, 0],
      kairos_signals: {
        saturn_station: true,
        mercury_direct_station: true,
      },
    });

    assert.deepEqual(weighted.c_3_klein_weighting, {
      prospective: 0.2,
      retrospective: 0.8,
    });
    assert.ok(weighted.basis.some((b) => /Saturn station/.test(b)));
    assert.ok(weighted.basis.some((b) => /Saturn return/.test(b)));
    assert.ok(weighted.basis.some((b) => /Mercury direct station/.test(b)));
  });

  it("treats a user override as absolute and normalises complements", () => {
    const weighted = janus_weight_session({
      session_id: "session-a",
      M4_Temporal_Now: {
        planet_degrees: [20, 22, 81, 130, 240, 302, 315, 10, 44, 288],
      },
      user_override: { prospective: 0.73 },
    });

    assert.deepEqual(weighted.c_3_klein_weighting, {
      prospective: 0.73,
      retrospective: 0.27,
    });
    assert.deepEqual(weighted.basis, ["user override"]);
  });
});
