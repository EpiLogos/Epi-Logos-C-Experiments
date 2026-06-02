import { KernelBridgeAPI } from '@pratibimba/m-extension-runtime';
import { IntegratedEvidenceEnvelope } from './evidence-envelope';
import { assertNotCanonicalS2Source } from './graphiti-source-guard';
import { S5ActionResult } from './s5-review-actions';

/**
 * 08.T6 deliverable 1: the five Epii actions for the 4/5/0 plugin.
 *
 * Each action wraps a typed RPC method behind disposition + Graphiti-source
 * guards. The set is closed: any new Epii action must be added here so the
 * agent-disposition limit and graphiti-source check apply uniformly.
 */
export type EpiiActionId =
    | 'reviewRecognitionClaim'
    | 'depositProtectedEvidence'
    | 'requestAnimaConsentReview'
    | 'openEpiiContinuity'
    | 'dryRunCanonPromotion';

export const ALL_EPII_ACTIONS: readonly EpiiActionId[] = Object.freeze([
    'reviewRecognitionClaim',
    'depositProtectedEvidence',
    'requestAnimaConsentReview',
    'openEpiiContinuity',
    'dryRunCanonPromotion'
]);

const EPII_ACTION_TO_METHOD: Record<EpiiActionId, string> = {
    reviewRecognitionClaim: 's5.review.recognition_claim.request',
    depositProtectedEvidence: 's5.evidence.deposit.protected',
    requestAnimaConsentReview: 's5.consent.review.request',
    openEpiiContinuity: 's5.continuity.open',
    dryRunCanonPromotion: 's5.improve.canon.dry_run'
};

/**
 * 08.T6 verification 2: "Tests prove protected evidence can be deferred or
 * summarized by agents but not approved, rejected, revised, or promoted when
 * human-required gates apply."
 *
 * AgentDisposition captures the six dispositions an agent may declare on an
 * evidence envelope. Only `defer` and `summarize` are allowed against a
 * human-required envelope.
 */
export type AgentDisposition =
    | 'defer'
    | 'summarize'
    | 'approve'
    | 'reject'
    | 'revise'
    | 'promote';

export const AGENT_AUTO_DISPOSITIONS_ALLOWED_FOR_HUMAN_GATE: readonly AgentDisposition[] =
    Object.freeze(['defer', 'summarize']);

export class HumanRequiredDispositionError extends Error {
    constructor(
        public readonly envelopeId: string,
        public readonly attemptedDisposition: AgentDisposition
    ) {
        super(
            `Disposition "${attemptedDisposition}" is reserved for human review on envelope ${envelopeId}; agents and plugins may only defer or summarize.`
        );
        this.name = 'HumanRequiredDispositionError';
    }
}

export function enforceAgentDispositionLimit(
    envelope: IntegratedEvidenceEnvelope,
    disposition: AgentDisposition
): void {
    if (!envelope.requiresHumanFinalValidation) {
        return;
    }
    if (AGENT_AUTO_DISPOSITIONS_ALLOWED_FOR_HUMAN_GATE.includes(disposition)) {
        return;
    }
    throw new HumanRequiredDispositionError(envelope.envelopeId, disposition);
}

async function invokeEpiiAction(
    actionId: EpiiActionId,
    bridge: KernelBridgeAPI | null,
    envelope: IntegratedEvidenceEnvelope
): Promise<S5ActionResult> {
    if (!bridge) {
        return Object.freeze({
            actionId,
            envelopeId: envelope.envelopeId,
            status: 'bridge_unavailable',
            reason: 'No bridge attached; Epii action cannot be addressed.'
        }) as unknown as S5ActionResult;
    }
    try {
        assertNotCanonicalS2Source(envelope);
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return Object.freeze({
            actionId,
            envelopeId: envelope.envelopeId,
            status: 'rejected_by_gateway',
            reason: `Graphiti-source guard: ${message}`
        }) as unknown as S5ActionResult;
    }
    if (envelope.requiresHumanFinalValidation) {
        return Object.freeze({
            actionId,
            envelopeId: envelope.envelopeId,
            status: 'human_validation_required',
            reason:
                'Epii action against a human-required envelope must come from a human session.'
        }) as unknown as S5ActionResult;
    }
    const method = EPII_ACTION_TO_METHOD[actionId];
    try {
        const gatewayPayload = await bridge.invokeGatewayRpc(method, {
            envelope_id: envelope.envelopeId,
            producer_id: envelope.producerId,
            s5_review_target: envelope.s5ReviewTarget,
            privacy_class: envelope.privacyClass,
            payload: envelope.payload
        });
        return Object.freeze({
            actionId,
            envelopeId: envelope.envelopeId,
            status: 'submitted',
            reason: `Gateway accepted ${method}.`,
            gatewayPayload
        }) as unknown as S5ActionResult;
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return Object.freeze({
            actionId,
            envelopeId: envelope.envelopeId,
            status: 's5_review_blocked',
            reason: message
        }) as unknown as S5ActionResult;
    }
}

export const reviewRecognitionClaim = (
    bridge: KernelBridgeAPI | null,
    envelope: IntegratedEvidenceEnvelope
) => invokeEpiiAction('reviewRecognitionClaim', bridge, envelope);
export const depositProtectedEvidence = (
    bridge: KernelBridgeAPI | null,
    envelope: IntegratedEvidenceEnvelope
) => invokeEpiiAction('depositProtectedEvidence', bridge, envelope);
export const requestAnimaConsentReview = (
    bridge: KernelBridgeAPI | null,
    envelope: IntegratedEvidenceEnvelope
) => invokeEpiiAction('requestAnimaConsentReview', bridge, envelope);
export const openEpiiContinuity = (
    bridge: KernelBridgeAPI | null,
    envelope: IntegratedEvidenceEnvelope
) => invokeEpiiAction('openEpiiContinuity', bridge, envelope);
export const dryRunCanonPromotion = (
    bridge: KernelBridgeAPI | null,
    envelope: IntegratedEvidenceEnvelope
) => invokeEpiiAction('dryRunCanonPromotion', bridge, envelope);

export function epiiActionMethodName(actionId: EpiiActionId): string {
    return EPII_ACTION_TO_METHOD[actionId];
}
