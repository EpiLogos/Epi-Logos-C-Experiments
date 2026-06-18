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

import type { MathemeHarmonicProfileBoundary } from '@pratibimba/m-extension-runtime';

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
export const KERNEL_BRIDGE_M1_PROFILE_TO_PERFORMANCE_STREAM =
    'S0.kernel-bridge.m1-profile-to-performance' as const;

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

export type OracleSpreadScale =
    | 'single-card'
    | 'compressed-triad'
    | 'sixfold-ql-traverse'
    | 'night-inverse-pass'
    | 'depth-4-5-pass'
    | 'clock-walk'
    | 'symbolic-orf';

export type OracleTraversalDirection =
    | 'day'
    | 'night'
    | 'night-prime'
    | 'inverse'
    | 'clockwise'
    | 'counterclockwise';

export interface ReadingPosition {
    key: string;
    ordinal: number;
    cpPositionRef: string;
    label?: string;
    vak?: VakAddress;
}

export interface OracleFrame {
    frameId: string;
    spreadScale: OracleSpreadScale;
    positions: readonly ReadingPosition[];
    traversalDirection?: OracleTraversalDirection;
    complementaryPairs?: readonly (readonly [string, string])[];
}

export type ReadingFrame = OracleFrame;

export interface OracleSequenceCodon {
    ordinal: number;
    symbol: string;
    cpPositionRef: string;
    vak?: VakAddress;
}

export interface OracleSequence {
    sequenceId: string;
    frameId: string;
    codons: readonly OracleSequenceCodon[];
}

export interface SymbolicProtein {
    proteinId: string;
    sequence: OracleSequence;
    readingFrame: OracleFrame;
    startPositionRef?: string;
    stopPositionRef?: string;
}

