/**
 * 07.T7.1 — Wave-A readiness gate tests. The contract fixtures mirror the
 * frozen wave-a-markers.ts LAW (marker names, blocker-id namespace, pinned
 * blocked state) and the kernel-bridge readiness ledger's real wire paths.
 */
import { describe, expect, it } from 'vitest';
import type { MathemeHarmonicProfileBoundary } from '../bridge/types';
import {
    aggregatePentadicTraceReadiness,
    evaluateCachedProfileIntegratedReadiness,
    evaluateIntegratedReadiness,
    formatIntegratedReadiness,
    integratedReadinessBlockedBy,
    WAVE_A_BLOCKER_ID_PREFIX,
    WAVE_A_PENDING_MARKERS,
    waveABlockerId
} from './integratedReadiness';

/** A minimal-but-complete pentadic trace the strict reader accepts, mirroring
 *  the cosmicPentadicOverlay fixture (kernel-shaped, verbatim). */
const PENTADIC_TRACE = {
    tick: 31,
    tick12: 7,
    helix: 1,
    position6: 1,
    sourceBinaryState: '0/1',
    wholeNumberEndpoint: 5,
    naturalNumberEndpoint: 6,
    familyBComplement: [1, 4],
    shemDegreeQuantum: 5,
    resonance72Index: 42,
    degree360: 210,
    m2ToM3Symbol: 37,
    mahamayaAddress64: 37,
    codonId: 37,
    codon: 'GTC',
    lineChangeOperator: 251,
    pairedMahamayaFifteens: [15, 15],
    backboneIdentity: '24x15=360',
    lineGraphIdentity: '360+24=384',
    qCosmicRef: 'q_cosmic://tick/31',
    thirdSpanda: {
        m1: {
            priorGround: 'M0 is the prior 0/1 ground',
            parentAttribution: 'M1-5 is the +1 parent',
            degree720: 420,
            hopfFiber: 1,
            ringQuaternion: [-0.8660254, -0.5, 0, 0],
            advancementAddress64: 35
        },
        m2: {
            address72: 42,
            axisViews: {
                mef: { lens: 7, position: 0, isInverted: true, lFamilyLink: 1 },
                tattva: { tattvaIndex: 21, phase: 0 },
                decan: { elementId: 0, sign: 1, decan: 0, face: 0, rulingPlanet: 3 },
                shem: { shemIdx: 42, choir: 4, position: 6, elementId: 2, decanLink: 42 },
                maqam: { index72: 42, family: 5, modeInFamily: 5, planetRuler: 3 },
                det: { index72: 42, compressed64: 37, det64: 137438953472 }
            }
        },
        epogdoon: {
            ratioNumerator: 9,
            ratioDenominator: 8,
            sourceAddress72: 42,
            blockIndex: 4,
            blockPhase: 6,
            compressedAddress64: 37,
            expandedAddress72: 41,
            roundTripExact: false,
            roundTripLoss: 1,
            collision: null,
            cardinality: {
                blockSize: 9,
                blockCount: 8,
                collisionPairCount: 8,
                exactRoundTripCount: 8,
                nonExactRoundTripCount: 64
            }
        },
        m3: {
            detReceptionAddress64: 37,
            worldClockAddress64: 37,
            codonId: 37,
            codon: 'GTC',
            codonRotation: {
                lens: 7,
                mode: 0,
                lensLabel: "L1'",
                modeName: 'Ionian',
                surfaceIndex: 394,
                codonId: 53,
                codon: 'TCC',
                codonClass: 'non-dual',
                rotation: 2,
                rotationalStateCount: 7,
                rotationDegrees: 90,
                reverseLens: 7,
                reverseMode: 0,
                datasetLutState: 'materialized-kernel-lut',
                provenance: 'portal-core::codon_rotation_projection 84↔472 surface LUT'
            },
            transcriptionState: 'compressed-nonexact-round-trip',
            lineChangeOperator: 251
        }
    },
    provenance: ['portal_core::pentadic_trace::from_profile']
};

function tracePayloadAtTick(tick: number): Record<string, unknown> {
    return { tick, anuttaraPentadicTrace: { ...PENTADIC_TRACE, tick } };
}

function profileWith(payload: Record<string, unknown>): MathemeHarmonicProfileBoundary {
    return { generation: 7, pointerAnchor: null, capabilities: [], payload };
}

