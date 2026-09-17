/**
 * Coordinate: M' M5' (EBM observatory law tests — Track 26.T26.1)
 * Actualises: the tranche's audits as behavioral tests — the surface is
 *   ready ONLY when the bus carries a checkpoint ref + predicted72, energy
 *   follows the spec formula when not bussed (bussed value wins verbatim),
 *   the Möbius step is exactly −log(9/8)·∇E over the bussed gradient, the
 *   three Klein-V₄ squares partition positions (0,5)/(1,4)/(2,3) across
 *   all 12 lenses, and absence is pending, never fabricated.
 */

import { describe, expect, it } from 'vitest';
import { buildResonanceEbmSurface, EPOGDOON_LOG } from './m5Ebm';

const PREDICTED = Array.from({ length: 72 }, (_, i) => i / 72);
const TARGET = Array.from({ length: 72 }, (_, i) => (i + 1) / 72);
const GRADIENT = [0.5, -0.25, 0.125, -0.0625];

function payload(projection: Record<string, unknown> | undefined) {
    return {
        harmonicProfile: projection ? { mathemeResonance72Projection: projection } : {}
    };
}

describe('buildResonanceEbmSurface', () => {
    it('is pending-checkpoint when the projection carries no checkpoint ref — grid suppressed', () => {
        const absent = buildResonanceEbmSurface({ payload: payload(undefined), generation: 1 });
        expect(absent.state).toBe('pending-checkpoint');
        expect(absent.checkpointRef).toBeNull();
        expect(absent.predicted72).toBeNull();
        expect(absent.energy).toBeNull();
        expect(absent.gradient).toBeNull();
        expect(absent.mobiusDescentStep).toBeNull();
        expect(absent.tritoneSquares.every(square => square.cells.length === 0)).toBe(true);

        const noRef = buildResonanceEbmSurface({
            payload: payload({ predicted72: PREDICTED }),
            generation: 2
        });
        expect(noRef.state).toBe('pending-checkpoint');
    });

    it('is ready with checkpoint + predicted72; energy follows the spec formula when not bussed', () => {
        const surface = buildResonanceEbmSurface({
            payload: payload({
                learnedPredictorCheckpointRef: 'ebm-checkpoint://v0.3',
                predicted72: PREDICTED,
                target72: TARGET
            }),
            generation: 9
        });
        expect(surface.state).toBe('ready');
        expect(surface.checkpointRef).toBe('ebm-checkpoint://v0.3');
        // every component differs by exactly 1/72 → E = 72 · (1/72)² = 1/72
        expect(surface.energy).toBeCloseTo(1 / 72, 10);
    });

    it('a bussed energy value wins verbatim over the local formula', () => {
        const surface = buildResonanceEbmSurface({
            payload: payload({
                learnedPredictorCheckpointRef: 'ebm-checkpoint://v0.3',
                predicted72: PREDICTED,
                target72: TARGET,
                energy: 0.123456
            }),
            generation: 3
        });
        expect(surface.energy).toBe(0.123456);
    });

    it('derives the Möbius-descent step as −log(9/8)·∇E over the bussed gradient only', () => {
        const withGradient = buildResonanceEbmSurface({
            payload: payload({
                learnedPredictorCheckpointRef: 'ebm-checkpoint://v0.3',
                predicted72: PREDICTED,
                gradient: GRADIENT
            }),
            generation: 4
        });
        expect(withGradient.gradient).toEqual(GRADIENT);
        expect(withGradient.mobiusDescentStep).toEqual(
            GRADIENT.map(g => -EPOGDOON_LOG * g)
        );
        expect(EPOGDOON_LOG).toBeCloseTo(Math.log(9 / 8), 12);

        const withoutGradient = buildResonanceEbmSurface({
            payload: payload({
                learnedPredictorCheckpointRef: 'ebm-checkpoint://v0.3',
                predicted72: PREDICTED
            }),
            generation: 5
        });
        expect(withoutGradient.gradient).toBeNull();
        expect(withoutGradient.mobiusDescentStep).toBeNull();
    });

    it('partitions the three Klein-V₄ squares over (0,5)/(1,4)/(2,3) across all 12 lenses', () => {
        const surface = buildResonanceEbmSurface({
            payload: payload({
                learnedPredictorCheckpointRef: 'ebm-checkpoint://v0.3',
                predicted72: PREDICTED,
                target72: TARGET,
                tritoneCoherence: [0.9, 0.5, 0.1]
            }),
            generation: 6
        });
        expect(surface.tritoneSquares.map(square => square.squareLabel)).toEqual([
            'A:(0,5)',
            'B:(1,4)',
            'C:(2,3)'
        ]);
        const positionsSeen = new Set<number>();
        for (const square of surface.tritoneSquares) {
            expect(square.cells.length).toBe(24); // 12 lenses × 2 positions
            for (const cell of square.cells) {
                expect(square.positions).toContain(cell.position);
                expect(cell.predicted).toBe(PREDICTED[cell.lens * 6 + cell.position]);
                positionsSeen.add(cell.position);
            }
        }
        expect([...positionsSeen].sort()).toEqual([0, 1, 2, 3, 4, 5]);
        expect(surface.tritoneSquares.map(square => square.coherenceScore)).toEqual([
            0.9, 0.5, 0.1
        ]);
    });

    it('coherence is pending (null) when the kernel-owned score is not bussed', () => {
        const surface = buildResonanceEbmSurface({
            payload: payload({
                learnedPredictorCheckpointRef: 'ebm-checkpoint://v0.3',
                predicted72: PREDICTED
            }),
            generation: 7
        });
        expect(surface.tritoneSquares.every(square => square.coherenceScore === null)).toBe(true);
    });
});
