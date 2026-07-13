/**
 * Coordinate: M' M5' (energy-decomposition read-out law tests — Track 33.T33.3)
 * Actualises: the tranche's audits as behavioral tests over the REAL kernel
 *   serialisation shape (`KernelTemporalProjection.energy` — camelCase `{:.6}`
 *   strings, exactly as portal-core `KernelTemporalEnergy` emits at
 *   kernel.rs:1986-1990): the three channels read verbatim in E₄/E₅/E₆ order
 *   with weights 4/5/6, the 4:5:6 total is the BUSSED value (never recomputed),
 *   the bimba–pratibimba scalar is a diagnostic NEVER folded into the total,
 *   a kernel-serialised 0 (E₅/E₆ stub-zero today) renders zero-with-provenance,
 *   and an absent energy object is honest `pending-energy`, never fabricated.
 */

import { describe, expect, it } from 'vitest';
import {
    buildEnergyDecompositionSurface,
    ENERGY_WEIGHTING_LABEL
} from './energyDecomposition';

/** The exact serialised energy the kernel emits — portal-core formats every
 *  field as `format!("{:.6}")` strings (kernel.rs:870-878). */
function energyPayload(energy: Record<string, string>) {
    return {
        // energy is a SIBLING of harmonicProfile on KernelTemporalProjection
        energy,
        harmonicProfile: { tick12: 3, degree720: 275 }
    };
}

