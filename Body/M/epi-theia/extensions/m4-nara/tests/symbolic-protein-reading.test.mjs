import test from 'node:test';
import assert from 'node:assert/strict';

import {
    appendMythosReadingToSymbolicProtein,
    applyMythosReadingTriggerEvent,
    assertMythosNarrativeVoiceLaw,
    closeSymbolicProteinWithMythosReading,
    createMythosArchetypeReading,
    isSymbolicProtein,
    mythosCosmicWeatherSnapshotFromProfile,
    mythosReadingHasRequiredProvenance,
    mythosSymbolicProteinReadingConfigFromToml,
    mythosSymbolicProteinReadingDefaultsToml,
    normalizeMythosSymbolicProteinReadingConfig
} from '../lib/common/symbolic-protein.js';

const baseProtein = Object.freeze({
    proteinId: 'protein-alpha',
    frameId: 'frame-alpha',
    chainSequence: Object.freeze([
        Object.freeze({ ordinal: 0, packetRef: 'packet://0', tarotRef: 'major-arcana://13-death', codonRef: 'codon://AUG', cpPositionRef: '[[L3.P4]]' }),
        Object.freeze({ ordinal: 1, packetRef: 'packet://1', tarotRef: 'major-arcana://19-sun', codonRef: 'codon://UAA', cpPositionRef: '[[L4.P2]]' }),
        Object.freeze({ ordinal: 2, packetRef: 'packet://2', tarotRef: 'major-arcana://16-tower', codonRef: 'codon://UGA', cpPositionRef: '[[L2.P3]]' })
    ]),
    foldingState: 'active',
    activationMarkers: Object.freeze([
        Object.freeze({ markerId: 'start', positionRef: '[[chain:0]]', state: 'start', sourceHandle: 'protected-local://protein-alpha/start' })
    ]),
    sequenceMode: 'symbolic-orf',
    graphProvenanceHandles: Object.freeze(['graphiti://protected/session/session-alpha']),
    patternPacketHandle: 'protected-local://pattern-packet/alpha'
});

const provenance = Object.freeze({
    sessionRef: '[[session-alpha]]',
    chainPositionRef: '[[protein-alpha#chain-3]]',
    cosmicWeatherSnapshotRef: '[[cosmic-weather-alpha]]',
    kairosPulseRef: '[[kairos-pulse-3]]'
});

const weather = Object.freeze({
    m1SpandaTick: 4,
    m2CymaticPhase: 'saturn-dominant-phase',
    m3CodonTranscriptionState: 'tail-marker-open',
    mathemeHarmonicProfileHandle: 'profile://generation/11',
    dominantPlanet: 'saturn',
    planetDegrees: Object.freeze([4, 8, 15, 16, 23, 42, 108, 144, 233, 377])
});

test('config TOML defaults expose every conservative Mythos symbolic-protein knob', () => {
    const toml = mythosSymbolicProteinReadingDefaultsToml();

    for (const key of [
        'trigger_mode',
        'utterance_interval_n',
        'kairos_pulse_interval_m',
        'adaptive_floor_seconds',
        'adaptive_ceiling_seconds',
        'secondary_archetypes_count',
        'voice_template_path',
        'reification_guard_strictness',
        'm1',
        'm2',
        'm3'
    ]) {
        assert.match(toml, new RegExp(`\\b${key}\\b`));
    }
    assert.match(toml, /\[mythos\.symbolic_protein_reading\]/);
    assert.match(toml, /\[mythos\.symbolic_protein_reading\.cosmic_weather_weights\]/);
});

