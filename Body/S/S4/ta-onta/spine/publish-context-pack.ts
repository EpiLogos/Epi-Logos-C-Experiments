/**
 * Coordinate: S4' (ta-onta spine — context-pack publisher CLI)
 * Residency: Body/S/S4/ta-onta/spine
 * Position (#n): the out-of-band publish entry for `s4'.context.assemble`.
 * Actualises: 51.T51.1 — assembles the six real ta-onta carriers through THE
 *   assembler (`SpineCompositor.assembleContextPack`) using the same
 *   registration list a live session uses, publishes the pack to the gate
 *   state root, and prints it. Lets an operator see what the next session will
 *   be given, and lets the e2e harness stand up a genuine pack against the
 *   real gateway without booting a model.
 * Public surface: main (CLI). Import `registerTaOntaSpine` for programmatic use.
 * Does NOT own: assembly, the path law (spine/context-pack-store.ts), or the
 *   gateway handler.
 *
 * Usage:
 *   node --experimental-strip-types spine/publish-context-pack.ts [--session <key>]
 */

import { SpineCompositor } from "./compositor.ts";
import {
  contextPackSessionKey,
  gateStateRootFromEnv,
  publishContextPack,
} from "./context-pack-store.ts";
import { registerTaOntaSpine } from "../composite-entry.ts";
import { pathToFileURL } from "node:url";

export async function publishLiveContextPack(sessionKey?: string, stateRoot?: string) {
  const compositor = registerTaOntaSpine(new SpineCompositor());
  const pack = await compositor.assembleContextPack(sessionKey ?? contextPackSessionKey());
  const path = publishContextPack(pack, stateRoot ?? gateStateRootFromEnv());
  return { pack, path };
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const sessionFlag = argv.indexOf("--session");
  const sessionKey = sessionFlag >= 0 ? argv[sessionFlag + 1] : undefined;
  const { pack, path } = await publishLiveContextPack(sessionKey);
  process.stdout.write(`${JSON.stringify({ path, pack }, null, 2)}\n`);
}

// pathToFileURL, not a `file://${argv[1]}` template: the repo path contains a
// space, which import.meta.url percent-encodes and a raw template does not — so
// the naive comparison silently never fires and the CLI prints nothing.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(err => {
    console.error(`[spine] context pack publish failed: ${err}`);
    process.exitCode = 1;
  });
}
