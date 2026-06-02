/**
 * epii-entitlement-activation.test.ts — REAL activation-compute coverage.
 *
 * Uses the REAL epii agent-contract.json and the REAL epi-logos skill directory
 * (no mocks). Asserts:
 *   1. active-persona detection (env-driven) is correct, with the documented
 *      epii-is-default fallback when env is silent.
 *   2. the computed effective skill set == the full epi-logos package (empty
 *      allow => inherit the whole package).
 *   3. a non-package tool/skill is REFUSED by enforceEntitlement / exposeEntitled.
 *   4. the prompt-injected <available_skills> manifest filter keeps entitled
 *      skills, drops non-entitled ones, and no-ops when nothing is removed.
 */

import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { fileURLToPath } from "node:url";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";

import {
	isEpiiActive,
	resolveRepoRoot,
	readSkillUniverseRoots,
	computeEpiiEffectiveEntitlement,
	filterInjectedSkillsManifest,
	activateEpiiEntitlement,
} from "../extensions/epii-entitlement-activation.ts";
import installToolGate from "../extensions/skill-entitlement.ts";
import {
	enforceEntitlement,
	exposeEntitled,
} from "../extensions/skill-entitlement.ts";

// Repo root resolved from this test file's location (walk up to the contract).
const repoRoot = resolveRepoRoot(
	dirname(fileURLToPath(import.meta.url)),
);
assert.ok(repoRoot, "expected to resolve repo root from the test file location");

const contractPath = join(repoRoot!, "Body/S/S5/epii-agent/agent-contract.json");
const contract = JSON.parse(readFileSync(contractPath, "utf-8"));

const skillRoots = readSkillUniverseRoots(contract);
const epiLogosSkillsDir = join(repoRoot!, "Body/S/S5/plugins/epi-logos/skills");

/** The ground-truth full package = every <name>/SKILL.md under the skills dir. */
function fullPackageSkillNames(): string[] {
	if (!existsSync(epiLogosSkillsDir)) return [];
	return readdirSync(epiLogosSkillsDir).filter((n) =>
		existsSync(join(epiLogosSkillsDir, n, "SKILL.md")),
	);
}

describe("active-persona detection", () => {
	it("detects epii from EPI_AGENT_ID", () => {
		assert.equal(isEpiiActive({ EPI_AGENT_ID: "epii" } as any), true);
	});
	it("detects epii from EPI_AGENT_NAME / EPI_PI_AGENT_ID", () => {
		assert.equal(isEpiiActive({ EPI_AGENT_NAME: "epii" } as any), true);
		assert.equal(isEpiiActive({ EPI_PI_AGENT_ID: "epii" } as any), true);
	});
	it("is case-insensitive", () => {
		assert.equal(isEpiiActive({ EPI_AGENT_ID: "EPII" } as any), true);
	});
	it("returns false for an explicitly non-epii persona", () => {
		assert.equal(isEpiiActive({ EPI_AGENT_ID: "anima" } as any), false);
		assert.equal(isEpiiActive({ EPI_AGENT_NAME: "aletheia" } as any), false);
	});
	it("falls back to epii-is-default ONLY when env is silent on identity", () => {
		assert.equal(isEpiiActive({} as any), true);
	});
});

describe("contract shape — real epii agent-contract.json", () => {
	it("declares epi-logos skill_universe_roots", () => {
		assert.deepEqual(skillRoots, ["Body/S/S5/plugins/epi-logos/skills"]);
	});
	it("has empty allow lists (inherit the whole package)", () => {
		assert.deepEqual(contract.entitlement.skills.allow, []);
		assert.deepEqual(contract.entitlement.tools.allow, []);
	});
});

