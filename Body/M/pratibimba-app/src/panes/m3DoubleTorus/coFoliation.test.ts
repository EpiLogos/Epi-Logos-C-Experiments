// @vitest-environment node
/**
 * Coordinate: M3-5' co-foliation — gate (rerun 51.T51.5)
 * Residency: Body/M/pratibimba-app/src/panes/m3DoubleTorus/coFoliation.test.ts
 * Actualises: §8.13's two claims, as assertions.
 *   (a) CO-FOLIATED, NOT SIDE BY SIDE — the two leaf families live on ONE
 *       chart and INTERSECT, and exactly one crossing is active. A rendering
 *       of two separate tori would have no crossings at all, which is the
 *       failure this pins.
 *   (b) 0-SIDE DUAL — the two renderings share ONE substrate identity, taken
 *       from the B-8 non-fork invariant rather than restated.
 * Does NOT own: the M3 bus reader (`m3Inspectors.test.ts`), the surface.
 * Contract: [[M3'-SPEC]] §8.13 · rerun tranche [[51.T51.5]].
 */

import { describe, expect, it } from 'vitest';
import {
    FIFTH_SEMITONES,
    K2_LEAF_COUNT,
    readCoFoliation,
    T2_LENS_LEAF_COUNT,
    k2LeafOf,
    t2LeafOf
} from './coFoliation';
import { BIMBA_SUBSTRATE } from '../../composition/compositionContract';
import type { KernelBridgeCachedProfile } from '../../bridge/types';

function cached(profile: unknown, generation = 5): KernelBridgeCachedProfile {
    return {
        generation,
        cachedAtMs: 1,
        stale: false,
        stalenessMs: 0,
        privacyClass: 'public',
        profile
    } as KernelBridgeCachedProfile;
}

/**
 * A payload the REAL `buildM3InspectorsView` will read. The lens circle lives
 * on `codonRotationProjection` and the inscription on `mahamaya` — those paths
 * are the reader's, not this file's guess, which is exactly why the reading
 * goes through that reader instead of a private parser.
 */
function profile(overrides: {
    readonly degree720?: number;
    readonly lens?: number;
    readonly mode?: number;
    readonly codonId?: number;
}): unknown {
    const root: Record<string, unknown> = {};
    if (overrides.degree720 !== undefined) {
        root.degree720 = overrides.degree720;
    }
    if (overrides.lens !== undefined) {
        root.codonRotationProjection = {
            lens: overrides.lens,
            mode: overrides.mode ?? 0,
            surfaceIndex: 0
        };
    }
    if (overrides.codonId !== undefined) {
        root.mahamaya = {
            codonId: overrides.codonId,
            hexagramId: overrides.codonId,
            upperTrigram: 0,
            lowerTrigram: 0,
            lineIndex: 0,
            lineChangeOperatorAddress: 0,
            // the reader admits a slice only when it is WHOLE — three
            // nucleotide bits and a phase string; a partial slice is refused
            nucleotideBits: [0, 1, 2],
            dnaRnaPhase: 'dna'
        };
    }
    return { harmonicProfile: root };
}

describe('51.T51.5 — the K² leaf is the chromatic-fifths double cover', () => {
    it('splits 720 into two sheets and reorders the chromatic class by fifths', () => {
        // degree 0 → pitch class 0 → fifths 0, lower sheet
        expect(k2LeafOf(0)).toEqual({ sheet: 0, pitchClass: 0, fifthsIndex: 0, leaf: 0 });
        // degree 30 → pitch class 1 → fifths 7 (a fifth IS seven semitones)
        expect(k2LeafOf(30)).toEqual({ sheet: 0, pitchClass: 1, fifthsIndex: 7, leaf: 7 });
        // the SAME pitch class on the upper sheet is a DIFFERENT leaf — that is
        // what makes K² a double cover rather than a circle
        expect(k2LeafOf(360)).toEqual({ sheet: 1, pitchClass: 0, fifthsIndex: 0, leaf: 12 });
        expect(k2LeafOf(390)).toEqual({ sheet: 1, pitchClass: 1, fifthsIndex: 7, leaf: 19 });
    });

    it('walks the full fifths cycle over the twelve classes without repeating', () => {
        const fifths = Array.from({ length: 12 }, (_, pc) => k2LeafOf(pc * 30).fifthsIndex);
        expect(new Set(fifths).size, 'the fifths reordering is a bijection').toBe(12);
        expect(fifths[1]).toBe(FIFTH_SEMITONES);
    });

    it('refuses an out-of-range or absent degree rather than placing leaf 0', () => {
        for (const degree of [null, -1, 720, 1000]) {
            expect(k2LeafOf(degree as number | null).leaf).toBeNull();
        }
    });
});

