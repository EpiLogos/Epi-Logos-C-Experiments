// Coordinate: S0 kernel-bridge lens-field wire schema proof.
// Residency: Body/S/S0/epi-cli/schemas/tests.
// Position (#n): #3 process / wire verification.
// Actualises: the `kernelBridge.m3.lensField(lensId)` Zod contract — generic
//             structure/activation shape, parity-topology refinement, and the
//             pleroma-only symbolic-system discipline. Kernel laws are proven
//             Rust-side (lens_field_generic_laws.rs); this proves the wire gate.
// Public surface: test module only.
// Does NOT own: the kernel laws or the runtime assembly.
// Contract: [[M3'-SPEC]] / 02-16-lenses "Generic Lens-Field Dynamic".

import { describe, expect, it } from "vitest";
import { LensFieldProjection } from "../src/kernel-bridge";

const ELEMENT_CYCLE = ["fire", "earth", "air", "water"] as const;

function segmentElement(slice: number, segment: number) {
  const midpoint720 = ((2 * segment + 1) * slice) % 720;
  const sign = Math.floor(midpoint720 / 60) % 12;
  return ELEMENT_CYCLE[sign % 4];
}

function structureFor(lensId: number, slice: number, sections: number) {
  const topology =
    sections === 1
      ? { kind: "self-opposed" as const }
      : sections % 2 === 0
        ? { kind: "diameter-paired" as const, channels: sections / 2 }
        : { kind: "boundary-opposed" as const };
  return {
    lensId,
    groundingLensId: 16 as const,
    slice,
    sections,
    topology,
    groundQuantization:
      slice % 6 === 0
        ? { kind: "integral" as const, stepsPerSegment: slice / 6 }
        : { kind: "fractional" as const },
    segments: Array.from({ length: sections }, (_, segment) => ({
      segment,
      startDegree: segment * slice,
      midpoint720: ((2 * segment + 1) * slice) % 720,
      element: segmentElement(slice, segment),
    })),
  };
}

function emptyActivation(lensId: number, channels: number, slice: number) {
  return {
    lensId,
    positionedOrbiters: 0,
    weightsTotal: { fire: 0, water: 0, air: 0, earth: 0 },
    landings: [],
    channelBalances: Array.from({ length: channels }, (_, channel) => ({
      channel,
      priorSegment: channel,
      consortSegment: channel + channels,
      priorElement: segmentElement(slice, channel),
      consortElement: segmentElement(slice, channel + channels),
      signedBalance: 0,
    })),
    akashaPresence: 0,
    akashaEpsilon: 0.05,
    akashaCondition: null,
  };
}

const ARCS_BY_SYZYGY = [
  "ogdoad",
  "ogdoad",
  "ogdoad",
  "ogdoad",
  "decad",
  "decad",
  "decad",
  "decad",
  "decad",
  "dodecad",
  "dodecad",
  "dodecad",
  "dodecad",
  "dodecad",
  "dodecad",
] as const;

const INTERLEAVED_456 = [0, 4, 7, 12, 2, 5, 8, 11, 14, 1, 3, 6, 9, 10, 13];

function pleromaSystem() {
  const seats = Array.from({ length: 30 }, (_, segment) => {
    const diameter = segment % 15;
    const syzygy = INTERLEAVED_456.indexOf(diameter);
    return {
      segment,
      aeon: `Aeon${segment}`,
      meaning: "Meaning",
      emanationIndex: syzygy * 2 + (segment < 15 ? 1 : 2),
      arc: ARCS_BY_SYZYGY[syzygy],
      syzygy,
      prior: segment < 15,
      element: segmentElement(12, segment),
      fibonacciPositions: [2 * segment, 2 * segment + 1] as [number, number],
      fibonacciDigits: [0, 1] as [number, number],
    };
  });
  const syzygies = Array.from({ length: 15 }, (_, syzygy) => {
    const diameter = INTERLEAVED_456[syzygy];
    const threshold = diameter === 0 || diameter === 7;
    return {
      syzygy,
      diameter,
      arc: ARCS_BY_SYZYGY[syzygy],
      priorAeon: `Aeon${diameter}`,
      consortAeon: `Aeon${diameter + 15}`,
      priorElement: segmentElement(12, diameter),
      consortElement: segmentElement(12, diameter + 15),
      digitSum: threshold ? 10 : 20,
      threshold,
    };
  });
  return {
    kind: "pleroma" as const,
    layout: "interleaved456" as const,
    seats,
    syzygies,
  };
}

function packet(lensId: number, slice: number, sections: number) {
  const channels = sections > 1 && sections % 2 === 0 ? sections / 2 : 0;
  return {
    contract: "kernelBridge.m3.lensField(lensId)" as const,
    runtimeOwner: "S0/S0' kernel-bridge runtime",
    source: "kernel-bridge",
    lensId,
    structure: structureFor(lensId, slice, sections),
    activation: emptyActivation(lensId, channels, slice),
    balanceQuaternion: [1, 0, 0, 0] as [number, number, number, number],
    symbolicSystem: lensId === 6 ? pleromaSystem() : null,
  };
}

describe("kernelBridge.m3.lensField wire contract", () => {
  it("parses the pleromatic lens-6 packet with its 30/15 symbolic system", () => {
    const parsed = LensFieldProjection.parse(packet(6, 12, 30));
    expect(parsed.symbolicSystem?.seats).toHaveLength(30);
    expect(parsed.symbolicSystem?.syzygies).toHaveLength(15);
    expect(
      parsed.symbolicSystem?.syzygies.filter((s) => s.threshold),
    ).toHaveLength(2);
  });

  it("parses generic lenses without a symbolic system, across parity shapes", () => {
    expect(() => LensFieldProjection.parse(packet(9, 30, 12))).not.toThrow();
    expect(() => LensFieldProjection.parse(packet(11, 40, 9))).not.toThrow();
    expect(() => LensFieldProjection.parse(packet(15, 360, 1))).not.toThrow();
    expect(() => LensFieldProjection.parse(packet(16, 6, 60))).not.toThrow();
  });

  it("refuses a symbolic system seated anywhere but lens 6", () => {
    const drifted = { ...packet(9, 30, 12), symbolicSystem: pleromaSystem() };
    expect(() => LensFieldProjection.parse(drifted)).toThrow();
  });

  it("refuses a lens-6 packet whose symbolic system is missing", () => {
    const missing = { ...packet(6, 12, 30), symbolicSystem: null };
    expect(() => LensFieldProjection.parse(missing)).toThrow();
  });

  it("refuses a broken syzygy digit decomposition (280 law)", () => {
    const system = pleromaSystem();
    system.syzygies[3] = { ...system.syzygies[3], digitSum: 12 };
    const broken = { ...packet(6, 12, 30), symbolicSystem: system };
    expect(() => LensFieldProjection.parse(broken)).toThrow();
  });

  it("refuses mismatched parity topology", () => {
    const base = packet(9, 30, 12);
    const wrongTopology = {
      ...base,
      structure: { ...base.structure, topology: { kind: "boundary-opposed" as const } },
    };
    expect(() => LensFieldProjection.parse(wrongTopology)).toThrow();
  });
});
