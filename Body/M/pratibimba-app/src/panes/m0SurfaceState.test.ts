import { describe, expect, it } from 'vitest';
import {
    DEFAULT_M0_SURFACE_STATE,
    deserializeM0SurfaceState,
    serializeM0SurfaceState
} from './m0SurfaceState';

describe('m0SurfaceState', () => {
    it('round-trips the M0 layer, phase, and authoring mode needed across layout remounts', () => {
        const state = {
            activeLayer: 'rel' as const,
            implicateExplicate: 'explicate' as const,
            mode: 'authoring' as const
        };

        expect(deserializeM0SurfaceState(serializeM0SurfaceState(state))).toEqual(state);
    });

    it('falls back field-by-field to the safe reading surface when persisted data is absent or invalid', () => {
        expect(deserializeM0SurfaceState(null)).toEqual(DEFAULT_M0_SURFACE_STATE);
        expect(
            deserializeM0SurfaceState({
                activeLayer: 'not-a-layer',
                implicateExplicate: 'explicate',
                mode: 'not-a-mode'
            })
        ).toEqual({ ...DEFAULT_M0_SURFACE_STATE, implicateExplicate: 'explicate' });
    });
});
