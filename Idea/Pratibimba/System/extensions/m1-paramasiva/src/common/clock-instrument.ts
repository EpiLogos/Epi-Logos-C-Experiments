import {
    CoordinateContext,
    MathemeHarmonicProfileBoundary,
    MExtensionReadinessSnapshot,
    MExtensionReadinessState
} from '@pratibimba/m-extension-runtime';
import { EXTENSION_ID, PRIVACY_CLASS } from './index';

export interface M1LensModeCell {
    readonly lens: number;
    readonly mode: number;
    readonly cellIndex: number;
    readonly label: string;
    readonly active: boolean;
}

export interface M1ProfileClockModel {
    readonly generation: number;
    readonly tick12: number | null;
    readonly degree720: number | null;
    readonly su2Layer: string | null;
    readonly phase: string | null;
    readonly helix: string | null;
    readonly position6: number | null;
    readonly ratioRole: string | null;
    readonly lensMode: M1LensModeCell | null;
    readonly landscape: {
        readonly lensCount: number | null;
        readonly modeCount: number | null;
        readonly totalCells: number | null;
        readonly cells: readonly M1LensModeCell[];
    };
    readonly cfVakProjection: {
        readonly contextFrame: string | null;
        readonly contextAgent: string | null;
        readonly vakRegister: string | null;
    };
    readonly audioBus: {
        readonly audioOctetHz: readonly number[] | null;
        readonly nodalQuartet: readonly Readonly<Record<string, unknown>>[] | null;
        readonly exactProfileSource: boolean;
        readonly authority: 'S0/S2 profile bus';
    };
    readonly topology: {
        readonly doubleCoverDeg: number | null;
        readonly torusGenus: number | null;
        readonly hopfIdentity: string | null;
        readonly k2TritoneCrossing: string | null;
        readonly m1OriginKleinFlip: string | null;
        readonly parentAttribution: string;
        readonly priorGround: string;
        readonly downstreamDoubleTorus: string;
        readonly source: string;
    };
    readonly readiness: {
        readonly state: MExtensionReadinessState;
        readonly relationWalkReady: boolean;
        readonly blockers: readonly string[];
    };
}

export interface M1HarmonicRelationDescriptor {
    readonly edgeId: string;
    readonly fromCoordinate: string;
    readonly toCoordinate: string;
    readonly reasonCode: string;
    readonly relationLaw: string;
    readonly sourceHz: number;
    readonly privacyPolicy: string;
    readonly depositionPolicy: string;
    readonly kleinFlip: boolean;
}

export interface M1RelationWalkStep {
    readonly previousProfileGeneration: number;
    readonly currentProfileGeneration: number;
    readonly selectedEdge: M1HarmonicRelationDescriptor;
    readonly relationLaw: string;
    readonly reasonCode: string;
    readonly sourceHz: number;
    readonly privacyPolicy: string;
    readonly depositionPolicy: string;
    readonly audioOctetHz: readonly number[];
    readonly nodalQuartet: readonly Readonly<Record<string, unknown>>[];
    readonly observabilityEvents: readonly M1ObservabilityEvent[];
}

export interface M1ObservabilityEvent {
    readonly type: 'm1.walk.step' | 'm1.klein_flip.source';
    readonly extensionId: typeof EXTENSION_ID;
    readonly emittedAt: number;
    readonly payload: Readonly<Record<string, unknown>>;
}

