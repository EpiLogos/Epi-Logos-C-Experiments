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
import { conventionalToolFor, type ZThreadToolName } from "./thread-shape.ts";
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
 * CFP — the dispatch primitive a step CONVENTIONALLY starts from.
 *
 * `null` for two distinct reasons, both honest: a `Z` shape composes moves
 * rather than being one, and `CFP4` is a duration/completion property laid over
 * whatever dispatch it wraps rather than a topology with a primitive of its own.
 *
 * This is a convention, not an identity. A CFP does not name a tool — canon maps
 * a CFP to a SKILL or PATTERN and writes CFP3 as a *mode* of CFP1's skill. For
 * what a thread IS, read `shapeOf(cfp)`; for what could realise it, read
 * `capabilitiesFor(shape)` (`./thread-shape.ts`).
 */
export function primitiveFor(address: VakAddress): ZThreadToolName | null {
	if (address.cfp === "Z") return null;
	return conventionalToolFor(address.cfp as CfpMoveLiteral);
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

// ── CP nesting: context-frame recursion (50.T50.04) ───────────────────────
//
// CP is the composability engine. A position inside a context frame is EITHER a
// terminal dispatch (a leaf) OR it expands into a full nested context frame. That
// is the `.`-nesting operator surfaced through CP, and it is what lets the
// language scale: `(0/1/2)` position 0 can open `(00/00)`, and a
// `(4.0/1-4.4/5)` parent can nest a whole frame at each of its internal
// positions.
//
// In TypeScript this needs no new abstraction — a frame is a node whose children
// are nodes, and evaluation is plain recursion. What this section adds is the
// *law*: which slots a frame has, and that a child's CP must agree with the slot
// it occupies.

/**
 * The internal position slots of a context frame, in order.
 *
 * Derived from the frame's own notation rather than a hand-kept table, so the
 * notation IS the slot list. `(4.0/1-4.4/5)` is the one range form: it denotes
 * the fractal doubling across `4.0..4.5`, which is exactly the canonical
 * `CP4.0..CP4.5` literal set.
 */
export function frameSlots(frame: CfLiteral): string[] {
	if (frame === "(4.0/1-4.4/5)") {
		return ["4.0", "4.1", "4.2", "4.3", "4.4", "4.5"];
	}
	return frame.slice(1, -1).split("/");
}

/** A terminal position: this slot dispatches. */
export interface FrameLeaf {
	readonly kind: "leaf";
	readonly id: string;
	readonly address: VakAddress;
	readonly task: string;
	readonly agent?: string;
}

/** A position that opens a whole nested context frame. */
export interface FrameNest {
	readonly kind: "frame";
	readonly id: string;
	readonly address: VakAddress;
	/** Slot-aligned children: `children[i]` occupies slot `i` of this frame. */
	readonly children: readonly FrameNode[];
}

/** Either a leaf dispatch or a nested frame — the recursion. */
export type FrameNode = FrameLeaf | FrameNest;

/** Raised when a nested structure violates the CP nesting law. */
export class FrameNestingError extends Error {
	readonly violations: string[];

	constructor(violations: string[]) {
		super(`invalid CP nesting: ${violations.join("; ")}`);
		this.name = "FrameNestingError";
		this.violations = violations;
	}
}

/** Nesting depth of a node: a leaf is 0, a frame is 1 + its deepest child. */
export function nestingDepth(node: FrameNode): number {
	if (node.kind === "leaf") return 0;
	if (node.children.length === 0) return 1;
	return 1 + Math.max(...node.children.map(nestingDepth));
}

/** Every leaf in a nested structure, in slot order (depth-first). */
export function frameLeaves(node: FrameNode): FrameLeaf[] {
	if (node.kind === "leaf") return [node];
	return node.children.flatMap(frameLeaves);
}

/**
 * The CP a child must carry to occupy slot `index` of `frame`.
 *
 * Only the `(4.0/1-4.4/5)` parent pins its children's CP, because its slots ARE
 * the canonical `CP4.x` positions. Other frames position their children within
 * their own notation and do not constrain the CP literal, so this returns null
 * for them rather than inventing a mapping.
 */
export function expectedCpForSlot(frame: CfLiteral, index: number): CpLiteral | null {
	if (frame !== "(4.0/1-4.4/5)") return null;
	const slots = frameSlots(frame);
	if (index < 0 || index >= slots.length) return null;
	return `CP4.${index}` as CpLiteral;
}

/**
 * Validate a nested structure.
 *
 * Checks, recursively: every address is envelope-complete; no frame carries more
 * children than it has slots; and a child of the `4.x` parent carries the CP of
 * the slot it sits in — so CP genuinely *places* the step rather than decorating
 * it.
 */
export function assertFrameNesting(node: FrameNode, path: string[] = []): void {
	const violations: string[] = [];
	const here = [...path, node.id];
	const label = here.join(" > ");

	try {
		assertFullEnvelope(node.address);
	} catch (err) {
		const inner = err instanceof VakEnvelopeError ? err.violations : [String(err)];
		violations.push(...inner.map((v) => `${label}: ${v}`));
	}

	if (node.kind === "frame") {
		const slots = frameSlots(node.address.cf);
		if (node.children.length > slots.length) {
			violations.push(
				`${label}: frame ${node.address.cf} has ${slots.length} slot(s) but ${node.children.length} child(ren)`,
			);
		}
		node.children.forEach((child, index) => {
			const expected = expectedCpForSlot(node.address.cf, index);
			if (expected && child.address.cp !== expected) {
				violations.push(
					`${label} > ${child.id}: slot ${index} of ${node.address.cf} requires cp ${expected}, got ${child.address.cp}`,
				);
			}
		});
	}

	if (violations.length > 0) throw new FrameNestingError(violations);
	if (node.kind === "frame") {
		for (const child of node.children) assertFrameNesting(child, here);
	}
}

/** One entry of the nesting trace: what ran, how deep, and where. */
export interface FrameTraceEntry {
	readonly nodeId: string;
	readonly kind: "leaf" | "frame";
	/** 0 for the root; +1 per nesting level. */
	readonly depth: number;
	/** The chain of context frames enclosing this node, outermost first. */
	readonly framePath: readonly CfLiteral[];
	/** The slot indices taken to reach this node from the root. */
	readonly slotPath: readonly number[];
	readonly address: VakAddress;
	/** Present for leaves (and for dialogical halts); frames do not dispatch. */
	readonly emission?: VakEmission<{ output: string; primitive: ZThreadToolName | null }>;
	readonly haltedForHuman?: boolean;
}

/** Executes one leaf, told where in the nesting it sits. */
export type LeafExecutor = (
	leaf: FrameLeaf,
	context: { primitive: ZThreadToolName | null; depth: number; framePath: readonly CfLiteral[] },
) => Promise<string> | string;

/**
 * Evaluate a nested frame structure.
 *
 * Plain recursion, as the design says it should be: a frame descends into its
 * slots; a leaf dispatches. Frames themselves never dispatch — only leaves do —
 * so a frame contributes structure to the trace and nothing else.
 *
 * The returned trace records the nesting explicitly (`depth`, `framePath`,
 * `slotPath`), which is what makes a run replayable and scorable later.
 */
export async function runNestedFrame(
	root: FrameNode,
	options: {
		execute: LeafExecutor;
		respondToHuman?: (leaf: FrameLeaf) => Promise<string> | string;
	},
): Promise<FrameTraceEntry[]> {
	assertFrameNesting(root);
	const trace: FrameTraceEntry[] = [];

	const walk = async (
		node: FrameNode,
		depth: number,
		framePath: CfLiteral[],
		slotPath: number[],
	): Promise<void> => {
		if (node.kind === "frame") {
			trace.push({
				nodeId: node.id,
				kind: "frame",
				depth,
				framePath: [...framePath],
				slotPath: [...slotPath],
				address: node.address,
			});
			const nextPath = [...framePath, node.address.cf];
			for (let index = 0; index < node.children.length; index += 1) {
				await walk(node.children[index], depth + 1, nextPath, [...slotPath, index]);
			}
			return;
		}

		const primitive = primitiveFor(node.address);
		let output: string;
		let haltedForHuman = false;
		if (haltsForHuman(node.address)) {
			if (!options.respondToHuman) throw new DialogicalHaltRequired(node.id);
			haltedForHuman = true;
			output = await options.respondToHuman(node);
		} else {
			output = await options.execute(node, { primitive, depth, framePath: [...framePath] });
		}

		trace.push({
			nodeId: node.id,
			kind: "leaf",
			depth,
			framePath: [...framePath],
			slotPath: [...slotPath],
			address: node.address,
			emission: emit(node.address, { output, primitive }),
			haltedForHuman,
		});
	};

	await walk(root, 0, [], []);
	return trace;
}
