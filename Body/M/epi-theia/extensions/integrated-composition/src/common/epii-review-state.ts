import {
    enforcePiReviewRoutingGate,
    type PiReviewRoutingGateResult
} from './recursive-self-review-gate';

/**
 * 08.T6 deliverable 2 — typed surface state for the 4/5/0 Epii review pane.
 *
 * Pane is summonable, not always-on. Default mode is `closed`; the user
 * transitions to `open` via the openEvidencePanel command or when a
 * notification (e.g. review-inbox count change) requests attention.
 */
export type EpiiReviewPanelMode = 'closed' | 'open' | 'notify-pending';

export interface EpiiReviewSurfaceState {
    readonly mode: EpiiReviewPanelMode;
    readonly reviewInboxCount: number;
    readonly activeCandidateRoute: string | null;
    readonly humanRequiredGateState:
        | 'idle'
        | 'awaiting-human'
        | 'human-approved'
        | 'human-rejected';
    readonly dryRunPromotionReadiness:
        | 'unavailable'
        | 'compile-only'
        | 'dry-run-ready'
        | 'awaiting-compiler-mutation-law';
    readonly continuityHint: string | null;
    readonly lastUpdatedAt: number;
}

export const CLOSED_EPII_REVIEW_STATE: EpiiReviewSurfaceState = Object.freeze({
    mode: 'closed',
    reviewInboxCount: 0,
    activeCandidateRoute: null,
    humanRequiredGateState: 'idle',
    // Track 04 has not landed canon-promotion non-dry-run discipline yet
    // (DSD-03); the default is the truthful value for that situation.
    dryRunPromotionReadiness: 'awaiting-compiler-mutation-law',
    continuityHint: null,
    lastUpdatedAt: 0
});

export function withReviewInboxCount(
    state: EpiiReviewSurfaceState,
    count: number,
    now: number
): EpiiReviewSurfaceState {
    if (state.reviewInboxCount === count) {
        return state;
    }
    return Object.freeze({
        ...state,
        reviewInboxCount: count,
        mode: count > state.reviewInboxCount ? 'notify-pending' : state.mode,
        lastUpdatedAt: now
    });
}

export function withPanelMode(
    state: EpiiReviewSurfaceState,
    mode: EpiiReviewPanelMode,
    now: number
): EpiiReviewSurfaceState {
    if (state.mode === mode) {
        return state;
    }
    return Object.freeze({
        ...state,
        mode,
        lastUpdatedAt: now
    });
}

export interface IdentityAugmentReviewProposal {
    readonly proposalId: string;
    readonly actor: string;
    readonly recursiveSelfReview: boolean;
    readonly humanRequired: boolean;
    readonly actorIsHuman: boolean;
}

export interface RoutedIdentityAugmentReviewProposal {
    readonly gate: PiReviewRoutingGateResult;
    readonly gatedVerdict: 'applied' | 'awaiting-human-final-validation';
    readonly state: EpiiReviewSurfaceState;
}

export function routeIdentityAugmentProposalThroughM5ReviewGate(
    state: EpiiReviewSurfaceState,
    proposal: IdentityAugmentReviewProposal,
    now: number
): RoutedIdentityAugmentReviewProposal {
    const gate = enforcePiReviewRoutingGate({
        decision: 'applied',
        humanRequired: proposal.humanRequired,
        actorIsHuman: proposal.actorIsHuman,
        recursiveSelfReview: proposal.recursiveSelfReview,
        actor: proposal.actor
    });
    const gatedVerdict = gate.ok ? 'applied' : 'awaiting-human-final-validation';
    return Object.freeze({
        gate,
        gatedVerdict,
        state: Object.freeze({
            ...state,
            mode: gate.ok ? 'open' : 'notify-pending',
            reviewInboxCount: state.reviewInboxCount + 1,
            activeCandidateRoute: `identity-augment:${proposal.proposalId}`,
            humanRequiredGateState: gate.ok ? 'human-approved' : 'awaiting-human',
            lastUpdatedAt: now
        })
    });
}
