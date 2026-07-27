/**
 * elo_persistence.test.ts — the ELO store survives the process (50.T50.12).
 *
 * `elo-runtime.sql` declared four tables that no code had ever created: zero
 * `.ts` and zero `.rs` referenced them, no migration runner applied the DDL, and
 * `MercuriusEloStore` was a `Map` that died with the process. So "a second
 * comparable run updates ELO" could only ever hold inside one session.
 *
 * These tests hold the persistence contract:
 *   - the REAL `elo-runtime.sql` DDL is what creates the tables (not a hand-copy
 *     that can drift from the schema S3 owns);
 *   - a store round-trips through SQL without losing a field;
 *   - the guardian decisions are recorded, not just their effect — a refused
 *     update and a threshold miss are evidence, and both must survive;
 *   - ratings are keyed so a re-run updates a row rather than growing the table.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
	create_mercurius_elo_store,
	mercurius_record_trial,
	mercurius_update_elo,
	parseAletheiaConfigToml,
} from "../modules/mercurius-elo.ts";
import {
	ELO_SCHEMA_PATH,
	openEloDatabase,
	persistEloStore,
	loadEloStore,
	recordComparison,
	readTrialRows,
	readRatingRows,
	readComparisonRows,
} from "../modules/elo-persistence.ts";
import type { EloContextTuple } from "../modules/anansi-elo-index.ts";

const CONFIG = parseAletheiaConfigToml(`
[aletheia.elo]
seed_rating = 1500
confidence_penalty_alpha = 0.5
bootstrap_trials = 5
bootstrap_sigma = 350
k_factor = 32
expected_score_base = 10
expected_score_divisor = 400
outcome_win = 1
outcome_loss = 0
outcome_draw = 0.5
fair_comparison_similarity_floor = 0.8

[aletheia.drift_detection]
delta_elo = 1
`);

const CONTEXT: EloContextTuple = {
	vak_cp_position: "CP4.2",
	mef_lens: "L5",
	content_class: "implementation",
	kairos_window: "day",
	cfp_thread_type: "CFP2",
	r_factor_slot: "R0",
};

const DISPATCH = {
	agent: "logos",
	model: "google/gemini-3.1-flash-lite",
	harness: "pi",
	skill: "anima-orchestration",
	context_tuple: CONTEXT,
	tournament: "agent" as const,
};

function withDb<T>(run: (path: string) => T): T {
	const dir = mkdtempSync(join(tmpdir(), "elo-persistence-"));
	try {
		return run(join(dir, "elo.sqlite"));
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
}

/** A store carrying one accepted update, built through the real guardian split. */
function storeWithAnAcceptedUpdate() {
	const store = create_mercurius_elo_store();
	mercurius_record_trial({
		trial_id: "trial-1",
		dispatch: DISPATCH,
		outcomes: { channels: { R_verifier: { score: 1 } } },
		completed_at: "2026-07-27T09:00:00.000Z",
		store,
	});
	// The first update is refused: nothing comparable exists yet.
	const first = mercurius_update_elo({ trial_id: "trial-1", store, config: CONFIG });
	mercurius_record_trial({
		trial_id: "trial-2",
		dispatch: DISPATCH,
		outcomes: { channels: { R_verifier: { score: 1 } } },
		completed_at: "2026-07-27T10:00:00.000Z",
		store,
	});
	const second = mercurius_update_elo({ trial_id: "trial-2", store, config: CONFIG });
	return { store, first, second };
}

test("the DDL that creates the tables IS the schema S3 owns", () => {
	// Not a hand-copied CREATE TABLE in this module: a second copy of a schema is
	// how the persisted shape drifts from the declared one.
	assert.match(ELO_SCHEMA_PATH, /spacetime-context[/\\]schemas[/\\]elo-runtime\.sql$/);

	withDb((path) => {
		const db = openEloDatabase(path);
		const tables = db
			.prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
			.all()
			.map((row) => (row as { name: string }).name);
		db.close();
		assert.deepEqual(tables, [
			"anansi_rating_index",
			"mercurius_elo_ratings",
			"mercurius_trial_log",
			"moirai_comparison_cache",
		]);
	});
});

test("opening an existing database does not re-apply the DDL", () => {
	withDb((path) => {
		const first = openEloDatabase(path);
		first.close();
		// A second open must not throw "table already exists" — a runner that only
		// works on a fresh file is not a migration.
		const second = openEloDatabase(path);
		second.close();
	});
});

test("a store round-trips through SQL with every field intact", () => {
	const { store } = storeWithAnAcceptedUpdate();
	assert.ok(store.ratings.size > 0, "the fixture must actually produce a rating");

	withDb((path) => {
		const db = openEloDatabase(path);
		persistEloStore({ db, store });
		db.close();

		const reopened = openEloDatabase(path);
		const restored = loadEloStore({ db: reopened, config: CONFIG });
		reopened.close();

		assert.deepEqual(
			[...restored.trial_log.keys()].sort(),
			[...store.trial_log.keys()].sort(),
		);
		assert.deepEqual([...restored.ratings.keys()].sort(), [...store.ratings.keys()].sort());

		for (const [key, original] of store.ratings) {
			const loaded = restored.ratings.get(key);
			assert.ok(loaded, `rating ${key} should survive`);
			assert.deepEqual(loaded.context_tuple, original.context_tuple);
			assert.equal(loaded.channel, original.channel);
			assert.equal(loaded.agent, original.agent);
			assert.equal(loaded.model, original.model);
			assert.equal(loaded.harness, original.harness);
			assert.equal(loaded.skill, original.skill);
			assert.equal(loaded.trial_count, original.trial_count);
			// A rating is a float; it must come back bit-identical, not rounded.
			assert.equal(loaded.rating, original.rating);
			assert.equal(loaded.sigma, original.sigma);
		}

		// The restored store is USABLE, not just readable: its index resolves.
		assert.equal(restored.index.partitions.size, store.index.partitions.size);
	});
});