test('config TOML override honors every tunable knob', () => {
    const config = mythosSymbolicProteinReadingConfigFromToml(`
[mythos.symbolic_protein_reading]
trigger_mode = "adaptive"
utterance_interval_n = 2
kairos_pulse_interval_m = 4
adaptive_floor_seconds = 12
adaptive_ceiling_seconds = 99
secondary_archetypes_count = 6
voice_template_path = "custom/default.md"
reification_guard_strictness = "strict"

[mythos.symbolic_protein_reading.cosmic_weather_weights]
m1 = 0.8
m2 = 0.1
m3 = 0.1
`);

    assert.equal(config.triggerMode, 'adaptive');
    assert.equal(config.utteranceIntervalN, 2);
    assert.equal(config.kairosPulseIntervalM, 4);
    assert.equal(config.adaptiveFloorSeconds, 12);
    assert.equal(config.adaptiveCeilingSeconds, 99);
    assert.deepEqual(config.cosmicWeatherWeights, { m1: 0.8, m2: 0.1, m3: 0.1 });
    assert.equal(config.secondaryArchetypesCount, 6);
    assert.equal(config.voiceTemplatePath, 'custom/default.md');
    assert.equal(config.reificationGuardStrictness, 'strict');
});

test('trigger modes fire Mythos reads at configured utterance and Mercurius pulse intervals', () => {
    const modes = [
        { mode: 'every-nth-utterance', expectedUtteranceReads: 2, expectedPulseReads: 0 },
        { mode: 'every-mth-kairos-pulse', expectedUtteranceReads: 0, expectedPulseReads: 3 },
        { mode: 'hybrid-utterance-and-pulse', expectedUtteranceReads: 2, expectedPulseReads: 3 }
    ];

    for (const item of modes) {
        const config = normalizeMythosSymbolicProteinReadingConfig({
            triggerMode: item.mode,
            utteranceIntervalN: 5,
            kairosPulseIntervalM: 3
        });
        let state = { utteranceCount: 0, kairosPulseCount: 0 };
        let utteranceReads = 0;
        let pulseReads = 0;
        for (let i = 1; i <= 10; i++) {
            const utterance = applyMythosReadingTriggerEvent(
                state,
                { kind: 'user-utterance', occurredAtMs: i * 1000 },
                config
            );
            state = utterance.nextState;
            if (utterance.shouldRead) utteranceReads++;

            const pulse = applyMythosReadingTriggerEvent(
                state,
                { kind: 'kairos-pulse', occurredAtMs: i * 1000 + 500 },
                config
            );
            state = pulse.nextState;
            if (pulse.shouldRead) pulseReads++;
        }
        assert.equal(utteranceReads, item.expectedUtteranceReads, `${item.mode} utterance reads`);
        assert.equal(pulseReads, item.expectedPulseReads, `${item.mode} kairos reads`);
    }
});

test('adaptive trigger respects floor and ceiling while still producing a first in-session read', () => {
    const config = normalizeMythosSymbolicProteinReadingConfig({
        triggerMode: 'adaptive',
        utteranceIntervalN: 5,
        kairosPulseIntervalM: 3,
        adaptiveFloorSeconds: 90,
        adaptiveCeilingSeconds: 180
    });
    let state = { utteranceCount: 0, kairosPulseCount: 0 };
    const decisions = [];
    for (let i = 1; i <= 10; i++) {
        const decision = applyMythosReadingTriggerEvent(
            state,
            { kind: 'user-utterance', occurredAtMs: i * 30_000 },
            config
        );
        decisions.push(decision);
        state = decision.nextState;
    }

    assert.equal(decisions[0].shouldRead, true);
    assert.equal(decisions[4].shouldRead, true);
    assert.equal(decisions[9].shouldRead, true);
    assert.equal(decisions.filter(decision => decision.shouldRead).length, 3);
});

test('Mythos read binds the codon chain to global M1/M2/M3 cosmic weather and accumulates history', () => {
    const reading = createMythosArchetypeReading({
        protein: baseProtein,
        cosmicWeatherSnapshot: weather,
        provenance,
        kairosPulseRef: '[[kairos-pulse-3]]'
    });
    const nextProtein = appendMythosReadingToSymbolicProtein(baseProtein, reading);

    assert.equal(reading.ownerAgent, '[[Mythos]]');
    assert.equal(reading.cosmicWeatherSnapshot.m1SpandaTick, 4);
    assert.equal(reading.cosmicWeatherSnapshot.m2CymaticPhase, 'saturn-dominant-phase');
    assert.equal(reading.cosmicWeatherSnapshot.m3CodonTranscriptionState, 'tail-marker-open');
    assert.equal(nextProtein.mythosReadingHistory.length, 1);
    assert.equal(isSymbolicProtein(nextProtein), true);
});

