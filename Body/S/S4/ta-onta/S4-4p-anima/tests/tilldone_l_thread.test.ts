/**
 * tilldone_l_thread.test.ts — 50.T50.06: the CFP4 (L-Thread) completion gate.
 *
 * Three things are under test, in order of how badly their absence hurt:
 *   1. CFP4 no longer names a tool nothing registers. The registry records a
 *      body and a registrar for every Z-thread tool, and those files EXIST.
 *   2. The completion law itself — when may an L-Thread close.
 *   3. That the law is actually load-bearing in `dispatchZThread`: a gated CFP4
 *      move keeps running while the list is incomplete and closes when it isn't.
 */

import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
	DEFAULT_L_THREAD_MAX_CYCLES,
	L_THREAD_CFP,
	LThreadAddressError,
	TILLDONE_TOOL_BODY,
	TILLDONE_TOOL_NAME,
	TILLDONE_TOOL_REGISTRAR,
	assertLThreadAddress,
	describeLThreadResult,
	runLThread,
	tillDoneGate,
	type TillDoneList,
	type TillDoneTask,
} from "../S4/tilldone.ts";
import {
	ZTHREAD_TOOL_REGISTRY,
	dispatchZThread,
	zThreadMoveResults,
	zThreadToolForMove,
	zThreadToolRegistration,
	type ZThreadRuntimeAdapter,
} from "../extension/dispatch.ts";
import type { VakAddress, ZThreadMove, ZThreadSnapshot } from "../../shared/vak_address.ts";
import type { VerifyEvidence } from "../modules/judge-role.ts";

const REPO_ROOT = fileURLToPath(new URL("../../../../../../", import.meta.url));

const task = (id: number, text: string, status: TillDoneTask["status"]): TillDoneTask => ({
	id,
	text,
	status,
});

const list = (...tasks: TillDoneTask[]): TillDoneList => ({ tasks, listTitle: "fixture" });

// ── 1. The name resolves ──────────────────────────────────────────────────

describe("CFP4 resolves to a genuinely registered tool", () => {
	it("maps CFP4 to tilldone", () => {
		assert.equal(zThreadToolForMove("CFP4"), TILLDONE_TOOL_NAME);
		assert.equal(TILLDONE_TOOL_NAME, "tilldone");
	});

	it("records where the tilldone tool actually lives, outside Anima", () => {
		const registration = zThreadToolRegistration("CFP4");
		assert.equal(registration.tool, "tilldone");
		assert.equal(registration.body, TILLDONE_TOOL_BODY);
		assert.equal(registration.registrar, TILLDONE_TOOL_REGISTRAR);
		// 12.T12.11: residency is Pleroma. Anima binds it; Anima does not own it.
		assert.match(registration.body, /S4-2p-pleroma/);
		assert.match(registration.registrar, /S4-2p-pleroma/);
		// What Anima DOES own is the completion-gate executor.
		assert.equal(registration.executor, "Body/S/S4/ta-onta/S4-4p-anima/S4/tilldone.ts");
	});

	it("every registered Z-thread tool has a body and registrar that exist on disk", () => {
		// This is the assertion that makes a dangling name impossible to
		// reintroduce quietly: the registry is checked against the filesystem.
		for (const [name, registration] of Object.entries(ZTHREAD_TOOL_REGISTRY)) {
			assert.equal(registration.tool, name);
			assert.ok(
				existsSync(join(REPO_ROOT, registration.body)),
				`${name}: body missing at ${registration.body}`,
			);
			assert.ok(
				existsSync(join(REPO_ROOT, registration.registrar)),
				`${name}: registrar missing at ${registration.registrar}`,
			);
			if (registration.executor) {
				assert.ok(
					existsSync(join(REPO_ROOT, registration.executor)),
					`${name}: executor missing at ${registration.executor}`,
				);
			}
		}
	});

	it("the registrar really registers the tool under that name", () => {
		// Not a path check — the registration CALL has to be there.
		const registrar = join(REPO_ROOT, TILLDONE_TOOL_REGISTRAR);
		const body = join(REPO_ROOT, TILLDONE_TOOL_BODY);
		assert.ok(existsSync(registrar) && existsSync(body));
		const registrarSource = readFileSync(registrar, "utf8");
		const bodySource = readFileSync(body, "utf8");
		assert.match(registrarSource, /registerTilldone\(api\)/);
		assert.match(bodySource, /name:\s*"tilldone"/);
	});

	it("keeps every other CFP move mapped exactly as before", () => {
		assert.equal(zThreadToolForMove("CFP0"), "dispatch_agent");
		assert.equal(zThreadToolForMove("CFP1"), "dispatch_parallel_agents");
		assert.equal(zThreadToolForMove("CFP2"), "run_chain");
		assert.equal(zThreadToolForMove("CFP3"), "dispatch_fusion_agents");
		assert.equal(zThreadToolForMove("CFP5"), "subagent_create");
	});
});

