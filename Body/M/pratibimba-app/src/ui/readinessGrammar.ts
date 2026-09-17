/**
 * Coordinate: M' shell (per-readiness-state UX grammar — Track 32.T32.5,
 *   closes DR-WC-OB-1)
 * Residency: Body/M/pratibimba-app/src/ui
 * Position (#n): #4 — the render-time context frame over the nine-id taxonomy
 * Actualises: the UX grammar that says what each readiness state RENDERS, and
 *   the five UX-derived flavours layered over it.
 *
 *   DR-WC-OB-1 RESOLVED, and this module is the shape of that resolution:
 *   contract authority stays exactly the nine ids in `bridgeReadiness.ts`, and
 *   flavours are render-time variants OF a parent contract state — never a
 *   parallel taxonomy. Every flavour therefore declares its `parentState`, and
 *   the validator refuses one that names a state outside the nine.
 *
 *   The grammar does NOT re-declare what the carrier already decided. `shell`,
 *   `tier`, `severity` and `recovery` are COMPUTED from the landed 28.11 laws
 *   (`needsWrappingShell` / `readinessTier` / `readinessSeverity` /
 *   `readinessRecovery`) rather than restated, so the contract cannot drift
 *   from the code that renders it. What this module genuinely adds is the
 *   per-state COPY and the flavour layer.
 *
 *   One deliberate divergence from the design-recon prose, recorded rather than
 *   silently taken: that table calls `s2_graph_blocked` and
 *   `s3_subscription_blocked` "overlay". 28.11(a) — later, landed, and carrier
 *   law — says the wrapping shell survives ONLY for `bridge_unavailable` and
 *   every finer-grained state renders inline at the datum (15.6). The landed
 *   law wins; the prose described the frozen Theia shape.
 * Public surface: MExtensionReadinessFlavour, READINESS_FLAVOURS,
 *   ReadinessFlavourEntry, READINESS_FLAVOUR_ENTRIES, ReadinessGrammarEntry,
 *   READINESS_GRAMMAR, grammarFor, flavourEntry, ReadinessFlavourContext,
 *   flavourOf.
 * Does NOT own: the nine-id taxonomy, severity/tier/recovery law
 *   (bridgeReadiness.ts), the privacy spelling (panes/omni/PrivacyClassBadge
 *   `privacyClassKind`), or the readiness transport (state/readinessStore).
 * Contract: contracts/readiness-state-grammar.{md,json} + rerun tranche
 *   [[32.T32.5]].
 */

import { privacyClassKind } from '../panes/omni/PrivacyClassBadge';
import {
    BRIDGE_READINESS_IDS,
    needsWrappingShell,
    readinessRecovery,
    readinessSeverity,
    readinessTier,
    type BridgeReadinessId,
    type BridgeReadinessSeverity,
    type BridgeReadinessTier,
    type MExtensionReadinessSnapshot,
    type ReadinessRecovery
} from './bridgeReadiness';

/**
 * The five UX-derived flavours. Each is a render variant of exactly one
 * contract state — adding a sixth means adding its parent row below, which is
 * what keeps this from becoming a second taxonomy.
 */
export type MExtensionReadinessFlavour =
    | 'pending_first_tick'
    | 's3_gateway_unreachable'
    | 's5_atelier_blocked'
    | 'pending_dataset'
    | 'ready_protected_local';

export const READINESS_FLAVOURS: readonly MExtensionReadinessFlavour[] = Object.freeze([
    'pending_first_tick',
    's3_gateway_unreachable',
    's5_atelier_blocked',
    'pending_dataset',
    'ready_protected_local'
]);

/** How a flavour changes the render of its parent state. */
export type ReadinessFlavourRender = 'shimmer' | 'alias' | 'chip' | 'tint';

export interface ReadinessFlavourEntry {
    readonly flavour: MExtensionReadinessFlavour;
    /** LAW: always one of the nine. A flavour is never free-standing. */
    readonly parentState: BridgeReadinessId;
    readonly copy: string;
    readonly render: ReadinessFlavourRender;
}

export const READINESS_FLAVOUR_ENTRIES: readonly ReadinessFlavourEntry[] = Object.freeze([
    Object.freeze({
        flavour: 'pending_first_tick' as const,
        parentState: 'bridge_unavailable' as const,
        copy: 'Awaiting first profile-tick…',
        render: 'shimmer' as const
    }),
    Object.freeze({
        flavour: 's3_gateway_unreachable' as const,
        parentState: 's3_subscription_blocked' as const,
        copy: 'S3 gateway unreachable.',
        render: 'alias' as const
    }),
    Object.freeze({
        flavour: 's5_atelier_blocked' as const,
        parentState: 's5_review_blocked' as const,
        copy: 'Atelier review pending.',
        render: 'alias' as const
    }),
    Object.freeze({
        flavour: 'pending_dataset' as const,
        parentState: 'authority_payload_missing' as const,
        copy: 'Awaiting a named dataset.',
        render: 'chip' as const
    }),
    Object.freeze({
        flavour: 'ready_protected_local' as const,
        parentState: 'ready_public_current' as const,
        copy: 'Ready — protected-local.',
        render: 'tint' as const
    })
]);

/**
 * The per-state copy. This is the grammar's OWN contribution — everything else
 * on a row is computed from the landed readiness laws.
 */
