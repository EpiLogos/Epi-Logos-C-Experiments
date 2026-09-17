import {
    CoordinateContext,
    MathemeHarmonicProfileBoundary,
    MExtensionReadinessSnapshot,
    MExtensionReadinessState,
    MObservabilityEvent
} from '@pratibimba/m-extension-runtime';
import type {
    OracleFrame,
    OracleSequenceCodon,
    ReadingPosition,
    SymbolicProtein,
    TranscriptionalClockPacket
} from '@pratibimba/kernel-bridge';
import { EXTENSION_ID, PRIVACY_CLASS } from './index';

export const M3_CODON_WHEEL_CONTRACT_VERSION = '2026-06-01.07-T6';
export const M3_EXPECTED_NON_DUAL_CODONS = 40;
export const M3_EXPECTED_DUAL_CODONS = 24;
export const M3_EXPECTED_ROTATIONAL_STATES = 472;

// TCT / Nine-of-Wands renderer-side surfacing rule: the Nine-of-Wands codon
// (codonId 0x35) is a non-dual codon, so its surfaced projection MUST carry the
// non-dual rotational-state count of 7. When the active projection names this
// codon but reports any other count, the surface is blocked rather than rendered.
export const M3_TCT_NINE_OF_WANDS_CODON_ID = 0x35;
export const M3_TCT_NINE_OF_WANDS_ROTATIONAL_STATE_COUNT = 7;

export interface M3ProvenanceHandle {
    readonly source: 'profile' | 's2' | 's3' | 'm4' | 'pending';
    readonly handle: string;
    readonly bodyAllowed: boolean;
    readonly note?: string;
}

export interface M3LibrarySummary {
    readonly provenanceHandle: M3ProvenanceHandle;
    readonly nonDualCodonCount: number;
    readonly dualCodonCount: number;
    readonly nonDualRotationalSlots: number;
    readonly dualRotationalSlots: number;
    readonly scalarRefDetails?: Readonly<Record<string, Readonly<Record<string, unknown>>>>;
}

export interface M3WorldClockPayload {
    readonly provenanceHandle: M3ProvenanceHandle;
    readonly worldClockHandle: string;
    readonly generation: number;
    readonly tick: number;
    readonly degree720: number;
    readonly source: 's3.world_clock';
    readonly subscriptionMode: 'native-websocket' | 'http-sql-poll' | 'compatibility';
}

export interface M3ProjectionSurfaceInput {
    readonly profile: MathemeHarmonicProfileBoundary;
    readonly readiness: MExtensionReadinessSnapshot;
    readonly context: CoordinateContext;
    readonly emittedAt: number;
    readonly library?: M3LibrarySummary;
    readonly worldClock?: M3WorldClockPayload;
    readonly kernelTraceHandle?: M3ProvenanceHandle;
}

export interface M3ProjectionSurface {
    readonly contractVersion: typeof M3_CODON_WHEEL_CONTRACT_VERSION;
    readonly extensionId: typeof EXTENSION_ID;
    readonly profileGeneration: number;
    readonly privacyClass: typeof PRIVACY_CLASS;
    readonly transcriptionalClockPacket: TranscriptionalClockPacket | null;
    readonly oracleFrameSummary: Readonly<Record<string, unknown>> | null;
    readonly activeProjection: Readonly<Record<string, unknown>>;
    readonly wheelSummary: Readonly<Record<string, unknown>>;
    readonly m30ProvenanceStrip: Readonly<Record<string, unknown>>;
    readonly depthViews: Readonly<Record<string, Readonly<Record<string, unknown>>>>;
    readonly provenance: readonly M3ProvenanceHandle[];
    readonly pendingFields: readonly string[];
    readonly readiness: {
        readonly state: MExtensionReadinessState;
        readonly surfaceReady: boolean;
        readonly blockers: readonly string[];
    };
    readonly observabilityEvents: readonly MObservabilityEvent[];
}

export interface M3ScalarOracleRef {
    readonly refKind: 'codon' | 'i-ching' | 'tarot';
    readonly scalarRef: string;
    readonly protectedArtifactHandle: string;
    readonly protectedArtifactBody?: unknown;
}

