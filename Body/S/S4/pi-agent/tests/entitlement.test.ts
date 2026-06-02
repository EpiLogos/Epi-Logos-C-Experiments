import { describe, it } from "node:test";
import { strict as assert } from "node:assert";

import {
	resolveEntitlement,
	isEntitled,
	filterEntitled,
	parseCommaList,
} from "../lib/entitlement.ts";
import {
	parseAgentEntitlement,
	parseAgentEntitlementFromFile,
	parseTeamEntitlements,
} from "../lib/entitlement-loader.ts";
import {
	computeAgentEntitlement,
	enforceEntitlement,
	exposeEntitled,
	type EntitlementUniverse,
} from "../extensions/skill-entitlement.ts";

// Universe of published skills / available tools (namespace-mixed on purpose).
const U_SKILLS = [
	"vak-evaluate",
	"anima-orchestration",
	"tdd",
	"web-research",
	"epi-logos:apply-cmea",
	"epi-logos:apply-tetralemma",
];

describe("resolveEntitlement — empty allow = inherit (NOT deny-all)", () => {
	it("agent with empty allow inherits the team ceiling", () => {
		const r = resolveEntitlement(U_SKILLS, { allow: [] }, { allow: [] });
		assert.deepEqual(r.effective, U_SKILLS); // full universe, order-preserved
	});

	it("team with empty allow makes ceiling = U", () => {
		const r = resolveEntitlement(U_SKILLS, undefined, undefined);
		assert.deepEqual(r.teamCeiling, U_SKILLS);
		assert.deepEqual(r.effective, U_SKILLS);
	});

	it("absent layers => everything entitled (inherit, not deny)", () => {
		assert.equal(isEntitled("tdd", U_SKILLS, undefined, undefined), true);
		assert.equal(
			isEntitled("epi-logos:apply-cmea", U_SKILLS, undefined, undefined),
			true,
		);
	});
});

describe("resolveEntitlement — agent allow restricts within team ceiling", () => {
	it("agent allow narrows to the intersection with the ceiling", () => {
		const r = resolveEntitlement(
			U_SKILLS,
			{ allow: [] }, // ceiling = U
			{ allow: ["tdd", "web-research"] },
		);
		assert.deepEqual(r.effective, ["tdd", "web-research"]);
	});

	it("agent allow cannot escape the team ceiling (intersection only)", () => {
		const r = resolveEntitlement(
			U_SKILLS,
			{ allow: ["tdd", "web-research"] }, // ceiling
			{ allow: ["tdd", "anima-orchestration"] }, // anima-orchestration NOT in ceiling
		);
		// anima-orchestration is dropped because it's outside the ceiling
		assert.deepEqual(r.effective, ["tdd"]);
	});
});

describe("resolveEntitlement — team allow as ceiling", () => {
	it("team allow non-empty caps the universe to U ∩ team.allow", () => {
		const r = resolveEntitlement(
			U_SKILLS,
			{ allow: ["tdd", "vak-evaluate", "not-published"] },
			{ allow: [] }, // inherit ceiling
		);
		// "not-published" is filtered (not in U); order follows U
		assert.deepEqual(r.teamCeiling, ["vak-evaluate", "tdd"]);
		assert.deepEqual(r.effective, ["vak-evaluate", "tdd"]);
	});
});

describe("resolveEntitlement — deny subtracts and beats allow", () => {
	it("team deny removes from the effective set even when allowed", () => {
		const r = resolveEntitlement(
			U_SKILLS,
			{ allow: ["tdd", "web-research"], deny: ["web-research"] },
			{ allow: [] },
		);
		assert.deepEqual(r.effective, ["tdd"]);
	});

	it("agent deny beats agent allow (deny wins on the same layer)", () => {
		const r = resolveEntitlement(
			U_SKILLS,
			undefined,
			{ allow: ["tdd", "web-research"], deny: ["tdd"] },
		);
		assert.deepEqual(r.effective, ["web-research"]);
	});

	it("agent deny beats team allow (deny wins across layers)", () => {
		const r = resolveEntitlement(
			U_SKILLS,
			{ allow: ["tdd", "web-research"] },
			{ allow: [], deny: ["tdd"] },
		);
		assert.deepEqual(r.effective, ["web-research"]);
	});
});

