// aletheia/modules/mercurius-translation.ts
//
// Mercurius — Aletheia subagent: translation / mediation across domains.
//
// S5'/agents/mercurius.md: "the herald and solvent who can move between domains
// without losing the charge of origin ... translation as living passage rather
// than flattening equivalence. It reads qualitative signal and carries it across
// family boundaries ... preserving the pattern that made the signal meaningful
// in the first place."
// S4-5'-SPEC §Z-thread: Mercurius "carries P5' Insight across the Möbius seam to
// next-cycle P0' Questions."
//
// Track 10.T16 deliverable: "Own Mercurius as translation/mediation subagent."
// Verification: "translation-lineage tests."
//
// The load-bearing invariant: a translation must carry a non-empty origin
// charge AND cross a real boundary (from !== to). Dropping the charge is
// flattening equivalence; a translation within one domain is no passage at all.
//
// Pure: no I/O. Importable by carrier tests.

export interface Translation {
  agent: "mercurius";
  signal: string;
  /** Origin family/coordinate. */
  from: string;
  /** Target family/coordinate. */
  to: string;
  /** The preserved pattern/charge carried from the origin. */
  originCharge: string;
  /** Ordered passage: [from, ...via, to]. */
  lineage: string[];
}

export interface GuardResult {
  ok: boolean;
  error?: string;
}

/**
 * Translate a qualitative signal across a domain boundary, carrying the charge
 * of origin. The lineage records the living passage from origin to target.
 */
export function translate(input: {
  signal: string;
  from: string;
  to: string;
  originCharge: string;
  via?: string[];
}): Translation {
  if (!input.signal?.trim()) throw new Error("Mercurius translation requires a signal.");
  if (!input.from?.trim() || !input.to?.trim()) {
    throw new Error("Mercurius translation requires both a from-domain and a to-domain.");
  }
  return {
    agent: "mercurius",
    signal: input.signal,
    from: input.from,
    to: input.to,
    originCharge: input.originCharge,
    lineage: [input.from, ...(input.via ?? []), input.to],
  };
}

/**
 * Translation-lineage invariant.
 *
 *   - the origin charge must be preserved (non-empty) — dropping it is
 *     "flattening equivalence", and
 *   - the passage must cross a real boundary (from !== to), and
 *   - the lineage must begin at the origin and end at the target.
 */
export function assertPreservesCharge(t: Translation): GuardResult {
  if (!t.originCharge?.trim()) {
    return { ok: false, error: "flattening-equivalence guard: the charge of origin was dropped in translation." };
  }
  if (t.from === t.to) {
    return { ok: false, error: "no passage: from and to are the same domain — nothing was carried across." };
  }
  if (t.lineage[0] !== t.from || t.lineage[t.lineage.length - 1] !== t.to) {
    return { ok: false, error: "broken lineage: passage does not run from origin to target." };
  }
  return { ok: true };
}

/**
 * The Möbius-seam carry: P5' Insight → next-cycle P0' Questions. Mercurius is
 * the herald that crosses the seam, preserving the insight's charge as the
 * question it opens.
 */
export function carryAcrossMobius(input: { insight: string; charge: string }): Translation {
  return translate({
    signal: input.insight,
    from: "P5'",
    to: "P0'",
    originCharge: input.charge,
    via: ["möbius-seam"],
  });
}
