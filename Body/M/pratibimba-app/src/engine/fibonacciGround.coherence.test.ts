/**
 * The marker geometry consumes backend positions only. Transport coherence is
 * proved by the portal-core profile tests and the live-wire manifest; this test
 * pins the remaining carrier responsibility: stable radial placement.
 */

import { describe, expect, it } from 'vitest';
import { fibonacciGroundPoint } from './fibonacciGround';

const RADIUS = 3.3;

describe('backend ground-position marker coherence', () => {
    it('keeps natal and live markers distinct when positions differ', () => {
        const natal = fibonacciGroundPoint(36, RADIUS);
        const live = fibonacciGroundPoint(16, RADIUS);
        expect(live).not.toEqual(natal);
        expect(Math.hypot(natal.x - live.x, natal.z - live.z)).toBeGreaterThan(0);
    });

    it('coincides exactly when backend positions coincide', () => {
        expect(fibonacciGroundPoint(36, RADIUS)).toEqual(
            fibonacciGroundPoint(36, RADIUS)
        );
    });
});
