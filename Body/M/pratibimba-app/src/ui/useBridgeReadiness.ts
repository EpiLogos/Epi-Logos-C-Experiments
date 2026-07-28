/**
 * Coordinate: M' shell (bridge-readiness hook — Track 28.T28.11, folds 15.T15.6)
 * Residency: Body/M/pratibimba-app/src/ui
 * Actualises: `useBridgeReadiness(bindingKey)` — the retarget of the frozen
 *   `useBridgeReadiness(bridge, bindingKey)` contract (28.11b) to the carrier's
 *   store idiom. Resolves one binding's readiness from the shared readiness
 *   store, stamped by the profile-tick clock so a binding re-renders on tick
 *   advance (15.6: "widgets re-render on tick advance, not user input"), never
 *   a timer.
 * Public surface: useBridgeReadiness, useReadinessFlavour.
 * Does NOT own: the taxonomy (bridgeReadiness), the grammar/flavour law
 *   (readinessGrammar), the snapshot transport (state/readinessStore ←
 *   gatewayClient), the clock law (state/useProfileTick).
 */

import { useMemo } from 'react';
import { useReadinessStore } from '../state/readinessStore';
import { useProvenanceStore, useSessionStore } from '../state/stores';
import { useProfileTick } from '../state/useProfileTick';
import {
    classifyReadiness,
    type BridgeReadinessBinding,
    type MExtensionReadinessSnapshot
} from './bridgeReadiness';
import { flavourOf, type MExtensionReadinessFlavour } from './readinessGrammar';

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

/**
 * The 32.5 render flavour for an already-resolved binding.
 *
 * `flavourOf` deliberately refuses to infer two of the five from the snapshot:
 * whether the bridge is genuinely connected (which separates a real outage from
 * "up, awaiting the first tick"), and the surface's privacy class. Those live in
 * the stores that own them, so they are read here and handed over — a flavour
 * with no context to stand on returns null and the surface renders plainly.
 */
export function useReadinessFlavour(
    binding: BridgeReadinessBinding
): MExtensionReadinessFlavour | null {
    const bindings = useReadinessStore(s => s.bindings);
    const bridgeConnected = useProvenanceStore(s => s.connection.connected);
    const privacyClass = useSessionStore(s => s.privacyClass);

    return useMemo(
        () =>
            flavourOf(
                binding.readinessId,
                { bindings, lastTick: binding.lastTickObserved },
                { bridgeConnected, blockers: binding.blockers, privacyClass }
            ),
        [
            binding.readinessId,
            binding.lastTickObserved,
            binding.blockers,
            bindings,
            bridgeConnected,
            privacyClass
        ]
    );
}
