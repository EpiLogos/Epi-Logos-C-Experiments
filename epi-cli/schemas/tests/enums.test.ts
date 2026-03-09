import { describe, it, expect } from "vitest";
import {
  CoordFamily, CoordLayer, TopoMode, ContextFrame,
  DisclosureLevel, VakCoord,
} from "../src/enums.js";
import {
  FAMILIES, FAMILY_NAMES, PSYCHOID_NAMES, PSYCHOID_TOPO,
  WEAVE_COORDS, CF_NAMES, VAK_NAMES,
} from "../src/constants.js";

describe("CoordFamily", () => {
  it("accepts all 7 values", () => {
    for (const f of ["C", "P", "L", "S", "T", "M", "NONE"]) {
      expect(CoordFamily.parse(f)).toBe(f);
    }
  });
  it("rejects invalid", () => {
    expect(() => CoordFamily.parse("Z")).toThrow();
  });
});

describe("CoordLayer", () => {
  it("accepts all 5 layers", () => {
    for (const l of ["PSYCHOID", "WEAVE", "CONTEXT_FRAME", "COORDINATE", "VAK"]) {
      expect(CoordLayer.parse(l)).toBe(l);
    }
  });
});

describe("TopoMode", () => {
  it("accepts all 4 modes", () => {
    for (const t of ["ZERO_SPHERE", "TORUS", "LEMNISCATE", "KLEIN"]) {
      expect(TopoMode.parse(t)).toBe(t);
    }
  });
});

describe("ContextFrame", () => {
  it("accepts all 7 frames", () => {
    for (const cf of ["CF_VOID", "CF_BINARY", "CF_TRIKA", "CF_QUATERNAL", "CF_FRACTAL", "CF_SYNTHESIS", "CF_MOBIUS"]) {
      expect(ContextFrame.parse(cf)).toBe(cf);
    }
  });
});

describe("DisclosureLevel", () => {
  it("accepts all 6 levels", () => {
    for (const d of ["UuidOnly", "Identity", "Summary", "Content", "Connected", "Complete"]) {
      expect(DisclosureLevel.parse(d)).toBe(d);
    }
  });
});

describe("VakCoord", () => {
  it("accepts all 6 VAK", () => {
    for (const v of ["CPF", "CT", "CP", "CF", "CFP", "CS"]) {
      expect(VakCoord.parse(v)).toBe(v);
    }
  });
});

describe("Constants", () => {
  it("FAMILIES has 6 entries matching C struct order", () => {
    expect(FAMILIES).toEqual(["C", "P", "L", "S", "T", "M"]);
  });

  it("FAMILY_NAMES has 6×6 entries", () => {
    expect(FAMILY_NAMES.length).toBe(6);
    for (const names of FAMILY_NAMES) {
      expect(names.length).toBe(6);
    }
  });

  it("PSYCHOID_NAMES matches seed.rs", () => {
    expect(PSYCHOID_NAMES).toEqual([
      "Ground", "Form", "Operation", "Pattern", "Context", "Integration",
    ]);
  });

  it("PSYCHOID_TOPO matches seed.rs", () => {
    expect(PSYCHOID_TOPO).toEqual([
      "ZERO_SPHERE", "TORUS", "TORUS", "TORUS", "LEMNISCATE", "ZERO_SPHERE",
    ]);
  });

  it("WEAVE_COORDS has 4 entries", () => {
    expect(WEAVE_COORDS).toEqual([
      ["Weave_0_0", 0.0],
      ["Weave_0_5", 0.5],
      ["Weave_5_0", 5.0],
      ["Weave_5_5", 5.5],
    ]);
  });

  it("CF_NAMES has 7 entries", () => {
    expect(CF_NAMES).toEqual([
      "CF_VOID", "CF_BINARY", "CF_TRIKA", "CF_QUATERNAL",
      "CF_FRACTAL", "CF_SYNTHESIS", "CF_MOBIUS",
    ]);
  });

  it("VAK_NAMES has 6 entries", () => {
    expect(VAK_NAMES).toEqual(["CPF", "CT", "CP", "CF", "CFP", "CS"]);
  });
});
