/**
 * Track 01 T3 — Bridge readiness contract.
 *
 * Mirrors `Body/S/S0/epi-cli/src/profile/mod.rs#BridgeReadinessState` exactly
 * and is locked at runtime by the Rust unit tests in `profile::tests`.
 *
 * The 9-state taxonomy is canon — declared first in
 * `Body/M/epi-theia/extensions/contracts/07-t0-extension-contract-preflight.json#readinessTaxonomy.states_inherited_from_07`
 * and inherited by Track 05 / 06 / 09 surfaces.
 */
import { z } from "zod";

export const BridgeReadinessState = z.enum([
  "bridge_unavailable",
  "profile_missing_field",
  "s2_graph_blocked",
  "s3_subscription_blocked",
  "s5_review_blocked",
  "authority_payload_missing",
  "privacy_blocked",
  "degraded_but_readable",
  "ready_public_current",
]);
export type BridgeReadinessState = z.infer<typeof BridgeReadinessState>;

export const BridgeReadinessSeverity = z.enum(["ok", "degraded", "blocked"]);
export type BridgeReadinessSeverity = z.infer<typeof BridgeReadinessSeverity>;

export const BridgeReadinessSnapshot = z.object({
  state: BridgeReadinessState,
  severity: BridgeReadinessSeverity,
  reason: z.string(),
  gatewayUrl: z.string().optional(),
  probed: z.boolean().optional(),
});
export type BridgeReadinessSnapshot = z.infer<typeof BridgeReadinessSnapshot>;

/** Severity classifier — keep in lockstep with Rust `BridgeReadinessState::severity`. */
export function readinessSeverity(
  state: BridgeReadinessState,
): BridgeReadinessSeverity {
  if (state === "ready_public_current") return "ok";
  if (state === "degraded_but_readable") return "degraded";
  return "blocked";
}

/**
 * The six "dimensional" states — each one names exactly one failure axis
 * (kernel profile / S2 / S3 / S5 / authority / privacy). Used by readiness
 * UIs that want to surface which axis is blocked, not just a generic blocked
 * flag.
 */
export const DIMENSIONAL_READINESS_STATES: readonly BridgeReadinessState[] = [
  "profile_missing_field",
  "s2_graph_blocked",
  "s3_subscription_blocked",
  "s5_review_blocked",
  "authority_payload_missing",
  "privacy_blocked",
];
