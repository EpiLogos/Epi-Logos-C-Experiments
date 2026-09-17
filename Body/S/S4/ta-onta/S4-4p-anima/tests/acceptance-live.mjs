/**
 * acceptance-live.mjs — END-TO-END acceptance for 50.T50.15 (not part of the shared gate).
 *
 * The tranche's claim, in one sentence: "an Anima orchestration originated in
 * `(00/00)`, composed across the six coordinates with CP-nesting, executed
 * through the unified seam spawning child pi's, gated by `tilldone`, producing a
 * persisted score, a `portal.vak_eval` event, a Mercurius ELO trial, and a
 * deterministic training trace — with the token cost measured against the
 * equivalent JSON staircase."
 *
 * This is ONE run of that whole path, with nothing stubbed. Every leg is the
 * production seam the earlier tranches landed, not a restatement of it:
 *
 *   T50.07  the score ORIGINATES in `(00/00)` dialogue — and a mechanistic
 *           session is refused, so the polarity is load-bearing;
 *   T50.03  the orchestration composes across ALL SIX C' coordinates
 *           (`composedCoordinates` returns six, not "six fields were present");
 *   T50.09  an agent-AUTHORED `(00/00)` checkpoint halts the run for a human;
 *   T50.01  one step is a real code-mode PROGRAM — a `node` child process whose
 *           tool calls cross the gated bridge — and its token accounting is the
 *           measurement against the JSON staircase over identical work;
 *   T50.04  one step is a >=2-deep CP-nested frame, its CP slots pinned;
 *   T50.02  every leaf of that frame dispatches a REAL child pi through the one
 *           unified executor, carrying its entitlement allow-list;
 *   T50.06  one step is a `tilldone` L-Thread whose done-condition is a REAL
 *           verification command — it keeps running while work remains and
 *           closes only when the list says done;
 *   T50.13  completion emits `portal.vak_eval`, caught by a REAL subscriber;
 *   T50.14  completion writes the deterministic trace into the REAL transcript
 *           and a distillation row the REAL consumer script accepts;
 *   T50.12  completion logs a Mercurius ELO trial; the first is honestly refused
 *           as uncalibrated and a second comparable run updates the rating;
 *   T50.10  the persisted score and its accumulated runs are then read back OVER
 *           THE GATEWAY through `s4'.orchestration.score`.
 *
 * Deliberately NOT `*.test.ts`: it spawns a gateway and makes live model calls,
 * so it must not be swept into `verify-all`'s ta-onta suite. Run by hand as the
 * tranche's evidence.
 *
 * Usage: node Body/S/S4/ta-onta/S4-4p-anima/tests/acceptance-live.mjs [--port N]
 */

import { spawn, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { connect } from "node:net";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
	ORIGINATION_DIALOGICAL,
	ORIGINATION_MECHANISTIC,
	ScoreOriginationError,
	persistScore,
	rerunScore,
	setOrigination,
} from "../extension/dispatch.ts";
import {
	composedCoordinates,
	defineOrchestration,
	nestingDepth,
	runNestedFrame,
	runOrchestration,
} from "../lib/vak-orchestration-surface.ts";
import { dispatchChildPi } from "../lib/child-pi-executor.ts";
import { runLThread } from "../S4/tilldone.ts";
import { runToolScript } from "../../../pi-agent/lib/code-mode.ts";
import {
	buildCodeModeImplementations,
	codeModeToolUniverse,
} from "../../../pi-agent/lib/code-mode-tools.ts";
import { parseAletheiaConfigToml } from "../../S4-5p-aletheia/modules/mercurius-elo.ts";
import {
	openEloDatabase,
	readComparisonRows,
	readRatingRows,
	readTrialRows,
} from "../../S4-5p-aletheia/modules/elo-persistence.ts";

const repoRoot = resolve(fileURLToPath(new URL("../../../../../..", import.meta.url)));
const EPI_BIN = process.env.EPI_BIN ?? join(repoRoot, "target", "debug", "epi");
const DISTILL_GEN = join(
	repoRoot,
	"Body/S/S5/plugins/epi-logos/skills/custom/epii-distillation/scripts/distill_dataset_gen.py",
);
const MODEL = process.env.LIVE_MODEL || "google/gemini-3.1-flash-lite";
const portArg = process.argv.indexOf("--port");
const PORT = portArg > -1 ? Number(process.argv[portArg + 1]) : 18993;

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

