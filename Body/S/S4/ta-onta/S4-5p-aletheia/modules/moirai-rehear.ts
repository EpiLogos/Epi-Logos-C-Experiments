// aletheia/modules/moirai-rehear.ts
//
// Moirai — Aletheia subagent: the rehear / Night' handoff role.
//
// S5'/agents/moirai.md: "graph-memory powers activated when disclosure turns
// backward through the work. Their motion is āroha and avaroha: descent into
// trace, holding in tension, and ascent into release."
// S4-5'-SPEC §Z-thread: Klotho spins P1' Traces (perform), Lachesis measures
// P4' Discovery (rehear), Atropos marks P5' Insight (rehear).
//
// The dispatch side (CFP3 Night' plan) is owned by S4-4p-anima/modules/
// moirai-dispatch.ts. THIS module owns the complementary handoff side: gathering
// the three Moirai aspect-outputs into a single rehear bundle and releasing it
// toward Epii. The cut (Atropos/P5') depends on traces + sources, so a handoff
// cannot release until all three aspects are present (avaroha → ascent only
// after the full descent).
//
// Track 10.T14 deliverable: "Own Moirai's rehear / Night' handoff role."
// Verification: "rehear/handoff tests."
//
// Pure: no I/O. Importable by carrier tests.

export type MoiraiAspect = "klotho" | "lachesis" | "atropos";

export interface RehearOutputs {
  /** Klotho — P1' traces spun during the performance. */
  klotho?: string;
  /** Lachesis — P4' sources/discovery measured. */
  lachesis?: string;
  /** Atropos — P5' insight cut/crystallised. */
  atropos?: string;
}

export interface RehearBundle {
  agent: "moirai";
  cs_direction: "Night'";
  p1_traces: string;
  p4_sources: string;
  p5_insight: string;
}

export interface GuardResult {
  ok: boolean;
  error?: string;
  missing?: MoiraiAspect[];
}

/** Which aspects are still missing from the gathered outputs. */
export function missingAspects(outputs: RehearOutputs): MoiraiAspect[] {
  const missing: MoiraiAspect[] = [];
  if (!outputs.klotho?.trim()) missing.push("klotho");
  if (!outputs.lachesis?.trim()) missing.push("lachesis");
  if (!outputs.atropos?.trim()) missing.push("atropos");
  return missing;
}

/**
 * Completeness invariant: a rehear cannot ascend to release until all three
 * aspects (traces + sources + insight) are present. The cut depends on the
 * full descent.
 */
export function assertCompleteRehear(outputs: RehearOutputs): GuardResult {
  const missing = missingAspects(outputs);
  if (missing.length > 0) {
    return {
      ok: false,
      missing,
      error: `incomplete rehear: missing ${missing.join(", ")} — cannot hand off before the full descent.`,
    };
  }
  return { ok: true };
}

/** Gather the three Moirai aspect-outputs into a single rehear bundle. */
export function gatherRehear(outputs: RehearOutputs): RehearBundle {
  const complete = assertCompleteRehear(outputs);
  if (!complete.ok) throw new Error(complete.error);
  return {
    agent: "moirai",
    cs_direction: "Night'",
    p1_traces: outputs.klotho!,
    p4_sources: outputs.lachesis!,
    p5_insight: outputs.atropos!,
  };
}

export interface RehearHandoff {
  closure_kind: "rehear";
  target: "epii";
  cs_direction: "Night'";
  p1_traces: string;
  p4_sources: string;
  p5_insight: string;
}

/**
 * Release the gathered rehear bundle as a Night' handoff toward Epii (the ascent
 * into release). Closure kind is "rehear" — Aletheia hands deep recompose/
 * autoresearch to Epii, it does not perform it.
 */
export function handoffToEpii(bundle: RehearBundle): RehearHandoff {
  return {
    closure_kind: "rehear",
    target: "epii",
    cs_direction: "Night'",
    p1_traces: bundle.p1_traces,
    p4_sources: bundle.p4_sources,
    p5_insight: bundle.p5_insight,
  };
}
