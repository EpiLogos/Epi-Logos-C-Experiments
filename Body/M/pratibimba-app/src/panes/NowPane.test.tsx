import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NowPane } from './NowPane';
import { commands } from '../commands/registry';
import { useSessionStore, useTickStore } from '../state/stores';

vi.mock('../bridge/tauri', () => ({
    invokeCommand: vi.fn(async (command: string) => {
        if (command === 'vault_read') {
            return { path: 'Empty/Present/02-07-2026/daily-note.md', content: '# day', readOnly: false };
        }
        if (command === 'vault_list') {
            return [
                { name: 'daily-note.md', path: 'Empty/Present/02-07-2026/daily-note.md', isDir: false },
                { name: 'oracle-120000-rws.md', path: 'Empty/Present/02-07-2026/oracle-120000-rws.md', isDir: false }
            ];
        }
        throw new Error(`unexpected ${command}`);
    }),
    listenEvent: vi.fn(async () => () => undefined)
}));

describe('NowPane', () => {
    beforeEach(() => {
        useSessionStore.setState({ sessionKey: null, dayNow: null, privacyClass: null });
        useTickStore.setState({ generation: null, profile: null } as never);
    });
    afterEach(cleanup);

    it('offers begin-today when no day is anchored and routes through the command system', () => {
        const run = vi.fn();
        const dispose = commands.register({ id: 'journal.beginToday', title: 'begin', run });
        render(<NowPane />);
        fireEvent.click(screen.getByTestId('now-begin-today'));
        expect(run).toHaveBeenCalled();
        dispose();
    });

    it('an anchored day IS the daily-note editor', async () => {
        useSessionStore.setState({ dayNow: '02-07-2026' });
        render(<NowPane />);
        const pane = await screen.findByTestId('now-pane');
        expect(pane.dataset.day).toBe('02-07-2026');
        expect(await screen.findByTestId('editor-Empty/Present/02-07-2026/daily-note.md')).toBeTruthy();
    });

    it('the anchored day carries the §6.5 day-resonance strip with the pending-resonance fallback (05.T5.1)', async () => {
        useSessionStore.setState({ dayNow: '02-07-2026' });
        render(<NowPane />);

        // no kernel profile → the at-now indicator is the pending fallback
        const now = screen.getByTestId('nara-resonance-now');
        expect(now.textContent).toBe('pending-resonance');
        expect(now.dataset.state).toBe('pending-resonance');

        // one unstamped artifact envelope (daily-note excluded) → day summary pending
        const counts = await screen.findByTestId('nara-day-resonance-counts');
        expect(counts.textContent).toContain('pending 1');
        expect(screen.getByTestId('nara-day-resonance').dataset.state).toBe('pending-resonance');
    });

    it('the day strip resolves the at-now indicator from the kernel personal pole (05.T5.1)', async () => {
        useSessionStore.setState({ dayNow: '02-07-2026' });
        useTickStore.setState({
            generation: 5,
            profile: {
                generation: 5,
                cachedAtMs: 0,
                stale: false,
                stalenessMs: 0,
                privacyClass: 'safe-public-current-kernel-tick',
                profile: {
                    harmonicProfile: {
                        personalPole: {
                            resonance: { score: 0.812, conjugateFormCharacter: 'Major' }
                        }
                    }
                }
            } as never
        } as never);
        render(<NowPane />);
        const now = await screen.findByTestId('nara-resonance-now');
        expect(now.textContent).toBe('0.812 Major');
        expect(now.dataset.state).toBe('resolved');
    });
});
