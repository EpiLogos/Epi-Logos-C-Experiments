/**
 * Coordinate: M' shell (shared bridge-readiness primitive — Track 28.T28.11,
 *   folds 15.T15.6 inline-provenance)
 * Residency: Body/M/pratibimba-app/src/ui
 * Actualises: the ONE nine-id readiness taxonomy + per-binding classification
 *   the carrier's readiness sites share instead of forking — the retarget of
 *   the frozen `m-extension-runtime/src/common/bridge-readiness.ts` contract
 *   (28.11b). Both the shell bridge-gate and the integrated bridge-gate consume
 *   `useBridgeReadiness` + `<BridgeReadinessBadge>` from here; no surface
 *   re-implements the taxonomy. Provenance: readiness ids + severity are
 *   MIRRORED (never imported — M→S0 is a forbidden cross-stack edge) from the
 *   S0 authority `Body/S/S0/epi-cli/schemas/src/readiness.ts`
 *   (`@epi-logos/ql-schema`), itself locked to Rust
 *   `Body/S/S0/epi-cli/src/profile/mod.rs#BridgeReadinessState`. The nine-state
 *   taxonomy is declared canon in
 *   `contracts/07-t0-extension-contract-preflight.json#readinessTaxonomy`.
 *   The visual tier (green/amber/red) is the 28.11(c) rendering law, distinct
 *   from the S0 severity axis.
 * Public surface: BridgeReadinessId, BRIDGE_READINESS_IDS, readinessSeverity,
 *   readinessTier, needsWrappingShell, BridgeReadinessBinding,
 *   MExtensionReadinessSnapshot, EMPTY_READINESS_SNAPSHOT, classifyReadiness.
 * Does NOT own: the readiness transport (gatewayClient 'readiness' event), the
 *   S0 taxonomy law itself, the profile clock (state/useProfileTick), the
 *   integrated 1-2-3 field gate (engine/integratedReadiness — a single-id
 *   consumer that pins `profile_missing_field`).
 */

/**
 * The nine-state bridge-readiness taxonomy — mirrors
 * `@epi-logos/ql-schema` `BridgeReadinessState` exactly and in the same order.
 */
export type BridgeReadinessId =
    | 'bridge_unavailable'
    | 'profile_missing_field'
    | 's2_graph_blocked'
    | 's3_subscription_blocked'
    | 's5_review_blocked'
    | 'authority_payload_missing'
    | 'privacy_blocked'
    | 'degraded_but_readable'
    | 'ready_public_current';

/** LAW: the nine ids in canonical S0 order. */
export const BRIDGE_READINESS_IDS: readonly BridgeReadinessId[] = Object.freeze([
    'bridge_unavailable',
    'profile_missing_field',
    's2_graph_blocked',
    's3_subscription_blocked',
    's5_review_blocked',
    'authority_payload_missing',
    'privacy_blocked',
    'degraded_but_readable',
    'ready_public_current'
]);

export type BridgeReadinessSeverity = 'ok' | 'degraded' | 'blocked';

/**
 * Severity classifier — kept in lockstep with S0 `readinessSeverity`
 * (`readiness.ts`) and Rust `BridgeReadinessState::severity`.
 */
export function readinessSeverity(id: BridgeReadinessId): BridgeReadinessSeverity {
    if (id === 'ready_public_current') {
        return 'ok';
    }
    if (id === 'degraded_but_readable') {
        return 'degraded';
    }
    return 'blocked';
}

/** The 28.11(c) inline visual tier — the border colour a binding renders. */
export type BridgeReadinessTier = 'green' | 'amber' | 'red';

const RED_IDS: ReadonlySet<BridgeReadinessId> = new Set([
    'bridge_unavailable',
    'privacy_blocked'
]);

const GREEN_IDS: ReadonlySet<BridgeReadinessId> = new Set([
    'ready_public_current',
    'degraded_but_readable'
]);

/**
 * The inline border-colour tier per 28.11(c):
 * - green: `ready_public_current` / `degraded_but_readable` (the datum is
 *   readable — degraded reads still render, just annotated).
 * - red: `bridge_unavailable` / `privacy_blocked` (hard refusal — no datum).
 * - amber: the five recoverable dimensional blocks (a named upstream axis is
 *   down but the failure is legible and may clear).
 *
 * Distinct from severity on purpose: `degraded_but_readable` is severity
 * `degraded` yet tier `green`, because the user still sees a real value.
 */
export function readinessTier(id: BridgeReadinessId): BridgeReadinessTier {
    if (GREEN_IDS.has(id)) {
        return 'green';
    }
    if (RED_IDS.has(id)) {
        return 'red';
    }
    return 'amber';
}

/**
 * 28.11(a): the wrapping pending shell survives ONLY for `bridge_unavailable`.
 * Every finer-grained state renders inline at the binding site (15.6).
 */
export function needsWrappingShell(id: BridgeReadinessId): boolean {
    return id === 'bridge_unavailable';
}

/** A single binding's resolved readiness (retarget of the frozen contract). */
export interface BridgeReadinessBinding {
    readonly bindingKey: string;
    readonly readinessId: BridgeReadinessId;
    /** Human-readable blocker reasons carried from the snapshot (never faked). */
    readonly blockers: readonly string[];
    /** The profile tick this readiness was observed at (the 15.6 UI clock). */
    readonly lastTickObserved: number;
}

/** One reported binding within a snapshot. */
export interface ReportedBinding {
    readonly state: BridgeReadinessId;
    readonly reason?: string;
}

/**
 * The per-binding readiness snapshot the gateway `readiness` event resolves to,
 * keyed by binding (`s2.graph.node`, `s5'.review.inbox`, …). A binding absent
 * from the map is honestly `bridge_unavailable` — the bridge has not reported
 * on it, which is never the same as "ready".
 */
export interface MExtensionReadinessSnapshot {
    readonly bindings: Readonly<Record<string, ReportedBinding>>;
    /** The profile tick the snapshot was stamped at; -1 before any tick. */
    readonly lastTick: number;
}

/** The honest empty snapshot: nothing reported, so every binding is unavailable. */
export const EMPTY_READINESS_SNAPSHOT: MExtensionReadinessSnapshot = Object.freeze({
    bindings: Object.freeze({}),
    lastTick: -1
});

/**
 * Resolve a single binding's readiness from the snapshot.
 *
 * - `null` snapshot → `bridge_unavailable` at tick -1 (bridge said nothing).
 * - binding absent from `bindings` → `bridge_unavailable` at the snapshot tick.
 * - binding present → its reported state, carrying `reason` as a lone blocker.
 */
export function classifyReadiness(
    snapshot: MExtensionReadinessSnapshot | null,
    bindingKey: string
): BridgeReadinessBinding {
    if (snapshot === null) {
        return Object.freeze({
            bindingKey,
            readinessId: 'bridge_unavailable' as const,
            blockers: Object.freeze([]) as readonly string[],
            lastTickObserved: -1
        });
    }
    const reported = snapshot.bindings[bindingKey];
    if (reported === undefined) {
        return Object.freeze({
            bindingKey,
            readinessId: 'bridge_unavailable' as const,
            blockers: Object.freeze([]) as readonly string[],
            lastTickObserved: snapshot.lastTick
        });
    }
    return Object.freeze({
        bindingKey,
        readinessId: reported.state,
        blockers: Object.freeze(
            reported.reason !== undefined && reported.reason !== '' ? [reported.reason] : []
        ) as readonly string[],
        lastTickObserved: snapshot.lastTick
    });
}
