/**
 * tilldone-l-thread-live.mjs — LIVE proof for 50.T50.06 (not part of the shared gate).
 *
 * Two claims, both proved against a REAL pi child running the REAL registered
 * tool — no stub task list anywhere in this file.
 *
 *   1. CFP4's name is no longer dangling. A child pi is spawned with the
 *      Pleroma-resident `tilldone` extension and `--tools tilldone`, and the
 *      child's own JSON stream is inspected for genuine `tool_execution_end`
 *      frames naming that tool. The task list the gate reads is the `details`
 *      payload the tool itself emitted.
 *
 *   2. The gate is real in both directions. A workflow whose tasks the child
 *      actually completes CLOSES; a workflow whose done-condition can never be
 *      satisfied KEEPS RUNNING to its bound and reports itself unclosed.
 *
 * Usage: node Body/S/S4/ta-onta/S4-4p-anima/tests/tilldone-l-thread-live.mjs
 */

import { spawn } from "node:child_process";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { runLThread, tillDoneGate } from "../S4/tilldone.ts";
import { TOOL_CAPABILITIES, capabilitiesFor, conventionalToolFor, shapeOf } from "../extension/dispatch.ts";

const MODEL = process.env.LIVE_MODEL || "google/gemini-3.1-flash-lite";
// fileURLToPath, not URL.pathname: the repo path contains spaces, which
// pathname percent-encodes into a directory that does not exist.
const REPO_ROOT = fileURLToPath(new URL("../../../../../../", import.meta.url));

