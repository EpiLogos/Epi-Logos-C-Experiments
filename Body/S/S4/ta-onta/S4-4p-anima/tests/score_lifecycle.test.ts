/**
 * score_lifecycle.test.ts — 50.T50.07: `(00/00)` origination → score lifecycle.
 *
 * Three claims:
 *   1. Every Anima session STARTS dialogical. Origination is not a field a
 *      caller may forget to set — it is defaulted on both read and write.
 *   2. A score originates only from dialogue. Asking a mechanistic session for
 *      one is refused, not quietly allowed.
 *   3. Re-running a score REPRODUCES the run: the program executed is
 *      byte-identical to the one persisted, the step order is identical, and a
 *      re-run does not re-originate.
 */

import { after, before, beforeEach, describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
	ORIGINATION_DIALOGICAL,
	ORIGINATION_MECHANISTIC,
	ScoreOriginationError,
	ScoreProgramError,
	assertScoredOrchestration,
	getCSState,
	isOriginating,
	loadScoredOrchestration,
	persistScore,
	rerunScore,
	setCSState,
	setOrigination,
	type ScoredOrchestration,
} from "../extension/dispatch.ts";
import { ScoreIntegrityError, readScoreRuns, scoreHash } from "../../S4-1p-hen/modules/score-store.ts";
import { defineOrchestration, runOrchestration } from "../lib/vak-orchestration-surface.ts";
import type { VakAddress } from "../../shared/vak_address.ts";

let store: string;
const previousEnv = process.env.EPI_SCORES_DIR;

before(() => {
	store = mkdtempSync(join(tmpdir(), "anima-scores-"));
	process.env.EPI_SCORES_DIR = store;
});

after(() => {
	if (previousEnv === undefined) delete process.env.EPI_SCORES_DIR;
	else process.env.EPI_SCORES_DIR = previousEnv;
	rmSync(store, { recursive: true, force: true });
});

beforeEach(() => {
	rmSync(store, { recursive: true, force: true });
});

const addr = (over: Partial<VakAddress> = {}): VakAddress => ({
	cpf: "(4.0/1-4.4/5)",
	ct: ["CT3"],
	cp: "CP4.0",
	cf: "(0/1)",
	cfp: "CFP0",
	cs: { code: "CS2", direction: "Day" },
	...over,
});

/**
 * A real orchestration, built through the real surface.
 *
 * Returned as `ScoredOrchestration` with no cast: the persistable shape is the
 * structural equal of `Orchestration`, and that equality is the point — a score
 * stores exactly what the surface composed, not a lossy projection of it.
 */
function developedOrchestration(): ScoredOrchestration {
	return defineOrchestration({
		id: "nightly-sweep",
		address: addr({ cp: "CP4.0" }),
		steps: [
			// Deliberately declared out of run order: CS orders the run, not the
			// literal order of declaration, so a faithful replay must re-sort.
			{ id: "review", address: addr({ cp: "CP4.2", cf: "(5/0)", cs: { code: "CS5", direction: "Night'" } }), task: "review the sweep" },
			{ id: "scout", address: addr({ cp: "CP4.1", cf: "(0/1)" }), task: "read the manifest" },
			{ id: "build", address: addr({ cp: "CP4.3", cf: "(0/1/2)", cfp: "CFP2" }), task: "apply the change" },
		],
	});
}

