/**
 * Coordinate: M' M3' (Level-0 ground marker geometry)
 * Residency: Body/M/pratibimba-app/src/engine
 * Position (#n): 0
 * Actualises: placement of backend-projected ground positions on the clock ring.
 * Public surface: fibonacciGroundPoint, clockRingPoint.
 * Does NOT own: Sun-degree projection, ground digits, or backbone positions.
 * Contract: [[M3'-SPEC]] section 8.0; rerun tranche 24.T24.19.
 */

import { clockAngle } from './cosmicMath';

const GROUND_POSITION_COUNT = 60;
const GROUND_POSITION_DEGREES = 6;

export interface RingPoint {
    readonly x: number;
    readonly z: number;
}

export function clockRingPoint(degree: number, radius: number): RingPoint {
    const angle = clockAngle(degree);
    return {
        x: Math.cos(angle) * radius,
        z: -Math.sin(angle) * radius
    };
}

/** Place an already-projected backend ground position on its wedge midpoint. */
export function fibonacciGroundPoint(position: number, radius: number): RingPoint {
    if (!Number.isInteger(position) || position < 0 || position >= GROUND_POSITION_COUNT) {
        throw new RangeError('fibonacci ground position must be an integer in [0, 59]');
    }
    return clockRingPoint(position * GROUND_POSITION_DEGREES + GROUND_POSITION_DEGREES / 2, radius);
}
