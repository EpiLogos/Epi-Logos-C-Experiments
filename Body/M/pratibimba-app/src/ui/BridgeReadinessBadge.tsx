/**
 * Coordinate: M' shell (shared bridge-readiness badge — Track 28.T28.11,
 *   folds 15.T15.6 inline provenance)
 * Residency: Body/M/pratibimba-app/src/ui
 * Actualises: the ONE per-binding readiness renderer both bridge-gates consume
 *   (28.11c/e) — border-colour by tier, inline readiness id, blockers at the
 *   datum, blocked overlay for red. Retarget of `<BridgeReadinessBadge>` from
 *   the frozen `m-extension-runtime`. Composes the shared primitives
 *   (ReadinessIndicator / PendingBadge / BlockedOverlay), never a local fork.
 *   28.11(a): the wrapping pending shell survives ONLY for `bridge_unavailable`.
 * Public surface: BridgeReadinessBadge (live), BridgeReadinessBadgeView (pure).
 * Does NOT own: the taxonomy (bridgeReadiness), the resolution (useBridgeReadiness),
 *   the low-level primitives (primitives.tsx).
 */

import type { ReactNode } from 'react';
import { BlockedOverlay, PendingBadge, ReadinessIndicator } from './primitives';
import {
    needsWrappingShell,
    readinessSeverity,
    readinessTier,
    type BridgeReadinessBinding
} from './bridgeReadiness';
import { useBridgeReadiness } from './useBridgeReadiness';

/** Amber/red tiers map onto the 3-state ReadinessIndicator; green stays quiet. */
const TIER_TO_INDICATOR = { amber: 'pending', red: 'blocked' } as const;

/**
 * Pure renderer over an already-resolved binding — no store, so it is trivially
 * testable and reusable wherever a binding is resolved ahead of render.
 */
export function BridgeReadinessBadgeView({
    binding,
    children
}: {
    readonly binding: BridgeReadinessBinding;
    readonly children?: ReactNode;
}) {
    // 28.11(a): only bridge_unavailable keeps the wrapping pending shell.
    if (needsWrappingShell(binding.readinessId)) {
        return (
            <div
                className="bridge-readiness-shell bridge-readiness-tier-red"
                data-testid="bridge-readiness-shell"
                data-binding={binding.bindingKey}
                data-readiness={binding.readinessId}
                data-tick={binding.lastTickObserved}
            >
                <PendingBadge id={binding.bindingKey} />
                {children}
            </div>
        );
    }

    const tier = readinessTier(binding.readinessId);
    const severity = readinessSeverity(binding.readinessId);

    return (
        <div
            className={`bridge-readiness-border bridge-readiness-tier-${tier}`}
            data-testid="bridge-readiness-border"
            data-binding={binding.bindingKey}
            data-readiness={binding.readinessId}
            data-tier={tier}
            data-severity={severity}
            data-tick={binding.lastTickObserved}
        >
            {tier !== 'green' ? (
                <ReadinessIndicator state={TIER_TO_INDICATOR[tier]} detail={binding.readinessId} />
            ) : null}
            {binding.blockers.length > 0 ? (
                <span className="bridge-readiness-blockers" data-testid="bridge-readiness-blockers">
                    {binding.blockers.join('; ')}
                </span>
            ) : null}
            {tier === 'red' ? <BlockedOverlay reason={binding.blockers[0] ?? binding.readinessId} /> : null}
            {children}
        </div>
    );
}

/**
 * Live badge: resolves the binding from the shared readiness store + profile
 * clock (`useBridgeReadiness`). Drop one next to every data binding; provenance
 * lives at the datum, never in a separate errors panel (15.6).
 */
export function BridgeReadinessBadge({
    bindingKey,
    children
}: {
    readonly bindingKey: string;
    readonly children?: ReactNode;
}) {
    const binding = useBridgeReadiness(bindingKey);
    return <BridgeReadinessBadgeView binding={binding}>{children}</BridgeReadinessBadgeView>;
}