export interface TranscriptionalClockPacket {
    packetId: string;
    profileGeneration: number | null;
    vak: VakAddress;
    oracleFrame: OracleFrame;
    cpPositionRef: string;
    oracleSequence?: OracleSequence;
    symbolicProtein?: SymbolicProtein;
    provenanceHandles?: readonly string[];
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

export interface KernelBridgeProfileJsonShape {
    generation: number;
    cachedAtMs: number;
    stale: boolean;
    stalenessMs: number;
    privacyClass: string;
    profile: unknown;
}

export type ProfilePrivacyClass =
    | 'protected-local-body'
    | 'protected-local-derived'
    | 'public-current-context'
    | 'reviewed-canonical';

export interface MathemeNodalConstraint {
    qlPosition: number;
    helix: string;
    m: number;
    n: number;
}

export interface MathemePointerAnchorProjection {
    sourceCoordinate: string;
    qlPosition: number;
    helix: string;
    webIndex: number;
    bedrockIndex: number;
    familyRingSize: number;
    positionRingSize: number;
    lensRingSize: number;
    webCardinality: number;
    lensAnchor: string;
    relationRole: string;
    pitchClass: number;
    provenance: string;
}

export interface MathemeDiatonicContext {
    degree: number;
    pitchClass: number;
    note: string;
    contextFrame: string;
    contextAgent: string;
    vakRegister: string;
}

export interface KernelBridgePerformanceTickJsonShape {
    tick: number;
    tick12: number;
    cycle: number;
    degree720: number;
    kernelTickAuthority: string;
}

export interface KernelBridgePerformanceHarmonicJsonShape {
    phase: string;
    position6: number;
    helix: string;
    ratioRole: string;
    audioOctet: readonly number[];
    nodalQuartet: readonly MathemeNodalConstraint[];
}

export interface KernelBridgeDepositionAnchorJsonShape {
    sourceCoordinate: string;
    resonance72Index: number;
    mahamayaAddress64: number | null;
    s3Method: string;
    privacyBoundary: string;
}

export interface KernelBridgeLensModeJsonShape {
    lens: number;
    mode: number;
    codonId: number;
    rotation: number;
    codonClass: string;
}

export interface KernelBridgePerformanceStateJsonShape {
    tempoClock: string;
    pitchAuthority: string;
    nodalConstraintAuthority: string;
    rendererDerivationAllowed: boolean;
}

export interface KernelBridgePerformanceEventJsonShape {
    event: 'm1.profile_to_performance';
    stream: typeof KERNEL_BRIDGE_M1_PROFILE_TO_PERFORMANCE_STREAM;
    runtimeOwner: typeof KERNEL_BRIDGE_RUNTIME_OWNER;
    source: 'portal_core::MathemeHarmonicProfile';
    profileGeneration: number;
    profileSchemaVersion: number;
    privacyClass: ProfilePrivacyClass;
    requiredProfileFields: readonly string[];
    tick: KernelBridgePerformanceTickJsonShape;
    harmonic: KernelBridgePerformanceHarmonicJsonShape;
    pointerAnchor: MathemePointerAnchorProjection;
    diatonic: MathemeDiatonicContext | null;
    depositionAnchor: KernelBridgeDepositionAnchorJsonShape;
    lensMode: KernelBridgeLensModeJsonShape;
    performanceState: KernelBridgePerformanceStateJsonShape;
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

export type RFactorBand = 'pravritti' | 'nivritti';

export interface RFactorPathStep {
    readonly rFactor: number;
    readonly baseRoute: 'O#' | 'X#' | 'N#' | 'M#' | 'Nara' | 'Siva' | 'Shakti';
    readonly band: RFactorBand;
    readonly position: number;
    readonly isTurn: boolean;
}

export interface AnuttaraWitnessProjection {
    readonly virtueWitnessVector: number;
    readonly syntaxWitnessVector: number;
    readonly rfactorPath: readonly RFactorPathStep[];
    readonly bandBalance: {
        readonly pravrittiDepth: number;
        readonly nivrittiDepth: number;
        readonly reachedTurn: boolean;
        readonly returned: boolean;
    };
    readonly palindromeState: {
        readonly normalFormSymmetric: boolean;
        readonly mirrorNormalForm: string;
    };
    readonly openQuestions: readonly string[];
    readonly coherenceScore: number;
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

// ---- Cross-cutting pentadic profile projection (Track 36 — T36.1) ----

/** Cross-cutting profile projection — pentadic trace from M0 Anuttara through
 *  the M2/M3 resonance bridge. Every field derives from existing
 *  MathemeHarmonicProfile fields and Mahamaya/M2/M3 helpers.
 *  Anti-greenfield: no renderer-local tables; no standalone numerology module.
 *  Fields that cannot be derived from current kernel payloads land as
 *  `pending-*` in readiness, with Track 10 owning the closure. */
export interface AnuttaraPentadicRuntimeTrace {
    readonly tick: number;
    readonly tick12: number;
    readonly helix: 0 | 1;
    readonly position6: 0 | 1 | 2 | 3 | 4 | 5;
    readonly sourceBinaryState: '0' | '1' | '0/1';
    readonly wholeNumberEndpoint: 5;
    readonly naturalNumberEndpoint: 6;
    readonly familyBComplement: readonly [0 | 1 | 2 | 3 | 4 | 5, 0 | 1 | 2 | 3 | 4 | 5];
    readonly shemDegreeQuantum: 5;
    readonly resonance72Index: number;
    readonly degree360: number;
    readonly m2ToM3Symbol: number;
    readonly mahamayaAddress64: number;
    readonly evolutionaryGap: 'm2-wholeness-gap' | 'm3-transcription-gap' | 'm1-parent-restored';
    readonly codonId: number;
    readonly codon: string;
    readonly lineChangeOperator: number;
    readonly pairedMahamayaFifteens: readonly [15, 15];
    readonly backboneIdentity: '24x15=360';
    readonly lineGraphIdentity: '360+24=384';
    readonly qCosmicRef: string;
    readonly qComposedHandle?: string;
    readonly learnedPredictorCheckpointRef?: string;
    readonly provenance: readonly string[];
}

/** Build an AnuttaraPentadicRuntimeTrace from a MathemeHarmonicProfileBoundary.
 *  Returns null if the profile lacks the minimum fields (tick, tick12, position6).
 *  Fields not derivable from current kernel payloads are set to pending sentinel values. */
export declare function buildPentadicTrace(profile: MathemeHarmonicProfileBoundary): AnuttaraPentadicRuntimeTrace | null;

// ---- Bounded capability allow-list (mirror capability_names()) ----

export const KERNEL_BRIDGE_CAPABILITIES = [
    'readCurrentProfile',
    'readPointerAnchor',
    'readReadiness',
    'subscribeObservability',
    'invokeGatewayRpc',
    'depositKernelObservation',
    'requestReviewEvidence',
    's2.parashaktiCorrespondences'
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
