import { z } from "zod";
import { BridgeReadinessState } from "./readiness.js";

export const KernelBridgePrivacyClass = z.enum([
  "public_current",
  "public-current-context",
  "public_current_with_graph_provenance",
  "safe-live-projection",
  "safe-public-current-kernel-tick",
]);
export type KernelBridgePrivacyClass = z.infer<typeof KernelBridgePrivacyClass>;

export const KernelBridgeConnectionState = z.enum([
  "connected",
  "connection-lost",
  "reconnecting",
  "stale-profile",
  "resynced-profile-generation",
  "degraded-but-subscribable",
  "detached",
]);
export type KernelBridgeConnectionState = z.infer<
  typeof KernelBridgeConnectionState
>;

export const KernelBridgeSubscriptionMode = z.enum([
  "http-sql-poll",
  "native-websocket",
]);
export type KernelBridgeSubscriptionMode = z.infer<
  typeof KernelBridgeSubscriptionMode
>;

export const KernelBridgeSubscriptionProfile = z.enum(["lite", "full"]);
export type KernelBridgeSubscriptionProfile = z.infer<
  typeof KernelBridgeSubscriptionProfile
>;

export const KernelBridgeEventType = z.enum([
  "profile",
  "world_clock",
  "presence",
  "shared_archetype_event",
  "kernel_trace",
  "audio_bus",
  "cymatic_field",
  "connection_status",
  "gateway_rpc",
  "observability",
]);
export type KernelBridgeEventType = z.infer<typeof KernelBridgeEventType>;

const FORBIDDEN_PRIVATE_PAYLOAD_KEYS = [
  "protectedProfileHashDetail",
  "identityHashPreview",
  "layerPresenceMask",
  "rawNaraBody",
  "privateIdentityData",
  "bioquaternion",
  "resonanceSquareEmphasis",
] as const;

export const KernelBridgeCapabilityName = z.enum([
  "readCurrentProfile",
  "readPointerAnchor",
  "readReadiness",
  "subscribeObservability",
  "invokeGatewayRpc",
  "depositKernelObservation",
  "requestReviewEvidence",
  "s2.parashaktiCorrespondences",
  "kernelBridge.m2.planetaryElementalWeights()",
  "kernelBridge.m2.cymaticMonoPolyState(address72)",
  "kernelBridge.m3.bioquaternionTranscription(codon)",
]);
export type KernelBridgeCapabilityName = z.infer<
  typeof KernelBridgeCapabilityName
>;

export const KERNEL_BRIDGE_CAPABILITY_NAMES = Object.freeze(
  KernelBridgeCapabilityName.options,
);

export const CanonicalVakAddress = z
  .object({
    CPF: z.string().min(1),
    CT: z.array(z.string().min(1)).min(1),
    CP: z.string().min(1),
    CF: z.string().min(1),
    CFP: z.string().min(1),
    CS: z.record(z.unknown()),
  })
  .strict();
export type CanonicalVakAddress = z.infer<typeof CanonicalVakAddress>;

export const OracleSpreadScale = z.enum([
  "single-card",
  "compressed-triad",
  "sixfold-ql-traverse",
  "night-inverse-pass",
  "depth-4-5-pass",
  "clock-walk",
  "symbolic-orf",
]);
export type OracleSpreadScale = z.infer<typeof OracleSpreadScale>;

export const OracleTraversalDirection = z.enum([
  "day",
  "night",
  "night-prime",
  "inverse",
  "clockwise",
  "counterclockwise",
]);
export type OracleTraversalDirection = z.infer<
  typeof OracleTraversalDirection
>;

export const ReadingPosition = z
  .object({
    key: z.string().min(1),
    ordinal: z.number().int().nonnegative(),
    cpPositionRef: z.string().min(1),
    label: z.string().min(1).optional(),
    vak: CanonicalVakAddress.optional(),
  })
  .strict();
export type ReadingPosition = z.infer<typeof ReadingPosition>;

