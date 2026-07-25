/**
 * vak_orchestration_surface.test.ts — the six C′ coordinates as a scripting
 * surface (50.T50.03).
 *
 * Two things are proven here:
 *   1. **Cross-language parity.** This reads the SAME fixture as
 *      `Body/S/S0/portal-core/tests/vak_address_ts_parity.rs`. Both sides must
 *      accept every canonical case and refuse every rejected one. Neither greps
 *      the other's source — they agree on identical bytes or they fail.
 *   2. **The envelope invariant.** Every emission a run produces carries the full
 *      six-field VakAddress, because `emit()` is the only constructor and it
 *      refuses anything partial or non-canonical.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
	artifactTemplates,
	assertFullEnvelope,
	boundAgent,
	composedCoordinates,
	defineOrchestration,
	describeEnvelopeViolations,
	DialogicalHaltRequired,
	emit,
	executionShape,
	framePosition,
	framePositionIndex,
	haltsForHuman,
	isNightPass,
	primitiveFor,
	reviewPolarity,
	runOrchestration,
	sequence,
	VAK_COORDINATES,
	VakEnvelopeError,
	type OrchestrationStep,
} from "../lib/vak-orchestration-surface.ts";
import { isValidVakAddress, type VakAddress } from "../../shared/vak_address.ts";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const FIXTURE = JSON.parse(
	readFileSync(join(HERE, "../../shared/vak_address.parity.json"), "utf8"),
) as {
	canonical: Array<{ name: string; address: unknown }>;
	rejected: Array<{ name: string; why: string; address: unknown }>;
};

/** A canonical address by fixture name, for reuse in the behaviour tests. */
function fixtureAddress(name: string): VakAddress {
	const found = FIXTURE.canonical.find((c) => c.name === name);
	assert.ok(found, `fixture case "${name}" must exist`);
	assertFullEnvelope(found.address);
	return found.address;
}

test("cross-language parity against the shared fixture", async (t) => {
	await t.test("the fixture carries canonical and rejected cases", () => {
		assert.ok(FIXTURE.canonical.length >= 4, "need >= 4 canonical cases");
		assert.ok(FIXTURE.rejected.length >= 1, "need at least one rejected case");
	});

	await t.test("every canonical case satisfies the TS mirror", () => {
		for (const { name, address } of FIXTURE.canonical) {
			assert.ok(isValidVakAddress(address), `canonical case "${name}" must validate`);
			assert.deepEqual(
				describeEnvelopeViolations(address),
				[],
				`canonical case "${name}" must report no violations`,
			);
		}
	});

	await t.test("every rejected case is refused by the TS mirror", () => {
		for (const { name, address } of FIXTURE.rejected) {
			assert.equal(
				isValidVakAddress(address),
				false,
				`rejected case "${name}" must NOT validate`,
			);
			assert.ok(
				describeEnvelopeViolations(address).length > 0,
				`rejected case "${name}" must report a violation`,
			);
		}
	});

	await t.test("the loose epi-cli shape is refused per-coordinate, not vaguely", () => {
		const loose = FIXTURE.rejected.find((c) => c.name === "epi-cli-loose-vak-coordinates");
		assert.ok(loose);
		const violations = describeEnvelopeViolations(loose.address).join(" | ");
		// Each divergence is named on its own axis so a script author can fix it.
		assert.match(violations, /cpf .*is not a review polarity/);
		assert.match(violations, /ct .*must be an ARRAY/);
		assert.match(violations, /cp .*is not a frame position/);
		assert.match(violations, /cs .*must be a \{ code, direction \} field/);
	});

	await t.test("the canonical cases exercise both CPF polarities and both passes", () => {
		const polarities = new Set(
			FIXTURE.canonical.map((c) => reviewPolarity(c.address as VakAddress)),
		);
		assert.deepEqual([...polarities].sort(), ["dialogical", "mechanistic"]);
		const passes = new Set(FIXTURE.canonical.map((c) => isNightPass(c.address as VakAddress)));
		assert.deepEqual([...passes].sort(), [false, true]);
	});
});

