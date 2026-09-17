/**
 * Coordinate: M' M5' (personal recognition-layer slot tests)
 * Residency: Body/M/pratibimba-app/src/panes/M5RecognitionLayer.test.tsx
 * Position (#n): #5 — M5 scoring face inside the 4-5-0 composition.
 * Actualises: Track 26.T26.11.
 * Public surface: Behavioral proof for M5RecognitionLayer.
 * Does NOT own: canonical recognition production, quaternion composition,
 * EBM scoring, or session-close dispatch.
 */

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { M5RecognitionLayer } from './M5RecognitionLayer';
import { publishProfileTick, resetProfileTicks } from '../composition/profileTickSubscription';

afterEach(() => {
    cleanup();
    resetProfileTicks();
});

describe('M5RecognitionLayer', () => {
    it('renders the safe canonical-recognition slot from a live profile payload', () => {
        publishProfileTick({
                generation: 31,
                cachedAtMs: 31_000,
                stale: false,
                stalenessMs: 0,
                privacyClass: 'public-current-context',
                profile: {
                    harmonicProfile: {
                        personalPole: {
                            resonance: { score: 0.812 },
                            qComposedHandle: {
                                targetKind: 'QComposed',
                                handle: 'q_composed://session/current',
                                privacy: 'protected-local-body'
                            }
                        },
                        canonRecognitionStream: [
                            {
                                bimbaCoordinate: 'M3-2-64-17',
                                patternPacketHandle: 'pattern://recognition/current',
                                recognitionDegree720: 315,
                                writeBackState: 'applied'
                            }
                        ],
                        mathemeResonance72Projection: {
                            learnedPredictorCheckpointRef: 'ebm-checkpoint://current',
                            predicted72: Array.from({ length: 72 }, (_, index) => index / 72),
                            tritoneCoherence: [0.9, 0.5, 0.1]
                        },
                        qComposed: [0.1234, 0.5678, 0.9012, 0.3456]
                    }
                }
            } as never);

        render(<M5RecognitionLayer />);

        const slot = screen.getByTestId('m5-recognition-layer');
        expect(slot.dataset.state).toBe('ready');
        expect(screen.getByTestId('m5-recognition-strength').textContent).toContain('0.812');
        expect(screen.getByTestId('m5-recognition-anchor').textContent).toContain('M3-2-64-17');
        expect(screen.getByTestId('m5-recognition-square').textContent).toContain('A:(0,5)');
        expect(screen.getByTestId('m5-recognition-return').textContent).toContain(
            'Möbius return ready'
        );
        expect(slot.textContent).not.toContain('0.1234');
        expect(slot.textContent).not.toContain('0.5678');
    });
});