describe("origination — every session starts in (00/00)", () => {
	it("defaults an unknown session to dialogical", () => {
		const state = getCSState("never-seen");
		assert.equal(state.origination, ORIGINATION_DIALOGICAL);
		assert.equal(isOriginating("never-seen"), true);
	});

	it("defaults on WRITE too, so the existing reset lands dialogical", () => {
		// `subscriptions.ts` resets CS on before_agent_start without naming an
		// origination; that reset must return the session to (00/00).
		const state = setCSState("s-reset", { value: "CS0", directionality: "day", cpPosition: "4.0" });
		assert.equal(state.origination, ORIGINATION_DIALOGICAL);
		assert.equal(getCSState("s-reset").origination, ORIGINATION_DIALOGICAL);
	});

	it("moves polarity without disturbing the rest of CS", () => {
		setCSState("s-move", { value: "CS3", directionality: "night_prime", cpPosition: "4.4" });
		const moved = setOrigination("s-move", ORIGINATION_MECHANISTIC);
		assert.equal(moved.origination, ORIGINATION_MECHANISTIC);
		assert.equal(moved.value, "CS3");
		assert.equal(moved.directionality, "night_prime");
		assert.equal(moved.cpPosition, "4.4");
		assert.equal(isOriginating("s-move"), false);
	});

	it("keeps sessions independent", () => {
		setOrigination("s-a", ORIGINATION_MECHANISTIC);
		assert.equal(isOriginating("s-a"), false);
		assert.equal(isOriginating("s-b"), true);
	});

	it("returns a state — not a string — for a falsy session id", () => {
		// An empty id is falsy but not nullish, so a `&&`-then-`??` lookup handed
		// back `""` and its `.origination` read as undefined: a session appearing
		// to have stopped originating purely because its id was empty.
		for (const id of ["", undefined]) {
			const state = getCSState(id);
			assert.equal(typeof state, "object");
			assert.equal(state.origination, ORIGINATION_DIALOGICAL);
			assert.equal(state.value, "CS0");
			assert.equal(isOriginating(id), true);
		}
	});
});

describe("a score originates only from dialogue", () => {
	it("persists a developed orchestration from a (00/00) session", () => {
		const score = persistScore({
			scoreId: "nightly",
			orchestration: developedOrchestration(),
			sessionId: "s-orig",
			title: "Nightly sweep",
			task: "sweep the manifest nightly",
			originatedAt: "2026-07-25T11:00:00Z",
		});

		assert.equal(score.id, "nightly");
		assert.equal(score.provenance.origination, ORIGINATION_DIALOGICAL);
		assert.equal(score.provenance.sessionId, "s-orig");
		assert.equal(score.provenance.originatedAt, "2026-07-25T11:00:00Z");
		assert.ok(score.hash.length === 64);
	});

	it("REFUSES to originate from a mechanistic session", () => {
		setOrigination("s-mech", ORIGINATION_MECHANISTIC);
		assert.throws(
			() =>
				persistScore({
					scoreId: "nope",
					orchestration: developedOrchestration(),
					sessionId: "s-mech",
				}),
			ScoreOriginationError,
		);
	});

	it("refuses a program that is not a runnable orchestration", () => {
		assert.throws(() => assertScoredOrchestration("bad", { id: "x", steps: [] }), ScoreProgramError);
		assert.throws(() => assertScoredOrchestration("bad", null), ScoreProgramError);
		assert.throws(
			() =>
				assertScoredOrchestration("bad", {
					id: "x",
					address: addr(),
					steps: [{ id: "s", task: "t", address: { cpf: "(00/00)" } }],
				}),
			ScoreProgramError,
		);
	});

	it("names which step is malformed", () => {
		try {
			assertScoredOrchestration("bad", {
				id: "x",
				address: addr(),
				steps: [
					{ id: "good", task: "t", address: addr() },
					{ id: "broken", task: "", address: addr() },
				],
			});
			assert.fail("should have refused");
		} catch (error) {
			assert.ok(error instanceof ScoreProgramError);
			assert.ok(error.violations.some((v) => v.includes("broken")));
		}
	});
});

