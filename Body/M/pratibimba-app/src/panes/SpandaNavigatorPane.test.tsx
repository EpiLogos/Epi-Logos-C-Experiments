/**
 * 22.T22.1 — navigator face shape tests (jsdom). The REAL proof is the
 * Playwright spec (tests/e2e/spanda-navigator.spec.ts) driving the live
 * gateway; these pin the honest-absence rule and the render contract.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { SpandaNavigatorPane } from './SpandaNavigatorPane';
import { useProvenanceStore, useTickStore } from '../state/stores';

function primeStores(spanda: Record<string, unknown> | null) {
    useProvenanceStore.setState({
        connection: { ...useProvenanceStore.getState().connection, connected: true }
    });
    useTickStore.setState({
        generation: 7,
        profile: {
            generation: 7,
            cachedAtMs: 1,
            stale: false,
            stalenessMs: 0,
            privacyClass: 'safe-public-current-kernel-tick',
            profile: spanda ? { generation: 7, spanda } : { generation: 7 }
        }
    });
}

const FLOWING = {
    epochMs: 0,
    phase0: 0,
    rateHz: 2.5,
    mode: 'flowing',
    direction: 'forward',
    tick12: 5
};

describe('SpandaNavigatorPane', () => {
    beforeEach(() => cleanup());

    it('renders honest absence when the anchor is not on the bus', () => {
        primeStores(null);
        render(<SpandaNavigatorPane />);
        expect(screen.getByTestId('spanda-transport-pending')).toBeTruthy();
        expect(screen.queryByTestId('spanda-hold')).toBeNull();
    });

    it('renders twelve stops with the readout tick active', () => {
        primeStores(FLOWING);
        render(<SpandaNavigatorPane />);
        const stops = screen.getByTestId('spanda-stops').querySelectorAll('button');
        expect(stops.length).toBe(12);
        expect(screen.getByTestId('spanda-stop-5').getAttribute('data-active')).toBe('true');
        expect(screen.getByTestId('spanda-stop-4').getAttribute('data-active')).toBe('false');
    });

    it('previews the Klein flip at tick 5 and the Möbius return at tick 11', () => {
        primeStores(FLOWING);
        render(<SpandaNavigatorPane />);
        expect(screen.getByTestId('spanda-next-event').textContent).toContain('Klein flip 5→6');
        cleanup();
        primeStores({ ...FLOWING, tick12: 11 });
        render(<SpandaNavigatorPane />);
        expect(screen.getByTestId('spanda-next-event').textContent).toContain('Möbius return 11→0');
    });

    it('offers hold while flowing and the two involutions named apart', () => {
        primeStores(FLOWING);
        render(<SpandaNavigatorPane />);
        expect(screen.getByTestId('spanda-hold')).toBeTruthy();
        expect(screen.queryByTestId('spanda-release')).toBeNull();
        expect(screen.getByTestId('spanda-reflect').title).toContain('11−n');
        expect(screen.getByTestId('spanda-half-turn').title).toContain('n+6');
    });

    it('offers release while held', () => {
        primeStores({ ...FLOWING, mode: 'held' });
        render(<SpandaNavigatorPane />);
        expect(screen.getByTestId('spanda-release')).toBeTruthy();
        expect(screen.queryByTestId('spanda-hold')).toBeNull();
    });
});
