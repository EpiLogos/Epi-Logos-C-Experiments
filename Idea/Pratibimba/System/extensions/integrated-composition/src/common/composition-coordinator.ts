import {
    MExtensionReadinessState,
    readinessSeverity
} from '@pratibimba/m-extension-runtime';
import {
    IntegratedContributorRecord,
    IntegratedLayoutClaim,
    IntegratedLayoutSlot,
    IntegratedNamedLayout,
    IntegratedReadinessAggregate,
    LayoutClaimResolution,
    ResolvedLayoutClaim
} from './layout-claim';

const SINGLETON_SLOTS: readonly IntegratedLayoutSlot[] = Object.freeze([
    'center-stage',
    'side-panel',
    'audio-bus',
    'selection-owner',
    'evidence-panel'
]);

function severityRank(state: MExtensionReadinessState): number {
    switch (readinessSeverity(state)) {
        case 'ok':
            return 0;
        case 'degraded':
            return 1;
        case 'blocked':
        default:
            return 2;
    }
}

function namedOwnerFor(
    layout: IntegratedNamedLayout,
    slot: IntegratedLayoutSlot
): IntegratedContributorRecord['extensionId'] | null {
    switch (slot) {
        case 'center-stage':
            return layout.centerStageOwner;
        case 'side-panel':
            return layout.sidePanelOwner;
        case 'audio-bus':
            return layout.audioBusOwner;
        case 'selection-owner':
            return layout.selectionOwner;
        case 'evidence-panel':
            return layout.evidencePanelOwner;
        case 'mini-inspector':
            return null;
    }
}

/**
 * CompositionCoordinator
 *
 * Pure-function arbitrator behind the integrated plugins. Receives every
 * contributor's layout claims plus the named-layout descriptor and resolves
 * each claim into:
 *   - granted              — owner of a singleton slot
 *   - mini-mode            — singleton-slot loser; downgraded to mini-inspector
 *   - inhibited            — extension is suppressed for this layout
 *   - blocked-conflict     — competing equal-priority singleton claims; the
 *                            integrated plugin must surface this as a real
 *                            user-visible conflict rather than silently picking.
 *
 * 07.T1 verification rule "Tests prove only one bridge subscription source
 * fans out to six extensions" is unaffected here — the coordinator is purely
 * about layout, not subscriptions. Bridge availability is checked by the
 * plugin contributions before commands/layouts are even registered.
 */
export class CompositionCoordinator {
    constructor(public readonly layout: IntegratedNamedLayout) {}

