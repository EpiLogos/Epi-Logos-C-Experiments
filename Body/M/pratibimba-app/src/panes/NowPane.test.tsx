import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NowPane } from './NowPane';
import { commands } from '../commands/registry';
import { useSessionStore } from '../state/stores';

vi.mock('../bridge/tauri', () => ({
    invokeCommand: vi.fn(async (command: string) => {
        if (command === 'vault_read') {
            return { path: 'Empty/Present/02-07-2026/daily-note.md', content: '# day', readOnly: false };
        }
        throw new Error(`unexpected ${command}`);
    }),
    listenEvent: vi.fn(async () => () => undefined)
}));

describe('NowPane', () => {
    beforeEach(() => {
        useSessionStore.setState({ sessionKey: null, dayNow: null, privacyClass: null });
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
});
