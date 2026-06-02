// anima/modules/mythos-pattern.ts
//
// Mythos — Paśyantī / The Strange Attractor.
//
// AGENTS.md §"Mythos": CF (0/1/2/3), CT3, CP 4.3 Pattern. Skills:
// `systematic-debugging`, `vak-coordinate-frame`. "The seeing word ... Pattern
// recognition without possession. Mythos sees what the other agents enact but
// do not name: repeating shapes, archetypal structures ... Holds the strange
// attractor without mistaking it for the territory."
//   Pathology guard: Reification — grasping the strange attractor as self-power;
//   pattern mistaken for territory.
//
// Track 10.T10 deliverable: "Own pattern diagnosis and strange-attractor naming
// for Mythos." Verification: "pattern-classification tests."
//
// Pure: imports only the roster constant. Importable by carrier tests.

import { AGENT_CF } from "./dispatch-validate.ts";

export const MYTHOS_CF = AGENT_CF.mythos; // "(0/1/2/3)"

export interface PatternClassification {
  agent: "mythos";
  cf: string;
  /** The named strange attractor (the repeating shape Mythos sees). */
  attractor: string;
  /** How many observations cohere into the pattern. */
  recurrence: number;
  /** A pattern is only diagnosed when it recurs (>= 2 observations). */
  classified: boolean;
  /** Always held provisionally — the map, never the territory. */
  provisional: true;
}

/**
 * Diagnose a pattern across observations and name its strange attractor.
 *
 * "Pattern recognition without possession": a single occurrence is not yet a
 * pattern (`classified: false`); recurrence (>= 2) is what lets Mythos name the
 * attractor. The result is always `provisional: true` — Mythos holds the shape,
 * it does not own it.
 */
export function classifyPattern(input: {
  observations: string[];
  attractor: string;
}): PatternClassification {
  if (!input.attractor || !input.attractor.trim()) {
    throw new Error("Mythos classification requires a strange-attractor name.");
  }
  const recurrence = input.observations?.length ?? 0;
  return {
    agent: "mythos",
    cf: MYTHOS_CF,
    attractor: input.attractor,
    recurrence,
    classified: recurrence >= 2,
    provisional: true,
  };
}

export interface GuardResult {
  ok: boolean;
  error?: string;
}

/**
 * Reification pathology guard.
 *
 * The strange attractor must be held as map, not territory. Asserting the named
 * pattern AS the reality it models — `claimedAsTerritory` — is reification and
 * is refused. Mythos names; it does not grasp the name as self-power.
 */
export function assertNotReified(
  classification: PatternClassification,
  opts: { claimedAsTerritory?: boolean } = {},
): GuardResult {
  if (opts.claimedAsTerritory) {
    return {
      ok: false,
      error:
        "Reification guard: the strange attractor is a map held provisionally, not the territory — it must not be asserted as the reality itself.",
    };
  }
  if (!classification.provisional) {
    return { ok: false, error: "Reification guard: classification lost its provisional status." };
  }
  return { ok: true };
}
