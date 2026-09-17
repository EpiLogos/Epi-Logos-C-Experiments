/**
 * Coordinate: S4' (ta-onta spine — context-pack publication)
 * Residency: Body/S/S4/ta-onta/spine
 * Position (#n): the publish side of the `s4'.context.assemble` seam.
 * Actualises: 51.T51.1 — the assembled session-context pack is written to the
 *   gate state root at the same moment it is injected, so the gateway can
 *   SERVE the pack the model was actually given rather than re-assemble a
 *   second one. The Rust adapter (`epi-cli/src/gate/anima.rs::context_assemble`)
 *   reads exactly this file; the path law below and its Rust twin must agree.
 * Public surface: gateStateRootFromEnv, contextPackSessionKey, slugSessionKey,
 *   contextPackPath, publishContextPack, readContextPack.
 * Does NOT own: assembly (spine/compositor.ts owns the one assembler), the
 *   gateway method, or session identity (S0 sets EPI_SESSION_ID).
 */

import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import type { ContextPack } from "./types.ts";

/**
 * Mirror of `epi-cli/src/gate/config.rs::gate_root_from_env` — EPI_GATE_STATE_ROOT
 * when set, otherwise `$HOME/.epi/gate`. Both sides must resolve the same root
 * or the gateway serves a pack from a directory nothing writes.
 */
export function gateStateRootFromEnv(): string {
  const configured = process.env.EPI_GATE_STATE_ROOT;
  if (configured && configured.length > 0) return configured;
  return join(homedir(), ".epi", "gate");
}

/** The session this process is assembling for; khora reads the same variable. */
export function contextPackSessionKey(): string {
  const sessionId = process.env.EPI_SESSION_ID;
  return sessionId && sessionId.length > 0 ? sessionId : "main";
}

/** Mirror of `epi-cli/src/gate/anima.rs::slug` — non `[A-Za-z0-9_-]` becomes `_`. */
export function slugSessionKey(sessionKey: string): string {
  let out = "";
  for (const ch of sessionKey) {
    out += /[A-Za-z0-9_-]/.test(ch) ? ch : "_";
  }
  return out;
}

/** `<state-root>/s4/context-pack/<slug>.json` — the twin of the Rust path builder. */
export function contextPackPath(stateRoot: string, sessionKey: string): string {
  return join(stateRoot, "s4", "context-pack", `${slugSessionKey(sessionKey)}.json`);
}

/**
 * Write the pack atomically (temp + rename) so a reader never observes a
 * half-written pack, and return the path written.
 */
export function publishContextPack(
  pack: ContextPack,
  stateRoot: string = gateStateRootFromEnv(),
): string {
  const path = contextPackPath(stateRoot, pack.sessionKey);
  mkdirSync(dirname(path), { recursive: true });
  const temp = `${path}.${process.pid}.tmp`;
  writeFileSync(temp, JSON.stringify(pack, null, 2), "utf8");
  renameSync(temp, path);
  return path;
}

/** Read a published pack, or null when this session has never assembled one. */
export function readContextPack(
  stateRoot: string,
  sessionKey: string,
): ContextPack | null {
  try {
    const body = readFileSync(contextPackPath(stateRoot, sessionKey), "utf8");
    return JSON.parse(body) as ContextPack;
  } catch {
    return null;
  }
}
