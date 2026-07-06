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

// Ported 2026-07-02 from Body/M/epi-theia/extensions/kernel-bridge/src/common/types.ts
// (epi-theia is a frozen parts warehouse per M'-SURFACE-REENVISIONING-2026-07-01).
// The boundary type is inlined from m-extension-runtime/src/common/profile.ts so
// this file stays dependency-free.
export interface MathemeHarmonicProfileBoundary {
    readonly generation: number;
    readonly pointerAnchor: string | null;
    readonly capabilities: readonly string[];
    readonly payload: Readonly<Record<string, unknown>>;
}

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
export const M123_CHIME_FRAME_CONTRACT = 'S0.kernel-bridge.m123-chime-frame' as const;
export const M123_CHIME_EVENT_TYPE = 'm123.chime' as const;

// ---- Modal resonator / M123 chime boundary (bell kernel spec §§4–5) ----
// Mirrors portal-core modal_resonator.rs + kernel_bridge_runtime.rs
// M123ChimeFrameJsonShape. Boundary-minimal: only the fields the app
// consumes; the full contract is validated by the Zod schemas in
// epi-cli/schemas/src/kernel-bridge.ts.

export interface BellPartialRoleBoundary {
    octetIndex: number;
    role: string;
}

export interface ModalSilentAnchorBoundary {
    pitchClass: number;
    silentIndex: number;
    note: string;
}

export interface ModalResonatorBoundary {
    schemaVersion: number;
    tick12?: number;
    bellPartials?: readonly BellPartialRoleBoundary[];
    liveOctet?: readonly { octetIndex: number; hz: number; pitchClass?: number }[];
    m2Address72?: { address72: number };
    /** The five structurally-still positions of the 12-slot chromatic body —
     *  constraint anchors, not absences (bell spec 7+5 partition). */
    silentComplement?: readonly ModalSilentAnchorBoundary[];
    /** Kernel 84-state address (lensModeIndex = lens·7+mode, kernel-computed). */
    lensMode?: { lens: number; mode: number; lensModeIndex?: number };
}

export interface M123ChimeWorldClockBindingBoundary {
    state: 'ready' | 'pending' | 'stale' | 'blocked' | string;
    tickMatchesProfile: boolean;
    degree720MatchesProfile: boolean;
}

export interface M123ChimeFrameBoundary {
    eventType: typeof M123_CHIME_EVENT_TYPE;
    contract: string;
    sourceProfileGeneration: number;
    tick: number;
    tick12: number;
    degree720: number;
    m2Address72: number;
    m2?: {
        modalResonator?: ModalResonatorBoundary;
        cymaticFrameHandle?: string;
        exactProfileBus?: boolean;
    };
    m3?: { worldClockBinding?: M123ChimeWorldClockBindingBoundary };
    privacyClass: string;
}

/** Bell spec §5 coherence rule: a present world clock with any tick/degree
 *  mismatch makes the chime incoherent — the strike (and any integrated
 *  readiness) must block on it. Pending carries no mismatch evidence. */
export function isChimeCoherent(frame: M123ChimeFrameBoundary | null | undefined): boolean {
    const state = frame?.m3?.worldClockBinding?.state;
    return state === 'ready' || state === 'pending';
}

/** The eight kernel bell-partial role labels in octet order, or null when the
 *  contract is absent/malformed (legacy gateway) — never invented locally. */
export function extractBellRoles(
    modal: ModalResonatorBoundary | null | undefined
): string[] | null {
    const partials = modal?.bellPartials;
    if (!Array.isArray(partials) || partials.length !== 8) {
        return null;
    }
    const roles: string[] = new Array(8);
    for (const partial of partials) {
        if (
            typeof partial?.octetIndex !== 'number' ||
            partial.octetIndex < 0 ||
            partial.octetIndex > 7 ||
            typeof partial?.role !== 'string'
        ) {
            return null;
        }
        roles[partial.octetIndex] = partial.role;
    }
    return roles.every(role => typeof role === 'string') ? roles : null;
}

// ---- Quintessence boundary (Sprint-8 E6, DR-M4-3 handle law) ----
// Mirrors portal-core kernel/profile.rs QuintessenceProjection: the PASU
// identity as HANDLES only — natal clock address (hash-derived), weight,
// enrichment honesty, 8-hex preview, elemental quaternion. Identity bodies
// (natal chart, per-layer profiles, the 32-byte hash) never cross the bus.

export interface QuintessenceBoundary {
    natalDegree: number;
    natalTick12: number;
    quintessenceWeight: number;
    layerCount: number;
    partial: boolean;
    hashPreview: string;
    /** [w=Earth, x=Fire, y=Water, z=Air] — the torus's stable ground reference. */
    quintessenceQuaternion: readonly number[];
    authority: string;
}

/** The kernel's identity handle, or null when absent/malformed — an absent
 *  identity is the honest "no identity anchored" state, never reconstructed. */
export function extractQuintessence(value: unknown): QuintessenceBoundary | null {
    const q = value as QuintessenceBoundary | null | undefined;
    if (
        !q ||
        typeof q.natalDegree !== 'number' ||
        typeof q.quintessenceWeight !== 'number' ||
        typeof q.layerCount !== 'number' ||
        typeof q.partial !== 'boolean' ||
        typeof q.hashPreview !== 'string' ||
        !Array.isArray(q.quintessenceQuaternion) ||
        q.quintessenceQuaternion.length !== 4
    ) {
        return null;
    }
    return q;
}

