import { isValidVakAddress, type VakAddress, type CfLiteral } from "../../shared/vak_address.ts";

/**
 * Canonical CF assignments for the constitutional 7-fold roster.
 * Used to verify that a dispatch's vak_address.cf matches the named agent.
 * Unknown agent names (e.g. custom subagents, CFP3 fusion aggregates) are
 * not checked against this map — caller must enforce roster membership separately.
 */
export const AGENT_CF: Record<string, CfLiteral> = {
  nous: "(00/00)",
  logos: "(0/1)",
  eros: "(0/1/2)",
  mythos: "(0/1/2/3)",
  psyche: "(4.5/0)",
  sophia: "(5/0)",
  anima: "(4.0/1-4.4/5)",
};

export interface DispatchParams {
  agent_name: string;
  task: string;
  vak_address?: VakAddress;
}

export interface ValidationResult {
  ok: boolean;
  error?: string;
}

/**
 * Validate a single dispatch's parameters before firing.
 *
 * Required invariants:
 *   - vak_address must be present (no fire without an address)
 *   - vak_address must validate via the canonical isValidVakAddress
 *   - If agent_name is in the AGENT_CF roster, vak_address.cf must match
 *
 * Returns { ok: true } when the dispatch may proceed; otherwise { ok: false, error }
 * with a human-readable message suitable for surfacing to the caller.
 */
export function validateDispatchParams(params: DispatchParams): ValidationResult {
  if (!params.vak_address) {
    return { ok: false, error: "vak_address required for every dispatch" };
  }
  if (!isValidVakAddress(params.vak_address)) {
    return { ok: false, error: "vak_address malformed (failed canonical validation)" };
  }
  const expected = AGENT_CF[params.agent_name];
  if (expected && params.vak_address.cf !== expected) {
    return {
      ok: false,
      error: `cf does not match agent ${params.agent_name} (expected ${expected}, got ${params.vak_address.cf})`,
    };
  }
  return { ok: true };
}
