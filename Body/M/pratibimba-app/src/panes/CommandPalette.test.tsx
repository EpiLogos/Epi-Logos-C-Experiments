/**
 * Coordinate: M' (command palette behavioral tests -- rerun 31.T31.11)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): #4 -- Context/Type
 * Actualises: keyboard command execution and exclusion of selection-bound
 *   actions from the global palette without mocked command behavior.
 * Public surface: CommandPalette behavior.
 * Does NOT own: command policy or action rendering.
 * Contract: [[CHROME-CONTRACT]] section 10.
 */

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { CommandPalette } from './CommandPalette';
import { commands, usePaletteStore } from '../commands/registry';

describe('CommandPalette', () => {
    afterEach(() => {
        cleanup();
        usePaletteStore.setState({ open: false });
    });

    it('filters by query and executes the selection on Enter', async () => {
        let executions = 0;
        const d1 = commands.register({
            id: 'pal.alpha',
            title: 'Alpha action',
            run: () => {
                executions += 1;
            }
        });
        const d2 = commands.register({ id: 'pal.beta', title: 'Beta action', run: () => undefined });

        render(<CommandPalette />);
        usePaletteStore.getState().setOpen(true);
        await screen.findByTestId('command-palette');

        fireEvent.change(screen.getByTestId('palette-input'), { target: { value: 'alpha' } });
        expect(screen.getByTestId('palette-item-pal.alpha')).toBeTruthy();
        expect(screen.queryByTestId('palette-item-pal.beta')).toBeNull();

        fireEvent.keyDown(screen.getByTestId('palette-input'), { key: 'Enter' });
        expect(executions).toBe(1);
        expect(usePaletteStore.getState().open).toBe(false);
        d1();
        d2();
    });

    it('escape closes without executing', async () => {
        let executions = 0;
        const dispose = commands.register({
            id: 'pal.gamma',
            title: 'Gamma',
            run: () => {
                executions += 1;
            }
        });
        render(<CommandPalette />);
        usePaletteStore.getState().setOpen(true);
        await screen.findByTestId('command-palette');
        fireEvent.keyDown(screen.getByTestId('palette-input'), { key: 'Escape' });
        expect(usePaletteStore.getState().open).toBe(false);
        expect(executions).toBe(0);
        dispose();
    });

    it('does not expose selection-bound context actions through the global palette', async () => {
        const dispose = commands.register({
            id: 'pal.selection-only',
            title: 'Selection-only action',
            run: () => undefined,
            actionSurface: { surface: 'context-menu', subject: 'selection' }
        });
        render(<CommandPalette />);
        usePaletteStore.getState().setOpen(true);
        await screen.findByTestId('command-palette');

        expect(screen.queryByTestId('palette-item-pal.selection-only')).toBeNull();
        dispose();
    });
});
