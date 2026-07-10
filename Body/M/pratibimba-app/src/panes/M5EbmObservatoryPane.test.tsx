/**
 * Coordinate: M' M5' (EBM observatory pane tests — Track 26.T26.1)
 * Actualises: the spec's render verification — 72 cells + 3 tritone
 *   overlays when a checkpoint is present; narrative-only (grid, energy,
 *   gradient suppressed) when absent; the identity narrative always frames
 *   the observatory against the M4' voice.
 */

import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { useTickStore } from '../state/stores';
import { M5EbmObservatoryPane } from './M5EbmObservatoryPane';

function setProfile(profile: Record<string, unknown>, generation: number) {
    act(() => {
        useTickStore.getState().setProfile({
            generation,
            cachedAtMs: generation * 1000,
            stale: false,
            stalenessMs: 0,
            privacyClass: 'public',
            profile: { harmonicProfile: profile }
        });
    });
}

afterEach(() => {
    cleanup();
    useTickStore.setState({ profile: null, generation: null });
});

describe('M5EbmObservatoryPane', () => {
    it('renders narrative-only with the pending banner when no checkpoint is bussed', () => {
        render(<M5EbmObservatoryPane />);
        expect(screen.getByTestId('m5-ebm-narrative').textContent).toContain(
            'M5′ does not talk. It scores.'
        );
        expect(screen.getByTestId('m5-ebm-pending').textContent).toContain(
            'no checkpoint loaded — bootstrap Phase 1'
        );
        expect(screen.queryByTestId('m5-ebm-resonance-grid')).toBeNull();
        expect(screen.queryByTestId('m5-ebm-energy')).toBeNull();
        expect(screen.queryByTestId('m5-ebm-gradient')).toBeNull();
    });

    it('renders 72 cells + 3 tritone overlays + readouts when the checkpoint is present', () => {
        render(<M5EbmObservatoryPane />);
        setProfile(
            {
                mathemeResonance72Projection: {
                    learnedPredictorCheckpointRef: 'ebm-checkpoint://v0.3',
                    predicted72: Array.from({ length: 72 }, (_, i) => i / 72),
                    target72: Array.from({ length: 72 }, (_, i) => (i + 1) / 72),
                    gradient: [0.5, -0.25, 0.125, -0.0625],
                    tritoneCoherence: [0.9, 0.5, 0.1]
                }
            },
            11
        );

        expect(screen.getByTestId('m5-ebm-observatory').getAttribute('data-state')).toBe('ready');
        expect(screen.getByTestId('m5-ebm-checkpoint-badge').textContent).toContain(
            'ebm-checkpoint://v0.3'
        );
        for (let lens = 0; lens < 12; lens++) {
            for (let position = 0; position < 6; position++) {
                expect(screen.getByTestId(`m5-ebm-cell-${lens}-${position}`)).toBeTruthy();
            }
        }
        for (const square of ['A', 'B', 'C']) {
            expect(screen.getByTestId(`m5-ebm-tritone-${square}`)).toBeTruthy();
        }
        expect(screen.getByTestId('m5-ebm-energy').textContent).toContain('E = ');
        expect(screen.getByTestId('m5-ebm-gradient').textContent).toContain('0.5000');
        expect(screen.getByTestId('m5-ebm-mobius-step').textContent).not.toContain('pending');
        expect(screen.getByTestId('m5-ebm-coherence').textContent).toContain('A:(0,5) 0.900');
        expect(screen.queryByTestId('m5-ebm-pending')).toBeNull();
    });
});
