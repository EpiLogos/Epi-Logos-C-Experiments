/**
 * orchestration-trace.ts — the run as the unit fed to learning (50.T50.14).
 *
 * ## What replaces what
 *
 * Everything downstream that scores a run derives its behavioural metrics by
 * counting `toolCallObserved` entries in the session transcript — that is what
 * `aeon_eval` (`Body/S/S3/redis-context/src/aeon_eval.rs`) does. Track 50
 * collapses N JSON tool calls into ONE generated script, so a code-mode run
 * that did fifty reads and ten edits reads as ZERO of each. The measurement
 * goes blind exactly when the orchestration works as designed.
 *
 * The deterministic trace is the replacement unit: the operation over a fixed
 * vocabulary rather than accreted stdout. It is dense, and — because a score is
 * byte-identical by its hash — it is REPLAYABLE, which is what lets a metric
 * derived from it be checked rather than merely recorded.
 *
 * ## Where the work happens
 *
 * Anima carries the run's ops to `chat.inject`; the gateway writes them into
 * the same transcript everything else scores from, and the Rust reader derives
 * the metrics. Nothing here computes a metric — the classification vocabulary
 * (`read`/`apply_patch`/`cargo test`…) lives in one place, Rust-side, and this
 * module would be a second copy free to drift.
 *
 * ## The distillation row, and the channel that has no producer
 *
 * `distill_dataset_gen.py` REQUIRES every row to carry `prompt`,
 * `teacher_output`, and all three annotation channels — `lens_coherence`,
 * `verifier_pass`, `user_articulation_simulation`. A run supplies the first two
 * honestly. It does NOT supply the third channel: nothing in an orchestration
 * simulates a user's articulation, and scoring a distillation corpus on an
 * invented number is worse than having no row. So the channels a run cannot
 * derive are DECLARED and refused by name — the same discipline
 * `elo-trial-hook.ts` applies to the ELO matchup key.
 *
 * Canon: [[S4-SPEC]] -> Anima orchestration.
 */

import { appendFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

import type { VakAddress } from "../../shared/vak_address.ts";
// One gateway-call implementation for every S4 carrier.
import { callGateway, type GatewayCallOptions } from "../../shared/gateway-call.ts";

/** The transcript-write method the trace rides. */
export const TRACE_INJECT_METHOD = "chat.inject";

/** One operation a code-mode script performed. Mirrors the Rust contract. */
export interface OrchestrationTraceOp {
	readonly stepId: string;
	/** Tool/function name — `read`, `apply_patch`, `bash`, … */
	readonly operation: string;
	/** Command text when the op was a shell exec. Omitted, never blank. */
	readonly command?: string;
	readonly agent?: string;
	readonly vakAddress?: VakAddress;
}

export interface OrchestrationTraceUsage {
	readonly turns: number;
	readonly inputTokens: number;
	readonly outputTokens: number;
	readonly totalTokens: number;
}

export interface OrchestrationTrace {
	readonly scoreId: string;
	/** The content hash the score carried when it ran. Replay hinges on it. */
	readonly scoreHash: string;
	readonly runId: string;
	readonly ops: readonly OrchestrationTraceOp[];
	readonly usage: OrchestrationTraceUsage;
}

export type TraceEmitOptions = GatewayCallOptions;

/** Raised when a trace cannot honestly describe the run it claims to be. */
export class OrchestrationTraceError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "OrchestrationTraceError";
	}
}

function present(value: string | undefined): value is string {
	return typeof value === "string" && value.trim().length > 0;
}

/** The request frame, split out so it can be asserted without a socket. */
export function traceInjectRequest(input: {
	sessionKey: string;
	trace: OrchestrationTrace;
	vakAddress?: VakAddress;
}) {
	if (!present(input.sessionKey)) {
		throw new OrchestrationTraceError("a trace needs the session whose transcript it lands in");
	}
	if (!present(input.trace.scoreHash)) {
		throw new OrchestrationTraceError(
			"trace.scoreHash is required — a trace with no program identity cannot be replayed " +
				"against the run it claims to be",
		);
	}
	return {
		method: TRACE_INJECT_METHOD,
		params: {
			sessionKey: input.sessionKey,
			orchestrationTrace: input.trace,
			...(input.vakAddress === undefined ? {} : { vakAddress: input.vakAddress }),
		},
	};
}

/** What the gateway recorded. */
export interface TraceEmitReceipt {
	readonly canonicalKey: string;
	readonly runId: string;
	readonly ops: number;
}

