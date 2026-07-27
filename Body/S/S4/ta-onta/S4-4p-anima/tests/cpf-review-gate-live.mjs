/**
 * cpf-review-gate-live.mjs — LIVE proof for 50.T50.09 (not part of the shared gate).
 *
 * The tranche's claim, verbatim: "a script with an agent-declared `(00/00)`
 * checkpoint halts for input; a mechanistic script runs to completion
 * autonomously." This proves both, with REAL child pi processes and no mocks:
 *
 *   1. a gated script runs its mechanistic step for real, reaches the authored
 *      checkpoint, and HALTS — naming the reason the agent authored it for;
 *   2. the same script completes once a human answers, and the checkpoint step
 *      spawns NOTHING (the dispatch count is unchanged across the halt);
 *   3. a wholly mechanistic script runs to completion with no responder at all;
 *   4. at the executor choke point the checkpoint is unbypassable: the same
 *      dispatch refuses on ALL THREE seams before any process exists, and the
 *      ONLY thing that changes it into a real child pi is the human answer;
 *   5. that one human answer also carries the recursive-self-review gate — the
 *      two laws take one human act between them, not two.
 *
 * Deliberately NOT `*.test.ts`: it makes live model calls.
 *
 * Usage: node Body/S/S4/ta-onta/S4-4p-anima/tests/cpf-review-gate-live.mjs
 */

import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
	DialogicalHaltRequired,
	defineOrchestration,
	runOrchestration,
} from "../lib/vak-orchestration-surface.ts";
import {
	ChildPiDispatchRefused,
	dispatchChildPi,
} from "../lib/child-pi-executor.ts";

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

const mechanistic = (cp) => ({
	cpf: "(4.0/1-4.4/5)",
	ct: ["CT3"],
	cp,
	cf: "(4.5/0)",
	cfp: "CFP2",
	cs: { code: "CS2", direction: "Day" },
});

const dialogical = (cp) => ({
	cpf: "(00/00)",
	ct: ["CT0"],
	cp,
	cf: "(00/00)",
	cfp: "CFP0",
	cs: { code: "CS0", direction: "Day" },
});

/** The agent's authored reason. Not a policy default — a decision with a why. */
const AUTHORED = {
	reason: "implied-by-task",
	note: "the next step writes outside the workspace, so a human sees it first",
};

const work = mkdtempSync(join(tmpdir(), "cpf-gate-live-"));
writeFileSync(join(work, "alpha.txt"), "13\n", "utf8");

console.log(`\nCPF review-gate live proof — model=${MODEL}`);
console.log(`workdir: ${work}\n`);

/** Every real child pi this run spawned, in order. */
const dispatched = [];

async function realChild(step) {
	const run = await dispatchChildPi({
		seam: "agent-team",
		agentName: step.agent ?? "psyche",
		task: step.task,
		systemPrompt: `You are ${step.agent ?? "psyche"}. Answer with the integer only, no words.`,
		model: MODEL,
		toolUniverse: ["read"],
		cwd: work,
		vakAddress: step.address,
	});
	const text = (assistantText(run.stdout) || run.output).trim();
	dispatched.push({ step: step.id, exitCode: run.exitCode, text });
	console.log(`  dispatched ${step.id} -> exit ${run.exitCode}, said ${JSON.stringify(text.slice(0, 40))}`);
	return text;
}

