import { describe, it, expect } from "vitest";
import { HCCoordinate } from "../src/coordinate.js";

describe("HCCoordinate (Ring 2)", () => {
  it("accepts identity + 12 pointer web fields", () => {
    const result = HCCoordinate.parse({
      bimbaCoordinate: "M4",
      qlPosition: 4,
      family: "M",
      inversionState: 0,
      flags: 0x21,
      weaveState: 4.0,
      // 6 base family links
      c: "C4", p: "P4", l: "L4", s: "S4", t: "T4", m: "M4",
      // 6 reflective links
      cpf: null, ct: null, cp: null, cf: "CF_FRACTAL", cfp: null, cs: null,
    });
    expect(result.c).toBe("C4");
    expect(result.cf).toBe("CF_FRACTAL");
    expect(result.cpf).toBeNull();
  });

  it("allows all pointer fields to be null", () => {
    const result = HCCoordinate.parse({
      bimbaCoordinate: "#",
      qlPosition: 255,
      family: "NONE",
      inversionState: 0,
      flags: 0,
      weaveState: 0,
      c: null, p: null, l: null, s: null, t: null, m: null,
      cpf: null, ct: null, cp: null, cf: null, cfp: null, cs: null,
    });
    expect(result.c).toBeNull();
  });

  it("extends HCIdentity — identity fields still validated", () => {
    expect(() =>
      HCCoordinate.parse({
        bimbaCoordinate: "X9",
        qlPosition: 9,
        family: "X",
        inversionState: 0,
        flags: 0,
        weaveState: 0,
        c: null, p: null, l: null, s: null, t: null, m: null,
        cpf: null, ct: null, cp: null, cf: null, cfp: null, cs: null,
      })
    ).toThrow();
  });
});
