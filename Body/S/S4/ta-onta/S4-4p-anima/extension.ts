import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
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
 * "tilldone" is in that contract as a CAPABILITY, not as any CFP's tool. Threads
 * are shapes and tools are capabilities (./lib/thread-shape.ts): a CFP does not
 * name a tool, which is why `conventionalToolFor("CFP4")` is `null` — "Long" is
 * a duration/completion property, not a dispatch primitive. `tilldone` is a
 * completion DISCIPLINE offered to any shape declaring `completion: "till-done"`.
 *
 * It is also the one entry Anima does NOT register. The tool body and its
 * `pi.registerTool` call reside in Pleroma — bounded execution primitives are
 * Pleroma's coordinate, confirmed by 12.T12.11 — reaching an Anima session
 * through the Pleroma `execution_backbone` capability matrix. What Anima owns is
 * ./S4/tilldone.ts, the executor deciding when a run-till-done thread may close.
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
