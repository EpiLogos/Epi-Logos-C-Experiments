/**
 * orchestration-run.ts — Anima holds the run; children are the teams/chains (50.T50.05).
 *
 * This is Anima's actual role: managing sub-process runs. The top-level
 * orchestration script and its context live HERE, in the parent. The script
 * instantiates child pi's because agent teams, chains and modes ARE subagents —
 * nothing else in the system is agentic.
 *
 * The load-bearing property is **context isolation**. When an upstream result
 * feeds a downstream child, only the variables that child declared it needs
 * cross the boundary — never the parent's conversation history, never the
 * upstream child's transcript. The code environment moves data between agents,
 * and that is the second half of the token win: 50.T50.01 removed the per-hop
 * re-send inside one agent's work, and this removes the transcript-passing
 * between agents.
 *
 * A child's input is therefore a small declared record, not a growing history.
 * `childInputFor()` is the only way to build one, and it refuses an undeclared
 * variable rather than quietly widening the child's view.
 *
 * Canon: [[S4-SPEC]] -> Anima orchestration; Pi->subagent is the only agentic path.
 */

import type { VakAddress } from "../../shared/vak_address.ts";

/** A value that may cross the parent/child boundary. Deliberately narrow. */
export type RunVariableValue = string | number | boolean | null;

/** The parent's run state: what has been produced so far, by whom. */
export interface OrchestrationRunState {
	readonly runId: string;
	/** Variables exported by completed steps, keyed by name. */
	readonly variables: Readonly<Record<string, RunVariableValue>>;
	/** One record per completed step, in completion order. */
	readonly completed: readonly CompletedStepRecord[];
}

/** What one completed step contributed to the run. */
export interface CompletedStepRecord {
	readonly stepId: string;
	readonly agent: string;
	readonly address: VakAddress;
	/** The variables this step exported into the run. */
	readonly exported: Readonly<Record<string, RunVariableValue>>;
	/** Size of the child's raw output, which does NOT enter the run state. */
	readonly rawOutputChars: number;
}

/** A step's data contract: what it needs in, what it promises out. */
export interface StepDataContract {
	/** Variable names this step needs. Only these reach the child. */
	readonly imports?: readonly string[];
	/** Variable names this step promises to export. */
	readonly exports?: readonly string[];
}

/** Raised when the declared data contract is violated. */
export class RunContextError extends Error {
	readonly code: "run/undeclared-import" | "run/missing-export" | "run/undeclared-export";

	constructor(code: RunContextError["code"], message: string) {
		super(message);
		this.name = "RunContextError";
		this.code = code;
	}
}

/** Start a run. The parent owns this object for the run's whole life. */
export function beginRun(runId: string): OrchestrationRunState {
	return Object.freeze({
		runId,
		variables: Object.freeze({}),
		completed: Object.freeze([]),
	});
}

/**
 * Build the input a child actually receives.
 *
 * ONLY the step's declared imports cross, and every one of them must already
 * exist in the run state. A step that declares nothing receives nothing — the
 * default is isolation, not inheritance.
 */
export function childInputFor(
	state: OrchestrationRunState,
	contract: StepDataContract,
): Record<string, RunVariableValue> {
	const input: Record<string, RunVariableValue> = {};
	for (const name of contract.imports ?? []) {
		if (!(name in state.variables)) {
			throw new RunContextError(
				"run/undeclared-import",
				`step imports "${name}" but no completed step has exported it (available: ${Object.keys(state.variables).join(", ") || "none"})`,
			);
		}
		input[name] = state.variables[name];
	}
	return input;
}

/**
 * Record a completed step.
 *
 * The child's raw output is measured and discarded, not accumulated: only the
 * declared exports enter the run state. This is what keeps the parent's context
 * flat in the number of children rather than growing with each transcript.
 */
export function completeStep(
	state: OrchestrationRunState,
	step: {
		stepId: string;
		agent: string;
		address: VakAddress;
		contract: StepDataContract;
		rawOutput: string;
		exported: Record<string, RunVariableValue>;
	},
): OrchestrationRunState {
	const declared = new Set(step.contract.exports ?? []);
	const provided = Object.keys(step.exported);

	for (const name of provided) {
		if (!declared.has(name)) {
			throw new RunContextError(
				"run/undeclared-export",
				`step "${step.stepId}" exported "${name}" without declaring it`,
			);
		}
	}
	for (const name of declared) {
		if (!(name in step.exported)) {
			throw new RunContextError(
				"run/missing-export",
				`step "${step.stepId}" declared export "${name}" but produced none`,
			);
		}
	}

	const record: CompletedStepRecord = Object.freeze({
		stepId: step.stepId,
		agent: step.agent,
		address: step.address,
		exported: Object.freeze({ ...step.exported }),
		rawOutputChars: step.rawOutput.length,
	});

	return Object.freeze({
		runId: state.runId,
		variables: Object.freeze({ ...state.variables, ...step.exported }),
		completed: Object.freeze([...state.completed, record]),
	});
}

/**
 * Render a child's declared input as the prompt preamble it will see.
 *
 * Small, explicit and bounded — a handful of `name: value` lines. Contrast the
 * alternative this replaces: pasting an upstream transcript into a downstream
 * prompt, which grows without limit and leaks the parent's whole conversation.
 */
export function renderChildInput(input: Record<string, RunVariableValue>): string {
	const names = Object.keys(input);
	if (names.length === 0) return "";
	const lines = names.map((name) => `${name}: ${String(input[name])}`);
	return ["## Inputs", ...lines].join("\n");
}

// ── Run lifecycle, owned by the Anima extension ───────────────────────────
//
// The top-level script's run state belongs to the parent Anima session, so it is
// held for exactly the session's lifetime: opened on session_start, cleared on
// session_shutdown (see `extension/mod.ts`). A child pi never holds run state —
// children are the teams and chains, and they receive only their declared inputs.

let currentRun: OrchestrationRunState | undefined;

/** Open the session's run. Replaces any previous one. */
export function openCurrentRun(runId: string): OrchestrationRunState {
	currentRun = beginRun(runId);
	return currentRun;
}

/** The session's run, or undefined when no run is open. */
export function getCurrentRun(): OrchestrationRunState | undefined {
	return currentRun;
}

/**
 * Replace the session's run with an advanced state.
 *
 * The state itself is immutable; this is how the parent adopts the next one
 * after a step completes.
 */
export function setCurrentRun(state: OrchestrationRunState): void {
	currentRun = state;
}

/** Close the session's run. */
export function clearCurrentRun(): void {
	currentRun = undefined;
}

/** How much the parent is carrying — the measure that must stay flat. */
export function runContextSize(state: OrchestrationRunState): {
	variableCount: number;
	variableChars: number;
	completedSteps: number;
	/** Total child output the run SAW but did not retain. */
	discardedOutputChars: number;
} {
	const variableChars = Object.entries(state.variables).reduce(
		(sum, [name, value]) => sum + name.length + String(value).length,
		0,
	);
	return {
		variableCount: Object.keys(state.variables).length,
		variableChars,
		completedSteps: state.completed.length,
		discardedOutputChars: state.completed.reduce((sum, r) => sum + r.rawOutputChars, 0),
	};
}
