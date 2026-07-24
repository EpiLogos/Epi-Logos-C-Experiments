/**
 * Coordinate: M' shell-0 acceptance (30.T30.3 — motion tokens)
 * Residency: Body/M/pratibimba-app/src/ui
 * Actualises: pins the consolidated motion grammar — DR-UI-4 transition timings
 *   (single-sourced from primitives.tsx) + the precise clock/slerp/flow/klein/
 *   flow-watcher values, and proves the tier is not a second copy of the configs.
 * Contract: rerun tranche [[30.T30.3]] (DR-UI-4)
 */

import { describe, expect, it } from 'vitest';
import { TRANSITIONS as PRIMITIVE_TRANSITIONS } from './primitives';
import {
    FLOW_STREAMLINE,
    FLOW_WATCHER_DEBOUNCE_MS,
    KLEIN_FLIP,
    PROFILE_TICK_EASING,
    SLERP,
    TRANSITIONS
} from './motionTokens';

describe('30.T30.3 motion tokens — DR-UI-4 transition tier (single source)', () => {
    it('re-exports the DR-UI-4 configs verbatim: 400 cubic-out / 240 linear / 320 smoothstep', () => {
        expect(TRANSITIONS.lemniscate01).toEqual({ ms: 400, easing: 'cubic-out' });
        expect(TRANSITIONS.kleinFlip).toEqual({ ms: 240, easing: 'linear' });
        expect(TRANSITIONS.mobiusReturn).toEqual({ ms: 320, easing: 'smoothstep' });
    });

    it('is the SAME object as primitives.TRANSITIONS — no divergent second copy', () => {
        expect(TRANSITIONS).toBe(PRIMITIVE_TRANSITIONS);
    });
});

describe('30.T30.3 motion tokens — clock + choreography tier', () => {
    it('the profile-tick clock is linear (the tick is the clock; no meaning-bearing easing)', () => {
        expect(PROFILE_TICK_EASING).toBe('linear');
    });

    it('SLERP angular step is 360°/12 and the Klein boundary is tick 5', () => {
        expect(SLERP.angularStepDeg).toBe(30);
        expect(SLERP.angularStepDeg * 12).toBe(360);
        expect(SLERP.kleinBoundaryTick).toBe(5);
    });

    it('names the precise flow / klein-flip / flow-watcher values', () => {
        expect(FLOW_STREAMLINE).toEqual({ ms: 200, easing: 'ease-out' });
        expect(KLEIN_FLIP).toEqual({ flagMs: 300, crossfadeMs: 500 });
        expect(FLOW_WATCHER_DEBOUNCE_MS).toBe(2000);
    });
});
