import { describe, it, expect } from "vitest";
import { HCNode } from "../src/node.js";

describe("HCNode (Ring 3)", () => {
  const validNode = {
    bimbaCoordinate: "#4",
    qlPosition: 4,
    family: "NONE",
    inversionState: 0,
    flags: 0x21,
    weaveState: 4.0,
    c: null, p: null, l: null, s: null, t: null, m: null,
    cpf: null, ct: null, cp: null, cf: null, cfp: null, cs: null,
    uuid: "e9110605-0000-5000-8000-000000000001",
    name: "Context",
    layer: "PSYCHOID",
    topoMode: "LEMNISCATE",
    essence: null,
    description: null,
    vaultPath: null,
    semanticEmbedding: null,
    createdAt: null,
    updatedAt: null,
  };

  it("accepts a complete node", () => {
    const result = HCNode.parse(validNode);
    expect(result.uuid).toBe("e9110605-0000-5000-8000-000000000001");
    expect(result.layer).toBe("PSYCHOID");
    expect(result.topoMode).toBe("LEMNISCATE");
  });

  it("accepts node with essence and description", () => {
    const result = HCNode.parse({
      ...validNode,
      bimbaCoordinate: "#",
      qlPosition: 255,
      essence: "Prakasa-Vimarsa-Maya",
      description: "The non-dual ground",
      topoMode: "KLEIN",
    });
    expect(result.essence).toBe("Prakasa-Vimarsa-Maya");
  });

  it("accepts node with embedding vector", () => {
    const vec = new Array(768).fill(0.1);
    const result = HCNode.parse({ ...validNode, semanticEmbedding: vec });
    expect(result.semanticEmbedding?.length).toBe(768);
  });

  it("accepts node with vault path and timestamps", () => {
    const result = HCNode.parse({
      ...validNode,
      vaultPath: "Bimba/Seeds/M/M4.md",
      createdAt: "2026-03-07T12:00:00Z",
      updatedAt: "2026-03-07T13:00:00Z",
    });
    expect(result.vaultPath).toBe("Bimba/Seeds/M/M4.md");
  });

  it("rejects invalid layer", () => {
    expect(() => HCNode.parse({ ...validNode, layer: "INVALID" })).toThrow();
  });

  it("rejects invalid topoMode", () => {
    expect(() => HCNode.parse({ ...validNode, topoMode: "SPHERE" })).toThrow();
  });
});
