import { MExtensionId, MExtensionReadinessState } from '@pratibimba/m-extension-runtime';
import { IntegratedReadinessAggregate, IntegratedNamedLayout } from './layout-claim';

/**
 * The degraded empty-state contract: 08.T1 verification step 3 demands that
 * empty states "show missing upstream contributions/readiness without fake
 * demo components" and "include upstream owner and blocker".
 *
 * This is a typed model the React empty-state component renders against;
 * it is intentionally not a React component so tests can assert structure
 * without a JSX runtime.
 */
export interface IntegratedEmptyStateReason {
    readonly contributorId: MExtensionId;
    readonly readinessState: MExtensionReadinessState;
    readonly ownerTrack: string;
    readonly blockerId: string;
    readonly humanReason: string;
}

export interface IntegratedEmptyStateView {
    readonly pluginId: IntegratedNamedLayout['pluginId'];
    readonly layoutId: IntegratedNamedLayout['id'];
    readonly overall: MExtensionReadinessState;
    readonly reasons: readonly IntegratedEmptyStateReason[];
    /** non-empty when at least one contributor has no contribution wired in yet */
    readonly missingContributors: readonly MExtensionId[];
}

const TRACK_BY_READINESS: Record<MExtensionReadinessState, string> = {
    bridge_unavailable: 'Track 01 kernel-bridge',
    profile_missing_field: 'Track 01 profile',
    s2_graph_blocked: 'Track 02 S2 graph',
    s3_subscription_blocked: 'Track 03 S3 gateway',
    s5_review_blocked: 'Track 04 S5 review',
    authority_payload_missing: 'Track 02 / 04 authority owner',
    privacy_blocked: 'Track 04 consent',
    degraded_but_readable: 'Track 02 / 04 degraded',
    ready_public_current: 'ready'
};

export function buildEmptyState(
    layout: IntegratedNamedLayout,
    aggregate: IntegratedReadinessAggregate,
    requiredContributors: readonly MExtensionId[],
    actualContributorIds: readonly MExtensionId[]
): IntegratedEmptyStateView {
    const missingContributors = requiredContributors.filter(
        id => !actualContributorIds.includes(id)
    );
    const reasons: IntegratedEmptyStateReason[] = aggregate.contributorReadinesses
        .filter(cr => cr.state !== 'ready_public_current')
        .map(cr => ({
            contributorId: cr.extensionId,
            readinessState: cr.state,
            ownerTrack: TRACK_BY_READINESS[cr.state] ?? 'unknown owner',
            blockerId: cr.state,
            humanReason: cr.reason
        }));
    for (const missing of missingContributors) {
        reasons.push({
            contributorId: missing,
            readinessState: 'authority_payload_missing',
            ownerTrack: 'Track 07 individual M-extension',
            blockerId: 'track-07.contribution-missing',
            humanReason: `Contribution for ${missing} not registered with ${layout.pluginId}.`
        });
    }
    return Object.freeze({
        pluginId: layout.pluginId,
        layoutId: layout.id,
        overall: aggregate.overall,
        reasons: Object.freeze(reasons),
        missingContributors: Object.freeze(missingContributors)
    });
}
