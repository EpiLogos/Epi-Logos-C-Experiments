/**
 * T12 hardening tests — the always-on profile projections typed 2026-07-06,
 * exercised against TWO real fixtures: the portal-core baseline profile and
 * a REAL captured gateway frame (fixtures/live-profile-projections.json,
 * extracted from plan.runs/wire-captures/2026-07-06T13-34-36-451Z).
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  AnandaVortexProjection,
  DepositionAnchorProjection,
  GatewayConnectChallengeEvent,
  GatewayHealthEvent,
  GatewayHeartbeatEvent,
  GatewayTickEvent,
  GraphAnchorProjection,
  KleinFlipEvent,
  MathemeBedrockProjection,
  MathemeContextFrameWebProjection,
  MathemeFutureAnchor,
  MathemeHarmonicGrammarProjection,
  MathemeHarmonicProfile,
  MathemeHarmonicProfileReadinessFact,
  MathemePointerAnchorProjection,
  QuintessenceProjection,
} from "../src/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "../../../../../..");
const baselineProfile = JSON.parse(
  readFileSync(
    resolve(
      repoRoot,
      "Body/S/S0/portal-core/contract-inventory/baseline-profile.json",
    ),
    "utf8",
  ),
);
const liveFields = JSON.parse(
  readFileSync(
    resolve(__dirname, "fixtures/live-profile-projections.json"),
    "utf8",
  ),
);

describe("T12 always-on profile projections (real wire fixtures)", () => {
  it("strict-parses every typed projection from the live capture", () => {
    expect(KleinFlipEvent.parse(liveFields.kleinFlip).kind).toBe(
      "m3CodonRotationCross",
    );
    expect(
      AnandaVortexProjection.parse(liveFields.anandaVortex).activeMatrixOp,
    ).toBe("sum");
    expect(
      MathemeHarmonicGrammarProjection.parse(liveFields.harmonicGrammar)
        .basePair,
    ).toBe("L2/L3");
    expect(
      MathemeBedrockProjection.parse(liveFields.bedrock).psychoidNumber,
    ).toBe(`#${liveFields.position6}`);
    expect(GraphAnchorProjection.parse(liveFields.graphHandle).axis).toBe(
      liveFields.helix,
    );
    expect(
      DepositionAnchorProjection.parse(liveFields.depositionAnchor)
        .resonance72Index,
    ).toBe(liveFields.resonance72.lensAnchorIndex);
    expect(MathemeFutureAnchor.parse(liveFields.s2Anchor).readiness).toBe(
      "cycle-2-s2-coordinate-anchor",
    );
    expect(MathemeFutureAnchor.parse(liveFields.s3Anchor).readiness).toBe(
      "cycle-2-s3-profile-observation-anchor",
    );
    expect(
      MathemePointerAnchorProjection.parse(liveFields.pointerAnchor)
        .qlPosition,
    ).toBe(liveFields.position6);
    expect(
      MathemeContextFrameWebProjection.parse(liveFields.contextFrames)
        .activeFrameIndex,
    ).toBe(liveFields.diatonic.degree - 1);
    for (const fact of liveFields.readinessLedger) {
      expect(MathemeHarmonicProfileReadinessFact.parse(fact).state).toBe(
        "authoritative",
      );
    }
    expect(
      QuintessenceProjection.parse(liveFields.quintessence).hashPreview,
    ).toMatch(/^[0-9a-f]{8}$/);
  });

  it("parses the whole baseline profile with the projections now REQUIRED-typed", () => {
    const parsed = MathemeHarmonicProfile.parse(baselineProfile);
    expect(parsed.anandaVortex?.activeCell).toEqual([0, 0]);
    expect(parsed.harmonicGrammar?.basePair).toBe("L0/L1");
    expect(parsed.bedrock.psychoidNumber).toBe("#0");
    expect(parsed.graphHandle.gdsOverlayState).toBe("blocked");
    expect(parsed.kleinFlip).toBeNull();
    expect(parsed.contextFrames.frameCount).toBe(7);
    expect(parsed.s2Anchor?.coordinate).toBe(parsed.graphHandle.canonicalForm);
  });

  it("parses a live-frame profile merged over the baseline (pratibimba tick)", () => {
    const merged = MathemeHarmonicProfile.parse({
      ...baselineProfile,
      ...Object.fromEntries(
        Object.entries(liveFields).filter(([key]) => key !== "capturedFrom"),
      ),
    });
    expect(merged.kleinFlip?.kind).toBe("m3CodonRotationCross");
    expect(merged.helix).toBe("pratibimba");
    expect(merged.quintessence?.layerCount).toBe(2);
  });

  it("rejects corrupted projections field-by-field", () => {
    // bedrock: psychoid number out of the #0-#5 alphabet
    expect(() =>
      MathemeBedrockProjection.parse({
        ...liveFields.bedrock,
        psychoidNumber: "#6",
      }),
    ).toThrow();
    // graphHandle: unknown gds overlay state
    expect(() =>
      GraphAnchorProjection.parse({
        ...liveFields.graphHandle,
        gdsOverlayState: "ready",
      }),
    ).toThrow();
    // depositionAnchor: resonance72 index past the 72-fold ring
    expect(() =>
      DepositionAnchorProjection.parse({
        ...liveFields.depositionAnchor,
        resonance72Index: 72,
      }),
    ).toThrow();
    // anandaVortex: cell address decoupled from active cell value
    expect(() =>
      AnandaVortexProjection.parse({
        ...liveFields.anandaVortex,
        activeCell: [0, 0],
      }),
    ).toThrow(/activeCell/);
    // kleinFlip: variant fields crossed between kinds
    expect(() =>
      KleinFlipEvent.parse({
        kind: "m1TritoneCrossing",
        codonBefore: 39,
        codonAfter: 45,
      }),
    ).toThrow();
    // readiness fact: camelCase keys are the WRONG casing for this struct
    expect(() =>
      MathemeHarmonicProfileReadinessFact.parse({
        field: "bedrock",
        state: "authoritative",
        bedrockLink: "kernel-matheme-bedrock-projection-v1",
        provenanceChain: "x",
      }),
    ).toThrow();
    // pointerAnchor: web index past the 36-fold pointer web
    expect(() =>
      MathemePointerAnchorProjection.parse({
        ...liveFields.pointerAnchor,
        webIndex: 36,
      }),
    ).toThrow();
  });

  it("enforces the DR-M4-3 handle-only quintessence key set", () => {
    // the live capture's real quintessence parses...
    const parsed = QuintessenceProjection.parse(liveFields.quintessence);
    expect(Object.keys(parsed).sort()).toEqual([
      "authority",
      "hashPreview",
      "layerCount",
      "natalDegree",
      "natalTick12",
      "partial",
      "quintessenceQuaternion",
      "quintessenceWeight",
    ]);
    // ...and any raw identity body alongside the handles is rejected
    for (const leak of [
      { natalChart: { sun: 352.4 } },
      { natalHash: "c8".repeat(32) },
      { birthDate: "1997-01-01" },
      { rawQuaternion: [1, 0, 0, 0] },
    ]) {
      expect(() =>
        QuintessenceProjection.parse({ ...liveFields.quintessence, ...leak }),
      ).toThrow();
    }
    // an 8-hex preview is the ONLY permitted digest width
    expect(() =>
      QuintessenceProjection.parse({
        ...liveFields.quintessence,
        hashPreview: "c8".repeat(32),
      }),
    ).toThrow();
  });
});

describe("T13 gateway bus event contracts (real wire shapes)", () => {
  it("parses the maintenance-loop frames as captured on the live wire", () => {
    expect(GatewayTickEvent.parse({ ts: 1783344872297 }).ts).toBe(
      1783344872297,
    );
    expect(
      GatewayHeartbeatEvent.parse({ ts: 1783344872296, status: "idle" })
        .status,
    ).toBe("idle");
    expect(
      GatewayConnectChallengeEvent.parse({
        nonce: "b7f2590c-7101-4198-b92e-80daeed1395e",
      }).nonce,
    ).toMatch(/^[0-9a-f-]{36}$/);
    const health = GatewayHealthEvent.parse({
      ok: false,
      checks: {
        gatewaySession: { ok: false, error: "no gateway sessions available" },
        graph: { ok: false, cachedAtMs: 1, report: {} },
      },
    });
    expect(health.ok).toBe(false);
  });

  it("rejects malformed bus frames", () => {
    expect(() => GatewayTickEvent.parse({ ts: -1 })).toThrow();
    expect(() =>
      GatewayTickEvent.parse({ ts: 1, extraChannelNoise: true }),
    ).toThrow();
    expect(() => GatewayHeartbeatEvent.parse({ ts: 1, status: "" })).toThrow();
    expect(() =>
      GatewayConnectChallengeEvent.parse({ nonce: "not-a-uuid" }),
    ).toThrow();
    // a health check without its own ok verdict is not a health check
    expect(() =>
      GatewayHealthEvent.parse({
        ok: true,
        checks: { graph: { cachedAtMs: 1 } },
      }),
    ).toThrow(/verdict/);
  });
});
