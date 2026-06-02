// chronos/modules/temporal-frame.ts
//
// Chronos carrier law for the temporal frame under which every S4' dispatch runs.
//
// Build Contract (S4-3'-SPEC §"Build Contract"):
//   "Every dispatch must know its temporal frame: day id, NOW path, session id,
//    CS direction, and whether the run is Day, Night', cron, or manual."
//
// This module owns the deterministic part of that contract — the part that does
// NOT require a live `epi`/Graphiti runtime. The I/O-bound triggers (folder
// creation, archive rotation) stay in extension.ts and delegate to Hen/Khora.
//
// Pure: node builtins only. Importable by carrier tests without typebox.

/** How a Chronos-conditioned run was initiated. */
export type RunKind = "Day" | "Night'" | "cron" | "manual";

/** CS traversal direction. Day runs flow outward; Night' runs fold back (Möbius). */
export type CsDirection = "Day" | "Night'";

export interface TemporalFrame {
  /** Day folder identifier, DD-MM-YYYY (matches `epi vault day-init`). */
  dayId: string;
  /** Canonical NOW artifact path for this session within today's Day. */
  nowPath: string;
  /** Session identifier (format: YYYYMMDD-HHmmss-suffix). */
  sessionId: string;
  /** CS direction conditioning the run. */
  csDirection: CsDirection;
  /** Whether the run is Day, Night', cron, or manual. */
  runKind: RunKind;
}

/**
 * Compute the canonical Day id (DD-MM-YYYY).
 *
 * This is the single source of truth for the day-id string that extension.ts
 * previously inlined as `new Date().toLocaleDateString("en-GB").replace(/\//g,"-")`
 * in four places (day arc open/close, decan check). Centralised so the Graphiti
 * arc id, the archive day key, and the temporal frame can never disagree.
 *
 * @param when Date to derive the id from (defaults to now). En-GB locale yields
 *             DD/MM/YYYY, which we normalise to DD-MM-YYYY.
 */
export function computeDayId(when: Date = new Date()): string {
  return when.toLocaleDateString("en-GB").replace(/\//g, "-");
}

/**
 * Canonical NOW artifact path for a session.
 *
 * Per the M-dev session contract, all NOW work is anchored at
 * `Idea/Empty/Present/{DD-MM-YYYY}/{sessionId}/now.md`. Chronos triggers its
 * creation (chronos_now_init → `epi vault now-init`); Hen defines the structure;
 * Khora writes it. Chronos owns only the *address law*, never the bytes.
 */
export function nowPath(dayId: string, sessionId: string): string {
  if (!dayId) throw new Error("nowPath: dayId is required");
  if (!sessionId) throw new Error("nowPath: sessionId is required");
  return `Idea/Empty/Present/${dayId}/${sessionId}/now.md`;
}

/**
 * Derive the CS direction implied by a run kind.
 *
 * Night' runs (the Möbius rehear / synthesis pass) fold back: CS0 / Night'.
 * Day, cron, and manual runs flow outward: Day direction. A run may still carry
 * an explicit override (e.g. a cron job that itself performs the Night' pass).
 */
export function directionForRun(runKind: RunKind): CsDirection {
  return runKind === "Night'" ? "Night'" : "Day";
}

/**
 * Build the temporal frame that conditions a dispatch.
 *
 * Missing temporal enrichment must degrade gracefully (S4-3'-SPEC §"Build
 * Contract": Kairos is additive). This function never reaches the network or
 * filesystem — it deterministically assembles the frame from the inputs a
 * dispatcher already holds, so it can never block ordinary S4 operation.
 */
export function temporalFrame(input: {
  sessionId: string;
  runKind: RunKind;
  /** Defaults to today. */
  when?: Date;
  /** Override the derived CS direction (rare; e.g. a cron Night' pass). */
  csDirection?: CsDirection;
}): TemporalFrame {
  if (!input.sessionId) throw new Error("temporalFrame: sessionId is required");
  const dayId = computeDayId(input.when);
  const csDirection = input.csDirection ?? directionForRun(input.runKind);
  return {
    dayId,
    nowPath: nowPath(dayId, input.sessionId),
    sessionId: input.sessionId,
    csDirection,
    runKind: input.runKind,
  };
}
