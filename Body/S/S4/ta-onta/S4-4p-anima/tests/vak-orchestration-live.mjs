/**
 * vak-orchestration-live.mjs — LIVE proof for 50.T50.03 (not part of the shared gate).
 *
 * Composes a real Anima orchestration across the six C′ coordinates and executes
 * it end-to-end through the ONE gated child-pi executor from 50.T50.02, so the
 * whole stack is exercised: the typed six-coordinate surface composes, the gated
 * executor dispatches, and REAL child pi agents do the work.
 *
 * Asserts what the tranche claims:
 *   - the script composes across >= 4 of the six coordinates
 *   - it executes, spawning the CF-bound agent for each mechanistic step
 *   - EVERY emission carries the full six-field VakAddress envelope
 *   - a CPF Dialogical step halts for a human instead of dispatching
 *
 * Deliberately NOT `*.test.ts`: it makes live model calls.
 *
 * Usage: node Body/S/S4/ta-onta/S4-4p-anima/tests/vak-orchestration-live.mjs
 */

import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
	assertFullEnvelope,
	boundAgent,
	composedCoordinates,
	defineOrchestration,
	primitiveFor,
	reviewPolarity,
	runOrchestration,
	isNightPass,
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
			const event = JSON.parse(line);
			if (event.type === "message_update" && event.assistantMessageEvent?.type === "text_delta") {
				chunks.push(event.assistantMessageEvent.delta || "");
			}
		} catch {
			/* not a frame */
		}
	}
	return chunks.join("");
}

const work = mkdtempSync(join(tmpdir(), "vak-orch-live-"));
writeFileSync(join(work, "alpha.txt"), "13\n", "utf8");
writeFileSync(join(work, "beta.txt"), "29\n", "utf8");

console.log(`\nVAK orchestration live proof — model=${MODEL}`);
console.log(`workdir: ${work}\n`);

// ── Compose across the six coordinates ────────────────────────────────────
// Steps differ on CPF (dialogical vs mechanistic), CT, CP, CF (nous/psyche/anima),
// CFP (CFP0/CFP2/CFP1) and CS (Day vs Night'). Six axes, one script.
const orchestration = defineOrchestration({
	id: "t50-03-live",
	address: {
		cpf: "(4.0/1-4.4/5)",
		ct: ["CT4b"],
		cp: "CP4.4",
		cf: "(4.0/1-4.4/5)",
		cfp: "Z",
		cs: { code: "CS0", direction: "Day" },
	},
	steps: [
		{
			// CPF Dialogical — the origination checkpoint. Halts, never dispatches.
			id: "originate",
			address: {
				cpf: "(00/00)",
				ct: ["CT0"],
				cp: "CP4.0",
				cf: "(00/00)",
				cfp: "CFP0",
				cs: { code: "CS0", direction: "Day" },
			},
			task: "Confirm the run: sum the two files.",
		},
		{
			// Mechanistic Day step, CF psyche, CFP2 chain shape.
			id: "read-alpha",
			address: {
				cpf: "(4.0/1-4.4/5)",
				ct: ["CT3"],
				cp: "CP4.2",
				cf: "(4.5/0)",
				cfp: "CFP2",
				cs: { code: "CS2", direction: "Day" },
			},
			task: "Read alpha.txt and reply with only the integer it contains.",
		},
		{
			// Mechanistic Night' step, CF anima, CFP1 parallel shape.
			id: "read-beta",
			address: {
				cpf: "(4.0/1-4.4/5)",
				ct: ["CT4b", "CT5"],
				cp: "CP4.4",
				cf: "(4.0/1-4.4/5)",
				cfp: "CFP1",
				cs: { code: "CS5", direction: "Night'", recognized: true },
			},
			task: "Read beta.txt and reply with only the integer it contains.",
		},
	],
});

