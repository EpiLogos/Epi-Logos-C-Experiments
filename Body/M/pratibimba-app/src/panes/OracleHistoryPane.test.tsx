import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setGateway } from '../bridge/gatewayHolder';
import { resetProfileTicks } from '../composition/profileTickSubscription';
import { OracleHistoryPane, ORACLE_HISTORY_METHOD } from './OracleHistoryPane';
import {
    ORACLE_DECAY_WINDOW_MINUTES,
    decayStateAt,
    parseOracleHistoryProjection
} from './oracleHistoryLedger';

const gatewayInvoke = vi.fn();
const NOW = 1_700_000_000;

function ichingDraw() {
    const values = [6, 7, 8, 9, 7, 8];
    return {
        lines: values.map((value, index) => ({
            lineIndex: index + 1,
            value,
            lineType: ['old-yin', 'young-yang', 'young-yin', 'old-yang', 'young-yang', 'young-yin'][index],
            moving: value === 6 || value === 9,
            nucleotide: ['A', 'C', 'G', 'T', 'C', 'G'][index],
            codonRef: `m3-codon://ACG#line-${index + 1}`
        })),
        primaryHexagramId: 12,
        relatingHexagramId: 18,
        nuclearHexagramId: 4,
        torusPosition: 2,
        body: null
    };
}

function tarotDraw() {
    return {
        spreadSize: 3,
        cards: Array.from({ length: 3 }, (_, positionIndex) => ({
            positionIndex,
            cardId: positionIndex,
            reversed: false,
            cardKind: 'tarot-major',
            label: 'The Fool',
            codonRef: 'm3-codon://ATG',
            codonBinding: 'primary',
            suit: null,
            rank: null,
            decan: null,
            planet: null,
            element: null,
            chakra: null,
            bodyZones: [],
            chainSource: 'kernel-oracle-luts'
        }))
    };
}

function row(castId: number, system: 'iching' | 'thoth', castAt: number) {
    const count = system === 'iching' ? 6 : 3;
    return {
        castId,
        spreadId: `oracle-spread-${castId}`,
        system,
        questionPrefix: castId === 2 ? 'what is changing?' : 'what needs attention?',
        castAt,
        hygiene: castId === 2 ? 'clear' : 'warning',
        draw: system === 'iching' ? ichingDraw() : tarotDraw(),
        positions: Array.from({ length: count }, (_, positionIndex) => ({
            positionIndex,
            cardId: system === 'iching' ? 11 : positionIndex,
            cardKind: system === 'iching' ? 'hexagram' : 'tarot-major',
            liveState: positionIndex === 0 ? 'muting' : 'generating',
            targetAspect: null
        }))
    };
}

function ledger() {
    return {
        totalCount: 2,
        generatedAt: NOW,
        entries: [row(2, 'iching', NOW - 5 * 60), row(1, 'thoth', NOW - 90 * 60)]
    };
}

function gatewayServing(value = ledger()) {
    gatewayInvoke.mockResolvedValue({ artifact: value });
    setGateway({ connected: true, invoke: gatewayInvoke } as never);
}

describe('structured oracle history law', () => {
    beforeEach(() => {
        gatewayInvoke.mockReset();
        gatewayServing();
        resetProfileTicks();
    });
    afterEach(() => {
        cleanup();
        setGateway(null);
    });

    it('strict-reads newest-first timestamps, modalities, and aliveness', () => {
        const read = parseOracleHistoryProjection(ledger());
        expect(read.kind).toBe('ledger');
        if (read.kind !== 'ledger') return;
        expect(read.entries.map(entry => entry.castId)).toEqual([2, 1]);
        expect(read.entries.map(entry => entry.modality)).toEqual(['i-ching', 'tarot']);
        expect(read.entries[0].positions[0].liveState).toBe('muting');
    });

    it('refuses producer order drift and malformed rows', () => {
        const reversed = ledger();
        reversed.entries.reverse();
        expect(parseOracleHistoryProjection(reversed).kind).toBe('refused');
        expect(parseOracleHistoryProjection({ totalCount: 1, generatedAt: NOW, entries: [] }).kind).toBe('refused');
        expect(parseOracleHistoryProjection(null).kind).toBe('refused');
    });

    it('maps open, active decay, and closed against the server timestamp', () => {
        expect(decayStateAt(NOW - 5 * 60, NOW)).toBe('open');
        expect(decayStateAt(NOW - 90 * 60, NOW)).toBe('decay-active');
        expect(decayStateAt(NOW - ORACLE_DECAY_WINDOW_MINUTES * 60, NOW)).toBe('closed');
    });

    it('renders timestamp, hygiene, decay, and live state without interpretation prose', async () => {
        const { container } = render(<OracleHistoryPane onOpenCast={vi.fn()} />);
        await waitFor(() => expect(screen.getByTestId('oracle-history-rows')).toBeTruthy());
        expect(gatewayInvoke).toHaveBeenCalledWith(ORACLE_HISTORY_METHOD, { limit: 10 });
        expect(screen.getByTestId('oracle-history-decay-2').textContent).toBe('open');
        expect(screen.getByTestId('oracle-history-decay-1').textContent).toBe('decay-active');
        expect(screen.getByTestId('oracle-history-live-2').textContent).toContain('muting');
        expect(container.querySelector('time')?.getAttribute('datetime')).toBe(new Date((NOW - 5 * 60) * 1000).toISOString());
        expect(container.textContent).not.toContain('Primary hexagram');
        expect(container.textContent).not.toContain('Tarot Draw #');
    });

    it('opens a selected cast in read-only mode', async () => {
        const onOpenCast = vi.fn();
        render(<OracleHistoryPane onOpenCast={onOpenCast} />);
        fireEvent.click(await screen.findByRole('button', { name: 'open cast 2 read only' }));
        expect(onOpenCast).toHaveBeenCalledWith(expect.objectContaining({ castId: 2, spreadId: 'oracle-spread-2' }));
    });

    it('renders real empty and unreachable states distinctly', async () => {
        gatewayServing({ totalCount: 0, generatedAt: NOW, entries: [] });
        const { unmount } = render(<OracleHistoryPane />);
        expect(await screen.findByTestId('oracle-history-empty')).toBeTruthy();
        unmount();
        setGateway(null);
        render(<OracleHistoryPane />);
        expect(screen.getByTestId('oracle-history-dark')).toBeTruthy();
    });
});
