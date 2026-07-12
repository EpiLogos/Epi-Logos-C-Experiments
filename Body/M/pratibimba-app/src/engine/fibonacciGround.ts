/**
 * Coordinate: M' M2' (#2-0 Parashakti — Level-0 Fibonacci Ground)
 * Residency: Body/M/pratibimba-app/src/engine
 * Actualises: Track-35 §2.4 point 4 (source §8.0 / DR-FIB-1..2) — the Level-0
 *   Fibonacci-Ground projection behind the cosmic clock's two Sun markers. A
 *   clock degree (0..360) folds onto its Fibonacci-Ground position
 *   (0..59; LCM(6,5,12) = 60, Pisano π(10) = 60; 6°/step). BOTH Sun markers
 *   project through this ground (source §2.4 point 4): the natal-Sun gold ring
 *   reads the person's STRUCTURAL ground-position, the live-Sun silver dot reads
 *   the CURRENT ground-position; each sits at its Fibonacci-position, they
 *   COINCIDE when both Sun degrees fall in the same 6° wedge, and the geometric
 *   distance between them on the 60-ring is the reading. Pure math over BUSSED
 *   kernel Sun degrees
 *   (`m4_planet_degrees_live()[0]` on the wire === `frame.kairos.degrees[0]`) —
 *   never a correspondence table of our own.
 * Does NOT own: the Sun degree (kernel kairos / epi-lib m4), CLOCK_BACKBONE
 *   (epi-lib m3), the ring geometry or marker meshes (CosmicEngine).
 */

import { clockAngle } from './cosmicMath';

/** Level-0 Fibonacci Ground period — LCM(6, 5, 12) = 60 (Pisano π(10) = 60). */
export const FIBONACCI_GROUND_PERIOD = 60;

/** Degrees per Fibonacci-Ground step: 360 / 60 = 6°. */
export const FIBONACCI_STEP_DEGREES = 360 / FIBONACCI_GROUND_PERIOD;

/** Project a clock degree onto its Level-0 Fibonacci-Ground position (0..59):
 *  `fibonacci_position = floor(deg · 60 / 360) mod 60` (source §2.4 point 4).
 *  Toroidal — negatives and degrees ≥ 360 wrap onto the 60-fold ground. */
export function fibonacciPosition(degree: number): number {
    const wrapped = ((degree % 360) + 360) % 360;
    return Math.floor((wrapped * FIBONACCI_GROUND_PERIOD) / 360) % FIBONACCI_GROUND_PERIOD;
}

/** The clock degree at the anchor of a Fibonacci-Ground position — the start of
 *  its 6° wedge (0→0°, 15→90°, 30→180°, 45→270°: the four cardinal-zeros). */
export function fibonacciPositionDegree(position: number): number {
    const p =
        ((position % FIBONACCI_GROUND_PERIOD) + FIBONACCI_GROUND_PERIOD) % FIBONACCI_GROUND_PERIOD;
    return p * FIBONACCI_STEP_DEGREES;
}

export interface RingPoint {
    readonly x: number;
    readonly z: number;
}

/** The (x, z) point on a clock ring of `radius` for a raw degree — mirrors the
 *  CosmicEngine marker placement law exactly (clockAngle → cos / -sin). The
 *  shared placement primitive that `fibonacciGroundPoint` composes after folding
 *  a Sun degree onto its wedge anchor; not called with a raw Sun degree itself. */
export function clockRingPoint(degree: number, radius: number): RingPoint {
    const a = clockAngle(degree);
    return { x: Math.cos(a) * radius, z: -Math.sin(a) * radius };
}

/** Project a Sun degree onto its Level-0 Fibonacci-Ground position, then place
 *  it on the 60-ring at that wedge anchor (source §2.4 point 4). BOTH Sun
 *  markers ride this projection — the natal gold ring (structural ground) and
 *  the live silver dot (current ground). Each marker is steady WITHIN its 6°
 *  wedge and ADVANCES by a whole wedge across a boundary; the two markers
 *  COINCIDE exactly when both Sun degrees fall in the same wedge. */
export function fibonacciGroundPoint(sunDegree: number, radius: number): RingPoint {
    return clockRingPoint(fibonacciPositionDegree(fibonacciPosition(sunDegree)), radius);
}