// ── 2. The completion law ─────────────────────────────────────────────────

describe("tillDoneGate — when may an L-Thread close", () => {
	it("refuses to close when nothing has been planned", () => {
		const verdict = tillDoneGate(list());
		assert.equal(verdict.code, "tilldone/no-list");
		assert.equal(verdict.complete, false);
		assert.equal(verdict.blocked, true);
	});

	it("treats an absent list the same as an empty one", () => {
		assert.equal(tillDoneGate(undefined).code, "tilldone/no-list");
	});

	it("refuses to close while tasks remain, and names them", () => {
		const verdict = tillDoneGate(list(task(1, "port it", "done"), task(2, "wire it", "inprogress")));
		assert.equal(verdict.code, "tilldone/incomplete");
		assert.equal(verdict.complete, false);
		assert.equal(verdict.blocked, false);
		assert.deepEqual(
			verdict.remaining.map((t) => t.id),
			[2],
		);
		assert.match(verdict.reason, /wire it/);
	});

	it("refuses to close when work is outstanding but nothing is in progress", () => {
		const verdict = tillDoneGate(list(task(1, "port it", "done"), task(2, "wire it", "idle")));
		assert.equal(verdict.code, "tilldone/none-in-progress");
		assert.equal(verdict.complete, false);
		assert.equal(verdict.blocked, true);
	});

	it("closes only when every task is done", () => {
		const verdict = tillDoneGate(list(task(1, "port it", "done"), task(2, "wire it", "done")));
		assert.equal(verdict.code, "tilldone/complete");
		assert.equal(verdict.complete, true);
		assert.equal(verdict.blocked, false);
		assert.equal(verdict.remaining.length, 0);
	});

	it("is the ONLY code that reports complete", () => {
		const codes = [
			tillDoneGate(list()),
			tillDoneGate(list(task(1, "a", "idle"))),
			tillDoneGate(list(task(1, "a", "inprogress"))),
			tillDoneGate(list(task(1, "a", "done"))),
		];
		assert.deepEqual(
			codes.map((v) => v.complete),
			[false, false, false, true],
		);
	});
});

// ── 3. The loop ───────────────────────────────────────────────────────────

