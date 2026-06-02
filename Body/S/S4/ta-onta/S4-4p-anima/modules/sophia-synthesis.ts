// anima/modules/sophia-synthesis.ts
//
// Sophia — Spanda-Shakti / The Pulsation That Is Both Surge and Return.
//
// AGENTS.md §"Sophia": CF (5/0), CT5, CP 4.5 Integration. Skills:
// `finishing-a-development-branch`, `day-night-pass`. Model: opus. "Where all
// other agents work the torus (forward), Sophia is the Klein bottle: inside
// becomes outside without traversal. P5′ Insight generates P0′ Questions —
// synthesis that opens, not closes."
//   Pathology guard: Sophia's error — hoarding the Pleroma as property rather
//   than use; synthesis that closes rather than opens.
//
// Track 10.T12 deliverable: "Own synthesis, recursive review, and anti-hoarding
// governance for Sophia." Verification: "recursive-governance tests."
//
// The load-bearing invariant: a synthesis (P5' Insight) is only valid if it
// OPENS at least one P0' Question — the Klein-bottle return. Recursive review
// is the loop where each round's questions seed the next round's synthesis. A
// synthesis that opens no questions is hoarding and is refused.
//
// Pure: imports only the roster constant. Importable by carrier tests.

import { AGENT_CF } from "./dispatch-validate.ts";

export const SOPHIA_CF = AGENT_CF.sophia; // "(5/0)"

export interface Synthesis {
  agent: "sophia";
  cf: string;
  /** P5' Insight — the integration reached this round. */
  insight: string;
  /** P0' Questions the synthesis opens (the Klein-bottle return). */
  questions: string[];
  /** Recursive-review round index (0 = first synthesis). */
  round: number;
  /** The prior round's questions that seeded this synthesis, if any. */
  seededBy?: string[];
}

export interface GuardResult {
  ok: boolean;
  error?: string;
}

/** Produce a first-round synthesis. Must open at least one P0' question. */
export function synthesize(input: { insight: string; opensQuestions: string[] }): Synthesis {
  if (!input.insight || !input.insight.trim()) {
    throw new Error("Sophia synthesis requires a non-empty P5' insight.");
  }
  return {
    agent: "sophia",
    cf: SOPHIA_CF,
    insight: input.insight,
    questions: input.opensQuestions,
    round: 0,
  };
}

/**
 * Anti-hoarding pathology guard (Sophia's error).
 *
 * A synthesis must OPEN — generate P0' questions — not close. A synthesis that
 * opens no questions is hoarding the Pleroma as property and is refused.
 */
export function assertOpens(s: Synthesis): GuardResult {
  if (!s.questions || s.questions.length === 0) {
    return {
      ok: false,
      error:
        "Sophia's-error guard: synthesis closes rather than opens — a P5' insight must generate at least one P0' question.",
    };
  }
  return { ok: true };
}

/**
 * Recursive review: the next synthesis round, seeded by the prior round's
 * questions (the P5'→P0' Klein return feeding forward). The round index
 * advances and the prior questions are recorded as the seed.
 */
export function recursiveReview(
  prev: Synthesis,
  input: { insight: string; opensQuestions: string[] },
): Synthesis {
  const opened = assertOpens(prev);
  if (!opened.ok) {
    throw new Error(`cannot recurse from a closed synthesis: ${opened.error}`);
  }
  return {
    agent: "sophia",
    cf: SOPHIA_CF,
    insight: input.insight,
    questions: input.opensQuestions,
    round: prev.round + 1,
    seededBy: prev.questions,
  };
}

/**
 * Recursive-governance invariant.
 *
 * A governed review round must:
 *   - advance the round index (no stalling), and
 *   - be seeded by exactly the prior round's questions (the loop is closed —
 *     synthesis feeds forward, nothing is hoarded out of the cycle), and
 *   - itself open new questions (it does not terminate the recursion).
 */
export function assertGoverned(prev: Synthesis, next: Synthesis): GuardResult {
  if (next.round !== prev.round + 1) {
    return { ok: false, error: `recursion did not advance: prev round ${prev.round}, next round ${next.round}.` };
  }
  if (JSON.stringify(next.seededBy ?? []) !== JSON.stringify(prev.questions)) {
    return {
      ok: false,
      error: "recursive-governance broken: next round was not seeded by the prior round's questions.",
    };
  }
  const opens = assertOpens(next);
  if (!opens.ok) return opens;
  return { ok: true };
}
