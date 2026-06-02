/**
 * Nine-state readiness taxonomy — locked in
 * `Body/M/epi-theia/extensions/contracts/07-t0-extension-contract-preflight.json#readinessTaxonomy`,
 * `Body/S/S0/epi-cli/schemas/src/readiness.ts`, and the Rust
 * `BridgeReadinessState` in `Body/S/S0/epi-cli/src/profile/mod.rs`.
 *
 * The M-extension runtime never collapses these to a binary ready/not-ready.
 * Renderers MUST switch on the literal state.
 */
export type MExtensionReadinessState =
    | 'bridge_unavailable'
    | 'profile_missing_field'
    | 's2_graph_blocked'
    | 's3_subscription_blocked'
    | 's5_review_blocked'
    | 'authority_payload_missing'
    | 'privacy_blocked'
    | 'degraded_but_readable'
    | 'ready_public_current';

export interface MExtensionReadinessSnapshot {
    readonly fetchedAt: number;
    readonly state: MExtensionReadinessState;
    readonly reason: string;
    readonly profileGeneration: number | null;
    readonly bridgeReachable: boolean;
    readonly blockerIds: readonly string[];
}

export const PENDING_M_READINESS: MExtensionReadinessSnapshot = Object.freeze({
    fetchedAt: 0,
    state: 'bridge_unavailable',
    reason: 'No kernel bridge instance has bound a readiness source yet.',
    profileGeneration: null,
    bridgeReachable: false,
    blockerIds: Object.freeze([] as string[]) as readonly string[]
});

export function readinessSeverity(state: MExtensionReadinessState): 'ok' | 'degraded' | 'blocked' {
    switch (state) {
        case 'ready_public_current':
            return 'ok';
        case 'degraded_but_readable':
            return 'degraded';
        default:
            return 'blocked';
    }
}