describe("runLThread — keeps running until the condition holds", () => {
	it("closes as soon as the list is complete, and not before", async () => {
		// The list completes on the third pass. Anything that closes earlier is
		// closing on something other than the done-condition.
		const states: TillDoneList[] = [
			list(task(1, "a", "inprogress"), task(2, "b", "idle")),
			list(task(1, "a", "done"), task(2, "b", "inprogress")),
			list(task(1, "a", "done"), task(2, "b", "done")),
		];
		let pass = 0;

		const result = await runLThread({
			id: "l-1",
			address: { cfp: "CFP4" },
			perform: () => `pass ${++pass}`,
			readTaskList: () => states[Math.min(pass - 1, states.length - 1)],
		});

		assert.equal(result.closed, true);
		assert.equal(result.cycles.length, 3);
		assert.equal(result.finalVerdict.code, "tilldone/complete");
		assert.deepEqual(
			result.cycles.map((c) => c.verdict.code),
			["tilldone/incomplete", "tilldone/incomplete", "tilldone/complete"],
		);
	});

	it("does NOT close when the condition never holds — exhaustion is not completion", async () => {
		const result = await runLThread({
			id: "l-never",
			perform: () => "still working",
			readTaskList: () => list(task(1, "unfinishable", "inprogress")),
			maxCycles: 4,
		});

		assert.equal(result.closed, false);
		assert.equal(result.cycles.length, 4);
		assert.equal(result.finalVerdict.complete, false);
		assert.match(result.reason ?? "", /did not reach its done-condition within 4 cycles/);
	});

	it("closes on the first pass when the work was already done", async () => {
		const result = await runLThread({
			id: "l-fast",
			perform: () => "one pass",
			readTaskList: () => list(task(1, "a", "done")),
		});
		assert.equal(result.closed, true);
		assert.equal(result.cycles.length, 1);
	});

	it("feeds the previous verdict back into the next pass", async () => {
		const seen: Array<string | undefined> = [];
		let pass = 0;
		await runLThread({
			id: "l-nudge",
			perform: (_cycle, previous) => {
				seen.push(previous?.code);
				return "work";
			},
			readTaskList: () => (++pass >= 2 ? list(task(1, "a", "done")) : list(task(1, "a", "inprogress"))),
		});
		// First pass has no predecessor; the second receives the gate's reason —
		// that feedback is the tool's nudge, moved into the orchestration.
		assert.deepEqual(seen, [undefined, "tilldone/incomplete"]);
	});

	it("still refuses to close when a planning pass leaves the list empty", async () => {
		const result = await runLThread({
			id: "l-unplanned",
			perform: () => "forgot to plan",
			readTaskList: () => list(),
			maxCycles: 2,
		});
		assert.equal(result.closed, false);
		assert.equal(result.finalVerdict.code, "tilldone/no-list");
	});

	it("refuses an address that is not CFP4", async () => {
		await assert.rejects(
			() =>
				runLThread({
					id: "l-wrong",
					address: { cfp: "CFP0" },
					perform: () => "x",
					readTaskList: () => list(task(1, "a", "done")),
				}),
			(error: unknown) => error instanceof LThreadAddressError && error.cfp === "CFP0",
		);
		assert.throws(() => assertLThreadAddress({ cfp: "CFP2" }), LThreadAddressError);
		assert.doesNotThrow(() => assertLThreadAddress({ cfp: L_THREAD_CFP }));
	});

	it("refuses a nonsensical cycle bound", async () => {
		await assert.rejects(
			() =>
				runLThread({
					id: "l-bad-bound",
					perform: () => "x",
					readTaskList: () => list(),
					maxCycles: 0,
				}),
			RangeError,
		);
	});

	it("describes an unclosed run as unclosed", async () => {
		const result = await runLThread({
			id: "l-desc",
			perform: () => "work",
			readTaskList: () => list(task(1, "a", "inprogress")),
			maxCycles: 2,
		});
		const described = describeLThreadResult(result);
		assert.match(described, /DID NOT CLOSE after 2 cycle\(s\)/);
		assert.doesNotMatch(described, /\bCLOSED after\b/);
	});

	it("has a finite default bound", () => {
		assert.ok(Number.isInteger(DEFAULT_L_THREAD_MAX_CYCLES) && DEFAULT_L_THREAD_MAX_CYCLES > 0);
	});
});

// ── 4. The gate is load-bearing inside a real Z-thread dispatch ───────────

const zAddress: VakAddress & { cfp: "Z" } = {
	cpf: "(4.0/1-4.4/5)",
	ct: ["CT4b"],
	cp: "CP4.2",
	cf: "(0/1/2)",
	cfp: "Z",
	cs: { code: "CS4", direction: "Day" },
};

