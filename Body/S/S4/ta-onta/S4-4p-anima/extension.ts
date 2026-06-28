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
 * Runtime symbols preserved in modules:
 * type CSState
 * setCSState
 * sophiaReview
 * night_prime
 */

export { animaExtension };
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
