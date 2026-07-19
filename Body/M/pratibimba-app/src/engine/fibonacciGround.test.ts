import { describe, expect, it } from 'vitest';
import { clockRingPoint, fibonacciGroundPoint } from './fibonacciGround';

const RADIUS = 3.3;

describe('Level-0 ground marker geometry', () => {
    it('places backend positions at their wedge midpoints', () => {
        expect(fibonacciGroundPoint(0, RADIUS)).toEqual(clockRingPoint(3, RADIUS));
        expect(fibonacciGroundPoint(16, RADIUS)).toEqual(clockRingPoint(99, RADIUS));
        expect(fibonacciGroundPoint(36, RADIUS)).toEqual(clockRingPoint(219, RADIUS));
    });

    it('keeps every marker on the requested ring', () => {
        for (const position of [0, 5, 15, 16, 36, 45, 59]) {
            const point = fibonacciGroundPoint(position, RADIUS);
            expect(Math.hypot(point.x, point.z)).toBeCloseTo(RADIUS, 10);
        }
    });

    it('rejects absent or malformed backend positions instead of wrapping them', () => {
        for (const position of [-1, 1.5, 60, Number.NaN]) {
            expect(() => fibonacciGroundPoint(position, RADIUS)).toThrow(RangeError);
        }
    });
});