describe("computeEpiiEffectiveEntitlement — full epi-logos package, no mocks", () => {
	const toolUniverse = ["dispatch_agent", "khora_write", "web_search"];
	const eff = computeEpiiEffectiveEntitlement({
		contract,
		skillUniverseRoots: skillRoots,
		repoRoot,
		toolUniverse,
	});

	it("the effective skill set equals the full epi-logos package", () => {
		const expected = fullPackageSkillNames();
		assert.ok(expected.length > 0, "package must contain at least one skill");
		// Same membership (order follows enumeration of U; compare as sets).
		assert.deepEqual(
			[...eff.skills.effective].sort(),
			[...expected].sort(),
		);
		// Spot-check known epi-logos skills are present.
		assert.ok(eff.skills.effective.includes("apply-cmea"));
		assert.ok(eff.skills.effective.includes("using-epi-logos"));
	});

	it("empty tools.allow inherits the whole exposed tool universe", () => {
		assert.deepEqual(eff.tools.effective, toolUniverse);
	});

	it("a non-package SKILL is refused by enforceEntitlement / exposeEntitled", () => {
		assert.equal(
			enforceEntitlement(eff, "skill", "definitely-not-a-package-skill").allowed,
			false,
		);
		assert.deepEqual(
			exposeEntitled(eff, "skill", ["apply-cmea", "definitely-not-a-package-skill"]),
			["apply-cmea"],
		);
	});

	it("a non-exposed TOOL is refused by the hard gate", () => {
		assert.equal(enforceEntitlement(eff, "tool", "rm_rf_tool").allowed, false);
		assert.equal(enforceEntitlement(eff, "tool", "dispatch_agent").allowed, true);
	});

	it("an entitled package skill is allowed", () => {
		assert.equal(enforceEntitlement(eff, "skill", "apply-cmea").allowed, true);
	});
});

describe("computeEpiiEffectiveEntitlement — defensive degradation", () => {
	it("never throws when repo root is unknown (relative roots fall back to cwd resolution)", () => {
		// With repoRoot undefined the relative roots are left as-is; the shared
		// enumerateSkillUniverse resolves existsSync relative to process.cwd().
		// The point of this case is that activation degrades gracefully and never
		// throws — it must not crash the load-bearing epii launch.
		assert.doesNotThrow(() => {
			const eff = computeEpiiEffectiveEntitlement({
				contract,
				skillUniverseRoots: skillRoots,
				repoRoot: undefined,
				toolUniverse: [],
			});
			assert.ok(Array.isArray(eff.skills.effective));
			assert.deepEqual(eff.tools.effective, []);
		});
	});

	it("a truly unresolvable absolute root => empty skill universe (no throw, no deny-all confusion)", () => {
		const eff = computeEpiiEffectiveEntitlement({
			contract,
			skillUniverseRoots: ["/no/such/dir/anywhere/skills"],
			repoRoot: undefined,
			toolUniverse: [],
		});
		assert.deepEqual(eff.skills.effective, []);
	});

	it("absent entitlement block => empty layers (inherit), still no throw", () => {
		const eff = computeEpiiEffectiveEntitlement({
			contract: { agent_id: "epii" },
			skillUniverseRoots: [],
			repoRoot,
			toolUniverse: ["x"],
		});
		// no skill roots => empty skills universe; tools inherit the exposed one
		assert.deepEqual(eff.skills.effective, []);
		assert.deepEqual(eff.tools.effective, ["x"]);
	});
});

describe("filterInjectedSkillsManifest — prompt-injection gating", () => {
	const eff = computeEpiiEffectiveEntitlement({
		contract,
		skillUniverseRoots: skillRoots,
		repoRoot,
		toolUniverse: [],
	});

	const manifest = [
		"intro text",
		"<available_skills>",
		"  <skill>",
		"    <name>apply-cmea</name>",
		"    <description>d</description>",
		"    <location>/x/apply-cmea/SKILL.md</location>",
		"  </skill>",
		"  <skill>",
		"    <name>not-an-epi-logos-skill</name>",
		"    <description>d</description>",
		"    <location>/x/not/SKILL.md</location>",
		"  </skill>",
		"</available_skills>",
		"trailer text",
	].join("\n");

	it("drops a non-entitled skill block, keeps the entitled one", () => {
		const { prompt, removed } = filterInjectedSkillsManifest(manifest, eff);
		assert.deepEqual(removed, ["not-an-epi-logos-skill"]);
		assert.ok(prompt.includes("apply-cmea"));
		assert.ok(!prompt.includes("not-an-epi-logos-skill"));
		// surrounding text preserved
		assert.ok(prompt.includes("intro text"));
		assert.ok(prompt.includes("trailer text"));
	});

	it("no-ops (returns prompt unchanged) when there is no manifest", () => {
		const plain = "just a system prompt, no skills block";
		const { prompt, removed } = filterInjectedSkillsManifest(plain, eff);
		assert.equal(prompt, plain);
		assert.deepEqual(removed, []);
	});

	it("no-ops when every injected skill is entitled", () => {
		const allEntitled = [
			"<available_skills>",
			"  <skill>",
			"    <name>apply-cmea</name>",
			"    <description>d</description>",
			"    <location>/x/apply-cmea/SKILL.md</location>",
			"  </skill>",
			"</available_skills>",
		].join("\n");
		const { prompt, removed } = filterInjectedSkillsManifest(allEntitled, eff);
		assert.equal(prompt, allEntitled);
		assert.deepEqual(removed, []);
	});
});

