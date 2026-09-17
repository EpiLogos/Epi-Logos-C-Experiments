/**
 * Coordinate: M' M1' (played-torus view-model law — Track 02.T2.6)
 * Actualises: the tranche's Ananda source-fidelity + Vimarśa-window audits as
 *   behavioral tests — the raw/no-digi-root and digit-root faces arrive
 *   through `anandaVortex.activeCellValue` VERBATIM (a window, never local UI
 *   math), topology invariants come from the substrate payload, and absence
 *   of any bus field is an explicit pending state, never a fabricated cell.
 */

import { describe, expect, it } from 'vitest';
import { buildPlayedTorusView, vortexFromPayload } from './m1PlayedTorus';

/** 7X+1 at p=5 — the CSV's `36` skeleton cell (7·5+1=36, DR(36)=9). */
const CELL_7X1_P5 = {
    family: 'pratibimba',
    rowK: 7,
    positionP: 5,
    rawValue: 36,
    rawBimba: 35,
    rawPratibimba: 36,
    rawSum: 71,
    rawDelta: 1,
    drValue: 9,
    drBimba: 8,
    drPratibimba: 9,
    drSum: 8,
    ruleValue: null,
    skeletonEvent: 'Hit36'
};

const VALID_VORTEX = {
    activeMatrixOp: 'pratibimba',
    activeCell: [7, 5],
    activeCellValue: CELL_7X1_P5,
    drRingPhase: { mahamayaIdx: 2, parashaktiIdx: 6 },
    cl42SignatureAtPosition: -1,
    ringQuaternion: [0.5, -0.8660254, 0, 0],
    helixSheet: 1,
    kleinFlipAtThisTick: true
};

describe('m1 played-torus view model (T2.6)', () => {
    it('goes pending-ananda-vortex when the bus does not carry the projection — no fabricated cell', () => {
        const view = buildPlayedTorusView({ payload: { tick12: 3 }, generation: 7 });
        expect(view.vortexState).toBe('pending-ananda-vortex');
        expect(view.vortex).toBeNull();
    });

    it('rejects a malformed projection strictly (missing dual-face field) instead of part-filling', () => {
        const { rawBimba: _dropped, ...partialCell } = CELL_7X1_P5;
        const vortex = vortexFromPayload({
            anandaVortex: { ...VALID_VORTEX, activeCellValue: partialCell }
        });
        expect(vortex).toBeNull();
    });

    it('carries all Tranche 10.10 fields verbatim when ready', () => {
        const view = buildPlayedTorusView({
            payload: { anandaVortex: VALID_VORTEX },
            generation: 11
        });
        expect(view.vortexState).toBe('ready');
        expect(view.vortex).toEqual({ ...VALID_VORTEX, matrixCells: null });
    });

    it('Ananda source-fidelity: the 7X+1 raw+DR faces arrive through activeCellValue, not local math', () => {
        const view = buildPlayedTorusView({
            payload: { anandaVortex: VALID_VORTEX },
            generation: 1
        });
        expect(view.vortex?.activeCellValue.rawValue).toBe(36);
        expect(view.vortex?.activeCellValue.drValue).toBe(9);
        expect(view.vortex?.activeCellValue.skeletonEvent).toBe('Hit36');
    });

    it('Ananda source-fidelity: the 8X+0 `64` cell arrives verbatim', () => {
        const cell8x0 = {
            ...CELL_7X1_P5,
            family: 'bimba',
            rowK: 8,
            positionP: 8,
            rawValue: 64,
            rawBimba: 64,
            rawPratibimba: 65,
            rawSum: 129,
            drValue: 1,
            drBimba: 1,
            drPratibimba: 2,
            drSum: 3,
            skeletonEvent: 'Hit64'
        };
        const view = buildPlayedTorusView({
            payload: {
                anandaVortex: { ...VALID_VORTEX, activeCell: [8, 8], activeCellValue: cell8x0 }
            },
            generation: 1
        });
        expect(view.vortex?.activeCellValue.rawValue).toBe(64);
        expect(view.vortex?.activeCellValue.drValue).toBe(1);
    });

    it('is a WINDOW, not a derivation: a bus value inconsistent with r·c+b is still carried untouched', () => {
        const view = buildPlayedTorusView({
            payload: {
                anandaVortex: {
                    ...VALID_VORTEX,
                    activeCellValue: { ...CELL_7X1_P5, rawValue: 999 }
                }
            },
            generation: 1
        });
        // 7·5+1 would be 36 — the view must NOT recompute; the kernel writes.
        expect(view.vortex?.activeCellValue.rawValue).toBe(999);
    });

    it('reads the K² topology invariants from the substrate payload (720 / genus 1)', () => {
        const view = buildPlayedTorusView({
            payload: { m1Topology: { doubleCoverDeg: 720, torusGenus: 1 } },
            generation: 1
        });
        expect(view.topology.doubleCoverDeg).toBe(720);
        expect(view.topology.torusGenus).toBe(1);
    });

    it('reports blocked topology when the substrate has not exposed the constants', () => {
        const view = buildPlayedTorusView({ payload: {}, generation: 1 });
        expect(view.topology.doubleCoverDeg).toBeNull();
        expect(view.topology.source).toContain('blocked');
    });

    it('Vimarśa windows: audio octet passes through at exactly 8, otherwise pending', () => {
        const octet = [110, 220, 330, 440, 550, 660, 770, 880];
        const ready = buildPlayedTorusView({
            payload: { anandaVortex: VALID_VORTEX, audioOctet: octet },
            generation: 1
        });
        expect(ready.audioOctet).toEqual(octet);
        const pending = buildPlayedTorusView({
            payload: { anandaVortex: VALID_VORTEX, audioOctet: octet.slice(0, 7) },
            generation: 1
        });
        expect(pending.audioOctet).toBeNull();
    });

    it('kleinFlipReady mirrors klein_flip presence on the generation', () => {
        const absent = buildPlayedTorusView({ payload: { anandaVortex: VALID_VORTEX }, generation: 1 });
        expect(absent.kleinFlipReady).toBe(false);
        const present = buildPlayedTorusView({
            payload: { anandaVortex: VALID_VORTEX, kleinFlip: { tick: 5 } },
            generation: 1
        });
        expect(present.kleinFlipReady).toBe(true);
    });

    it('unwraps the wire harmonicProfile nesting like the modulation graph', () => {
        const view = buildPlayedTorusView({
            payload: { harmonicProfile: { anandaVortex: VALID_VORTEX } },
            generation: 1
        });
        expect(view.vortexState).toBe('ready');
    });
});
