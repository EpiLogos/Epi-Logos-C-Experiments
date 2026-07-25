import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { animaExtension } from "./extension/mod.ts";

/*
 * Source-contract facade for S0 tests that intentionally inspect this file.
 * Runtime implementation now lives under ./extension/.
 *
 * S4 runtime modules:
 * ./S4/agent-team.ts
 * ./S4/agent-chain.ts
 * ./S4/subagent-widget.ts
 * ./S4/pi-pi.ts
 * ./S4/tilldone.ts
 *
 * Active-tool contract:
 * const animaDefaultTools = [
 * "vak_evaluate", "goal_prelude", "anima_orchestrate", "anima_arena_orchestrate", "nous_disclose",
 * "dispatch_agent", "dispatch_parallel_agents", "dispatch_fusion_agents", "dispatch_moirai_night_pass",
 * "anima_self_invoke", "run_chain", "subagent_create", "subagent_continue", "subagent_list",
 * "subagent_remove", "tilldone"
 * ]
 * api.on("session_start"
 * api.setActiveTools(animaDefaultTools)
 *
 * "tilldone" is the CFP4 (L-Thread) entry in that contract, and it is the one
 * entry Anima does NOT register (50.T50.06). The tool body and its
 * `pi.registerTool` call reside in Pleroma — bounded execution primitives are
 * Pleroma's coordinate, confirmed by 12.T12.11 — and it reaches an Anima
 * session through the Pleroma `execution_backbone` capability matrix. Copying
 * it here would give one law two sources. What Anima owns is the binding:
 * ./S4/tilldone.ts is the CFP4 completion-gate EXECUTOR (when may an L-Thread
 * close), and ./extension/dispatch.ts `ZTHREAD_TOOL_REGISTRY` records where the
 * registered tool actually lives so the CFP4 name can never dangle again.
 *
 * Runtime symbols preserved in modules:
 * type CSState
 * setCSState
 * sophiaReview
 * night_prime
 */

export { animaExtension };
export * from "./S4/tilldone.ts";
export * from "./extension/mod.ts";
export * from "./extension/capabilities.ts";
export * from "./extension/dispatch.ts";
export * from "./extension/tools.ts";
export * from "./extension/subscriptions.ts";
export * from "./lib/arena-orchestrator.ts";
export * from "./modules/reading-frame-evaluator.ts";

export default async function animaExtensionEntry(api: ExtensionAPI) {
  await animaExtension(api);
}
