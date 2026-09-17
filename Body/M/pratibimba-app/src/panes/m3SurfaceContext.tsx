/**
 * Coordinate: M' M3' (Wave-C profile-tick and readiness spine — Track 24.T24.15)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): M3' carrier context
 * Actualises: one passive profile-tick subscription for M3' widgets and
 *   per-binding readiness rendered inline with each datum.
 * Public surface: M3ProfileTickContext, M3ReadinessContext and their providers,
 *   hooks, binding model, and M3ReadinessBoundary.
 * Does NOT own: the tick clock, gateway transport, readiness taxonomy, or any
 *   widget-local clock loop.
 * Contract: [[M3'-SPEC]] / [[24-m3-mahamaya-frontend-deep]]
 */

import {
    createContext,
    useContext,
    useMemo,
    type PropsWithChildren,
    type ReactNode
} from 'react';
import type { KernelBridgeCachedProfile } from '../bridge/types';
import { useTickStore } from '../state/stores';
import { useProfileTick, type ProfileTickView } from '../state/useProfileTick';
import { BlockedOverlay, PendingBadge, ReadinessIndicator, type ReadinessState } from '../ui/primitives';
import type { BridgeReadinessId } from '../ui/bridgeReadiness';
import './m3SurfaceContext.css';

export interface M3ProfileTickValue extends ProfileTickView {
    readonly cachedProfile: KernelBridgeCachedProfile | null;
    readonly payload: Readonly<Record<string, unknown>> | null;
}

export interface M3ReadinessBinding {
    readonly state: ReadinessState;
    readonly reason: string;
    /** The nine-id taxonomy state, when the producer knows it. The 30.6 state
     *  grammar is typed on the taxonomy, so supplying this is what gets a
     *  binding its per-id colour, its ownerTrack and its recovery action. */
    readonly readinessId?: BridgeReadinessId;
}

/**
 * Widen the coarse three-state to the nine-id taxonomy WITHOUT inventing
 * precision. `ready` is unambiguous. Anything else with no explicit id means
 * the bridge has not classified this binding — which is exactly what
 * `classifyReadiness` already calls `bridge_unavailable` for an unreported
 * binding, and is never the same as claiming a specific dimensional block. The
 * reason string is carried through verbatim, so nothing the producer said is
 * lost in the widening.
 */
function coarseReadinessId(binding: M3ReadinessBinding): BridgeReadinessId {
    if (binding.readinessId !== undefined) {
        return binding.readinessId;
    }
    return binding.state === 'ready' ? 'ready_public_current' : 'bridge_unavailable';
}

export type M3ReadinessBindings = Readonly<Record<string, M3ReadinessBinding>>;

const EMPTY_TICK: M3ProfileTickValue = Object.freeze({
    generation: null,
    tick12: null,
    degree720: null,
    graphRevision: null,
    observedTicks: 0,
    lastTickAtMs: null,
    cachedProfile: null,
    payload: null
});

const UNREPORTED_BINDING: M3ReadinessBinding = Object.freeze({
    state: 'pending',
    reason: 'binding-readiness-unreported'
});

export const M3ProfileTickContext = createContext<M3ProfileTickValue>(EMPTY_TICK);
export const M3ReadinessContext = createContext<M3ReadinessBindings>(Object.freeze({}));

export function M3ProfileTickProvider({ children }: PropsWithChildren) {
    const tick = useProfileTick();
    const cachedProfile = useTickStore(state => state.profile);
    const value = useMemo<M3ProfileTickValue>(
        () =>
            Object.freeze({
                ...tick,
                cachedProfile,
                payload: (cachedProfile?.profile as Readonly<Record<string, unknown>> | null) ?? null
            }),
        [tick, cachedProfile]
    );

    return <M3ProfileTickContext.Provider value={value}>{children}</M3ProfileTickContext.Provider>;
}

export function M3ReadinessProvider({
    bindings,
    children
}: PropsWithChildren<{ readonly bindings: M3ReadinessBindings }>) {
    return <M3ReadinessContext.Provider value={bindings}>{children}</M3ReadinessContext.Provider>;
}

export function useM3ProfileTick(): M3ProfileTickValue {
    return useContext(M3ProfileTickContext);
}

export function useM3Readiness(
    bindingKey: string,
    fallback: M3ReadinessBinding = UNREPORTED_BINDING
): M3ReadinessBinding {
    const bindings = useContext(M3ReadinessContext);
    return bindings[bindingKey] ?? fallback;
}

export function M3ReadinessBoundary({
    bindingKey,
    fallback,
    children
}: {
    readonly bindingKey: string;
    readonly fallback?: M3ReadinessBinding;
    readonly children: ReactNode;
}) {
    const tick = useM3ProfileTick();
    const readiness = useM3Readiness(bindingKey, fallback);
    const readinessId = coarseReadinessId(readiness);

    return (
        <div
            className={`m3-readiness-boundary m3-readiness-${readiness.state}`}
            data-testid="m3-readiness-boundary"
            data-binding={bindingKey}
            data-readiness={readiness.state}
            data-generation={tick.generation ?? 'none'}
            title={readiness.reason}
        >
            <ReadinessIndicator readinessId={readinessId} reason={readiness.reason} />
            {readiness.state === 'pending' ? (
                <PendingBadge id={bindingKey} readinessId={readinessId} reason={readiness.reason} />
            ) : null}
            {readiness.state === 'blocked' ? (
                <BlockedOverlay readinessId={readinessId} reason={readiness.reason} />
            ) : null}
            {children}
        </div>
    );
}
