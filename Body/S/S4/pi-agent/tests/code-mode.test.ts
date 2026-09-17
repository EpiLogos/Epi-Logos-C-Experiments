/**
 * code-mode.test.ts — behavioural tests for the single-script tool substrate (50.T50.01).
 *
 * These tests execute REAL programs in REAL node child processes against REAL
 * files on disk. Nothing is mocked: the assertions are about observable effects
 * (a file that actually changed, a call that actually reached the tool, a
 * refusal that actually stopped one) and about the recorded trace.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, readFileSync, rmSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
	accountTokens,
	BRIDGE_IMPORT_LINE,
	callableToolNames,
	codeModeGuidance,
	CodeModeToolRefused,
	estimateTokens,
	normalizeProgram,
	resolveToolFunction,
	runToolScript,
	BRIDGE_MODULE_NAME,
	type CodeModeToolContext,
	type ToolImplementation,
} from "../lib/code-mode.ts";
import {
	buildCodeModeImplementations,
	codeModeToolUniverse,
	globToRegExp,
	TOOL_SIGNATURES,
} from "../lib/code-mode-tools.ts";

function sandbox(): string {
	return mkdtempSync(join(tmpdir(), "code-mode-test-"));
}

const UNIVERSE = codeModeToolUniverse();

function ctxWith(overrides: Partial<CodeModeToolContext> = {}): CodeModeToolContext {
	return { universe: UNIVERSE, ...overrides };
}

test("the dispatch choke point", async (t) => {
	const impls = new Map<string, ToolImplementation>([
		["read", () => "x"],
		["write", () => 4],
	]);

	await t.test("an entitled, active, implemented tool resolves", () => {
		const fn = resolveToolFunction("read", impls, ctxWith({ activeTools: ["read"] }));
		assert.equal(typeof fn, "function");
	});

	await t.test("a tool outside the spawn --tools allow-list is refused as not-active", () => {
		assert.throws(
			() => resolveToolFunction("write", impls, ctxWith({ activeTools: ["read"] })),
			(err: unknown) => {
				assert.ok(err instanceof CodeModeToolRefused);
				assert.equal(err.code, "code-mode/not-active");
				assert.equal(err.tool, "write");
				return true;
			},
		);
	});

	await t.test("the allow-list is checked BEFORE entitlement", () => {
		// `write` is denied by the agent layer AND absent from activeTools.
		// The spawn ceiling must win, so the code is not-active.
		const err = (() => {
			try {
				resolveToolFunction(
					"write",
					impls,
					ctxWith({ activeTools: ["read"], agent: { deny: ["write"] } }),
				);
				return null;
			} catch (e) {
				return e as CodeModeToolRefused;
			}
		})();
		assert.ok(err instanceof CodeModeToolRefused);
		assert.equal(err.code, "code-mode/not-active");
	});

	await t.test("a denied tool is refused as not-entitled even with no spawn ceiling", () => {
		assert.throws(
			() => resolveToolFunction("write", impls, ctxWith({ agent: { deny: ["write"] } })),
			(err: unknown) => {
				assert.ok(err instanceof CodeModeToolRefused);
				assert.equal(err.code, "code-mode/not-entitled");
				return true;
			},
		);
	});

	await t.test("a tool outside the universe is refused", () => {
		assert.throws(
			() => resolveToolFunction("rm_rf", impls, ctxWith()),
			(err: unknown) => {
				assert.ok(err instanceof CodeModeToolRefused);
				assert.equal(err.code, "code-mode/not-entitled");
				return true;
			},
		);
	});

	await t.test("entitled but unimplemented is its own distinct refusal", () => {
		assert.throws(
			() => resolveToolFunction("grep", impls, ctxWith()),
			(err: unknown) => {
				assert.ok(err instanceof CodeModeToolRefused);
				assert.equal(err.code, "code-mode/no-implementation");
				return true;
			},
		);
	});

	await t.test("callableToolNames reports exactly the reachable surface", () => {
		const callable = callableToolNames(impls, ctxWith({ agent: { deny: ["write"] } }));
		assert.deepEqual(callable, ["read"]);
	});
});

test("a real program composes several tools in ONE execution", async () => {
	const root = sandbox();
	try {
		writeFileSync(join(root, "input.txt"), "alpha\nbeta\ngamma\n", "utf8");
		const impls = buildCodeModeImplementations(root);

		const program = `
import { tools } from "./${BRIDGE_MODULE_NAME}";

const text = await tools.read({ path: "input.txt" });
const lines = text.split("\\n").filter((l) => l.length > 0);
const upper = lines.map((l) => l.toUpperCase()).join("\\n");
await tools.write({ path: "output.txt", content: upper + "\\n" });
const hits = await tools.grep({ pattern: "BETA" });
console.log("lines=" + lines.length + " hits=" + hits.length);
`;

		const run = await runToolScript({
			program,
			implementations: impls,
			ctx: ctxWith({ activeTools: ["read", "write", "grep"] }),
			cwd: root,
			timeoutMs: 60_000,
		});

		assert.equal(run.timedOut, false, `run timed out; stderr: ${run.stderr}`);
		assert.equal(run.exitCode, 0, `program failed; stderr: ${run.stderr}`);
		assert.equal(run.ok, true);

		// The observable effect: the file really exists with really-transformed content.
		assert.equal(readFileSync(join(root, "output.txt"), "utf8"), "ALPHA\nBETA\nGAMMA\n");

		// Three tool calls, one program run.
		assert.equal(run.calls.length, 3);
		assert.deepEqual(
			run.calls.map((c) => c.tool),
			["read", "write", "grep"],
		);
		assert.ok(run.calls.every((c) => c.ok));
		assert.match(run.stdout, /lines=3 hits=1/);
	} finally {
		rmSync(root, { recursive: true, force: true });
	}
});

test("a refused tool call stops inside the program and is recorded", async () => {
	const root = sandbox();
	try {
		writeFileSync(join(root, "input.txt"), "data\n", "utf8");
		const impls = buildCodeModeImplementations(root);

		const program = `
import { tools } from "./${BRIDGE_MODULE_NAME}";

await tools.read({ path: "input.txt" });
try {
  await tools.write({ path: "should-not-exist.txt", content: "nope" });
  console.log("WRITE_SUCCEEDED");
} catch (err) {
  console.log("REFUSED:" + err.refusalCode);
}
`;

		const run = await runToolScript({
			program,
			implementations: impls,
			// `write` is entitled in U but switched off at spawn.
			ctx: ctxWith({ activeTools: ["read", "grep"] }),
			cwd: root,
			timeoutMs: 60_000,
		});

		assert.equal(run.exitCode, 0, `stderr: ${run.stderr}`);
		assert.match(run.stdout, /REFUSED:code-mode\/not-active/);
		assert.doesNotMatch(run.stdout, /WRITE_SUCCEEDED/);

		// The refusal was real: no file was created.
		assert.throws(() => readFileSync(join(root, "should-not-exist.txt"), "utf8"));

		assert.equal(run.calls.length, 2);
		assert.equal(run.calls[1].tool, "write");
		assert.equal(run.calls[1].ok, false);
		assert.equal(run.calls[1].refusalCode, "code-mode/not-active");
	} finally {
		rmSync(root, { recursive: true, force: true });
	}
});

test("a tool error surfaces to the program without killing the run", async () => {
	const root = sandbox();
	try {
		const impls = buildCodeModeImplementations(root);
		const program = `
import { tools } from "./${BRIDGE_MODULE_NAME}";
try {
  await tools.read({ path: "missing.txt" });
  console.log("UNEXPECTED_OK");
} catch (err) {
  console.log("ERROR_SEEN");
}
console.log("STILL_RUNNING");
`;
		const run = await runToolScript({
			program,
			implementations: impls,
			ctx: ctxWith({ activeTools: ["read"] }),
			cwd: root,
			timeoutMs: 60_000,
		});
		assert.equal(run.exitCode, 0, `stderr: ${run.stderr}`);
		assert.match(run.stdout, /ERROR_SEEN/);
		assert.match(run.stdout, /STILL_RUNNING/);
		assert.equal(run.calls.length, 1);
		assert.equal(run.calls[0].ok, false);
		assert.equal(run.calls[0].refusalCode, undefined); // an error, not a refusal
	} finally {
		rmSync(root, { recursive: true, force: true });
	}
});

test("a path escaping the run root is refused by the file primitives", async () => {
	const root = sandbox();
	try {
		const impls = buildCodeModeImplementations(root);
		const read = impls.get("read") as ToolImplementation;
		await assert.rejects(
			async () => await read({ path: "../../../etc/passwd" }),
			/escapes the run root/,
		);
	} finally {
		rmSync(root, { recursive: true, force: true });
	}
});

test("token accounting measures both protocols over the same trace", async (t) => {
	await t.test("estimateTokens is the stated chars/4", () => {
		assert.equal(estimateTokens(0), 0);
		assert.equal(estimateTokens(4), 1);
		assert.equal(estimateTokens(5), 2);
	});

	await t.test("the staircase grows super-linearly while the script does not", () => {
		const call = (seq: number) => ({
			seq,
			tool: "read",
			paramChars: 400,
			resultChars: 4_000,
			ok: true,
			elapsedMs: 1,
		});

		const two = accountTokens({
			programChars: 800,
			stdoutChars: 200,
			calls: [call(1), call(2)],
			promptChars: 4_000,
		});
		const eight = accountTokens({
			programChars: 800,
			stdoutChars: 200,
			calls: [1, 2, 3, 4, 5, 6, 7, 8].map(call),
			promptChars: 4_000,
		});

		// The script side is flat in the number of tool calls.
		assert.equal(two.scriptTokens, eight.scriptTokens);

		// The staircase side is not merely 4x for 4x the calls — the re-inlined
		// history makes it grow faster than linearly.
		const linear = two.staircaseTokens * 4;
		assert.ok(
			eight.staircaseTokens > linear,
			`expected super-linear growth, got ${eight.staircaseTokens} <= ${linear}`,
		);

		assert.ok(eight.deltaTokens > 0);
		assert.ok(eight.ratio !== null && eight.ratio < 1);
	});

	await t.test("an empty trace has no staircase to compare against", () => {
		const none = accountTokens({ programChars: 100, stdoutChars: 0, calls: [] });
		assert.equal(none.staircaseTokens, 0);
		assert.equal(none.ratio, null);
	});

	await t.test("a real run carries its own accounting", async () => {
		const root = sandbox();
		try {
			writeFileSync(join(root, "a.txt"), "one\n", "utf8");
			writeFileSync(join(root, "b.txt"), "two\n", "utf8");
			const impls = buildCodeModeImplementations(root);
			const program = `
import { tools } from "./${BRIDGE_MODULE_NAME}";
const a = await tools.read({ path: "a.txt" });
const b = await tools.read({ path: "b.txt" });
console.log((a + b).trim().split("\\n").join("|"));
`;
			const run = await runToolScript({
				program,
				implementations: impls,
				ctx: ctxWith({ activeTools: ["read"] }),
				cwd: root,
				promptChars: 4_000,
				timeoutMs: 60_000,
			});
			assert.equal(run.exitCode, 0, `stderr: ${run.stderr}`);
			assert.equal(run.accounting.callCount, 2);
			assert.equal(run.accounting.estimator, "chars/4");
			assert.ok(run.accounting.programTokens > 0);
			assert.ok(run.accounting.staircaseTokens > 0);
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});
});

test("normalizeProgram supplies the documented import when the model omits it", async (t) => {
	await t.test("a program using tools without importing gets the import line", () => {
		const out = normalizeProgram(`const x = await tools.read({ path: "a" });`);
		assert.ok(out.startsWith(`import { tools } from "./${BRIDGE_MODULE_NAME}";`));
	});

	await t.test("an existing import is left untouched", () => {
		const original = `import { tools } from "./${BRIDGE_MODULE_NAME}";\nawait tools.read({});`;
		assert.equal(normalizeProgram(original), original);
	});

	await t.test("a program that never touches tools is left untouched", () => {
		const original = `console.log("no tools here");`;
		assert.equal(normalizeProgram(original), original);
	});

	await t.test("an omitted import still runs for real", async () => {
		const root = sandbox();
		try {
			writeFileSync(join(root, "x.txt"), "content\n", "utf8");
			const run = await runToolScript({
				program: `const r = await tools.read({ path: "x.txt" });\nconsole.log(r.trim());`,
				implementations: buildCodeModeImplementations(root),
				ctx: ctxWith({ activeTools: ["read"] }),
				cwd: root,
				timeoutMs: 60_000,
			});
			assert.equal(run.exitCode, 0, `stderr: ${run.stderr}`);
			assert.match(run.stdout, /content/);
			assert.equal(run.calls.length, 1);
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});
});

test("the guidance declares return shapes, not just tool names", async (t) => {
	// Regression guard for the defect the first live run exposed: the model wrote
	// `content.trim()` against a `{ path, content }` wrapper and burned three
	// retry programs. A one-shot program cannot discover a return shape, so the
	// guidance must state it.
	await t.test("each callable tool's signature includes its return type", () => {
		const guidance = codeModeGuidance(["read", "write", "glob"], TOOL_SIGNATURES);
		assert.match(guidance, /read\(\{[^)]*\}\) -> string/);
		assert.match(guidance, /write\(\{[^)]*\}\) -> number/);
		assert.match(guidance, /glob\(\{[^)]*\}\) -> string\[\]/);
	});

	await t.test("every tool in the universe has a declared signature", () => {
		for (const name of codeModeToolUniverse()) {
			assert.ok(
				typeof TOOL_SIGNATURES[name] === "string" && TOOL_SIGNATURES[name].includes("->"),
				`tool "${name}" has no declared return shape`,
			);
		}
	});

	await t.test("the documented import line is the one the runtime honours", () => {
		const guidance = codeModeGuidance(["read"], TOOL_SIGNATURES);
		assert.ok(guidance.includes(BRIDGE_IMPORT_LINE));
		// And a program written to that exact line resolves, since normalizeProgram
		// leaves it untouched.
		const program = `${BRIDGE_IMPORT_LINE}\nawait tools.read({ path: "a" });`;
		assert.equal(normalizeProgram(program), program);
	});

	await t.test("an unentitled tool never appears in the guidance", () => {
		const guidance = codeModeGuidance(["read"], TOOL_SIGNATURES);
		assert.doesNotMatch(guidance, /\bwrite\(/);
	});
});

test("the file primitives behave", async (t) => {
	await t.test("globToRegExp handles *, ** and ?", () => {
		assert.ok(globToRegExp("*.ts").test("a.ts"));
		assert.ok(!globToRegExp("*.ts").test("dir/a.ts"));
		assert.ok(globToRegExp("**/*.ts").test("dir/deep/a.ts"));
		assert.ok(globToRegExp("a?.ts").test("ab.ts"));
		assert.ok(!globToRegExp("a?.ts").test("abc.ts"));
	});

	await t.test("edit refuses an ambiguous anchor and applies a unique one", async () => {
		const root = sandbox();
		try {
			const impls = buildCodeModeImplementations(root);
			const edit = impls.get("edit") as ToolImplementation;
			writeFileSync(join(root, "f.txt"), "aa\nbb\naa\n", "utf8");

			await assert.rejects(
				async () => await edit({ path: "f.txt", oldText: "aa", newText: "zz" }),
				/occurs 2 times/,
			);

			await edit({ path: "f.txt", oldText: "bb", newText: "zz" });
			assert.equal(readFileSync(join(root, "f.txt"), "utf8"), "aa\nzz\naa\n");

			await edit({ path: "f.txt", oldText: "aa", newText: "qq", replaceAll: true });
			assert.equal(readFileSync(join(root, "f.txt"), "utf8"), "qq\nzz\nqq\n");
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});

	await t.test("glob prunes node_modules and finds nested matches", async () => {
		const root = sandbox();
		try {
			mkdirSync(join(root, "src", "deep"), { recursive: true });
			mkdirSync(join(root, "node_modules", "pkg"), { recursive: true });
			writeFileSync(join(root, "src", "deep", "a.ts"), "x", "utf8");
			writeFileSync(join(root, "node_modules", "pkg", "b.ts"), "x", "utf8");

			const impls = buildCodeModeImplementations(root);
			const glob = impls.get("glob") as ToolImplementation;
			const matches = (await glob({ pattern: "**/*.ts" })) as string[];
			assert.ok(matches.includes(join("src", "deep", "a.ts")));
			assert.ok(!matches.some((m) => m.includes("node_modules")));
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});
});
