/**
 * Coordinate: M' M2' (cymatic transport behavioral tests)
 * Residency: Body/M/pratibimba-app/src/components
 * Position (#n): M2' transport verification.
 * Actualises: real received-frame pause/hold and cache-gated historical scrub
 *   behavior without stopping the live profile source.
 * Public surface: Vitest suite for CymaticTransport.
 * Does NOT own: gateway retention, kernel tick production, or audio output.
 * Contract: [[M2'-SPEC]].
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { KernelBridgeCachedProfile } from '../bridge/types';
import {
    buildCymaticTickSnapshot,
    CymaticTransport,
    resolveCymaticTransportViewModel
} from './CymaticTransport';

function profile(generation: number, kleinFlip: unknown = null): KernelBridgeCachedProfile {
    return {
        generation,
        cachedAtMs: generation * 1000,
        stale: false,
        stalenessMs: 0,
        privacyClass: 'public-current-context',
        profile: { harmonicProfile: { kleinFlip } }
    };
}

describe('CymaticTransport', () => {
    it('holds the captured profile generation while the caller advances the live profile', () => {
        const first = profile(41);
        const second = profile(42);
        const view = render(
            <CymaticTransport liveProfile={first}>
                {(snapshot, held) => (
                    <output data-testid="held-frame" data-held={held}>
                        {snapshot.profile.generation}
                    </output>
                )}
            </CymaticTransport>
        );

        expect(screen.getByTestId('held-frame').textContent).toBe('41');
        expect(screen.getByTestId('held-frame').getAttribute('data-held')).toBe('false');
        expect((screen.getByLabelText('Scrub cymatic surface to tick') as HTMLInputElement).disabled).toBe(true);
        expect(screen.getByTestId('cymatic-transport').getAttribute('data-cache-state')).toBe(
            'pending-tick-snapshot-cache'
        );

        fireEvent.click(screen.getByRole('button', { name: 'Pause' }));
        view.rerender(
            <CymaticTransport liveProfile={second}>
                {(snapshot, held) => (
                    <output data-testid="held-frame" data-held={held}>
                        {snapshot.profile.generation}
                    </output>
                )}
            </CymaticTransport>
        );

        expect(screen.getByTestId('cymatic-paused-tick').textContent).toContain('41');
        expect(screen.getByTestId('held-frame').textContent).toBe('41');
        expect(screen.getByTestId('held-frame').getAttribute('data-held')).toBe('true');
        fireEvent.click(screen.getByRole('button', { name: 'Resume' }));
        expect(screen.getByTestId('held-frame').textContent).toBe('42');
        expect(screen.getByTestId('held-frame').getAttribute('data-held')).toBe('false');
    });

    it('uses only supplied profile snapshots for scrub and Klein-flip markers', () => {
        const first = buildCymaticTickSnapshot(profile(7));
        const flipped = buildCymaticTickSnapshot(profile(8, { flipAtThisTick: true }));
        const model = resolveCymaticTransportViewModel({
            liveSnapshot: buildCymaticTickSnapshot(profile(9), 'live-profile'),
            tickSnapshots: [flipped, first],
            paused: true,
            pausedSnapshot: first,
            scrubTick: 8
        });

        expect(model.cacheState).toBe('ready');
        expect(model.activeSnapshot?.tick).toBe(8);
        expect(model.kleinFlipTicks).toEqual([8]);
        expect(model.scrubberDisabled).toBe(false);
    });

    it('captures the nested profile payload by value', () => {
        const received = profile(41);
        const snapshot = buildCymaticTickSnapshot(received, 'live-profile');
        const harmonicProfile = (
            received.profile as { harmonicProfile: { kleinFlip: unknown } }
        ).harmonicProfile;

        harmonicProfile.kleinFlip = { flipAtThisTick: true };

        expect(
            (
                snapshot.profile.profile as {
                    harmonicProfile: { kleinFlip: unknown };
                }
            ).harmonicProfile.kleinFlip
        ).toBeNull();
    });
});
