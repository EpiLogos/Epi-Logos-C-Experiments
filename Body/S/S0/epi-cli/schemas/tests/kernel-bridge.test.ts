import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  KERNEL_BRIDGE_CAPABILITY_NAMES,
  EpogdoonBridgeProjection,
  LensCodonBinaryProjection,
  KernelBridgeCachedProfile,
  KernelBridgeConnectionStatus,
  KernelBridgeEvent,
  KernelBridgeReadinessSnapshot,
  KernelBridgeRpcEnvelope,
  KernelBridgeRuntimeSnapshot,
  KleinFlipEvent,
  M123ChimeFrame,
  MathemeHarmonicProfile,
  MonoPolyOperator,
  isM123ChimeCoherent,
  PasuBeingPatternProjection,
  PerspectiveRole,
  RFactorBand,
  AnuttaraWitnessProjection,
  TranscriptionalClockPacket,
  validateKernelBridgeRpcEnvelope,
} from "../src/kernel-bridge.js";
import { KERNEL_BRIDGE_CAPABILITIES } from "../../../../../../Body/M/pratibimba-app/src/bridge/types.js";

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

  it("round-trips VakLanguificationTrace and omits absent optional fields", () => {
    const trace = {
      cpfNotation: "(4.0/1-4.4/5)",
      cfNotation: "(5/0)",
      m0Address: "M0-5",
      vakLevel: "vaikhari",
      diatonicDegree: 0,
      biasWeightsEmpty: false,
      recognitionClosed: true,
      provenance: [
        "s4.vak.evaluate",
        "m0.vak_cf",
        "kernel.diatonic_context",
      ],
    } as const;

    const parsed = MathemeHarmonicProfile.parse({
      ...baselineProfile,
      vakLanguificationTrace: trace,
    });
    expect(parsed.vakLanguificationTrace?.vakLevel).toBe("vaikhari");

    const encoded = JSON.stringify(parsed.vakLanguificationTrace);
    expect(encoded).not.toContain("resonance72Index");
    expect(encoded).not.toContain("halfDecanIndex");
    expect(encoded).not.toContain("modeTonicCf");
  });

  it("parses the baseline modalResonator and pins the m2Address72 derivation", () => {
    const parsed = MathemeHarmonicProfile.parse(baselineProfile);
    const modal = parsed.modalResonator;
    expect(modal).toBeDefined();
    expect(modal!.chromaticBody).toHaveLength(12);
    expect(modal!.liveOctet).toHaveLength(8);
    expect(modal!.nodalQuartet).toHaveLength(4);
    expect(modal!.diatonicSet).toHaveLength(7);
    expect(modal!.silentComplement).toHaveLength(5);
    // Drift guard: the bus stays the only pitch authority…
    modal!.liveOctet.forEach((carrier, i) => {
      expect(carrier.hz).toBe(parsed.audioOctet[i]);
    });
    // …and the M2 72-address derives from resonance72.lensAnchorIndex,
    // never from lens * 7 + mode.
    expect(modal!.m2Address72.address72).toBe(
      (baselineProfile.resonance72 as Record<string, unknown>)
        .lensAnchorIndex,
    );
    expect(modal!.lensMode.lensModeIndex).toBe(
      modal!.lensMode.lens * 7 + modal!.lensMode.mode,
    );
  });

  it("keeps lensMode bounds in Rust order — lens 0..11, mode 0..6", () => {
    // Guard against the historic swapped-bounds drift (bell spec §6).
    MathemeHarmonicProfile.parse({
      ...baselineProfile,
      lensMode: { lens: 11, mode: 6 },
    });
    expect(() =>
      MathemeHarmonicProfile.parse({
        ...baselineProfile,
        lensMode: { lens: 0, mode: 7 },
      }),
    ).toThrow();
    expect(() =>
      MathemeHarmonicProfile.parse({
        ...baselineProfile,
        lensMode: { lens: 12, mode: 0 },
      }),
    ).toThrow();
  });

  it("parses the baseline phaseSpace under the HARDENED E3 schema and pins the two-plane law", () => {
    const parsed = MathemeHarmonicProfile.parse(baselineProfile);
    const ps = parsed.phaseSpace;
    expect(ps).toBeDefined();
    // primary plane below 360 reads the codon valence of the degree
    expect(ps!.plane).toBe(ps!.degree720 < 360 ? "primary-codon" : "shadow-hexagram");
    if (ps!.degree720 < 360) {
      expect(ps!.activeValence.kind).toBe("codon");
    }
    expect(ps!.lensCarrier).toHaveLength(16);
    // the temporal canon is exactly the 24/12/4-section rows (E2 law);
    // Ground is functional lens 16 and the primary address of the 16 derived rows.
    const temporal = ps!.lensCarrier
      .filter((lens) => lens.temporalCanon)
      .map((lens) => lens.sections)
      .sort((a, b) => a - b);
    expect(temporal).toEqual([4, 12, 24]);
    expect(ps!.fibonacciGround.lensId).toBe(16);
    expect(ps!.fibonacciGround.role).toBe("primary-ground");
    expect(ps!.fibonacciGround.slice).toBe(6);
    expect(ps!.fibonacciGround.sections).toBe(60);
    expect(ps!.fibonacciGround.temporalCanon).toBe(true);
    // node/lensCarrier agree on the §4 formula at every aperture
    ps!.lensCarrier.forEach((lens, i) => {
      expect(lens.segment).toBe(ps!.node.lensSegment[i]);
      expect(lens.segment).toBe(Math.floor(ps!.degree360 / lens.slice));
    });
  });

  it("admits the E6 quintessence handle and rejects identity-body leaks by bounds", () => {
    const quintessence = {
      natalDegree: 217,
      natalTick12: 7,
      quintessenceWeight: 0.62,
      layerCount: 5,
      partial: false,
      hashPreview: "9f3a1c2b",
      quintessenceQuaternion: [0.61, 0.45, 0.42, 0.5],
      authority: "epi nara identity (BLAKE3, hash_to_clock_position)",
    };
    const parsed = MathemeHarmonicProfile.parse({
      ...baselineProfile,
      quintessence,
    });
    expect(parsed.quintessence?.natalDegree).toBe(217);
    // absence is honest — the baseline itself carries no identity
    expect(MathemeHarmonicProfile.parse(baselineProfile).quintessence)
      .toBeUndefined();
    // strict object: a 64-char hash (the raw identity body) must not pass
    // as a preview, degrees must stay on the clock, layers within 5
    for (const bad of [
      { ...quintessence, hashPreview: "9f".repeat(32) },
      { ...quintessence, natalDegree: 360 },
      { ...quintessence, layerCount: 6 },
      { ...quintessence, natalHash: [1, 2, 3] },
    ]) {
      expect(() =>
        MathemeHarmonicProfile.parse({ ...baselineProfile, quintessence: bad }),
      ).toThrow();
    }
  });

  it("rejects malformed phase-space valence and a 17th lensCarrier row", () => {
    const ps = (baselineProfile as Record<string, any>).phaseSpace;
    expect(() =>
      MathemeHarmonicProfile.parse({
        ...baselineProfile,
        phaseSpace: {
          ...ps,
          activeValence: { kind: "codon", hexagramId: 10, lineActive: 4 },
        },
      }),
    ).toThrow();
    expect(() =>
      MathemeHarmonicProfile.parse({
        ...baselineProfile,
        phaseSpace: {
          ...ps,
          lensCarrier: [...ps.lensCarrier, ps.lensCarrier[0]],
        },
      }),
    ).toThrow();
  });

  it("rejects wrong octet/quartet lengths in the modal resonator", () => {
    const modal = (baselineProfile as Record<string, any>).modalResonator;
    expect(() =>
      MathemeHarmonicProfile.parse({
        ...baselineProfile,
        modalResonator: { ...modal, liveOctet: modal.liveOctet.slice(0, 7) },
      }),
    ).toThrow();
    expect(() =>
      MathemeHarmonicProfile.parse({
        ...baselineProfile,
        modalResonator: {
          ...modal,
          nodalQuartet: modal.nodalQuartet.slice(0, 3),
        },
      }),
    ).toThrow();
  });

  it("accepts the additive live-sky fields and payloads without them", () => {
    const degrees = Array.from({ length: 10 }, (_, i) => 10.25 + i * 30);
    const parsed = MathemeHarmonicProfile.parse({
      ...baselineProfile,
      planetDegrees: degrees,
      livePlanets: degrees.map((degree, i) => ({
        planetId: i,
        degree,
        retrograde: false,
        decan36: Math.floor(degree / 10),
        decanRuler: 4,
        isResonance: i === 4,
        elementId: 0,
        keplerianVel: 100,
      })),
    });
    expect(parsed.planetDegrees).toHaveLength(10);
    expect(parsed.livePlanets?.[4].isResonance).toBe(true);
    expect(() =>
      MathemeHarmonicProfile.parse({
        ...baselineProfile,
        planetDegrees: degrees.slice(0, 9),
      }),
    ).toThrow();
  });

  it("parses an m123 chime frame and blocks readiness on world-clock mismatch", () => {
    const modal = (baselineProfile as Record<string, any>).modalResonator;
    const frame = {
      eventType: "m123.chime",
      contract: "S0.kernel-bridge.m123-chime-frame",
      sourceProfileGeneration: 42,
      tick: baselineProfile.tick,
      tick12: baselineProfile.tick12,
      degree720: baselineProfile.degree720,
      m2Address72: modal.m2Address72.address72,
      m1: {
        surface: "K2",
        k2SurfaceHandle: null,
        playedTorusHandle: null,
        playedTorusStatus: null,
        strikeRoute: "profile-bus",
      },
      m2: {
        modalResonator: modal,
        m2PrimeMeaningPacketRef: null,
        cymaticFrameHandle: "cymatic-frame-0-0123456789abcdef",
        cymaticTextureContributionHandle: null,
        exactProfileBus: true,
      },
      m3: {
        codonRotationProjection: baselineProfile.codonRotationProjection,
        worldClockBinding: {
          state: "ready",
          worldClockHandle: "s3-world-clock-42",
          generation: 42,
          source: "s3.world_clock",
          subscriptionMode: "gateway-heartbeat",
          tick: baselineProfile.tick,
          degree720: baselineProfile.degree720,
          degree720MatchesProfile: true,
          tickMatchesProfile: true,
        },
      },
      privacyClass: "public-current-context",
    };
    expect(isM123ChimeCoherent(M123ChimeFrame.parse(frame))).toBe(true);

    const stale = M123ChimeFrame.parse({
      ...frame,
      m3: {
        ...frame.m3,
        worldClockBinding: {
          ...frame.m3.worldClockBinding,
          state: "stale",
          tickMatchesProfile: false,
        },
      },
    });
    expect(isM123ChimeCoherent(stale)).toBe(false);
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
      "kernelBridge.m2.epogdoonProjection(address72)",
      "kernelBridge.m2.planetaryElementalWeights()",
      "kernelBridge.m2.cymaticMonoPolyState(address72)",
      "kernelBridge.m3.bioquaternionTranscription(codon)",
      "kernelBridge.m3.lensCodonBinary(lensId)",
    ]);
    expect(KERNEL_BRIDGE_CAPABILITY_NAMES).toEqual([
      ...KERNEL_BRIDGE_CAPABILITIES,
    ]);
    expect(
      EpogdoonBridgeProjection.parse({
        compressedCodon: 15,
        isEvolutionaryGap: true,
        expandedBack: 16,
      }),
    ).toEqual({
      compressedCodon: 15,
      isEvolutionaryGap: true,
      expandedBack: 16,
    });
    const segment = Array.from({ length: 24 }, (_, section) => section * 15);
    const degreeRecords = segment.map((degree360) => ({
      degree360,
      exactDegree720: degree360 * 2,
      codonUpper: 0,
      codonLower: 0,
      codonClass: 0,
      charges: { pp: 18, nn: -6, np: 6, pn: 6 },
      quaternion: [18, -6, 6, 6],
      elementCanonical: 4,
      hexagramId: 0,
      lineChangeOperator: 0,
      tick12: Math.floor(degree360 / 30),
      fibonacciPosition: Math.floor(degree360 / 6),
      fibonacciDigit: 0,
      fibonacciPhase01: (degree360 % 6) / 6,
    }));
    const lensProjection = {
      lensId: 7,
      lensRole: "derived-aperture",
      groundingLensId: 16,
      segment,
      perDegree: degreeRecords,
      contract: "kernelBridge.m3.lensCodonBinary(lensId)",
      runtimeOwner: "S0/portal-core + epi-cli",
      source: "CLOCK_DEGREE_LUT",
    };
    expect(LensCodonBinaryProjection.parse(lensProjection).perDegree).toHaveLength(24);
    expect(() =>
      LensCodonBinaryProjection.parse({
        ...lensProjection,
        perDegree: [
          {
            ...degreeRecords[0],
            charges: { pp: 18, mm: -6, mp: 6, pm: 6 },
          },
          ...degreeRecords.slice(1),
        ],
      }),
    ).toThrow();
    const groundSegment = Array.from({ length: 60 }, (_, position) => position * 6);
    const groundProjection = LensCodonBinaryProjection.parse({
      ...lensProjection,
      lensId: 16,
      lensRole: "primary-ground",
      segment: groundSegment,
      perDegree: groundSegment.map((degree360, fibonacciPosition) => ({
        ...degreeRecords[0],
        degree360,
        exactDegree720: degree360 * 2,
        tick12: Math.floor(degree360 / 30),
        fibonacciPosition,
        fibonacciDigit: 0,
        fibonacciPhase01: 0,
      })),
    });
    expect(groundProjection.perDegree).toHaveLength(60);
    expect(() => LensCodonBinaryProjection.parse({ ...groundProjection, lensId: 17 })).toThrow();
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
      graphRevision: 19,
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
    expect(snapshot.cachedProfile?.graphRevision).toBe(19);
    expect(snapshot.cachedProfile?.profile.generation).toBe(44);
  });

  it("rejects runtime cached profiles that leak protected private fields", () => {
    for (const privateKey of [
      "bioquaternion",
      "fieldBody",
      "rawField",
      "rawPersonalCymaticPayload",
      "personalCymaticField",
      "protectedM4Body",
      "journalBody",
    ]) {
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
            [privateKey]: { protected: true },
          },
        }),
      ).toThrow(new RegExp(privateKey));
    }
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

