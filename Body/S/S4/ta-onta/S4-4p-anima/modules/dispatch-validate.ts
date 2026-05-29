import { isValidVakAddress, type VakAddress, type CfLiteral, type CpfPolarity } from "../../shared/vak_address.ts";
import { matchGateTrigger, type GateTrigger, type GateName } from "../../S4-5p-aletheia/modules/gate-trigger.ts";

/**
 * Canonical CF assignments for the constitutional 7-fold roster:
 * nous / logos / eros / mythos / psyche / sophia / anima.
 *
 * Used to verify that a dispatch's vak_address.cf matches the named agent.
 * Membership in this map IS the roster — only these seven names participate
 * in the cf-binding contract.
 *
 * Agent names outside this roster (e.g. Moirai subagents `klotho`/`lachesis`/
 * `atropos` operating under Aletheia, or the `_cfp3_fusion` sentinel used by
 * `dispatch_fusion_agents` to validate a CFP3 aggregate before fanning out)
 * INTENTIONALLY bypass the cf-binding enforcement. They still pass the
 * canonical-shape check (`isValidVakAddress`) but the `if (expected && ...)`
 * gate in `validateDispatchParams` short-circuits when the name is absent
 * from this map. This is the documented escape hatch for parallel rosters
 * that ride the same VAK plumbing without being part of the constitutional
 * seven — see `Body/S/S4/ta-onta/S4-4p-anima/extension.ts` (`MOIRAI_CF`) for
 * the parallel-roster pattern.
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

/**
 * The dialogical CPF polarity. When a dispatch carries this CPF (or no
 * vak_address at all), the system is in *Ouroboros / open-conversation* mode:
 *
 *   - VAK scaffolding is OPTIONAL
 *   - simple agent invocations, brainstorming, back-and-forth chat all flow freely
 *   - no canonical address is required, no agent/cf binding is enforced
 *
 * The complementary polarity "(4.0/1-4.4/5)" — and ANY other CPF value — keeps
 * the strict mechanistic path: full canonical VAK, cf must match agent, CFP1
 * required for parallel. Treating "unknown" as mechanistic prevents bypass paths.
 *
 * Architectural quote from the user:
 *   "(00/00) CPF is for open convo, no necessary vak scaffolding, can't have
 *    the system constrained for explorative or open chat, vak is the complex
 *    execution system but not all things are complex (like back and forth chat,
 *    simple invocations of logos or eros or whatever)"
 */
export const CPF_DIALOGICAL: CpfPolarity = "(00/00)" as const;

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
 * Is this dispatch in dialogical (open-conversation, Ouroboros) mode?
 *
 *   - vak_address absent                           → dialogical
 *   - vak_address.cpf === "(00/00)"                → dialogical
 *   - vak_address present with any other cpf       → mechanistic
 *
 * Mechanistic includes the canonical "(4.0/1-4.4/5)" polarity AND any unknown
 * cpf string — we err on the side of strict validation rather than open new
 * bypass paths.
 */
function isDialogical(params: DispatchParams): boolean {
  if (!params.vak_address) return true;
  const cpf = (params.vak_address as { cpf?: unknown }).cpf;
  return cpf === CPF_DIALOGICAL;
}

