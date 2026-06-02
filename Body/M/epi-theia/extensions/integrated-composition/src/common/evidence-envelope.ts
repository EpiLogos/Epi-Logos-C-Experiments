import {
    MathemeHarmonicProfileBoundary,
    PrivacyClass
} from '@pratibimba/m-extension-runtime';
import { IntegratedViewState } from './integrated-state';

/**
 * IntegratedEvidenceEnvelope — 08.T4 deliverable 4.
 *
 * Every evidence handle the 1-2-3 plugin emits MUST be wrapped in this
 * envelope. The shape carries enough provenance for S5 review to accept or
 * reject without further lookup, and it carries the privacy class so the
 * downstream consumer can refuse to surface protected content.
 *
 * `requiresHumanFinalValidation` is a Track 04 governance bit that flips when
 * the candidate would affect canon, recursive self-modification, deployment
 * gates, protected-personal corpus, or model behavior. The 08.T4 verification
 * step 3 ("human-required gates cannot be resolved by plugin/agent") is
 * enforced at the action layer: any action against an envelope with this bit
 * set throws rather than calling the gateway.
 */
export interface IntegratedEvidenceEnvelope {
    readonly envelopeId: string;
    readonly emittedAt: number;
    readonly producerId: IntegratedEvidenceProducerId;
    readonly rangeId: '1-2-3' | '4-5-0';
    readonly pluginId: 'plugin-integrated-1-2-3' | 'plugin-integrated-4-5-0';
    readonly profileGeneration: number | null;
    readonly worldClockGeneration: number | null;
    readonly s2ProvenanceHandles: readonly string[];
    readonly s3SessionHandle: string | null;
    readonly s3DayNowHandle: string | null;
    readonly s5ReviewTarget: S5ReviewTarget;
    readonly privacyClass: PrivacyClass;
    readonly sourceSpecAnchors: readonly string[];
    readonly requiresHumanFinalValidation: boolean;
    readonly payload: Readonly<Record<string, unknown>>;
}

export type IntegratedEvidenceProducerId =
    | 'cosmic-engine-snapshot'
    | 'route-codon-projection-audit'
    | 'm2-meaning-packet-trace'
    | 'kernel-trace-handle'
    | 'readiness-gap-report';

export interface S5ReviewTarget {
    readonly targetKind:
        | 's5.review.target.canon'
        | 's5.review.target.identity'
        | 's5.review.target.model'
        | 's5.review.target.routine'
        | 's5.review.target.gap';
    readonly targetId: string;
    readonly reason: string;
}

export const INTEGRATED_EVIDENCE_PRODUCER_IDS: readonly IntegratedEvidenceProducerId[] =
    Object.freeze([
        'cosmic-engine-snapshot',
        'route-codon-projection-audit',
        'm2-meaning-packet-trace',
        'kernel-trace-handle',
        'readiness-gap-report'
    ]);

export interface EvidenceProducerInput {
    readonly view: IntegratedViewState;
    readonly profile: MathemeHarmonicProfileBoundary | null;
    readonly contributorReadinessIds: readonly string[];
    /**
     * When the live profile is degraded, the producer may still emit a gap
     * report. Other producers refuse to emit and return null.
     */
    readonly forceEmitOnGap?: boolean;
}

/**
 * Authored S5 review targets that each producer attaches by default.
 * Producers may override; the routine names match the gateway methods
 * documented in 04.T6 (M5-3 contract surface).
 */
export const DEFAULT_REVIEW_TARGETS: Record<
    IntegratedEvidenceProducerId,
    S5ReviewTarget
> = {
    'cosmic-engine-snapshot': {
        targetKind: 's5.review.target.routine',
        targetId: 's5.review.routine.cosmic-engine-snapshot',
        reason: 'Periodic 1-2-3 cosmic engine snapshot for autoresearch ingestion.'
    },
    'route-codon-projection-audit': {
        targetKind: 's5.review.target.gap',
        targetId: 's5.review.gap.route-codon-projection',
        reason:
            'Route descriptor or codon projection drift observed between profile generation and cached pane state.'
    },
    'm2-meaning-packet-trace': {
        targetKind: 's5.review.target.routine',
        targetId: 's5.review.routine.m2-meaning-packet-trace',
        reason: 'M2 meaning packet emitted for review/autoresearch surfacing.'
    },
    'kernel-trace-handle': {
        targetKind: 's5.review.target.routine',
        targetId: 's5.review.routine.kernel-trace-handle',
        reason:
            'Kernel-trace handle deposit so M3 codon projection and M2 routing have an observable thread.'
    },
    'readiness-gap-report': {
        targetKind: 's5.review.target.gap',
        targetId: 's5.review.gap.cosmic-engine-readiness',
        reason: 'One or more cosmic engine panes blocked by missing upstream owner.'
    }
};