export function buildM1ProfileClockModel(input: {
    readonly profile: MathemeHarmonicProfileBoundary;
    readonly readiness: MExtensionReadinessSnapshot;
    readonly context: CoordinateContext;
    readonly relationDescriptors?: readonly M1HarmonicRelationDescriptor[];
}): M1ProfileClockModel {
    const payload = input.profile.payload;
    const lensRingSize = numberValue(objectValue(payload.pointerAnchor)?.lensRingSize);
    const frameCount = numberValue(objectValue(payload.contextFrames)?.frameCount);
    const lensMode = profileLensMode(payload, frameCount);
    const cells =
        lensMode && lensRingSize && frameCount
            ? buildLandscapeCells(lensRingSize, frameCount, lensMode)
            : [];
    const audioOctet = audioOctetFromPayload(payload);
    const nodalQuartet = nodalQuartetFromPayload(payload);
    const blockers = relationWalkBlockers(input, audioOctet, nodalQuartet);

    return Object.freeze({
        generation: input.profile.generation,
        tick12: numberValue(payload.tick12),
        degree720: numberValue(payload.degree720),
        su2Layer: stringValue(payload.su2Layer),
        phase: stringValue(payload.phase),
        helix: stringValue(payload.helix),
        position6: numberValue(payload.position6),
        ratioRole: stringValue(payload.ratioRole),
        lensMode,
        landscape: Object.freeze({
            lensCount: lensRingSize,
            modeCount: frameCount,
            totalCells: lensRingSize && frameCount ? lensRingSize * frameCount : null,
            cells: Object.freeze(cells)
        }),
        cfVakProjection: Object.freeze({
            contextFrame:
                stringValue(objectValue(payload.contextFrames)?.activeFrame) ??
                stringValue(objectValue(payload.diatonic)?.contextFrame) ??
                input.context.canonicalMCoordinate,
            contextAgent:
                stringValue(objectValue(payload.contextFrames)?.activeAgent) ??
                stringValue(objectValue(payload.diatonic)?.contextAgent),
            vakRegister: stringValue(objectValue(payload.diatonic)?.vakRegister)
        }),
        audioBus: Object.freeze({
            audioOctetHz: audioOctet,
            nodalQuartet,
            exactProfileSource: audioOctet !== null && nodalQuartet !== null,
            authority: 'S0/S2 profile bus' as const
        }),
        topology: topologyFromPayload(payload),
        readiness: Object.freeze({
            state: blockers.length === 0 ? input.readiness.state : 's2_graph_blocked',
            relationWalkReady: blockers.length === 0,
            blockers: Object.freeze(blockers)
        })
    });
}

export function buildM1RelationWalkStep(input: {
    readonly previousProfile: MathemeHarmonicProfileBoundary;
    readonly currentProfile: MathemeHarmonicProfileBoundary;
    readonly descriptor: M1HarmonicRelationDescriptor;
    readonly emittedAt: number;
}): M1RelationWalkStep {
    const audioOctet = audioOctetFromPayload(input.currentProfile.payload);
    const nodalQuartet = nodalQuartetFromPayload(input.currentProfile.payload);
    if (!audioOctet || !nodalQuartet) {
        throw new Error('m1 relation walk requires profile audioOctet and nodalQuartet from the bridge');
    }
    if (!Number.isFinite(input.descriptor.sourceHz) || input.descriptor.sourceHz <= 0) {
        throw new Error('m1 relation descriptor sourceHz must be a finite positive frequency');
    }

    const basePayload = Object.freeze({
        edgeId: input.descriptor.edgeId,
        fromCoordinate: input.descriptor.fromCoordinate,
        toCoordinate: input.descriptor.toCoordinate,
        reasonCode: input.descriptor.reasonCode,
        relationLaw: input.descriptor.relationLaw,
        sourceHz: input.descriptor.sourceHz,
        privacyClass: PRIVACY_CLASS,
        privacyPolicy: input.descriptor.privacyPolicy,
        depositionPolicy: input.descriptor.depositionPolicy,
        previousProfileGeneration: input.previousProfile.generation,
        currentProfileGeneration: input.currentProfile.generation,
        audioOctetHz: audioOctet,
        nodalQuartet
    });
    const events: M1ObservabilityEvent[] = [
        Object.freeze({
            type: 'm1.walk.step',
            extensionId: EXTENSION_ID,
            emittedAt: input.emittedAt,
            payload: basePayload
        })
    ];
    if (input.descriptor.kleinFlip) {
        events.push(
            Object.freeze({
                type: 'm1.klein_flip.source',
                extensionId: EXTENSION_ID,
                emittedAt: input.emittedAt,
                payload: Object.freeze({
                    ...basePayload,
                    m1Origin: true
                })
            })
        );
    }

    return Object.freeze({
        previousProfileGeneration: input.previousProfile.generation,
        currentProfileGeneration: input.currentProfile.generation,
        selectedEdge: input.descriptor,
        relationLaw: input.descriptor.relationLaw,
        reasonCode: input.descriptor.reasonCode,
        sourceHz: input.descriptor.sourceHz,
        privacyPolicy: input.descriptor.privacyPolicy,
        depositionPolicy: input.descriptor.depositionPolicy,
        audioOctetHz: audioOctet,
        nodalQuartet,
        observabilityEvents: Object.freeze(events)
    });
}

