import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { validateDispatchParams, AGENT_CF, CPF_DIALOGICAL } from "../modules/dispatch-validate.ts";
import type { VakAddress } from "../../shared/vak_address.ts";

describe("dispatch_agent — mechanistic mode (CPF (4.0/1-4.4/5))", () => {
  const validVak: VakAddress = {
    cpf: "(4.0/1-4.4/5)",
    ct: ["CT1"],
    cp: "CP4.1",
    cf: "(0/1)",
    cfp: "CFP0",
    cs: { code: "CS1", direction: "Day" },
  };

  it("rejects mechanistic dispatch with malformed vak_address (missing required fields)", () => {
    // cpf "(4.0/1-4.4/5)" puts us on the strict path, so a partial address fails
    // canonical validation as before.
    const result = validateDispatchParams({
      agent_name: "logos",
      task: "define X",
      vak_address: { cpf: "(4.0/1-4.4/5)" } as any,
    });
    assert.equal(result.ok, false);
    assert.match(result.error!, /malformed|vak_address/i);
  });

  it("accepts dispatch with complete vak_address matching agent's CF", () => {
    const result = validateDispatchParams({
      agent_name: "logos", // logos = CF (0/1)
      task: "define X",
      vak_address: validVak,
    });
    assert.equal(result.ok, true);
    assert.equal(result.error, undefined);
  });

  it("rejects dispatch when vak.cf does not match agent's CF", () => {
    const result = validateDispatchParams({
      agent_name: "logos", // logos = CF (0/1)
      task: "x",
      vak_address: {
        ...validVak,
        cf: "(5/0)", // sophia's CF, not logos's
      },
    });
    assert.equal(result.ok, false);
    assert.match(result.error!, /cf does not match agent/i);
  });

  it("AGENT_CF map covers all seven constitutional agents (Nous through Sophia + Anima)", () => {
    assert.equal(AGENT_CF.nous, "(00/00)");
    assert.equal(AGENT_CF.logos, "(0/1)");
    assert.equal(AGENT_CF.eros, "(0/1/2)");
    assert.equal(AGENT_CF.mythos, "(0/1/2/3)");
    assert.equal(AGENT_CF.psyche, "(4.5/0)");
    assert.equal(AGENT_CF.sophia, "(5/0)");
    assert.equal(AGENT_CF.anima, "(4.0/1-4.4/5)");
  });

  it("accepts unknown agent_name as long as vak_address is valid (caller must enforce roster)", () => {
    // Skipping CF-match for unknown agents lets composite/aggregate dispatch paths
    // (CFP3 fusion, custom subagents) still validate; the AGENT_CF check only fires
    // when the agent is in the canonical 7-fold roster.
    const result = validateDispatchParams({
      agent_name: "custom-subagent",
      task: "x",
      vak_address: validVak,
    });
    assert.equal(result.ok, true);
  });

  it("treats unknown CPF as mechanistic (strict path, not a bypass)", () => {
    // Anything other than "(00/00)" — including a string the type system would
    // reject but a malicious/buggy caller might inject — must NOT open the
    // dialogical bypass. The validator should still demand canonical shape.
    const result = validateDispatchParams({
      agent_name: "logos",
      task: "x",
      vak_address: { cpf: "(some/garbage)" } as any,
    });
    assert.equal(result.ok, false);
    assert.match(result.error!, /malformed|vak_address/i);
  });
});

describe("dispatch_agent — dialogical / Ouroboros mode (CPF (00/00) or absent)", () => {
  it("CPF_DIALOGICAL constant equals \"(00/00)\"", () => {
    assert.equal(CPF_DIALOGICAL, "(00/00)");
  });

  it("accepts dispatch with NO vak_address (open conversation)", () => {
    const result = validateDispatchParams({
      agent_name: "logos",
      task: "let's chat",
    } as any);
    assert.equal(result.ok, true);
    assert.equal(result.error, undefined);
  });

  it("accepts dispatch with NO vak_address for eros (simple invocation)", () => {
    const result = validateDispatchParams({
      agent_name: "eros",
      task: "operate Y",
    } as any);
    assert.equal(result.ok, true);
  });

  it("accepts dispatch with partial vak_address whose cpf is (00/00)", () => {
    // Only `cpf` field present; no ct/cp/cf/cfp/cs. Dialogical mode tolerates
    // this — the address is a hint, not a contract.
    const result = validateDispatchParams({
      agent_name: "logos",
      task: "brainstorm with me",
      vak_address: { cpf: "(00/00)" } as any,
    });
    assert.equal(result.ok, true);
    assert.equal(result.error, undefined);
  });

  it("accepts dialogical dispatch even when cf is 'wrong' for the agent", () => {
    // In dialogical mode the agent/cf binding is NOT enforced. Brainstorming IS
    // the VAK determination — the canonical cf will be discovered, not declared.
    const result = validateDispatchParams({
      agent_name: "logos", // canonical cf would be (0/1)
      task: "explore",
      vak_address: { cpf: "(00/00)", cf: "(5/0)" } as any, // sophia's cf, ignored here
    });
    assert.equal(result.ok, true);
  });
});

describe("dispatch_agent gating (agent-team.ts variant)", () => {
  it("validateDispatchParams permits no-vak dispatch in dialogical mode (open chat)", () => {
    // Reframed from the original A5 strict-no-vak test. The agent-team.ts tool
    // route still calls validateDispatchParams; the contract widens but stays
    // compatible — simple {agent, task} invocations are dialogical by default.
    const result = validateDispatchParams({
      agent_name: "logos",
      task: "x",
      // no vak_address
    } as any);
    assert.equal(result.ok, true);
  });
});
