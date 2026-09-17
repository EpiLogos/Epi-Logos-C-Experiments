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

export type MExtensionReadinessFlavour =
    | 'pending_first_tick'
    | 's3_gateway_unreachable'
    | 's5_atelier_blocked'
    | 'pending_dataset'
    | 'ready_protected_local';

export interface MExtensionReadinessSnapshot {
    readonly fetchedAt: number;
    readonly state: MExtensionReadinessState;
    readonly reason: string;
    readonly profileGeneration: number | null;
    readonly bridgeReachable: boolean;
    readonly blockerIds: readonly string[];
    readonly missingDataset?: string;
    readonly payloadOwner?: string;
    readonly privacyClass?: 'public' | 'protected_local';
}

export interface MExtensionReadinessUxResponse {
    readonly presentation: 'overlay' | 'inline_badge' | 'inline_shimmer' | 'inline_degraded' | 'normal_render';
    readonly label: string;
    readonly detail: string;
    readonly affordances: readonly string[];
    readonly deepLinks: readonly string[];
}

export interface MExtensionReadinessGrammarEntry {
    readonly state: MExtensionReadinessState;
    readonly cssClass: `mext-banner-state-${MExtensionReadinessState}`;
    readonly uxResponse: MExtensionReadinessUxResponse;
}

export interface MExtensionReadinessFlavourGrammarEntry {
    readonly flavour: MExtensionReadinessFlavour;
    readonly parentState: MExtensionReadinessState;
    readonly cssClass: `mext-banner-flavour-${MExtensionReadinessFlavour}`;
    readonly uxResponse: MExtensionReadinessUxResponse;
}

export const PENDING_M_READINESS: MExtensionReadinessSnapshot = Object.freeze({
    fetchedAt: 0,
    state: 'bridge_unavailable',
    reason: 'No kernel bridge instance has bound a readiness source yet.',
    profileGeneration: null,
    bridgeReachable: false,
    blockerIds: Object.freeze([] as string[]) as readonly string[]
});

export const READINESS_STATE_GRAMMAR: Readonly<Record<MExtensionReadinessState, MExtensionReadinessGrammarEntry>> = Object.freeze({
    bridge_unavailable: Object.freeze({
        state: 'bridge_unavailable',
        cssClass: 'mext-banner-state-bridge_unavailable',
        uxResponse: Object.freeze({
            presentation: 'overlay',
            label: 'Bridge unavailable',
            detail: 'Reconnect through OmniPanel Gateway, then retry the readiness source.',
            affordances: Object.freeze(['reconnect', 'retry']),
            deepLinks: Object.freeze(['omnipanel.gateway'])
        })
    }),
    profile_missing_field: Object.freeze({
        state: 'profile_missing_field',
        cssClass: 'mext-banner-state-profile_missing_field',
        uxResponse: Object.freeze({
            presentation: 'inline_badge',
            label: 'awaiting profile.<field>',
            detail: 'A required profile field has not arrived in the readiness ledger.',
            affordances: Object.freeze(['readiness-ledger']),
            deepLinks: Object.freeze(['readiness.ledger'])
        })
    }),
    s2_graph_blocked: Object.freeze({
        state: 's2_graph_blocked',
        cssClass: 'mext-banner-state-s2_graph_blocked',
        uxResponse: Object.freeze({
            presentation: 'overlay',
            label: 'S2 graph unreachable',
            detail: 'The S2 graph authority is not reachable; inspect diagnostics and Neo4j status.',
            affordances: Object.freeze(['diagnostic']),
            deepLinks: Object.freeze(['diagnostics.neo4j-status'])
        })
    }),
    s3_subscription_blocked: Object.freeze({
        state: 's3_subscription_blocked',
        cssClass: 'mext-banner-state-s3_subscription_blocked',
        uxResponse: Object.freeze({
            presentation: 'overlay',
            label: 'S3 gateway down',
            detail: 'The S3 gateway subscription path is blocked.',
            affordances: Object.freeze(['retry', 'status-link']),
            deepLinks: Object.freeze(['gateway.status'])
        })
    }),
    s5_review_blocked: Object.freeze({
        state: 's5_review_blocked',
        cssClass: 'mext-banner-state-s5_review_blocked',
        uxResponse: Object.freeze({
            presentation: 'inline_badge',
            label: 'atelier review pending',
            detail: 'Review authority has not cleared this surface yet.',
            affordances: Object.freeze(['omnipanel-review']),
            deepLinks: Object.freeze(['omnipanel.review'])
        })
    }),
    authority_payload_missing: Object.freeze({
        state: 'authority_payload_missing',
        cssClass: 'mext-banner-state-authority_payload_missing',
        uxResponse: Object.freeze({
            presentation: 'inline_badge',
            label: 'authority payload pending',
            detail: 'A named owner must publish the payload before this surface can render fully.',
            affordances: Object.freeze(['payload-owner']),
            deepLinks: Object.freeze(['readiness.ledger'])
        })
    }),
    privacy_blocked: Object.freeze({
        state: 'privacy_blocked',
        cssClass: 'mext-banner-state-privacy_blocked',
        uxResponse: Object.freeze({
            presentation: 'inline_shimmer',
            label: 'protected_local - consent required',
            detail: 'Protected local material needs explicit opt-in before crossing the UI boundary.',
            affordances: Object.freeze(['privacy-opt-in']),
            deepLinks: Object.freeze(['privacy.opt-in'])
        })
    }),
    degraded_but_readable: Object.freeze({
        state: 'degraded_but_readable',
        cssClass: 'mext-banner-state-degraded_but_readable',
        uxResponse: Object.freeze({
            presentation: 'inline_degraded',
            label: 'degraded but readable',
            detail: 'The surface can render read-only chrome while an upstream authority catches up.',
            affordances: Object.freeze(['read-only-chrome']),
            deepLinks: Object.freeze(['readiness.ledger'])
        })
    }),
    ready_public_current: Object.freeze({
        state: 'ready_public_current',
        cssClass: 'mext-banner-state-ready_public_current',
        uxResponse: Object.freeze({
            presentation: 'normal_render',
            label: 'ready public current',
            detail: 'The public current payload is ready for normal rendering.',
            affordances: Object.freeze([] as string[]) as readonly string[],
            deepLinks: Object.freeze([] as string[]) as readonly string[]
        })
    })
});

