import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import {
  DEFAULT_MYTHOS_SYMBOLIC_PROTEIN_CONFIG,
  MythosSymbolicProteinSession,
  assertMythosNarrativeVoiceLaw,
  createMythosArchetypeReading,
  mythosConfigFromResolvedTunables,
  mythosReadingHasRequiredProvenance,
  normalizeMythosSymbolicProteinConfig,
  type MythosReadingEvent,
  type MythosSymbolicProteinConfigOverrides,
} from "../modules/symbolic-protein-reader.ts";

const HANDLE = "m4-protein://session/session-test/1700000000000";

function event(
  kind: MythosReadingEvent["kind"],
  sequence: number,
  occurredAtMs = sequence * 1_000,
): MythosReadingEvent {
  return {
    kind,
    occurredAtMs,
    kairosPulseRef: `[[Kairos pulse ${sequence}]]`,
    chain: {
      proteinHandle: HANDLE,
      chainPosition: sequence,
      chainFingerprint: `blake3:chain-${sequence}`,
    },
    cosmicWeather: {
      m1SpandaTick: 2,
      m2CymaticPhase: 11,
      m3CodonTranscriptionState: 19,
      profileHandle: "matheme-profile://generation/42",
    },
    provenance: {
      sessionRef: "[[Session session-test]]",
      chainPositionRef: `[[Session session-test#codon-${sequence}]]`,
      cosmicWeatherSnapshotRef: `[[Cosmic weather ${sequence}]]`,
      kairosPulseRef: `[[Kairos pulse ${sequence}]]`,
    },
  };
}

function runTen(
  kind: "user-utterance" | "kairos-pulse",
  overrides: MythosSymbolicProteinConfigOverrides,
) {
  const session = new MythosSymbolicProteinSession({
    sessionId: "session-test",
    proteinHandle: HANDLE,
    config: normalizeMythosSymbolicProteinConfig(overrides),
  });
  for (let i = 1; i <= 10; i++) session.consume(event(kind, i));
  return session.snapshot();
}

describe("Mythos symbolic-protein trigger law", () => {
  it("fires every configured user-utterance interval across ten utterances", () => {
    const snapshot = runTen("user-utterance", {
      triggerMode: "every-nth-utterance",
      utteranceIntervalN: 5,
    });
    assert.equal(snapshot.readingHistory.length, 2);
    assert.deepEqual(snapshot.readingHistory.map((reading) => reading.chainPosition), [5, 10]);
  });

  it("fires every configured Mercurius pulse interval across ten pulses", () => {
    const snapshot = runTen("kairos-pulse", {
      triggerMode: "every-mth-kairos-pulse",
      kairosPulseIntervalM: 3,
    });
    assert.equal(snapshot.readingHistory.length, 3);
    assert.deepEqual(snapshot.readingHistory.map((reading) => reading.chainPosition), [3, 6, 9]);
  });

  it("fires from either interval in hybrid mode without double-counting events", () => {
    const session = new MythosSymbolicProteinSession({
      sessionId: "session-test",
      proteinHandle: HANDLE,
      config: normalizeMythosSymbolicProteinConfig({
        triggerMode: "hybrid-utterance-and-pulse",
        utteranceIntervalN: 2,
        kairosPulseIntervalM: 3,
      }),
    });
    for (let i = 1; i <= 5; i++) {
      session.consume(event("user-utterance", i * 2 - 1));
      session.consume(event("kairos-pulse", i * 2));
    }
    assert.equal(session.snapshot().readingHistory.length, 3);
  });

  it("uses both adaptive floor and ceiling", () => {
    const session = new MythosSymbolicProteinSession({
      sessionId: "session-test",
      proteinHandle: HANDLE,
      config: normalizeMythosSymbolicProteinConfig({
        triggerMode: "adaptive",
        utteranceIntervalN: 2,
        adaptiveFloorSeconds: 10,
        adaptiveCeilingSeconds: 30,
      }),
    });
    session.consume(event("user-utterance", 1, 0));
    session.consume(event("user-utterance", 2, 5_000));
    session.consume(event("user-utterance", 3, 12_000));
    session.consume(event("user-utterance", 4, 15_000));
    session.consume(event("kairos-pulse", 5, 45_000));
    assert.deepEqual(
      session.snapshot().readingHistory.map((reading) => reading.chainPosition),
      [1, 4, 5],
    );
  });
});

describe("Mythos reading and session-close binding", () => {
  it("appends in-session reads and makes the final close read load-bearing", () => {
    const session = new MythosSymbolicProteinSession({
      sessionId: "session-test",
      proteinHandle: HANDLE,
      config: normalizeMythosSymbolicProteinConfig({
        triggerMode: "every-nth-utterance",
        utteranceIntervalN: 2,
      }),
    });
    session.consume(event("user-utterance", 1));
    session.consume(event("user-utterance", 2));
    const closeResult = session.consume(event("session-close", 3));
    const snapshot = session.snapshot();

    assert.equal(closeResult.triggered, true);
    assert.equal(snapshot.closed, true);
    assert.equal(snapshot.readingHistory.length, 2);
    assert.equal(snapshot.mythosArchetypeReading?.readingId, closeResult.reading?.readingId);
    assert.equal(snapshot.mythosArchetypeReading?.chainPosition, 3);
    assert.throws(() => session.consume(event("kairos-pulse", 4)), /already closed/);
  });

  it("keeps the protected protein body out of the reader state", () => {
    const session = new MythosSymbolicProteinSession({
      sessionId: "session-test",
      proteinHandle: HANDLE,
    });
    const snapshot = session.snapshot() as unknown as Record<string, unknown>;
    assert.equal(snapshot.proteinHandle, HANDLE);
    assert.equal("body" in snapshot, false);
    assert.equal("codons" in snapshot, false);
  });
});

