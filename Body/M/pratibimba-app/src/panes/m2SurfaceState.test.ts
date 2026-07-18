import { describe, expect, it } from 'vitest';
import {
    DEFAULT_M2_SURFACE_STATE,
    deserializeM2SurfaceState,
    serializeM2SurfaceState
} from './m2SurfaceState';

describe('m2SurfaceState', () => {
    it('round-trips the complete M2 interaction record through the App persistence boundary', () => {
        const state = {
            activeFace: 'axes' as const,
            layerAActiveCell: { lens: 7, position: 4 },
            layerBCardScroll: 240,
            layerCSurfaceVariant: 'torus' as const,
            layerCZoom: 1.6,
            lastRoutingTrace: 'f-routing://profile/72/17',
            correspondenceTreeAxisFilter: 'decan' as const,
            correspondenceTreeSonicOverlay: 'asma' as const,
            planetaryViewMode: 'psychoid' as const,
            epogdoonProofMode: true
        };

        expect(deserializeM2SurfaceState(serializeM2SurfaceState(state))).toEqual(state);
    });

    it('falls back field-by-field instead of accepting malformed persisted controls', () => {
        expect(deserializeM2SurfaceState(null)).toEqual(DEFAULT_M2_SURFACE_STATE);
        expect(
            deserializeM2SurfaceState({
                activeFace: 'not-a-face',
                layerAActiveCell: { lens: 2, position: 'bad' },
                layerBCardScroll: -1,
                layerCSurfaceVariant: 'webgl',
                layerCZoom: 0,
                lastRoutingTrace: '',
                correspondenceTreeAxisFilter: 'not-an-axis',
                correspondenceTreeSonicOverlay: 'not-an-overlay',
                planetaryViewMode: 'not-a-view',
                epogdoonProofMode: 'true'
            })
        ).toEqual(DEFAULT_M2_SURFACE_STATE);
    });
});
