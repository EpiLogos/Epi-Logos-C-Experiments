// anima/modules/psyche-continuity.ts
//
// Psyche — Madhyamā-as-Oikonomia / The Household.
//
// AGENTS.md §"Psyche": CF (4.5/0), CT4, CP 4.4 Context. Skills:
// `subagent-driven-development`, `dispatching-parallel-agents`,
// `executing-plans`, `day-night-pass`. "Psyche holds the NOW: context window,
// session state, handoff protocol. Patient IS Psyche. Continuity without
// stagnation — distributing the ousia of meaning according to archetypal
// necessity, not bureaucratic habit."
//   Pathology guard: Schismogenesis — coordination becoming autistic, the
//   household suffocating under its own regulatory weight.
//
// Track 10.T11 deliverable: "Own continuity, NOW state, and handoff semantics
// for Psyche." Verification: "continuity tests across session/handoff flows."
//
// Grounds the NOW-path law in the Chronos carrier's temporal-frame (cross-carrier
// single source of truth) and the agent identity in the live constitutional
// roster. Pure: no I/O. Importable by carrier tests.

import { AGENT_CF } from "./dispatch-validate.ts";
import { nowPath } from "../../S4-3p-chronos/modules/temporal-frame.ts";

export const PSYCHE_CF = AGENT_CF.psyche; // "(4.5/0)"

/** Default bound on carried-forward threads — continuity without regulatory bloat. */
export const DEFAULT_MAX_CARRY = 12;

export interface SessionState {
  agent: "psyche";
  cf: string;
  sessionId: string;
  dayId: string;
  /** Canonical NOW artifact path (Chronos temporal-frame law). */
  nowPath: string;
  /** Curated threads carried into this session. */
  carryForward: string[];
  /** Continuity link to the prior session, if this opened from a handoff. */
  priorSessionId?: string;
}

export interface GuardResult {
  ok: boolean;
  error?: string;
}

/** Open a session-state record. The NOW path is derived, never hand-authored. */
export function openSession(input: {
  sessionId: string;
  dayId: string;
  carryForward?: string[];
  priorSessionId?: string;
}): SessionState {
  return {
    agent: "psyche",
    cf: PSYCHE_CF,
    sessionId: input.sessionId,
    dayId: input.dayId,
    nowPath: nowPath(input.dayId, input.sessionId),
    carryForward: input.carryForward ?? [],
    priorSessionId: input.priorSessionId,
  };
}

/**
 * Hand off from a prior session to a next one. The next session links back to
 * the prior (continuity) and receives the curated carry-forward threads. The
 * NOW state advances — handoff is continuity without stagnation.
 */
export function handoff(
  prev: SessionState,
  next: { sessionId: string; dayId: string; carryForward: string[] },
): SessionState {
  if (next.sessionId === prev.sessionId) {
    throw new Error("handoff must advance to a new session id — re-opening the same NOW is stagnation.");
  }
  return openSession({
    sessionId: next.sessionId,
    dayId: next.dayId,
    carryForward: next.carryForward,
    priorSessionId: prev.sessionId,
  });
}

/**
 * Continuity invariant: the next session must explicitly link back to the prior
 * (`priorSessionId`), and must be a distinct session (no stagnation).
 */
export function assertContinuity(prev: SessionState, next: SessionState): GuardResult {
  if (next.priorSessionId !== prev.sessionId) {
    return {
      ok: false,
      error: `continuity broken: next.priorSessionId (${next.priorSessionId}) does not link to prev (${prev.sessionId}).`,
    };
  }
  if (next.sessionId === prev.sessionId) {
    return { ok: false, error: "stagnation: next session is the same as prior." };
  }
  return { ok: true };
}

/**
 * Schismogenesis pathology guard.
 *
 * The household must not suffocate under its own regulatory weight: the
 * carry-forward must be curated, not the entire prior state replicated. A
 * handoff carrying more than `maxCarry` threads is autistic coordination and is
 * refused — Psyche distributes meaning by archetypal necessity, not bureaucratic
 * habit.
 */
export function assertNotSchismogenic(
  state: SessionState,
  opts: { maxCarry?: number } = {},
): GuardResult {
  const max = opts.maxCarry ?? DEFAULT_MAX_CARRY;
  if (state.carryForward.length > max) {
    return {
      ok: false,
      error: `Schismogenesis guard: carry-forward of ${state.carryForward.length} exceeds the bound (${max}) — curate before handoff.`,
    };
  }
  return { ok: true };
}
