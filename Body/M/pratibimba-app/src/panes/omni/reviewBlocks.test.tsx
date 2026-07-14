/**
 * Coordinate: M' M5' (review-blocks projection tests — Tranche 44.T44.3)
 * Actualises: the projection law — genealogy records map to review-item
 *   (+evidence when ref present, +one dispatch-genealogy lineage block),
 *   tool events map to tool-stream-event, every projected block passes the
 *   44.1 catalog law, and the Review fold renders them through BlockHost
 *   (first real data through the standard, fixture as acceptance).
 */

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { createDefaultBlockRegistry } from '../../blocks/blockRegistry';
import { syntheticPiAnimaMoiraiDispatch } from './dispatchGenealogy.fixture';
import { ReviewBlocksPane } from './ReviewBlocksPane';
import {
    REVIEW_FOLD_CTX,
    genealogyToReviewBlocks,
    patternPacketBlock,
    toolStreamEventBlock
} from './reviewBlocks';

afterEach(cleanup);

describe('44.3 review → blocks projection', () => {
    it('projects each genealogy record to a review-item, evidence rides only real refs, one lineage block closes the list', () => {
        const records = syntheticPiAnimaMoiraiDispatch();
        const blocks = genealogyToReviewBlocks(records);

        const reviewItems = blocks.filter(block => block.type === 'review-item');
        expect(reviewItems).toHaveLength(records.length);
        expect(reviewItems.every(block => block.affordances?.includes('verdict'))).toBe(true);

        const evidence = blocks.filter(block => block.type === 'evidence');
        const withRefs = records.filter(record => record.evidenceRef);
        expect(evidence).toHaveLength(withRefs.length);
        expect(evidence.every(block => block.provenance?.kind === 'evidence-envelope')).toBe(true);

        const lineage = blocks.filter(block => block.type === 'dispatch-genealogy');
        expect(lineage).toHaveLength(1);
        expect((lineage[0].data as { nodes: unknown[] }).nodes).toHaveLength(records.length);
    });

    it('every projected block passes the 44.1 catalog law with the fold CTX frame', () => {
        const registry = createDefaultBlockRegistry();
        const blocks = [
            ...genealogyToReviewBlocks(syntheticPiAnimaMoiraiDispatch()),
            toolStreamEventBlock({ seq: 1, emittedAtMs: 1000, kind: 'tool.call', channel: 'chat' }),
            patternPacketBlock({ id: 'p-1', motif: 'syzygy' })
        ];
        for (const block of blocks) {
            expect(() => registry.assertAccepted(block)).not.toThrow();
            expect(block.ctx).toEqual(REVIEW_FOLD_CTX);
        }
    });

    it('the Review fold renders the projected blocks through BlockHost with the honest seam note', () => {
        render(<ReviewBlocksPane />);
        expect(screen.getByTestId('review-blocks-seam-note').textContent).toMatch(/track-12/);
        expect(screen.getByTestId('block-host')).toBeTruthy();
        const hosted = document.querySelectorAll('[data-block-type="review-item"]');
        expect(hosted.length).toBeGreaterThan(0);
        expect(document.querySelectorAll('[data-block-type="dispatch-genealogy"]')).toHaveLength(1);
    });
});

describe('44.4 vertical slice in the Review fold', () => {
    it('a human verdict folds into the renderer state and dispatches the psyche update', async () => {
        const { fireEvent } = await import('@testing-library/react');
        const { vi } = await import('vitest');
        const { setGateway } = await import('../../bridge/gatewayHolder');
        const invoke = vi.fn().mockResolvedValue({ artifact: { ok: true } });
        setGateway({ invoke } as never);
        try {
            render(<ReviewBlocksPane />);
            fireEvent.click(screen.getByTestId('review-verdict-reject'));
            expect(screen.getByTestId('review-pending-verdict').textContent).toContain('reject');
            const updates = invoke.mock.calls.filter(([method]) => method === "s4'.psyche.update");
            expect(updates).toHaveLength(1);
            const params = updates[0][1] as { patch: { renderer: { pendingVerdict: { decision: string } } } };
            expect(params.patch.renderer.pendingVerdict.decision).toBe('reject');
        } finally {
            setGateway(null);
        }
    });
});

describe('44.5 live transport hydration', () => {
    it('hydrates the fold from the s3 temporal context blocks projection when the session carries blocks', async () => {
        const { vi } = await import('vitest');
        const { setGateway } = await import('../../bridge/gatewayHolder');
        const { DEFAULT_CONNECTION_STATUS } = await import('../../bridge/types');
        const { useProvenanceStore, useSessionStore } = await import('../../state/stores');
        const liveBlock = {
            id: 'review-item:live-9',
            type: 'review-item',
            ctx: { cf: '(5/0)', ct: 'CT5', cp: 'CP4.5' },
            privacyClass: 'protected',
            data: { runId: 'live-9' },
            affordances: ['verdict', 'annotate']
        };
        const invoke = vi.fn().mockImplementation(async (method: string) =>
            method === "s3'.temporal.context"
                ? ({ artifact: { blocks: { source: "s4'.psyche.state.renderer", items: [liveBlock] } } } as never)
                : ({ artifact: { ok: true } } as never)
        );
        setGateway({ invoke } as never);
        useSessionStore.setState({ sessionKey: 'sess-live', dayNow: null, privacyClass: null });
        useProvenanceStore.setState({
            connection: { ...DEFAULT_CONNECTION_STATUS, connected: true, state: 'connected' }
        });
        try {
            render(<ReviewBlocksPane />);
            const pane = await screen.findByTestId('review-blocks-pane');
            await vi.waitFor(() => {
                expect(pane.getAttribute('data-block-source')).toBe('live');
            });
            expect(document.querySelectorAll('[data-block-type="review-item"]')).toHaveLength(1);
            expect(screen.getByTestId('block-review-item:live-9')).toBeTruthy();
        } finally {
            setGateway(null);
            useSessionStore.setState({ sessionKey: null, dayNow: null, privacyClass: null });
        }
    });
});
