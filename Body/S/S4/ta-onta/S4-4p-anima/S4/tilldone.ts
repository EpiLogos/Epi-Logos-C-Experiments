/**
 * tilldone.ts — the CFP4 (L-Thread) completion gate, Anima side (50.T50.06).
 *
 * ── The gap this closes ───────────────────────────────────────────────────
 * `zThreadToolForMove` maps CFP4 → `"tilldone"` (`../extension/dispatch.ts`).
 * Before this module that was a bare STRING: nothing bound the name to a real
 * tool, nothing failed if the name were wrong, and — more importantly — nothing
 * gave CFP4 the behaviour its name promises. A CFP4 step ran its work exactly
 * once, like every other move. An L-Thread that closes after one pass is not a
 * completion gate; it is CFP0 wearing a different label.
 *
 * ── Residency: the TOOL is NOT ported here (12.T12.11, confirmed) ─────────
 * The `tilldone` TOOL already lives, registered, at
 *   Body/S/S4/ta-onta/S4-2p-pleroma/S2/tilldone.ts   (the body)
 *   Body/S/S4/ta-onta/S4-2p-pleroma/extension.ts     (`pi.registerTool`)
 * and is scoped to Anima by the Pleroma `execution_backbone` capability matrix.
 * 12.T12.11 confirmed that residency ("no greenfield copy needed"), so copying
 * the tool into Anima would create a second source of truth for one law. The
 * coordinate system is the modular system: Pleroma owns the bounded-execution
 * primitive, Anima owns orchestration. What was missing was never the tool — it
 * was Anima's side of the binding. That is what this file is.
 *
 * So: this module holds NO task state and registers NO tool. It observes the
 * task list the registered tool already emits, and decides one thing that is
 * genuinely Anima's to decide — **when an L-Thread may close.**
 *
 * ── The law ──────────────────────────────────────────────────────────────
 * `tillDoneGate()` mirrors the registered tool's own `tool_call` gate
 * (S4-2p-pleroma/S2/tilldone.ts:335) and its `agent_end` nudge (:365),
 * because the orchestration language and the tool must not disagree about what
 * "done" means:
 *   no tasks            → cannot close; the thread has not planned yet
 *   nothing in progress → cannot close; no task is being worked
 *   tasks outstanding   → cannot close; KEEP RUNNING (this is the nudge)
 *   every task done     → close
 *
 * `runLThread()` is that law as control flow. Its one load-bearing property:
 * **it returns `closed: true` only when the gate says complete.** Exhausting
 * the cycle bound is not completion — it returns `closed: false` and names why.
 *
 * Canon: [[S4-SPEC]] → agent runtime dispatch; DR-VAK-3 (VAK is the operational
 * language, not metadata). Provenance: gate semantics cribbed from the vendored
 * pi tooling via the Pleroma port — cribbed code counts as new code, so the
 * behaviour is re-asserted by this track's own tests rather than inherited.
 */

import type { CfpMoveLiteral, VakAddress } from "../../shared/vak_address.ts";

/** The CFP move an L-Thread occupies. CFP4 is the L-Thread; nothing else is. */
export const L_THREAD_CFP: CfpMoveLiteral = "CFP4";

/** The registered tool CFP4 resolves to. */
export const TILLDONE_TOOL_NAME = "tilldone";

/**
 * Where that tool actually lives. Kept as data (not a comment) so the registry
 * in `../extension/dispatch.ts` can point at it and a test can assert the path
 * exists on disk — a dangling name cannot come back silently.
 */
export const TILLDONE_TOOL_BODY = "Body/S/S4/ta-onta/S4-2p-pleroma/S2/tilldone.ts";
/** The module that calls `pi.registerTool({ name: "tilldone", … })`. */
export const TILLDONE_TOOL_REGISTRAR = "Body/S/S4/ta-onta/S4-2p-pleroma/extension.ts";

// ── The task list, as the registered tool emits it ────────────────────────
//
// Shape mirrors the tool's `TillDoneDetails` payload, which arrives on every
// `tilldone` toolResult. This module reads that payload; it never writes it.