describe("Mythos voice and provenance law", () => {
  it("rejects identity claims and applies stricter cosmic-weather grounding", () => {
    assert.equal(assertMythosNarrativeVoiceLaw("This session is Death.", "permissive").ok, false);
    assert.equal(assertMythosNarrativeVoiceLaw("A recurring pattern appears.", "standard").ok, false);
    assert.equal(
      assertMythosNarrativeVoiceLaw("This session's codon arc figures archetype Death.", "strict").ok,
      false,
    );
    assert.equal(
      assertMythosNarrativeVoiceLaw(
        "This session's codon arc figures archetype Major Arcana #13 under cosmic-weather M1, M2, and M3.",
        "strict",
      ).ok,
      true,
    );
  });

  it("requires all four provenance values to be wikilinks", () => {
    const reading = createMythosArchetypeReading({
      event: event("kairos-pulse", 3),
      config: DEFAULT_MYTHOS_SYMBOLIC_PROTEIN_CONFIG,
    });
    assert.equal(mythosReadingHasRequiredProvenance(reading), true);
    assert.throws(
      () => createMythosArchetypeReading({
        event: {
          ...event("kairos-pulse", 3),
          provenance: { ...event("kairos-pulse", 3).provenance, sessionRef: "session-test" },
        },
        config: DEFAULT_MYTHOS_SYMBOLIC_PROTEIN_CONFIG,
      }),
      /wikilink/,
    );
  });
});

describe("resolved tunables and cosmic-weather binding", () => {
  it("maps every declared config key into the frozen session configuration", () => {
    const config = mythosConfigFromResolvedTunables({
      "mythos.symbolic_protein_reading.trigger_mode": "adaptive",
      "mythos.symbolic_protein_reading.utterance_interval_n": 7,
      "mythos.symbolic_protein_reading.kairos_pulse_interval_m": 4,
      "mythos.symbolic_protein_reading.adaptive_floor_seconds": 120,
      "mythos.symbolic_protein_reading.adaptive_ceiling_seconds": 900,
      "mythos.symbolic_protein_reading.cosmic_weather_weights": { m1: 0.7, m2: 0.2, m3: 0.1 },
      "mythos.symbolic_protein_reading.secondary_archetypes_count": 4,
      "mythos.symbolic_protein_reading.voice_template_path": "/tmp/mythos-voice.md",
      "mythos.symbolic_protein_reading.reification_guard_strictness": "strict",
    });
    assert.deepEqual(config, {
      triggerMode: "adaptive",
      utteranceIntervalN: 7,
      kairosPulseIntervalM: 4,
      adaptiveFloorSeconds: 120,
      adaptiveCeilingSeconds: 900,
      cosmicWeatherWeights: { m1: 0.7, m2: 0.2, m3: 0.1 },
      secondaryArchetypesCount: 4,
      voiceTemplatePath: "/tmp/mythos-voice.md",
      reificationGuardStrictness: "strict",
    });
    const reading = createMythosArchetypeReading({ event: event("kairos-pulse", 4), config });
    assert.equal(reading.secondaryPatternArcanas.length, 4);
    assert.equal(reading.voiceTemplatePath, "/tmp/mythos-voice.md");
    assert.equal(reading.reificationGuardStrictness, "strict");
  });

  it("changes the dominant archetype when weather weights change on the same chain", () => {
    const source = event("kairos-pulse", 8);
    const m1Dominant = createMythosArchetypeReading({
      event: source,
      config: normalizeMythosSymbolicProteinConfig({ cosmicWeatherWeights: { m1: 1, m2: 0, m3: 0 } }),
    });
    const m3Dominant = createMythosArchetypeReading({
      event: source,
      config: normalizeMythosSymbolicProteinConfig({ cosmicWeatherWeights: { m1: 0, m2: 0, m3: 1 } }),
    });
    assert.notEqual(
      m1Dominant.dominantChromosomeArcana.cardId,
      m3Dominant.dominantChromosomeArcana.cardId,
    );
  });

  it("rejects invalid normalized settings instead of silently weakening the contract", () => {
    assert.throws(
      () => normalizeMythosSymbolicProteinConfig({ cosmicWeatherWeights: { m1: 0.5, m2: 0.5, m3: 0.5 } }),
      /sum to 1/,
    );
    assert.throws(
      () => normalizeMythosSymbolicProteinConfig({ adaptiveFloorSeconds: 100, adaptiveCeilingSeconds: 99 }),
      /ceiling/,
    );
  });
});
