import { spawn, spawnSync } from "node:child_process";
import { isValidVakAddress } from "../../shared/vak_address.ts";
import type {
  CfLiteral,
  CfpLiteral,
  CpLiteral,
  CsDirection,
  CsLiteral,
  CtLiteral,
  CfpMoveLiteral,
  CpfPolarity,
  VakAddress,
  ZThreadMove,
  ZThreadShape,
  ZThreadSnapshot,
  ZThreadState,
} from "../../shared/vak_address.ts";
import { AGENT_CF } from "../modules/dispatch-validate.ts";
import {
  MAX_VERIFY_CYCLES,
  evaluateVerifyGate,
  type VerifyEvidence,
} from "../modules/judge-role.ts";
import {
  parentSliceChildEnvironment,
  type ConversationSliceHandle,
} from "../modules/parent-slice.ts";
import {
  DEFAULT_L_THREAD_MAX_CYCLES,
  TILLDONE_TOOL_BODY,
  TILLDONE_TOOL_NAME,
  TILLDONE_TOOL_REGISTRAR,
  describeLThreadResult,
  runLThread,
  type LThreadResult,
  type TillDoneList,
} from "../S4/tilldone.ts";
// Score persistence is Hen's — artifacts with a content type are S4-1' (CT).
// The dependency runs one way: Anima composes and runs, Hen stores and types.
import {
  loadScore,
  readScoreRuns,
  recordScoreRun,
  saveScore,
  type ScoreDocument,
  type ScoreRunRecord,
} from "../../S4-1p-hen/modules/score-store.ts";
import type { CheckpointReason } from "../modules/dispatch-validate.ts";
// 50.T50.12 — run completion becomes a Mercurius trial. Anima calls INTO
// Aletheia (its CONTRACT forbids Aletheia routing itself); the hook owns the
// honest tuple derivation and the refusal when a field has no source.
import {
  recordDurableRunTrial,
  type EloRunDeclaration,
} from "../modules/elo-trial-hook.ts";
// 50.T50.13 — run completion also becomes an AUDIBLE event. The trace goes to
// the gateway, the S0 kernel reads it against the derived music, and
// `portal.vak_eval` reaches every listener. Anima carries the run's context;
// it never computes the reading itself.
import {
  emitVakEval,
  traceFromSteps,
  type VakEvalDeclaration,
  type VakEvalOptions,
  type VakEvalReceipt,
} from "../modules/vak-eval-emit.ts";
import type {
  AletheiaEloConfig,
  MercuriusTrialOutcomes,
  MercuriusUpdateResult,
} from "../../S4-5p-aletheia/modules/mercurius-elo.ts";

export type CS = "CS0" | "CS1" | "CS2" | "CS3" | "CS4" | "CS5";
export type CSDirectionality = "day" | "night_prime";

export interface ParentSliceCompletionEvent {
  readonly agentId: string;
  readonly taskId: string;
  readonly c: 0 | 1;
  readonly evidence: string;
  readonly task_spec: string;
  readonly vak_frame: VakAddress;
  readonly parent_slice: ConversationSliceHandle;
}

type ParentSliceCompletionEmitter = (event: ParentSliceCompletionEvent) => void | Promise<void>;

let parentSliceCompletionEmitter: ParentSliceCompletionEmitter | undefined;

/** Bind the extension event bus once Anima's runtime registration is live. */
export function configureParentSliceCompletionEmitter(emitter: ParentSliceCompletionEmitter | undefined): void {
  parentSliceCompletionEmitter = emitter;
}

/**
 * Origination polarity (50.T50.07).
 *
 * `(00/00)` — Dialogical. User as source. This is where an orchestration script
 * gets DEVELOPED: a task is given its specific expression in the language
 * through dialogue. Every Anima session starts here; that is the law, not a
 * default anyone may choose otherwise.
 *
 * `(4.0/1-4.4/5)` — Mechanistic. Running a ready-made flow. Re-running a
 * persisted score lands here, because a re-run does not re-originate: the
 * dialogue that produced the score already happened, once.
 */
export const ORIGINATION_DIALOGICAL: CpfPolarity = "(00/00)";
export const ORIGINATION_MECHANISTIC: CpfPolarity = "(4.0/1-4.4/5)";

export type CSState = {
  value: CS;
  directionality: CSDirectionality;
  cpPosition: "4.0" | "4.1" | "4.2" | "4.3" | "4.4" | "4.5";
  /**
   * CPF origination polarity. Optional on the way IN so existing callers keep
   * compiling, always present on the way OUT — `setCSState` normalises and
   * `getCSState` defaults, so no reader ever sees a session with no origination.
   */
  origination?: CpfPolarity;
};

