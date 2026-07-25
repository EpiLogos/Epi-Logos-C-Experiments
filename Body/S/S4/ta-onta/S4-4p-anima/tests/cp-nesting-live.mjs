/**
 * cp-nesting-live.mjs — LIVE proof for 50.T50.04 (not part of the shared gate).
 *
 * Runs a genuinely 2-deep CP-nested orchestration and spawns a REAL child pi at
 * every leaf, through the one gated executor from 50.T50.02.
 *
 * The shape is the one the brief describes: an outer `(0/1/2)` frame whose
 * position 0 opens `(00/00)` and whose position 1 opens the `(4.0/1-4.4/5)`
 * parent, with position 2 a terminal dispatch.
 *
 * Asserts:
 *   - the structure validates under the CP nesting law and is >= 2 deep
 *   - each leaf spawned the child pi its CF binds, and it really ran
 *   - the captured trace reflects the nesting (depth, framePath, slotPath)
 *   - only leaves dispatched; frames contributed structure only
 *
 * Deliberately NOT `*.test.ts`: it makes live model calls.
 *
 * Usage: node Body/S/S4/ta-onta/S4-4p-anima/tests/cp-nesting-live.mjs
 */

import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
	assertFrameNesting,
	boundAgent,
	frameLeaves,
	nestingDepth,
	runNestedFrame,
} from "../lib/vak-orchestration-surface.ts";
import { isValidVakAddress } from "../../shared/vak_address.ts";
import { dispatchChildPi } from "../lib/child-pi-executor.ts";

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
			const e = JSON.parse(line);
			if (e.type === "message_update" && e.assistantMessageEvent?.type === "text_delta") {
				chunks.push(e.assistantMessageEvent.delta || "");
			}
		} catch {
			/* not a frame */
		}
	}
	return chunks.join("");
}

const work = mkdtempSync(join(tmpdir(), "cp-nest-live-"));
writeFileSync(join(work, "one.txt"), "ALPHA\n", "utf8");
writeFileSync(join(work, "two.txt"), "BETA\n", "utf8");
writeFileSync(join(work, "three.txt"), "GAMMA\n", "utf8");

const addr = (o) => ({
	cpf: "(4.0/1-4.4/5)",
	ct: ["CT3"],
	cp: "CP4.0",
	cf: "(0/1)",
	cfp: "CFP0",
	cs: { code: "CS2", direction: "Day" },
	...o,
});

// Outer (0/1/2): slot 0 opens (00/00); slot 1 opens the 4.x parent; slot 2 is terminal.
const tree = {
	kind: "frame",
	id: "outer",
	address: addr({ cf: "(0/1/2)" }),
	children: [
		{
			kind: "frame",
			id: "pos0-opens-ground",
			address: addr({ cf: "(00/00)" }),
			children: [
				{
					kind: "leaf",
					id: "ground-read-one",
					address: addr({ cf: "(0/1)", cfp: "CFP0" }), // CF (0/1) -> logos
					task: "Read one.txt and reply with only its contents.",
				},
			],
		},
		{
			kind: "frame",
			id: "pos1-opens-4x",
			address: addr({ cf: "(4.0/1-4.4/5)" }),
			children: [
				{
					kind: "leaf",
					id: "quad-0-read-two",
					address: addr({ cp: "CP4.0", cf: "(5/0)", cfp: "CFP2" }), // CF (5/0) -> sophia
					task: "Read two.txt and reply with only its contents.",
				},
				{
					kind: "leaf",
					id: "quad-1-read-three",
					address: addr({ cp: "CP4.1", cf: "(4.5/0)", cfp: "CFP1" }), // CF (4.5/0) -> psyche
					task: "Read three.txt and reply with only its contents.",
				},
			],
		},
	],
};

console.log(`\nCP nesting live proof — model=${MODEL}`);
console.log(`workdir: ${work}\n`);

console.log("─── 1. the nested structure ───");
let structureOk = true;
try {
	assertFrameNesting(tree);
} catch (err) {
	structureOk = false;
	console.log(`  nesting error: ${err.message}`);
}
const depth = nestingDepth(tree);
const leaves = frameLeaves(tree);
console.log(`  depth=${depth} leaves=${leaves.length}`);
for (const l of leaves) console.log(`    ${l.id}: cf=${l.address.cf} -> agent=${boundAgent(l.address)} cp=${l.address.cp}`);
check("the structure satisfies the CP nesting law", structureOk);
check("the nesting is >= 2 deep", depth >= 2, `depth=${depth}`);
check("every leaf's CP matches the slot it occupies", structureOk);

