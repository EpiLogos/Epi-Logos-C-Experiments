/**
 * Coordinate: M' `/` membrane (profile-tick per-widget re-render contract — Track 28.T28.17)
 * Residency: Body/M/pratibimba-app/src/panes
 * Actualises: T28.17's own deliverable — the retargeted "profile-tick re-render
 *   contract per widget" (28.17; folds 15.6 principle 2). The FROZEN epi-theia
 *   spec named a `ProfileTickContext.Provider` on `IdeShellBridgeGate` that
 *   re-rendered every ide-shell widget on `onProfile` advance. That plumbing is
 *   dead; the carrier realises the SAME contract as the one `useTickStore` clock
 *   (generation-gated, no rewind) fed to the one `useProfileTick` seam consumed by
 *   every profile-bearing surface family. This test proves the contract ACROSS
 *   four distinct real carrier surfaces (base status/ACR seam, M3 surface context,
 *   shared bridge-readiness, an OmniPanel pending pane):
 *     1. every surface re-renders on a single tick advance with otherwise-stable
 *        input (re-render on tick, not user input — 15.6);
 *     2. no surface rewinds on a stale generation (one clock, no rewind);
 *     3. mounting + ticking the surfaces installs NO competing render timer
 *        (setInterval / requestAnimationFrame) — the profile clock is the store
 *        subscription, never a widget-local loop.
 * Does NOT own: the clock law (state/stores), the hook (state/useProfileTick), the
 *   surface contexts (panes/m3SurfaceContext, ui/useBridgeReadiness), or any fold
 *   body. This is the per-widget replay proof the frozen 28.17 Verify line demanded,
 *   retargeted to the carrier surfaces.
 * Contract: [[28-ide-shell-chrome-deep]] tranche 28.17
 */

import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { KernelBridgeCachedProfile } from '../bridge/types';
import { useTickStore } from '../state/stores';
import { useReadinessStore } from '../state/readinessStore';
import { useProfileTick } from '../state/useProfileTick';
import { useBridgeReadiness } from '../ui/useBridgeReadiness';
import { M3ProfileTickProvider, useM3ProfileTick } from './m3SurfaceContext';
import { OmniPendingPane } from './omni/OmniPendingPane';

/** The one clock's payload — mirrors the shape the bridge busses. */
function cachedProfile(generation: number, tick12: number): KernelBridgeCachedProfile {
    return {
        generation,
        cachedAtMs: generation * 1000,
        stale: false,
        stalenessMs: 0,
        privacyClass: 'public-current-context',
        profile: { tick12, degree720: tick12 * 30 }
    } as KernelBridgeCachedProfile;
}

/** Per-surface render tallies — proving a re-render happened even when a
 *  surface's own rendered value is stable across the tick. */
const renders = { status: 0, m3: 0, readiness: 0 };

/** Surface 1 — the base status/ACR seam every shared status field consumes. */
function StatusSeamWidget() {
    const tick = useProfileTick();
    renders.status += 1;
    return (
        <span
            data-testid="w-status"
            data-generation={tick.generation ?? 'none'}
            data-tick12={tick.tick12 ?? 'none'}
        />
    );
}

/** Surface 2 — the M3' surface context (its own provider + hook). */
function M3SurfaceWidget() {
    const tick = useM3ProfileTick();
    renders.m3 += 1;
    return <span data-testid="w-m3" data-generation={tick.generation ?? 'none'} />;
}

/** Surface 3 — a shared bridge-readiness binding. Its readiness VALUE
 *  (`readinessId`) is held stable (seeded `ready_public_current`); it must still
 *  re-render on tick — and its `lastTickObserved` advance — proving the clock,
 *  not a datum change, drives the render. */
function ReadinessWidget() {
    const binding = useBridgeReadiness('s2.graph.node');
    renders.readiness += 1;
    return (
        <span
            data-testid="w-readiness"
            data-readiness={binding.readinessId}
            data-observed={binding.lastTickObserved}
        />
    );
}

/** All four widgets under the ONE tick store (M3 inside its provider). */
function Shell() {
    return (
        <div>
            <StatusSeamWidget />
            <M3ProfileTickProvider>
                <M3SurfaceWidget />
            </M3ProfileTickProvider>
            <ReadinessWidget />
            <OmniPendingPane componentKey="unknown-fold-probe" />
        </div>
    );
}