/** A CS state as it is READ: origination is guaranteed. */
export type OriginatedCSState = CSState & { origination: CpfPolarity };

const sessionCSState = new Map<string, OriginatedCSState>();
const zThreadShapes = new Map<string, ZThreadShape>();
const zThreadSnapshots = new Map<string, ZThreadSnapshot>();

export function setCSState(
  sessionId: string | undefined,
  nextState: CSState,
): OriginatedCSState {
  // Absent origination means "starting": a session begins dialogical. The reset
  // in `subscriptions.ts` on `before_agent_start` therefore returns every
  // session to `(00/00)` without having to say so.
  const normalized: OriginatedCSState = {
    ...nextState,
    origination: nextState.origination ?? ORIGINATION_DIALOGICAL,
  };
  if (sessionId) {
    sessionCSState.set(sessionId, normalized);
  }
  return normalized;
}

export function getCSState(sessionId?: string): OriginatedCSState {
  // `sessionId ? … : undefined`, not `sessionId && …`: an empty-string session
  // id is falsy but NOT nullish, so the `&&` form returned `""` straight through
  // `??` and a caller got a string where a state was promised. That made
  // `getCSState("").origination` undefined — a session reading as no longer
  // originating purely because its id was empty.
  const existing = sessionId ? sessionCSState.get(sessionId) : undefined;
  return existing ?? {
    value: "CS0",
    directionality: "day",
    cpPosition: "4.0",
    origination: ORIGINATION_DIALOGICAL,
  };
}

/** Move a session's origination polarity, leaving the rest of CS untouched. */
export function setOrigination(
  sessionId: string | undefined,
  origination: CpfPolarity,
): OriginatedCSState {
  return setCSState(sessionId, { ...getCSState(sessionId), origination });
}

/** Is this session still in the dialogue where scripts get developed? */
export function isOriginating(sessionId?: string): boolean {
  return getCSState(sessionId).origination === ORIGINATION_DIALOGICAL;
}

import {
  conventionalToolFor,
  requiresCompletionGate,
  shapeOf,
  type ZThreadToolName,
} from "../lib/thread-shape.ts";

// Threads are shapes; tools are capabilities (`../lib/thread-shape.ts`).
// This module re-exports that surface so existing importers keep one entry
// point, but the model itself lives there — CFP no longer names a tool.
export {
  TOOL_CAPABILITIES,
  allThreadShapes,
  capabilitiesFor,
  capabilityKindsFor,
  conventionalToolFor,
  requiresCompletionGate,
  shapeOf,
  type CapabilityKind,
  type ThreadShape,
  type ToolCapability,
} from "../lib/thread-shape.ts";
export type { ZThreadToolName } from "../lib/thread-shape.ts";

export interface ZThreadMoveResult {
  move_id: string;
  cfp: CfpMoveLiteral;
  /** The tool this move conventionally started from; `null` when none carries it. */
  tool: ZThreadToolName | null;
  output: string;
  /** Present only for a move that ran under the completion gate. */
  l_thread?: LThreadResult;
}

export interface ZThreadRuntimeAdapter {
  perform(move: ZThreadMove, thread: ZThreadSnapshot): Promise<ZThreadMoveResult | string>;
  verify(thread: ZThreadSnapshot): Promise<VerifyEvidence>;
  rehear?(thread: ZThreadSnapshot): Promise<string | void>;
  recompose?(thread: ZThreadSnapshot): Promise<string | void>;
  /**
   * Read the CURRENT `tilldone` task list for a move whose SHAPE closes only
   * when its declared work is done (`shape.completion === "till-done"`).
   *
   * Keyed on the shape, not on CFP4: the completion gate is a discipline any
   * thread may declare, so a future shape that wants run-till-done gets it
   * without this module learning a new CFP. Supplying the reader turns such a
   * move into a real completion guarantee — performed repeatedly, each pass
   * receiving the previous verdict so the gate's reason reaches the agent.
   * Omit it and the move stays single-pass; the gate is opt-in, never assumed.
   */
  readTaskList?(move: ZThreadMove, thread: ZThreadSnapshot): Promise<TillDoneList | undefined> | (TillDoneList | undefined);
  /** Pass bound for a gated move. Defaults to `DEFAULT_L_THREAD_MAX_CYCLES`. */
  lThreadMaxCycles?: number;
}

export interface RegisterZThreadShapeInput {
  id: string;
  task?: string;
  vak_address: VakAddress;
  moves: ZThreadMove[];
}

