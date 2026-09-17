/**
 * 29.T29.4 — one subscription per composition (DR-WC-IP-4).
 *
 * What the tranche asks for, asserted: the provider opens EXACTLY ONE
 * subscription, two consumers under it receive the SAME snapshot per tick, and
 * unmount disposes it. Plus the seam's own law — every frame enters through
 * `publishProfileTick`, and the store's stale-generation gate still applies.
 */

import { act, cleanup, render, renderHook, screen } from '@testing-library/react';
import { StrictMode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useTickStore } from '../state/stores';
import {
    CompositionProfileProvider,
    useCompositionProfile
} from './compositionProfileContext';
import * as subscriptionModule from './profileTickSubscription';
import {
    openCompositionProfileSubscription,
    publishProfileTick,
    resetProfileTicks
} from './profileTickSubscription';

/** Captured before any spy so the stub can still build a real subscription. */
const actualOpen = subscriptionModule.openCompositionProfileSubscription;

afterEach(() => {
    cleanup();
    resetProfileTicks();
});

function frame(generation: number) {
    return {
        generation,
        cachedAtMs: generation * 1000,
        stale: false,
        stalenessMs: 0,
        privacyClass: 'public-current-context',
        profile: { harmonicProfile: { tick12: generation % 12 } }
    } as never;
}

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <CompositionProfileProvider>{children}</CompositionProfileProvider>
);

describe('the subscription primitive', () => {
    it('opens against the live clock and reports the current frame', () => {
        act(() => publishProfileTick(frame(4)));
        const subscription = openCompositionProfileSubscription();
        expect(subscription.currentGeneration).toBe(4);
        expect(subscription.currentProfile?.generation).toBe(4);
        subscription.dispose();
    });

    it('fans one tick out to every listener', () => {
        const subscription = openCompositionProfileSubscription();
        const a = vi.fn();
        const b = vi.fn();
        subscription.subscribe(a);
        subscription.subscribe(b);
        act(() => publishProfileTick(frame(2)));
        expect(a).toHaveBeenCalledTimes(1);
        expect(b).toHaveBeenCalledTimes(1);
        // Both were handed the SAME object, not two equal ones.
        expect(a.mock.calls[0][0]).toBe(b.mock.calls[0][0]);
        subscription.dispose();
    });

    it('stops delivering after dispose, and dispose is idempotent', () => {
        const subscription = openCompositionProfileSubscription();
        const listener = vi.fn();
        subscription.subscribe(listener);
        subscription.dispose();
        subscription.dispose();
        act(() => publishProfileTick(frame(6)));
        expect(listener).not.toHaveBeenCalled();
        expect(subscription.disposed).toBe(true);
    });

    it('detaching one listener leaves the others attached', () => {
        const subscription = openCompositionProfileSubscription();
        const leaving = vi.fn();
        const staying = vi.fn();
        const detach = subscription.subscribe(leaving);
        subscription.subscribe(staying);
        detach();
        act(() => publishProfileTick(frame(3)));
        expect(leaving).not.toHaveBeenCalled();
        expect(staying).toHaveBeenCalledTimes(1);
        subscription.dispose();
    });

    it('keeps the store stale-generation gate — a late frame is refused', () => {
        act(() => publishProfileTick(frame(9)));
        act(() => publishProfileTick(frame(5)));
        expect(useTickStore.getState().generation).toBe(9);
    });

    it('resetProfileTicks returns the clock to its pre-tick state', () => {
        act(() => publishProfileTick(frame(3)));
        act(() => resetProfileTicks());
        expect(useTickStore.getState().generation).toBeNull();
        expect(useTickStore.getState().profile).toBeNull();
    });
});

