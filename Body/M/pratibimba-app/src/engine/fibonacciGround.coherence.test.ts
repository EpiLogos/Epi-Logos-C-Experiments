/**
 * Track 35.T35.2 — Fibonacci Ground Level-0 end-to-end COHERENCE (kernel <-> carrier).
 *
 * The audit deliverable (plan.runs/35-fibonacci-ground-coherence-audit.md) records
 * DR-FIB-1..5 status across the four-level substrate. THIS test is its executable
 * backing for the load-bearing claim: the carrier's Level-0 projection
 * (Body/M/pratibimba-app/src/engine/fibonacciGround.ts, landed by 35.T35.1) AGREES
 * with the kernel's Level-0 ground definition over the entire real 360deg domain —
 * "same 6deg wedge math, same anchors".
 *
 * The two implementations are written independently, in different languages, against
 * ONE cited law:
 *
 *   KERNEL — Body/S/S0/portal-core/src/kernel/projections/phase_space.rs
 *     :314  fib_position = (degree360 / 6) as u8          (integer floor over 0..359)
 *     :22-26 / :76-78 / :249  period 60 (LCM(6,5,12), Pisano pi(10)=60), 6deg/step,
 *            the +1 Level-0 aperture of the 16+1 law, NOT a 17th lens
 *     :325  phase01 = (degree360 % 6) / 6
 *   KERNEL TEST — Body/S/S0/portal-core/tests/phase_space_profile_field.rs (9 pass)
 *     :189  from_degree720(144).fibonacci_ground.position == 24   // 144 / 6
 *     :193  from_degree720(66).fibonacci_ground.position  == 11   // 66 / 6
 *
 *   CARRIER — ./fibonacciGround.ts
 *     fibonacciPosition(deg) = floor((deg mod 360) * 60 / 360) mod 60   (a DIFFERENT
 *       closed form for the same floor(deg/6) law — agreement is the coherence)
 *     FIBONACCI_GROUND_PERIOD = 60, FIBONACCI_STEP_DEGREES = 6
 *     fibonacciPositionDegree(pos) = pos * 6   (the wedge anchor)
 *
 * No fabricated fixtures: every expected value is either the kernel's cited closed
 * form (independently recomputed here as `kernelFibonacciPosition`) or a value the
 * kernel's OWN test pins. The runtime seam that feeds this law — the live Sun degree
 * `frame.kairos.degrees[0]` === `m4_planet_degrees_live()[0]` on the wire — carries
 * a degree; the LAW that folds it onto the 60-ring is what must cohere, and that is
 * pure math, degree-independent of the transport. So this proves the ground-law
 * coherence directly, without a gateway fixture.
 */

import { describe, expect, it } from 'vitest';
import {
    clockRingPoint,
    FIBONACCI_GROUND_PERIOD,
    FIBONACCI_STEP_DEGREES,
    fibonacciGroundPoint,
    fibonacciPosition,
    fibonacciPositionDegree
} from './fibonacciGround';

const R = 3.3; // R_DEGREE — the 60-ring radius both Sun markers ride on

/**
 * The kernel Level-0 position law, recomputed from phase_space.rs:314
 * (`fib_position = (degree360 / 6) as u8`, degree360 = degree720 % 360).
 * This is the reference the carrier must reproduce, written independently of the
 * carrier's `floor(deg*60/360) mod 60` expression.
 */
function kernelFibonacciPosition(degree: number): number {
    const degree360 = ((degree % 360) + 360) % 360; // kernel `degree720 % 360`, non-negative
    return Math.floor(degree360 / 6);
}

describe('Level-0 ground constants cohere with the kernel (period 60, 6deg/step)', () => {
    it('carrier period + step equal the kernel LCM(6,5,12)=60, 6deg/step ground', () => {
        // phase_space.rs :22-26 / :249 — 60 positions, 6deg each, tiling 360.
        expect(FIBONACCI_GROUND_PERIOD).toBe(60);
        expect(FIBONACCI_STEP_DEGREES).toBe(6);
        expect(FIBONACCI_GROUND_PERIOD * FIBONACCI_STEP_DEGREES).toBe(360);
    });
});

describe('Position projection agrees with the kernel over the ENTIRE real 360deg ground', () => {
    it('fibonacciPosition(deg) === kernel floor(degree360/6) for every degree 0..359', () => {
        for (let deg = 0; deg < 360; deg += 1) {
            expect(fibonacciPosition(deg)).toBe(kernelFibonacciPosition(deg));
        }
    });

    it('reproduces the kernel test`s OWN pinned anchors (phase_space_profile_field.rs)', () => {
        // :189 from_degree720(144).position == 24 ; :193 from_degree720(66).position == 11
        expect(fibonacciPosition(144)).toBe(24);
        expect(kernelFibonacciPosition(144)).toBe(24);
        expect(fibonacciPosition(66)).toBe(11);
        expect(kernelFibonacciPosition(66)).toBe(11);
    });

    it('agrees with the kernel`s toroidal fold at both ends (>=360 and negatives)', () => {
        for (const deg of [360, 366, 720, 719.9, -6, -90, -360]) {
            expect(fibonacciPosition(deg)).toBe(kernelFibonacciPosition(deg));
        }
    });
});

describe('The four cardinal-zero anchors cohere (positions {0,15,30,45} at {0,90,180,270})', () => {
    it('carrier wedge anchors equal the kernel quadrant degrees', () => {
        expect(fibonacciPositionDegree(0)).toBe(0);
        expect(fibonacciPositionDegree(15)).toBe(90);
        expect(fibonacciPositionDegree(30)).toBe(180);
        expect(fibonacciPositionDegree(45)).toBe(270);
        // and each cardinal degree folds back to its cardinal position under the kernel law
        expect(kernelFibonacciPosition(0)).toBe(0);
        expect(kernelFibonacciPosition(90)).toBe(15);
        expect(kernelFibonacciPosition(180)).toBe(30);
        expect(kernelFibonacciPosition(270)).toBe(45);
    });
});

describe('Marker placement lands on the kernel-quantised wedge anchor (the app <-> kernel path)', () => {
    it('fibonacciGroundPoint(sun) === ring point at the kernel ground position, for real Sun degrees', () => {
        // Real Sun-degree samples across the ground; each app marker must sit on the
        // wedge anchor of the KERNEL position, never on the raw degree.
        for (const sun of [0, 42, 66, 91, 95.9, 144, 199.6, 270, 333.3, 359.9]) {
            const kernelAnchorDegree = kernelFibonacciPosition(sun) * FIBONACCI_STEP_DEGREES;
            expect(fibonacciGroundPoint(sun, R)).toEqual(clockRingPoint(kernelAnchorDegree, R));
            // and the marker rides the 60-ring exactly
            const p = fibonacciGroundPoint(sun, R);
            expect(Math.hypot(p.x, p.z)).toBeCloseTo(R, 10);
        }
    });

    it('advances by a whole wedge exactly when the kernel position advances (6deg boundary)', () => {
        // 95deg and 91deg share kernel position 15; 96deg crosses to kernel position 16.
        expect(kernelFibonacciPosition(91)).toBe(15);
        expect(kernelFibonacciPosition(95.9)).toBe(15);
        expect(kernelFibonacciPosition(96)).toBe(16);
        expect(fibonacciGroundPoint(91, R)).toEqual(fibonacciGroundPoint(95.9, R));
        expect(fibonacciGroundPoint(96, R)).not.toEqual(fibonacciGroundPoint(95.9, R));
    });
});
