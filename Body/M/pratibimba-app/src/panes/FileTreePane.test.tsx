import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FileTreePane, VaultEntry } from './FileTreePane';
import { commands } from '../commands/registry';

const ROOT: VaultEntry[] = [
    { name: 'Bimba', path: 'Bimba', isDir: true },
    { name: 'Empty', path: 'Empty', isDir: true },
    { name: 'note.md', path: 'note.md', isDir: false }
];
const EMPTY_DIR: VaultEntry[] = [{ name: 'Present', path: 'Empty/Present', isDir: true }];

vi.mock('../bridge/tauri', () => ({
    invokeCommand: vi.fn(async (command: string, args?: Record<string, unknown>) => {
        if (command !== 'vault_list') {
            throw new Error(`unexpected ${command}`);
        }
        return args?.path === 'Empty' ? EMPTY_DIR : ROOT;
    }),
    listenEvent: vi.fn(async () => () => undefined)
}));

describe('FileTreePane', () => {
    afterEach(cleanup);

    it('lists the vault root, expands directories lazily, and opens files via the command system', async () => {
        const opened: unknown[] = [];
        const dispose = commands.register({ id: 'vault.open', title: 'open', run: arg => void opened.push(arg) });
        render(<FileTreePane />);

        const dir = await screen.findByTestId('vault-dir-Empty');
        expect(screen.getByTestId('vault-file-note.md')).toBeTruthy();

        await act(async () => {
            dir.click();
        });
        expect(await screen.findByTestId('vault-dir-Empty/Present')).toBeTruthy();

        await act(async () => {
            screen.getByTestId('vault-file-note.md').click();
        });
        expect(opened).toEqual(['note.md']);
        dispose();
    });
});
