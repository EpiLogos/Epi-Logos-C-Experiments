/**
 * vak-eval-live.mjs — LIVE proof for 50.T50.13 (not part of the shared gate).
 *
 * The tranche's claim: "running a score emits `vak_eval` carrying the trace's
 * diatonic/tonal reading, evaluable over the gateway."
 *
 * This proves exactly that against a REAL `epi gate start` over the REAL
 * protocol, with a REAL subscriber:
 *
 *   1. a score is persisted and RE-RUN through `rerunScore` — the production
 *      seam that a real orchestration goes through, not a stub;
 *   2. a second websocket is registered as a listener on the running gateway,
 *      which is what `epi portal` and the OmniPanel actually are;
 *   3. completing the run BROADCASTS `portal.vak_eval` to that listener,
 *      carrying the run read as a line in its mode-tonic frame — the event that
 *      has been a declared contract with no emitter until this tranche;
 *   4. the reading is the kernel's, addressed in the 84-fold landscape, with
 *      each step's degree, interval, conjugate face and 720° position;
 *   5. modal rotation is observable: the same run under a different tonic reads
 *      as a different mode without transposing a single pitch;
 *   6. a run that cannot name its lens is REFUSED and nothing is broadcast —
 *      no half-read event reaches the bus.
 *
 * Deliberately NOT `*.test.ts`: it spawns a real gateway process, and the
 * shared `ta-onta` suite stays hermetic. The hermetic half of this seam is
 * `tests/vak_eval_emit.test.ts`.
 *
 * Usage: node Body/S/S4/ta-onta/S4-4p-anima/tests/vak-eval-live.mjs [--port N]
 */

import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { connect } from "node:net";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { persistScore, rerunScore } from "../extension/dispatch.ts";
import { defineOrchestration } from "../lib/vak-orchestration-surface.ts";
import { VakEvalDeclarationError } from "../modules/vak-eval-emit.ts";

const repoRoot = resolve(fileURLToPath(new URL("../../../../../..", import.meta.url)));
const EPI_BIN = process.env.EPI_BIN ?? join(repoRoot, "target", "debug", "epi");
const portArg = process.argv.indexOf("--port");
const PORT = portArg > -1 ? Number(process.argv[portArg + 1]) : 18987;

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
	return new Promise((resolvePort, rejectPort) => {
		const attempt = () => {
			const socket = connect({ port, host: "127.0.0.1" }, () => {
				socket.destroy();
				resolvePort();
			});
			socket.on("error", () => {
				socket.destroy();
				if (Date.now() > deadline) {
					rejectPort(new Error(`port ${port} did not open within ${timeoutMs}ms`));
				} else {
					setTimeout(attempt, 400);
				}
			});
		};
		attempt();
	});
}

/**
 * A real subscriber on the running gateway, collecting broadcasts.
 *
 * Uses the platform `WebSocket` — the same global the emitter itself defaults
 * to, so the observer is not a privileged client.
 */
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
		/** Wait until `count` vak_eval broadcasts have landed. */
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

const ADDRESS = {
	cpf: "(4.0/1-4.4/5)",
	ct: ["CT2"],
	cp: "CP4.2",
	cf: "(0/1)",
	cfp: "CFP2",
	cs: { code: "CS2", direction: "Day" },
};

const frame = (cf, recognized = false) => ({
	...ADDRESS,
	cf,
	cs: { code: "CS2", direction: "Day", recognized },
});

const work = mkdtempSync(join(tmpdir(), "vak-eval-live-"));
process.env.EPI_SCORES_DIR = join(work, "scores");
process.env.EPI_GATEWAY_URL = `ws://127.0.0.1:${PORT}`;

console.log(`\nportal.vak_eval on run completion — live (port=${PORT})`);
console.log(`workdir: ${work}\n`);

const gateway = spawn(EPI_BIN, ["gate", "start", "--port", String(PORT)], {
	env: { ...process.env, EPI_GATE_STATE_ROOT: join(work, "gate"), EPI_REPO_ROOT: repoRoot },
	stdio: ["ignore", "pipe", "pipe"],
});
let gatewayLog = "";
gateway.stdout.on("data", (chunk) => {
	gatewayLog += chunk;
});
gateway.stderr.on("data", (chunk) => {
	gatewayLog += chunk;
});

