/**
 * Coordinate: M' bridge boundary over S0/S3 kernel contracts.
 * Residency: Body/M/pratibimba-app/src/bridge.
 * Position (#n): active-carrier typed ingress.
 * Actualises: the TypeScript mirror of gateway runtime event, profile, and
 *   capability shapes, including 24.T24.20's strict M3 transcription packet.
 * Public surface: exported bridge interfaces, guards, and strict parsers.
 * Does NOT own: gateway protocol, kernel projection law, or renderer behavior.
 * Contract: [[M'-SYSTEM-SPEC]] / [[S0-SPEC]] / [[S3-SPEC]] / [[M3'-SPEC]].
 *
 * Every interface uses `camelCase` because the Rust structs declare
 * `#[serde(rename_all = "camelCase")]`. Source authority is
 * `Body/S/S3/gateway-contract/src/lib.rs` plus
 * `Body/S/S0/epi-cli/src/gate/kernel_bridge_runtime.rs`.
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

export interface CymaticSphereHarmonicBoundary {
    readonly degree: number;
    readonly order: number;
    readonly amplitudeHz: number;
    readonly qlPosition: number;
    readonly helix: 'bimba' | 'pratibimba';
}

export interface CymaticSphereChakraBoundary {
    readonly chakraId: number;
    readonly name: string;
    readonly elementId: number | null;
    readonly tattvaIndex: number | null;
    readonly meaningId: number;
    readonly harmonic: CymaticSphereHarmonicBoundary;
    readonly provenance: string;
}

export interface CymaticPlanetAnchorBoundary {
    readonly planetId: number;
    readonly name: string;
    readonly degree: number;
    readonly retrograde: boolean;
    readonly elementId: number;
    readonly provenance: string;
}

export interface CymaticSpheresProjectionBoundary {
    readonly chakras: readonly CymaticSphereChakraBoundary[];
    readonly earthObserver: {
        readonly ordinal: 10;
        readonly name: 'Earth';
        readonly role: 'observer-centre';
        readonly position: readonly [0, 0, 0];
        readonly provenance: string;
    };
    readonly sun: CymaticPlanetAnchorBoundary;
    readonly activePlanet: CymaticPlanetAnchorBoundary;
    readonly epogdoonRatio: '9:8';
    readonly provenance: string;
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

/** FR 2.1.10 seat semantics — the M0-3 number-dozen binding, once per
 *  projection. Positions 0-9 = archetypal numbers (seats skip M0-3-4,
 *  which belongs to 0/1 itself); 10 = (0/1) Non-Dual Binary (M0-3-4);
 *  11 = (-) Mirror (M0-3-(0/1)). busRole is the 8+4 partition (masculine
 *  octet = zero-elements + Adam evens; feminine quartet = Eve odds + 9),
 *  the archetypal ground of the audio_octet[8]/nodal_quartet[4] bus
 *  cardinality. seatKind/busRole cross the wire as kebab-case strings. */
export interface AnandaSeatBindingBoundary {
    position: number;
    seatKind: 'number' | 'non-dual-binary' | 'mirror' | string;
    archetypeNumber: number | null;
    coordinate: string;
    symbol: string;
    busRole: 'octet' | 'quartet' | string;
}

