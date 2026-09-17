/**
 * Coordinate: M' (command registry behavioral tests -- rerun 31.T31.11)
 * Residency: Body/M/pratibimba-app/src/commands
 * Position (#n): #4 -- Context/Type
 * Actualises: real registry execution, surface-policy validation, and palette
 *   isolation without mocked command behavior.
 * Public surface: command registry behavior.
 * Does NOT own: renderer integration or gateway behavior.
 * Contract: [[CHROME-CONTRACT]] section 10.
 */

import { describe, expect, it } from 'vitest';
import { commands } from './registry';

describe('command registry', () => {
    it('registers, executes with an argument, and disposes', async () => {
        let received: unknown = undefined;
        const dispose = commands.register({
            id: 'test.cmd',
            title: 'Test',
            run: argument => {
                received = argument;
            }
        });
        await commands.execute('test.cmd', 'arg-1');
        expect(received).toBe('arg-1');
        dispose();
        await expect(commands.execute('test.cmd')).rejects.toThrow('unknown command');
    });

    it('respects enablement — disabled commands are inert, not errors', async () => {
        let calls = 0;
        const dispose = commands.register({
            id: 'test.gated',
            title: 'Gated',
            run: () => {
                calls += 1;
            },
            enabled: () => false
        });
        await commands.execute('test.gated');
        expect(calls).toBe(0);
        expect(commands.isEnabled('test.gated')).toBe(false);
        dispose();
    });

    it('enforces subject ownership and keeps bound actions out of the global palette', () => {
        expect(() =>
            commands.register({
                id: 'test.invalid-toolbar',
                title: 'Invalid toolbar action',
                run: () => undefined,
                actionSurface: { surface: 'toolbar', subject: 'selection' }
            })
        ).toThrow('toolbar actions require active-widget scope');

        const dispose = commands.register({
            id: 'test.selection-action',
            title: 'Selection-only action',
            run: () => undefined,
            actionSurface: { surface: 'context-menu', subject: 'selection' }
        });
        expect(commands.listPalette().some(command => command.id === 'test.selection-action')).toBe(false);
        dispose();
    });
});
