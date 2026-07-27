/**
 * child-pi-executor.ts — the ONE choke point where a dispatch decision becomes a
 * child pi process (50.T50.02).
 *
 * Before this module, a dispatch became execution at three independently-gated
 * copies of `spawn("pi", …)`:
 *   - `S4/agent-team.ts`   (`dispatchAgent`) — entitlement-gated
 *   - `S4/agent-chain.ts`  (`runAgent`)      — NO gate; raw `agentDef.tools`
 *   - `S4/pi-pi.ts`        (`queryExpert`)   — NO gate; raw `state.def.tools`
 * Two of the three passed an agent's frontmatter tool string straight to
 * `--tools`, so a team ceiling or a deny list simply did not apply to them.
 * There was no single place to add an invariant, and no way to know an invariant
 * held everywhere. This module is that place.
 *
 * Invariants applied here, once, for every child dispatch:
 *   1. **Pi -> subagent is the only agentic path.** The binary is the constant
 *      `CHILD_PI_BINARY`. There is no injectable client, no alternate transport:
 *      a child is always another pi harness.
 *   2. **The `--tools` entitlement allow-list.** Every dispatch resolves its
 *      tools through `resolveEntitlement()` (`ta-onta/shared/entitlement.ts`),
 *      so team ceilings and deny lists bind on all three seams.
 *   3. **`guardVamaShaktiDispatch`** (DR-VAMA-5) — a summoned Vama Shakti is
 *      dialogue-only; any other tool refuses BEFORE a process exists.
 *   4. **The recursive-self-review gate** (`review-gate.ts`, 12.T12.4) — when a
 *      dispatch carries review context, a committal verdict that needs user
 *      final-validation cannot dispatch without it.
 *
 * A violated invariant THROWS `ChildPiDispatchRefused` and no process is
 * spawned. Refusal is not a return value a caller can overlook.
 *
 * Residency note: this imports `../../../pi-agent/lib/{dispatch-guard,review-gate}.ts`,
 * following the existing precedent of its sibling `lib/arena-orchestrator.ts:9`.
 * Both modules are dependency-free.
 *
 * Canon: [[S4-SPEC]] -> agent runtime dispatch; DR-VAMA-5 (dialogue-only).
 */

import { spawn } from "node:child_process";
import { childPiRuntimeArgs } from "../../S4-0p-khora/S0'/child-extension-propagation.ts";
import { resolveEntitlement, type EntitlementLayer } from "../../shared/entitlement.ts";
import type { VakAddress } from "../../shared/vak_address.ts";
import {
	guardVamaShaktiDispatch,
	VamaShaktiDispatchRefused,
	type VamaShaktiDispatchRequest,
} from "../../../pi-agent/lib/dispatch-guard.ts";
import {
	enforceReviewGate,
	type PiReviewGateInput,
} from "../../../pi-agent/lib/review-gate.ts";
import { checkpointGate, type CpfCheckpoint } from "../modules/dispatch-validate.ts";

/**
 * The child harness. A constant, not a parameter — Pi->subagent is the only
 * agentic path, so there is nothing here to configure.
 */
export const CHILD_PI_BINARY = "pi";

/** Which dispatch seam is asking. Carried for attribution, not for behaviour. */
export type ChildPiSeam = "agent-team" | "agent-chain" | "pi-pi";

/** Why a dispatch was refused before any process existed. */
export type ChildPiRefusalCode =
	| "child-pi/vama-shakti-dialogue-only"
	| "child-pi/cpf-checkpoint-unsatisfied"
	| "child-pi/review-gate"
	| "child-pi/no-entitled-tools";

/** Typed refusal. Thrown, never returned — a caller must not be able to ignore it. */
export class ChildPiDispatchRefused extends Error {
	readonly code: ChildPiRefusalCode;
	readonly seam: ChildPiSeam;

	constructor(code: ChildPiRefusalCode, seam: ChildPiSeam, message: string) {
		super(message);
		this.name = "ChildPiDispatchRefused";
		this.code = code;
		this.seam = seam;
	}
}