/**
 * Build a minimal pi-like harness backed by the REAL staged tool-gate. The
 * decision logic is NOT mocked — installToolGate wires the genuine
 * enforceEntitlement-based gate; we only capture the registered listeners.
 */
function makePiHarness(env: Record<string, string>, tools: string[]) {
	const prev = { ...process.env };
	for (const k of ["EPI_AGENT_ID", "EPI_PI_AGENT_ID", "EPI_AGENT_NAME"]) delete (process.env as any)[k];
	Object.assign(process.env, env);
	const listeners: Record<string, ((e: any) => any)[]> = {};
	const pi: any = {
		on(event: string, handler: (e: any) => any) {
			(listeners[event] ||= []).push(handler);
		},
		getActiveTools() {
			return tools;
		},
	};
	installToolGate(pi); // real gate + __setActiveEntitlement
	const restore = () => {
		for (const k of Object.keys(process.env)) if (!(k in prev)) delete (process.env as any)[k];
		Object.assign(process.env, prev);
	};
	const fireTool = (toolName: string) => {
		let res: any;
		for (const h of listeners["tool_call"] ?? []) res = h({ toolName }) ?? res;
		return res;
	};
	return { pi, listeners, fireTool, restore };
}

describe("activateEpiiEntitlement — LIVE handshake (real gate, no mocks)", () => {
	it("when epii: sets active entitlement and the tool_call gate refuses non-entitled tools", async () => {
		const h = makePiHarness({ EPI_AGENT_ID: "epii" }, ["dispatch_agent", "web_search"]);
		try {
			const eff = await activateEpiiEntitlement(h.pi, repoRoot);
			assert.ok(eff, "activation must return an effective entitlement for epii");
			// gate is now live: entitled tool passes, non-entitled tool blocked
			assert.equal(h.fireTool("dispatch_agent"), undefined);
			const blocked = h.fireTool("rm_rf_tool");
			assert.ok(blocked && blocked.block === true, "non-entitled tool must be blocked");
			assert.match(blocked.reason, /entitlement hard-gate/);
			// __getActiveEntitlement reflects the handshake
			assert.ok(h.pi.__getActiveEntitlement());
			// full epi-logos package is entitled
			assert.ok(eff!.skills.effective.includes("apply-cmea"));
		} finally {
			h.restore();
		}
	});

	it("when NOT epii: no-ops — gate stays inert, no tool is blocked", async () => {
		const h = makePiHarness({ EPI_AGENT_ID: "anima" }, ["dispatch_agent"]);
		try {
			const eff = await activateEpiiEntitlement(h.pi, repoRoot);
			assert.equal(eff, null, "must no-op for a non-epii persona");
			// gate never armed => even an arbitrary tool passes (never deny-all)
			assert.equal(h.fireTool("anything_at_all"), undefined);
			assert.equal(h.pi.__getActiveEntitlement(), null);
		} finally {
			h.restore();
		}
	});

	it("bogus ctx.cwd still activates via repo-root fallback (resilient, not deny-all)", async () => {
		// resolveRepoRoot tries ctx.cwd, then this module's dir, then process.cwd().
		// A bogus ctx.cwd must NOT defeat activation: it falls back and still finds
		// the real contract. The gate arms normally.
		const h = makePiHarness({ EPI_AGENT_ID: "epii" }, ["dispatch_agent"]);
		try {
			const eff = await activateEpiiEntitlement(h.pi, "/no/such/repo/root/at/all");
			assert.ok(eff, "fallback repo-root discovery must still activate");
			assert.equal(h.fireTool("dispatch_agent"), undefined);
			const blocked = h.fireTool("rm_rf_tool");
			assert.ok(blocked && blocked.block === true);
		} finally {
			h.restore();
		}
	});

	it("missing __setActiveEntitlement (staged gate unloaded) => no-op, never throws", async () => {
		const prev = { ...process.env };
		for (const k of ["EPI_AGENT_ID", "EPI_PI_AGENT_ID", "EPI_AGENT_NAME"]) delete (process.env as any)[k];
		process.env.EPI_AGENT_ID = "epii";
		try {
			const barePi: any = { on() {}, getActiveTools: () => [] }; // no __setActiveEntitlement
			const eff = await activateEpiiEntitlement(barePi, repoRoot);
			assert.equal(eff, null, "must no-op when the staged gate API is absent");
		} finally {
			for (const k of Object.keys(process.env)) if (!(k in prev)) delete (process.env as any)[k];
			Object.assign(process.env, prev);
		}
	});
});