export interface AnandaVortexProjectionBoundary {
    activeMatrixOp: string;
    activeCell: readonly [number, number];
    activeCellValue: AnandaVortexCellBoundary;
    /** Complete six-family 12×12 kernel projection; null for legacy frames. */
    matrixCells: readonly AnandaVortexCellBoundary[] | null;
    /** Twelve M0-3 seat bindings; null for pre-FR-2.1.10 legacy frames. */
    seatSemantics?: readonly AnandaSeatBindingBoundary[] | null;
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
    natalFibonacciPosition?: number;
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
        (q.natalFibonacciPosition !== undefined &&
            (typeof q.natalFibonacciPosition !== 'number' ||
                !Number.isInteger(q.natalFibonacciPosition) ||
                q.natalFibonacciPosition < 0 ||
                q.natalFibonacciPosition > 59)) ||
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
    digitLut?: readonly number[];
    backboneDegrees?: readonly number[];
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
    if (
        fib.digitLut !== undefined &&
        (!Array.isArray(fib.digitLut) ||
            fib.digitLut.length !== 60 ||
            fib.digitLut.some(
                digit => !Number.isInteger(digit) || digit < 0 || digit > 9
            ))
    ) {
        return null;
    }
    if (
        fib.backboneDegrees !== undefined &&
        (!Array.isArray(fib.backboneDegrees) ||
            fib.backboneDegrees.length !== 24 ||
            fib.backboneDegrees.some(
                degree => !Number.isInteger(degree) || degree < 0 || degree > 359
            ))
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

export interface LensCodonBinaryChargeIdentity {
    readonly charge: 'pp' | 'nn' | 'np' | 'pn';
    readonly xPermutation: 'X2' | 'X1' | 'X4' | 'X3';
    readonly element: 'earth' | 'fire' | 'water' | 'air';
    readonly quaternionComponent: 'w' | 'x' | 'y' | 'z';
}

export interface LensCodonBinaryLineHop {
    readonly line: number;
    readonly operatorAddress: number;
    readonly fromHexagramId: number;
    readonly toHexagramId: number;
}

export interface LensCodonBinaryDegree {
    readonly degree360: number;
    readonly exactDegree720: number;
    readonly codonUpper: number;
    readonly codonMiddle: number;
    readonly codonLower: number;
    readonly codonPairs: readonly [number, number, number];
    readonly codonPairBits: readonly [string, string, string];
    readonly codon6Bit: number;
    readonly codonClass: number;
    readonly codonClassLabel:
        | 'perfect-palindromic'
        | 'imperfect-palindromic'
        | 'non-palindromic-non-dual'
        | 'dual';
    readonly charges: LensCodonBinaryCharges;
    readonly quaternion: readonly [number, number, number, number];
    readonly chargeIdentity: readonly [
        LensCodonBinaryChargeIdentity,
        LensCodonBinaryChargeIdentity,
        LensCodonBinaryChargeIdentity,
        LensCodonBinaryChargeIdentity
    ];
    readonly fourX: number;
    readonly xLogicInvariant: boolean;
    readonly elementCanonical: number;
    readonly hexagramId: number;
    readonly lineChangeOperator: number;
    readonly lineChangeHops: readonly LensCodonBinaryLineHop[];
    readonly rnaCapable: boolean;
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
    const parsedCharges = {
        pp: requiredNumber(charges.pp, `${path}.charges.pp`),
        nn: requiredNumber(charges.nn, `${path}.charges.nn`),
        np: requiredNumber(charges.np, `${path}.charges.np`),
        pn: requiredNumber(charges.pn, `${path}.charges.pn`)
    };
    const quaternion = entry.quaternion;
    if (!Array.isArray(quaternion) || quaternion.length !== 4 || !quaternion.every(isFiniteNumber)) {
        throw new Error(`${path}.quaternion must contain four finite numbers`);
    }
    const degree360 = requiredInteger(entry.degree360, `${path}.degree360`, 0, 359);
    const exactDegree720 = requiredNumber(entry.exactDegree720, `${path}.exactDegree720`);
    const hexagramId = requiredInteger(entry.hexagramId, `${path}.hexagramId`, 0, 63);
    const codonUpper = requiredInteger(entry.codonUpper, `${path}.codonUpper`, 0, 3);
    const codonMiddle = requiredInteger(entry.codonMiddle, `${path}.codonMiddle`, 0, 3);
    const codonLower = requiredInteger(entry.codonLower, `${path}.codonLower`, 0, 3);
    const codon6Bit = requiredInteger(entry.codon6Bit, `${path}.codon6Bit`, 0, 63);
    const codonPairs = entry.codonPairs;
    const codonPairBits = entry.codonPairBits;
    const pairBitWitness = ['00', '01', '10', '11'] as const;
    if (
        !Array.isArray(codonPairs)
        || codonPairs.length !== 3
        || !codonPairs.every(
            pair => Number.isInteger(pair) && pair >= 0 && pair <= 3
        )
        || codonPairs[0] !== codonUpper
        || codonPairs[1] !== codonMiddle
        || codonPairs[2] !== codonLower
        || codon6Bit !== codonUpper * 16 + codonMiddle * 4 + codonLower
        || codon6Bit !== hexagramId
    ) {
        throw new Error(`${path} must preserve its authority-provided 3x2-bit codon`);
    }
    if (
        !Array.isArray(codonPairBits)
        || codonPairBits.length !== 3
        || codonPairBits.some(
            (bits, pairIndex) => bits !== pairBitWitness[codonPairs[pairIndex]]
        )
    ) {
        throw new Error(`${path}.codonPairBits must preserve the authority bit readout`);
    }
    const codonClass = requiredInteger(entry.codonClass, `${path}.codonClass`, 0, 3);
    const codonClassLabels = [
        'perfect-palindromic',
        'imperfect-palindromic',
        'non-palindromic-non-dual',
        'dual'
    ] as const;
    const expectedCodonClassLabel = codonClassLabels[codonClass];
    if (entry.codonClassLabel !== expectedCodonClassLabel) {
        throw new Error(`${path}.codonClassLabel must match codonClass`);
    }
    const lineChangeOperator = requiredInteger(entry.lineChangeOperator, `${path}.lineChangeOperator`, 0, 5);
    const lineChangeHops = entry.lineChangeHops;
    if (!Array.isArray(lineChangeHops) || lineChangeHops.length !== 6) {
        throw new Error(`${path}.lineChangeHops must contain all six line changes`);
    }
    const parsedLineChangeHops = lineChangeHops.map((value, line) => {
        const hop = requiredObject(value, `${path}.lineChangeHops[${line}]`);
        const parsed = {
            line: requiredInteger(hop.line, `${path}.lineChangeHops[${line}].line`, 0, 5),
            operatorAddress: requiredInteger(
                hop.operatorAddress,
                `${path}.lineChangeHops[${line}].operatorAddress`,
                0,
                383
            ),
            fromHexagramId: requiredInteger(
                hop.fromHexagramId,
                `${path}.lineChangeHops[${line}].fromHexagramId`,
                0,
                63
            ),
            toHexagramId: requiredInteger(
                hop.toHexagramId,
                `${path}.lineChangeHops[${line}].toHexagramId`,
                0,
                63
            )
        };
        if (
            parsed.line !== line
            || parsed.operatorAddress !== hexagramId * 6 + line
            || parsed.fromHexagramId !== hexagramId
            || parsed.toHexagramId !== (hexagramId ^ (1 << line))
        ) {
            throw new Error(`${path}.lineChangeHops[${line}] violates the 64x6 authority witness`);
        }
        return parsed;
    });
    const identityWitness = [
        ['pp', 'X2', 'earth', 'w'],
        ['nn', 'X1', 'fire', 'x'],
        ['np', 'X4', 'water', 'y'],
        ['pn', 'X3', 'air', 'z']
    ] as const;
    if (!Array.isArray(entry.chargeIdentity) || entry.chargeIdentity.length !== 4) {
        throw new Error(`${path}.chargeIdentity must contain pp/nn/np/pn identities`);
    }
    const parsedChargeIdentity = entry.chargeIdentity.map((value, identityIndex) => {
        const identity = requiredObject(
            value,
            `${path}.chargeIdentity[${identityIndex}]`
        );
        const expected = identityWitness[identityIndex];
        if (
            identity.charge !== expected[0]
            || identity.xPermutation !== expected[1]
            || identity.element !== expected[2]
            || identity.quaternionComponent !== expected[3]
        ) {
            throw new Error(`${path}.chargeIdentity[${identityIndex}] violates the canonical X identity`);
        }
        return {
            charge: expected[0],
            xPermutation: expected[1],
            element: expected[2],
            quaternionComponent: expected[3]
        };
    }) as unknown as LensCodonBinaryDegree['chargeIdentity'];
    const fourX = requiredInteger(entry.fourX, `${path}.fourX`, 0, 64);
    if (entry.xLogicInvariant !== true) {
        throw new Error(`${path}.xLogicInvariant must be authority-true`);
    }
    if (
        parsedCharges.pp
        + parsedCharges.nn
        + parsedCharges.np
        + parsedCharges.pn
        !== fourX
    ) {
        throw new Error(`${path}.fourX must equal the authority charge sum`);
    }
    if (typeof entry.rnaCapable !== 'boolean') {
        throw new Error(`${path}.rnaCapable must be a boolean`);
    }
    const fibonacciPosition = requiredInteger(entry.fibonacciPosition, `${path}.fibonacciPosition`, 0, 59);
    const fibonacciPhase01 = requiredNumber(entry.fibonacciPhase01, `${path}.fibonacciPhase01`);
    if (degree360 !== expectedDegree || exactDegree720 !== expectedDegree * 2) {
        throw new Error(`${path} must preserve its C-authored lens boundary degree`);
    }
    if (fibonacciPosition !== Math.floor(expectedDegree / 6) || fibonacciPhase01 !== (expectedDegree % 6) / 6) {
        throw new Error(`${path} must carry its primary Fibonacci Ground address`);
    }
    if (
        quaternion[0] !== parsedCharges.pp
        || quaternion[1] !== parsedCharges.nn
        || quaternion[2] !== parsedCharges.np
        || quaternion[3] !== parsedCharges.pn
    ) {
        throw new Error(`${path}.quaternion must preserve pp/nn/np/pn order`);
    }
    return {
        degree360,
        exactDegree720,
        codonUpper,
        codonMiddle,
        codonLower,
        codonPairs: codonPairs as [number, number, number],
        codonPairBits: codonPairBits as [string, string, string],
        codon6Bit,
        codonClass,
        codonClassLabel: expectedCodonClassLabel,
        charges: parsedCharges,
        quaternion: quaternion as [number, number, number, number],
        chargeIdentity: parsedChargeIdentity,
        fourX,
        xLogicInvariant: true,
        elementCanonical: requiredInteger(entry.elementCanonical, `${path}.elementCanonical`, 0, 5),
        hexagramId,
        lineChangeOperator,
        lineChangeHops: parsedLineChangeHops,
        rnaCapable: entry.rnaCapable,
        tick12: requiredInteger(entry.tick12, `${path}.tick12`, 0, 11),
        fibonacciPosition,
        fibonacciDigit: requiredInteger(entry.fibonacciDigit, `${path}.fibonacciDigit`, 0, 9),
        fibonacciPhase01
    };
}

// ---- kernelBridge.m3.lensField(lensId) boundary (generic lens-field dynamic) ----
// Mirrors portal-core lens_field.rs + pleroma_lens.rs and the Zod
// LensFieldProjection. The carrier consumes structure/activation verbatim;
// symbolic systems (pleroma at lens 6) are instance decorations of the ONE
// generic field — never a parallel lens namespace.

export type LensFieldElementBoundary = 'fire' | 'earth' | 'air' | 'water';

export interface LensFieldSegmentBoundary {
    readonly segment: number;
    readonly startDegree: number;
    readonly midpoint720: number;
    readonly element: LensFieldElementBoundary;
}

export interface LensFieldChannelBalanceBoundary {
    readonly channel: number;
    readonly priorSegment: number;
    readonly consortSegment: number;
    readonly priorElement: LensFieldElementBoundary;
    readonly consortElement: LensFieldElementBoundary;
    readonly signedBalance: number;
}

export interface PleromaSeatBoundary {
    readonly segment: number;
    readonly aeon: string;
    readonly arc: 'ogdoad' | 'decad' | 'dodecad';
    readonly syzygy: number;
    readonly prior: boolean;
    readonly element: LensFieldElementBoundary;
}

export interface LensFieldProjectionBoundary {
    readonly lensId: number;
    readonly slice: number;
    readonly sections: number;
    readonly topologyKind: 'diameter-paired' | 'boundary-opposed' | 'self-opposed';
    readonly segments: readonly LensFieldSegmentBoundary[];
    readonly positionedOrbiters: number;
    readonly channelBalances: readonly LensFieldChannelBalanceBoundary[];
    readonly akashaCondition: boolean | null;
    readonly balanceQuaternion: readonly [number, number, number, number];
    readonly pleromaSeats: readonly PleromaSeatBoundary[] | null;
    readonly pleromaLayout: string | null;
}

const LENS_FIELD_ELEMENTS: readonly string[] = ['fire', 'earth', 'air', 'water'];

export function parseLensFieldProjection(value: unknown): LensFieldProjectionBoundary {
    const root = requiredObject(value, 'lensField');
    const lensId = requiredInteger(root.lensId, 'lensField.lensId', 0, 16);
    const structure = requiredObject(root.structure, 'lensField.structure');
    const slice = requiredInteger(structure.slice, 'lensField.structure.slice', 1, 360);
    const sections = requiredInteger(structure.sections, 'lensField.structure.sections', 1, 360);
    if (slice * sections !== 360) {
        throw new Error('lensField.structure must tile the 360');
    }
    const topology = requiredObject(structure.topology, 'lensField.structure.topology');
    const topologyKind = topology.kind;
    const expectedTopology = sections === 1
        ? 'self-opposed'
        : sections % 2 === 0 ? 'diameter-paired' : 'boundary-opposed';
    if (topologyKind !== expectedTopology) {
        throw new Error(`lensField.structure.topology must be ${expectedTopology} for ${sections} sections`);
    }
    if (!Array.isArray(structure.segments) || structure.segments.length !== sections) {
        throw new Error('lensField.structure.segments must carry one record per section');
    }
    const segments = structure.segments.map((entry, index) => {
        const path = `lensField.structure.segments[${index}]`;
        const record = requiredObject(entry, path);
        const element = record.element;
        if (typeof element !== 'string' || !LENS_FIELD_ELEMENTS.includes(element)) {
            throw new Error(`${path}.element must be a Ring-1 element`);
        }
        return {
            segment: requiredInteger(record.segment, `${path}.segment`, 0, 359),
            startDegree: requiredInteger(record.startDegree, `${path}.startDegree`, 0, 359),
            midpoint720: requiredInteger(record.midpoint720, `${path}.midpoint720`, 0, 719),
            element: element as LensFieldElementBoundary
        };
    });
    const activation = requiredObject(root.activation, 'lensField.activation');
    const positionedOrbiters = requiredInteger(activation.positionedOrbiters, 'lensField.activation.positionedOrbiters', 0, 9);
    const akashaCondition = activation.akashaCondition;
    if (akashaCondition !== null && typeof akashaCondition !== 'boolean') {
        throw new Error('lensField.activation.akashaCondition must be boolean or an honest null');
    }
    if (positionedOrbiters === 0 && akashaCondition !== null) {
        throw new Error('lensField.activation must not fabricate an Akasha verdict without positioned orbiters');
    }
    const rawBalances = Array.isArray(activation.channelBalances) ? activation.channelBalances : [];
    const channelBalances = rawBalances.map((entry, index) => {
        const path = `lensField.activation.channelBalances[${index}]`;
        const record = requiredObject(entry, path);
        return {
            channel: requiredInteger(record.channel, `${path}.channel`, 0, 179),
            priorSegment: requiredInteger(record.priorSegment, `${path}.priorSegment`, 0, 359),
            consortSegment: requiredInteger(record.consortSegment, `${path}.consortSegment`, 0, 359),
            priorElement: record.priorElement as LensFieldElementBoundary,
            consortElement: record.consortElement as LensFieldElementBoundary,
            signedBalance: requiredNumber(record.signedBalance, `${path}.signedBalance`)
        };
    });
    const quaternion = root.balanceQuaternion;
    if (!Array.isArray(quaternion) || quaternion.length !== 4 || !quaternion.every(isFiniteNumber)) {
        throw new Error('lensField.balanceQuaternion must contain four finite numbers');
    }
    const symbolic = root.symbolicSystem;
    let pleromaSeats: PleromaSeatBoundary[] | null = null;
    let pleromaLayout: string | null = null;
    if (lensId === 6) {
        const system = requiredObject(symbolic, 'lensField.symbolicSystem');
        if (system.kind !== 'pleroma') {
            throw new Error('lensField.symbolicSystem at lens 6 must be the pleroma');
        }
        pleromaLayout = typeof system.layout === 'string' ? system.layout : null;
        if (!Array.isArray(system.seats) || system.seats.length !== 30) {
            throw new Error('lensField.symbolicSystem.seats must carry the 30 aeons');
        }
        if (!Array.isArray(system.syzygies) || system.syzygies.length !== 15) {
            throw new Error('lensField.symbolicSystem.syzygies must carry the 15 channels');
        }
        const digitTotal = system.syzygies.reduce((sum: number, entry) => {
            const record = requiredObject(entry, 'lensField.symbolicSystem.syzygies[]');
            return sum + requiredInteger(record.digitSum, 'lensField.symbolicSystem.syzygies[].digitSum', 0, 40);
        }, 0);
        if (digitTotal !== 280) {
            throw new Error('lensField.symbolicSystem syzygy digit sums must decompose the full Pisano 280');
        }
        pleromaSeats = system.seats.map((entry, index) => {
            const path = `lensField.symbolicSystem.seats[${index}]`;
            const record = requiredObject(entry, path);
            const arc = record.arc;
            if (arc !== 'ogdoad' && arc !== 'decad' && arc !== 'dodecad') {
                throw new Error(`${path}.arc must be a pleromatic arc`);
            }
            return {
                segment: requiredInteger(record.segment, `${path}.segment`, 0, 29),
                aeon: typeof record.aeon === 'string' && record.aeon ? record.aeon : (() => {
                    throw new Error(`${path}.aeon must be a named aeon`);
                })(),
                arc,
                syzygy: requiredInteger(record.syzygy, `${path}.syzygy`, 0, 14),
                prior: record.prior === true,
                element: record.element as LensFieldElementBoundary
            };
        });
    } else if (symbolic !== null && symbolic !== undefined) {
        throw new Error('lensField.symbolicSystem is seated only at the pleromatic lens 6');
    }
    return {
        lensId,
        slice,
        sections,
        topologyKind: topologyKind as LensFieldProjectionBoundary['topologyKind'],
        segments,
        positionedOrbiters,
        channelBalances,
        akashaCondition: akashaCondition as boolean | null,
        balanceQuaternion: quaternion as [number, number, number, number],
        pleromaSeats,
        pleromaLayout
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
    'kernelBridge.m3.lensCodonBinary(lensId)',
    'kernelBridge.m3.lensField(lensId)'
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