/** pi --mode json emits event frames; recover the assistant text. */
function assistantText(stdout) {
	const chunks = [];
	for (const line of String(stdout).split("\n")) {
		if (!line.trim()) continue;
		try {
			const event = JSON.parse(line);
			if (event.type === "message_update") {
				const delta = event.assistantMessageEvent;
				if (delta?.type === "text_delta") chunks.push(delta.delta || "");
			}
		} catch {
			/* not a frame */
		}
	}
	return chunks.join("");
}

/** A real subscriber on the running gateway, collecting broadcasts. */
async function subscribe(port) {
	const ws = new WebSocket(`ws://127.0.0.1:${port}`);
	const events = [];
	await new Promise((done, fail) => {
		const timer = setTimeout(() => fail(new Error("observer did not connect")), 15000);
		ws.addEventListener("open", () => {
			ws.send(JSON.stringify({ type: "req", id: 1, method: "connect", params: {} }));
			clearTimeout(timer);
			done();
		});
		ws.addEventListener("error", () => {
			clearTimeout(timer);
			fail(new Error(`observer could not connect to port ${port}`));
		});
	});
	ws.addEventListener("message", (event) => {
		try {
			const frame = JSON.parse(String(event.data));
			if (frame.type === "event" && frame.event === "portal.vak_eval") events.push(frame);
		} catch {
			/* not a frame we read */
		}
	});
	return {
		events,
		async settle(count, timeoutMs = 8000) {
			const deadline = Date.now() + timeoutMs;
			while (events.length < count && Date.now() < deadline) {
				await new Promise((r) => setTimeout(r, 100));
			}
			return events.length;
		},
		close: () => ws.close(),
	};
}

/** One request/response over the gateway, as any ordinary client would make it. */
async function callGateway(port, method, params) {
	const ws = new WebSocket(`ws://127.0.0.1:${port}`);
	return await new Promise((done, fail) => {
		const timer = setTimeout(() => {
			ws.close();
			fail(new Error(`${method} timed out`));
		}, 20000);
		ws.addEventListener("open", () => {
			ws.send(JSON.stringify({ type: "req", id: 1, method: "connect", params: {} }));
			ws.send(JSON.stringify({ type: "req", id: 2, method, params }));
		});
		ws.addEventListener("message", (event) => {
			try {
				const frame = JSON.parse(String(event.data));
				if (frame.type === "res" && frame.id === 2) {
					clearTimeout(timer);
					ws.close();
					done(frame);
				}
			} catch {
				/* not a frame we read */
			}
		});
		ws.addEventListener("error", () => {
			clearTimeout(timer);
			fail(new Error(`${method} could not reach the gateway`));
		});
	});
}

// ── The orchestration: one address per step, varying on all six axes ───────

const step = (over) => ({
	cpf: "(4.0/1-4.4/5)",
	ct: ["CT2"],
	cp: "CP4.2",
	cf: "(0/1)",
	cfp: "CFP2",
	cs: { code: "CS2", direction: "Day" },
	...over,
});

/** The score's own address. */
const ADDRESS = step({});

const ORIGINATE = step({
	cpf: "(00/00)",
	ct: ["CT0"],
	cp: "CP4.0",
	cf: "(00/00)",
	cfp: "CFP1",
	cs: { code: "CS0", direction: "Day" },
});
const COMPOSE = step({
	ct: ["CT1"],
	cp: "CP4.1",
	cf: "(0/1)",
	cfp: "CFP2",
	cs: { code: "CS1", direction: "Day" },
});
const EXECUTE = step({
	ct: ["CT2"],
	cp: "CP4.2",
	cf: "(0/1/2)",
	cfp: "CFP3",
	cs: { code: "CS2", direction: "Day" },
});
const CLOSE = step({
	ct: ["CT5"],
	cp: "CP4.3",
	cf: "(4.0/1-4.4/5)",
	cfp: "CFP4",
	cs: { code: "CS3", direction: "Day" },
});

const DECLARATION = {
	mef_lens: "L5",
	content_class: "implementation",
	kairos_window: "day",
	r_factor_slot: "R0",
	model: MODEL,
	harness: "pi",
	skill: "anima-orchestration",
};