export interface DispatchZThreadInput extends RegisterZThreadShapeInput {
  adapter: ZThreadRuntimeAdapter;
  max_verify_cycles?: number;
}

/**
 * @deprecated The CFP→tool map was a category error: canon maps a CFP to a
 * SKILL or PATTERN, never to a tool, and writes CFP3 as a *mode* of CFP1's
 * skill. Read `shapeOf(cfp)` for what a thread IS and `capabilitiesFor(shape)`
 * for what could realise it. Retained as a thin alias because a conventional
 * starting tool is still a useful thing to ask for — note it returns `null` for
 * CFP4, which is the honest answer rather than a gap.
 */
export function zThreadToolForMove(cfp: CfpMoveLiteral): ZThreadToolName | null {
  return conventionalToolFor(cfp);
}

export function registerZThreadShape(input: RegisterZThreadShapeInput): ZThreadShape {
  if (input.vak_address.cfp !== "Z") {
    throw new Error(`Z-thread '${input.id}' requires vak_address.cfp === "Z"`);
  }
  if (input.moves.length === 0) {
    throw new Error(`Z-thread '${input.id}' requires at least one CFP move`);
  }
  const composes = [...new Set(input.moves.map((move) => move.cfp))];
  if (composes.length < 2) {
    throw new Error(`Z-thread '${input.id}' must compose at least two distinct CFP moves`);
  }
  const shape: ZThreadShape = {
    id: input.id,
    task: input.task,
    vak_address: input.vak_address as VakAddress & { cfp: "Z" },
    moves: input.moves,
    composes,
  };
  zThreadShapes.set(shape.id, shape);
  zThreadSnapshots.set(shape.id, initialZThreadSnapshot(shape));
  return shape;
}

export function getZThreadShape(id: string): ZThreadShape | undefined {
  return zThreadShapes.get(id);
}

export function getZThreadSnapshot(id: string): ZThreadSnapshot | undefined {
  return zThreadSnapshots.get(id);
}

export function listZThreadSnapshots(): ZThreadSnapshot[] {
  return [...zThreadSnapshots.values()];
}

/**
 * A snapshot's move results, read at Anima's richer type.
 *
 * `ZThreadSnapshot` lives in the shared TS mirror (`ta-onta/shared/vak_address.ts`),
 * where `outputs` carries the MINIMAL record every carrier can rely on — a move
 * id, its CFP, the tool name, the output. The CFP4 `l_thread` record is Anima's
 * alone, because the completion gate is Anima's coordinate, so it is read
 * through here instead of being widened into a shape other carriers share.
 *
 * This is the one place the two views are reconciled; call sites read
 * `ZThreadMoveResult` and never restate the narrowing themselves.
 */
export function zThreadMoveResults(snapshot: ZThreadSnapshot): ZThreadMoveResult[] {
  return snapshot.outputs as ZThreadMoveResult[];
}

export async function dispatchZThread(input: DispatchZThreadInput): Promise<ZThreadSnapshot> {
  const shape = registerZThreadShape(input);
  const snapshot = initialZThreadSnapshot(shape);
  zThreadSnapshots.set(shape.id, snapshot);

  const maxVerifyCycles = input.max_verify_cycles ?? MAX_VERIFY_CYCLES;
  try {
    while (snapshot.cycle < maxVerifyCycles) {
      snapshot.cycle += 1;
      transitionZThread(snapshot, "composing");
      transitionZThread(snapshot, "performing");
      for (const move of shape.moves) {
        snapshot.outputs.push(await performZThreadMove(input.adapter, move, snapshot));
      }

      transitionZThread(snapshot, "verifying");
      const evidence = await input.adapter.verify(snapshot);
      const verifyGate = evaluateVerifyGate({
        verify_cycles: snapshot.cycle,
        evidence: [evidence],
      });
      snapshot.verify_gate = verifyGate;

      if (verifyGate.transition === "rehear") {
        await rehearAndRecompose(input.adapter, snapshot);
        transitionZThread(snapshot, "done");
        return snapshot;
      }

      if (verifyGate.transition === "human_escalation") {
        snapshot.failure_reason = verifyGate.reason;
        transitionZThread(snapshot, "failed");
        return snapshot;
      }
    }

    snapshot.failure_reason =
      `Verify gate did not clear after ${maxVerifyCycles} cycle${maxVerifyCycles === 1 ? "" : "s"}`;
    transitionZThread(snapshot, "failed");
    return snapshot;
  } catch (error) {
    snapshot.failure_reason = error instanceof Error ? error.message : String(error);
    transitionZThread(snapshot, "failed");
    return snapshot;
  }
}