export type TillDoneTaskStatus = "idle" | "inprogress" | "done";

export interface TillDoneTask {
	readonly id: number;
	readonly text: string;
	readonly status: TillDoneTaskStatus;
}

export interface TillDoneList {
	readonly tasks: readonly TillDoneTask[];
	readonly listTitle?: string;
	readonly listDescription?: string;
}

/** Why the gate ruled as it did. Codes, not prose, so callers can branch. */
export type TillDoneGateCode =
	| "tilldone/no-list"
	| "tilldone/none-in-progress"
	| "tilldone/incomplete"
	| "tilldone/complete";

export interface TillDoneGateVerdict {
	readonly code: TillDoneGateCode;
	/** May the L-Thread close? True for exactly one code. */
	readonly complete: boolean;
	/**
	 * Is the thread in a state where no legal work can proceed? The registered
	 * tool BLOCKS other tool use in these states; the L-Thread does not stop —
	 * it carries the reason into the next cycle so the agent can correct itself,
	 * which is what the tool's `agent_end` nudge does interactively.
	 */
	readonly blocked: boolean;
	/** Tasks not yet `done`, in list order. */
	readonly remaining: readonly TillDoneTask[];
	/** Human-facing reason, suitable for feeding straight back to the agent. */
	readonly reason: string;
}

/**
 * The completion law.
 *
 * Pure and total: every list shape maps to exactly one verdict, and `complete`
 * is true only for `tilldone/complete`. Everything downstream — the L-Thread
 * loop, the Z-thread CFP4 route, any future score replay — reads its answer
 * here rather than re-deriving "done" from task fields.
 */
export function tillDoneGate(list: TillDoneList | undefined): TillDoneGateVerdict {
	const tasks = list?.tasks ?? [];
	const remaining = tasks.filter((task) => task.status !== "done");
	const inProgress = tasks.filter((task) => task.status === "inprogress");

	if (tasks.length === 0) {
		return {
			code: "tilldone/no-list",
			complete: false,
			blocked: true,
			remaining,
			reason:
				"No TillDone tasks defined. Plan the work first — use `tilldone new-list` or `tilldone add` before doing anything else.",
		};
	}

	if (remaining.length === 0) {
		return {
			code: "tilldone/complete",
			complete: true,
			blocked: false,
			remaining,
			reason: `All ${tasks.length} TillDone task(s) are done.`,
		};
	}

	if (inProgress.length === 0) {
		return {
			code: "tilldone/none-in-progress",
			complete: false,
			blocked: true,
			remaining,
			reason: `No task is in progress. Use \`tilldone toggle\` to mark one of the ${remaining.length} remaining task(s) inprogress before continuing.`,
		};
	}

	return {
		code: "tilldone/incomplete",
		complete: false,
		blocked: false,
		remaining,
		reason: `${remaining.length} task(s) still incomplete:\n${remaining
			.map((task) => `  #${task.id} [${task.status}]: ${task.text}`)
			.join("\n")}\nContinue working, or mark them done with \`tilldone toggle\`. Don't stop until it's done.`,
	};
}

// ── The L-Thread ──────────────────────────────────────────────────────────

/** Raised when a CFP4 executor is handed something that is not an L-Thread. */
export class LThreadAddressError extends Error {
	readonly cfp: string;

	constructor(cfp: string) {
		super(
			`the tilldone completion gate is the CFP4 (L-Thread) executor; refused an address carrying cfp='${cfp}'`,
		);
		this.name = "LThreadAddressError";
		this.cfp = cfp;
	}
}

/**
 * Refuse a non-CFP4 address. Thrown, not returned: binding the completion gate
 * to the wrong move is a composition error in the script, not a runtime outcome
 * to be reported and shrugged at.
 */
export function assertLThreadAddress(address: Pick<VakAddress, "cfp">): void {
	if (address.cfp !== L_THREAD_CFP) throw new LThreadAddressError(String(address.cfp));
}

