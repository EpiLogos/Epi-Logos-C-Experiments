import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { fileURLToPath } from "node:url";

import {
	enumerateSkillUniverse,
	computeAgentEntitlement,
	parseCommaList,
	type EntitlementUniverse,
} from "./entitlement.ts";

// Real skill dirs, resolved relative to this test file's location.
const animaSkillsDir = fileURLToPath(new URL("../S4-4p-anima/S4'/skills", import.meta.url));
const pleromaSkillsDir = fileURLToPath(new URL("../../plugins/pleroma/skills", import.meta.url));

describe("enumerateSkillUniverse — real skill directories", () => {
	it("finds known skill names across the two real dirs", () => {
		const universe = enumerateSkillUniverse([animaSkillsDir, pleromaSkillsDir]);
		// Known names that exist with a SKILL.md in the real dirs.
		assert.ok(universe.includes("vak-evaluate"), "expected vak-evaluate in universe");
		assert.ok(universe.includes("web-research"), "expected web-research in universe");
		assert.ok(universe.includes("anima-orchestration"), "expected anima-orchestration in universe");
		// Deduped: anima-orchestration exists in BOTH dirs but appears once.
		assert.equal(
			universe.filter((n) => n === "anima-orchestration").length,
			1,
			"duplicate skill name must be deduped",
		);
	});

	it("tolerates a missing directory (skips it, keeps the rest)", () => {
		const withMissing = enumerateSkillUniverse([
			animaSkillsDir,
			"/no/such/skills/dir/anywhere",
			pleromaSkillsDir,
		]);
		const baseline = enumerateSkillUniverse([animaSkillsDir, pleromaSkillsDir]);
		assert.deepEqual(withMissing, baseline, "missing dir must not change the result");
	});

	it("returns [] for entirely missing dirs without throwing", () => {
		assert.deepEqual(enumerateSkillUniverse(["/nope/a", "/nope/b"]), []);
	});
});

describe("dispatch-style computeAgentEntitlement against the live universe", () => {
	const skillUniverse = enumerateSkillUniverse([animaSkillsDir, pleromaSkillsDir]);

	it("agent skills.allow restricts to declared subset; skills_deny blocks", () => {
		// Mirror dispatchAgent: tools universe = declared tools, agent.allow empty
		// (inherit declared), tools_deny subtracts. Skills allow narrows, deny beats.
		const universe: EntitlementUniverse = {
			skills: skillUniverse,
			tools: parseCommaList("dispatch_agent, vak_evaluate, khora_write"),
		};
		const eff = computeAgentEntitlement(
			universe,
			undefined, // no team => ceiling = full universe
			{
				skills: {
					allow: parseCommaList("vak-evaluate, web-research"),
					deny: parseCommaList("web-research"),
				},
				tools: { allow: [], deny: parseCommaList("khora_write") },
			},
		);
		// skills: allowed {vak-evaluate, web-research}, deny removes web-research
		assert.deepEqual(eff.skills.effective, ["vak-evaluate"]);
		// tools: universe = declared three, agent.allow empty inherits all, deny removes khora_write
		assert.deepEqual(eff.tools.effective, ["dispatch_agent", "vak_evaluate"]);
	});

	it("team allow acts as a ceiling the agent cannot escape", () => {
		const universe: EntitlementUniverse = {
			skills: skillUniverse,
			tools: parseCommaList("dispatch_agent, vak_evaluate"),
		};
		const eff = computeAgentEntitlement(
			universe,
			{
				// team caps skills to a single skill; tools to dispatch_agent only
				skills: { allow: ["vak-evaluate"], deny: [] },
				tools: { allow: ["dispatch_agent"], deny: [] },
			},
			{
				// agent tries to allow two skills, but only the in-ceiling one survives
				skills: { allow: parseCommaList("vak-evaluate, web-research"), deny: [] },
				tools: { allow: [], deny: [] },
			},
		);
		assert.deepEqual(eff.skills.effective, ["vak-evaluate"]);
		assert.deepEqual(eff.tools.effective, ["dispatch_agent"]);
	});
});
