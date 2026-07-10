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
    evolutionaryGap: 'm2-wholeness-gap',
    codonId: 37,
    codon: 'GTC',
    lineChangeOperator: 251,
    pairedMahamayaFifteens: [15, 15],
    backboneIdentity: '24x15=360',
    lineGraphIdentity: '360+24=384',
    qCosmicRef: 'q_cosmic://tick/31',
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
        expect(overlay.m1).toEqual({ tick12: 7, position6: 1, sourceBinaryState: '0/1' });
        expect(overlay.m2).toEqual({ resonance72Index: 42, shemDegreeQuantum: 5 });
        expect(overlay.m3).toEqual({ mahamayaAddress64: 37, codon: 'GTC', codonId: 37 });
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