describe("HARD-GATE — unentitled skill/tool is absent from effective", () => {
	const universe: EntitlementUniverse = {
		skills: U_SKILLS,
		tools: ["dispatch_agent", "vak_evaluate", "khora_write", "web_search"],
	};

	it("a non-allowed tool is refused by the hard gate", () => {
		const eff = computeAgentEntitlement(
			universe,
			{ skills: { allow: [] }, tools: { allow: ["dispatch_agent"] } },
			{ skills: { allow: [] }, tools: { allow: [] } },
		);
		assert.deepEqual(eff.tools.effective, ["dispatch_agent"]);
		assert.equal(enforceEntitlement(eff, "tool", "khora_write").allowed, false);
		assert.equal(enforceEntitlement(eff, "tool", "dispatch_agent").allowed, true);
	});

	it("a denied skill is refused even if it is in the universe", () => {
		const eff = computeAgentEntitlement(
			universe,
			{ skills: { deny: ["tdd"] }, tools: { allow: [] } },
			{ skills: { allow: [] }, tools: { allow: [] } },
		);
		assert.equal(enforceEntitlement(eff, "skill", "tdd").allowed, false);
		assert.equal(eff.skills.effective.includes("tdd"), false);
	});

	it("exposeEntitled only surfaces entitled candidates", () => {
		const eff = computeAgentEntitlement(
			universe,
			{ skills: { allow: [] }, tools: { allow: [] } },
			{ skills: { allow: ["tdd"] }, tools: { allow: ["web_search"] } },
		);
		assert.deepEqual(
			exposeEntitled(eff, "skill", ["tdd", "web-research", "anima-orchestration"]),
			["tdd"],
		);
		assert.deepEqual(
			exposeEntitled(eff, "tool", ["web_search", "khora_write"]),
			["web_search"],
		);
	});

	it("empty/whitespace names are never entitled", () => {
		const eff = computeAgentEntitlement(universe, undefined, undefined);
		assert.equal(enforceEntitlement(eff, "tool", "").allowed, false);
		assert.equal(enforceEntitlement(eff, "skill", "   ").allowed, false);
		assert.equal(isEntitled("", U_SKILLS, undefined, undefined), false);
	});
});

describe("namespace-agnostic — epi-logos:* gates identically to bare names", () => {
	it("epi-logos:apply-cmea is gated by the same allow/deny rules", () => {
		const allowed = resolveEntitlement(
			U_SKILLS,
			{ allow: [] },
			{ allow: ["epi-logos:apply-cmea"] },
		);
		assert.deepEqual(allowed.effective, ["epi-logos:apply-cmea"]);

		const denied = resolveEntitlement(
			U_SKILLS,
			{ deny: ["epi-logos:apply-cmea"] },
			{ allow: [] },
		);
		assert.equal(denied.effective.includes("epi-logos:apply-cmea"), false);
		// the non-namespaced sibling is unaffected
		assert.equal(denied.effective.includes("epi-logos:apply-tetralemma"), true);
	});

	it("a persona like `epii` resolves with the same generic rule", () => {
		// `epii`-style persona: team caps to two namespaced skills, agent denies one.
		const eff = resolveEntitlement(
			U_SKILLS,
			{ allow: ["epi-logos:apply-cmea", "epi-logos:apply-tetralemma"] },
			{ deny: ["epi-logos:apply-tetralemma"] },
		);
		assert.deepEqual(eff.effective, ["epi-logos:apply-cmea"]);
	});

	it("filterEntitled preserves candidate order and is namespace-blind", () => {
		const out = filterEntitled(
			["web-research", "epi-logos:apply-cmea", "tdd"],
			U_SKILLS,
			{ allow: [] },
			{ allow: ["tdd", "epi-logos:apply-cmea"] },
		);
		assert.deepEqual(out, ["epi-logos:apply-cmea", "tdd"]);
	});
});