function initialZThreadSnapshot(shape: ZThreadShape): ZThreadSnapshot {
  return {
    id: shape.id,
    task: shape.task,
    state: "queued",
    vak_address: shape.vak_address,
    composes: shape.composes,
    cycle: 0,
    history: ["queued"],
    outputs: [],
  };
}

function transitionZThread(snapshot: ZThreadSnapshot, state: ZThreadState) {
  snapshot.state = state;
  snapshot.history.push(state);
  zThreadSnapshots.set(snapshot.id, snapshot);
}

async function rehearAndRecompose(adapter: ZThreadRuntimeAdapter, snapshot: ZThreadSnapshot) {
  transitionZThread(snapshot, "rehearing");
  await adapter.rehear?.(snapshot);
  transitionZThread(snapshot, "recomposing");
  await adapter.recompose?.(snapshot);
}

/**
 * Perform one Z-thread move.
 *
 * A move runs once unless its SHAPE says it closes only when its declared work
 * is done AND the adapter can read that work's state. Then it runs under the
 * completion gate — repeating until the list is done, refusing to report a close
 * it did not earn — and the resulting `LThreadResult` is attached so the trace
 * records how many passes it actually took.
 *
 * The condition is `requiresCompletionGate(shapeOf(move.cfp))`, not
 * `move.cfp === "CFP4"`: the gate belongs to the discipline, not the coordinate.
 */
async function performZThreadMove(
  adapter: ZThreadRuntimeAdapter,
  move: ZThreadMove,
  snapshot: ZThreadSnapshot,
): Promise<ZThreadMoveResult> {
  if (!requiresCompletionGate(shapeOf(move.cfp)) || !adapter.readTaskList) {
    return normalizeZThreadMoveResult(move, await adapter.perform(move, snapshot));
  }

  const readTaskList = adapter.readTaskList.bind(adapter);
  const result = await runLThread({
    id: move.id,
    maxCycles: adapter.lThreadMaxCycles ?? DEFAULT_L_THREAD_MAX_CYCLES,
    perform: async (_cycle, previous) => {
      // The gate's reason travels with the move so the next pass sees WHY it is
      // still running — the tool's interactive nudge, in orchestration form.
      const nudged: ZThreadMove = previous
        ? { ...move, task: `${move.task}\n\n[tilldone] ${previous.reason}` }
        : move;
      const raw = await adapter.perform(nudged, snapshot);
      return typeof raw === "string" ? raw : raw.output;
    },
    readTaskList: () => readTaskList(move, snapshot),
  });

  return {
    move_id: move.id,
    cfp: move.cfp,
    // A gated move has no single tool — the gate wraps whatever the perform
    // callback dispatched. `null` says that honestly.
    tool: conventionalToolFor(move.cfp),
    output: describeLThreadResult(result),
    l_thread: result,
  };
}

function normalizeZThreadMoveResult(
  move: ZThreadMove,
  result: ZThreadMoveResult | string,
): ZThreadMoveResult {
  if (typeof result !== "string") return result;
  return {
    move_id: move.id,
    cfp: move.cfp,
    tool: conventionalToolFor(move.cfp),
    output: result,
  };
}

// ── (00/00) origination → score lifecycle (50.T50.07) ─────────────────────
//
// A task gets a specific expression in the orchestration language through
// dialogue. ONE execution of that expression is a bounded song. When the
// expression turns out to be repeatable, it is persisted as a SCORE and can be
// re-run without re-originating. Hen stores the artifact; the meaning of the
// stored program — that it is an orchestration, with valid addresses, ordered
// the way `runOrchestration` orders it — is Anima's, and lives here.

/** The orchestration shape a score persists. Structural, so no runtime import. */
export interface ScoredOrchestration {
  readonly id: string;
  readonly address: VakAddress;
  readonly steps: ReadonlyArray<{
    readonly id: string;
    readonly address: VakAddress;
    readonly task: string;
    readonly agent?: string;
    readonly agents?: string[];
    readonly chain?: string;
  }>;
}

/** Raised when a score is asked for from a session that is not originating. */
export class ScoreOriginationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ScoreOriginationError";
  }
}

/** Raised when a stored program is not a runnable orchestration. */
export class ScoreProgramError extends Error {
  readonly violations: string[];

  constructor(scoreId: string, violations: string[]) {
    super(`score '${scoreId}' does not carry a runnable orchestration: ${violations.join("; ")}`);
    this.name = "ScoreProgramError";
    this.violations = violations;
  }
}

/**
 * Validate that an opaque stored program really is an orchestration.
 *
 * Hen stores the program verbatim and never reads into it, so this is the only
 * place the shape is checked — and it has to be checked on the way OUT, not
 * trusted, because a score is loaded in order to be executed.
 */
