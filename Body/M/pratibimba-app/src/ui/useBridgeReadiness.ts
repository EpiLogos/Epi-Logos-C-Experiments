/**
 * Coordinate: M' shell (bridge-readiness hook — Track 28.T28.11, folds 15.T15.6)
 * Residency: Body/M/pratibimba-app/src/ui
 * Actualises: `useBridgeReadiness(bindingKey)` — the retarget of the frozen
 *   `useBridgeReadiness(bridge, bindingKey)` contract (28.11b) to the carrier's
 *   store idiom. Resolves one binding's readiness from the shared readiness
 *   store, stamped by the profile-tick clock so a binding re-renders on tick
 *   advance (15.6: "widgets re-render on tick advance, not user input"), never
 *   a timer.
 * Public surface: useBridgeReadiness.
 * Does NOT own: the taxonomy (bridgeReadiness), the snapshot transport
 *   (state/readinessStore ← gatewayClient), the clock law (state/useProfileTick).
 */

import { useMemo } from 'react';
import { useReadinessStore } from '../state/readinessStore';
import { useProfileTick } from '../state/useProfileTick';
import {
    classifyReadiness,
    type BridgeReadinessBinding,
    type MExtensionReadinessSnapshot
} from './bridgeReadiness';

/** Resolve a single binding's readiness against the shared store + profile clock. */
export function useBridgeReadiness(bindingKey: string): BridgeReadinessBinding {
    const bindings = useReadinessStore(s => s.bindings);
    const tick = useProfileTick();

    return useMemo(() => {
        const lastTick = tick.tick12 ?? tick.generation ?? -1;
        const snapshot: MExtensionReadinessSnapshot = { bindings, lastTick };
        return classifyReadiness(snapshot, bindingKey);
    }, [bindings, bindingKey, tick.tick12, tick.generation]);
}