try {
	// ── 1-2. a gated script halts, then completes on a human answer ───────────
	// CP orders the run, so the checkpoint at CP4.4 lands AFTER the real work at
	// CP4.2: the script genuinely progresses and then stops at the gate.
	const gated = defineOrchestration({
		id: "t50-09-gated",
		address: mechanistic("CP4.2"),
		steps: [
			{ id: "read-alpha", address: mechanistic("CP4.2"), task: "Read alpha.txt and reply with only the integer it contains." },
			{ id: "approve-write", address: dialogical("CP4.4"), task: "Approve the write.", checkpoint: AUTHORED },
		],
	});

	console.log("─── 1. the script runs for real, then HALTS at the authored checkpoint ───");
	let halt = null;
	try {
		await runOrchestration(gated, { execute: realChild });
		check("the gated script halted", false, "it ran to completion with no human");
	} catch (err) {
		halt = err;
	}
	check("the run halted rather than completing", halt instanceof DialogicalHaltRequired, String(halt));
	check("it halted at the checkpoint step", halt?.stepId === "approve-write", halt?.stepId);
	check("the halt names the AUTHORED reason", halt?.reason === "implied-by-task", halt?.reason);
	check(
		"the halt message carries the agent's own note",
		/writes outside the workspace/.test(halt?.message ?? ""),
		halt?.message,
	);
	// The step before the gate really ran — this is a halt, not a refusal to start.
	check("the mechanistic step before the gate dispatched a REAL child pi", dispatched.length === 1, `${dispatched.length}`);
	check("that child exited cleanly and read the real file", dispatched[0]?.exitCode === 0 && /13/.test(dispatched[0]?.text ?? ""), JSON.stringify(dispatched[0]));

	const beforeAnswer = dispatched.length;
	console.log("\n─── 2. a human answer releases it; the checkpoint step spawns NOTHING ───");
	const completed = await runOrchestration(gated, {
		execute: realChild,
		respondToHuman: (step) => {
			console.log(`  human answered at ${step.id} (${step.checkpoint?.reason}) — no child spawned`);
			return "approved";
		},
	});
	check("the run completed", completed.length === 2, `${completed.length}`);
	check("the checkpoint step is marked as halted for a human", completed.find((r) => r.stepId === "approve-write")?.haltedForHuman === true);
	check("the mechanistic step is not", completed.find((r) => r.stepId === "read-alpha")?.haltedForHuman === false);
	// One more child for the re-run's mechanistic step, and ONLY one: the human
	// answer is not a process, so the gate never became a dispatch.
	check(
		"exactly one further child pi was spawned — the checkpoint spawned none",
		dispatched.length === beforeAnswer + 1,
		`${beforeAnswer} -> ${dispatched.length}`,
	);

	// ── 3. a mechanistic script runs autonomously, no responder at all ────────
	console.log("\n─── 3. a wholly mechanistic script runs to completion autonomously ───");
	const autonomous = defineOrchestration({
		id: "t50-09-autonomous",
		address: mechanistic("CP4.2"),
		steps: [
			{ id: "auto-a", address: mechanistic("CP4.2"), task: "Read alpha.txt and reply with only the integer it contains." },
			{ id: "auto-b", address: mechanistic("CP4.3"), task: "Reply with only the integer 29." },
		],
	});
	const beforeAuto = dispatched.length;
	// No `respondToHuman` is supplied AT ALL — an autonomous run must never need one.
	const autoResults = await runOrchestration(autonomous, { execute: realChild });
	check("it ran to completion with no responder supplied", autoResults.length === 2, `${autoResults.length}`);
	check("no step halted", autoResults.every((r) => r.haltedForHuman === false));
	check("both steps spawned real child pi's", dispatched.length === beforeAuto + 2, `${beforeAuto} -> ${dispatched.length}`);
	check("both children exited cleanly", dispatched.slice(beforeAuto).every((d) => d.exitCode === 0), JSON.stringify(dispatched.slice(beforeAuto)));

	// ── 4. the checkpoint is unbypassable at the executor ─────────────────────
	console.log("\n─── 4. no seam walks around the checkpoint ───");
	const gatedDispatch = (overrides = {}) => ({
		seam: "agent-team",
		agentName: "nous",
		task: "Reply with only the integer 7.",
		systemPrompt: "You are nous. Answer with the integer only.",
		model: MODEL,
		toolUniverse: ["read"],
		cwd: work,
		vakAddress: dialogical("CP4.0"),
		checkpoint: AUTHORED,
		...overrides,
	});

	for (const seam of ["agent-team", "agent-chain", "pi-pi"]) {
		const startedAt = Date.now();
		let refusal = null;
		try {
			await dispatchChildPi(gatedDispatch({ seam }));
		} catch (err) {
			refusal = err;
		}
		const elapsed = Date.now() - startedAt;
		check(
			`${seam}: refused before any process existed`,
			refusal instanceof ChildPiDispatchRefused &&
				refusal.code === "child-pi/cpf-checkpoint-unsatisfied" &&
				refusal.seam === seam,
			`${refusal?.code ?? refusal} (${elapsed}ms)`,
		);
		// A refusal costs microseconds; a spawn costs a network round-trip. The gap
		// is the observable evidence that nothing was launched.
		check(`${seam}: the refusal cost no process launch (${elapsed}ms)`, elapsed < 250, `${elapsed}ms`);
	}

	console.log("\n  the ONLY difference: a human answered");
	const answered = await dispatchChildPi(
		gatedDispatch({ checkpoint: { ...AUTHORED, respondedBy: "human", response: "approved" } }),
	);
	const answeredText = (assistantText(answered.stdout) || answered.output).trim();
	check("the answered dispatch really spawned a child pi", answered.exitCode === 0, `exit ${answered.exitCode}`);
	check("that child really answered", /7/.test(answeredText), JSON.stringify(answeredText.slice(0, 60)));
	check("the spawn took real time (a process existed)", answered.elapsed > 200, `${answered.elapsed}ms`);

	// ── 5. one human act carries BOTH laws — when it is the SAME question ────
	console.log("\n─── 5. a review-scoped answer carries the recursive-self-review gate ───");
	const review = { decision: "approve", actor: "anima", recursiveSelfReview: true };

	let bothRefused = null;
	try {
		await dispatchChildPi(gatedDispatch({ review, checkpoint: { ...AUTHORED, validates: "review" } }));
	} catch (err) {
		bothRefused = err;
	}
	check(
		"unanswered: refused (the checkpoint bites first)",
		bothRefused instanceof ChildPiDispatchRefused &&
			bothRefused.code === "child-pi/cpf-checkpoint-unsatisfied",
		bothRefused?.code,
	);
	// The human is told WHAT they are being asked to validate — they cannot
	// final-validate a verdict they were never shown.
	check(
		"the halt discloses the pending verdict and its actor",
		/approve/.test(bothRefused?.message ?? "") &&
			/anima/.test(bothRefused?.message ?? "") &&
			/recursive self-review/.test(bothRefused?.message ?? ""),
		bothRefused?.message,
	);

	const bothPassed = await dispatchChildPi(
		gatedDispatch({
			review,
			checkpoint: { ...AUTHORED, validates: "review", respondedBy: "human", response: "approved" },
		}),
	);
	check(
		"answered ABOUT THE REVIEW: a recursive self-review by anima passes on that one human act",
		bothPassed.exitCode === 0,
		`exit ${bothPassed.exitCode}`,
	);

	// The scope is load-bearing: a human answer about the DISPATCH is not an
	// answer about the VERDICT, and must not discharge the 12.T12.4 gate.
	let unscoped = null;
	try {
		await dispatchChildPi(
			gatedDispatch({ review, checkpoint: { ...AUTHORED, respondedBy: "human", response: "ok" } }),
		);
	} catch (err) {
		unscoped = err;
	}
	check(
		"a human answer about something ELSE does NOT discharge the review gate",
		unscoped instanceof ChildPiDispatchRefused && unscoped.code === "child-pi/review-gate",
		unscoped?.code ?? String(unscoped),
	);

	// And an AGENT answer is not an answer — the bypass stays closed.
	let agentAnswer = null;
	try {
		await dispatchChildPi(
			gatedDispatch({ review, checkpoint: { ...AUTHORED, respondedBy: "agent", response: "fine" } }),
		);
	} catch (err) {
		agentAnswer = err;
	}
	check(
		"an agent answering its own checkpoint is still refused",
		agentAnswer instanceof ChildPiDispatchRefused &&
			agentAnswer.code === "child-pi/cpf-checkpoint-unsatisfied",
		agentAnswer?.code ?? String(agentAnswer),
	);
} finally {
	rmSync(work, { recursive: true, force: true });
}

console.log(
	failures.length === 0
		? `\nLIVE PROOF PASS — ${dispatched.length} real child pi dispatches; the checkpoint halted and nothing walked around it.\n`
		: `\nLIVE PROOF FAIL (${failures.length}):\n  - ${failures.join("\n  - ")}\n`,
);
process.exit(failures.length === 0 ? 0 : 1);