export function buildM3ProjectionSurface(input: M3ProjectionSurfaceInput): M3ProjectionSurface {
    const payload = input.profile.payload;
    const mahamaya = objectValue(payload.mahamaya ?? payload.binary);
    const projection = objectValue(payload.codonRotationProjection);
    if (!mahamaya || !projection) {
        throw new Error('m3 surface requires backend-provided mahamaya and codonRotationProjection profile fields');
    }

    const wheelSummary = buildWheelSummary(input.library);
    const transcriptionalClockPacket = transcriptionalClockPacketFromProfile(payload);
    const oracleFrameSummary = buildOracleFrameSummary(transcriptionalClockPacket);
    const activeFacts = activeProjectionFacts(payload, mahamaya, projection);
    const worldClockBinding = buildWorldClockBinding(activeFacts, input.worldClock);
    const pendingFields = surfacePendingFields(input, mahamaya, projection);
    const provenance = provenanceHandles(input);
    const blockers = surfaceBlockers(input, pendingFields, activeFacts);
    const eventPayload = Object.freeze({
        contractVersion: M3_CODON_WHEEL_CONTRACT_VERSION,
        profileGeneration: input.profile.generation,
        privacyClass: PRIVACY_CLASS,
        coordinateContext: input.context.canonicalMCoordinate ?? "M3'",
        evidenceHandle: input.kernelTraceHandle?.handle ?? input.library?.provenanceHandle.handle ?? 'pending:m3.kernel-trace',
        provenanceHandles: provenance.map(handle => handle.handle),
        worldClock: worldClockBinding,
        vak: transcriptionalClockPacket?.vak ?? null,
        oracleFrame: oracleFrameSummary,
        cpPositionRef: transcriptionalClockPacket?.cpPositionRef ?? null,
        symbolicProtein: symbolicProteinSummary(transcriptionalClockPacket?.symbolicProtein),
        ...activeFacts,
        rewardTrainingAuthority: 'outside-renderer',
        protectedArtifactBodyLoaded: false
    });

    return Object.freeze({
        contractVersion: M3_CODON_WHEEL_CONTRACT_VERSION,
        extensionId: EXTENSION_ID,
        profileGeneration: input.profile.generation,
        privacyClass: PRIVACY_CLASS,
        transcriptionalClockPacket,
        oracleFrameSummary,
        activeProjection: freezeRecord(activeFacts),
        wheelSummary,
        m30ProvenanceStrip: buildM30Provenance(payload, mahamaya),
        depthViews: buildDepthViews(payload, activeFacts, worldClockBinding),
        provenance: Object.freeze(provenance),
        pendingFields: Object.freeze(pendingFields),
        readiness: Object.freeze({
            state: blockers.length === 0 ? input.readiness.state : 'authority_payload_missing',
            surfaceReady: blockers.length === 0,
            blockers: Object.freeze(blockers)
        }),
        observabilityEvents: Object.freeze([
            Object.freeze({
                type: 'm3.codon_projection',
                extensionId: EXTENSION_ID,
                emittedAt: input.emittedAt,
                payload: eventPayload
            }),
            Object.freeze({
                type: 'm3.kernel_trace_view',
                extensionId: EXTENSION_ID,
                emittedAt: input.emittedAt,
                payload: Object.freeze({
                    ...eventPayload,
                    traceMode: 'read-only',
                    promotionAuthority: 'S5/M5-4'
                })
            })
        ])
    });
}

export function buildOracleFrameSummary(
    packet: TranscriptionalClockPacket | null
): Readonly<Record<string, unknown>> | null {
    if (!packet) {
        return null;
    }
    const frame = packet.oracleFrame;
    const declaredPairs = declaredComplementaryPairs(frame);
    return freezeRecord({
        source: 'profile.transcriptionalClockPacket.oracleFrame',
        packetId: packet.packetId,
        frameId: frame.frameId,
        spreadScale: frame.spreadScale,
        traversalDirection: frame.traversalDirection ?? null,
        positionCount: frame.positions.length,
        activeCpPositionRef: packet.cpPositionRef,
        positions: Object.freeze(
            frame.positions.map(position =>
                freezeRecord({
                    key: position.key,
                    ordinal: position.ordinal,
                    cpPositionRef: position.cpPositionRef,
                    label: position.label ?? null
                })
            )
        ),
        complementaryPairs: Object.freeze(
            declaredPairs.map(([left, right]) => Object.freeze([left, right] as const))
        )
    });
}

