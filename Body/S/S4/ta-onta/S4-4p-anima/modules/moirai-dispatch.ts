// Moirai Night' rehearing dispatch plan (C3 / Z-cycle rehear, active phase).
//
// After Sophia (C2) crystallises the session-end disclosure and Aletheia
// places it in the JSONL inbox, the rehearing arc continues with the
// active dissection step: the three Moirai (Klotho, Lachesis, Atropos)
// are dispatched in CFP3 parallel-fold mode to read the disclosure and
// report on their assigned Night' aspect.
//
// Canonical Moirai mapping (Night' direction — analytic synthesis):
//   - Klotho   → P1' (Traces)         — what threads were spun this session
//   - Lachesis → P4' (Sources)        — what sources were consulted / measured
//   - Atropos  → P5' (Crystallisations) — what was cut, what insights remained
//
// This module is PURE — no I/O, no agent dispatch, no JSONL reads. The
// `planMoiraiNightPass` factory produces the dispatch plan; the caller
// (the `dispatch_moirai_night_pass` tool in extension.ts) is responsible
// for actually firing each entry through the team-member dispatch path.
//
// Separating the plan from the dispatch keeps the rehearing topology
// inspectable and testable: the same plan can be replayed, audited, or
// re-routed without re-executing the wire side.

export interface MoiraiDispatchPlan {
  cfp: "CFP3";                              // parallel-fold, three-way Night' pass
  cs_direction: "Night'";                   // analytic synthesis direction
  dispatches: Array<{
    agent: "klotho" | "lachesis" | "atropos";
    night_position: "P1'" | "P4'" | "P5'"; // Klotho=P1' (traces), Lachesis=P4' (sources), Atropos=P5' (insights)
    task: string;                           // the task brief for that Moirai
  }>;
}

/**
 * Plan a CFP3 (parallel-fold) F-Thread Night' rehearing pass.
 *
 * The three Moirai dissect the Sophia disclosure in parallel:
 *   - Klotho at P1' (Traces) — what threads were spun this session
 *   - Lachesis at P4' (Sources / Discovery) — what sources were consulted
 *   - Atropos at P5' (Insight / Crystallisation) — what was cut, what remained
 *
 * Pure function: no side effects. The caller (`dispatch_moirai_night_pass`
 * tool) is responsible for actually dispatching each entry via the team-member
 * dispatch path.
 */
export function planMoiraiNightPass(input: {
  session_id: string;
  disclosure_path: string;
}): MoiraiDispatchPlan {
  const t = (kind: string) =>
    `Night' pass: read ${input.disclosure_path} and report ${kind} for session ${input.session_id}`;
  return {
    cfp: "CFP3",
    cs_direction: "Night'",
    dispatches: [
      { agent: "klotho", night_position: "P1'", task: t("traces (P1' Traces)") },
      { agent: "lachesis", night_position: "P4'", task: t("sources (P4' Discovery)") },
      { agent: "atropos", night_position: "P5'", task: t("crystallisations (P5' Insight)") },
    ],
  };
}

/**
 * Classification of a single Moirai dispatch's output string.
 *
 *   - "empty"  → the subagent returned nothing (whitespace-only or zero-length)
 *   - "failed" → the output starts with "Error:" (per `dispatchTeamMember`'s
 *                `proc.on("error", ...)` convention, which resolves — never
 *                rejects — with an "Error: ..." prefix on subprocess failure)
 *   - "ok"     → any non-empty output not matching the error sentinel
 *
 * Pure: no I/O, no allocation beyond a trimmed string check. Lifted here from
 * the `dispatch_moirai_night_pass` tool so the partial-failure aggregation
 * logic is independently testable and reusable across CFP3 fan-outs.
 */
export type MoiraiOutputClass = "ok" | "failed" | "empty";

export function classifyMoiraiOutput(output: string): MoiraiOutputClass {
  const trimmed = output.trim();
  if (trimmed.length === 0) return "empty";
  if (trimmed.startsWith("Error:")) return "failed";
  return "ok";
}