function buildLandscapeCells(
    lensCount: number,
    modeCount: number,
    active: M1LensModeCell
): M1LensModeCell[] {
    const cells: M1LensModeCell[] = [];
    for (let lens = 0; lens < lensCount; lens += 1) {
        for (let mode = 0; mode < modeCount; mode += 1) {
            cells.push(
                lensModeCell(lens, mode, active.lens === lens && active.mode === mode, undefined, modeCount)
            );
        }
    }
    return cells;
}

function profileLensMode(
    payload: Readonly<Record<string, unknown>>,
    modeCount: number | null
): M1LensModeCell | null {
    const lensMode = objectValue(payload.lensMode);
    const lens = numberValue(lensMode?.lens);
    const mode = numberValue(lensMode?.mode);
    if (lens === null || mode === null) return null;
    return lensModeCell(lens, mode, true, payload, modeCount ?? 0);
}

function lensModeCell(
    lens: number,
    mode: number,
    active: boolean,
    payload: Readonly<Record<string, unknown>> | undefined,
    modeCount: number
): M1LensModeCell {
    const projection = objectValue(payload?.codonRotationProjection);
    const label =
        stringValue(projection?.lensLabel) && stringValue(projection?.modeName)
            ? `${stringValue(projection?.lensLabel)} / ${stringValue(projection?.modeName)}`
            : `lens ${lens} / mode ${mode}`;
    return Object.freeze({
        lens,
        mode,
        cellIndex: lens * modeCount + mode,
        label,
        active
    });
}

function topologyFromPayload(payload: Readonly<Record<string, unknown>>): M1ProfileClockModel['topology'] {
    const topology = objectValue(payload.m1Topology ?? payload.topology);
    return Object.freeze({
        doubleCoverDeg: numberValue(topology?.doubleCoverDeg ?? topology?.DOUBLE_COVER_DEG),
        torusGenus: numberValue(topology?.torusGenus ?? topology?.TORUS_GENUS),
        hopfIdentity: stringValue(topology?.hopfIdentity ?? topology?.hopfBundle),
        k2TritoneCrossing: stringValue(topology?.k2TritoneCrossing ?? topology?.tritoneCrossing),
        m1OriginKleinFlip: stringValue(topology?.m1OriginKleinFlip ?? topology?.kleinFlipSource),
        parentAttribution: 'M1-5 is the +1 parent / single-torus recognition site.',
        priorGround: 'M0 is the prior 0/1 ground that M1 receives; M0 is not the +1.',
        downstreamDoubleTorus: 'Double-torus rendering is delegated downstream to M3-5.',
        source: topology
            ? 'kernel/profile topology payload'
            : 'blocked until kernel/profile exposes M1 topology constants'
    });
}

function relationWalkBlockers(
    input: {
        readonly relationDescriptors?: readonly M1HarmonicRelationDescriptor[];
    },
    audioOctet: readonly number[] | null,
    nodalQuartet: readonly Readonly<Record<string, unknown>>[] | null
): string[] {
    const blockers = [];
    if (!audioOctet) blockers.push('Track 01 profile audioOctet missing');
    if (!nodalQuartet) blockers.push('Track 01 profile nodalQuartet missing');
    if (!input.relationDescriptors || input.relationDescriptors.length === 0) {
        blockers.push('Track 02 typed harmonic pointer relation descriptors missing');
    }
    return blockers;
}

function audioOctetFromPayload(payload: Readonly<Record<string, unknown>>): readonly number[] | null {
    const raw = arrayValue(payload.audioOctet ?? payload.audio_octet);
    if (raw.length !== 8) return null;
    const values = raw.map(numberValue);
    return values.every((value): value is number => value !== null && Number.isFinite(value))
        ? Object.freeze(values)
        : null;
}

function nodalQuartetFromPayload(
    payload: Readonly<Record<string, unknown>>
): readonly Readonly<Record<string, unknown>>[] | null {
    const raw = arrayValue(payload.nodalQuartet ?? payload.nodal_quartet);
    if (raw.length !== 4) return null;
    const nodes = raw.map(objectValue);
    return nodes.every((node): node is Readonly<Record<string, unknown>> => node !== undefined)
        ? Object.freeze(nodes.map(node => Object.freeze({ ...node })))
        : null;
}

function objectValue(value: unknown): Readonly<Record<string, unknown>> | undefined {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? (value as Readonly<Record<string, unknown>>)
        : undefined;
}

function arrayValue(value: unknown): readonly unknown[] {
    return Array.isArray(value) ? value : [];
}

function numberValue(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function stringValue(value: unknown): string | null {
    return typeof value === 'string' && value.length > 0 ? value : null;
}