export const OracleFrame = z
  .object({
    frameId: z.string().min(1),
    spreadScale: OracleSpreadScale,
    positions: z.array(ReadingPosition).min(1),
    traversalDirection: OracleTraversalDirection.optional(),
    complementaryPairs: z.array(z.tuple([z.string().min(1), z.string().min(1)])).default([]),
  })
  .strict()
  .superRefine((value, ctx) => {
    const keys = new Set<string>();
    for (const position of value.positions) {
      if (keys.has(position.key)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `OracleFrame positions must use unique keys; duplicate ${position.key}`,
          path: ["positions"],
        });
      }
      keys.add(position.key);
    }
    for (const [left, right] of value.complementaryPairs) {
      if (!keys.has(left) || !keys.has(right)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `OracleFrame complementary pair ${left}/${right} must reference declared positions`,
          path: ["complementaryPairs"],
        });
      }
    }
  });
export type OracleFrame = z.infer<typeof OracleFrame>;
export const ReadingFrame = OracleFrame;
export type ReadingFrame = OracleFrame;

export const OracleSequenceCodon = z
  .object({
    ordinal: z.number().int().nonnegative(),
    symbol: z.string().min(1),
    cpPositionRef: z.string().min(1),
    vak: CanonicalVakAddress.optional(),
  })
  .strict();
export type OracleSequenceCodon = z.infer<typeof OracleSequenceCodon>;

export const OracleSequence = z
  .object({
    sequenceId: z.string().min(1),
    frameId: z.string().min(1),
    codons: z.array(OracleSequenceCodon).min(1),
  })
  .strict();
export type OracleSequence = z.infer<typeof OracleSequence>;

export const TranscriptClass = z.enum(["shared", "transcribable"]);
export type TranscriptClass = z.infer<typeof TranscriptClass>;

export const GovernanceRole = z.enum(["none", "start", "stop"]);
export type GovernanceRole = z.infer<typeof GovernanceRole>;

export const SymbolicProtein = z
  .object({
    proteinId: z.string().min(1),
    sequence: OracleSequence,
    readingFrame: OracleFrame,
    startPositionRef: z.string().min(1).optional(),
    stopPositionRef: z.string().min(1).optional(),
    // additive 4.17 fields
    transcriptClass: TranscriptClass.optional(),
    governanceRole: GovernanceRole.optional(),
    isCanonicalDerivation: z.boolean().optional(),
  })
  .strict();
export type SymbolicProtein = z.infer<typeof SymbolicProtein>;

export const TranscriptionalClockPacket = z
  .object({
    packetId: z.string().min(1),
    profileGeneration: z.number().int().nonnegative().nullable(),
    vak: CanonicalVakAddress,
    oracleFrame: OracleFrame,
    cpPositionRef: z.string().min(1),
    oracleSequence: OracleSequence.optional(),
    symbolicProtein: SymbolicProtein.optional(),
    provenanceHandles: z.array(z.string().min(1)).default([]),
    // additive 4.17 fields
    transcriptClass: TranscriptClass.optional(),
    governanceRole: GovernanceRole.optional(),
    chainPosition: z.number().int().nonnegative().optional(),
    parentPacketHash: z.string().length(64).optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    const positionRefs = new Set(
      value.oracleFrame.positions.map((position) => position.cpPositionRef),
    );
    if (!positionRefs.has(value.cpPositionRef)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "TranscriptionalClockPacket cpPositionRef must bind to reading_frame.positions[]",
        path: ["cpPositionRef"],
      });
    }
  });
export type TranscriptionalClockPacket = z.infer<
  typeof TranscriptionalClockPacket
>;

export const MonoPolyOperator = z.enum([
  "Mono",
  "Poly",
  "ActuallyMany",
  "PotentiallyOne",
  "ActualisingOne",
  "PotentiatingMany",
  "MonoPoly",
]);
export type MonoPolyOperator = z.infer<typeof MonoPolyOperator>;

export const PerspectiveRole = z.enum([
  "FirstPerson",
  "SecondPerson",
  "FirstPersonPlural",
  "ThirdPerson",
  "CollectiveWe",
  "IntegralWeI",
]);
export type PerspectiveRole = z.infer<typeof PerspectiveRole>;

export const NaraFamilyRole = z.enum([
  "Father",
  "Mother",
  "Son",
  "Daughter",
  "Tao",
  "IntegralConsciousness",
]);
export type NaraFamilyRole = z.infer<typeof NaraFamilyRole>;

const BeingPatternProtectedRef = z
  .object({
    episodeId: z.string().min(1),
    sourceRef: z.string().min(1),
    publicSummary: z.string().min(1),
  })
  .strict();