/** One pass of the thread: work was attempted, then the gate ruled. */
export interface LThreadCycle {
	readonly cycle: number;
	/** Whatever `perform` returned for this pass. */
	readonly output: string;
	readonly verdict: TillDoneGateVerdict;
}

export interface LThreadResult {
	readonly id: string;
	/** True ONLY when the final verdict says complete. Never true on exhaustion. */
	readonly closed: boolean;
	readonly cycles: readonly LThreadCycle[];
	readonly finalVerdict: TillDoneGateVerdict;
	/** Present when the thread did not close, naming what stopped it. */
	readonly reason?: string;
}

export interface RunLThreadInput {
	readonly id: string;
	/** Must carry `cfp: "CFP4"`. Optional so the loop is testable in isolation. */
	readonly address?: Pick<VakAddress, "cfp">;
	/**
	 * Do one pass of the work. Receives the previous cycle's verdict so the
	 * gate's reason can be fed back to the agent verbatim — that feedback IS the
	 * tool's nudge, moved from the interactive session into the orchestration.
	 */
	readonly perform: (
		cycle: number,
		previous: TillDoneGateVerdict | undefined,
	) => Promise<string> | string;
	/** Read the CURRENT task list from the registered tool's emitted state. */
	readonly readTaskList: () => Promise<TillDoneList | undefined> | (TillDoneList | undefined);
	/** Upper bound on passes. Exhausting it does NOT close the thread. */
	readonly maxCycles?: number;
}

/** Default pass bound. Generous enough for real autonomous work, still finite. */
export const DEFAULT_L_THREAD_MAX_CYCLES = 12;

/**
 * Run an autonomous thread under the completion gate.
 *
 * The contract, in one line: **the thread closes when the task list says it is
 * done, and keeps running when it does not.** Work is attempted first (an empty
 * list is the legitimate starting state — the first pass is where the agent
 * plans), then the gate reads the resulting list and decides.
 */
export async function runLThread(input: RunLThreadInput): Promise<LThreadResult> {
	if (input.address) assertLThreadAddress(input.address);

	const maxCycles = input.maxCycles ?? DEFAULT_L_THREAD_MAX_CYCLES;
	if (!Number.isInteger(maxCycles) || maxCycles < 1) {
		throw new RangeError(`L-Thread '${input.id}' needs maxCycles >= 1, got ${maxCycles}`);
	}

	const cycles: LThreadCycle[] = [];
	let verdict = tillDoneGate(undefined);

	for (let cycle = 1; cycle <= maxCycles; cycle += 1) {
		const previous = cycles.length > 0 ? cycles[cycles.length - 1].verdict : undefined;
		const output = await input.perform(cycle, previous);
		verdict = tillDoneGate(await input.readTaskList());
		cycles.push({ cycle, output, verdict });

		if (verdict.complete) {
			return { id: input.id, closed: true, cycles, finalVerdict: verdict };
		}
	}

	return {
		id: input.id,
		closed: false,
		cycles,
		finalVerdict: verdict,
		reason: `L-Thread '${input.id}' did not reach its done-condition within ${maxCycles} cycle${
			maxCycles === 1 ? "" : "s"
		}: ${verdict.reason}`,
	};
}

/**
 * Render an L-Thread result as the move output a Z-thread records.
 *
 * Keeps the trace honest: the recorded output says how many passes ran and
 * whether the gate actually closed, so a run that merely exhausted its budget
 * can never read back as a completed one.
 */
export function describeLThreadResult(result: LThreadResult): string {
	const head = result.closed
		? `L-Thread '${result.id}' CLOSED after ${result.cycles.length} cycle(s): ${result.finalVerdict.reason}`
		: `L-Thread '${result.id}' DID NOT CLOSE after ${result.cycles.length} cycle(s): ${result.finalVerdict.reason}`;
	const body = result.cycles
		.map((cycle) => `  cycle ${cycle.cycle} [${cycle.verdict.code}] ${cycle.output}`)
		.join("\n");
	return body ? `${head}\n${body}` : head;
}
