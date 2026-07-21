/**
 * Coordinate: M' M4' (logos-cycle parser tests — 25.T25.13)
 * Actualises: the strict fail-closed contract for the nara.logos cursor +
 *   transition payloads — status reads carry no transition, an advance never
 *   carries the regression flag, and a regress must carry it.
 */

import { describe, expect, it } from 'vitest';
import { parseLogosCycleReceipt } from './logosCycle';

const STATUS = { date: '2026-07-21', completed_stages: [0, 1, 2], next_stage: 3, total: 6 };

describe('parseLogosCycleReceipt (25.T25.13)', () => {
    it('parses a plain status read with no transition', () => {
        const receipt = parseLogosCycleReceipt(STATUS);
        expect(receipt.completedStages).toEqual([0, 1, 2]);
        expect(receipt.nextStage).toBe(3);
        expect(receipt.total).toBe(6);
        expect(receipt.transition).toBeNull();
    });

    it('parses an advance transition without the regression flag', () => {
        const receipt = parseLogosCycleReceipt({
            ...STATUS,
            transitioned_stage: 2,
            direction: 'advance',
            regression: false,
            artifact_path: '/nara/logos/2026-07-21-stage-2.md'
        });
        expect(receipt.transition).toEqual({
            stage: 2,
            direction: 'advance',
            regression: false,
            artifactPath: '/nara/logos/2026-07-21-stage-2.md'
        });
    });

    it('parses a regress transition carrying the explicit regression flag', () => {
        const receipt = parseLogosCycleReceipt({
            date: '2026-07-21',
            completed_stages: [0, 1],
            next_stage: 2,
            total: 6,
            transitioned_stage: 2,
            direction: 'regress',
            regression: true,
            artifact_path: '/nara/logos/2026-07-21-regress-2.md'
        });
        expect(receipt.transition?.direction).toBe('regress');
        expect(receipt.transition?.regression).toBe(true);
    });

    it('rejects a non-canonical stage total', () => {
        expect(() => parseLogosCycleReceipt({ ...STATUS, total: 5 })).toThrow(/canonical/);
    });

    it('rejects a regress that omits the regression flag', () => {
        expect(() =>
            parseLogosCycleReceipt({
                ...STATUS,
                transitioned_stage: 2,
                direction: 'regress',
                regression: false,
                artifact_path: '/x.md'
            })
        ).toThrow(/regression: true/);
    });

    it('rejects an advance that falsely carries the regression flag', () => {
        expect(() =>
            parseLogosCycleReceipt({
                ...STATUS,
                transitioned_stage: 2,
                direction: 'advance',
                regression: true,
                artifact_path: '/x.md'
            })
        ).toThrow(/must not carry the regression flag/);
    });

    it('rejects an out-of-range next_stage', () => {
        expect(() => parseLogosCycleReceipt({ ...STATUS, next_stage: 7 })).toThrow(/0\.\.6/);
    });
});
