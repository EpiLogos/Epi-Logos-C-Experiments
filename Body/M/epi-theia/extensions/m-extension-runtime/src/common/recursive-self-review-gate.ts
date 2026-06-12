export type RecursiveSelfReviewFinalValidationActor =
    | 'sophia'
    | 'anima'
    | 'pi'
    | 'aletheia';

export const RECURSIVE_SELF_REVIEW_FINAL_VALIDATION_ACTORS:
readonly RecursiveSelfReviewFinalValidationActor[] = Object.freeze([
    'sophia',
    'anima',
    'pi',
    'aletheia'
]);

export interface PiReviewRoutingGateInput {
    readonly decision: string;
    readonly humanRequired: boolean;
    readonly actorIsHuman: boolean;
    readonly actor?: string | null;
    readonly recursiveSelfReview?: boolean;
}

export type PiReviewRoutingGateResult =
    | {
        readonly ok: true;
        readonly humanFinalValidationRequired: boolean;
    }
    | {
        readonly ok: false;
        readonly humanFinalValidationRequired: true;
        readonly reason: string;
    };

export function actorRequiresRecursiveSelfReviewFinalValidation(input: {
    readonly actor?: string | null;
    readonly recursiveSelfReview?: boolean;
}): boolean {
    if (input.recursiveSelfReview !== true) {
        return false;
    }
    const actor = normalizeReviewActor(input.actor);
    return RECURSIVE_SELF_REVIEW_FINAL_VALIDATION_ACTORS.includes(
        actor as RecursiveSelfReviewFinalValidationActor
    );
}

export function enforcePiReviewRoutingGate(
    input: PiReviewRoutingGateInput
): PiReviewRoutingGateResult {
    const recursiveActorRequiresHuman = actorRequiresRecursiveSelfReviewFinalValidation(input);
    const humanFinalValidationRequired =
        input.humanRequired || recursiveActorRequiresHuman;

    if (!humanFinalValidationRequired) {
        return Object.freeze({ ok: true, humanFinalValidationRequired: false });
    }
    if (isNonCommittalReviewDecision(input.decision)) {
        return Object.freeze({ ok: true, humanFinalValidationRequired: true });
    }
    if (input.actorIsHuman) {
        return Object.freeze({ ok: true, humanFinalValidationRequired: true });
    }

    const reason = recursiveActorRequiresHuman
        ? `human-gate enforced: recursive self-review by ${normalizeReviewActor(input.actor)} requires user final-validation before an applied verdict. Agents may defer (recording the human-required state); only a human via the M5 review surface may transition this item.`
        : 'human-gate enforced: human-required review items may not be approved, rejected, or revised by an agent. Agents may defer (recording the human-required state); only a human via the M5 review surface may transition this item.';

    return Object.freeze({
        ok: false,
        humanFinalValidationRequired: true,
        reason
    });
}

function isNonCommittalReviewDecision(decision: string): boolean {
    return decision === 'defer' || decision === 'summarize';
}

function normalizeReviewActor(actor: string | null | undefined): string {
    return String(actor ?? '').trim().toLowerCase();
}
