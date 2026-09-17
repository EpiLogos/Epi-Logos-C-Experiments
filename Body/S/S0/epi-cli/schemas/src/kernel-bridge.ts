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
  "fieldBody",
  "rawField",
  "rawPersonalCymaticPayload",
  "personalCymaticField",
  "protectedM4Body",
  "journalBody",
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
  "kernelBridge.m2.epogdoonProjection(address72)",
  "kernelBridge.m2.planetaryElementalWeights()",
  "kernelBridge.m2.cymaticMonoPolyState(address72)",
  "kernelBridge.m3.bioquaternionTranscription(codon)",
  "kernelBridge.m3.lensCodonBinary(lensId)",
  "kernelBridge.m3.lensField(lensId)",
]);
export type KernelBridgeCapabilityName = z.infer<
  typeof KernelBridgeCapabilityName
>;

export const KERNEL_BRIDGE_CAPABILITY_NAMES = Object.freeze(
  KernelBridgeCapabilityName.options,
);

export const EpogdoonBridgeProjection = z
  .object({
    compressedCodon: z.number().int().min(0).max(63),
    roundTripLoss: z.boolean(),
    expandedBack: z.number().int().min(0).max(71),
  })
  .strict();
export type EpogdoonBridgeProjection = z.infer<
  typeof EpogdoonBridgeProjection
>;

export const LensCodonBinaryDegree = z
  .object({
    degree360: z.number().int().min(0).max(359),
    exactDegree720: z.number().min(0).max(718),
    codonUpper: z.number().int().min(0).max(3),
    codonLower: z.number().int().min(0).max(3),
    codonClass: z.number().int().min(0).max(3),
    charges: z
      .object({
        pp: z.number(),
        nn: z.number(),
        np: z.number(),
        pn: z.number(),
      })
      .strict(),
    quaternion: z.tuple([
      z.number(),
      z.number(),
      z.number(),
      z.number(),
    ]),
    elementCanonical: z.number().int().min(0).max(5),
    hexagramId: z.number().int().min(0).max(63),
    lineChangeOperator: z.number().int().min(0).max(5),
    tick12: z.number().int().min(0).max(11),
    fibonacciPosition: z.number().int().min(0).max(59),
    fibonacciDigit: z.number().int().min(0).max(9),
    fibonacciPhase01: z.number().min(0).max(1),
  })
  .strict();
export type LensCodonBinaryDegree = z.infer<typeof LensCodonBinaryDegree>;

const M3_I_CHING_VALUE = [6, 9, 7, 8] as const;

export const LensCodonBinaryProjection = z
  .object({
    lensId: z.number().int().min(0).max(16),
    lensRole: z.enum(["primary-ground", "derived-aperture"]),
    groundingLensId: z.literal(16),
    segment: z.array(z.number().int().min(0).max(359)).min(1).max(360),
    perDegree: z.array(LensCodonBinaryDegree).min(1).max(360),
    contract: z.literal("kernelBridge.m3.lensCodonBinary(lensId)"),
    runtimeOwner: z.string().min(1),
    source: z.string().min(1),
  })
  .strict()
  .superRefine((projection, ctx) => {
    const slices = [
      1, 2, 4, 8, 9, 10, 12, 15, 24, 30, 36, 40, 45, 90, 180, 360,
    ] as const;
    const isGround = projection.lensId === 16;
    const slice = isGround ? 6 : slices[projection.lensId];
    const expectedSections = 360 / slice;
    const expectedRole = isGround ? "primary-ground" : "derived-aperture";
    if (projection.lensRole !== expectedRole) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `lensId ${projection.lensId} requires role ${expectedRole}`,
        path: ["lensRole"],
      });
    }
    if (
      projection.segment.length !== expectedSections ||
      projection.perDegree.length !== expectedSections
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `lensId ${projection.lensId} requires ${expectedSections} boundary records`,
        path: ["segment"],
      });
    }

    projection.perDegree.forEach((degree, index) => {
      const expectedDegree = index * slice;
      const expectedQuaternion = [
        degree.charges.pp,
        degree.charges.nn,
        degree.charges.np,
        degree.charges.pn,
      ];
      const chargeSum =
        degree.charges.pp +
        degree.charges.nn +
        degree.charges.np +
        degree.charges.pn;
      const valid =
        projection.segment[index] === expectedDegree &&
        degree.degree360 === expectedDegree &&
        degree.exactDegree720 === expectedDegree * 2 &&
        degree.fibonacciPosition === Math.floor(expectedDegree / 6) &&
        degree.fibonacciPhase01 === (expectedDegree % 6) / 6 &&
        degree.quaternion.every(
          (component, componentIndex) =>
            component === expectedQuaternion[componentIndex],
        ) &&
        chargeSum ===
          4 * M3_I_CHING_VALUE[(degree.hexagramId >> 4) & 0x03];
      if (!valid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "degree record violates the C-authored codon projection law",
          path: ["perDegree", index],
        });
      }
    });
  });
export type LensCodonBinaryProjection = z.infer<
  typeof LensCodonBinaryProjection
>;

// ---- kernelBridge.m3.lensField(lensId) — the generic lens-field dynamic ----
// Mirrors portal-core src/lens_field.rs (+ pleroma_lens.rs instance packet).
// Structure + live activation for any functional lens 0..16; the pleromatic
// symbolic system decorates lens 6 ONLY. Laws are proven kernel-side
// (lens_field_generic_laws.rs); this schema is the wire contract.

export const LensFieldElement = z.enum(["fire", "earth", "air", "water"]);
export type LensFieldElement = z.infer<typeof LensFieldElement>;

export const LensFieldTopology = z.discriminatedUnion("kind", [
  z
    .object({
      kind: z.literal("diameter-paired"),
      channels: z.number().int().min(1).max(180),
    })
    .strict(),
  z.object({ kind: z.literal("boundary-opposed") }).strict(),
  z.object({ kind: z.literal("self-opposed") }).strict(),
]);

export const LensFieldGroundQuantization = z.discriminatedUnion("kind", [
  z
    .object({
      kind: z.literal("integral"),
      stepsPerSegment: z.number().int().min(1).max(60),
    })
    .strict(),
  z.object({ kind: z.literal("fractional") }).strict(),
]);

export const LensFieldSegment = z
  .object({
    segment: z.number().int().min(0).max(359),
    startDegree: z.number().int().min(0).max(359),
    midpoint720: z.number().int().min(0).max(719),
    element: LensFieldElement,
  })
  .strict();

export const LensFieldStructure = z
  .object({
    lensId: z.number().int().min(0).max(16),
    groundingLensId: z.literal(16),
    slice: z.number().int().min(1).max(360),
    sections: z.number().int().min(1).max(360),
    topology: LensFieldTopology,
    groundQuantization: LensFieldGroundQuantization,
    segments: z.array(LensFieldSegment).min(1).max(360),
  })
  .strict();

export const LensFieldPlanetLanding = z
  .object({
    planetId: z.number().int().min(1).max(9),
    segment: z.number().int().min(0).max(359),
    element: z.enum(["aether", "air", "fire", "water", "earth"]),
    couEnergy: z.number().nonnegative(),
    akashaCarrier: z.boolean(),
  })
  .strict();

export const LensFieldChannelBalance = z
  .object({
    channel: z.number().int().min(0).max(179),
    priorSegment: z.number().int().min(0).max(359),
    consortSegment: z.number().int().min(0).max(359),
    priorElement: LensFieldElement,
    consortElement: LensFieldElement,
    signedBalance: z.number(),
  })
  .strict();

export const LensFieldActivation = z
  .object({
    lensId: z.number().int().min(0).max(16),
    positionedOrbiters: z.number().int().min(0).max(9),
    weightsTotal: z
      .object({
        fire: z.number(),
        water: z.number(),
        air: z.number(),
        earth: z.number(),
      })
      .strict(),
    landings: z.array(LensFieldPlanetLanding).max(9),
    channelBalances: z.array(LensFieldChannelBalance).max(180),
    akashaPresence: z.number().nonnegative(),
    akashaEpsilon: z.number().positive(),
    akashaCondition: z.boolean().nullable(),
  })
  .strict();

