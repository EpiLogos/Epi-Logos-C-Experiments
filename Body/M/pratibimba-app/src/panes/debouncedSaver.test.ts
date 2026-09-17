import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createDebouncedSaver } from './debouncedSaver';

describe('debounced saver', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('coalesces keystrokes into one save after the delay', async () => {
        const save = vi.fn().mockResolvedValue(undefined);
        const saver = createDebouncedSaver(save, 1500);
        saver.schedule('a');
        saver.schedule('ab');
        saver.schedule('abc');
        expect(save).not.toHaveBeenCalled();
        await vi.advanceTimersByTimeAsync(1500);
        expect(save).toHaveBeenCalledTimes(1);
        expect(save).toHaveBeenCalledWith('abc');
        expect(saver.dirty).toBe(false);
    });

    it('flush writes immediately and failed saves stay dirty', async () => {
        const save = vi.fn().mockRejectedValueOnce(new Error('disk')).mockResolvedValue(undefined);
        const states: string[] = [];
        const saver = createDebouncedSaver(save, 1500, s => states.push(s));
        saver.schedule('x');
        await saver.flush();
        expect(saver.dirty).toBe(true);
        expect(states).toContain('error');
        await saver.flush();
        expect(save).toHaveBeenCalledTimes(2);
        expect(states.at(-1)).toBe('saved');
    });
});
