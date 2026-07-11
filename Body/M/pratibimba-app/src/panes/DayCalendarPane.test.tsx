import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DayCalendarPane, monthGrid, parseDayId } from './DayCalendarPane';
import { commands } from '../commands/registry';
import { useSessionStore } from '../state/stores';

const FOLDERS = [
    { name: '07-11-2026', path: 'Empty/Present/07-11-2026', isDir: true },
    { name: '06-15-2026', path: 'Empty/Present/06-15-2026', isDir: true },
    { name: 'not-a-day', path: 'Empty/Present/not-a-day', isDir: true },
    { name: 'stray.md', path: 'Empty/Present/stray.md', isDir: false }
];

vi.mock('../bridge/tauri', () => ({
    invokeCommand: vi.fn(async (command: string) => {
        if (command === 'vault_list') {
            return FOLDERS;
        }
        throw new Error(`unexpected ${command}`);
    }),
    listenEvent: vi.fn(async () => () => undefined)
}));

describe('parseDayId', () => {
    it('reads canonical month-first MM-DD-YYYY', () => {
        expect(parseDayId('07-11-2026')).toEqual({ id: '07-11-2026', year: 2026, month: 7, day: 11 });
    });
    it('falls back to legacy day-first when the first field cannot be a month', () => {
        expect(parseDayId('15-06-2026')).toEqual({ id: '15-06-2026', year: 2026, month: 6, day: 15 });
    });
    it('rejects non-day names and impossible dates', () => {
        expect(parseDayId('not-a-day')).toBeNull();
        expect(parseDayId('13-13-2026')).toBeNull();
        expect(parseDayId('00-00-2026')).toBeNull();
    });
});

describe('monthGrid', () => {
    it('lays a month into Sunday-first rows of seven', () => {
        const grid = monthGrid(2026, 7); // July 2026 — the 1st is a Wednesday
        for (const week of grid) {
            expect(week).toHaveLength(7);
        }
        // 31 real day-cells, all others null
        const days = grid.flat().filter(d => d !== null);
        expect(days).toEqual(Array.from({ length: 31 }, (_, i) => i + 1));
        // July 1 2026 is a Wednesday → index 3 in the first row
        expect(grid[0][3]).toBe(1);
        expect(grid[0].slice(0, 3)).toEqual([null, null, null]);
    });
});

describe('DayCalendarPane', () => {
    beforeEach(() => {
        useSessionStore.setState({ sessionKey: null, dayNow: null, privacyClass: null });
    });
    afterEach(cleanup);

    it('opens on the day-now month and marks the day-now cell as the anchor', async () => {
        useSessionStore.setState({ dayNow: '07-11-2026' });
        render(<DayCalendarPane />);
        expect(screen.getByTestId('cal-month').textContent).toBe('July 2026');
        const now = await screen.findByTestId('cal-day-07-11-2026');
        expect(now.getAttribute('data-day-now')).toBe('true');
        expect(now.getAttribute('data-has-folder')).toBe('true');
    });

    it('navigates months locally without touching the day-now thread', async () => {
        useSessionStore.setState({ dayNow: '07-11-2026' });
        render(<DayCalendarPane />);
        await screen.findByTestId('cal-day-07-11-2026');

        fireEvent.click(screen.getByTestId('cal-prev'));
        expect(screen.getByTestId('cal-month').textContent).toBe('June 2026');
        // the June lived day surfaces, and it is NOT the day-now anchor
        const june = await screen.findByTestId('cal-day-06-15-2026');
        expect(june.getAttribute('data-day-now')).toBe('false');
        // navigation never wrote the day-now thread
        expect(useSessionStore.getState().dayNow).toBe('07-11-2026');

        fireEvent.click(screen.getByTestId('cal-next'));
        expect(screen.getByTestId('cal-month').textContent).toBe('July 2026');
    });

    it('opens a lived day through the vault.open command (never owning the day-now)', async () => {
        const run = vi.fn();
        const dispose = commands.register({ id: 'vault.open', title: 'open', run });
        useSessionStore.setState({ dayNow: '07-11-2026' });
        render(<DayCalendarPane />);
        const now = await screen.findByTestId('cal-day-07-11-2026');
        fireEvent.click(now);
        await waitFor(() =>
            expect(run).toHaveBeenCalledWith('Empty/Present/07-11-2026/daily-note.md')
        );
        expect(useSessionStore.getState().dayNow).toBe('07-11-2026');
        dispose();
    });
});