export const PleromaSeat = z
  .object({
    segment: z.number().int().min(0).max(29),
    aeon: z.string().min(1),
    meaning: z.string().min(1),
    emanationIndex: z.number().int().min(1).max(30),
    arc: z.enum(["ogdoad", "decad", "dodecad"]),
    syzygy: z.number().int().min(0).max(14),
    prior: z.boolean(),
    element: LensFieldElement,
    fibonacciPositions: z.tuple([
      z.number().int().min(0).max(59),
      z.number().int().min(0).max(59),
    ]),
    fibonacciDigits: z.tuple([
      z.number().int().min(0).max(9),
      z.number().int().min(0).max(9),
    ]),
  })
  .strict();

export const PleromaSyzygy = z
  .object({
    syzygy: z.number().int().min(0).max(14),
    diameter: z.number().int().min(0).max(14),
    arc: z.enum(["ogdoad", "decad", "dodecad"]),
    priorAeon: z.string().min(1),
    consortAeon: z.string().min(1),
    priorElement: LensFieldElement,
    consortElement: LensFieldElement,
    digitSum: z.number().int().min(0).max(40),
    threshold: z.boolean(),
  })
  .strict();

export const PleromaSymbolicSystem = z
  .object({
    kind: z.literal("pleroma"),
    layout: z.enum(["interleaved456", "emanation"]),
    seats: z.array(PleromaSeat).length(30),
    syzygies: z.array(PleromaSyzygy).length(15),
  })
  .strict();

export const LensFieldProjection = z
  .object({
    contract: z.literal("kernelBridge.m3.lensField(lensId)"),
    runtimeOwner: z.string().min(1),
    source: z.string().min(1),
    lensId: z.number().int().min(0).max(16),
    structure: LensFieldStructure,
    activation: LensFieldActivation,
    balanceQuaternion: z.tuple([z.number(), z.number(), z.number(), z.number()]),
    symbolicSystem: PleromaSymbolicSystem.nullable(),
  })
  .strict()
  .superRefine((projection, ctx) => {
    const { structure, activation, symbolicSystem, lensId } = projection;
    if (structure.lensId !== lensId || activation.lensId !== lensId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "structure/activation lensId must match the projection lensId",
        path: ["lensId"],
      });
    }
    if (structure.slice * structure.sections !== 360) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "slice x sections must tile the 360",
        path: ["structure", "slice"],
      });
    }
    if (structure.segments.length !== structure.sections) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "one segment record per section",
        path: ["structure", "segments"],
      });
    }
    const expectedTopology =
      structure.sections === 1
        ? "self-opposed"
        : structure.sections % 2 === 0
          ? "diameter-paired"
          : "boundary-opposed";
    if (structure.topology.kind !== expectedTopology) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `sections ${structure.sections} requires ${expectedTopology} topology`,
        path: ["structure", "topology"],
      });
    }
    if (lensId === 6) {
      if (!symbolicSystem) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "the pleromatic symbolic system is seated at lens 6",
          path: ["symbolicSystem"],
        });
      } else {
        const digitTotal = symbolicSystem.syzygies.reduce(
          (sum, syzygy) => sum + syzygy.digitSum,
          0,
        );
        if (digitTotal !== 280) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "syzygy digit sums must decompose the full Pisano 280",
            path: ["symbolicSystem", "syzygies"],
          });
        }
      }
    } else if (symbolicSystem) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "no symbolic system is seated at this lens",
        path: ["symbolicSystem"],
      });
    }
  });
export type LensFieldProjection = z.infer<typeof LensFieldProjection>;

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

/** Mythos's named pattern for a protein — a reference to the kernel's Major
 *  Arcana card index (0..21), never a local deck (additive, 4.17). */
export const MajorArcanaCardRef = z
  .object({
    cardId: z.number().int().min(0).max(21),
    label: z.string().min(1).optional(),
  })
  .strict();
export type MajorArcanaCardRef = z.infer<typeof MajorArcanaCardRef>;

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
    startPacketRef: z.string().min(1).optional(),
    stopPacketRef: z.string().min(1).optional(),
    kairosOpen: z.string().min(1).optional(),
    kairosClose: z.string().min(1).optional(),
    mythosArchetypeReading: MajorArcanaCardRef.optional(),
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
    isOrfSeed: z.boolean().optional(),
    isOrfSeal: z.boolean().optional(),
    sessionIdRef: z.string().min(1).optional(),
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

/** Track 36 / 10.P5 — the 0/1 → 5 runtime hinge, first-class on the bus.
 *  Mirror of portal-core `kernel/projections/pentadic_trace.rs`. Every field
 *  is a kernel derivation (`from_profile`); renderers never recompute 72→64,
 *  24×15, codon, or line-change values. */
const ThirdSpandaRoutingAxisViews = z
  .object({
    mef: z
      .object({
        lens: z.number().int().min(0).max(11),
        position: z.number().int().min(0).max(5),
        isInverted: z.boolean(),
        lFamilyLink: z.number().int().min(0).max(5),
      })
      .strict(),
    tattva: z
      .object({
        tattvaIndex: z.number().int().min(0).max(35),
        phase: z.number().int().min(0).max(1),
      })
      .strict(),
    decan: z
      .object({
        elementId: z.number().int().nonnegative(),
        sign: z.number().int().min(0).max(2),
        decan: z.number().int().min(0).max(2),
        face: z.number().int().min(0).max(1),
        rulingPlanet: z.number().int().nonnegative(),
      })
      .strict(),
    shem: z
      .object({
        shemIdx: z.number().int().min(0).max(71),
        choir: z.number().int().min(0).max(7),
        position: z.number().int().min(0).max(8),
        elementId: z.number().int().nonnegative(),
        decanLink: z.number().int().min(0).max(71),
      })
      .strict(),
    maqam: z
      .object({
        index72: z.number().int().min(0).max(71),
        family: z.number().int().nonnegative(),
        modeInFamily: z.number().int().nonnegative(),
        planetRuler: z.number().int().nonnegative(),
      })
      .strict(),
    det: z
      .object({
        index72: z.number().int().min(0).max(71),
        compressed64: z.number().int().min(0).max(63),
        det64: z.number().int().nonnegative(),
      })
      .strict(),
  })
  .strict();

const ThirdSpandaCodonRotation = z
  .object({
    lens: z.number().int().min(0).max(11),
    mode: z.number().int().min(0).max(6),
    lensLabel: z.string().min(1),
    modeName: z.string().min(1),
    surfaceIndex: z.number().int().nonnegative(),
    codonId: z.number().int().min(0).max(63),
    codon: z.string().min(1),
    codonClass: z.string().min(1),
    rotation: z.number().int().nonnegative(),
    rotationalStateCount: z.number().int().positive(),
    rotationDegrees: z.number().int().nonnegative(),
    reverseLens: z.number().int().min(0).max(11),
    reverseMode: z.number().int().min(0).max(6),
    datasetLutState: z.string().min(1),
    provenance: z.string().min(1),
  })
  .strict();

