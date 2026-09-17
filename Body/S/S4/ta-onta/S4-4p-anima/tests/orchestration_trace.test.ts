/**
 * orchestration_trace.test.ts — 50.T50.14, the Anima half of the learning unit.
 *
 * The metrics themselves are derived Rust-side and proven there
 * (`redis-context/tests/aeon_eval_ledger.rs` for the reader,
 * `epi-cli/tests/gate_orchestration_trace.rs` for the whole chain). What is
 * proven here is the seam: the trace is carried faithfully, a trace that cannot
 * name its program is refused, and a distillation row is never fabricated.
 *
 * Live end-to-end (real gateway, real `rerunScore`): `tests/trace-live.mjs`.
 */

import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
	DISTILLATION_CHANNELS,
	DistillationDeclarationError,
	OrchestrationTraceError,
	TRACE_INJECT_METHOD,
	appendDistillationRow,
	distillationRowForRun,
	distillationRowForRun as buildRow,
	emitOrchestrationTrace,
	traceInjectRequest,
	type OrchestrationTrace,
	type TraceEmitOptions,
} from "../modules/orchestration-trace.ts";

const TRACE: OrchestrationTrace = {
	scoreId: "nightly",
	scoreHash: "b8f1c0de0000000000000000000000000000000000000000000000000000dead",
	runId: "run-1",
	ops: [
		{ stepId: "survey", operation: "read", agent: "logos" },
		{ stepId: "land", operation: "apply_patch", agent: "anima" },
		{ stepId: "prove", operation: "bash", command: "cargo test --offline", agent: "anima" },
	],
	usage: { turns: 1, inputTokens: 900, outputTokens: 300, totalTokens: 1200 },
};

const FULL_DECLARATION = {
	lens_coherence: 0.9,
	verifier_pass: 1,
	user_articulation_simulation: 0.5,
};

type SocketFactory = NonNullable<TraceEmitOptions["createSocket"]>;
type FakeSocket = ReturnType<SocketFactory>;

function fakeSocket(handler: (request: Record<string, unknown>) => unknown) {
	const messageListeners: ((event: { data: unknown }) => void)[] = [];
	const sent: Record<string, unknown>[] = [];
	const socket: FakeSocket = {
		send(data: string) {
			const frame = JSON.parse(data) as Record<string, unknown>;
			sent.push(frame);
			const response =
				frame.method === "connect" ? { type: "res", id: frame.id, result: {} } : handler(frame);
			queueMicrotask(() => {
				for (const listener of messageListeners) listener({ data: JSON.stringify(response) });
			});
		},
		close() {},
		addEventListener(type: "open" | "message" | "error", listener: unknown) {
			if (type === "open") queueMicrotask(() => (listener as () => void)());
			else if (type === "message")
				messageListeners.push(listener as (event: { data: unknown }) => void);
		},
	} as FakeSocket;
	return { socket, sent };
}

test("the trace rides the existing transcript-write method", () => {
	const request = traceInjectRequest({ sessionKey: "agent:anima:main", trace: TRACE });
	assert.equal(request.method, TRACE_INJECT_METHOD);
	assert.equal(request.params.sessionKey, "agent:anima:main");
	assert.equal(request.params.orchestrationTrace.ops.length, 3);
	assert.equal(request.params.orchestrationTrace.scoreHash, TRACE.scoreHash);
});

test("a trace with no program identity is refused — replay would be uncheckable", () => {
	assert.throws(
		() =>
			traceInjectRequest({
				sessionKey: "agent:anima:main",
				trace: { ...TRACE, scoreHash: "  " },
			}),
		(error: Error) => {
			assert.ok(error instanceof OrchestrationTraceError);
			assert.match(error.message, /scoreHash/);
			return true;
		},
	);
});

test("a trace with no session has no transcript to land in", () => {
	assert.throws(
		() => traceInjectRequest({ sessionKey: "", trace: TRACE }),
		OrchestrationTraceError,
	);
});

