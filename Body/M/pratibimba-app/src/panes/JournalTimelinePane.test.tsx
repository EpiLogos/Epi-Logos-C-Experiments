/**
 * 25.T25.3 — the journal timeline consumes `nara.journal.timeline` and renders
 * the specced row fields: day chip · NOW timestamp · session-key short prefix ·
 * kind-icon ribbon. The parse is fail-closed (a mis-shaped reply refuses, it
 * never invents inscriptions) and a dark gateway names itself — no silent
 * fallback to a file listing.
 */

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setGateway } from '../bridge/gatewayHolder';
import { commands } from '../commands/registry';
import { JournalTimelinePane } from './JournalTimelinePane';
import {
    journalKindIcon,
    parseJournalTimeline,
    sessionNowVaultPath,
    shortSessionKey
} from './journalTimeline';

const ROWS = [
    {
        day: '08-01-2026',
        nowTimestamp: '2026-08-01T11:00:00+00:00',
        sessionKey: '20260801-110000-bbbbbb',
        artifactKinds: ['now']
    },
    {
        day: '08-01-2026',
        nowTimestamp: '2026-08-01T09:00:00+00:00',
        sessionKey: '20260801-090000-aaaaaa',
        artifactKinds: ['now', 'oracle', 'dream']
    },
    {
        day: '07-31-2026',
        nowTimestamp: '2026-07-31T20:00:00+00:00',
        sessionKey: '20260731-200000-cccccc',
        artifactKinds: ['now', 'unclassified']
    }
];

function gatewayServing(reply: unknown): { invoke: ReturnType<typeof vi.fn> } {
    const invoke = vi.fn().mockResolvedValue({ artifact: reply });
    setGateway({ connected: true, invoke } as never);
    return { invoke };
}

afterEach(() => {
    setGateway(null);
    cleanup();
});

describe('parseJournalTimeline', () => {
    it('reads well-formed rows and PRESERVES the producer order', () => {
        const read = parseJournalTimeline({ rows: ROWS });
        expect(read.kind).toBe('read');
        if (read.kind === 'read') {
            expect(read.rows.map(r => r.sessionKey)).toEqual(ROWS.map(r => r.sessionKey));
        }
    });

    it('refuses a reply with no rows list and a mis-shaped row', () => {
        expect(parseJournalTimeline({ result: 'text' }).kind).toBe('refused');
        expect(parseJournalTimeline(null).kind).toBe('refused');
        expect(
            parseJournalTimeline({ rows: [{ day: '08-01-2026' }] }).kind
        ).toBe('refused');
        // A non-string kind poisons the row rather than being dropped silently.
        expect(
            parseJournalTimeline({
                rows: [{ ...ROWS[0], artifactKinds: ['now', 7] }]
            }).kind
        ).toBe('refused');
    });
});

describe('row helpers', () => {
    it('short prefix is the 8-char discriminating tail', () => {
        expect(shortSessionKey('20260801-090000-aaaaaa')).toBe('0-aaaaaa');
        expect(shortSessionKey('short')).toBe('short');
    });

    it('kind icons cover the day-container register; unknown kinds render as unclassified', () => {
        expect(journalKindIcon('oracle')).not.toBe(journalKindIcon('dream'));
        expect(journalKindIcon('not-a-kind')).toBe(journalKindIcon('unclassified'));
    });

    it('a row click targets the session NOW inscription', () => {
        expect(sessionNowVaultPath(ROWS[1])).toBe(
            'Empty/Present/08-01-2026/20260801-090000-aaaaaa/now.md'
        );
    });
});

describe('JournalTimelinePane', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('renders the specced row fields off the gateway read', async () => {
        const { invoke } = gatewayServing({ rows: ROWS });
        render(<JournalTimelinePane />);
        await waitFor(() =>
            expect(screen.getByTestId('journal-timeline').getAttribute('data-state')).toBe('read')
        );
        expect(invoke).toHaveBeenCalledWith('nara.journal.timeline', { dayRange: 30 });

        const row = screen.getByTestId('journal-row-20260801-090000-aaaaaa');
        expect(row.getAttribute('data-day')).toBe('08-01-2026');
        expect(row.textContent).toContain('2026-08-01T09:00:00');
        expect(row.textContent).toContain('0-aaaaaa');
        expect(
            screen.getByTestId('journal-kinds-20260801-090000-aaaaaa').getAttribute('data-kinds')
        ).toBe('now,oracle,dream');
        // The 30-day bound is declared on the surface itself.
        expect(screen.getByTestId('journal-timeline').getAttribute('data-day-range')).toBe('30');
    });

    it('opens the session NOW via the command registry on click', async () => {
        gatewayServing({ rows: ROWS });
        const execute = vi.spyOn(commands, 'execute').mockResolvedValue(undefined as never);
        render(<JournalTimelinePane />);
        await waitFor(() =>
            expect(screen.getByTestId('journal-timeline').getAttribute('data-state')).toBe('read')
        );
        fireEvent.click(screen.getByTestId('journal-row-20260731-200000-cccccc'));
        expect(execute).toHaveBeenCalledWith(
            'vault.open',
            'Empty/Present/07-31-2026/20260731-200000-cccccc/now.md'
        );
    });

    it('a mis-shaped reply REFUSES visibly instead of painting rows', async () => {
        gatewayServing({ result: 'plain text' });
        render(<JournalTimelinePane />);
        await waitFor(() =>
            expect(screen.getByTestId('journal-timeline').getAttribute('data-state')).toBe('refused')
        );
        expect(screen.getByTestId('journal-timeline-refused').textContent).toContain('refused');
        expect(screen.queryAllByTestId(/^journal-row-/)).toHaveLength(0);
    });

    it('a dark gateway names the method — no silent substrate fallback', async () => {
        setGateway(null);
        render(<JournalTimelinePane />);
        await waitFor(() =>
            expect(screen.getByTestId('journal-timeline').getAttribute('data-state')).toBe('dark')
        );
        expect(screen.getByTestId('journal-timeline-dark').textContent).toContain(
            'nara.journal.timeline'
        );
    });
});
