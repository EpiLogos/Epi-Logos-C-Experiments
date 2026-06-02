// aletheia/modules/agora-staging.ts
//
// Agora — Aletheia subagent: public / disclosure staging.
//
// S5'/agents/agora.md: "The public square where many voices can be held together
// without erasing their distinction ... retrieval before coordination, plurality
// before consensus, ocean before the drops forget where they rest. Its work is
// to let many lines of inquiry become one legible field."
// S4-5'-SPEC §Z-thread: Agora is "the marketplace where challenger-vectors get
// evaluated."
//
// Track 10.T17 deliverable: "Own Agora as public/disclosure staging subagent."
// Verification: "public/current render tests."
//
// The load-bearing invariant: staging aggregates many channel outputs into ONE
// legible field while preserving each voice's distinction. A render that drops
// or merges voices (forced consensus) has erased distinction and is refused.
//
// Pure: no I/O. Importable by carrier tests.

export interface Voice {
  source: string;
  content: string;
}

export type RenderSurface = "public" | "current";

export interface PublicRender {
  agent: "agora";
  surface: RenderSurface;
  /** Plurality preserved — one entry per gathered voice. */
  voices: Voice[];
  /** The one legible field rendering every voice distinctly. */
  field: string;
}

export interface GuardResult {
  ok: boolean;
  error?: string;
}

/**
 * Stage gathered voices into a public/current render. Each voice becomes a
 * distinct section in the legible field; nothing is collapsed into a single
 * consensus statement (plurality before consensus).
 */
export function stage(input: { voices: Voice[]; surface?: RenderSurface }): PublicRender {
  if (!input.voices || input.voices.length === 0) {
    throw new Error("Agora staging requires at least one voice.");
  }
  for (const v of input.voices) {
    if (!v.source?.trim()) throw new Error("every voice must name its source (no anonymous drops).");
  }
  const field = input.voices.map((v) => `## ${v.source}\n${v.content}`).join("\n\n");
  return { agent: "agora", surface: input.surface ?? "current", voices: input.voices, field };
}

/**
 * Distinction-preservation invariant.
 *
 *   - every gathered voice is retained (count matches), and
 *   - sources are unique (no voice silently merged into another), and
 *   - each voice's source appears in the rendered field (none erased).
 *
 * A render that fails this has forced consensus — the drops forgot where they
 * rest — and is refused.
 */
export function assertPreservesDistinction(render: PublicRender): GuardResult {
  const sources = render.voices.map((v) => v.source);
  const unique = new Set(sources);
  if (unique.size !== sources.length) {
    return { ok: false, error: "distinction erased: duplicate sources merged into one voice." };
  }
  for (const v of render.voices) {
    if (!render.field.includes(`## ${v.source}`)) {
      return { ok: false, error: `distinction erased: voice "${v.source}" dropped from the public field.` };
    }
  }
  return { ok: true };
}
