/**
 * elo-persistence.ts — the ELO runtime stops dying with the process (50.T50.12).
 *
 * `Body/S/S3/spacetime-context/schemas/elo-runtime.sql` declared four tables that
 * nothing had ever created: no `.ts` and no `.rs` referenced them, no runner
 * applied the DDL, and `MercuriusEloStore` was a `Map`. So the ELO system's own
 * premise — that a second comparable run refines a rating — could only hold
 * inside a single process. This module is the missing half.
 *
 * ## The DDL is not copied here
 *
 * `openEloDatabase` READS `elo-runtime.sql` and executes it. S3 owns the
 * persistence shape (`spacetime-context/AGENTS.md`: "Keep schema files
 * declarative... Schema consumers must provide their own migration/application
 * checks") and this is that consumer-side check. A hand-copied `CREATE TABLE`
 * would be a second declaration of one shape, free to drift from the first.
 *
 * ## Engine
 *
 * `node:sqlite`, built into Node — no new dependency, and SQLite's type affinity
 * accepts the schema's `TIMESTAMPTZ` / `BIGINT` / `DOUBLE PRECISION` / `BOOLEAN`
 * names verbatim, so the same DDL text serves both. The schema is named for
 * SpacetimeDB; when that runtime lands, the DDL it applies is this same file.
 *
 * ## What is NOT here
 *
 * No thresholds, no seed ratings, no hyperparameters — those live in
 * `~/.epi-logos/config.toml` and reach this module only as an
 * `AletheiaEloConfig` passed in (`mercurius-elo.ts:3-5`, restated in
 * `spacetime-context/AGENTS.md`). This module moves records; it never decides.
 *
 * Canon: [[S4-SPEC]] -> Aletheia; S3 `spacetime-context` owns the schema.
 */

import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
	anansi_context_key,
	anansi_identity_key,
	anansi_index_rating,
	anansi_rating_record_key,
	create_anansi_rating_index,
	type EloChannel,
	type EloContextTuple,
	type EloRatingRecord,
} from "./anansi-elo-index.ts";
import {
	create_mercurius_elo_store,
	effective_rating,
	type AletheiaEloConfig,
	type MercuriusEloStore,
	type MercuriusTrialRecord,
} from "./mercurius-elo.ts";
import type { MoiraiComparisonDecision } from "./moirai-fair-comparison.ts";

/**
 * ta-onta/S4-5p-aletheia/modules -> repo root is six levels up.
 *
 * `import.meta.dirname`, not `new URL(import.meta.url).pathname`: the repo path
 * contains spaces, and the URL form percent-encodes them into a path that does
 * not exist on disk.
 */
const REPO_ROOT = join(import.meta.dirname, "..", "..", "..", "..", "..", "..");

/** The ONE schema. Read at runtime; never restated in this file. */
export const ELO_SCHEMA_PATH = join(
	REPO_ROOT,
	"Body",
	"S",
	"S3",
	"spacetime-context",
	"schemas",
	"elo-runtime.sql",
);

/**
 * The channel columns `mercurius_trial_log` flattens the outcomes into.
 *
 * Column-keyed and insertion-ordered to match the schema, so both the write
 * (which spreads the values) and the read (which reconstitutes the channels)
 * derive from this one statement of the flattening.
 */
const CHANNEL_BY_COLUMN = Object.freeze({
	verifier_score: "R_verifier",
	lens_score: "R_lens",
	user_score: "R_user",
}) as Readonly<Record<"verifier_score" | "lens_score" | "user_score", EloChannel>>;

/** The six context columns, flattened out of `EloContextTuple`, in schema order. */
const CONTEXT_COLUMNS: ReadonlyArray<keyof EloContextTuple> = Object.freeze([
	"vak_cp_position",
	"mef_lens",
	"content_class",
	"kairos_window",
	"cfp_thread_type",
	"r_factor_slot",
]);

