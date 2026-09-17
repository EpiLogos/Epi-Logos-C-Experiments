#!/usr/bin/env node
/**
 * typecheck-ta-onta.mjs — strict type gate for the S4 agent-runtime TypeScript.
 *
 * ── Why this exists ───────────────────────────────────────────────────────
 * `node --test` runs these files by STRIPPING types, never checking them. So a
 * type contract could be wrong for months and every suite would still be green.
 * That is not hypothetical: 50.T50.07 found two live defects the moment a real
 * `tsc` was pointed at this tree —
 *   - `getCSState("")` returned the empty STRING instead of a state, because
 *     `sessionId && map.get(sessionId)` yields `""` (falsy but not nullish), so
 *     `?? default` passed it straight through;
 *   - a field declared on Anima's move-result type was being read off a value
 *     typed by the shared cross-carrier mirror, where it does not exist.
 * Both were invisible to the existing gate. This closes that hole.
 *
 * ── What it checks ────────────────────────────────────────────────────────
 * Every `.ts` under `Body/S/S4` whose transitive import closure RESOLVES —
 * node builtins, relative paths, and any package actually installed in
 * `Body/S/S4/node_modules`. Since the pi runtime packages are now devDeps there,
 * that includes the extension entry points, not just the pure logic layer.
 *
 * Coverage therefore grows by installing a package rather than by editing a
 * list here. Anything still unresolvable is EXCLUDED and printed by name with
 * the package that excluded it — never silently dropped, so a shrinking gate is
 * visible in the run output.
 *
 * Carrier directories are reached ONLY by their canonical `S4-<n>p-<name>`
 * path; `ta-onta/{khora,hen,pleroma,chronos,anima,aletheia}` are symlinks to
 * those same directories, and following them would double-check every file.
 *
 * Usage:
 *   node .codex/scripts/typecheck-ta-onta.mjs            # gate (exit 1 on error)
 *   node .codex/scripts/typecheck-ta-onta.mjs --list     # show the partition only
 */

import { spawnSync } from "node:child_process";
import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const SCAN_ROOT = join(REPO_ROOT, "Body", "S", "S4");
const TSC = join(REPO_ROOT, "Body", "S", "S4", "node_modules", ".bin", "tsc");
const TYPE_ROOT = join(REPO_ROOT, "Body", "S", "S4", "node_modules", "@types");
const BUILD_DIR = join(REPO_ROOT, "Body", "S", "S4", ".typecheck");

const NODE_BUILTINS = new Set([
	"assert", "assert/strict", "buffer", "child_process", "console", "crypto", "dns", "events",
	"fs", "fs/promises", "http", "http2", "https", "module", "net", "os", "path", "path/posix",
	"perf_hooks", "process", "querystring", "readline", "stream", "stream/promises",
	"string_decoder", "test", "timers", "timers/promises", "tls", "tty", "url", "util", "v8",
	"vm", "worker_threads", "zlib",
]);

const isBuiltin = (spec) => spec.startsWith("node:") || NODE_BUILTINS.has(spec);
const isRelative = (spec) => spec.startsWith(".") || spec.startsWith("/");

const NODE_MODULES = join(REPO_ROOT, "Body", "S", "S4", "node_modules");

/** The package a bare specifier belongs to (`typebox/value` -> `typebox`). */
function packageOf(spec) {
	const parts = spec.split("/");
	return spec.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0];
}

/**
 * Is this package installed for the gate?
 *
 * Resolvability — not a hand-kept allow-list — is what decides coverage, so
 * `pnpm add -D <pkg>` is the whole procedure for bringing more files in.
 */
const resolvableCache = new Map();
function isResolvable(spec) {
	const pkg = packageOf(spec);
	if (!resolvableCache.has(pkg)) {
		resolvableCache.set(pkg, existsSync(join(NODE_MODULES, ...pkg.split("/"))));
	}
	return resolvableCache.get(pkg);
}

/** Collect `.ts` files, never descending into a symlinked directory. */
function collect(dir, out = []) {
	for (const name of readdirSync(dir)) {
		if (name === "node_modules" || name === "dist" || name.startsWith(".")) continue;
		const path = join(dir, name);
		const stat = lstatSync(path);
		// Carrier aliases (ta-onta/anima -> ta-onta/S4-4p-anima) are symlinks.
		// Following them would type-check the same file twice under two names.
		if (stat.isSymbolicLink()) continue;
		if (stat.isDirectory()) collect(path, out);
		else if (extname(path) === ".ts" || extname(path) === ".mts") out.push(path);
	}
	return out;
}

const IMPORT_RE =
	/(?:^|\n)\s*(?:import|export)\s[^;]*?from\s+["']([^"']+)["']|import\s*\(\s*["']([^"']+)["']\s*\)/g;

