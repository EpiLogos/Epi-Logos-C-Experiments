import {
    CoordinateContext,
    MathemeHarmonicProfileBoundary,
    MExtensionReadinessSnapshot,
    MExtensionReadinessState,
    MObservabilityEvent
} from '@pratibimba/m-extension-runtime';
import { EXTENSION_ID, PRIVACY_CLASS } from './index';

export const M3_CODON_WHEEL_CONTRACT_VERSION = '2026-06-01.07-T6';
export const M3_EXPECTED_NON_DUAL_CODONS = 40;
export const M3_EXPECTED_DUAL_CODONS = 24;
export const M3_EXPECTED_ROTATIONAL_STATES = 472;

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
    readonly tick: number;
    readonly degree720: number;
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
    const activeFacts = activeProjectionFacts(payload, mahamaya, projection);
    const pendingFields = surfacePendingFields(input, mahamaya, projection);
    const provenance = provenanceHandles(input);
    const blockers = surfaceBlockers(input, pendingFields);
    const eventPayload = Object.freeze({
        contractVersion: M3_CODON_WHEEL_CONTRACT_VERSION,
        profileGeneration: input.profile.generation,
        privacyClass: PRIVACY_CLASS,
        coordinateContext: input.context.canonicalMCoordinate ?? "M3'",
        evidenceHandle: input.kernelTraceHandle?.handle ?? input.library?.provenanceHandle.handle ?? 'pending:m3.kernel-trace',
        provenanceHandles: provenance.map(handle => handle.handle),
        ...activeFacts,
        rewardTrainingAuthority: 'outside-renderer',
        protectedArtifactBodyLoaded: false
    });

    return Object.freeze({
        contractVersion: M3_CODON_WHEEL_CONTRACT_VERSION,
        extensionId: EXTENSION_ID,
        profileGeneration: input.profile.generation,
        privacyClass: PRIVACY_CLASS,
        activeProjection: freezeRecord(activeFacts),
        wheelSummary,
        m30ProvenanceStrip: buildM30Provenance(payload, mahamaya),
        depthViews: buildDepthViews(payload, activeFacts, input.worldClock),
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
    return freezeRecord({
        tick: numberValue(payload.tick),
        degree720: numberValue(payload.degree720),
        lens: numberValue(projection.lens ?? objectValue(payload.lensMode)?.lens),
        mode: numberValue(projection.mode ?? objectValue(payload.lensMode)?.mode),
        codonId: numberValue(projection.codonId ?? mahamaya.codonId),
        codon: stringValue(projection.codon ?? mahamaya.codon),
        codonClass: stringValue(projection.codonClass ?? mahamaya.codonClass),
        rotation: numberValue(projection.rotation ?? mahamaya.rotationalIndex),
        rotationalStateCount: numberValue(projection.rotationalStateCount ?? mahamaya.rotationalStateCount),
        rotationDegrees: numberValue(projection.rotationDegrees),
        hexagram: stringValue(mahamaya.hexagram),
        hexagramId: numberValue(mahamaya.hexagramId),
        upperTrigram: numberValue(mahamaya.upperTrigram),
        lowerTrigram: numberValue(mahamaya.lowerTrigram),
        lineChangeOperator: stringValue(mahamaya.lineChangeOperator),
        dnaRnaPhase: stringValue(mahamaya.dnaRnaPhase),
        tarotMinorId: mahamaya.tarotMinorId ?? null,
        tarotShadowCodon: mahamaya.tarotShadowCodon ?? null,
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
    worldClock: M3WorldClockPayload | undefined
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
    return freezeRecord({
        flatClock: freezeRecord({
            viewMode: 'flat-clock-debug',
            ...common
        }),
        doubleTorusWorldClock: freezeRecord({
            viewMode: 'm3-5-double-torus-world-clock',
            ...common,
            worldClockHandle: worldClock?.worldClockHandle ?? null
        }),
        janusOverlay: freezeRecord({
            viewMode: 'janus-bidirectional-read-only',
            ...common,
            orientation: stringValue(objectValue(payload.m3Trace)?.janusOrientation) ?? 'pending-backend-trace'
        })
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

function surfaceBlockers(input: M3ProjectionSurfaceInput, pendingFields: readonly string[]): string[] {
    const blockers = [];
    if (!input.library) blockers.push('Track 02 canonical M3 library graph summary missing');
    if (input.library && validateM3LibrarySummary(input.library).matchesM3Spec !== true) {
        blockers.push('Track 02 M3 library summary does not satisfy 40x7 + 24x8 = 472');
    }
    if (!input.worldClock) blockers.push('Track 03 world_clock handle missing');
    if (pendingFields.includes('profile.rotationalStateCount')) {
        blockers.push('Track 01 profile rotational state fields missing');
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

function objectValue(value: unknown): Readonly<Record<string, unknown>> | undefined {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? (value as Readonly<Record<string, unknown>>)
        : undefined;
}

function numberValue(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function stringValue(value: unknown): string | null {
    return typeof value === 'string' && value.length > 0 ? value : null;
}

function freezeRecord<T extends Readonly<Record<string, unknown>>>(value: T): T {
    return Object.freeze(value);
}