test("a restored store is a working comparison history", () => {
	// The point of persistence: a run in a LATER process can find yesterday's
	// trial comparable. If the trial log did not survive, Moirai would refuse
	// every first update forever.
	const { store } = storeWithAnAcceptedUpdate();

	withDb((path) => {
		const db = openEloDatabase(path);
		persistEloStore({ db, store });
		db.close();

		const reopened = openEloDatabase(path);
		const restored = loadEloStore({ db: reopened, config: CONFIG });
		reopened.close();

		mercurius_record_trial({
			trial_id: "trial-3",
			dispatch: DISPATCH,
			outcomes: { channels: { R_verifier: { score: 1 } } },
			completed_at: "2026-07-27T11:00:00.000Z",
			store: restored,
		});
		const result = mercurius_update_elo({ trial_id: "trial-3", store: restored, config: CONFIG });

		assert.equal(result.comparison.comparable, true, JSON.stringify(result.comparison.reason));
		assert.equal(result.comparison.atropos_decision, "update_allowed");
		assert.ok(
			result.comparison.lachesis_best_match,
			"the match must come from a trial loaded out of SQL",
		);
	});
});

test("a rating row is updated in place, not appended, across runs", () => {
	const { store } = storeWithAnAcceptedUpdate();

	withDb((path) => {
		const db = openEloDatabase(path);
		persistEloStore({ db, store });
		const afterFirst = readRatingRows(db).length;

		// Persist the same store again: same identity, same context, same channel.
		persistEloStore({ db, store });
		const afterSecond = readRatingRows(db).length;
		db.close();

		assert.equal(
			afterSecond,
			afterFirst,
			"a re-persist must upsert on (identity, context, channel), not grow the table",
		);
	});
});

test("the guardians' decisions are persisted as evidence, not only their effect", () => {
	const { first, second } = storeWithAnAcceptedUpdate();
	assert.equal(first.comparison.comparable, false, "the first update should be refused");
	assert.equal(second.comparison.comparable, true);

	withDb((path) => {
		const db = openEloDatabase(path);
		// The trials must land first: moirai_comparison_cache.trial_id is a real
		// FOREIGN KEY, so a comparison cannot reference a trial the log has never
		// seen. That ordering IS the schema's guarantee, not an inconvenience.
		persistEloStore({ db, store: storeWithAnAcceptedUpdate().store });
		recordComparison({ db, comparison: first.comparison, computed_at: "2026-07-27T09:00:01.000Z" });
		recordComparison({ db, comparison: second.comparison, computed_at: "2026-07-27T10:00:01.000Z" });
		const rows = readComparisonRows(db);
		db.close();

		assert.equal(rows.length, 2);
		const refused = rows.find((r) => r.trial_id === "trial-1");
		assert.ok(refused);
		assert.equal(refused.comparable, 0, "SQLite stores BOOLEAN as 0/1");
		assert.equal(refused.atropos_decision, "uncalibrated_refusal");
		assert.match(String(refused.reason), /fair-comparison floor/);

		const allowed = rows.find((r) => r.trial_id === "trial-2");
		assert.ok(allowed);
		assert.equal(allowed.comparable, 1);
		assert.equal(allowed.atropos_decision, "update_allowed");
		assert.equal(allowed.comparable_trial_id, "trial-1");
		assert.equal(allowed.similarity_score, 1);
	});
});

test("the trial log keeps the per-channel scores the SQL flattens", () => {
	const store = create_mercurius_elo_store();
	mercurius_record_trial({
		trial_id: "multi",
		dispatch: DISPATCH,
		outcomes: {
			channels: {
				R_verifier: { score: 1 },
				R_lens: { score: 0.5 },
			},
		},
		completed_at: "2026-07-27T12:00:00.000Z",
		store,
	});

	withDb((path) => {
		const db = openEloDatabase(path);
		persistEloStore({ db, store });
		const rows = readTrialRows(db);
		db.close();

		assert.equal(rows.length, 1);
		const row = rows[0];
		assert.equal(row.verifier_score, 1);
		assert.equal(row.lens_score, 0.5);
		assert.equal(row.user_score, null, "an unscored channel is NULL, not 0");
		assert.equal(row.tournament, "agent");
		assert.equal(row.completed_at, "2026-07-27T12:00:00.000Z");
		// The six context columns are flattened out of the tuple.
		assert.equal(row.vak_cp_position, "CP4.2");
		assert.equal(row.cfp_thread_type, "CFP2");
		assert.equal(row.r_factor_slot, "R0");
	});
});
