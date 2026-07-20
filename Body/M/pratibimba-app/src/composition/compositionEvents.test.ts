import { beforeEach, describe, expect, it } from 'vitest';
import { useEventsStore } from '../state/eventsStore';
import {
    COMPOSITION_EVENT_TYPES,
    compositionEventsFromEntries,
    emitCompositionEvent
} from './compositionEvents';

describe('composition event vocabulary', () => {
    beforeEach(() => useEventsStore.setState({ events: [] }));

    it('emits and recovers every declared event through the one observability ring', () => {
        COMPOSITION_EVENT_TYPES.forEach((type, index) => {
            emitCompositionEvent({
                type,
                compositionId: index % 2 === 0
                    ? 'cosmic-engine.integrated'
                    : 'jiva-siva.integrated',
                timestamp: new Date(1_700_000_000_000 + index).toISOString(),
                profileGeneration: index,
                payload: Object.freeze({ index })
            });
        });

        const events = compositionEventsFromEntries(useEventsStore.getState().events);
        expect(events.map(event => event.type)).toEqual(COMPOSITION_EVENT_TYPES);
        expect(events.map(event => event.profileGeneration)).toEqual(
            COMPOSITION_EVENT_TYPES.map((_, index) => index)
        );
    });

    it('ignores malformed and unrelated event-ring entries', () => {
        useEventsStore.setState({
            events: [{
                seq: 1,
                emittedAtMs: 1,
                kind: 'observability',
                channel: 'composition.mount',
                payload: { compositionId: 'unknown' }
            }, {
                seq: 2,
                emittedAtMs: 2,
                kind: 'observability',
                channel: 'chat',
                payload: {}
            }]
        });
        expect(compositionEventsFromEntries(useEventsStore.getState().events)).toEqual([]);
    });
});
