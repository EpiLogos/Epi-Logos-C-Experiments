import { MathemeHarmonicProfileBoundary } from '@pratibimba/m-extension-runtime';
import {
    DEFAULT_REVIEW_TARGETS,
    EvidenceProducerInput,
    IntegratedEvidenceEnvelope,
    IntegratedEvidenceProducerId
} from './evidence-envelope';
import { checkCosmicEnginePanes } from './profile-field-checker';

/**
 * Evidence producers — 08.T4 deliverable 1.
 *
 * Each producer is a pure function. None of them invent payload data — every
 * field is sourced from the immutable IntegratedViewState / profile that the
 * caller passes in. If the required upstream data is missing, the producer
 * returns null (NOT a fabricated default) unless the caller asks for a gap
 * report via forceEmitOnGap.
 */
type EnvelopeBuilder = (
    input: EvidenceProducerInput,
    envelopeId: string
) => IntegratedEvidenceEnvelope | null;

function baseEnvelope(
    producerId: IntegratedEvidenceProducerId,
    input: EvidenceProducerInput,
    envelopeId: string,
    payload: Readonly<Record<string, unknown>>,
    requiresHumanFinalValidation: boolean,
    s2ProvenanceHandles: readonly string[],
    sourceSpecAnchors: readonly string[]
): IntegratedEvidenceEnvelope {
    return Object.freeze({
        envelopeId,
        emittedAt: input.view.lastUpdatedAt,
        producerId,
        rangeId: '1-2-3',
        pluginId: 'plugin-integrated-1-2-3',
        profileGeneration: input.view.profileGeneration,
        worldClockGeneration: input.view.worldClockGeneration,
        s2ProvenanceHandles: Object.freeze([...s2ProvenanceHandles]),
        s3SessionHandle: input.view.selectedCoordinate.dayNowSessionHandle,
        s3DayNowHandle: input.view.selectedCoordinate.dayNowSessionHandle,
        s5ReviewTarget: DEFAULT_REVIEW_TARGETS[producerId],
        privacyClass: input.view.privacyScope,
        sourceSpecAnchors: Object.freeze([...sourceSpecAnchors]),
        requiresHumanFinalValidation,
        payload: Object.freeze({ ...payload })
    });
}

function readProvenanceHandles(
    profile: MathemeHarmonicProfileBoundary | null
): readonly string[] {
    if (!profile) {
        return [];
    }
    const raw = profile.payload['s2_provenance'];
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
        const obj = raw as Record<string, unknown>;
        if (Array.isArray(obj.handles)) {
            return obj.handles.filter((h): h is string => typeof h === 'string');
        }
        if (typeof obj.source === 'string') {
            return [obj.source];
        }
    }
    return [];
}

const cosmicEngineSnapshot: EnvelopeBuilder = (input, id) => {
    if (!input.profile) {
        return null;
    }
    const panes = checkCosmicEnginePanes(input.profile);
    const allReady =
        panes.m3CenterStage.allFieldsPresent &&
        panes.m2LeftStage.allFieldsPresent &&
        panes.m1RightInspector.allFieldsPresent;
    if (!allReady && !input.forceEmitOnGap) {
        return null;
    }
    return baseEnvelope(
        'cosmic-engine-snapshot',
        input,
        id,
        {
            panesReady: allReady,
            paneGenerations: {
                m3: panes.m3CenterStage.profileGeneration,
                m2: panes.m2LeftStage.profileGeneration,
                m1: panes.m1RightInspector.profileGeneration
            }
        },
        // Snapshots don't change canon — agent may surface them. Human gate only
        // when downstream classifies as identity/canon/recursive.
        false,
        readProvenanceHandles(input.profile),
        [
            'docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/08-integrated-plugin-tracks.md#T3',
            "Idea/Bimba/Seeds/M/M5'/m5-prime-system-shape-and-tauri-ide-canon.md#4.4"
        ]
    );
};

