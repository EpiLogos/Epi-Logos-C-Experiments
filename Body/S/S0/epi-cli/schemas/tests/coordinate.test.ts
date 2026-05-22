import { describe, it, expect } from "vitest";
import { HCBedrockWeb7, HCCoordinate, HCContextFrameWeb7, HCPointerWeb36 } from "../src/coordinate.js";

describe("HCCoordinate (Ring 2)", () => {
  it("accepts identity + 12 pointer web fields", () => {
    const result = HCCoordinate.parse({
      coordinate: "M4",
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
      coordinate: "#",
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

describe("HCBedrockWeb7", () => {
  it("accepts hash plus six raw psychoid positions and their kernel relations", () => {
    const psychoid = Array.from({ length: 6 }, (_, index) => ({
      target: `#${index}`,
      index,
      qlPosition: index,
      bedrockRole: "psychoid_number",
      relationRole: "position_identity",
      intervalRole: "none",
      ratioRole: "unison",
      pitchClass: (2 * index) % 12,
    }));

    const result = HCBedrockWeb7.parse({
      hash: {
        target: "#",
        index: 0,
        qlPosition: 255,
        bedrockRole: "hash_operator",
        relationRole: "inversion_spanda",
        intervalRole: "semitone",
        ratioRole: "none",
        pitchClass: 0,
      },
      psychoid,
      successor: psychoid.map((entry, index) => ({
        ...entry,
        target: index === 5 ? "#0" : `#${index + 1}`,
        qlPosition: index === 5 ? 0 : index + 1,
        relationRole: index === 5 ? "mobius_return" : "epogdoon_tick",
        intervalRole: index === 5 ? "octave" : "whole_tone",
        ratioRole: index === 5 ? "octave" : "epogdoon",
      })),
      inversion: psychoid.map((entry, index) => ({
        ...entry,
        target: `#${index}`,
        bedrockRole: "inverted_psychoid",
        relationRole: "inversion_spanda",
        intervalRole: "semitone",
        ratioRole: "none",
        pitchClass: (2 * index + 1) % 12,
      })),
    });

    expect(result.hash.qlPosition).toBe(255);
    expect(result.psychoid).toHaveLength(6);
    expect(result.successor[5].relationRole).toBe("mobius_return");
    expect(result.inversion[2].pitchClass).toBe(5);
  });
});

describe("HCPointerWeb36", () => {
  const ref = {
    target: "M2",
    ring: "position",
    index: 2,
    qlPosition: 2,
    helix: "bimba",
    relationRole: "position_identity",
    intervalRole: "none",
    ratioRole: "unison",
    pitchClass: 4,
  } as const;

  it("accepts exactly three 12-slot harmonic pointer rings", () => {
    const ring = Array.from({ length: 12 }, (_, index) => ({
      ...ref,
      index,
      target: index < 6 ? `M${index}` : `M${index - 6}'`,
      helix: index < 6 ? "bimba" : "pratibimba",
      qlPosition: index % 6,
      relationRole: index < 6 ? "position_project" : "inversion_spanda",
      intervalRole: index < 6 ? "none" : "semitone",
      ratioRole: index < 6 ? "none" : "none",
      pitchClass: index < 6 ? (2 * index) % 12 : (2 * (index - 6) + 1) % 12,
    }));

    const result = HCPointerWeb36.parse({
      family: ring.map((entry) => ({ ...entry, ring: "family", relationRole: "family_link" })),
      position: ring,
      lens: ring.map((entry) => ({ ...entry, ring: "lens", relationRole: entry.index < 6 ? "lens_anchor" : "inversion_spanda" })),
    });

    expect(result.family).toHaveLength(12);
    expect(result.position).toHaveLength(12);
    expect(result.lens).toHaveLength(12);
    expect(result.position[8].relationRole).toBe("inversion_spanda");
  });

  it("rejects a 36-web with a missing slot", () => {
    const shortRing = Array.from({ length: 11 }, (_, index) => ({ ...ref, index }));
    expect(() =>
      HCPointerWeb36.parse({
        family: shortRing,
        position: shortRing,
        lens: shortRing,
      })
    ).toThrow();
  });
});

describe("HCContextFrameWeb7", () => {
  it("accepts seven diatonic context-frame overlay entries", () => {
    const result = HCContextFrameWeb7.parse({
      frame: [
        ["(00/00)", 0, 1, 0, "bimba", 0],
        ["(0/1)", 1, 2, 1, "bimba", 2],
        ["(0/1/2)", 2, 3, 2, "bimba", 4],
        ["(0/1/2/3)", 3, 4, 2, "pratibimba", 5],
        ["(4.0/1-4.4/5)", 4, 5, 3, "pratibimba", 7],
        ["(4.5/0)", 5, 6, 4, "pratibimba", 9],
        ["(5/0)", 6, 7, 5, "pratibimba", 11],
      ].map(([notation, cfIndex, diatonicDegree, qlPosition, helix, pitchClass]) => ({
        target: `CF${cfIndex}`,
        cfIndex,
        notation,
        diatonicDegree,
        modeAnchor: cfIndex,
        qlPosition,
        helix,
        relationRole: "context_frame",
        pitchClass,
      })),
    });

    expect(result.frame).toHaveLength(7);
    expect(result.frame[4].notation).toBe("(4.0/1-4.4/5)");
    expect(result.frame[6].pitchClass).toBe(11);
  });
});