/**
 * Validate a single dispatch's parameters before firing.
 *
 * Two modes:
 *
 *   1. Dialogical / Ouroboros — CPF = "(00/00)" or vak_address absent.
 *      VAK is OPTIONAL. A partial vak_address (e.g. just { cpf: "(00/00)" })
 *      is accepted; we don't enforce CF/agent match, completeness, or canonical
 *      shape. This is the "brainstorming IS the VAK determination" register.
 *
 *   2. Mechanistic / Anima — CPF = "(4.0/1-4.4/5)" or any other (unknown) CPF.
 *      Full canonical isValidVakAddress check + agent-cf match. Same strict
 *      contract as the original A5 path.
 *
 * Roster-bypass escape hatch:
 *
 *   The `if (expected && ...)` gate on the agent/cf binding is deliberate.
 *   When `params.agent_name` is NOT a member of `AGENT_CF` (the constitutional
 *   7-fold roster), `expected` is `undefined` and the cf-match check is
 *   skipped. This is the documented escape hatch for parallel rosters that
 *   ride the same VAK plumbing without being part of the constitutional
 *   seven. Two known consumers today:
 *
 *     - Moirai subagents (`klotho` / `lachesis` / `atropos`) dispatched
 *       under Aletheia by `dispatch_moirai_night_pass` in
 *       `Body/S/S4/ta-onta/S4-4p-anima/extension.ts`. Their per-agent cf
 *       comes from the parallel `MOIRAI_CF` map, not `AGENT_CF`, so the
 *       roster check here would falsely reject canonical dispatches.
 *
 *     - The `_cfp3_fusion` sentinel passed by `dispatch_fusion_agents` to
 *       validate the aggregate vak_address before fanning the individual
 *       team-member dispatches. The sentinel is intentionally not a real
 *       agent name; the bypass lets the canonical-shape check run while
 *       skipping a binding that doesn't apply at the aggregate layer.
 *
 *   Canonical-shape validation (`isValidVakAddress`) still applies in both
 *   cases. The bypass is scoped strictly to the agent-name ↔ cf binding.
 *
 * Returns { ok: true } when the dispatch may proceed; otherwise { ok: false, error }
 * with a human-readable message suitable for surfacing to the caller.
 */
export function validateDispatchParams(params: DispatchParams): ValidationResult {
  if (isDialogical(params)) {
    // Dialogical: no required scaffolding. Whatever partial VAK fields the
    // caller chose to send are tolerated; we don't pry. Open conversation.
    return { ok: true };
  }
  // Mechanistic path — strict canonical VAK + agent/cf binding.
  if (!isValidVakAddress(params.vak_address)) {
    return { ok: false, error: "vak_address malformed (failed canonical validation)" };
  }
  const expected = AGENT_CF[params.agent_name];
  // Roster-bypass gate: `expected` is undefined for non-roster agent names
  // (Moirai subagents, `_cfp3_fusion` sentinel, etc.) — see the JSDoc above
  // and the AGENT_CF docblock for the full rationale and consumer list.
  if (expected && params.vak_address!.cf !== expected) {
    return {
      ok: false,
      error: `cf does not match agent ${params.agent_name} (expected ${expected}, got ${params.vak_address!.cf})`,
    };
  }
  return { ok: true };
}

/**
 * Validate a CFP1 (P-Thread) parallel dispatch.
 *
 * Per the VAK grammar, dispatch_parallel_agents is the P-Thread surface:
 * N different tasks, each running independently.
 *
 * Per-task mode applies:
 *   - Dialogical task (no vak_address, or cpf "(00/00)"): allowed without CFP1
 *   - Mechanistic task: must pass canonical VAK + carry cfp === "CFP1"
 *
 * If any task fails its mode-appropriate check, the whole batch is refused —
 * there's no partial-fan-out semantic at the parallel surface.
 */
export function validateParallelDispatch(input: { tasks: DispatchParams[] }): ValidationResult {
  if (!input.tasks || input.tasks.length === 0) {
    return { ok: false, error: "no tasks supplied to dispatch_parallel_agents" };
  }
  for (const t of input.tasks) {
    const v = validateDispatchParams(t);
    if (!v.ok) return v;
    // CFP1 enforcement only applies in mechanistic mode — dialogical parallels
    // (open brainstorm fan-outs) need no CFP1 ceremony.
    if (!isDialogical(t) && t.vak_address!.cfp !== "CFP1") {
      return {
        ok: false,
        error: `dispatch_parallel_agents requires CFP1 on every task (task for agent ${t.agent_name} declared ${t.vak_address!.cfp})`,
      };
    }
  }
  return { ok: true };
}

