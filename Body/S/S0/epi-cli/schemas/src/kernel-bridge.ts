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
]);
export type KernelBridgeCapabilityName = z.infer<
  typeof KernelBridgeCapabilityName
>;

export const KERNEL_BRIDGE_CAPABILITY_NAMES = Object.freeze(
  KernelBridgeCapabilityName.options,
);

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
    pointerAnchor: z.record(z.unknown()),
    contextFrames: z.union([
      z.array(z.record(z.unknown())),
      z.record(z.unknown()),
    ]),
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