describe("KleinFlipEvent typed union (T12 discharge, 2026-07-06)", () => {
  // Wire shapes captured from the Rust serde output of
  // portal-core/src/events/flip_events.rs (tag "kind", camelCase):
  const m1Flip = { kind: "m1TritoneCrossing", tick12: 6, lensPair: [0, 6] };
  const m2Flip = {
    kind: "m2CymaticValenceInvert",
    valenceBefore: "primary",
    valenceAfter: "inverted",
  };
  const m3Flip = { kind: "m3CodonRotationCross", codonBefore: 12, codonAfter: 13 };

  it("parses all three Rust-serialized flip variants", () => {
    for (const flip of [m1Flip, m2Flip, m3Flip]) {
      const parsed = KleinFlipEvent.parse(flip);
      expect(parsed.kind).toBe(flip.kind);
    }
  });

  it("rejects an unknown kind, an out-of-range lens pair, and a stray field", () => {
    expect(() => KleinFlipEvent.parse({ kind: "m4NotAFlip" })).toThrow();
    expect(() =>
      KleinFlipEvent.parse({ ...m1Flip, lensPair: [0, 12] }),
    ).toThrow();
    expect(() => KleinFlipEvent.parse({ ...m3Flip, codonAfter: 64 })).toThrow();
    expect(() => KleinFlipEvent.parse({ ...m2Flip, extra: true })).toThrow();
  });

  it("rides the strict profile parse: typed when present, null between flips", () => {
    // Baseline (tick 0) carries kleinFlip: null — still parses strict.
    expect(baselineProfile.kleinFlip).toBeNull();
    const withFlip = MathemeHarmonicProfile.parse({
      ...baselineProfile,
      kleinFlip: m1Flip,
    });
    expect(withFlip.kleinFlip).toEqual(m1Flip);
    // A malformed flip must now FAIL the whole strict profile parse — the
    // z.unknown() hole is closed.
    expect(() =>
      MathemeHarmonicProfile.parse({
        ...baselineProfile,
        kleinFlip: { kind: "m1TritoneCrossing", tick12: 6 },
      }),
    ).toThrow();
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
