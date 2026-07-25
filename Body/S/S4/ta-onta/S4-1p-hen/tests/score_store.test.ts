/**
 * score_store.test.ts — 50.T50.07: Hen's score persistence.
 *
 * The property that matters is FAITHFULNESS. A score exists so a run can be
 * reproduced, so a score that quietly changed is worse than one that is
 * missing — every test here is ultimately about that.
 */

import { after, before, beforeEach, describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
	InvalidScoreId,
	SCORE_SCHEMA,
	ScoreIntegrityError,
	ScoreNotFound,
	canonicalize,
	hasScore,
	listScores,
	loadScore,
	readScoreRuns,
	recordScoreRun,
	saveScore,
	scoreHash,
	scoresDir,
} from "../modules/score-store.ts";

let store: string;
const previousEnv = process.env.EPI_SCORES_DIR;

before(() => {
	store = mkdtempSync(join(tmpdir(), "hen-scores-"));
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

const program = {
	id: "nightly",
	steps: [
		{ id: "scout", task: "read the manifest" },
		{ id: "build", task: "apply the change" },
	],
};

const provenance = { origination: "(00/00)", sessionId: "s-1", task: "nightly sweep" };

describe("score store — location", () => {
	it("stores under the runtime state root, never the vault", () => {
		delete process.env.EPI_SCORES_DIR;
		try {
			const dir = scoresDir();
			assert.match(dir, /\.epi[/\\]scores$/);
			assert.doesNotMatch(dir, /Idea/);
		} finally {
			process.env.EPI_SCORES_DIR = store;
		}
	});

	it("honours an explicit store override", () => {
		assert.equal(scoresDir(), store);
	});
});

describe("score store — canonical form and hashing", () => {
	it("canonicalises independently of key insertion order", () => {
		assert.equal(canonicalize({ b: 1, a: 2 }), canonicalize({ a: 2, b: 1 }));
	});

	it("preserves array order, because step order is meaning", () => {
		assert.notEqual(canonicalize([1, 2]), canonicalize([2, 1]));
	});

	it("drops undefined rather than emitting it", () => {
		assert.equal(canonicalize({ a: 1, b: undefined }), '{"a":1}');
	});

	it("hashes the same program to the same hash across calls", () => {
		const a = scoreHash({ id: "x", provenance, program });
		const b = scoreHash({ id: "x", provenance, program: JSON.parse(JSON.stringify(program)) });
		assert.equal(a, b);
	});

	it("hashes a changed program differently", () => {
		const a = scoreHash({ id: "x", provenance, program });
		const b = scoreHash({
			id: "x",
			provenance,
			program: { ...program, steps: [...program.steps].reverse() },
		});
		assert.notEqual(a, b);
	});
});

describe("score store — round trip", () => {
	it("saves and loads a score unchanged", () => {
		const saved = saveScore({ id: "nightly", title: "Nightly sweep", provenance, program });
		const loaded = loadScore("nightly");

		assert.equal(loaded.schema, SCORE_SCHEMA);
		assert.equal(loaded.id, "nightly");
		assert.equal(loaded.title, "Nightly sweep");
		assert.equal(loaded.hash, saved.hash);
		assert.deepEqual(loaded.program, program);
		assert.deepEqual(loaded.provenance, provenance);
	});

	it("is idempotent by content — the same program yields the same hash", () => {
		const first = saveScore({ id: "nightly", provenance, program });
		const second = saveScore({ id: "nightly", provenance, program });
		assert.equal(first.hash, second.hash);
	});

	it("reports presence without loading", () => {
		assert.equal(hasScore("nightly"), false);
		saveScore({ id: "nightly", provenance, program });
		assert.equal(hasScore("nightly"), true);
	});

	it("lists stored scores, and does not list run logs as scores", () => {
		saveScore({ id: "beta", provenance, program });
		saveScore({ id: "alpha", provenance, program });
		recordScoreRun({ scoreId: "alpha", hash: "h" });
		assert.deepEqual(listScores(), ["alpha", "beta"]);
	});

	it("returns an empty list when nothing has been stored", () => {
		assert.deepEqual(listScores(), []);
	});

	it("raises a typed error for a score that is not there", () => {
		assert.throws(() => loadScore("absent"), ScoreNotFound);
	});
});

describe("score store — integrity", () => {
	it("REFUSES a score whose program was edited underneath it", () => {
		saveScore({ id: "nightly", provenance, program });
		const path = join(store, "nightly.json");
		const document = JSON.parse(readFileSync(path, "utf8"));
		document.program.steps[0].task = "read something else entirely";
		writeFileSync(path, JSON.stringify(document, null, 2), "utf8");

		assert.throws(() => loadScore("nightly"), ScoreIntegrityError);
	});

	it("REFUSES a score whose provenance was edited underneath it", () => {
		saveScore({ id: "nightly", provenance, program });
		const path = join(store, "nightly.json");
		const document = JSON.parse(readFileSync(path, "utf8"));
		document.provenance.origination = "(4.0/1-4.4/5)";
		writeFileSync(path, JSON.stringify(document, null, 2), "utf8");

		assert.throws(() => loadScore("nightly"), ScoreIntegrityError);
	});

	it("REFUSES a document from an unknown schema", () => {
		saveScore({ id: "nightly", provenance, program });
		const path = join(store, "nightly.json");
		const document = JSON.parse(readFileSync(path, "utf8"));
		document.schema = "epi.score.v99";
		writeFileSync(path, JSON.stringify(document, null, 2), "utf8");

		assert.throws(() => loadScore("nightly"), ScoreIntegrityError);
	});

	it("survives a rewrite that only reorders keys", () => {
		// The hash is over the CANONICAL form, so pretty-printing or key-order
		// churn must not read as tampering.
		const saved = saveScore({ id: "nightly", provenance, program });
		const path = join(store, "nightly.json");
		const document = JSON.parse(readFileSync(path, "utf8"));
		const reordered = {
			hash: document.hash,
			program: document.program,
			provenance: { task: provenance.task, sessionId: provenance.sessionId, origination: provenance.origination },
			id: document.id,
			schema: document.schema,
		};
		writeFileSync(path, JSON.stringify(reordered), "utf8");

		assert.equal(loadScore("nightly").hash, saved.hash);
	});
});

describe("score store — ids cannot escape the store", () => {
	for (const bad of ["../escape", "nested/id", ".hidden", "", "a/../../b"]) {
		it(`refuses ${JSON.stringify(bad)}`, () => {
			assert.throws(() => saveScore({ id: bad, provenance, program }), InvalidScoreId);
			assert.throws(() => loadScore(bad), InvalidScoreId);
		});
	}

	it("accepts ordinary ids", () => {
		assert.doesNotThrow(() => saveScore({ id: "nightly-sweep_v2.1", provenance, program }));
	});
});

describe("score store — run history is append-only", () => {
	it("keeps every run, oldest first", () => {
		saveScore({ id: "nightly", provenance, program });
		recordScoreRun({ scoreId: "nightly", hash: "h1", outcome: "ok", at: "2026-07-25T00:00:00Z" });
		recordScoreRun({ scoreId: "nightly", hash: "h1", outcome: "ok", at: "2026-07-25T01:00:00Z" });
		recordScoreRun({ scoreId: "nightly", hash: "h2", outcome: "failed", at: "2026-07-25T02:00:00Z" });

		const runs = readScoreRuns("nightly");
		assert.equal(runs.length, 3);
		assert.deepEqual(
			runs.map((r) => r.at),
			["2026-07-25T00:00:00Z", "2026-07-25T01:00:00Z", "2026-07-25T02:00:00Z"],
		);
		// A later run must never be able to erase an earlier one — the history IS
		// the evidence a score's quality gets judged on.
		assert.equal(runs[2].outcome, "failed");
		assert.equal(runs[0].outcome, "ok");
	});

	it("returns no runs for a score that has never run", () => {
		assert.deepEqual(readScoreRuns("nightly"), []);
	});

	it("carries a detail payload through for later scoring", () => {
		recordScoreRun({ scoreId: "nightly", hash: "h", detail: { steps: 2, cfp: "CFP2" } });
		assert.deepEqual(readScoreRuns("nightly")[0].detail, { steps: 2, cfp: "CFP2" });
	});
});
