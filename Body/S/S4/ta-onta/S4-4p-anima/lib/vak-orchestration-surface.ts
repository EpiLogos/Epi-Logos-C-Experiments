/**
 * vak-orchestration-surface.ts — the six C′ coordinates as a typed scripting
 * surface (50.T50.03).
 *
 * VAK is the operational language of the system, not metadata over labels
 * (DR-VAK-3). This module is the vocabulary an Anima orchestration script is
 * written *against*: each of the six reflective coordinates is a composable AXIS
 * of the script, not a tag attached to it afterwards.
 *
 *   CPF — plans the run and sets human-review polarity:
 *         `(00/00)` Dialogical halts for input · `(4.0/1-4.4/5)` Mechanistic runs
 *   CT  — the Hen (S1′) artifact templates a step produces or consumes
 *   CP  — where the step sits inside its context frame (the nesting anchor;
 *         the recursion itself is 50.T50.04, which builds on this surface)
 *   CF  — binds the agent/mode, via `AGENT_CF`
 *   CFP — the execution-flow shape (parallel / chain / fusion / nested / Z)
 *   CS  — sequences the step, Day or Night′
 *
 * The types are NOT redefined here. `ta-onta/shared/vak_address.ts` is the
 * canonical TS mirror of `Body/S/S0/portal-core/src/vak_address.rs`, already
 * literal-union typed and pinned by its own wire-shape and frozen-fixture
 * contract tests; this surface consumes it so there is exactly one mirror.
 *
 * The load-bearing invariant: **every emission carries the FULL six-field
 * envelope.** `assertFullEnvelope` refuses a partial or non-canonical address and
 * names the offending coordinate, rather than coercing it into something
 * plausible. A known non-canonical producer exists — `epi agent vak evaluate`
 * (`Body/S/S0/epi-cli/src/agent/vak.rs`) emits a separate loose `VakCoordinates`
 * shape (`cpf:"C2"`, `cp:"CP4"`, scalar `ct`, flat `cs`) that does NOT satisfy
 * this envelope. That divergence is deliberately surfaced as a refusal here, not
 * papered over: guessing which `CP4.x` a bare `"CP4"` meant would fabricate a
 * coordinate.
 *
 * Canon: [[S4-SPEC]] -> VAK dispatch; DR-VAK-3; DR-VAK-7 / DR-COMP-1
 * (coordinate-tagging IS compression).
 */

import {
	isValidVakAddress,
	type CfLiteral,
	type CfpLiteral,
	type CpLiteral,
	type CpfPolarity,
	type CsField,
	type CtLiteral,
	type VakAddress,
} from "../../shared/vak_address.ts";
import { AGENT_CF, agentForCf } from "../modules/dispatch-validate.ts";
import { zThreadToolForMove, type ZThreadToolName } from "../extension/dispatch.ts";
import type { CfpMoveLiteral } from "../../shared/vak_address.ts";

/** The six reflective coordinates, as an enumerable axis set. */
export const VAK_COORDINATES = ["cpf", "ct", "cp", "cf", "cfp", "cs"] as const;
export type VakCoordinate = (typeof VAK_COORDINATES)[number];

// ── The envelope invariant ────────────────────────────────────────────────

/** Raised when an emission's address is not a complete canonical envelope. */
export class VakEnvelopeError extends Error {
	readonly violations: string[];

	constructor(violations: string[]) {
		super(`incomplete VAK envelope: ${violations.join("; ")}`);
		this.name = "VakEnvelopeError";
		this.violations = violations;
	}
}

/**
 * Per-coordinate diagnostics for a candidate address.
 *
 * `isValidVakAddress` answers yes/no; a script author needs to know WHICH axis
 * is wrong, because the six coordinates are authored independently.
 */
