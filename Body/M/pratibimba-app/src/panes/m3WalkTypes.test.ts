/**
 * Coordinate: M' M3' (9-walk kernel-mirror cross-check — Track 24.T24.4)
 * Residency: Body/M/pratibimba-app/src/panes
 * Actualises: the anti-drift proof that `M3_WALK_TYPES` is a FIXED KERNEL
 *   CONSTANT, not a fabricated carrier table — it reads the authoritative
 *   kernel enum `Body/S/S0/portal-core/src/types.rs#WalkType` and asserts the
 *   mirror's labels + step counts match the kernel `label()` arms and the
 *   `STEPS` array VERBATIM. If a kernel step count or label ever changes and
 *   this mirror is not updated, this test goes red — the mirror can never
 *   silently drift from the kernel.
 * Does NOT own: the kernel enum, live walk position, or the advance command.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
    M3_WALK_TYPES,
    M3_WALK_TYPE_COUNT,
    parseCosmicClockWalkSteps
} from './m3WalkTypes';

// src/panes → repo root is five hops up (../src, ../pratibimba-app, ../M,
// ../Body, ../<repo>). Same idiom as m1BackendStudioPack.test.ts.
const REPO_ROOT = resolve(__dirname, '../../../../..');
const KERNEL_TYPES_RS = resolve(REPO_ROOT, 'Body/S/S0/portal-core/src/types.rs');

/** Read the kernel `enum WalkType`'s authoritative label()/step_count() data. */
function readKernelWalkTypes(): { labels: string[]; steps: number[]; count: number } {
    const source = readFileSync(KERNEL_TYPES_RS, 'utf8');

    // WALK_TYPE_COUNT const.
    const countMatch = source.match(/pub const WALK_TYPE_COUNT:\s*usize\s*=\s*(\d+)\s*;/);
    if (countMatch === null) {
        throw new Error('kernel WALK_TYPE_COUNT not found in types.rs');
    }
    const count = Number(countMatch[1]);

    // const STEPS: [u16; WALK_TYPE_COUNT] = [360, 24, 12, 12, 36, 64, 9, 4, 384];
    const stepsMatch = source.match(
        /const STEPS:\s*\[u16;\s*WALK_TYPE_COUNT\]\s*=\s*\[([^\]]+)\]\s*;/
    );
    if (stepsMatch === null) {
        throw new Error('kernel WalkType STEPS array not found in types.rs');
    }
    const steps = stepsMatch[1]
        .split(',')
        .map(token => token.trim())
        .filter(token => token.length > 0)
        .map(Number);

    // label() match arms: `WalkType::Degree => "degree",` — in enum order.
    const labels = [...source.matchAll(/WalkType::\w+\s*=>\s*"([^"]+)"/g)].map(
        match => match[1]
    );

    return { labels, steps, count };
}

describe('M3_WALK_TYPES kernel mirror', () => {
    const kernel = readKernelWalkTypes();

    it('mirrors the kernel WALK_TYPE_COUNT (9)', () => {
        expect(M3_WALK_TYPE_COUNT).toBe(9);
        expect(kernel.count).toBe(9);
        expect(M3_WALK_TYPES).toHaveLength(kernel.count);
    });

    it('mirrors the kernel STEPS array verbatim, in kernel order', () => {
        expect(kernel.steps).toEqual([360, 24, 12, 12, 36, 64, 9, 4, 384]);
        expect(M3_WALK_TYPES.map(walk => walk.stepCount)).toEqual(kernel.steps);
    });

    it('mirrors the kernel label() arms verbatim, in kernel order', () => {
        expect(kernel.labels).toEqual([
            'degree',
            'amino',
            'zodiac',
            'spanda',
            'decan',
            'hexagram',
            'enneadic',
            'seasonal',
            'line-change'
        ]);
        expect(M3_WALK_TYPES.map(walk => walk.label)).toEqual(kernel.labels);
    });

    it('assigns ids 0..8 in kernel discriminant order', () => {
        expect(M3_WALK_TYPES.map(walk => walk.id)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    });
});

describe('parseCosmicClockWalkSteps (honest Wave-B binding parser)', () => {
    it('returns null when the profile has no cosmicClock (field pending)', () => {
        expect(parseCosmicClockWalkSteps(null)).toBeNull();
        expect(parseCosmicClockWalkSteps(undefined)).toBeNull();
        expect(parseCosmicClockWalkSteps({})).toBeNull();
        expect(parseCosmicClockWalkSteps({ cosmicClock: {} })).toBeNull();
        expect(parseCosmicClockWalkSteps({ cosmicClock: { walks: 'nope' } })).toBeNull();
    });

    it('maps bussed per-lane currentStep by id, leaving unbussed lanes null', () => {
        const steps = parseCosmicClockWalkSteps({
            cosmicClock: {
                walks: [
                    { id: 0, currentStep: 47 },
                    { id: 8, currentStep: 383 }
                ]
            }
        });
        expect(steps).not.toBeNull();
        expect(steps).toHaveLength(9);
        expect(steps?.[0]).toBe(47);
        expect(steps?.[8]).toBe(383);
        expect(steps?.[1]).toBeNull();
    });

    it('never fabricates a step from a malformed entry', () => {
        const steps = parseCosmicClockWalkSteps({
            cosmicClock: {
                walks: [
                    { id: 2, currentStep: -1 },
                    { id: 3, currentStep: 1.5 },
                    { id: 99, currentStep: 4 },
                    { id: 4 },
                    null,
                    'garbage'
                ]
            }
        });
        expect(steps).not.toBeNull();
        expect(steps?.every(step => step === null)).toBe(true);
    });
});
