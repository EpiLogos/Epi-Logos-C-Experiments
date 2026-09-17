/**
 * Coordinate: M'/29 :: the composition profile-tick subscription (29.T29.4)
 * Residency: Body/M/pratibimba-app/src/composition
 * Position (#n): #4 — Context/Type; the one seam profile frames enter through
 * Actualises: DR-WC-IP-4 (ROUTED) — one subscription per composition, and one
 *   way in. `publishProfileTick` is the ONLY sanctioned writer of the clock;
 *   `scripts/lint-single-clock.mjs` refuses every other writer carrier-wide,
 *   tests included.
 * Public surface: CompositionProfileSnapshot, CompositionProfileTickSubscription,
 *   openCompositionProfileSubscription, currentProfileSnapshot,
 *   publishProfileTick, resetProfileTicks.
 * Does NOT own: the generation gate (`state/stores.ts` refuses stale frames),
 *   the socket (`bridge/gatewayClient.ts`), or the React seam
 *   (`compositionProfileContext.tsx`).
 * Contract: [[M'-SYSTEM-SPEC]] / [[29-integrated-plugins-composition-deep]] T29.4.
 */

import type { KernelBridgeCachedProfile } from '../bridge/types';
import { useTickStore } from '../state/stores';

export interface CompositionProfileSnapshot {
    readonly profile: KernelBridgeCachedProfile | null;
    readonly generation: number | null;
}

export interface CompositionProfileTickSubscription {
    /** The snapshot as of the last tick. Stable identity between ticks. */
    readonly current: CompositionProfileSnapshot;
    readonly currentProfile: KernelBridgeCachedProfile | null;
    readonly currentGeneration: number | null;
    /** Register a listener; the returned function detaches it. */
    subscribe(listener: (snapshot: CompositionProfileSnapshot) => void): () => void;
    /** Detach from the store and drop every listener. Idempotent. */
    dispose(): void;
    readonly disposed: boolean;
}

/** The pre-tick snapshot. One shared identity so a render before the first
 *  frame is stable. */
export const EMPTY_PROFILE_SNAPSHOT: CompositionProfileSnapshot = Object.freeze({
    profile: null,
    generation: null
});

const EMPTY = EMPTY_PROFILE_SNAPSHOT;

/** One cached snapshot per distinct (profile, generation). Identity has to be
 *  stable: `useSyncExternalStore` re-renders forever if `getSnapshot` returns a
 *  fresh object each call, and a contributor memoising on the snapshot would
 *  recompute every render. */
let cached: CompositionProfileSnapshot = EMPTY;

function snapshotOf(profile: KernelBridgeCachedProfile | null, generation: number | null) {
    if (cached.profile === profile && cached.generation === generation) return cached;
    cached = profile === null && generation === null ? EMPTY : Object.freeze({ profile, generation });
    return cached;
}

/**
 * The clock as it stands RIGHT NOW, without opening a subscription.
 *
 * A composition's first render happens before its provider's effect runs. If
 * that render reported the pre-tick snapshot while the store already held a
 * profile, every contributor would paint its pending branch once and any mount
 * effect keyed on the profile would build against nothing — which is exactly
 * what the direct `useTickStore` read this seam replaced never did.
 */
export function currentProfileSnapshot(): CompositionProfileSnapshot {
    const state = useTickStore.getState();
    return snapshotOf(state.profile, state.generation);
}

/**
 * Open ONE subscription to the clock and fan it out.
 *
 * A composition opens exactly one of these at its root and every contributor
 * under it reads that one snapshot, rather than each attaching to the store
 * itself. `dispose()` detaches; the provider calls it on unmount.
 */
export function openCompositionProfileSubscription(): CompositionProfileTickSubscription {
    const listeners = new Set<(snapshot: CompositionProfileSnapshot) => void>();
    let disposed = false;

    let current = currentProfileSnapshot();

    const detach = useTickStore.subscribe(state => {
        const next = snapshotOf(state.profile, state.generation);
        if (next === current) return;
        current = next;
        for (const listener of [...listeners]) listener(current);
    });

    return {
        get current() {
            return current;
        },
        get currentProfile() {
            return current.profile;
        },
        get currentGeneration() {
            return current.generation;
        },
        get disposed() {
            return disposed;
        },
        subscribe(listener) {
            if (disposed) return () => undefined;
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
        dispose() {
            if (disposed) return;
            disposed = true;
            listeners.clear();
            detach();
        }
    };
}

/**
 * The one way a profile frame enters the app.
 *
 * `App.tsx`'s gateway `onProfile` callback calls this, and so does every test
 * that needs a tick — a test driving the clock IS the wire for that test, so it
 * uses the wire's own seam rather than reaching past it into the store. The
 * store's stale-generation gate still applies: a frame at or below the current
 * generation is refused there, not here.
 */
export function publishProfileTick(profile: KernelBridgeCachedProfile): void {
    useTickStore.getState().setProfile(profile);
}

/** Return the clock to its pre-tick state (test teardown). `observedTicks` is
 *  part of that state: a suite that left it standing would hand the next test a
 *  clock claiming ticks it never published (32.T32.9). */
export function resetProfileTicks(): void {
    useTickStore.setState({ profile: null, generation: null, observedTicks: 0 });
}