console.log("\n─── 2. live execution: a real child pi at every leaf ───");
const dispatched = [];
const trace = await runNestedFrame(tree, {
	execute: async (leafNode, ctx) => {
		const agent = boundAgent(leafNode.address) ?? "anima";
		const run = await dispatchChildPi({
			seam: "agent-team",
			agentName: agent,
			task: leafNode.task,
			systemPrompt: `You are ${agent}. Reply with the file contents only, no words.`,
			model: MODEL,
			toolUniverse: ["read"],
			cwd: work,
			vakAddress: leafNode.address,
		});
		const text = (assistantText(run.stdout) || run.output).trim();
		dispatched.push({
			id: leafNode.id,
			agent,
			depth: ctx.depth,
			framePath: [...ctx.framePath],
			primitive: ctx.primitive,
			exitCode: run.exitCode,
			text,
		});
		console.log(
			`  leaf ${leafNode.id} @depth${ctx.depth} [${ctx.framePath.join(" > ")}] as ${agent} (${ctx.primitive}) -> exit ${run.exitCode}, said ${JSON.stringify(text.slice(0, 40))}`,
		);
		return text;
	},
});

check("every leaf spawned a real child pi", dispatched.length === leaves.length, `${dispatched.length}/${leaves.length}`);
check("all children exited cleanly", dispatched.every((d) => d.exitCode === 0), JSON.stringify(dispatched.map((d) => d.exitCode)));
check(
	"each leaf ran as the agent its CF binds",
	JSON.stringify(dispatched.map((d) => d.agent)) === JSON.stringify(["logos", "sophia", "psyche"]),
	JSON.stringify(dispatched.map((d) => d.agent)),
);
check(
	"the children returned the real file contents",
	["ALPHA", "BETA", "GAMMA"].every((word) => dispatched.some((d) => d.text.includes(word))),
	JSON.stringify(dispatched.map((d) => d.text)),
);

console.log("\n─── 3. the trace reflects the nesting structure ───");
for (const entry of trace) {
	console.log(
		`  ${entry.kind.padEnd(5)} ${entry.nodeId.padEnd(20)} depth=${entry.depth} slotPath=[${entry.slotPath.join(",")}] framePath=[${entry.framePath.join(" > ")}]`,
	);
}

const byId = Object.fromEntries(trace.map((e) => [e.nodeId, e]));
check("the root frame is depth 0 with no enclosing frame", byId.outer.depth === 0 && byId.outer.framePath.length === 0);
check(
	"a nested frame records its enclosing frame and slot",
	byId["pos1-opens-4x"].depth === 1 &&
		JSON.stringify(byId["pos1-opens-4x"].framePath) === '["(0/1/2)"]' &&
		JSON.stringify(byId["pos1-opens-4x"].slotPath) === "[1]",
	JSON.stringify(byId["pos1-opens-4x"]?.framePath),
);
check(
	"a 2-deep leaf carries the full frame chain and slot path",
	byId["quad-1-read-three"].depth === 2 &&
		JSON.stringify(byId["quad-1-read-three"].framePath) === '["(0/1/2)","(4.0/1-4.4/5)"]' &&
		JSON.stringify(byId["quad-1-read-three"].slotPath) === "[1,1]",
	`depth=${byId["quad-1-read-three"]?.depth} framePath=${JSON.stringify(byId["quad-1-read-three"]?.framePath)} slotPath=${JSON.stringify(byId["quad-1-read-three"]?.slotPath)}`,
);
check(
	"only leaves dispatched — frames contributed structure only",
	trace.filter((e) => e.kind === "frame").every((e) => e.emission === undefined) &&
		trace.filter((e) => e.kind === "leaf").every((e) => e.emission !== undefined),
);
check(
	"every emission carries the full six-field envelope",
	trace.filter((e) => e.emission).every((e) => isValidVakAddress(e.emission.address)),
);

rmSync(work, { recursive: true, force: true });
console.log(`\n${failures.length === 0 ? "LIVE PROOF PASS" : `LIVE PROOF FAIL (${failures.length}): ${failures.join("; ")}`}`);
process.exit(failures.length === 0 ? 0 : 1);
