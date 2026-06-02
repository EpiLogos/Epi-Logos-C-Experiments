// aletheia/modules/anansi-lineage.ts
//
// Anansi — Aletheia subagent: orientation and disclosure-lineage.
//
// S5'/agents/anansi.md: "saṃskāra weave, retaining traces of what the system
// intended and what the system has become so that architectural learning lands
// in the correct register rather than diffusing into narrative fog ... Produces
// gap analyses, coordinate placements, and /empty versus /present contrast
// reports with strict wikilink provenance."
// S4-5'-SPEC §Z-thread: Anansi is the compose-phase witness — "the unknown the
// new theme reaches into."
//
// Track 10.T13 deliverable: "Own Anansi's disclosure-lineage role."
// Verification: "lineage tests."
//
// The load-bearing invariant: every trace in a lineage must carry wikilink
// provenance back to a source. A trace without provenance is "narrative fog"
// and is refused — that is how learning lands in the correct register.
//
// Pure: no I/O. Importable by carrier tests.

/** A single retained trace: what the system intended vs what it became. */
export interface LineageTrace {
  /** Free-text note of the intended-vs-became contrast. */
  note: string;
  /** Wikilink provenance — the [[source]] this trace is anchored to. */
  source: string;
}

export interface DisclosureLineage {
  agent: "anansi";
  /** What the system intended (the /Empty blueprint). */
  intended: string;
  /** What the system became (the /Present manifestation). */
  became: string;
  /** Retained traces with provenance. */
  traces: LineageTrace[];
}

const WIKILINK = /\[\[[^\]]+\]\]/;

export interface GuardResult {
  ok: boolean;
  error?: string;
}

/** Build a disclosure lineage holding /Empty intention against /Present reality. */
export function buildLineage(input: {
  intended: string;
  became: string;
  traces: LineageTrace[];
}): DisclosureLineage {
  if (!input.intended?.trim() || !input.became?.trim()) {
    throw new Error("Anansi lineage requires both the intended (/Empty) and became (/Present) poles.");
  }
  return { agent: "anansi", intended: input.intended, became: input.became, traces: input.traces };
}

/**
 * Provenance invariant.
 *
 * Every trace must carry a [[wikilink]] source. A trace without wikilink
 * provenance diffuses into narrative fog and is refused — Anansi retains traces
 * so learning lands in the correct register, never as unanchored narrative.
 */
export function assertProvenance(lineage: DisclosureLineage): GuardResult {
  for (const [i, t] of lineage.traces.entries()) {
    if (!t.source || !WIKILINK.test(t.source)) {
      return {
        ok: false,
        error: `narrative-fog guard: trace #${i} ("${t.note}") lacks [[wikilink]] provenance.`,
      };
    }
  }
  return { ok: true };
}

/** The ordered provenance chain — the wikilink sources this lineage rests on. */
export function provenanceChain(lineage: DisclosureLineage): string[] {
  return lineage.traces.map((t) => t.source);
}
