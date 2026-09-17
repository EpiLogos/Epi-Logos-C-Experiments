/**
 * cp_frame_nesting.test.ts — CP nesting: context-frame recursion (50.T50.04).
 *
 * CP is the composability engine: a position inside a context frame is either a
 * terminal dispatch or it opens a whole nested frame. These tests exercise the
 * law (which slots a frame has; that a child's CP matches the slot it occupies)
 * and the evaluator (real recursion, real leaf execution, and a trace that
 * actually reflects the nesting structure).
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import {
	assertFrameNesting,
	expectedCpForSlot,
	FrameNestingError,
	frameLeaves,
	frameSlots,
	nestingDepth,
	runNestedFrame,
	type FrameLeaf,
	type FrameNest,
	type FrameNode,
} from "../lib/vak-orchestration-surface.ts";
import { isValidVakAddress, type CfLiteral, type CpLiteral, type VakAddress } from "../../shared/vak_address.ts";

function address(overrides: Partial<VakAddress> = {}): VakAddress {
	return {
		cpf: "(4.0/1-4.4/5)",
		ct: ["CT3"],
		cp: "CP4.0",
		cf: "(0/1)",
		cfp: "CFP0",
		cs: { code: "CS2", direction: "Day" },
		...overrides,
	} as VakAddress;
}

function leaf(id: string, overrides: Partial<VakAddress> = {}): FrameLeaf {
	return { kind: "leaf", id, address: address(overrides), task: `task ${id}` };
}

function nest(id: string, cf: CfLiteral, children: FrameNode[], cp: CpLiteral = "CP4.0"): FrameNest {
	return { kind: "frame", id, address: address({ cf, cp }), children };
}

test("a frame's slots come from its own notation", async (t) => {
	await t.test("the inner frames split on /", () => {
		assert.deepEqual(frameSlots("(0/1)"), ["0", "1"]);
		assert.deepEqual(frameSlots("(0/1/2)"), ["0", "1", "2"]);
		assert.deepEqual(frameSlots("(0/1/2/3)"), ["0", "1", "2", "3"]);
		assert.deepEqual(frameSlots("(5/0)"), ["5", "0"]);
		assert.deepEqual(frameSlots("(4.5/0)"), ["4.5", "0"]);
		assert.deepEqual(frameSlots("(00/00)"), ["00", "00"]);
	});

	await t.test("the 4.x parent expands its range to the canonical CP4.x set", () => {
		// The one range form: the fractal doubling across 4.0..4.5, which is
		// exactly the canonical CP literal set — not an invented table.
		assert.deepEqual(frameSlots("(4.0/1-4.4/5)"), [
			"4.0",
			"4.1",
			"4.2",
			"4.3",
			"4.4",
			"4.5",
		]);
	});
});

test("CP places the step: the 4.x parent pins its children's CP", async (t) => {
	await t.test("each slot of the 4.x parent requires its matching CP4.x", () => {
		assert.equal(expectedCpForSlot("(4.0/1-4.4/5)", 0), "CP4.0");
		assert.equal(expectedCpForSlot("(4.0/1-4.4/5)", 3), "CP4.3");
		assert.equal(expectedCpForSlot("(4.0/1-4.4/5)", 5), "CP4.5");
	});

	await t.test("an out-of-range slot has no expectation", () => {
		assert.equal(expectedCpForSlot("(4.0/1-4.4/5)", 6), null);
		assert.equal(expectedCpForSlot("(4.0/1-4.4/5)", -1), null);
	});

	await t.test("other frames do not constrain the CP literal", () => {
		// They position within their own notation; inventing a CP mapping for
		// them would fabricate a coordinate.
		assert.equal(expectedCpForSlot("(0/1/2)", 1), null);
		assert.equal(expectedCpForSlot("(00/00)", 0), null);
	});

	await t.test("a child in the wrong slot of the 4.x parent is refused", () => {
		const bad = nest("outer", "(4.0/1-4.4/5)", [
			leaf("slot0", { cp: "CP4.0" }),
			leaf("slot1", { cp: "CP4.4" }), // sits in slot 1, claims CP4.4
		]);
		assert.throws(
			() => assertFrameNesting(bad),
			(err: unknown) => {
				assert.ok(err instanceof FrameNestingError);
				assert.match(err.violations.join(" "), /slot 1 of \(4\.0\/1-4\.4\/5\) requires cp CP4\.1, got CP4\.4/);
				return true;
			},
		);
	});

	await t.test("the same structure with matching CPs is accepted", () => {
		const good = nest("outer", "(4.0/1-4.4/5)", [
			leaf("slot0", { cp: "CP4.0" }),
			leaf("slot1", { cp: "CP4.1" }),
		]);
		assert.doesNotThrow(() => assertFrameNesting(good));
	});

	await t.test("a frame carrying more children than slots is refused", () => {
		const overfull = nest("outer", "(0/1)", [leaf("a"), leaf("b"), leaf("c")]);
		assert.throws(
			() => assertFrameNesting(overfull),
			(err: unknown) => {
				assert.ok(err instanceof FrameNestingError);
				assert.match(err.violations.join(" "), /has 2 slot\(s\) but 3 child\(ren\)/);
				return true;
			},
		);
	});

	await t.test("a nested violation names its full path", () => {
		const deep = nest("root", "(0/1/2)", [
			leaf("ok"),
			nest("inner", "(4.0/1-4.4/5)", [leaf("wrong", { cp: "CP4.2" })]),
		]);
		assert.throws(
			() => assertFrameNesting(deep),
			(err: unknown) => {
				assert.ok(err instanceof FrameNestingError);
				assert.match(err.violations.join(" "), /root > inner > wrong/);
				return true;
			},
		);
	});
});

test("nesting depth and leaf collection", async (t) => {
	await t.test("a bare leaf has depth 0", () => {
		assert.equal(nestingDepth(leaf("solo")), 0);
	});

	await t.test("depth counts frames, not leaves", () => {
		const oneDeep = nest("f1", "(0/1)", [leaf("a"), leaf("b")]);
		assert.equal(nestingDepth(oneDeep), 1);

		const twoDeep = nest("f1", "(0/1)", [
			leaf("a"),
			nest("f2", "(0/1)", [leaf("b"), leaf("c")]),
		]);
		assert.equal(nestingDepth(twoDeep), 2);

		const threeDeep = nest("f1", "(0/1)", [
			nest("f2", "(0/1)", [nest("f3", "(0/1)", [leaf("deep")])]),
		]);
		assert.equal(nestingDepth(threeDeep), 3);
	});

	await t.test("leaves come out in slot order, depth-first", () => {
		const tree = nest("root", "(0/1/2)", [
			leaf("first"),
			nest("mid", "(0/1)", [leaf("second"), leaf("third")]),
			leaf("fourth"),
		]);
		assert.deepEqual(
			frameLeaves(tree).map((l) => l.id),
			["first", "second", "third", "fourth"],
		);
	});
});

test("a >=2-deep nested orchestration executes", async (t) => {
	// (0/1/2) with position 0 opening (00/00) and position 1 opening the 4.x
	// parent — the exact shape the brief describes.
	const tree: FrameNode = nest("outer", "(0/1/2)", [
		nest("pos0-opens-ground", "(00/00)", [
			leaf("ground-a", { cf: "(00/00)", cfp: "CFP0" }),
			leaf("ground-b", { cf: "(0/1)", cfp: "CFP2" }),
		]),
		nest("pos1-opens-4x", "(4.0/1-4.4/5)", [
			leaf("quad-0", { cp: "CP4.0", cf: "(0/1)", cfp: "CFP1" }),
			leaf("quad-1", { cp: "CP4.1", cf: "(5/0)", cfp: "CFP2" }),
		]),
		leaf("pos2-terminal", { cf: "(0/1/2)", cfp: "CFP0" }),
	]);

	await t.test("the structure is valid and 2 deep", () => {
		assert.doesNotThrow(() => assertFrameNesting(tree));
		assert.equal(nestingDepth(tree), 2);
		assert.equal(frameLeaves(tree).length, 5);
	});

	await t.test("every leaf executes, and only leaves dispatch", async () => {
		const dispatched: Array<{ id: string; depth: number; framePath: string[] }> = [];
		const trace = await runNestedFrame(tree, {
			execute: (node, ctx) => {
				dispatched.push({ id: node.id, depth: ctx.depth, framePath: [...ctx.framePath] });
				return `ran ${node.id}`;
			},
		});

		// Five leaves dispatched; the three frames did not.
		assert.equal(dispatched.length, 5);
		assert.deepEqual(
			dispatched.map((d) => d.id),
			["ground-a", "ground-b", "quad-0", "quad-1", "pos2-terminal"],
		);
		const frames = trace.filter((e) => e.kind === "frame");
		assert.equal(frames.length, 3);
		assert.ok(frames.every((f) => f.emission === undefined), "a frame must not dispatch");
	});

	await t.test("the trace reflects the nesting structure", async () => {
		const trace = await runNestedFrame(tree, { execute: (n) => `ran ${n.id}` });

		const byId = new Map(trace.map((e) => [e.nodeId, e]));

		// Root frame at depth 0 with an empty enclosing path.
		assert.equal(byId.get("outer")?.depth, 0);
		assert.deepEqual(byId.get("outer")?.framePath, []);
		assert.deepEqual(byId.get("outer")?.slotPath, []);

		// A nested frame sits at depth 1, enclosed by the root's frame.
		assert.equal(byId.get("pos1-opens-4x")?.depth, 1);
		assert.deepEqual(byId.get("pos1-opens-4x")?.framePath, ["(0/1/2)"]);
		assert.deepEqual(byId.get("pos1-opens-4x")?.slotPath, [1]);

		// A leaf two levels in carries the full frame chain and slot path.
		const quad1 = byId.get("quad-1");
		assert.equal(quad1?.depth, 2);
		assert.deepEqual(quad1?.framePath, ["(0/1/2)", "(4.0/1-4.4/5)"]);
		assert.deepEqual(quad1?.slotPath, [1, 1]);

		// The terminal leaf at the root's slot 2 is only one level in.
		assert.equal(byId.get("pos2-terminal")?.depth, 1);
		assert.deepEqual(byId.get("pos2-terminal")?.slotPath, [2]);
	});

	await t.test("each leaf reached the primitive its CFP names", async () => {
		const seen = new Map<string, string | null>();
		await runNestedFrame(tree, {
			execute: (node, ctx) => {
				seen.set(node.id, ctx.primitive);
				return "ok";
			},
		});
		assert.equal(seen.get("ground-a"), "dispatch_agent"); // CFP0
		assert.equal(seen.get("ground-b"), "run_chain"); // CFP2
		assert.equal(seen.get("quad-0"), "dispatch_parallel_agents"); // CFP1
	});

	await t.test("every emission in the trace carries the full envelope", async () => {
		const trace = await runNestedFrame(tree, { execute: (n) => `ran ${n.id}` });
		const emissions = trace.filter((e) => e.emission !== undefined);
		assert.equal(emissions.length, 5);
		for (const entry of emissions) {
			assert.ok(
				isValidVakAddress(entry.emission!.address),
				`${entry.nodeId} emitted without a complete envelope`,
			);
		}
	});
});

test("a dialogical leaf inside a nested frame still halts", async () => {
	const tree = nest("root", "(0/1)", [
		leaf("mechanistic", { cpf: "(4.0/1-4.4/5)" }),
		nest("inner", "(0/1)", [leaf("asks-human", { cpf: "(00/00)" })]),
	]);

	// Without a responder the whole run refuses rather than quietly running it.
	await assert.rejects(() => runNestedFrame(tree, { execute: () => "ran" }));

	const trace = await runNestedFrame(tree, {
		execute: () => "ran",
		respondToHuman: (l) => `approved ${l.id}`,
	});
	const halted = trace.find((e) => e.nodeId === "asks-human");
	assert.equal(halted?.haltedForHuman, true);
	assert.equal(halted?.emission?.payload.output, "approved asks-human");
	assert.equal(halted?.depth, 2);
});
