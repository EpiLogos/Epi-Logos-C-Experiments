import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import registerAgentTeam from "../S4/agent-team.ts";
import registerAgentChain from "../S4/agent-chain.ts";
import registerSubagentWidget from "../S4/subagent-widget.ts";
import registerPiPi from "../S4/pi-pi.ts";
import { registerAnimaSubscriptions } from "./subscriptions.ts";
import { registerAnimaTools } from "./tools.ts";

export async function animaExtension(api: ExtensionAPI) {
  registerAgentTeam(api);
  registerAgentChain(api);
  registerSubagentWidget(api);
  registerAnimaTools(api);
  registerAnimaSubscriptions(api);

  // Pi-Pi only loads when EPI_AGENT_MODE=pipi (via `epi agent pipi`)
  if (process.env.EPI_AGENT_MODE === "pipi") {
    registerPiPi(api);
  }
}

export default async function animaExtensionEntry(api: ExtensionAPI) {
  await animaExtension(api);
}