const ThirdSpandaRuntimeTrace = z
  .object({
    m1: z
      .object({
        priorGround: z.string().min(1),
        parentAttribution: z.literal("M1-5 is the +1 parent"),
        degree720: z.number().int().min(0).max(719),
        hopfFiber: z.number().int().nonnegative(),
        ringQuaternion: z.tuple([
          z.number(),
          z.number(),
          z.number(),
          z.number(),
        ]),
        advancementAddress64: z.number().int().min(0).max(63),
      })
      .strict(),
    m2: z
      .object({
        address72: z.number().int().min(0).max(71),
        axisViews: ThirdSpandaRoutingAxisViews,
      })
      .strict(),
    epogdoon: z
      .object({
        ratioNumerator: z.literal(9),
        ratioDenominator: z.literal(8),
        sourceAddress72: z.number().int().min(0).max(71),
        blockIndex: z.number().int().min(0).max(7),
        blockPhase: z.number().int().min(0).max(8),
        compressedAddress64: z.number().int().min(0).max(63),
        expandedAddress72: z.number().int().min(0).max(70),
        roundTripExact: z.boolean(),
        roundTripLoss: z.number().int().min(0).max(1),
        collision: z
          .object({
            ordinal: z.number().int().min(0).max(7),
            sourcePair72: z.tuple([
              z.number().int().min(0).max(63),
              z.number().int().min(1).max(64),
            ]),
            activeRole: z.enum(["first-source", "second-source"]),
          })
          .strict()
          .nullable(),
        cardinality: z
          .object({
            blockSize: z.literal(9),
            blockCount: z.literal(8),
            collisionPairCount: z.literal(8),
            exactRoundTripCount: z.literal(8),
            nonExactRoundTripCount: z.literal(64),
          })
          .strict(),
      })
      .strict(),
    m3: z
      .object({
        detReceptionAddress64: z.number().int().min(0).max(63),
        worldClockAddress64: z.number().int().min(0).max(63),
        codonId: z.number().int().min(0).max(63),
        codon: z.string().min(1),
        codonRotation: ThirdSpandaCodonRotation,
        transcriptionState: z.enum([
          "round-trip-anchor",
          "compressed-nonexact-round-trip",
        ]),
        lineChangeOperator: z.number().int().min(0).max(383),
      })
      .strict(),
  })
  .strict();

export const AnuttaraPentadicRuntimeTrace = z
  .object({
    tick: z.number().int().nonnegative(),
    tick12: z.number().int().min(0).max(11),
    helix: z.number().int().min(0).max(1),
    position6: z.number().int().min(0).max(5),
    sourceBinaryState: z.enum(["0", "1", "0/1"]),
    wholeNumberEndpoint: z.literal(5),
    naturalNumberEndpoint: z.literal(6),
    familyBComplement: z.tuple([
      z.number().int().min(0).max(5),
      z.number().int().min(0).max(5),
    ]),
    shemDegreeQuantum: z.literal(5),
    resonance72Index: z.number().int().min(0).max(71),
    degree360: z.number().int().min(0).max(359),
    m2ToM3Symbol: z.number().int().min(0).max(63),
    mahamayaAddress64: z.number().int().min(0).max(63),
    codonId: z.number().int().min(0).max(63),
    codon: z.string().min(1),
    lineChangeOperator: z.number().int().min(0).max(383),
    pairedMahamayaFifteens: z.tuple([z.literal(15), z.literal(15)]),
    backboneIdentity: z.literal("24x15=360"),
    lineGraphIdentity: z.literal("360+24=384"),
    qCosmicRef: z.string().min(1),
    qComposedHandle: z.string().min(1).optional(),
    learnedPredictorCheckpointRef: z.string().min(1).optional(),
    thirdSpanda: ThirdSpandaRuntimeTrace,
    provenance: z.array(z.string().min(1)),
  })
  .strict();
export type AnuttaraPentadicRuntimeTrace = z.infer<
  typeof AnuttaraPentadicRuntimeTrace
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
    provenance: z.array(z.string().min(1)).min(1),
  })
  .strict()
  .superRefine((trace, ctx) => {
    const addresses: Record<CfNotation, string> = {
      "(00/00)": "M0-2:00/00",
      "(0/1)": "M0-1/M0-3/M0-4/M0-5:(0/1)",
      "(0/1/2)": "M0-4.0/1/2",
      "(0/1/2/3)": "M0-4.0/1/2/3",
      "(4.0/1-4.4/5)": "M0-4",
      "(4.5/0)": "M0-4.5/0",
      "(5/0)": "M0-5",
    };
    const dialogical = trace.cpfNotation === "(00/00)";
    const expectedLevel = dialogical
      ? "para"
      : trace.cfNotation === "(5/0)" && trace.recognitionClosed
        ? "vaikhari"
        : ["(0/1)", "(0/1/2)", "(0/1/2/3)"].includes(trace.cfNotation)
          ? "pashyanti"
          : "madhyama";
    const issue = (path: string, message: string) =>
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: [path], message });

    if (trace.m0Address !== addresses[trace.cfNotation]) {
      issue("m0Address", "m0Address must match the canonical CF address");
    }
    if (trace.biasWeightsEmpty !== dialogical) {
      issue(
        "biasWeightsEmpty",
        "biasWeightsEmpty must reflect the dialogical S2 retrieval policy",
      );
    }
    if (trace.vakLevel !== expectedLevel) {
      issue("vakLevel", `vakLevel must be ${expectedLevel} for this descent state`);
    }
    if (
      trace.vakLevel === "vaikhari" &&
      (!trace.recognitionClosed ||
        trace.cfNotation !== "(5/0)" ||
        trace.diatonicDegree !== 0)
    ) {
      issue(
        "recognitionClosed",
        "Vaikhari requires recognized (5/0) closure at octave-return degree 0",
      );
    }
    if (
      trace.halfDecanIndex !== undefined &&
      (trace.resonance72Index === undefined ||
        trace.halfDecanIndex !== Math.floor(trace.resonance72Index / 2))
    ) {
      issue(
        "halfDecanIndex",
        "halfDecanIndex must be floor(resonance72Index / 2)",
      );
    }
  });
export type VakLanguificationTrace = z.infer<
  typeof VakLanguificationTrace
>;

export const ProfileVakAddress = z
  .object({
    cpf: z.enum(["(00/00)", "(4.0/1-4.4/5)"]),
    ct: z.array(z.string().min(1)),
    cp: z.string().min(1),
    cf: CfNotation,
    cfp: z.string().min(1),
    cs: z
      .object({
        code: z.string().min(1),
        direction: z.enum(["Day", "Night'"]),
        recognized: z.boolean().optional(),
      })
      .strict(),
  })
  .strict();
export type ProfileVakAddress = z.infer<typeof ProfileVakAddress>;

// --- Modal resonator / bell kernel (bell-kernel spec §4) -------------------
// The modal/bell interpretation of the 8+4 bus. Mirrors
// portal-core/src/kernel/projections/modal_resonator.rs exactly; the bus
// (audioOctet / nodalQuartet) stays the only pitch/nodal authority.

export const BellPartialRoleName = z.enum([
  "hum",
  "prime",
  "tierce",
  "quint",
  "nominal",
  "upper",
  "warble",
  "residue",
]);
export type BellPartialRoleName = z.infer<typeof BellPartialRoleName>;

export const ModalLensMode = z
  .object({
    // Rust MathemeLensMode law: lens 0..11, mode 0..6 (12 lenses × 7 modes).
    lens: z.number().int().min(0).max(11),
    mode: z.number().int().min(0).max(6),
    lensModeIndex: z.number().int().min(0).max(83),
  })
  .strict()
  .refine((value) => value.lensModeIndex === value.lens * 7 + value.mode, {
    message: "lensModeIndex must equal lens * 7 + mode",
  });
export type ModalLensMode = z.infer<typeof ModalLensMode>;

export const ModalM2Address72 = z
  .object({
    address72: z.number().int().min(0).max(71),
    lensAnchorIndex: z.number().int().min(0).max(71),
    tick12: z.number().int().min(0).max(11),
    position: z.number().int().min(0).max(5),
    source: z.literal("MathemeHarmonicProfile.resonance72.lensAnchorIndex"),
  })
  .strict()
  .refine((value) => value.address72 === value.lensAnchorIndex, {
    message: "address72 must equal resonance72.lensAnchorIndex",
  });
export type ModalM2Address72 = z.infer<typeof ModalM2Address72>;

export const ModalChromaticSlot = z
  .object({
    pitchClass: z.number().int().min(0).max(11),
    note: z.string().min(1),
    isDiatonic: z.boolean(),
    diatonicDegree: z.number().int().min(1).max(7).nullable(),
    octetIndices: z.array(z.number().int().min(0).max(7)),
    nodalRoles: z.array(z.number().int().min(0).max(3)),
    silentAnchorRole: z.number().int().min(0).max(4).nullable(),
    mirror: z.number().int().min(0).max(11),
  })
  .strict();
export type ModalChromaticSlot = z.infer<typeof ModalChromaticSlot>;

