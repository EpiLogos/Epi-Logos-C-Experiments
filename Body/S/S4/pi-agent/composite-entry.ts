import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export async function main(api: ExtensionAPI) {
  // ── 50.T50.01: code-mode (single-script tool execution) for every pi agent ──
  // Registers `run_tool_script` so a multi-tool task can be composed as ONE
  // TypeScript program instead of a JSON call staircase that re-sends the whole
  // conversation per hop. JSON tool-mode remains the substrate and the fallback;
  // this makes the script path the default *usage* for tasks touching >= 2 tools.
  // The security boundary is unchanged: the `--tools` allow-list at spawn plus
  // `isEntitled()` at dispatch, both applied by `lib/code-mode.ts`.
  //
  // Registered FIRST and self-contained (node builtins + the entitlement core
  // only), so the base tool-scripting path never depends on a carrier's
  // dependency surface.
  //
  // KNOWN PRE-EXISTING BLOCKER (not introduced here, and not fixed here): the
  // unguarded `../ta-onta/composite-entry.ts` import below currently THROWS in
  // both the Body source tree and the managed `~/.epi/agents/*/agent` tree —
  // `S4-2p-pleroma/S2/damage-control.ts` requires `yaml`, which resolves in
  // neither. Because that throw escapes `main()`, pi aborts the whole extension
  // load, so ordering alone does NOT rescue code-mode here. Until that carrier
  // dependency is resolved, load code-mode directly:
  //   pi --extension Body/S/S4/pi-agent/extensions/code-mode.ts
  // Making a carrier load failure non-fatal would change composite-entry's
  // startup semantics — a contract decision for the Architect, not a side effect
  // of this tranche.
  try {
    const { default: codeModeExtension } = await import("./extensions/code-mode.ts");
    await codeModeExtension(api);
  } catch {
    /* code-mode unavailable => agents fall back to JSON tool-mode (no-op) */
  }

  const { default: taOntaCompositeEntry } = await import("../ta-onta/composite-entry.ts");
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

  // ── 12.T12.10: capability-parity live-assertion (Pi owns the capability gate) ──
  // At Pi startup, query the gateway `s4'.mediation.capabilities.list` surface and
  // assert the gateway-exposed mediation capability set is in parity with Pi's
  // local capability-matrix view (close the GraphRAG side-door across the S0/S3/S4
  // boundary). Pi — NOT the ACR — owns this gate. Until a gateway RPC client is
  // injected the fetcher returns null and the check defers (a parity gate, not a
  // liveness requirement); a reachable-but-drifted gateway is logged loudly. Every
  // step is wrapped so the load-bearing Pi launch is never broken.
  try {
    const { assertGatewayCapabilityParityAtStartup } = await import(
      "./lib/capability-parity.ts"
    );
    api.on("session_start", async (_event, ctx) => {
      try {
        const fetcher = (ctx as any)?.gatewayCapabilityFetcher ?? (() => null);
        await assertGatewayCapabilityParityAtStartup(fetcher, {
          strict: false,
          log: (message) => {
            try {
              (api as any)?.log?.(message);
            } catch {
              /* logging is best-effort */
            }
          },
        });
      } catch {
        /* never break startup on the parity gate */
      }
    });
  } catch {
    /* parity module unavailable => capability gate stays inert (no-op) */
  }
}

export default async function compositeEntry(api: ExtensionAPI) {
  await main(api);
}