/**
 * Open (creating if needed) the ELO database, applying the real schema.
 *
 * Idempotent: a database that already carries the tables is opened unchanged.
 * A runner that only works against a fresh file is not a migration, and the
 * whole point here is the SECOND process.
 */
export function openEloDatabase(path: string): DatabaseSync {
	const db = new DatabaseSync(path);
	db.exec("PRAGMA foreign_keys = ON");
	const applied = db
		.prepare("SELECT COUNT(*) AS n FROM sqlite_master WHERE type = 'table' AND name = ?")
		.get("mercurius_elo_ratings") as { n: number };
	if (applied.n === 0) {
		db.exec(readFileSync(ELO_SCHEMA_PATH, "utf8"));
	}
	return db;
}

/** `rating_id` is the record's identity, so a re-persist upserts rather than grows. */
function ratingId(record: EloRatingRecord): string {
	return anansi_rating_record_key(record);
}

function contextValues(tuple: EloContextTuple): string[] {
	return CONTEXT_COLUMNS.map((column) => tuple[column]);
}

function tupleFromRow(row: Record<string, unknown>): EloContextTuple {
	return Object.fromEntries(
		CONTEXT_COLUMNS.map((column) => [column, String(row[column])]),
	) as unknown as EloContextTuple;
}

/**
 * Write a whole store: every trial and every rating.
 *
 * `INSERT ... ON CONFLICT DO UPDATE` throughout — the trial log is append-only
 * by meaning (a re-persist of the same trial is the same trial, not a second
 * one) and a rating is current-value by meaning (one row per identity × context
 * × channel, updated in place).
 *
 * Wrapped in a transaction: a half-written store would give the next process a
 * rating whose trial has no record, which reads as calibrated when it is not.
 */
export function persistEloStore(input: { db: DatabaseSync; store: MercuriusEloStore }): void {
	const { db, store } = input;
	db.exec("BEGIN");
	try {
		for (const trial of store.trial_log.values()) persistTrial(db, trial);
		for (const rating of store.ratings.values()) persistRating(db, rating);
		db.exec("COMMIT");
	} catch (err) {
		db.exec("ROLLBACK");
		throw err;
	}
}

function persistTrial(db: DatabaseSync, trial: MercuriusTrialRecord): void {
	const channels = trial.outcomes.channels;
	db.prepare(
		`INSERT INTO mercurius_trial_log (
			trial_id, tournament, trial_class, agent, model, harness, skill,
			vak_cp_position, mef_lens, content_class, kairos_window, cfp_thread_type, r_factor_slot,
			verifier_score, lens_score, user_score, recorded_at, completed_at
		) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
		ON CONFLICT(trial_id) DO UPDATE SET
			tournament = excluded.tournament,
			trial_class = excluded.trial_class,
			verifier_score = excluded.verifier_score,
			lens_score = excluded.lens_score,
			user_score = excluded.user_score,
			completed_at = excluded.completed_at`,
	).run(
		trial.trial_id,
		trial.dispatch.tournament,
		trial.trial_class,
		trial.dispatch.agent,
		trial.dispatch.model,
		trial.dispatch.harness,
		trial.dispatch.skill,
		...contextValues(trial.dispatch.context_tuple),
		// Ordered by CHANNEL_COLUMN so the column list above and these values
		// cannot drift apart: the map is the single statement of the flattening.
		...(Object.keys(CHANNEL_BY_COLUMN) as Array<keyof typeof CHANNEL_BY_COLUMN>).map(
			(column) => channels[CHANNEL_BY_COLUMN[column]]?.score ?? null,
		),
		// `recorded_at` is when this row was written; `completed_at` is when the
		// run it describes finished. They are different facts.
		new Date().toISOString(),
		trial.completed_at ?? null,
	);
}

