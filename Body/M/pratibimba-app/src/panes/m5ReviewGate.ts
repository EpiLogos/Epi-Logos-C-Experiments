/**
 * Coordinate: M' M5' (recursive-self-review human gate — Track 08.T8.3)
 * Residency: Body/M/pratibimba-app/src/panes
 * Actualises: the Pi review-routing gate the M5 review surface routes every
 *   identity-augment proposal through — an `applied` verdict (approve/reject/
 *   revise) is BLOCKED unless a human commits it, whenever the item is
 *   human-required OR the review lineage is a recursive self-review by an
 *   agent actor. Cribbed-as-new-code from the frozen
 *   `m-extension-runtime/src/common/recursive-self-review-gate.ts` +
 *   `agentic-control-room/src/common/run-model.ts::enforceHumanGate`
 *   (provenance), COMPLETED per the 08.T8.3 contract: the frozen actor set
 *   {pi, anima, + six techne-guardians} lacked `sophia` and `aletheia` —
 *   both are in the review lineage (aletheia = the MODE/carrier, not the six
 *   guardians, per DR-S4-TECHNE) and must gate. Agents may always defer.
 * Does NOT own: the review widget (Track 05.9/12.4 surfaces), the gateway's
 *   parity enforcement (s5'.review.submit), proposal genesis.
 */

export type ReviewDecision = 'approve' | 'reject' | 'revise' | 'defer' | 'summarize';

/** Actors whose recursive self-review requires user final-validation:
 *  Pi (harness) · the constitutional dispatchers (anima, sophia) · aletheia
 *  as the crystallisation MODE in the lineage · the six techne-guardians. */
export const RECURSIVE_SELF_REVIEW_FINAL_VALIDATION_ACTORS = Object.freeze([
    'pi',
    'anima',
    'sophia',
    'aletheia',
    'anansi',
    'moirai',
    'janus',
    'mercurius',
    'agora',
    'zeithoven'
] as const);

export interface HumanGateTransition {
    readonly decision: ReviewDecision | string;
    readonly humanRequired: boolean;
    readonly actorIsHuman: boolean;
    readonly recursiveSelfReview?: boolean;
    readonly actor?: string | null;
    readonly techneClass?: string | null;
}

export type HumanGateResult =
    | { readonly ok: true; readonly humanFinalValidationRequired: boolean }
    | { readonly ok: false; readonly humanFinalValidationRequired: true; readonly reason: string };

function normalizeActor(actor: string | null | undefined): string {
    return String(actor ?? '')
        .trim()
        .toLowerCase();
}

function isNonCommittal(decision: string): boolean {
    return decision === 'defer' || decision === 'summarize';
}

export function actorRequiresFinalValidation(input: {
    readonly actor?: string | null;
    readonly recursiveSelfReview?: boolean;
}): boolean {
    if (input.recursiveSelfReview !== true) {
        return false;
    }
    return (RECURSIVE_SELF_REVIEW_FINAL_VALIDATION_ACTORS as readonly string[]).includes(
        normalizeActor(input.actor)
    );
}

/** The M5 review surface calls this BEFORE dispatching `s5'.review.submit`;
 *  the gateway enforces the same rule (parity is Track 12.4's contract). */
export function enforceHumanGate(transition: HumanGateTransition): HumanGateResult {
    const actor = transition.techneClass ?? transition.actor;
    const recursiveActorRequiresHuman = actorRequiresFinalValidation({
        actor,
        recursiveSelfReview: transition.recursiveSelfReview
    });
    const humanFinalValidationRequired = transition.humanRequired || recursiveActorRequiresHuman;

    if (!humanFinalValidationRequired) {
        return Object.freeze({ ok: true, humanFinalValidationRequired: false });
    }
    if (isNonCommittal(String(transition.decision))) {
        return Object.freeze({ ok: true, humanFinalValidationRequired: true });
    }
    if (transition.actorIsHuman) {
        return Object.freeze({ ok: true, humanFinalValidationRequired: true });
    }

    const reason = recursiveActorRequiresHuman
        ? `human-gate enforced: recursive self-review by ${normalizeActor(actor)} requires user final-validation before an applied verdict; agents may defer, only a human commits.`
        : 'human-gate enforced: human-required review items may not be approved, rejected, or revised by an agent; agents may defer, only a human commits.';

    return Object.freeze({ ok: false, humanFinalValidationRequired: true, reason });
}
