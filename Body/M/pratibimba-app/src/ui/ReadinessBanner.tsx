/**
 * Coordinate: M' shell (readiness banner — Track 27.T27.2 continuity fold)
 * Residency: Body/M/pratibimba-app/src/ui
 * Actualises: the honest degrade banner a detail strip renders when its named
 *   producer has no datum yet. Composes the DR-UI-3 <ProvenanceBadge> (pending)
 *   and borrows the 28.11(c) visual-tier grammar from `bridgeReadiness.ts`:
 *   a canonical nine-state id renders at its real tier; a named-producer
 *   pending state (`pending-kairos`, `pending-tarot-psyche`) renders amber
 *   with the producer named in `reason`. Absence is pending, never faked.
 * Public surface: ReadinessBanner.
 * Does NOT own: the nine-state taxonomy (bridgeReadiness.ts), the provenance
 *   taxonomy (ProvenanceBadge), any producer.
 */

import { ProvenanceBadge } from './ProvenanceBadge';
import {
    BRIDGE_READINESS_IDS,
    readinessTier,
    type BridgeReadinessId,
    type BridgeReadinessTier
} from './bridgeReadiness';

/** A named-producer pending state that is NOT part of the S0 nine-state axis —
 *  the kairos snapshot and the tarot/psyche anchor are separate producers whose
 *  absence is legitimately "pending", not a bridge-readiness failure. */
export type ReadinessBannerState = BridgeReadinessId | 'pending-kairos' | 'pending-tarot-psyche';

function tierOf(state: ReadinessBannerState): BridgeReadinessTier {
    return (BRIDGE_READINESS_IDS as readonly string[]).includes(state)
        ? readinessTier(state as BridgeReadinessId)
        : 'amber';
}

export function ReadinessBanner({
    state,
    reason,
    testId = 'readiness-banner'
}: {
    readonly state: ReadinessBannerState;
    readonly reason: string;
    readonly testId?: string;
}) {
    const tier = tierOf(state);
    return (
        <div
            className={`readiness-banner readiness-banner-tier-${tier}`}
            data-testid={testId}
            data-state={state}
            data-tier={tier}
            role="status"
        >
            <ProvenanceBadge state="pending" reason={reason} />
            <span className="readiness-banner-reason">{reason}</span>
        </div>
    );
}