const clearedEvidence = (): VerifyEvidence => ({
	judge: { agent: "eros", vak_coordinates: "CF3", symbolic_coordinate: "M4-2" },
	clearance: "cleared",
	questions: [],
});

function gatedAdapter(
	states: TillDoneList[],
): ZThreadRuntimeAdapter & { performs: number; gatedPerforms: number } {
	const adapter = {
		performs: 0,
		/** Passes of the CFP4 move only — the list advances with the L-Thread. */
		gatedPerforms: 0,
		lThreadMaxCycles: 6,
		async perform(move: ZThreadMove, _thread: ZThreadSnapshot) {
			adapter.performs += 1;
			if (move.cfp === "CFP4") adapter.gatedPerforms += 1;
			return `did ${move.id}`;
		},
		readTaskList(_move: ZThreadMove, _thread: ZThreadSnapshot) {
			return states[Math.min(adapter.gatedPerforms - 1, states.length - 1)];
		},
		async verify(_thread: ZThreadSnapshot) {
			return clearedEvidence();
		},
	};
	return adapter;
}

describe("dispatchZThread routes a CFP4 move through the completion gate", () => {
	const moves: ZThreadMove[] = [
		{ id: "scout", cfp: "CFP1", task: "fan out", agents: ["nous", "logos"] },
		{ id: "grind", cfp: "CFP4", task: "work till done" },
	];

	it("performs the CFP4 move repeatedly until the list is done", async () => {
		const adapter = gatedAdapter([
			list(task(1, "a", "inprogress"), task(2, "b", "idle")),
			list(task(1, "a", "inprogress"), task(2, "b", "idle")),
			list(task(1, "a", "done"), task(2, "b", "done")),
		]);

		const snapshot = await dispatchZThread({
			id: "z-gated",
			vak_address: zAddress,
			moves,
			adapter,
		});

		const lThread = zThreadMoveResults(snapshot).find((o) => o.cfp === "CFP4");
		assert.ok(lThread, "the CFP4 move should be recorded");
		assert.equal(lThread.tool, "tilldone");
		assert.equal(lThread.l_thread?.closed, true);
		// CFP1 ran once; CFP4 ran three times because the gate kept it running.
		assert.equal(lThread.l_thread?.cycles.length, 3);
		assert.equal(adapter.performs, 4);
	});

	it("records a CFP4 move that never satisfied its condition as unclosed", async () => {
		const adapter = gatedAdapter([list(task(1, "a", "inprogress"))]);

		const snapshot = await dispatchZThread({
			id: "z-unclosed",
			vak_address: zAddress,
			moves,
			adapter,
		});

		const lThread = zThreadMoveResults(snapshot).find((o) => o.cfp === "CFP4");
		assert.equal(lThread?.l_thread?.closed, false);
		assert.equal(lThread?.l_thread?.cycles.length, 6);
		assert.match(lThread?.output ?? "", /DID NOT CLOSE/);
	});

	it("leaves CFP4 single-pass when the adapter cannot read the task list", async () => {
		// The gate is opt-in per adapter — an adapter with no reader keeps the
		// pre-50.T50.06 behaviour rather than silently looping.
		let performs = 0;
		const adapter: ZThreadRuntimeAdapter = {
			async perform(move: ZThreadMove) {
				performs += 1;
				return `did ${move.id}`;
			},
			async verify() {
				return clearedEvidence();
			},
		};

		const snapshot = await dispatchZThread({
			id: "z-ungated",
			vak_address: zAddress,
			moves,
			adapter,
		});

		assert.equal(performs, 2);
		const lThread = zThreadMoveResults(snapshot).find((o) => o.cfp === "CFP4");
		assert.equal(lThread?.tool, "tilldone");
		assert.equal(lThread?.l_thread, undefined);
	});
});
