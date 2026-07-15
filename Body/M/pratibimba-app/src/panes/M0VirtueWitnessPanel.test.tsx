/**
 * Coordinate: M' M0' (Virtue Witness behavioral tests, rerun 21.T21.10)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): M0-0' verifier witness component gate
 * Actualises: LSB-first unpacking, canonical label order, coherence bands,
 *   question routing, profile-tick updates, and honest projection absence.
 * Public surface: Vitest suite for M0VirtueWitnessPanel.
 * Does NOT own: witness computation or gateway transport.
 * Contract: [[M0'-SPEC]] + rerun [[21-m0-anuttara-frontend-deep]] 21.10.
 */

import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { KernelBridgeCachedProfile } from '../bridge/types';
import { useTickStore } from '../state/stores';
import { M0VirtueWitnessPanel } from './M0VirtueWitnessPanel';

function profile(
    generation: number,
    virtueWitnessVector: number,
    coherenceScore: number,
    openQuestions: readonly string[]
): KernelBridgeCachedProfile {
    return {
        generation,
        cachedAtMs: generation * 1000,
        stale: false,
        stalenessMs: 0,
        privacyClass: 'public-current-context',
        profile: {
            harmonicProfile: {
                anuttaraWitness: {
                    virtueWitnessVector,
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
                    openQuestions,
                    coherenceScore
                }
            }
        }
    };
}

afterEach(() => {
    cleanup();
    useTickStore.setState({ profile: null, generation: null });
});

describe('M0VirtueWitnessPanel', () => {
    it('unpacks the real 9-bit wire vector LSB-first and bands coherence (21.T21.10)', () => {
        const onQuestionSelect = vi.fn();
        useTickStore.setState({
            profile: profile(7, 0b110_110_111, 0.72, ['Law-6:R2@Shakti:turn?']),
            generation: 7
        });

        render(<M0VirtueWitnessPanel onQuestionSelect={onQuestionSelect} />);

        const cells = screen.getAllByTestId('m0-virtue-witness-cell');
        expect(cells).toHaveLength(9);
        expect(cells.map(cell => cell.getAttribute('data-witnessed'))).toEqual([
            'true',
            'true',
            'true',
            'false',
            'true',
            'true',
            'false',
            'true',
            'true'
        ]);
        expect(cells.map(cell => cell.textContent)).toEqual([
            'Love/Peace',
            'Truth',
            'Openness/Creativity',
            'Joy/Play',
            'Goodness',
            'Beauty',
            'Life/Nature',
            'Wisdom',
            'Reality'
        ]);
        expect(screen.getByTestId('m0-virtue-witness-grid').getAttribute('data-filled')).toBe('7');
        expect(screen.getByTestId('m0-virtue-coherence').getAttribute('data-band')).toBe('amber');
        expect(screen.getByTestId('m0-virtue-coherence').textContent).toContain('0.72');

        screen.getByRole('button', { name: 'Law-6:R2@Shakti:turn?' }).click();
        expect(onQuestionSelect).toHaveBeenCalledWith('Law-6:R2@Shakti:turn?');
    });

    it('follows profile-generation advances and reports honest absence', () => {
        const { rerender } = render(<M0VirtueWitnessPanel />);
        expect(screen.getByTestId('m0-virtue-witness-pending').textContent).toContain(
            'not emitted'
        );

        act(() => {
            useTickStore.getState().setProfile(profile(8, 0b1, 0.9, []));
        });
        rerender(<M0VirtueWitnessPanel />);

        expect(screen.getByTestId('m0-virtue-witness-panel').getAttribute('data-generation')).toBe(
            '8'
        );
        expect(screen.getByTestId('m0-virtue-coherence').getAttribute('data-band')).toBe('green');
        expect(screen.getByTestId('m0-virtue-witness-grid').getAttribute('data-filled')).toBe('1');
    });
});