export const READINESS_FLAVOUR_GRAMMAR: Readonly<Record<MExtensionReadinessFlavour, MExtensionReadinessFlavourGrammarEntry>> = Object.freeze({
    pending_first_tick: Object.freeze({
        flavour: 'pending_first_tick',
        parentState: 'bridge_unavailable',
        cssClass: 'mext-banner-flavour-pending_first_tick',
        uxResponse: Object.freeze({
            presentation: 'inline_shimmer',
            label: 'Awaiting first profile-tick...',
            detail: 'The bridge is up, but no profile tick has reached the runtime yet.',
            affordances: Object.freeze(['shimmer']),
            deepLinks: Object.freeze(['omnipanel.gateway'])
        })
    }),
    s3_gateway_unreachable: Object.freeze({
        flavour: 's3_gateway_unreachable',
        parentState: 's3_subscription_blocked',
        cssClass: 'mext-banner-flavour-s3_gateway_unreachable',
        uxResponse: Object.freeze({
            presentation: 'overlay',
            label: 'S3 gateway unreachable',
            detail: 'Render alias for the S3 subscription blocked contract state.',
            affordances: Object.freeze(['retry', 'status-link']),
            deepLinks: Object.freeze(['gateway.status'])
        })
    }),
    s5_atelier_blocked: Object.freeze({
        flavour: 's5_atelier_blocked',
        parentState: 's5_review_blocked',
        cssClass: 'mext-banner-flavour-s5_atelier_blocked',
        uxResponse: Object.freeze({
            presentation: 'inline_badge',
            label: 'S5 atelier blocked',
            detail: 'Render alias for an S5 review block pending atelier action.',
            affordances: Object.freeze(['omnipanel-review']),
            deepLinks: Object.freeze(['omnipanel.review'])
        })
    }),
    pending_dataset: Object.freeze({
        flavour: 'pending_dataset',
        parentState: 'authority_payload_missing',
        cssClass: 'mext-banner-flavour-pending_dataset',
        uxResponse: Object.freeze({
            presentation: 'inline_badge',
            label: 'pending dataset',
            detail: 'A named dataset is still absent from the authority payload.',
            affordances: Object.freeze(['dataset-chip']),
            deepLinks: Object.freeze(['readiness.ledger'])
        })
    }),
    ready_protected_local: Object.freeze({
        flavour: 'ready_protected_local',
        parentState: 'ready_public_current',
        cssClass: 'mext-banner-flavour-ready_protected_local',
        uxResponse: Object.freeze({
            presentation: 'normal_render',
            label: 'ready protected local',
            detail: 'Normal render with protected_local privacy-class marker and border tint.',
            affordances: Object.freeze(['privacy-class-marker']),
            deepLinks: Object.freeze(['privacy.opt-in'])
        })
    })
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

export function readinessGrammarOf(state: MExtensionReadinessState): MExtensionReadinessGrammarEntry {
    return READINESS_STATE_GRAMMAR[state];
}

export function readinessFlavourGrammarOf(flavour: MExtensionReadinessFlavour): MExtensionReadinessFlavourGrammarEntry {
    return READINESS_FLAVOUR_GRAMMAR[flavour];
}

export function flavourOf(
    state: MExtensionReadinessState,
    snapshot: MExtensionReadinessSnapshot
): MExtensionReadinessFlavour | null {
    switch (state) {
        case 'bridge_unavailable':
            return snapshot.bridgeReachable && snapshot.profileGeneration === null ? 'pending_first_tick' : null;
        case 's3_subscription_blocked':
            return 's3_gateway_unreachable';
        case 's5_review_blocked':
            return 's5_atelier_blocked';
        case 'authority_payload_missing':
            return snapshot.missingDataset || snapshot.payloadOwner ? 'pending_dataset' : null;
        case 'ready_public_current':
            return snapshot.privacyClass === 'protected_local' ? 'ready_protected_local' : null;
        default:
            return null;
    }
}