export function validateM3LibrarySummary(summary: M3LibrarySummary): Readonly<Record<string, unknown>> {
    const nonDualStates = summary.nonDualCodonCount * summary.nonDualRotationalSlots;
    const dualStates = summary.dualCodonCount * summary.dualRotationalSlots;
    const totalRotationalStates = nonDualStates + dualStates;
    return freezeRecord({
        nonDualCodonCount: summary.nonDualCodonCount,
        dualCodonCount: summary.dualCodonCount,
        nonDualRotationalSlots: summary.nonDualRotationalSlots,
        dualRotationalSlots: summary.dualRotationalSlots,
        nonDualStates,
        dualStates,
        totalRotationalStates,
        matchesM3Spec:
            summary.nonDualCodonCount === M3_EXPECTED_NON_DUAL_CODONS &&
            summary.dualCodonCount === M3_EXPECTED_DUAL_CODONS &&
            totalRotationalStates === M3_EXPECTED_ROTATIONAL_STATES
    });
}

export function resolveM3ScalarOracleRef(input: {
    readonly ref: M3ScalarOracleRef;
    readonly library: M3LibrarySummary;
}): Readonly<Record<string, unknown>> {
    if (input.ref.protectedArtifactBody !== undefined) {
        throw new Error('M3 scalar oracle resolver must not receive protected-local artifact bodies');
    }
    const detail = input.library.scalarRefDetails?.[input.ref.scalarRef];
    return freezeRecord({
        refKind: input.ref.refKind,
        scalarRef: input.ref.scalarRef,
        protectedArtifactHandle: input.ref.protectedArtifactHandle,
        protectedArtifactBodyLoaded: false,
        detail: detail ? freezeRecord({ ...detail }) : null,
        detailState: detail ? 'resolved-from-s2-library' : 'pending-s2-library-detail'
    });
}

function buildWheelSummary(summary: M3LibrarySummary | undefined): Readonly<Record<string, unknown>> {
    if (!summary) {
        return freezeRecord({
            source: 'pending-S2-M3-library-summary',
            matchesM3Spec: false
        });
    }
    return freezeRecord({
        source: 's2.m3LibrarySummary',
        provenanceHandle: summary.provenanceHandle.handle,
        ...validateM3LibrarySummary(summary)
    });
}

function activeProjectionFacts(
    payload: Readonly<Record<string, unknown>>,
    mahamaya: Readonly<Record<string, unknown>>,
    projection: Readonly<Record<string, unknown>>
): Readonly<Record<string, unknown>> {
    const elementalQuintessence = objectValue(
        projection.elementalQuintessence ??
        projection.elemental_quintessence ??
        mahamaya.elementalQuintessence ??
        mahamaya.elemental_quintessence ??
        payload.elementalQuintessence ??
        payload.elemental_quintessence
    );
    return freezeRecord({
        tick: numberValue(payload.tick),
        degree720: numberValue(payload.degree720),
        lens: numberValue(projection.lens ?? objectValue(payload.lensMode)?.lens),
        mode: numberValue(projection.mode ?? objectValue(payload.lensMode)?.mode),
        surfaceIndex: numberValue(projection.surfaceIndex ?? projection.surface_index),
        codonId: numberValue(projection.codonId ?? mahamaya.codonId),
        codon: stringValue(projection.codon ?? mahamaya.codon),
        codonClass: stringValue(projection.codonClass ?? mahamaya.codonClass),
        rotation: numberValue(projection.rotation ?? mahamaya.rotationalIndex),
        rotationalStateCount: numberValue(projection.rotationalStateCount ?? mahamaya.rotationalStateCount),
        rotationDegrees: numberValue(projection.rotationDegrees),
        chargeQuaternion: quaternionValue(payload.qCosmic ?? payload.q_cosmic),
        hexagram: stringValue(mahamaya.hexagram),
        hexagramId: numberValue(mahamaya.hexagramId),
        upperTrigram: numberValue(mahamaya.upperTrigram),
        lowerTrigram: numberValue(mahamaya.lowerTrigram),
        lineChangeOperator: stringValue(mahamaya.lineChangeOperator),
        lineIndex: numberValue(mahamaya.lineIndex),
        lineChangeOperatorAddress: numberValue(mahamaya.lineChangeOperatorAddress),
        dnaRnaPhase: stringValue(mahamaya.dnaRnaPhase),
        tarotMinorId: mahamaya.tarotMinorId ?? null,
        tarotShadowCodon: mahamaya.tarotShadowCodon ?? null,
        elementalQuintessence: elementalQuintessence ? freezeRecord({ ...elementalQuintessence }) : null,
        datasetLutState: stringValue(mahamaya.datasetLutState ?? projection.datasetLutState),
        transcriptionState: stringValue(mahamaya.transcriptionState)
    });
}