export function describeEnvelopeViolations(value: unknown): string[] {
	if (!value || typeof value !== "object" || Array.isArray(value)) {
		return ["address is not an object"];
	}
	const v = value as Record<string, unknown>;
	const violations: string[] = [];

	for (const coordinate of VAK_COORDINATES) {
		if (v[coordinate] === undefined || v[coordinate] === null) {
			violations.push(`${coordinate} is missing`);
		}
	}
	if (violations.length > 0) return violations;

	// Present but possibly non-canonical. Name the axis and the offending value.
	if (typeof v.cpf !== "string" || !["(00/00)", "(4.0/1-4.4/5)"].includes(v.cpf)) {
		violations.push(
			`cpf ${JSON.stringify(v.cpf)} is not a review polarity — expected "(00/00)" or "(4.0/1-4.4/5)"`,
		);
	}
	if (!Array.isArray(v.ct)) {
		violations.push(`ct ${JSON.stringify(v.ct)} must be an ARRAY of CT literals, not a scalar`);
	} else if (v.ct.length === 0) {
		violations.push("ct is an empty array — declare at least one content-type");
	}
	if (typeof v.cp !== "string" || !/^CP4\.[0-5]$/.test(v.cp)) {
		violations.push(`cp ${JSON.stringify(v.cp)} is not a frame position — expected CP4.0..CP4.5`);
	}
	if (typeof v.cf !== "string" || !Object.values(AGENT_CF).includes(v.cf as CfLiteral)) {
		violations.push(`cf ${JSON.stringify(v.cf)} is not a canonical context frame`);
	}
	if (typeof v.cfp !== "string") {
		violations.push(`cfp ${JSON.stringify(v.cfp)} is not an execution-flow shape`);
	}
	if (!v.cs || typeof v.cs !== "object") {
		violations.push(
			`cs ${JSON.stringify(v.cs)} must be a { code, direction } field, not a flat string`,
		);
	}

	// Anything still unexplained is caught by the canonical validator.
	if (violations.length === 0 && !isValidVakAddress(value)) {
		violations.push("address fails the canonical VakAddress validator");
	}
	return violations;
}

/** Assert a complete canonical envelope, or throw naming the bad coordinate(s). */
export function assertFullEnvelope(value: unknown): asserts value is VakAddress {
	const violations = describeEnvelopeViolations(value);
	if (violations.length > 0) throw new VakEnvelopeError(violations);
}

/** An emission that is, by construction, envelope-complete. */
export interface VakEmission<T = unknown> {
	readonly address: VakAddress;
	readonly payload: T;
}

/**
 * Build an emission. The only constructor — so an emission cannot exist in this
 * surface without a full six-field address.
 */
export function emit<T>(address: unknown, payload: T): VakEmission<T> {
	assertFullEnvelope(address);
	return Object.freeze({ address, payload });
}

// ── The six axes, as readers ──────────────────────────────────────────────

/** CPF — the review polarity of a step. */
export function reviewPolarity(address: VakAddress): "dialogical" | "mechanistic" {
	return address.cpf === "(00/00)" ? "dialogical" : "mechanistic";
}

/**
 * CPF — does this step halt for a human?
 *
 * Dialogical `(00/00)` means the user is the source and the step waits. There is
 * no auto-insertion policy: a checkpoint exists because the script's author put
 * this polarity on this step (the agent-decided gate composition of 50.T50.09).
 */
export function haltsForHuman(address: VakAddress): boolean {
	return reviewPolarity(address) === "dialogical";
}

/** CT — the artifact templates this step declares. */
export function artifactTemplates(address: VakAddress): CtLiteral[] {
	return [...address.ct];
}

/** CP — where the step sits in its context frame. */
export function framePosition(address: VakAddress): CpLiteral {
	return address.cp;
}

/** CP — the numeric position within the `4.x` frame, for ordering and nesting. */
export function framePositionIndex(address: VakAddress): number {
	const match = /^CP4\.([0-5])$/.exec(address.cp);
	return match ? Number(match[1]) : -1;
}

/** CF — the constitutional agent this frame binds. */
export function boundAgent(address: VakAddress): string | undefined {
	return agentForCf(address.cf);
}

/** CFP — the execution-flow shape. */
export function executionShape(address: VakAddress): CfpLiteral {
	return address.cfp;
}

/**
 * CFP — the dispatch primitive a step resolves to.
 *
 * Delegates to the existing `zThreadToolForMove`, so the orchestration language
 * and the Z-thread runtime cannot disagree about what a CFP move executes. A `Z`
 * shape composes moves rather than being one, so it has no single primitive.
 *
 * NOTE: `CFP4` maps to `tilldone`, which is not yet a registered tool — a known
 * dangling name closed by 50.T50.06. This surface reports the mapping honestly
 * rather than hiding the gap.
 */
export function primitiveFor(address: VakAddress): ZThreadToolName | null {
	if (address.cfp === "Z") return null;
	return zThreadToolForMove(address.cfp as CfpMoveLiteral);
}

/** CS — the sequence field. */
export function sequence(address: VakAddress): CsField {
	return address.cs;
}

/** CS — is this step on the Night′ (retrospective) pass? */
export function isNightPass(address: VakAddress): boolean {
	if (address.cs.sense) return address.cs.sense === "retrospective";
	return address.cs.direction === "Night'";
}

// ── Orchestration composition ─────────────────────────────────────────────