test("a successful emission returns what the gateway recorded", async () => {
	const { socket, sent } = fakeSocket((request) => ({
		type: "res",
		id: request.id,
		result: { ok: true, canonicalKey: "agent:anima:main", runId: "run-1", ops: 3 },
	}));

	const receipt = await emitOrchestrationTrace(
		{ sessionKey: "agent:anima:main", trace: TRACE },
		{ createSocket: () => socket },
	);

	assert.deepEqual(receipt, { canonicalKey: "agent:anima:main", runId: "run-1", ops: 3 });
	assert.equal(sent[0].method, "connect");
	assert.equal(sent[1].method, TRACE_INJECT_METHOD);
});

test("a gateway refusal surfaces as a rejection carrying its reason", async () => {
	const { socket } = fakeSocket((request) => ({
		type: "res",
		id: request.id,
		error: { message: "orchestrationTrace.scoreHash is required" },
	}));
	await assert.rejects(
		emitOrchestrationTrace(
			{ sessionKey: "agent:anima:main", trace: TRACE },
			{ createSocket: () => socket },
		),
		/scoreHash/,
	);
});

// ── the distillation row ──────────────────────────────────────────────────

test("a distillation row carries the task, the output and the program identity", () => {
	const row = buildRow({
		task: "sweep the inbox",
		teacherOutput: "swept 4 items",
		trace: TRACE,
		declaration: FULL_DECLARATION,
	});

	assert.equal(row.prompt, "sweep the inbox");
	assert.equal(row.teacher_output, "swept 4 items");
	assert.equal(row.student_target, "swept 4 items", "absent a student target the teacher stands");
	assert.deepEqual(Object.keys(row.annotations).sort(), [...DISTILLATION_CHANNELS].sort());
	// Provenance ties a training row to the exact PROGRAM, not just its name.
	assert.equal(row.provenance.scoreHash, TRACE.scoreHash);
	assert.equal(row.provenance.ops, 3);
});

test("every undeclared annotation channel is refused BY NAME", () => {
	for (const channel of DISTILLATION_CHANNELS) {
		const partial = { ...FULL_DECLARATION };
		delete (partial as Record<string, number>)[channel];
		assert.throws(
			() =>
				buildRow({
					task: "t",
					teacherOutput: "o",
					trace: TRACE,
					declaration: partial,
				}),
			(error: Error) => {
				assert.ok(error instanceof DistillationDeclarationError);
				assert.match(error.message, new RegExp(channel));
				return true;
			},
			`${channel} must be refused when undeclared`,
		);
	}
});

test("the refusal names all missing channels at once, not one at a time", () => {
	try {
		buildRow({ task: "t", teacherOutput: "o", trace: TRACE, declaration: {} });
		assert.fail("should have refused");
	} catch (error) {
		assert.ok(error instanceof DistillationDeclarationError);
		assert.deepEqual(error.missing.sort(), [...DISTILLATION_CHANNELS].sort());
		assert.match(error.message, /trains the student on a fiction/);
	}
});

test("a row with no output is refused — an empty teacher is not a teacher", () => {
	assert.throws(
		() =>
			buildRow({ task: "t", teacherOutput: "   ", trace: TRACE, declaration: FULL_DECLARATION }),
		OrchestrationTraceError,
	);
	assert.throws(
		() => buildRow({ task: "", teacherOutput: "o", trace: TRACE, declaration: FULL_DECLARATION }),
		OrchestrationTraceError,
	);
});

test("rows append rather than overwrite, and survive a JSON round trip", () => {
	const dir = mkdtempSync(join(tmpdir(), "distill-row-"));
	const path = join(dir, "corpus.jsonl");
	try {
		const row = distillationRowForRun({
			task: "sweep the inbox",
			teacherOutput: "swept 4 items",
			trace: TRACE,
			declaration: FULL_DECLARATION,
		});
		appendDistillationRow(row, path);
		appendDistillationRow(row, path);

		const lines = readFileSync(path, "utf8").trim().split("\n");
		assert.equal(lines.length, 2, "a training corpus is append-only");
		// The nested annotation channels must survive — a naive "sorted"
		// stringify filters nested keys by the top-level names and drops them.
		const parsed = JSON.parse(lines[0]);
		assert.deepEqual(Object.keys(parsed.annotations).sort(), [...DISTILLATION_CHANNELS].sort());
		assert.equal(parsed.annotations.user_articulation_simulation, 0.5);
		assert.equal(parsed.provenance.scoreHash, TRACE.scoreHash);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});
