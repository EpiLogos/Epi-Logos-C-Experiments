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

/** The gateway method that reads a trace and broadcasts the event. */
export const VAK_EVALUATE_METHOD = "s4'.vak.evaluate";

const CONNECT_METHOD = "connect";
const CONNECT_REQUEST_ID = 1;
const EVALUATE_REQUEST_ID = 2;
const DEFAULT_GATEWAY_URL = "ws://127.0.0.1:18794";
const DEFAULT_TIMEOUT_MS = 30_000;

interface GatewaySocket {
	send(data: string): void;
	close(): void;
	addEventListener(type: "open", listener: () => void): void;
	addEventListener(type: "message", listener: (event: { data: unknown }) => void): void;
	addEventListener(type: "error", listener: () => void): void;
}

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

export interface VakEvalOptions {
	gatewayUrl?: string;
	timeoutMs?: number;
	createSocket?: (url: string) => GatewaySocket;
}

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
		type: "req" as const,
		id: EVALUATE_REQUEST_ID,
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
export function emitVakEval(
	input: {
		task: string;
		declaration: VakEvalDeclaration;
		trace: readonly VakEvalTraceStep[];
	},
	options: VakEvalOptions = {},
): Promise<VakEvalReceipt> {
	const request = vakEvalRequest(input);
	const gatewayUrl = options.gatewayUrl ?? process.env.EPI_GATEWAY_URL ?? DEFAULT_GATEWAY_URL;
	const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
	const createSocket =
		options.createSocket ?? ((url: string) => new WebSocket(url) as unknown as GatewaySocket);

	return new Promise((resolve, reject) => {
		let settled = false;
		let socket: GatewaySocket | null = null;
		const finish = (result: VakEvalReceipt | Error) => {
			if (settled) return;
			settled = true;
			clearTimeout(timeout);
			try {
				socket?.close();
			} catch {
				// The receipt/error is authoritative; close is best-effort cleanup.
			}
			if (result instanceof Error) reject(result);
			else resolve(result);
		};
		const timeout = setTimeout(
			() => finish(new Error(`portal.vak_eval emission timed out after ${timeoutMs}ms`)),
			timeoutMs,
		);

		try {
			socket = createSocket(gatewayUrl);
		} catch (error) {
			finish(error instanceof Error ? error : new Error(String(error)));
			return;
		}
		const activeSocket = socket;

		activeSocket.addEventListener("open", () => {
			activeSocket.send(
				JSON.stringify({
					type: "req",
					id: CONNECT_REQUEST_ID,
					method: CONNECT_METHOD,
					params: {},
				}),
			);
		});
		activeSocket.addEventListener("error", () => {
			finish(new Error(`portal.vak_eval could not reach the gateway at ${gatewayUrl}`));
		});
		activeSocket.addEventListener("message", (event) => {
			let frame: Record<string, unknown>;
			try {
				frame = JSON.parse(String(event.data)) as Record<string, unknown>;
			} catch {
				return;
			}
			if (frame.type !== "res") return;
			if (frame.id === CONNECT_REQUEST_ID) {
				if (frame.error) {
					finish(new Error(`portal.vak_eval handshake failed: ${errorMessage(frame.error)}`));
					return;
				}
				activeSocket.send(JSON.stringify(request));
				return;
			}
			if (frame.id !== EVALUATE_REQUEST_ID) return;
			if (frame.error) {
				finish(new Error(`portal.vak_eval refused: ${errorMessage(frame.error)}`));
				return;
			}
			const result = frame.result;
			if (!result || typeof result !== "object" || Array.isArray(result)) {
				finish(new Error("s4'.vak.evaluate returned no reading"));
				return;
			}
			const response = result as Record<string, unknown>;
			const reading = response.tonalReading;
			if (!reading || typeof reading !== "object" || Array.isArray(reading)) {
				// A trace was sent, so a reading must have come back. Anything else
				// means the gateway did not read the run, and saying the run was
				// scored would be a claim nobody made.
				finish(new Error("s4'.vak.evaluate accepted the trace but returned no tonalReading"));
				return;
			}
			finish({
				diatonicDegree: Number(response.diatonicDegree ?? 0),
				modeTonicCf: String(response.modeTonicCf ?? ""),
				tonalReading: reading as Record<string, unknown>,
			});
		});
	});
}

function errorMessage(error: unknown): string {
	if (error && typeof error === "object" && "message" in error) {
		return String((error as { message: unknown }).message);
	}
	return String(error);
}