/** One step of an orchestration: a full address plus the work it names. */
export interface OrchestrationStep {
	readonly id: string;
	readonly address: VakAddress;
	readonly task: string;
	/** Explicit agent; when absent the CF binding supplies it. */
	readonly agent?: string;
	readonly agents?: string[];
	readonly chain?: string;
}

/** A composed orchestration: the script's own address plus its steps. */
export interface Orchestration {
	readonly id: string;
	readonly address: VakAddress;
	readonly steps: readonly OrchestrationStep[];
}

/**
 * Declare an orchestration.
 *
 * Every step's address is envelope-checked at declaration time, so a script
 * cannot reach execution carrying a partial coordinate set.
 */
export function defineOrchestration(input: {
	id: string;
	address: unknown;
	steps: Array<{
		id: string;
		address: unknown;
		task: string;
		agent?: string;
		agents?: string[];
		chain?: string;
	}>;
}): Orchestration {
	assertFullEnvelope(input.address);
	if (input.steps.length === 0) {
		throw new VakEnvelopeError(["an orchestration must declare at least one step"]);
	}
	const steps = input.steps.map((step) => {
		try {
			assertFullEnvelope(step.address);
		} catch (err) {
			const violations = err instanceof VakEnvelopeError ? err.violations : [String(err)];
			throw new VakEnvelopeError(violations.map((v) => `step "${step.id}": ${v}`));
		}
		return Object.freeze({
			id: step.id,
			address: step.address,
			task: step.task,
			agent: step.agent ?? boundAgent(step.address),
			agents: step.agents,
			chain: step.chain,
		}) as OrchestrationStep;
	});
	return Object.freeze({ id: input.id, address: input.address, steps: Object.freeze(steps) });
}

/**
 * Which of the six coordinates this orchestration actually composes ACROSS —
 * i.e. the axes on which its steps differ from one another.
 *
 * A script that varies only CF is using one axis with five decorations; a script
 * that varies CPF, CF, CFP and CS is genuinely composing in four dimensions.
 * This is the measure the tranche's acceptance is stated in.
 */
export function composedCoordinates(orchestration: Orchestration): VakCoordinate[] {
	const composed: VakCoordinate[] = [];
	for (const coordinate of VAK_COORDINATES) {
		const seen = new Set(
			orchestration.steps.map((step) => JSON.stringify(step.address[coordinate])),
		);
		if (seen.size > 1) composed.push(coordinate);
	}
	return composed;
}

/** Executes one step. Injectable so the surface is testable without spawning. */
export type StepExecutor = (
	step: OrchestrationStep,
	primitive: ZThreadToolName | null,
) => Promise<string> | string;

/** Raised when a dialogical step needs a human and no responder was supplied. */
export class DialogicalHaltRequired extends Error {
	readonly stepId: string;

	constructor(stepId: string) {
		super(`step "${stepId}" is CPF Dialogical (00/00) and halts for human input`);
		this.name = "DialogicalHaltRequired";
		this.stepId = stepId;
	}
}

/** The result of one executed step, carrying its full envelope. */
export interface OrchestrationStepResult {
	readonly stepId: string;
	readonly emission: VakEmission<{ output: string; primitive: ZThreadToolName | null }>;
	readonly haltedForHuman: boolean;
}

/**
 * Run an orchestration.
 *
 * Steps are ordered by CS pass then CP position: Day (prospective) before Night′
 * (retrospective), and within a pass by frame position. Every result is emitted
 * through `emit()`, so the full-envelope invariant holds for every emission the
 * run produces — not only for the ones a caller remembers to tag.
 */
export async function runOrchestration(
	orchestration: Orchestration,
	options: {
		execute: StepExecutor;
		/** Supplies human input for Dialogical steps; absent => such a step throws. */
		respondToHuman?: (step: OrchestrationStep) => Promise<string> | string;
	},
): Promise<OrchestrationStepResult[]> {
	const ordered = [...orchestration.steps].sort((a, b) => {
		const pass = Number(isNightPass(a.address)) - Number(isNightPass(b.address));
		if (pass !== 0) return pass;
		return framePositionIndex(a.address) - framePositionIndex(b.address);
	});

	const results: OrchestrationStepResult[] = [];
	for (const step of ordered) {
		const primitive = primitiveFor(step.address);
		let output: string;
		let haltedForHuman = false;

		if (haltsForHuman(step.address)) {
			if (!options.respondToHuman) throw new DialogicalHaltRequired(step.id);
			haltedForHuman = true;
			output = await options.respondToHuman(step);
		} else {
			output = await options.execute(step, primitive);
		}

		results.push({
			stepId: step.id,
			emission: emit(step.address, { output, primitive }),
			haltedForHuman,
		});
	}
	return results;
}
