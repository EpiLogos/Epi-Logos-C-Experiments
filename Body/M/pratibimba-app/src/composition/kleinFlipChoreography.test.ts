/**
 * 29.T29.7 — the Klein flip is atomic across the three poles, and now the
 * composition says so.
 *
 * The gap this closes: 29.11 declared `composition.kleinflip.choreography.start`
 * and `.end` in the event vocabulary and NOTHING in the repository emitted
 * either — the declared-and-never-emitted shape this track has been closing.
 * The fold itself was already atomic and already timer-free; what no observer
 * could see was whether it had happened.
 */

import { describe, expect, it, vi } from 'vitest';

import { COMPOSITION_EVENT_TYPES } from './compositionEvents';
import {
    choreographyTransition,
    createKleinFlipChoreographyCarrier,
    KLEIN_FLIP_CHOREOGRAPHY_CARRIER_ID,
    nextChoreographyPhase
} from './kleinFlipChoreography';

/** A frame carrying only what this carrier reads. */
function frame(foldProgress: number, generation = 7) {
    return {
        nowMs: 1_000 + generation,
        oscillator: { generation },
        klein: { valence: foldProgress <= 1 ? -1 : 1, axisFlipped: true, foldProgress }
    } as never;
}

describe('the phase rule is pure and decidable without a clock', () => {
    it('reads foldProgress as folding up to 1 and settled beyond it', () => {
        expect(nextChoreographyPhase(0)).toBe('folding');
        expect(nextChoreographyPhase(0.5)).toBe('folding');
        expect(nextChoreographyPhase(1)).toBe('folding');
        expect(nextChoreographyPhase(1.0001)).toBe('settled');
        // The graph parks a settled frame at 2 when no flip has happened.
        expect(nextChoreographyPhase(2)).toBe('settled');
    });

    it('emits only at the boundaries, never inside a phase', () => {
        expect(choreographyTransition('settled', 'folding')).toBe('start');
        expect(choreographyTransition('folding', 'settled')).toBe('end');
        expect(choreographyTransition('folding', 'folding')).toBeNull();
        expect(choreographyTransition('settled', 'settled')).toBeNull();
    });
});

describe('the carrier reports the fold on the composition bus', () => {
    it('emits start when the fold begins and end when it completes — once each', () => {
        const emit = vi.fn();
        const carrier = createKleinFlipChoreographyCarrier('cosmic-engine.integrated', emit);
        carrier.onFrame(frame(2)); // settled, no event
        expect(emit).not.toHaveBeenCalled();

        carrier.onFrame(frame(0)); // fold begins
        carrier.onFrame(frame(0.4)); // mid-fold, silent
        carrier.onFrame(frame(0.9)); // mid-fold, silent
        expect(emit).toHaveBeenCalledTimes(1);
        expect(emit.mock.calls[0][0].type).toBe('composition.kleinflip.choreography.start');

        carrier.onFrame(frame(1.2)); // settled
        carrier.onFrame(frame(2)); // still settled, silent
        expect(emit).toHaveBeenCalledTimes(2);
        expect(emit.mock.calls[1][0].type).toBe('composition.kleinflip.choreography.end');
    });

    it('emits event types the 29.11 vocabulary actually declares', () => {
        const emit = vi.fn();
        const carrier = createKleinFlipChoreographyCarrier('cosmic-engine.integrated', emit);
        carrier.onFrame(frame(0));
        carrier.onFrame(frame(2));
        for (const call of emit.mock.calls) {
            expect(COMPOSITION_EVENT_TYPES).toContain(call[0].type);
        }
    });

    it('names the three poles the one fold moves', () => {
        // The trace has to show WHAT moved together, not merely that something
        // did — that is the whole claim of a three-pole choreography.
        const emit = vi.fn();
        const carrier = createKleinFlipChoreographyCarrier('cosmic-engine.integrated', emit);
        carrier.onFrame(frame(0));
        expect(emit.mock.calls[0][0].payload.poles).toEqual(['surface', 'texture', 'cell-state']);
        expect(emit.mock.calls[0][0].compositionId).toBe('cosmic-engine.integrated');
        expect(emit.mock.calls[0][0].profileGeneration).toBe(7);
    });

    it('is driven by frames alone — no frame, no event', () => {
        // 15.9: no parallel animation timer competes. The fold honours that,
        // and it would be absurd to honour it in the fold and break it in the
        // reporting. Constructing the carrier and waiting emits nothing.
        vi.useFakeTimers();
        const emit = vi.fn();
        createKleinFlipChoreographyCarrier('cosmic-engine.integrated', emit);
        vi.advanceTimersByTime(5_000);
        expect(emit).not.toHaveBeenCalled();
        vi.useRealTimers();
    });

    it('declares the klein input it reads, and renders nothing', () => {
        const carrier = createKleinFlipChoreographyCarrier('cosmic-engine.integrated', vi.fn());
        expect(carrier.id).toBe(KLEIN_FLIP_CHOREOGRAPHY_CARRIER_ID);
        expect(carrier.requiredInputs).toEqual(['klein']);
        // An observability carrier renders nothing, so it claims neither a
        // surface nor a stratum. Declaring a made-up layer is refused by the
        // composition contract at registration and takes the surface down.
        expect(carrier.surface).toBeUndefined();
        expect(carrier.layer).toBeUndefined();
    });

    it('reports each subsequent fold, not just the first', () => {
        const emit = vi.fn();
        const carrier = createKleinFlipChoreographyCarrier('cosmic-engine.integrated', emit);
        for (const progress of [2, 0, 1.5, 0, 1.5]) carrier.onFrame(frame(progress));
        expect(emit.mock.calls.map(c => c[0].type)).toEqual([
            'composition.kleinflip.choreography.start',
            'composition.kleinflip.choreography.end',
            'composition.kleinflip.choreography.start',
            'composition.kleinflip.choreography.end'
        ]);
    });
});
