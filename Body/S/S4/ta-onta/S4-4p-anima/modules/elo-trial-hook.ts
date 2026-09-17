/**
 * elo-trial-hook.ts — a completed run becomes a Mercurius trial (50.T50.12).
 *
 * The ELO system was landed and unreachable: `mercurius_update_elo` had no
 * production caller at all, only tests. This is the caller.
 *
 * ## Why it lives in Anima
 *
 * Aletheia's CONTRACT is explicit — "Aletheia is emergent, invoked by Psyche and
 * Sophia, never directly routed", "all invocation routes through Anima dispatch",
 * and what Aletheia does NOT own is "agent dispatch routing (Anima)". So the
 * hook belongs on the Anima side, calling INTO Aletheia's modules. The ELO
 * modules must never reach back into the executor, and they don't.
 *
 * It calls the module functions directly rather than registering a tool: an
 * `aletheia-mode-internal` tool additionally requires an `aletheia.mode.active`
 * session state at dispatch time, which a background completion hook has no
 * business asserting.
 *
 * ## The tuple is derived where it can be, and REFUSED where it cannot
 *
 * The tranche brief says the `EloContextTuple` "derives mechanically from the
 * trace". Two of its six fields do:
 *
 *   - `vak_cp_position`  <- `VakAddress.cp`
 *   - `cfp_thread_type`  <- `VakAddress.cfp`
 *
 * The other four have no producer anywhere in the repo. `mef_lens` has no field
 * on any VAK structure; `content_class` is a scalar with no projection from the
 * `ct` ARRAY (and the ELO fixture's own `"implementation"` is not even in the CT
 * vocabulary); `kairos_window` has no timestamp to bucket, and Chronos'
 * `mercurius_kairos_snapshot` speaks a different vocabulary entirely;
 * `r_factor_slot` lives Rust-side in `portal-core/src/rfactor.rs` with no reader
 * on this path. The identity half is the same story — `agent` is on the step,
 * but `model` / `harness` / `skill` are absent (`mercurius_query_ratings` already
 * fakes them with the literal `"config-unresolved"`, which is that module
 * admitting the gap).
 *
 * So this hook DECLARES the gap instead of closing it with invention. The four
 * context fields and the three identity fields are supplied by the caller —
 * exactly the 2-derived / 4-supplied split `modules/dispatch-policy.ts:854`
 * already uses — and a missing one is REFUSED by name. Guessing a `content_class`
 * or bucketing an arbitrary `kairos_window` would fabricate a coordinate, and a
 * fabricated coordinate poisons the very matchup key the ELO engine treats as
 * ground truth: Moirai would call two runs comparable on a field neither of them
 * actually had.
 *
 * Canon: [[S4-SPEC]] -> Anima orchestration; Aletheia CONTRACT invariants 1-2.
 */

import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

import type { VakAddress } from "../../shared/vak_address.ts";
import type { EloContextTuple } from "../../S4-5p-aletheia/modules/anansi-elo-index.ts";
import {
	mercurius_record_trial,
	mercurius_update_elo,
	type AletheiaEloConfig,
	type MercuriusEloStore,
	type MercuriusTrialOutcomes,
	type MercuriusUpdateResult,
} from "../../S4-5p-aletheia/modules/mercurius-elo.ts";

/** The context fields a run cannot derive. Declared, never guessed. */
export const UNDERIVABLE_CONTEXT_FIELDS = [
	"mef_lens",
	"content_class",
	"kairos_window",
	"r_factor_slot",
] as const;

/** The identity fields a run cannot derive. `agent` comes from the step. */
export const UNDERIVABLE_IDENTITY_FIELDS = ["model", "harness", "skill"] as const;

/** What the caller must state because the trace cannot. */
export interface EloRunDeclaration {
	readonly mef_lens?: string;
	readonly content_class?: string;
	readonly kairos_window?: string;
	readonly r_factor_slot?: string;
	readonly model?: string;
	readonly harness?: string;
	readonly skill?: string;
}

/** Raised when a run is asked to become a trial it cannot honestly describe. */
export class EloDeclarationError extends Error {
	readonly missing: string[];

	constructor(missing: string[]) {
		super(
			`cannot log a Mercurius trial: ${missing.join(", ")} ${missing.length === 1 ? "has" : "have"} ` +
				`no source in the run and ${missing.length === 1 ? "was" : "were"} not declared. ` +
				`These are matchup-key fields — guessing one would make two runs compare as ` +
				`equivalent on a coordinate neither of them carried.`,
		);
		this.name = "EloDeclarationError";
		this.missing = missing;
	}
}

function present(value: string | undefined): value is string {
	return typeof value === "string" && value.trim().length > 0;
}

/**
 * Build the ELO context tuple for a completed run.
 *
 * Derives what the VAK address carries; refuses, by name, what it does not.
 */
