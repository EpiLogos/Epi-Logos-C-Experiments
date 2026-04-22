// composite-entry.ts

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { compositor } from "./spine/compositor.ts";
import { khoraSpineContribution } from "./khora/spine-contribution.ts";
import { henSpineContribution } from "./hen/spine-contribution.ts";
import { pleromaSpineContribution } from "./pleroma/spine-contribution.ts";
import { chronosSpineContribution } from "./chronos/spine-contribution.ts";
import { animaSpineContribution } from "./anima/spine-contribution.ts";
import { aletheiaSpineContribution } from "./aletheia/spine-contribution.ts";

export default async function taOntaCompositeEntry(api: ExtensionAPI) {
  // Register all S-layer spine contributions
  compositor.register(khoraSpineContribution());
  compositor.register(henSpineContribution());
  compositor.register(pleromaSpineContribution());
  compositor.register(chronosSpineContribution());
  compositor.register(animaSpineContribution());
  compositor.register(aletheiaSpineContribution());

  // Wire the four seams to PI events
  api.on("session_start", async () => {
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
  const { khoraExtension } = await import("./khora/extension.ts");
  const { henExtension } = await import("./hen/extension.ts");
  const { pleromaExtension } = await import("./pleroma/extension.ts");
  const { chronosExtension } = await import("./chronos/extension.ts");
  const { animaExtension } = await import("./anima/extension.ts");
  const { aletheiaExtension } = await import("./aletheia/extension.ts");

  await pluginRuntimeBridge(api);
  await khoraExtension(api);
  await henExtension(api);
  await pleromaExtension(api);
  await chronosExtension(api);
  await animaExtension(api);
  await aletheiaExtension(api);
}
