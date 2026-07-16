/**
 * Coordinate: M' (bridge-readiness store — Track 28.T28.11)
 * Residency: Body/M/pratibimba-app/src/state
 * Actualises: the single per-binding readiness snapshot the shared
 *   `useBridgeReadiness` hook resolves against — fed live from the gateway
 *   `readiness` event channel (routed in App.tsx). One store, so the shell
 *   bridge-gate and the integrated bridge-gate read the SAME source (28.11e),
 *   never a fork.
 * Public surface: useReadinessStore (bindings, reportBinding,
 *   ingestReadinessEvent, clear).
 * Does NOT own: the taxonomy law (ui/bridgeReadiness), the gateway transport
 *   (bridge/gatewayClient), the profile clock (state/useProfileTick).
 */

import { create } from 'zustand';
import { BRIDGE_READINESS_IDS, type BridgeReadinessId, type ReportedBinding } from '../ui/bridgeReadiness';

export interface ReadinessStoreState {
    /** Per-binding readiness, keyed by binding (`s2.graph.node`, …). */
    bindings: Readonly<Record<string, ReportedBinding>>;
    /** Record one binding's reported readiness (the honest per-binding write). */
    reportBinding(bindingKey: string, reported: ReportedBinding): void;
    /** Adapter over a raw gateway `readiness` event payload. */
    ingestReadinessEvent(payload: unknown): void;
    clear(): void;
}

function isReadinessId(value: unknown): value is BridgeReadinessId {
    return typeof value === 'string' && (BRIDGE_READINESS_IDS as readonly string[]).includes(value);
}

export const useReadinessStore = create<ReadinessStoreState>(set => ({
    bindings: {},
    reportBinding: (bindingKey, reported) =>
        set(state => ({ bindings: { ...state.bindings, [bindingKey]: reported } })),
    ingestReadinessEvent: payload => {
        // Honest adapter: ONLY a frame that names its binding AND carries a
        // valid nine-id state populates the map. Overall/health frames without
        // a binding are left alone — inventing per-binding data from an overall
        // snapshot would be faking readiness, which the taxonomy forbids.
        if (payload === null || typeof payload !== 'object') {
            return;
        }
        const frame = payload as Record<string, unknown>;
        const bindingKey =
            typeof frame.binding === 'string'
                ? frame.binding
                : typeof frame.bindingKey === 'string'
                  ? frame.bindingKey
                  : null;
        if (bindingKey === null || !isReadinessId(frame.state)) {
            return;
        }
        const reason = typeof frame.reason === 'string' ? frame.reason : undefined;
        set(state => ({
            bindings: {
                ...state.bindings,
                [bindingKey]: reason === undefined ? { state: frame.state as BridgeReadinessId } : { state: frame.state as BridgeReadinessId, reason }
            }
        }));
    },
    clear: () => set({ bindings: {} })
}));
