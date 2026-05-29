import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { validateDispatchParams, AGENT_CF } from "../modules/dispatch-validate.ts";
import type { VakAddress } from "../../shared/vak_address.ts";

describe("dispatch_agent VAK requirement", () => {
  const validVak: VakAddress = {
    cpf: "(4.0/1-4.4/5)",
    ct: ["CT1"],
    cp: "CP4.1",
    cf: "(0/1)",
    cfp: "CFP0",
    cs: { code: "CS1", direction: "Day" },
  };

  it("rejects dispatch with no vak_address", () => {
    const result = validateDispatchParams({
      agent_name: "logos",
      task: "define X",
    } as any);
    assert.equal(result.ok, false);
    assert.match(result.error!, /vak_address required/i);
  });

  it("rejects dispatch with malformed vak_address", () => {
    const result = validateDispatchParams({
      agent_name: "logos",
      task: "define X",
      vak_address: { cpf: "(00/00)" } as any,
    });
    assert.equal(result.ok, false);
    assert.match(result.error!, /malformed|vak_address/i);
  });

  it("accepts dispatch with complete vak_address matching agent's CF", () => {
    const result = validateDispatchParams({
      agent_name: "logos",  // logos = CF (0/1)
      task: "define X",
      vak_address: validVak,
    });
    assert.equal(result.ok, true);
    assert.equal(result.error, undefined);
  });

  it("rejects dispatch when vak.cf does not match agent's CF", () => {
    const result = validateDispatchParams({
      agent_name: "logos",  // logos = CF (0/1)
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
});
