/**
 * Coordinate: M'/29 :: the composition load contract (29.T29.6)
 * Residency: Body/M/pratibimba-app/src/composition
 * Position (#n): #5 — Integration; mount-time hard fail, runtime graceful degrade
 * Actualises: 29.T29.6 / DR-WC-IP-5, and closes 15.4's verification
 *   ("composition-contract test asserts side-by-side widget contributions are
 *   rejected at composition load"). Two laws, deliberately different in kind:
 *   a CONTRACT breach hard-fails the mount, and a RUNTIME absence degrades one
 *   slot while the composition stays mounted.
 * Public surface: CompositionRejection, CompositionRejectionReport,
 *   MountedComposition, LoadCompositionResult, loadComposition,
 *   ownerOfMountedSlot, describeCompositionLoad.
 * Does NOT own: the slot law (`geometricSlotEnforcement.ts` — which owns the
 *   per-contributor verdict this collects), the readiness envelope
 *   (`integratedReadinessEnvelope.ts`), or any render.
 * Contract: [[M'-SYSTEM-SPEC]] / [[29-integrated-plugins-composition-deep]] T29.6.
 *
 * # Why this reports EVERY rejection
 *
 * `geometricSlotEnforcement.compositionLoad()` stops at the first offender,
 * which is right for a boolean gate and wrong for a person. A contributor
 * author fixing one refusal, re-running, finding the next, re-running again is
 * the slow path; the mount is refused either way, so there is no reason to
 * withhold the rest. Both loaders call the same `rejectionFor()`, so they
 * cannot drift on what the law is — only on how much of it they tell you.
 *
 * # Hard fail vs graceful degrade
 *
 * A contract breach means the composition CANNOT be honestly drawn: a
 * side-by-side claim, a raw personal body on a slot, two owners on one slot,
 * a contributor with nowhere to live. Those refuse the mount and name every
 * offender.
 *
 * A runtime absence is different in kind. The contract holds, the owners are
 * real, and a field the kernel has not transported yet leaves one slot unable
 * to paint. Unmounting there would take the whole surface away because one
 * pole is waiting — so the mount succeeds, carries its readiness, and the
 * blocked slot is reported rather than hidden.
 */

import {
    rejectionFor,
    REJECTION_REASONS,
    type CompositionContributor,
    type JuxtapositionRejectionReason,
    type ResolvedGeometricClaim
} from './geometricSlotEnforcement';
import {
    buildIntegratedReadiness,
    type IntegratedCompositionId,
    type IntegratedReadinessEnvelope
} from './integratedReadinessEnvelope';
import type { KernelBridgeCachedProfile } from '../bridge/types';

export interface CompositionRejection {
    readonly extensionId: string;
    readonly reason: JuxtapositionRejectionReason;
    readonly humanReason: string;
}

export interface CompositionRejectionReport {
    readonly compositionId: IntegratedCompositionId;
    readonly rejections: readonly CompositionRejection[];
}

export interface MountedComposition {
    readonly compositionId: IntegratedCompositionId;
    readonly grantedGeometricClaims: readonly ResolvedGeometricClaim[];
    readonly readiness: IntegratedReadinessEnvelope;
}

export type LoadCompositionResult =
    | { readonly ok: true; readonly mounted: MountedComposition }
    | { readonly ok: false; readonly rejection: CompositionRejectionReport };

/**
 * Run a composition's contributors through the mount-time contract.
 *
 * On refusal, EVERY offending contributor is named with the reason and a
 * sentence its author can act on. On success the mount carries its readiness
 * envelope, so a caller never has to build a second reading to find out which
 * slots can actually paint.
 */
export function loadComposition(
    compositionId: IntegratedCompositionId,
    contributors: readonly CompositionContributor[],
    profile: KernelBridgeCachedProfile | null = null
): LoadCompositionResult {
    const rejections: CompositionRejection[] = [];
    const granted: ResolvedGeometricClaim[] = [];
    const claimedSlots = new Set<string>();

    for (const contributor of contributors) {
        const reason = rejectionFor(contributor, claimedSlots);
        if (reason !== null) {
            rejections.push(
                Object.freeze({
                    extensionId: contributor.extensionId,
                    reason,
                    humanReason: `${contributor.extensionId} ${REJECTION_REASONS[reason]}`
                })
            );
            continue;
        }
        const claim = contributor.geometricClaim;
        if (claim) {
            claimedSlots.add(claim.geometricSlot);
            granted.push(
                Object.freeze({
                    geometricSlot: claim.geometricSlot,
                    extensionId: claim.extensionId,
                    handleClass: claim.handleClass
                })
            );
        }
    }

    if (rejections.length > 0) {
        return Object.freeze({
            ok: false as const,
            rejection: Object.freeze({ compositionId, rejections: Object.freeze(rejections) })
        });
    }

    return Object.freeze({
        ok: true as const,
        mounted: Object.freeze({
            compositionId,
            grantedGeometricClaims: Object.freeze(granted),
            readiness: buildIntegratedReadiness(compositionId, contributors, profile)
        })
    });
}

/**
 * A one-line reading of the load for chrome and evidence.
 *
 * A refusal names every offender; a degraded mount says which slots cannot
 * paint. Neither ever reads as an empty success.
 */
export function describeCompositionLoad(result: LoadCompositionResult): string {
    if (!result.ok) {
        const named = result.rejection.rejections.map(r => `${r.extensionId}:${r.reason}`).join(' ');
        return `composition refused (${result.rejection.rejections.length}): ${named}`;
    }
    const degraded = result.mounted.readiness.perGeometricSlot.filter(
        slot => slot.slotState !== 'ready'
    );
    const owners = result.mounted.grantedGeometricClaims
        .map(claim => `${claim.geometricSlot}=${claim.extensionId}`)
        .join(' ');
    return degraded.length === 0
        ? `mounted: ${owners}`
        : `mounted: ${owners} · degraded: ${degraded
              .map(slot => `${slot.geometricSlot}(${slot.slotState})`)
              .join(' ')}`;
}

/**
 * Which contributor owns a slot in a loaded composition.
 *
 * `'unmounted'` when the load was refused and `'unclaimed'` when it mounted
 * with nobody on that slot — never an empty string, because a refused
 * composition and an unowned slot are different facts and the chrome must be
 * able to tell them apart.
 */
export function ownerOfMountedSlot(result: LoadCompositionResult, slot: string): string {
    if (!result.ok) return 'unmounted';
    const granted = result.mounted.grantedGeometricClaims.find(
        claim => claim.geometricSlot === slot
    );
    return granted?.extensionId ?? 'unclaimed';
}

/** The slots that mounted but cannot paint, as `slot(state)` pairs. */
export function degradedSlotsOf(result: LoadCompositionResult): readonly string[] {
    if (!result.ok) return Object.freeze([]);
    return Object.freeze(
        result.mounted.readiness.perGeometricSlot
            .filter(slot => slot.slotState !== 'ready')
            .map(slot => `${slot.geometricSlot}(${slot.slotState})`)
    );
}