export function assertScoredOrchestration(scoreId: string, program: unknown): ScoredOrchestration {
  const violations: string[] = [];
  const candidate = program as ScoredOrchestration | undefined;

  if (!candidate || typeof candidate !== "object") {
    throw new ScoreProgramError(scoreId, ["program is not an object"]);
  }
  if (typeof candidate.id !== "string" || candidate.id.length === 0) {
    violations.push("missing orchestration id");
  }
  if (!isValidVakAddress(candidate.address)) {
    violations.push("orchestration address is not a canonical VAK address");
  }
  if (!Array.isArray(candidate.steps) || candidate.steps.length === 0) {
    violations.push("orchestration declares no steps");
  } else {
    candidate.steps.forEach((step, index) => {
      if (!step || typeof step.id !== "string" || step.id.length === 0) {
        violations.push(`step ${index}: missing id`);
      }
      if (typeof step?.task !== "string" || step.task.length === 0) {
        violations.push(`step ${step?.id ?? index}: missing task`);
      }
      if (!isValidVakAddress(step?.address)) {
        violations.push(`step ${step?.id ?? index}: address is not a canonical VAK address`);
      }
    });
  }

  if (violations.length > 0) throw new ScoreProgramError(scoreId, violations);
  return candidate;
}

/**
 * Persist a developed orchestration as a re-runnable score.
 *
 * REFUSES a session that is no longer originating. Origination is dialogue —
 * a score has to come from somewhere, and "the flow I was already mechanically
 * running" is not an origination. That refusal is the whole reason `CSState`
 * carries the polarity.
 */
export function persistScore(input: {
  scoreId: string;
  orchestration: ScoredOrchestration;
  sessionId?: string;
  title?: string;
  task?: string;
  /** ISO-8601; supplied by the caller so this stays deterministic under test. */
  originatedAt?: string;
}): ScoreDocument {
  const state = getCSState(input.sessionId);
  if (state.origination !== ORIGINATION_DIALOGICAL) {
    throw new ScoreOriginationError(
      `cannot originate score '${input.scoreId}': session is ${state.origination}, ` +
        `and a score originates only from ${ORIGINATION_DIALOGICAL} dialogue`,
    );
  }
  assertScoredOrchestration(input.scoreId, input.orchestration);

  return saveScore({
    id: input.scoreId,
    title: input.title,
    program: input.orchestration,
    provenance: {
      origination: ORIGINATION_DIALOGICAL,
      originatedAt: input.originatedAt,
      sessionId: input.sessionId,
      task: input.task,
    },
  });
}

/** Load a score and the validated orchestration it carries. */
export function loadScoredOrchestration(scoreId: string): {
  score: ScoreDocument;
  orchestration: ScoredOrchestration;
} {
  const score = loadScore(scoreId);
  return { score, orchestration: assertScoredOrchestration(scoreId, score.program) };
}

/**
 * Re-run a persisted score.
 *
 * The runner is injected rather than imported: `lib/vak-orchestration-surface.ts`
 * already imports this module for the CFP→tool map, so importing it back would
 * close a cycle. Injection also keeps this honest — a re-run executes whatever
 * the caller's executor does, and this function's job is only to guarantee the
 * PROGRAM is byte-identical to the one that was persisted.
 *
 * Sets the session mechanistic for the duration: a re-run is a ready-made flow,
 * not a new dialogue. The prior polarity is restored afterwards, so re-running a
 * score in the middle of an originating session does not end the origination.
 */