/** One child-pi dispatch. */
export interface ChildPiDispatchRequest {
	seam: ChildPiSeam;
	/** Agent/expert name, for attribution in refusals. */
	agentName: string;
	task: string;
	/** The fully assembled system prompt the seam wants appended. */
	systemPrompt: string;
	/** `provider/id`, or undefined to inherit the parent's model. */
	model?: string;
	/** The agent's own declared tool set — the universe U for this dispatch. */
	toolUniverse: string[];
	/** Team allow/deny layer. Empty/absent = inherit U. */
	team?: EntitlementLayer;
	/** Agent allow/deny layer. Empty/absent = inherit the team ceiling. */
	agent?: EntitlementLayer;
	/** Forwarded to the child as `EPI_SESSION_VAK_ADDRESS` when present. */
	vakAddress?: VakAddress;
	cwd?: string;
	/** Present only when this dispatch is a summoned Vama Shakti (DR-VAMA-5). */
	vamaShakti?: VamaShaktiDispatchRequest;
	/**
	 * Present only when the agent AUTHORED a `(00/00)` human checkpoint on this
	 * dispatch (50.T50.09). Absent means no checkpoint — the executor never adds
	 * one, and dialogical alone is open conversation, not a gate.
	 */
	checkpoint?: CpfCheckpoint;
	/** Present only when this dispatch carries review context (12.T12.4). */
	review?: PiReviewGateInput;
	/** Seam-specific progress hooks (widgets, tickers). */
	onStdout?: (chunk: string) => void;
	onStderr?: (chunk: string) => void;
}

/** What a dispatch produced. */
export interface ChildPiDispatchResult {
	output: string;
	exitCode: number;
	elapsed: number;
	/** The allow-list actually passed as `--tools` (post-entitlement). */
	effectiveTools: string[];
	/** The exact argv handed to pi — the auditable record of the dispatch. */
	args: string[];
	/** Raw streams, for seams that parse them themselves. */
	stdout: string;
	stderr: string;
}

/**
 * Resolve the `--tools` allow-list for a dispatch.
 *
 * This is what agent-chain and pi-pi previously skipped entirely. With no team
 * or agent layer the result equals the declared universe, so the two ungated
 * seams keep their current allow-list — but a deny list or team ceiling now
 * binds on them, which is the whole point of routing through one place.
 */
export function resolveChildPiTools(request: ChildPiDispatchRequest): string[] {
	const { effective } = resolveEntitlement(
		request.toolUniverse,
		request.team,
		request.agent,
	);
	return effective;
}

/**
 * Apply every dispatch invariant. Throws on the first violation.
 *
 * Ordered so the structural refusals come first: a dialogue-only entity is
 * refused before its entitlement is even considered.
 */
export function assertChildPiInvariants(request: ChildPiDispatchRequest): void {
	if (request.vamaShakti) {
		try {
			guardVamaShaktiDispatch(request.vamaShakti);
		} catch (err) {
			const refusal = err as VamaShaktiDispatchRefused;
			throw new ChildPiDispatchRefused(
				"child-pi/vama-shakti-dialogue-only",
				request.seam,
				`${request.agentName}: ${refusal.message}`,
			);
		}
	}

	// The CPF checkpoint (50.T50.09). The orchestration surface halts a dialogical
	// STEP, but a dispatch can also arrive here through agent-team / agent-chain /
	// pi-pi without ever passing through a script. Gating at the choke point is
	// what makes an authored checkpoint unbypassable by choosing another seam.
	if (request.checkpoint) {
		const gate = checkpointGate({
			vak_address: request.vakAddress,
			checkpoint: request.checkpoint,
		});
		if (!gate.ok) {
			throw new ChildPiDispatchRefused(
				"child-pi/cpf-checkpoint-unsatisfied",
				request.seam,
				`${request.agentName}: ${gate.error}${pendingReviewDetail(request)}`,
			);
		}
	}

	if (request.review) {
		// A review-scoped checkpoint the human has answered IS the user
		// final-validation this gate asks for, so the two laws take one human act
		// between them. A checkpoint scoped to the DISPATCH does not: "a human let
		// this step run" is weaker than "the user final-validated this verdict",
		// and collapsing them would let an unrelated answer discharge the gate.
		const verdict = enforceReviewGate({
			...request.review,
			checkpoint:
				request.checkpoint?.validates === "review"
					? {
							satisfied: request.checkpoint.respondedBy !== undefined,
							respondedBy: request.checkpoint.respondedBy,
							validates: request.checkpoint.validates,
						}
					: request.review.checkpoint,
		});
		if (!verdict.ok) {
			throw new ChildPiDispatchRefused(
				"child-pi/review-gate",
				request.seam,
				`${request.agentName}: ${verdict.reason}`,
			);
		}
	}
}