function buildM30Provenance(
    payload: Readonly<Record<string, unknown>>,
    mahamaya: Readonly<Record<string, unknown>>
): Readonly<Record<string, unknown>> {
    const resonance72 = objectValue(payload.resonance72);
    const m2Index = numberValue(mahamaya.m2VibrationIndex ?? resonance72?.lensAnchorIndex);
    return freezeRecord({
        source: 'profile.mahamaya + profile.resonance72',
        m2SourceIndex72: m2Index,
        detResult64: m2Index === null ? null : Math.floor(m2Index * 8 / 9),
        mahamayaAddress64: numberValue(mahamaya.mahamayaAddress64),
        m2ToM3Symbol: numberValue(mahamaya.m2ToM3Symbol),
        gapState: mahamaya.evolutionaryGap === true ? 'gap' : 'no-gap',
        datasetLutState: stringValue(mahamaya.datasetLutState),
        privatePlanetaryChakralInterpretation: 'not-rendered'
    });
}

function buildDepthViews(
    payload: Readonly<Record<string, unknown>>,
    activeFacts: Readonly<Record<string, unknown>>,
    worldClock: Readonly<Record<string, unknown>>
): Readonly<Record<string, Readonly<Record<string, unknown>>>> {
    const common = {
        tick: activeFacts.tick,
        degree720: activeFacts.degree720,
        codonId: activeFacts.codonId,
        codon: activeFacts.codon,
        rotation: activeFacts.rotation,
        lens: activeFacts.lens,
        mode: activeFacts.mode
    };
    const su2Layer = stringValue(payload.su2Layer ?? payload.su2_layer);
    const lensAnnulus = lensAnnulusDepthView(payload);
    const toroidalWorld = toroidalWorldDepthView(payload, common, worldClock, lensAnnulus);
    const hopfIdentity = hopfIdentityDepthView(payload, common, su2Layer);
    return freezeRecord({
        // Canonical M3-5' four depth-view modes (M3-ARCHITECTURE §5.7).
        flatClockDebug: freezeRecord({
            viewMode: 'flat-clock-debug',
            ...common,
            lineChangeOperator: activeFacts.lineChangeOperator,
            hexagram: activeFacts.hexagram,
            hexagramId: activeFacts.hexagramId,
            rotationalStateCount: activeFacts.rotationalStateCount,
            su2Layer: su2Layer ?? 'pending-backend-su2-layer'
        }),
        lensAnnulus,
        toroidalWorld,
        hopfIdentity,
        // Legacy depth-view aliases retained for existing Track-08 consumers.
        flatClock: freezeRecord({
            viewMode: 'flat-clock-debug',
            ...common
        }),
        doubleTorusWorldClock: freezeRecord({
            viewMode: 'm3-5-double-torus-world-clock',
            ...common,
            worldClockHandle: worldClock.worldClockHandle,
            worldClockGeneration: worldClock.generation,
            worldClockSource: worldClock.source,
            subscriptionMode: worldClock.subscriptionMode,
            tickMatchesProfile: worldClock.tickMatchesProfile,
            degree720MatchesProfile: worldClock.degree720MatchesProfile
        }),
        janusOverlay: freezeRecord({
            viewMode: 'janus-bidirectional-read-only',
            ...common,
            orientation: stringValue(objectValue(payload.m3Trace)?.janusOrientation) ?? 'pending-backend-trace'
        })
    });
}

