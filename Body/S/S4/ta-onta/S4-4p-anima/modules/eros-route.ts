// anima/modules/eros-route.ts
//
// Eros — Madhyamā-as-Chreia / The Operative Exchange.
//
// AGENTS.md §"Eros": CF (0/1/2), CT2, CP 4.2 Operation. Skills:
// `test-driven-development`, `verification-before-completion`. "operative desire
// that drives exchange. Where Logos gave form, Eros sets it in motion ...
// Execution, testing, verification. The dāna/pratigraha cycle where giving and
// receiving cannot be separated."
//   Pathology guard: Chrematistics — executing without chreia, trading form for
//   its own sake.
//
// Track 10.T9 deliverable: "Own execution/verification route semantics for Eros."
// Verification: "verification-bound route tests."
//
// The load-bearing invariant: an Eros route is not complete until execution is
// matched by verification (the dāna/pratigraha cycle — giving/receiving
// inseparable). A route that executes without a bound verification step is
// chrematistic and must be refused.
//
// Pure: imports only the roster constant. Importable by carrier tests.

import { AGENT_CF } from "./dispatch-validate.ts";

export const EROS_CF = AGENT_CF.eros; // "(0/1/2)"

export interface RouteStep {
  kind: "execute" | "verify";
  what: string;
}

export interface ErosRoute {
  agent: "eros";
  cf: string;
  steps: RouteStep[];
}

export interface RouteResult {
  ok: boolean;
  error?: string;
}

/**
 * Build an Eros execution/verification route from ordered steps. Every route
 * must terminate the giving (execute) with a receiving (verify) — the steps are
 * validated for the chreia binding via `assertVerificationBound`.
 */
export function buildErosRoute(steps: RouteStep[]): ErosRoute {
  if (!steps || steps.length === 0) {
    throw new Error("Eros route requires at least one step.");
  }
  return { agent: "eros", cf: EROS_CF, steps };
}

/**
 * Verification-bound invariant (the dāna/pratigraha cycle).
 *
 * A route is verification-bound iff:
 *   - it contains at least one `execute` step, AND
 *   - every `execute` is eventually answered by a later `verify` step.
 *
 * An execute with no following verify is Chrematistics — execution traded for
 * its own sake — and is refused.
 */
export function assertVerificationBound(route: ErosRoute): RouteResult {
  const hasExecute = route.steps.some((s) => s.kind === "execute");
  if (!hasExecute) {
    return { ok: false, error: "Eros route has no execution step — nothing is set in motion." };
  }
  // Walk the route: each execute must be answered by a verify that comes after it.
  let pendingExecutes = 0;
  for (const step of route.steps) {
    if (step.kind === "execute") pendingExecutes += 1;
    else if (step.kind === "verify" && pendingExecutes > 0) pendingExecutes = 0;
  }
  if (pendingExecutes > 0) {
    return {
      ok: false,
      error:
        "Chrematistics guard: execution is not verification-bound — every execute must be answered by a later verify (dāna/pratigraha).",
    };
  }
  return { ok: true };
}

/** Convenience: is this a complete, verification-bound Eros route? */
export function isVerificationBound(steps: RouteStep[]): boolean {
  try {
    return assertVerificationBound(buildErosRoute(steps)).ok;
  } catch {
    return false;
  }
}