const importCache = new Map();
function importsOf(file) {
	if (importCache.has(file)) return importCache.get(file);
	let specs = [];
	try {
		const source = readFileSync(file, "utf8");
		specs = [...source.matchAll(IMPORT_RE)].map((m) => m[1] || m[2]).filter(Boolean);
	} catch {
		/* unreadable file contributes nothing */
	}
	importCache.set(file, specs);
	return specs;
}

function resolveRelative(from, spec) {
	const base = resolve(dirname(from), spec);
	for (const candidate of [base, `${base}.ts`, `${base}.mts`, join(base, "index.ts")]) {
		try {
			if (lstatSync(candidate).isFile()) return candidate;
		} catch {
			/* not this candidate */
		}
	}
	return null;
}

/**
 * Packages a file needs that are NOT resolvable, transitively through relative
 * imports. Empty means the file can be type-checked.
 */
const closureCache = new Map();
function unresolvableClosure(file, seen = new Set()) {
	if (closureCache.has(file)) return closureCache.get(file);
	if (seen.has(file)) return new Set();
	seen.add(file);

	const missing = new Set();
	for (const spec of importsOf(file)) {
		if (isBuiltin(spec)) continue;
		if (!isRelative(spec)) {
			if (!isResolvable(spec)) missing.add(packageOf(spec));
			continue;
		}
		const target = resolveRelative(file, spec);
		if (target) for (const pkg of unresolvableClosure(target, seen)) missing.add(pkg);
	}

	if (seen.size === 1) closureCache.set(file, missing);
	return missing;
}

// ── Partition ─────────────────────────────────────────────────────────────

const files = collect(SCAN_ROOT).sort();
const checked = [];
const excluded = [];
for (const file of files) {
	const missing = unresolvableClosure(file);
	if (missing.size === 0) checked.push(file);
	else excluded.push({ file, external: [...missing].sort() });
}

const rel = (p) => relative(REPO_ROOT, p);

console.log(`[typecheck-ta-onta] ${files.length} .ts under Body/S/S4 (symlinked carrier aliases skipped)`);
console.log(`[typecheck-ta-onta] type-checking ${checked.length} file(s) with resolvable imports`);

// No silent caps: say exactly what is not covered, and why.
const byPackage = new Map();
for (const { external } of excluded) {
	for (const pkg of external) byPackage.set(pkg, (byPackage.get(pkg) ?? 0) + 1);
}
if (excluded.length === 0) {
	console.log("[typecheck-ta-onta] NOT covered: none — every file's imports resolve");
} else {
	console.log(`[typecheck-ta-onta] NOT covered: ${excluded.length} file(s), excluded by unresolvable package:`);
}
for (const [pkg, count] of [...byPackage].sort((a, b) => b[1] - a[1])) {
	console.log(`[typecheck-ta-onta]   ${String(count).padStart(3)}  ${pkg}`);
}

if (process.argv.includes("--list")) {
	console.log("\n--- checked ---");
	for (const file of checked) console.log(rel(file));
	console.log("\n--- excluded ---");
	for (const { file, external } of excluded) console.log(`${rel(file)}  [${external.join(", ")}]`);
	process.exit(0);
}

if (!existsSync(TSC)) {
	console.error(
		`[typecheck-ta-onta] FAIL — no tsc at ${rel(TSC)}. Run \`pnpm install\` in Body/S/S4.`,
	);
	process.exit(1);
}

// ── Check ─────────────────────────────────────────────────────────────────

mkdirSync(BUILD_DIR, { recursive: true });
const tsconfigPath = join(BUILD_DIR, "tsconfig.generated.json");
writeFileSync(
	tsconfigPath,
	`${JSON.stringify(
		{
			$comment: "GENERATED by .codex/scripts/typecheck-ta-onta.mjs — do not edit.",
			compilerOptions: {
				target: "es2022",
				module: "esnext",
				moduleResolution: "bundler",
				allowImportingTsExtensions: true,
				noEmit: true,
				strict: true,
				skipLibCheck: true,
				lib: ["es2023"],
				types: ["node"],
				typeRoots: [TYPE_ROOT],
				esModuleInterop: true,
				forceConsistentCasingInFileNames: true,
			},
			files: checked,
		},
		null,
		2,
	)}\n`,
	"utf8",
);

const result = spawnSync(TSC, ["-p", tsconfigPath], {
	cwd: REPO_ROOT,
	encoding: "utf8",
	stdio: ["ignore", "pipe", "pipe"],
});

const output = `${result.stdout ?? ""}${result.stderr ?? ""}`.trim();
const errorLines = output.split("\n").filter((line) => /error TS\d+/.test(line));

if (errorLines.length === 0 && result.status === 0) {
	console.log(`[typecheck-ta-onta] GREEN — ${checked.length}/${files.length} file(s), 0 type errors`);
	process.exit(0);
}

console.error(output);
console.error(`[typecheck-ta-onta] FAIL — ${errorLines.length} type error(s)`);
process.exit(1);
