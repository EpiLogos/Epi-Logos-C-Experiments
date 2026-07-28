/**
 * Coordinate: M1-5' composition geometric-slot enforcement (29.T29.13)
 * Residency: Body/M/pratibimba-app/src/composition
 * Position (#n): #5 — integration; the protected-local boundary at the
 *   editor-area composition surface (peer to the widget-region contract).
 * Actualises: the carrier-native geometric-slot registry named by
 *   carrier-contract track 29 — "handle-class allow/forbid; compositionLoad
 *   hard-fails juxtaposition". Extends the M4 protected-local boundary
 *   (`m4DepositReception.ts` handle refusal · `compositionState.tsx` raw-
 *   quaternion refusal) to the geometric composition slots, closing IP-15 +
 *   DR-M4-3 geometric enforcement. This is the composition CONTRACT LAW; it
 *   is NOT a widget — the per-pole render bodies (29.2/29.3) are downstream
 *   carrier panes and are not owned here.
 * Public surface: GEOMETRIC_SLOTS, PERSONAL_GEOMETRIC_SLOTS,
 *   COSMIC_GEOMETRIC_SLOTS, FORBIDDEN_HANDLE_CLASSES_ON_GEOMETRIC,
 *   READS_ONLY_HANDLE_CLASSES, READS_ONLY_GEOMETRIC_SLOTS,
 *   IntegratedGeometricSlot, GeometricHandleClass, IntegratedGeometricClaim,
 *   GeometricClaimVerdict, enforceGeometricPrivacyBoundary,
 *   CompositionContributor, JuxtapositionRejection, MountedComposition,
 *   CompositionLoadResult, compositionLoad, ownerOfSlot.
 * Does NOT own: claim ARBITRATION priority resolution across contributors
 *   (the GeometricCompositionCoordinator conflict order — 29.1), the render
 *   bodies, the readiness envelope (29.10 buildIntegratedReadiness), or the
 *   widget-region CompositionCoordinator. This module DECLARES the boundary
 *   law and the load-time hard-fail; it renders nothing.
 * Contract: [[M'-SYSTEM-SPEC]] / [[29-integrated-plugins-composition-deep]]
 *   T29.13 (boundary) · T29.6 (compositionLoad) · 15.4 (juxtaposition reject) ·
 *   DR-WC-IP-1 (geometric slot taxonomy) · DR-M4-3 / IP-15.
 */

/** The four cosmic (1-2-3) geometric slots — DR-WC-IP-1. */
export const COSMIC_GEOMETRIC_SLOTS = ['surface', 'texture', 'cell-state', 'grounding'] as const;

/** The six personal (4-5-0) geometric slots — DR-WC-IP-1; `grounding` is
 *  shared with the cosmic taxonomy (M0 R-virtue witness under-layer). */
export const PERSONAL_GEOMETRIC_SLOTS = [
    'left-composition',
    'center-composition',
    'right-composition',
    'grounding',
    'composition-ambient',
    'composition-status'
] as const;

/** Every distinct geometric slot (cosmic four ∪ personal six, `grounding`
 *  shared) — the registry that `compositionLoad` mounts over. */
export const GEOMETRIC_SLOTS = [
    'surface',
    'texture',
    'cell-state',
    'grounding',
    'left-composition',
    'center-composition',
    'right-composition',
    'composition-ambient',
    'composition-status'
] as const;

export type IntegratedGeometricSlot = (typeof GEOMETRIC_SLOTS)[number];

/** The full handle-class vocabulary a geometric contributor may declare
 *  (29.1). Split below into forbidden raw bodies, reads-only, and the
 *  opaque-transport classes. */
export type GeometricHandleClass =
    | 'opaque-handle'
    | 'public-summary'
    | 'visual-state'
    | 'raw-quaternion'
    | 'raw-audio-octet'
    | 'plaintext-journal'
    | 'graphiti-episode-body'
    | 'raw-natal-chart'
    | 'k2-surface-handle'
    | 'cymatic-mount-point'
    | 'codon-rotation-export'
    | 'psychoid-renderer-handle'
    | 'recognition-surface'
    | 'r-virtue-witness';

/** The five raw-body handle classes that MUST NEVER cross a geometric slot —
 *  the protected-local boundary the M4 privacy substrate protects (29.13). */