let observer;
try {
	await waitForPort(PORT, 25000);
	console.log("─── 0. a real gateway is listening ───");
	check("epi gate start came up", true);

	observer = await subscribe(PORT);
	check("a real subscriber is registered on the runtime", true);

	// ── 1. a persisted score, re-run through the production seam ──────────────
	console.log("\n─── 1. a score re-run through rerunScore ───");
	const orchestration = defineOrchestration({
		id: "vak-eval-live",
		address: ADDRESS,
		steps: [
			{ id: "originate", address: frame("(00/00)"), task: "originate", agent: "nous" },
			{ id: "frame", address: frame("(0/1)"), task: "frame it", agent: "logos" },
			{ id: "execute", address: frame("(4.0/1-4.4/5)"), task: "execute", agent: "anima" },
			{ id: "close", address: frame("(00/00)", true), task: "close", agent: "sophia" },
		],
	});
	const score = persistScore({
		scoreId: "vak-eval-live",
		orchestration,
		originatedAt: "2026-07-27T09:00:00.000Z",
		task: "run the nightly orchestration",
	});
	check(
		"the score persisted with a content hash",
		typeof score.hash === "string" && score.hash.length === 64,
		score.hash,
	);

	const run = await rerunScore({
		scoreId: "vak-eval-live",
		at: "2026-07-27T09:30:00.000Z",
		run: () => "done",
		// L2' — the Alchemical-Elemental lens, anchored on F per §II-3.1.
		vakEval: { declaration: { lens: "L2'", sessionKey: "agent:anima:main" } },
	});
	check("the re-run completed", run.run.scoreId === "vak-eval-live");
	check("run completion returned a vak_eval receipt", Boolean(run.vakEval));

	// ── 2. the broadcast actually reached a listener ──────────────────────────
	console.log("\n─── 2. portal.vak_eval reached a real subscriber ───");
	const landed = await observer.settle(1);
	check("the event was broadcast, not merely returned", landed >= 1, `${landed} events`);
	const payload = observer.events[0]?.payload ?? {};
	const reading = payload.tonalReading ?? {};
	check("the subscriber saw the session it was emitted for", payload.sessionKey === "agent:anima:main", payload.sessionKey);
	check("the payload carries the six-field VAK envelope", ["cpf", "ct", "cp", "cf", "cfp", "cs"].every((k) => payload[k] !== undefined && payload[k] !== null));

	// ── 3. the run reads as a line in the 84-fold landscape ───────────────────
	console.log("\n─── 3. the run read against the derived music ───");
	check("the scale-beneath is the declared lens", reading.lensLabel === "L2'", reading.lensLabel);
	check("L2' anchors on F (§II-3.1)", reading.lensAnchorNote === "F", reading.lensAnchorNote);
	check("absent a declared tonic the frame is Ionian", reading.modeName === "Ionian", reading.modeName);
	check("the reading is addressed in the 84-fold landscape", reading.lensModeIndex === 56, String(reading.lensModeIndex));
	check("every step of the run was read", (reading.steps ?? []).length === 4, String(reading.steps?.length));
	const steps = reading.steps ?? [];
	check("the run began on its ground", steps[0]?.degree === 1 && steps[0]?.note === "F", JSON.stringify(steps[0]));
	check("the dispatch frame is the dominant", steps[2]?.degree === 5 && steps[2]?.cf === "(4.0/1-4.4/5)", JSON.stringify(steps[2]));
	check("the fifth sits on the implicate sheet of the double cover", steps[2]?.hopfFiber === 1 && steps[2]?.conjugateFace === "power", JSON.stringify(steps[2]));
	check("degree720 follows the kernel tick x 60 law", steps.every((s) => s.degree720 % 60 === 0 && s.degree720 <= 660));
	check("each step carries its M0 address (DR-VAK-4)", steps[0]?.m0Address === "M0-2:00/00", steps[0]?.m0Address);

	console.log("\n─── 4. the run-level evaluation ───");
	check("the run returned to its tonic — the Mobius close", reading.returnsToTonic === true);
	check("recognition rode the closing step (DR-VAK-5)", reading.recognitionClosed === true);
	check("both sheets of the double cover sounded", reading.bothFacesSounded === true);
	check("out to Power and back = two Klein twists (§II-4.7)", reading.conjugateFaceChanges === 2, String(reading.conjugateFaceChanges));
	check("the degrees it never spoke from are named", Array.isArray(reading.degreesSilent) && reading.degreesSilent.length > 0, JSON.stringify(reading.degreesSilent));
	check("the receipt matches what the subscriber saw", JSON.stringify(run.vakEval?.tonalReading) === JSON.stringify(reading));

	// ── 5. modal rotation is observable ───────────────────────────────────────
	console.log("\n─── 5. modal rotation over the wire ───");
	const rotated = await rerunScore({
		scoreId: "vak-eval-live",
		at: "2026-07-27T10:30:00.000Z",
		run: () => "done",
		vakEval: {
			declaration: { lens: "L2'", modeTonicCf: "(4.0/1-4.4/5)", sessionKey: "agent:anima:main" },
		},
	});
	await observer.settle(2);
	const mixolydian = rotated.vakEval?.tonalReading ?? {};
	check("the same run now reads Mixolydian", mixolydian.modeName === "Mixolydian", mixolydian.modeName);
	check("the dispatch frame became the ground", mixolydian.steps?.[2]?.degree === 1, String(mixolydian.steps?.[2]?.degree));
	check(
		"rotation re-grounds without transposing a single pitch",
		(mixolydian.steps ?? []).every((step, index) => step.note === steps[index]?.note),
		`${JSON.stringify((mixolydian.steps ?? []).map((s) => s.note))} vs ${JSON.stringify(steps.map((s) => s.note))}`,
	);
	check("a second broadcast reached the subscriber", observer.events.length === 2, String(observer.events.length));

	// ── 6. a run that cannot name its lens is refused ─────────────────────────
	console.log("\n─── 6. an undeclared scale-beneath is refused ───");
	let refusal = null;
	try {
		await rerunScore({
			scoreId: "vak-eval-live",
			at: "2026-07-27T11:30:00.000Z",
			run: () => "done",
			vakEval: { declaration: {} },
		});
	} catch (error) {
		refusal = error;
	}
	check("the run was refused", refusal instanceof VakEvalDeclarationError, String(refusal));
	check("the refusal names the lens", /lens/.test(String(refusal?.message)));
	await new Promise((r) => setTimeout(r, 600));
	check("no half-read event reached the bus", observer.events.length === 2, String(observer.events.length));
} catch (error) {
	check("live run completed without throwing", false, String(error?.stack ?? error));
} finally {
	observer?.close();
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
