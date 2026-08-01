/**
 * Coordinate: M' M4' (oracle history viewer tests — rerun 25.T25.9)
 * Actualises: the brief's verification line against the REAL wire shapes —
 *   the text `nara.oracle.history` and `nara.oracle.hygiene` actually emit
 *   through `cli_to_rpc`, not an invented JSON envelope. Mixed-modality
 *   fixture (1 I-Ching, 2 tarot); reverse-chronological order PRESERVED from
 *   the producer; decay-window expiry across the 4h boundary; the honest
 *   `unknown` on every row the wire does not timestamp; and the privacy
 *   assertion that no interpretation body reaches a row.
 * Does NOT own: the ledger (epi-cli), the cast (S3), the host pane.
 */

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setGateway } from '../bridge/gatewayHolder';
import { resetProfileTicks } from '../composition/profileTickSubscription';
import {
    ORACLE_HISTORY_METHOD,
    ORACLE_HYGIENE_METHOD,
    OracleHistoryPane
} from './OracleHistoryPane';
import {
    ORACLE_DECAY_WINDOW_MINUTES,
    decayStateFor,
    oracleModality,
    parseOracleHistory,
    parseOracleHygiene
} from './oracleHistoryLedger';

afterEach(() => {
    cleanup();
    resetProfileTicks();
    setGateway(null);
});

/** Verbatim `oracle_route::show_history` output shape (newest first). */
const LEDGER = [
    'Oracle History (12 casts)',
    '  #12 [iching] what turns in the fold now? — clear',
    '  #11 [thoth] where is the question living — warning',
    '  #10 [rws] what wants to be seen — clear'
].join('\n');

/** Verbatim `oracle_route::show_hygiene` output shape. */
function hygieneText(minutesAgo: number, castsToday = 3): string {
    return `Oracle Hygiene\n  Casts today: ${castsToday}/6\n  Last cast: ${minutesAgo} minutes ago\n`;
}

function gatewayServing(ledger: string, hygiene: string) {
    const invoke = vi.fn((method: string) => {
        if (method === ORACLE_HISTORY_METHOD) {
            return Promise.resolve({ artifact: { result: ledger } });
        }
        if (method === ORACLE_HYGIENE_METHOD) {
            return Promise.resolve({ artifact: { result: hygiene } });
        }
        return Promise.reject(new Error(`unexpected method: ${method}`));
    });
    setGateway({ connected: true, invoke } as never);
    return invoke;
}

describe('25.T25.9 — the ledger parse is the wire, not a guess at it', () => {
    it('reads the CLI text shape, preserving the producer’s newest-first order', () => {
        const read = parseOracleHistory({ result: LEDGER });
        expect(read.kind).toBe('ledger');
        if (read.kind !== 'ledger') return;
        expect(read.declaredCount).toBe(12);
        // the CLI serves the LAST TEN, so declaredCount > rows is normal and
        // the viewer must say so rather than under-report the ledger
        expect(read.rows.map(row => row.castId)).toEqual([12, 11, 10]);
        expect(read.rows[0]).toEqual({
            castId: 12,
            system: 'iching',
            modality: 'i-ching',
            questionPrefix: 'what turns in the fold now?',
            hygiene: 'clear'
        });
        expect(read.rows.map(row => row.modality)).toEqual(['i-ching', 'tarot', 'tarot']);
        expect(read.rows[1].hygiene).toBe('warning');
    });

    it('an empty ledger is EMPTY, never a refusal and never a fabricated row', () => {
        expect(parseOracleHistory({ result: 'No oracle history.' }).kind).toBe('empty');
    });

    it('a reply in any other shape REFUSES — a viewer that guessed would invent casts', () => {
        expect(parseOracleHistory({ result: 'something else entirely' }).kind).toBe('refused');
        expect(parseOracleHistory({ result: 'Oracle History (2 casts)\n  garbled row' }).kind).toBe(
            'refused'
        );
        expect(parseOracleHistory(null).kind).toBe('refused');
        expect(parseOracleHistory({ castCount: 3 }).kind).toBe('refused');
    });

    it('reads the hygiene counters the CLI really prints', () => {
        expect(parseOracleHygiene({ result: hygieneText(37, 4) })).toEqual({
            castsToday: 4,
            dailyLimit: 6,
            lastCastMinutesAgo: 37
        });
        // no cast yet → no minutes-ago line
        expect(parseOracleHygiene({ result: 'Oracle Hygiene\n  Casts today: 0/6\n' })).toEqual({
            castsToday: 0,
            dailyLimit: 6,
            lastCastMinutesAgo: null
        });
    });

    it('the 4h decay window resolves for the newest row and NOTHING else', () => {
        const fresh = parseOracleHygiene({ result: hygieneText(10) });
        const stale = parseOracleHygiene({ result: hygieneText(ORACLE_DECAY_WINDOW_MINUTES) });
        expect(decayStateFor(0, fresh)).toBe('open');
        expect(decayStateFor(0, stale)).toBe('closed');
        expect(decayStateFor(0, parseOracleHygiene({ result: hygieneText(239) }))).toBe('open');
        // older rows carry no timestamp on this wire — `unknown`, never an
        // assumed `closed` that happens to be right most of the time
        expect(decayStateFor(1, fresh)).toBe('unknown');
        expect(decayStateFor(2, stale)).toBe('unknown');
        // and with no cast at all, even the newest is unknown
        expect(decayStateFor(0, { castsToday: 0, dailyLimit: 6, lastCastMinutesAgo: null })).toBe(
            'unknown'
        );
    });

    it('modality follows the system token the CLI recorded', () => {
        expect(oracleModality('iching')).toBe('i-ching');
        for (const deck of ['rws', 'thoth', 'marseille', 'ql']) {
            expect(oracleModality(deck)).toBe('tarot');
        }
    });
});