/** Deposit a completed run's deterministic trace into the session transcript. */
export async function emitOrchestrationTrace(
	input: { sessionKey: string; trace: OrchestrationTrace; vakAddress?: VakAddress },
	options: TraceEmitOptions = {},
): Promise<TraceEmitReceipt> {
	const request = traceInjectRequest(input);
	const result = await callGateway(
		{ method: request.method, params: request.params },
		options,
	);
	return {
		canonicalKey: String(result.canonicalKey ?? ""),
		runId: String(result.runId ?? ""),
		ops: Number(result.ops ?? 0),
	};
}

// ── the distillation row ──────────────────────────────────────────────────

/** The three channels `distill_dataset_gen.py` requires on every row. */
export const DISTILLATION_CHANNELS = [
	"lens_coherence",
	"verifier_pass",
	"user_articulation_simulation",
] as const;

/**
 * Channels a run cannot derive and must therefore be told.
 *
 * `user_articulation_simulation` has NO producer anywhere in an orchestration —
 * nothing in a run simulates how a user would articulate the work. `verifier_pass`
 * and `lens_coherence` have plausible sources (the run outcome; the 50.T50.13
 * tonal reading) but neither is a decided mapping, so all three are declared
 * rather than half-derived. A distillation corpus scored on an invented number
 * trains on a fiction.
 */
export const UNDERIVABLE_CHANNELS = DISTILLATION_CHANNELS;

export interface DistillationDeclaration {
	readonly lens_coherence?: number;
	readonly verifier_pass?: number;
	readonly user_articulation_simulation?: number;
}

/** Raised when a row cannot honestly carry a required channel. */
export class DistillationDeclarationError extends Error {
	readonly missing: string[];

	constructor(missing: string[]) {
		super(
			`cannot emit a distillation row: ${missing.join(", ")} ` +
				`${missing.length === 1 ? "has" : "have"} no source in the run and ` +
				`${missing.length === 1 ? "was" : "were"} not declared. distill_dataset_gen.py ` +
				`requires all of ${DISTILLATION_CHANNELS.join(", ")}, and a corpus scored on an ` +
				`invented channel trains the student on a fiction.`,
		);
		this.name = "DistillationDeclarationError";
		this.missing = missing;
	}
}

/** A row in the exact shape `distill_dataset_gen.py` accepts. */
export interface DistillationRow {
	readonly prompt: string;
	readonly teacher_output: string;
	readonly student_target: string;
	readonly annotations: Record<string, number>;
	readonly provenance: Record<string, unknown>;
}

/**
 * Build the distillation row for a completed run.
 *
 * The prompt is the task the score is an expression OF, and the teacher output
 * is what the run produced — both real. Everything else is declared.
 */
export function distillationRowForRun(input: {
	task: string;
	teacherOutput: string;
	trace: OrchestrationTrace;
	declaration: DistillationDeclaration;
	studentTarget?: string;
}): DistillationRow {
	if (!present(input.task)) {
		throw new OrchestrationTraceError("a distillation row needs the task the score expresses");
	}
	if (!present(input.teacherOutput)) {
		throw new OrchestrationTraceError(
			"a distillation row needs the run's output; an empty teacher output is not a teacher",
		);
	}
	const missing = UNDERIVABLE_CHANNELS.filter(
		(channel) => typeof input.declaration[channel] !== "number",
	);
	if (missing.length > 0) throw new DistillationDeclarationError([...missing]);

	return {
		prompt: input.task,
		teacher_output: input.teacherOutput,
		student_target: input.studentTarget ?? input.teacherOutput,
		annotations: Object.fromEntries(
			DISTILLATION_CHANNELS.map((channel) => [channel, input.declaration[channel] as number]),
		),
		// Provenance is what lets a later audit tie a training row back to the
		// exact program that produced it — the hash, not just the name.
		provenance: {
			source: "orchestration-run",
			scoreId: input.trace.scoreId,
			scoreHash: input.trace.scoreHash,
			runId: input.trace.runId,
			ops: input.trace.ops.length,
			turns: input.trace.usage.turns,
		},
	};
}

/** Where distillation rows accumulate. `.epi/` is runtime state, not canon. */
export function distillationCorpusPath(): string {
	if (process.env.EPI_DISTILLATION_JSONL) return process.env.EPI_DISTILLATION_JSONL;
	return join(
		process.env.EPI_REPO_ROOT || process.cwd(),
		".epi",
		"distillation",
		"orchestration-runs.jsonl",
	);
}

/** Append one row. Append-only: a training corpus is never rewritten. */
export function appendDistillationRow(row: DistillationRow, path?: string): string {
	const target = path ?? distillationCorpusPath();
	mkdirSync(dirname(target), { recursive: true });
	// Plain stringify: the row is constructed in a fixed key order, so this is
	// already deterministic. A replacer-array "sort" would filter every nested
	// key by the TOP-level names and silently drop the annotation channels.
	appendFileSync(target, `${JSON.stringify(row)}\n`, "utf8");
	return target;
}
