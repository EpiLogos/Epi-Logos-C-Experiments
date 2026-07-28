/**
 * Coordinate: M' M4' (Mercurius signal-relay chip tests — 25.T25.16)
 * Actualises: the live chip as behaviour — FR-3 disabled stub, honest-pending
 *   before a signal, going live + counting a delta + pulsing on a genuine
 *   planet-degree change (and NOT on an unchanged tick), all driven by the
 *   profile-tick spine (no mercurius.kairos.delta wire event).
 */

import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { M4MercuriusRelayChip } from './M4MercuriusRelayPane';
import { publishProfileTick, resetProfileTicks } from '../composition/profileTickSubscription';

function cachedProfile(
    generation: number,
    planetDegrees: number[] | undefined,
    cachedAtMs?: number
) {
    return {
        generation,
        cachedAtMs: cachedAtMs ?? generation * 1000,
        stale: false,
        stalenessMs: 0,
        privacyClass: 'public',
        profile: {
            harmonicProfile: planetDegrees === undefined ? {} : { planetDegrees }
        }
    };
}

const degs = (base: number): number[] => Array.from({ length: 10 }, (_, i) => (base + i * 3) % 360);

afterEach(() => {
    cleanup();
    resetProfileTicks();
});

describe('M4MercuriusRelayChip', () => {
    it('renders the FR-3 grey stub when kairos is disabled', () => {
        render(<M4MercuriusRelayChip kairosEnabled={false} />);
        const chip = screen.getByTestId('m4-mercurius-relay');
        expect(chip.getAttribute('data-state')).toBe('disabled');
        expect(chip.getAttribute('data-view-id')).toBe('m4.nara.mercuriusRelay');
        expect(chip.textContent).toMatch(/Kairos disabled/i);
    });

    it('is honest-pending when enabled but no signal has arrived', () => {
        render(<M4MercuriusRelayChip kairosEnabled />);
        const chip = screen.getByTestId('m4-mercurius-relay');
        expect(chip.getAttribute('data-state')).toBe('pending');
        expect(chip.getAttribute('data-delta-count')).toBe('0');
    });

    it('goes live, counts a delta, pulses and shows the cache-stamped refresh', () => {
        render(<M4MercuriusRelayChip kairosEnabled />);
        act(() => {
            publishProfileTick(cachedProfile(1, degs(0), 1_700_000_000_000));
        });
        const chip = screen.getByTestId('m4-mercurius-relay');
        expect(chip.getAttribute('data-state')).toBe('live');
        expect(chip.getAttribute('data-delta-count')).toBe('1');
        expect(chip.getAttribute('data-pulse-seq')).toBe('1');
        expect(chip.getAttribute('data-planet-count')).toBe('10');
        expect(chip.textContent).toContain(new Date(1_700_000_000_000).toISOString());
    });

    it('counts a second delta only when the vector genuinely changes', () => {
        render(<M4MercuriusRelayChip kairosEnabled />);
        act(() => {
            publishProfileTick(cachedProfile(1, degs(0)));
        });
        act(() => {
            publishProfileTick(cachedProfile(2, degs(0)));
        });
        expect(screen.getByTestId('m4-mercurius-relay').getAttribute('data-delta-count')).toBe('1');

        act(() => {
            publishProfileTick(cachedProfile(3, degs(30)));
        });
        const chip = screen.getByTestId('m4-mercurius-relay');
        expect(chip.getAttribute('data-delta-count')).toBe('2');
        expect(chip.getAttribute('data-pulse-seq')).toBe('2');
    });
});
