/**
 * orchestration_run.test.ts — Anima holds the run; context stays isolated (50.T50.05).
 *
 * The claim under test is not "data can be passed" but "ONLY declared data is
 * passed": a child receives the variables it asked for and nothing else — not the
 * parent's history, not the upstream child's transcript.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import {
	beginRun,
	childInputFor,
	completeStep,
	renderChildInput,
	RunContextError,
	runContextSize,
} from "../lib/orchestration-run.ts";
import type { VakAddress } from "../../shared/vak_address.ts";

const ADDRESS: VakAddress = {
	cpf: "(4.0/1-4.4/5)",
	ct: ["CT3"],
	cp: "CP4.0",
	cf: "(0/1)",
	cfp: "CFP0",
	cs: { code: "CS2", direction: "Day" },
};

/** A realistic child transcript: long, chatty, and none of the parent's business. */
const FAT_TRANSCRIPT = [
	"I'll start by listing the directory to understand the layout.",
	"Reading config.yaml now... it has 14 keys.",
	"Hmm, that path doesn't exist. Let me try the sibling directory instead.",
	"Found it. The database host is db.internal and the port is 5432.",
	"For completeness I also checked the staging override, which agrees.",
].join("\n");

test("the parent owns the run and starts empty", () => {
	const state = beginRun("run-1");
	assert.equal(state.runId, "run-1");
	assert.deepEqual(state.variables, {});
	assert.deepEqual(state.completed, []);
	assert.ok(Object.isFrozen(state));
});