const STATE_COPY: Readonly<Record<BridgeReadinessId, string>> = Object.freeze({
    bridge_unavailable: 'Bridge unavailable — no derived state is rendered.',
    profile_missing_field: 'Awaiting a profile field.',
    s2_graph_blocked: 'S2 graph unreachable.',
    s3_subscription_blocked: 'S3 gateway down.',
    s5_review_blocked: 'Atelier review pending.',
    authority_payload_missing: 'Authoritative payload missing — its owner is named.',
    privacy_blocked: 'protected_local — consent required.',
    degraded_but_readable: 'Readable, but degraded — writes stay blocked.',
    ready_public_current: 'Ready.'
});

export interface ReadinessGrammarEntry {
    readonly state: BridgeReadinessId;
    /** 28.11(a): only `bridge_unavailable` keeps the wrapping shell. */
    readonly shell: 'wrapping' | 'inline';
    readonly tier: BridgeReadinessTier;
    readonly severity: BridgeReadinessSeverity;
    readonly copy: string;
    readonly recovery: ReadinessRecovery;
    readonly flavours: readonly MExtensionReadinessFlavour[];
}

/** LAW: one row per contract state, in canonical S0 order. */
export const READINESS_GRAMMAR: readonly ReadinessGrammarEntry[] = Object.freeze(
    BRIDGE_READINESS_IDS.map(state =>
        Object.freeze({
            state,
            shell: needsWrappingShell(state) ? ('wrapping' as const) : ('inline' as const),
            tier: readinessTier(state),
            severity: readinessSeverity(state),
            copy: STATE_COPY[state],
            recovery: readinessRecovery(state),
            flavours: Object.freeze(
                READINESS_FLAVOUR_ENTRIES.filter(entry => entry.parentState === state).map(
                    entry => entry.flavour
                )
            ) as readonly MExtensionReadinessFlavour[]
        })
    )
);

const GRAMMAR_BY_STATE: Readonly<Record<BridgeReadinessId, ReadinessGrammarEntry>> = Object.freeze(
    Object.fromEntries(READINESS_GRAMMAR.map(entry => [entry.state, entry])) as Record<
        BridgeReadinessId,
        ReadinessGrammarEntry
    >
);

export function grammarFor(state: BridgeReadinessId): ReadinessGrammarEntry {
    return GRAMMAR_BY_STATE[state];
}

const FLAVOUR_BY_ID: Readonly<Record<MExtensionReadinessFlavour, ReadinessFlavourEntry>> =
    Object.freeze(
        Object.fromEntries(READINESS_FLAVOUR_ENTRIES.map(entry => [entry.flavour, entry])) as Record<
            MExtensionReadinessFlavour,
            ReadinessFlavourEntry
        >
    );

/**
 * A flavour's row — the sibling of `grammarFor`, and the reason the flavour
 * COPY is reachable at all.
 *
 * Until 32.T32.9 the per-state copy had a render consumer (`emptyStateRegistry`
 * reads `grammarFor(state).copy`) and the per-flavour copy had none: every
 * renderer took the flavour as a CSS class and a `data-flavour`, so five
 * authored strings — 'Awaiting first profile-tick…' among them — were declared,
 * structurally tested, and never shown to anyone. The status entry's pre-tick
 * reading is the first surface to say one out loud, and it says it from HERE
 * rather than re-typing it, so the grammar stays the authority on the words.
 */
export function flavourEntry(flavour: MExtensionReadinessFlavour): ReadinessFlavourEntry {
    return FLAVOUR_BY_ID[flavour];
}

/**
 * What a flavour needs that the contract state alone cannot say.
 *
 * The design-recon signature is `flavourOf(state, snapshot)`. The snapshot
 * genuinely cannot answer two of the five: it cannot tell "bridge down" from
 * "bridge up, no tick yet" (both read as an absent binding at tick -1), and it
 * carries no privacy class. Rather than infer either — which would assert a
 * render the shell never established — the caller supplies them, and a flavour
 * that has no context to stand on simply does not fire.
 */
export interface ReadinessFlavourContext {
    /** The gateway socket is up. Separates `bridge_unavailable` from
     *  `pending_first_tick`, which the snapshot alone cannot. */
    readonly bridgeConnected?: boolean;
    /** This binding's blocker reasons; a named payload owner is what makes
     *  `authority_payload_missing` a `pending_dataset` rather than a bare block. */
    readonly blockers?: readonly string[];
    /** The surface's privacy class (25.18 border-tint). */
    readonly privacyClass?: string | null;
}

/**
 * The flavour for a contract state in context, or null when the state renders
 * plainly. Null is a real answer: most states have no flavour, and inventing
 * one would render a variant the substrate never reported.
 */
export function flavourOf(
    state: BridgeReadinessId,
    snapshot: MExtensionReadinessSnapshot | null,
    context: ReadinessFlavourContext = {}
): MExtensionReadinessFlavour | null {
    switch (state) {
        // Pure render aliases: the state itself is the whole condition.
        case 's3_subscription_blocked':
            return 's3_gateway_unreachable';
        case 's5_review_blocked':
            return 's5_atelier_blocked';
        case 'bridge_unavailable':
            // Bridge UP and no profile tick yet — the honest "starting" read.
            // Without a connected bridge this is a real outage, not a wait.
            return context.bridgeConnected === true && (snapshot?.lastTick ?? -1) < 0
                ? 'pending_first_tick'
                : null;
        case 'authority_payload_missing':
            // The taxonomy requires this state to name its missing owner; when
            // it does, the chip carries that name. No name, no chip.
            return (context.blockers ?? []).some(blocker => blocker.trim().length > 0)
                ? 'pending_dataset'
                : null;
        case 'ready_public_current':
            return context.privacyClass && privacyClassKind(context.privacyClass) === 'protected'
                ? 'ready_protected_local'
                : null;
        default:
            return null;
    }
}
