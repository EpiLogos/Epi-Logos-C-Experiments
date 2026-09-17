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
 *   MExtensionReadinessSnapshot, EMPTY_READINESS_SNAPSHOT, classifyReadiness,
 *   ReadinessTaxonomyEntry, READINESS_TAXONOMY, readinessOwnerTrack,
 *   readinessMeaning, ReadinessRecovery, readinessRecovery.
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

/**
 * A taxonomy row: the id, its two classification axes, the track that owns the
 * axis, and what the id actually means.
 *
 * `ownerTrack` and `meaning` are MIRRORED verbatim (never imported — M→the
 * frozen epi-theia tree is a forbidden edge) from the declared canon
 * `contracts/07-t0-extension-contract-preflight.json#readinessTaxonomy`,
 * continuing the same mirror the nine ids themselves already are.
 *
 * `severity` and `tier` are COMPUTED from the functions above rather than
 * re-declared, so the carrier keeps exactly one severity law. Note the
 * authority JSON spells `ready_public_current` severity `ready` where the S0
 * axis this file mirrors spells it `ok`; the S0 spelling wins here because
 * `readinessSeverity` is locked to Rust `BridgeReadinessState::severity`.
 */
export interface ReadinessTaxonomyEntry {
    readonly id: BridgeReadinessId;
    readonly severity: BridgeReadinessSeverity;
    readonly tier: BridgeReadinessTier;
    /** The cycle-3 track that owns the axis this id reports on. */
    readonly ownerTrack: string;
    readonly meaning: string;
}

/** ownerTrack + meaning, mirrored from the 07-t0 authority in canonical order. */
const TAXONOMY_PROSE: Readonly<Record<BridgeReadinessId, { ownerTrack: string; meaning: string }>> =
    Object.freeze({
        bridge_unavailable: {
            ownerTrack: '01',
            meaning:
                'The shared bridge instance is absent, disconnected, or unreadable; extensions render no derived state.'
        },
        profile_missing_field: {
            ownerTrack: '01',
            meaning:
                'The current MathemeHarmonicProfile lacks a field the extension needs and must name the missing field explicitly.'
        },
        s2_graph_blocked: {
            ownerTrack: '02',
            meaning:
                'Coordinate-native graph law, provenance, or graph-service readiness is missing for the requested surface.'
        },
        s3_subscription_blocked: {
            ownerTrack: '03',
            meaning:
                'The shared stream/session/DAY-NOW path cannot provide ordered live state to the extension.'
        },
        s5_review_blocked: {
            ownerTrack: '04',
            meaning:
                'Review/evidence/governance state is not available for deep action or deposit surfaces.'
        },
        authority_payload_missing: {
            ownerTrack: '02',
            meaning:
                'The authoritative graph/profile/review payload for this display is not available, so the extension must show exactly which owner is missing instead of inferring defaults.'
        },
        privacy_blocked: {
            ownerTrack: '03/04',
            meaning: 'Protected-local or consent-gated data cannot cross into the current surface.'
        },
        degraded_but_readable: {
            ownerTrack: '01/02/03/04',
            meaning:
                'A read-only or lower-fidelity view is safe to show, but write/deposit/deep interaction remains blocked.'
        },
        ready_public_current: {
            ownerTrack: '01/02/03/04',
            meaning:
                'The surface has all current public-safe data and capabilities needed for its first slice.'
        }
    });

/** LAW: the nine rows, in canonical S0 order, each fully classified. */
export const READINESS_TAXONOMY: readonly ReadinessTaxonomyEntry[] = Object.freeze(
    BRIDGE_READINESS_IDS.map(id =>
        Object.freeze({
            id,
            severity: readinessSeverity(id),
            tier: readinessTier(id),
            ownerTrack: TAXONOMY_PROSE[id].ownerTrack,
            meaning: TAXONOMY_PROSE[id].meaning
        })
    )
);

/** The track that owns the axis this id reports on — the thing a reader needs
 *  in order to know who to chase, which is the whole point of surfacing it. */
export function readinessOwnerTrack(id: BridgeReadinessId): string {
    return TAXONOMY_PROSE[id].ownerTrack;
}

/** What the id means, in the authority's own words. */
export function readinessMeaning(id: BridgeReadinessId): string {
    return TAXONOMY_PROSE[id].meaning;
}

/**
 * The recovery a blocked surface can honestly offer.
 *
 * `commandId` is a REAL id from `commands/catalog.ts` or it is null — a button
 * that routes nowhere is worse than no button, so a null renders none. Three
 * ids deliberately carry no action: `ready_public_current` and
 * `degraded_but_readable` have nothing to recover (the datum renders), and
 * `privacy_blocked` must not become one-click consent — crossing a privacy
 * boundary is a governed act, not a call-to-action.
 *
 * `bridge_unavailable` routes to Diagnostics rather than a "Reconnect" button
 * because the carrier reconnects on its own (`gatewayClient` exponential
 * backoff); Diagnostics is where the WS state and readiness ledger actually are.
 */
export interface ReadinessRecovery {
    readonly label: string;
    readonly commandId: string | null;
}

const RECOVERY: Readonly<Record<BridgeReadinessId, ReadinessRecovery>> = Object.freeze({
    bridge_unavailable: Object.freeze({
        label: 'Open Diagnostics',
        commandId: 'omnipanel.tab.activate.7'
    }),
    profile_missing_field: Object.freeze({
        label: 'Open Diagnostics',
        commandId: 'omnipanel.tab.activate.7'
    }),
    s2_graph_blocked: Object.freeze({
        label: 'Open Diagnostics',
        commandId: 'omnipanel.tab.activate.7'
    }),
    s3_subscription_blocked: Object.freeze({
        label: 'Open Gateway',
        commandId: 'omnipanel.tab.activate.6'
    }),
    s5_review_blocked: Object.freeze({
        label: 'Open Review tab',
        commandId: 'omnipanel.openReview'
    }),
    authority_payload_missing: Object.freeze({
        label: 'Open Evidence tab',
        commandId: 'omnipanel.tab.activate.4'
    }),
    privacy_blocked: Object.freeze({ label: 'Protected — consent required', commandId: null }),
    degraded_but_readable: Object.freeze({ label: 'Readable, write blocked', commandId: null }),
    ready_public_current: Object.freeze({ label: 'Ready', commandId: null })
});

export function readinessRecovery(id: BridgeReadinessId): ReadinessRecovery {
    return RECOVERY[id];
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
