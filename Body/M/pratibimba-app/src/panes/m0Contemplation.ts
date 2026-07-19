/**
 * Coordinate: M' M0' (contemplation prompt footer, 21.T21.9)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): active-carrier prompt and review-route model.
 * Actualises: the compiled M0 prompt LUT as a governed S5 review request.
 * Public surface: contemplationFromProfile, submitM0ContemplationReview.
 * Does NOT own: prompt wording, profile production, or review persistence.
 * Contract: [[M0'-SPEC]] + rerun [[21-m0-anuttara-frontend-deep]] 21.9.
 */

import type {
    KernelBridgeCachedProfile,
    KernelBridgeCapabilityReceipt
} from '../bridge/types';

export const M0_REVIEW_EVENT_TYPE = 'm0.review.requested' as const;
export const M0_REVIEW_PRIVACY_CLASS = 'public_current_with_graph_provenance' as const;

export interface M0ContemplationProjection {
    readonly archetypeIndex: number | null;
    readonly prompt: string | null;
    readonly state: 'canonical' | 'canonical_absent' | 'blocked';
}

export interface M0ContemplationReviewRequest {
    readonly archetypeIndex: number;
    readonly prompt: string;
    readonly responseText: string;
    readonly coordinate: string | null;
    readonly profileGeneration: number | null;
}

interface GatewayInvoker {
    invoke(
        method: string,
        params: Record<string, unknown>
    ): Promise<KernelBridgeCapabilityReceipt>;
}

function record(value: unknown): Record<string, unknown> | null {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : null;
}

function harmonicProfile(cached: KernelBridgeCachedProfile | null): Record<string, unknown> | null {
    const root = record(cached?.profile);
    const payload = record(root?.payload);
    return record(root?.harmonicProfile) ?? record(payload?.harmonicProfile) ?? payload ?? root;
}

export function contemplationFromProfile(
    cached: KernelBridgeCachedProfile | null
): M0ContemplationProjection {
    const profile = harmonicProfile(cached);
    const tick12 = Number.isInteger(profile?.tick12) ? (profile?.tick12 as number) : null;
    const candidate = profile?.contemplationPromptLut ?? profile?.contemplation_prompt_lut;
    if (tick12 === null || tick12 < 0 || tick12 > 11 || !Array.isArray(candidate)) {
        return Object.freeze({
            archetypeIndex: tick12,
            prompt: null,
            state: 'blocked'
        });
    }
    const prompt = typeof candidate[tick12] === 'string' && candidate[tick12].length > 0
        ? candidate[tick12]
        : null;
    return Object.freeze({
        archetypeIndex: tick12,
        prompt,
        state: prompt ? 'canonical' : 'canonical_absent'
    });
}

export async function submitM0ContemplationReview(
    client: GatewayInvoker,
    request: M0ContemplationReviewRequest
): Promise<KernelBridgeCapabilityReceipt> {
    const responseText = request.responseText.trim();
    if (!responseText) {
        throw new Error('contemplation response must not be empty');
    }
    return client.invoke("s5'.review.submit", {
        source: 'human_gate',
        title: `M0 contemplation: archetype ${request.archetypeIndex}`,
        body: responseText,
        priority: 'normal',
        coordinate_context: {
            eventType: M0_REVIEW_EVENT_TYPE,
            coordinate: request.coordinate,
            archetypeIndex: request.archetypeIndex,
            prompt: request.prompt,
            profileGeneration: request.profileGeneration,
            privacyClass: M0_REVIEW_PRIVACY_CLASS
        },
        requires_human: true
    });
}
