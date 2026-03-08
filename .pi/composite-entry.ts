import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

export async function main(_api: ExtensionAPI) {
  await import("./extensions/epi-citta.ts");
  await import("./extensions/cross-agent.ts");
  await import("./extensions/subagent-widget.ts");
  await import("./extensions/agent-team.ts");
  await import("./extensions/agent-chain.ts");
  await import("./extensions/child-extension-propagation.ts");
  await import("./extensions/prompt-url-widget.ts");
  await import("./extensions/redraws.ts");
  await import("./extensions/themeMap.ts");
  await import("./extensions/pleroma-primitives.ts");
}
