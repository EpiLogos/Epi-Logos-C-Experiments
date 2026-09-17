/**
 * elo-trial-live.mjs — LIVE proof for 50.T50.12 (not part of the shared gate).
 *
 * The tranche's claim: "completing an orchestration logs a trial; a second
 * comparable run updates ELO; the fair-comparison and Janus gates are honored."
 * This proves exactly that, with REAL child pi processes and a REAL SQLite
 * database created from the REAL `elo-runtime.sql`:
 *
 *   1. a score is persisted, then RE-RUN through `rerunScore` with real child
 *      pi's doing the work — the production seam, not a stub;
 *   2. that completion logs a Mercurius trial, and the FIRST one is refused by
 *      Moirai (nothing fair to compare against) — the honest answer;
 *   3. a second comparable re-run updates the rating, with Janus ruling on the
 *      delta;
 *   4. every row lands in the four tables the S3 schema declares, in a database
 *      that did not exist before this run;
 *   5. a run at a different coordinate is NOT comparable — the matchup key is
 *      load-bearing, not decorative;
 *   6. a run that cannot honestly describe itself is REFUSED by name rather
 *      than logged with a guessed coordinate.
 *
 * Deliberately NOT `*.test.ts`: it makes live model calls.
 *
 * Usage: node Body/S/S4/ta-onta/S4-4p-anima/tests/elo-trial-live.mjs
 */

import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { persistScore, rerunScore } from "../extension/dispatch.ts";
import { runOrchestration, defineOrchestration } from "../lib/vak-orchestration-surface.ts";
import { dispatchChildPi } from "../lib/child-pi-executor.ts";
import { EloDeclarationError, recordDurableRunTrial } from "../modules/elo-trial-hook.ts";
import { parseAletheiaConfigToml } from "../../S4-5p-aletheia/modules/mercurius-elo.ts";
import {
	openEloDatabase,
	readComparisonRows,
	readIndexRows,
	readRatingRows,
	readTrialRows,
} from "../../S4-5p-aletheia/modules/elo-persistence.ts";

const MODEL = process.env.LIVE_MODEL || "google/gemini-3.1-flash-lite";

