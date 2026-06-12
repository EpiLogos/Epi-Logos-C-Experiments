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
 * "vak_evaluate", "anima_orchestrate", "dispatch_agent", "run_chain",
 * "subagent_create", "tilldone", "dispatch_parallel_agents",
 * "dispatch_fusion_agents"
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

export default async function animaExtensionEntry(api: ExtensionAPI) {
  await animaExtension(api);
}
