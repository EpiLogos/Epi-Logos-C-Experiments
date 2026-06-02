/**
 * TypeScript mirror of `Body/S/S0/epi-cli/src/gate/kernel_bridge_runtime.rs` —
 * Track 01 T5 deliverable. Drift between this file and the Rust source breaks
 * the bridge contract; the Track-01 contract tests assert structural parity.
 *
 * Shape rationale: every interface uses `camelCase` keys because the Rust
 * structs declare `#[serde(rename_all = "camelCase")]`.
 *
 * Source authority: `Body/S/S3/gateway-contract/src/lib.rs` for protocol
 * constants, `Body/S/S0/epi-cli/src/gate/kernel_bridge_runtime.rs` for the
 * runtime event/capability shapes.
 */

// ---- Protocol constants (mirror gateway-contract) ----

export const PROTOCOL_VERSION = 3;
export const DEFAULT_GATEWAY_PORT = 18794;
export const SPACETIME_PROJECTION_MODE_LITE = 'lite' as const;
export const SPACETIME_PROJECTION_MODE_FULL = 'full' as const;
export const SPACETIME_PROJECTION_SOURCE_HTTP_SQL = 'http-sql-poll' as const;
export const SPACETIME_PROJECTION_SOURCE_NATIVE_WS = 'native-websocket' as const;

// Owners and source labels referenced by Rust constants.
export const KERNEL_BRIDGE_SOURCE = 'kernel-bridge';
export const KERNEL_BRIDGE_RUNTIME_OWNER = "S0/S0' kernel-bridge runtime";
export const KERNEL_BRIDGE_THEIA_ADAPTER = 'Theia KernelBridgeAPI dependency-injection adapter';
export const KERNEL_BRIDGE_SAFE_PROFILE_PRIVACY = 'safe-public-current-kernel-tick';
export const KERNEL_BRIDGE_AGENT_PRIVACY = 'public_current_with_graph_provenance';

// ---- Enumerations ----

export type KernelBridgeConsumerKind =
    | 'ide-extension'
    | 'body-surface'
    | 'tauri-adapter'
    | 'test-extension';

export type KernelBridgeSubscriptionProfile = 'lite' | 'full';

export type KernelBridgeRuntimeEventKind =
    | 'connection_status'
    | 'readiness'
    | 'profile'
    | 'observability';

// SpacetimeProjectionConnectionState — mirror enum from spacetimedb_bridge.rs.
// Snake-case to match serde rename. Values are exhaustive per the Rust enum.
export type SpacetimeProjectionConnectionState =
    | 'disconnected'
    | 'connecting'
    | 'connected'
    | 'reconnecting'
    | 'resynced'
    | 'protocol_mismatch'
    | 'degraded'
    | 'private_blocked'
    | 'pending_lut';

// ---- Bridge payload shapes (mirror Rust kernel_bridge_runtime.rs structs) ----

export interface VakAddress {
    cpf: string;
    ct: string;
    cp: string;
    cf: string;
    cfp: string;
    cs: string;
}

export interface KernelBridgeVakContext {
    vakAddress: VakAddress;
    routeLineage: string[];
}

export interface KernelBridgeSubscriber {
    id: string;
    kind: KernelBridgeConsumerKind;
    requestedProfile: KernelBridgeSubscriptionProfile;
}

export interface KernelBridgeCachedProfile {
    generation: number;
    cachedAtMs: number;
    stale: boolean;
    stalenessMs: number;
    privacyClass: string;
    /** Opaque profile payload — `MathemeHarmonicProfile` serialised as JSON. */
    profile: unknown;
}

export interface KernelBridgeRuntimeEvent {
    kind: KernelBridgeRuntimeEventKind;
    emittedAtMs: number;
    source: string;
    profileGeneration: number | null;
    privacyClass: string;
    payload: unknown;
}

export interface KernelBridgeDeliveredEvent {
    consumerId: string;
    event: KernelBridgeRuntimeEvent;
}

export interface KernelBridgeCapabilityRequest {
    method: string;
    sessionKey: string;
    params: unknown;
    profileGeneration: number | null;
    provenanceHandles: string[];
    vak: KernelBridgeVakContext | null;
}

export interface KernelBridgeCapabilityReceipt {
    method: string;
    gatewayMethod: string | null;
    sessionKey: string;
    profileGeneration: number | null;
    privacyClass: string;
    provenanceHandles: string[];
    vak: KernelBridgeVakContext;
    artifact: unknown;
}

export interface KernelBridgeConnectionStatus {
    connected: boolean;
    state: SpacetimeProjectionConnectionState;
    mode: KernelBridgeSubscriptionProfile;
    subscriptionMode: string;
    reason: string;
    profileGeneration: number | null;
}

export interface KernelBridgeRuntimeSnapshot {
    runtimeOwner: string;
    theiaAdapter: string;
    tauriAdapter: string;
    upstreamSubscriptionCount: number;
    subscriberCount: number;
    mode: KernelBridgeSubscriptionProfile;
    subscriptionMode: string;
    currentProfileGeneration: number | null;
    cachedProfile: KernelBridgeCachedProfile | null;
    connection: KernelBridgeConnectionStatus;
    readiness: unknown;
}

// ---- Frontend-safe S3 stream rows (03.T5 consumer contract) ----

export type KernelBridgeStreamTable =
    | 'world_clock'
    | 'pratibimba_presence'
    | 'shared_archetype_event';

export interface KernelBridgeStreamRow {
    table: KernelBridgeStreamTable;
    row: unknown;
    receivedAtMs: number;
    profileGeneration: number | null;
    privacyClass: string;
    source: string;
}

export interface KernelBridgeStreamDelta {
    table: KernelBridgeStreamTable;
    inserts: KernelBridgeStreamRow[];
    deletes: KernelBridgeStreamRow[];
    resync: boolean;
    protocolMismatch: string | null;
}

// ---- Bounded capability allow-list (mirror capability_names()) ----

export const KERNEL_BRIDGE_CAPABILITIES = [
    'readCurrentProfile',
    'readPointerAnchor',
    'readReadiness',
    'subscribeObservability',
    'invokeGatewayRpc',
    'depositKernelObservation',
    'requestReviewEvidence'
] as const;

export type KernelBridgeCapabilityName = (typeof KERNEL_BRIDGE_CAPABILITIES)[number];

export function isKernelBridgeCapability(name: string): name is KernelBridgeCapabilityName {
    return (KERNEL_BRIDGE_CAPABILITIES as readonly string[]).includes(name);
}

// ---- Initial / sentinel values ----

export const DEFAULT_CONNECTION_STATUS: KernelBridgeConnectionStatus = {
    connected: false,
    state: 'disconnected',
    mode: 'lite',
    subscriptionMode: SPACETIME_PROJECTION_MODE_LITE,
    reason: 'not yet connected',
    profileGeneration: null
};

export function makeKernelBridgeSafeProfilePending(): KernelBridgeCachedProfile {
    return {
        generation: 0,
        cachedAtMs: 0,
        stale: true,
        stalenessMs: 0,
        privacyClass: KERNEL_BRIDGE_SAFE_PROFILE_PRIVACY,
        profile: null
    };
}
