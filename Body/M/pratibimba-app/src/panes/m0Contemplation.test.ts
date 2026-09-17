/**
 * Coordinate: M' M0' (contemplation prompt footer, 21.T21.9)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): active-carrier model and review-route contract.
 * Actualises: prompt selection from the real profile bus and governed submit.
 * Public surface: Vitest contract for m0Contemplation.ts.
 * Does NOT own: prompt wording, S2 graph law, or S5 review persistence.
 * Contract: [[M0'-SPEC]] + rerun [[21-m0-anuttara-frontend-deep]] 21.9.
 */

import { describe, expect, it } from 'vitest';
import type {
    KernelBridgeCachedProfile,
    KernelBridgeCapabilityReceipt
} from '../bridge/types';
import {
    contemplationFromProfile,
    submitM0ContemplationReview
} from './m0Contemplation';

const PROMPTS = [
    '',
    '',
    '',
    'Did your speech articulate identity or just signal? Where did naming become performance?',
    '',
    'Did unity-multiplicity hold or did one side eat the other? Where was the mercurial crossroads refused?',
    '',
    'Did the four causes integrate or did one dominate? Which act was missing?',
    '',
    'Did the cycle complete in wholeness or close prematurely? Which virtue went unwitnessed?',
    '',
    ''
] as const;

function cached(tick12 = 7): KernelBridgeCachedProfile {
    return {
        generation: 41,
        cachedAtMs: 100,
        stale: false,
        stalenessMs: 0,
        privacyClass: 'public_current',
        profile: {
            harmonicProfile: {
                tick12,
                contemplationPromptLut: PROMPTS
            }
        }
    } as KernelBridgeCachedProfile;
}

describe('M0 contemplation footer model', () => {
    it('selects the compiled prompt by the live profile archetype', () => {
        expect(contemplationFromProfile(cached())).toEqual({
            archetypeIndex: 7,
            prompt: PROMPTS[7],
            state: 'canonical'
        });
    });

    it('preserves canonical empty slots as honest absence', () => {
        expect(contemplationFromProfile(cached(8))).toEqual({
            archetypeIndex: 8,
            prompt: null,
            state: 'canonical_absent'
        });
    });

    it('submits m0.review.requested through the real S5 review method', async () => {
        const calls: Array<{ method: string; params: Record<string, unknown> }> = [];
        const receipt = await submitM0ContemplationReview(
            {
                invoke(method, params) {
                    calls.push({ method, params });
                    return Promise.resolve({
                        method,
                        gatewayMethod: method,
                        sessionKey: 'm0-contemplation',
                        profileGeneration: 41,
                        provenanceHandles: [],
                        vak: {
                            vakAddress: {
                                cpf: '(4.0/1-4.4/5)',
                                ct: 'CT2',
                                cp: '4.2',
                                cf: '(0/1/2)',
                                cfp: 'operation',
                                cs: 'forward'
                            },
                            routeLineage: ['vak_evaluate', 'anima_orchestrate', 'dispatch_eros']
                        },
                        source: 'S3',
                        privacyClass: 'public_current',
                        artifact: { item: { item_id: 'review-41' } }
                    } as KernelBridgeCapabilityReceipt);
                }
            },
            {
                archetypeIndex: 7,
                prompt: PROMPTS[7],
                responseText: 'The missing act was witness.',
                coordinate: 'M0-4-7',
                profileGeneration: 41
            }
        );

        expect(calls).toHaveLength(1);
        expect(calls[0].method).toBe("s5'.review.submit");
        expect(calls[0].params).toMatchObject({
            source: 'human_gate',
            title: 'M0 contemplation: archetype 7',
            body: 'The missing act was witness.',
            priority: 'normal',
            requires_human: true,
            coordinate_context: {
                eventType: 'm0.review.requested',
                coordinate: 'M0-4-7',
                archetypeIndex: 7,
                prompt: PROMPTS[7],
                profileGeneration: 41,
                privacyClass: 'public_current_with_graph_provenance'
            }
        });
        expect(receipt.artifact).toEqual({ item: { item_id: 'review-41' } });
    });
});
