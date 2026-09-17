import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import {
	parseResonance72,
	renderResonance72Clause,
	conditionQuestionOnResonance72,
} from "../modules/resonance72-retrieval.ts";

/**
 * 12.T12.13 clause (c): `MathemeHarmonicProfile.resonance72` consumed by
 * Aletheia gnosis-RAG via Pi. The runtime audit found the producer real and the
 * consumer missing entirely — these lock the consumer's contract.
 */

/** Shape as served by `epi profile show` (verified live against the CLI). */
function cliEnvelope(resonance72: Record<string, number>): unknown {
	return { cliVersion: "0.1.0", profile: { tick12: 0, resonance72 } };
}

const VALID = {
	legacyResonanceIndex: 34,
	lensAnchorIndex: 47,
	baseLens: 5,
	helixBit: 1,
	lensAnchor: 7,
	position: 5,
};

describe("resonance72 parsing off the live profile", () => {
	it("reads the projection out of the epi profile show envelope", () => {
		const parsed = parseResonance72(cliEnvelope(VALID));
		assert.notEqual(parsed, null);
		assert.equal(parsed?.lensAnchorIndex, 47);
		assert.equal(parsed?.legacyResonanceIndex, 34);
		assert.equal(parsed?.baseLens, 5);
		assert.equal(parsed?.helixBit, 1);
		assert.equal(parsed?.position, 5);
	});

	it("accepts a bare profile as well as the CLI envelope", () => {
		const parsed = parseResonance72({ resonance72: VALID });
		assert.equal(parsed?.lensAnchorIndex, 47);
	});

	it("reads the real zero-address without mistaking it for absence", () => {
		// tick12=0, position=0 is a legitimate address, and every field is 0.
		const parsed = parseResonance72(
			cliEnvelope({
				legacyResonanceIndex: 0,
				lensAnchorIndex: 0,
				baseLens: 0,
				helixBit: 0,
				lensAnchor: 0,
				position: 0,
			}),
		);
		assert.notEqual(parsed, null, "the 0/72 address is real, not missing");
		assert.equal(parsed?.lensAnchorIndex, 0);
	});
});

describe("resonance72 refuses rather than inventing", () => {
	it("returns null when the profile carries no projection", () => {
		assert.equal(parseResonance72({ profile: { tick12: 0 } }), null);
	});

	it("returns null for a non-object payload", () => {
		assert.equal(parseResonance72(null), null);
		assert.equal(parseResonance72("resonance"), null);
	});

	it("returns null when an index leaves the 72-fold domain", () => {
		const parsed = parseResonance72(
			cliEnvelope({ ...VALID, lensAnchorIndex: 72, lensAnchor: 12 }),
		);
		assert.equal(parsed, null, "72 is outside a 0..71 address space");
	});

	it("returns null when the payload disagrees with its own components", () => {
		// lensAnchorIndex must equal lensAnchor * 6 + position.
		const parsed = parseResonance72(cliEnvelope({ ...VALID, lensAnchorIndex: 46 }));
		assert.equal(parsed, null, "a self-inconsistent address is not a reading");
	});

	it("returns null on a fractional index", () => {
		assert.equal(parseResonance72(cliEnvelope({ ...VALID, position: 2.5 })), null);
	});
});

describe("the retrieval question carries the address", () => {
	it("appends the clause so the term reaches the embedding", () => {
		const parsed = parseResonance72(cliEnvelope(VALID));
		const conditioned = conditionQuestionOnResonance72("what is the torus", parsed);
		assert.match(conditioned, /^what is the torus /);
		assert.match(conditioned, /\[resonance72: anchor 47\/72/);
		assert.match(conditioned, /kernel index 34/);
		assert.match(conditioned, /lens 5, helix 1, position 5\]/);
	});

	it("leaves the question EXACTLY intact when there is no address", () => {
		const question = "what is the torus";
		assert.equal(conditionQuestionOnResonance72(question, null), question);
	});

	it("renders every locating component, not just the digit", () => {
		const clause = renderResonance72Clause({
			legacyResonanceIndex: 0,
			lensAnchorIndex: 0,
			baseLens: 0,
			helixBit: 0,
			lensAnchor: 0,
			position: 0,
		});
		for (const term of ["anchor 0/72", "kernel index 0", "lens 0", "helix 0", "position 0"]) {
			assert.ok(clause.includes(term), `clause must name ${term}: ${clause}`);
		}
	});
});
