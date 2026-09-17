/**
 * Coordinate: M4' personal composition acceptance (25.T25.17 — time-axis switcher)
 * Residency: Body/M/pratibimba-app/src/components
 * Actualises: proves the three-mode switcher renders the persisted mode
 *   (default real-time), persists a click, cycles on cmd-shift-T, emits
 *   composition.time-axis.switch, reads its selection back after a remount, and
 *   never touches the distinct senseOverride field (DR-WC-M4-1).
 * Contract: rerun tranche [[25.T25.17]] (consumes [[29.T29.10]] composition state)
 */

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { compositionEventsFromEntries } from '../composition/compositionEvents';
import {
    CompositionStateProvider,
    parseCompositionState,
    type CompositionStatePort
} from '../composition/compositionState';
import { PERSONAL_COMPOSITION_ID } from '../composition/timeAxis';
import { useEventsStore } from '../state/eventsStore';

import { TimeAxisSwitcher } from './TimeAxisSwitcher';
import { publishProfileTick, resetProfileTicks } from '../composition/profileTickSubscription';

function memoryPort() {
    const store = new Map<string, string>();
    const port: CompositionStatePort = {
        load: async id => store.get(id) ?? null,
        save: async (id, json) => {
            store.set(id, json);
        }
    };
    return { port, store };
}

function pressCmdShiftT() {
    act(() => {
        window.dispatchEvent(
            new KeyboardEvent('keydown', { key: 'T', metaKey: true, shiftKey: true, bubbles: true })
        );
    });
}

function switchEventModes() {
    return compositionEventsFromEntries(useEventsStore.getState().events)
        .filter(event => event.type === 'composition.time-axis.switch')
        .map(event => (event.payload as { mode?: string }).mode);
}

describe('25.T25.17 TimeAxisSwitcher', () => {
    beforeEach(() => {
        useEventsStore.getState().clear();
        resetProfileTicks();
        publishProfileTick({ generation: 51, cachedAtMs: 51, stale: false, stalenessMs: 0, privacyClass: 'public-current-context', profile: { generation: 51 } } as never);
    });

    afterEach(() => {
        cleanup();
    });

    it('renders the three modes with real-time as the default', () => {
        const { port } = memoryPort();
        render(
            <CompositionStateProvider port={port}>
                <TimeAxisSwitcher />
            </CompositionStateProvider>
        );
        expect(screen.getByTestId('time-axis-switcher').dataset.mode).toBe('real-time');
        expect(screen.getByTestId('time-axis-mode-real-time').dataset.active).toBe('true');
        expect(screen.getByTestId('time-axis-mode-natal').dataset.active).toBe('false');
        expect(screen.getByTestId('time-axis-mode-kairotic').dataset.active).toBe('false');
    });

    it('persists a clicked mode onto the personal composition without touching senseOverride', async () => {
        const { port, store } = memoryPort();
        render(
            <CompositionStateProvider port={port}>
                <TimeAxisSwitcher />
            </CompositionStateProvider>
        );

        fireEvent.click(screen.getByTestId('time-axis-mode-natal'));

        await waitFor(() => expect(screen.getByTestId('time-axis-switcher').dataset.mode).toBe('natal'));
        const persisted = parseCompositionState(JSON.parse(store.get(PERSONAL_COMPOSITION_ID)!));
        expect(persisted.timeAxisMode).toBe('natal');
        expect(persisted.senseOverride).toBeNull();
        expect(persisted.compositionId).toBe(PERSONAL_COMPOSITION_ID);
        expect(switchEventModes()).toContain('natal');
    });

    it('cycles natal → real-time → kairotic → natal on cmd-shift-T', async () => {
        const { port } = memoryPort();
        render(
            <CompositionStateProvider port={port}>
                <TimeAxisSwitcher />
            </CompositionStateProvider>
        );
        // default real-time → kairotic → natal → real-time
        pressCmdShiftT();
        await waitFor(() => expect(screen.getByTestId('time-axis-switcher').dataset.mode).toBe('kairotic'));
        pressCmdShiftT();
        await waitFor(() => expect(screen.getByTestId('time-axis-switcher').dataset.mode).toBe('natal'));
        pressCmdShiftT();
        await waitFor(() => expect(screen.getByTestId('time-axis-switcher').dataset.mode).toBe('real-time'));
        expect(switchEventModes()).toEqual(['kairotic', 'natal', 'real-time']);
    });

    it('reads the persisted mode back after a remount (survives layout switch / restart)', async () => {
        const { port, store } = memoryPort();
        const first = render(
            <CompositionStateProvider port={port}>
                <TimeAxisSwitcher />
            </CompositionStateProvider>
        );
        fireEvent.click(screen.getByTestId('time-axis-mode-kairotic'));
        await waitFor(() =>
            expect(parseCompositionState(JSON.parse(store.get(PERSONAL_COMPOSITION_ID)!)).timeAxisMode).toBe(
                'kairotic'
            )
        );
        first.unmount();

        // a fresh provider starts with empty in-memory state; the switcher's
        // load-on-mount rehydrates the persisted mode from the same port.
        render(
            <CompositionStateProvider port={port}>
                <TimeAxisSwitcher />
            </CompositionStateProvider>
        );
        await waitFor(() => expect(screen.getByTestId('time-axis-switcher').dataset.mode).toBe('kairotic'));
    });
});