test("the envelope invariant", async (t) => {
	const good = fixtureAddress("dialogical-day-nous");

	await t.test("emit() is the only constructor and refuses a partial address", () => {
		assert.throws(() => emit({ cpf: "(00/00)", ct: ["CT0"] }, "payload"), VakEnvelopeError);
	});

	await t.test("a missing coordinate is named", () => {
		for (const coordinate of VAK_COORDINATES) {
			const partial: Record<string, unknown> = { ...good };
			delete partial[coordinate];
			const violations = describeEnvelopeViolations(partial);
			assert.ok(
				violations.some((v) => v.startsWith(`${coordinate} is missing`)),
				`removing ${coordinate} must be reported: ${violations.join("; ")}`,
			);
		}
	});

	await t.test("a complete address emits and is frozen", () => {
		const emission = emit(good, { output: "ok" });
		assert.deepEqual(emission.address, good);
		assert.ok(Object.isFrozen(emission));
	});

	await t.test("a non-object address is refused rather than crashing", () => {
		assert.deepEqual(describeEnvelopeViolations(null), ["address is not an object"]);
		assert.deepEqual(describeEnvelopeViolations("(00/00)"), ["address is not an object"]);
		assert.deepEqual(describeEnvelopeViolations([]), ["address is not an object"]);
	});
});

test("each of the six coordinates reads as its own axis", async (t) => {
	const dialogical = fixtureAddress("dialogical-day-nous");
	const mechanistic = fixtureAddress("mechanistic-night-prime-anima");
	const lemniscate = fixtureAddress("lemniscate-stage-5-psyche");
	const zThread = fixtureAddress("mobius-return-sophia-z-thread");

	await t.test("CPF — review polarity, and whether the step halts", () => {
		assert.equal(reviewPolarity(dialogical), "dialogical");
		assert.equal(haltsForHuman(dialogical), true);
		assert.equal(reviewPolarity(mechanistic), "mechanistic");
		assert.equal(haltsForHuman(mechanistic), false);
	});

	await t.test("CT — the declared artifact templates", () => {
		assert.deepEqual(artifactTemplates(mechanistic), ["CT4b", "CT5"]);
		// A copy, so a caller cannot mutate the address through it.
		artifactTemplates(mechanistic).push("CT0");
		assert.deepEqual(artifactTemplates(mechanistic), ["CT4b", "CT5"]);
	});

	await t.test("CP — the frame position and its index", () => {
		assert.equal(framePosition(lemniscate), "CP4.5");
		assert.equal(framePositionIndex(lemniscate), 5);
		assert.equal(framePositionIndex(dialogical), 0);
	});

	await t.test("CF — binds the constitutional agent", () => {
		assert.equal(boundAgent(dialogical), "nous");
		assert.equal(boundAgent(mechanistic), "anima");
		assert.equal(boundAgent(lemniscate), "psyche");
		assert.equal(boundAgent(zThread), "sophia");
	});

	await t.test("CFP — the execution shape and its dispatch primitive", () => {
		assert.equal(executionShape(dialogical), "CFP0");
		assert.equal(primitiveFor(dialogical), "dispatch_agent");
		assert.equal(primitiveFor(mechanistic), "dispatch_parallel_agents");
		assert.equal(primitiveFor(lemniscate), "run_chain");
		// A Z shape COMPOSES moves; it is not itself one primitive.
		assert.equal(executionShape(zThread), "Z");
		assert.equal(primitiveFor(zThread), null);
	});

	await t.test("CS — sequence, and the primed Night pass", () => {
		assert.equal(sequence(dialogical).direction, "Day");
		assert.equal(isNightPass(dialogical), false);
		assert.equal(sequence(mechanistic).direction, "Night'");
		assert.equal(isNightPass(mechanistic), true);
	});

	await t.test("CS — the Klein `sense` binary wins over the legacy direction", () => {
		const retrospectiveDay = {
			...dialogical,
			cs: { ...dialogical.cs, sense: "retrospective" as const },
		};
		// direction still says Day, but sense is the operative binary.
		assert.equal(retrospectiveDay.cs.direction, "Day");
		assert.equal(isNightPass(retrospectiveDay), true);
	});
});

