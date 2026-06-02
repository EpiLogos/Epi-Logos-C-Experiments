import { KernelBridgeAPI } from '@pratibimba/m-extension-runtime';
import { IntegratedEvidenceEnvelope } from './evidence-envelope';

/**
 * S5 review action wrappers — 08.T4 deliverable 2.
 *
 * Three plugin-facing actions that route an evidence envelope to S5 via the
 * shared bridge. When Track 04 DTOs and gateway methods are not yet ready
 * the bridge.invokeGatewayRpc call resolves to an error result with
 * `s5_review_blocked` — the action surface never silently succeeds against
 * stub or local data.
 *
 * 08.T4 verification 3: "Review-hook tests prove human-required S5 gates
 * cannot be resolved by plugin or agent action." Each action checks
 * envelope.requiresHumanFinalValidation and refuses to proceed against the
 * gateway when true — the only legitimate disposition is "queue for human
 * review" which is a different code path.
 */
export type S5ActionId =
    | 'openInReview'
    | 'askEpiiToExplain'
    | 'createImprovementCandidate';

export interface S5ActionResult {
    readonly actionId: S5ActionId;
    readonly envelopeId: string;
    readonly status:
        | 'submitted'
        | 's5_review_blocked'
        | 'bridge_unavailable'
        | 'human_validation_required'
        | 'rejected_by_gateway';
    readonly reason: string;
    readonly gatewayPayload?: unknown;
}

const ACTION_TO_METHOD: Record<S5ActionId, string> = {
    openInReview: 's5.review.request',
    askEpiiToExplain: 's5.epii.explain.request',
    createImprovementCandidate: 's5.improve.deposit'
};

export class HumanValidationRequiredError extends Error {
    constructor(public readonly envelopeId: string) {
        super(
            `Envelope ${envelopeId} is gated by requiresHumanFinalValidation — agents and plugins cannot resolve human-required S5 gates.`
        );
        this.name = 'HumanValidationRequiredError';
    }
}

async function invokeAction(
    actionId: S5ActionId,
    bridge: KernelBridgeAPI | null,
    envelope: IntegratedEvidenceEnvelope
): Promise<S5ActionResult> {
    if (!bridge) {
        return Object.freeze({
            actionId,
            envelopeId: envelope.envelopeId,
            status: 'bridge_unavailable',
            reason:
                'Kernel bridge has not been attached to the shared adapter; S5 review actions are not addressable.'
        });
    }
    if (envelope.requiresHumanFinalValidation) {
        return Object.freeze({
            actionId,
            envelopeId: envelope.envelopeId,
            status: 'human_validation_required',
            reason:
                'Evidence envelope is flagged requiresHumanFinalValidation; routing to S5 must come from a human session, not an agent or plugin auto-action.'
        });
    }
    const method = ACTION_TO_METHOD[actionId];
    try {
        const gatewayPayload = await bridge.invokeGatewayRpc(method, {
            envelope_id: envelope.envelopeId,
            producer_id: envelope.producerId,
            range_id: envelope.rangeId,
            profile_generation: envelope.profileGeneration,
            world_clock_generation: envelope.worldClockGeneration,
            s2_provenance_handles: envelope.s2ProvenanceHandles,
            s3_session_handle: envelope.s3SessionHandle,
            s3_day_now_handle: envelope.s3DayNowHandle,
            s5_review_target: envelope.s5ReviewTarget,
            privacy_class: envelope.privacyClass,
            source_spec_anchors: envelope.sourceSpecAnchors,
            payload: envelope.payload
        });
        return Object.freeze({
            actionId,
            envelopeId: envelope.envelopeId,
            status: 'submitted',
            reason: `Gateway accepted ${method}.`,
            gatewayPayload
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        // Track 04 DTOs not ready: treat all RPC failures as s5_review_blocked
        // unless the gateway explicitly rejected the envelope.
        const status: S5ActionResult['status'] = message.includes('rejected')
            ? 'rejected_by_gateway'
            : 's5_review_blocked';
        return Object.freeze({
            actionId,
            envelopeId: envelope.envelopeId,
            status,
            reason: message
        });
    }
}

export function openInReview(
    bridge: KernelBridgeAPI | null,
    envelope: IntegratedEvidenceEnvelope
): Promise<S5ActionResult> {
    return invokeAction('openInReview', bridge, envelope);
}

export function askEpiiToExplain(
    bridge: KernelBridgeAPI | null,
    envelope: IntegratedEvidenceEnvelope
): Promise<S5ActionResult> {
    return invokeAction('askEpiiToExplain', bridge, envelope);
}

export function createImprovementCandidate(
    bridge: KernelBridgeAPI | null,
    envelope: IntegratedEvidenceEnvelope
): Promise<S5ActionResult> {
    return invokeAction('createImprovementCandidate', bridge, envelope);
}