// M3-2' Lens Annulus depth view (M3-ARCHITECTURE §5.4). The 16+1 M3 lens-stack
// is namespace-pending until DR-M3-3 closes the M2-1' Vimarśa vs M3_LENS_STACK
// split, so this view never relabels the 12-count M1' chromatic lens as an
// M3-aperture stack — it reads profile.m3LensStack and renders pending otherwise.
function lensAnnulusDepthView(
    payload: Readonly<Record<string, unknown>>
): Readonly<Record<string, unknown>> {
    const stack = objectValue(payload.m3LensStack ?? payload.m3_lens_stack);
    if (!stack) {
        return freezeRecord({
            viewMode: 'lens-annulus',
            namespaceResolved: false,
            provenanceOverlay: 'pending-m3-lens-stack-namespace',
            segmentCount: null,
            activeSegmentIndex: null,
            note: 'DR-M3-3 namespace pending: M3_LENS_STACK field not yet on the profile bus'
        });
    }
    return freezeRecord({
        viewMode: 'lens-annulus',
        namespaceResolved: stack.namespaceResolved === true || stack.namespace_resolved === true,
        provenanceOverlay:
            stack.namespaceResolved === true || stack.namespace_resolved === true
                ? 'profile.m3LensStack'
                : 'pending-m3-lens-stack-namespace',
        segmentCount: numberValue(stack.segmentCount ?? stack.segment_count),
        activeSegmentIndex: numberValue(stack.activeSegmentIndex ?? stack.active_segment_index)
    });
}

// M3-5' Toroidal / World Clock depth view (M3-ARCHITECTURE §5.7.3). The K² mesh
// is M1-5's authority and is referenced by handle only — never forked here.
// T²_Mahāmāyā parameters (inscription-circle, lens-circle) come from the profile.
function toroidalWorldDepthView(
    payload: Readonly<Record<string, unknown>>,
    common: Readonly<Record<string, unknown>>,
    worldClock: Readonly<Record<string, unknown>>,
    lensAnnulus: Readonly<Record<string, unknown>>
): Readonly<Record<string, unknown>> {
    const torus = objectValue(payload.toroidalWorld ?? payload.toroidal_world);
    return freezeRecord({
        viewMode: 'toroidal-world-clock',
        ...common,
        worldClockHandle: worldClock.worldClockHandle,
        worldClockSource: worldClock.source,
        subscriptionMode: worldClock.subscriptionMode,
        // K² is borrowed from M1-5 via a shared geometry handle — not a local mesh.
        k2GeometryHandle:
            stringValue(torus?.k2GeometryHandle ?? torus?.k2_geometry_handle) ??
            'pending-m1-5-k2-geometry-handle',
        // T²_Mahāmāyā inscription/lens-circle parameters are backend-provided.
        inscriptionCircleParam: numberValue(torus?.inscriptionCircleParam ?? torus?.inscription_circle_param),
        lensCircleParam: numberValue(torus?.lensCircleParam ?? torus?.lens_circle_param),
        lensAnnulusActiveSegmentIndex: lensAnnulus.activeSegmentIndex,
        coFoliationState: stringValue(torus?.coFoliationState ?? torus?.co_foliation_state) ?? 'pending-backend-co-foliation'
    });
}

// M3-5' Hopf Identity depth view (M3-ARCHITECTURE §5.7.4). The SU(2)
// hopf-fiber trajectory and the 720°→0 identity-return moment are read from the
// profile; T²_Mahāmāyā collapses to a phase-shadow ring around the trajectory.
function hopfIdentityDepthView(
    payload: Readonly<Record<string, unknown>>,
    common: Readonly<Record<string, unknown>>,
    su2Layer: string | null
): Readonly<Record<string, unknown>> {
    const hopf = objectValue(payload.hopfIdentity ?? payload.hopf_identity);
    const degree720 = numberValue(common.degree720);
    return freezeRecord({
        viewMode: 'hopf-identity',
        ...common,
        su2Layer: su2Layer ?? 'pending-backend-su2-layer',
        hopfFiberHandle:
            stringValue(hopf?.hopfFiberHandle ?? hopf?.hopf_fiber_handle) ??
            'pending-m1-2-hopf-fiber-handle',
        phaseShadowRingState:
            stringValue(hopf?.phaseShadowRingState ?? hopf?.phase_shadow_ring_state) ??
            'pending-backend-phase-shadow',
        // 720° return is the identity-recognition pulse — backend asserts the close.
        identityReturned: hopf?.identityReturned === true || hopf?.identity_returned === true,
        atIdentityReturnDegree: degree720 === 0
    });
}

