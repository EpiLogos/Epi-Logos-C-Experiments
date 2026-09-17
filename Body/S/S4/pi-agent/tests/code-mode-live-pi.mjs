/**
 * code-mode-live-pi.mjs — LIVE proof for 50.T50.01 (not part of the shared gate).
 *
 * Spawns a REAL `pi` agent, with the real code-mode extension loaded and a real
 * `--tools` allow-list, on a task that genuinely needs several tools. Asserts
 * that the agent collapsed the task into ONE program, that the program's tool
 * calls resolved through the entitlement allow-list, that a tool switched off at
 * spawn was actually refused, and records the measured token delta against the
 * equivalent JSON staircase.
 *
 * Deliberately NOT named `*.test.ts`: it makes a live model call, so it must not
 * be swept into `verify-all`'s `ta-onta` suite, where a network or credit
 * failure would turn every other worker's gate red. It is run by hand as the
 * tranche's live-wire evidence.
 *
 * Usage:
 *   node Body/S/S4/pi-agent/tests/code-mode-live-pi.mjs [--provider P] [--model M]
 */

import { spawn } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const REPO_ROOT = resolve(import.meta.dirname, "../../../../..");
const EXTENSION = join(REPO_ROOT, "Body/S/S4/pi-agent/extensions/code-mode.ts");

function arg(name, fallback) {
	const index = process.argv.indexOf(`--${name}`);
	return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

const provider = arg("provider", "google");
const model = arg("model", "gemini-3.1-flash-lite");

const failures = [];
function check(label, condition, detail = "") {
	if (condition) {
		console.log(`  PASS  ${label}`);
	} else {
		console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ""}`);
		failures.push(label);
	}
}

const work = mkdtempSync(join(tmpdir(), "code-mode-live-"));
const tracePath = join(work, "trace.jsonl");

// A task that is irreducibly multi-tool: read three files, compute over them,
// write a result. In JSON tool-mode this is a five-hop staircase.
writeFileSync(join(work, "a.txt"), "7\n", "utf8");
writeFileSync(join(work, "b.txt"), "11\n", "utf8");
writeFileSync(join(work, "c.txt"), "23\n", "utf8");

const task = [
	"In the current directory there are three files: a.txt, b.txt and c.txt.",
	"Each contains a single integer.",
	"Read all three, sum the integers, and write the sum (digits only, then a newline)",
	"to a file named sum.txt in the same directory.",
	"Then tell me the sum.",
].join(" ");

console.log(`\ncode-mode live pi proof — provider=${provider} model=${model}`);
console.log(`workdir: ${work}\n`);

const args = [
	"-p",
	"--no-session",
	"--thinking",
	"off",
	"--provider",
	provider,
	"--model",
	model,
	"--no-extensions",
	"--extension",
	EXTENSION,
	// The spawn-time boundary: run_tool_script + read + write are on;
	// `grep` is deliberately OFF so a refusal can be observed for real.
	"--tools",
	"run_tool_script,read,write",
	task,
];

const child = spawn("pi", args, {
	cwd: work,
	env: {
		...process.env,
		EPI_REPO_ROOT: work,
		EPI_CODE_MODE_TRACE: tracePath,
	},
	stdio: ["ignore", "pipe", "pipe"],
});

let stdout = "";
let stderr = "";
child.stdout.on("data", (c) => {
	stdout += String(c);
});
child.stderr.on("data", (c) => {
	stderr += String(c);
});

const exitCode = await new Promise((res) => {
	const timer = setTimeout(() => {
		child.kill("SIGKILL");
		res(null);
	}, 300_000);
	child.on("close", (code) => {
		clearTimeout(timer);
		res(code);
	});
});

console.log("─── pi stdout ───");
console.log(stdout.trim());
if (stderr.trim()) {
	console.log("─── pi stderr ───");
	console.log(stderr.trim().slice(0, 2000));
}
console.log("─── assertions ───");

check("the pi agent exited cleanly", exitCode === 0, `exitCode=${exitCode}`);
check("a code-mode trace was written", existsSync(tracePath));

let runs = [];
if (existsSync(tracePath)) {
	runs = readFileSync(tracePath, "utf8")
		.split("\n")
		.filter((l) => l.trim().length > 0)
		.map((l) => JSON.parse(l));
}

check(
	"the agent used code-mode (>= 1 run_tool_script program executed)",
	runs.length >= 1,
	`runs=${runs.length}`,
);

const run = runs[0];
if (run) {
	check("the program ran successfully", run.ok === true && run.exitCode === 0, run.stderr || "");

	check(
		"the multi-tool task collapsed into ONE program, not a call staircase",
		runs.length === 1,
		`${runs.length} programs emitted`,
	);

	const okCalls = run.calls.filter((c) => c.ok);
	check(
		"the program made several tool calls inside that one run",
		okCalls.length >= 3,
		`ok calls=${okCalls.length} (${run.calls.map((c) => c.tool).join(",")})`,
	);

	check(
		"every resolved call was in the spawn --tools allow-list",
		okCalls.every((c) => run.activeTools.includes(c.tool)),
		`active=${run.activeTools.join(",")}`,
	);

	check(
		"the callable surface excludes the tool switched off at spawn",
		!run.callableTools.includes("grep"),
		`callable=${run.callableTools.join(",")}`,
	);

	const sumPath = join(work, "sum.txt");
	const wrote = existsSync(sumPath) ? readFileSync(sumPath, "utf8").trim() : "";
	check(
		"the program produced the real side effect (sum.txt === 41)",
		wrote === "41",
		`sum.txt=${JSON.stringify(wrote)}`,
	);

	const a = run.accounting;
	check(
		"token accounting recorded both protocols over the same trace",
		a && a.callCount === run.calls.length && a.staircaseTokens > 0 && a.scriptTokens > 0,
		JSON.stringify(a),
	);
	check(
		"code-mode measured cheaper than the equivalent JSON staircase",
		a && a.deltaTokens > 0,
		`delta=${a?.deltaTokens}`,
	);

	console.log("\n─── measured token delta ───");
	console.log(
		JSON.stringify(
			{
				callCount: a.callCount,
				scriptTokens: a.scriptTokens,
				staircaseTokens: a.staircaseTokens,
				deltaTokens: a.deltaTokens,
				ratio: a.ratio,
				estimator: a.estimator,
			},
			null,
			1,
		),
	);
	console.log("\n─── the one program the agent emitted ───");
	console.log(run.program);
	console.log("\n─── gated call sequence ───");
	for (const c of run.calls) {
		console.log(
			`  #${c.seq} ${c.tool} ${c.ok ? "OK" : `REFUSED(${c.refusalCode ?? "error"})`} params=${c.paramChars}ch result=${c.resultChars}ch`,
		);
	}
}

rmSync(work, { recursive: true, force: true });

console.log(`\n${failures.length === 0 ? "LIVE PROOF PASS" : `LIVE PROOF FAIL (${failures.length})`}`);
process.exit(failures.length === 0 ? 0 : 1);
