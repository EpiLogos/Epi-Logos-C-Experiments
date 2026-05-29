import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { dispatchGuardrails, CANONICAL_TRIGGERS } from "../modules/dispatch-validate.ts";

describe("dispatch gate guardrails", () => {
  it("blocks dispatch when collab-gate fires (high-risk dialogical)", () => {
    const out = dispatchGuardrails({
      prev_vak: { cpf: "(4.0/1-4.4/5)", cf: "(0/1)" } as any,
      next_vak: { cpf: "(00/00)", cf: "(00/00)", ct: ["CT0"], cp: "CP4.0", cfp: "CFP0", cs: { code: "CS1", direction: "Day" } },
      risk: 0.9,
    }, CANONICAL_TRIGGERS);
    assert.equal(out.allowed, false);
    // ql-gate fires too (cf transition), but collab-gate is the blocker
    assert.deepEqual(out.gates_fired.sort(), ["collab-gate", "ql-gate"]);
  });

  it("blocks dispatch when rupa-gate fires (CT3 pattern bucket)", () => {
    const out = dispatchGuardrails({
      prev_vak: { ct: ["CT2"] } as any,
      next_vak: { ct: ["CT3"], cpf: "(4.0/1-4.4/5)", cf: "(0/1/2/3)" },
      risk: 0.1,
    }, CANONICAL_TRIGGERS);
    assert.equal(out.allowed, false);
    assert.ok(out.gates_fired.includes("rupa-gate"));
  });

  it("does NOT block when only informational gates fire (ql-gate, m-prime-gate)", () => {
    const out = dispatchGuardrails({
      prev_vak: { cf: "(0/1/2)" } as any,
      next_vak: { cf: "(00/00)", cpf: "(4.0/1-4.4/5)", ct: ["CT4b"] },  // ql-gate + m-prime-gate fire
      risk: 0.2,  // collab-gate NOT triggered (cpf is mechanistic)
    }, CANONICAL_TRIGGERS);
    assert.equal(out.allowed, true, "informational gates do not block");
    assert.deepEqual(out.gates_fired.sort(), ["m-prime-gate", "ql-gate"]);
  });

  it("allows dispatch when no triggers match", () => {
    const out = dispatchGuardrails({
      prev_vak: { cpf: "(4.0/1-4.4/5)", cf: "(0/1)", ct: ["CT1"] } as any,
      next_vak: { cpf: "(4.0/1-4.4/5)", cf: "(0/1/2)", ct: ["CT2"], cp: "CP4.2", cfp: "CFP0", cs: { code: "CS1", direction: "Day" } },
      risk: 0.1,
    }, CANONICAL_TRIGGERS);
    assert.equal(out.allowed, true);
    assert.equal(out.gates_fired.length, 0);
  });

  it("allows dispatch with no prev_vak (initial transition from undefined)", () => {
    // First dispatch in a session — prev_vak is undefined. Don't accidentally block.
    const out = dispatchGuardrails({
      next_vak: { cpf: "(4.0/1-4.4/5)", cf: "(0/1)", ct: ["CT1"] },
      risk: 0.0,
    }, CANONICAL_TRIGGERS);
    // cf (0/1) transition from undefined — but cf_transition_to is for (00/00) so no fire
    assert.equal(out.allowed, true);
    assert.equal(out.gates_fired.length, 0);
  });
});
