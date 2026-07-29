/**
 * Coordinate: M' shell (empty-state registry — Track 32.T32.6, closes O-WC-OB-2)
 * Residency: Body/M/pratibimba-app/src/ui
 * Position (#n): #4 — the context frame a surface renders WITHIN when it has
 *   nothing to show yet
 * Actualises: the central `EmptyStateRegistry` of the 32.6 design-recon
 *   (spec :186-199), retargeted from the frozen Theia shape to the carrier.
 *
 *   TWO deliberate retargets, recorded rather than silently taken:
 *
 *   (a) "Per extension" becomes per M-family CONTRIBUTION. The frozen spec
 *       keyed registrations to Theia view ids (`m3-mahamaya.primary`); the
 *       carrier has no Theia views, it has the immutable cross-layout target
 *       ledger (`commands/crossLayoutIntent.ts#CROSS_LAYOUT_INTENT_TARGETS`).
 *       So `viewId` is a declared contribution id on that ledger, and
 *       `scripts/lint-empty-state-registry.mjs` refuses a `viewId` the ledger
 *       does not declare. Naming a view that cannot be routed to would be a
 *       registration nothing could ever fire.
 *
 *   (b) `EmptyStateRegistryImpl (@injectable() @singleton())` bound in
 *       `frontend-module.ts` becomes a module-level singleton, because Theia
 *       plumbing (ReactWidget / Inversify / contributes) is DEAD under the
 *       cycle-3 rerun carrier contract. The CONTRACT — register/resolve/all
 *       plus a disposable registration — is kept exactly.
 *
 *   The registry stores DATA, not chrome: what the surface says, which named
 *   producers it waits on, and when it considers itself empty. The rendering
 *   is `ui/mExtensionEmptyStates.tsx`, and the reason for every missing
 *   contributor is COMPUTED from the landed nine-id taxonomy rather than
 *   restated, so a registration cannot claim a readiness the bridge never
 *   reported.
 * Public surface: EmptyStateDisposable, EmptyStateContributor, EmptyStateProps,
 *   EmptyStateRegistration, EmptyStateRegistry, createEmptyStateRegistry,
 *   emptyStateRegistry, EmptyStateReasonRow, emptyStateReasonRows,
 *   missingContributors, contributorsActivation, registrationKey.
 * Does NOT own: the nine-id taxonomy (ui/bridgeReadiness), the per-state copy
 *   (ui/readinessGrammar), the snapshot transport (state/readinessStore), the
 *   copy blocks (ui/emptyStateGrammar), or any rendering (ui/primitives.tsx
 *   <EmptyState>, ui/mExtensionEmptyStates.tsx).
 * Contract: rerun tranche [[32.T32.6]]; target ledger
 *   `commands/crossLayoutIntent.ts`; enforced by
 *   `scripts/lint-empty-state-registry.mjs`.
 */

import type { ComponentType } from 'react';
import {
    classifyReadiness,
    readinessOwnerTrack,
    type BridgeReadinessId,
    type MExtensionReadinessSnapshot
} from './bridgeReadiness';
import { grammarFor } from './readinessGrammar';

/** The carrier's `Disposable` — the one method the frozen contract used. */
export interface EmptyStateDisposable {
    dispose(): void;
}

/**
 * A named upstream producer this surface waits on.
 *
 * The point of naming them is the 32.6 shape: an empty surface must say WHICH
 * axis is missing and WHO owns it, never just "nothing here".
 */
export interface EmptyStateContributor {
    readonly bindingKey: string;
    readonly label: string;
}

/** What every registered empty-state component receives. */
export interface EmptyStateProps {
    readonly registration: EmptyStateRegistration;
    readonly snapshot: MExtensionReadinessSnapshot | null;
}

/**
 * One M-family surface's empty state.
 *
 * `extensionId` + `viewId` are the frozen contract's two keys; both are held to
 * the carrier's cross-layout target ledger by the registry lint.
 */
