import { describe, it, expect } from "vitest";
import { HCIdentity } from "../src/identity.js";

describe("HCIdentity (Ring 1)", () => {
  it("accepts a valid psychoid identity", () => {
    const result = HCIdentity.parse({
      bimbaCoordinate: "#4",
      qlPosition: 4,
      family: "NONE",
      inversionState: 0,
      flags: 0x21,
      weaveState: 4.0,
    });
    expect(result.bimbaCoordinate).toBe("#4");
    expect(result.family).toBe("NONE");
  });

  it("accepts the # node (qlPosition 255)", () => {
    const result = HCIdentity.parse({
      bimbaCoordinate: "#",
      qlPosition: 255,
      family: "NONE",
      inversionState: 0,
      flags: 0x00,
      weaveState: 0.0,
    });
    expect(result.qlPosition).toBe(255);
  });

  it("accepts a family coordinate", () => {
    const result = HCIdentity.parse({
      bimbaCoordinate: "M5",
      qlPosition: 5,
      family: "M",
      inversionState: 0,
      flags: 0x21,
      weaveState: 5.0,
    });
    expect(result.family).toBe("M");
  });

  it("accepts an inverted coordinate", () => {
    const result = HCIdentity.parse({
      bimbaCoordinate: "C0'",
      qlPosition: 0,
      family: "C",
      inversionState: 1,
      flags: 0x21,
      weaveState: 0.0,
    });
    expect(result.inversionState).toBe(1);
  });

  it("rejects qlPosition > 5 (except 255)", () => {
    expect(() =>
      HCIdentity.parse({
        bimbaCoordinate: "#9",
        qlPosition: 9,
        family: "NONE",
        inversionState: 0,
        flags: 0,
        weaveState: 0,
      })
    ).toThrow();
  });

  it("rejects invalid family", () => {
    expect(() =>
      HCIdentity.parse({
        bimbaCoordinate: "Z0",
        qlPosition: 0,
        family: "Z",
        inversionState: 0,
        flags: 0,
        weaveState: 0,
      })
    ).toThrow();
  });

  it("rejects inversionState > 1", () => {
    expect(() =>
      HCIdentity.parse({
        bimbaCoordinate: "C0",
        qlPosition: 0,
        family: "C",
        inversionState: 2,
        flags: 0,
        weaveState: 0,
      })
    ).toThrow();
  });
});