describe('Wave-A marker table (LAW)', () => {
    it('declares exactly the five canonical markers in cosmic-spine order', () => {
        expect(WAVE_A_PENDING_MARKERS.map(m => m.marker)).toEqual([
            'klein_flip',
            'resonance72',
            'six-axes-of-72 decoding',
            'audio_octet[8]',
            'nodal_quartet[4]'
        ]);
    });

    it('builds stable greppable blocker ids under the wave-a.pending namespace', () => {
        expect(WAVE_A_BLOCKER_ID_PREFIX).toBe('wave-a.pending');
        expect(WAVE_A_PENDING_MARKERS.map(waveABlockerId)).toEqual([
            'wave-a.pending:klein_flip',
            'wave-a.pending:resonance72',
            'wave-a.pending:six-axes-of-72 decoding',
            'wave-a.pending:audio_octet[8]',
            'wave-a.pending:nodal_quartet[4]'
        ]);
    });

    it('marks only the M1\'-performance-event pockets as conditional', () => {
        const conditional = WAVE_A_PENDING_MARKERS.filter(m => m.conditional).map(m => m.marker);
        expect(conditional).toEqual(['audio_octet[8]', 'nodal_quartet[4]']);
    });

    it('declares the six-axes decode as a derivation with no pocket', () => {
        const sixAxes = WAVE_A_PENDING_MARKERS.find(m => m.marker === 'six-axes-of-72 decoding');
        expect(sixAxes?.profilePaths).toBeNull();
    });

    it('pins the blocked-state to profile_missing_field', () => {
        const blocked = integratedReadinessBlockedBy([WAVE_A_PENDING_MARKERS[0]]);
        expect(blocked.state).toBe('profile_missing_field');
        expect(blocked.blockerIds).toEqual(['wave-a.pending:klein_flip']);
    });
});

describe('evaluateIntegratedReadiness', () => {
    it('adapts the live gateway cache shape without introducing a second profile transport', () => {
        const result = evaluateCachedProfileIntegratedReadiness({
            generation: 31,
            cachedAtMs: 31_000,
            stale: false,
            stalenessMs: 0,
            privacyClass: 'public-current-context',
            profile: {
                harmonicProfile: {
                    kleinFlip: false,
                    resonance72Index: 21,
                    audioOctet: [220, 247, 262, 294, 330, 349, 392, 440],
                    nodalQuartet: [{ qlPosition: 0, helix: 'a', m: 1, n: 2 }]
                }
            }
        });
        expect(result.state).toBe('ready');
        expect(formatIntegratedReadiness(result)).toBe('Wave A ready');
    });

    it('blocks on the unconditional markers when no profile exists at all', () => {
        const result = evaluateIntegratedReadiness(null);
        expect(result.state).toBe('profile_missing_field');
        expect(result.blockerIds).toEqual([
            'wave-a.pending:klein_flip',
            'wave-a.pending:resonance72'
        ]);
        // conditional markers are pending, not blocking, before the event is seen
        expect(result.conditionalPending.map(m => m.marker)).toEqual([
            'audio_octet[8]',
            'nodal_quartet[4]'
        ]);
    });

    it('is ready when the unconditional pockets are present under harmonicProfile', () => {
        const result = evaluateIntegratedReadiness(profileWith({
            harmonicProfile: {
                kleinFlip: { m1TritoneCrossing: { tick12: 6 } },
                resonance72Index: 41
            }
        }));
        expect(result.state).toBe('ready');
        expect(result.blockerIds).toEqual([]);
    });

    it('finds pockets at the payload root too (two-level resolution)', () => {
        const result = evaluateIntegratedReadiness(profileWith({
            klein_flip: { m2CymaticValenceInvert: {} },
            resonance72: { index: 3 }
        }));
        expect(result.state).toBe('ready');
    });

    it('finds klein_flip via the nested anandaVortex.kleinFlipAtThisTick pocket', () => {
        const result = evaluateIntegratedReadiness(profileWith({
            harmonicProfile: {
                anandaVortex: { kleinFlipAtThisTick: false },
                depositionAnchor: { resonance72Index: 12 }
            }
        }));
        expect(result.state).toBe('ready');
    });

    it('never reports the six-axes derivation as a missing-field blocker', () => {
        const result = evaluateIntegratedReadiness(null);
        expect(result.blockerIds).not.toContain('wave-a.pending:six-axes-of-72 decoding');
    });

    it('blocks conditional markers once the performance event is seen without its pockets', () => {
        const result = evaluateIntegratedReadiness(
            profileWith({ harmonicProfile: { kleinFlip: true, resonance72Index: 0 } }),
            { performanceEvent: { harmonic: {} } }
        );
        expect(result.state).toBe('profile_missing_field');
        expect(result.blockerIds).toEqual([
            'wave-a.pending:audio_octet[8]',
            'wave-a.pending:nodal_quartet[4]'
        ]);
        expect(result.conditionalPending).toEqual([]);
    });

    it('is ready when the performance event carries harmonic.audioOctet + nodalQuartet', () => {
        const result = evaluateIntegratedReadiness(
            profileWith({ harmonicProfile: { kleinFlip: true, resonance72Index: 0 } }),
            {
                performanceEvent: {
                    harmonic: {
                        audioOctet: [1, 2, 3, 4, 5, 6, 7, 8],
                        nodalQuartet: [{ qlPosition: 1, helix: 'a', m: 1, n: 2 }]
                    }
                }
            }
        );
        expect(result.state).toBe('ready');
    });

    it('treats an empty octet array as an absent pocket (no faked replay bus)', () => {
        const result = evaluateIntegratedReadiness(
            profileWith({ harmonicProfile: { kleinFlip: true, resonance72Index: 0 } }),
            { performanceEvent: { harmonic: { audioOctet: [], nodalQuartet: [] } } }
        );
        expect(result.state).toBe('profile_missing_field');
        expect(result.blockerIds).toContain('wave-a.pending:audio_octet[8]');
        expect(result.blockerIds).toContain('wave-a.pending:nodal_quartet[4]');
    });

    it('accepts profile-level audioOctet pockets even before the event is seen', () => {
        const result = evaluateIntegratedReadiness(profileWith({
            harmonicProfile: {
                kleinFlip: true,
                resonance72Index: 9,
                audioOctet: [220, 247, 262, 294, 330, 349, 392, 440],
                nodalQuartet: [{ qlPosition: 0, helix: 'b', m: 2, n: 3 }]
            }
        }));
        expect(result.state).toBe('ready');
        expect(result.conditionalPending).toEqual([]);
    });

    it('resolution never confuses zero/false with absence', () => {
        const result = evaluateIntegratedReadiness(profileWith({
            harmonicProfile: {
                anandaVortex: { kleinFlipAtThisTick: false },
                resonance72Index: 0
            }
        }));
        expect(result.state).toBe('ready');
    });
});