test('session close final read populates mythosArchetypeReading for PatternPacket sealing', () => {
    const reading = createMythosArchetypeReading({
        protein: baseProtein,
        cosmicWeatherSnapshot: weather,
        provenance,
        kairosPulseRef: '[[session-close-kairos-pulse]]'
    });
    const closed = closeSymbolicProteinWithMythosReading(baseProtein, reading);

    assert.equal(closed.mythosArchetypeReading, reading);
    assert.equal(closed.mythosReadingHistory.at(-1), reading);
    assert.equal(isSymbolicProtein(closed), true);
});

test('voice-law guard rejects reified session identity claims', () => {
    assert.equal(
        assertMythosNarrativeVoiceLaw("This session's codon arc figures archetype Death under cosmic-weather Saturn.").ok,
        true
    );
    const rejected = assertMythosNarrativeVoiceLaw('This session IS Death.');
    assert.equal(rejected.ok, false);
    assert.match(rejected.error, /Reification|figuring/i);
});

test('provenance lint requires session, chain-position, cosmic-weather, and kairos wikilinks', () => {
    const reading = createMythosArchetypeReading({
        protein: baseProtein,
        cosmicWeatherSnapshot: weather,
        provenance,
        kairosPulseRef: '[[kairos-pulse-3]]'
    });
    assert.equal(mythosReadingHasRequiredProvenance(reading), true);

    const broken = {
        ...reading,
        provenance: { ...reading.provenance, chainPositionRef: 'protein-alpha#chain-3' }
    };
    assert.equal(mythosReadingHasRequiredProvenance(broken), false);
});

test('cosmic-weather weights are load-bearing for Major Arcana naming on the same chain', () => {
    const m1Weighted = createMythosArchetypeReading({
        protein: baseProtein,
        cosmicWeatherSnapshot: { ...weather, m1SpandaTick: 1, m2CymaticPhase: 20, m3CodonTranscriptionState: 20 },
        provenance,
        kairosPulseRef: '[[kairos-pulse-m1]]',
        config: normalizeMythosSymbolicProteinReadingConfig({
            cosmicWeatherWeights: { m1: 1, m2: 0, m3: 0 }
        })
    });
    const m2Weighted = createMythosArchetypeReading({
        protein: baseProtein,
        cosmicWeatherSnapshot: { ...weather, m1SpandaTick: 1, m2CymaticPhase: 20, m3CodonTranscriptionState: 20 },
        provenance,
        kairosPulseRef: '[[kairos-pulse-m2]]',
        config: normalizeMythosSymbolicProteinReadingConfig({
            cosmicWeatherWeights: { m1: 0, m2: 1, m3: 0 }
        })
    });

    assert.notEqual(
        m1Weighted.dominantChromosomeArcana.arcanaNumber,
        m2Weighted.dominantChromosomeArcana.arcanaNumber
    );
});

test('MathemeHarmonicProfile boundary payload narrows to the global 1-2-3 cosmic weather snapshot', () => {
    const snapshot = mythosCosmicWeatherSnapshotFromProfile({
        generation: 17,
        pointerAnchor: 'profile://generation/17',
        payload: {
            m1_spanda_tick: 6,
            m2_cymatic_phase: 'sun-window',
            m3_codon_transcription_state: 'codon-ring-transcribing',
            dominant_planet: 'sun',
            planet_degrees: [10, 20, 30]
        }
    });

    assert.deepEqual(snapshot, {
        m1SpandaTick: 6,
        m2CymaticPhase: 'sun-window',
        m3CodonTranscriptionState: 'codon-ring-transcribing',
        mathemeHarmonicProfileHandle: 'profile://generation/17',
        dominantPlanet: 'sun',
        planetDegrees: [10, 20, 30]
    });
});
