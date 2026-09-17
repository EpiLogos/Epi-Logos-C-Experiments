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
import { BlockedOverlay, LoadingPulse, PendingBadge, ReadinessIndicator } from './primitives';
import {
    needsWrappingShell,
    readinessSeverity,
    readinessTier,
    type BridgeReadinessBinding
} from './bridgeReadiness';
import type { MExtensionReadinessFlavour } from './readinessGrammar';
import { useBridgeReadiness, useReadinessFlavour } from './useBridgeReadiness';

/**
 * Pure renderer over an already-resolved binding — no store, so it is trivially
 * testable and reusable wherever a binding is resolved ahead of render.
 *
 * 32.5: the per-state class rides EVERY render and the flavour sub-class layers
 * over it only when a flavour actually fires. A null flavour emits no class and
 * no `data-flavour`, because "no flavour" is a real state — the surface renders
 * plainly rather than in a variant nothing reported.
 */
export function BridgeReadinessBadgeView({
    binding,
    flavour = null,
    children
}: {
    readonly binding: BridgeReadinessBinding;
    readonly flavour?: MExtensionReadinessFlavour | null;
    readonly children?: ReactNode;
}) {
    const grammarClasses = `bridge-readiness-state-${binding.readinessId}${
        flavour ? ` bridge-readiness-flavour-${flavour}` : ''
    }`;
    // 28.11(a): only bridge_unavailable keeps the wrapping pending shell.
    if (needsWrappingShell(binding.readinessId)) {
        return (
            <div
                className={`bridge-readiness-shell bridge-readiness-tier-red ${grammarClasses}`}
                data-testid="bridge-readiness-shell"
                data-binding={binding.bindingKey}
                data-readiness={binding.readinessId}
                data-flavour={flavour ?? undefined}
                data-tick={binding.lastTickObserved}
            >
                <PendingBadge
                    id={binding.bindingKey}
                    readinessId={binding.readinessId}
                    reason={binding.blockers[0]}
                />
                {/* No tick is coming while the bridge is down, so this is the
                    one place the 30.6 pulse runs on its local CSS cycle. */}
                <LoadingPulse readinessId={binding.readinessId} label={binding.bindingKey} />
                {children}
            </div>
        );
    }

    const tier = readinessTier(binding.readinessId);
    const severity = readinessSeverity(binding.readinessId);

    return (
        <div
            className={`bridge-readiness-border bridge-readiness-tier-${tier} ${grammarClasses}`}
            data-testid="bridge-readiness-border"
            data-binding={binding.bindingKey}
            data-readiness={binding.readinessId}
            data-flavour={flavour ?? undefined}
            data-tier={tier}
            data-severity={severity}
            data-tick={binding.lastTickObserved}
        >
            {tier !== 'green' ? (
                <ReadinessIndicator readinessId={binding.readinessId} reason={binding.blockers[0]} />
            ) : null}
            {binding.blockers.length > 0 ? (
                <span className="bridge-readiness-blockers" data-testid="bridge-readiness-blockers">
                    {binding.blockers.join('; ')}
                </span>
            ) : null}
            {tier === 'red' ? (
                <BlockedOverlay readinessId={binding.readinessId} reason={binding.blockers[0]} />
            ) : null}
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
    const flavour = useReadinessFlavour(binding);
    return (
        <BridgeReadinessBadgeView binding={binding} flavour={flavour}>
            {children}
        </BridgeReadinessBadgeView>
    );
}
