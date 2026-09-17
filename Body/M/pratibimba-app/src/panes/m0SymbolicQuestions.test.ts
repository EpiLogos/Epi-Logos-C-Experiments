/**
 * Coordinate: M' M0' (symbolic-coordinate console, 21.T21.11)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): active-carrier question/response model contract.
 * Actualises: live verifier questions -> persisted gateway response receipt.
 * Public surface: Vitest contract for m0SymbolicQuestions.ts.
 * Does NOT own: symbolic parsing, verifier law, or response persistence.
 * Contract: [[M0'-SPEC]] + rerun [[21-m0-anuttara-frontend-deep]] 21.11.
 */

import { describe, expect, it } from 'vitest';
import type {
    KernelBridgeCachedProfile,
    KernelBridgeCapabilityReceipt
} from '../bridge/types';
import {
    readM0SymbolicQuestions,
    submitM0SymbolicQuestionResponse
} from './m0SymbolicQuestions';

function cached(questions: readonly string[]): KernelBridgeCachedProfile {
    return {
        generation: 42,
        cachedAtMs: 100,
        stale: false,
        stalenessMs: 0,
        privacyClass: 'public_current',
        profile: {
            harmonicProfile: {
                anuttaraWitness: {
                    virtueWitnessVector: 0,
                    virtueScores: [0, 0, 0, 0, 0, 0, 0, 0, 0],
                    unsatisfiedConstraints: questions,
                    openQuestions: questions,
                    coherenceScore: 0,
                    slotPrivacyBoundaryCompliance: true
                }
            }
        }
    } as KernelBridgeCachedProfile;
}

describe('M0 symbolic-coordinate question model', () => {
    it('reads raw live verifier questions without parsing them locally', () => {
        expect(
            readM0SymbolicQuestions(
                cached([
                    '#R0-0/1/S-T3-unwitnessed?',
                    '#R2-0/1/A-T7-pending?'
                ])
            )
        ).toEqual({
            state: 'ready',
            generation: 42,
            questions: [
                '#R0-0/1/S-T3-unwitnessed?',
                '#R2-0/1/A-T7-pending?'
            ]
        });
    });

    it('submits to the real verifier method and strict-reads its parsed receipt', async () => {
        const calls: Array<{ method: string; params: Record<string, unknown> }> = [];
        const result = await submitM0SymbolicQuestionResponse(
            {
                invoke(method, params) {
                    calls.push({ method, params });
                    return Promise.resolve({
                        method,
                        gatewayMethod: method,
                        sessionKey: 'm0-anuttara-symbolic',
                        profileGeneration: 42,
                        provenanceHandles: [],
                        vak: {
                            vakAddress: {
                                cpf: '',
                                ct: '',
                                cp: '',
                                cf: '',
                                cfp: '',
                                cs: ''
                            },
                            routeLineage: []
                        },
                        source: 'S3',
                        privacyClass: 'protected_local',
                        artifact: {
                            accepted: true,
                            responseId: 'response-42',
                            responseStatus: 'responded',
                            reverified: false,
                            privacyClass: 'protected_local',
                            profileGeneration: 42,
                            persistedAt: '2026-07-18T20:50:00Z',
                            parse: {
                                namespace: 'R',
                                coordinate: ['2', '0/1', 'A-T7'],
                                archetypeIndex: 7,
                                stateMarker: 'pending',
                                entryState: 'pending'
                            }
                        }
                    } as KernelBridgeCapabilityReceipt);
                }
            },
            {
                coordinateString: '#R2-0/1/A-T7-pending?',
                responseText: 'The action is now witnessed.',
                profileGeneration: 42
            }
        );

        expect(calls).toEqual([
            {
                method: "s0'.verifier.respond_question",
                params: {
                    coordinateString: '#R2-0/1/A-T7-pending?',
                    responseText: 'The action is now witnessed.',
                    sourceExtensionId: 'm0-anuttara',
                    sessionKey: 'm0-anuttara-symbolic',
                    profileGeneration: 42
                }
            }
        ]);
        expect(result).toMatchObject({
            responseId: 'response-42',
            responseStatus: 'responded',
            reverified: false,
            parse: {
                namespace: 'R',
                coordinate: ['2', '0/1', 'A-T7'],
                archetypeIndex: 7,
                stateMarker: 'pending'
            }
        });
    });

    it('rejects empty responses before dispatch', async () => {
        await expect(
            submitM0SymbolicQuestionResponse(
                {
                    invoke() {
                        throw new Error('must not dispatch');
                    }
                },
                {
                    coordinateString: '#R2-0/1/A-T7-pending?',
                    responseText: '   ',
                    profileGeneration: 42
                }
            )
        ).rejects.toThrow('must not be empty');
    });
});
