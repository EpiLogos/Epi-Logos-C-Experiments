/**
 * vak-eval-emit.ts — a completed run becomes an audible score event (50.T50.13).
 *
 * `portal.vak_eval` has been a declared contract with no emitter for as long as
 * it has existed: `PORTAL_EVENT_NAMES` carries it, the Pleroma capability
 * matrix lists it under `pre_tool_call.must_emit`, and nothing in the repo ever
 * broadcast it. 50.T50.10 gave the score a reader; this gives the run a voice.
 *
 * ## What is being sent
 *
 * A run is a sequence of VAK-addressed steps, and each step's CF is a
 * scale-degree role (`ql-musical-derivation-v3.md` §II-4.2). Read in order the
 * run is a melodic line — but a line is only interpretable inside a mode-tonic
 * frame, so the gateway needs two things a bare trace does not carry: the LENS
 * (the scale-beneath, §II-4.6) and which CF sits at TONIC (the mode). Together
 * those are the 84-fold landscape the reading is addressed in.
 *
 * The reading itself is computed S0-side by the kernel
 * (`portal-core` `VakTonalReading`), never here. This module's whole job is to
 * hand the run's own trace to `s4'.vak.evaluate` and let the kernel read it —
 * the same discipline as `q-review-night-pass.ts`, which carries context to an
 * endpoint rather than constructing the answer on the S4 side.
 *
 * ## The lens is declared, never guessed
 *
 * `mef_lens` has no producer in a trace. `elo-trial-hook.ts` already records
 * that gap and refuses rather than inventing a value, because a fabricated
 * coordinate poisons the matchup key. The same reasoning applies harder here:
 * a guessed lens does not merely mislabel the run, it reads it in an epistemic
 * mode it never spoke from, and every pitch in the reading would be wrong. So
 * the lens is required, and a run that has not been told one is refused BY NAME.
 *
 * A run that IS being ELO-scored already declares `mef_lens` for its context
 * tuple, so the two hooks share one declaration and neither invents anything.
 *
 * Canon: [[S4-SPEC]] -> Anima orchestration; DR-VAK-6 (audible evaluation).
 */

import type { VakAddress } from "../../shared/vak_address.ts";
// One gateway-call implementation for every S4 carrier: the socket dance,
// the handshake and the id-matched response live there, not here.
import { callGateway, type GatewayCallOptions } from "../../shared/gateway-call.ts";

/** The gateway method that reads a trace and broadcasts the event. */
export const VAK_EVALUATE_METHOD = "s4'.vak.evaluate";

/** One step of the run, as the gateway expects to receive it. */
export interface VakEvalTraceStep {
	readonly stepId: string;
	readonly address: VakAddress;
	readonly agent?: string;
}

/** What the run must state because its trace cannot. */
export interface VakEvalDeclaration {
	/**
	 * The MEF lens the run spoke through — `L0`…`L5`, `L0'`…`L5'`. The
	 * scale-beneath. Required; see the module note on why it is never defaulted.
	 */
	readonly lens: string;
	/** Which CF sits at tonic. Absent = Ionian, per DR-VAK-6. */
	readonly modeTonicCf?: string;
	/** Only when an M2 resonance72 binding is genuinely active (DR-VAK-6 item 2). */
	readonly resonance72Index?: number;
	readonly sessionKey?: string;
}

export type VakEvalOptions = GatewayCallOptions;

/** Raised when a run is asked to sound without a scale to sound in. */
export class VakEvalDeclarationError extends Error {
	constructor(missing: string) {
		super(
			`cannot emit portal.vak_eval: ${missing} has no source in the run and was not declared. ` +
				`The lens IS the scale-beneath — guessing one would read the run in an epistemic ` +
				`mode it never spoke from, and every pitch in the reading would be wrong.`,
		);
		this.name = "VakEvalDeclarationError";
	}
}

function present(value: string | undefined): value is string {
	return typeof value === "string" && value.trim().length > 0;
}

/**
 * Build the trace the gateway reads from an orchestration's steps.
 *
 * Only the step identity, its VAK address and its agent cross — the same
 * narrow boundary `childInputFor` enforces. A step's task text and output stay
 * on the Anima side; the reading is of the run's COORDINATES, not its content.
 */
export function traceFromSteps(
	steps: ReadonlyArray<{ id: string; address: VakAddress; agent?: string }>,
): VakEvalTraceStep[] {
	return steps.map((step) => ({
		stepId: step.id,
		address: step.address,
		...(step.agent === undefined ? {} : { agent: step.agent }),
	}));
}

/** The request frame, split out so it can be asserted without a socket. */
export function vakEvalRequest(input: {
	task: string;
	declaration: VakEvalDeclaration;
	trace: readonly VakEvalTraceStep[];
}) {
	if (!present(input.declaration.lens)) throw new VakEvalDeclarationError("lens");
	if (input.trace.length === 0) {
		throw new VakEvalDeclarationError("trace (an empty run has no line to read)");
	}
	return {
		method: VAK_EVALUATE_METHOD,
		params: {
			task: input.task,
			lens: input.declaration.lens,
			trace: input.trace,
			...(input.declaration.modeTonicCf === undefined
				? {}
				: { modeTonicCf: input.declaration.modeTonicCf }),
			...(input.declaration.resonance72Index === undefined
				? {}
				: { resonance72Index: input.declaration.resonance72Index }),
			...(input.declaration.sessionKey === undefined
				? {}
				: { sessionKey: input.declaration.sessionKey }),
		},
	};
}

/** What the gateway read the run as. Returned so a caller can record it. */
export interface VakEvalReceipt {
	readonly diatonicDegree: number;
	readonly modeTonicCf: string;
	readonly tonalReading: Record<string, unknown>;
}

/**
 * Hand a completed run's trace to the gateway, which reads it and broadcasts
 * `portal.vak_eval` to every listener.
 *
 * The broadcast is the point; the returned receipt is the same reading the
 * subscribers saw, handed back so the run record can carry it too.
 */
export async function emitVakEval(
	input: {
		task: string;
		declaration: VakEvalDeclaration;
		trace: readonly VakEvalTraceStep[];
	},
	options: VakEvalOptions = {},
): Promise<VakEvalReceipt> {
	const request = vakEvalRequest(input);
	const response = await callGateway(
		{ method: request.method, params: request.params },
		options,
	);

	const reading = response.tonalReading;
	if (!reading || typeof reading !== "object" || Array.isArray(reading)) {
		// A trace was sent, so a reading must have come back. Anything else
		// means the gateway did not read the run, and reporting success would
		// claim the run was scored when nothing scored it.
		throw new Error("s4'.vak.evaluate accepted the trace but returned no tonalReading");
	}
	return {
		diatonicDegree: Number(response.diatonicDegree ?? 0),
		modeTonicCf: String(response.modeTonicCf ?? ""),
		tonalReading: reading as Record<string, unknown>,
	};
}