export interface EmptyStateRegistration {
    readonly extensionId: string;
    /** A contribution id declared in `CROSS_LAYOUT_INTENT_TARGETS`. */
    readonly viewId: string;
    /** The header line — the surface's own voice. */
    readonly header: string;
    /** The summary paragraph beneath the header. */
    readonly summary: string;
    /** The onboarding hint carried by the shared <EmptyState> primitive. */
    readonly hint: string;
    /** Coordinate-family letter; tints the <EmptyState> mark to its tier. */
    readonly family: string;
    readonly contributors: readonly EmptyStateContributor[];
    readonly activationCondition: (snapshot: MExtensionReadinessSnapshot | null) => boolean;
    readonly component: ComponentType<EmptyStateProps>;
}

export interface EmptyStateRegistry {
    register(registration: EmptyStateRegistration): EmptyStateDisposable;
    resolve(extensionId: string, viewId: string): EmptyStateRegistration | undefined;
    all(): readonly EmptyStateRegistration[];
}

/** The composite key. NUL-joined like the target ledger's own map. */
export function registrationKey(extensionId: string, viewId: string): string {
    return `${extensionId}\u0000${viewId}`;
}

export function createEmptyStateRegistry(): EmptyStateRegistry {
    const map = new Map<string, EmptyStateRegistration>();
    return {
        register(registration) {
            const key = registrationKey(registration.extensionId, registration.viewId);
            map.set(key, registration);
            return {
                dispose() {
                    // Only retract our OWN entry: a later registration for the
                    // same key has replaced us, and disposing then would delete
                    // a live surface's empty state rather than ours.
                    if (map.get(key) === registration) {
                        map.delete(key);
                    }
                }
            };
        },
        resolve(extensionId, viewId) {
            return map.get(registrationKey(extensionId, viewId));
        },
        all() {
            return Object.freeze([...map.values()]) as readonly EmptyStateRegistration[];
        }
    };
}

/**
 * The one registry the carrier shares.
 *
 * A module singleton rather than a DI binding — see retarget (b) in the header.
 */
export const emptyStateRegistry: EmptyStateRegistry = createEmptyStateRegistry();

/** One row of the 32.6 reasons table. */
export interface EmptyStateReasonRow {
    readonly bindingKey: string;
    readonly label: string;
    readonly readinessId: BridgeReadinessId;
    /** The bridge's own words when it gave a reason; the id's canonical copy
     *  when it did not. Never invented. */
    readonly reason: string;
    readonly ownerTrack: string;
}

/**
 * The named contributors this surface is still waiting on.
 *
 * A contributor is "missing" unless the bridge reported it `ready_public_current`.
 * An UNREPORTED binding is honestly `bridge_unavailable` (classifyReadiness's own
 * law: the bridge has not spoken about it, which is never the same as ready), so
 * a cold carrier lists every contributor — which is the truth on a cold carrier.
 */
export function missingContributors(
    registration: EmptyStateRegistration,
    snapshot: MExtensionReadinessSnapshot | null
): readonly EmptyStateContributor[] {
    return registration.contributors.filter(
        contributor =>
            classifyReadiness(snapshot, contributor.bindingKey).readinessId !== 'ready_public_current'
    );
}

/** The reasons table: one row per missing contributor, id + reason + owner. */
export function emptyStateReasonRows(
    registration: EmptyStateRegistration,
    snapshot: MExtensionReadinessSnapshot | null
): readonly EmptyStateReasonRow[] {
    return missingContributors(registration, snapshot).map(contributor => {
        const binding = classifyReadiness(snapshot, contributor.bindingKey);
        const reported = binding.blockers.find(blocker => blocker.trim().length > 0);
        return Object.freeze({
            bindingKey: contributor.bindingKey,
            label: contributor.label,
            readinessId: binding.readinessId,
            reason: reported ?? grammarFor(binding.readinessId).copy,
            ownerTrack: readinessOwnerTrack(binding.readinessId)
        });
    });
}

/**
 * The default `activationCondition`: the surface is empty while ANY named
 * contributor is not ready. Every one of them has to arrive before the surface
 * has something whole to show, so one absent producer is enough.
 */
export function contributorsActivation(
    contributors: readonly EmptyStateContributor[]
): (snapshot: MExtensionReadinessSnapshot | null) => boolean {
    return snapshot =>
        contributors.some(
            contributor =>
                classifyReadiness(snapshot, contributor.bindingKey).readinessId !==
                'ready_public_current'
        );
}
