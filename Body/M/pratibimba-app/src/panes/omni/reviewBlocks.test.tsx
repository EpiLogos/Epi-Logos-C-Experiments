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
        expect(screen.getByTestId('review-session-close-pending').textContent).toMatch(/session key/i);
        expect(screen.getByTestId('block-host')).toBeTruthy();
        const hosted = document.querySelectorAll('[data-block-type="review-item"]');
        expect(hosted.length).toBeGreaterThan(0);
        expect(document.querySelectorAll('[data-block-type="dispatch-genealogy"]')).toHaveLength(1);
    });

    it('carries a cross-pane requested review id without claiming the live producer resolved it', () => {
        render(<ReviewBlocksPane requestedReviewId="review-17" />);
        expect(screen.getByTestId('review-request-target').textContent).toContain('review-17');
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
                : method === 'nara.session_close.read'
                    ? ({
                          artifact: {
                              session_id: 'sess-live',
                              close_ref: 'close-live',
                              m1_closure: {
                                  closed: true,
                                  generator_step: 7,
                                  positions_traversed: [true, true, true, true, true, true, true, true, true, true, true, true]
                              },
                              audio_octet: {
                                  octave_returned: true,
                                  traversed: [true, true, true, true, true, true, true, true]
                              },
                              virtue_witness_vector: 0b101101011,
                              coherence_score: 0.82,
                              provenance: {
                                  privacy_class: 'protected_local',
                                  source_method: 'nara.session_close',
                                  persisted_at: '2026-07-18T12:00:00Z',
                                  persisted_at_ms: 1_752_840_000_000,
                                  pasu_scoped: true
                              }
                          }
                      } as never)
                    : method === 'nara.session_close.contemplation.read'
                        ? ({
                              artifact: {
                                  session_id: 'sess-live',
                                  close_ref: 'close-live',
                                  contemplation_ref: 'contemplation-live',
                                  triplet: {
                                      llm: {
                                          position: "4'",
                                          loaded_agent_count: 4,
                                          psyche_anchor_coherent: true,
                                          matched_anchor_codon_count: 1
                                      },
                                      ebm: {
                                          position: "5'",
                                          gradient_magnitude: 0.18,
                                          gauge_trio_coherent: true,
                                          coherence_scores: {
                                              square_0_5: 0.9,
                                              square_1_4: 0.8,
                                              square_2_3: 0.7
                                          }
                                      },
                                      verifier: {
                                          position: "0'",
                                          virtue_witness_vector: [true, true, false, true, false, true, true, false, true],
                                          coherence_score: 0.82,
                                          arch9_wholeness: false,
                                          syntax_layers_witnessed: true
                                      }
                                  },
                                  provenance: {
                                      privacy_class: 'protected_local',
                                      source_method: 'nara.session_close',
                                      persisted_at: '2026-07-19T12:00:00Z',
                                      persisted_at_ms: 1_752_940_800_000,
                                      pasu_scoped: true
                                  }
                              }
                          } as never)
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
            expect(screen.getByTestId('m1-session-close-reader')).toBeTruthy();
            expect(await screen.findByTestId('contemplation-object-viewer')).toBeTruthy();
            expect(document.querySelectorAll('[data-block-type="review-item"]')).toHaveLength(1);
            expect(screen.getByTestId('block-review-item:live-9')).toBeTruthy();
            const closeReads = invoke.mock.calls.filter(([method]) => method === 'nara.session_close.read');
            expect(closeReads).toHaveLength(1);
            expect(closeReads[0][1]).toEqual({ sessionKey: 'sess-live', latest: true });
            const contemplationReads = invoke.mock.calls.filter(
                ([method]) => method === 'nara.session_close.contemplation.read'
            );
            expect(contemplationReads).toHaveLength(1);
            expect(contemplationReads[0][1]).toEqual({ sessionKey: 'sess-live', latest: true });
        } finally {
            setGateway(null);
            useSessionStore.setState({ sessionKey: null, dayNow: null, privacyClass: null });
        }
    });

    it('keeps requested review ids separate from the close-bundle readback and renders the honest absent state', async () => {
        const { vi } = await import('vitest');
        const { setGateway } = await import('../../bridge/gatewayHolder');
        const { DEFAULT_CONNECTION_STATUS } = await import('../../bridge/types');
        const { useProvenanceStore, useSessionStore } = await import('../../state/stores');
        const invoke = vi.fn().mockImplementation(async (method: string) =>
            method === 'nara.session_close.read'
                ? Promise.reject(new Error('no persisted session-close bundle for the requested session'))
                : ({ artifact: { ok: true } } as never)
        );
        setGateway({ invoke } as never);
        useSessionStore.setState({ sessionKey: 'sess-latest', dayNow: null, privacyClass: null });
        useProvenanceStore.setState({
            connection: { ...DEFAULT_CONNECTION_STATUS, connected: true, state: 'connected' }
        });
        try {
            render(<ReviewBlocksPane requestedReviewId="review-17" />);
            expect(await screen.findByTestId('review-session-close-absent')).toBeTruthy();
            const closeReads = invoke.mock.calls.filter(([method]) => method === 'nara.session_close.read');
            expect(closeReads).toHaveLength(1);
            expect(closeReads[0][1]).toEqual({ sessionKey: 'sess-latest', latest: true });
        } finally {
            setGateway(null);
            useSessionStore.setState({ sessionKey: null, dayNow: null, privacyClass: null });
        }
    });

    it('renders the honest error state when the close-bundle readback fails unexpectedly', async () => {
        const { vi } = await import('vitest');
        const { setGateway } = await import('../../bridge/gatewayHolder');
        const { DEFAULT_CONNECTION_STATUS } = await import('../../bridge/types');
        const { useProvenanceStore, useSessionStore } = await import('../../state/stores');
        const invoke = vi.fn().mockImplementation(async (method: string) =>
            method === 'nara.session_close.read'
                ? Promise.reject(new Error('gateway refused close read'))
                : ({ artifact: { ok: true } } as never)
        );
        setGateway({ invoke } as never);
        useSessionStore.setState({ sessionKey: 'sess-error', dayNow: null, privacyClass: null });
        useProvenanceStore.setState({
            connection: { ...DEFAULT_CONNECTION_STATUS, connected: true, state: 'connected' }
        });
        try {
            render(<ReviewBlocksPane />);
            expect(await screen.findByTestId('review-session-close-error')).toBeTruthy();
        } finally {
            setGateway(null);
            useSessionStore.setState({ sessionKey: null, dayNow: null, privacyClass: null });
        }
    });
});
