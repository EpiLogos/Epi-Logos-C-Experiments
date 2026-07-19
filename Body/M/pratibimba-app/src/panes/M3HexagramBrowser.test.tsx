import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { M3HexagramBrowser } from './M3HexagramBrowser';
import { useTickStore } from '../state/stores';
import { KernelBridgeCachedProfile } from '../bridge/types';

// A real-shaped bridge profile carrying the mahamaya window that
// buildM3InspectorsView reads: hexagramId (King Wen), upper/lower trigrams,
// nucleotide bits, dna/rna phase, line index + line-change operator.
function profileFixture(hexagramId: number, generation: number): KernelBridgeCachedProfile {
    return {
        generation,
        cachedAtMs: 0,
        stale: false,
        stalenessMs: 0,
        privacyClass: 'public-current-context',
        profile: {
            tick12: 3,
            degree360: 90,
            degree720: 90,
            mahamaya: {
                codonId: 21,
                codon: 'CAG',
                hexagramId,
                upperTrigram: 5,
                lowerTrigram: 2,
                nucleotideBits: [1, 0, 1],
                dnaRnaPhase: 'dna',
                lineIndex: 2,
                lineChangeOperatorAddress: 42,
                roundTripLoss: false,
                datasetLutState: 'ok'
            }
        }
    } as unknown as KernelBridgeCachedProfile;
}

afterEach(() => {
    cleanup();
    useTickStore.setState({ profile: null, generation: null });
});

describe('M3HexagramBrowser', () => {
    it('renders the pending state until the bus carries a mahamaya projection', () => {
        render(<M3HexagramBrowser />);
        expect(screen.getByTestId('m3-hexagram-browser-pending').textContent).toContain('pending-mahamaya');
    });

    it('renders all 64 King Wen cells and lights the active hexagramId', () => {
        useTickStore.setState({ profile: profileFixture(11, 7), generation: 7 });
        render(<M3HexagramBrowser />);

        for (let kw = 1; kw <= 64; kw++) {
            expect(screen.getByTestId(`m3-hexagram-cell-${kw}`)).toBeTruthy();
        }
        expect(screen.getByTestId('m3-hexagram-cell-11').getAttribute('data-active')).toBe('true');
        expect(screen.getByTestId('m3-hexagram-cell-12').getAttribute('data-active')).toBe('false');
        expect(screen.getByTestId('m3-hexagram-browser').getAttribute('data-active-hexagram')).toBe('11');
    });

    it('renders the active glyph 6 lines from the bussed trigrams and keeps non-active glyphs pending', () => {
        useTickStore.setState({ profile: profileFixture(11, 7), generation: 7 });
        render(<M3HexagramBrowser />);
        for (let i = 0; i < 6; i++) {
            expect(screen.getByTestId(`m3-hexagram-line-${i}`)).toBeTruthy();
        }
        // lowerTrigram=2 (010) → lines 0,1,2 = broken,solid,broken (bottom-up)
        expect(screen.getByTestId('m3-hexagram-line-0').getAttribute('data-solid')).toBe('false');
        expect(screen.getByTestId('m3-hexagram-line-1').getAttribute('data-solid')).toBe('true');
        // upperTrigram=5 (101) → lines 3,4,5 = solid,broken,solid
        expect(screen.getByTestId('m3-hexagram-line-3').getAttribute('data-solid')).toBe('true');
        expect(screen.getByTestId('m3-hexagram-slots-pending').textContent).toContain('pending-king-wen-line-pattern');
    });

    it('toggles a changing line and renders the derived-hexagram resolution as honest-pending', () => {
        useTickStore.setState({ profile: profileFixture(11, 7), generation: 7 });
        render(<M3HexagramBrowser />);

        // No changing line → no derived-pending panel yet.
        expect(screen.queryByTestId('m3-hexagram-derived-pending')).toBeNull();

        fireEvent.click(screen.getByTestId('m3-hexagram-line-2'));
        expect(screen.getByTestId('m3-hexagram-line-2').getAttribute('data-changing')).toBe('true');
        expect(screen.getByTestId('m3-hexagram-derived-pending').textContent).toContain('pending-line-change-graph');
    });
});