export const ModalOctetCarrier = z
  .object({
    octetIndex: z.number().int().min(0).max(7),
    hz: z.number().positive(),
    qlPosition: z.number().int().min(1).max(4),
    helix: z.enum(["bimba", "pratibimba"]),
    pitchClass: z.number().int().min(0).max(11),
  })
  .strict();
export type ModalOctetCarrier = z.infer<typeof ModalOctetCarrier>;

export const ModalNodalAnchor = z
  .object({
    quartetIndex: z.number().int().min(0).max(3),
    qlPosition: z.number().int(),
    helix: z.enum(["bimba", "pratibimba"]),
    m: z.number().int().min(1).max(12),
    n: z.number().int().min(1).max(12),
    pitchClass: z.number().int().min(0).max(11),
    role: z.enum([
      "bimba-p0-anchor",
      "bimba-p5-anchor",
      "pratibimba-p0-anchor",
      "pratibimba-p5-anchor",
    ]),
  })
  .strict();
export type ModalNodalAnchor = z.infer<typeof ModalNodalAnchor>;

export const ModalDiatonicRole = z
  .object({
    pitchClass: z.number().int().min(0).max(11),
    degree: z.number().int().min(1).max(7),
    note: z.string().min(1),
    contextFrame: z.string().min(1),
    contextAgent: z.string().min(1),
  })
  .strict();
export type ModalDiatonicRole = z.infer<typeof ModalDiatonicRole>;

export const ModalSilentAnchor = z
  .object({
    pitchClass: z.number().int().min(0).max(11),
    silentIndex: z.number().int().min(0).max(4),
    note: z.string().min(1),
  })
  .strict();
export type ModalSilentAnchor = z.infer<typeof ModalSilentAnchor>;

export const BellPartialRole = z
  .object({
    octetIndex: z.number().int().min(0).max(7),
    role: BellPartialRoleName,
  })
  .strict();
export type BellPartialRole = z.infer<typeof BellPartialRole>;

export const ModalResonatorProfile = z
  .object({
    schemaVersion: z.literal(1),
    source: z.literal("MathemeHarmonicProfile"),
    tick: z.number().int().nonnegative(),
    tick12: z.number().int().min(0).max(11),
    degree720: z.number().int().min(0).max(720),
    lensMode: ModalLensMode,
    m2Address72: ModalM2Address72,
    chromaticBody: z.array(ModalChromaticSlot).length(12),
    liveOctet: z.array(ModalOctetCarrier).length(8),
    nodalQuartet: z.array(ModalNodalAnchor).length(4),
    diatonicSet: z.array(ModalDiatonicRole).length(7),
    silentComplement: z.array(ModalSilentAnchor).length(5),
    bellPartials: z.array(BellPartialRole).length(8),
    cymaticMaterial: z
      .object({
        mode: z.string().min(1),
        antinodalDriver: z.literal("MathemeHarmonicProfile.audio_octet"),
        boundaryConstraint: z.literal("MathemeHarmonicProfile.nodal_quartet"),
      })
      .strict(),
    privacyClass: z.literal("public-current-context"),
    authority: z
      .object({
        pitch: z.literal("MathemeHarmonicProfile.audio_octet"),
        nodal: z.literal("MathemeHarmonicProfile.nodal_quartet"),
      })
      .strict(),
    sourceFields: z
      .object({
        activeChromatic: z.literal("MathemeHarmonicProfile.chromatic"),
        activeDiatonicContext: z.literal("MathemeHarmonicProfile.diatonic"),
        resonance72: z.literal("MathemeHarmonicProfile.resonance72"),
      })
      .strict(),
  })
  .strict()
  .refine(
    (value) =>
      value.bellPartials.every((partial, index) => partial.octetIndex === index),
    { message: "bellPartials[i].octetIndex must equal i" },
  );
export type ModalResonatorProfile = z.infer<typeof ModalResonatorProfile>;

/// Live Kerykeion sky projection (cosmic-clock §5.2/§5.3), mirrored from
/// portal-core LivePlanetProjection. Attached by the gateway heartbeat only
/// when the kairos cache is fresh and complete.
export const LivePlanetProjection = z
  .object({
    planetId: z.number().int().min(0).max(9),
    degree: z.number().min(0).max(360),
    fibonacciPosition: z.number().int().min(0).max(59).optional(),
    retrograde: z.boolean(),
    decan36: z.number().int().min(0).max(35),
    decanRuler: z.number().int().min(0).max(9),
    isResonance: z.boolean(),
    elementId: z.number().int().nonnegative(),
    keplerianVel: z.number().int().nonnegative(),
  })
  .strict();
export type LivePlanetProjection = z.infer<typeof LivePlanetProjection>;

export const CymaticSphereChakraProjection = z
  .object({
    chakraId: z.number().int().min(0).max(7),
    name: z.string().min(1),
    elementId: z.number().int().min(0).max(4).nullable(),
    tattvaIndex: z.number().int().min(0).max(35).nullable(),
    meaningId: z.number().int().min(0x0380).max(0x0387),
    harmonic: z
      .object({
        degree: z.number().int().min(1),
        order: z.number().int().min(1),
        amplitudeHz: z.number().positive(),
        qlPosition: z.number().int().min(0).max(5),
        helix: z.enum(["bimba", "pratibimba"]),
      })
      .strict(),
    provenance: z.literal(
      "M2_CHAKRA_LUT[8] + profile audioOctet/nodalQuartet",
    ),
  })
  .strict();

export const CymaticPlanetAnchorProjection = z
  .object({
    planetId: z.number().int().min(0).max(9),
    name: z.string().min(1),
    degree: z.number().min(0).max(360),
    retrograde: z.boolean(),
    elementId: z.number().int().min(0).max(4),
    provenance: z.literal("M2_PLANET_LUT[10] + Kerykeion live sky"),
  })
  .strict();

export const CymaticSpheresProjection = z
  .object({
    chakras: z.array(CymaticSphereChakraProjection).length(8),
    earthObserver: z
      .object({
        ordinal: z.literal(10),
        name: z.literal("Earth"),
        role: z.literal("observer-centre"),
        position: z.tuple([z.literal(0), z.literal(0), z.literal(0)]),
        provenance: z.literal("EarthBodyState + DR-M2-1/DCC-03"),
      })
      .strict(),
    sun: CymaticPlanetAnchorProjection,
    activePlanet: CymaticPlanetAnchorProjection,
    epogdoonRatio: z.literal("9:8"),
    provenance: z.literal("portal-core::f_routing + M2 substrate projection"),
  })
  .strict()
  .superRefine((projection, ctx) => {
    projection.chakras.forEach((chakra, index) => {
      if (chakra.chakraId !== index) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `chakra row ${index} must carry chakraId ${index}`,
          path: ["chakras", index, "chakraId"],
        });
      }
    });
    if (projection.sun.planetId !== 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "sun anchor must carry canonical planetId 0",
        path: ["sun", "planetId"],
      });
    }
  });
export type CymaticSpheresProjection = z.infer<
  typeof CymaticSpheresProjection
>;

/// Handle-only quintessence identity summary (Sprint-8 E6, DR-M4-3; mirrors
/// portal-core kernel/profile.rs QuintessenceProjection). Only handles cross:
/// the natal clock address (hash-derived), weight, enrichment honesty, an
/// 8-hex hash preview, and the elemental quaternion ([w=Earth, x=Fire,
/// y=Water, z=Air] — public-safe elemental-balance class). Never the 32-byte
/// hash, natal chart, or per-layer identity profiles.
export const QuintessenceProjection = z
  .object({
    natalDegree: z.number().int().min(0).max(359),
    natalTick12: z.number().int().min(0).max(11),
    natalFibonacciPosition: z.number().int().min(0).max(59).optional(),
    quintessenceWeight: z.number().min(0).max(1),
    layerCount: z.number().int().min(0).max(5),
    partial: z.boolean(),
    hashPreview: z.string().regex(/^[0-9a-f]{8}$/),
    quintessenceQuaternion: z.array(z.number()).length(4),
    authority: z.string().min(1),
  })
  .strict();
export type QuintessenceProjection = z.infer<typeof QuintessenceProjection>;

