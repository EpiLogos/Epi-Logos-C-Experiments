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

/** C-backed M2 72 -> M3 64 projection returned by the registered kernel
 * bridge capability. The carrier consumes these values verbatim. */
export interface EpogdoonBridgeProjectionBoundary {
    readonly compressedCodon: number;
    readonly roundTripLoss: boolean;
    readonly expandedBack: number;
}

// ---- M1-2 ananda vortex boundary (Tranche 10.10) ----
// Mirrors portal-core kernel/projections/ananda_vortex.rs + the Zod
// AnandaVortexProjection in epi-cli/schemas/src/kernel-bridge.ts.
// Dual-faced per the canonical 12×12 Vortex Modulae CSV: every cell
// carries a raw/no-digi-root face AND a digit-root face — renderers may
// emphasize one, never re-derive either (played-torus consumer, T2.6).

/** Matrix families cross the wire as kebab-case strings (Rust
 *  `AnandaMatrixOp` serde) — 'bimba' | 'pratibimba' | 'sum' | 'diff-a' |
 *  'diff-b' | 'quintessence'. */
export interface AnandaVortexCellBoundary {
    family: string;
    rowK: number;
    positionP: number;
    rawValue: number | null;
    rawBimba: number;
    rawPratibimba: number;
    rawSum: number;
    rawDelta: number;
    drValue: number | null;
    drBimba: number;
    drPratibimba: number;
    drSum: number;
    ruleValue: string | null;
    skeletonEvent?: unknown;
}

