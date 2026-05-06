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