export async function rerunScore<T>(input: {
  scoreId: string;
  run: (orchestration: ScoredOrchestration, score: ScoreDocument) => Promise<T> | T;
  sessionId?: string;
  /** ISO-8601 for the run record; caller-supplied. */
  at?: string;
  outcome?: string;
  detail?: Record<string, unknown>;
  /**
   * Log this completed run as a Mercurius ELO trial (50.T50.12).
   *
   * Opt-in, and deliberately so. A trial needs four context fields and three
   * identity fields the run cannot derive (`modules/elo-trial-hook.ts`), so a
   * run that has not been told them cannot honestly become a trial — and the
   * hook refuses rather than inventing them. Omitting this is the honest
   * default for a run nobody is scoring.
   */
  elo?: {
    declaration: EloRunDeclaration;
    outcomes: MercuriusTrialOutcomes;
    config: AletheiaEloConfig;
    tournament?: "agent" | "canon";
    databasePath?: string;
  };
  /**
   * Emit `portal.vak_eval` for this run (50.T50.13).
   *
   * Opt-in for the same reason `elo` is: the reading needs a LENS — the
   * scale-beneath — and a trace has no producer for one. A run that has not
   * been told its lens is refused rather than read in a guessed epistemic mode.
   *
   * When the run is already being ELO-scored, `lens` may be omitted and the
   * `elo.declaration.mef_lens` it must already carry is used, so the two hooks
   * share one declaration instead of asking for the same coordinate twice.
   */
  vakEval?: {
    declaration?: Partial<VakEvalDeclaration>;
    options?: VakEvalOptions;
  };
}): Promise<{
  result: T;
  score: ScoreDocument;
  run: ScoreRunRecord;
  trial?: MercuriusUpdateResult;
  vakEval?: VakEvalReceipt;
}> {
  const { score, orchestration } = loadScoredOrchestration(input.scoreId);
  const previous = getCSState(input.sessionId);

  setOrigination(input.sessionId, ORIGINATION_MECHANISTIC);
  try {
    const result = await input.run(orchestration, score);
    const run = recordScoreRun({
      scoreId: score.id,
      hash: score.hash,
      at: input.at,
      origination: ORIGINATION_MECHANISTIC,
      outcome: input.outcome,
      detail: input.detail,
    });

    // The audible half. Emitted before the ELO trial because the reading is of
    // the run as it was performed, and the trial is a judgement made about it.
    let vakEval: VakEvalReceipt | undefined;
    if (input.vakEval) {
      const lens = input.vakEval.declaration?.lens ?? input.elo?.declaration.mef_lens;
      vakEval = await emitVakEval(
        {
          task: score.provenance.task ?? score.id,
          declaration: {
            ...input.vakEval.declaration,
            lens: lens as string,
            sessionKey: input.vakEval.declaration?.sessionKey ?? input.sessionId,
          },
          trace: traceFromSteps(orchestration.steps),
        },
        input.vakEval.options ?? {},
      );
    }

    if (!input.elo) return { result, score, run, ...(vakEval ? { vakEval } : {}) };

    // The run has completed and the program identity is in hand. The trial id is
    // the score hash plus the run's own timestamp: a byte-identical program run
    // twice is exactly the "same matchup" the ELO engine assumes, and the hash
    // states that more strongly than the context tuple can.
    const at = input.at ?? new Date().toISOString();
    const trial = await recordDurableRunTrial({
      trial: {
        trialId: `${score.id}:${score.hash.slice(0, 12)}:${at}`,
        address: orchestration.address,
        agent: orchestration.steps[0]?.agent ?? "anima",
        declaration: input.elo.declaration,
        outcomes: input.elo.outcomes,
        ...(input.elo.tournament === undefined ? {} : { tournament: input.elo.tournament }),
        completedAt: at,
      },
      config: input.elo.config,
      ...(input.elo.databasePath === undefined ? {} : { databasePath: input.elo.databasePath }),
      computedAt: at,
    });
    return { result, score, run, trial, ...(vakEval ? { vakEval } : {}) };
  } finally {
    setOrigination(input.sessionId, previous.origination);
  }
}

// ── learned-from-review checkpoints (50.T50.09) ───────────────────────────
//
// The third way a checkpoint comes to exist: a review of a past run concluded
// that this class of run WANTED one. That conclusion has to survive the run it
// was made in, or "learned after the fact" is just a phrase. It survives as a
// run record against the score, which is the same append-only history the ELO
// work reads (50.T50.12).
//
// What this deliberately does NOT do is insert anything. `learnedCheckpointProposals`
// returns evidence a script author may adopt — and adopting it means authoring a
// checkpoint with `reason: "learned-from-review"` onto a step by hand. Nothing in
// `checkpointGate` reads this store. That gap is the no-auto-insertion policy,
// made structural rather than promised.

/** The detail key a checkpoint review writes under, inside a `ScoreRunRecord`. */
export const CHECKPOINT_REVIEW_DETAIL_KEY = "checkpoint_review";

/** A past review's verdict on whether a run wanted a human checkpoint. */
export interface CheckpointReviewOutcome {
  /** The step the reviewer was looking at, when they named one. */
  readonly stepId?: string;
  /** Did this run want a human checkpoint it did not have? */
  readonly wantedCheckpoint: boolean;
  readonly note?: string;
}

/** A checkpoint a later author MAY adopt. Evidence, not an instruction. */
export interface LearnedCheckpointProposal {
  readonly stepId?: string;
  /** Always `learned-from-review` — that is what makes this proposal citable. */
  readonly reason: CheckpointReason;
  readonly note?: string;
  /** When the review that produced it was recorded. */
  readonly at?: string;
}

