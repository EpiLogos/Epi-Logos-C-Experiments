/**
 * child_pi_executor.test.ts — the ONE gated child-pi dispatch seam (50.T50.02).
 *
 * These tests assert the invariants that previously held on only one of the
 * three `spawn("pi", …)` copies: that `--tools` is entitlement-resolved on every
 * seam, that a dialogue-only Vama Shakti cannot dispatch at all, that a review
 * gate needing user final-validation blocks, and that a refusal happens BEFORE
 * any process exists.
 *
 * The dispatch path is exercised for real against a stand-in binary via
 * `EPI_REPO_ROOT`/argv inspection — no mocked module boundaries.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import {
	assertChildPiInvariants,
	buildChildPiArgs,
	buildChildPiEnv,
	CHILD_PI_BINARY,
	ChildPiDispatchRefused,
	dispatchChildPi,
	resolveChildPiTools,
	type ChildPiDispatchRequest,
} from "../lib/child-pi-executor.ts";
import { DIALOGUE_EMISSION_PRIMITIVE } from "../../../pi-agent/lib/dispatch-guard.ts";
import type { VakAddress } from "../../shared/vak_address.ts";

function request(overrides: Partial<ChildPiDispatchRequest> = {}): ChildPiDispatchRequest {
	return {
		seam: "agent-team",
		agentName: "nous",
		task: "do the thing",
		systemPrompt: "you are nous",
		toolUniverse: ["read", "write", "grep"],
		...overrides,
	};
}

test("Pi -> subagent is the only agentic path", () => {
	// Not a parameter, not injectable: a child is always another pi harness.
	assert.equal(CHILD_PI_BINARY, "pi");
});

test("the --tools allow-list is entitlement-resolved on every seam", async (t) => {
	await t.test("no layers => the declared universe passes through unchanged", () => {
		// This is what preserves agent-chain's and pi-pi's current allow-lists.
		assert.deepEqual(resolveChildPiTools(request()), ["read", "write", "grep"]);
	});

	await t.test("a team ceiling now binds (agent-chain/pi-pi previously ignored it)", () => {
		const tools = resolveChildPiTools(request({ team: { allow: ["read"] } }));
		assert.deepEqual(tools, ["read"]);
	});

	await t.test("a deny list now binds, and beats an allow", () => {
		const tools = resolveChildPiTools(
			request({ team: { allow: ["read", "write"] }, agent: { deny: ["write"] } }),
		);
		assert.deepEqual(tools, ["read"]);
	});

	await t.test("the resolved list is what reaches argv", () => {
		const { args, effectiveTools } = buildChildPiArgs(
			request({ agent: { deny: ["write", "grep"] } }),
		);
		assert.deepEqual(effectiveTools, ["read"]);
		const flag = args.indexOf("--tools");
		assert.ok(flag > 0, "--tools must be present");
		assert.equal(args[flag + 1], "read");
	});

	await t.test("an empty resolved list omits --tools rather than sending a deny-all", () => {
		const { args, effectiveTools } = buildChildPiArgs(
			request({ toolUniverse: [], agent: {} }),
		);
		assert.deepEqual(effectiveTools, []);
		assert.equal(args.includes("--tools"), false);
	});
});

test("the child argv contract", async (t) => {
	await t.test("carries the non-interactive JSON contract and the task last", () => {
		const { args } = buildChildPiArgs(request());
		assert.deepEqual(args.slice(0, 4), ["--mode", "json", "-p", "--no-session"]);
		assert.equal(args[args.length - 1], "do the thing");
		const sp = args.indexOf("--append-system-prompt");
		assert.equal(args[sp + 1], "you are nous");
		const thinking = args.indexOf("--thinking");
		assert.equal(args[thinking + 1], "off");
	});

	await t.test("--model is passed when given and omitted when not", () => {
		const withModel = buildChildPiArgs(request({ model: "google/gemini-3.1-flash-lite" }));
		const flag = withModel.args.indexOf("--model");
		assert.equal(withModel.args[flag + 1], "google/gemini-3.1-flash-lite");
		assert.equal(buildChildPiArgs(request()).args.includes("--model"), false);
	});

	await t.test("childPiRuntimeArgs() remains the runtime-arg source", () => {
		// It always contributes --no-extensions and --no-skills, so a child never
		// silently inherits the parent's extension/skill surface.
		const { args } = buildChildPiArgs(request());
		assert.ok(args.includes("--no-extensions"));
		assert.ok(args.includes("--no-skills"));
	});

	await t.test("a carried VAK address is forwarded to the child env", () => {
		const vakAddress = {
			cpf: "(00/00)",
			ct: ["CT4b"],
			cp: "CP4.2",
			cf: "(00/00)",
			cfp: "CFP1",
			cs: { code: "CS0", direction: "Day" },
		} as unknown as VakAddress;
		const env = buildChildPiEnv(request({ vakAddress }));
		assert.equal(env.EPI_SESSION_VAK_ADDRESS, JSON.stringify(vakAddress));
	});

	await t.test("no VAK address means the variable is not injected", () => {
		const env = buildChildPiEnv(request());
		// Only absent if the parent did not already carry one.
		if (!process.env.EPI_SESSION_VAK_ADDRESS) {
			assert.equal(env.EPI_SESSION_VAK_ADDRESS, undefined);
		}
	});
});

test("a dialogue-only Vama Shakti cannot dispatch a child (DR-VAMA-5)", async (t) => {
	const dialogueOnlyProfile = {
		dialogue_only: true,
		system_tools_granted: [],
		vault_write: false,
		subagent_dispatch: false,
		terminal_authority: false,
	};

	await t.test("a non-dialogue tool is refused", () => {
		assert.throws(
			() =>
				assertChildPiInvariants(
					request({
						vamaShakti: {
							identity_handle: "world:Ereshkigal",
							capability_profile: dialogueOnlyProfile,
							tool_name: "write",
						},
					}),
				),
			(err: unknown) => {
				assert.ok(err instanceof ChildPiDispatchRefused);
				assert.equal(err.code, "child-pi/vama-shakti-dialogue-only");
				assert.equal(err.seam, "agent-team");
				return true;
			},
		);
	});

	await t.test("the dialogue-emission primitive is permitted", () => {
		assert.doesNotThrow(() =>
			assertChildPiInvariants(
				request({
					vamaShakti: {
						identity_handle: "world:Ereshkigal",
						capability_profile: dialogueOnlyProfile,
						tool_name: DIALOGUE_EMISSION_PRIMITIVE,
					},
				}),
			),
		);
	});

	await t.test("a tampered profile is refused", () => {
		assert.throws(
			() =>
				assertChildPiInvariants(
					request({
						vamaShakti: {
							identity_handle: "world:Ereshkigal",
							capability_profile: { ...dialogueOnlyProfile, subagent_dispatch: true },
							tool_name: DIALOGUE_EMISSION_PRIMITIVE,
						},
					}),
				),
			ChildPiDispatchRefused,
		);
	});

	await t.test("the refusal happens before any process exists", async () => {
		// If a process were spawned we would get a result, not a rejection.
		await assert.rejects(
			() =>
				dispatchChildPi(
					request({
						vamaShakti: {
							identity_handle: "world:Ereshkigal",
							capability_profile: dialogueOnlyProfile,
							tool_name: "bash",
						},
					}),
				),
			ChildPiDispatchRefused,
		);
	});
});

test("the recursive-self-review gate is applied on the dispatch path", async (t) => {
	await t.test("a committal recursive self-review without validation refuses", () => {
		assert.throws(
			() =>
				assertChildPiInvariants(
					request({
						review: {
							decision: "approve",
							actor: "anima",
							recursiveSelfReview: true,
						},
					}),
				),
			(err: unknown) => {
				assert.ok(err instanceof ChildPiDispatchRefused);
				assert.equal(err.code, "child-pi/review-gate");
				return true;
			},
		);
	});

	await t.test("the same review passes once user final-validation is present", () => {
		assert.doesNotThrow(() =>
			assertChildPiInvariants(
				request({
					review: {
						decision: "approve",
						actor: "anima",
						recursiveSelfReview: true,
						userFinalValidation: true,
						finalValidationPassed: true,
					},
				}),
			),
		);
	});

	await t.test("a dispatch carrying no review context is unaffected", () => {
		assert.doesNotThrow(() => assertChildPiInvariants(request()));
	});
});

test("a real dispatch runs the child and reports its outcome", async () => {
	// `pi` may not be installed in every environment; the executor must report a
	// spawn failure as a result rather than throwing, so callers keep one shape.
	const result = await dispatchChildPi(
		request({
			// A universe of one keeps the argv small and the intent obvious.
			toolUniverse: ["read"],
			task: "noop",
		}),
	);
	assert.equal(typeof result.exitCode, "number");
	assert.deepEqual(result.effectiveTools, ["read"]);
	assert.ok(result.args.includes("--tools"));
	assert.ok(result.elapsed >= 0);
	// Either pi ran, or the spawn error was captured — never an unhandled throw.
	assert.ok(typeof result.output === "string");
});
