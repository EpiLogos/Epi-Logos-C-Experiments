/**
 * Coordinate: M' `/` membrane (cross-layout intent log tests — Track 27.T27.8)
 * Actualises: the rolling-buffer law as behavior — 33 dispatches leave exactly
 *   32 entries with the oldest dropped and the newest retained, and clear()
 *   empties the buffer.
 */

import { beforeEach, describe, expect, it } from 'vitest';
import type { CrossLayoutIntent } from '../commands/crossLayoutIntent';
import {
    CROSS_LAYOUT_INTENT_LOG_CAPACITY,
    useCrossLayoutIntentLogStore
} from './crossLayoutIntentLog';

function intent(seq: number): CrossLayoutIntent {
    return Object.freeze({
        coordinate: `M0-${seq}`,
        artifactUri: null,
        reviewId: null,
        dayNow: null,
        sessionKey: null,
        profileGeneration: null,
        privacyClass: null,
        requestedExtensionId: 'ide-shell-m0-m5',
        requestedContributionId: `contribution-${seq}`
    });
}

describe('crossLayoutIntentLog store — rolling buffer of the last 32 dispatches', () => {
    beforeEach(() => useCrossLayoutIntentLogStore.setState({ entries: Object.freeze([]) }));

    it('keeps the last 32 and drops the oldest when a 33rd is recorded', () => {
        for (let seq = 0; seq < 33; seq += 1) {
            useCrossLayoutIntentLogStore.getState().record({ at: seq, intent: intent(seq) });
        }
        const entries = useCrossLayoutIntentLogStore.getState().entries;
        expect(entries.length).toBe(CROSS_LAYOUT_INTENT_LOG_CAPACITY);
        // seq 0 was the oldest — it must have been dropped.
        expect(entries[0].intent.requestedContributionId).toBe('contribution-1');
        // the newest (seq 32) survives at the tail.
        expect(entries[entries.length - 1].intent.requestedContributionId).toBe('contribution-32');
    });

    it('preserves insertion order and the outcome field', () => {
        useCrossLayoutIntentLogStore.getState().record({ at: 10, intent: intent(0), outcome: 'ok' });
        useCrossLayoutIntentLogStore.getState().record({ at: 20, intent: intent(1), outcome: 'error' });
        const entries = useCrossLayoutIntentLogStore.getState().entries;
        expect(entries.map(e => e.at)).toEqual([10, 20]);
        expect(entries[0].outcome).toBe('ok');
        expect(entries[1].outcome).toBe('error');
    });

    it('clear() empties the buffer', () => {
        useCrossLayoutIntentLogStore.getState().record({ at: 1, intent: intent(0) });
        useCrossLayoutIntentLogStore.getState().clear();
        expect(useCrossLayoutIntentLogStore.getState().entries.length).toBe(0);
    });
});
