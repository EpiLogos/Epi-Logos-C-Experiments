import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import type { KernelBridgeCachedProfile } from '../bridge/types';
import { useTickStore } from '../state/stores';
import {
    M3ProfileTickProvider,
    M3ReadinessBoundary,
    M3ReadinessProvider,
    useM3ProfileTick
} from './m3SurfaceContext';

function profile(generation: number, tick12: number): KernelBridgeCachedProfile {
    return {
        generation,
        cachedAtMs: 0,
        stale: false,
        stalenessMs: 0,
        privacyClass: 'public-current-context',
        profile: { tick12, degree720: tick12 * 30 }
    } as KernelBridgeCachedProfile;
}

function Probe() {
    const tick = useM3ProfileTick();
    return (
        <M3ReadinessBoundary bindingKey="m3.probe">
            <span data-testid="m3-context-tick">
                {tick.generation ?? 'none'}:{tick.tick12 ?? 'none'}:{tick.degree720 ?? 'none'}
            </span>
        </M3ReadinessBoundary>
    );
}

afterEach(() => {
    cleanup();
    useTickStore.setState({ profile: null, generation: null });
});

describe('M3 profile-tick and readiness contexts', () => {
    it('re-renders from the shared profile tick and carries inline readiness without a local clock', () => {
        render(
            <M3ProfileTickProvider>
                <M3ReadinessProvider
                    bindings={{
                        'm3.probe': { state: 'ready', reason: 'profile-current' }
                    }}
                >
                    <Probe />
                </M3ReadinessProvider>
            </M3ProfileTickProvider>
        );

        expect(screen.getByTestId('m3-context-tick').textContent).toBe('none:none:none');
        expect(screen.getByTestId('m3-readiness-boundary').dataset.readiness).toBe('ready');

        act(() => useTickStore.getState().setProfile(profile(7, 3)));

        expect(screen.getByTestId('m3-context-tick').textContent).toBe('7:3:90');
        expect(screen.getByTestId('m3-readiness-boundary').dataset.generation).toBe('7');
    });

    it('renders pending and blocked state at the binding instead of an error panel', () => {
        const { rerender } = render(
            <M3ProfileTickProvider>
                <M3ReadinessProvider
                    bindings={{
                        'm3.probe': { state: 'pending', reason: 'awaiting-profile' }
                    }}
                >
                    <Probe />
                </M3ReadinessProvider>
            </M3ProfileTickProvider>
        );

        expect(screen.getByTestId('m3-readiness-boundary').dataset.readiness).toBe('pending');
        // 30.T30.6: the indicator became a chip, so the live reason rides its
        // text equivalents (and now carries the owning track alongside).
        expect(screen.getByTestId('readiness-indicator').getAttribute('title')).toContain(
            'awaiting-profile'
        );
        expect(screen.getByTestId('readiness-indicator').getAttribute('aria-label')).toContain(
            'awaiting-profile'
        );

        rerender(
            <M3ProfileTickProvider>
                <M3ReadinessProvider
                    bindings={{
                        'm3.probe': { state: 'blocked', reason: 'gateway-disconnected' }
                    }}
                >
                    <Probe />
                </M3ReadinessProvider>
            </M3ProfileTickProvider>
        );

        expect(screen.getByTestId('m3-readiness-boundary').dataset.readiness).toBe('blocked');
        expect(screen.getByTestId('m3-readiness-boundary').title).toBe('gateway-disconnected');
        expect(screen.getByTestId('blocked-overlay').textContent).toContain('gateway-disconnected');
    });
});