function buildWorldClockBinding(
    activeFacts: Readonly<Record<string, unknown>>,
    worldClock: M3WorldClockPayload | undefined
): Readonly<Record<string, unknown>> {
    if (!worldClock) {
        return freezeRecord({
            state: 'missing_s3_world_clock',
            worldClockHandle: null,
            generation: null,
            source: null,
            subscriptionMode: null,
            tickMatchesProfile: false,
            degree720MatchesProfile: false
        });
    }
    return freezeRecord({
        state: 's3_world_clock_bound',
        worldClockHandle: worldClock.worldClockHandle,
        generation: worldClock.generation,
        source: worldClock.source,
        subscriptionMode: worldClock.subscriptionMode,
        tick: worldClock.tick,
        degree720: worldClock.degree720,
        tickMatchesProfile: worldClock.tick === activeFacts.tick,
        degree720MatchesProfile: worldClock.degree720 === activeFacts.degree720
    });
}

function surfacePendingFields(
    input: M3ProjectionSurfaceInput,
    mahamaya: Readonly<Record<string, unknown>>,
    projection: Readonly<Record<string, unknown>>
): string[] {
    const pending = [];
    if (!input.library) pending.push('s2.m3LibrarySummary');
    if (!input.worldClock) pending.push('s3.worldClock');
    if (numberValue(projection.rotationalStateCount ?? mahamaya.rotationalStateCount) === null) {
        pending.push('profile.rotationalStateCount');
    }
    if (stringValue(mahamaya.datasetLutState) === 'pending-dataset-lut') {
        pending.push('m3.datasetLutMaterialization');
    }
    if (!input.kernelTraceHandle) pending.push('profile.kernelTraceHandle');
    return pending;
}

function surfaceBlockers(
    input: M3ProjectionSurfaceInput,
    pendingFields: readonly string[],
    activeFacts: Readonly<Record<string, unknown>>
): string[] {
    const blockers = [];
    if (!input.library) blockers.push('Track 02 canonical M3 library graph summary missing');
    if (input.library && validateM3LibrarySummary(input.library).matchesM3Spec !== true) {
        blockers.push('Track 02 M3 library summary does not satisfy 40x7 + 24x8 = 472');
    }
    if (!input.worldClock) blockers.push('Track 03 world_clock handle missing');
    if (input.worldClock && input.worldClock.tick !== numberValue(input.profile.payload.tick)) {
        blockers.push('Track 03 world_clock tick does not match current kernel profile tick');
    }
    if (
        input.worldClock &&
        input.worldClock.degree720 !== numberValue(input.profile.payload.degree720)
    ) {
        blockers.push('Track 03 world_clock degree720 does not match current kernel profile degree720');
    }
    if (pendingFields.includes('profile.rotationalStateCount')) {
        blockers.push('Track 01 profile rotational state fields missing');
    }
    // TCT / Nine-of-Wands rule: when the surfaced projection is the Nine-of-Wands
    // codon (0x35), its rotationalStateCount must be the non-dual count of 7.
    if (
        numberValue(activeFacts.codonId) === M3_TCT_NINE_OF_WANDS_CODON_ID &&
        numberValue(activeFacts.rotationalStateCount) !== M3_TCT_NINE_OF_WANDS_ROTATIONAL_STATE_COUNT
    ) {
        blockers.push('tct-rotational-state-count-mismatch');
    }
    return blockers;
}