console.log("─── 1. composition across the six coordinates ───");
const composed = composedCoordinates(orchestration);
console.log(`  composed across: ${composed.join(", ")} (${composed.length}/6)`);
for (const step of orchestration.steps) {
	console.log(
		`  ${step.id}: cpf=${reviewPolarity(step.address)} cf=${step.address.cf} -> agent=${boundAgent(step.address)} cfp=${step.address.cfp} -> ${primitiveFor(step.address) ?? "composed"} cs=${step.address.cs.direction}${isNightPass(step.address) ? " (Night')" : ""}`,
	);
}
check("the script composes across >= 4 of the six coordinates", composed.length >= 4, composed.join(","));
check("CF binds a distinct constitutional agent per step", new Set(orchestration.steps.map((s) => boundAgent(s.address))).size === 3);

// ── Execute through the gated child-pi executor ────────────────────────────
console.log("\n─── 2. live execution through the gated child-pi executor ───");
const dispatched = [];

const results = await runOrchestration(orchestration, {
	// A mechanistic step becomes a REAL child pi dispatch, routed through the one
	// gated executor, with the agent supplied by the step's CF binding.
	execute: async (step, primitive) => {
		const run = await dispatchChildPi({
			seam: "agent-team",
			agentName: step.agent ?? "anima",
			task: step.task,
			systemPrompt: `You are ${step.agent}. Answer with the integer only, no words.`,
			model: MODEL,
			toolUniverse: ["read"],
			cwd: work,
			vakAddress: step.address,
		});
		const text = (assistantText(run.stdout) || run.output).trim();
		dispatched.push({ step: step.id, agent: step.agent, primitive, exitCode: run.exitCode, text });
		console.log(`  dispatched ${step.id} as ${step.agent} (${primitive}) -> exit ${run.exitCode}, said ${JSON.stringify(text.slice(0, 60))}`);
		return text;
	},
	// The dialogical step halts here instead of spawning anything.
	respondToHuman: (step) => {
		console.log(`  HALTED for human at ${step.id} (CPF (00/00)) — no child spawned`);
		return "approved";
	},
});

check("every mechanistic step dispatched a real child pi", dispatched.length === 2, `${dispatched.length}`);
check("both children exited cleanly", dispatched.every((d) => d.exitCode === 0), JSON.stringify(dispatched.map((d) => d.exitCode)));
check("the CF-bound agents were the ones dispatched", JSON.stringify(dispatched.map((d) => d.agent).sort()) === '["anima","psyche"]', JSON.stringify(dispatched.map((d) => d.agent)));
check("the children returned the real file contents", dispatched.some((d) => /13/.test(d.text)) && dispatched.some((d) => /29/.test(d.text)), JSON.stringify(dispatched.map((d) => d.text)));
check("the dialogical step halted rather than dispatching", results.find((r) => r.stepId === "originate")?.haltedForHuman === true);

// ── The envelope invariant, over every emission the run produced ───────────
console.log("\n─── 3. every emission carries the full six-field envelope ───");
let enveloped = 0;
for (const result of results) {
	try {
		assertFullEnvelope(result.emission.address);
		if (!isValidVakAddress(result.emission.address)) throw new Error("mirror rejected");
		enveloped += 1;
		const a = result.emission.address;
		console.log(
			`  ${result.stepId}: cpf=${a.cpf} ct=[${a.ct.join(",")}] cp=${a.cp} cf=${a.cf} cfp=${a.cfp} cs=${a.cs.code}@${a.cs.direction}`,
		);
	} catch (err) {
		console.log(`  ${result.stepId}: ENVELOPE VIOLATION — ${err.message}`);
	}
}
check("all emissions envelope-complete", enveloped === results.length, `${enveloped}/${results.length}`);
check("the run emitted one result per step", results.length === orchestration.steps.length);

// Day pass precedes Night' — CS actually ordered execution.
const order = results.map((r) => r.stepId);
console.log(`  execution order: ${order.join(" -> ")}`);
check(
	"CS ordered the run: the Night' step ran last",
	order[order.length - 1] === "read-beta",
	order.join(" -> "),
);

rmSync(work, { recursive: true, force: true });

console.log(`\n${failures.length === 0 ? "LIVE PROOF PASS" : `LIVE PROOF FAIL (${failures.length}): ${failures.join("; ")}`}`);
process.exit(failures.length === 0 ? 0 : 1);
