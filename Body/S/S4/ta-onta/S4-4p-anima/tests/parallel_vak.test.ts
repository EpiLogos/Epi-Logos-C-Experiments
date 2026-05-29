import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { validateParallelDispatch } from "../modules/dispatch-validate.ts";
import type { VakAddress } from "../../shared/vak_address.ts";

const vakWith = (cfp: VakAddress["cfp"], cf: VakAddress["cf"] = "(0/1)"): VakAddress => ({
  cpf: "(4.0/1-4.4/5)",
  ct: ["CT1"],
  cp: "CP4.1",
  cf,
  cfp,
  cs: { code: "CS1", direction: "Day" },
});

describe("dispatch_parallel_agents CFP1 binding", () => {
  it("rejects an empty tasks array", () => {
    const r = validateParallelDispatch({ tasks: [] });
    assert.equal(r.ok, false);
    assert.match(r.error!, /no tasks/i);
  });

  it("rejects when any task is missing vak_address", () => {
    const r = validateParallelDispatch({
      tasks: [
        { agent_name: "logos", task: "x", vak_address: vakWith("CFP1") },
        { agent_name: "eros", task: "y" } as any,
      ],
    });
    assert.equal(r.ok, false);
    assert.match(r.error!, /vak_address required/i);
  });

  it("rejects when any task declares non-CFP1 cfp", () => {
    const r = validateParallelDispatch({
      tasks: [
        { agent_name: "logos", task: "x", vak_address: vakWith("CFP1") },
        { agent_name: "eros", task: "y", vak_address: vakWith("CFP0", "(0/1/2)") },
      ],
    });
    assert.equal(r.ok, false);
    assert.match(r.error!, /CFP1/);
  });

  it("rejects when all tasks declare CFP0 (legacy non-parallel)", () => {
    const r = validateParallelDispatch({
      tasks: [
        { agent_name: "logos", task: "x", vak_address: vakWith("CFP0") },
        { agent_name: "eros", task: "y", vak_address: vakWith("CFP0", "(0/1/2)") },
      ],
    });
    assert.equal(r.ok, false);
    assert.match(r.error!, /CFP1/);
  });

  it("accepts when every task carries CFP1 + valid agent CF match", () => {
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

  it("rejects CFP1 task whose cf does not match agent's CF roster", () => {
    const r = validateParallelDispatch({
      tasks: [
        { agent_name: "logos", task: "x", vak_address: vakWith("CFP1", "(5/0)") }, // sophia's cf
      ],
    });
    assert.equal(r.ok, false);
    assert.match(r.error!, /cf does not match agent/i);
  });
});
