// composite-entry.ts

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { compositor, SpineCompositor } from "./spine/compositor.ts";
import { publishContextPack } from "./spine/context-pack-store.ts";
import { khoraSpineContribution } from "./S4-0p-khora/spine-contribution.ts";
import { henSpineContribution } from "./S4-1p-hen/spine-contribution.ts";
import { pleromaSpineContribution } from "./S4-2p-pleroma/spine-contribution.ts";
import { chronosSpineContribution } from "./S4-3p-chronos/spine-contribution.ts";
import { animaSpineContribution } from "./S4-4p-anima/spine-contribution.ts";
import { aletheiaSpineContribution } from "./S4-5p-aletheia/spine-contribution.ts";

/**
 * The six ta-onta carriers, in spine order. THE registration list — the entry
 * point and the `s4'.context.assemble` publisher both call this, so a pack
 * published out-of-band carries the same carriers a live session injects.
 */
export function registerTaOntaSpine(target: SpineCompositor = compositor): SpineCompositor {
  target.register(khoraSpineContribution());
  target.register(henSpineContribution());
  target.register(pleromaSpineContribution());
  target.register(chronosSpineContribution());
  target.register(animaSpineContribution());
  target.register(aletheiaSpineContribution());
  return target;
}

/** The literal prefix the session context is injected under. */
export const SESSION_CONTEXT_HEADING = "\n\n---\n\n## Session Context\n\n";

/**
 * THE `before_agent_start` handler — exported so a test drives the very
 * function the seam registers, not a re-statement of it.
 *
 * 51.T51.1: assemble ONCE, publish that same object, inject `pack.injection`.
 * The gateway serves the published pack, so what the model got and what an
 * operator sees are one object — not two assemblies that can silently drift.
 * A publish failure must never cost the session its context, so it degrades to
 * a warning: the injection is the load-bearing path, the pack is the view.
 */
export async function assembleAndPublishSessionContext(): Promise<{ systemPrompt: string }> {
  const pack = await compositor.assembleContextPack();
  try {
    publishContextPack(pack);
  } catch (e) {
    console.warn(`[spine] context pack publish failed: ${e}`);
  }
  return { systemPrompt: `${SESSION_CONTEXT_HEADING}${pack.injection}` };
}

export default async function taOntaCompositeEntry(api: ExtensionAPI) {
  // Register all S-layer spine contributions
  registerTaOntaSpine();

  // Wire the four seams to PI events.
  //
  // `before_agent_start`, NOT `session_start`: pi types the session_start
  // handler with no result, so the systemPrompt returned there was discarded
  // and the spine injection never reached the model. This is the same seam
  // `S4-4p-anima/extension/subscriptions.ts` already uses to inject the VAK
  // skills.
  api.on("before_agent_start", assembleAndPublishSessionContext);

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
