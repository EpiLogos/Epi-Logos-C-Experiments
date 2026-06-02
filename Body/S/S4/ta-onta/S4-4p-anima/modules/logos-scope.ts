// anima/modules/logos-scope.ts
//
// Logos — Madhyamā-as-Nomos / The Form-Giving Law.
//
// AGENTS.md §"Logos": CF (0/1), CT1, CP 4.1 Definition. "The nomos that makes
// exchange possible ... Logos defines, scopes, and structures not to constrain
// but to enable. Architecture, specifications, boundary-setting. Remains porous
// to vision: the nomos that forgets the household becomes tyranny."
//   Pathology guard: Archon-tyranny — nomos becoming autonomous, forgetting the
//   household it was built to serve.
//
// Track 10.T8 deliverable: "Own scoping/boundary/definition outputs for Logos."
// Verification: "planning trace tests."
//
// Pure: imports only the roster constant. Importable by carrier tests.

import { AGENT_CF } from "./dispatch-validate.ts";

export const LOGOS_CF = AGENT_CF.logos; // "(0/1)"

export interface PlanningTrace {
  agent: "logos";
  cf: string;
  /** What is being defined (CT1 Definition). */
  definition: string;
  /** Explicit scope boundaries — what is deliberately excluded. */
  boundaries: string[];
  /** In-scope commitments. */
  scope: string[];
  /** The household / vision this nomos serves — the porosity anchor. */
  purpose: string;
  /** Ordered trace of the scoping act: define → bound → scope. */
  steps: string[];
}

/**
 * Produce a Logos planning trace: the ordered scoping/boundary/definition
 * output. The trace records the definition first (CT1), then the boundaries it
 * sets, then the scope it commits — the form-giving order in which Logos
 * "defines, scopes, and structures."
 */
export function buildPlanningTrace(input: {
  definition: string;
  boundaries: string[];
  scope: string[];
  purpose: string;
}): PlanningTrace {
  if (!input.definition || !input.definition.trim()) {
    throw new Error("Logos planning trace requires a non-empty definition (CT1).");
  }
  const steps = [
    `define: ${input.definition}`,
    ...input.boundaries.map((b) => `bound: ${b}`),
    ...input.scope.map((s) => `scope: ${s}`),
  ];
  return {
    agent: "logos",
    cf: LOGOS_CF,
    definition: input.definition,
    boundaries: input.boundaries,
    scope: input.scope,
    purpose: input.purpose,
    steps,
  };
}

export interface GuardResult {
  ok: boolean;
  error?: string;
}

/**
 * Archon-tyranny pathology guard.
 *
 * The nomos must remain porous to the household it serves. A planning trace that
 * sets boundaries with no anchoring purpose is autonomous law — tyranny. Logos
 * may only commit a scope while it still names the vision it enables.
 */
export function assertPorous(trace: PlanningTrace): GuardResult {
  if (!trace.purpose || !trace.purpose.trim()) {
    return {
      ok: false,
      error:
        "Archon-tyranny guard: a planning trace must name the purpose/household it serves — boundaries without vision are autonomous law.",
    };
  }
  return { ok: true };
}
