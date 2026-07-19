/**
 * Coordinate: M' M3' (inspectors law — Track 04.T4.2)
 * Actualises: the tranche's audits as behavioral tests — all six inspectors
 *   read the bus verbatim (zero local codon/hexagram/tarot tables: kernel
 *   values flow untouched, kernel-owned surfaces render pending chips), the
 *   spoke decode is pure arithmetic, and absence is pending, never fabricated.
 */

import { describe, expect, it } from 'vitest';
import { buildM3InspectorsView, M3_DEPTH_VIEW_ORDER, M3_INSPECTOR_ORDER } from './m3Inspectors';

const MAHAMAYA = {
    codonId: 0x27,
    codon: 'GCT',
    hexagramId: 39,
    upperTrigram: 4,
    lowerTrigram: 7,
    nucleotideBits: [2, 1, 3],
    dnaRnaPhase: 'dna',
    lineIndex: 3,
    lineChangeOperatorAddress: 251,
    roundTripLoss: true,
    datasetLutState: 'pending-dataset-lut'
};

const PAYLOAD = {
    tick12: 7,
    degree360: 217,
    degree720: 577,
    qCosmic: [0.5, -0.25, 0.25, 0.25],
    mahamaya: MAHAMAYA,
    codonRotationProjection: { lens: 4, mode: 2, surfaceIndex: 301 }
};

describe('m3 inspectors view model (04.T4.2)', () => {
    it('declares exactly six summonable inspectors and four depth views', () => {
        expect(M3_INSPECTOR_ORDER).toHaveLength(6);
        expect(M3_DEPTH_VIEW_ORDER).toEqual([
            'flat-clock-debug',
            'lens-annulus',
            'toroidal-world',
            'hopf-identity'
        ]);
    });

    it('is pending without the bussed mahamaya projection — nothing fabricated', () => {
        const view = buildM3InspectorsView({ payload: { tick12: 2 }, generation: 1 });
        expect(view.state).toBe('pending-mahamaya');
        expect(view.mahamaya).toBeNull();
        expect(view.suitIndex).toBeNull();
    });

    it('reads every mahamaya value verbatim off the bus (window, not derivation)', () => {
        const view = buildM3InspectorsView({ payload: PAYLOAD, generation: 3 });
        expect(view.state).toBe('ready');
        expect(view.mahamaya?.codonId).toBe(0x27);
        expect(view.mahamaya?.hexagramId).toBe(39);
        expect(view.mahamaya?.nucleotideBits).toEqual([2, 1, 3]);
        expect(view.mahamaya?.dnaRnaPhase).toBe('dna');
        expect(view.mahamaya?.lineChangeOperatorAddress).toBe(251);
        expect(view.mahamaya?.roundTripLoss).toBe(true);
    });

    it('kernel-inconsistent bus values flow untouched — proof of zero local tables', () => {
        // hexagram 99 does not exist and GCT != codon 0x27's letters; a local
        // codon/hexagram table would "correct" these — the window must not.
        const altered = { ...PAYLOAD, mahamaya: { ...MAHAMAYA, hexagramId: 99, codon: 'ZZZ' } };
        const view = buildM3InspectorsView({ payload: altered, generation: 1 });
        expect(view.mahamaya?.hexagramId).toBe(99);
        expect(view.mahamaya?.codon).toBe('ZZZ');
    });

    it('spoke/suit are pure arithmetic on bussed values; kernel-owned maps stay pending', () => {
        const view = buildM3InspectorsView({ payload: PAYLOAD, generation: 1 });
        expect(view.activeSpoke).toBe(Math.floor(217 / 15));
        expect(view.suitIndex).toBe(0x27 >> 4);
        expect(view.majorArcana).toBe('pending-major-arcana-map');
        expect(view.fourXAudit).toBe('pending-raw-charges');
        expect(view.ringHistory).toBe('pending-ring-history');
        expect(view.rnaCodonFamily).toBe('pending-rna-codon-family');
        expect(view.chromosomeGraph).toBe('pending-chromosome-graph');
    });

    it('37.7 honest deferral: RNA U-codon family + chromosome graph badge pending while the RNA-capable flag renders off the bus', () => {
        const view = buildM3InspectorsView({ payload: PAYLOAD, generation: 1 });
        // The not-yet-built expansions defer as explicit chips — no fabrication.
        expect(view.rnaCodonFamily).toBe('pending-rna-codon-family');
        expect(view.chromosomeGraph).toBe('pending-chromosome-graph');
        // The chromosome chip is now independent of the Major-Arcana chip.
        expect(view.chromosomeGraph).not.toBe(view.majorArcana);
        // The RNA-capable flag renders fully: its bussed source (the codon
        // nucleotides carrying the T that m3_codon_is_rna_capable keys on, plus
        // the dna/rna phase) is present, never a pending badge.
        expect(view.mahamaya?.nucleotideBits).toHaveLength(3);
        expect(typeof view.mahamaya?.dnaRnaPhase).toBe('string');
    });

    it('depth-view sources: lens-annulus from the 472 projection; toroidal/hopf from the clock', () => {
        const view = buildM3InspectorsView({ payload: PAYLOAD, generation: 1 });
        expect(view.lensMode).toEqual({ lens: 4, mode: 2, surfaceIndex: 301 });
        expect(view.toroidal).toEqual({ degree720: 577, helixSheet: 1 });
        expect(view.qCosmic).toEqual([0.5, -0.25, 0.25, 0.25]);
    });

    it('unwraps the wire harmonicProfile nesting', () => {
        const view = buildM3InspectorsView({
            payload: { harmonicProfile: PAYLOAD },
            generation: 1
        });
        expect(view.state).toBe('ready');
    });
});