export const FORBIDDEN_HANDLE_CLASSES_ON_GEOMETRIC = [
    'raw-quaternion',
    'raw-audio-octet',
    'plaintext-journal',
    'graphiti-episode-body',
    'raw-natal-chart'
] as const;

/** Handle classes permitted on the reads-only slots (`texture`, `cell-state`):
 *  no write-back may reach the M2 cymatic skin or M3 codon cell projection. */
export const READS_ONLY_HANDLE_CLASSES = [
    'opaque-handle',
    'public-summary',
    'visual-state',
    'cymatic-mount-point',
    'codon-rotation-export'
] as const;

/** The geometric slots that are reads-only under 29.1 (texture skin, codon
 *  cell-state) — any non-reads-only handle class here is a write-back leak. */
export const READS_ONLY_GEOMETRIC_SLOTS = ['texture', 'cell-state'] as const;

const FORBIDDEN_SET = new Set<GeometricHandleClass>(FORBIDDEN_HANDLE_CLASSES_ON_GEOMETRIC);
const READS_ONLY_HANDLE_SET = new Set<GeometricHandleClass>(READS_ONLY_HANDLE_CLASSES);
const READS_ONLY_SLOT_SET = new Set<string>(READS_ONLY_GEOMETRIC_SLOTS);
const GEOMETRIC_SLOT_SET = new Set<string>(GEOMETRIC_SLOTS);

export interface IntegratedGeometricClaim {
    readonly extensionId: string;
    readonly geometricSlot: IntegratedGeometricSlot;
    readonly priority: number;
    readonly handleClass: GeometricHandleClass;
    readonly privacyClass?: string;
    readonly reason?: string;
}

/** Named boundary-rejection reason — a superset of the JuxtapositionRejection
 *  reasons that pertain specifically to the geometric privacy boundary. */
export type GeometricBoundaryReason =
    | 'unknown-geometric-slot'
    | 'contribution-declares-raw-body-on-geometric-slot'
    | 'contribution-declares-write-back-on-reads-only-slot';

export type GeometricClaimVerdict =
    | { readonly allowed: true }
    | { readonly allowed: false; readonly reason: GeometricBoundaryReason };

/**
 * The extended `enforceProtectedLocalBoundary()` (29.13). A geometric claim is
 * refused when: (a) its slot is not a registered geometric slot; (b) its
 * handle class is a raw body (the five forbidden classes) — this is the
 * protected-local leak the M4 substrate exists to stop; or (c) it declares a
 * non-reads-only handle class on a reads-only slot (`texture` / `cell-state`),
 * which would be a write-back into the M2 skin or M3 cell projection.
 * Order matters: unknown slot first, then raw body, then write-back.
 */
export function enforceGeometricPrivacyBoundary(claim: IntegratedGeometricClaim): GeometricClaimVerdict {
    if (!GEOMETRIC_SLOT_SET.has(claim.geometricSlot)) {
        return { allowed: false, reason: 'unknown-geometric-slot' };
    }
    if (FORBIDDEN_SET.has(claim.handleClass)) {
        return { allowed: false, reason: 'contribution-declares-raw-body-on-geometric-slot' };
    }
    if (READS_ONLY_SLOT_SET.has(claim.geometricSlot) && !READS_ONLY_HANDLE_SET.has(claim.handleClass)) {
        return { allowed: false, reason: 'contribution-declares-write-back-on-reads-only-slot' };
    }
    return { allowed: true };
}

/** A contributor presented to `compositionLoad` at composition-mount time. It
 *  may carry a geometric claim, a widget-region claim, and/or a mini-mode
 *  fallback; `compactViewSlot` is its declared compact-view shape. */
export interface CompositionContributor {
    readonly extensionId: string;
    readonly geometricClaim?: IntegratedGeometricClaim | null;
    readonly widgetRegionClaim?: boolean;
    readonly miniModeFallback?: boolean;
    readonly compactViewSlot?: 'side-by-side' | 'mini-inspector' | 'stacked' | null;
}

/** The three+ load-time hard-fail reasons (29.6 / spec §"What is composition
 *  contract from the load side"). */
export type JuxtapositionRejectionReason =
    | 'contribution-declares-side-by-side-slot'
    | 'contested-geometric-slot'
    | 'contribution-has-no-mini-mode-fallback-and-no-geometric-claim'
    | 'contribution-declares-raw-body-on-geometric-slot'
    | 'contribution-declares-write-back-on-reads-only-slot'
    | 'unknown-geometric-slot';

