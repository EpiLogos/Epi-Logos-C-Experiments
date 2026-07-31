import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { StatusStrip } from './StatusStrip';
import { useProvenanceStore, useSessionStore } from '../state/stores';
import { publishProfileTick, resetProfileTicks } from '../composition/profileTickSubscription';
import { STATE_THREAD_COUNT, STATUS_STRIP_THREADS } from '../ui/shellSlotPolicy';

describe('StatusStrip', () => {
    afterEach(() => {
        cleanup();
        resetProfileTicks();
    });

    it('renders the six declared threads and re-renders on store updates', () => {
        render(
            <StatusStrip execute={() => undefined} focusDiagnosticsSubSection={() => undefined} />
        );
        const strip = screen.getByTestId('status-strip');
        expect(strip.children).toHaveLength(STATE_THREAD_COUNT);
        // the rendered entries ARE the declaration, not a parallel list beside it
        for (const thread of STATUS_STRIP_THREADS) {
            expect(screen.getAllByTestId(thread.testId)).toHaveLength(1);
        }
        // pre-tick the entry says so, instead of printing an em-dash where a
        // number that has never existed would go (32.T32.9)
        expect(screen.getByTestId('status-tick').getAttribute('data-tick-state')).toBe('pre-tick');

        act(() => {
            publishProfileTick({
                generation: 42,
                cachedAtMs: 1,
                stale: false,
                stalenessMs: 0,
                privacyClass: 'safe-public-current-kernel-tick',
                profile: {}
            });
            useSessionStore.getState().setSession({ dayNow: '02-07-2026' });
            useProvenanceStore.getState().setSupervisor({ state: 'supervised', port: 18794, pid: 9, detail: 'ok' });
        });

        expect(screen.getByTestId('status-tick').textContent).toContain('tick:1 gen:42');
        expect(screen.getByTestId('status-daynow').textContent).toContain('02-07-2026');
        expect(screen.getByTestId('status-supervisor').textContent).toContain('supervised');
    });
});