describe('25.T25.9 — the viewer renders the ledger and discloses what it cannot know', () => {
    beforeEach(() => {
        gatewayServing(LEDGER, hygieneText(30));
    });

    it('lists a mixed-modality ledger reverse-chronologically with per-row hygiene', async () => {
        render(<OracleHistoryPane />);
        await waitFor(() => expect(screen.getByTestId('oracle-history-rows')).toBeTruthy());
        const ids = [...screen.getByTestId('oracle-history-rows').children].map(node =>
            node.getAttribute('data-testid')
        );
        expect(ids).toEqual([
            'oracle-history-row-12',
            'oracle-history-row-11',
            'oracle-history-row-10'
        ]);
        expect(screen.getByTestId('oracle-history-row-12').getAttribute('data-modality')).toBe(
            'i-ching'
        );
        expect(screen.getByTestId('oracle-history-row-11').getAttribute('data-modality')).toBe('tarot');
        expect(screen.getByTestId('oracle-history-hygiene-11').textContent).toBe('warning');
        expect(screen.getByTestId('oracle-history-hygiene').textContent).toContain('3/6 casts today');
        expect(screen.getByTestId('oracle-history-hygiene').textContent).toContain('last cast 30 min ago');
        // the ledger declares 12 but serves 10 — the viewer says so
        expect(screen.getByTestId('oracle-history-hygiene').textContent).toContain('of 12');
    });

    it('paints decay only where the wire timestamps it, and names both missing wires', async () => {
        render(<OracleHistoryPane />);
        await waitFor(() => expect(screen.getByTestId('oracle-history-rows')).toBeTruthy());
        expect(screen.getByTestId('oracle-history-decay-12').textContent).toBe('decay open');
        expect(screen.getByTestId('oracle-history-decay-11').textContent).toBe('decay unknown');
        expect(screen.getByTestId('oracle-history-decay-10').textContent).toBe('decay unknown');
        const seam = screen.getByTestId('oracle-history-seam').textContent ?? '';
        expect(seam).toContain('nara.oracle.history');
        expect(seam).toContain('nara.oracle.update_position_state');
        // and no aliveness badge is invented in its absence
        expect(screen.queryByTestId('oracle-history-aliveness-12')).toBeNull();
    });

    it('crosses the 4h boundary: the newest row closes once the window has passed', async () => {
        gatewayServing(LEDGER, hygieneText(ORACLE_DECAY_WINDOW_MINUTES + 5));
        render(<OracleHistoryPane />);
        await waitFor(() => expect(screen.getByTestId('oracle-history-rows')).toBeTruthy());
        expect(screen.getByTestId('oracle-history-decay-12').textContent).toBe('decay closed');
    });

    it('privacy: a row carries the question and hygiene only — never an interpretation body', async () => {
        const withReading = [
            'Oracle History (1 casts)',
            '  #1 [rws] what wants to be seen — clear'
        ].join('\n');
        gatewayServing(withReading, hygieneText(5, 1));
        const { container } = render(<OracleHistoryPane />);
        await waitFor(() => expect(screen.getByTestId('oracle-history-row-1')).toBeTruthy());
        // the reading itself lives in the day artifact, which is where the
        // deposit put it — the row is a handle to a cast, not the cast
        const text = container.textContent ?? '';
        expect(text).not.toContain('Tarot Draw');
        expect(text).not.toContain('reversed');
        expect(screen.getByTestId('oracle-history').className).toContain(
            'mext-privacy-protected-local-handle-only'
        );
    });

    it('an empty ledger says so instead of showing an empty frame', async () => {
        gatewayServing('No oracle history.', 'Oracle Hygiene\n  Casts today: 0/6\n');
        render(<OracleHistoryPane />);
        await waitFor(() => expect(screen.getByTestId('oracle-history-empty')).toBeTruthy());
        expect(screen.queryByTestId('oracle-history-rows')).toBeNull();
    });

    it('a dark ledger names the method that did not answer', async () => {
        setGateway({
            connected: true,
            invoke: vi.fn(() => Promise.reject(new Error('gateway: unimplemented')))
        } as never);
        render(<OracleHistoryPane />);
        await waitFor(() => expect(screen.getByTestId('oracle-history-dark')).toBeTruthy());
        expect(screen.getByTestId('oracle-history-dark').textContent).toContain(
            ORACLE_HISTORY_METHOD
        );
        expect(screen.queryByTestId('oracle-history-rows')).toBeNull();
    });

    it('a mis-shaped ledger reply refuses, and lists nothing', async () => {
        gatewayServing('unexpected banner', hygieneText(5));
        render(<OracleHistoryPane />);
        await waitFor(() => expect(screen.getByTestId('oracle-history-refused')).toBeTruthy());
        expect(screen.queryByTestId('oracle-history-rows')).toBeNull();
    });
});