/**
 * Record a review's verdict about checkpoints against a score's run history.
 *
 * Appended through the score store's own run log, so it lands in the same
 * append-only history everything else judges a score by — a later run can never
 * overwrite an earlier review's conclusion.
 */
export function recordCheckpointReview(input: {
  scoreId: string;
  hash: string;
  at?: string;
  stepId?: string;
  wantedCheckpoint: boolean;
  note?: string;
}): ScoreRunRecord {
  const outcome: CheckpointReviewOutcome = {
    ...(input.stepId === undefined ? {} : { stepId: input.stepId }),
    wantedCheckpoint: input.wantedCheckpoint,
    ...(input.note === undefined ? {} : { note: input.note }),
  };
  return recordScoreRun({
    scoreId: input.scoreId,
    hash: input.hash,
    at: input.at,
    outcome: "checkpoint-review",
    detail: { [CHECKPOINT_REVIEW_DETAIL_KEY]: outcome },
  });
}

/**
 * The checkpoints a score's own review history says it wanted.
 *
 * Only the affirmative verdicts come back: a review that concluded a step did
 * NOT want a checkpoint is still recorded (it is evidence too, and the ELO work
 * reads the same log) but it is not a proposal, so it is not returned as one.
 */
export function learnedCheckpointProposals(scoreId: string): LearnedCheckpointProposal[] {
  const proposals: LearnedCheckpointProposal[] = [];
  for (const run of readScoreRuns(scoreId)) {
    const outcome = run.detail?.[CHECKPOINT_REVIEW_DETAIL_KEY] as
      | CheckpointReviewOutcome
      | undefined;
    if (!outcome || outcome.wantedCheckpoint !== true) continue;
    proposals.push({
      ...(outcome.stepId === undefined ? {} : { stepId: outcome.stepId }),
      reason: "learned-from-review",
      ...(outcome.note === undefined ? {} : { note: outcome.note }),
      ...(run.at === undefined ? {} : { at: run.at }),
    });
  }
  return proposals;
}

export function runEpi(args: string[], timeout = 120_000) {
  return spawnSync(process.env.EPI_BIN || "epi", args, {
    encoding: "utf8",
    timeout,
    cwd: process.env.EPI_REPO_ROOT || process.cwd(),
  });
}

export interface TeamDispatchVakAddressDefaults {
  readonly agentName: string;
  readonly vakAddress?: unknown;
  readonly cpf?: CpfPolarity;
  readonly ct?: CtLiteral[];
  readonly cp?: CpLiteral;
  readonly cf?: CfLiteral;
  readonly cfp?: CfpLiteral;
  readonly cs?: {
    readonly code?: CsLiteral;
    readonly direction?: CsDirection;
  };
}

export function vakAddressForTeamDispatch(input: TeamDispatchVakAddressDefaults): VakAddress {
  if (input.vakAddress !== undefined) {
    if (!isValidVakAddress(input.vakAddress)) {
      throw new Error("vak_address failed canonical validation");
    }
    return input.vakAddress;
  }

  const normalizedAgent = input.agentName.trim().toLowerCase();
  const cf = input.cf ?? AGENT_CF[normalizedAgent] ?? "(4.0/1-4.4/5)";
  return {
    cpf: input.cpf ?? "(4.0/1-4.4/5)",
    ct: input.ct ?? ["CT4b"],
    cp: input.cp ?? "CP4.2",
    cf,
    cfp: input.cfp ?? "CFP0",
    cs: {
      code: input.cs?.code ?? "CS4",
      direction: input.cs?.direction ?? "Day",
    },
  };
}

// Dispatch a single agent task via the native team runtime (epi agent team dispatch).
// Returns a Promise so callers can fan-out concurrently with Promise.all.
// vak_address is REQUIRED — every dispatch must carry its causal address (A5).
// Callers must pre-validate via validateDispatchParams; this function trusts its input.
// The address is forwarded to the child via EPI_SESSION_VAK_ADDRESS so downstream
// tools (Hen template render, future VAK-aware tools) can read it.
export function dispatchTeamMember(agentName: string, task: string, vakAddress?: VakAddress): Promise<string> {
  return dispatchTeamMemberWithEnvironment(agentName, task, vakAddress);
}

/**
 * Additive 12.T12.31 route: child execution receives a redacted parent slice
 * in its process environment while retaining the same native `epi agent team
 * dispatch` launch path as every ordinary Anima dispatch.
 */