export interface JuxtapositionRejection {
    readonly reason: JuxtapositionRejectionReason;
    /** the contributor that caused the hard fail — the error NAMES it. */
    readonly contributorId: string;
}

export interface ResolvedGeometricClaim {
    readonly geometricSlot: IntegratedGeometricSlot;
    readonly extensionId: string;
    readonly handleClass: GeometricHandleClass;
}

export interface MountedComposition {
    readonly grantedGeometricClaims: readonly ResolvedGeometricClaim[];
}

export type CompositionLoadResult =
    | { readonly mounted: true; readonly composition: MountedComposition }
    | { readonly mounted: false; readonly rejection: JuxtapositionRejection };

/**
 * `compositionLoad()` runs at composition-mount time and returns
 * `Result<MountedComposition, JuxtapositionRejection>`. It HARD-FAILS the whole
 * mount (composition-over-juxtaposition is not negotiable) on the FIRST
 * offending contributor, naming it, when:
 *   - the contributor declares a `side-by-side` compact-view slot;
 *   - the contributor has no geometric claim AND no widget-region claim AND
 *     no mini-mode fallback (a bare widget with no composition contract);
 *   - the contributor's geometric claim fails the protected-local boundary
 *     (raw body on a geometric slot, write-back on a reads-only slot, or an
 *     unknown slot);
 *   - a slot is claimed TWICE. Two owners on one geometric slot is exactly the
 *     three-stack overlay this composition exists to replace: whichever drew
 *     last would win silently, which is juxtaposition wearing a composition's
 *     name. The second claimant is the one named, because the first is the
 *     incumbent.
 * A clean load returns the granted geometric claims keyed by slot.
 */
export function compositionLoad(contributors: readonly CompositionContributor[]): CompositionLoadResult {
    const granted: ResolvedGeometricClaim[] = [];
    const claimedSlots = new Set<string>();
    for (const contributor of contributors) {
        if (contributor.compactViewSlot === 'side-by-side') {
            return {
                mounted: false,
                rejection: {
                    reason: 'contribution-declares-side-by-side-slot',
                    contributorId: contributor.extensionId
                }
            };
        }
        const hasClaim = contributor.geometricClaim != null;
        if (!hasClaim && !contributor.widgetRegionClaim && !contributor.miniModeFallback) {
            return {
                mounted: false,
                rejection: {
                    reason: 'contribution-has-no-mini-mode-fallback-and-no-geometric-claim',
                    contributorId: contributor.extensionId
                }
            };
        }
        if (contributor.geometricClaim) {
            const verdict = enforceGeometricPrivacyBoundary(contributor.geometricClaim);
            if (!verdict.allowed) {
                return {
                    mounted: false,
                    rejection: { reason: verdict.reason, contributorId: contributor.extensionId }
                };
            }
            if (claimedSlots.has(contributor.geometricClaim.geometricSlot)) {
                return {
                    mounted: false,
                    rejection: {
                        reason: 'contested-geometric-slot',
                        contributorId: contributor.extensionId
                    }
                };
            }
            claimedSlots.add(contributor.geometricClaim.geometricSlot);
            granted.push(
                Object.freeze({
                    geometricSlot: contributor.geometricClaim.geometricSlot,
                    extensionId: contributor.geometricClaim.extensionId,
                    handleClass: contributor.geometricClaim.handleClass
                })
            );
        }
    }
    return { mounted: true, composition: Object.freeze({ grantedGeometricClaims: Object.freeze(granted) }) };
}

/**
 * Which contributor owns a slot in a loaded composition.
 *
 * Returns the honest marker `'unmounted'` when the load was refused and
 * `'unclaimed'` when it mounted with nobody on that slot — never an empty
 * string, because an absent owner and a refused composition are different
 * facts and the chrome must be able to tell them apart.
 *
 * Lives with the law rather than with either composition: it reads
 * `CompositionLoadResult`, which this module owns, and both the cosmic (29.2)
 * and personal (29.3) declarations report through it.
 */
export function ownerOfSlot(result: CompositionLoadResult, slot: string): string {
    if (!result.mounted) return 'unmounted';
    const granted = result.composition.grantedGeometricClaims.find(
        claim => claim.geometricSlot === slot
    );
    return granted?.extensionId ?? 'unclaimed';
}
