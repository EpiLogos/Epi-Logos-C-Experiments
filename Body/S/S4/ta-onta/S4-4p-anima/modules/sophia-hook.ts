// Sophia post-execution hook (C2 / Z-cycle rehear).
//
// At session end, Khora's `session_shutdown` lifecycle handler calls
// `buildSophiaDisclosure` to crystallise the rehearing: the final VAK address
// the session landed at, the artifacts it touched, and any improvement vectors
// surfaced during the run. The resulting `SophiaDisclosure` is the canonical
// envelope handed off to Aletheia (handoff_target = "aletheia_ingest", consumed
// by C4) which later routes it to Epii recompose (C5-C6).
//
// This module is PURE — no I/O, no side effects. The JSONL append + path
// resolution lives at the call site in Body/S/S4/ta-onta/S4-0p-khora/extension.ts
// session_shutdown handler. The factory shape is the contract; the inbox is
// the wire.
//
// Importing from `../../shared/vak_address.ts` (C Experiments canonical mirror) —
// see z-phase-vak.ts for the same convention.

import type { VakAddress } from "../../shared/vak_address.ts";

export interface SophiaDisclosure {
  kind: "sophia_session_end_disclosure";
  session_id: string;
  day_id: string;
  final_vak: VakAddress;
  artifacts: string[];
  improvement_vectors: string[];
  handoff_target: "aletheia_ingest";
}

/**
 * Build a canonical Sophia disclosure envelope at session end.
 *
 * Pure factory: takes the closed session's identity + state and returns the
 * structured record. The caller (Khora session_shutdown) is responsible for
 * appending `JSON.stringify(disclosure) + "\n"` to the Sophia JSONL inbox.
 */
export function buildSophiaDisclosure(input: {
  session_id: string;
  day_id: string;
  final_vak: VakAddress;
  artifacts: string[];
  improvement_vectors: string[];
}): SophiaDisclosure {
  return {
    kind: "sophia_session_end_disclosure",
    session_id: input.session_id,
    day_id: input.day_id,
    final_vak: input.final_vak,
    artifacts: input.artifacts,
    improvement_vectors: input.improvement_vectors,
    handoff_target: "aletheia_ingest",
  };
}
