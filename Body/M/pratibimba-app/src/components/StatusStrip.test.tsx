import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { StatusStrip } from './StatusStrip';
import { useProvenanceStore, useSessionStore, useTickStore } from '../state/stores';

describe('StatusStrip', () => {
    afterEach(cleanup);

    it('renders the six entries and re-renders on store updates', () => {
        render(<StatusStrip />);
        const strip = screen.getByTestId('status-strip');
        expect(strip.children).toHaveLength(6);
        expect(screen.getByTestId('status-tick').textContent).toContain('—');

        act(() => {
            useTickStore.getState().setProfile({
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

        expect(screen.getByTestId('status-tick').textContent).toContain('42');
        expect(screen.getByTestId('status-daynow').textContent).toContain('02-07-2026');
        expect(screen.getByTestId('status-supervisor').textContent).toContain('supervised');
    });
});
