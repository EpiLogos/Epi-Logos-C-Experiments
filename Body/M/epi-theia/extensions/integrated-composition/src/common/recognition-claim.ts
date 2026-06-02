import { PrivacyClass } from '@pratibimba/m-extension-runtime';
import {
    IntegratedEvidenceEnvelope,
    IntegratedEvidenceProducerId,
    S5ReviewTarget
} from './evidence-envelope';

/**
 * JivaSivaRecognitionClaim — 08.T6 deliverable 3 + verification 1.
 *
 * Recognition-claim evidence MUST carry the full set of required fields
 * before it can leave the plugin. The builder rejects any missing field
 * individually so the call site sees a precise error rather than a vague
 * "evidence rejected" — that matters because each missing field maps to a
 * different upstream owner the user can ask to provide it.
 *
 * `sourceClass` is the Graphiti-vs-canonical distinction 08.T6 verification 3
 * names: a recognition claim sourced from Graphiti memory MUST NOT be
 * promoted to canonical S2 by this plugin. The flag is read by
 * graphiti-source-guard.ts before any deposit.
 */
export type RecognitionSourceClass = 'm4-protected' | 'graphiti-memory' | 's2-canonical';

export interface JivaSivaRecognitionClaim {
    readonly claimId: string;
    readonly emittedAt: number;
    readonly privacyBoundary: PrivacyClass;
    readonly m4ProtectedSourceHandle: string;
    readonly bedrockLinkHandle: string;
    readonly activityResonanceTraces: readonly string[];
    readonly s2EvidenceHandles: readonly string[];
    readonly s3SessionHandle: string;
    readonly s3DayNowHandle: string;
    readonly s5TargetRoute: S5ReviewTarget;
    readonly sourceClass: RecognitionSourceClass;
    readonly sourceSpecAnchors: readonly string[];
    readonly readiness: 'ready_public_current' | 'degraded_but_readable' | 'authority_payload_missing';
    readonly notes: string;
}

export class JivaSivaRecognitionMissingFieldError extends Error {
    constructor(public readonly fieldName: string) {
        super(
            `Jiva-Siva recognition claim cannot be built without "${fieldName}" — see 08.T6 verification 1.`
        );
        this.name = 'JivaSivaRecognitionMissingFieldError';
    }
}

export interface JivaSivaRecognitionInput {
    readonly claimId: string;
    readonly emittedAt: number;
    readonly privacyBoundary?: PrivacyClass;
    readonly m4ProtectedSourceHandle?: string | null;
    readonly bedrockLinkHandle?: string | null;
    readonly activityResonanceTraces?: readonly string[];
    readonly s2EvidenceHandles?: readonly string[];
    readonly s3SessionHandle?: string | null;
    readonly s3DayNowHandle?: string | null;
    readonly s5TargetRoute?: S5ReviewTarget;
    readonly sourceClass?: RecognitionSourceClass;
    readonly sourceSpecAnchors?: readonly string[];
    readonly readiness?: JivaSivaRecognitionClaim['readiness'];
    readonly notes?: string;
}

function requireField<T>(value: T | null | undefined, name: string): T {
    if (value === null || value === undefined) {
        throw new JivaSivaRecognitionMissingFieldError(name);
    }
    return value;
}

function requireNonEmptyArray(value: readonly string[] | undefined, name: string): readonly string[] {
    if (!value || value.length === 0) {
        throw new JivaSivaRecognitionMissingFieldError(name);
    }
    return value;
}

export function buildJivaSivaRecognitionClaim(
    input: JivaSivaRecognitionInput
): JivaSivaRecognitionClaim {
    const claimId = requireField(input.claimId, 'claimId');
    const privacyBoundary = requireField(input.privacyBoundary, 'privacyBoundary');
    const m4ProtectedSourceHandle = requireField(
        input.m4ProtectedSourceHandle,
        'm4ProtectedSourceHandle'
    );
    const bedrockLinkHandle = requireField(input.bedrockLinkHandle, 'bedrockLinkHandle');
    const activityResonanceTraces = requireNonEmptyArray(
        input.activityResonanceTraces,
        'activityResonanceTraces'
    );
    const s2EvidenceHandles = requireNonEmptyArray(
        input.s2EvidenceHandles,
        's2EvidenceHandles'
    );
    const s3SessionHandle = requireField(input.s3SessionHandle, 's3SessionHandle');
    const s3DayNowHandle = requireField(input.s3DayNowHandle, 's3DayNowHandle');
    const s5TargetRoute = requireField(input.s5TargetRoute, 's5TargetRoute');
    const sourceClass = requireField(input.sourceClass, 'sourceClass');
    const sourceSpecAnchors = requireNonEmptyArray(
        input.sourceSpecAnchors,
        'sourceSpecAnchors'
    );
    return Object.freeze({
        claimId,
        emittedAt: input.emittedAt,
        privacyBoundary,
        m4ProtectedSourceHandle,
        bedrockLinkHandle,
        activityResonanceTraces: Object.freeze([...activityResonanceTraces]),
        s2EvidenceHandles: Object.freeze([...s2EvidenceHandles]),
        s3SessionHandle,
        s3DayNowHandle,
        s5TargetRoute,
        sourceClass,
        sourceSpecAnchors: Object.freeze([...sourceSpecAnchors]),
        readiness: input.readiness ?? 'degraded_but_readable',
        notes: input.notes ?? ''
    });
}

/**
 * Map a built recognition claim into the cross-track IntegratedEvidenceEnvelope
 * shape used by S5 action wrappers. The envelope carries the recognition-claim
 * payload verbatim plus all the cross-track fields the gateway requires.
 */
export function recognitionClaimToEnvelope(
    claim: JivaSivaRecognitionClaim,
    producerId: IntegratedEvidenceProducerId,
    profileGeneration: number | null,
    worldClockGeneration: number | null
): IntegratedEvidenceEnvelope {
    return Object.freeze({
        envelopeId: claim.claimId,
        emittedAt: claim.emittedAt,
        producerId,
        rangeId: '4-5-0',
        pluginId: 'plugin-integrated-4-5-0',
        profileGeneration,
        worldClockGeneration,
        s2ProvenanceHandles: claim.s2EvidenceHandles,
        s3SessionHandle: claim.s3SessionHandle,
        s3DayNowHandle: claim.s3DayNowHandle,
        s5ReviewTarget: claim.s5TargetRoute,
        privacyClass: claim.privacyBoundary,
        sourceSpecAnchors: claim.sourceSpecAnchors,
        requiresHumanFinalValidation: true,
        payload: Object.freeze({
            recognitionSourceClass: claim.sourceClass,
            m4ProtectedSourceHandle: claim.m4ProtectedSourceHandle,
            bedrockLinkHandle: claim.bedrockLinkHandle,
            activityResonanceTraces: claim.activityResonanceTraces,
            readiness: claim.readiness,
            notes: claim.notes
        })
    });
}