export async function dispatchWithParentSlice(input: {
  readonly target_agent: string;
  readonly task_spec: string;
  readonly vak_frame: VakAddress;
  readonly parent_slice: ConversationSliceHandle;
}): Promise<string> {
  const output = await dispatchTeamMemberWithEnvironment(
    input.target_agent,
    input.task_spec,
    input.vak_frame,
    parentSliceChildEnvironment(input.parent_slice),
  );
  const completion = parentSliceCompletionFromDispatchOutput(input, output);
  if (completion) await publishParentSliceCompletion(completion);
  return output;
}

export async function publishParentSliceCompletion(event: ParentSliceCompletionEvent): Promise<void> {
  if (parentSliceCompletionEmitter) await parentSliceCompletionEmitter(event);
}

/**
 * Native `epi agent team dispatch --json` is the authoritative completion
 * report. A child may set `EPI_SUBGOAL_STATUS={"c":0,"evidence":"..."}`
 * in its final output to continue its micro-history; an ordinary successful
 * process completion is a c=1 fold.
 */
export function parentSliceCompletionFromDispatchOutput(input: {
  readonly target_agent: string;
  readonly task_spec: string;
  readonly vak_frame: VakAddress;
  readonly parent_slice: ConversationSliceHandle;
}, output: string): ParentSliceCompletionEvent | null {
  const report = jsonRecord(output);
  if (!report || report.ok !== true) return null;
  const rawEvidence = typeof report?.output === "string" ? report.output : output;
  const signal = subgoalSignal(rawEvidence);
  return {
    agentId: input.target_agent,
    taskId: stringField(report, "team_id") ?? stringField(report, "teamId")
      ?? `${input.parent_slice.provenance_audit_id}:${input.target_agent}`,
    c: signal?.c ?? 1,
    evidence: signal?.evidence ?? rawEvidence,
    task_spec: input.task_spec,
    vak_frame: input.vak_frame,
    parent_slice: input.parent_slice,
  };
}

function subgoalSignal(output: string): { c: 0 | 1; evidence?: string } | null {
  const line = output.split("\n").find((entry) => entry.startsWith("EPI_SUBGOAL_STATUS="));
  if (!line) return null;
  const parsed = jsonRecord(line.slice("EPI_SUBGOAL_STATUS=".length));
  if (!parsed || (parsed.c !== 0 && parsed.c !== 1)) return null;
  return {
    c: parsed.c,
    evidence: typeof parsed.evidence === "string" ? parsed.evidence : undefined,
  };
}

function jsonRecord(value: string): Record<string, unknown> | null {
  try {
    const parsed: unknown = JSON.parse(value);
    return parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed as Record<string, unknown>
      : null;
  } catch {
    return null;
  }
}

function stringField(record: Record<string, unknown> | null, key: string): string | null {
  const value = record?.[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

function dispatchTeamMemberWithEnvironment(
  agentName: string,
  task: string,
  vakAddress?: VakAddress,
  parentSliceEnvironment?: NodeJS.ProcessEnv,
): Promise<string> {
  const parentSession = process.env.EPI_PARENT_SESSION || "agent:main:main";
  const args = [
    "--json", "agent", "team", "dispatch",
    "--parent-session", parentSession,
    "--agent", agentName,
    "--task", task,
  ];
  const childEnv: NodeJS.ProcessEnv = { ...process.env, ...parentSliceEnvironment };
  const parentSessionForChild = parentSliceEnvironment?.EPI_PARENT_SESSION ?? parentSession;
  args[5] = parentSessionForChild;
  if (vakAddress) {
    childEnv.EPI_SESSION_VAK_ADDRESS = JSON.stringify(vakAddress);
  }
  return new Promise((resolve) => {
    const proc = spawn(process.env.EPI_BIN || "epi", args, {
      stdio: ["ignore", "pipe", "pipe"],
      env: childEnv,
      cwd: process.env.EPI_REPO_ROOT || process.cwd(),
    });
    let stdout = "";
    let stderr = "";
    proc.stdout.on("data", (d: Buffer) => { stdout += d.toString(); });
    proc.stderr.on("data", (d: Buffer) => { stderr += d.toString(); });
    proc.on("close", () => { resolve(stdout || stderr); });
    proc.on("error", (err: Error) => { resolve(`Error: ${err.message}`); });
  });
}

export function sophiaReview(sessionId: string | undefined, sessionOutput: string) {
  const nightState = setCSState(sessionId, {
    value: "CS5",
    directionality: "night_prime",
    cpPosition: "4.5",
  });
  const prompt = [
    "Review and crystallise this session output.",
    "Emit P5' insight and P0' questions.",
    `CS=${nightState.value}:${nightState.directionality}`,
    sessionOutput,
  ].join("\n\n");
  return runEpi(["agent", "run", "--agent", "sophia", prompt]);
}
