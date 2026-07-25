// spine/types.ts

export interface InjectionSlot {
  /** S-coordinate this slot belongs to e.g. "S1'" */
  coordinate: string;
  /** hot = always included; warm = included if within char budget; cold = never at session-start */
  cost: "hot" | "warm" | "cold";
  /** Content string to inject */
  content: string;
  /** Estimated char count (used for budget enforcement) */
  charEstimate: number;
  /** Phase-qualified coordinate dereference emitted when this slot overflows. */
  vakReference?: {
    coord: string;
    dereference: "s5'.gnostic.resolve" | "s0'.anuttara.trace";
  };
}

/**
 * What became of one carrier's slot during assembly.
 *
 * `failed` exists because a contribution that throws used to be swallowed by a
 * `console.warn` and vanish — the block simply was not there, and nothing
 * downstream could tell an absent carrier from a broken one.
 */
export type ContextPackBlockStatus =
  | "included"
  | "overflowed"
  | "excluded-cold"
  | "failed";

/** One carrier's contribution to the assembled session context, with provenance. */
export interface ContextPackBlock {
  /** S-coordinate of the contributing carrier e.g. "S1/S1'". */
  coordinate: string;
  cost: "hot" | "warm" | "cold";
  status: ContextPackBlockStatus;
  /** UTF-8 byte size of this block's content (0 when the carrier failed). */
  bytes: number;
  /** The carrier's own charEstimate — what the char budget was spent against. */
  charEstimate: number;
  /** Epoch ms at which THIS carrier's slot resolved. Per-carrier freshness. */
  producedAtMs: number;
  /** Exactly the text this block contributes to `injection`; null unless included. */
  rendered: string | null;
  /** The dereference token emitted in its place when the block overflowed. */
  vakToken: string | null;
  /** Why the carrier failed — previously invisible. */
  error: string | null;
}

/**
 * The assembled session-context pack.
 *
 * `injection` IS the string handed to the model — not a re-rendering of it.
 * Both the `before_agent_start` seam and `s4'.context.assemble` read this one
 * object, so the reported pack cannot drift from the injected pack.
 */
export interface ContextPack {
  version: 1;
  sessionKey: string;
  assembledAtMs: number;
  budget: {
    limitChars: number;
    usedChars: number;
  };
  blocks: ContextPackBlock[];
  injection: string;
}

export interface LedgerChannel {
  /** S-coordinate channel e.g. "s1" */
  coordinate: string;
  /** Path to ledger directory (relative to epi-dev-vault/) */
  ledgerDir: string;
  /** Extract session content for appending to today's ledger */
  extract(sessionContext: SessionContext): Promise<string | null>;
}

export interface CompilerPass {
  coordinate: string;
  /** hot = runs at session-start inline; warm = runs as background process, result cached; cold = manual/cron only */
  schedule: "hot" | "warm" | "cold";
  /** Compile today's ledger channel into a compiled artifact */
  compile(ledgerPath: string, outputDir: string): Promise<void>;
  /** Read compiled artifact for injection */
  readCompiled(compiledDir: string): Promise<string>;
}

export interface SpineQuery {
  coordinate: string;
  query(question: string, coordinateFilter?: string): Promise<string>;
}

export interface SessionContext {
  sessionId: string;
  dayId: string;
  nowPath: string | null;
  transcriptPath?: string;
}

export interface SpineContribution {
  coordinate: string;
  injectionSlot(): Promise<InjectionSlot>;
  ledgerChannel(): LedgerChannel;
  compilerPass(): CompilerPass;
  queryHandler(): SpineQuery;
}