/// Sprint-8 E1+E3 phase-space law (portal-core projections/phase_space.rs;
/// C authority epi-lib CLOCK_DEGREE_LUT, 384 = 360 + 24 = 64×6). The carried
/// tick across one of the 16 clock division apertures.
export const PhaseSpaceLensSegmentPhase = z
  .object({
    lensIndex: z.number().int().min(0).max(15),
    slice: z.number().int().min(1).max(360),
    sections: z.number().int().min(1).max(360),
    name: z.string().min(1),
    temporalCanon: z.boolean(),
    segment: z.number().int().min(0).max(359),
    degreeInSegment: z.number().int().min(0).max(359),
    phase01: z.number().min(0).max(1),
  })
  .strict();
export type PhaseSpaceLensSegmentPhase = z.infer<
  typeof PhaseSpaceLensSegmentPhase
>;

/// The typed view of one C `Clock_Degree_Entry` plus the computed 16-lens
/// membership (u16 because Microscopic has 360 segments — the spec's uint8_t
/// erratum is flagged in phase_space.rs).
export const PhaseSpaceClockDegreeNode = z
  .object({
    degree360: z.number().int().min(0).max(359),
    // exact_degree_720 = degree * 2 → even values in [0, 718]
    exactDegree720: z.number().min(0).max(718),
    zodiacSign: z.number().int().min(0).max(11),
    zodiacDegree: z.number().int().min(0).max(29),
    decan36: z.number().int().min(0).max(35),
    decanPosition: z.number().int().min(0).max(9),
    isBackboneNode: z.boolean(),
    // m3.h domain law (E3 verifier tightening): hexagram 0-63, line 0-5
    hexagramId: z.number().int().min(0).max(63),
    hexagramLineActive: z.number().int().min(0).max(5),
    isNonDualCodon: z.boolean(),
    // 0=perfect, 1=imperfect, 2=non-palindromic-non-dual, 3=dual
    codonClass: z.number().int().min(0).max(3),
    codonUpperPair: z.number().int().min(0).max(3),
    codonLowerPair: z.number().int().min(0).max(3),
    // 0-55 Minor Arcana; 0 = dataset-unavailable (honest pending state)
    tarotCardId: z.number().int().min(0).max(55),
    decanPlanet: z.number().int().min(0).max(9),
    decanElement: z.number().int().min(0).max(4),
    decanChakra: z.number().int().min(0).max(7),
    degreeTick12: z.number().int().min(0).max(11),
    strand: z.number().int().min(0).max(1),
    drRing: z.number().int().min(0).max(1),
    m1AnandaValue: z.number().int().min(0).max(255),
    m0Archetype: z.number().int().min(0).max(11),
    // shadow_degree = degree + 360 (SU(2) double-cover) → always 360-719
    shadowDegree: z.number().int().min(360).max(719),
    polarOpposite: z.number().int().min(0).max(359),
    enneadicChamber: z.number().int().min(0).max(8),
    chamberDayNight: z.number().int().min(0).max(1),
    lensSegment: z.array(z.number().int().min(0).max(359)).length(16),
  })
  .strict();
export type PhaseSpaceClockDegreeNode = z.infer<
  typeof PhaseSpaceClockDegreeNode
>;

/// The two planes of the 720 double-cover: the primary/explicate traversal
/// reads the degree's codon valence, the shadow/implicate its hexagram face.
export const PhaseSpaceValence = z.discriminatedUnion("kind", [
  z
    .object({
      kind: z.literal("codon"),
      upperPair: z.number().int().min(0).max(3),
      lowerPair: z.number().int().min(0).max(3),
      codonClass: z.number().int().min(0).max(3),
      isNonDual: z.boolean(),
    })
    .strict(),
  z
    .object({
      kind: z.literal("hexagram"),
      hexagramId: z.number().int().min(0).max(63),
      lineActive: z.number().int().min(0).max(5),
    })
    .strict(),
]);
export type PhaseSpaceValence = z.infer<typeof PhaseSpaceValence>;

/// The +1 Level-0 aperture: functional lens 16 and the primary Ground through
/// which the sixteen derived static division lenses are addressed.
export const PhaseSpaceFibonacciGround = z
  .object({
    lensId: z.literal(16),
    role: z.literal("primary-ground"),
    slice: z.literal(6),
    sections: z.literal(60),
    position: z.number().int().min(0).max(59),
    digit: z.number().int().min(0).max(9),
    digitLut: z.array(z.number().int().min(0).max(9)).length(60).optional(),
    backboneDegrees: z
      .array(z.number().int().min(0).max(359))
      .length(24)
      .optional(),
    phase01: z.number().min(0).max(1),
    temporalCanon: z.boolean(),
  })
  .strict();
export type PhaseSpaceFibonacciGround = z.infer<
  typeof PhaseSpaceFibonacciGround
>;

export const PhaseSpaceAddress = z
  .object({
    degree720: z.number().int().min(0).max(719),
    degree360: z.number().int().min(0).max(359),
    plane: z.enum(["primary-codon", "shadow-hexagram"]),
    activeValence: PhaseSpaceValence,
    node: PhaseSpaceClockDegreeNode,
    lensCarrier: z.array(PhaseSpaceLensSegmentPhase).length(16),
    fibonacciGround: PhaseSpaceFibonacciGround,
    authority: z.string().min(1),
  })
  .strict();
export type PhaseSpaceAddress = z.infer<typeof PhaseSpaceAddress>;

// --- Klein-flip event (typed 2026-07-06, computational-core truth session) --
// Mirrors portal-core/src/events/flip_events.rs KleinFlipEvent — the ONE
// three-variant union (DR-IG-2) serialized with serde tag "kind", camelCase.
// Fires from the Vimarśa detector at ticks 6/7/8 (M1 tritone crossing at the
// lens N↔N+3 boundary, M2 cymatic valence inversion, M3 codon-rotation
// cross); null on all other ticks. Discharges the T12 z.unknown() hole for
// the quaternionic flip field.

export const KleinFlipValence = z.enum(["primary", "inverted"]);
export type KleinFlipValence = z.infer<typeof KleinFlipValence>;

export const KleinFlipEvent = z.discriminatedUnion("kind", [
  z
    .object({
      kind: z.literal("m1TritoneCrossing"),
      tick12: z.number().int().min(0).max(11),
      // Rust (u8, u8) tuple — the tritone lens pair, serialized as a 2-array.
      lensPair: z.tuple([
        z.number().int().min(0).max(11),
        z.number().int().min(0).max(11),
      ]),
    })
    .strict(),
  z
    .object({
      kind: z.literal("m2CymaticValenceInvert"),
      valenceBefore: KleinFlipValence,
      valenceAfter: KleinFlipValence,
    })
    .strict(),
  z
    .object({
      kind: z.literal("m3CodonRotationCross"),
      codonBefore: z.number().int().min(0).max(63),
      codonAfter: z.number().int().min(0).max(63),
    })
    .strict(),
]);
export type KleinFlipEvent = z.infer<typeof KleinFlipEvent>;

// --- Always-on profile projections (T12 hardening, 2026-07-06) --------------
// Typed from the REAL wire (plan.runs/wire-captures 2026-07-06 capture) plus
// the Rust authorities: portal-core kernel/profile.rs and
// kernel/projections/{ananda_vortex,harmonic_grammar,bedrock,context_frame_web}.rs.
// These discharge the remaining z.unknown()/z.record(z.unknown()) holes for
// fields the gateway emits on EVERY profile frame.

/// Ananda vortex (ananda_vortex.rs) — the 12x6 M1 matrix walk.
/// Laws pinned by the live-wire manifest: activeCell = (tick12, position6),
/// kleinFlipAtThisTick = (tick12 == 5), helixSheet = degree720 >= 360,
/// drRingPhase from the Vedic {1,2,4,8,7,5}/{3,6,9} rings.
export const AnandaMatrixOp = z.enum([
  "bimba",
  "pratibimba",
  "sum",
  "diff-a",
  "diff-b",
  "quintessence",
]);
export type AnandaMatrixOp = z.infer<typeof AnandaMatrixOp>;

