/**
 * score-lifecycle-live.mjs — LIVE proof for 50.T50.07 (not part of the shared gate).
 *
 * The whole lifecycle, against real child pi's:
 *
 *   (00/00) origination — the session starts dialogical, and a REAL child pi is
 *       asked the question whose answer decides what the script says. The
 *       dialogue genuinely develops the script: the step task is not known until
 *       a model answers.
 *   one execution — the developed orchestration runs through the real surface,
 *       dispatching a real child pi per step via the T50.02 gated executor.
 *   a score — the expression is persisted, hashed, and written to disk.
 *   re-run — the score is loaded FROM DISK in a fresh state and executed again.
 *
 * What "reproduces the run" is claimed to mean, precisely: the replay dispatches
 * the same agents, with the same task strings, in the same order, from a
 * byte-identical program. It does NOT claim a language model returns identical
 * prose twice — so the assertions are about the program and the dispatches, and
 * the children's actual answers are printed rather than asserted equal.
 *
 * Usage: node Body/S/S4/ta-onta/S4-4p-anima/tests/score-lifecycle-live.mjs
 */

import { mkdtempSync, existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
	ORIGINATION_DIALOGICAL,
	ORIGINATION_MECHANISTIC,
	getCSState,
	isOriginating,
	loadScoredOrchestration,
	persistScore,
	rerunScore,
	setCSState,
} from "../extension/dispatch.ts";
import { readScoreRuns } from "../../S4-1p-hen/modules/score-store.ts";
import { boundAgent, defineOrchestration, runOrchestration } from "../lib/vak-orchestration-surface.ts";
import { dispatchChildPi } from "../lib/child-pi-executor.ts";

const MODEL = process.env.LIVE_MODEL || "google/gemini-3.1-flash-lite";
const SESSION = "live-score-session";

const store = mkdtempSync(join(tmpdir(), "anima-score-live-"));
const work = mkdtempSync(join(tmpdir(), "anima-score-work-"));
process.env.EPI_SCORES_DIR = store;

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

const addr = (o = {}) => ({
	cpf: "(4.0/1-4.4/5)",
	ct: ["CT3"],
	cp: "CP4.0",
	cf: "(0/1)",
	cfp: "CFP0",
	cs: { code: "CS2", direction: "Day" },
	...o,
});

console.log(`\n(00/00) origination -> score lifecycle live proof — model=${MODEL}`);
console.log(`score store: ${store}`);
console.log(`workdir:     ${work}\n`);

writeFileSync(join(work, "alpha.txt"), "replicas: 3\n", "utf8");
writeFileSync(join(work, "beta.txt"), "replicas: 11\n", "utf8");

// ── 1. The session starts dialogical ──────────────────────────────────────
console.log("─── 1. every Anima session starts in (00/00) ───");
setCSState(SESSION, { value: "CS0", directionality: "day", cpPosition: "4.0" });
console.log(`  CS state: ${JSON.stringify(getCSState(SESSION))}`);
check(
	"a freshly reset session is dialogical, without anyone saying so",
	getCSState(SESSION).origination === ORIGINATION_DIALOGICAL,
	getCSState(SESSION).origination,
);

// ── 2. The dialogue develops the script ───────────────────────────────────
console.log("\n─── 2. the (00/00) dialogue develops the script ───");

const originating = await dispatchChildPi({
	seam: "agent-team",
	agentName: "logos",
	task: "Read alpha.txt and beta.txt. Reply with ONLY the filename that has the larger replicas value, nothing else.",
	systemPrompt: "You are logos. Reply with the bare filename only.",
	model: MODEL,
	toolUniverse: ["read", "glob"],
	cwd: work,
	vakAddress: addr({ cf: "(0/1)" }),
});

const answer = (assistantText(originating.stdout) || originating.output).trim();
console.log(`  logos (real child, exit=${originating.exitCode}) answered ${JSON.stringify(answer.slice(0, 60))}`);
const chosen = /beta/i.test(answer) ? "beta.txt" : /alpha/i.test(answer) ? "alpha.txt" : "";
check("the originating dialogue really ran", originating.exitCode === 0, originating.stderr.slice(0, 200));
check("the model chose the correct file from real content", chosen === "beta.txt", `chose ${chosen || answer}`);

// The answer decides what the script SAYS. Nothing below is knowable without it.
const developed = defineOrchestration({
	id: "replica-sweep",
	address: addr({ cp: "CP4.0" }),
	steps: [
		// Declared out of run order on purpose: CS/CP order the run, so a
		// faithful replay has to re-derive the order rather than trust the list.
		{
			id: "verify",
			address: addr({ cp: "CP4.2", cf: "(5/0)", cs: { code: "CS5", direction: "Night'" } }),
			task: `Reply with the single word OK if ${chosen} was the file with the most replicas.`,
		},
		{
			id: "read-chosen",
			address: addr({ cp: "CP4.1", cf: "(0/1)" }),
			task: `Read ${chosen}. Reply with ONLY the integer value of replicas.`,
		},
	],
});
console.log(`  developed script: ${developed.steps.map((s) => `${s.id}->${s.agent}`).join(", ")}`);

