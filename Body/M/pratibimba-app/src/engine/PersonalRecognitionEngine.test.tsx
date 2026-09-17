/**
 * Coordinate: M' M4' -> M5' (personal recognition composition tests)
 * Residency: Body/M/pratibimba-app/src/engine/PersonalRecognitionEngine.test.tsx
 * Position (#n): #4 — behavioral proof for the integrated 4-5-0 handoff
 * Actualises: Track 36.T36.5's public-safe M0/M4/M5 recognition surface.
 * Public surface: Vitest suite for PersonalRecognitionEngine.
 * Does NOT own: kernel projections, quaternion composition, or EBM scoring.
 */

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { PersonalRecognitionEngine } from './PersonalRecognitionEngine';
import { publishProfileTick, resetProfileTicks } from '../composition/profileTickSubscription';
import { CompositionProfileProvider } from '../composition/compositionProfileContext';

afterEach(() => {
    cleanup();
    resetProfileTicks();
});

describe('PersonalRecognitionEngine', () => {
    it('composes the live M0/M4/M5 recognition handoff without exposing protected bodies', () => {
        publishProfileTick({
                generation: 17,
                cachedAtMs: 17_000,
                stale: false,
                stalenessMs: 0,
                privacyClass: 'public-current-context',
                profile: {
                    harmonicProfile: {
                        kleinFlip: false,
                        resonance72Index: 36,
                        audioOctet: [220, 247, 262, 294, 330, 349, 392, 440],
                        nodalQuartet: [{ qlPosition: 0, helix: 'a', m: 1, n: 2 }],
                        anuttaraPentadicTrace: {
                            sourceBinaryState: '0/1',
                            codon: 'GCU',
                            lineChangeOperator: 384,
                            qComposedHandle: 'q_composed://session/current',
                            learnedPredictorCheckpointRef: 'ebm-checkpoint://current',
                            provenance: ['portal-core::MathemeHarmonicProfile::from_tick']
                        },
                        personalPole: {
                            qComposedHandle: {
                                targetKind: 'QComposed',
                                handle: 'q_composed://session/current',
                                privacy: 'protected-local-body'
                            }
                        },
                        anuttaraWitness: {
                            virtueWitnessVector: 0b110_110_111,
                            syntaxWitnessVector: 0b1011,
                            rfactorPath: [],
                            bandBalance: {
                                pravrittiDepth: 4,
                                nivrittiDepth: 4,
                                reachedTurn: true,
                                returned: true
                            },
                            palindromeState: {
                                normalFormSymmetric: true,
                                mirrorNormalForm: 'R1@O#/0|(@#)|R3@Shakti/0'
                            },
                            openQuestions: [],
                            coherenceScore: 0.72
                        },
                        mathemeResonance72Projection: {
                            learnedPredictorCheckpointRef: 'ebm-checkpoint://current',
                            predicted72: Array.from({ length: 72 }, (_, index) => index / 72),
                            target72: Array.from({ length: 72 }, (_, index) => (index + 1) / 72)
                        },
                        qComposed: [0.1234, 0.5678, 0.9012, 0.3456],
                        bioquaternion: {
                            q_b: [0.1111, 0.2222, 0.3333, 0.4444],
                            q_p: [0.9999, 0.8888, 0.7777, 0.6666]
                        }
                    }
                }
            } as never);

        render(
            <CompositionProfileProvider>
                <PersonalRecognitionEngine />
            </CompositionProfileProvider>
        );

        const surface = screen.getByTestId('personal-recognition-engine');
        expect(surface.dataset.state).toBe('ready');
        expect(screen.getByTestId('personal-recognition-integrated-readiness').dataset.state).toBe('ready');
        expect(screen.getByTestId('m0-virtue-witness-panel')).toBeTruthy();
        expect(screen.getByTestId('personal-recognition-m4-handoff').textContent).toContain(
            'GCU'
        );
        expect(screen.getByTestId('personal-recognition-m4-handoff').textContent).toContain(
            '384'
        );
        expect(screen.getByTestId('personal-recognition-q-composed').getAttribute('title')).toBe(
            'q_composed://session/current'
        );
        expect(screen.getByTestId('personal-recognition-q-b').getAttribute('title')).toBe(
            'q_composed://session/current#q_b'
        );
        expect(screen.getByTestId('personal-recognition-q-p').getAttribute('title')).toBe(
            'q_composed://session/current#q_p'
        );
        expect(screen.getByTestId('m5-ebm-observatory').dataset.state).toBe('ready');
        expect(surface.textContent).not.toContain('0.1234');
        expect(surface.textContent).not.toContain('0.5678');
        expect(surface.textContent).not.toContain('0.1111');
        expect(surface.textContent).not.toContain('0.9999');
    });

    // 29.T29.3 — the slot-ownership law had no production caller on the
    // personal path, which is the only path its five forbidden handle classes
    // describe. This is the behavioural proof that the render now reaches it.
    it('reports one named owner per personal geometric slot', () => {
        render(
            <CompositionProfileProvider>
                <PersonalRecognitionEngine />
            </CompositionProfileProvider>
        );
        const root = screen.getByTestId('personal-recognition-engine');
        expect(root.getAttribute('data-composition-mounted')).toBe('true');
        expect(root.getAttribute('data-left-composition-owner')).toBe('m4-nara');
        expect(root.getAttribute('data-center-composition-owner')).toBe('m4-nara');
        expect(root.getAttribute('data-right-composition-owner')).toBe('m5-epii');
        expect(root.getAttribute('data-grounding-owner')).toBe('m0-anuttara');
        expect(root.getAttribute('data-composition-ambient-owner')).toBe('m4-nara');
        expect(root.getAttribute('data-composition-status-owner')).toBe('m4-nara');
        expect(root.getAttribute('data-composition-rejection')).toBe('');
    });

    it('reports the center slot LIVE — the 25.6 renderer landed and no slot is blocked', () => {
        // 25.T25.6 landed the personal cymatic field: all six slots render,
        // the blocked list is empty, and the center owner is still named.
        render(
            <CompositionProfileProvider>
                <PersonalRecognitionEngine />
            </CompositionProfileProvider>
        );
        const root = screen.getByTestId('personal-recognition-engine');
        expect(root.getAttribute('data-composition-blocked-slots')).toBe('');
        expect(root.getAttribute('data-center-composition-owner')).toBe('m4-nara');
        expect(screen.getByTestId('m4-personal-cymatic-field')).toBeTruthy();
    });
});
