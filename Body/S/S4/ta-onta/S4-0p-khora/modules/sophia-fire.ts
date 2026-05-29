// Sophia post-execution disclosure firing (C2 / Z-cycle rehear).
//
// Single-writer design (inversion pattern). The `khora_session_close` tool
// surface DOES NOT write to the Sophia inbox directly — instead it stashes
// caller-supplied artifacts + improvement_vectors into module-scope pending
// state via `recordPendingSophia`. The `session_shutdown` lifecycle handler
// is the ONLY writer to the inbox: it reads the pending state, clears it,
// and calls `fireSophiaDisclosure`. This guarantees exactly one JSONL line
// per session — Aletheia (C4) downstream never sees duplicates.
//
// Rationale: see I1 in the C2 review notes. Earlier dual-fire design where
// both surfaces wrote the JSONL line produced two entries (one enriched,
// one empty) whenever a caller invoked the tool before lifecycle close.

import { appendFileSync, mkdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import {
  buildSophiaDisclosure,
  type ClosureKind,
} from "../../S4-4p-anima/modules/sophia-hook.ts";
import {
  isValidVakAddress,
  type VakAddress,
} from "../../shared/vak_address.ts";
import { rehearPhaseVakAddress } from "./z-phase-vak.ts";

export interface PendingSophia {
  artifacts: string[];
  improvement_vectors: string[];
}

/**
 * Shape returned by `consumePendingSophia`. `had_pending` is the load-bearing
 * discriminant for `closure_kind`: true when `khora_session_close` was called
 * (deliberate rehear), false when the lifecycle handler fires without any
 * prior tool invocation (process killed mid-perform → force_closed).
 */
export interface ConsumedSophia extends PendingSophia {
  had_pending: boolean;
}

// Module-scope pending-disclosure state, keyed by session_id. The tool
// surface writes here; the lifecycle handler reads + deletes here.
const _pendingSophia = new Map<string, PendingSophia>();

/**
 * Tool-side recorder. Stashes caller-supplied enrichment for the upcoming
 * Sophia disclosure. Repeated calls for the same session_id overwrite —
 * last writer wins. The disclosure is NOT fired here.
 */
export function recordPendingSophia(
  sessionId: string,
  artifacts: string[],
  improvement_vectors: string[],
): void {
  _pendingSophia.set(sessionId, { artifacts, improvement_vectors });
}

/**
 * Lifecycle-side reader. Returns pending enrichment for sessionId AND clears
 * the slot atomically. The `had_pending` flag distinguishes "no recorded
 * entry" (tool never called → force_closed) from "recorded entry with empty
 * arrays" (tool called with no artifacts → still rehear). The caller is the
 * single writer.
 */
export function consumePendingSophia(sessionId: string): ConsumedSophia {
  const pending = _pendingSophia.get(sessionId);
  _pendingSophia.delete(sessionId);
  if (pending) {
    return {
      had_pending: true,
      artifacts: pending.artifacts,
      improvement_vectors: pending.improvement_vectors,
    };
  }
  return { had_pending: false, artifacts: [], improvement_vectors: [] };
}

/** Test-only: peek without consuming. */
export function peekPendingSophia(sessionId: string): PendingSophia | undefined {
  return _pendingSophia.get(sessionId);
}

/** Test-only: clear all pending state (between tests). */
export function clearAllPendingSophia(): void {
  _pendingSophia.clear();
}

/**
 * Fire the Sophia disclosure: build the canonical envelope and append it to
 * ${EPILOGOS_VAULT}/Pratibimba/Sophia/inbox/${session_id}.jsonl.
 *
 * Contract: `closure_kind` is the load-bearing discriminator distinguishing
 * deliberate rehear ("rehear" — `khora_session_close` was called, signalled
 * via `recordPendingSophia` having stashed state) from force-closed mid-perform
 * ("force_closed" — lifecycle event fired without the explicit tool call).
 * The C2 fix (commit 8522b4e) dropped the dishonest env-VAK heuristic — this
 * is the honest replacement.
 *
 * `final_vak` defaults to `rehearPhaseVakAddress()`. For the force_closed
 * branch we additionally attempt a best-effort read of the live SessionRecord
 * via `epi gate sessions get` (added alongside `patch` in this change — the
 * C1 follow-up at 19fbc8fc made sessions.patch persist `vak_address` and
 * sessions.resolve return it). If that read returns a valid VakAddress, we
 * use it as `final_vak` — truthfully reporting where the session was when
 * killed. Silent fallback to rehearPhase if the gateway read fails for any
 * reason (CLI absent, gateway not running, parse error, etc.).
 */
export function fireSophiaDisclosure(input: {
  session_id: string | null;
  day_id: string | null;
  artifacts: string[];
  improvement_vectors: string[];
  closure_kind: ClosureKind;
}): { ok: true; path: string } | { ok: false; reason: string } {
  if (!input.session_id || !input.day_id) {
    return { ok: false, reason: "no session_id or day_id (session not initialised)" };
  }

  let final_vak = rehearPhaseVakAddress();
  if (input.closure_kind === "force_closed") {
    const recovered = trySafeReadSessionVak(input.session_id);
    if (recovered) final_vak = recovered;
  }

  const disclosure = buildSophiaDisclosure({
    session_id: input.session_id,
    day_id: input.day_id,
    final_vak,
    artifacts: input.artifacts,
    improvement_vectors: input.improvement_vectors,
    closure_kind: input.closure_kind,
  });

  const vaultRoot = process.env.EPILOGOS_VAULT;
  if (!vaultRoot) {
    return { ok: false, reason: "EPILOGOS_VAULT not set" };
  }
  const inboxDir = join(vaultRoot, "Pratibimba", "Sophia", "inbox");
  mkdirSync(inboxDir, { recursive: true });
  const inboxPath = join(inboxDir, `${input.session_id}.jsonl`);
  appendFileSync(inboxPath, JSON.stringify(disclosure) + "\n", "utf8");
  return { ok: true, path: inboxPath };
}

/**
 * Best-effort read of the live SessionRecord's `vak_address` via the gateway
 * CLI. Returns `undefined` on any failure — caller falls back to
 * `rehearPhaseVakAddress()`. Pure-side-effect-free from the caller's POV:
 * any error path is silently swallowed.
 *
 * Relies on `epi gate sessions get --session-id <id>` printing a JSON object
 * whose `vakAddress`/`vak_address` field is a canonical VakAddress.
 */
function trySafeReadSessionVak(sessionId: string): VakAddress | undefined {
  try {
    const result = spawnSync(
      "epi",
      ["gate", "sessions", "get", "--session-id", sessionId],
      { encoding: "utf8" },
    );
    if (result.status !== 0) return undefined;
    const stdout = result.stdout?.trim();
    if (!stdout) return undefined;
    const record = JSON.parse(stdout) as Record<string, unknown>;
    const vak = (record.vakAddress ?? record.vak_address) as unknown;
    if (vak && isValidVakAddress(vak)) return vak;
    return undefined;
  } catch {
    return undefined;
  }
}
