/**
 * orchestration-run-live.mjs — LIVE proof for 50.T50.05 (not part of the shared gate).
 *
 * Anima runs a real multi-agent script: two REAL child pi's dispatched in
 * sequence through the one gated executor, with the parent holding run state
 * across them.
 *
 * The decisive assertion is about what the DOWNSTREAM child actually received.
 * `dispatchChildPi` returns the exact argv it handed to pi, so this inspects that
 * argv and proves:
 *   - the extracted variable IS present
 *   - the upstream child's transcript is NOT present
 *   - the parent's own context is NOT present
 *
 * That is the second half of the token win: the code environment moves data
 * between agents instead of pasting transcripts forward.
 *
 * Usage: node Body/S/S4/ta-onta/S4-4p-anima/tests/orchestration-run-live.mjs
 */

import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
	beginRun,
	childInputFor,
	completeStep,
	renderChildInput,
	runContextSize,
} from "../lib/orchestration-run.ts";
import { dispatchChildPi } from "../lib/child-pi-executor.ts";
import { boundAgent } from "../lib/vak-orchestration-surface.ts";

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

const addr = (o = {}) => ({
	cpf: "(4.0/1-4.4/5)",
	ct: ["CT3"],
	cp: "CP4.0",
	cf: "(0/1)",
	cfp: "CFP0",
	cs: { code: "CS2", direction: "Day" },
	...o,
});

const work = mkdtempSync(join(tmpdir(), "anima-run-live-"));
// A deliberately chatty source so the upstream child produces a real transcript
// with distinctive sentences we can search for downstream.
writeFileSync(
	join(work, "manifest.txt"),
	[
		"# deployment manifest",
		"# NOTE: the pineapple protocol was deprecated in the aubergine release",
		"# see also: the wombat migration notes and the tangerine rollback plan",
		"replicas: 7",
		"# trailing commentary about zebras that nobody needs downstream",
	].join("\n"),
	"utf8",
);

// Sentences that exist ONLY in the upstream child's world. If any of these turn
// up in the downstream child's argv, context isolation has failed.
const UPSTREAM_ONLY = ["pineapple", "aubergine", "wombat", "tangerine", "zebras"];
// The parent's own context, which must never reach a child either.
const PARENT_ONLY_SECRET = "PARENT-PRIVATE-DELIBERATION-2f9a1c";

console.log(`\nAnima run-state live proof — model=${MODEL}`);
console.log(`workdir: ${work}\n`);

// ── Anima opens the run and holds it ──────────────────────────────────────
let run = beginRun("anima-live-run");
console.log("─── 1. upstream child: extract one variable from a chatty file ───");

const step1Address = addr({ cf: "(0/1)" }); // -> logos
const step1Contract = { exports: ["replicas"] };

const upstream = await dispatchChildPi({
	seam: "agent-team",
	agentName: boundAgent(step1Address) ?? "logos",
	task: "Read manifest.txt. Reply with ONLY the integer value of `replicas`, nothing else.",
	systemPrompt: `You are logos. Parent deliberation (never share): ${PARENT_ONLY_SECRET}. Reply with the integer only.`,
	model: MODEL,
	toolUniverse: ["read"],
	cwd: work,
	vakAddress: step1Address,
});

const upstreamText = (assistantText(upstream.stdout) || upstream.output).trim();
console.log(`  upstream (${boundAgent(step1Address)}) exit=${upstream.exitCode} said ${JSON.stringify(upstreamText.slice(0, 80))}`);
check("the upstream child ran", upstream.exitCode === 0, upstream.stderr.slice(0, 200));

const replicas = Number((upstreamText.match(/\d+/) ?? ["0"])[0]);
check("it extracted the value from the real file", replicas === 7, `got ${replicas}`);

// The parent adopts ONLY the declared export. The raw transcript is measured and dropped.
run = completeStep(run, {
	stepId: "extract-replicas",
	agent: boundAgent(step1Address) ?? "logos",
	address: step1Address,
	contract: step1Contract,
	rawOutput: upstream.stdout,
	exported: { replicas },
});
const size = runContextSize(run);
console.log(`  parent retained ${size.variableChars} chars in ${size.variableCount} variable(s); discarded ${size.discardedOutputChars} chars of child output`);
check("the parent retained only the declared variable", size.variableCount === 1);
check(
	"the child's raw output was measured and dropped, not accumulated",
	size.discardedOutputChars > size.variableChars * 10,
	`retained=${size.variableChars} discarded=${size.discardedOutputChars}`,
);