const ElementalWeightProjection = z
  .object({
    fire: z.number(),
    water: z.number(),
    air: z.number(),
    earth: z.number(),
  })
  .strict();

const M2M3RelationProjection = z
  .object({
    relationHandle: z.string().min(1),
    planetaryLensAspect: z.string().min(1),
    source: z.string().min(1),
  })
  .strict();

const BeingPatternRelationCanonStatus = z.enum([
  "live-only",
  "live-only-review-required",
]);

export const PasuBeingPatternProjection = z
  .object({
    entityRef: z
      .object({
        entityId: z.string().min(1),
        entityKind: z.string().min(1),
        graphAnchor: z.string().min(1),
        publicLabel: z.string().min(1).optional(),
      })
      .strict(),
    stableIdentity: z
      .object({
        graphAnchor: z.string().min(1),
        identityHandle: z.string().min(1),
        source: z.string().min(1),
      })
      .strict(),
    liveState: z
      .object({
        spacetimeRowId: z.string().min(1),
        streamGeneration: z.number().int().nonnegative(),
        redisPsyche: z.record(z.string().min(1)),
        dayRef: z.string().min(1),
        nowRef: z.string().min(1),
        streamDelta: z.string().min(1),
        graphitiEpisodeRefs: z.array(BeingPatternProtectedRef).default([]),
      })
      .strict(),
    observerAnchor: z
      .object({
        observerEntityId: z.string().min(1),
        observerRole: PerspectiveRole,
        anchorRef: z.string().min(1),
      })
      .strict(),
    clockAddress: z.record(z.unknown()),
    monopolyOperator: MonoPolyOperator,
    perspectiveRole: PerspectiveRole,
    naraFamilyRole: NaraFamilyRole.optional(),
    m2M3Relation: M2M3RelationProjection,
    bioquaternionHandles: z.array(
      z
        .object({
          handle: z.string().min(1),
          privacy: z.string().min(1),
          source: z.string().min(1),
        })
        .strict(),
    ),
    elementalWeights: ElementalWeightProjection,
    relationEdges: z
      .array(
        z
          .object({
            edgeId: z.string().min(1),
            sourceEntityId: z.string().min(1),
            targetEntityId: z.string().min(1),
            edgeKind: z.string().min(1),
            aspectLabel: z.string().min(1),
            generation: z.number().int().nonnegative(),
            m2M3Relation: M2M3RelationProjection,
            elementalDelta: ElementalWeightProjection,
            verifierRefs: z.array(BeingPatternProtectedRef).default([]),
            canonStatus: BeingPatternRelationCanonStatus,
          })
          .strict(),
      )
      .default([]),
    verifierRefs: z.array(BeingPatternProtectedRef).default([]),
    reviewRisk: z.enum([
      "none",
      "forced-unification",
      "privacy-boundary",
      "canon-candidate",
    ]),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (
      value.monopolyOperator === "ActualisingOne" &&
      value.reviewRisk !== "forced-unification"
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "ActualisingOne must serialize reviewRisk forced-unification",
        path: ["reviewRisk"],
      });
    }
  });
export type PasuBeingPatternProjection = z.infer<
  typeof PasuBeingPatternProjection
>;

export const RFactorBand = z.enum(["pravritti", "nivritti"]);
export type RFactorBand = z.infer<typeof RFactorBand>;

export const RFactorPathStep = z
  .object({
    rFactor: z
      .number()
      .int()
      .refine((value) => (value >= 0 && value <= 5) || value === 0xff, {
        message: "rFactor must be 0..5 or 0xff for R# Freedom",
      }),
    baseRoute: z.enum(["O#", "X#", "N#", "M#", "Nara", "Siva", "Shakti"]),
    band: RFactorBand,
    position: z.number().int().min(0).max(5),
    isTurn: z.boolean(),
  })
  .strict();
export type RFactorPathStep = z.infer<typeof RFactorPathStep>;

export const AnuttaraWitnessProjection = z
  .object({
    virtueWitnessVector: z.number().int().min(0).max(0x1ff),
    syntaxWitnessVector: z.number().int().min(0).max(0x0f),
    rfactorPath: z.array(RFactorPathStep),
    bandBalance: z
      .object({
        pravrittiDepth: z.number().int().nonnegative(),
        nivrittiDepth: z.number().int().nonnegative(),
        reachedTurn: z.boolean(),
        returned: z.boolean(),
      })
      .strict(),
    palindromeState: z
      .object({
        normalFormSymmetric: z.boolean(),
        mirrorNormalForm: z.string().min(1),
      })
      .strict(),
    openQuestions: z.array(z.string().min(1)),
    coherenceScore: z.number(),
  })
  .strict();
