/**
 * score-store.ts — persistence for orchestration SCORES (50.T50.07).
 *
 * ── What a score is ───────────────────────────────────────────────────────
 * Every Anima session starts in `(00/00)` — user as source, dialogical — and
 * that dialogue is where an orchestration script gets developed. One execution
 * of that script is a bounded song. When the expression turns out to be
 * REPEATABLE, it stops being a one-off and becomes a **score**: a reusable
 * orchestration program that can be re-run without re-originating the dialogue
 * that produced it. Runs accumulate against the score so ELO/ML can refine it
 * later (50.T50.12).
 *
 * ── Why it lives in Hen ───────────────────────────────────────────────────
 * A score is a persisted ARTIFACT with a content type, and artifacts are Hen's
 * coordinate (S4-1', CT Semantic Phase-Type). Anima composes and runs; Hen
 * stores and types. So this module deliberately knows NOTHING about VAK
 * addresses, orchestration steps, or dispatch: the program is stored verbatim
 * as opaque JSON and handed back unchanged. Anima owns what a program MEANS
 * (`S4-4p-anima/extension/dispatch.ts`), Hen owns that it is stored faithfully.
 * Keeping it opaque is also what stops this file from importing S4-4' — the
 * dependency runs one way, S4-4' → S4-1', never back.
 *
 * ── Where scores land ─────────────────────────────────────────────────────
 * `.epi/scores/` — the runtime state root (`.epi/gate`, `.epi/session.json`,
 * `.epi/agents/`), NOT the vault. A score is runtime machinery, not canon; per
 * Hen's own CONTRACT.md, canonical Form/Type/Seed authority lives in
 * `Idea/Bimba/**` and nothing here writes there.
 *
 * ── Faithfulness is enforced, not assumed ─────────────────────────────────
 * Re-running a score has to reproduce the run, so a score that changed under
 * you is worse than one that is missing. Every document carries a content hash
 * over its canonical form, and `loadScore` REFUSES a document whose hash does
 * not match rather than returning a program that silently drifted.
 *
 * Canon: [[S1-SPEC]] (Hen artifact authority) -> [[S4-SPEC]] (orchestration).
 */

import { createHash } from "node:crypto";
import {
	appendFileSync,
	existsSync,
	mkdirSync,
	readFileSync,
	readdirSync,
	writeFileSync,
} from "node:fs";
import { join } from "node:path";

/** Document schema tag. Bump when the envelope shape changes incompatibly. */
export const SCORE_SCHEMA = "epi.score.v1";

/** Provenance: where this score came from, and under which polarity. */
export interface ScoreProvenance {
	/**
	 * The CPF polarity the score was ORIGINATED under. A score is always born
	 * dialogical — `(00/00)`, user as source — because origination is dialogue.
	 * Re-runs are mechanistic and do not re-originate, so they never write here.
	 */
	readonly origination: string;
	/** ISO-8601 origination timestamp, supplied by the caller (keeps this pure). */
	readonly originatedAt?: string;
	/** Session the dialogue happened in. */
	readonly sessionId?: string;
	/** The task the dialogue was about — what this score is an expression OF. */
	readonly task?: string;
}

/** A persisted score. */
export interface ScoreDocument {
	readonly schema: typeof SCORE_SCHEMA;
	readonly id: string;
	readonly title?: string;
	readonly provenance: ScoreProvenance;
	/** The orchestration program, verbatim. Hen stores it; Hen never reads into it. */
	readonly program: unknown;
	/** SHA-256 over the canonical form of everything above. */
	readonly hash: string;
}

/** One recorded execution of a score. Appended, never rewritten. */
export interface ScoreRunRecord {
	readonly scoreId: string;
	/** The hash the score carried when this run executed. */
	readonly hash: string;
	/** ISO-8601, caller-supplied. */
	readonly at?: string;
	/** `(00/00)` for the originating run; mechanistic for a re-run. */
	readonly origination?: string;
	readonly outcome?: string;
	/** Free-form, for the ELO context tuple to read later (50.T50.12). */
	readonly detail?: Record<string, unknown>;
}

export class ScoreNotFound extends Error {
	readonly scoreId: string;

	constructor(scoreId: string) {
		super(`no score '${scoreId}' in ${scoresDir()}`);
		this.name = "ScoreNotFound";
		this.scoreId = scoreId;
	}
}

/** A stored score no longer matches its own hash — refuse it, do not run it. */
export class ScoreIntegrityError extends Error {
	readonly scoreId: string;

	constructor(scoreId: string, expected: string, actual: string) {
		super(
			`score '${scoreId}' failed its integrity check: recorded hash ${expected}, computed ${actual}. ` +
				`Re-running a drifted score would not reproduce the run it claims to be.`,
		);
		this.name = "ScoreIntegrityError";
		this.scoreId = scoreId;
	}
}