export interface AnandaVortexProjectionBoundary {
    activeMatrixOp: string;
    activeCell: readonly [number, number];
    activeCellValue: AnandaVortexCellBoundary;
    drRingPhase: { mahamayaIdx: number; parashaktiIdx: number };
    cl42SignatureAtPosition: number;
    ringQuaternion: readonly number[];
    helixSheet: number;
    kleinFlipAtThisTick: boolean;
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

/** Bell-kernel spec §5 / T49.5 coherence rule: a present world clock with any
 *  tick or degree720 mismatch makes the chime incoherent — the strike (and any
 *  integrated readiness) must block on it. The explicit `tickMatchesProfile` /
 *  `degree720MatchesProfile` flags are the readiness authority, not a tautology
 *  on `state`: a divergent frame that claims `state: 'ready'` while a match flag
 *  is false (malformed / legacy / future-buggy gateway) still blocks. `pending`
 *  carries no clock reading to compare, so its false flags are absence of
 *  evidence, not a mismatch. */
export function isChimeCoherent(frame: M123ChimeFrameBoundary | null | undefined): boolean {
    const binding = frame?.m3?.worldClockBinding;
    const state = binding?.state;
    if (state !== 'ready' && state !== 'pending') {
        return false;
    }
    if (
        state === 'ready' &&
        (binding?.tickMatchesProfile === false || binding?.degree720MatchesProfile === false)
    ) {
        return false;
    }
    return true;
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
// 16 derived-lens rows plus primary Ground lens 16. Kernel-computed from C .rodata
// CLOCK_DEGREE_LUT; the app consumes it and never re-derives degree law.

export interface PhaseSpaceLensPhaseBoundary {
    lensIndex: number;
    slice: number;
    sections: number;
    name: string;
    /** The temporality structurers — the 24/12/4-section divisions that gear
     *  rhythm and time through the primary Fibonacci Ground lens. */
    temporalCanon: boolean;
    segment: number;
    degreeInSegment: number;
    phase01: number;
}

export interface PhaseSpaceFibonacciBoundary {
    lensId: 16;
    role: 'primary-ground';
    slice: 6;
    sections: 60;
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
    if (
        !fib ||
        fib.lensId !== 16 ||
        fib.role !== 'primary-ground' ||
        fib.slice !== 6 ||
        fib.sections !== 60 ||
        typeof fib.position !== 'number' ||
        typeof fib.digit !== 'number'
    ) {
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

/** Mythos card reference (additive, 4.17) — kernel card index, never a local deck. */
export interface MajorArcanaCardRef {
    cardId: number;
    label?: string;
}

export interface SymbolicProtein {
    proteinId: string;
    sequence: OracleSequence;
    readingFrame: OracleFrame;
    startPositionRef?: string;
    stopPositionRef?: string;
    /** additive 4.17 — ORF chain refs + kairos handles + Mythos reading */
    startPacketRef?: string;
    stopPacketRef?: string;
    kairosOpen?: string;
    kairosClose?: string;
    mythosArchetypeReading?: MajorArcanaCardRef;
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
    /** additive 4.17 — ORF governance + session back-ref */
    isOrfSeed?: boolean;
    isOrfSeal?: boolean;
    sessionIdRef?: string;
}

export interface KernelBridgeSubscriber {
    id: string;
    kind: KernelBridgeConsumerKind;
    requestedProfile: KernelBridgeSubscriptionProfile;
}

export interface KernelBridgeCachedProfile {
    generation: number;
    /** B-12 (09.T9.5): the S2 `GraphMeta.graph_revision` this profile was
     *  projected against, relayed by the kernel-bridge. A governed Bimba write
     *  bumps it; carrying it on the tick is what lets the M1/M2/M3 renderings
     *  see an edit crossed. Absent when the upstream context stamped none. */
    graphRevision?: number;
    cachedAtMs: number;
    stale: boolean;
    stalenessMs: number;
    privacyClass: string;
    /** Opaque profile payload — `MathemeHarmonicProfile` serialised as JSON. */
    profile: unknown;
}

export interface KernelBridgeProfileJsonShape {
    generation: number;
    graphRevision?: number;
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

/** T37.5 — the ONE canonical MonoPoly behaviour vocabulary shared by the M0
 *  dialectic render (Track 21's archetypal ground) and the M2 cymatic
 *  wave-behaviour projection, so the two speak one vocabulary instead of two
 *  divergent enums: `mono` (undifferentiated one) / `actually-many`
 *  (differentiated) / `actualising-one` (cohering) / `monopoly` (the false one).
 *  Both surfaces import THIS type. */
export type MonoPolyState =
    | 'mono'
    | 'actually-many'
    | 'actualising-one'
    | 'monopoly';

/** @deprecated M2-scoped historical name — kept as a transparent back-compat
 *  alias of the shared {@link MonoPolyState} (T37.5 M0↔M2 vocabulary
 *  reconciliation). New code imports `MonoPolyState`. */
export type CymaticMonoPolyBehaviourState = MonoPolyState;

export interface CymaticMonoPolyState {
    readonly behaviourState: MonoPolyState;
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

export interface ThirdSpandaRoutingAxisViews {
    readonly mef: {
        readonly lens: number;
        readonly position: number;
        readonly isInverted: boolean;
        readonly lFamilyLink: number;
    };
    readonly tattva: { readonly tattvaIndex: number; readonly phase: number };
    readonly decan: {
        readonly elementId: number;
        readonly sign: number;
        readonly decan: number;
        readonly face: number;
        readonly rulingPlanet: number;
    };
    readonly shem: {
        readonly shemIdx: number;
        readonly choir: number;
        readonly position: number;
        readonly elementId: number;
        readonly decanLink: number;
    };
    readonly maqam: {
        readonly index72: number;
        readonly family: number;
        readonly modeInFamily: number;
        readonly planetRuler: number;
    };
    readonly det: {
        readonly index72: number;
        readonly compressed64: number;
        readonly det64: number;
    };
}

export interface ThirdSpandaCodonRotation {
    readonly lens: number;
    readonly mode: number;
    readonly lensLabel: string;
    readonly modeName: string;
    readonly surfaceIndex: number;
    readonly codonId: number;
    readonly codon: string;
    readonly codonClass: string;
    readonly rotation: number;
    readonly rotationalStateCount: number;
    readonly rotationDegrees: number;
    readonly reverseLens: number;
    readonly reverseMode: number;
    readonly datasetLutState: string;
    readonly provenance: string;
}

export interface ThirdSpandaRuntimeTrace {
    readonly m1: {
        readonly priorGround: string;
        readonly parentAttribution: string;
        readonly degree720: number;
        readonly hopfFiber: number;
        readonly ringQuaternion: readonly [number, number, number, number];
        readonly advancementAddress64: number;
    };
    readonly m2: {
        readonly address72: number;
        readonly axisViews: ThirdSpandaRoutingAxisViews;
    };
    readonly epogdoon: {
        readonly ratioNumerator: 9;
        readonly ratioDenominator: 8;
        readonly sourceAddress72: number;
        readonly blockIndex: number;
        readonly blockPhase: number;
        readonly compressedAddress64: number;
        readonly expandedAddress72: number;
        readonly roundTripExact: boolean;
        readonly roundTripLoss: number;
        readonly collision: {
            readonly ordinal: number;
            readonly sourcePair72: readonly [number, number];
            readonly activeRole: 'first-source' | 'second-source';
        } | null;
        readonly cardinality: {
            readonly blockSize: 9;
            readonly blockCount: 8;
            readonly collisionPairCount: 8;
            readonly exactRoundTripCount: 8;
            readonly nonExactRoundTripCount: 64;
        };
    };
    readonly m3: {
        readonly detReceptionAddress64: number;
        readonly worldClockAddress64: number;
        readonly codonId: number;
        readonly codon: string;
        readonly codonRotation: ThirdSpandaCodonRotation;
        readonly transcriptionState:
            | 'round-trip-anchor'
            | 'compressed-nonexact-round-trip';
        readonly lineChangeOperator: number;
    };
}

/** Cross-cutting profile projection — cumulative M1→M2→M3 process with M0
 *  retained as prior 0/1 ground. Every field derives from existing
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
    readonly codonId: number;
    readonly codon: string;
    readonly lineChangeOperator: number;
    readonly pairedMahamayaFifteens: readonly [15, 15];
    readonly backboneIdentity: '24x15=360';
    readonly lineGraphIdentity: '360+24=384';
    readonly qCosmicRef: string;
    readonly qComposedHandle?: string;
    readonly learnedPredictorCheckpointRef?: string;
    readonly thirdSpanda: ThirdSpandaRuntimeTrace;
    readonly provenance: readonly string[];
}

export interface LensCodonBinaryCharges {
    readonly pp: number;
    readonly nn: number;
    readonly np: number;
    readonly pn: number;
}

export interface LensCodonBinaryDegree {
    readonly degree360: number;
    readonly exactDegree720: number;
    readonly codonUpper: number;
    readonly codonLower: number;
    readonly codonClass: number;
    readonly charges: LensCodonBinaryCharges;
    readonly quaternion: readonly [number, number, number, number];
    readonly elementCanonical: number;
    readonly hexagramId: number;
    readonly lineChangeOperator: number;
    readonly tick12: number;
    readonly fibonacciPosition: number;
    readonly fibonacciDigit: number;
    readonly fibonacciPhase01: number;
}

export interface LensCodonBinaryProjection {
    readonly lensId: number;
    readonly lensRole: 'primary-ground' | 'derived-aperture';
    readonly groundingLensId: 16;
    readonly segment: readonly number[];
    readonly perDegree: readonly LensCodonBinaryDegree[];
}

export function parseLensCodonBinaryProjection(value: unknown): LensCodonBinaryProjection {
    const root = requiredObject(value, 'lensCodonBinary');
    const lensId = requiredInteger(root.lensId, 'lensCodonBinary.lensId', 0, 16);
    const slices = [1, 2, 4, 8, 9, 10, 12, 15, 24, 30, 36, 40, 45, 90, 180, 360] as const;
    const isGround = lensId === 16;
    const lensRole = root.lensRole;
    if (typeof lensRole !== 'string') {
        throw new Error('lensCodonBinary.lensRole must be a string');
    }
    const expectedRole = isGround ? 'primary-ground' : 'derived-aperture';
    if (lensRole !== expectedRole) {
        throw new Error(`lensCodonBinary.lensRole must be ${expectedRole} for lensId ${lensId}`);
    }
    const groundingLensId = requiredInteger(root.groundingLensId, 'lensCodonBinary.groundingLensId', 16, 16) as 16;
    const slice = isGround ? 6 : slices[lensId];
    const expectedSections = 360 / slice;
    if (!Array.isArray(root.segment) || !root.segment.every(Number.isInteger)) {
        throw new Error('lensCodonBinary.segment must contain integer boundary degrees');
    }
    const segment = root.segment as number[];
    if (
        segment.length !== expectedSections
        || segment.some((degree, index) => degree !== index * slice)
    ) {
        throw new Error(`lensCodonBinary.segment must contain the ${expectedSections} canonical lens boundaries`);
    }
    if (!Array.isArray(root.perDegree) || root.perDegree.length !== expectedSections) {
        throw new Error(`lensCodonBinary.perDegree must contain ${expectedSections} boundary records`);
    }
    const perDegree = root.perDegree.map((entry, index) =>
        parseLensCodonBinaryDegree(entry, segment[index], index)
    );
    return { lensId, lensRole: expectedRole, groundingLensId, segment, perDegree };
}

function parseLensCodonBinaryDegree(
    value: unknown,
    expectedDegree: number,
    index: number
): LensCodonBinaryDegree {
    const path = `lensCodonBinary.perDegree[${index}]`;
    const entry = requiredObject(value, path);
    const charges = requiredObject(entry.charges, `${path}.charges`);
    const chargeKeys = Object.keys(charges).sort();
    if (chargeKeys.join(',') !== 'nn,np,pn,pp') {
        throw new Error(`${path}.charges must expose exactly pp/nn/np/pn`);
    }
    const quaternion = entry.quaternion;
    if (!Array.isArray(quaternion) || quaternion.length !== 4 || !quaternion.every(isFiniteNumber)) {
        throw new Error(`${path}.quaternion must contain four finite numbers`);
    }
    const degree360 = requiredInteger(entry.degree360, `${path}.degree360`, 0, 359);
    const exactDegree720 = requiredNumber(entry.exactDegree720, `${path}.exactDegree720`);
    const hexagramId = requiredInteger(entry.hexagramId, `${path}.hexagramId`, 0, 63);
    const lineChangeOperator = requiredInteger(entry.lineChangeOperator, `${path}.lineChangeOperator`, 0, 5);
    const fibonacciPosition = requiredInteger(entry.fibonacciPosition, `${path}.fibonacciPosition`, 0, 59);
    const fibonacciPhase01 = requiredNumber(entry.fibonacciPhase01, `${path}.fibonacciPhase01`);
    if (degree360 !== expectedDegree || exactDegree720 !== expectedDegree * 2) {
        throw new Error(`${path} must preserve its C-authored lens boundary degree`);
    }
    if (fibonacciPosition !== Math.floor(expectedDegree / 6) || fibonacciPhase01 !== (expectedDegree % 6) / 6) {
        throw new Error(`${path} must carry its primary Fibonacci Ground address`);
    }
    if (
        quaternion[0] !== charges.pp
        || quaternion[1] !== charges.nn
        || quaternion[2] !== charges.np
        || quaternion[3] !== charges.pn
    ) {
        throw new Error(`${path}.quaternion must preserve pp/nn/np/pn order`);
    }
    return {
        degree360,
        exactDegree720,
        codonUpper: requiredInteger(entry.codonUpper, `${path}.codonUpper`, 0, 3),
        codonLower: requiredInteger(entry.codonLower, `${path}.codonLower`, 0, 3),
        codonClass: requiredInteger(entry.codonClass, `${path}.codonClass`, 0, 3),
        charges: {
            pp: requiredNumber(charges.pp, `${path}.charges.pp`),
            nn: requiredNumber(charges.nn, `${path}.charges.nn`),
            np: requiredNumber(charges.np, `${path}.charges.np`),
            pn: requiredNumber(charges.pn, `${path}.charges.pn`)
        },
        quaternion: quaternion as [number, number, number, number],
        elementCanonical: requiredInteger(entry.elementCanonical, `${path}.elementCanonical`, 0, 5),
        hexagramId,
        lineChangeOperator,
        tick12: requiredInteger(entry.tick12, `${path}.tick12`, 0, 11),
        fibonacciPosition,
        fibonacciDigit: requiredInteger(entry.fibonacciDigit, `${path}.fibonacciDigit`, 0, 9),
        fibonacciPhase01
    };
}

function requiredObject(value: unknown, path: string): Record<string, unknown> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new Error(`${path} must be an object`);
    }
    return value as Record<string, unknown>;
}

function isFiniteNumber(value: unknown): value is number {
    return typeof value === 'number' && Number.isFinite(value);
}

function requiredNumber(value: unknown, path: string): number {
    if (!isFiniteNumber(value)) throw new Error(`${path} must be a finite number`);
    return value;
}

function requiredInteger(value: unknown, path: string, min: number, max: number): number {
    if (!Number.isInteger(value) || (value as number) < min || (value as number) > max) {
        throw new Error(`${path} must be an integer in ${min}..${max}`);
    }
    return value as number;
}

/** The trace now rides the bus first-class (Track 36/10.P5 —
 *  `profile.anuttaraPentadicTrace`, kernel-derived). The real reader is
 *  `panes/m3PentadicInspector.ts::pentadicTraceFromPayload`; the former
 *  doc-ahead `buildPentadicTrace` declare stub is retired (derivation is
 *  kernel-side only, never the renderer). */

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
    'kernelBridge.m2.epogdoonProjection(address72)',
    'kernelBridge.m2.planetaryElementalWeights()',
    'kernelBridge.m2.cymaticMonoPolyState(address72)',
    'kernelBridge.m3.bioquaternionTranscription(codon)',
    'kernelBridge.m3.lensCodonBinary(lensId)'
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

// ---- Spanda phase anchor (02.T2.14 / DR-M1-5) ----
// Mirror of the `spanda` block on `profile.update` and the
// `portal.spanda_transport` immediate event (gate/server/mod.rs
// `spanda_block_json`). THE ANCHOR RIDES, NEVER PHASE SAMPLES: clients
// derive tick12 and the intra-tick fraction locally from these plain
// numbers at any framerate. `slerpFraction` is never emitted — it
// dissolved into local anchor evaluation. Evaluating the shared anchor
// locally is the ONE clock read locally; inventing a rate or advancing
// an anchor renderer-side stays forbidden.

export type SpandaTransportModeBoundary = 'flowing' | 'held' | 'walking';
export type SpandaDirectionBoundary = 'forward' | 'reflected';

export interface SpandaAnchorBoundary {
    epochMs: number;
    phase0: number;
    rateHz: number;
    mode: SpandaTransportModeBoundary;
    direction: SpandaDirectionBoundary;
    /** Readout at emission — cheap consumers may use it; live consumers
     *  derive their own via spandaTick12At. */
    tick12: number;
}

export const PORTAL_SPANDA_TRANSPORT_EVENT = 'portal.spanda_transport' as const;

/** The twelvefold readout convention (C ground `spanda_tick12_readout`):
 *  one 2π cycle = twelve epogdoon-steps. */
const SPANDA_TWELVEFOLD = 12;

export function readSpandaAnchor(payload: unknown): SpandaAnchorBoundary | null {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
        return null;
    }
    const block = (payload as Record<string, unknown>).spanda ?? payload;
    if (!block || typeof block !== 'object' || Array.isArray(block)) {
        return null;
    }
    const record = block as Record<string, unknown>;
    const epochMs = record.epochMs;
    const phase0 = record.phase0;
    const rateHz = record.rateHz;
    const mode = record.mode;
    const direction = record.direction;
    if (
        typeof epochMs !== 'number' ||
        typeof phase0 !== 'number' ||
        typeof rateHz !== 'number' ||
        (mode !== 'flowing' && mode !== 'held' && mode !== 'walking') ||
        (direction !== 'forward' && direction !== 'reflected')
    ) {
        return null;
    }
    return {
        epochMs,
        phase0,
        rateHz,
        mode,
        direction,
        tick12: typeof record.tick12 === 'number' ? record.tick12 : 0
    };
}

/** Cycle phase (radians, unwrapped) at `nowMs` — the local evaluation of the
 *  shared anchor. Held/walking hold phase0; flowing advances at the STEP rate
 *  (rateHz steps/sec → 2π/12 radians per step), signed by direction. Instants
 *  before the epoch evaluate AT the epoch. */
export function spandaPhaseAt(anchor: SpandaAnchorBoundary, nowMs: number): number {
    if (anchor.mode !== 'flowing') {
        return anchor.phase0;
    }
    const elapsedS = Math.max(0, nowMs - anchor.epochMs) / 1_000;
    const signed = anchor.direction === 'reflected' ? -elapsedS : elapsedS;
    return anchor.phase0 + (signed * anchor.rateHz * (2 * Math.PI)) / SPANDA_TWELVEFOLD;
}

function normalizedCyclePosition(anchor: SpandaAnchorBoundary, nowMs: number): number {
    const tau = 2 * Math.PI;
    let norm = spandaPhaseAt(anchor, nowMs) % tau;
    if (norm < 0) {
        norm += tau;
    }
    return (norm / tau) * SPANDA_TWELVEFOLD;
}

/** tick12 derived locally from the shared anchor (readout convention). */
export function spandaTick12At(anchor: SpandaAnchorBoundary, nowMs: number): number {
    return Math.floor(normalizedCyclePosition(anchor, nowMs)) % SPANDA_TWELVEFOLD;
}

/** The intra-tick fraction [0,1) — the continuous phase the tick flowers
 *  from. THIS is what the old `slerpFraction` ask dissolved into: a pure
 *  local function of the shared anchor, no renderer clock, no emission. */
export function spandaFractionAt(anchor: SpandaAnchorBoundary, nowMs: number): number {
    const position = normalizedCyclePosition(anchor, nowMs);
    return position - Math.floor(position);
}
