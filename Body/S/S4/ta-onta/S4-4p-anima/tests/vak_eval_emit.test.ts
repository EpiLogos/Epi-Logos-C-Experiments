/**
 * vak_eval_emit.test.ts — 50.T50.13, the Anima half of the audible score event.
 *
 * The READING is the kernel's and is proven against `ql-musical-derivation-v3`
 * in `portal-core/tests/vak_tonal_reading.rs`; the BROADCAST is proven against
 * a real gateway in `epi-cli/tests/gate_portal_vak_eval.rs`. What is proven
 * here is the seam between them: that a run's trace is carried faithfully, that
 * a run without a declared lens is refused instead of read in a guessed
 * epistemic mode, and that a response missing the reading is not reported as a
 * success.
 *
 * The live end-to-end (real `epi gate start`, real `rerunScore`, a real
 * subscriber witnessing the broadcast) is `tests/vak-eval-live.mjs`.
 */

import assert from "node:assert/strict";
import test from "node:test";

import type { VakAddress } from "../../shared/vak_address.ts";
import {
	VAK_EVALUATE_METHOD,
	VakEvalDeclarationError,
	emitVakEval,
	traceFromSteps,
	vakEvalRequest,
	type VakEvalOptions,
} from "../modules/vak-eval-emit.ts";

const ADDRESS: VakAddress = {
	cpf: "(4.0/1-4.4/5)",
	ct: ["CT2"],
	cp: "CP4.2",
	cf: "(0/1)",
	cfp: "CFP2",
	cs: { code: "CS2", direction: "Day" },
};

const STEPS: { id: string; address: VakAddress; agent?: string }[] = [
	{ id: "originate", address: { ...ADDRESS, cf: "(00/00)" }, agent: "nous" },
	{ id: "execute", address: { ...ADDRESS, cf: "(4.0/1-4.4/5)" }, agent: "anima" },
];

/** The socket shape `emitVakEval` accepts, without exporting it from the module. */
type SocketFactory = NonNullable<VakEvalOptions["createSocket"]>;
type FakeSocket = ReturnType<SocketFactory>;

/** A socket that replays a scripted exchange without touching the network. */
function fakeSocket(handler: (request: Record<string, unknown>) => unknown) {
	const messageListeners: ((event: { data: unknown }) => void)[] = [];
	const sent: Record<string, unknown>[] = [];
	let closed = false;
	const socket: FakeSocket = {
		send(data: string) {
			const frame = JSON.parse(data) as Record<string, unknown>;
			sent.push(frame);
			const response =
				frame.method === "connect"
					? { type: "res", id: frame.id, result: {} }
					: handler(frame);
			queueMicrotask(() => {
				for (const listener of messageListeners) {
					listener({ data: JSON.stringify(response) });
				}
			});
		},
		close() {
			closed = true;
		},
		addEventListener(type: "open" | "message" | "error", listener: unknown) {
			if (type === "open") {
				queueMicrotask(() => (listener as () => void)());
			} else if (type === "message") {
				messageListeners.push(listener as (event: { data: unknown }) => void);
			}
		},
	} as FakeSocket;
	return { socket, sent, isClosed: () => closed };
}

test("the trace carries only step identity, address and agent", () => {
	const trace = traceFromSteps(STEPS);
	assert.deepEqual(trace, [
		{ stepId: "originate", address: { ...ADDRESS, cf: "(00/00)" }, agent: "nous" },
		{ stepId: "execute", address: { ...ADDRESS, cf: "(4.0/1-4.4/5)" }, agent: "anima" },
	]);
	// The reading is of the run's COORDINATES; task text never crosses.
	for (const step of trace) {
		assert.equal("task" in step, false);
	}
});

test("a step without an agent omits the key rather than sending undefined", () => {
	const [step] = traceFromSteps([{ id: "solo", address: ADDRESS }]);
	assert.deepEqual(Object.keys(step).sort(), ["address", "stepId"]);
});

