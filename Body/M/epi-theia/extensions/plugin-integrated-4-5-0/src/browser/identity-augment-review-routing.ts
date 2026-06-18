import {
    routeIdentityAugmentProposalThroughM5ReviewGate,
    type EpiiReviewSurfaceState,
    type IdentityAugmentReviewProposal,
    type RoutedIdentityAugmentReviewProposal
} from '@pratibimba/integrated-composition/epii-review-state';

export function routePluginIdentityAugmentProposalThroughM5Gate(
    state: EpiiReviewSurfaceState,
    proposal: IdentityAugmentReviewProposal,
    now: number
): RoutedIdentityAugmentReviewProposal {
    return routeIdentityAugmentProposalThroughM5ReviewGate(
        state,
        {
            ...proposal,
            humanRequired:
                proposal.humanRequired ||
                (proposal.recursiveSelfReview && !proposal.actorIsHuman)
        },
        now
    );
}