export const AnandaSkeletonEvent = z.enum([
  "Hit36",
  "Hit64",
  "Hit72",
  "Ratio64Over36",
  "Additive137",
  "IdentityReturn4Plus2",
]);
export type AnandaSkeletonEvent = z.infer<typeof AnandaSkeletonEvent>;

export const AnandaVortexCell = z
  .object({
    family: AnandaMatrixOp,
    rowK: z.number().int().min(0).max(11),
    positionP: z.number().int().min(0).max(11),
    rawValue: z.number().int().nullable(),
    rawBimba: z.number().int(),
    rawPratibimba: z.number().int(),
    rawSum: z.number().int(),
    rawDelta: z.number().int(),
    drValue: z.number().int().min(0).max(9).nullable(),
    drBimba: z.number().int().min(0).max(9),
    drPratibimba: z.number().int().min(0).max(9),
    drSum: z.number().int().min(0).max(9),
    ruleValue: z.string().min(1).nullable(),
    skeletonEvent: AnandaSkeletonEvent.nullable(),
  })
  .strict();
export type AnandaVortexCell = z.infer<typeof AnandaVortexCell>;

export const DrRingPhase = z
  .object({
    // Vedic doubling ring {1,2,4,8,7,5} / trinity ring {3,6,9}.
    mahamayaIdx: z.number().int().min(1).max(9),
    parashaktiIdx: z.number().int().min(3).max(9),
  })
  .strict();
export type DrRingPhase = z.infer<typeof DrRingPhase>;

// FR 2.1.10 seat semantics — the M0-3 number-dozen binding, carried once
// per projection (column semantics, not per-cell payload). Positions 0-9
// are the archetypal numbers (seats skip M0-3-4, which belongs to 0/1
// itself); 10 = (0/1) Non-Dual Binary (M0-3-4); 11 = (-) Mirror
// (M0-3-(0/1)). Bus role is the 8+4 partition (M0-3 hidden formula
// "4/(8)/3/(4)"): octet = zero-elements + Adam evens; quartet = Eve odds
// {3,5,7} + Wholeness 9 — the archetypal ground of the audio_octet[8] /
// nodal_quartet[4] bus cardinality.
export const AnandaSeatKind = z.enum(["number", "non-dual-binary", "mirror"]);
export type AnandaSeatKind = z.infer<typeof AnandaSeatKind>;

export const AnandaBusRole = z.enum(["octet", "quartet"]);
export type AnandaBusRole = z.infer<typeof AnandaBusRole>;

export const AnandaSeatBinding = z
  .object({
    position: z.number().int().min(0).max(11),
    seatKind: AnandaSeatKind,
    archetypeNumber: z.number().int().min(0).max(9).nullable(),
    coordinate: z.string().min(1),
    symbol: z.string().min(1),
    busRole: AnandaBusRole,
  })
  .strict();
export type AnandaSeatBinding = z.infer<typeof AnandaSeatBinding>;

export const AnandaVortexProjection = z
  .object({
    activeMatrixOp: AnandaMatrixOp,
    activeCell: z.tuple([
      z.number().int().min(0).max(11),
      z.number().int().min(0).max(5),
    ]),
    activeCellValue: AnandaVortexCell,
    // Current profiles carry all six 12×12 families from portal-core. It is
    // optional only so captured pre-22.T22.8 frames remain parseable.
    matrixCells: z.array(AnandaVortexCell).length(6 * 12 * 12).optional(),
    // Optional only so pre-FR-2.1.10 captures remain parseable; current
    // profiles always carry the twelve M0-3 seat bindings.
    seatSemantics: z.array(AnandaSeatBinding).length(12).optional(),
    drRingPhase: DrRingPhase,
    cl42SignatureAtPosition: z.number().int().min(-128).max(127),
    ringQuaternion: z.array(z.number()).length(4),
    helixSheet: z.number().int().min(0).max(1),
    kleinFlipAtThisTick: z.boolean(),
  })
  .strict()
  .refine(
    (value) =>
      value.activeCellValue.rowK === value.activeCell[0] &&
      value.activeCellValue.positionP === value.activeCell[1],
    { message: "activeCellValue (rowK, positionP) must equal activeCell" },
  )
  .refine(
    (value) =>
      value.matrixCells === undefined ||
      new Set(value.matrixCells.map((cell) => `${cell.family}:${cell.rowK}:${cell.positionP}`)).size ===
        6 * 12 * 12,
    { message: "matrixCells must contain one unique cell for every family/address" },
  );
export type AnandaVortexProjection = z.infer<typeof AnandaVortexProjection>;

/// Harmonic grammar (kernel/projections/harmonic_grammar.rs). Wire law
/// (from_tick): bimba pairs L{p}/L{(p+1)%6} anchored Day/depth-2/NONE;
/// pratibimba pairs are COMPLEMENTARY L{p}/L{5-p} anchored Night/depth-3/
/// D_LEFT. `families` is the A/B/C table for the pair and is legitimately
/// EMPTY for pairs outside the table (e.g. pratibimba (3,2)/(4,1)).
export const MathemeHarmonicFamilyProjection = z
  .object({
    family: z.string().min(1),
    register: z.string().min(1),
    relationType: z.string().min(1),
    intervalSignature: z.string().min(1),
  })
  .strict();
export type MathemeHarmonicFamilyProjection = z.infer<
  typeof MathemeHarmonicFamilyProjection
>;

export const MathemeHarmonicGrammarProjection = z
  .object({
    positionSubstance: z.string().min(1),
    lensRefraction: z.string().min(1),
    harmonicRelation: z.string().min(1),
    basePair: z.string().regex(/^L[0-5]\/L[0-5]$/),
    activeLenses: z.array(z.string().min(1)).min(1),
    primaryAnchor: z.enum(["Day", "Night"]),
    dFace: z.enum(["NONE", "D_LEFT"]),
    depth: z.number().int().min(2).max(3),
    families: z.array(MathemeHarmonicFamilyProjection),
  })
  .strict();
export type MathemeHarmonicGrammarProjection = z.infer<
  typeof MathemeHarmonicGrammarProjection
>;