describe('aggregatePentadicTraceReadiness (29.T29.15)', () => {
    it('is pending across both slots when neither carries a trace', () => {
        const aggregate = aggregatePentadicTraceReadiness(null, { tick: 31 });
        expect(aggregate.state).toBe('pending-anuttara-pentadic-trace');
        expect(aggregate.cosmic.state).toBe('pending-anuttara-pentadic-trace');
        expect(aggregate.personal.state).toBe('pending-anuttara-pentadic-trace');
        expect(aggregate.cosmic.traceGeneration).toBeNull();
        expect(aggregate.generationsAgree).toBe(false);
    });

    it('is ready when both slots carry the SAME live trace generation', () => {
        const payload = tracePayloadAtTick(31);
        const aggregate = aggregatePentadicTraceReadiness(payload, payload);
        expect(aggregate.state).toBe('ready');
        expect(aggregate.cosmic.state).toBe('ready');
        expect(aggregate.personal.state).toBe('ready');
        expect(aggregate.cosmic.traceGeneration).toBe(31);
        expect(aggregate.personal.traceGeneration).toBe(31);
        expect(aggregate.generationsAgree).toBe(true);
    });

    it('rejects a per-slot stale trace (profile tick disagrees with trace tick) as stale', () => {
        const stale = { tick: 32, anuttaraPentadicTrace: { ...PENTADIC_TRACE, tick: 31 } };
        const aggregate = aggregatePentadicTraceReadiness(stale, stale);
        expect(aggregate.cosmic.state).toBe('stale-trace-generation');
        expect(aggregate.state).toBe('stale-trace-generation');
        expect(aggregate.generationsAgree).toBe(false);
    });

    it('flags a cross-slot generation split (mixed generations) as stale even when each slot is internally ready', () => {
        const aggregate = aggregatePentadicTraceReadiness(
            tracePayloadAtTick(31),
            tracePayloadAtTick(32)
        );
        expect(aggregate.cosmic.state).toBe('ready');
        expect(aggregate.personal.state).toBe('ready');
        expect(aggregate.cosmic.traceGeneration).toBe(31);
        expect(aggregate.personal.traceGeneration).toBe(32);
        expect(aggregate.generationsAgree).toBe(false);
        expect(aggregate.state).toBe('stale-trace-generation');
    });
});
