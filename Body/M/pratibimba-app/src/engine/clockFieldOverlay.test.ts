/**
 * Coordinate: M' M3' (clock-field overlay law — Track 04.T4.3)
 * Actualises: the tranche's render-test as headless behavioral tests — the
 *   aspect port matches the C kernel law (angles/orbs/tightest-match), the
 *   hop edge is the line-change involution on BUSSED values, absence yields
 *   an empty overlay, and tick advance provably perturbs the drawn set.
 */

import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import {
    aspectBetween,
    buildClockFieldOverlay,
    buildClockFieldOverlayState,
    updateClockFieldOverlay
} from './clockFieldOverlay';

describe('clock-field overlay (04.T4.3)', () => {
    it('aspect port matches the C law: angles {0,60,90,120,180}, orbs {10,6,8,8,10}, tightest wins', () => {
        expect(aspectBetween(10, 190)?.kind).toBe('opposition'); // exact 180
        expect(aspectBetween(0, 120)?.kind).toBe('trine');
        expect(aspectBetween(5, 95)?.kind).toBe('square');
        expect(aspectBetween(0, 60)?.kind).toBe('sextile');
        expect(aspectBetween(3, 8)?.kind).toBe('conjunction');
        // orb boundaries per MAJOR_ASPECT_ORB: sextile orb 6 — 67° is out
        expect(aspectBetween(0, 67)).toBeNull();
        expect(aspectBetween(0, 66)?.kind).toBe('sextile');
        // wrap-around: 350° vs 10° = 20° separation → no aspect (conj orb 10)
        expect(aspectBetween(350, 10)).toBeNull();
        expect(aspectBetween(355, 5)?.kind).toBe('conjunction');
    });

    it('builds aspect edges only from BUSSED planet degrees — absence = empty overlay', () => {
        const empty = buildClockFieldOverlayState({ tick12: 3 });
        expect(empty.aspectEdges).toHaveLength(0);
        expect(empty.hopEdge).toBeNull();

        const state = buildClockFieldOverlayState({
            planetDegrees: [0, 120, 240],
            tick12: 3
        });
        // 0-120 trine, 0-240 (=120 separation) trine, 120-240 trine
        expect(state.aspectEdges).toHaveLength(3);
        expect(state.aspectEdges.every(e => e.kind === 'trine')).toBe(true);
    });

    it('hop edge is the line-change involution on bussed hexagram/line (⊕ law, involutive)', () => {
        const payload = {
            mahamaya: { hexagramId: 0b101101, lineIndex: 2, lineChangeOperatorAddress: 272 }
        };
        const state = buildClockFieldOverlayState(payload);
        expect(state.hopEdge?.fromHexagram).toBe(0b101101);
        expect(state.hopEdge?.toHexagram).toBe(0b101001);
        expect(state.hopEdge?.lineChangeAddress).toBe(272);
        // involution: flipping the same line again returns the origin
        const back = buildClockFieldOverlayState({
            mahamaya: { hexagramId: 0b101001, lineIndex: 2, lineChangeOperatorAddress: 272 }
        });
        expect(back.hopEdge?.toHexagram).toBe(0b101101);
    });

    it('tick advance perturbs the wheel: a new generation redraws a different edge set', () => {
        const parts = buildClockFieldOverlay();
        const t0 = buildClockFieldOverlayState({
            planetDegrees: [0, 120],
            mahamaya: { hexagramId: 5, lineIndex: 0, lineChangeOperatorAddress: 30 },
            tick12: 0
        });
        updateClockFieldOverlay(parts, t0, 2.0);
        const drawnAtT0 = parts.group.children.map(c => c.name);
        expect(drawnAtT0).toContain('m3-aspect-edge-trine');
        expect(drawnAtT0).toContain('m3-hop-edge');

        const t1 = buildClockFieldOverlayState({
            planetDegrees: [0, 45], // no major aspect at 45°
            mahamaya: { hexagramId: 5, lineIndex: 3, lineChangeOperatorAddress: 33 },
            tick12: 1
        });
        updateClockFieldOverlay(parts, t1, 2.0);
        const drawnAtT1 = parts.group.children.map(c => c.name);
        expect(drawnAtT1).not.toContain('m3-aspect-edge-trine');
        expect(drawnAtT1).toContain('m3-hop-edge');
        expect(t1.hopEdge?.toHexagram).not.toBe(t0.hopEdge?.toHexagram);
    });

    it('edges are drawn on the clock plane at the given radius', () => {
        const parts = buildClockFieldOverlay();
        updateClockFieldOverlay(
            parts,
            buildClockFieldOverlayState({ planetDegrees: [0, 180] }),
            3.0
        );
        const line = parts.group.children[0] as THREE.Line;
        const positions = line.geometry.getAttribute('position');
        // first endpoint at degree 0 → (radius, 0, 0)
        expect(positions.getX(0)).toBeCloseTo(3.0, 5);
        expect(positions.getY(0)).toBeCloseTo(0, 5);
        expect(positions.getZ(0)).toBeCloseTo(0, 5);
    });
});