export function eloContextForRun(input: {
	address: VakAddress;
	declaration: EloRunDeclaration;
}): EloContextTuple {
	const missing = UNDERIVABLE_CONTEXT_FIELDS.filter(
		(field) => !present(input.declaration[field]),
	);
	if (missing.length > 0) throw new EloDeclarationError([...missing]);

	return {
		// Derived from the address — the two the trace genuinely carries.
		vak_cp_position: input.address.cp,
		cfp_thread_type: input.address.cfp,
		// Declared — no producer exists for these.
		mef_lens: input.declaration.mef_lens as string,
		content_class: input.declaration.content_class as string,
		kairos_window: input.declaration.kairos_window as string,
		r_factor_slot: input.declaration.r_factor_slot as string,
	};
}

/** The identity half, same discipline. */
export function eloIdentityForRun(input: {
	agent: string;
	declaration: EloRunDeclaration;
}): { agent: string; model: string; harness: string; skill: string } {
	const missing: string[] = [];
	if (!present(input.agent)) missing.push("agent");
	for (const field of UNDERIVABLE_IDENTITY_FIELDS) {
		if (!present(input.declaration[field])) missing.push(field);
	}
	if (missing.length > 0) throw new EloDeclarationError(missing);
	return {
		agent: input.agent,
		model: input.declaration.model as string,
		harness: input.declaration.harness as string,
		skill: input.declaration.skill as string,
	};
}

/** What a completed run offers the ELO engine. */
export interface RunCompletionTrial {
	/** Stable id for this run's trial. The caller owns run identity. */
	readonly trialId: string;
	/** The run's own VAK address — the two derivable coordinates come from here. */
	readonly address: VakAddress;
	/** The agent that held the run. */
	readonly agent: string;
	readonly declaration: EloRunDeclaration;
	readonly outcomes: MercuriusTrialOutcomes;
	/** `"agent"` for an ordinary run; `"canon"` when the run is a canon trial. */
	readonly tournament?: "agent" | "canon";
	/** ISO-8601, caller-supplied so this stays deterministic under test. */
	readonly completedAt?: string;
}

/**
 * Log a completed run as a trial and put it through the guardian split.
 *
 * The guardians are not re-implemented here: `mercurius_update_elo` composes
 * Moirai's fair-comparison decision and Janus' threshold decision, and Anansi
 * indexes the result. Per DR-M5-1 the guardians disclose angles and never
 * conclude — so this hook hands the run over and returns what they decided,
 * including a REFUSAL, rather than interpreting it.
 *
 * An uncalibrated refusal is a normal outcome, not an error: the first run of a
 * new matchup has nothing fair to compare against, and saying so is the honest
 * answer. The trial is still logged, so the second run has a history.
 */
export function recordRunCompletionTrial(input: {
	trial: RunCompletionTrial;
	store: MercuriusEloStore;
	config: AletheiaEloConfig;
}): MercuriusUpdateResult {
	const { trial, store, config } = input;
	const context_tuple = eloContextForRun({
		address: trial.address,
		declaration: trial.declaration,
	});
	const identity = eloIdentityForRun({ agent: trial.agent, declaration: trial.declaration });

	mercurius_record_trial({
		trial_id: trial.trialId,
		dispatch: { ...identity, context_tuple, tournament: trial.tournament ?? "agent" },
		outcomes: trial.outcomes,
		...(trial.completedAt === undefined ? {} : { completed_at: trial.completedAt }),
		store,
	});

	return mercurius_update_elo({ trial_id: trial.trialId, store, config });
}

/**
 * The durable form: hydrate from SQL, log the trial, write everything back.
 *
 * This is what makes ELO mean anything across runs. In-memory, a store is empty
 * on every process start, so Moirai would find nothing comparable and refuse
 * every first update forever — the engine would look like it worked while never
 * once updating a rating.
 *
 * The comparison decision is persisted alongside, refusal included: a run that
 * had nothing fair to compare against is a fact an audit needs, and keeping only
 * the accepted updates would make the history read as better-calibrated than it
 * was.
 */
export async function recordDurableRunTrial(input: {
	trial: RunCompletionTrial;
	config: AletheiaEloConfig;
	/** Defaults to `eloDatabasePath()` — `.epi/elo/`, runtime state, not canon. */
	databasePath?: string;
	/** ISO-8601 for the comparison row; caller-supplied to stay deterministic. */
	computedAt: string;
}): Promise<MercuriusUpdateResult> {
	const { eloDatabasePath, loadEloStore, openEloDatabase, persistEloStoreWithConfig, recordComparison } =
		await import("../../S4-5p-aletheia/modules/elo-persistence.ts");

	const path = input.databasePath ?? eloDatabasePath();
	mkdirSync(dirname(path), { recursive: true });
	const db = openEloDatabase(path);
	try {
		const store = loadEloStore({ db, config: input.config });
		const result = recordRunCompletionTrial({ trial: input.trial, store, config: input.config });
		persistEloStoreWithConfig({ db, store, config: input.config });
		recordComparison({ db, comparison: result.comparison, computed_at: input.computedAt });
		return result;
	} finally {
		db.close();
	}
}