test("the request names the gateway method and carries the declared frame", () => {
	const request = vakEvalRequest({
		task: "run the nightly orchestration",
		declaration: {
			lens: "L2'",
			modeTonicCf: "(4.0/1-4.4/5)",
			resonance72Index: 30,
			sessionKey: "agent:anima:main",
		},
		trace: traceFromSteps(STEPS),
	});
	assert.equal(request.method, VAK_EVALUATE_METHOD);
	assert.equal(request.params.lens, "L2'");
	assert.equal(request.params.modeTonicCf, "(4.0/1-4.4/5)");
	assert.equal(request.params.resonance72Index, 30);
	assert.equal(request.params.sessionKey, "agent:anima:main");
	assert.equal(request.params.trace.length, 2);
});

test("an undeclared optional is omitted, not sent as undefined", () => {
	const request = vakEvalRequest({
		task: "t",
		declaration: { lens: "L0" },
		trace: traceFromSteps(STEPS),
	});
	for (const key of ["modeTonicCf", "resonance72Index", "sessionKey"]) {
		assert.equal(key in request.params, false, `${key} should be absent`);
	}
});

test("a run with no lens is refused by name, never defaulted to L0", () => {
	for (const lens of ["", "   ", undefined as unknown as string]) {
		assert.throws(
			() =>
				vakEvalRequest({
					task: "t",
					declaration: { lens },
					trace: traceFromSteps(STEPS),
				}),
			(error: Error) => {
				assert.ok(error instanceof VakEvalDeclarationError);
				assert.match(error.message, /lens/);
				assert.match(error.message, /scale-beneath/);
				return true;
			},
		);
	}
});

test("an empty run is refused — there is no line to read", () => {
	assert.throws(
		() => vakEvalRequest({ task: "t", declaration: { lens: "L0" }, trace: [] }),
		VakEvalDeclarationError,
	);
});

test("a successful emission returns the reading the subscribers saw", async () => {
	const reading = { lensLabel: "L0", modeName: "Ionian", lensModeIndex: 0, steps: [] };
	const { socket, sent, isClosed } = fakeSocket((request) => ({
		type: "res",
		id: request.id,
		result: { diatonicDegree: 5, modeTonicCf: "(00/00)", tonalReading: reading },
	}));

	const receipt = await emitVakEval(
		{ task: "t", declaration: { lens: "L0" }, trace: traceFromSteps(STEPS) },
		{ createSocket: () => socket },
	);

	assert.equal(receipt.diatonicDegree, 5);
	assert.equal(receipt.modeTonicCf, "(00/00)");
	assert.deepEqual(receipt.tonalReading, reading);
	// The handshake precedes the evaluation — the gateway requires `connect`.
	assert.equal(sent[0].method, "connect");
	assert.equal(sent[1].method, VAK_EVALUATE_METHOD);
	assert.equal(isClosed(), true);
});

test("a gateway refusal surfaces as a rejection carrying its reason", async () => {
	const { socket } = fakeSocket((request) => ({
		type: "res",
		id: request.id,
		error: { message: "'L9' is not a MEF lens label" },
	}));

	await assert.rejects(
		emitVakEval(
			{ task: "t", declaration: { lens: "L9" }, trace: traceFromSteps(STEPS) },
			{ createSocket: () => socket },
		),
		/L9/,
	);
});

test("a response with no reading is an error, not a silent success", async () => {
	// A trace was sent, so a reading must come back. Reporting success here
	// would claim the run was scored when nothing read it.
	const { socket } = fakeSocket((request) => ({
		type: "res",
		id: request.id,
		result: { diatonicDegree: 5, modeTonicCf: "(00/00)" },
	}));

	await assert.rejects(
		emitVakEval(
			{ task: "t", declaration: { lens: "L0" }, trace: traceFromSteps(STEPS) },
			{ createSocket: () => socket },
		),
		/no tonalReading/,
	);
});

test("an unreachable gateway names the url it could not reach", async () => {
	const socket = {
		send() {},
		close() {},
		addEventListener(type: "open" | "message" | "error", listener: unknown) {
			if (type === "error") queueMicrotask(() => (listener as () => void)());
		},
	} as FakeSocket;

	await assert.rejects(
		emitVakEval(
			{ task: "t", declaration: { lens: "L0" }, trace: traceFromSteps(STEPS) },
			{ createSocket: () => socket, gatewayUrl: "ws://127.0.0.1:1" },
		),
		/ws:\/\/127\.0\.0\.1:1/,
	);
});