function persistRating(db: DatabaseSync, rating: EloRatingRecord): void {
	const id = ratingId(rating);
	db.prepare(
		`INSERT INTO mercurius_elo_ratings (
			rating_id, agent, model, harness, skill, channel,
			vak_cp_position, mef_lens, content_class, kairos_window, cfp_thread_type, r_factor_slot,
			rating, sigma, trial_count, effective_rating, source_trial_id, updated_at
		) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
		ON CONFLICT(rating_id) DO UPDATE SET
			rating = excluded.rating,
			sigma = excluded.sigma,
			trial_count = excluded.trial_count,
			effective_rating = excluded.effective_rating,
			source_trial_id = excluded.source_trial_id,
			updated_at = excluded.updated_at`,
	).run(
		id,
		rating.agent,
		rating.model,
		rating.harness,
		rating.skill,
		rating.channel,
		...contextValues(rating.context_tuple),
		rating.rating,
		rating.sigma,
		rating.trial_count,
		// The schema stores `effective_rating`; TS computes it. Storing the value
		// the config in force produced keeps a reader from having to guess which
		// alpha was applied.
		null,
		rating.source_trial_id ?? null,
		rating.updated_at ?? new Date().toISOString(),
	);

	db.prepare(
		`INSERT INTO anansi_rating_index (
			context_key, identity_key, channel, rating_id,
			vak_cp_position, mef_lens, content_class, kairos_window, cfp_thread_type, r_factor_slot,
			indexed_at
		) VALUES (?,?,?,?,?,?,?,?,?,?,?)
		ON CONFLICT(context_key, identity_key, channel) DO UPDATE SET
			rating_id = excluded.rating_id,
			indexed_at = excluded.indexed_at`,
	).run(
		anansi_context_key(rating.context_tuple),
		anansi_identity_key(rating),
		rating.channel,
		id,
		...contextValues(rating.context_tuple),
		new Date().toISOString(),
	);
}

/**
 * Persist a rating with its `effective_rating` computed under a given config.
 *
 * Separate from `persistRating` because it needs the config, and this module's
 * rule is that config reaches it only as a parameter — never read here.
 */
export function persistEloStoreWithConfig(input: {
	db: DatabaseSync;
	store: MercuriusEloStore;
	config: AletheiaEloConfig;
}): void {
	persistEloStore(input);
	for (const rating of input.store.ratings.values()) {
		input.db
			.prepare("UPDATE mercurius_elo_ratings SET effective_rating = ? WHERE rating_id = ?")
			.run(effective_rating(rating, input.config), ratingId(rating));
	}
}

/**
 * Record a Moirai comparison decision.
 *
 * The decision is evidence in its own right, not merely a step toward a rating:
 * a REFUSED update is the system saying it had nothing fair to compare against,
 * and that is the fact a later audit needs. Persisting only accepted updates
 * would make the history look better-calibrated than it was.
 */
export function recordComparison(input: {
	db: DatabaseSync;
	comparison: MoiraiComparisonDecision;
	computed_at: string;
	comparison_id?: string;
}): void {
	const { db, comparison } = input;
	db.prepare(
		`INSERT INTO moirai_comparison_cache (
			comparison_id, trial_id, comparable_trial_id, similarity_score,
			comparable, atropos_decision, reason, computed_at
		) VALUES (?,?,?,?,?,?,?,?)
		ON CONFLICT(comparison_id) DO UPDATE SET
			comparable_trial_id = excluded.comparable_trial_id,
			similarity_score = excluded.similarity_score,
			comparable = excluded.comparable,
			atropos_decision = excluded.atropos_decision,
			reason = excluded.reason,
			computed_at = excluded.computed_at`,
	).run(
		input.comparison_id ?? `${comparison.trial_id}:${input.computed_at}`,
		comparison.trial_id,
		comparison.lachesis_best_match?.trial_id ?? null,
		comparison.lachesis_similarity?.score ?? null,
		comparison.comparable ? 1 : 0,
		comparison.atropos_decision,
		comparison.reason ?? null,
		input.computed_at,
	);
}

