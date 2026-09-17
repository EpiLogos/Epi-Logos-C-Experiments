/**
 * 29.T29.9 — the composition's own read of the latest persisted close.
 *
 * The wiring only: which method the composition asks for, that a real close
 * turns into a ready directive, and that `composition.contemplation.complete`
 * fires ONCE per session rather than on every re-render. The gateway is faked
 * here because a jsdom mount has no socket — so the response SHAPE is proven
 * where it can be proven for real, against a spawned gateway, in
 * `bridge/gatewayClient.live.test.ts` ("composes the 4'-5'-0' contemplation
 * triplet over the real wire"). Asserting a payload against `vi.fn()` would
 * only prove the caller talked to the mock.
 */

import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { invoke } = vi.hoisted(() => ({ invoke: vi.fn() }));
vi.mock('../bridge/gatewayHolder', () => ({
    gateway: () => ({ invoke }),
    gatewayReady: () => true
}));

import { useContemplationFlowDirective } from './contemplationFlowDirector';
import { compositionEventsFromEntries } from '../composition/compositionEvents';
import { useEventsStore, type GatewayEventEntry } from '../state/eventsStore';
import { useProvenanceStore, useSessionStore } from '../state/stores';

/** The persisted projection `nara.session_close.contemplation.read` returns. */
const projection = {
    session_id: 'sess-29-t29-9',
    close_ref: 'close-1',
    contemplation_ref: 'contemplation-1',
    triplet: {
        llm: {
            position: "4'",
            loaded_agent_count: 4,
            psyche_anchor_coherent: true,
            matched_anchor_codon_count: 2,
            anchor_cards: [
                { card: 'The Fool', codon: 'I', matched: true },
                { card: 'The Hierophant', codon: 'V', matched: true }
            ]
        },
        ebm: {
            position: "5'",
            gradient_magnitude: 0.041231,
            gauge_trio_coherent: true,
            coherence_scores: { square_0_5: 0.91, square_1_4: 0.74, square_2_3: 0.66 }
        },
        verifier: {
            position: "0'",
            virtue_witness_vector: [true, true, true, true, true, false, true, false, true],
            coherence_score: 0.82,
            arch9_wholeness: true,
            syntax_layers_witnessed: true
        }
    },
    provenance: {
        privacy_class: 'protected_local',
        source_method: 'nara.session_close',
        persisted_at: '2026-07-28T21:00:00Z',
        persisted_at_ms: 1_785_272_400_000,
        pasu_scoped: true
    }
};

function contemplationEvents() {
    return compositionEventsFromEntries(useEventsStore.getState().events as GatewayEventEntry[]).filter(
        event => event.type === 'composition.contemplation.complete'
    );
}

describe('useContemplationFlowDirective', () => {
    beforeEach(() => {
        useEventsStore.setState({ events: [] });
        useSessionStore.setState({ sessionKey: 'sess-29-t29-9' });
        useProvenanceStore.setState({ connection: { connected: true, reason: 'test' } } as never);
        invoke.mockReset();
    });

    afterEach(() => {
        cleanup();
    });

    it('asks the close-read method for the active session, not the live compose method', async () => {
        invoke.mockResolvedValue({ artifact: projection });
        renderHook(() => useContemplationFlowDirective('jiva-siva.integrated', 31));

        await waitFor(() => expect(invoke).toHaveBeenCalledTimes(1));
        expect(invoke).toHaveBeenCalledWith('nara.session_close.contemplation.read', {
            session_id: 'sess-29-t29-9',
            latest: true
        });
    });

    it('turns a persisted close into a ready directive across all three slots', async () => {
        invoke.mockResolvedValue({ artifact: projection });
        const { result } = renderHook(() => useContemplationFlowDirective('jiva-siva.integrated', 31));

        await waitFor(() => expect(result.current.state).toBe('ready'));
        expect(result.current.source).toBe('persisted');
        expect(result.current.sessionId).toBe('sess-29-t29-9');
        expect(result.current.left.ribbon).toHaveLength(2);
        expect(result.current.right.squareCoherence).toEqual([0.91, 0.74, 0.66]);
        expect(result.current.under.lamps.filter(lamp => lamp.lit)).toHaveLength(7);
        // The projection cannot serve these five, and the directive says which.
        expect(result.current.liveOnlyPending).toEqual([
            'wisdom-delta',
            'recognition-state',
            'loaded-agents',
            'unsatisfied-constraints',
            'symbolic-round-trips'
        ]);
        expect(result.current.wisdomDelta).toBeNull();
    });

    it('emits composition.contemplation.complete once, not once per render', async () => {
        invoke.mockResolvedValue({ artifact: projection });
        const { rerender } = renderHook(() => useContemplationFlowDirective('jiva-siva.integrated', 31));

        await waitFor(() => expect(contemplationEvents()).toHaveLength(1));
        expect(contemplationEvents()[0].payload).toMatchObject({
            sessionId: 'sess-29-t29-9',
            slots: ["4'", "5'", "0'"],
            lampsLit: 7,
            arch9Wholeness: true
        });

        await act(async () => {
            rerender();
            rerender();
        });
        expect(contemplationEvents()).toHaveLength(1);
    });

    it('stays awaiting-close and silent when the session never closed', async () => {
        invoke.mockRejectedValue(new Error('no close bundle for session'));
        const { result } = renderHook(() => useContemplationFlowDirective('jiva-siva.integrated', 31));

        await waitFor(() => expect(invoke).toHaveBeenCalled());
        expect(result.current.state).toBe('awaiting-close');
        expect(result.current.source).toBe('none');
        expect(contemplationEvents()).toHaveLength(0);
    });

    it('does not reach for the gateway before the connection is up', async () => {
        useProvenanceStore.setState({ connection: { connected: false, reason: 'test' } } as never);
        const { result } = renderHook(() => useContemplationFlowDirective('jiva-siva.integrated', 31));

        expect(invoke).not.toHaveBeenCalled();
        expect(result.current.state).toBe('awaiting-close');
    });
});
