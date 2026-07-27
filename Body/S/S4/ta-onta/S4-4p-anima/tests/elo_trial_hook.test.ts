/**
 * elo_trial_hook.test.ts — a completed run reaches the ELO engine (50.T50.12).
 *
 * Before this, `mercurius_update_elo` had no production caller: every call site
 * in the repo was a test. These pin the hook that closes that gap, and — more
 * importantly — pin what it REFUSES, because the four undeclarable context
 * fields are matchup-key fields and a guess there is worse than a gap.
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import {
	EloDeclarationError,
	eloContextForRun,
	eloIdentityForRun,
	recordRunCompletionTrial,
	UNDERIVABLE_CONTEXT_FIELDS,
	UNDERIVABLE_IDENTITY_FIELDS,
	type EloRunDeclaration,
} from "../modules/elo-trial-hook.ts";
import {
	create_mercurius_elo_store,
	parseAletheiaConfigToml,
} from "../../S4-5p-aletheia/modules/mercurius-elo.ts";
import type { VakAddress } from "../../shared/vak_address.ts";

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

const ADDRESS: VakAddress = {
	cpf: "(4.0/1-4.4/5)",
	ct: ["CT2"],
	cp: "CP4.3",
	cf: "(0/1)",
	cfp: "CFP2",
	cs: { code: "CS2", direction: "Day" },
};

const DECLARATION: EloRunDeclaration = {
	mef_lens: "L5",
	content_class: "implementation",
	kairos_window: "day",
	r_factor_slot: "R0",
	model: "google/gemini-3.1-flash-lite",
	harness: "pi",
	skill: "anima-orchestration",
};

test("the two derivable coordinates come from the address, not the declaration", () => {
	const tuple = eloContextForRun({ address: ADDRESS, declaration: DECLARATION });
	assert.equal(tuple.vak_cp_position, "CP4.3");
	assert.equal(tuple.cfp_thread_type, "CFP2");
	// And they are the ADDRESS's values even if a caller tries to state otherwise:
	// a derivable field has a source, so the source wins.
	const contradicted = eloContextForRun({
		address: ADDRESS,
		declaration: { ...DECLARATION, ...({ vak_cp_position: "CP4.0" } as EloRunDeclaration) },
	});
	assert.equal(contradicted.vak_cp_position, "CP4.3");
});

test("the four fields with no producer must be declared", () => {
	assert.deepEqual([...UNDERIVABLE_CONTEXT_FIELDS], [
		"mef_lens",
		"content_class",
		"kairos_window",
		"r_factor_slot",
	]);
	const tuple = eloContextForRun({ address: ADDRESS, declaration: DECLARATION });
	assert.equal(tuple.mef_lens, "L5");
	assert.equal(tuple.content_class, "implementation");
	assert.equal(tuple.kairos_window, "day");
	assert.equal(tuple.r_factor_slot, "R0");
});

test("an undeclared context field is refused BY NAME, never guessed", () => {
	for (const field of UNDERIVABLE_CONTEXT_FIELDS) {
		const declaration = { ...DECLARATION, [field]: undefined };
		assert.throws(
			() => eloContextForRun({ address: ADDRESS, declaration }),
			(err: unknown) => {
				assert.ok(err instanceof EloDeclarationError);
				assert.deepEqual(err.missing, [field]);
				assert.match(err.message, new RegExp(field));
				// The refusal says WHY guessing would be worse than refusing.
				assert.match(err.message, /matchup-key/);
				return true;
			},
			`${field} must be refused when absent`,
		);
	}
});

test("an empty string is not a declaration", () => {
	// A blank field would sail through a truthiness check and then poison the
	// matchup key as a real value. Anansi would also throw on it much later.
	assert.throws(
		() => eloContextForRun({ address: ADDRESS, declaration: { ...DECLARATION, mef_lens: "   " } }),
		EloDeclarationError,
	);
});

test("the identity half refuses the three fields the trace lacks", () => {
	assert.deepEqual([...UNDERIVABLE_IDENTITY_FIELDS], ["model", "harness", "skill"]);
	assert.deepEqual(eloIdentityForRun({ agent: "logos", declaration: DECLARATION }), {
		agent: "logos",
		model: "google/gemini-3.1-flash-lite",
		harness: "pi",
		skill: "anima-orchestration",
	});
	for (const field of UNDERIVABLE_IDENTITY_FIELDS) {
		assert.throws(
			() => eloIdentityForRun({ agent: "logos", declaration: { ...DECLARATION, [field]: "" } }),
			(err: unknown) => {
				assert.ok(err instanceof EloDeclarationError);
				assert.deepEqual(err.missing, [field]);
				return true;
			},
		);
	}
	// The agent comes from the run, but an absent one is still refused.
	assert.throws(
		() => eloIdentityForRun({ agent: "", declaration: DECLARATION }),
		(err: unknown) => {
			assert.ok(err instanceof EloDeclarationError);
			assert.deepEqual(err.missing, ["agent"]);
			return true;
		},
	);
});

test("a completed run logs a trial and the guardians refuse the first update", () => {
	// An uncalibrated refusal is the honest answer to a first-of-its-kind run,
	// not a failure. The trial is still logged so the next run has a history.
	const store = create_mercurius_elo_store();
	const result = recordRunCompletionTrial({
		trial: {
			trialId: "run-1",
			address: ADDRESS,
			agent: "logos",
			declaration: DECLARATION,
			outcomes: { channels: { R_verifier: { score: 1 } } },
			completedAt: "2026-07-27T09:00:00.000Z",
		},
		store,
		config: CONFIG,
	});

	assert.equal(store.trial_log.size, 1, "the trial is logged even when refused");
	assert.equal(result.comparison.comparable, false);
	assert.equal(result.comparison.atropos_decision, "uncalibrated_refusal");
	assert.deepEqual(result.updated_ratings, []);
	assert.equal(result.events.at(-1)?.event, "aletheia.elo.uncalibrated-refusal");
});

test("a second comparable run updates the rating through the guardian split", () => {
	const store = create_mercurius_elo_store();
	const trial = (trialId: string, completedAt: string) => ({
		trialId,
		address: ADDRESS,
		agent: "logos",
		declaration: DECLARATION,
		outcomes: { channels: { R_verifier: { score: 1 } } },
		completedAt,
	});

	recordRunCompletionTrial({ trial: trial("run-1", "2026-07-27T09:00:00.000Z"), store, config: CONFIG });
	const second = recordRunCompletionTrial({
		trial: trial("run-2", "2026-07-27T10:00:00.000Z"),
		store,
		config: CONFIG,
	});

	assert.equal(second.comparison.comparable, true, JSON.stringify(second.comparison.reason));
	assert.equal(second.comparison.lachesis_best_match?.trial_id, "run-1");
	assert.equal(second.comparison.lachesis_similarity?.score, 1, "same run, same everything");
	assert.equal(second.updated_ratings.length, 1);
	assert.equal(second.updated_ratings[0].channel, "R_verifier");
	assert.ok(second.threshold_decisions.length > 0, "Janus must have ruled on the delta");
	assert.equal(second.threshold_decisions[0].guardian, "janus");
});

test("a run at a different coordinate is not the same matchup", () => {
	// The whole point of the tuple: two runs that differ on a coordinate are not
	// comparable, so one cannot silently calibrate the other.
	const store = create_mercurius_elo_store();
	recordRunCompletionTrial({
		trial: {
			trialId: "run-1",
			address: ADDRESS,
			agent: "logos",
			declaration: DECLARATION,
			outcomes: { channels: { R_verifier: { score: 1 } } },
			completedAt: "2026-07-27T09:00:00.000Z",
		},
		store,
		config: CONFIG,
	});
	const elsewhere = recordRunCompletionTrial({
		trial: {
			trialId: "run-2",
			address: ADDRESS,
			agent: "sophia",
			// Different agent AND different lens AND different content class: three
			// mismatches out of twelve fields drops below the 0.8 floor.
			declaration: { ...DECLARATION, mef_lens: "L2", content_class: "review" },
			outcomes: { channels: { R_verifier: { score: 1 } } },
			completedAt: "2026-07-27T10:00:00.000Z",
		},
		store,
		config: CONFIG,
	});

	assert.equal(elsewhere.comparison.comparable, false);
	assert.deepEqual(elsewhere.updated_ratings, []);
});

test("the durable form survives a process boundary", async () => {
	// The claim the whole tranche rests on: a LATER run finds the earlier one
	// comparable. Two separate open/close cycles stand in for two processes.
	const { mkdtempSync, rmSync } = await import("node:fs");
	const { tmpdir } = await import("node:os");
	const { join } = await import("node:path");
	const { recordDurableRunTrial } = await import("../modules/elo-trial-hook.ts");

	const dir = mkdtempSync(join(tmpdir(), "elo-durable-"));
	const databasePath = join(dir, "elo", "elo-runtime.sqlite");
	try {
		const trial = (trialId: string, completedAt: string) => ({
			trialId,
			address: ADDRESS,
			agent: "logos",
			declaration: DECLARATION,
			outcomes: { channels: { R_verifier: { score: 1 } } },
			completedAt,
		});

		const first = await recordDurableRunTrial({
			trial: trial("durable-1", "2026-07-27T09:00:00.000Z"),
			config: CONFIG,
			databasePath,
			computedAt: "2026-07-27T09:00:01.000Z",
		});
		assert.equal(first.comparison.comparable, false, "nothing to compare against yet");

		// A fresh call re-opens the database from scratch — no shared in-memory store.
		const second = await recordDurableRunTrial({
			trial: trial("durable-2", "2026-07-27T10:00:00.000Z"),
			config: CONFIG,
			databasePath,
			computedAt: "2026-07-27T10:00:01.000Z",
		});
		assert.equal(
			second.comparison.comparable,
			true,
			"the first trial must have been loaded back out of SQL",
		);
		assert.equal(second.comparison.lachesis_best_match?.trial_id, "durable-1");
		assert.equal(second.updated_ratings.length, 1);

		// And the rating itself is on disk for the next process.
		const { openEloDatabase, readRatingRows, readComparisonRows } = await import(
			"../../S4-5p-aletheia/modules/elo-persistence.ts"
		);
		const db = openEloDatabase(databasePath);
		const ratings = readRatingRows(db);
		const comparisons = readComparisonRows(db);
		db.close();
		assert.equal(ratings.length, 1);
		assert.equal(ratings[0].channel, "R_verifier");
		assert.ok(Number(ratings[0].effective_rating) < Number(ratings[0].rating), "sigma penalty applied");
		assert.equal(comparisons.length, 2, "the refusal is persisted as evidence too");
		assert.equal(comparisons[0].atropos_decision, "uncalibrated_refusal");
		assert.equal(comparisons[1].atropos_decision, "update_allowed");
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});