// ── Downstream child receives ONLY the extracted variable ─────────────────
console.log("\n─── 2. downstream child: receives only the extracted variable ───");

const step2Address = addr({ cf: "(5/0)" }); // -> sophia
const step2Input = childInputFor(run, { imports: ["replicas"] });
const preamble = renderChildInput(step2Input);
console.log(`  child input: ${JSON.stringify(step2Input)}`);
console.log(`  rendered preamble (${preamble.length} chars): ${JSON.stringify(preamble)}`);

const downstream = await dispatchChildPi({
	seam: "agent-chain",
	agentName: boundAgent(step2Address) ?? "sophia",
	task: `${preamble}\n\nDouble the replicas value and reply with only the resulting integer.`,
	systemPrompt: "You are sophia. Reply with the integer only.",
	model: MODEL,
	toolUniverse: ["read"],
	cwd: work,
	vakAddress: step2Address,
});

const downstreamText = (assistantText(downstream.stdout) || downstream.output).trim();
console.log(`  downstream (${boundAgent(step2Address)}) exit=${downstream.exitCode} said ${JSON.stringify(downstreamText.slice(0, 80))}`);
check("the downstream child ran", downstream.exitCode === 0, downstream.stderr.slice(0, 200));
check("it computed from the passed variable", /14/.test(downstreamText), downstreamText.slice(0, 80));

// THE decisive assertion: inspect the exact argv the downstream child received.
const childArgv = downstream.args.join("\n");
console.log(`  downstream argv is ${childArgv.length} chars`);

check(
	"the extracted variable IS present in the child's argv",
	/replicas:\s*7/.test(childArgv),
	"preamble missing from argv",
);

const leakedUpstream = UPSTREAM_ONLY.filter((word) => childArgv.toLowerCase().includes(word));
check(
	"NONE of the upstream child's transcript reached the downstream child",
	leakedUpstream.length === 0,
	`leaked: ${leakedUpstream.join(", ")}`,
);

check(
	"the parent's private context did NOT reach the downstream child",
	!childArgv.includes(PARENT_ONLY_SECRET),
	"parent secret leaked into the child argv",
);

check(
	"the child's whole argv is far smaller than the upstream transcript it replaced",
	childArgv.length < upstream.stdout.length,
	`argv=${childArgv.length} upstreamTranscript=${upstream.stdout.length}`,
);

// ── The parent held the run across both children ──────────────────────────
console.log("\n─── 3. the parent held run state across both children ───");
run = completeStep(run, {
	stepId: "double-replicas",
	agent: boundAgent(step2Address) ?? "sophia",
	address: step2Address,
	contract: { exports: ["doubled"] },
	rawOutput: downstream.stdout,
	exported: { doubled: Number((downstreamText.match(/\d+/) ?? ["0"])[0]) },
});

console.log(`  run ${run.runId}: variables=${JSON.stringify(run.variables)}`);
for (const record of run.completed) {
	console.log(`    ${record.stepId} by ${record.agent} (cf=${record.address.cf}) exported ${JSON.stringify(record.exported)}, dropped ${record.rawOutputChars} chars`);
}
check("both steps are recorded in the parent's run", run.completed.length === 2);
check("each step kept its own VAK address, so the run is scorable per step", run.completed[0].address.cf === "(0/1)" && run.completed[1].address.cf === "(5/0)");
check("the run carries the accumulated variables", run.variables.replicas === 7 && run.variables.doubled === 14, JSON.stringify(run.variables));

rmSync(work, { recursive: true, force: true });
console.log(`\n${failures.length === 0 ? "LIVE PROOF PASS" : `LIVE PROOF FAIL (${failures.length}): ${failures.join("; ")}`}`);
process.exit(failures.length === 0 ? 0 : 1);
