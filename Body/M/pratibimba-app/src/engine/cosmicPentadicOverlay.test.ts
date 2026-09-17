/**
 * Coordinate: M' M1'+M2'+M3' (pentadic overlay law — Tranche 36.T36.4)
 * Actualises: the 36.4 verification — matching trace generation across the
 *   M1/M2/M3 slots (stale mismatch rejected whole), no renderer-local 72/64
 *   conversion (kernel values verbatim), the join line bound to the live hinge.
 */

import { describe, expect, it } from 'vitest';
import { buildPentadicOverlay } from './cosmicPentadicOverlay';

const TRACE = {
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

describe('cosmic 1-2-3 pentadic overlay (36.T36.4)', () => {
    it('is pending without the bus trace — no slot renders from local math', () => {
        const overlay = buildPentadicOverlay({ tick: 31 });
        expect(overlay.state).toBe('pending-anuttara-pentadic-trace');
        expect(overlay.m1).toBeNull();
        expect(overlay.m2).toBeNull();
        expect(overlay.m3).toBeNull();
    });

    it('fills all three slots from ONE trace generation, verbatim', () => {
        const overlay = buildPentadicOverlay({ tick: 31, anuttaraPentadicTrace: TRACE });
        expect(overlay.state).toBe('ready');
        expect(overlay.m1).toMatchObject({ tick12: 7, position6: 1, sourceBinaryState: '0/1' });
        expect(overlay.m2).toMatchObject({ resonance72Index: 42, shemDegreeQuantum: 5 });
        expect(overlay.m3).toMatchObject({ mahamayaAddress64: 37, codon: 'GTC', codonId: 37 });
        expect(overlay.epogdoon).toEqual({
            blockPhase: 6,
            collisionPair: null,
            roundTripLoss: 1,
            roundTripExact: false
        });
        expect(overlay.m1?.advancementAddress64).toBe(35);
        expect(overlay.m2?.axisViews.det.compressed64).toBe(37);
        expect(overlay.m2?.axisViews.det.det64).toBe(137438953472);
        expect(overlay.m3?.detReceptionAddress64).toBe(37);
    });

    it('REJECTS a stale trace whose tick disagrees with the profile tick — whole overlay, all slots', () => {
        const overlay = buildPentadicOverlay({ tick: 32, anuttaraPentadicTrace: TRACE });
        expect(overlay.state).toBe('stale-trace-generation');
        expect(overlay.m1).toBeNull();
        expect(overlay.m2).toBeNull();
        expect(overlay.m3).toBeNull();
        expect(overlay.joinLine).toBeNull();
    });

    it('does NO local 72/64 conversion: kernel-inconsistent values flow verbatim', () => {
        const altered = { ...TRACE, mahamayaAddress64: 63, resonance72Index: 1 };
        const overlay = buildPentadicOverlay({ tick: 31, anuttaraPentadicTrace: altered });
        // floor(1*8/9)=0 and floor(210*64/360)=37 — a local converter would
        // "correct" these; the overlay must show the kernel's write.
        expect(overlay.m3?.mahamayaAddress64).toBe(63);
        expect(overlay.m2?.resonance72Index).toBe(1);
    });

    it('joins the translation rule to the LIVE hinge, never an isolated proof label', () => {
        const overlay = buildPentadicOverlay({ tick: 31, anuttaraPentadicTrace: TRACE });
        expect(overlay.joinLine).toContain('9₍M2₎ = 8₍M3₎ + 1₍M1₎');
        expect(overlay.joinLine).toContain('0/1→5');
        expect(overlay.joinLine).toContain('t12 7');
    });

    it('unwraps the wire harmonicProfile nesting with the same tick law', () => {
        const overlay = buildPentadicOverlay({
            harmonicProfile: { tick: 31, anuttaraPentadicTrace: TRACE }
        });
        expect(overlay.state).toBe('ready');
    });
});
