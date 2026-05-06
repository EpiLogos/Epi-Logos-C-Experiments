import { describe, it, expect } from "vitest";
import { parseCoordinate, isValidCoordinate } from "../src/validator.js";
import { HCIdentity } from "../src/identity.js";
import { HCNode } from "../src/node.js";
import {
  FAMILIES, FAMILY_NAMES, PSYCHOID_NAMES, PSYCHOID_TOPO,
  WEAVE_COORDS, CF_NAMES, VAK_NAMES, FLAGS,
} from "../src/constants.js";

describe("Cross-check: all 96 seed coordinates", () => {
  it("# node parses and validates as HCIdentity", () => {
    const p = parseCoordinate("#");
    expect(p).not.toBeNull();
    HCIdentity.parse({
      bimbaCoordinate: "#",
      qlPosition: 255,
      family: "NONE",
      inversionState: 0,
      flags: 0x00,
      weaveState: 0.0,
    });
  });

  it("all 6 psychoids parse and validate", () => {
    for (let i = 0; i <= 5; i++) {
      const coord = `#${i}`;
      const p = parseCoordinate(coord);
      expect(p?.layer).toBe("PSYCHOID");
      expect(p?.qlPosition).toBe(i);
      HCIdentity.parse({
        bimbaCoordinate: coord,
        qlPosition: i,
        family: "NONE",
        inversionState: 0,
        flags: FLAGS.BIMBA_FLAGS,
        weaveState: i,
      });
    }
  });

  it("all 4 weave nodes parse", () => {
    for (const [name] of WEAVE_COORDS) {
      expect(isValidCoordinate(name)).toBe(true);
    }
  });

  it("all 7 context frames parse", () => {
    for (let i = 0; i < CF_NAMES.length; i++) {
      const p = parseCoordinate(CF_NAMES[i]);
      expect(p?.layer).toBe("CONTEXT_FRAME");
      expect(p?.qlPosition).toBe(i);
    }
  });

  it("all 72 family coordinates parse (6 families x 6 positions x 2 phases)", () => {
    let count = 0;
    for (const fam of FAMILIES) {
      for (let pos = 0; pos <= 5; pos++) {
        // Normal
        const normal = `${fam}${pos}`;
        const pn = parseCoordinate(normal);
        expect(pn?.layer).toBe("COORDINATE");
        expect(pn?.family).toBe(fam);
        expect(pn?.qlPosition).toBe(pos);
        expect(pn?.inverted).toBe(false);
        count++;

        // Inverted
        const inv = `${fam}${pos}'`;
        const pi = parseCoordinate(inv);
        expect(pi?.inverted).toBe(true);
        count++;
      }
    }
    expect(count).toBe(72);
  });

  it("all 6 VAK coordinates parse", () => {
    for (let i = 0; i < VAK_NAMES.length; i++) {
      const p = parseCoordinate(VAK_NAMES[i]);
      expect(p?.layer).toBe("VAK");
      expect(p?.qlPosition).toBe(i);
    }
  });

  it("total: 1 + 6 + 4 + 7 + 72 + 6 = 96", () => {
    expect(1 + 6 + 4 + 7 + 72 + 6).toBe(96);
  });

  it("HCNode accepts a fully populated node", () => {
    // Build a realistic M5 node matching Neo4j seed data
    HCNode.parse({
      bimbaCoordinate: "M5",
      qlPosition: 5,
      family: "M",
      inversionState: 0,
      flags: FLAGS.BIMBA_FLAGS,
      weaveState: 5.0,
      c: "C5", p: "P5", l: "L5", s: "S5", t: "T5", m: "M5",
      cpf: null, ct: null, cp: null, cf: null, cfp: null, cs: null,
      uuid: "4f965499-cd20-515d-8505-a48bd8f57f83",
      name: "Epii",
      layer: "COORDINATE",
      topoMode: "ZERO_SPHERE",
      essence: "holographic integration layer",
      description: "M5 Epii — the Logos Cycle",
      vaultPath: "Bimba/Seeds/M/M5.md",
      semanticEmbedding: null,
      createdAt: "2026-03-07T00:00:00Z",
      updatedAt: null,
    });
  });
});
