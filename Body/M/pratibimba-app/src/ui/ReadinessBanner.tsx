/**
 * Coordinate: M' shell (readiness banner — Track 27.T27.2 continuity fold)
 * Residency: Body/M/pratibimba-app/src/ui
 * Actualises: the honest degrade banner a detail strip renders when its named
 *   producer has no datum yet. Composes the DR-UI-3 <ProvenanceBadge> (pending)
 *   and borrows the 28.11(c) visual-tier grammar from `bridgeReadiness.ts`:
 *   a canonical nine-state id renders at its real tier; a named-producer
 *   pending state (`pending-kairos`, `pending-tarot-psyche`) renders amber
 *   with the producer named in `reason`. Absence is pending, never faked.
 *
 *   32.T32.7 extends it with the two affordances spec :211-213 asks for: an
 *   `onRetry` callback that renders a "Retry" button, and the recovery route
 *   ("Open Diagnostics" for the bridge/profile/graph blocks). The recovery is
 *   DERIVED from `readinessRecovery` — the 28.11 law — not chosen here, so a
 *   state whose honest recovery is null (`privacy_blocked`,
 *   `degraded_but_readable`, `ready_public_current`) renders no button, and a
 *   named-producer pending state that is not one of the nine renders none
 *   either: the taxonomy has no route for a producer it does not know.
 * Public surface: ReadinessBanner.
 * Does NOT own: the nine-state taxonomy (bridgeReadiness.ts), the provenance
 *   taxonomy (ProvenanceBadge), the deep-link route (ui/errorUxGrammar reads it
 *   from the taxonomy), any producer.
 */

import { commands } from '../commands/registry';
import { ProvenanceBadge } from './ProvenanceBadge';
import {
    BRIDGE_READINESS_IDS,
    readinessRecovery,
    readinessTier,
    type BridgeReadinessId,
    type BridgeReadinessTier
} from './bridgeReadiness';

/** A named-producer pending state that is NOT part of the S0 nine-state axis —
 *  the kairos snapshot and the tarot/psyche anchor are separate producers whose
 *  absence is legitimately "pending", not a bridge-readiness failure. */
export type ReadinessBannerState = BridgeReadinessId | 'pending-kairos' | 'pending-tarot-psyche';

function isCanonical(state: ReadinessBannerState): state is BridgeReadinessId {
    return (BRIDGE_READINESS_IDS as readonly string[]).includes(state);
}

function tierOf(state: ReadinessBannerState): BridgeReadinessTier {
    return isCanonical(state) ? readinessTier(state) : 'amber';
}

export function ReadinessBanner({
    state,
    reason,
    testId = 'readiness-banner',
    onRetry,
    recovery = true
}: {
    readonly state: ReadinessBannerState;
    readonly reason: string;
    readonly testId?: string;
    /** 32.7 spec :212 — present ⇒ a "Retry" button that fires it. */
    readonly onRetry?: () => void;
    /** 32.7 spec :213 — the taxonomy's own recovery route. Opt out only where
     *  the banner already sits inside the surface the route would open. */
    readonly recovery?: boolean;
}) {
    const tier = tierOf(state);
    const route = recovery && isCanonical(state) ? readinessRecovery(state) : null;
    const commandId = route?.commandId ?? null;
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
            {onRetry ? (
                <button
                    type="button"
                    className="readiness-banner-retry"
                    data-testid={`${testId}-retry`}
                    onClick={onRetry}
                >
                    Retry
                </button>
            ) : null}
            {route && commandId ? (
                <button
                    type="button"
                    className="readiness-banner-recovery"
                    data-testid={`${testId}-recovery`}
                    data-command={commandId}
                    onClick={() => void commands.execute(commandId)}
                >
                    {route.label}
                </button>
            ) : null}
        </div>
    );
}
