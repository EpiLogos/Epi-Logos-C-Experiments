/**
 * Coordinate: M' shell (Wave-C design-system manifest verification -- Track 20.T20.2)
 * Residency: Body/M/pratibimba-app/src/ui
 * Actualises: executable validation that the carrier's Track-D source names
 *   every Wave-C widget invariant and preserves its implementation route.
 * Public surface: none (test-only).
 * Does NOT own: Wave-C policy or production UI behavior.
 */

import { describe, expect, it } from 'vitest';
import {
    WAVE_C_DESIGN_INVARIANT_IDS,
    WAVE_C_DESIGN_SYSTEM_MANIFEST,
    validateWaveCDesignSystemManifest,
    waveCDesignInvariantFor
} from './waveCDesignSystem';

describe('Wave-C design-system manifest (20.T20.2)', () => {
    it('names each widget-layer invariant exactly once', () => {
        expect(WAVE_C_DESIGN_INVARIANT_IDS).toEqual([
            'coordinate-primary-navigation',
            'profile-tick-primary-ui-clock',
            'provenance-always-visible',
            'composition-over-juxtaposition',
            'no-modal-discipline',
            'activity-bar-discipline',
            'privacy-class-flow-through',
            'tokens-consumed-not-forked',
            'chrome-contributions-catalogued',
            'slerp-lemniscate-only-motion'
        ]);
        expect(new Set(WAVE_C_DESIGN_INVARIANT_IDS).size).toBe(10);
    });

    it('accepts the carrier manifest and rejects a missing enforcement route', () => {
        expect(validateWaveCDesignSystemManifest(WAVE_C_DESIGN_SYSTEM_MANIFEST)).toEqual([]);

        const first = WAVE_C_DESIGN_SYSTEM_MANIFEST[0];
        const malformed = [
            { ...first, enforcingTracks: [], enforcementIds: [], source: { path: '', line: 0 } },
            ...WAVE_C_DESIGN_SYSTEM_MANIFEST.slice(1)
        ];

        expect(validateWaveCDesignSystemManifest(malformed)).toEqual([
            'missing enforcing track: coordinate-primary-navigation',
            'missing enforcement id: coordinate-primary-navigation',
            'invalid source citation: coordinate-primary-navigation'
        ]);
    });

    it('resolves the actual track and lint routes future carrier work must consume', () => {
        expect(waveCDesignInvariantFor('profile-tick-primary-ui-clock')).toMatchObject({
            enforcingTracks: ['15', '27', '28'],
            enforcementIds: ['27.0', '28.17']
        });
        expect(waveCDesignInvariantFor('tokens-consumed-not-forked')).toMatchObject({
            enforcingTracks: ['30'],
            enforcementIds: ['30.11']
        });
        expect(waveCDesignInvariantFor('slerp-lemniscate-only-motion')).toMatchObject({
            enforcementIds: ['15.9', '15.5']
        });
    });
});
