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
import { join } from "node:path";
import { buildSophiaDisclosure } from "../../S4-4p-anima/modules/sophia-hook.ts";
import { rehearPhaseVakAddress } from "./z-phase-vak.ts";

export interface PendingSophia {
  artifacts: string[];
  improvement_vectors: string[];
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
 * Lifecycle-side reader. Returns pending enrichment for sessionId (empty
 * defaults if none) AND clears the slot atomically. The caller is the
 * single writer.
 */
export function consumePendingSophia(sessionId: string): PendingSophia {
  const pending = _pendingSophia.get(sessionId) ?? {
    artifacts: [],
    improvement_vectors: [],
  };
  _pendingSophia.delete(sessionId);
  return pending;
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
 * Contract: Sophia disclosures are rehear-phase by definition. They represent
 * the post-execution synthesis state regardless of whether execution reached
 * canonical rehear or was force-closed mid-perform. We therefore always use
 * `rehearPhaseVakAddress()` as `final_vak`. The actual final in-flight VAK
 * (if any) is recoverable from `EPI_SESSION_VAK_ADDRESS` env or downstream
 * from session-record reads — a "force_closed vs rehear" discriminator is
 * deferred to a follow-up (see C1 NOTE in extension.ts).
 */
export function fireSophiaDisclosure(input: {
  session_id: string | null;
  day_id: string | null;
  artifacts: string[];
  improvement_vectors: string[];
}): { ok: true; path: string } | { ok: false; reason: string } {
  if (!input.session_id || !input.day_id) {
    return { ok: false, reason: "no session_id or day_id (session not initialised)" };
  }

  const final_vak = rehearPhaseVakAddress();

  const disclosure = buildSophiaDisclosure({
    session_id: input.session_id,
    day_id: input.day_id,
    final_vak,
    artifacts: input.artifacts,
    improvement_vectors: input.improvement_vectors,
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
