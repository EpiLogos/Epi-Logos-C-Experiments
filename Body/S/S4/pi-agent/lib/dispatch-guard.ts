/**
 * dispatch-guard.ts — Vama Shakti dialogue-only dispatch enforcement (Tranche 41.4).
 *
 * A Vama Shakti is the active animating descent of a /World entity into dialogue
 * (summoned via `techne_vama_summon`, classified egregore/sprite/daemon/mantra).
 * Per DR-VAMA-5 every Vama Shakti carries a FROZEN dialogue-only capability
 * profile: it may emit dialogue and nothing else. No system tools, no vault
 * write, no subagent dispatch, no terminal authority.
 *
 * This guard is STRUCTURAL, not configurable. The dispatch path verifies
 * `capability_profile.dialogue_only === true` and that the requested tool is the
 * single dialogue-emission primitive before ANY tool invocation. Every other
 * tool invocation by a Vama Shakti is refused at dispatch time with a typed
 * `VamaShaktiDispatchRefused` error.
 *
 * Canon: [[S4-SPEC]] -> Vama Shakti summon law (DR-VAMA-5/6).
 * Mirrors the Rust capability shape in `Body/S/S0/portal-core/src/vama_shakti.rs`.
 */

export type VamaShaktiClass = "egregore" | "sprite" | "daemon" | "mantra";

/**
 * The ONLY tool a Vama Shakti is permitted to invoke. Dialogue emission is the
 * dialogue-only primitive; everything else is structurally refused.
 */
export const DIALOGUE_EMISSION_PRIMITIVE = "vama_shakti_dialogue_emit" as const;

/**
 * Frozen dialogue-only capability profile (DR-VAMA-5). The literal `true`/`false`
 * field types make any tampering a type error at compile time AND a runtime
 * refusal via {@link isDialogueOnlyProfile}.
 */
export interface DialogueOnlyCapabilityProfile {
  readonly dialogue_only: true;
  readonly system_tools_granted: never[];
  readonly vault_write: false;
  readonly subagent_dispatch: false;
  readonly terminal_authority: false;
}

/**
 * The canonical singleton profile. Deep-frozen so it cannot be mutated in place
 * after a Vama Shakti has been registered with it.
 */
export const DIALOGUE_ONLY_CAPABILITY_PROFILE: DialogueOnlyCapabilityProfile = Object.freeze({
  dialogue_only: true as const,
  system_tools_granted: Object.freeze([]) as never[],
  vault_write: false as const,
  subagent_dispatch: false as const,
  terminal_authority: false as const,
});

export type VamaShaktiDispatchRefusalCode =
  | "DR-VAMA-5/profile-tampered"
  | "DR-VAMA-5/non-dialogue-tool";

/**
 * Typed refusal raised when a Vama Shakti attempts anything other than dialogue
 * emission. Carries the offending tool name and the speaker identity handle so
 * the dispatch site can log/route the refusal deterministically.
 */
export class VamaShaktiDispatchRefused extends Error {
  readonly code: VamaShaktiDispatchRefusalCode;
  readonly tool_name: string;
  readonly identity_handle: string;

  constructor(
    code: VamaShaktiDispatchRefusalCode,
    tool_name: string,
    identity_handle: string,
    message: string,
  ) {
    super(message);
    this.name = "VamaShaktiDispatchRefused";
    this.code = code;
    this.tool_name = tool_name;
    this.identity_handle = identity_handle;
  }
}

/**
 * Runtime guard that the supplied profile is the canonical dialogue-only shape.
 * A profile that has been swapped, mutated, or constructed with any capability
 * widened fails this check — there is no configuration that loosens it.
 */
export function isDialogueOnlyProfile(
  profile: unknown,
): profile is DialogueOnlyCapabilityProfile {
  if (typeof profile !== "object" || profile === null) {
    return false;
  }
  const p = profile as Record<string, unknown>;
  return (
    p.dialogue_only === true &&
    Array.isArray(p.system_tools_granted) &&
    p.system_tools_granted.length === 0 &&
    p.vault_write === false &&
    p.subagent_dispatch === false &&
    p.terminal_authority === false
  );
}

export interface VamaShaktiDispatchRequest {
  identity_handle: string;
  capability_profile: unknown;
  tool_name: string;
}

/**
 * Verify a Vama Shakti tool invocation BEFORE it is dispatched.
 *
 * Throws {@link VamaShaktiDispatchRefused}:
 *  - `DR-VAMA-5/profile-tampered` if the capability profile is not the frozen
 *    dialogue-only shape.
 *  - `DR-VAMA-5/non-dialogue-tool` if the requested tool is anything other than
 *    the dialogue-emission primitive.
 *
 * Returns normally only for the single permitted dialogue-emission call.
 * Structural; not configurable.
 */
export function guardVamaShaktiDispatch(req: VamaShaktiDispatchRequest): void {
  if (!isDialogueOnlyProfile(req.capability_profile)) {
    throw new VamaShaktiDispatchRefused(
      "DR-VAMA-5/profile-tampered",
      req.tool_name,
      req.identity_handle,
      `Refused per DR-VAMA-5: Vama Shakti ${req.identity_handle} carries a frozen dialogue-only capability profile; the profile presented at dispatch is not the canonical dialogue-only shape.`,
    );
  }
  if (req.tool_name !== DIALOGUE_EMISSION_PRIMITIVE) {
    throw new VamaShaktiDispatchRefused(
      "DR-VAMA-5/non-dialogue-tool",
      req.tool_name,
      req.identity_handle,
      `Refused per DR-VAMA-5: Vama Shakti ${req.identity_handle} is dialogue-only. Tool "${req.tool_name}" is not the dialogue-emission primitive "${DIALOGUE_EMISSION_PRIMITIVE}" and cannot be invoked.`,
    );
  }
}

/**
 * Non-throwing variant: returns `true` if the invocation would be permitted.
 * Convenience for call sites that want a boolean gate rather than a throw.
 */
export function isVamaShaktiDispatchPermitted(req: VamaShaktiDispatchRequest): boolean {
  return isDialogueOnlyProfile(req.capability_profile) && req.tool_name === DIALOGUE_EMISSION_PRIMITIVE;
}