describe('the provider fans one subscription out to the composition', () => {
    it('opens EXACTLY ONE subscription for the whole tree', () => {
        const subscription = openCompositionProfileSubscription();
        const subscribe = vi.spyOn(subscription, 'subscribe');
        function Consumer() {
            useCompositionProfile();
            return null;
        }
        render(
            <CompositionProfileProvider subscription={subscription}>
                <Consumer />
                <Consumer />
                <Consumer />
            </CompositionProfileProvider>
        );
        // Three contributors, one subscription — not one each.
        expect(subscribe).toHaveBeenCalledTimes(1);
        subscription.dispose();
    });

    it('gives two consumers the same snapshot per tick, and advances together', () => {
        function Consumer({ id }: { id: string }) {
            const { generation } = useCompositionProfile();
            return <span data-testid={id}>{generation ?? 'none'}</span>;
        }
        render(
            <CompositionProfileProvider>
                <Consumer id="a" />
                <Consumer id="b" />
            </CompositionProfileProvider>
        );
        act(() => publishProfileTick(frame(11)));
        expect(screen.getByTestId('a').textContent).toBe('11');
        expect(screen.getByTestId('b').textContent).toBe('11');
        act(() => publishProfileTick(frame(12)));
        expect(screen.getByTestId('a').textContent).toBe('12');
        expect(screen.getByTestId('b').textContent).toBe('12');
    });

    it('disposes the subscription it opened when the composition unmounts', () => {
        // The provider opens its own; dispose is the spec's acceptance (c), so
        // it is asserted on the real object rather than inferred. The seam is
        // stubbed for this one case so the opened subscription is reachable.
        const opened: ReturnType<typeof openCompositionProfileSubscription>[] = [];
        const spy = vi
            .spyOn(subscriptionModule, 'openCompositionProfileSubscription')
            .mockImplementation(() => {
                const real = actualOpen();
                opened.push(real);
                return real;
            });
        function Probe() {
            useCompositionProfile();
            return null;
        }
        const host = render(
            <CompositionProfileProvider>
                <Probe />
            </CompositionProfileProvider>
        );
        expect(opened).toHaveLength(1);
        expect(opened[0].disposed).toBe(false);
        host.unmount();
        expect(opened[0].disposed).toBe(true);
        spy.mockRestore();
    });

    it('leaves an INJECTED subscription to its caller on unmount', () => {
        const injected = openCompositionProfileSubscription();
        function Probe() {
            useCompositionProfile();
            return null;
        }
        const host = render(
            <CompositionProfileProvider subscription={injected}>
                <Probe />
            </CompositionProfileProvider>
        );
        host.unmount();
        expect(injected.disposed).toBe(false);
        injected.dispose();
    });

    it('keeps delivering under StrictMode, which mounts twice', () => {
        // REGRESSION: opening the subscription in useState and disposing it in
        // an effect leaves it disposed after StrictMode's mount→cleanup→mount,
        // and the surface sits at its pre-tick snapshot forever. The real app
        // runs in StrictMode (main.tsx); the browser spec caught this, so it is
        // pinned here where it is cheap.
        function Consumer() {
            const { generation } = useCompositionProfile();
            return <span data-testid="strict">{generation ?? 'none'}</span>;
        }
        render(
            <StrictMode>
                <CompositionProfileProvider>
                    <Consumer />
                </CompositionProfileProvider>
            </StrictMode>
        );
        act(() => publishProfileTick(frame(21)));
        expect(screen.getByTestId('strict').textContent).toBe('21');
        act(() => publishProfileTick(frame(22)));
        expect(screen.getByTestId('strict').textContent).toBe('22');
    });

    it('reports a profile the store ALREADY holds on the very first render', () => {
        // REGRESSION: the provider's snapshot fell back to the pre-tick value
        // until its effect ran, so a composition mounting onto a live clock
        // painted its pending branch once and any mount effect keyed on the
        // profile built against nothing — something the direct store read this
        // seam replaced never did.
        act(() => publishProfileTick(frame(31)));
        const seen: (number | null)[] = [];
        function Consumer() {
            const { generation } = useCompositionProfile();
            seen.push(generation);
            return <span data-testid="first">{generation ?? 'none'}</span>;
        }
        render(
            <CompositionProfileProvider>
                <Consumer />
            </CompositionProfileProvider>
        );
        expect(seen[0]).toBe(31);
        expect(screen.getByTestId('first').textContent).toBe('31');
    });

    it('refuses a contributor mounted outside any provider', () => {
        // An unwrapped contributor is a composition that never declared its
        // subscription — the defect this tranche exists to prevent.
        expect(() => renderHook(() => useCompositionProfile())).toThrow(
            /outside <CompositionProfileProvider>/
        );
    });

    it('reports a null snapshot before any tick rather than fabricating one', () => {
        const { result } = renderHook(() => useCompositionProfile(), { wrapper });
        expect(result.current.profile).toBeNull();
        expect(result.current.generation).toBeNull();
    });
});