function provenanceHandles(input: M3ProjectionSurfaceInput): M3ProvenanceHandle[] {
    const handles: M3ProvenanceHandle[] = [
        Object.freeze({
            source: 'profile',
            handle: `profile:generation:${input.profile.generation}`,
            bodyAllowed: true,
            note: 'MathemeHarmonicProfile public-current mahamaya/codonRotationProjection payload'
        })
    ];
    if (input.library?.provenanceHandle) handles.push(input.library.provenanceHandle);
    if (input.worldClock?.provenanceHandle) handles.push(input.worldClock.provenanceHandle);
    if (input.kernelTraceHandle) handles.push(input.kernelTraceHandle);
    return handles;
}

function transcriptionalClockPacketFromProfile(
    payload: Readonly<Record<string, unknown>>
): TranscriptionalClockPacket | null {
    const raw = objectValue(payload.transcriptionalClockPacket ?? payload.transcriptional_clock_packet);
    if (!raw) {
        return null;
    }
    const oracleFrame = oracleFrameFromValue(raw.oracleFrame ?? raw.oracle_frame);
    const cpPositionRef = stringValue(raw.cpPositionRef ?? raw.cp_position_ref);
    const packetId = stringValue(raw.packetId ?? raw.packet_id);
    const vak = objectValue(raw.vak);
    if (!oracleFrame || !cpPositionRef || !packetId || !vak) {
        return null;
    }
    return {
        packetId,
        profileGeneration: numberValue(raw.profileGeneration ?? raw.profile_generation),
        vak: vakAddressFromValue(vak),
        oracleFrame,
        cpPositionRef,
        oracleSequence: oracleSequenceFromValue(raw.oracleSequence ?? raw.oracle_sequence),
        symbolicProtein: symbolicProteinFromValue(raw.symbolicProtein ?? raw.symbolic_protein),
        provenanceHandles: stringArray(raw.provenanceHandles ?? raw.provenance_handles)
    };
}

function oracleFrameFromValue(value: unknown): OracleFrame | null {
    const raw = objectValue(value);
    if (!raw) {
        return null;
    }
    const frameId = stringValue(raw.frameId ?? raw.frame_id);
    const spreadScale = stringValue(raw.spreadScale ?? raw.spread_scale);
    const positions = readingPositionsFromValue(raw.positions);
    if (!frameId || !spreadScale || positions.length === 0) {
        return null;
    }
    return {
        frameId,
        spreadScale: spreadScale as OracleFrame['spreadScale'],
        positions,
        traversalDirection: stringValue(raw.traversalDirection ?? raw.traversal_direction) as
            | OracleFrame['traversalDirection']
            | undefined,
        complementaryPairs: declaredComplementaryPairs({
            positions,
            complementaryPairs: pairArray(raw.complementaryPairs ?? raw.complementary_pairs)
        })
    };
}

function readingPositionsFromValue(value: unknown): ReadingPosition[] {
    if (!Array.isArray(value)) {
        return [];
    }
    const positions: ReadingPosition[] = [];
    for (const item of value) {
        const raw = objectValue(item);
        const key = stringValue(raw?.key);
        const ordinal = numberValue(raw?.ordinal);
        const cpPositionRef = stringValue(raw?.cpPositionRef ?? raw?.cp_position_ref);
        if (!raw || !key || ordinal === null || !cpPositionRef) {
            continue;
        }
        const vak = objectValue(raw.vak);
        positions.push({
            key,
            ordinal,
            cpPositionRef,
            label: stringValue(raw.label) ?? undefined,
            vak: vak ? vakAddressFromValue(vak) : undefined
        });
    }
    return positions;
}

function oracleSequenceFromValue(value: unknown): TranscriptionalClockPacket['oracleSequence'] {
    const raw = objectValue(value);
    if (!raw) {
        return undefined;
    }
    const sequenceId = stringValue(raw.sequenceId ?? raw.sequence_id);
    const frameId = stringValue(raw.frameId ?? raw.frame_id);
    const codons: OracleSequenceCodon[] = [];
    if (Array.isArray(raw.codons)) {
        for (const item of raw.codons) {
            const codon = objectValue(item);
            const ordinal = numberValue(codon?.ordinal);
            const symbol = stringValue(codon?.symbol);
            const cpPositionRef = stringValue(codon?.cpPositionRef ?? codon?.cp_position_ref);
            if (!codon || ordinal === null || !symbol || !cpPositionRef) {
                continue;
            }
            const vak = objectValue(codon.vak);
            codons.push({
                ordinal,
                symbol,
                cpPositionRef,
                vak: vak ? vakAddressFromValue(vak) : undefined
            });
        }
    }
    if (!sequenceId || !frameId || codons.length === 0) {
        return undefined;
    }
    return { sequenceId, frameId, codons };
}

