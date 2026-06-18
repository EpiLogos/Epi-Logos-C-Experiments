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
  MonoPolyOperator,
  PasuBeingPatternProjection,
  PerspectiveRole,
  RFactorBand,
  AnuttaraWitnessProjection,
  TranscriptionalClockPacket,
  validateKernelBridgeRpcEnvelope,
} from "../src/kernel-bridge.js";
import { KERNEL_BRIDGE_REQUIRED_CAPABILITIES } from "../../../../../../Body/M/epi-theia/extensions/m-extension-runtime/src/common/bridge-api.js";

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

  it("round-trips PASU BeingPattern variants and keeps ActualisingOne review-bound", () => {
    expect(MonoPolyOperator.options).toEqual([
      "Mono",
      "Poly",
      "ActuallyMany",
      "PotentiallyOne",
      "ActualisingOne",
      "PotentiatingMany",
      "MonoPoly",
    ]);
    expect(PerspectiveRole.options).toEqual([
      "FirstPerson",
      "SecondPerson",
      "FirstPersonPlural",
      "ThirdPerson",
      "CollectiveWe",
      "IntegralWeI",
    ]);

    const pasuBeingPattern = {
      entityRef: {
        entityId: "pasu:self",
        entityKind: "user-being",
        graphAnchor: "neo4j://s2/nodes/being/pasu-self",
      },
      stableIdentity: {
        graphAnchor: "neo4j://s2/nodes/being/pasu-self",
        identityHandle: "being:pasu-self",
        source: "S2 Neo4j canonical graph",
      },
      liveState: {
        spacetimeRowId: "being_pattern_presence:pasu-self",
        streamGeneration: 44,
        redisPsyche: { presence: "redis://psyche/presence" },
        dayRef: "Idea/Empty/Present/17-06-2026",
        nowRef: "Idea/Empty/Present/17-06-2026/20260617T181955Z/now.md",
        streamDelta: "redis://psyche/stream/44",
        graphitiEpisodeRefs: [],
      },
      observerAnchor: {
        observerEntityId: "earth-observer",
        observerRole: "IntegralWeI",
        anchorRef: "Earth",
      },
      clockAddress: { degree360: 137, tick12: 5 },
      monopolyOperator: "ActualisingOne",
      perspectiveRole: "IntegralWeI",
      m2M3Relation: {
        relationHandle: "m2m3://relation/pasu-self/trine",
        planetaryLensAspect: "backend-supplied-trine",
        source: "S3 CCT-21",
      },
      bioquaternionHandles: [
        {
          handle: "protected://bio/q_identity",
          privacy: "protected-local-body",
          source: "PASU",
        },
      ],
      elementalWeights: { fire: 0, water: 0, air: 0, earth: 0.4 },
      relationEdges: [
        {
          edgeId: "edge:pasu-self:school",
          sourceEntityId: "pasu:self",
          targetEntityId: "school-of-thought-being",
          edgeKind: "aspect-like",
          aspectLabel: "trine-like-resonance",
          generation: 44,
          m2M3Relation: {
            relationHandle: "m2m3://relation/pasu-self/trine",
            planetaryLensAspect: "backend-supplied-trine",
            source: "S3 CCT-21",
          },
          elementalDelta: { fire: 0.1, water: 0, air: 0, earth: 0 },
          verifierRefs: [],
          canonStatus: "live-only-review-required",
        },
      ],
      verifierRefs: [],
      reviewRisk: "forced-unification",
    } as const;

    expect(PasuBeingPatternProjection.parse(pasuBeingPattern).reviewRisk).toBe(
      "forced-unification",
    );
    expect(
      MathemeHarmonicProfile.parse({
        ...baselineProfile,
        pasuBeingPattern,
      }).pasuBeingPattern?.liveState.streamGeneration,
    ).toBe(44);
    expect(() =>
      PasuBeingPatternProjection.parse({
        ...pasuBeingPattern,
        reviewRisk: "none",
      }),
    ).toThrow(/ActualisingOne/);
  });

  it("round-trips Anuttara witness vectors, R-factor bands, and turn flag without gating", () => {
    expect(RFactorBand.options).toEqual(["pravritti", "nivritti"]);

    const anuttaraWitness = {
      virtueWitnessVector: 0b111_000_101,
      syntaxWitnessVector: 0b1001,
      rfactorPath: [
        {
          rFactor: 1,
          baseRoute: "Nara",
          band: "pravritti",
          position: 4,
          isTurn: false,
        },
        {
          rFactor: 2,
          baseRoute: "Shakti",
          band: "pravritti",
          position: 5,
          isTurn: true,
        },
        {
          rFactor: 3,
          baseRoute: "Shakti",
          band: "nivritti",
          position: 0,
          isTurn: false,
        },
        {
          rFactor: 0xff,
          baseRoute: "Siva",
          band: "nivritti",
          position: 5,
          isTurn: false,
        },
      ],
      bandBalance: {
        pravrittiDepth: 2,
        nivrittiDepth: 2,
        reachedTurn: true,
        returned: true,
      },
      palindromeState: {
        normalFormSymmetric: true,
        mirrorNormalForm: "R1@Nara/4|(@#)|R3@Shakti/0",
      },
      openQuestions: ["Law-6:R3@Shakti:return?"],
      coherenceScore: 0.625,
    } as const;

    const parsedWitness = AnuttaraWitnessProjection.parse(anuttaraWitness);
    expect(parsedWitness.virtueWitnessVector).toBe(0b111_000_101);
    expect(parsedWitness.syntaxWitnessVector).toBe(0b1001);
    expect(parsedWitness.rfactorPath.map((step) => step.band)).toEqual([
      "pravritti",
      "pravritti",
      "nivritti",
      "nivritti",
    ]);
    expect(parsedWitness.rfactorPath[1].isTurn).toBe(true);

    const parsedProfile = MathemeHarmonicProfile.parse({
      ...baselineProfile,
      anuttaraWitness,
    });
    expect(parsedProfile.anuttaraWitness?.rfactorPath[3].rFactor).toBe(0xff);
    expect(parsedProfile.anuttaraWitness?.bandBalance.returned).toBe(true);
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
      "s2.parashaktiCorrespondences",
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

  it("parses a single-card CP point without coercing it into a sixfold frame", () => {
    const packet = TranscriptionalClockPacket.parse(
      transcriptionalPacket({
        oracleFrame: oracleFrame({
          frameId: "frame:single:P2",
          spreadScale: "single-card",
          positions: [position("P2", 0, "CP4.2")],
        }),
        cpPositionRef: "CP4.2",
      }),
    );
    expect(packet.oracleFrame.positions).toHaveLength(1);
    expect(packet.cpPositionRef).toBe("CP4.2");
  });

  it("parses a three-card compressed CP-set as three actual positions", () => {
    const packet = TranscriptionalClockPacket.parse(
      transcriptionalPacket({
        oracleFrame: oracleFrame({
          frameId: "frame:triad:P1-P2-P3",
          spreadScale: "compressed-triad",
          positions: [
            position("P1", 0, "CP4.1"),
            position("P2", 1, "CP4.2"),
            position("P3", 2, "CP4.3"),
          ],
        }),
        cpPositionRef: "CP4.2",
      }),
    );
    expect(packet.oracleFrame.spreadScale).toBe("compressed-triad");
    expect(packet.oracleFrame.positions.map((p) => p.cpPositionRef)).toEqual([
      "CP4.1",
      "CP4.2",
      "CP4.3",
    ]);
  });

  it("parses sixfold CP traverse complementary pairs from declared position pairs", () => {
    const packet = TranscriptionalClockPacket.parse(
      transcriptionalPacket({
        oracleFrame: oracleFrame({
          frameId: "frame:sixfold:P0-P5",
          spreadScale: "sixfold-ql-traverse",
          positions: [
            position("P0", 0, "CP4.0"),
            position("P1", 1, "CP4.1"),
            position("P2", 2, "CP4.2"),
            position("P3", 3, "CP4.3"),
            position("P4", 4, "CP4.4"),
            position("P5", 5, "CP4.5"),
          ],
          complementaryPairs: [
            ["P0", "P5"],
            ["P1", "P4"],
            ["P2", "P3"],
          ],
        }),
        cpPositionRef: "CP4.0",
      }),
    );
    expect(packet.oracleFrame.positions).toHaveLength(6);
    expect(packet.oracleFrame.complementaryPairs).toEqual([
      ["P0", "P5"],
      ["P1", "P4"],
      ["P2", "P3"],
    ]);
  });

  it("parses a Night' inverse pass without prose-derived complementary pairs", () => {
    const packet = TranscriptionalClockPacket.parse(
      transcriptionalPacket({
        oracleFrame: oracleFrame({
          frameId: "frame:night-prime:P5-P0",
          spreadScale: "night-inverse-pass",
          traversalDirection: "night-prime",
          positions: [
            position("P5", 0, "CP4.5"),
            position("P4", 1, "CP4.4"),
            position("P3", 2, "CP4.3"),
            position("P2", 3, "CP4.2"),
            position("P1", 4, "CP4.1"),
            position("P0", 5, "CP4.0"),
          ],
          complementaryPairs: [["P5", "P0"]],
        }),
        cpPositionRef: "CP4.5",
      }),
    );
    expect(packet.oracleFrame.traversalDirection).toBe("night-prime");
    expect(packet.oracleFrame.complementaryPairs).toEqual([["P5", "P0"]]);
  });

  it("rejects packets whose cpPositionRef is absent from reading_frame.positions[]", () => {
    expect(() =>
      TranscriptionalClockPacket.parse(
        transcriptionalPacket({
          oracleFrame: oracleFrame({
            frameId: "frame:single:P0",
            spreadScale: "single-card",
            positions: [position("P0", 0, "CP4.0")],
          }),
          cpPositionRef: "CP4.5",
        }),
      ),
    ).toThrow(/positions/);
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

function position(key: string, ordinal: number, cpPositionRef: string) {
  return {
    key,
    ordinal,
    cpPositionRef,
    vak: sampleVakAddress(),
  };
}

function oracleFrame(overrides = {}) {
  return {
    frameId: "frame:single:P0",
    spreadScale: "single-card",
    positions: [position("P0", 0, "CP4.0")],
    complementaryPairs: [],
    ...overrides,
  };
}

function transcriptionalPacket(overrides = {}) {
  return {
    packetId: "tcp:test",
    profileGeneration: 12,
    vak: sampleVakAddress(),
    oracleFrame: oracleFrame(),
    cpPositionRef: "CP4.0",
    provenanceHandles: ["profile:12"],
    ...overrides,
  };
}
