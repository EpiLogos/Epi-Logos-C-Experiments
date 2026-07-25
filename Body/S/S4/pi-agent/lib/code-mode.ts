/**
 * code-mode.ts — base tool-scripting substrate: ONE program per multi-tool task (50.T50.01).
 *
 * Agents naturally run tools in JSON tool-mode: one call per model round-trip
 * (the "staircase"), where every hop re-sends the whole prior history inline
 * (`Body/S/S3/gateway-contract/src/harness.rs` `ToolCallObserved` re-inlines the
 * full `arguments` + `result` per step). Code-mode collapses a multi-tool task
 * into a SINGLE TypeScript program executed once: the model emits the program,
 * the program's function calls resolve to the agent's entitled tool set, and the
 * whole composition costs one round-trip instead of N.
 *
 * JSON tool-mode remains the substrate and the fallback. This module is the
 * default *usage* on top of it for any task touching >= 2 tools.
 *
 * NO NEW VM. The program runs as a real `node` child process over pi's own
 * execution substrate. The only thing this module adds is a gated bridge: the
 * program asks the parent for a tool, and the parent answers only if the tool
 * passes BOTH halves of the unchanged security boundary —
 *   1. the `--tools` allow-list as it stands at spawn (`activeTools`), and
 *   2. `isEntitled()` (`Body/S/S4/ta-onta/shared/entitlement.ts`) at dispatch.
 * There is exactly one choke point (`resolveToolFunction`); a program cannot
 * reach a tool implementation by any other route.
 *
 * Canon: [[S4-SPEC]] -> agent runtime tool dispatch; DR-VAK-3 (VAK is the
 * operational language, not metadata over labels).
 */

