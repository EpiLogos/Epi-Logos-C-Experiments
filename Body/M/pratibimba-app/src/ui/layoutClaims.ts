/**
 * Coordinate: M' shell (layout-claim reconciliation - 11.T11.4)
 * Residency: Body/M/pratibimba-app/src/ui
 * Position (#n): #4 - active carrier layout-host context
 * Actualises: explicit resolution of landed and code-pending layout claims;
 *   pending claims are tolerated without a receiver, while landed claims fail
 *   closed when their declared receiver is absent.
 * Public surface: LayoutClaim, ACTIVE_LAYOUT_CLAIMS, resolveLayoutClaim,
 *   resolveLayoutClaims.
 * Does NOT own: Smart Connections implementation, layout selection, or pane
 *   factories; 28.T28.12 owns the receiver pane, 52.T6 the mode-switched rail.
 * Contract: [[M5'-SPEC]] carrier foothold; frozen provenance at
 *   Body/M/epi-theia/extensions/MIGRATION-SOURCES.md.
 */

import type { LayoutId } from './layoutId';

/** Alias of the one layout-id authority (`ui/layoutId.ts`, 52.T1). */
export type ActiveLayoutId = LayoutId;

interface LayoutClaimBase {
    readonly id: string;
    readonly layout: ActiveLayoutId;
    readonly deliveryOwner: string;
}

export interface CodePendingLayoutClaim extends LayoutClaimBase {
    readonly status: 'code-pending';
    readonly receiverComponent: null;
    readonly gate: string;
    readonly migrationSource: string;
}

export interface LandedLayoutClaim extends LayoutClaimBase {
    readonly status: 'landed';
    readonly receiverComponent: string;
    readonly gate: null;
    readonly migrationSource: string | null;
}

export type LayoutClaim = CodePendingLayoutClaim | LandedLayoutClaim;

/** The frozen Theia manifest is provenance only. This active-carrier record is
 * the executable disposition of its ide-deep expectedWidgets claim.
 *
 * LANDED by 52.T6: the claim was held `code-pending` while the sidebar it
 * named — a mode-switched ide-deep rail — did not exist as a mechanism.
 * 28.T28.12 landed the pane (`SemanticConnectionsPane`, §2 `live`), 52.T4
 * mounted it in both deep rails, and 52.T6 wired the activity-bar mode
 * registry that makes "smart-connections SIDEBAR" a real, mode-switched
 * left-slot state — so the receiver is `semanticConnections` and the gate is
 * discharged. [[M5'-SPEC]] :211 (which records the claim as retained
 * code-pending) is flagged for canon update in [[DR-ABAR-1]]. */
export const ACTIVE_LAYOUT_CLAIMS: readonly LayoutClaim[] = Object.freeze([
    {
        id: 'pratibimba.smart-connections-sidebar',
        layout: 'ide-deep',
        status: 'landed',
        receiverComponent: 'semanticConnections',
        gate: null,
        deliveryOwner: '28.T28.12 (pane) + 52.T6 (mode-switched rail)',
        migrationSource: 'Body/M/epi-theia/extensions/MIGRATION-SOURCES.md'
    }
]);

/** A pending claim deliberately bypasses receiver lookup. A landed claim does
 * not receive that tolerance: the host must be able to find its component. */
export function resolveLayoutClaim(
    claim: LayoutClaim,
    receiverExists: (component: string) => boolean
): LayoutClaim {
    if (claim.status === 'code-pending') {
        return claim;
    }
    if (!receiverExists(claim.receiverComponent)) {
        throw new Error(
            `landed layout claim ${claim.id} has no receiver for ${claim.receiverComponent}`
        );
    }
    return claim;
}

export function resolveLayoutClaims(
    layout: ActiveLayoutId,
    receiverExists: (component: string) => boolean
): readonly LayoutClaim[] {
    return ACTIVE_LAYOUT_CLAIMS
        .filter(claim => claim.layout === layout)
        .map(claim => resolveLayoutClaim(claim, receiverExists));
}
