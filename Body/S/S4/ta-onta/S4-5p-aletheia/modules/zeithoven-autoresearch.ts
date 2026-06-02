// aletheia/modules/zeithoven-autoresearch.ts
//
// Zeithoven — Aletheia subagent: pattern-detection / improvement-context.
//
// S5'/agents/zeithoven.md: "The composer who writes with time, cadence, and
// newly manifested form ... creative advance after disclosure: the moment when
// what shines inwardly becomes externally manifest while retaining the charge of
// its source. It is the will-to-create that follows true seeing, not novelty for
// its own sake."
// S4-5'-SPEC §Z-thread: Zeithoven "generates the next-form; hands score to next
// compose." Deep autoresearch execution delegates to Epii; Zeithoven supplies
// the improvement-context with attribution.
//
// Track 10.T18 deliverable: "Own Zeithoven as pattern-detection /
// improvement-context subagent." Verification: "autoresearch pattern tests with
// explicit subagent attribution."
//
// Two load-bearing invariants:
//   1. Every detected pattern / improvement-context carries EXPLICIT subagent
//      attribution — autoresearch intake must know which subagent surfaced it.
//   2. The next-form is anchored to its source disclosure — "not novelty for its
//      own sake." A severed next-form is refused.
//
// Pure: no I/O. Importable by carrier tests.

export interface ImprovementContext {
  agent: "zeithoven";
  /** The detected recurring pattern. */
  pattern: string;
  /** The schedulable/writable next-form the pattern proposes. */
  nextForm: string;
  /** The subagent that surfaced the pattern — explicit, never anonymous. */
  attribution: string;
  /** The disclosure/source this next-form advances from (retains the charge). */
  source: string;
}

export interface GuardResult {
  ok: boolean;
  error?: string;
}

/**
 * Produce an autoresearch improvement-context entry from a detected pattern.
 * The next-form is the creative advance; attribution and source are mandatory
 * at construction so an entry can never enter the autoresearch queue unanchored.
 */
export function detectPattern(input: {
  pattern: string;
  nextForm: string;
  attribution: string;
  source: string;
}): ImprovementContext {
  if (!input.pattern?.trim()) throw new Error("Zeithoven requires a detected pattern.");
  if (!input.nextForm?.trim()) throw new Error("Zeithoven requires a next-form (the creative advance).");
  return {
    agent: "zeithoven",
    pattern: input.pattern,
    nextForm: input.nextForm,
    attribution: input.attribution,
    source: input.source,
  };
}

/**
 * Explicit-attribution invariant: the entry must name the subagent that surfaced
 * the pattern. An unattributed entry cannot enter autoresearch intake.
 */
export function assertAttributed(entry: ImprovementContext): GuardResult {
  if (!entry.attribution?.trim()) {
    return { ok: false, error: "attribution missing: autoresearch intake requires the surfacing subagent to be named." };
  }
  return { ok: true };
}

/**
 * Anchored-to-source invariant: the next-form must advance from a named source
 * disclosure. A source-less next-form is "novelty for its own sake" — severed
 * from true seeing — and is refused.
 */
export function assertNotSeveredNovelty(entry: ImprovementContext): GuardResult {
  if (!entry.source?.trim()) {
    return { ok: false, error: "severed-novelty guard: next-form has no source disclosure — novelty for its own sake." };
  }
  return { ok: true };
}

/** Render the attributed autoresearch line: pattern (via <subagent>, from <source>). */
export function attributionLine(entry: ImprovementContext): string {
  return `${entry.pattern} → ${entry.nextForm} (via ${entry.attribution}, from ${entry.source})`;
}
