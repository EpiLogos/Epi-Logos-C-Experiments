import type { VakAddress } from "../../shared/vak_address.ts";

/**
 * Canonical AnimaInvokeRequest payload shape — mirrors the Rust struct in
 * `Body/S/S3/gateway/src/dispatch.rs::AnimaInvokeRequest` (D2, commit 89f7943).
 *
 * Field-for-field JSON wire-compatible with the gateway's `route_anima_invoke`
 * endpoint, so the same object can be serialised straight into the JSON-RPC
 * params.
 */
export interface AnimaInvokePayload {
  target_session_key: string;
  task: string;
  vak_address: VakAddress;
}

/**
 * Build the canonical AnimaInvokeRequest payload for the gateway's
 * `route_anima_invoke` endpoint. The factory is **target-agnostic** — the same
 * builder is the surface for both directions of cross-agent invocation:
 *
 *   - `anima_self_invoke` (S4-4p-anima/extension.ts)
 *     Anima invoking another Anima session (e.g. user-a's Anima reaches
 *     user-b's Anima for VAK evaluation).
 *
 *   - `epii_invoke_anima` (S4-5p-aletheia/extension.ts)
 *     Epii (via Aletheia, its tool surface for cross-agent dispatch) invoking
 *     Anima when the autoresearch recompose pass surfaces a question that
 *     needs a full VAK evaluation. This closes the user's Concern 2
 *     (Epii ↔ Anima bidirectional).
 *
 * The `target_session_key` follows the canonical `agent:role:user` pattern
 * used by the SessionStore (e.g., `agent:anima:user-b`).
 */
export function buildAnimaInvokePayload(input: {
  target_user: string;
  task: string;
  vak_address: VakAddress;
}): AnimaInvokePayload {
  return {
    target_session_key: `agent:anima:${input.target_user}`,
    task: input.task,
    vak_address: input.vak_address,
  };
}
