/**
 * Coordinate: M' shell-0 acceptance (31.T31.6 — coordinate names)
 * Residency: Body/M/pratibimba-app/src/ui
 * Actualises: proves decomposeCoordinate produces the family → archetype →
 *   position naming + reduced coordinates the breadcrumb triad renders.
 * Contract: rerun tranche [[31.T31.6]]
 */

import { describe, expect, it } from 'vitest';
import { ARCHETYPE_NAMES, FAMILY_NAMES, decomposeCoordinate } from './coordinateNames';

describe('31.T31.6 decomposeCoordinate — family/archetype/position triad', () => {
    it('decomposes M4-3 into M / Nara / 3 with reduced coordinates M, M4, M4-3', () => {
        const d = decomposeCoordinate('M4-3');
        expect(d).not.toBeNull();
        expect(d!.family).toBe('M');
        expect(d!.grade).toBe(4);
        expect(d!.familyName).toBe('Subsystem');
        expect(d!.archetypeName).toBe('Nara');
        expect(d!.positionTail).toBe('3');
        expect(d!.familyCoord).toBe('M');
        expect(d!.archetypeCoord).toBe('M4');
        expect(d!.fullCoord).toBe('M4-3');
    });

    it('keeps a deep nested tail intact (M3-1-0-13 → tail 1-0-13)', () => {
        const d = decomposeCoordinate('M3-1-0-13');
        expect(d!.archetypeName).toBe('Mahamaya');
        expect(d!.archetypeCoord).toBe('M3');
        expect(d!.positionTail).toBe('1-0-13');
        expect(d!.fullCoord).toBe('M3-1-0-13');
    });

    it('has no position tail for a bare subsystem coordinate (M0)', () => {
        const d = decomposeCoordinate('M0');
        expect(d!.archetypeName).toBe('Anuttara');
        expect(d!.positionTail).toBe('');
        expect(d!.familyCoord).toBe('M');
        expect(d!.archetypeCoord).toBe('M0');
    });

    it('names every family and every archetype grade (canon completeness)', () => {
        for (const family of ['P', 'S', 'T', 'M', 'L', 'C'] as const) {
            expect(FAMILY_NAMES[family]).toBeTruthy();
            expect(ARCHETYPE_NAMES[family]).toHaveLength(6);
            for (const name of ARCHETYPE_NAMES[family]) {
                expect(name).toBeTruthy();
            }
        }
        // spot-check the canonical S-stack and C-family names
        expect(ARCHETYPE_NAMES.S[3]).toBe('Gateway');
        expect(ARCHETYPE_NAMES.C[0]).toBe('Bimba');
        expect(ARCHETYPE_NAMES.C[5]).toBe('Pratibimba');
    });

    it('is case-insensitive on the family letter (s1 → Stack/Obsidian)', () => {
        const d = decomposeCoordinate('s1');
        expect(d!.family).toBe('S');
        expect(d!.familyName).toBe('Stack');
        expect(d!.archetypeName).toBe('Obsidian');
        expect(d!.archetypeCoord).toBe('S1');
    });

    it('returns null for a non-family coordinate (#4 raw archetype, cpf reflective)', () => {
        expect(decomposeCoordinate('#4')).toBeNull();
        expect(decomposeCoordinate('cpf')).toBeNull();
        expect(decomposeCoordinate('')).toBeNull();
    });
});
