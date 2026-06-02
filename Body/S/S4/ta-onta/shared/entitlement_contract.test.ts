import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { resolveEntitlement, enumerateSkillUniverse } from "./entitlement.ts";
import { parseAgentEntitlementFromContract } from "./entitlement-loader.ts";

// Point: the resolver is open to JSON agent contracts (peer pi_agents like epii
// / anima) as a second source of the same four binding layers. Real files, no mocks.
//
// epii is a peer pi_agent whose skill universe is its own resource package
// (epi-logos). Empty allow => inherit the full package (hard-gate degrades to
// all-of-package, never deny-all).

const EPII_CONTRACT = "Body/S/S5/epii-agent/agent-contract.json";
const EPI_LOGOS_SKILLS = "Body/S/S5/plugins/epi-logos/skills";

describe("JSON contract entitlement — epii (peer pi_agent)", () => {
  const contract = JSON.parse(readFileSync(EPII_CONTRACT, "utf8"));

  it("the epii contract carries an entitlement block sourced from its resource package", () => {
    assert.ok(contract.entitlement, "epii contract has an entitlement block");
    assert.deepEqual(contract.entitlement.skill_universe_roots, [EPI_LOGOS_SKILLS]);
  });

  it("parses empty allow/deny layers (inherit the full package)", () => {
    const ent = parseAgentEntitlementFromContract(contract);
    assert.deepEqual(ent.skills, { allow: [], deny: [] });
    assert.deepEqual(ent.tools, { allow: [], deny: [] });
  });

  it("epii inherits its ENTIRE epi-logos package as effective skills", () => {
    const universe = enumerateSkillUniverse([EPI_LOGOS_SKILLS]);
    assert.ok(universe.includes("apply-cmea") && universe.includes("using-epi-logos"), "real package enumerated");
    const ent = parseAgentEntitlementFromContract(contract);
    const eff = resolveEntitlement(universe, undefined, ent.skills);
    assert.deepEqual(eff.effective, universe, "empty allow => entitled to the whole package");
  });

  it("hard-gates a non-package skill out of epii's universe", () => {
    const universe = enumerateSkillUniverse([EPI_LOGOS_SKILLS]);
    assert.equal(universe.includes("tdd"), false, "tdd is not an epi-logos package skill");
    const ent = parseAgentEntitlementFromContract(contract);
    const eff = resolveEntitlement(universe, undefined, ent.skills);
    assert.equal(eff.effective.includes("tdd"), false);
  });
});

describe("JSON contract entitlement — parsing forms", () => {
  it("accepts array-form allow/deny", () => {
    const ent = parseAgentEntitlementFromContract({
      entitlement: { skills: { allow: ["a", "b"], deny: ["b"] }, tools: { allow: ["t"] } },
    });
    assert.deepEqual(ent.skills.allow, ["a", "b"]);
    assert.deepEqual(ent.skills.deny, ["b"]);
    assert.deepEqual(ent.tools.allow, ["t"]);
  });

  it("accepts comma-string-form allow/deny", () => {
    const ent = parseAgentEntitlementFromContract({
      entitlement: { skills: { allow: "a, b , c" } },
    });
    assert.deepEqual(ent.skills.allow, ["a", "b", "c"]);
  });

  it("explicit allow restricts and deny beats allow (deny wins)", () => {
    const ent = parseAgentEntitlementFromContract({
      entitlement: { skills: { allow: ["apply-cmea", "using-epi-logos"], deny: ["using-epi-logos"] } },
    });
    const universe = enumerateSkillUniverse([EPI_LOGOS_SKILLS]);
    const eff = resolveEntitlement(universe, undefined, ent.skills);
    assert.deepEqual(eff.effective, ["apply-cmea"]);
  });

  it("absent entitlement block => empty layers (inherit, never deny-all)", () => {
    const ent = parseAgentEntitlementFromContract({ agent_id: "x" });
    assert.deepEqual(ent.skills, { allow: [], deny: [] });
    assert.deepEqual(ent.tools, { allow: [], deny: [] });
  });
});