test("only DECLARED variables cross into a child", async (t) => {
	let state = beginRun("run-2");
	state = completeStep(state, {
		stepId: "extract-config",
		agent: "logos",
		address: ADDRESS,
		contract: { exports: ["dbHost", "dbPort"] },
		rawOutput: FAT_TRANSCRIPT,
		exported: { dbHost: "db.internal", dbPort: 5432 },
	});

	await t.test("a child gets exactly what it imported", () => {
		const input = childInputFor(state, { imports: ["dbHost"] });
		assert.deepEqual(input, { dbHost: "db.internal" });
	});

	await t.test("a child that declares nothing receives nothing — isolation is the default", () => {
		assert.deepEqual(childInputFor(state, {}), {});
		assert.deepEqual(childInputFor(state, { imports: [] }), {});
	});

	await t.test("the upstream child's transcript never becomes available", () => {
		const input = childInputFor(state, { imports: ["dbHost", "dbPort"] });
		const serialized = JSON.stringify(input);
		// The distinguishing sentences of the transcript must be absent.
		assert.doesNotMatch(serialized, /I'll start by listing/);
		assert.doesNotMatch(serialized, /sibling directory/);
		assert.doesNotMatch(serialized, /staging override/);
		// Only the two declared values are present.
		assert.deepEqual(Object.keys(input).sort(), ["dbHost", "dbPort"]);
	});

	await t.test("importing something nobody exported is refused, not silently empty", () => {
		assert.throws(
			() => childInputFor(state, { imports: ["secretToken"] }),
			(err: unknown) => {
				assert.ok(err instanceof RunContextError);
				assert.equal(err.code, "run/undeclared-import");
				assert.match(err.message, /available: dbHost, dbPort/);
				return true;
			},
		);
	});
});

test("the export contract is enforced in both directions", async (t) => {
	const state = beginRun("run-3");

	await t.test("exporting an undeclared variable is refused", () => {
		assert.throws(
			() =>
				completeStep(state, {
					stepId: "leaky",
					agent: "eros",
					address: ADDRESS,
					contract: { exports: ["expected"] },
					rawOutput: "out",
					exported: { expected: "ok", sneaky: "should not pass" },
				}),
			(err: unknown) => {
				assert.ok(err instanceof RunContextError);
				assert.equal(err.code, "run/undeclared-export");
				assert.match(err.message, /"sneaky"/);
				return true;
			},
		);
	});

	await t.test("declaring an export and producing none is refused", () => {
		assert.throws(
			() =>
				completeStep(state, {
					stepId: "empty-handed",
					agent: "eros",
					address: ADDRESS,
					contract: { exports: ["promised"] },
					rawOutput: "out",
					exported: {},
				}),
			(err: unknown) => {
				assert.ok(err instanceof RunContextError);
				assert.equal(err.code, "run/missing-export");
				return true;
			},
		);
	});
});

test("the parent's context stays flat as children accumulate", async (t) => {
	// Ten children, each producing a long transcript but exporting one small value.
	let state = beginRun("run-4");
	for (let i = 0; i < 10; i += 1) {
		state = completeStep(state, {
			stepId: `step-${i}`,
			agent: "anima",
			address: ADDRESS,
			contract: { exports: [`v${i}`] },
			rawOutput: FAT_TRANSCRIPT.repeat(5),
			exported: { [`v${i}`]: i },
		});
	}

	await t.test("every child's output was seen but not retained", () => {
		const size = runContextSize(state);
		assert.equal(size.completedSteps, 10);
		assert.equal(size.variableCount, 10);
		assert.ok(
			size.discardedOutputChars > 10_000,
			`expected substantial discarded output, got ${size.discardedOutputChars}`,
		);
		// What the parent carries is tiny next to what passed through it.
		assert.ok(
			size.variableChars * 20 < size.discardedOutputChars,
			`retained ${size.variableChars} chars vs ${size.discardedOutputChars} discarded — not flat enough`,
		);
	});

	await t.test("a late child still receives only its own imports", () => {
		const input = childInputFor(state, { imports: ["v3", "v7"] });
		assert.deepEqual(input, { v3: 3, v7: 7 });
		assert.equal(Object.keys(input).length, 2, "must not inherit the other eight");
	});

	await t.test("run state is immutable — completing a step returns a new state", () => {
		const before = beginRun("run-5");
		const after = completeStep(before, {
			stepId: "s",
			agent: "nous",
			address: ADDRESS,
			contract: { exports: ["x"] },
			rawOutput: "o",
			exported: { x: 1 },
		});
		assert.deepEqual(before.variables, {}, "the earlier state must not be mutated");
		assert.deepEqual(after.variables, { x: 1 });
		assert.notEqual(before, after);
	});
});

test("the rendered child preamble is small and explicit", async (t) => {
	await t.test("it lists the declared inputs as name: value lines", () => {
		const rendered = renderChildInput({ dbHost: "db.internal", dbPort: 5432 });
		assert.equal(rendered, "## Inputs\ndbHost: db.internal\ndbPort: 5432");
	});

	await t.test("no inputs renders nothing at all", () => {
		assert.equal(renderChildInput({}), "");
	});

	await t.test("it is orders of magnitude smaller than the transcript it replaces", () => {
		const rendered = renderChildInput({ dbHost: "db.internal", dbPort: 5432 });
		assert.ok(
			rendered.length < FAT_TRANSCRIPT.length / 4,
			`preamble ${rendered.length} vs transcript ${FAT_TRANSCRIPT.length}`,
		);
	});
});

test("the run records who produced what, for later scoring", () => {
	let state = beginRun("run-6");
	state = completeStep(state, {
		stepId: "a",
		agent: "logos",
		address: ADDRESS,
		contract: { exports: ["x"] },
		rawOutput: "long output here",
		exported: { x: "1" },
	});
	state = completeStep(state, {
		stepId: "b",
		agent: "sophia",
		address: { ...ADDRESS, cf: "(5/0)" },
		contract: { exports: ["y"] },
		rawOutput: "more output",
		exported: { y: "2" },
	});

	assert.deepEqual(
		state.completed.map((r) => [r.stepId, r.agent]),
		[
			["a", "logos"],
			["b", "sophia"],
		],
	);
	// Each record keeps its own full VAK address — the run is scorable per step.
	assert.equal(state.completed[0].address.cf, "(0/1)");
	assert.equal(state.completed[1].address.cf, "(5/0)");
	assert.equal(state.completed[0].rawOutputChars, "long output here".length);
});