// ---- Phase-space boundary (Sprint-8 E1 kernel projection) ----
// Mirrors portal-core projections/phase_space.rs (`PhaseSpaceAddress`): the
// tick's address in the 720 possibility space — plane, clock-degree node,
// 16-lens carrier, Fibonacci Ground. Kernel-computed from the C .rodata
// CLOCK_DEGREE_LUT; the app consumes it and never re-derives degree law.

export interface PhaseSpaceLensPhaseBoundary {
    lensIndex: number;
    slice: number;
    sections: number;
    name: string;
    /** The temporality structurers — the 24/12/4-section divisions that gear
     *  rhythm and time (Fibonacci Ground is the +1 beside them). */
    temporalCanon: boolean;
    segment: number;
    degreeInSegment: number;
    phase01: number;
}

export interface PhaseSpaceFibonacciBoundary {
    position: number;
    digit: number;
    phase01: number;
    temporalCanon: boolean;
}

export type PhaseSpaceValenceBoundary =
    | {
          kind: 'codon';
          upperPair: number;
          lowerPair: number;
          codonClass: number;
          isNonDual: boolean;
      }
    | { kind: 'hexagram'; hexagramId: number; lineActive: number };

export interface ClockDegreeNodeBoundary {
    degree360: number;
    exactDegree720: number;
    zodiacSign: number;
    zodiacDegree: number;
    decan36: number;
    decanPosition: number;
    isBackboneNode: boolean;
    hexagramId: number;
    hexagramLineActive: number;
    isNonDualCodon: boolean;
    codonClass: number;
    codonUpperPair: number;
    codonLowerPair: number;
    tarotCardId: number;
    decanPlanet: number;
    decanElement: number;
    decanChakra: number;
    degreeTick12: number;
    strand: number;
    drRing: number;
    m1AnandaValue: number;
    m0Archetype: number;
    shadowDegree: number;
    polarOpposite: number;
    enneadicChamber: number;
    chamberDayNight: number;
    lensSegment: readonly number[];
}

export interface PhaseSpaceBoundary {
    degree720: number;
    degree360: number;
    plane: 'primary-codon' | 'shadow-hexagram';
    activeValence: PhaseSpaceValenceBoundary;
    node: ClockDegreeNodeBoundary;
    lensCarrier: readonly PhaseSpaceLensPhaseBoundary[];
    fibonacciGround: PhaseSpaceFibonacciBoundary;
    authority: string;
}

/** The kernel's phase-space address, or null when absent/malformed (a gateway
 *  that predates E1) — never reconstructed locally. Shape-checks the fields
 *  the modulation graph relies on; the full contract lives in the Zod schemas. */
export function extractPhaseSpace(value: unknown): PhaseSpaceBoundary | null {
    const ps = value as PhaseSpaceBoundary | null | undefined;
    if (
        !ps ||
        typeof ps.degree720 !== 'number' ||
        typeof ps.degree360 !== 'number' ||
        (ps.plane !== 'primary-codon' && ps.plane !== 'shadow-hexagram') ||
        !Array.isArray(ps.lensCarrier) ||
        ps.lensCarrier.length !== 16
    ) {
        return null;
    }
    for (const lens of ps.lensCarrier) {
        if (
            typeof lens?.lensIndex !== 'number' ||
            typeof lens?.slice !== 'number' ||
            typeof lens?.sections !== 'number' ||
            typeof lens?.name !== 'string' ||
            typeof lens?.temporalCanon !== 'boolean' ||
            typeof lens?.segment !== 'number' ||
            typeof lens?.degreeInSegment !== 'number' ||
            typeof lens?.phase01 !== 'number'
        ) {
            return null;
        }
    }
    const fib = ps.fibonacciGround;
    if (!fib || typeof fib.position !== 'number' || typeof fib.digit !== 'number') {
        return null;
    }
    return ps;
}

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

export type CymaticMonoPolyBehaviourState =
    | 'mono'
    | 'actually-many'
    | 'actualising-one'
    | 'monopoly';

export interface CymaticMonoPolyState {
    readonly behaviourState: CymaticMonoPolyBehaviourState;
    readonly activeToneCount: number;
    readonly mutualResonance: number;
    readonly projection64: number;
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

export type CfNotation =
    | '(00/00)'
    | '(0/1)'
    | '(0/1/2)'
    | '(0/1/2/3)'
    | '(4.0/1-4.4/5)'
    | '(4.5/0)'
    | '(5/0)';

export interface VakLanguificationTrace {
    readonly cpfNotation: '(00/00)' | '(4.0/1-4.4/5)';
    readonly cfNotation: CfNotation;
    readonly m0Address: string;
    readonly vakLevel: 'para' | 'pashyanti' | 'madhyama' | 'vaikhari';
    readonly diatonicDegree: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
    readonly modeTonicCf?: CfNotation;
    readonly resonance72Index?: number;
    readonly halfDecanIndex?: number;
    readonly biasWeightsEmpty: boolean;
    readonly recognitionClosed: boolean;
    readonly provenance: readonly string[];
}

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
    's2.parashaktiCorrespondences',
    'kernelBridge.m2.planetaryElementalWeights()',
    'kernelBridge.m2.cymaticMonoPolyState(address72)',
    'kernelBridge.m3.bioquaternionTranscription(codon)'
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
