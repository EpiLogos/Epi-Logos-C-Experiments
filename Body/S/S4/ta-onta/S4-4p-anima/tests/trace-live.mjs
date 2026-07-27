/**
 * trace-live.mjs — LIVE proof for 50.T50.14 (not part of the shared gate).
 *
 * The tranche's claim: "a completed orchestration produces a deterministic
 * trace that feeds `aeon_eval` and a distillation JSONL row; replay reproduces
 * the metrics."
 *
 * This proves the whole chain with nothing stubbed:
 *
 *   1. a real `epi gate start` is listening;
 *   2. a score is persisted and RE-RUN through `rerunScore` — the production
 *      seam — carrying the ops the script performed;
 *   3. the trace lands in the REAL session transcript on disk, under its own
 *      kind, alongside ordinary messages;
 *   4. the distillation row is written and is accepted by the REAL
 *      `distill_dataset_gen.py` that consumes it — the contract is checked by
 *      the consumer, not by a restatement of it here;
 *   5. replaying the same score reproduces the trace byte-for-byte;
 *   6. a run that cannot declare its annotation channels is REFUSED, and
 *      `user_articulation_simulation` is named — it has no producer in any run.
 *
 * The METRICS are derived Rust-side; that half is proven in
 * `epi-cli/tests/gate_orchestration_trace.rs`, which reads this same file shape
 * through `aeon_eval` end to end.
 *
 * Usage: node Body/S/S4/ta-onta/S4-4p-anima/tests/trace-live.mjs [--port N]
 */