describe('51.T51.5 — the T² leaf is the lens circle (16 + the meta aperture)', () => {
    it('admits 0..16 and refuses anything else', () => {
        expect(t2LeafOf(0)).toBe(0);
        expect(t2LeafOf(16)).toBe(16);
        expect(t2LeafOf(17)).toBeNull();
        expect(t2LeafOf(-1)).toBeNull();
        expect(t2LeafOf(null)).toBeNull();
    });
});

describe('51.T51.5 — CO-FOLIATED, not side by side', () => {
    it('puts both families on ONE chart, so every K² leaf crosses every T² leaf', () => {
        const reading = readCoFoliation(cached(profile({})));
        expect(reading.k2.leaves).toHaveLength(K2_LEAF_COUNT);
        expect(reading.t2.leaves).toHaveLength(T2_LENS_LEAF_COUNT);
        // The crossing set is the co-foliation. Two tori drawn side by side
        // would produce none; this is the assertion that separates them.
        expect(reading.crossings).toHaveLength(K2_LEAF_COUNT * T2_LENS_LEAF_COUNT);
        for (const crossing of reading.crossings) {
            expect(crossing.u).toBeGreaterThanOrEqual(0);
            expect(crossing.u).toBeLessThan(1);
            expect(crossing.v).toBeGreaterThanOrEqual(0);
            expect(crossing.v).toBeLessThan(1);
        }
    });

    it('marks EXACTLY ONE crossing active when both foliations are live', () => {
        const reading = readCoFoliation(
            cached(profile({ degree720: 390, lens: 3, mode: 2, codonId: 21 }))
        );
        expect(reading.k2.activeLeaf).toBe(19);
        expect(reading.t2.activeLeaf).toBe(3);
        const active = reading.crossings.filter(crossing => crossing.active);
        expect(active).toHaveLength(1);
        expect(reading.activeCrossing).toEqual(active[0]);
        expect(reading.activeCrossing!.k2Leaf).toBe(19);
        expect(reading.activeCrossing!.t2Leaf).toBe(3);
        expect(reading.t2.inscription, 'the inscription circle rides the codon').toBe(21);
        expect(reading.pending, 'nothing pending when all three drivers are live').toHaveLength(0);
    });

    it('has NO active crossing when either foliation is pending — never a default', () => {
        const noLens = readCoFoliation(cached(profile({ degree720: 90 })));
        expect(noLens.k2.activeLeaf).not.toBeNull();
        expect(noLens.t2.activeLeaf).toBeNull();
        expect(noLens.activeCrossing).toBeNull();
        expect(noLens.pending.join(' ')).toContain('lensMode.lens');

        const noDegree = readCoFoliation(cached(profile({ lens: 1 })));
        expect(noDegree.activeCrossing).toBeNull();
        expect(noDegree.pending.join(' ')).toContain('degree720');
    });

    it('reports every missing driver on an empty profile', () => {
        const reading = readCoFoliation(null);
        expect(reading.generation).toBeNull();
        expect(reading.activeCrossing).toBeNull();
        expect(reading.pending).toHaveLength(3);
    });
});

describe('51.T51.5 — the 0-side dual rendering shares ONE substrate', () => {
    it('names both renderings §8.13 names, at their own coordinates', () => {
        const dual = readCoFoliation(null).zeroSideDual;
        expect(dual.map(rendering => rendering.id)).toEqual([
            'm0-structural-graph',
            'm3-temporal-wheel'
        ]);
        expect(dual[0].coordinate).toBe("M0'");
        expect(dual[1].coordinate).toBe("M3-5'");
        expect(dual[0].role).toContain('structural');
        expect(dual[1].role).toContain('temporal');
    });

    it('takes the substrate identity from the B-8 non-fork invariant, not a restatement', () => {
        const dual = readCoFoliation(null).zeroSideDual;
        for (const rendering of dual) {
            expect(rendering.substrateLabel).toBe(BIMBA_SUBSTRATE.label);
            expect(rendering.substrateIdentityProperty).toBe(BIMBA_SUBSTRATE.coordinateProperty);
        }
        // …and the two halves really are the SAME substrate — a dual whose
        // halves forked would be the thing B-8 forbids.
        expect(dual[0].substrateLabel).toBe(dual[1].substrateLabel);
        expect(BIMBA_SUBSTRATE.nonFork).toBe(true);
    });
});
