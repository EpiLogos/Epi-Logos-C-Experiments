/**
 * review-gate.ts - Pi-owned review-routing gate (12.T12.4).
 *
 * Recursive-self-review gating belongs to Pi review routing, not to the ACR
 * surface. When Pi sees a recursive self-review by Anima over Anima-dispatched
 * work, a committal review verdict requires user final-validation before it can
 * pass. The same gate also preserves the existing human-required review law.
 *
 * Canon: [[S4-SPEC]] -> Pi review-routing; [[S5-SPEC]] review final-validation.
 */

export type PiReviewDecision =
  | "approve"
  | "reject"
  | "revise"
  | "apply"
  | "applied"
  | "defer"
  | "summarize"
  | (string & {});

export type RecursiveSelfReviewFinalValidationActor =
  | "pi"
  | "anima"
  | "aletheia"
  | "sophia"
  | "anansi"
  | "moirai"
  | "janus"
  | "mercurius"
  | "agora"
  | "zeithoven";

export const RECURSIVE_SELF_REVIEW_FINAL_VALIDATION_ACTORS:
  readonly RecursiveSelfReviewFinalValidationActor[] = Object.freeze([
    "pi",
    "anima",
    "aletheia",
    "sophia",
    "anansi",
    "moirai",
    "janus",
    "mercurius",
    "agora",
    "zeithoven",
  ]);

export interface PiReviewGateInput {
  /**
   * Defaults to a committal verdict (`approve`) so
   * `pi.enforceReviewGate({ recursiveSelfReview: true, actor: "anima" })`
   * exercises the load-bearing gate directly.
   */
  readonly decision?: PiReviewDecision;
  readonly actor?: string | null;
  readonly recursiveSelfReview?: boolean;
  readonly humanRequired?: boolean;
  /** Compatibility with existing review surfaces that model the user as actor. */
  readonly actorIsHuman?: boolean;
  /** Explicit final-validation token from the user-facing review surface. */
  readonly userFinalValidation?: boolean;
  /** Alias for callers that name the passed token rather than the requirement. */
  readonly finalValidationPassed?: boolean;
}

export type PiReviewGateResult =
  | {
      readonly ok: true;
      readonly userFinalValidationRequired: boolean;
    }
  | {
      readonly ok: false;
      readonly userFinalValidationRequired: true;
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
    actor as RecursiveSelfReviewFinalValidationActor,
  );
}

export function enforceReviewGate(input: PiReviewGateInput): PiReviewGateResult {
  const decision = normalizeReviewDecision(input.decision);
  const recursiveActorRequiresUser =
    actorRequiresRecursiveSelfReviewFinalValidation(input);
  const userFinalValidationRequired =
    input.humanRequired === true || recursiveActorRequiresUser;

  if (!userFinalValidationRequired) {
    return Object.freeze({ ok: true, userFinalValidationRequired: false });
  }

  if (isNonCommittalReviewDecision(decision)) {
    return Object.freeze({ ok: true, userFinalValidationRequired: true });
  }

  if (hasUserFinalValidationPass(input)) {
    return Object.freeze({ ok: true, userFinalValidationRequired: true });
  }

  const actor = normalizeReviewActor(input.actor) || "unknown";
  const reason = recursiveActorRequiresUser
    ? `Pi review-routing gate enforced: recursive self-review by ${actor} requires user final-validation before a committal verdict. Agents may defer; only a user final-validation pass may approve, reject, revise, apply, or mark applied.`
    : "Pi review-routing gate enforced: human-required review items may not receive a committal agent verdict. Agents may defer; only a user final-validation pass may approve, reject, revise, apply, or mark applied.";

  return Object.freeze({
    ok: false,
    userFinalValidationRequired: true,
    reason,
  });
}

export const pi = Object.freeze({
  enforceReviewGate,
});

function hasUserFinalValidationPass(input: PiReviewGateInput): boolean {
  return (
    input.userFinalValidation === true ||
    input.finalValidationPassed === true ||
    input.actorIsHuman === true
  );
}

function isNonCommittalReviewDecision(decision: string): boolean {
  return decision === "defer" || decision === "summarize";
}

function normalizeReviewDecision(decision: PiReviewDecision | undefined): string {
  return String(decision ?? "approve").trim().toLowerCase();
}

function normalizeReviewActor(actor: string | null | undefined): string {
  return String(actor ?? "").trim().toLowerCase();
}