import { spawn, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { connect } from "node:net";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { persistScore, rerunScore } from "../extension/dispatch.ts";
import { defineOrchestration } from "../lib/vak-orchestration-surface.ts";
import { DistillationDeclarationError } from "../modules/orchestration-trace.ts";

const repoRoot = resolve(fileURLToPath(new URL("../../../../../..", import.meta.url)));
const EPI_BIN = process.env.EPI_BIN ?? join(repoRoot, "target", "debug", "epi");
const DISTILL_GEN = join(
	repoRoot,
	"Body/S/S5/plugins/epi-logos/skills/custom/epii-distillation/scripts/distill_dataset_gen.py",
);
const portArg = process.argv.indexOf("--port");
const PORT = portArg > -1 ? Number(process.argv[portArg + 1]) : 18988;

const failures = [];
function check(label, condition, detail = "") {
	if (condition) console.log(`  PASS  ${label}`);
	else {
		console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ""}`);
		failures.push(label);
	}
}

function waitForPort(port, timeoutMs) {
	const deadline = Date.now() + timeoutMs;
	return new Promise((done, fail) => {
		const attempt = () => {
			const socket = connect({ port, host: "127.0.0.1" }, () => {
				socket.destroy();
				done();
			});
			socket.on("error", () => {
				socket.destroy();
				if (Date.now() > deadline) fail(new Error(`port ${port} did not open`));
				else setTimeout(attempt, 400);
			});
		};
		attempt();
	});
}

const ADDRESS = {
	cpf: "(4.0/1-4.4/5)",
	ct: ["CT2"],
	cp: "CP4.2",
	cf: "(4.0/1-4.4/5)",
	cfp: "CFP2",
	cs: { code: "CS2", direction: "Day" },
};

/** What the code-mode script actually did inside its one turn. */
const OPS = [
	{ stepId: "survey", operation: "read", agent: "logos" },
	{ stepId: "survey", operation: "rg", agent: "logos" },
	{ stepId: "survey", operation: "read", agent: "logos" },
	{ stepId: "land", operation: "apply_patch", agent: "anima" },
	{
		stepId: "prove",
		operation: "bash",
		command: "cargo test --offline -p portal-core",
		agent: "anima",
	},
	{ stepId: "prove", operation: "read", agent: "anima" },
];

const DECLARATION = { lens_coherence: 0.9, verifier_pass: 1, user_articulation_simulation: 0.5 };

const work = mkdtempSync(join(tmpdir(), "trace-live-"));
const gateRoot = join(work, "gate");
const corpus = join(work, "distillation.jsonl");
process.env.EPI_SCORES_DIR = join(work, "scores");
process.env.EPI_GATEWAY_URL = `ws://127.0.0.1:${PORT}`;

console.log(`\ndeterministic orchestration trace — live (port=${PORT})`);
console.log(`workdir: ${work}\n`);

const gateway = spawn(EPI_BIN, ["gate", "start", "--port", String(PORT)], {
	env: { ...process.env, EPI_GATE_STATE_ROOT: gateRoot, EPI_REPO_ROOT: repoRoot },
	stdio: ["ignore", "pipe", "pipe"],
});
let gatewayLog = "";
gateway.stdout.on("data", (c) => (gatewayLog += c));
gateway.stderr.on("data", (c) => (gatewayLog += c));

/** Read the transcript the gateway actually wrote. */
function transcriptLines() {
	const dir = join(gateRoot, "transcripts");
	const files = readdirSync(dir).filter((name) => name.endsWith(".jsonl"));
	return files.flatMap((name) =>
		readFileSync(join(dir, name), "utf8")
			.split("\n")
			.filter((line) => line.trim())
			.map((line) => JSON.parse(line)),
	);
}

try {
	await waitForPort(PORT, 25000);
	console.log("─── 0. a real gateway is listening ───");
	check("epi gate start came up", true);

	console.log("\n─── 1. a score re-run through the production seam ───");
	const orchestration = defineOrchestration({
		id: "trace-live",
		address: ADDRESS,
		steps: [
			{ id: "survey", address: ADDRESS, task: "survey", agent: "logos" },
			{ id: "land", address: ADDRESS, task: "land", agent: "anima" },
			{ id: "prove", address: ADDRESS, task: "prove", agent: "anima" },
		],
	});
	const score = persistScore({
		scoreId: "trace-live",
		orchestration,
		originatedAt: "2026-07-27T09:00:00.000Z",
		task: "sweep the inbox and file what is actionable",
	});
	check("the score persisted with a content hash", score.hash?.length === 64, score.hash);

	const run = await rerunScore({
		scoreId: "trace-live",
		at: "2026-07-27T09:30:00.000Z",
		run: () => "swept 4 items",
		trace: {
			sessionKey: "agent:anima:main",
			ops: OPS,
			usage: { turns: 1, inputTokens: 900, outputTokens: 300, totalTokens: 1200 },
			distillation: {
				teacherOutput: "swept 4 items",
				declaration: DECLARATION,
				path: corpus,
			},
		},
	});
	check("run completion returned a trace receipt", Boolean(run.trace), JSON.stringify(run.trace));
	check("the gateway recorded every op", run.trace?.ops === 6, String(run.trace?.ops));

	console.log("\n─── 2. the trace is in the real transcript ───");
	const entries = transcriptLines();
	const traces = entries.filter((entry) => entry.kind === "orchestration_trace");
	check("the transcript carries the trace", traces.length === 1, `${traces.length} found`);
	const written = traces[0]?.orchestration_trace ?? {};
	check("it carries the program identity", written.scoreHash === score.hash, written.scoreHash);
	check("it carries the ops, in order", JSON.stringify(written.ops) === JSON.stringify(OPS));
	check("it carries the turns the run ACTUALLY took", written.usage?.turns === 1);
	check("the step coordinate rode along", traces[0]?.vak_address?.cf === "(4.0/1-4.4/5)");

	console.log("\n─── 3. the distillation row is accepted by its real consumer ───");
	const rows = readFileSync(corpus, "utf8").trim().split("\n");
	check("one row per run", rows.length === 1, `${rows.length}`);
	const row = JSON.parse(rows[0]);
	check("the prompt is the task the score expresses", row.prompt === "sweep the inbox and file what is actionable", row.prompt);
	check("the teacher output is what the run produced", row.teacher_output === "swept 4 items");
	check("provenance ties the row to the exact program", row.provenance?.scoreHash === score.hash);
	// The contract is checked by the script that consumes it, not restated here.
	const generated = join(work, "dataset.jsonl");
	const gen = spawnSync("python3", [DISTILL_GEN, "--source-jsonl", corpus, "--output-jsonl", generated], {
		encoding: "utf8",
	});
	check("distill_dataset_gen.py ACCEPTS the row", gen.status === 0, `${gen.stderr || gen.stdout}`.trim());
	if (gen.status === 0) {
		const emitted = JSON.parse(readFileSync(generated, "utf8").trim().split("\n")[0]);
		check(
			"all three annotation channels survived into the dataset",
			["lens_coherence", "verifier_pass", "user_articulation_simulation"].every(
				(channel) => channel in emitted.annotations,
			),
			JSON.stringify(emitted.annotations),
		);
	}

	console.log("\n─── 4. replay reproduces the trace ───");
	await rerunScore({
		scoreId: "trace-live",
		at: "2026-07-27T10:30:00.000Z",
		run: () => "swept 4 items",
		trace: { sessionKey: "agent:anima:replay", ops: OPS, usage: { turns: 1, inputTokens: 900, outputTokens: 300, totalTokens: 1200 } },
	});
	const replayed = transcriptLines().filter((entry) => entry.kind === "orchestration_trace");
	check("the replay wrote its own trace", replayed.length === 2, String(replayed.length));
	const [first, second] = replayed.map((entry) => entry.orchestration_trace);
	check(
		"the same score yields a byte-identical trace",
		JSON.stringify({ ...first, runId: null }) === JSON.stringify({ ...second, runId: null }),
	);
	check("both runs name the same program", first?.scoreHash === second?.scoreHash);

	console.log("\n─── 5. an undeclared channel is refused ───");
	let refusal = null;
	try {
		await rerunScore({
			scoreId: "trace-live",
			at: "2026-07-27T11:30:00.000Z",
			run: () => "swept",
			trace: {
				sessionKey: "agent:anima:main",
				ops: OPS,
				distillation: {
					teacherOutput: "swept",
					// The channel no orchestration can produce.
					declaration: { lens_coherence: 0.9, verifier_pass: 1 },
					path: corpus,
				},
			},
		});
	} catch (error) {
		refusal = error;
	}
	check("the row was refused", refusal instanceof DistillationDeclarationError, String(refusal));
	check(
		"the refusal names user_articulation_simulation",
		/user_articulation_simulation/.test(String(refusal?.message)),
	);
	check(
		"no fabricated row reached the corpus",
		readFileSync(corpus, "utf8").trim().split("\n").length === 1,
	);
} catch (error) {
	check("live run completed without throwing", false, String(error?.stack ?? error));
} finally {
	gateway.kill("SIGTERM");
	await new Promise((r) => setTimeout(r, 300));
	if (!gateway.killed) gateway.kill("SIGKILL");
	rmSync(work, { recursive: true, force: true });
}

console.log("");
if (failures.length > 0) {
	console.log(`FAILED — ${failures.length} check(s): ${failures.join(", ")}`);
	if (gatewayLog.trim()) console.log(`\ngateway log:\n${gatewayLog.slice(-4000)}`);
	process.exit(1);
}
console.log("All live checks passed.");