const CONFIG = parseAletheiaConfigToml(`
[aletheia.elo]
seed_rating = 1500
confidence_penalty_alpha = 0.5
bootstrap_trials = 5
bootstrap_sigma = 350
k_factor = 32
expected_score_base = 10
expected_score_divisor = 400
outcome_win = 1
outcome_loss = 0
outcome_draw = 0.5
fair_comparison_similarity_floor = 0.8

[aletheia.drift_detection]
delta_elo = 1
`);

/** The one program the "compose" step emits instead of a JSON staircase. */
const PROGRAM = `
import { tools } from "./epi-tools.mjs";

const alpha = await tools.read({ path: "alpha.txt" });
const hits = await tools.grep({ pattern: "signal", path: "." });
let refused = "none";
try {
  await tools.epi_graph_query({ query: "MATCH (n) RETURN n LIMIT 1" });
} catch (error) {
  refused = String(error.message);
}
const report = [
  \`alpha=\${alpha.trim()}\`,
  \`hits=\${hits.length}\`,
  \`refused=\${refused}\`,
].join("\\n");
await tools.write({ path: "report.txt", content: report });
console.log(report);
`;

const work = mkdtempSync(join(tmpdir(), "acceptance-live-"));
const gateRoot = join(work, "gate");
const corpus = join(work, "distillation.jsonl");
const databasePath = join(work, "elo", "elo-runtime.sqlite");
const sandbox = join(work, "sandbox");
process.env.EPI_SCORES_DIR = join(work, "scores");
process.env.EPI_GATEWAY_URL = `ws://127.0.0.1:${PORT}`;

writeFileSync(join(work, "alpha.txt"), "13\n", "utf8");
// The sandbox the code-mode program is rooted in — real files, real tools.
mkdirSync(sandbox, { recursive: true });
writeFileSync(join(sandbox, "alpha.txt"), "13\n", "utf8");
writeFileSync(join(sandbox, "notes.txt"), "a signal in the noise\nanother signal\n", "utf8");

console.log(`\nTrack 50 end-to-end acceptance — live (port=${PORT}, model=${MODEL})`);
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
	let files = [];
	try {
		files = readdirSync(dir).filter((name) => name.endsWith(".jsonl"));
	} catch {
		return [];
	}
	return files.flatMap((name) =>
		readFileSync(join(dir, name), "utf8")
			.split("\n")
			.filter((line) => line.trim())
			.map((line) => JSON.parse(line)),
	);
}

let observer;
/**
 * Everything the run actually did, in the trace's own vocabulary.
 *
 * `ops` and `USAGE` are filled BY the run and read by `rerunScore` AFTER it
 * returns, so both are mutated in place rather than reassigned — the reference
 * handed to the trace has to be the one the run wrote into.
 */
const ops = [];
const USAGE = { turns: 1, inputTokens: 0, outputTokens: 0, totalTokens: 0 };
let accounting = null;
/** The gated bridge's own record of every tool call the program made. */
let codeModeCalls = [];
let childDispatches = [];
let nestRoot = null;
let nestTrace = [];
let lThread = null;
let humanAnswered = 0;

/**
 * The whole path, executed once. This is the `run` a score re-run performs:
 * every step is a different leg of the track, and the ops it appends are what
 * the script genuinely did — not a description of it.
 */
