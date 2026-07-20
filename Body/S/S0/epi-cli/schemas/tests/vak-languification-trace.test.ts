// Coordinate: S0/M0 VAK languification wire-law proof.
// Residency: Body/S/S0/epi-cli/schemas/tests.
// Position (#n): strict TypeScript schema verification boundary.
// Actualises: 36.T36.8 cross-field descent invariants.
// Public surface: Vitest schema suite.
// Does NOT own: Rust derivation or profile transport.
// Contract: [[S0-SPEC]] / [[M0'-SPEC]].

import { describe, expect, it } from "vitest";
import {
  ProfileVakAddress,
  VakLanguificationTrace,
} from "../src/kernel-bridge.js";

const terminal = {
  cpfNotation: "(4.0/1-4.4/5)",
  cfNotation: "(5/0)",
  m0Address: "M0-5",
  vakLevel: "vaikhari",
  diatonicDegree: 0,
  modeTonicCf: "(5/0)",
  resonance72Index: 71,
  halfDecanIndex: 35,
  biasWeightsEmpty: false,
  recognitionClosed: true,
  provenance: ["s4.vak.evaluate", "m0.vak_cf"],
} as const;

describe("VakLanguificationTrace semantic contract", () => {
  it("strict-parses the lowercase Rust profile VAK correlate", () => {
    expect(
      ProfileVakAddress.parse({
        cpf: "(4.0/1-4.4/5)",
        ct: ["CT5"],
        cp: "CP4.5",
        cf: "(5/0)",
        cfp: "CFP5",
        cs: { code: "CS5", direction: "Night'", recognized: true },
      }),
    ).toMatchObject({ cf: "(5/0)", cs: { recognized: true } });
  });

  it("accepts a coherent recognized Vaikhari closure", () => {
    expect(VakLanguificationTrace.parse(terminal)).toEqual(terminal);
  });

  it("rejects address, half-decan, and recognition drift", () => {
    expect(() =>
      VakLanguificationTrace.parse({ ...terminal, m0Address: "M0-4" }),
    ).toThrow();
    expect(() =>
      VakLanguificationTrace.parse({ ...terminal, halfDecanIndex: 34 }),
    ).toThrow();
    expect(() =>
      VakLanguificationTrace.parse({
        ...terminal,
        recognitionClosed: false,
      }),
    ).toThrow();
  });

  it("requires dialogical empty-bias traces to remain Para", () => {
    expect(() =>
      VakLanguificationTrace.parse({
        ...terminal,
        cpfNotation: "(00/00)",
        cfNotation: "(0/1)",
        m0Address: "M0-1/M0-3/M0-4/M0-5:(0/1)",
        vakLevel: "pashyanti",
        biasWeightsEmpty: true,
        recognitionClosed: false,
      }),
    ).toThrow();
  });
});
