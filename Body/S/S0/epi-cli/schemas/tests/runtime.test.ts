import { describe, it, expect } from "vitest";
import { HCRuntime, HCPayload } from "../src/runtime.js";

const baseNode = {
  bimbaCoordinate: "M5",
  qlPosition: 5,
  family: "M",
  inversionState: 0,
  flags: 0x21,
  weaveState: 5.0,
  c: null, p: null, l: null, s: null, t: null, m: null,
  cpf: null, ct: null, cp: null, cf: null, cfp: null, cs: null,
  uuid: "4f965499-cd20-515d-8505-a48bd8f57f83",
  name: "Epii",
  layer: "COORDINATE" as const,
  topoMode: "ZERO_SPHERE" as const,
  essence: null,
  description: null,
  vaultPath: null,
  semanticEmbedding: null,
  createdAt: null,
  updatedAt: null,
};

describe("HCRuntime (Ring 4)", () => {
  it("accepts runtime with meaning payload", () => {
    const result = HCRuntime.parse({
      ...baseNode,
      contextFrame: "CF_MOBIUS",
      disclosureLevel: "Complete",
      mode: "day",
      sessionId: "session-123",
      payload: { type: "meaning", value: "holographic integration layer" },
    });
    expect(result.contextFrame).toBe("CF_MOBIUS");
    expect(result.payload?.type).toBe("meaning");
  });

  it("accepts runtime with process payload", () => {
    const result = HCRuntime.parse({
      ...baseNode,
      contextFrame: null,
      disclosureLevel: "Identity",
      mode: "night",
      sessionId: null,
      payload: { type: "process", value: { state: "active", tick: 7 } },
    });
    expect(result.payload?.type).toBe("process");
  });

  it("accepts runtime with null payload", () => {
    const result = HCRuntime.parse({
      ...baseNode,
      contextFrame: null,
      disclosureLevel: "UuidOnly",
      mode: "day",
      sessionId: null,
      payload: null,
    });
    expect(result.payload).toBeNull();
  });

  it("rejects invalid mode", () => {
    expect(() =>
      HCRuntime.parse({
        ...baseNode,
        contextFrame: null,
        disclosureLevel: "UuidOnly",
        mode: "twilight",
        sessionId: null,
        payload: null,
      })
    ).toThrow();
  });

  it("rejects invalid disclosure level", () => {
    expect(() =>
      HCRuntime.parse({
        ...baseNode,
        contextFrame: null,
        disclosureLevel: "Everything",
        mode: "day",
        sessionId: null,
        payload: null,
      })
    ).toThrow();
  });
});

describe("HCPayload", () => {
  it("validates meaning payload", () => {
    expect(HCPayload.parse({ type: "meaning", value: "test" })).toEqual({
      type: "meaning", value: "test",
    });
  });

  it("validates instance payload", () => {
    expect(HCPayload.parse({ type: "instance", value: "uuid-123" })).toEqual({
      type: "instance", value: "uuid-123",
    });
  });

  it("validates vector payload", () => {
    const vec = [0.1, 0.2, 0.3];
    expect(HCPayload.parse({ type: "vector", value: vec })).toEqual({
      type: "vector", value: vec,
    });
  });

  it("rejects unknown payload type", () => {
    expect(() => HCPayload.parse({ type: "unknown", value: "x" })).toThrow();
  });
});