/**
 * Best-effort parse of a JSON-serialised VAK address (typically from
 * EPI_SESSION_VAK_ADDRESS). Returns `undefined` on parse failure or
 * non-object payload — callers should treat that as "no prev_vak" rather
 * than refusing dispatch on malformed env.
 *
 * Deliberately does NOT run isValidVakAddress: prev_vak in the guardrail
 * path is matched against partial-shape predicates (cf, ct, cpf fields
 * only), so a partial parse is still useful for transition detection.
 */
export function safeParseVak(json: string | undefined): Partial<VakAddress> | undefined {
  if (!json) return undefined;
  try {
    const parsed = JSON.parse(json);
    if (parsed && typeof parsed === "object") return parsed as Partial<VakAddress>;
  } catch {
    // fall through
  }
  return undefined;
}

/**
 * Canonical gate-trigger configuration for Anima dispatch guardrails (D5).
 *
 * Pairs the pure `matchGateTrigger` DSL (D4, S4-5p-aletheia) with the project's
 * gate semantics. Each trigger names a gate and the VAK condition that fires it:
 *
 *   - ql-gate         (informational): fires on CF transition INTO (00/00).
 *                     QL ground reentry — downstream tools may want to surface
 *                     "you've returned to receptive ground" feedback.
 *   - m-prime-gate    (informational): fires when next CT bucket includes CT4b.
 *                     Psyche fractal meta-frame — high-dialogical-shift signal.
 *   - rupa-gate       (BLOCKING): fires when next CT bucket includes CT3.
 *                     Pattern-bucket dispatches need a human gate; CT3 is the
 *                     processual-pattern slot whose autonomous execution is
 *                     not permitted without prior human-loop approval.
 *   - collab-gate     (BLOCKING): fires when next CPF is (00/00) AND risk > 0.7.
 *                     High-risk dialogical work needs collab — open-conversation
 *                     register with high risk score must route through a
 *                     collaborative approval surface, not a unilateral dispatch.
 */
export const CANONICAL_TRIGGERS: GateTrigger[] = [
  { gate: "ql-gate", on: { cf_transition_to: "(00/00)" } },
  { gate: "m-prime-gate", on: { ct_includes: "CT4b" } },
  { gate: "rupa-gate", on: { ct_includes: "CT3" } },
  { gate: "collab-gate", on: { cpf_equals: "(00/00)", risk_above: 0.7 } },
];

export interface GuardrailResult {
  allowed: boolean;
  gates_fired: GateName[];
}

/**
 * Run gate guardrails on a VAK transition. Returns whether dispatch is
 * allowed plus the list of gates that fired.
 *
 * BLOCKING gates (deny dispatch): collab-gate (high-risk dialogical),
 * rupa-gate (CT3 pattern bucket).
 *
 * NON-BLOCKING gates (informational): ql-gate (QL ground reentry),
 * m-prime-gate (Psyche fractal meta-frame). Fired but don't block — they
 * signal that downstream tools may want to react.
 *
 * The split between blocking and informational lives HERE, not in the
 * trigger DSL, because the DSL is purely declarative — it tells us *which*
 * gates fire on a transition. Whether a fired gate denies dispatch is a
 * policy decision local to Anima's dispatch path.
 */
export function dispatchGuardrails(
  state: { prev_vak?: Partial<VakAddress>; next_vak: Partial<VakAddress>; risk?: number },
  triggers: GateTrigger[],
): GuardrailResult {
  const fired = matchGateTrigger(triggers, {
    prev_vak: state.prev_vak,
    next_vak: state.next_vak,
    context: { risk: state.risk },
  });
  const BLOCKING: GateName[] = ["collab-gate", "rupa-gate"];
  const allowed = !fired.some((g) => BLOCKING.includes(g));
  return { allowed, gates_fired: fired };
}
