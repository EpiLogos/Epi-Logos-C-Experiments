// anima/modules/nous-clearing.ts
//
// Nous — the constitutional agent of epistemic clearing (Para Vāk / Unus Mundus).
//
// AGENTS.md §"The Six Constitutional Agents → Nous":
//   CF (0000), CT0, CP 4.0 Ground. "The clearing before the form ... Its
//   function is epistemic clearing: returning to actual ground so what follows
//   can proceed from there. Invoke with fresh minimal context; do not assign
//   tasks to execute."  Pathology guard: Inflation — closing a clearing that
//   should remain open.
//
// AGENTS.md §"Mandatory VAK Gate":
//   CPF (00/00) → "Stop. This task requires dialogical brainstorming. Do not
//   dispatch autonomously — engage the user first via Nous."
//   CF (0000) → Nous: "Epistemic clearing only ... Re-run vak_evaluate after."
//
// This module OWNS those two conditions as an explicit, testable route-stop
// decision. It is grounded in the live constitutional roster (AGENT_CF /
// CPF_DIALOGICAL from dispatch-validate.ts) rather than redefining it.
//
// Pure: imports only the roster constants. Importable by carrier tests.

import { CPF_DIALOGICAL, AGENT_CF } from "./dispatch-validate.ts";

/** Nous's CF — the clearing ground. The live roster uses the "(00/00)" form. */
export const NOUS_CF = AGENT_CF.nous; // "(00/00)"

/**
 * AGENTS.md writes Nous's CF as "(0000)" (slashless) while the live VAK roster
 * uses "(00/00)". Both denote the same receptive ground; accept either so a
 * dispatch authored against either notation is routed identically.
 */
const GROUND_FORMS = new Set<string>([NOUS_CF, CPF_DIALOGICAL, "(0000)"]);

function isGround(value: string | undefined): boolean {
  return value !== undefined && GROUND_FORMS.has(value);
}

export type RouteAction = "halt" | "proceed";

export interface ClearingDecision {
  /** halt = stop autonomous dispatch and clear/engage; proceed = dispatch may continue. */
  action: RouteAction;
  /** The owning agent when the route halts for clearing. */
  agent?: "nous";
  /** True when the system is in epistemic-clearing mode (Nous CF ground). */
  clearing: boolean;
  /** When clearing, the route must re-run vak_evaluate before mechanistic dispatch. */
  requiresReevaluation: boolean;
  /** Human-readable rationale. */
  reason: string;
}

/**
 * The Nous route-stop decision.
 *
 * Halts (does not autonomously dispatch) when EITHER:
 *   - CPF is the dialogical ground "(00/00)" — open brainstorming required; or
 *   - CF resolves to Nous ground — epistemic clearing only.
 *   - CPF is absent (not yet evaluated) — the gate has not been run, so the
 *     safe default is to halt rather than dispatch blind.
 *
 * Proceeds for any mechanistic (non-ground) CPF/CF.
 */
export function nousRouteStop(input: { cpf?: string; cf?: string }): ClearingDecision {
  const cfClearing = isGround(input.cf);
  const cpfDialogical = isGround(input.cpf) || input.cpf === undefined;

  if (cfClearing) {
    return {
      action: "halt",
      agent: "nous",
      clearing: true,
      requiresReevaluation: true,
      reason: "CF resolves to Nous ground — epistemic clearing only; re-run vak_evaluate after.",
    };
  }
  if (cpfDialogical) {
    return {
      action: "halt",
      agent: "nous",
      clearing: true,
      requiresReevaluation: true,
      reason:
        input.cpf === undefined
          ? "no CPF evaluated — engage dialogically (Nous) before autonomous dispatch."
          : "CPF (00/00) — dialogical brainstorming required; engage the user first via Nous.",
    };
  }
  return {
    action: "proceed",
    clearing: false,
    requiresReevaluation: false,
    reason: `mechanistic CPF ${input.cpf} — autonomous dispatch permitted.`,
  };
}

export interface ClearingOnlyResult {
  ok: boolean;
  error?: string;
}

/**
 * Guard: Nous "does not assign tasks to execute" — a clearing invocation may
 * only ask P0'/P1' opening questions, never carry an execution payload. A
 * dispatch that routes to Nous WITH an execution task is a category error.
 *
 * `intent` distinguishes the clearing question ("open") from an execution
 * payload ("execute"). Anything other than "open" under Nous is refused.
 */
export function nousClearingOnly(intent: "open" | "execute"): ClearingOnlyResult {
  if (intent === "execute") {
    return {
      ok: false,
      error: "Nous is clearing-only — it opens P0'/P1' questions and does not execute tasks.",
    };
  }
  return { ok: true };
}

/**
 * Pathology guard: Inflation — "closing a clearing that should remain open."
 *
 * A clearing may be closed (and mechanistic dispatch resumed) ONLY once a fresh,
 * non-ground CPF has been re-evaluated. Attempting to close while the CPF is
 * still ground is inflation and is refused.
 */
export function mayCloseClearing(state: { reevaluatedCpf?: string }): ClearingOnlyResult {
  if (state.reevaluatedCpf === undefined || isGround(state.reevaluatedCpf)) {
    return {
      ok: false,
      error:
        "inflation guard: cannot close the clearing — re-evaluate to a non-ground CPF before resuming dispatch.",
    };
  }
  return { ok: true };
}
