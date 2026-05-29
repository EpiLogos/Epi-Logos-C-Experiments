import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { matchGateTrigger, type GateTrigger } from "../modules/gate-trigger.ts";

describe("gate-trigger predicate DSL", () => {
  const triggers: GateTrigger[] = [
    { gate: "ql-gate", on: { cf_transition_to: "(00/00)" } },
    { gate: "m-prime-gate", on: { ct_includes: "CT4b" } },
    { gate: "collab-gate", on: { cpf_equals: "(00/00)", risk_above: 0.7 } },
  ];

  it("fires ql-gate when CF transitions to (00/00)", () => {
    const fired = matchGateTrigger(triggers, {
      prev_vak: { cf: "(0/1/2)" } as any,
      next_vak: { cf: "(00/00)" } as any,
    });
    assert.deepEqual(fired, ["ql-gate"]);
  });

  it("does NOT fire ql-gate when CF is already (00/00) (no transition)", () => {
    const fired = matchGateTrigger(triggers, {
      prev_vak: { cf: "(00/00)" } as any,
      next_vak: { cf: "(00/00)" } as any,
    });
    assert.deepEqual(fired, []);
  });

  it("fires m-prime-gate when CT includes CT4b", () => {
    const fired = matchGateTrigger(triggers, {
      prev_vak: { cf: "(0/1)", ct: ["CT1"] } as any,
      next_vak: { cf: "(0/1)", ct: ["CT4b"] } as any,
    });
    assert.deepEqual(fired, ["m-prime-gate"]);
  });

  it("fires collab-gate when CPF=(00/00) AND risk above threshold", () => {
    const fired = matchGateTrigger(triggers, {
      prev_vak: { cpf: "(4.0/1-4.4/5)" } as any,
      next_vak: { cpf: "(00/00)" } as any,
      context: { risk: 0.9 },
    });
    assert.deepEqual(fired, ["collab-gate"]);
  });

  it("does NOT fire collab-gate when CPF=(00/00) but risk below threshold", () => {
    const fired = matchGateTrigger(triggers, {
      prev_vak: { cpf: "(4.0/1-4.4/5)" } as any,
      next_vak: { cpf: "(00/00)" } as any,
      context: { risk: 0.3 },
    });
    assert.deepEqual(fired, []);
  });

  it("fires multiple gates when conditions overlap", () => {
    const fired = matchGateTrigger(triggers, {
      prev_vak: { cpf: "(4.0/1-4.4/5)", cf: "(0/1)" } as any,
      next_vak: { cpf: "(00/00)", cf: "(00/00)", ct: ["CT4b"] } as any,
      context: { risk: 0.9 },
    });
    // Expected order = trigger array order: ql-gate, m-prime-gate, collab-gate
    assert.deepEqual(fired.sort(), ["collab-gate", "m-prime-gate", "ql-gate"]);
  });

  it("returns empty array when no triggers match", () => {
    const fired = matchGateTrigger(triggers, {
      prev_vak: { cf: "(0/1)" } as any,
      next_vak: { cf: "(0/1/2)", ct: ["CT2"], cpf: "(4.0/1-4.4/5)" } as any,
      context: { risk: 0.1 },
    });
    assert.deepEqual(fired, []);
  });
});
