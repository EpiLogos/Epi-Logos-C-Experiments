import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CommandPalette } from './CommandPalette';
import { commands, usePaletteStore } from '../commands/registry';

describe('CommandPalette', () => {
    afterEach(() => {
        cleanup();
        usePaletteStore.setState({ open: false });
    });

    it('filters by query and executes the selection on Enter', async () => {
        const run = vi.fn();
        const d1 = commands.register({ id: 'pal.alpha', title: 'Alpha action', run });
        const d2 = commands.register({ id: 'pal.beta', title: 'Beta action', run: () => undefined });

        render(<CommandPalette />);
        usePaletteStore.getState().setOpen(true);
        await screen.findByTestId('command-palette');

        fireEvent.change(screen.getByTestId('palette-input'), { target: { value: 'alpha' } });
        expect(screen.getByTestId('palette-item-pal.alpha')).toBeTruthy();
        expect(screen.queryByTestId('palette-item-pal.beta')).toBeNull();

        fireEvent.keyDown(screen.getByTestId('palette-input'), { key: 'Enter' });
        expect(run).toHaveBeenCalled();
        expect(usePaletteStore.getState().open).toBe(false);
        d1();
        d2();
    });

    it('escape closes without executing', async () => {
        const run = vi.fn();
        const dispose = commands.register({ id: 'pal.gamma', title: 'Gamma', run });
        render(<CommandPalette />);
        usePaletteStore.getState().setOpen(true);
        await screen.findByTestId('command-palette');
        fireEvent.keyDown(screen.getByTestId('palette-input'), { key: 'Escape' });
        expect(usePaletteStore.getState().open).toBe(false);
        expect(run).not.toHaveBeenCalled();
        dispose();
    });
});