async function runWholePath(orchestration) {
	return runOrchestration(orchestration, {
		respondToHuman: (s) => {
			humanAnswered += 1;
			return `human: proceed — ${s.checkpoint?.reason ?? "no reason recorded"}`;
		},
		execute: async (s) => {
			// ── the JSON→TS collapse: ONE program, real tools, real accounting ──
			if (s.id === "compose") {
				const run = await runToolScript({
					program: PROGRAM,
					implementations: buildCodeModeImplementations(sandbox),
					ctx: {
						universe: codeModeToolUniverse(),
						// `epi_graph_query` is entitled in U but switched OFF at spawn.
						activeTools: ["read", "grep", "write"],
					},
					cwd: sandbox,
					promptChars: 2000,
				});
				accounting = run.accounting;
				codeModeCalls = run.calls;
				USAGE.inputTokens = run.accounting.promptTokens;
				USAGE.outputTokens = run.accounting.programTokens;
				USAGE.totalTokens = run.accounting.scriptTokens;
				for (const call of run.calls) {
					ops.push({ stepId: s.id, operation: call.tool, agent: s.agent });
				}
				if (!run.ok) throw new Error(`code-mode program failed: ${run.stderr.slice(0, 400)}`);
				return run.stdout.trim();
			}

			// ── CP nesting, real child pi at every leaf ──────────────────────────
			if (s.id === "execute") {
				nestRoot = {
					kind: "frame",
					id: "outer",
					address: step({ cf: "(4.0/1-4.4/5)", cp: "CP4.2" }),
					children: [
						{
							kind: "frame",
							id: "inner",
							address: step({ cf: "(0/1)", cp: "CP4.0" }),
							children: [
								{
									kind: "leaf",
									id: "read-alpha",
									address: step({ cf: "(0/1)", cp: "CP4.0" }),
									task: "Read alpha.txt and reply with only the integer it contains.",
									agent: "logos",
								},
							],
						},
						{
							kind: "leaf",
							id: "double-it",
							address: step({ cf: "(0/1)", cp: "CP4.1" }),
							task: "Reply with only the integer 26.",
							agent: "logos",
						},
					],
				};
				nestTrace = await runNestedFrame(nestRoot, {
					execute: async (leaf) => {
						const dispatched = await dispatchChildPi({
							seam: "agent-team",
							agentName: leaf.agent ?? "logos",
							task: leaf.task,
							systemPrompt: "You are a terse probe. Answer with the integer only.",
							model: MODEL,
							toolUniverse: ["read"],
							cwd: work,
							vakAddress: leaf.address,
						});
						childDispatches.push(dispatched);
						ops.push({ stepId: s.id, operation: "read", agent: leaf.agent });
						return (assistantText(dispatched.stdout) || dispatched.output).trim();
					},
				});
				return nestTrace
					.filter((entry) => entry.kind === "leaf")
					.map((entry) => `${entry.nodeId}=${entry.emission.payload.output}`)
					.join(" ");
			}

			// ── the tilldone completion gate over REAL verification work ─────────
			if (s.id === "close") {
				const tasks = [
					{ id: 1, text: "run the verification", status: "inprogress" },
					{ id: 2, text: "record the result", status: "idle" },
				];
				lThread = await runLThread({
					id: "acceptance-close",
					address: { cfp: "CFP4" },
					maxCycles: 4,
					perform: (cycle) => {
						if (cycle === 1) {
							// A REAL verification command — the done-condition is that it passed.
							const verified = spawnSync(
								process.execPath,
								["--test", "Body/S/S4/ta-onta/S4-4p-anima/tests/tilldone_l_thread.test.ts"],
								{ cwd: repoRoot, encoding: "utf8" },
							);
							ops.push({
								stepId: s.id,
								operation: "bash",
								command: "node --test tilldone_l_thread.test.ts",
								agent: s.agent,
							});
							if (verified.status === 0) tasks[0].status = "done";
							// The second task is only STARTED here — the list is not done, so
							// the gate must keep the thread running.
							tasks[1].status = "inprogress";
							return `verification exit=${verified.status}`;
						}
						writeFileSync(join(sandbox, "verified.txt"), "verification passed\n", "utf8");
						ops.push({ stepId: s.id, operation: "write", agent: s.agent });
						tasks[1].status = "done";
						return "result recorded";
					},
					readTaskList: () => ({ tasks: tasks.map((t) => ({ ...t })) }),
				});
				if (!lThread.closed) throw new Error(`L-Thread did not close: ${lThread.reason}`);
				return `L-Thread closed after ${lThread.cycles.length} cycle(s)`;
			}

			return `unhandled step ${s.id}`;
		},
	});
}