test("an orchestration composing across four of the six coordinates executes", async (t) => {
	// Steps deliberately differ on CPF, CP, CF, CFP and CS — five axes.
	const orchestration = defineOrchestration({
		id: "t50-03-acceptance",
		address: fixtureAddress("mechanistic-night-prime-anima"),
		steps: [
			{
				id: "night-synthesis",
				address: fixtureAddress("mobius-return-sophia-z-thread"),
				task: "synthesise the run on the Night' pass",
			},
			{
				id: "chain-the-work",
				address: fixtureAddress("lemniscate-stage-5-psyche"),
				task: "run the chain",
			},
			{
				id: "fan-out",
				address: fixtureAddress("mechanistic-night-prime-anima"),
				task: "dispatch in parallel",
			},
		],
	});

	await t.test("it composes across >= 4 of the six coordinates", () => {
		const composed = composedCoordinates(orchestration);
		assert.ok(
			composed.length >= 4,
			`expected composition across >= 4 coordinates, got ${composed.length}: ${composed.join(",")}`,
		);
		// CF and CFP must be among them — those are the agent and flow axes.
		assert.ok(composed.includes("cf"));
		assert.ok(composed.includes("cfp"));
	});

	await t.test("CF supplies each step's agent when none was given", () => {
		const agents = orchestration.steps.map((s) => s.agent);
		assert.deepEqual(agents, ["sophia", "psyche", "anima"]);
	});

	await t.test("it executes, and EVERY emission carries the full envelope", async () => {
		const executed: Array<{ id: string; primitive: string | null }> = [];
		const results = await runOrchestration(orchestration, {
			execute: (step: OrchestrationStep, primitive) => {
				executed.push({ id: step.id, primitive });
				return `ran ${step.id} via ${primitive ?? "composed"}`;
			},
		});

		assert.equal(results.length, 3);
		for (const result of results) {
			// The invariant: not "was tagged" but "cannot exist untagged".
			assert.doesNotThrow(() => assertFullEnvelope(result.emission.address));
			assert.ok(isValidVakAddress(result.emission.address));
			assert.match(result.emission.payload.output, /^ran /);
		}

		// Ordering: Day pass before Night', then by CP position.
		// chain-the-work is the only Day step, so it runs first.
		assert.equal(results[0].stepId, "chain-the-work");
		assert.deepEqual(
			results.slice(1).map((r) => r.stepId).sort(),
			["fan-out", "night-synthesis"],
		);
	});

	await t.test("each step reached its CFP-mapped primitive", async () => {
		const seen: Array<string | null> = [];
		await runOrchestration(orchestration, {
			execute: (_step, primitive) => {
				seen.push(primitive);
				return "ok";
			},
		});
		assert.ok(seen.includes("run_chain"));
		assert.ok(seen.includes("dispatch_parallel_agents"));
		assert.ok(seen.includes(null), "the Z step composes rather than mapping to one primitive");
	});
});

test("a Dialogical step halts for a human", async (t) => {
	const orchestration = defineOrchestration({
		id: "t50-03-dialogical",
		address: fixtureAddress("mechanistic-night-prime-anima"),
		steps: [
			{
				id: "ask-the-architect",
				address: fixtureAddress("dialogical-day-nous"),
				task: "confirm the approach",
			},
		],
	});

	await t.test("without a responder the run refuses rather than proceeding", async () => {
		await assert.rejects(
			() => runOrchestration(orchestration, { execute: () => "should not run" }),
			DialogicalHaltRequired,
		);
	});

	await t.test("with a responder the human answer becomes the step output", async () => {
		let executed = false;
		const results = await runOrchestration(orchestration, {
			execute: () => {
				executed = true;
				return "should not run";
			},
			respondToHuman: (step) => `architect approved ${step.id}`,
		});
		assert.equal(executed, false, "a dialogical step must not run the mechanistic executor");
		assert.equal(results[0].haltedForHuman, true);
		assert.equal(results[0].emission.payload.output, "architect approved ask-the-architect");
	});
});

test("defineOrchestration refuses a bad step at declaration time", async (t) => {
	await t.test("a step with a non-canonical address names the step and the axis", () => {
		assert.throws(
			() =>
				defineOrchestration({
					id: "bad",
					address: fixtureAddress("dialogical-day-nous"),
					steps: [
						{
							id: "loose-step",
							address: FIXTURE.rejected.find(
								(c) => c.name === "epi-cli-loose-vak-coordinates",
							)!.address,
							task: "nope",
						},
					],
				}),
			(err: unknown) => {
				assert.ok(err instanceof VakEnvelopeError);
				assert.ok(err.violations.every((v) => v.startsWith('step "loose-step"')));
				return true;
			},
		);
	});

	await t.test("an orchestration with no steps is refused", () => {
		assert.throws(
			() =>
				defineOrchestration({
					id: "empty",
					address: fixtureAddress("dialogical-day-nous"),
					steps: [],
				}),
			VakEnvelopeError,
		);
	});
});