/// Bedrock psychoid-number projection (kernel/projections/bedrock.rs).
export const MathemeBedrockProjection = z
  .object({
    hashOperator: z.literal("#"),
    psychoidNumber: z.string().regex(/^#[0-5]$/),
    invertedPsychoidNumber: z.string().regex(/^#[0-5]'$/),
    successorPsychoidNumber: z.string().regex(/^#[0-5]$/),
    successorRelation: z.enum(["epogdoon-tick", "mobius-return"]),
    inversionRelation: z.literal("inversion-spanda"),
    bimbaPitchClass: z.number().int().min(0).max(11),
    inversionPitchClass: z.number().int().min(0).max(11),
  })
  .strict();
export type MathemeBedrockProjection = z.infer<typeof MathemeBedrockProjection>;

/// Pre-resolved S2 graph anchor (kernel/profile.rs GraphAnchorProjection;
/// S2-ARCHITECTURE §4.3/§10.4 — published so M' surfaces stop re-parsing
/// canonical_form per tick).
export const GraphCoordinateHome = z.enum([
  "M",
  "M0'",
  "M1'",
  "M2'",
  "M3'",
  "M4'",
  "M5",
  "M5'",
  "S2-5",
]);
export type GraphCoordinateHome = z.infer<typeof GraphCoordinateHome>;

export const GdsOverlayState = z.enum([
  "blocked",
  "projection_ready",
  "algorithm_active",
]);
export type GdsOverlayState = z.infer<typeof GdsOverlayState>;

export const GraphAnchorProjection = z
  .object({
    canonicalForm: z.string().min(1),
    depth: z.number().int(),
    prefix: z.string().min(1),
    parent: z.string().min(1).nullable(),
    axis: z.enum(["bimba", "pratibimba"]),
    coordinateHome: GraphCoordinateHome,
    gdsOverlayState: GdsOverlayState,
    resolverProvenance: z.string().min(1),
  })
  .strict();
export type GraphAnchorProjection = z.infer<typeof GraphAnchorProjection>;

/// Episodic deposition anchor (kernel/profile.rs DepositionAnchorProjection).
export const DepositionAnchorProjection = z
  .object({
    sourceCoordinate: z.string().min(1),
    resonance72Index: z.number().int().min(0).max(71),
    mahamayaAddress64: z.number().int().min(0).max(63).nullable(),
    s3Method: z.string().min(1),
    privacyBoundary: z.string().min(1),
  })
  .strict();
export type DepositionAnchorProjection = z.infer<
  typeof DepositionAnchorProjection
>;

/// Cycle-2 future anchors (kernel/profile.rs MathemeFutureAnchor) — s2Anchor /
/// s3Anchor. Rust Option WITHOUT skip_serializing_if: null is the honest
/// not-anchored state, an object the landed anchor.
export const MathemeFutureAnchor = z
  .object({
    coordinate: z.string().min(1),
    readiness: z.string().min(1),
    provenance: z.string().min(1),
  })
  .strict();
export type MathemeFutureAnchor = z.infer<typeof MathemeFutureAnchor>;

/// Readiness ledger fact — NOTE the Rust struct is serde snake_case, so the
/// wire keys are bedrock_link / provenance_chain (not camelCase).
export const MathemeHarmonicProfileReadinessFact = z
  .object({
    field: z.string().min(1),
    state: z.literal("authoritative"),
    bedrock_link: z.literal("kernel-matheme-bedrock-projection-v1"),
    provenance_chain: z.string().min(1),
  })
  .strict();
export type MathemeHarmonicProfileReadinessFact = z.infer<
  typeof MathemeHarmonicProfileReadinessFact
>;

/// CF7 context-frame web (kernel/projections/context_frame_web.rs). The
/// active* trio is null exactly on non-diatonic ticks, and
/// activeFrameIndex = diatonic.degree - 1 when diatonic is present.
export const MathemeContextFrameWebProjection = z
  .object({
    frameCount: z.number().int().min(1),
    activeFrameIndex: z.number().int().min(0).nullable(),
    activeFrame: z.string().min(1).nullable(),
    activeAgent: z.string().min(1).nullable(),
    projection: z.string().min(1),
  })
  .strict();
export type MathemeContextFrameWebProjection = z.infer<
  typeof MathemeContextFrameWebProjection
>;

/// S0 harmonic pointer anchor (Bedrock7/PointerWeb36/CF7 contract; mirrors
/// the app-side MathemePointerAnchorProjection boundary in
/// Body/M/pratibimba-app/src/bridge/types.ts).
export const MathemePointerAnchorProjection = z
  .object({
    sourceCoordinate: z.string().min(1),
    qlPosition: z.number().int().min(0).max(5),
    helix: z.enum(["bimba", "pratibimba"]),
    webIndex: z.number().int().min(0).max(35),
    bedrockIndex: z.number().int().min(0).max(6),
    familyRingSize: z.number().int().positive(),
    positionRingSize: z.number().int().positive(),
    lensRingSize: z.number().int().positive(),
    webCardinality: z.literal(36),
    lensAnchor: z.string().min(1),
    relationRole: z.string().min(1),
    pitchClass: z.number().int().min(0).max(11),
    provenance: z.string().min(1),
  })
  .strict();
export type MathemePointerAnchorProjection = z.infer<
  typeof MathemePointerAnchorProjection
>;

// Mirrors portal-core/src/profile_projections.rs M1TopologyProjection +
// TorusKnotPhase (Track 02.T2.3) — the M1-5 single-torus topology invariants
// (double-cover 720°, genus-1 torus, χ=0, S3->S2 Hopf) + quaternion state +
// the live Klein-flip descriptors (k2TritoneCrossing / m1OriginKleinFlip).
// serde(default) on the profile, so optional here for pre-T2.3 payloads.
export const M1TorusKnotPhase = z
  .object({ p: z.number(), q: z.number() })
  .strict();
export type M1TorusKnotPhase = z.infer<typeof M1TorusKnotPhase>;

export const M1TopologyProjection = z
  .object({
    doubleCoverDeg: z.number().int().nonnegative(),
    torusGenus: z.number().int().nonnegative(),
    eulerCharacteristic: z.number().int(),
    hopfProjectDeg: z.number().int().nonnegative(),
    hopfFiber: z.number().int().nonnegative(),
    hopfIdentity: z.string(),
    ringQuaternion: z.array(z.number()).length(4),
    elementCount: z.number().int().nonnegative(),
    composedQuaternion: z.array(z.number()).length(4),
    walkMode: z.string(),
    bifurcationLambda: z.number(),
    resolutionLevel: z.number().int().nonnegative(),
    torusKnotPhase: M1TorusKnotPhase,
    parentAttribution: z.string(),
    priorGround: z.string(),
    downstreamDoubleTorus: z.string(),
    k2TritoneCrossing: z.string(),
    m1OriginKleinFlip: z.string(),
  })
  .strict();
export type M1TopologyProjection = z.infer<typeof M1TopologyProjection>;

// Mirrors portal-core/src/profile_projections.rs InversionOperatorHandle
// (Track 02.T2.5) — the single session-held `#` (Inversion_Operator) handle
// M1'-SPEC §14 wires into every coordinate (identical across all coordinates,
// never per-coordinate forked). serde(default) on the profile, optional here.
export const InversionOperatorHandle = z
  .object({
    operator: z.string(),
    handle: z.string(),
    provenance: z.string(),
  })
  .strict();
export type InversionOperatorHandle = z.infer<typeof InversionOperatorHandle>;

export const M0VoidLensState = z.enum([
  "canonical",
  "canonical_absent",
  "blocked",
]);
export type M0VoidLensState = z.infer<typeof M0VoidLensState>;

export const M0VoidLensProjection = z
  .object({
    lensIndex: z.number().int().min(0).max(15),
    coordinate: z.string().min(1),
    label: z.string().trim().min(1),
    state: M0VoidLensState,
  })
  .strict();
export type M0VoidLensProjection = z.infer<typeof M0VoidLensProjection>;

export const M0VoidStructureRing = z
  .array(M0VoidLensProjection)
  .length(16)
  .superRefine((lenses, ctx) => {
    lenses.forEach((lens, index) => {
      if (lens.lensIndex !== index) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `lens row ${index} must carry lensIndex ${index}`,
          path: [index, "lensIndex"],
        });
      }
      const expectedCoordinate = `#0-4-${index}`;
      if (lens.coordinate !== expectedCoordinate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `lens row ${index} must carry coordinate ${expectedCoordinate}`,
          path: [index, "coordinate"],
        });
      }
    });
  });