describe("re-running a score reproduces the run", () => {
	async function executeAndRecord(orchestration: ScoredOrchestration) {
		const trace: string[] = [];
		const results = await runOrchestration(orchestration, {
			execute: (step, primitive) => {
				trace.push(`${step.id}|${step.address.cs.code}|${step.address.cp}|${primitive}`);
				return `did ${step.id}`;
			},
		});
		return { trace, results };
	}

	it("executes the identical program, in the identical order", async () => {
		const developed = developedOrchestration();
		const original = await executeAndRecord(developed);

		const score = persistScore({
			scoreId: "nightly",
			orchestration: developed,
			sessionId: "s-orig",
			originatedAt: "2026-07-25T11:00:00Z",
		});

		const replay = await rerunScore({
			scoreId: "nightly",
			sessionId: "s-orig",
			at: "2026-07-25T12:00:00Z",
			outcome: "ok",
			run: (orchestration) => executeAndRecord(orchestration),
		});

		// The decisive assertion: same steps, same order, same primitives.
		assert.deepEqual(replay.result.trace, original.trace);
		// Day pass before Night′, then by CP position — declaration order was
		// review/scout/build, so a faithful replay must re-sort every time.
		assert.deepEqual(replay.result.trace.map((t) => t.split("|")[0]), ["scout", "build", "review"]);
		// And the program itself was byte-identical to the one persisted.
		assert.equal(replay.score.hash, score.hash);
	});

	it("re-runs the persisted program, not the in-memory object", async () => {
		const developed = developedOrchestration();
		persistScore({ scoreId: "nightly", orchestration: developed, sessionId: "s-orig" });

		const { orchestration } = loadScoredOrchestration("nightly");
		assert.notEqual(orchestration, developed, "should be a fresh object read from disk");
		assert.deepEqual(JSON.parse(JSON.stringify(orchestration)), JSON.parse(JSON.stringify(developed)));
	});

	it("does NOT re-originate: the run is mechanistic, and the prior polarity returns", async () => {
		persistScore({ scoreId: "nightly", orchestration: developedOrchestration(), sessionId: "s-orig" });
		assert.equal(isOriginating("s-orig"), true);

		let duringRun: string | undefined;
		await rerunScore({
			scoreId: "nightly",
			sessionId: "s-orig",
			run: () => {
				duringRun = getCSState("s-orig").origination;
				return "done";
			},
		});

		assert.equal(duringRun, ORIGINATION_MECHANISTIC);
		// Re-running a score mid-dialogue must not end the dialogue.
		assert.equal(getCSState("s-orig").origination, ORIGINATION_DIALOGICAL);
	});

	it("restores the prior polarity even when the run throws", async () => {
		persistScore({ scoreId: "nightly", orchestration: developedOrchestration(), sessionId: "s-orig" });
		await assert.rejects(
			() =>
				rerunScore({
					scoreId: "nightly",
					sessionId: "s-orig",
					run: () => {
						throw new Error("executor blew up");
					},
				}),
			/executor blew up/,
		);
		assert.equal(getCSState("s-orig").origination, ORIGINATION_DIALOGICAL);
	});

	it("records each re-run against the score's hash", async () => {
		const score = persistScore({
			scoreId: "nightly",
			orchestration: developedOrchestration(),
			sessionId: "s-orig",
		});
		await rerunScore({ scoreId: "nightly", sessionId: "s-orig", at: "t1", run: () => "a" });
		await rerunScore({ scoreId: "nightly", sessionId: "s-orig", at: "t2", run: () => "b" });

		const runs = readScoreRuns("nightly");
		assert.equal(runs.length, 2);
		assert.ok(runs.every((r) => r.hash === score.hash));
		assert.ok(runs.every((r) => r.origination === ORIGINATION_MECHANISTIC));
		assert.deepEqual(runs.map((r) => r.at), ["t1", "t2"]);
	});

	it("REFUSES to re-run a score that drifted on disk", async () => {
		persistScore({ scoreId: "nightly", orchestration: developedOrchestration(), sessionId: "s-orig" });
		const path = join(store, "nightly.json");
		const document = JSON.parse(readFileSync(path, "utf8"));
		document.program.steps[0].task = "something nobody agreed to";
		writeFileSync(path, JSON.stringify(document, null, 2), "utf8");

		await assert.rejects(
			() => rerunScore({ scoreId: "nightly", sessionId: "s-orig", run: () => "never" }),
			ScoreIntegrityError,
		);
		// A refused re-run leaves no run record — it did not happen.
		assert.deepEqual(readScoreRuns("nightly"), []);
	});

	it("gives the same hash to the same script originated twice", () => {
		const first = persistScore({
			scoreId: "a",
			orchestration: developedOrchestration(),
			sessionId: "s-orig",
			originatedAt: "2026-07-25T11:00:00Z",
		});
		const second = scoreHash({
			id: "a",
			provenance: first.provenance,
			program: developedOrchestration(),
		});
		assert.equal(second, first.hash);
	});
});