beforeEach(() => {
    renders.status = 0;
    renders.m3 = 0;
    renders.readiness = 0;
    // A stable, readable binding so the readiness value never changes across ticks.
    useReadinessStore.getState().reportBinding('s2.graph.node', { state: 'ready_public_current' });
});

afterEach(() => {
    cleanup();
    useTickStore.setState({ profile: null, generation: null });
    useReadinessStore.getState().clear();
});

describe('28.17 — profile-tick re-render contract per widget', () => {
    it('re-renders EVERY profile-bearing carrier surface on a single tick advance (stable input)', () => {
        render(<Shell />);

        // Pre-tick: no generation yet on any surface.
        expect(screen.getByTestId('w-status').getAttribute('data-generation')).toBe('none');
        expect(screen.getByTestId('w-m3').getAttribute('data-generation')).toBe('none');
        expect(screen.getByTestId('omni-pending-pane').getAttribute('data-generation')).toBe('none');
        const readinessRendersBefore = renders.readiness;
        // Pre-tick: the readiness value is already resolved but observed at tick -1.
        expect(screen.getByTestId('w-readiness').getAttribute('data-readiness')).toBe('ready_public_current');
        expect(screen.getByTestId('w-readiness').getAttribute('data-observed')).toBe('-1');

        // ONE clock advance — no user input, no per-surface prop change.
        act(() => useTickStore.getState().setProfile(cachedProfile(7, 4)));

        // Every surface reflects the advanced generation.
        expect(screen.getByTestId('w-status').getAttribute('data-generation')).toBe('7');
        expect(screen.getByTestId('w-status').getAttribute('data-tick12')).toBe('4');
        expect(screen.getByTestId('w-m3').getAttribute('data-generation')).toBe('7');
        expect(screen.getByTestId('omni-pending-pane').getAttribute('data-generation')).toBe('7');
        // The readiness surface re-rendered on the tick — its observed-tick advanced
        // to the new tick12 while its readiness VALUE held stable (clock, not datum).
        expect(renders.readiness).toBeGreaterThan(readinessRendersBefore);
        expect(screen.getByTestId('w-readiness').getAttribute('data-readiness')).toBe('ready_public_current');
        expect(screen.getByTestId('w-readiness').getAttribute('data-observed')).toBe('4');
    });

    it('no surface rewinds on a stale generation — one clock, no rewind', () => {
        render(<Shell />);
        act(() => useTickStore.getState().setProfile(cachedProfile(9, 6)));

        expect(screen.getByTestId('w-status').getAttribute('data-generation')).toBe('9');
        const rendersAfterAdvance = { ...renders };

        // A stale (lesser) generation arrives — the store refuses it.
        act(() => useTickStore.getState().setProfile(cachedProfile(3, 1)));

        // Held, not rewound, on every surface.
        expect(screen.getByTestId('w-status').getAttribute('data-generation')).toBe('9');
        expect(screen.getByTestId('w-status').getAttribute('data-tick12')).toBe('6');
        expect(screen.getByTestId('w-m3').getAttribute('data-generation')).toBe('9');
        expect(screen.getByTestId('omni-pending-pane').getAttribute('data-generation')).toBe('9');
        // A refused generation drives NO re-render anywhere.
        expect(renders.status).toBe(rendersAfterAdvance.status);
        expect(renders.m3).toBe(rendersAfterAdvance.m3);
        expect(renders.readiness).toBe(rendersAfterAdvance.readiness);
    });

    it('installs no competing render timer — the profile clock is the only clock', () => {
        const setInterval = vi.spyOn(globalThis, 'setInterval');
        const raf = vi.spyOn(globalThis, 'requestAnimationFrame');
        try {
            render(<Shell />);
            act(() => useTickStore.getState().setProfile(cachedProfile(11, 2)));
            act(() => useTickStore.getState().setProfile(cachedProfile(12, 3)));
            act(() => useTickStore.getState().setProfile(cachedProfile(13, 4)));

            // None of the four surfaces spun a widget-local render loop: the
            // re-render came from the store subscription, not a timer.
            expect(setInterval).not.toHaveBeenCalled();
            expect(raf).not.toHaveBeenCalled();
        } finally {
            setInterval.mockRestore();
            raf.mockRestore();
        }
    });
});