    resolveClaims(contributors: readonly IntegratedContributorRecord[]): readonly ResolvedLayoutClaim[] {
        // Flatten all claims with their owning contributor for arbitration.
        const allClaims = contributors.flatMap(contributor =>
            contributor.claims.map(claim => ({ contributor, claim }))
        );

        const resolved: ResolvedLayoutClaim[] = [];

        // Singleton slots: per slot, pick the named-layout owner first; if the
        // named owner has not claimed, fall back to highest priority; equal
        // priorities from non-named claimants block with conflict reason.
        for (const slot of SINGLETON_SLOTS) {
            const slotClaims = allClaims.filter(c => c.claim.slot === slot);
            if (slotClaims.length === 0) {
                continue;
            }
            const namedOwner = namedOwnerFor(this.layout, slot);
            let winner: { contributor: IntegratedContributorRecord; claim: IntegratedLayoutClaim } | null = null;
            let conflictingExtensionId: IntegratedContributorRecord['extensionId'] | null = null;
            let conflictReason: string | null = null;

            if (namedOwner) {
                const namedClaim = slotClaims.find(c => c.claim.extensionId === namedOwner);
                if (namedClaim) {
                    winner = namedClaim;
                }
            }

            if (!winner) {
                const sorted = [...slotClaims].sort(
                    (a, b) => b.claim.priority - a.claim.priority
                );
                winner = sorted[0];
                const runnerUp = sorted[1];
                if (runnerUp && runnerUp.claim.priority === winner.claim.priority) {
                    conflictingExtensionId = runnerUp.claim.extensionId;
                    conflictReason = `singleton slot ${slot} has equal-priority claims from ${winner.claim.extensionId} and ${runnerUp.claim.extensionId}; the integrated plugin must surface this conflict to the user rather than silently pick a winner`;
                }
            }

            for (const candidate of slotClaims) {
                if (candidate === winner && !conflictReason) {
                    resolved.push({
                        claim: candidate.claim,
                        resolution: 'granted',
                        grantedMiniMode: null,
                        conflictingExtensionId: null,
                        conflictReason: null
                    });
                } else if (candidate === winner && conflictReason) {
                    resolved.push({
                        claim: candidate.claim,
                        resolution: 'blocked-conflict',
                        grantedMiniMode: null,
                        conflictingExtensionId,
                        conflictReason
                    });
                } else {
                    // Loser of a singleton slot — downgrade if it can host a
                    // mini-mode AND the layout names it as a mini-inspector
                    // owner; otherwise inhibit.
                    const fallback = candidate.claim.miniModeFallback;
                    const canMini =
                        fallback &&
                        this.layout.miniInspectorOwners.includes(candidate.claim.extensionId);
                    const resolution: LayoutClaimResolution = canMini
                        ? 'mini-mode'
                        : 'inhibited';
                    resolved.push({
                        claim: candidate.claim,
                        resolution,
                        grantedMiniMode: canMini ? fallback : null,
                        conflictingExtensionId: winner.claim.extensionId,
                        conflictReason: `${slot} owned by ${winner.claim.extensionId} per ${this.layout.id}; ${candidate.claim.extensionId} routed to ${resolution}`
                    });
                }
            }
        }

        // Mini-inspector mounts are multi-slot — every claim is granted as long
        // as the layout names that extension as a mini-inspector owner.
        for (const { claim } of allClaims) {
            if (claim.slot !== 'mini-inspector') {
                continue;
            }
            const allowed = this.layout.miniInspectorOwners.includes(claim.extensionId);
            resolved.push({
                claim,
                resolution: allowed ? 'granted' : 'inhibited',
                grantedMiniMode: allowed ? claim.miniModeFallback : null,
                conflictingExtensionId: null,
                conflictReason: allowed
                    ? null
                    : `${claim.extensionId} is not declared as a mini-inspector owner in ${this.layout.id}`
            });
        }

        return resolved;
    }

    aggregateReadiness(
        contributors: readonly IntegratedContributorRecord[]
    ): IntegratedReadinessAggregate {
        const contributorReadinesses = contributors.map(c => ({
            extensionId: c.extensionId,
            state: c.readiness.state,
            reason: c.readiness.reason
        }));
        const blockingContributorIds = contributors
            .filter(c => readinessSeverity(c.readiness.state) === 'blocked')
            .map(c => c.extensionId);
        let overall: MExtensionReadinessState = 'ready_public_current';
        let overallRank = severityRank(overall);
        for (const cr of contributorReadinesses) {
            const rank = severityRank(cr.state);
            if (rank > overallRank) {
                overallRank = rank;
                overall = cr.state;
            }
        }
        return Object.freeze({
            overall,
            contributorReadinesses: Object.freeze(contributorReadinesses),
            blockingContributorIds: Object.freeze(blockingContributorIds)
        });
    }

    /** Resolve the M4 protected-local privacy rule baked into 08.T0. */
    enforceProtectedLocalBoundary(
        contributors: readonly IntegratedContributorRecord[]
    ): readonly string[] {
        const violations: string[] = [];
        if (this.layout.id !== 'jiva-siva.integrated') {
            return violations;
        }
        for (const c of contributors) {
            if (c.extensionId !== 'm4-nara') {
                continue;
            }
            const exposesBody = c.contribution.compactViews.some(view =>
                view.requiredSelectors.some(
                    sel => sel.includes('body') || sel.includes('raw') || sel.includes('plaintext')
                )
            );
            if (exposesBody) {
                violations.push(
                    'm4-nara compact view declares a raw-body selector; protected-local data must not enter the integrated 4/5/0 composition (08.T0 sharedRules).'
                );
            }
        }
        return violations;
    }
}
