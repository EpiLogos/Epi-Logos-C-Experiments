/**
 * Coordinate: M' M3' (compact renderer wrappers, 24.T24.17)
 * Residency: Body/M/pratibimba-app/src/components
 * Position (#n): Track-08 compact-view acceptance.
 * Actualises: named badge and mini-view wrappers over one immutable M3 surface.
 * Public surface: behavioral tests for M3CodonChip and M3WheelMiniView.
 * Does NOT own: profile production, rendering law, layout routing, or state.
 * Contract: [[M3'-SPEC]] + rerun [[24-m3-mahamaya-frontend-deep]] 24.17.
 */

import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { useEngineStore } from '../engine/modulation/engine';
import { useTickStore } from '../state/stores';
import { PENTADIC_TRACE_FIXTURE } from '../test/pentadicTraceFixture';
import { buildM3WheelSurface } from './M3CosmicWheelRenderService';
import {
    M3CodonChip,
    M3ContextCodonChip,
    M3DailyWheelMiniView,
    M3WheelMiniView
} from './M3CompactViews';

const profilePayload = (codonId: number) => ({
    harmonicProfile: {
        codonRotationProjection: {
            codon: 'CTC',
            codonClass: 'non-dual',
            codonId,
            rotation: 2,
            rotationDegrees: 90,
            rotationalStateCount: 7
        },
        mahamaya: {
            hexagramId: 10,
            tarotMinorId: 22,
            tarotShadowCodon: 7
        },
        tick12: 4,
        degree720: 415,
        anuttaraPentadicTrace: {
            ...PENTADIC_TRACE_FIXTURE,
            codonId,
            mahamayaAddress64: codonId,
            codon: 'CTC',
            qCosmicRef: `q_cosmic://tick/${codonId}`
        }
    }
});

const surface = buildM3WheelSurface({
    payload: profilePayload(38),
    generation: 73
});

beforeEach(() => {
    useTickStore.setState({ profile: null, generation: null });
    useEngineStore.setState({ paused: false, scrubGeneration: null });
});

afterEach(() => {
    cleanup();
    useTickStore.setState({ profile: null, generation: null });
    useEngineStore.setState({ paused: false, scrubGeneration: null });
});

describe('M3 compact renderer wrappers', () => {
    it('preserves the same surface identity in the named Track-08 wrappers', () => {
        const { rerender } = render(<M3CodonChip surface={surface} />);
        expect(screen.getByTestId('m3-codon-chip').getAttribute('data-generation')).toBe('73');
        expect(screen.getByTestId('m3-cosmic-wheel').getAttribute('data-mode')).toBe('badge');
        expect(screen.getByTestId('m3-cosmic-wheel').getAttribute('data-codon-id')).toBe('38');

        rerender(<M3WheelMiniView surface={surface} />);
        expect(screen.getByTestId('m3-wheel-mini-view').getAttribute('data-generation')).toBe('73');
        expect(screen.getByTestId('m3-cosmic-wheel').getAttribute('data-mode')).toBe('mini-view');
        expect(screen.getByTestId('m3-cosmic-wheel').getAttribute('data-codon-id')).toBe('38');
        expect(screen.getByTestId('m3-cosmic-wheel').getAttribute('data-hexagram-id')).toBe('10');
        expect(screen.getByTestId('m3-cosmic-wheel').getAttribute('data-tarot-minor-id')).toBe('22');
    });

    it('holds the received compact surface while choreography is paused and rejoins on resume', () => {
        useTickStore.setState({
            profile: { generation: 73, profile: profilePayload(38) } as never,
            generation: 73
        });
        render(<M3ContextCodonChip />);
        expect(screen.getByTestId('m3-cosmic-wheel').getAttribute('data-codon-id')).toBe('38');

        act(() => useEngineStore.setState({ paused: true }));
        act(() =>
            useTickStore.setState({
                profile: { generation: 74, profile: profilePayload(39) } as never,
                generation: 74
            })
        );
        expect(screen.getByTestId('m3-cosmic-wheel').getAttribute('data-codon-id')).toBe('38');

        act(() => useEngineStore.setState({ paused: false }));
        expect(screen.getByTestId('m3-cosmic-wheel').getAttribute('data-codon-id')).toBe('39');
    });

    it('mounts the pentadic hinge badge from the same held mini-view generation', () => {
        useTickStore.setState({
            profile: { generation: 73, profile: profilePayload(38) } as never,
            generation: 73
        });
        render(<M3DailyWheelMiniView />);

        const badge = screen.getByTestId('m3-pentadic-hinge-badge');
        expect(badge.getAttribute('data-generation')).toBe('73');
        expect(badge.getAttribute('data-trace-state')).toBe('ready');
        expect(badge.textContent).toContain('0/1→5');

        act(() => useEngineStore.setState({ paused: true }));
        act(() =>
            useTickStore.setState({
                profile: { generation: 74, profile: profilePayload(39) } as never,
                generation: 74
            })
        );
        expect(badge.getAttribute('data-generation')).toBe('73');

        act(() => useEngineStore.setState({ paused: false }));
        expect(screen.getByTestId('m3-pentadic-hinge-badge').getAttribute('data-generation')).toBe('74');
    });
});
