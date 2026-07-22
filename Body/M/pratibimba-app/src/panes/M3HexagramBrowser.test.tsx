import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { M3HexagramBrowser } from './M3HexagramBrowser';
import { useTickStore } from '../state/stores';
import { KernelBridgeCachedProfile } from '../bridge/types';
import { M3ProfileTickProvider } from './m3SurfaceContext';

// A real-shaped bridge profile carrying the mahamaya window that
// buildM3InspectorsView reads. The bus carries BOTH orderings: `hexagramId` is
// the Fu-Xi address64 (0..63, upper<<3|lower) and `kingWen` is its kernel-LUT
// King Wen ordinal (1..64). The two are a DISTINCT permutation, so the fixture
// passes both independently — the pane must light on `kingWen`, not `hexagramId`.
function profileFixture(
    hexagramId: number,
    kingWen: number,
    generation: number
): KernelBridgeCachedProfile {
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
                kingWen,
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

// Fu-Xi address64 = upper(5)<<3 | lower(2) = 42; per portal-core
// KING_WEN_FROM_ADDRESS64, address 42 → King Wen 64 (a distinct value, so the
// test proves King-Wen keying rather than a coincidental hexagramId === kingWen).
const FUXI_ADDRESS_42 = 42;
const KING_WEN_OF_42 = 64;

function renderBrowser() {
    return render(
        <M3ProfileTickProvider>
            <M3HexagramBrowser />
        </M3ProfileTickProvider>
    );
}

afterEach(() => {
    cleanup();
    useTickStore.setState({ profile: null, generation: null });
});

describe('M3HexagramBrowser', () => {
    it('renders the pending state until the bus carries a mahamaya projection', () => {
        renderBrowser();
        expect(screen.getByTestId('m3-hexagram-browser-pending').textContent).toContain('pending-mahamaya');
    });

    it('renders all 64 cells and lights the KING WEN cell, not the Fu-Xi address64', () => {
        useTickStore.setState({
            profile: profileFixture(FUXI_ADDRESS_42, KING_WEN_OF_42, 7),
            generation: 7
        });
        renderBrowser();

        for (let kw = 1; kw <= 64; kw++) {
            expect(screen.getByTestId(`m3-hexagram-cell-${kw}`)).toBeTruthy();
        }
        // The King Wen cell (64) lights — including cell 64, which the old
        // `kingWen === hexagramId` bug could never light.
        expect(screen.getByTestId(`m3-hexagram-cell-${KING_WEN_OF_42}`).getAttribute('data-active')).toBe('true');
        // The Fu-Xi address64 cell (42) does NOT light — proves King-Wen keying.
        expect(screen.getByTestId(`m3-hexagram-cell-${FUXI_ADDRESS_42}`).getAttribute('data-active')).toBe('false');
        // Exactly one cell is lit.
        expect(
            screen.getAllByTestId(/^m3-hexagram-cell-\d+$/).filter(
                c => c.getAttribute('data-active') === 'true'
            )
        ).toHaveLength(1);
    });

    it('surfaces BOTH orderings — King Wen ordinal and Fu-Xi address64', () => {
        useTickStore.setState({
            profile: profileFixture(FUXI_ADDRESS_42, KING_WEN_OF_42, 7),
            generation: 7
        });
        renderBrowser();

        const browser = screen.getByTestId('m3-hexagram-browser');
        expect(browser.getAttribute('data-active-king-wen')).toBe(String(KING_WEN_OF_42));
        expect(browser.getAttribute('data-active-address64')).toBe(String(FUXI_ADDRESS_42));
        // The active-hexagram header shows both King Wen and Fu-Xi identities.
        const header = screen.getByTestId('m3-hexagram-active').querySelector('h4');
        expect(header?.textContent).toContain(`King Wen ${KING_WEN_OF_42}`);
        expect(header?.textContent).toContain(`Fu-Xi #${FUXI_ADDRESS_42}`);
    });

    it('renders the active glyph 6 lines from the bussed trigrams and keeps non-active glyphs pending', () => {
        useTickStore.setState({
            profile: profileFixture(FUXI_ADDRESS_42, KING_WEN_OF_42, 7),
            generation: 7
        });
        renderBrowser();
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
        useTickStore.setState({
            profile: profileFixture(FUXI_ADDRESS_42, KING_WEN_OF_42, 7),
            generation: 7
        });
        renderBrowser();

        // No changing line → no derived-pending panel yet.
        expect(screen.queryByTestId('m3-hexagram-derived-pending')).toBeNull();

        fireEvent.click(screen.getByTestId('m3-hexagram-line-2'));
        expect(screen.getByTestId('m3-hexagram-line-2').getAttribute('data-changing')).toBe('true');
        expect(screen.getByTestId('m3-hexagram-derived-pending').textContent).toContain('pending-line-change-graph');
    });
});