describe('buildEnergyDecompositionSurface', () => {
    it('is pending-energy when the bus carries no energy object — nothing fabricated', () => {
        const surface = buildEnergyDecompositionSurface({
            payload: { harmonicProfile: { tick12: 0, degree720: 0 } },
            generation: 4
        });
        expect(surface.state).toBe('pending-energy');
        expect(surface.totalEnergy).toBeNull();
        expect(surface.bimbaPratibimbaDiagnostic).toBeNull();
        // the three channels still exist (E₄/E₅/E₆ with weights) but carry no value
        expect(surface.channels.map(c => c.key)).toEqual(['e4', 'e5', 'e6']);
        expect(surface.channels.map(c => c.weight)).toEqual([4, 5, 6]);
        expect(surface.channels.every(c => c.value === null && c.raw === null)).toBe(true);
        expect(surface.channels.every(c => c.zero === false)).toBe(true);
        expect(surface.weightingLabel).toBe(ENERGY_WEIGHTING_LABEL);
        expect(surface.generation).toBe(4);
    });

    it('reads E₄/E₅/E₆ verbatim from the real kernel serialisation, ordered with 4:5:6 weights', () => {
        // the exact strings the portal-core unit test asserts (kernel.rs:1986-1990)
        const surface = buildEnergyDecompositionSurface({
            payload: energyPayload({
                bimbaPratibimbaEnergy: '9.000000',
                e4PersonalEnergy: '1.000000',
                e5HarmonicEnergy: '2.000000',
                e6VerifierEnergy: '3.000000',
                totalEnergy: '2.133333'
            }),
            generation: 11
        });
        expect(surface.state).toBe('ready');
        expect(surface.channels.map(c => c.key)).toEqual(['e4', 'e5', 'e6']);
        expect(surface.channels.map(c => c.weight)).toEqual([4, 5, 6]);
        expect(surface.channels.map(c => c.value)).toEqual([1, 2, 3]);
        expect(surface.channels.map(c => c.field)).toEqual([
            'e4PersonalEnergy',
            'e5HarmonicEnergy',
            'e6VerifierEnergy'
        ]);
        // raw serialised strings preserved verbatim
        expect(surface.channels.map(c => c.raw)).toEqual(['1.000000', '2.000000', '3.000000']);
        expect(surface.channels.every(c => c.zero === false)).toBe(true);
    });

    it('takes the 4:5:6 total from the bus VERBATIM — it does not recompute it locally', () => {
        // total that DISAGREES with (4·1 + 5·2 + 6·3)/15 = 2.133333: if the surface
        // recomputed locally it would return 2.133333; a read-only projection returns
        // exactly what the kernel bussed.
        const surface = buildEnergyDecompositionSurface({
            payload: energyPayload({
                bimbaPratibimbaEnergy: '9.000000',
                e4PersonalEnergy: '1.000000',
                e5HarmonicEnergy: '2.000000',
                e6VerifierEnergy: '3.000000',
                totalEnergy: '99.500000'
            }),
            generation: 12
        });
        expect(surface.totalEnergy).toBe(99.5);
        expect(surface.totalEnergyRaw).toBe('99.500000');
        // proof it did NOT locally recompute the canonical weighting
        expect(surface.totalEnergy).not.toBeCloseTo(2.133333, 4);
    });

    it('keeps bimba–pratibimba as a diagnostic — read verbatim, never summed into the total', () => {
        const surface = buildEnergyDecompositionSurface({
            payload: energyPayload({
                bimbaPratibimbaEnergy: '9.000000',
                e4PersonalEnergy: '1.000000',
                e5HarmonicEnergy: '2.000000',
                e6VerifierEnergy: '3.000000',
                totalEnergy: '2.133333'
            }),
            generation: 13
        });
        expect(surface.bimbaPratibimbaDiagnostic).toBe(9);
        expect(surface.bimbaPratibimbaDiagnosticRaw).toBe('9.000000');
        // the diagnostic (9) is not part of the 4:5:6 total (2.133333)
        expect(surface.totalEnergy).toBeCloseTo(2.133333, 6);
        expect(surface.bimbaPratibimbaDiagnostic).not.toBe(surface.totalEnergy);
    });

    it('renders E₅/E₆ stub-zero as zero-with-provenance — honest 0, never fabricated', () => {
        // the LIVE bus today: E₅/E₆ are ::default() stub-zeros in the kernel; E₄ real.
        const surface = buildEnergyDecompositionSurface({
            payload: energyPayload({
                bimbaPratibimbaEnergy: '0.250000',
                e4PersonalEnergy: '0.420000',
                e5HarmonicEnergy: '0.000000',
                e6VerifierEnergy: '0.000000',
                totalEnergy: '0.112000'
            }),
            generation: 20
        });
        expect(surface.state).toBe('ready');
        const [e4, e5, e6] = surface.channels;
        // E₄ carries real content and is NOT flagged zero
        expect(e4.value).toBe(0.42);
        expect(e4.zero).toBe(false);
        // E₅/E₆ are honest zero-with-provenance — value is exactly the bussed 0,
        // flagged so the pane can state provenance, NOT replaced by a made-up number
        expect(e5.value).toBe(0);
        expect(e5.raw).toBe('0.000000');
        expect(e5.zero).toBe(true);
        expect(e6.value).toBe(0);
        expect(e6.zero).toBe(true);
    });

    it('carries the stated provenance and never marks a value canonical-of-its-own', () => {
        const surface = buildEnergyDecompositionSurface({
            payload: energyPayload({
                bimbaPratibimbaEnergy: '0.000000',
                e4PersonalEnergy: '0.000000',
                e5HarmonicEnergy: '0.000000',
                e6VerifierEnergy: '0.000000',
                totalEnergy: '0.000000'
            }),
            generation: 21
        });
        expect(surface.provenance).toContain('read verbatim');
        expect(surface.provenance).toContain('no renderer-local energy math');
        expect(surface.provenance).toContain('never summed');
    });

    it('tolerates a defensive numeric transport without synthesising a value', () => {
        const surface = buildEnergyDecompositionSurface({
            payload: { energy: { e4PersonalEnergy: 0.5, e5HarmonicEnergy: 0, totalEnergy: 0.2 } },
            generation: 30
        });
        expect(surface.channels[0].value).toBe(0.5);
        expect(surface.channels[1].value).toBe(0);
        expect(surface.channels[1].zero).toBe(true);
        // a field the kernel did not bus stays null, never invented
        expect(surface.channels[2].value).toBeNull();
        expect(surface.totalEnergy).toBe(0.2);
    });
});
