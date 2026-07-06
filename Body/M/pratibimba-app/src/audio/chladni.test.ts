import { describe, expect, it } from 'vitest';
import { chladniField, chladniIntensity, chladniMode } from './chladni';

const QUARTET = [
    { m: 1, n: 1 },
    { m: 2, n: 1 },
    { m: 3, n: 2 },
    { m: 1, n: 3 }
];
const OCTET = [146.8, 167.5, 191.2, 216.4, 174.6, 199.3, 227.4, 233.1];

describe('chladni field', () => {
    it('equal-mode terms vanish identically (m = n contributes stillness)', () => {
        expect(chladniMode(0.37, 0.61, 2, 2)).toBeCloseTo(0, 12);
    });

    it('the mode is antisymmetric under coordinate swap', () => {
        expect(chladniMode(0.2, 0.7, 3, 1)).toBeCloseTo(-chladniMode(0.7, 0.2, 3, 1), 12);
    });

    it('intensity is sound-derived: silence in, stillness out', () => {
        expect(chladniIntensity(0.3, 0.4, [], OCTET)).toBe(0);
        const withSound = chladniIntensity(0.3, 0.4, QUARTET, OCTET);
        expect(withSound).toBeGreaterThan(0);
        expect(withSound).toBeLessThanOrEqual(1);
    });

    it('rasterises a full field with nodal (zero) lines present', () => {
        const field = chladniField(32, QUARTET, OCTET);
        expect(field.length).toBe(1024);
        const max = Math.max(...field);
        const min = Math.min(...field);
        expect(max).toBeGreaterThan(0.1);
        expect(min).toBeLessThan(0.02); // sand lines exist
    });
});