export type AnuttaraWitnessProjection = z.infer<
  typeof AnuttaraWitnessProjection
>;

export const CfNotation = z.enum([
  "(00/00)",
  "(0/1)",
  "(0/1/2)",
  "(0/1/2/3)",
  "(4.0/1-4.4/5)",
  "(4.5/0)",
  "(5/0)",
]);
export type CfNotation = z.infer<typeof CfNotation>;

export const VakLanguificationTrace = z
  .object({
    cpfNotation: z.enum(["(00/00)", "(4.0/1-4.4/5)"]),
    cfNotation: CfNotation,
    m0Address: z.string().min(1),
    vakLevel: z.enum(["para", "pashyanti", "madhyama", "vaikhari"]),
    diatonicDegree: z.number().int().min(0).max(7),
    modeTonicCf: CfNotation.optional(),
    resonance72Index: z.number().int().min(0).max(71).optional(),
    halfDecanIndex: z.number().int().min(0).max(35).optional(),
    biasWeightsEmpty: z.boolean(),
    recognitionClosed: z.boolean(),
    provenance: z.array(z.string().min(1)),
  })
  .strict();
export type VakLanguificationTrace = z.infer<
  typeof VakLanguificationTrace
>;

export const MathemeHarmonicProfile = z
  .object({
    profileSchemaVersion: z.literal(1),
    profileProvenance: z.record(z.unknown()),
    tickAddress: z.object({
      cycle: z.number().int().nonnegative(),
      subTick: z.number().int().min(0).max(11),
      tick12: z.number().int().min(0).max(11),
      absoluteTick: z.number().int().nonnegative(),
      phase: z.string(),
    }),
    tick: z.number().int().nonnegative(),
    tick12: z.number().int().min(0).max(11),
    cycle: z.number().int().nonnegative(),
    degree720: z.number().int().min(0).max(720),
    degree360: z.number().int().min(0).max(359),
    su2Layer: z.string(),
    phase: z.string(),
    position6: z.number().int().min(0).max(5),
    helix: z.enum(["bimba", "pratibimba"]),
    ratioRole: z.string(),
    lensMode: z.object({
      lens: z.number().int().min(0).max(6),
      mode: z.number().int().min(0).max(11),
    }),
    chromatic: z.record(z.unknown()),
    diatonic: z.record(z.unknown()),
    resonance72: z.record(z.unknown()),
    depositionAnchor: z.record(z.unknown()),
    graphHandle: z.record(z.unknown()),
    audioOctet: z.array(z.number()).length(8),
    nodalQuartet: z.array(z.record(z.unknown())).length(4),
    elements: z.record(z.unknown()),
    planetaryChakral: z.record(z.unknown()),
    binary: z.record(z.unknown()),
    mahamaya: z.record(z.unknown()),
    codonRotationProjection: z.record(z.unknown()),
    qCosmic: z.union([z.number(), z.array(z.number()).length(4)]),
    resonance: z.record(z.unknown()).nullable(),
    conjugateFormCharacter: z.string(),
    privacyClass: z.literal("public-current-context"),
    bedrock: z.record(z.unknown()),
    readinessLedger: z.array(z.record(z.unknown())),
    pointerAnchor: z.record(z.unknown()),
    contextFrames: z.union([
      z.array(z.record(z.unknown())),
      z.record(z.unknown()),
    ]),
    kleinFlip: z.unknown().nullable().optional(),
    anandaVortex: z.unknown().optional(),
    harmonicGrammar: z.unknown().optional(),
    pasuBeingPattern: PasuBeingPatternProjection.optional(),
    anuttaraWitness: AnuttaraWitnessProjection.optional(),
    vakLanguificationTrace: VakLanguificationTrace.optional(),
    s2Anchor: z.unknown().nullable(),
    s3Anchor: z.unknown().nullable(),
    vakAddress: z.unknown().nullable().optional(),
  })
  .strict();
export type MathemeHarmonicProfile = z.infer<typeof MathemeHarmonicProfile>;