import { createServer, type Server, type Socket } from "node:net";
import { spawn } from "node:child_process";
import { mkdtempSync, writeFileSync, copyFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { isEntitled, type EntitlementLayer } from "../../ta-onta/shared/entitlement.ts";

/** Filename of the bridge module the emitted program imports. */
export const BRIDGE_MODULE_NAME = "epi-tools.mjs";

/** The exact import line an emitted program uses to reach its entitled tools. */
export const BRIDGE_IMPORT_LINE = `import { tools } from "./${BRIDGE_MODULE_NAME}";`;

/** Env var carrying the bridge socket path into the child program. */
export const BRIDGE_SOCKET_ENV = "EPI_CODE_MODE_SOCKET";

/**
 * The entitlement context a code-mode run is gated against. Mirrors the layers
 * `isEntitled()` resolves: universe U, team layer, agent layer — plus the
 * spawn-time `--tools` allow-list, which is a hard ceiling independent of U.
 */
export interface CodeModeToolContext {
	/** The universe of published tool names (U). */
	universe: string[];
	/** Team allow/deny layer. Empty/absent = inherit U. */
	team?: EntitlementLayer;
	/** Agent allow/deny layer. Empty/absent = inherit the team ceiling. */
	agent?: EntitlementLayer;
	/**
	 * The active tool names at spawn — i.e. what `--tools` left switched on.
	 * When present it is an additional hard ceiling: a tool absent from this
	 * list is unreachable even if `isEntitled()` would allow it. Absent/empty
	 * means no spawn-level restriction was applied.
	 */
	activeTools?: string[];
}

/** A tool implementation callable from a code-mode program. */
export type ToolImplementation = (
	params: Record<string, unknown>,
) => Promise<unknown> | unknown;

/** Why a tool resolution was refused. */
export type CodeModeRefusalCode =
	| "code-mode/not-active" // excluded by the spawn `--tools` allow-list
	| "code-mode/not-entitled" // refused by isEntitled()
	| "code-mode/no-implementation"; // entitled but nothing registered to run

/** Typed refusal raised at the single dispatch choke point. */
export class CodeModeToolRefused extends Error {
	readonly code: CodeModeRefusalCode;
	readonly tool: string;

	constructor(code: CodeModeRefusalCode, tool: string, message: string) {
		super(message);
		this.name = "CodeModeToolRefused";
		this.code = code;
		this.tool = tool;
	}
}

/**
 * THE choke point. Resolves a tool name to its implementation, or throws.
 *
 * Order matters and is part of the contract: the spawn-time allow-list is
 * checked before entitlement, so a tool switched off at spawn is refused with
 * `not-active` and never consults the entitlement layers at all.
 */
export function resolveToolFunction(
	name: string,
	implementations: Map<string, ToolImplementation>,
	ctx: CodeModeToolContext,
): ToolImplementation {
	const tool = typeof name === "string" ? name.trim() : "";
	if (tool.length === 0) {
		throw new CodeModeToolRefused(
			"code-mode/not-entitled",
			String(name),
			"code-mode refused an empty tool name",
		);
	}

	const active = ctx.activeTools ?? [];
	if (active.length > 0 && !active.includes(tool)) {
		throw new CodeModeToolRefused(
			"code-mode/not-active",
			tool,
			`tool "${tool}" is not in the spawn --tools allow-list`,
		);
	}

	if (!isEntitled(tool, ctx.universe, ctx.team, ctx.agent)) {
		throw new CodeModeToolRefused(
			"code-mode/not-entitled",
			tool,
			`tool "${tool}" is not entitled for this agent`,
		);
	}

	const impl = implementations.get(tool);
	if (typeof impl !== "function") {
		throw new CodeModeToolRefused(
			"code-mode/no-implementation",
			tool,
			`tool "${tool}" is entitled but has no registered code-mode implementation`,
		);
	}
	return impl;
}

/**
 * The tool names a code-mode program may actually call: entitled, active, and
 * backed by an implementation. This is what the program's typed surface is
 * generated from, so the allow-list is visible to the model up front rather
 * than discovered by refusal.
 */
export function callableToolNames(
	implementations: Map<string, ToolImplementation>,
	ctx: CodeModeToolContext,
): string[] {
	const names: string[] = [];
	for (const name of implementations.keys()) {
		try {
			resolveToolFunction(name, implementations, ctx);
			names.push(name);
		} catch {
			// not callable — omitted from the surface by design
		}
	}
	return names.sort();
}

/** One recorded tool call from a code-mode run. */
export interface ToolCallRecord {
	seq: number;
	tool: string;
	paramChars: number;
	resultChars: number;
	ok: boolean;
	elapsedMs: number;
	refusalCode?: CodeModeRefusalCode;
	error?: string;
}

/**
 * Token accounting for the run.
 *
 * The estimator is `ceil(chars / 4)` — deliberately crude and stated as such;
 * what matters is the SHAPE of the comparison, which is structural, not the
 * absolute count. Both sides are computed from the SAME recorded trace, so the
 * delta is a measurement of the two protocols over identical work, not a guess
 * about what an agent might have done.
 *
 * staircase (JSON tool-mode), N calls, per `harness.rs` re-inlining:
 *   for hop i the model re-reads every prior call + result, then emits call i:
 *     hop_i = promptTokens + SUM_{j<i}(param_j + result_j) + param_i
 *   plus result_i comes back once:
 *     staircase = SUM_i hop_i + SUM_i result_i
 *
 * script (code-mode): one emission, one result:
 *     script = promptTokens + programTokens + stdoutTokens
 */
export interface TokenAccounting {
	/** The estimator used, named so a reader never mistakes it for a tokenizer. */
	estimator: "chars/4";
	/** Shared task/system context both protocols pay for, in tokens. */
	promptTokens: number;
	programChars: number;
	programTokens: number;
	stdoutTokens: number;
	callCount: number;
	/** Total tokens for the single-program protocol. */
	scriptTokens: number;
	/** Total tokens the equivalent JSON staircase would have cost. */
	staircaseTokens: number;
	/** staircaseTokens - scriptTokens (positive = code-mode is cheaper). */
	deltaTokens: number;
	/** scriptTokens / staircaseTokens, or null when the staircase is empty. */
	ratio: number | null;
}

/** Crude, honest token estimate. */
export function estimateTokens(chars: number): number {
	if (!Number.isFinite(chars) || chars <= 0) return 0;
	return Math.ceil(chars / 4);
}

/** Compute the two-protocol accounting from a recorded trace. */
export function accountTokens(input: {
	programChars: number;
	stdoutChars: number;
	calls: ToolCallRecord[];
	promptChars?: number;
}): TokenAccounting {
	const promptTokens = estimateTokens(input.promptChars ?? 0);
	const programTokens = estimateTokens(input.programChars);
	const stdoutTokens = estimateTokens(input.stdoutChars);

	let cumulative = 0;
	let staircase = 0;
	for (const call of input.calls) {
		const paramTokens = estimateTokens(call.paramChars);
		const resultTokens = estimateTokens(call.resultChars);
		// hop i: re-read all prior traffic, then emit this call's arguments
		staircase += promptTokens + cumulative + paramTokens;
		// this call's result arrives once
		staircase += resultTokens;
		cumulative += paramTokens + resultTokens;
	}

	const scriptTokens = promptTokens + programTokens + stdoutTokens;
	return {
		estimator: "chars/4",
		promptTokens,
		programChars: input.programChars,
		programTokens,
		stdoutTokens,
		callCount: input.calls.length,
		scriptTokens,
		staircaseTokens: staircase,
		deltaTokens: staircase - scriptTokens,
		ratio: staircase > 0 ? scriptTokens / staircase : null,
	};
}

/** Result of one code-mode run. */
export interface CodeModeRunResult {
	ok: boolean;
	exitCode: number | null;
	stdout: string;
	stderr: string;
	/** Every tool call the program made, in order, gated or refused. */
	calls: ToolCallRecord[];
	accounting: TokenAccounting;
	/** Directory the program + bridge were materialised into. */
	runDir: string;
	timedOut: boolean;
}

/** How the program text is executed. Injectable so tests can drive it directly. */
export type ScriptExecutor = (spec: {
	entryPath: string;
	runDir: string;
	cwd: string;
	env: Record<string, string>;
	timeoutMs: number;
}) => Promise<{ exitCode: number | null; stdout: string; stderr: string; timedOut: boolean }>;

/**
 * Default executor: a real `node` child process. This is pi's execution
 * substrate, not a sandbox and not an interpreter — the program is ordinary
 * TypeScript run by the ordinary runtime.
 */
export const nodeScriptExecutor: ScriptExecutor = (spec) =>
	new Promise((resolve) => {
		const child = spawn(process.execPath, [spec.entryPath], {
			cwd: spec.cwd,
			env: spec.env,
			stdio: ["ignore", "pipe", "pipe"],
		});
		let stdout = "";
		let stderr = "";
		let timedOut = false;
		const timer = setTimeout(() => {
			timedOut = true;
			child.kill("SIGKILL");
		}, spec.timeoutMs);
		child.stdout.on("data", (chunk) => {
			stdout += String(chunk);
		});
		child.stderr.on("data", (chunk) => {
			stderr += String(chunk);
		});
		child.on("close", (code) => {
			clearTimeout(timer);
			resolve({ exitCode: code, stdout, stderr, timedOut });
		});
		child.on("error", (err) => {
			clearTimeout(timer);
			resolve({
				exitCode: null,
				stdout,
				stderr: `${stderr}${stderr ? "\n" : ""}${err.message}`,
				timedOut,
			});
		});
	});

/** Locate the bridge module shipped beside this file. */
function bridgeSourcePath(): string {
	return join(dirname(fileURLToPath(import.meta.url)), BRIDGE_MODULE_NAME);
}

/**
 * Ensure the program can reach its tools. Models routinely omit the import; a
 * program that references `tools.` without importing it gets the documented
 * import line prepended rather than failing on a technicality.
 */
export function normalizeProgram(program: string): string {
	const text = String(program ?? "");
	if (text.includes(BRIDGE_MODULE_NAME)) return text;
	if (!/\btools\s*[.[]/.test(text)) return text;
	return `${BRIDGE_IMPORT_LINE}\n${text}`;
}

/** Serve the gated tool bridge for the lifetime of one run. */
function startBridge(
	socketPath: string,
	implementations: Map<string, ToolImplementation>,
	ctx: CodeModeToolContext,
	calls: ToolCallRecord[],
): Promise<Server> {
	const server = createServer((socket: Socket) => {
		let buffer = "";
		socket.on("data", (chunk) => {
			buffer += String(chunk);
			let index = buffer.indexOf("\n");
			while (index >= 0) {
				const line = buffer.slice(0, index);
				buffer = buffer.slice(index + 1);
				if (line.trim().length > 0) void handleLine(line, socket);
				index = buffer.indexOf("\n");
			}
		});
		socket.on("error", () => {
			/* child went away mid-call; the run result carries the truth */
		});
	});

	async function handleLine(line: string, socket: Socket): Promise<void> {
		let request: { id?: unknown; tool?: unknown; params?: unknown };
		try {
			request = JSON.parse(line);
		} catch {
			return;
		}
		const id = request.id;
		const tool = String(request.tool ?? "");
		const params =
			request.params && typeof request.params === "object" && !Array.isArray(request.params)
				? (request.params as Record<string, unknown>)
				: {};
		const paramChars = JSON.stringify(params).length;
		const seq = calls.length + 1;
		const started = Date.now();

		const reply = (payload: Record<string, unknown>): void => {
			if (!socket.destroyed) socket.write(`${JSON.stringify({ id, ...payload })}\n`);
		};

		let impl: ToolImplementation;
		try {
			impl = resolveToolFunction(tool, implementations, ctx);
		} catch (err) {
			const refusal = err as CodeModeToolRefused;
			calls.push({
				seq,
				tool,
				paramChars,
				resultChars: 0,
				ok: false,
				elapsedMs: Date.now() - started,
				refusalCode: refusal.code,
				error: refusal.message,
			});
			reply({ ok: false, error: refusal.message, refusalCode: refusal.code });
			return;
		}

		try {
			const result = await impl(params);
			const serialized = result === undefined ? "null" : JSON.stringify(result);
			calls.push({
				seq,
				tool,
				paramChars,
				resultChars: serialized.length,
				ok: true,
				elapsedMs: Date.now() - started,
			});
			reply({ ok: true, result: result === undefined ? null : result });
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			calls.push({
				seq,
				tool,
				paramChars,
				resultChars: 0,
				ok: false,
				elapsedMs: Date.now() - started,
				error: message,
			});
			reply({ ok: false, error: message });
		}
	}

	return new Promise((resolve, reject) => {
		server.once("error", reject);
		server.listen(socketPath, () => resolve(server));
	});
}

/**
 * Run one code-mode program.
 *
 * The program is materialised next to a copy of the bridge module, executed
 * once, and every tool call it makes is gated through `resolveToolFunction`
 * and recorded. The returned trace is the deterministic unit later tranches
 * score, persist, and learn from.
 */
export async function runToolScript(options: {
	program: string;
	implementations: Map<string, ToolImplementation>;
	ctx: CodeModeToolContext;
	cwd?: string;
	env?: Record<string, string | undefined>;
	exec?: ScriptExecutor;
	timeoutMs?: number;
	/** Chars of shared task/system context, for the accounting baseline. */
	promptChars?: number;
	/** Keep the run directory on disk (default: remove it). */
	keepRunDir?: boolean;
}): Promise<CodeModeRunResult> {
	const cwd = options.cwd ?? process.cwd();
	const timeoutMs = options.timeoutMs ?? 120_000;
	const exec = options.exec ?? nodeScriptExecutor;
	const calls: ToolCallRecord[] = [];

	const runDir = mkdtempSync(join(tmpdir(), "epi-code-mode-"));
	const socketPath = join(runDir, "bridge.sock");
	const program = normalizeProgram(options.program);
	const entryPath = join(runDir, "program.ts");

	writeFileSync(entryPath, program, "utf8");
	copyFileSync(bridgeSourcePath(), join(runDir, BRIDGE_MODULE_NAME));

	const server = await startBridge(socketPath, options.implementations, options.ctx, calls);

	const baseEnv: Record<string, string> = {};
	for (const [key, value] of Object.entries(options.env ?? process.env)) {
		if (typeof value === "string") baseEnv[key] = value;
	}
	baseEnv[BRIDGE_SOCKET_ENV] = socketPath;

	let outcome: { exitCode: number | null; stdout: string; stderr: string; timedOut: boolean };
	try {
		outcome = await exec({ entryPath, runDir, cwd, env: baseEnv, timeoutMs });
	} finally {
		await new Promise<void>((resolve) => server.close(() => resolve()));
	}

	const accounting = accountTokens({
		programChars: program.length,
		stdoutChars: outcome.stdout.length,
		calls,
		promptChars: options.promptChars,
	});

	if (!options.keepRunDir) {
		try {
			rmSync(runDir, { recursive: true, force: true });
		} catch {
			/* best-effort cleanup */
		}
	}

	return {
		ok: outcome.exitCode === 0 && !outcome.timedOut,
		exitCode: outcome.exitCode,
		stdout: outcome.stdout,
		stderr: outcome.stderr,
		calls,
		accounting,
		runDir,
		timedOut: outcome.timedOut,
	};
}

/**
 * The instruction block a code-mode-capable agent is given. It states the
 * contract the emitted program must satisfy, the >= 2-tool default, and — the
 * part a one-shot program cannot do without — the exact signature and RETURN
 * SHAPE of every callable tool.
 */
export function codeModeGuidance(
	callable: string[],
	signatures: Record<string, string> = {},
): string {
	const lines = [
		"Code-mode is the default for any task using two or more tools: emit ONE TypeScript",
		"program that performs the whole composition, instead of one tool call per turn.",
		"",
		`Reach your entitled tools with exactly this import:  ${BRIDGE_IMPORT_LINE}`,
		"Every tool is an async function taking one object argument:  await tools.<name>({ ... })",
		"Top-level await is available — you do not need to wrap the program in a main().",
		"",
	];

	if (callable.length === 0) {
		lines.push("No tools are currently entitled for code-mode in this run.");
	} else {
		lines.push("Callable in this run (note each RETURN TYPE — it is what you get back):");
		for (const name of callable) {
			lines.push(`  ${signatures[name] ?? `${name}({ ... }) -> unknown`}`);
		}
	}

	lines.push(
		"",
		"A refused or failing call throws inside the program; catch it if you want to continue.",
		"Ordinary local computation (loops, string work, control flow, node stdlib) belongs in",
		"the program directly — do not spend a tool call on something the program can compute.",
		"Print the task's answer to stdout; stdout is what returns to the conversation.",
	);
	return lines.join("\n");
}
