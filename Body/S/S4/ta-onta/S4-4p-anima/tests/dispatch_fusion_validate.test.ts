import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import {
  validateFusionDispatch,
  MOIRAI_HOST_CF,
} from "../modules/dispatch-validate.ts";
import { buildMoiraiVak } from "../modules/moirai-dispatch.ts";

describe("validateFusionDispatch", () => {
  it("accepts a mixed-agent CFP3 batch where each entry has canonical VAK", () => {
    const result = validateFusionDispatch({
      task: "rehear this disclosure",
      dispatches: [
        { agent_name: "klotho", vak_address: buildMoiraiVak(MOIRAI_HOST_CF.klotho) },
        { agent_name: "lachesis", vak_address: buildMoiraiVak(MOIRAI_HOST_CF.lachesis) },
        { agent_name: "atropos", vak_address: buildMoiraiVak(MOIRAI_HOST_CF.atropos) },
      ],
    });
    assert.equal(result.ok, true);
    assert.equal(result.error, undefined);
  });

  it("enforces canonical VAK shape per entry (mechanistic path)", () => {
    const result = validateFusionDispatch({
      task: "rehear",
      dispatches: [
        { agent_name: "klotho", vak_address: buildMoiraiVak(MOIRAI_HOST_CF.klotho) },
        {
          agent_name: "lachesis",
          vak_address: { ...buildMoiraiVak(MOIRAI_HOST_CF.lachesis), cp: "BOGUS" } as any,
        },
      ],
    });
    assert.equal(result.ok, false);
    assert.ok(result.error?.includes("lachesis"), `error should mention lachesis: ${result.error}`);
  });

  it("rejects empty task", () => {
    const result = validateFusionDispatch({
      task: "",
      dispatches: [{ agent_name: "klotho", vak_address: buildMoiraiVak(MOIRAI_HOST_CF.klotho) }],
    });
    assert.equal(result.ok, false);
    assert.match(result.error!, /non-empty task/i);
  });

  it("rejects whitespace-only task", () => {
    const result = validateFusionDispatch({
      task: "   \n  ",
      dispatches: [{ agent_name: "klotho", vak_address: buildMoiraiVak(MOIRAI_HOST_CF.klotho) }],
    });
    assert.equal(result.ok, false);
  });

  it("rejects empty dispatches", () => {
    const result = validateFusionDispatch({
      task: "x",
      dispatches: [],
    });
    assert.equal(result.ok, false);
    assert.match(result.error!, /at least one entry/i);
  });

  it("accepts dialogical Moirai entry (CPF (00/00) bypasses canonical enforcement)", () => {
    // Per CPF_DIALOGICAL contract: (00/00) cpf bypasses canonical enforcement
    const result = validateFusionDispatch({
      task: "open rehear test",
      dispatches: [
        {
          agent_name: "klotho",
          vak_address: { ...buildMoiraiVak(MOIRAI_HOST_CF.klotho), cpf: "(00/00)" } as any,
        },
      ],
    });
    assert.equal(result.ok, true);
  });

  it("accepts the _cfp3_fusion sentinel pattern (synthetic agent name with shared vak)", () => {
    const sharedVak = buildMoiraiVak("(0/1/2)");
    const result = validateFusionDispatch({
      task: "fusion across agents",
      dispatches: [
        { agent_name: "_cfp3_fusion", vak_address: sharedVak },
      ],
    });
    assert.equal(result.ok, true);
  });
});

describe("MOIRAI_HOST_CF", () => {
  it("maps each Moirai to its host constitutional CF", () => {
    assert.equal(MOIRAI_HOST_CF.klotho, "(0/1/2)");
    assert.equal(MOIRAI_HOST_CF.lachesis, "(4.0/1-4.4/5)");
    assert.equal(MOIRAI_HOST_CF.atropos, "(5/0)");
  });
});

describe("buildMoiraiVak", () => {
  it("produces a canonical CFP3 Night' VAK with the supplied cf", () => {
    const vak = buildMoiraiVak("(0/1/2)");
    assert.equal(vak.cpf, "(4.0/1-4.4/5)");
    assert.deepEqual(vak.ct, ["CT5"]);
    assert.equal(vak.cp, "CP4.5");
    assert.equal(vak.cf, "(0/1/2)");
    assert.equal(vak.cfp, "CFP3");
    assert.deepEqual(vak.cs, { code: "CS0", direction: "Night'" });
  });
});
