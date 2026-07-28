/**
 * Coordinate: M'/29 :: the composition profile React seam (29.T29.4)
 * Residency: Body/M/pratibimba-app/src/composition
 * Position (#n): #4 — Context/Type; the composition-level fan-out of one clock
 * Actualises: DR-WC-IP-4 (ROUTED) — `<CompositionProfileProvider>` holds exactly
 *   one live subscription and disposes it on unmount; every contributor under
 *   it reads that one snapshot through `useCompositionProfile()`.
 * Public surface: CompositionProfileContext, CompositionProfileProvider,
 *   useCompositionProfile.
 * Does NOT own: the subscription itself (`profileTickSubscription.ts`), the
 *   store (`state/stores.ts`), or any composition's render.
 * Contract: [[M'-SYSTEM-SPEC]] / [[29-integrated-plugins-composition-deep]] T29.4.
 *
 * The subscription is opened BY the effect that disposes it. Opening it in
 * `useState` instead is broken under StrictMode: React mounts, runs the
 * cleanup, and mounts again on the same instance, so the state-held
 * subscription is disposed and never reopened — the surface then sits at its
 * pre-tick snapshot forever. jsdom tests do not wrap in StrictMode and missed
 * it; the real-browser spec caught it.
 */

import { createContext, useCallback, useContext, useEffect, useRef, useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';

import {
    EMPTY_PROFILE_SNAPSHOT,
    openCompositionProfileSubscription,
    type CompositionProfileSnapshot,
    type CompositionProfileTickSubscription
} from './profileTickSubscription';

export const CompositionProfileContext = createContext<CompositionProfileSnapshot | null>(null);

export function CompositionProfileProvider({
    children,
    subscription
}: {
    children: ReactNode;
    /** Injectable for tests; an injected subscription belongs to its caller and
     *  is never disposed here. */
    subscription?: CompositionProfileTickSubscription;
}) {
    const live = useRef<CompositionProfileTickSubscription | null>(null);
    const listeners = useRef(new Set<() => void>());

    // Consumers attach to the PROVIDER, not to the subscription, so the
    // subscription can be replaced across a mount cycle without them noticing.
    const subscribe = useCallback((onStoreChange: () => void) => {
        listeners.current.add(onStoreChange);
        return () => {
            listeners.current.delete(onStoreChange);
        };
    }, []);

    const getSnapshot = useCallback(
        () => live.current?.current ?? EMPTY_PROFILE_SNAPSHOT,
        []
    );

    useEffect(() => {
        const opened = subscription ?? openCompositionProfileSubscription();
        live.current = opened;
        const notify = () => {
            for (const listener of [...listeners.current]) listener();
        };
        const detach = opened.subscribe(notify);
        // A frame can land between render and effect; publish once so the first
        // paint after mount is not stuck at the pre-tick snapshot.
        notify();
        return () => {
            detach();
            live.current = null;
            if (!subscription) opened.dispose();
            notify();
        };
    }, [subscription]);

    const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

    return (
        <CompositionProfileContext.Provider value={snapshot}>
            {children}
        </CompositionProfileContext.Provider>
    );
}

/**
 * The one profile snapshot a composition contributor reads.
 *
 * Throws outside a provider rather than silently opening a second path to the
 * clock — an unwrapped contributor is a composition that never declared its
 * subscription, which is the defect this tranche exists to prevent.
 */
export function useCompositionProfile(): CompositionProfileSnapshot {
    const snapshot = useContext(CompositionProfileContext);
    if (snapshot === null) {
        throw new Error(
            'useCompositionProfile() outside <CompositionProfileProvider> — a composition reads one subscription (29.4 / DR-WC-IP-4)'
        );
    }
    return snapshot;
}