export const KernelBridgeConnectionStatus = z.object({
  connected: z.boolean(),
  state: KernelBridgeConnectionState,
  mode: KernelBridgeSubscriptionProfile.or(z.literal("detached")),
  subscriptionMode: KernelBridgeSubscriptionMode.optional(),
  reason: z.string(),
  profileGeneration: z.number().int().nonnegative().nullable().optional(),
});
export type KernelBridgeConnectionStatus = z.infer<
  typeof KernelBridgeConnectionStatus
>;

export const KernelBridgeCachedProfile = z
  .object({
    generation: z.number().int().nonnegative(),
    cachedAtMs: z.number().int().nonnegative(),
    stale: z.boolean(),
    stalenessMs: z.number().int().nonnegative(),
    privacyClass: z.literal("safe-public-current-kernel-tick"),
    profile: z.record(z.unknown()),
  })
  .strict()
  .superRefine((value, ctx) => {
    const raw = JSON.stringify(value.profile);
    for (const key of FORBIDDEN_PRIVATE_PAYLOAD_KEYS) {
      if (raw.includes(`"${key}"`)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `KernelBridgeCachedProfile must not include protected/private field ${key}`,
          path: ["profile", key],
        });
      }
    }
  });
export type KernelBridgeCachedProfile = z.infer<
  typeof KernelBridgeCachedProfile
>;

export const KernelBridgeReadinessSnapshot = z.object({
  state: BridgeReadinessState,
  reason: z.string(),
  profileGeneration: z.number().int().nonnegative().nullable().optional(),
  bridgeReachable: z.boolean().optional(),
  blockerIds: z.array(z.string()).optional(),
  capabilities: z.array(KernelBridgeCapabilityName).optional(),
});
export type KernelBridgeReadinessSnapshot = z.infer<
  typeof KernelBridgeReadinessSnapshot
>;

export const KernelBridgeRuntimeSnapshot = z.object({
  runtimeOwner: z.literal("S0/S0' kernel-bridge runtime"),
  theiaAdapter: z.literal("Theia KernelBridgeAPI dependency-injection adapter"),
  tauriAdapter: z.literal("Tauri 0/1 surface adapter"),
  upstreamSubscriptionCount: z.number().int().nonnegative(),
  subscriberCount: z.number().int().nonnegative(),
  mode: KernelBridgeSubscriptionProfile,
  subscriptionMode: KernelBridgeSubscriptionMode,
  currentProfileGeneration: z.number().int().nonnegative().nullable(),
  cachedProfile: KernelBridgeCachedProfile.nullable(),
  connection: KernelBridgeConnectionStatus,
  readiness: KernelBridgeReadinessSnapshot,
});
export type KernelBridgeRuntimeSnapshot = z.infer<
  typeof KernelBridgeRuntimeSnapshot
>;

export const KernelBridgeEvent = z.object({
  type: KernelBridgeEventType,
  emittedAt: z.number().int().nonnegative(),
  source: z.literal("kernel-bridge"),
  profileGeneration: z.number().int().nonnegative().nullable(),
  privacyClass: KernelBridgePrivacyClass,
  payload: z.record(z.unknown()),
});
export type KernelBridgeEvent = z.infer<typeof KernelBridgeEvent>;

export const KernelBridgeRpcEnvelope = z
  .object({
    method: KernelBridgeCapabilityName,
    params: z.record(z.unknown()),
    privacyClass: KernelBridgePrivacyClass,
    sessionKey: z.string().min(1),
    profileGeneration: z.number().int().nonnegative().nullable(),
    provenanceHandles: z.array(z.string()),
    vakAddress: CanonicalVakAddress,
    routeLineage: z.array(z.string().min(1)).min(3),
  })
  .strict()
  .superRefine((value, ctx) => {
    const raw = JSON.stringify(value.params);
    for (const key of FORBIDDEN_PRIVATE_PAYLOAD_KEYS) {
      if (raw.includes(`"${key}"`)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `KernelBridgeRpcEnvelope params must not include protected/private field ${key}`,
          path: ["params", key],
        });
      }
    }
  });
export type KernelBridgeRpcEnvelope = z.infer<typeof KernelBridgeRpcEnvelope>;

export function validateKernelBridgeRpcEnvelope(
  value: unknown,
): KernelBridgeRpcEnvelope {
  return KernelBridgeRpcEnvelope.parse(value);
}
