/**
 * Coordinate: S0/S3 (gateway bus event contracts — Track 00 hardening T13)
 * Residency: Body/S/S0/epi-cli/schemas/src/gateway-bus.ts
 * Position (#n): #3 — Process; the maintenance-loop channels of the S3 wire
 * Actualises: [[00-verification-harness-hardening]] T13 — typed contracts for
 *   every event channel the gateway maintenance loop actually broadcasts
 *   (epi-cli src/gate/server/observability.rs + websocket.rs), so live-wire
 *   strict-parses the WHOLE wire, not just profile.update/m123.chime.
 * Public surface: GatewayTickEvent, GatewayHeartbeatEvent, GatewayHealthEvent,
 *   GatewayConnectChallengeEvent, GATEWAY_BROADCAST_CHANNELS,
 *   KERNEL_BRIDGE_INTERNAL_EVENT_TYPES.
 * Does NOT own: the kernel-bridge domain frames (kernel-bridge.ts); the
 *   emission cadence (observability.rs maintenance_loop).
 */
import { z } from "zod";

/// 150ms maintenance tick (observability.rs maintenance_loop). The payload is
/// bus-decorated with seq before send; strip decoration before this parse.
export const GatewayTickEvent = z
  .object({
    ts: z.number().int().nonnegative(),
  })
  .strict();
export type GatewayTickEvent = z.infer<typeof GatewayTickEvent>;

/// 550ms heartbeat. The maintenance loop only ever emits status "idle";
/// session-active statuses would be a new contract surface.
export const GatewayHeartbeatEvent = z
  .object({
    ts: z.number().int().nonnegative(),
    status: z.string().min(1),
  })
  .strict();
export type GatewayHeartbeatEvent = z.infer<typeof GatewayHeartbeatEvent>;

/// 350ms health broadcast — either the full system health snapshot
/// (gate/system.rs health_snapshot: ok + named checks, each carrying its own
/// ok verdict) or the lightweight test-maintenance variant.
export const GatewayHealthEvent = z.union([
  z
    .object({
      ok: z.literal(true),
      source: z.literal("lightweight-test-maintenance"),
    })
    .strict(),
  z
    .object({
      ok: z.boolean(),
      checks: z.record(z.unknown()),
    })
    .strict()
    .superRefine((value, ctx) => {
      for (const [name, check] of Object.entries(value.checks)) {
        if (
          check === null ||
          typeof check !== "object" ||
          typeof (check as Record<string, unknown>).ok !== "boolean"
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `health check '${name}' must be an object carrying a boolean ok verdict`,
            path: ["checks", name],
          });
        }
      }
    }),
]);
export type GatewayHealthEvent = z.infer<typeof GatewayHealthEvent>;

/// Device-auth challenge pushed on socket open (websocket.rs).
export const GatewayConnectChallengeEvent = z
  .object({
    nonce: z.string().uuid(),
  })
  .strict();
export type GatewayConnectChallengeEvent = z.infer<
  typeof GatewayConnectChallengeEvent
>;

/// Every channel the gateway process can broadcast on the S3 WS bus —
/// enumerated from the GatewayEvent::new call sites (grep-audited 2026-07-06:
/// server/mod.rs, server/observability.rs, websocket.rs, session dispatch).
/// live-wire FAILS on any captured channel outside this list.
export const GATEWAY_BROADCAST_CHANNELS = Object.freeze([
  "profile.update",
  "m123.chime",
  "tick",
  "health",
  "heartbeat",
  "connect.challenge",
  "cron.fired",
  "cron.error",
  "chat",
  "agent",
  "s3'.subscription.lifecycle",
] as const);
export type GatewayBroadcastChannel =
  (typeof GATEWAY_BROADCAST_CHANNELS)[number];

/// KernelBridgeEventType values that are bridge-INTERNAL event kinds, not S3
/// WS channels — declared in the contract but never expected on the raw wire.
/// live-wire reports these as declared-not-emitted with this provenance.
export const KERNEL_BRIDGE_INTERNAL_EVENT_TYPES = Object.freeze([
  "world_clock",
  "presence",
  "shared_archetype_event",
  "kernel_trace",
  "audio_bus",
  "cymatic_field",
  "connection_status",
  "gateway_rpc",
  "observability",
] as const);
