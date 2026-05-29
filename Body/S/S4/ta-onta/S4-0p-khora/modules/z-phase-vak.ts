// Z-cycle phase VAK factories (C1 / C2 lifecycle).
//
// The Z-thread models a session lifecycle as compose -> perform -> rehear -> recompose.
// `session_start` (Khora, S4-0p) fires the **compose** phase: the user-engaged
// dialogical entry, the Nous-clearing position from which any task may be bound.
// `session_close` (C2) fires the **rehear** phase: the post-execution analytic
// synthesis (Anima/Sophia state) that crystallises insight before Möbius return.
//
// Both factories are PURE — they take no inputs and return canonical VakAddress values.
// The actual session-record patching (gateway sessions.patch with `{ vak_address: <VakAddress> }`)
// and child-process env propagation (`EPI_SESSION_VAK_ADDRESS`) happen in the
// extension wiring layer (extension.ts session_start / session_shutdown handlers).
//
// Importing from `../../shared/vak_address.ts` (C Experiments canonical mirror) — not
// from the cross-repo Epi-Logos TS twin. The mirror is the source of truth on this side.

import type { VakAddress } from "../../shared/vak_address.ts";

/**
 * Z-cycle compose phase: the user-engaged, dialogical entry state of a session.
 *
 * - cpf `(00/00)` — open conversation, no canonical scaffolding required
 * - cf `(00/00)` — Nous clearing position
 * - cp `CP4.0` — pre-task ground
 * - ct `CT0` — relational, no artifact bucket yet
 * - cfp `CFP0` — base thread (single-stream)
 * - cs `CS1/Day` — quick ground → context (synthesis direction)
 */
export function composePhaseVakAddress(): VakAddress {
  return {
    cpf: "(00/00)",
    ct: ["CT0"],
    cp: "CP4.0",
    cf: "(00/00)",
    cfp: "CFP0",
    cs: { code: "CS1", direction: "Day" },
  };
}

/**
 * Z-cycle rehear phase: the post-execution analytic synthesis state.
 *
 * - cpf `(4.0/1-4.4/5)` — fully mechanistic (canonical scaffolding required)
 * - cf `(5/0)` — Möbius return position
 * - cp `CP4.5` — integration ledge
 * - ct `CT5` — insight bucket
 * - cfp `CFP3` — parallel-fold (Moirai three-way Night' pass)
 * - cs `CS0/Night'` — analytic synthesis direction
 *
 * Consumed by C2 (Sophia post-execution hook in S4-4p-anima/modules/sophia-hook.ts
 * and S4-0p-khora/extension.ts session_shutdown handler).
 */
export function rehearPhaseVakAddress(): VakAddress {
  return {
    cpf: "(4.0/1-4.4/5)",
    ct: ["CT5"],
    cp: "CP4.5",
    cf: "(5/0)",
    cfp: "CFP3",
    cs: { code: "CS0", direction: "Night'" },
  };
}
