// Gate-trigger predicate DSL (D4).
//
// A pure predicate matcher: compile a list of GateTrigger rules and match a
// (prev_vak, next_vak, context) tuple, returning the names of gates that fire.
//
// Foundation for D5 (Anima dispatch guardrails): conditionally allow/block
// dispatches based on VAK transitions, e.g.
//   - cf transitions into (00/00) -> ql-gate (mod% receptive ground)
//   - ct bucket includes CT4b      -> m-prime-gate (high dialogical-shift)
//   - cpf polarity (00/00) + risk  -> collab-gate (require collab approval)
//
// VakAddress is imported from the canonical local mirror at
//   ../../shared/vak_address.ts
// (NOT cross-repo .pi/extensions/s_i/modules/ql_types/index.ts — the mirror
// exists precisely so that ta-onta extensions stay in-repo).

import type { VakAddress } from "../../shared/vak_address.ts";

export type GateName =
  | "ql-gate"
  | "m-gate"
  | "s-gate"
  | "m-prime-gate"
  | "rupa-gate"
  | "collab-gate";

export interface GateTrigger {
  gate: GateName;
  on: {
    /** Fires if next_vak.cf === value AND prev_vak.cf !== value (genuine transition). */
    cf_transition_to?: string;
    /** Fires if next_vak.ct includes value. */
    ct_includes?: string;
    /** Fires if next_vak.cpf === value (combinable with risk_above). */
    cpf_equals?: string;
    /** Additional condition for cpf_equals: only fire if context.risk > value. */
    risk_above?: number;
  };
}

/**
 * Match VAK state transitions against gate triggers.
 *
 * Behavior:
 * - cf_transition_to fires on a genuine transition (prev !== value AND next === value).
 * - ct_includes fires when the value appears in next_vak.ct.
 * - cpf_equals fires when next_vak.cpf === value (combined with risk_above if specified).
 * - First condition match on a trigger wins (subsequent conditions on the same
 *   trigger are skipped — `continue` to the next trigger).
 * - Multiple triggers can fire; output preserves trigger array order.
 */
export function matchGateTrigger(
  triggers: GateTrigger[],
  state: {
    prev_vak?: Partial<VakAddress>;
    next_vak: Partial<VakAddress>;
    context?: { risk?: number };
  },
): GateName[] {
  const fired: GateName[] = [];
  for (const t of triggers) {
    if (t.on.cf_transition_to !== undefined) {
      if (
        state.next_vak.cf === t.on.cf_transition_to &&
        state.prev_vak?.cf !== t.on.cf_transition_to
      ) {
        fired.push(t.gate);
        continue;
      }
    }
    if (t.on.ct_includes !== undefined) {
      if ((state.next_vak.ct ?? []).includes(t.on.ct_includes as any)) {
        fired.push(t.gate);
        continue;
      }
    }
    if (t.on.cpf_equals !== undefined) {
      if (state.next_vak.cpf === t.on.cpf_equals) {
        if (t.on.risk_above !== undefined) {
          if ((state.context?.risk ?? 0) > t.on.risk_above) {
            fired.push(t.gate);
          }
        } else {
          fired.push(t.gate);
        }
        continue;
      }
    }
  }
  return fired;
}
