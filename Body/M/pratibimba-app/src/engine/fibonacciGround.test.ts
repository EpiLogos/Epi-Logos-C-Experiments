import { describe, expect, it } from 'vitest';
import { clockAngle } from './cosmicMath';
import {
    clockRingPoint,
    FIBONACCI_GROUND_PERIOD,
    FIBONACCI_STEP_DEGREES,
    fibonacciGroundPoint,
    fibonacciPosition,
    fibonacciPositionDegree
} from './fibonacciGround';

const R = 3.3; // R_DEGREE — the 60-ring radius the two Sun markers ride on

describe('Level-0 Fibonacci Ground projection (Track 35.T35.1 — DR-FIB-1..2)', () => {
    it('the ground period is LCM(6,5,12) = 60 at 6°/step', () => {
        expect(FIBONACCI_GROUND_PERIOD).toBe(60);
        expect(FIBONACCI_STEP_DEGREES).toBe(6);
        expect(FIBONACCI_GROUND_PERIOD * FIBONACCI_STEP_DEGREES).toBe(360);
    });

    it('projects a clock degree to its ground position: floor(deg·60/360) mod 60', () => {
        expect(fibonacciPosition(0)).toBe(0);
        expect(fibonacciPosition(6)).toBe(1);
        expect(fibonacciPosition(90)).toBe(15);
        expect(fibonacciPosition(180)).toBe(30);
        expect(fibonacciPosition(270)).toBe(45);
        expect(fibonacciPosition(359.9)).toBe(59);
    });

    it('wraps the ground toroidally at both ends (mod-60, negatives and >360)', () => {
        expect(fibonacciPosition(360)).toBe(0);
        expect(fibonacciPosition(366)).toBe(1);
        expect(fibonacciPosition(-6)).toBe(59);
        expect(fibonacciPosition(-360)).toBe(0);
    });

    it('the four cardinal-zero anchors {0,15,30,45} sit at the quadrant degrees', () => {
        expect(fibonacciPositionDegree(0)).toBe(0);
        expect(fibonacciPositionDegree(15)).toBe(90);
        expect(fibonacciPositionDegree(30)).toBe(180);
        expect(fibonacciPositionDegree(45)).toBe(270);
    });
});

describe('clockRingPoint — the shared marker placement law', () => {
    it('mirrors the CosmicEngine trig exactly (clockAngle → cos / -sin)', () => {
        const deg = 217;
        const a = clockAngle(deg);
        expect(clockRingPoint(deg, R)).toEqual({ x: Math.cos(a) * R, z: -Math.sin(a) * R });
    });

    it('places 0° at the clock top and 90° at the 3-o’clock ray', () => {
        const top = clockRingPoint(0, R);
        expect(top.x).toBeCloseTo(0, 10);
        expect(top.z).toBeCloseTo(-R, 10);
        const right = clockRingPoint(90, R);
        expect(right.x).toBeCloseTo(R, 10);
        expect(right.z).toBeCloseTo(0, 10);
    });
});

describe('fibonacciGroundPoint — shared projection for BOTH Sun markers (§2.4 point 4)', () => {
    it('rides the 60-ring: |point| === radius for any Sun degree', () => {
        for (const sun of [0, 42, 91, 199.6, 333.3]) {
            const p = fibonacciGroundPoint(sun, R);
            expect(Math.hypot(p.x, p.z)).toBeCloseTo(R, 10);
        }
    });

    it('quantises the live Sun to its ground wedge — steady within a wedge, ADVANCES across it', () => {
        // 91° and 95° both fold onto ground position 15 → the dot is steady
        const inWedge = fibonacciGroundPoint(95, R);
        expect(fibonacciGroundPoint(91, R)).toEqual(inWedge);
        // 96° crosses into ground position 16 → the dot steps to a new point
        const nextWedge = fibonacciGroundPoint(96, R);
        expect(fibonacciPosition(96)).toBe(16);
        expect(nextWedge).not.toEqual(inWedge);
    });

    it('lands the silver dot on the ground-position anchor, not the raw degree', () => {
        // live Sun at 97.4° → ground position 16 → anchor degree 96°
        expect(fibonacciGroundPoint(97.4, R)).toEqual(clockRingPoint(96, R));
    });
});

describe('natal-gold vs live-silver — both at fibonacci-positions (the reading)', () => {
    it('BOTH Sun markers project through the Fibonacci Ground — distinct points when their wedges differ', () => {
        const natalDegree = 217; // structural ground (natal gold ring) → fib pos 36
        const liveSunDegree = 100; // current ground state (live silver dot) → fib pos 16
        const natalPoint = fibonacciGroundPoint(natalDegree, R);
        const livePoint = fibonacciGroundPoint(liveSunDegree, R);
        expect(fibonacciPosition(natalDegree)).toBe(36); // 216° anchor
        expect(fibonacciPosition(liveSunDegree)).toBe(16); // 96° anchor
        // neither marker rides its raw degree — each sits on its wedge anchor
        expect(natalPoint).toEqual(clockRingPoint(fibonacciPositionDegree(36), R));
        expect(livePoint).toEqual(clockRingPoint(fibonacciPositionDegree(16), R));
        expect(livePoint).not.toEqual(natalPoint);
        // the geometric distance between gold and silver is the reading
        const distance = Math.hypot(natalPoint.x - livePoint.x, natalPoint.z - livePoint.z);
        expect(distance).toBeGreaterThan(0);
    });

    it('gold and silver COINCIDE when both Suns fall in the same 6° fibonacci wedge', () => {
        const natalDegree = 217; // fib pos 36 (raw 217°)
        const liveSunDegree = 219; // fib pos 36 (raw 219°) — same ground wedge
        expect(fibonacciPosition(natalDegree)).toBe(fibonacciPosition(liveSunDegree));
        expect(natalDegree).not.toBe(liveSunDegree); // distinct raw degrees...
        // ...yet both markers land on the SAME ring point (shared ground wedge)
        expect(fibonacciGroundPoint(natalDegree, R)).toEqual(fibonacciGroundPoint(liveSunDegree, R));
    });
});