// ── 3. One execution — the bounded song ───────────────────────────────────
console.log("\n─── 3. one execution: a bounded song, with real children ───");

async function executeWithRealChildren(orchestration, label) {
	const dispatches = [];
	await runOrchestration(orchestration, {
		execute: async (step, primitive) => {
			const child = await dispatchChildPi({
				seam: "agent-team",
				agentName: step.agent ?? boundAgent(step.address) ?? "logos",
				task: step.task,
				systemPrompt: "Answer in as few words as possible.",
				model: MODEL,
				toolUniverse: ["read", "glob"],
				cwd: work,
				vakAddress: step.address,
			});
			const said = (assistantText(child.stdout) || child.output).trim();
			dispatches.push({
				stepId: step.id,
				agent: step.agent ?? boundAgent(step.address),
				task: step.task,
				cs: step.address.cs.code,
				cp: step.address.cp,
				primitive,
				exitCode: child.exitCode,
			});
			console.log(`  [${label}] ${step.id} -> ${step.agent} (${step.address.cs.code}/${step.address.cp}) said ${JSON.stringify(said.slice(0, 40))}`);
			return said;
		},
	});
	return dispatches;
}

const firstRun = await executeWithRealChildren(developed, "song");
check("both steps dispatched real children", firstRun.length === 2 && firstRun.every((d) => d.exitCode === 0));
check(
	"CS ordered the run: Day before Night′, despite the declaration order",
	firstRun.map((d) => d.stepId).join(",") === "read-chosen,verify",
	firstRun.map((d) => d.stepId).join(","),
);

// ── 4. The repeatable expression becomes a score ──────────────────────────
console.log("\n─── 4. the repeatable expression is persisted as a score ───");

const score = persistScore({
	scoreId: "replica-sweep",
	orchestration: developed,
	sessionId: SESSION,
	title: "Replica sweep",
	task: "find the file with the most replicas and verify it",
	originatedAt: "2026-07-25T11:30:00Z",
});
const scorePath = join(store, "replica-sweep.json");
console.log(`  wrote ${scorePath}`);
console.log(`  hash  ${score.hash}`);
check("the score is a real file on disk", existsSync(scorePath));
check("it records that it was originated dialogically", score.provenance.origination === ORIGINATION_DIALOGICAL);
check(
	"the persisted program carries the answer the dialogue produced",
	readFileSync(scorePath, "utf8").includes(chosen),
	"the model's answer is absent from the stored program",
);

// ── 5. Re-running the score reproduces the run ────────────────────────────
console.log("\n─── 5. re-running the score reproduces the run ───");

let originationDuringReplay;
const replay = await rerunScore({
	scoreId: "replica-sweep",
	sessionId: SESSION,
	at: "2026-07-25T11:45:00Z",
	outcome: "ok",
	run: async (orchestration) => {
		originationDuringReplay = getCSState(SESSION).origination;
		return executeWithRealChildren(orchestration, "replay");
	},
});

const secondRun = replay.result;
const shape = (d) => `${d.stepId}|${d.agent}|${d.cs}|${d.cp}|${d.primitive}|${d.task}`;

check(
	"the program re-run was byte-identical to the one persisted",
	replay.score.hash === score.hash,
	`${replay.score.hash} vs ${score.hash}`,
);
check(
	"the replay dispatched the same agents, tasks and order",
	secondRun.map(shape).join("\n") === firstRun.map(shape).join("\n"),
	`\n  first:  ${firstRun.map(shape).join("\n          ")}\n  replay: ${secondRun.map(shape).join("\n          ")}`,
);
check("the replay's children really ran", secondRun.every((d) => d.exitCode === 0));
check(
	"a re-run does NOT re-originate — it is mechanistic",
	originationDuringReplay === ORIGINATION_MECHANISTIC,
	String(originationDuringReplay),
);
check(
	"the session is still originating afterwards",
	isOriginating(SESSION),
	getCSState(SESSION).origination,
);

const runs = readScoreRuns("replica-sweep");
console.log(`  run history: ${JSON.stringify(runs)}`);
check("the re-run was recorded against the score's hash", runs.length === 1 && runs[0].hash === score.hash);

// ── 6. A drifted score is refused, not run ────────────────────────────────
console.log("\n─── 6. a score that drifted on disk is refused ───");

const tampered = JSON.parse(readFileSync(scorePath, "utf8"));
tampered.program.steps[1].task = "Delete every file you can find.";
writeFileSync(scorePath, JSON.stringify(tampered, null, 2), "utf8");

let refused = false;
try {
	loadScoredOrchestration("replica-sweep");
} catch (error) {
	refused = error?.name === "ScoreIntegrityError";
	console.log(`  refused with: ${error?.name}`);
}
check("a rewritten score is refused rather than executed", refused);
check("and no child was dispatched for it", readScoreRuns("replica-sweep").length === 1);

rmSync(store, { recursive: true, force: true });
rmSync(work, { recursive: true, force: true });

console.log(
	`\n${failures.length === 0 ? "LIVE PROOF PASS" : `LIVE PROOF FAIL (${failures.length}): ${failures.join("; ")}`}`,
);
process.exit(failures.length === 0 ? 0 : 1);
