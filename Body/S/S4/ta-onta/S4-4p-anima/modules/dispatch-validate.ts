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

/**
 * Validate a CFP1 (P-Thread) parallel dispatch.
 *
 * Per the VAK grammar, dispatch_parallel_agents is the P-Thread surface:
 * N different tasks, each running independently. Every task must:
 *   - carry a valid VAK address (per validateDispatchParams)
 *   - declare cfp: "CFP1" specifically (not CFP0, CFP2, etc.)
 *
 * If any task fails either check, the whole batch is refused — there's no
 * partial-fan-out semantic at the parallel surface.
 */
export function validateParallelDispatch(input: { tasks: DispatchParams[] }): ValidationResult {
  if (!input.tasks || input.tasks.length === 0) {
    return { ok: false, error: "no tasks supplied to dispatch_parallel_agents" };
  }
  for (const t of input.tasks) {
    const v = validateDispatchParams(t);
    if (!v.ok) return v;
    if (t.vak_address!.cfp !== "CFP1") {
      return {
        ok: false,
        error: `dispatch_parallel_agents requires CFP1 on every task (task for agent ${t.agent_name} declared ${t.vak_address!.cfp})`,
      };
    }
  }
  return { ok: true };
}
