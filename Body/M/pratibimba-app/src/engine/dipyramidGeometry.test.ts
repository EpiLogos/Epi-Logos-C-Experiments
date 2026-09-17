/**
 * Coordinate: M' M4-5' (dipyramid law — Track 08.T8.7)
 * Actualises: the visual fixture acceptance — the full 6+6 P/P' mapping is
 *   labeled; the retired "6 vertices = 6 QL positions" reading cannot render.
 */

import { describe, expect, it } from 'vitest';
import {
    buildDipyramid6Plus6,
    DIPYRAMID_APEX_HEIGHT,
    DIPYRAMID_HALF_BASE
} from './dipyramidGeometry';

describe('dipyramid 6+6 geometry (08.T8.7 / DR-IG-6)', () => {
    const vertices = buildDipyramid6Plus6();

    it('labels the FULL 6+6 mapping: 2 apices + 8 interleaved base + the axis-point (never 6 vertices)', () => {
        expect(vertices.length).toBe(11); // 2 + 8 + 1 — not the retired 6
        const labels = vertices.map(v => v.label);
        expect(labels).toContain('P5');
        expect(labels).toContain("P5'");
        for (let i = 1; i <= 4; i++) {
            expect(labels).toContain(`P${i}`);
            expect(labels).toContain(`P${i}'`);
        }
        expect(labels).toContain("P0/P0'");
    });

    it('P5/P5′ are the apex poles; P0/P0′ the central axis-point through them', () => {
        const p5 = vertices.find(v => v.label === 'P5');
        const p5i = vertices.find(v => v.label === "P5'");
        const axis = vertices.find(v => v.role === 'axis-point');
        expect(p5?.position).toEqual([0, DIPYRAMID_APEX_HEIGHT, 0]);
        expect(p5i?.position).toEqual([0, -DIPYRAMID_APEX_HEIGHT, 0]);
        expect(axis?.position).toEqual([0, 0, 0]);
    });

    it('the inverted base INTERLEAVES with the base — never collapsed onto it — pairing by x + y′ = 5', () => {
        const base = vertices.filter(v => v.role === 'base');
        expect(base.length).toBe(8);
        for (const v of base.filter(b => b.series === 'P')) {
            const n = Number(v.label.replace(/\D/g, ''));
            expect(v.mirrorLabel).toBe(`P${5 - n}'`); // x + y' = 5
            // no P' vertex shares its position (interleave, no collapse)
            const collision = base.find(
                other =>
                    other.series === "P'" &&
                    other.position[0] === v.position[0] &&
                    other.position[2] === v.position[2]
            );
            expect(collision).toBeUndefined();
        }
    });

    it('is deliberately non-regular: apex height ≠ half-base', () => {
        expect(DIPYRAMID_APEX_HEIGHT).not.toBe(DIPYRAMID_HALF_BASE);
    });
});