const routeCodonProjectionAudit: EnvelopeBuilder = (input, id) => {
    if (!input.profile) {
        return null;
    }
    const m3 = checkCosmicEnginePanes(input.profile).m3CenterStage;
    if (m3.allFieldsPresent && !input.forceEmitOnGap) {
        return null;
    }
    return baseEnvelope(
        'route-codon-projection-audit',
        input,
        id,
        {
            missingM3Fields: m3.missingFields,
            activeRoute: input.view.activeRoute
        },
        false,
        readProvenanceHandles(input.profile),
        [
            "Idea/Bimba/Seeds/M/M3'/M3'-SPEC.md#7-the-472-state-modal-inversion-landscape",
            'docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/01-kernel-bridge-and-s0-foundation.md#T7'
        ]
    );
};

const m2MeaningPacketTrace: EnvelopeBuilder = (input, id) => {
    if (!input.profile) {
        return null;
    }
    const m2 = checkCosmicEnginePanes(input.profile).m2LeftStage;
    if (!m2.allFieldsPresent && !input.forceEmitOnGap) {
        return null;
    }
    return baseEnvelope(
        'm2-meaning-packet-trace',
        input,
        id,
        {
            resonance72: input.profile.payload['resonance72'],
            planetaryChakral: input.profile.payload['planetaryChakral'],
            kleinFlipState: input.profile.payload['kleinFlipState']
        },
        false,
        readProvenanceHandles(input.profile),
        ["Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md#4.1-the-canonical-m2primemeaningpacket"]
    );
};

const kernelTraceHandle: EnvelopeBuilder = (input, id) => {
    if (!input.profile) {
        return null;
    }
    const handleSource = input.profile.payload['kernel_trace_handle'];
    if (typeof handleSource !== 'string' && !input.forceEmitOnGap) {
        return null;
    }
    return baseEnvelope(
        'kernel-trace-handle',
        input,
        id,
        {
            handle: typeof handleSource === 'string' ? handleSource : null,
            sourceGeneration: input.view.profileGeneration
        },
        false,
        readProvenanceHandles(input.profile),
        [
            'docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/01-kernel-bridge-and-s0-foundation.md#T7-agentic-capability-and-observability-feed'
        ]
    );
};

const readinessGapReport: EnvelopeBuilder = (input, id) => {
    const panes = checkCosmicEnginePanes(input.profile);
    const missingByPane = {
        m3: panes.m3CenterStage.missingFields,
        m2: panes.m2LeftStage.missingFields,
        m1: panes.m1RightInspector.missingFields
    };
    const anyMissing =
        missingByPane.m3.length > 0 ||
        missingByPane.m2.length > 0 ||
        missingByPane.m1.length > 0;
    if (!anyMissing && !input.forceEmitOnGap) {
        return null;
    }
    return baseEnvelope(
        'readiness-gap-report',
        input,
        id,
        {
            missingByPane,
            bridgeReadiness: input.view.bridgeReadiness.state,
            blockingContributors: input.contributorReadinessIds
        },
        false,
        readProvenanceHandles(input.profile),
        ['docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/08-integrated-plugin-tracks.md#T4']
    );
};

const PRODUCERS: Readonly<Record<IntegratedEvidenceProducerId, EnvelopeBuilder>> = Object.freeze({
    'cosmic-engine-snapshot': cosmicEngineSnapshot,
    'route-codon-projection-audit': routeCodonProjectionAudit,
    'm2-meaning-packet-trace': m2MeaningPacketTrace,
    'kernel-trace-handle': kernelTraceHandle,
    'readiness-gap-report': readinessGapReport
});

export function produceEvidence(
    producerId: IntegratedEvidenceProducerId,
    input: EvidenceProducerInput,
    envelopeId: string
): IntegratedEvidenceEnvelope | null {
    return PRODUCERS[producerId](input, envelopeId);
}

export function produceAllAvailableEnvelopes(
    input: EvidenceProducerInput,
    envelopeIdSeed: string
): readonly IntegratedEvidenceEnvelope[] {
    const out: IntegratedEvidenceEnvelope[] = [];
    let idx = 0;
    for (const producerId of Object.keys(PRODUCERS) as IntegratedEvidenceProducerId[]) {
        const envelope = PRODUCERS[producerId](input, `${envelopeIdSeed}:${idx++}`);
        if (envelope !== null) {
            out.push(envelope);
        }
    }
    return Object.freeze(out);
}