describe("frontmatter loader — reads the four binding fields", () => {
	it("parses skills, skills_deny, tools, tools_deny (comma-separated)", () => {
		const fm = [
			"name: epii",
			"tools: dispatch_agent, vak_evaluate",
			"tools_deny: khora_write",
			"skills: vak-evaluate, epi-logos:apply-cmea",
			"skills_deny: tdd",
		].join("\n");
		const ent = parseAgentEntitlement(fm);
		assert.deepEqual(ent.tools.allow, ["dispatch_agent", "vak_evaluate"]);
		assert.deepEqual(ent.tools.deny, ["khora_write"]);
		assert.deepEqual(ent.skills.allow, ["vak-evaluate", "epi-logos:apply-cmea"]);
		assert.deepEqual(ent.skills.deny, ["tdd"]);
	});

	it("absent deny fields => empty lists (inherit, not deny-all)", () => {
		const fm = ["name: anima", "tools: dispatch_agent", "skills: vak-evaluate"].join("\n");
		const ent = parseAgentEntitlement(fm);
		assert.deepEqual(ent.tools.deny, []);
		assert.deepEqual(ent.skills.deny, []);
	});

	it("parses entitlement from a full .md file with frontmatter fence", () => {
		const raw = [
			"---",
			"name: psyche",
			"tools: dispatch_agent",
			"skills_deny: web-research",
			"---",
			"",
			"## Body",
		].join("\n");
		const ent = parseAgentEntitlementFromFile(raw);
		assert.deepEqual(ent.tools.allow, ["dispatch_agent"]);
		assert.deepEqual(ent.skills.deny, ["web-research"]);
	});

	it("parseCommaList trims, dedups, drops empties", () => {
		assert.deepEqual(parseCommaList("a, b ,, a , c"), ["a", "b", "c"]);
		assert.deepEqual(parseCommaList(undefined), []);
	});
});

describe("teams.yaml loader — optional per-team allow/deny, backward-compatible", () => {
	const yaml = [
		"anima:",
		'  description: "orchestrator"',
		"  members:",
		"    - psyche",
		"    - nous",
		"  skills_deny: web-research",
		"plain:",
		'  description: "no entitlement keys at all"',
		"  members:",
		"    - logos",
		"capped:",
		"  members:",
		"    - eros",
		"  tools_allow: dispatch_agent, vak_evaluate",
		"  skills_allow: [vak-evaluate, tdd]",
	].join("\n");

	it("teams with no entitlement keys yield empty layers (ceiling = U)", () => {
		const teams = parseTeamEntitlements(yaml);
		assert.deepEqual(teams.plain.skills.allow, []);
		assert.deepEqual(teams.plain.tools.allow, []);
		const r = resolveEntitlement(U_SKILLS, teams.plain.skills, undefined);
		assert.deepEqual(r.effective, U_SKILLS);
	});

	it("team skills_deny subtracts from the ceiling", () => {
		const teams = parseTeamEntitlements(yaml);
		assert.deepEqual(teams.anima.skills.deny, ["web-research"]);
		const r = resolveEntitlement(U_SKILLS, teams.anima.skills, undefined);
		assert.equal(r.effective.includes("web-research"), false);
	});

	it("team allow (comma or inline-array) caps the ceiling", () => {
		const teams = parseTeamEntitlements(yaml);
		assert.deepEqual(teams.capped.tools.allow, ["dispatch_agent", "vak_evaluate"]);
		assert.deepEqual(teams.capped.skills.allow, ["vak-evaluate", "tdd"]);
		const r = resolveEntitlement(U_SKILLS, teams.capped.skills, undefined);
		assert.deepEqual(r.effective, ["vak-evaluate", "tdd"]);
	});

	it("end-to-end team+agent stack via computeAgentEntitlement", () => {
		const teams = parseTeamEntitlements(yaml);
		const universe: EntitlementUniverse = {
			skills: U_SKILLS,
			tools: ["dispatch_agent", "vak_evaluate", "khora_write"],
		};
		const agentFm = ["name: eros", "tools: dispatch_agent", "skills: tdd"].join("\n");
		const agent = parseAgentEntitlement(agentFm);
		const eff = computeAgentEntitlement(universe, teams.capped, agent);
		// team caps tools to {dispatch_agent, vak_evaluate}; agent allows only dispatch_agent
		assert.deepEqual(eff.tools.effective, ["dispatch_agent"]);
		// team caps skills to {vak-evaluate, tdd}; agent allows only tdd
		assert.deepEqual(eff.skills.effective, ["tdd"]);
	});
});
