/**
 * Readiness contract — Track 05 T1.
 *
 * Mirrors the nine-state taxonomy declared in
 * `Body/M/epi-theia/extensions/contracts/07-t0-extension-contract-preflight.json#readinessTaxonomy`.
 * The readiness widget renders these as typed states with explicit blockers,
 * NEVER as a binary "ready/not ready" fallback.
 */
export type KernelBridgeReadinessState =
  | 'bridge_unavailable'
  | 'profile_missing_field'
  | 's2_graph_blocked'
  | 's3_subscription_blocked'
  | 's5_review_blocked'
  | 'authority_payload_missing'
  | 'privacy_blocked'
  | 'degraded_but_readable'
  | 'ready_public_current';

export interface KernelBridgeReadinessSnapshot {
  /** Snapshot wall-clock time (ms since epoch) at the moment the bridge replied. */
  readonly fetchedAt: number;
  /** Canonical readiness label per the 07.T0 taxonomy. */
  readonly state: KernelBridgeReadinessState;
  /** Free-text reason carried from the bridge; never used to derive `state`. */
  readonly reason: string;
  /** Profile generation observed at fetch time (null if profile not yet exposed). */
  readonly profileGeneration: number | null;
  /** Whether the gateway round-trip succeeded; false for `bridge_unavailable`. */
  readonly gatewayReachable: boolean;
  /** Carried-forward blocker IDs from 07.T0 / 05.T0 / 09.T0, deduplicated. */
  readonly blockerIds: readonly string[];
}

export interface KernelBridgeReadinessSource {
  /** Probe the real bridge; resolves to a typed snapshot, throws only on programming bugs. */
  readonly fetch: () => Promise<KernelBridgeReadinessSnapshot>;
  /** A human-readable description of where the snapshot comes from (e.g. gateway URL, Tauri invoke). */
  readonly describe: () => string;
}

/** Snapshot used when no source is configured or the source explicitly returns "unknown yet". */
export const PENDING_READINESS: KernelBridgeReadinessSnapshot = Object.freeze({
  fetchedAt: 0,
  state: 'bridge_unavailable',
  reason: 'No bridge source configured yet.',
  profileGeneration: null,
  gatewayReachable: false,
  blockerIds: Object.freeze([]) as readonly string[]
});

export function isTerminalReadiness(state: KernelBridgeReadinessState): boolean {
  return state === 'ready_public_current' || state === 'degraded_but_readable';
}

export function readinessSeverity(state: KernelBridgeReadinessState): 'ok' | 'degraded' | 'blocked' {
  switch (state) {
    case 'ready_public_current':
      return 'ok';
    case 'degraded_but_readable':
      return 'degraded';
    default:
      return 'blocked';
  }
}
