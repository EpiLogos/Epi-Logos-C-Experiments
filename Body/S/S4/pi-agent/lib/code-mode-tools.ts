/**
 * code-mode-tools.ts — the callable tool surface for code-mode programs (50.T50.01).
 *
 * Code-mode programs address tools by the SAME names the JSON tool-mode agent
 * is entitled to, so a single entitlement configuration governs both protocols:
 * an agent denied `write` cannot write in either mode.
 *
 * Two families are registered here:
 *   - local primitives (`read`/`write`/`edit`/`glob`/`grep`) — the file-shaped
 *     operations pi ships as builtins, re-expressed as directly callable
 *     functions so a program can compose them without a model round-trip per
 *     call. Same names, same entitlement, no model in the loop.
 *   - `epi_*` CLI routes — the sovereign `epi` substrate surface already exposed
 *     to JSON tool-mode by `pi-agent/extensions/epi-citta.ts`.
 *
 * SCOPE OF THE GATE, stated plainly: the gate governs the TOOL SURFACE. An
 * emitted program is ordinary TypeScript run by ordinary node, so it holds the
 * same OS authority the agent already holds through its `bash` tool — it is not
 * a sandbox and this module does not claim to be one. No new privilege is
 * created relative to JSON tool-mode; what is enforced is that the *named tool
 * surface* obeys `isEntitled()` exactly as it does today.
 *
 * Canon: [[S4-SPEC]] -> agent runtime tool dispatch.
 */

import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative, sep } from "node:path";
import type { ToolImplementation } from "./code-mode.ts";

/** Directory names never walked by `glob`/`grep`. */
const PRUNED_DIRS = new Set([
	".git",
	"node_modules",
	"target",
	"dist",
	".venv",
	"__pycache__",
	".pnpm-store",
]);

/** Hard ceilings so a program cannot accidentally sweep the whole repo. */
const MAX_WALK_ENTRIES = 20_000;
const MAX_MATCHES = 500;

function requireString(params: Record<string, unknown>, key: string): string {
	const value = params[key];
	if (typeof value !== "string" || value.trim().length === 0) {
		throw new Error(`parameter "${key}" is required and must be a non-empty string`);
	}
	return value;
}

function resolveWithin(root: string, candidate: string): string {
	const absolute = candidate.startsWith(sep) ? candidate : join(root, candidate);
	const rel = relative(root, absolute);
	if (rel.startsWith("..")) {
		throw new Error(`path "${candidate}" escapes the run root`);
	}
	return absolute;
}

/** Walk `root` breadth-first, pruning noisy directories, bounded. */
function walkFiles(root: string): string[] {
	const found: string[] = [];
	const queue: string[] = [root];
	let visited = 0;
	while (queue.length > 0 && visited < MAX_WALK_ENTRIES) {
		const dir = queue.shift() as string;
		let entries: string[];
		try {
			entries = readdirSync(dir);
		} catch {
			continue;
		}
		for (const entry of entries) {
			visited += 1;
			if (visited >= MAX_WALK_ENTRIES) break;
			if (PRUNED_DIRS.has(entry)) continue;
			const full = join(dir, entry);
			let info;
			try {
				info = statSync(full);
			} catch {
				continue;
			}
			if (info.isDirectory()) queue.push(full);
			else if (info.isFile()) found.push(full);
		}
	}
	return found;
}

/** Translate a `*`/`**`/`?` glob into an anchored regexp. */
export function globToRegExp(pattern: string): RegExp {
	let out = "";
	for (let i = 0; i < pattern.length; i += 1) {
		const char = pattern[i];
		if (char === "*") {
			if (pattern[i + 1] === "*") {
				out += ".*";
				i += 1;
				if (pattern[i + 1] === "/") i += 1;
			} else {
				out += "[^/]*";
			}
		} else if (char === "?") {
			out += "[^/]";
		} else if ("\\^$.|+()[]{}".includes(char)) {
			out += `\\${char}`;
		} else {
			out += char;
		}
	}
	return new RegExp(`^${out}$`);
}

/** Run one `epi` CLI route. */
function runEpi(root: string, args: string[]): { exitCode: number; output: string } {
	const result = spawnSync("epi", args, { encoding: "utf8", cwd: root });
	return {
		exitCode: result.status ?? -1,
		output: result.stdout || result.stderr || "",
	};
}

/** The `epi` routes exposed to code-mode, mirroring `extensions/epi-citta.ts`. */
export const EPI_ROUTE_COMMANDS: Record<string, string[]> = {
	epi_core_inspect: ["core", "inspect"],
	epi_core_verify: ["core", "verify"],
	epi_vault_read: ["vault", "read"],
	epi_graph_query: ["graph", "query"],
	epi_agent_help: ["agent", "help"],
};

/**
 * Build the code-mode implementation registry.
 *
 * `root` bounds the file primitives: every path is resolved inside it and a
 * path escaping it is refused. Pass the repo root (or a task working dir).
 */