const failures = [];
function check(label, condition, detail = "") {
	if (condition) console.log(`  PASS  ${label}`);
	else {
		console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ""}`);
		failures.push(label);
	}
}

function assistantText(stdout) {
	const chunks = [];
	for (const line of stdout.split("\n")) {
		if (!line.trim()) continue;
		try {
			const event = JSON.parse(line);
			if (event.type === "message_update" && event.assistantMessageEvent?.type === "text_delta") {
				chunks.push(event.assistantMessageEvent.delta || "");
			}
		} catch {
			/* not a frame */
		}
	}
	return chunks.join("");
}

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

const ADDRESS = {
	cpf: "(4.0/1-4.4/5)",
	ct: ["CT2"],
	cp: "CP4.2",
	cf: "(0/1)",
	cfp: "CFP2",
	cs: { code: "CS2", direction: "Day" },
};

const DECLARATION = {
	mef_lens: "L5",
	content_class: "implementation",
	kairos_window: "day",
	r_factor_slot: "R0",
	model: MODEL,
	harness: "pi",
	skill: "anima-orchestration",
};

const work = mkdtempSync(join(tmpdir(), "elo-trial-live-"));
const scores = join(work, "scores");
const databasePath = join(work, "elo", "elo-runtime.sqlite");
process.env.EPI_SCORES_DIR = scores;
writeFileSync(join(work, "alpha.txt"), "13\n", "utf8");

console.log(`\nMercurius ELO trial on run completion — live (model=${MODEL})`);
console.log(`workdir: ${work}\n`);

let dispatched = 0;

/** The orchestration a re-run actually executes, with a real child pi per step. */
async function runIt(orchestration) {
	return runOrchestration(orchestration, {
		execute: async (step) => {
			const run = await dispatchChildPi({
				seam: "agent-team",
				agentName: step.agent ?? "logos",
				task: step.task,
				systemPrompt: `You are ${step.agent ?? "logos"}. Answer with the integer only.`,
				model: MODEL,
				toolUniverse: ["read"],
				cwd: work,
				vakAddress: step.address,
			});
			dispatched += 1;
			return (assistantText(run.stdout) || run.output).trim();
		},
	});
}

try {
	// ── 1. a real score, re-run through the production seam ───────────────────
	console.log("─── 1. a persisted score, re-run with real child pi's ───");
	const orchestration = defineOrchestration({
		id: "elo-live",
		address: ADDRESS,
		steps: [{ id: "read-alpha", address: ADDRESS, task: "Read alpha.txt and reply with only the integer it contains.", agent: "logos" }],
	});
	const score = persistScore({
		scoreId: "elo-live",
		orchestration,
		originatedAt: "2026-07-27T09:00:00.000Z",
		task: "read the file",
	});
	check("the score persisted with a content hash", typeof score.hash === "string" && score.hash.length === 64, score.hash);

	const first = await rerunScore({
		scoreId: "elo-live",
		at: "2026-07-27T09:30:00.000Z",
		run: (o) => runIt(o),
		elo: { declaration: DECLARATION, outcomes: { channels: { R_verifier: { score: 1 } } }, config: CONFIG, databasePath },
	});
	check("the re-run executed a REAL child pi", dispatched === 1, `${dispatched}`);
	check("the child returned the real file contents", /13/.test(String(first.result?.[0]?.emission?.payload?.output ?? "")), JSON.stringify(first.result?.[0]?.emission?.payload?.output));

	// ── 2. the first trial is logged AND refused ──────────────────────────────
	console.log("\n─── 2. the first trial is logged, and honestly refused ───");
	check("run completion produced a trial", Boolean(first.trial), "no trial on the result");
	check("Moirai refused the first update", first.trial?.comparison?.comparable === false, JSON.stringify(first.trial?.comparison?.atropos_decision));
	check("the refusal is named uncalibrated, not an error", first.trial?.comparison?.atropos_decision === "uncalibrated_refusal");
	check("no rating was invented from one trial", (first.trial?.updated_ratings ?? []).length === 0);

	// ── 3. a second comparable run updates ELO ────────────────────────────────
	console.log("\n─── 3. a second comparable run updates the rating ───");
	const second = await rerunScore({
		scoreId: "elo-live",
		at: "2026-07-27T10:30:00.000Z",
		run: (o) => runIt(o),
		elo: { declaration: DECLARATION, outcomes: { channels: { R_verifier: { score: 1 } } }, config: CONFIG, databasePath },
	});
	check("the second re-run executed another REAL child pi", dispatched === 2, `${dispatched}`);
	check("Moirai found it comparable", second.trial?.comparison?.comparable === true, JSON.stringify(second.trial?.comparison?.reason));
	check("the match is the FIRST trial, loaded back out of SQL", Boolean(second.trial?.comparison?.lachesis_best_match?.trial_id), JSON.stringify(second.trial?.comparison?.lachesis_best_match?.trial_id));
	check("Janus ruled on the delta", (second.trial?.threshold_decisions ?? []).some((d) => d.guardian === "janus"), JSON.stringify(second.trial?.threshold_decisions));
	check("a rating was updated", (second.trial?.updated_ratings ?? []).length === 1, JSON.stringify((second.trial?.updated_ratings ?? []).length));

	// ── 4. the four tables the S3 schema declares ─────────────────────────────
	console.log("\n─── 4. it is all in the real schema's tables ───");
	const db = openEloDatabase(databasePath);
	const trials = readTrialRows(db);
	const ratings = readRatingRows(db);
	const comparisons = readComparisonRows(db);
	const index = readIndexRows(db);
	db.close();

	check("mercurius_trial_log carries both trials", trials.length === 2, `${trials.length}`);
	check("the trial log flattened the channel score", trials.every((t) => t.verifier_score === 1), JSON.stringify(trials.map((t) => t.verifier_score)));
	check("the six context columns are populated", trials.every((t) => t.vak_cp_position === "CP4.2" && t.cfp_thread_type === "CFP2" && t.r_factor_slot === "R0"), JSON.stringify(trials[0]));
	check("mercurius_elo_ratings carries one rating", ratings.length === 1, `${ratings.length}`);
	check("effective_rating was stored under the config in force", Number(ratings[0]?.effective_rating) < Number(ratings[0]?.rating), `${ratings[0]?.effective_rating} vs ${ratings[0]?.rating}`);
	check("anansi_rating_index projects it", index.length === 1 && String(index[0].context_key).startsWith("CP4.2|"), JSON.stringify(index[0]?.context_key));
	check("moirai_comparison_cache kept BOTH decisions, refusal included", comparisons.length === 2 && comparisons.some((c) => c.atropos_decision === "uncalibrated_refusal") && comparisons.some((c) => c.atropos_decision === "update_allowed"), JSON.stringify(comparisons.map((c) => c.atropos_decision)));

	// ── 5. a different coordinate is a different matchup ──────────────────────
	console.log("\n─── 5. the matchup key is load-bearing ───");
	const elsewhere = await recordDurableRunTrial({
		trial: {
			trialId: "elsewhere",
			address: { ...ADDRESS, cp: "CP4.5" },
			agent: "sophia",
			declaration: { ...DECLARATION, mef_lens: "L2", content_class: "review" },
			outcomes: { channels: { R_verifier: { score: 1 } } },
			completedAt: "2026-07-27T11:30:00.000Z",
		},
		config: CONFIG,
		databasePath,
		computedAt: "2026-07-27T11:30:01.000Z",
	});
	check("a run at other coordinates is NOT comparable", elsewhere.comparison.comparable === false, JSON.stringify(elsewhere.comparison.atropos_decision));
	check("so it updated nothing", elsewhere.updated_ratings.length === 0);

	// ── 6. a run that cannot describe itself is refused, not guessed ──────────
	console.log("\n─── 6. an underivable field is refused, never invented ───");
	let refusal = null;
	try {
		await recordDurableRunTrial({
			trial: {
				trialId: "undeclared",
				address: ADDRESS,
				agent: "logos",
				declaration: { ...DECLARATION, kairos_window: undefined },
				outcomes: { channels: { R_verifier: { score: 1 } } },
				completedAt: "2026-07-27T12:00:00.000Z",
			},
			config: CONFIG,
			databasePath,
			computedAt: "2026-07-27T12:00:01.000Z",
		});
	} catch (err) {
		refusal = err;
	}
	check("an undeclared matchup field is refused", refusal instanceof EloDeclarationError, String(refusal));
	check("the refusal names the field", (refusal?.missing ?? []).includes("kairos_window"), JSON.stringify(refusal?.missing));

	const after = openEloDatabase(databasePath);
	const finalTrials = readTrialRows(after);
	after.close();
	check("the refused run wrote NO trial row", finalTrials.length === 3, `${finalTrials.length} (2 comparable + 1 elsewhere, none for the refused run)`);
} finally {
	delete process.env.EPI_SCORES_DIR;
	rmSync(work, { recursive: true, force: true });
}

console.log(
	failures.length === 0
		? `\nLIVE PROOF PASS — ${dispatched} real child pi dispatches; run completion reaches ELO and the gates hold.\n`
		: `\n${failures.length} LIVE CHECK(S) FAILED:\n  - ${failures.join("\n  - ")}\n`,
);
process.exit(failures.length === 0 ? 0 : 1);
