/**
 * Coordinate: M' M3' (lens-to-codon transcription engine tests)
 * Residency: Body/M/pratibimba-app/src/components
 * Position (#n): #3 process / transcription.
 * Actualises: behavioral proof for rerun tranche 24.T24.20.
 * Public surface: Vitest assertions over M3TranscriptionEngine.
 * Does NOT own: codon, charge, quaternion, element, RNA, or hop law.
 */

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { parseLensCodonBinaryProjection } from '../bridge/types';
import { M3TranscriptionEngine } from './M3TranscriptionEngine';

const CHARGE_IDENTITY = [
    { charge: 'pp', xPermutation: 'X2', element: 'earth', quaternionComponent: 'w' },
    { charge: 'nn', xPermutation: 'X1', element: 'fire', quaternionComponent: 'x' },
    { charge: 'np', xPermutation: 'X4', element: 'water', quaternionComponent: 'y' },
    { charge: 'pn', xPermutation: 'X3', element: 'air', quaternionComponent: 'z' }
] as const;

function projection() {
    const segment = Array.from({ length: 24 }, (_, section) => section * 15);
    return parseLensCodonBinaryProjection({
        lensId: 7,
        lensRole: 'derived-aperture',
        groundingLensId: 16,
        segment,
        perDegree: segment.map((degree360, index) => {
            const codon6Bit = index;
            const codonPairs = [
                (codon6Bit >> 4) & 3,
                (codon6Bit >> 2) & 3,
                codon6Bit & 3
            ];
            const pairBits = ['00', '01', '10', '11'];
            return {
                degree360,
                exactDegree720: degree360 * 2,
                codonUpper: codonPairs[0],
                codonMiddle: codonPairs[1],
                codonLower: codonPairs[2],
                codonPairs,
                codonPairBits: codonPairs.map(pair => pairBits[pair]),
                codon6Bit,
                codonClass: 0,
                codonClassLabel: 'perfect-palindromic',
                charges: { pp: 24, nn: 0, np: 0, pn: 0 },
                quaternion: [24, 0, 0, 0],
                chargeIdentity: CHARGE_IDENTITY,
                fourX: 24,
                xLogicInvariant: true,
                elementCanonical: 4,
                hexagramId: codon6Bit,
                lineChangeOperator: index % 6,
                lineChangeHops: Array.from({ length: 6 }, (_, line) => ({
                    line,
                    operatorAddress: codon6Bit * 6 + line,
                    fromHexagramId: codon6Bit,
                    toHexagramId: codon6Bit ^ (1 << line)
                })),
                rnaCapable: index === 1,
                tick12: Math.floor(degree360 / 30),
                fibonacciPosition: Math.floor(degree360 / 6),
                fibonacciDigit: 0,
                fibonacciPhase01: (degree360 % 6) / 6
            };
        })
    });
}

afterEach(cleanup);

describe('M3TranscriptionEngine', () => {
    it('renders the authority transcription rows without recomputing their biology', () => {
        render(
            <M3TranscriptionEngine
                activeLensId={7}
                profileTick12={0}
                projection={projection()}
                devModeXLogicLamps
            />
        );

        expect(screen.getAllByTestId(/^m3-transcription-row-\d+$/)).toHaveLength(24);
        expect(screen.getByTestId('m3-transcription-bits-0').textContent).toBe('00 00 00');
        expect(screen.getByTestId('m3-transcription-charges-0').textContent).toContain(
            'pp=24 X2'
        );
        expect(screen.getByTestId('m3-transcription-quaternion-0').textContent).toContain(
            '[24, 0, 0, 0]'
        );
        expect(screen.getByTestId('m3-transcription-class-0').textContent).toContain(
            'perfect-palindromic'
        );
        expect(
            screen.getByTestId('m3-transcription-hops-0').querySelectorAll('[data-line-hop]')
        ).toHaveLength(6);
        expect(screen.getByTestId('m3-transcription-rna-0').textContent).toBe('DNA-only');
        expect(screen.getByTestId('m3-transcription-rna-1').textContent).toBe('RNA-ready');
        expect(screen.getByTestId('m3-transcription-row-0').getAttribute('data-active')).toBe(
            'true'
        );
        expect(
            screen.getByTestId('m3-transcription-x-invariant-0').getAttribute('data-four-x')
        ).toBe('24');
        expect(
            screen
                .getByTestId('m3-transcription-rna-family-pending')
                .querySelector('[data-testid="provenance-pending"]')
                ?.getAttribute('title')
        ).toBe('pending-rna-codon-family');
        expect(
            screen
                .getByTestId('m3-transcription-chromosome-pending')
                .querySelector('[data-testid="provenance-pending"]')
                ?.getAttribute('title')
        ).toBe('pending-chromosome-graph');
    });

    it('moves the active aperture rows only when the profile tick changes', () => {
        const { rerender } = render(
            <M3TranscriptionEngine
                activeLensId={7}
                profileTick12={0}
                projection={projection()}
            />
        );
        expect(screen.getByTestId('m3-transcription-row-0').getAttribute('data-active')).toBe(
            'true'
        );

        rerender(
            <M3TranscriptionEngine
                activeLensId={7}
                profileTick12={1}
                projection={projection()}
            />
        );
        expect(screen.getByTestId('m3-transcription-row-0').getAttribute('data-active')).toBe(
            'false'
        );
        expect(screen.getByTestId('m3-transcription-row-2').getAttribute('data-active')).toBe(
            'true'
        );
    });

    it('renders honest pending state when no projection has arrived', () => {
        render(
            <M3TranscriptionEngine
                activeLensId={16}
                profileTick12={null}
                projection={null}
            />
        );

        expect(
            screen
                .getByTestId('m3-transcription-projection-pending')
                .querySelector('[data-testid="provenance-pending"]')
                ?.getAttribute('title')
        ).toBe('pending-profile-field:lensCodonBinary');
    });

    it('refuses the superseded operator aperture instead of rebuilding it', () => {
        render(
            <M3TranscriptionEngine
                activeLensId={17}
                profileTick12={0}
                projection={null}
            />
        );

        expect(screen.getByTestId('m3-transcription-invalid-lens').textContent).toContain(
            'functional-lens-id-out-of-range:17'
        );
        expect(screen.queryByTestId('m3-transcription-projection-pending')).toBeNull();
    });
});
