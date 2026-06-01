import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  KERNEL_BRIDGE_CAPABILITY_NAMES,
  KernelBridgeCachedProfile,
  KernelBridgeConnectionStatus,
  KernelBridgeEvent,
  KernelBridgeReadinessSnapshot,
  KernelBridgeRpcEnvelope,
  KernelBridgeRuntimeSnapshot,
  MathemeHarmonicProfile,
  validateKernelBridgeRpcEnvelope,
} from "../src/kernel-bridge.js";
import { KERNEL_BRIDGE_REQUIRED_CAPABILITIES } from "../../../../../../Idea/Pratibimba/System/extensions/m-extension-runtime/src/common/bridge-api.js";

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

describe("Kernel bridge contract package", () => {
  it("parses the real portal-core baseline MathemeHarmonicProfile fixture", () => {
    const parsed = MathemeHarmonicProfile.parse(baselineProfile);
    expect(parsed.profileSchemaVersion).toBe(1);
    expect(parsed.privacyClass).toBe("public-current-context");
    expect(parsed.audioOctet).toHaveLength(8);
    expect(parsed.nodalQuartet).toHaveLength(4);
    expect(parsed.binary).toEqual(parsed.mahamaya);
  });

  it("rejects renderer-local profile fields that are absent from the S0 profile contract", () => {
    expect(() =>
      MathemeHarmonicProfile.parse({
        ...baselineProfile,
        rendererLocalMoodColor: "#cc00ff",
      }),
    ).toThrow(/unrecognized_keys/i);
  });

  it("defines connection, readiness, events, and capability names used by bridge consumers", () => {
    expect(KERNEL_BRIDGE_CAPABILITY_NAMES).toEqual([
      "readCurrentProfile",
      "readPointerAnchor",
      "readReadiness",
      "subscribeObservability",
      "invokeGatewayRpc",
      "depositKernelObservation",
      "requestReviewEvidence",
    ]);
    expect(KERNEL_BRIDGE_CAPABILITY_NAMES).toEqual([
      ...KERNEL_BRIDGE_REQUIRED_CAPABILITIES,
    ]);
    expect(
      KernelBridgeConnectionStatus.parse({
        connected: true,
        state: "resynced-profile-generation",
        mode: "full",
        subscriptionMode: "native-websocket",
        reason: "profile generation advanced after reconnect",
        profileGeneration: 12,
      }).state,
    ).toBe("resynced-profile-generation");
    expect(
      KernelBridgeReadinessSnapshot.parse({
        state: "degraded_but_readable",
        reason: "S2 GDS unavailable; profile readable",
        profileGeneration: 12,
        bridgeReachable: true,
        blockerIds: ["s2.gds-unavailable"],
        capabilities: ["readCurrentProfile", "invokeGatewayRpc"],
      }).capabilities,
    ).toContain("invokeGatewayRpc");
    expect(
      KernelBridgeEvent.parse({
        type: "world_clock",
        emittedAt: 1,
        source: "kernel-bridge",
        profileGeneration: 12,
        privacyClass: "safe-live-projection",
        payload: { tick12: 4 },
      }).type,
    ).toBe("world_clock");
  });

  it("parses the runtime MVP singleton snapshot for Theia and /body adapters", () => {
    const cachedProfile = KernelBridgeCachedProfile.parse({
      generation: 44,
      cachedAtMs: 1,
      stale: false,
      stalenessMs: 0,
      privacyClass: "safe-public-current-kernel-tick",
      profile: {
        privacy: "safe-public-current-kernel-tick",
        generation: 44,
        tick: { subTick: 4 },
      },
    });
    const snapshot = KernelBridgeRuntimeSnapshot.parse({
      runtimeOwner: "S0/S0' kernel-bridge runtime",
      theiaAdapter: "Theia KernelBridgeAPI dependency-injection adapter",
      tauriAdapter: "Tauri 0/1 surface adapter",
      upstreamSubscriptionCount: 1,
      subscriberCount: 2,
      mode: "lite",
      subscriptionMode: "native-websocket",
      currentProfileGeneration: 44,
      cachedProfile,
      connection: {
        connected: true,
        state: "connected",
        mode: "lite",
        subscriptionMode: "native-websocket",
        reason: "connected to SpaceTimeDB projection source",
        profileGeneration: 44,
      },
      readiness: {
        state: "ready_public_current",
        reason: "connected to SpaceTimeDB projection source",
        profileGeneration: 44,
        bridgeReachable: true,
        blockerIds: [],
        capabilities: [
          "readCurrentProfile",
          "readPointerAnchor",
          "readReadiness",
        ],
      },
    });

    expect(snapshot.upstreamSubscriptionCount).toBe(1);
    expect(snapshot.currentProfileGeneration).toBe(44);
    expect(snapshot.cachedProfile?.profile.generation).toBe(44);
  });

  it("rejects runtime cached profiles that leak protected private fields", () => {
    expect(() =>
      KernelBridgeCachedProfile.parse({
        generation: 44,
        cachedAtMs: 1,
        stale: false,
        stalenessMs: 0,
        privacyClass: "safe-public-current-kernel-tick",
        profile: {
          generation: 44,
          privacy: "safe-public-current-kernel-tick",
          bioquaternion: { q_b: [1, 0, 0, 0] },
        },
      }),
    ).toThrow(/bioquaternion/);
  });

  it("rejects unauthorized gateway method names before dispatch", () => {
    expect(() =>
      KernelBridgeRpcEnvelope.parse({
        method: "deleteEverything",
        params: {},
        privacyClass: "public_current",
        sessionKey: "agent:main:main",
        profileGeneration: 12,
        provenanceHandles: ["profile:12"],
        vakAddress: sampleVakAddress(),
        routeLineage: ["vak_evaluate", "anima_orchestrate", "dispatch_agent"],
      }),
    ).toThrow();
  });

  it("rejects protected-private payload fields before dispatch", () => {
    expect(() =>
      validateKernelBridgeRpcEnvelope({
        method: "invokeGatewayRpc",
        params: {
          identityHashPreview: "abc123",
          allowedHandle: "profile:12",
        },
        privacyClass: "public_current",
        sessionKey: "agent:main:main",
        profileGeneration: 12,
        provenanceHandles: ["profile:12"],
        vakAddress: sampleVakAddress(),
        routeLineage: ["vak_evaluate", "anima_orchestrate", "dispatch_agent"],
      }),
    ).toThrow(/identityHashPreview/);
  });

  it("accepts bounded read-only profile and pointer capability envelopes", () => {
    const envelope = validateKernelBridgeRpcEnvelope({
      method: "readPointerAnchor",
      params: { coordinate: "M2", pointerAnchor: "pointer://s0/current" },
      privacyClass: "public_current_with_graph_provenance",
      sessionKey: "agent:main:main",
      profileGeneration: 12,
      provenanceHandles: ["profile:12", "s2:pointer:M2"],
      vakAddress: sampleVakAddress(),
      routeLineage: ["vak_evaluate", "anima_orchestrate", "dispatch_agent"],
    });
    expect(envelope.method).toBe("readPointerAnchor");
    expect(envelope.vakAddress.CF).toBe("(4.0/1-4.4/5)");
  });

  it("rejects M5-4 capability envelopes without canonical-prefix VAK keys", () => {
    expect(() =>
      validateKernelBridgeRpcEnvelope({
        method: "readPointerAnchor",
        params: { coordinate: "M2" },
        privacyClass: "public_current_with_graph_provenance",
        sessionKey: "agent:main:main",
        profileGeneration: 12,
        provenanceHandles: ["profile:12"],
        vakAddress: {
          cpf: "(4.0/1-4.4/5)",
          ct: ["CT4a"],
          cp: "CP4.4",
          cf: "(4.0/1-4.4/5)",
          cfp: "CFP0",
          cs: { code: "CS0", direction: "Day" },
        },
        routeLineage: ["vak_evaluate", "anima_orchestrate", "dispatch_agent"],
      }),
    ).toThrow(/CPF|unrecognized_keys/i);
  });
});

function sampleVakAddress() {
  return {
    CPF: "(4.0/1-4.4/5)",
    CT: ["CT4a"],
    CP: "CP4.4",
    CF: "(4.0/1-4.4/5)",
    CFP: "CFP0",
    CS: { code: "CS0", direction: "Day" },
  };
}
