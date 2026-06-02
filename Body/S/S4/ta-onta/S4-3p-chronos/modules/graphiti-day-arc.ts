// chronos/modules/graphiti-day-arc.ts
//
// Chronos's seam to the Graphiti temporal Saga runtime for day-level arcs.
//
// S4-3'-SPEC §"Boundaries": Graphiti is an adjacent runtime owned by S3'/S5'
// seams, not by Chronos alone. §"Test Obligations": "Graphiti day arc tests must
// be non-fatal when the sidecar is unavailable." This module is the single owner
// of the day-arc open/close request shape so the tool surface, the day-init
// fire-and-forget, and the archive-day close can never drift apart — and so the
// non-fatal contract is enforced in exactly one place.
//
// Uses the global fetch (node builtin) only. Importable by carrier tests without
// typebox, so the non-fatal path can be exercised against an unreachable base.

export const DEFAULT_GRAPHITI_BASE = "http://localhost:37778";

export interface DayArcResult {
  /** True iff the sidecar accepted the request (HTTP reached, any status). */
  ok: boolean;
  /** True iff the sidecar was unreachable and the call degraded non-fatally. */
  skipped: boolean;
  /** HTTP status when reached. */
  status?: number;
  /** Response body text when reached. */
  body?: string;
  /** Reason string when skipped. */
  reason?: string;
}

/**
 * Open or close the day-level Graphiti arc (`day:{dayId}`).
 *
 * NEVER throws. If the sidecar is unreachable the call degrades to
 * `{ ok: false, skipped: true }` — ordinary S4 operation must not depend on
 * Graphiti being up. Open uses QL0 / (00/00) / ct:2; close uses QL5 / (5/0) /
 * ct:1 — the canonical Möbius framing already used inline in extension.ts.
 */
export async function dayArc(input: {
  action: "open" | "close";
  dayId: string;
  graphitiBase?: string;
  metadata?: Record<string, unknown>;
  timeoutMs?: number;
}): Promise<DayArcResult> {
  const base = input.graphitiBase ?? process.env.GRAPHITI_URL ?? DEFAULT_GRAPHITI_BASE;
  const arcId = `day:${input.dayId}`;
  const timeout = input.timeoutMs ?? 5000;

  const payload =
    input.action === "open"
      ? {
          arc_id: arcId,
          arc_type: "day",
          ql_position: "ql0",
          cpf: "(00/00)",
          ct: 2,
          metadata: { ...(input.metadata ?? {}), day_id: input.dayId },
        }
      : {
          arc_id: arcId,
          ql_position: "ql5",
          cpf: "(5/0)",
          ct: 1,
          metadata: { ...(input.metadata ?? {}), day_id: input.dayId },
        };

  const endpoint = `${base}/arc/${input.action}`;

  try {
    const resp = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(timeout),
    });
    const body = await resp.text();
    return { ok: true, skipped: false, status: resp.status, body };
  } catch (e) {
    // Sidecar not running / timed out — non-fatal by contract.
    return { ok: false, skipped: true, reason: String(e) };
  }
}

/** Human-readable line for the chronos_graphiti_day_arc tool output. */
export function formatDayArcResult(action: "open" | "close", dayId: string, r: DayArcResult): string {
  const arcId = `day:${dayId}`;
  if (r.skipped) {
    return `chronos_graphiti_day_arc: graphiti not reachable (${r.reason}) — skipped`;
  }
  return `day arc ${action === "open" ? "opened" : "closed"}: ${arcId}\n${r.body ?? ""}`;
}
