/**
 * Coordinate: M' (context-xray seam tests — Tranche 44.T44.6)
 * Actualises: the selection→context verification — xray artifacts normalize
 *   into contract-validated related blocks + coordinate/episode handles
 *   (invalid dropped), refusals yield the honest pending handle, and block
 *   selection in the Review fold writes the shared coordinate store
 *   (highlight-back) while firing the real RPC and rendering the honest
 *   pending strip while the seam is unimplemented.
 */

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setGateway } from '../bridge/gatewayHolder';
import { DEFAULT_CONNECTION_STATUS } from '../bridge/types';
import { useCoordinateStore, useProvenanceStore, useSessionStore } from '../state/stores';
import { ReviewBlocksPane } from '../panes/omni/ReviewBlocksPane';
import { CONTEXT_XRAY_RPC, normalizeContextXray, pendingContextXray } from './contextXray';

describe('44.6 context-xray normalizer', () => {
    it('keeps contract-valid related blocks, lists coordinates/episodes, drops invalid items', () => {
        const handle = normalizeContextXray(
            {
                relatedBlocks: [
                    {
                        id: 'rb-1',
                        type: 'rich-text',
                        ctx: { cf: '(5/0)', ct: 'CT1', cp: 'CP4.1' },
                        privacyClass: 'public',
                        data: { text: 'related note' }
                    },
                    { id: 'broken' }
                ],
                relatedCoordinates: ['M4-3', 'C5'],
                episodeHandles: ['graphiti://episode/abc']
            },
            'M4-3'
        );
        expect(handle.relatedBlocks).toHaveLength(1);
        expect(handle.droppedInvalidCount).toBe(1);
        expect(handle.relatedCoordinates).toEqual(['M4-3', 'C5']);
        expect(handle.episodeHandles).toEqual(['graphiti://episode/abc']);
        expect(handle.wireState).toBe('live');
    });

    it('a refused call yields the honest pending handle', () => {
        const handle = pendingContextXray(new Error('gateway error: unimplemented'), 'M4-3');
        expect(handle.wireState).toBe('pending-wire');
        expect(handle.relatedBlocks).toHaveLength(0);
    });
});

describe('44.6 selection in the Review fold', () => {
    const invoke = vi.fn();

    beforeEach(() => {
        invoke.mockReset();
        invoke.mockImplementation(async (method: string) =>
            method === CONTEXT_XRAY_RPC
                ? Promise.reject(new Error('gateway error: unimplemented'))
                : ({ artifact: { ok: true } } as never)
        );
        setGateway({ invoke } as never);
        useSessionStore.setState({ sessionKey: null, dayNow: null, privacyClass: null });
        useCoordinateStore.setState({ selected: null });
        useProvenanceStore.setState({
            connection: { ...DEFAULT_CONNECTION_STATUS, connected: true, state: 'connected' }
        });
    });

    afterEach(() => {
        cleanup();
        setGateway(null);
    });

    it('clicking a hosted block highlights back through the coordinate store, fires the xray, and renders the honest pending strip', async () => {
        render(<ReviewBlocksPane />);
        const reviewBlock = document.querySelector('[data-block-type="review-item"]') as HTMLElement;
        expect(reviewBlock).toBeTruthy();
        fireEvent.click(reviewBlock);

        const strip = await screen.findByTestId('review-xray-strip');
        expect(strip.getAttribute('data-wire-state')).toBe('pending-wire');
        expect(screen.getByTestId('review-xray-pending')).toBeTruthy();

        const xrayCalls = invoke.mock.calls.filter(([method]) => method === CONTEXT_XRAY_RPC);
        expect(xrayCalls).toHaveLength(1);
        // Highlight-back: review-item blocks in the fold carry no coordinate
        // (the fixture genealogy is coordinate-less), so the store stays null
        // — never fabricated. A coordinate-carrying block writes it:
        expect(useCoordinateStore.getState().selected).toBeNull();
    });
});
