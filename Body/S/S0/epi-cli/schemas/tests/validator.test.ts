import { describe, it, expect } from "vitest";
import { parseCoordinate, isValidCoordinate, BimbaCoordinate } from "../src/validator.js";

describe("parseCoordinate", () => {
  it("parses # (hash)", () => {
    const r = parseCoordinate("#");
    expect(r).toEqual({ bimbaCoordinate: "#", layer: "PSYCHOID", family: null, qlPosition: null, inverted: false });
  });

  it("parses psychoids #0-#5", () => {
    for (let i = 0; i <= 5; i++) {
      const r = parseCoordinate(`#${i}`);
      expect(r?.layer).toBe("PSYCHOID");
      expect(r?.qlPosition).toBe(i);
    }
  });

  it("parses weave coords", () => {
    const r = parseCoordinate("Weave_0_5");
    expect(r?.layer).toBe("WEAVE");
  });

  it("parses context frames", () => {
    const r = parseCoordinate("CF_TRIKA");
    expect(r?.layer).toBe("CONTEXT_FRAME");
    expect(r?.qlPosition).toBe(2);
  });

  it("parses VAK coords", () => {
    const r = parseCoordinate("CPF");
    expect(r?.layer).toBe("VAK");
    expect(r?.qlPosition).toBe(0);
  });

  it("parses family coords", () => {
    const r = parseCoordinate("M4");
    expect(r?.layer).toBe("COORDINATE");
    expect(r?.family).toBe("M");
    expect(r?.qlPosition).toBe(4);
    expect(r?.inverted).toBe(false);
  });

  it("parses inverted family coords", () => {
    const r = parseCoordinate("C0'");
    expect(r?.layer).toBe("COORDINATE");
    expect(r?.family).toBe("C");
    expect(r?.qlPosition).toBe(0);
    expect(r?.inverted).toBe(true);
  });

  it("returns null for invalid input", () => {
    expect(parseCoordinate("")).toBeNull();
    expect(parseCoordinate("Z9")).toBeNull();
    expect(parseCoordinate("#9")).toBeNull();
    expect(parseCoordinate("CC")).toBeNull();
  });
});

describe("isValidCoordinate", () => {
  it("returns true for all 96 seed coordinates", () => {
    // # node
    expect(isValidCoordinate("#")).toBe(true);
    // Psychoids
    for (let i = 0; i <= 5; i++) expect(isValidCoordinate(`#${i}`)).toBe(true);
    // Weaves
    for (const w of ["Weave_0_0", "Weave_0_5", "Weave_5_0", "Weave_5_5"])
      expect(isValidCoordinate(w)).toBe(true);
    // CFs
    for (const cf of ["CF_VOID", "CF_BINARY", "CF_TRIKA", "CF_QUATERNAL", "CF_FRACTAL", "CF_SYNTHESIS", "CF_MOBIUS"])
      expect(isValidCoordinate(cf)).toBe(true);
    // Family coords (72)
    for (const f of ["C", "P", "L", "S", "T", "M"]) {
      for (let i = 0; i <= 5; i++) {
        expect(isValidCoordinate(`${f}${i}`)).toBe(true);
        expect(isValidCoordinate(`${f}${i}'`)).toBe(true);
      }
    }
    // VAK
    for (const v of ["CPF", "CT", "CP", "CF", "CFP", "CS"])
      expect(isValidCoordinate(v)).toBe(true);
  });
});

describe("BimbaCoordinate (Zod string)", () => {
  it("accepts valid coordinates", () => {
    expect(BimbaCoordinate.parse("#4")).toBe("#4");
    expect(BimbaCoordinate.parse("M5")).toBe("M5");
  });
  it("rejects invalid", () => {
    expect(() => BimbaCoordinate.parse("NOPE")).toThrow();
  });
});
