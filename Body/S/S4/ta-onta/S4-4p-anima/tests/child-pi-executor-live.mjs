/**
 * child-pi-executor-live.mjs — LIVE proof for 50.T50.02 (not part of the shared gate).
 *
 * Dispatches REAL child pi processes through the one gated executor and proves
 * the invariants hold on the live path, not just in unit assertions:
 *   - a real child spawns, runs and returns output through `dispatchChildPi`
 *   - the entitlement-resolved `--tools` list actually reaches the child, so a
 *     denied tool is genuinely unavailable to it (this is the gate agent-chain
 *     and pi-pi previously did not have at all)
 *   - a dialogue-only Vama Shakti dispatch refuses with NO process spawned
 *
 * Deliberately NOT `*.test.ts`: it makes live model calls and must not be swept
 * into `verify-all`'s ta-onta suite. Run by hand as the tranche's evidence.
 *
 * Usage: node Body/S/S4/ta-onta/S4-4p-anima/tests/child-pi-executor-live.mjs
 */

import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
	dispatchChildPi,
	ChildPiDispatchRefused,
} from "../lib/child-pi-executor.ts";

const MODEL = process.env.LIVE_MODEL || "google/gemini-3.1-flash-lite";

const failures = [];
function check(label, condition, detail = "") {
	if (condition) {
		console.log(`  PASS  ${label}`);
	} else {
		console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ""}`);
		failures.push(label);
	}
}

/** pi --mode json emits event frames; recover the assistant text. */
function assistantText(stdout) {
	const chunks = [];
	for (const line of stdout.split("\n")) {
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

const work = mkdtempSync(join(tmpdir(), "child-pi-live-"));
writeFileSync(join(work, "secret.txt"), "PINEAPPLE\n", "utf8");

console.log(`\nchild-pi-executor live proof — model=${MODEL}`);
console.log(`workdir: ${work}\n`);

// ── 1. A real child dispatches through the unified seam ────────────────────
console.log("─── 1. real child dispatch through dispatchChildPi (seam: agent-team) ───");
const ran = await dispatchChildPi({
	seam: "agent-team",
	agentName: "live-probe",
	task: "Read secret.txt and reply with only its contents.",
	systemPrompt: "You are a terse file-reading probe. Answer with the file contents only.",
	model: MODEL,
	toolUniverse: ["read"],
	cwd: work,
});

const ranText = assistantText(ran.stdout) || ran.output;
console.log(`  exitCode=${ran.exitCode} elapsed=${ran.elapsed}ms tools=${JSON.stringify(ran.effectiveTools)}`);
console.log(`  child said: ${JSON.stringify(ranText.trim().slice(0, 200))}`);

check("a real child pi spawned and exited cleanly through the executor", ran.exitCode === 0, ran.stderr.slice(0, 300));
check("the child actually used its entitled tool (read the real file)", /PINEAPPLE/.test(ranText), ranText.slice(0, 200));
check("the executor recorded the resolved allow-list", JSON.stringify(ran.effectiveTools) === '["read"]');
check("the argv carried --tools read", ran.args[ran.args.indexOf("--tools") + 1] === "read");
check("Pi->subagent only: argv is a pi harness invocation", ran.args.includes("--mode") && ran.args.includes("--no-session"));

// ── 2. The entitlement gate binds on a formerly ungated seam ───────────────
console.log("\n─── 2. entitlement gate on the agent-chain seam (previously NO gate) ───");
const denied = await dispatchChildPi({
	seam: "agent-chain",
	agentName: "live-probe-denied",
	// The agent declares read+glob; the agent layer denies read, so only glob
	// survives. `glob` lists filenames but cannot return file CONTENTS, which is
	// what makes "denied read => contents unreachable" a true consequence.
	//
	// Note (real property of the model, not a defect): had `bash` been left
	// active, the child could have obtained the contents via `cat` — bash
	// subsumes file reading. Entitlement gates the NAMED TOOL SURFACE; it does
	// not partition capability, and granting bash grants file access.
	toolUniverse: ["read", "glob"],
	team: { allow: ["read", "glob"] },
	agent: { deny: ["read"] },
	task: "Read the file secret.txt and reply with only its contents. If you have no tool that can read file contents, reply exactly NO_READ_TOOL.",
	systemPrompt: "You are a terse probe. Do not guess file contents. If you have no tool that can read file contents, reply exactly NO_READ_TOOL.",
	model: MODEL,
	cwd: work,
});

const deniedText = assistantText(denied.stdout) || denied.output;
console.log(`  exitCode=${denied.exitCode} tools=${JSON.stringify(denied.effectiveTools)}`);
console.log(`  child said: ${JSON.stringify(deniedText.trim().slice(0, 240))}`);

check(
	"the deny list removed `read` from the resolved allow-list",
	JSON.stringify(denied.effectiveTools) === '["glob"]',
	JSON.stringify(denied.effectiveTools),
);
check(
	"`read` never reached the child argv",
	!(denied.args[denied.args.indexOf("--tools") + 1] || "").split(",").includes("read"),
	denied.args[denied.args.indexOf("--tools") + 1],
);
check(
	"denying `read` left the child unable to reach the file contents",
	!/PINEAPPLE/.test(deniedText),
	deniedText.slice(0, 240),
);

// ── 3. A dialogue-only Vama Shakti refuses before any process exists ───────
console.log("\n─── 3. DR-VAMA-5: dialogue-only refusal precedes any process ───");
let refusal = null;
const before = Date.now();
try {
	await dispatchChildPi({
		seam: "pi-pi",
		agentName: "world:Ereshkigal",
		task: "write a file",
		systemPrompt: "summoned entity",
		toolUniverse: ["write"],
		model: MODEL,
		cwd: work,
		vamaShakti: {
			identity_handle: "world:Ereshkigal",
			capability_profile: {
				dialogue_only: true,
				system_tools_granted: [],
				vault_write: false,
				subagent_dispatch: false,
				terminal_authority: false,
			},
			tool_name: "write",
		},
	});
} catch (err) {
	refusal = err;
}
const refusalMs = Date.now() - before;

check("the dispatch was refused", refusal instanceof ChildPiDispatchRefused, String(refusal));
check(
	"refused with the dialogue-only code",
	refusal?.code === "child-pi/vama-shakti-dialogue-only",
	refusal?.code,
);
check(
	"the refusal was immediate — no model call, no process",
	refusalMs < 1000,
	`${refusalMs}ms`,
);
console.log(`  refusal: ${refusal?.message?.slice(0, 180)}`);

rmSync(work, { recursive: true, force: true });

console.log(
	`\n${failures.length === 0 ? "LIVE PROOF PASS" : `LIVE PROOF FAIL (${failures.length}): ${failures.join("; ")}`}`,
);
process.exit(failures.length === 0 ? 0 : 1);
