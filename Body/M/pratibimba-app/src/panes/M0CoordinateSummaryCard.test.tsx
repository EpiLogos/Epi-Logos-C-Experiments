/**
 * Coordinate: M' M0' (coordinate-summary consumption-mirror — 28.T28.18)
 * Actualises: the 28.18 consume-not-own law on the daily-0-1 second surface —
 *   M0CoordinateSummaryCard renders the shared coordinate + profile-generation
 *   fields FROM the single shared projection (coordinate + tick stores) and
 *   re-renders to mirror the store as it advances. It keeps no own copy; the
 *   rendered readouts always equal the store source (atop the 15.10 status-bar
 *   build). NO widget / StatusBarContribution is constructed here.
 */

import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { useCoordinateStore, useTickStore } from '../state/stores';
import { M0CoordinateSummaryCard } from './M0CoordinateSummaryCard';

function cachedProfile(generation: number) {
    return {
        generation,
        cachedAtMs: generation * 1000,
        stale: false,
        stalenessMs: 0,
        privacyClass: 'public',
        profile: { harmonicProfile: { tick12: 0, degree720: 0 } }
    };
}

function generationText(card: HTMLElement): string | null | undefined {
    return card.querySelector('.m0-coordinate-summary-card-generation')?.textContent;
}

function coordinateText(card: HTMLElement): string | null | undefined {
    return card.querySelector('.m0-coordinate-summary-card-coordinate')?.textContent;
}

afterEach(() => {
    cleanup();
    useCoordinateStore.setState({ selected: null });
    useTickStore.setState({ profile: null, generation: null });
});

describe('M0CoordinateSummaryCard consumes the shared projection (28.T28.18)', () => {
    it('mirrors the coordinate + generation from the single shared store, not own-state', () => {
        act(() => {
            useCoordinateStore.getState().setSelected('M3-1');
            useTickStore.getState().setProfile(cachedProfile(7));
        });
        render(<M0CoordinateSummaryCard onOpenFullView={() => {}} />);

        const card = screen.getByTestId('m0-coordinate-summary-card');
        // Rendered readouts MIRROR the store source (the 15.10 single projection).
        expect(card.getAttribute('data-coordinate')).toBe('M3-1');
        expect(coordinateText(card)).toBe('M3-1');
        expect(generationText(card)).toBe('generation 7');
        // The store is the source of truth — the card holds no divergent copy.
        expect(card.getAttribute('data-coordinate')).toBe(useCoordinateStore.getState().selected);
    });

    it('re-renders to the advanced projection (mirror-not-own on store change)', () => {
        render(<M0CoordinateSummaryCard onOpenFullView={() => {}} />);
        const card = screen.getByTestId('m0-coordinate-summary-card');

        // Before any projection: honest pending, never a fabricated value.
        expect(generationText(card)).toBe('generation pending');
        expect(card.getAttribute('data-coordinate')).toBe('');

        act(() => {
            useCoordinateStore.getState().setSelected('M4-4');
            useTickStore.getState().setProfile(cachedProfile(12));
        });
        expect(card.getAttribute('data-coordinate')).toBe('M4-4');
        expect(coordinateText(card)).toBe('M4-4');
        expect(generationText(card)).toBe('generation 12');

        // A further advance is mirrored again — the card tracks the projection,
        // it does not latch a stale own-copy.
        act(() => {
            useCoordinateStore.getState().setSelected('M5-3');
            useTickStore.getState().setProfile(cachedProfile(20));
        });
        expect(card.getAttribute('data-coordinate')).toBe('M5-3');
        expect(generationText(card)).toBe('generation 20');
    });
});