export class InvalidScoreId extends Error {
	constructor(scoreId: string) {
		super(`invalid score id '${scoreId}': ids are [A-Za-z0-9._-] and never path segments`);
		this.name = "InvalidScoreId";
	}
}

const SCORE_ID = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

/** Reject anything that could escape the store. */
export function assertScoreId(scoreId: string): void {
	if (typeof scoreId !== "string" || !SCORE_ID.test(scoreId) || scoreId.includes("..")) {
		throw new InvalidScoreId(String(scoreId));
	}
}

/** The score store root. `.epi/` is runtime state; the vault is not. */
export function scoresDir(): string {
	if (process.env.EPI_SCORES_DIR) return process.env.EPI_SCORES_DIR;
	return join(process.env.EPI_REPO_ROOT || process.cwd(), ".epi", "scores");
}

/**
 * Canonical JSON: object keys sorted, arrays left in order.
 *
 * The hash has to be stable across processes and key-insertion orders, so the
 * serialisation cannot be `JSON.stringify` of a freely-built object.
 */
export function canonicalize(value: unknown): string {
	if (value === null || typeof value !== "object") return JSON.stringify(value ?? null);
	if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;
	const entries = Object.entries(value as Record<string, unknown>)
		.filter(([, v]) => v !== undefined)
		.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
	return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonicalize(v)}`).join(",")}}`;
}

/** The content hash of a score, computed over everything except the hash itself. */
export function scoreHash(input: {
	id: string;
	title?: string;
	provenance: ScoreProvenance;
	program: unknown;
}): string {
	return createHash("sha256")
		.update(
			canonicalize({
				schema: SCORE_SCHEMA,
				id: input.id,
				title: input.title,
				provenance: input.provenance,
				program: input.program,
			}),
		)
		.digest("hex");
}

function scorePath(scoreId: string): string {
	assertScoreId(scoreId);
	return join(scoresDir(), `${scoreId}.json`);
}

function runsPath(scoreId: string): string {
	assertScoreId(scoreId);
	return join(scoresDir(), `${scoreId}.runs.jsonl`);
}

/**
 * Persist a score.
 *
 * Idempotent by content: saving the same program twice produces the same hash,
 * so "is this the score we already have?" is answerable without a diff.
 */
export function saveScore(input: {
	id: string;
	title?: string;
	provenance: ScoreProvenance;
	program: unknown;
}): ScoreDocument {
	assertScoreId(input.id);
	const document: ScoreDocument = {
		schema: SCORE_SCHEMA,
		id: input.id,
		...(input.title === undefined ? {} : { title: input.title }),
		provenance: input.provenance,
		program: input.program,
		hash: scoreHash(input),
	};
	mkdirSync(scoresDir(), { recursive: true });
	writeFileSync(scorePath(input.id), `${JSON.stringify(document, null, 2)}\n`, "utf8");
	return document;
}

/** Load a score, refusing one that no longer matches its own hash. */
export function loadScore(scoreId: string): ScoreDocument {
	const path = scorePath(scoreId);
	if (!existsSync(path)) throw new ScoreNotFound(scoreId);

	const document = JSON.parse(readFileSync(path, "utf8")) as ScoreDocument;
	if (document.schema !== SCORE_SCHEMA) {
		throw new ScoreIntegrityError(scoreId, SCORE_SCHEMA, String(document.schema));
	}
	const computed = scoreHash({
		id: document.id,
		title: document.title,
		provenance: document.provenance,
		program: document.program,
	});
	if (computed !== document.hash) {
		throw new ScoreIntegrityError(scoreId, document.hash, computed);
	}
	return document;
}

/** Does a score exist? Does not verify integrity — `loadScore` does that. */
export function hasScore(scoreId: string): boolean {
	return existsSync(scorePath(scoreId));
}

/** Every stored score id, sorted. */
export function listScores(): string[] {
	const dir = scoresDir();
	if (!existsSync(dir)) return [];
	// Run logs are `.runs.jsonl`, so the `.json` suffix already excludes them.
	return readdirSync(dir)
		.filter((name) => name.endsWith(".json"))
		.map((name) => name.slice(0, -".json".length))
		.sort();
}

/**
 * Append one run record.
 *
 * Append-only on purpose: the run history IS the evidence a score's quality
 * gets judged on, so a later run must never be able to overwrite an earlier one.
 */
export function recordScoreRun(record: ScoreRunRecord): ScoreRunRecord {
	assertScoreId(record.scoreId);
	mkdirSync(scoresDir(), { recursive: true });
	appendFileSync(runsPath(record.scoreId), `${JSON.stringify(record)}\n`, "utf8");
	return record;
}

/** Every recorded run of a score, oldest first. */
export function readScoreRuns(scoreId: string): ScoreRunRecord[] {
	const path = runsPath(scoreId);
	if (!existsSync(path)) return [];
	return readFileSync(path, "utf8")
		.split("\n")
		.filter((line) => line.trim().length > 0)
		.map((line) => JSON.parse(line) as ScoreRunRecord);
}
