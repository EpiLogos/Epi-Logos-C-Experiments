import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import registerAgentTeam from "../S4/agent-team.ts";
import registerAgentChain from "../S4/agent-chain.ts";
import registerSubagentWidget from "../S4/subagent-widget.ts";
import registerPiPi from "../S4/pi-pi.ts";
import { registerAnimaSubscriptions } from "./subscriptions.ts";
import { registerAnimaTools } from "./tools.ts";
import { clearCurrentRun, openCurrentRun } from "../lib/orchestration-run.ts";

export async function animaExtension(api: ExtensionAPI) {
  registerAgentTeam(api);
  registerAgentChain(api);
  registerSubagentWidget(api);
  registerAnimaTools(api);
  registerAnimaSubscriptions(api);

  // ── 50.T50.05: Anima owns the top-level orchestration run ────────────────
  // The script and its context live in THIS parent session — that is Anima's
  // role: managing sub-process runs. The run is opened for the session's
  // lifetime and cleared on shutdown. Children (teams/chains/modes) never hold
  // run state; they receive only their declared inputs, never this context.
  api.on("session_start", (_event, ctx) => {
    const sessionId =
      process.env.EPI_SESSION_ID || (ctx as any)?.sessionId || "anima-session";
    openCurrentRun(`anima-run:${sessionId}`);
  });
  api.on("session_shutdown", () => {
    clearCurrentRun();
  });

  // Pi-Pi only loads when EPI_AGENT_MODE=pipi (via `epi agent pipi`)
  if (process.env.EPI_AGENT_MODE === "pipi") {
    registerPiPi(api);
  }
}

export default async function animaExtensionEntry(api: ExtensionAPI) {
  await animaExtension(api);
}
