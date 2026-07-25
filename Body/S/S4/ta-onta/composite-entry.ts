// composite-entry.ts

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { compositor } from "./spine/compositor.ts";
import { khoraSpineContribution } from "./S4-0p-khora/spine-contribution.ts";
import { henSpineContribution } from "./S4-1p-hen/spine-contribution.ts";
import { pleromaSpineContribution } from "./S4-2p-pleroma/spine-contribution.ts";
import { chronosSpineContribution } from "./S4-3p-chronos/spine-contribution.ts";
import { animaSpineContribution } from "./S4-4p-anima/spine-contribution.ts";
import { aletheiaSpineContribution } from "./S4-5p-aletheia/spine-contribution.ts";

export default async function taOntaCompositeEntry(api: ExtensionAPI) {
  // Register all S-layer spine contributions
  compositor.register(khoraSpineContribution());
  compositor.register(henSpineContribution());
  compositor.register(pleromaSpineContribution());
  compositor.register(chronosSpineContribution());
  compositor.register(animaSpineContribution());
  compositor.register(aletheiaSpineContribution());

  // Wire the four seams to PI events.
  //
  // `before_agent_start`, NOT `session_start`: pi types the session_start
  // handler with no result, so the systemPrompt returned there was discarded
  // and the spine injection never reached the model. This is the same seam
  // `S4-4p-anima/extension/subscriptions.ts` already uses to inject the VAK
  // skills.
  api.on("before_agent_start", async () => {
    const injection = await compositor.assembleInjection();
    return {
      systemPrompt: `\n\n---\n\n## Session Context\n\n${injection}`,
    };
  });

  api.on("session_shutdown", async () => {
    const sessionId = process.env.EPI_SESSION_ID ?? "unknown";
    const dayId = process.env.EPI_DAY_ID ?? new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
    const nowPath = process.env.EPI_NOW_PATH ?? null;
    await compositor.extractToLedger({ sessionId, dayId, nowPath });
  });

  api.on("session_before_compact", async () => {
    const sessionId = process.env.EPI_SESSION_ID ?? "unknown";
    const dayId = process.env.EPI_DAY_ID ?? new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
    await compositor.extractToLedger({ sessionId, dayId, nowPath: process.env.EPI_NOW_PATH ?? null });
  });

  // Load extension tools (tool registrations unchanged)
  const { default: pluginRuntimeBridge } = await import("./plugin-runtime-bridge.ts");
  const { khoraExtension } = await import("./S4-0p-khora/extension.ts");
  const { henExtension } = await import("./S4-1p-hen/extension.ts");
  const { pleromaExtension } = await import("./S4-2p-pleroma/extension.ts");
  const { chronosExtension } = await import("./S4-3p-chronos/extension.ts");
  const { animaExtension } = await import("./S4-4p-anima/extension.ts");
  const { aletheiaExtension } = await import("./S4-5p-aletheia/extension.ts");

  await pluginRuntimeBridge(api);
  await khoraExtension(api);
  await henExtension(api);
  await pleromaExtension(api);
  await chronosExtension(api);
  await animaExtension(api);
  await aletheiaExtension(api);
}
