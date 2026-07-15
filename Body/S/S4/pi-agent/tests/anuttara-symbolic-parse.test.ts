import { describe, it } from "node:test";
import { strict as assert } from "node:assert";

import {
	ANUTTARA_SYMBOLIC_PARSE_SKILL,
	evaluateSymbolicParseGate,
	formulateVerifierQuestion,
	parseVerifierSymbolicCoordinate,
} from "../skills/anuttara-symbolic-parse/index.ts";

describe("05.T5.21 — anuttara symbolic parse round trip", () => {
	it("parses a Verifier-Anuttara symbolic-coordinate string and routes an interrogative back through Anima", () => {
		const parsed = parseVerifierSymbolicCoordinate("#R0-0/1/A-T7-pending?");

		assert.equal(parsed.ok, true);
		if (!parsed.ok) throw new Error(parsed.diagnostic);
		assert.equal(parsed.value.relationIndex, 0);
		assert.deepEqual(parsed.value.polarPair, [0, 1]);
		assert.equal(parsed.value.domainTag, "A-T7");
		assert.equal(parsed.value.entryState, "pending");

		const envelope = formulateVerifierQuestion(parsed.value, {
			relationName: "M0_CORE_RELATIONS[0]",
			leftFunction: "threshold",
			rightFunction: "manifestation",
		});

		assert.equal(envelope.tag, "#V-verify:0");
		assert.equal(envelope.domain, "Archetype-7 Divine-Action");
		assert.match(envelope.question, /why is this entry pending/);
		assert.equal(envelope.route.via, "Anima.verify_gate");
		assert.equal(envelope.route.target, "Verifier re-check");
		assert.equal(envelope.route.maxCycles, 3);
		assert.doesNotMatch(envelope.question, /\bpass(?:ed|es)?\b|\bfail(?:ed|s)?\b/i);
	});

	it("refuses relation indices outside M0_CORE_RELATIONS[65]", () => {
		const parsed = parseVerifierSymbolicCoordinate("#R65-0/1/A-T7-pending?");

		assert.equal(parsed.ok, false);
		if (parsed.ok) throw new Error("expected parse failure");
		assert.equal(parsed.code, "resolve-failure");
		assert.equal(parsed.diagnostic, "#resolve-failure:65");
	});
});

describe("05.T5.21 — no raw symbolic-coordinate bypass", () => {
	it("requires anuttara-symbolic-parse for raw Verifier strings", () => {
		const refused = evaluateSymbolicParseGate("#R0-0/1/A-T7-pending?", []);

		assert.equal(refused.allowed, false);
		assert.equal(refused.requiredSkill, ANUTTARA_SYMBOLIC_PARSE_SKILL);
		assert.match(refused.reason, /must route through anuttara-symbolic-parse/);
	});

	it("allows raw Verifier strings only when the skill is declared", () => {
		const accepted = evaluateSymbolicParseGate("#R0-0/1/A-T7-pending?", [
			ANUTTARA_SYMBOLIC_PARSE_SKILL,
		]);

		assert.equal(accepted.allowed, true);
		assert.equal(accepted.requiredSkill, ANUTTARA_SYMBOLIC_PARSE_SKILL);
	});

	it("does not capture ordinary non-symbolic user text", () => {
		const accepted = evaluateSymbolicParseGate("Please explain the verifier question.", []);

		assert.equal(accepted.allowed, true);
		assert.equal(accepted.requiredSkill, null);
	});
});