const failures = [];
function check(label, condition, detail = "") {
	if (condition) console.log(`  PASS  ${label}`);
	else {
		console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ""}`);
		failures.push(label);
	}
}

/**
 * Spawn one real pi child with the registered tilldone tool loaded.
 * Returns the raw JSON-mode stdout.
 */
function runChild(prompt) {
	const registration = TOOL_CAPABILITIES.tilldone;
	const args = [
		"--mode",
		"json",
		"-p",
		"--no-session",
		"--no-extensions",
		"--no-skills",
		// The tool is loaded from where the REGISTRY says it lives. If that path
		// were wrong, this proof could not run at all.
		"-e",
		join(REPO_ROOT, registration.body),
		"--tools",
		registration.tool,
		"--model",
		MODEL,
		"--thinking",
		"off",
		prompt,
	];

	return new Promise((resolve) => {
		const proc = spawn("pi", args, { stdio: ["ignore", "pipe", "pipe"], cwd: REPO_ROOT });
		let stdout = "";
		let stderr = "";
		proc.stdout.setEncoding("utf8");
		proc.stderr.setEncoding("utf8");
		proc.stdout.on("data", (c) => (stdout += c));
		proc.stderr.on("data", (c) => (stderr += c));
		proc.on("close", (code) => resolve({ stdout, stderr, exitCode: code ?? 1, args }));
		proc.on("error", (err) => resolve({ stdout, stderr: err.message, exitCode: 1, args }));
	});
}

/** Every real `tilldone` tool execution the child performed. */
function tillDoneExecutions(stdout) {
	const executions = [];
	for (const line of stdout.split("\n")) {
		if (!line.trim()) continue;
		try {
			const frame = JSON.parse(line);
			if (frame.type === "tool_execution_end" && frame.toolName === "tilldone") {
				executions.push(frame);
			}
		} catch {
			/* not a frame */
		}
	}
	return executions;
}

/** The task list as the registered tool last reported it. */
function taskListFrom(stdout) {
	const executions = tillDoneExecutions(stdout);
	const last = executions[executions.length - 1];
	const details = last?.result?.details;
	return details ? { tasks: details.tasks ?? [], listTitle: details.listTitle } : undefined;
}

console.log(`\nCFP4 L-Thread completion-gate live proof — model=${MODEL}`);

// ── 0. The name resolves to a tool the harness can actually load ──────────
console.log("\n─── 0. threads are shapes; tools are capabilities ───");
const registration = TOOL_CAPABILITIES.tilldone;
const lThread = shapeOf("CFP4");
console.log(`  CFP4 shape: ${lThread.thread} — autonomy=${lThread.autonomy} completion=${lThread.completion}`);
console.log(`  CFP4 conventional tool: ${conventionalToolFor("CFP4")}  (Long is a duration property, not a primitive)`);
console.log(`  capabilities offered to that shape: ${capabilitiesFor(lThread).map((c) => c.tool).join(", ")}`);
console.log(`  body:      ${registration.body}`);
console.log(`  registrar: ${registration.registrar}`);
console.log(`  executor:  ${registration.executor}`);
check("CFP4 names no tool — the old bijection is gone", conventionalToolFor("CFP4") === null);
check(
	"the completion gate is offered to the shape that declares it",
	capabilitiesFor(lThread).some((c) => c.tool === "tilldone"),
);
check("the tool resides in Pleroma, not Anima (12.T12.11)", /S4-2p-pleroma/.test(registration.body));

/**
 * The run's task list, held by the PARENT across children (50.T50.05).
 *
 * Each cycle spawns a fresh `--no-session` child, so a child's own tilldone
 * state dies with it. Anima holds the run, so the parent accumulates: a child
 * is asked to work ONE outstanding item and report through the real tool, and
 * whatever it marks `done` is merged into the parent's list by task text. The
 * transitions are the model's real tool calls; the parent only accumulates them.
 */
function mergeChildProgress(runTasks, childList) {
	if (!childList) return runTasks;
	return runTasks.map((task) => {
		const reported = childList.tasks.find(
			(t) => t.text.trim().toLowerCase() === task.text.trim().toLowerCase(),
		);
		// Progress only moves forward: a fresh child cannot un-do earlier work.
		if (reported?.status === "done") return { ...task, status: "done" };
		return task;
	});
}

function workOneItemPrompt(outstanding, nudge) {
	return (
		`Use the tilldone tool. Create a new list titled "live" containing exactly one task: "${outstanding.text}". ` +
		`Then toggle that task through to done (idle -> inprogress -> done) with tilldone toggle. ` +
		`Do not add any other task. Reply with nothing else.${nudge}`
	);
}

// ── 1. A thread whose tasks really get done CLOSES — over several cycles ──
console.log("\n─── 1. the gate keeps a thread running until its real tasks are done ───");

// Two items, one child per cycle: the thread CANNOT close on cycle 1, so the
// "keeps running" half is exercised by real work rather than by a bound.
let closingRun = [
	{ id: 1, text: "alpha", status: "inprogress" },
	{ id: 2, text: "beta", status: "idle" },
];
let closingExecutions = 0;

const closing = await runLThread({
	id: "live-closing",
	address: { cfp: "CFP4" },
	maxCycles: 4,
	perform: async (cycle, previous) => {
		const outstanding = closingRun.find((t) => t.status !== "done");
		const nudge = previous ? `\n\n[tilldone] ${previous.reason}` : "";
		const child = await runChild(workOneItemPrompt(outstanding, nudge));
		const executions = tillDoneExecutions(child.stdout);
		closingExecutions += executions.length;
		const childList = taskListFrom(child.stdout);
		closingRun = mergeChildProgress(closingRun, childList);
		console.log(
			`  cycle ${cycle}: worked "${outstanding.text}" — child exit=${child.exitCode}, ` +
				`${executions.length} real tilldone execution(s); run now ${JSON.stringify(closingRun.map((t) => `${t.text}:${t.status}`))}`,
		);
		if (executions.length === 0 && child.stderr) {
			console.log(`    stderr: ${child.stderr.slice(0, 300)}`);
		}
		return `cycle ${cycle}: ${outstanding.text}`;
	},
	readTaskList: () => ({ tasks: closingRun, listTitle: "live" }),
});

console.log(`  final run list: ${JSON.stringify(closingRun)}`);
console.log(`  final verdict:  ${closing.finalVerdict.code}`);

check(
	"the children made REAL tilldone tool calls (the name is not dangling)",
	closingExecutions > 0,
	"no tool_execution_end frames named tilldone",
);
check(
	"the thread did NOT close on cycle 1, because work remained",
	closing.cycles.length >= 2 && closing.cycles[0].verdict.complete === false,
	`cycle 1 verdict was ${closing.cycles[0]?.verdict.code}`,
);
check(
	"each unfinished cycle reported the real remaining work",
	closing.cycles.slice(0, -1).every((c) => c.verdict.remaining.length > 0),
	JSON.stringify(closing.cycles.map((c) => c.verdict.code)),
);
check("the L-Thread CLOSED once every task was really done", closing.closed === true, closing.reason ?? "");
check(
	"it closed on the done-condition, not on exhaustion",
	closing.finalVerdict.code === "tilldone/complete" && closing.cycles.length < 4,
	`${closing.finalVerdict.code} after ${closing.cycles.length}/4 cycles`,
);
check(
	"the gate's own reading agrees with the accumulated run state",
	tillDoneGate({ tasks: closingRun }).complete === true,
	JSON.stringify(closingRun),
);
console.log(`  closed after ${closing.cycles.length} cycle(s) (max 4)`);

// ── 2. A thread whose condition cannot hold KEEPS RUNNING ─────────────────
console.log("\n─── 2. the gate refuses to close a thread that is not done ───");

// Same real children, same real tool — but the run carries a third item no
// child is ever asked to work. Nothing here forces the outcome: the item simply
// never gets done, so the gate must never say complete. A completion gate that
// only ever says "yes" is not a gate.
let openRun = [
	{ id: 1, text: "alpha", status: "inprogress" },
	{ id: 2, text: "never-assigned", status: "idle" },
];
let openExecutions = 0;

const open = await runLThread({
	id: "live-open",
	address: { cfp: "CFP4" },
	maxCycles: 2,
	perform: async (cycle, previous) => {
		const nudge = previous ? `\n\n[tilldone] ${previous.reason}` : "";
		// Always dispatched against the FIRST item only; item 2 is never worked.
		const child = await runChild(workOneItemPrompt(openRun[0], nudge));
		openExecutions += tillDoneExecutions(child.stdout).length;
		openRun = mergeChildProgress(openRun, taskListFrom(child.stdout));
		console.log(
			`  cycle ${cycle}: child exit=${child.exitCode}, run now ${JSON.stringify(openRun.map((t) => `${t.text}:${t.status}`))}`,
		);
		return `cycle ${cycle}`;
	},
	readTaskList: () => ({ tasks: openRun, listTitle: "partial" }),
});

console.log(`  final run list: ${JSON.stringify(openRun)}`);
console.log(`  final verdict: ${open.finalVerdict.code}`);
check("the children ran for real in this half too", openExecutions > 0, `${openExecutions} executions`);
check(
	"the unassigned task genuinely never completed",
	openRun.some((t) => t.text === "never-assigned" && t.status !== "done"),
	JSON.stringify(openRun),
);
check("the L-Thread did NOT close", open.closed === false, "it closed on an incomplete list");
check("it ran every allowed cycle instead of stopping early", open.cycles.length === 2, `${open.cycles.length}`);
check(
	"exhaustion is reported as exhaustion, never as completion",
	/did not reach its done-condition/.test(open.reason ?? ""),
	open.reason ?? "",
);
check("the final verdict is not complete", open.finalVerdict.complete === false, open.finalVerdict.code);

console.log(
	`\n${failures.length === 0 ? "LIVE PROOF PASS" : `LIVE PROOF FAIL (${failures.length}): ${failures.join("; ")}`}`,
);
process.exit(failures.length === 0 ? 0 : 1);
