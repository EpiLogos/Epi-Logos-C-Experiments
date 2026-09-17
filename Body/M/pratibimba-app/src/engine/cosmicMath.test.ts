import { describe, expect, it } from 'vitest';
import { asMahabhuta } from './elementRegisters';
import {
    BELL_DECAY_S,
    BELL_STRIKE_WEIGHTS,
    bellEnvelope,
    CLOCK_LENSES,
    codonAngle,
    degradationLevel,
    ELEMENT_COLOURS,
    lensSegment,
    orientationAngle,
    PLANET_ORDER,
    planetBodyRadius,
    resonancePulse
} from './cosmicMath';

const OCTET = [146.8, 167.5, 191.2, 216.4, 174.6, 199.3, 227.4, 233.1];
const QUARTET = [
    { m: 1, n: 1 },
    { m: 1, n: 2 },
    { m: 2, n: 1 },
    { m: 2, n: 2 }
];

describe('cosmic engine math', () => {
    // the cymatic field law moved to cymaticField.ts with E4 (M2' seed
    // equation, byte-hash pinned) — its tests live in cymaticField.test.ts

    it('codon angle places 64 cells on the equator and the klein flip reverses the axis', () => {
        expect(codonAngle(0, false)).toBe(0);
        expect(codonAngle(16, false)).toBeCloseTo(Math.PI / 2, 12);
        expect(codonAngle(16, true)).toBeCloseTo(-Math.PI / 2, 12);
    });

    it('orientation tween interpolates and unwraps the möbius return (719 → 1)', () => {
        expect(orientationAngle(100, 106, 0)).toBeCloseTo((100 / 720) * 4 * Math.PI, 12);
        expect(orientationAngle(100, 106, 1)).toBeCloseTo((106 / 720) * 4 * Math.PI, 12);
        // across the boundary the tween moves forward 2 degrees, not backward 718
        const mid = orientationAngle(719, 1, 0.5);
        expect(mid).toBeCloseTo((720 / 720) * 4 * Math.PI, 5);
    });

    it('degradation is layer-by-layer per §5.6', () => {
        const base = { tick12: 3, degree720: 200 };
        expect(degradationLevel({})).toBe('blocked_base_missing');
        expect(degradationLevel(base)).toBe('ready_base_only');
        expect(degradationLevel({ ...base, audioOctet: OCTET, nodalQuartet: QUARTET })).toBe('ready_no_codon');
        expect(degradationLevel({ ...base, codonRotationProjection: { codonId: 5 } })).toBe('ready_no_cymatic');
        expect(
            degradationLevel({ ...base, audioOctet: OCTET, nodalQuartet: QUARTET, mahamaya: {} })
        ).toBe('ready_full');
    });

    it('the 16 lenses each tile 360 exactly, and segments resolve per §4', () => {
        expect(CLOCK_LENSES).toHaveLength(16);
        for (const lens of CLOCK_LENSES) {
            expect(lens.slice * lens.sections).toBe(360);
        }
        // degree 144 against the LUT formula (segment = degree / slice_degrees
        // — the spec's authority; its prose example block miscomputes two rows,
        // flagged for canon correction in the plan)
        expect(lensSegment(0, 144)).toBe(144); // Microscopic 1°
        expect(lensSegment(13, 144)).toBe(1); // Quadrant 90°: second quadrant
        expect(lensSegment(9, 144)).toBe(4); // Solar Month 30°: Leo arc
        expect(lensSegment(7, 144)).toBe(9); // Hourly 15°: 10th node
        expect(lensSegment(11, 144)).toBe(3); // Greater Chamber 40°: 4th
        expect(lensSegment(6, 144)).toBe(12); // Pleromatic LUT row (12°×30)
    });

    it('bell strike tables cover exactly the eight octet roles', () => {
        expect(BELL_STRIKE_WEIGHTS).toHaveLength(8);
        expect(BELL_DECAY_S).toHaveLength(8);
        expect(BELL_STRIKE_WEIGHTS[1]).toBe(1.0); // prime is the strike centre
    });

    it('bell envelope follows KERNEL role order and reports its source honestly', () => {
        // kernel roles in spec order → same as fallback, but source: kernel
        const kernelOrder = ['hum', 'prime', 'tierce', 'quint', 'nominal', 'upper', 'warble', 'residue'];
        const kernel = bellEnvelope(kernelOrder);
        expect(kernel.source).toBe('kernel');
        expect(kernel.weights).toEqual([...BELL_STRIKE_WEIGHTS]);

        // a REORDERED kernel labelling reorders the envelope — the app
        // consumes the labels, it does not assume the spec table order
        const rotated = [...kernelOrder.slice(1), kernelOrder[0]];
        const reordered = bellEnvelope(rotated);
        expect(reordered.source).toBe('kernel');
        expect(reordered.weights[0]).toBe(1.0); // prime moved to carrier 0
        expect(reordered.weights[7]).toBe(0.3); // hum moved to carrier 7

        // absent/malformed roles → explicit fallback, never invention
        expect(bellEnvelope(null).source).toBe('fallback');
        expect(bellEnvelope(undefined).weights).toEqual([...BELL_STRIKE_WEIGHTS]);
        expect(bellEnvelope(['hum', 'prime']).source).toBe('fallback');
        expect(bellEnvelope([...kernelOrder.slice(0, 7), 'not-a-role']).source).toBe('fallback');
    });

    it('planet order follows the kernel canon: Mercury=2, Venus=3', () => {
        // kairos.rs / aspect.rs / M2_PLANET_LUT authority — the legacy clock
        // spec §5.3 comment (Venus=2) is a flagged erratum.
        expect(PLANET_ORDER[2]).toBe('Mercury');
        expect(PLANET_ORDER[3]).toBe('Venus');
        expect(PLANET_ORDER).toHaveLength(10);
    });

    it('element colour-binary covers exactly the five [[M2-2]] Mahabhuta ids', () => {
        // AKASHA=0 VAYU=1 AGNI=2 APAS=3 PRITHVI=4 (portal-core PLANET_ELEMENT_ID,
        // the M2_PLANET_LUT mirror — tattvas 31..35, NOT the alchemical register)
        for (const id of [0, 1, 2, 3, 4]) {
            const mahabhuta = asMahabhuta(id);
            expect(mahabhuta).not.toBeNull();
            expect(typeof ELEMENT_COLOURS[mahabhuta!]).toBe('number');
        }
        // There is no sixth mahabhuta — the register itself refuses the id, so
        // Salt (alchemical 5) can never reach this table at all.
        expect(asMahabhuta(5)).toBeNull();
    });

    it('body radius is monotonic in the Keplerian datum and bounded', () => {
        const moon = planetBodyRadius(47270); // fastest → smallest
        const sun = planetBodyRadius(35999);
        const pluto = planetBodyRadius(14); // slowest → largest
        expect(moon).toBeLessThan(sun);
        expect(sun).toBeLessThan(pluto);
        expect(moon).toBeGreaterThanOrEqual(0.06);
        expect(pluto).toBeLessThanOrEqual(0.14);
    });

    it('resonance pulse breathes deterministically within [1, 1.35]', () => {
        for (const t of [0, 312, 625, 1250, 9999]) {
            const p = resonancePulse(t);
            expect(p).toBeGreaterThanOrEqual(1);
            expect(p).toBeLessThanOrEqual(1.35 + 1e-9);
            expect(resonancePulse(t)).toBe(p); // pure in wall-time
        }
        expect(resonancePulse(312.5)).toBeCloseTo(1.35, 5); // crest at quarter period
    });
});
