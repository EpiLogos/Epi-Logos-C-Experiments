/**
 * resonance72-retrieval.ts — the 72-fold address conditions gnosis-RAG (12.T12.13 clause c).
 *
 * ## The gap this closes
 *
 * Tranche 12.13 asks for `MathemeHarmonicProfile.resonance72` to be "consumed
 * by Aletheia gnosis-RAG via Pi". The runtime audit found the producer real and
 * the consumer absent: `resonance72` is derived kernel-side
 * (`portal-core/src/kernel/projections/resonance72.rs`) and served on the live
 * profile, S4's Anima emitter carries a `resonance72Index` on `portal.vak_eval`,
 * and the S5 autoresearch EBM reads the profile — but the gnosis-RAG path did
 * not. Both retrieval entry points spawned `query-gnostic <question> --mode
 * hybrid` with no channel for a harmonic address at all, so the value never
 * crossed the seam this tranche audits. This module is that channel.
 *
 * ## Why a question clause, and not a new parameter
 *
 * `aletheia_gnosis_query` already conditions retrieval by folding context into
 * the question text — `[coordinate context: M3]`. Retrieval is hybrid (vector +
 * graph + RRF fusion) over natural-language chunks, so a conditioning term has
 * to reach the embedding to affect ranking at all; a side-channel parameter the
 * retriever never reads would be decoration. This follows the idiom that is
 * already there rather than minting a second one.
 *
 * ## Nothing is invented
 *
 * The 72-fold address is a kernel derivation, never a guess. A profile that
 * cannot be read, or whose projection falls outside its own domain, yields
 * `null` and the question goes out UNCONDITIONED — the same discipline
 * `vak-eval-emit.ts` applies to `mef_lens` and `elo-trial-hook.ts` to its
 * matchup key. A fabricated resonance index would not merely mislabel the
 * retrieval, it would bias the ranking toward a harmonic position the system
 * was never in.
 *
 * Canon: [[S4-5'-SPEC]] -> Aletheia world-return; `M1'-SPEC` §resonance-72.
 */

/** The kernel's 72-fold projection, as served on the live profile. */
export interface Resonance72Projection {
	/** Kernel resonance address (`kernel_resonance_index`), 0..71. */
	readonly legacyResonanceIndex: number;
	/** `tick12 * 6 + position`, 0..71. */
	readonly lensAnchorIndex: number;
	/** Base lens, 0..11. */
	readonly baseLens: number;
	/** Helix bit (`tick12 / 6`), 0 or 1. */
	readonly helixBit: number;
	/** Lens anchor (`tick12`), 0..11. */
	readonly lensAnchor: number;
	/** QL position, 0..5. */
	readonly position: number;
}

function wholeNumberWithin(value: unknown, max: number): number | null {
	if (typeof value !== "number" || !Number.isInteger(value)) return null;
	if (value < 0 || value > max) return null;
	return value;
}

/**
 * Read the `resonance72` projection off an `epi profile show` payload.
 *
 * Accepts either the CLI envelope (`{ profile: { resonance72 } }`) or a bare
 * profile (`{ resonance72 }`). Returns `null` — never a partial or defaulted
 * projection — when the field is missing or any index leaves its own domain,
 * because an out-of-domain address is corruption, not a usable reading.
 */
export function parseResonance72(payload: unknown): Resonance72Projection | null {
	if (typeof payload !== "object" || payload === null) return null;
	const root = payload as Record<string, unknown>;

	const profile =
		typeof root.profile === "object" && root.profile !== null
			? (root.profile as Record<string, unknown>)
			: root;
	const raw = profile.resonance72;
	if (typeof raw !== "object" || raw === null) return null;
	const fields = raw as Record<string, unknown>;

	const legacyResonanceIndex = wholeNumberWithin(fields.legacyResonanceIndex, 71);
	const lensAnchorIndex = wholeNumberWithin(fields.lensAnchorIndex, 71);
	const baseLens = wholeNumberWithin(fields.baseLens, 11);
	const helixBit = wholeNumberWithin(fields.helixBit, 1);
	const lensAnchor = wholeNumberWithin(fields.lensAnchor, 11);
	const position = wholeNumberWithin(fields.position, 5);

	if (
		legacyResonanceIndex === null ||
		lensAnchorIndex === null ||
		baseLens === null ||
		helixBit === null ||
		lensAnchor === null ||
		position === null
	) {
		return null;
	}

	// The kernel derives `lensAnchorIndex` as `tick12 * 6 + position`. A payload
	// that disagrees with its own components is not a reading of anything.
	if (lensAnchor * 6 + position !== lensAnchorIndex) return null;

	return {
		legacyResonanceIndex,
		lensAnchorIndex,
		baseLens,
		helixBit,
		lensAnchor,
		position,
	};
}

/**
 * Render the projection as the retrieval conditioning clause.
 *
 * Names the 72-fold address and the components that locate it, so the term
 * carries the harmonic position into the embedding rather than an opaque digit.
 */
export function renderResonance72Clause(projection: Resonance72Projection): string {
	return (
		`[resonance72: anchor ${projection.lensAnchorIndex}/72, ` +
		`kernel index ${projection.legacyResonanceIndex}, ` +
		`lens ${projection.baseLens}, helix ${projection.helixBit}, ` +
		`position ${projection.position}]`
	);
}

/**
 * Condition a retrieval question on the live 72-fold address.
 *
 * A `null` projection returns the question EXACTLY as given — an unconditioned
 * retrieval is honest; a retrieval conditioned on an invented address is not.
 */
export function conditionQuestionOnResonance72(
	question: string,
	projection: Resonance72Projection | null,
): string {
	if (projection === null) return question;
	return `${question} ${renderResonance72Clause(projection)}`;
}