export function buildCodeModeImplementations(root: string): Map<string, ToolImplementation> {
	const impls = new Map<string, ToolImplementation>();

	// Every primitive returns its PAYLOAD directly — a string, a number, an
	// array — never a metadata wrapper. Inside a program the caller already
	// knows what it asked for, and a wrapper only invites `content.trim is not
	// a function`. The shapes are declared to the model in TOOL_SIGNATURES.
	impls.set("read", (params) => {
		const path = resolveWithin(root, requireString(params, "path"));
		const text = readFileSync(path, "utf8");
		const offset = typeof params.offset === "number" ? Math.max(0, params.offset) : 0;
		const limit = typeof params.limit === "number" ? params.limit : undefined;
		if (offset === 0 && limit === undefined) return text;
		const lines = text.split("\n");
		return lines.slice(offset, limit === undefined ? undefined : offset + limit).join("\n");
	});

	impls.set("write", (params) => {
		const path = resolveWithin(root, requireString(params, "path"));
		const content = typeof params.content === "string" ? params.content : "";
		mkdirSync(dirname(path), { recursive: true });
		writeFileSync(path, content, "utf8");
		return Buffer.byteLength(content, "utf8");
	});

	impls.set("edit", (params) => {
		const path = resolveWithin(root, requireString(params, "path"));
		const oldText = requireString(params, "oldText");
		const newText = typeof params.newText === "string" ? params.newText : "";
		const original = readFileSync(path, "utf8");
		const replaceAll = params.replaceAll === true;
		const occurrences = original.split(oldText).length - 1;
		if (occurrences === 0) throw new Error(`oldText not found in ${path}`);
		if (occurrences > 1 && !replaceAll) {
			throw new Error(
				`oldText occurs ${occurrences} times in ${path}; pass replaceAll:true or supply a unique anchor`,
			);
		}
		const updated = replaceAll
			? original.split(oldText).join(newText)
			: original.replace(oldText, newText);
		writeFileSync(path, updated, "utf8");
		return replaceAll ? occurrences : 1;
	});

	impls.set("glob", (params) => {
		const pattern = requireString(params, "pattern");
		const base = resolveWithin(root, typeof params.path === "string" ? params.path : ".");
		const matcher = globToRegExp(pattern);
		const matches: string[] = [];
		for (const file of walkFiles(base)) {
			const rel = relative(base, file);
			if (matcher.test(rel) || matcher.test(file)) {
				matches.push(rel);
				if (matches.length >= MAX_MATCHES) break;
			}
		}
		return matches;
	});

	impls.set("grep", (params) => {
		const pattern = requireString(params, "pattern");
		const base = resolveWithin(root, typeof params.path === "string" ? params.path : ".");
		const flags = typeof params.flags === "string" ? params.flags : "";
		const regexp = new RegExp(pattern, flags.includes("i") ? "i" : "");
		const hits: Array<{ file: string; line: number; text: string }> = [];
		for (const file of walkFiles(base)) {
			let content: string;
			try {
				content = readFileSync(file, "utf8");
			} catch {
				continue;
			}
			const lines = content.split("\n");
			for (let i = 0; i < lines.length; i += 1) {
				if (regexp.test(lines[i])) {
					hits.push({ file: relative(base, file), line: i + 1, text: lines[i].slice(0, 400) });
					if (hits.length >= MAX_MATCHES) break;
				}
			}
			if (hits.length >= MAX_MATCHES) break;
		}
		return hits;
	});

	for (const [name, command] of Object.entries(EPI_ROUTE_COMMANDS)) {
		impls.set(name, (params) => {
			const args = [...command];
			const extra = params.coordinate ?? params.path ?? params.query;
			if (typeof extra === "string" && extra.length > 0) args.push(extra);
			return runEpi(root, args);
		});
	}

	return impls;
}

/**
 * The exact call signature of every code-mode tool, as shown to the model.
 *
 * This is load-bearing, not decoration: the first live run of this substrate
 * failed because the model assumed `read` returned a string while it returned a
 * `{ path, content }` wrapper, then burned three retry programs recovering. A
 * program is written blind in one shot, so the return shape must be stated up
 * front rather than discovered by exception.
 */
export const TOOL_SIGNATURES: Record<string, string> = {
	read: "read({ path, offset?, limit? }) -> string   // the file's text",
	write: "write({ path, content }) -> number   // bytes written",
	edit: "edit({ path, oldText, newText, replaceAll? }) -> number   // replacements made",
	glob: "glob({ pattern, path? }) -> string[]   // paths relative to path",
	grep: "grep({ pattern, path?, flags? }) -> { file, line, text }[]",
	epi_core_inspect: "epi_core_inspect({ coordinate? }) -> { exitCode, output }",
	epi_core_verify: "epi_core_verify({ coordinate? }) -> { exitCode, output }",
	epi_vault_read: "epi_vault_read({ path? }) -> { exitCode, output }",
	epi_graph_query: "epi_graph_query({ query? }) -> { exitCode, output }",
	epi_agent_help: "epi_agent_help({ query? }) -> { exitCode, output }",
};

/** Every tool name code-mode can implement — the universe U for a code-mode run. */
export function codeModeToolUniverse(): string[] {
	return [
		"read",
		"write",
		"edit",
		"glob",
		"grep",
		...Object.keys(EPI_ROUTE_COMMANDS),
	].sort();
}