try {
	await waitForPort(PORT, 25000);
	console.log("─── 0. a real gateway is listening, with a real subscriber ───");
	check("epi gate start came up", true);
	observer = await subscribe(PORT);
	check("a real subscriber is registered on the runtime", true);

	// ── 1. (00/00) origination ────────────────────────────────────────────────
	console.log("\n─── 1. the score ORIGINATES in (00/00) dialogue (T50.07) ───");
	const sessionId = "acceptance-live";
	setOrigination(sessionId, ORIGINATION_MECHANISTIC);
	let refusedOrigination = null;
	const orchestration = defineOrchestration({
		id: "acceptance-live",
		address: ADDRESS,
		steps: [
			{
				id: "originate",
				address: ORIGINATE,
				task: "agree what the run is for",
				agent: "nous",
				checkpoint: {
					reason: "requested-at-origination",
					note: "the Architect asked to see the plan before it runs",
				},
			},
			{ id: "compose", address: COMPOSE, task: "compose the program", agent: "logos" },
			{ id: "execute", address: EXECUTE, task: "execute the nested frame", agent: "eros" },
			{ id: "close", address: CLOSE, task: "close under the completion gate", agent: "anima" },
		],
	});
	try {
		persistScore({ scoreId: "acceptance-live", orchestration, sessionId });
	} catch (error) {
		refusedOrigination = error;
	}
	check(
		"a MECHANISTIC session cannot originate a score",
		refusedOrigination instanceof ScoreOriginationError,
		String(refusedOrigination),
	);

	setOrigination(sessionId, ORIGINATION_DIALOGICAL);
	const score = persistScore({
		scoreId: "acceptance-live",
		orchestration,
		sessionId,
		originatedAt: "2026-07-27T20:00:00.000Z",
		task: "read the ground, compose the program, prove it, and close",
	});
	check("the dialogical session originated it", score.hash?.length === 64, score.hash);
	check(
		"provenance records the (00/00) origination",
		score.provenance?.origination === ORIGINATION_DIALOGICAL,
		JSON.stringify(score.provenance),
	);

	// ── 2. six coordinates, actually composed ─────────────────────────────────
	console.log("\n─── 2. composed across ALL SIX C' coordinates (T50.03) ───");
	const composed = composedCoordinates(orchestration);
	check(
		"the run varies on all six axes, not one axis with five decorations",
		composed.length === 6,
		JSON.stringify(composed),
	);

	// ── 3. the whole path, run once through the production seam ───────────────
	console.log("\n─── 3. ONE run of the whole path through rerunScore ───");
	const first = await rerunScore({
		scoreId: "acceptance-live",
		sessionId,
		at: "2026-07-27T20:05:00.000Z",
		run: (o) => runWholePath(o),
		vakEval: { declaration: { lens: "L5", sessionKey: "agent:anima:acceptance" } },
		elo: {
			declaration: DECLARATION,
			outcomes: { channels: { R_verifier: { score: 1 } } },
			config: CONFIG,
			databasePath,
		},
		// `ops`/`USAGE` are the arrays the run writes into; `rerunScore` reads them
		// after the run returns, so what lands in the trace is what happened.
		trace: {
			sessionKey: "agent:anima:acceptance",
			ops,
			usage: USAGE,
			distillation: {
				teacherOutput: "the run closed under its completion gate",
				declaration: { lens_coherence: 0.9, verifier_pass: 1, user_articulation_simulation: 0.5 },
				path: corpus,
			},
		},
	});
	check("the re-run completed", first.run?.scoreId === "acceptance-live");

	// ── 4. the legs, each proven by what it actually did ──────────────────────
	console.log("\n─── 4. the authored (00/00) checkpoint halted for a human (T50.09) ───");
	check("the dialogical step halted and a human answered", humanAnswered === 1, String(humanAnswered));
	const originateResult = first.result?.find((r) => r.stepId === "originate");
	check("the run records that step as halted", originateResult?.haltedForHuman === true);

	console.log("\n─── 5. JSON→TS: one program, real tools, measured (T50.01) ───");
	const allowed = codeModeCalls.filter((call) => call.ok);
	check(
		"the ONE program made every entitled call itself — read, grep and write",
		allowed.length === 3 && ["grep", "read", "write"].every((t) => allowed.some((c) => c.tool === t)),
		JSON.stringify(codeModeCalls.map((c) => ({ tool: c.tool, ok: c.ok }))),
	);
	const refusedCall = codeModeCalls.find((call) => call.tool === "epi_graph_query");
	check(
		"a tool switched off at spawn was REFUSED at the choke point, by code",
		refusedCall?.ok === false && refusedCall?.refusalCode === "code-mode/not-active",
		JSON.stringify(refusedCall),
	);
	check(
		"the refused call returned nothing to the program",
		refusedCall?.resultChars === 0,
		String(refusedCall?.resultChars),
	);
	check(
		"the JSON staircase over the SAME work costs more than the program",
		(accounting?.deltaTokens ?? 0) > 0,
		`script=${accounting?.scriptTokens} staircase=${accounting?.staircaseTokens} delta=${accounting?.deltaTokens}`,
	);
	console.log(
		`        script=${accounting?.scriptTokens} tok · staircase=${accounting?.staircaseTokens} tok · ` +
			`delta=${accounting?.deltaTokens} tok · ratio=${accounting?.ratio?.toFixed(3)} (estimator=${accounting?.estimator})`,
	);

	console.log("\n─── 6. CP nesting with a real child pi at every leaf (T50.02/04) ───");
	const leaves = nestTrace.filter((e) => e.kind === "leaf");
	check("the nested structure is at least 2 deep", nestingDepth(nestRoot) >= 2 && nestTrace.some((e) => e.depth >= 2), `depth=${nestingDepth(nestRoot)} trace=${JSON.stringify(nestTrace.map((e) => e.depth))}`);
	check("every leaf dispatched a REAL child pi", childDispatches.length === leaves.length && leaves.length === 2, `${childDispatches.length} dispatches / ${leaves.length} leaves`);
	check("every child exited cleanly", childDispatches.every((d) => d.exitCode === 0), JSON.stringify(childDispatches.map((d) => d.exitCode)));
	check("the entitlement allow-list reached the child as --tools", childDispatches.every((d) => d.args[d.args.indexOf("--tools") + 1] === "read"));
	check("Pi→subagent only: every child is a pi harness invocation", childDispatches.every((d) => d.args.includes("--mode") && d.args.includes("--no-session")));
	const deepLeaf = leaves.find((e) => e.nodeId === "read-alpha");
	check("the deep leaf read the real file through its child", /13/.test(String(deepLeaf?.emission?.payload?.output)), String(deepLeaf?.emission?.payload?.output).slice(0, 120));
	check("the trace records where each leaf sat", JSON.stringify(deepLeaf?.slotPath) === "[0,0]" && deepLeaf?.framePath?.length === 2, JSON.stringify({ slot: deepLeaf?.slotPath, frames: deepLeaf?.framePath }));

	console.log("\n─── 7. the tilldone completion gate over real work (T50.06) ───");
	check("the thread did NOT close while work remained", lThread?.cycles?.[0]?.verdict?.complete === false, JSON.stringify(lThread?.cycles?.[0]?.verdict?.code));
	check("it closed only when the list said done", lThread?.closed === true && lThread?.finalVerdict?.code === "tilldone/complete");
	check("closing took the second cycle, not the first", lThread?.cycles?.length === 2, String(lThread?.cycles?.length));
	check("the done-condition was a REAL verification that passed", /exit=0/.test(String(lThread?.cycles?.[0]?.output)), String(lThread?.cycles?.[0]?.output));

	// ── 8. portal.vak_eval reached a real subscriber ──────────────────────────
	console.log("\n─── 8. portal.vak_eval reached a real subscriber (T50.13) ───");
	check("run completion returned a vak_eval receipt", Boolean(first.vakEval), JSON.stringify(first.vakEval));
	const landed = await observer.settle(1);
	check("the event was broadcast, not merely returned", landed >= 1, `${landed} events`);
	const payload = observer.events[0]?.payload ?? {};
	check("the subscriber saw the session it was emitted for", payload.sessionKey === "agent:anima:acceptance", String(payload.sessionKey));
	check("the payload carries the six-field VAK envelope", ["cpf", "ct", "cp", "cf", "cfp", "cs"].every((k) => payload[k] !== undefined && payload[k] !== null), JSON.stringify(Object.keys(payload)));
	check("the receipt matches what the subscriber saw", JSON.stringify(first.vakEval?.tonalReading) === JSON.stringify(payload.tonalReading));

	// ── 9. the deterministic trace is in the real transcript ──────────────────
	console.log("\n─── 9. the deterministic training trace (T50.14) ───");
	const traces = transcriptLines().filter((entry) => entry.kind === "orchestration_trace");
	check("the transcript carries the trace", traces.length === 1, `${traces.length} found`);
	const written = traces[0]?.orchestration_trace ?? {};
	check("it names the exact program that ran", written.scoreHash === score.hash, String(written.scoreHash));
	check("it carries every op the run performed", written.ops?.length === ops.length && ops.length > 0, `${written.ops?.length} vs ${ops.length}`);
	check("the ops are what a code-mode run actually does, in one turn", written.usage?.turns === 1);
	check(
		"the ops carry classifiable read AND edit AND test work",
		written.ops?.some((o) => o.operation === "read") &&
			written.ops?.some((o) => o.operation === "write") &&
			written.ops?.some((o) => /node --test/.test(String(o.command ?? ""))),
		JSON.stringify(written.ops?.map((o) => o.operation)),
	);
	const rows = readFileSync(corpus, "utf8").trim().split("\n");
	check("one distillation row for the run", rows.length === 1, `${rows.length}`);
	const generated = join(work, "dataset.jsonl");
	const gen = spawnSync("python3", [DISTILL_GEN, "--source-jsonl", corpus, "--output-jsonl", generated], { encoding: "utf8" });
	check("the REAL distill_dataset_gen.py accepts the row", gen.status === 0, `${gen.stderr || gen.stdout}`.trim().slice(0, 300));

	// ── 10. the Mercurius ELO trial ───────────────────────────────────────────
	console.log("\n─── 10. the Mercurius ELO trial (T50.12) ───");
	check("run completion produced a trial", Boolean(first.trial));
	check("the FIRST trial is honestly refused as uncalibrated", first.trial?.comparison?.atropos_decision === "uncalibrated_refusal", JSON.stringify(first.trial?.comparison?.atropos_decision));
	check("no rating was invented from one trial", (first.trial?.updated_ratings ?? []).length === 0);

	console.log("\n     a second comparable run of the SAME score updates the rating");
	// In place: the first run's trace has already been written from this array.
	ops.length = 0;
	childDispatches = [];
	const second = await rerunScore({
		scoreId: "acceptance-live",
		sessionId,
		at: "2026-07-27T20:15:00.000Z",
		run: (o) => runWholePath(o),
		elo: {
			declaration: DECLARATION,
			outcomes: { channels: { R_verifier: { score: 1 } } },
			config: CONFIG,
			databasePath,
		},
	});
	check("the second run executed the whole path again", childDispatches.length === 2, String(childDispatches.length));
	check("Moirai found it comparable", second.trial?.comparison?.comparable === true, JSON.stringify(second.trial?.comparison?.reason));
	check("Janus ruled on the delta", (second.trial?.threshold_decisions ?? []).some((d) => d.guardian === "janus"), JSON.stringify(second.trial?.threshold_decisions));
	check("a rating was updated", (second.trial?.updated_ratings ?? []).length === 1, String((second.trial?.updated_ratings ?? []).length));

	const db = openEloDatabase(databasePath);
	const trials = readTrialRows(db);
	const ratings = readRatingRows(db);
	const comparisons = readComparisonRows(db);
	db.close();
	check("both trials are in mercurius_trial_log", trials.length === 2, `${trials.length}`);
	check("the six context columns are populated", trials.every((t) => t.vak_cp_position === "CP4.2" && t.cfp_thread_type === "CFP2" && t.r_factor_slot === "R0"), JSON.stringify(trials[0]));
	check("mercurius_elo_ratings carries the rating", ratings.length === 1, `${ratings.length}`);
	check("moirai_comparison_cache kept BOTH decisions, refusal included", comparisons.length === 2 && comparisons.some((c) => c.atropos_decision === "uncalibrated_refusal") && comparisons.some((c) => c.atropos_decision === "update_allowed"), JSON.stringify(comparisons.map((c) => c.atropos_decision)));

	// ── 11. the score and its runs, read back over the gateway ────────────────
	console.log("\n─── 11. the score + its runs read back over the gateway (T50.10) ───");
	const frame = await callGateway(PORT, "s4'.orchestration.score", { scoreId: "acceptance-live" });
	const result = frame?.result ?? {};
	check("the gateway served the score", result.present === true, JSON.stringify(frame).slice(0, 300));
	check("it serves the SAME program identity the run named", result.hash === score.hash, String(result.hash));
	check("both runs accumulated against the score", (result.runs ?? []).length === 2, String((result.runs ?? []).length));
	check("the reader names the S4' authority that produced it", result.owner === "S4'" && typeof result.authority === "string", JSON.stringify({ owner: result.owner, authority: result.authority }));
	check("the served program is the six-coordinate orchestration", (result.score?.program?.steps ?? []).length === 4, String((result.score?.program?.steps ?? []).length));
} catch (error) {
	check("the acceptance run completed without throwing", false, String(error?.stack ?? error));
} finally {
	try {
		observer?.close();
	} catch {
		/* observer already gone */
	}
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
console.log("All end-to-end acceptance checks passed.");
