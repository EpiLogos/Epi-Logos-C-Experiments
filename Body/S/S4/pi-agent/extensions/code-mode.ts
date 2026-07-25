/**
 * code-mode.ts — pi extension exposing the single-script run mode (50.T50.01).
 *
 * Registers ONE tool, `run_tool_script`. An agent facing a task that touches two
 * or more tools emits a single TypeScript program instead of a staircase of JSON
 * tool calls; this extension executes it once and returns the program's stdout
 * plus the run's token accounting.
 *
 * The security boundary is unchanged. `--tools` still decides what is active at
 * spawn (read here from `api.getActiveTools()`), and `isEntitled()` still decides
 * dispatch. Both are applied by `resolveToolFunction()` in `lib/code-mode.ts`,
 * which is the only path from a program to a tool implementation. No new VM: the
 * program is run by ordinary node over pi's own execution substrate.
 *
 * Canon: [[S4-SPEC]] -> agent runtime tool dispatch; DR-VAK-3.
 */

import { appendFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import {
	BRIDGE_IMPORT_LINE,
	callableToolNames,
	codeModeGuidance,
	runToolScript,
	type CodeModeToolContext,
} from "../lib/code-mode.ts";
import {
	buildCodeModeImplementations,
	codeModeToolUniverse,
	TOOL_SIGNATURES,
} from "../lib/code-mode-tools.ts";
import { parseCommaList } from "../lib/entitlement.ts";

declare global {
	var __epiCodeModeRegistered: boolean | undefined;
}

/** Env var naming a JSONL sink for run traces. Absent = no trace written. */
export const CODE_MODE_TRACE_ENV = "EPI_CODE_MODE_TRACE";

function repoRoot(): string {
	return process.env.EPI_REPO_ROOT || process.cwd();
}

/**
 * Append one run's deterministic trace to the configured sink.
 *
 * The trace is the run's own record — the program, the gated call sequence, and
 * the token accounting. It is what makes a code-mode run observable from outside
 * the conversation (and, in later tranches, replayable and scorable).
 */
function emitTrace(record: unknown): void {
	const sink = process.env[CODE_MODE_TRACE_ENV];
	if (!sink) return;
	try {
		mkdirSync(dirname(sink), { recursive: true });
		appendFileSync(sink, `${JSON.stringify(record)}\n`, "utf8");
	} catch {
		// A trace sink must never break the run it observes.
	}
}

/**
 * Resolve the entitlement context for this session.
 *
 * `activeTools` comes from the live session, so it reflects `--tools` exactly.
 * The team/agent layers come from the same env the rest of the pi surface uses,
 * so code-mode inherits whatever the spawning seam already configured.
 */
export function codeModeContext(activeTools: string[]): CodeModeToolContext {
	return {
		universe: codeModeToolUniverse(),
		team: {
			allow: parseCommaList(process.env.EPI_TEAM_TOOLS),
			deny: parseCommaList(process.env.EPI_TEAM_TOOLS_DENY),
		},
		agent: {
			allow: parseCommaList(process.env.EPI_AGENT_TOOLS),
			deny: parseCommaList(process.env.EPI_AGENT_TOOLS_DENY),
		},
		activeTools,
	};
}

export async function main(api: ExtensionAPI) {
	if (globalThis.__epiCodeModeRegistered) return;
	globalThis.__epiCodeModeRegistered = true;

	const root = repoRoot();
	const implementations = buildCodeModeImplementations(root);

	/**
	 * Size of the context a JSON tool-mode hop would re-send.
	 *
	 * This is the dominant term in the staircase and the whole reason code-mode
	 * pays off: per `harness.rs` `ToolCallObserved`, every hop re-inlines the
	 * conversation so far on top of the assembled system prompt. Measured from
	 * this very session rather than assumed, and 0 until the first turn starts —
	 * with 0 the accounting reports only the tool-traffic component, which
	 * UNDERSTATES the staircase. Never treat a 0-baseline delta as the verdict.
	 */
	let contextChars = 0;

	api.registerTool({
		name: "run_tool_script",
		label: "Code Mode",
		description: [
			"Run ONE TypeScript program that performs a whole multi-tool task in a single call.",
			"This is the DEFAULT for any task using two or more tools — prefer it over issuing",
			"tool calls one per turn, which re-sends the entire conversation on every hop.",
			"",
			`In the program, reach your entitled tools with: ${BRIDGE_IMPORT_LINE}`,
			"Each tool is an async function of one object: await tools.read({ path: '...' })",
			"read returns the file text as a string; write returns bytes written; glob returns string[].",
			"Do local computation (loops, parsing, control flow) in the program itself.",
			"Print the task's answer with console.log — stdout is what returns to you.",
		].join("\n"),
		promptSnippet:
			"run_tool_script: compose a multi-tool task as one TypeScript program (default for >= 2 tools)",
		promptGuidelines: [
			"When a task needs two or more tool calls, emit one run_tool_script program instead.",
			"Never spend a tool call on something the program can compute locally.",
		],
		parameters: Type.Object({
			program: Type.String({
				description:
					"The TypeScript program to run. Import tools from './epi-tools.mjs' and console.log the answer.",
			}),
			timeoutMs: Type.Optional(
				Type.Number({ description: "Hard timeout for the run (default 120000)." }),
			),
		}),
		async execute(_toolCallId, params) {
			const activeTools = api.getActiveTools();
			const ctx = codeModeContext(activeTools);

			const run = await runToolScript({
				program: params.program,
				implementations,
				ctx,
				cwd: root,
				promptChars: contextChars,
				timeoutMs: typeof params.timeoutMs === "number" ? params.timeoutMs : undefined,
			});

			emitTrace({
				kind: "code_mode_run",
				at: new Date().toISOString(),
				activeTools,
				callableTools: callableToolNames(implementations, ctx),
				contextChars,
				program: params.program,
				exitCode: run.exitCode,
				timedOut: run.timedOut,
				ok: run.ok,
				stdout: run.stdout,
				stderr: run.stderr,
				calls: run.calls,
				accounting: run.accounting,
			});

			const summary = [
				run.timedOut
					? "code-mode run TIMED OUT"
					: `code-mode run exited ${run.exitCode}`,
				`tool calls: ${run.calls.length} (${run.calls.filter((c) => c.ok).length} ok, ${run.calls.filter((c) => !c.ok).length} refused/failed)`,
				`tokens: script ~${run.accounting.scriptTokens} vs staircase ~${run.accounting.staircaseTokens} (saved ~${run.accounting.deltaTokens})`,
			].join(" | ");

			const refusals = run.calls
				.filter((c) => !c.ok)
				.map((c) => `  - ${c.tool}: ${c.refusalCode ?? "error"} — ${c.error ?? ""}`)
				.join("\n");

			const text = [
				run.stdout.trimEnd(),
				run.stderr.trim().length > 0 ? `\n[stderr]\n${run.stderr.trimEnd()}` : "",
				refusals.length > 0 ? `\n[refused tool calls]\n${refusals}` : "",
				`\n[${summary}]`,
			]
				.filter((part) => part.length > 0)
				.join("\n");

			return {
				content: [{ type: "text" as const, text }],
				isError: !run.ok,
			};
		},
	});

	// Make the >= 2-tool default and the callable surface visible to the model up
	// front, rather than discovered by refusal mid-program. Chained onto the
	// assembled system prompt so it survives whatever else the session loaded.
	api.on("before_agent_start", (event) => {
		const callable = callableToolNames(implementations, codeModeContext(api.getActiveTools()));
		// Record what a staircase hop would re-send, for the run's accounting.
		contextChars = event.systemPrompt.length + event.prompt.length;
		return {
			systemPrompt: `${event.systemPrompt}\n\n## Code mode\n\n${codeModeGuidance(callable, TOOL_SIGNATURES)}\n`,
		};
	});
}

export default async function codeModeExtension(api: ExtensionAPI) {
	await main(api);
}