function symbolicProteinFromValue(value: unknown): SymbolicProtein | undefined {
    const raw = objectValue(value);
    if (!raw) {
        return undefined;
    }
    const proteinId = stringValue(raw.proteinId ?? raw.protein_id);
    const sequence = oracleSequenceFromValue(raw.sequence);
    const readingFrame = oracleFrameFromValue(raw.readingFrame ?? raw.reading_frame);
    if (!proteinId || !sequence || !readingFrame) {
        return undefined;
    }
    return {
        proteinId,
        sequence,
        readingFrame,
        startPositionRef: stringValue(raw.startPositionRef ?? raw.start_position_ref) ?? undefined,
        stopPositionRef: stringValue(raw.stopPositionRef ?? raw.stop_position_ref) ?? undefined
    };
}

function symbolicProteinSummary(
    protein: SymbolicProtein | undefined
): Readonly<Record<string, unknown>> | null {
    if (!protein) {
        return null;
    }
    return freezeRecord({
        proteinId: protein.proteinId,
        sequenceId: protein.sequence.sequenceId,
        codonCount: protein.sequence.codons.length,
        frameId: protein.readingFrame.frameId,
        positionCount: protein.readingFrame.positions.length,
        startPositionRef: protein.startPositionRef ?? null,
        stopPositionRef: protein.stopPositionRef ?? null
    });
}

function declaredComplementaryPairs(
    frame: Pick<OracleFrame, 'positions' | 'complementaryPairs'>
): readonly (readonly [string, string])[] {
    const keys = new Set(frame.positions.map(position => position.key));
    return (frame.complementaryPairs ?? []).filter(([left, right]) => keys.has(left) && keys.has(right));
}

function pairArray(value: unknown): readonly (readonly [string, string])[] {
    if (!Array.isArray(value)) {
        return [];
    }
    return value
        .map(item => {
            if (!Array.isArray(item) || item.length !== 2) {
                return null;
            }
            const left = stringValue(item[0]);
            const right = stringValue(item[1]);
            return left && right ? ([left, right] as const) : null;
        })
        .filter((pair): pair is readonly [string, string] => pair !== null);
}

function stringArray(value: unknown): readonly string[] {
    return Array.isArray(value)
        ? value.filter((item): item is string => typeof item === 'string' && item.length > 0)
        : [];
}

function vakAddressFromValue(value: Readonly<Record<string, unknown>>): TranscriptionalClockPacket['vak'] {
    return {
        cpf: stringValue(value.cpf ?? value.CPF) ?? '',
        ct: stringValue(value.ct ?? value.CT) ?? '',
        cp: stringValue(value.cp ?? value.CP) ?? '',
        cf: stringValue(value.cf ?? value.CF) ?? '',
        cfp: stringValue(value.cfp ?? value.CFP) ?? '',
        cs: stringValue(value.cs ?? value.CS) ?? ''
    };
}

function objectValue(value: unknown): Readonly<Record<string, unknown>> | undefined {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? (value as Readonly<Record<string, unknown>>)
        : undefined;
}

function numberValue(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function quaternionValue(value: unknown): readonly [number, number, number, number] | null {
    if (!Array.isArray(value) || value.length !== 4) {
        return null;
    }
    const tuple = value.map(entry => numberValue(entry));
    if (tuple.some(entry => entry === null)) {
        return null;
    }
    return Object.freeze(tuple) as readonly [number, number, number, number];
}

function stringValue(value: unknown): string | null {
    return typeof value === 'string' && value.length > 0 ? value : null;
}

function freezeRecord<T extends Readonly<Record<string, unknown>>>(value: T): T {
    return Object.freeze(value);
}