export type M0VoidStructureRing = z.infer<typeof M0VoidStructureRing>;

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
    // Rust MathemeLensMode law: lens 0..11, mode 0..6. (The former swapped
    // bounds were the drift flagged in the bell-kernel spec §6.)
    lensMode: z.object({
      lens: z.number().int().min(0).max(11),
      mode: z.number().int().min(0).max(6),
    }),
    chromatic: z.record(z.unknown()),
    // Rust: Option<MathemeDiatonicContext> — null on non-diatonic ticks.
    diatonic: z.record(z.unknown()).nullable(),
    resonance72: z.record(z.unknown()),
    depositionAnchor: DepositionAnchorProjection,
    graphHandle: GraphAnchorProjection,
    m0_void_structure_ring: M0VoidStructureRing,
    audioOctet: z.array(z.number()).length(8),
    nodalQuartet: z.array(z.record(z.unknown())).length(4),
    modalResonator: ModalResonatorProfile.optional(),
    planetDegrees: z.array(z.number()).length(10).optional(),
    livePlanets: z.array(LivePlanetProjection).length(10).optional(),
    cymaticSpheres: CymaticSpheresProjection.optional(),
    // Sprint-8 E1: the tick's address in the 720 possibility space (plane,
    // clock-degree node, 16+1 lens carrier). Hardened with E3 (the app-side
    // modulation-graph consumer): full field law mirrored from portal-core
    // phase_space.rs, whose C authority is epi-lib CLOCK_DEGREE_LUT.
    phaseSpace: PhaseSpaceAddress.optional(),
    // Sprint-8 E6: handle-only PASU identity summary — attached by the
    // gateway heartbeat when a local identity exists; absence is honest.
    quintessence: QuintessenceProjection.optional(),
    elements: z.record(z.unknown()),
    planetaryChakral: z.record(z.unknown()),
    binary: z.record(z.unknown()),
    mahamaya: z.record(z.unknown()),
    codonRotationProjection: z.record(z.unknown()),
    qCosmic: z.union([z.number(), z.array(z.number()).length(4)]),
    // Rust: Option<f32> — a scalar resonance score or null, never an object.
    resonance: z.number().nullable(),
    conjugateFormCharacter: z.string(),
    privacyClass: z.literal("public-current-context"),
    bedrock: MathemeBedrockProjection,
    readinessLedger: z.array(MathemeHarmonicProfileReadinessFact),
    pointerAnchor: MathemePointerAnchorProjection,
    // Rust: MathemeContextFrameWebProjection struct — always a single object
    // (the former array-or-record union was a placeholder, never on the wire).
    contextFrames: MathemeContextFrameWebProjection,
    // Typed 2026-07-06 (was z.unknown()): the three-variant flip union, null
    // between flip ticks. Optional for legacy payload compatibility.
    kleinFlip: KleinFlipEvent.nullable().optional(),
    // Track 02.T2.3: the M1-5 single-torus topology projection, serde(default)
    // on the profile — optional here for pre-T2.3 payload compatibility.
    m1Topology: M1TopologyProjection.optional(),
    // Track 02.T2.5: the single session-held # (Inversion_Operator) — the
    // `invert` field wired into every coordinate, serde(default) on the profile.
    inversionOperator: InversionOperatorHandle.optional(),
    // T12 hardening: anandaVortex/harmonicGrammar are serde(default) structs,
    // serialized on every current profile frame; optional only for legacy
    // pre-projection payload compatibility, never z.unknown().
    anandaVortex: AnandaVortexProjection.optional(),
    // Track 36 / 10.P5: serde(default) Option on the profile — Some on every
    // current frame (from_tick attaches it); optional/nullable only for
    // legacy pre-36.3 payload compatibility, never z.unknown().
    anuttaraPentadicTrace: AnuttaraPentadicRuntimeTrace.nullable().optional(),
    harmonicGrammar: MathemeHarmonicGrammarProjection.optional(),
    pasuBeingPattern: PasuBeingPatternProjection.optional(),
    anuttaraWitness: AnuttaraWitnessProjection.optional(),
    // Track 21.T21.9: compiled C CONTEMPLATION_PROMPT_LUT[12], projected
    // verbatim by portal-core. Empty strings are canonical unpopulated slots.
    contemplationPromptLut: z.array(z.string()).length(12).optional(),
    // Track 25.T25.23: the compiled Archetype-7 R-factor route table + the
    // nine virtue lamps (portal-core RFactorRouteTableProjection). 7 routes ×
    // 6 acts; 7 is the positionless sentinel; meta virtues carry no rFactor.
    rfactorRouteTable: z
        .object({
            routes: z
                .array(
                    z.object({
                        baseRoute: z.string().min(1),
                        mColumn: z.number().int().min(1).max(5),
                        positions: z.array(z.number().int().min(0).max(7)).length(6),
                    }),
                )
                .length(7),
            positionless: z.literal(7),
            bandTurnSymbol: z.literal("(@#)"),
            virtues: z
                .array(
                    z.object({
                        virtueIndex: z.number().int().min(0).max(8),
                        rFactor: z.number().int().min(0).max(5).optional(),
                        name: z.string().min(1),
                        symbol: z.string().min(1),
                    }),
                )
                .length(9),
        })
        .optional(),
    // Kairos tier (kernel/profile.rs kairos_mode/kairos_decays_at_ms, S3 gate
    // server/mod.rs) — skip-serialized Options: absent = kairos-pending, else
    // the tier that won (kairotic > realtime). decaysAtMs present only in
    // kairotic mode. Pinned literals so a live capture strict-parses.
    kairosMode: z.enum(["kairotic", "realtime"]).optional(),
    kairosDecaysAtMs: z.number().int().nonnegative().optional(),
    // Composition projections (Rust optional, skip-serialized when absent) —
    // kept as unknown until their own schemas land; listed so a strict parse
    // of a live profile carrying them does not reject the whole payload.
    cosmicCompositionState: z.unknown().optional(),
    personalPole: z.unknown().optional(),
    psychoidField: z.unknown().optional(),
    canonRecognitionStream: z.array(z.unknown()).optional(),
    vakLanguificationTrace: VakLanguificationTrace.optional(),
    s2Anchor: MathemeFutureAnchor.nullable(),
    s3Anchor: MathemeFutureAnchor.nullable(),
    vakAddress: ProfileVakAddress.nullable().optional(),
  })
  .strict();
export type MathemeHarmonicProfile = z.infer<typeof MathemeHarmonicProfile>;

// --- M1'/M2'/M3' chime frame (bell-kernel spec §5) --------------------------
// The tick event proving all three poles resolved the same resonant state.
// Mirrors epi-cli/src/gate/kernel_bridge_runtime.rs M123ChimeFrameJsonShape.

export const M123_CHIME_FRAME_CONTRACT = "S0.kernel-bridge.m123-chime-frame";
export const M123_CHIME_EVENT_TYPE = "m123.chime";

export const M123ChimeWorldClockBinding = z
  .object({
    state: z.enum(["ready", "pending", "stale", "blocked"]),
    worldClockHandle: z.string().nullable(),
    generation: z.number().int().nonnegative().nullable(),
    source: z.literal("s3.world_clock").nullable(),
    subscriptionMode: z.string().nullable(),
    tick: z.number().int().nonnegative().nullable(),
    degree720: z.number().int().min(0).max(720).nullable(),
    degree720MatchesProfile: z.boolean(),
    tickMatchesProfile: z.boolean(),
  })
  .strict();
export type M123ChimeWorldClockBinding = z.infer<
  typeof M123ChimeWorldClockBinding
>;

export const M123ChimeFrame = z
  .object({
    eventType: z.literal(M123_CHIME_EVENT_TYPE),
    contract: z.literal(M123_CHIME_FRAME_CONTRACT),
    sourceProfileGeneration: z.number().int().nonnegative(),
    tick: z.number().int().nonnegative(),
    tick12: z.number().int().min(0).max(11),
    degree720: z.number().int().min(0).max(720),
    m2Address72: z.number().int().min(0).max(71),
    m1: z
      .object({
        surface: z.literal("K2"),
        k2SurfaceHandle: z.string().nullable(),
        playedTorusHandle: z.string().nullable(),
        playedTorusStatus: z
          .enum(["current-retiring", "active-successor"])
          .nullable(),
        strikeRoute: z.enum(["profile-bus", "world-clock", "manual-scrub"]),
      })
      .strict(),
    m2: z
      .object({
        modalResonator: ModalResonatorProfile,
        m2PrimeMeaningPacketRef: z.string().nullable(),
        cymaticFrameHandle: z.string().min(1),
        cymaticTextureContributionHandle: z.string().nullable(),
        exactProfileBus: z.literal(true),
      })
      .strict(),
    m3: z
      .object({
        codonRotationProjection: z.record(z.unknown()).nullable(),
        worldClockBinding: M123ChimeWorldClockBinding,
      })
      .strict(),
    privacyClass: z.literal("public-current-context"),
  })
  .strict()
  .superRefine((value, ctx) => {
    const raw = JSON.stringify(value);
    for (const key of FORBIDDEN_PRIVATE_PAYLOAD_KEYS) {
      if (raw.includes(`"${key}"`)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `M123ChimeFrame must not include protected/private field ${key}`,
          path: [key],
        });
      }
    }
  });
export type M123ChimeFrame = z.infer<typeof M123ChimeFrame>;

/** Bell-kernel spec §5 coherence rule: a present world clock with any tick
 * or degree720 mismatch makes the chime incoherent — consumers must block
 * integrated readiness on it. */
export function isM123ChimeCoherent(frame: M123ChimeFrame): boolean {
  return (
    frame.m3.worldClockBinding.state === "ready" ||
    frame.m3.worldClockBinding.state === "pending"
  );
}

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
    graphRevision: z.number().int().nonnegative().optional(),
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
