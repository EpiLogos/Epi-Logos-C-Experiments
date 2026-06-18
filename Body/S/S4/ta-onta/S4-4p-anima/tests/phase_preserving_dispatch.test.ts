import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import {
  validateDispatchParams,
  type CoordinateEmission,
} from "../modules/dispatch-validate.ts";
import type { VakAddress } from "../../shared/vak_address.ts";

const vak: VakAddress = {
  cpf: "(4.0/1-4.4/5)",
  ct: ["CT2"],
  cp: "CP4.2",
  cf: "(0/1/2)",
  cfp: "CFP0",
  cs: { code: "CS2", direction: "Day" },
};

describe("Anuttara-PI phase-preserving emission discipline", () => {
  it("refuses collapsed inverse coordinates with a typed query", () => {
    const coordinate_emission: CoordinateEmission = {
      source_coordinate: "C3'",
      emitted_coordinate: "C3",
      law_surface: "full-7-laws",
    };
    const result = validateDispatchParams({
      agent_name: "eros",
      task: "emit Anuttara trace",
      vak_address: vak,
      coordinate_emission,
    });

    assert.equal(result.ok, false);
    assert.match(result.error ?? "", /phase-erasing/i);
    assert.equal(result.typed_query?.surface, "full-7-laws");
    assert.equal(result.typed_query?.source_coordinate, "C3'");
    assert.equal(result.typed_query?.emitted_coordinate, "C3");
    assert.equal(result.typed_query?.query, "preserve_coordinate_phase");
  });

  it("accepts phase-qualified emissions that keep the same coordinate phase", () => {
    const result = validateDispatchParams({
      agent_name: "eros",
      task: "emit Anuttara trace",
      vak_address: vak,
      coordinate_emission: {
        source_coordinate: "q_5_i_integration_template",
        emitted_coordinate: "q_5_i_integration_template",
        law_surface: "full-7-laws",
      },
    });

    assert.equal(result.ok, true);
  });
});
