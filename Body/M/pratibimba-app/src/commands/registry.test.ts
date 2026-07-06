import { describe, expect, it, vi } from 'vitest';
import { commands } from './registry';

describe('command registry', () => {
    it('registers, executes with an argument, and disposes', async () => {
        const run = vi.fn();
        const dispose = commands.register({ id: 'test.cmd', title: 'Test', run });
        await commands.execute('test.cmd', 'arg-1');
        expect(run).toHaveBeenCalledWith('arg-1');
        dispose();
        await expect(commands.execute('test.cmd')).rejects.toThrow('unknown command');
    });

    it('respects enablement — disabled commands are inert, not errors', async () => {
        const run = vi.fn();
        const dispose = commands.register({ id: 'test.gated', title: 'Gated', run, enabled: () => false });
        await commands.execute('test.gated');
        expect(run).not.toHaveBeenCalled();
        expect(commands.isEnabled('test.gated')).toBe(false);
        dispose();
    });
});
