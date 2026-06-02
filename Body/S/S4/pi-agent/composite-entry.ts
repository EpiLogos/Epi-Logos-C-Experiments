import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

export async function main(api: ExtensionAPI) {
  const { default: taOntaCompositeEntry } = await import("./extensions/ta-onta/composite-entry.ts");
  await taOntaCompositeEntry(api);

  // ── epii skill/tool entitlement activation (defensive, no-op if not epii) ──
  // Loads the staged tool-gate and, for the epii persona, computes its effective
  // entitlement from its agent-contract.json and takes the tool_call hard-gate
  // LIVE + filters the prompt-injected skill manifest. Every step degrades to a
  // no-op (debug log only) if anything is absent, so the load-bearing epii pi
  // launch is never broken and never denies-all.
  try {
    const { default: epiiEntitlementActivation } = await import(
      "./extensions/epii-entitlement-activation.ts"
    );
    // The tool universe is only fully populated once tools are registered, so
    // run activation on session_start (mirrors system-select.ts:getActiveTools).
    api.on("session_start", async (_event, ctx) => {
      try {
        await epiiEntitlementActivation(api as any, { cwd: ctx?.cwd });
      } catch {
        /* never break startup */
      }
    });
  } catch {
    /* activation module unavailable => entitlement gate stays inert (no-op) */
  }
}

export default async function compositeEntry(api: ExtensionAPI) {
  await main(api);
}
