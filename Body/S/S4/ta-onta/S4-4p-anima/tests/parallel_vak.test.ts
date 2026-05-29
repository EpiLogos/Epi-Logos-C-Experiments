import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { validateParallelDispatch } from "../modules/dispatch-validate.ts";
import type { VakAddress } from "../../shared/vak_address.ts";

// Mechanistic-mode helper: full canonical VAK with cpf "(4.0/1-4.4/5)".
const vakWith = (cfp: VakAddress["cfp"], cf: VakAddress["cf"] = "(0/1)"): VakAddress => ({
  cpf: "(4.0/1-4.4/5)",
  ct: ["CT1"],
  cp: "CP4.1",
  cf,
  cfp,
  cs: { code: "CS1", direction: "Day" },
});

describe("dispatch_parallel_agents — mechanistic mode (CFP1 binding)", () => {
  it("rejects an empty tasks array", () => {
    const r = validateParallelDispatch({ tasks: [] });
    assert.equal(r.ok, false);
    assert.match(r.error!, /no tasks/i);
  });

  it("rejects when any mechanistic task declares non-CFP1 cfp", () => {
    const r = validateParallelDispatch({
      tasks: [
        { agent_name: "logos", task: "x", vak_address: vakWith("CFP1") },
        { agent_name: "eros", task: "y", vak_address: vakWith("CFP0", "(0/1/2)") },
      ],
    });
    assert.equal(r.ok, false);
    assert.match(r.error!, /CFP1/);
  });

  it("rejects when all mechanistic tasks declare CFP0 (legacy non-parallel)", () => {
    const r = validateParallelDispatch({
      tasks: [
        { agent_name: "logos", task: "x", vak_address: vakWith("CFP0") },
        { agent_name: "eros", task: "y", vak_address: vakWith("CFP0", "(0/1/2)") },
      ],
    });
    assert.equal(r.ok, false);
    assert.match(r.error!, /CFP1/);
  });

  it("accepts when every mechanistic task carries CFP1 + valid agent CF match", () => {
    const r = validateParallelDispatch({
      tasks: [
        { agent_name: "logos", task: "define X", vak_address: vakWith("CFP1") },
        { agent_name: "eros", task: "operate Y", vak_address: vakWith("CFP1", "(0/1/2)") },
        { agent_name: "mythos", task: "pattern Z", vak_address: vakWith("CFP1", "(0/1/2/3)") },
      ],
    });
    assert.equal(r.ok, true);
    assert.equal(r.error, undefined);
  });

  it("rejects mechanistic CFP1 task whose cf does not match agent's CF roster", () => {
    const r = validateParallelDispatch({
      tasks: [
        { agent_name: "logos", task: "x", vak_address: vakWith("CFP1", "(5/0)") }, // sophia's cf
      ],
    });
    assert.equal(r.ok, false);
    assert.match(r.error!, /cf does not match agent/i);
  });
});

describe("dispatch_parallel_agents — dialogical / Ouroboros mode", () => {
  it("accepts parallel tasks with NO vak_address (open brainstorm fan-out)", () => {
    const r = validateParallelDispatch({
      tasks: [
        { agent_name: "logos", task: "what if X?" } as any,
        { agent_name: "eros", task: "what if Y?" } as any,
        { agent_name: "mythos", task: "what if Z?" } as any,
      ],
    });
    assert.equal(r.ok, true);
    assert.equal(r.error, undefined);
  });

  it("accepts dialogical tasks with cpf (00/00) and NO CFP1 declaration", () => {
    // Brainstorm fan-out — no CFP1 ceremony required.
    const r = validateParallelDispatch({
      tasks: [
        { agent_name: "logos", task: "x", vak_address: { cpf: "(00/00)" } as any },
        { agent_name: "eros", task: "y", vak_address: { cpf: "(00/00)" } as any },
      ],
    });
    assert.equal(r.ok, true);
  });

  it("accepts a mixed batch where each task individually satisfies its mode", () => {
    // One dialogical task + one mechanistic CFP1 task → batch passes because
    // each task meets its mode-appropriate contract.
    const r = validateParallelDispatch({
      tasks: [
        { agent_name: "logos", task: "open chat", vak_address: { cpf: "(00/00)" } as any },
        { agent_name: "eros", task: "operate Y", vak_address: vakWith("CFP1", "(0/1/2)") },
      ],
    });
    assert.equal(r.ok, true);
  });

  it("rejects a mixed batch where a mechanistic task is non-CFP1", () => {
    // Dialogical tasks are excused from CFP1, but mechanistic tasks are not.
    const r = validateParallelDispatch({
      tasks: [
        { agent_name: "logos", task: "open chat", vak_address: { cpf: "(00/00)" } as any },
        { agent_name: "eros", task: "operate Y", vak_address: vakWith("CFP0", "(0/1/2)") },
      ],
    });
    assert.equal(r.ok, false);
    assert.match(r.error!, /CFP1/);
  });
});
