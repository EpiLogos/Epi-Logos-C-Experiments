import * as React from 'react';
import type { MExtensionReadinessSnapshot } from '@pratibimba/m-extension-runtime';
import { PENDING_M_READINESS } from '@pratibimba/m-extension-runtime';
import type { M3ProjectionSurface } from '../../common';

export type M3InlineReadinessState = 'ready' | 'pending' | 'blocked';

export interface M3ReadinessContextValue {
    readonly snapshot: MExtensionReadinessSnapshot;
    readonly surfaceReadiness: M3ProjectionSurface['readiness'] | null;
    readonly pendingFields: readonly string[];
    readonly blockers: readonly string[];
}

export interface M3ReadinessProviderProps {
    readonly surface?: M3ProjectionSurface | null;
    readonly readiness?: MExtensionReadinessSnapshot;
    readonly children: React.ReactNode;
}

export const EMPTY_M3_READINESS_CONTEXT: M3ReadinessContextValue = Object.freeze({
    snapshot: PENDING_M_READINESS,
    surfaceReadiness: null,
    pendingFields: Object.freeze([] as string[]) as readonly string[],
    blockers: Object.freeze([] as string[]) as readonly string[]
});

export const M3ReadinessContext = React.createContext<M3ReadinessContextValue>(
    EMPTY_M3_READINESS_CONTEXT
);

export const M3ReadinessProvider: React.FC<M3ReadinessProviderProps> = ({
    surface,
    readiness = PENDING_M_READINESS,
    children
}) => {
    const value = React.useMemo<M3ReadinessContextValue>(() => {
        const blockerSet = new Set<string>([
            ...(surface?.readiness.blockers ?? []),
            ...(readiness.blockerIds ?? [])
        ]);
        if (readiness.reason) {
            blockerSet.add(readiness.reason);
        }
        return Object.freeze({
            snapshot: readiness,
            surfaceReadiness: surface?.readiness ?? null,
            pendingFields: Object.freeze([...(surface?.pendingFields ?? [])]),
            blockers: Object.freeze([...blockerSet])
        });
    }, [surface, readiness]);

    return (
        <M3ReadinessContext.Provider value={value}>
            {children}
        </M3ReadinessContext.Provider>
    );
};

export function useM3Readiness(): M3ReadinessContextValue {
    return React.useContext(M3ReadinessContext);
}

export function readinessStateForBinding(
    context: M3ReadinessContextValue,
    bindingKey: string
): M3InlineReadinessState {
    if (context.blockers.some(blocker => blockerMatchesBinding(blocker, bindingKey))) {
        return 'blocked';
    }
    if (context.pendingFields.some(field => blockerMatchesBinding(field, bindingKey))) {
        return 'pending';
    }
    if (context.surfaceReadiness && !context.surfaceReadiness.surfaceReady) {
        return 'blocked';
    }
    if (
        context.snapshot.state === 'bridge_unavailable' ||
        context.snapshot.state === 'privacy_blocked' ||
        context.snapshot.state === 'authority_payload_missing'
    ) {
        return 'blocked';
    }
    if (context.snapshot.state !== 'ready_public_current') {
        return 'pending';
    }
    return 'ready';
}

export function blockersForBinding(
    context: M3ReadinessContextValue,
    bindingKey: string
): readonly string[] {
    const blockers = context.blockers.filter(blocker => blockerMatchesBinding(blocker, bindingKey));
    return blockers.length > 0 ? blockers : context.blockers;
}

function blockerMatchesBinding(candidate: string, bindingKey: string): boolean {
    return candidate === bindingKey || candidate.includes(bindingKey) || bindingKey.includes(candidate);
}