/**
 * Rebuild an in-memory store from SQL.
 *
 * The Anansi index is REDERIVED from the loaded ratings rather than read out of
 * `anansi_rating_index`: the index is a projection of the ratings, and loading
 * it independently would let a stale index outlive the rows it points at. The
 * table stays populated as the queryable projection SpacetimeDB will serve.
 */
export function loadEloStore(input: {
	db: DatabaseSync;
	config: AletheiaEloConfig;
}): MercuriusEloStore {
	const store = create_mercurius_elo_store();

	for (const raw of readTrialRows(input.db)) {
		const row = raw as unknown as Record<string, unknown>;
		const channels: MercuriusTrialRecord["outcomes"]["channels"] = {};
		for (const [column, channel] of Object.entries(CHANNEL_BY_COLUMN)) {
			const score = row[column];
			if (score !== null && score !== undefined) channels[channel] = { score: Number(score) };
		}
		const trial: MercuriusTrialRecord = {
			guardian: "mercurius",
			trial_id: String(row.trial_id),
			trial_class: String(row.trial_class),
			dispatch: {
				agent: String(row.agent),
				model: String(row.model),
				harness: String(row.harness),
				skill: String(row.skill),
				context_tuple: tupleFromRow(row),
				tournament: String(row.tournament) === "canon" ? "canon" : "agent",
			},
			outcomes: { channels },
			...(row.completed_at === null || row.completed_at === undefined
				? {}
				: { completed_at: String(row.completed_at) }),
		};
		store.trial_log.set(trial.trial_id, trial);
	}

	store.index = create_anansi_rating_index();
	for (const raw of readRatingRows(input.db)) {
		const row = raw as unknown as Record<string, unknown>;
		const record: EloRatingRecord = {
			agent: String(row.agent),
			model: String(row.model),
			harness: String(row.harness),
			skill: String(row.skill),
			channel: String(row.channel) as EloChannel,
			context_tuple: tupleFromRow(row),
			rating: Number(row.rating),
			sigma: Number(row.sigma),
			trial_count: Number(row.trial_count),
			...(row.updated_at === null || row.updated_at === undefined
				? {}
				: { updated_at: String(row.updated_at) }),
			...(row.source_trial_id === null || row.source_trial_id === undefined
				? {}
				: { source_trial_id: String(row.source_trial_id) }),
		};
		store.ratings.set(anansi_rating_record_key(record), record);
		anansi_index_rating({ rating_record: record, index: store.index });
	}

	return store;
}

// ── readers, for tests and for audit ──────────────────────────────────────

export function readTrialRows(db: DatabaseSync): Record<string, unknown>[] {
	return db
		.prepare("SELECT * FROM mercurius_trial_log ORDER BY trial_id")
		.all() as unknown as Record<string, unknown>[];
}

export function readRatingRows(db: DatabaseSync): Record<string, unknown>[] {
	return db
		.prepare("SELECT * FROM mercurius_elo_ratings ORDER BY rating_id")
		.all() as unknown as Record<string, unknown>[];
}

export function readComparisonRows(db: DatabaseSync): Record<string, unknown>[] {
	return db
		.prepare("SELECT * FROM moirai_comparison_cache ORDER BY computed_at")
		.all() as unknown as Record<string, unknown>[];
}

export function readIndexRows(db: DatabaseSync): Record<string, unknown>[] {
	return db
		.prepare("SELECT * FROM anansi_rating_index ORDER BY context_key, identity_key, channel")
		.all() as unknown as Record<string, unknown>[];
}

/** Where the ELO database lives. `.epi/` is runtime state, never the vault. */
export function eloDatabasePath(): string {
	if (process.env.EPI_ELO_DB) return process.env.EPI_ELO_DB;
	return join(process.env.EPI_REPO_ROOT || process.cwd(), ".epi", "elo", "elo-runtime.sqlite");
}