/**
 * What a halting checkpoint should tell the human about a review it also gates.
 *
 * A human cannot final-validate a verdict they were never shown, so when a
 * dispatch carries both an unanswered checkpoint and a review, the refusal names
 * the decision and the actor rather than leaving the human to approve something
 * invisible. Empty when there is no review to disclose.
 */
function pendingReviewDetail(request: ChildPiDispatchRequest): string {
	const review = request.review;
	if (!review) return "";
	const decision = String(review.decision ?? "approve");
	const actor = review.actor ? String(review.actor) : "an agent";
	const kind = review.recursiveSelfReview === true ? "recursive self-review" : "review";
	return ` — pending ${kind} verdict "${decision}" by ${actor}`;
}

/**
 * Build the child argv.
 *
 * Pure and exported so the argument contract is directly testable without
 * spawning anything. `childPiRuntimeArgs()` remains the single source of the
 * runtime args (extensions, prompts, skill roots).
 *
 * The `--tools` flag is omitted when the resolved allow-list is empty, matching
 * the previous agent-team/agent-chain behaviour. (pi-pi previously passed the
 * flag unconditionally; an empty `--tools ""` is a deny-all in pi, never the
 * intent, so omitting it here is a fix rather than a regression — pi-pi's tools
 * default is non-empty, so no live dispatch changes.)
 */
export function buildChildPiArgs(request: ChildPiDispatchRequest): {
	args: string[];
	effectiveTools: string[];
} {
	const effectiveTools = resolveChildPiTools(request);
	const args = [
		"--mode",
		"json",
		"-p",
		"--no-session",
		...childPiRuntimeArgs(),
		...(effectiveTools.length > 0 ? ["--tools", effectiveTools.join(",")] : []),
		...(request.model ? ["--model", request.model] : []),
		"--thinking",
		"off",
		"--append-system-prompt",
		request.systemPrompt,
		request.task,
	];
	return { args, effectiveTools };
}

/** Build the child environment, forwarding the VAK address when carried. */
export function buildChildPiEnv(request: ChildPiDispatchRequest): NodeJS.ProcessEnv {
	const env: NodeJS.ProcessEnv = { ...process.env };
	if (request.vakAddress) {
		env.EPI_SESSION_VAK_ADDRESS = JSON.stringify(request.vakAddress);
	}
	return env;
}

/**
 * Dispatch one child pi.
 *
 * Every one of the three former `spawn("pi", …)` sites now routes here, so the
 * invariants above hold for all of them by construction rather than by three
 * copies staying in sync.
 */
export async function dispatchChildPi(
	request: ChildPiDispatchRequest,
): Promise<ChildPiDispatchResult> {
	// `async` is load-bearing: an invariant violation must surface as a REJECTED
	// promise, not a synchronous throw. Every caller consumes this as a promise
	// (`.then(...).catch(...)`), so a sync throw would escape their catch and
	// become an unhandled exception instead of a handled refusal.
	assertChildPiInvariants(request);

	const { args, effectiveTools } = buildChildPiArgs(request);
	const env = buildChildPiEnv(request);
	const cwd = process.env.EPI_REPO_ROOT || request.cwd || process.cwd();
	const startTime = Date.now();

	return new Promise((resolve) => {
		const proc = spawn(CHILD_PI_BINARY, args, {
			stdio: ["ignore", "pipe", "pipe"],
			env,
			cwd,
		});

		let stdout = "";
		let stderr = "";

		proc.stdout?.setEncoding("utf-8");
		proc.stdout?.on("data", (chunk: string) => {
			stdout += chunk;
			request.onStdout?.(chunk);
		});

		proc.stderr?.setEncoding("utf-8");
		proc.stderr?.on("data", (chunk: string) => {
			stderr += chunk;
			request.onStderr?.(chunk);
		});

		proc.on("close", (code) => {
			resolve({
				output: stdout || stderr,
				exitCode: code ?? 1,
				elapsed: Date.now() - startTime,
				effectiveTools,
				args,
				stdout,
				stderr,
			});
		});

		proc.on("error", (err) => {
			resolve({
				output: `Error spawning agent: ${err.message}`,
				exitCode: 1,
				elapsed: Date.now() - startTime,
				effectiveTools,
				args,
				stdout,
				stderr: `${stderr}${stderr ? "\n" : ""}${err.message}`,
			});
		});
	});
}
