/**
 * Coordinate: M' M4' (psyche-anchor coherence behavioral gate — 25.T25.20)
 * Residency: Body/M/pratibimba-app/src/panes
 * Actualises: the pane laws only a mounted pane can prove — it reads the ONE
 *   real contemplation RPC for the active session (never the
 *   `nara.session.psyche_anchor` the brief's superseded prose invented), renders
 *   a card row per drawn card with its own codon and match state, surfaces a
 *   "no card" badge rather than dropping a ragged draw, keeps the session
 *   trajectory out of the DOM entirely, and renders an honest absence when the
 *   session has no persisted close.
 * Does NOT own: the arithmetic (m4PsycheAnchorCoherence.test.ts) or the close.
 */

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setGateway } from '../bridge/gatewayHolder';
import { DEFAULT_CONNECTION_STATUS } from '../bridge/types';
import { useProvenanceStore, useSessionStore } from '../state/stores';
import {
    M4PsycheAnchorCoherencePane,
    M4_PSYCHE_ANCHOR_COHERENCE_RPC
} from './M4PsycheAnchorCoherencePane';

const WITNESS = [true, true, false, true, false, true, true, false, true];

const FOUR_CARDS = [
    { card: 'The Fool', codon: 'I', matched: true },
    { card: 'The Hierophant', codon: 'V', matched: true },
    { card: 'The Hermit', codon: 'IX', matched: false },
    { card: null, codon: 'XVII', matched: false }
];

function contemplationObject(sessionId: string, anchorCards: unknown = FOUR_CARDS) {
    return {
        session_id: sessionId,
        close_ref: 'close-anchor-1',
        contemplation_ref: 'contemplation-anchor-1',
        triplet: {
            llm: {
                position: "4'",
                loaded_agent_count: 4,
                psyche_anchor_coherent: false,
                matched_anchor_codon_count: 2,
                anchor_cards: anchorCards
            },
            ebm: {
                position: "5'",
                gradient_magnitude: 0.25,
                gauge_trio_coherent: true,
                coherence_scores: { square_0_5: 1, square_1_4: 0.97, square_2_3: 0.94 }
            },
            verifier: {
                position: "0'",
                virtue_witness_vector: WITNESS,
                coherence_score: 0.82,
                arch9_wholeness: true,
                syntax_layers_witnessed: false
            }
        },
        provenance: {
            privacy_class: 'protected_local',
            source_method: 'nara.session_close',
            persisted_at: '2026-07-27T10:00:00Z',
            persisted_at_ms: 1_785_000_000_000,
            pasu_scoped: true
        }
    };
}

function connectAnchorGateway(sessionId: string, options: { fail?: boolean; cards?: unknown } = {}) {
    // The method/params are typed even though the stub ignores them: the test
    // below asserts on which METHOD was called, and an argless stub types its
    // recorded calls as an empty tuple.
    const invoke = vi.fn(async (_method: string, _params?: unknown) => {
        if (options.fail) {
            throw new Error('no persisted close bundle for session');
        }
        return { artifact: contemplationObject(sessionId, options.cards ?? FOUR_CARDS) };
    });
    setGateway({ invoke } as never);
    useProvenanceStore.setState({
        connection: { ...DEFAULT_CONNECTION_STATUS, connected: true, state: 'connected' }
    });
    useSessionStore.setState({ sessionKey: sessionId });
    return invoke;
}

async function renderLoaded(sessionId: string, options?: { cards?: unknown }) {
    const invoke = connectAnchorGateway(sessionId, options);
    render(<M4PsycheAnchorCoherencePane />);
    await waitFor(() =>
        expect(screen.getByTestId('psyche-anchor-coherence').getAttribute('data-load-state')).toBe(
            'loaded'
        )
    );
    return invoke;
}

describe('25.T25.20 — the psyche-anchor coherence pane', () => {
    beforeEach(() => {
        setGateway(null);
        useProvenanceStore.setState({ connection: { ...DEFAULT_CONNECTION_STATUS } });
        useSessionStore.setState({ sessionKey: null });
    });

    afterEach(() => {
        cleanup();
        setGateway(null);
        useSessionStore.setState({ sessionKey: null });
        useProvenanceStore.setState({ connection: { ...DEFAULT_CONNECTION_STATUS } });
    });

    it('reads the contemplation close path, not a session-owner RPC that never existed', async () => {
        const invoke = await renderLoaded('session-anchor');
        expect(invoke).toHaveBeenCalledTimes(1);
        expect(invoke).toHaveBeenCalledWith(M4_PSYCHE_ANCHOR_COHERENCE_RPC, {
            session_id: 'session-anchor',
            latest: true
        });
        // Khora owns session lifecycle; Nara must not grow a second owner.
        for (const call of invoke.mock.calls) {
            expect(call[0]).not.toContain('nara.session.psyche_anchor');
        }
    });

    it('renders one row per drawn card, each with its own codon and match state', async () => {
        await renderLoaded('session-anchor');
        expect(screen.getByTestId('anchor-card-0').textContent).toContain('The Fool');
        expect(screen.getByTestId('anchor-card-0').textContent).toContain(
            'its codon rode the trajectory'
        );
        expect(screen.getByTestId('anchor-card-0').getAttribute('data-card-state')).toBe('matched');
        expect(screen.getByTestId('anchor-card-2').textContent).toContain('The Hermit');
        expect(screen.getByTestId('anchor-card-2').getAttribute('data-card-state')).toBe(
            'unmatched'
        );
        expect(screen.queryByTestId('anchor-card-4')).toBeNull();
    });

    it('badges a codon that resolved to no card instead of dropping the row', async () => {
        await renderLoaded('session-anchor');
        const ragged = screen.getByTestId('anchor-card-3');
        expect(ragged.textContent).toContain('no card');
        expect(ragged.textContent).toContain('XVII');
    });

    it('shows the count, the percentage and the substrate verdict', async () => {
        await renderLoaded('session-anchor');
        expect(screen.getByTestId('anchor-score').textContent).toContain('2 of 4 anchor cards matched');
        expect(screen.getByTestId('anchor-score').textContent).toContain('50%');
        expect(screen.getByTestId('anchor-verdict').getAttribute('data-verdict')).toBe(
            'incoherent'
        );
    });

    it('refuses a payload carrying session bodies rather than rendering over them', async () => {
        // The privacy law is not "the word trajectory is absent from the copy"
        // — it is that a payload which grew a body is REFUSED. A gateway that
        // started returning the trajectory would be a changed privacy boundary,
        // and this pane must render the refusal, not the walk.
        const leaky = contemplationObject('session-anchor') as Record<string, unknown>;
        (leaky.triplet as Record<string, Record<string, unknown>>).llm.recognition_state =
            'the private contour of the session';
        const invoke = vi.fn(async () => ({ artifact: leaky }));
        setGateway({ invoke } as never);
        useProvenanceStore.setState({
            connection: { ...DEFAULT_CONNECTION_STATUS, connected: true, state: 'connected' }
        });
        useSessionStore.setState({ sessionKey: 'session-anchor' });

        render(<M4PsycheAnchorCoherencePane />);
        await waitFor(() =>
            expect(
                screen.getByTestId('psyche-anchor-coherence').getAttribute('data-coherence-state')
            ).toBe('blocked')
        );
        const rendered = screen.getByTestId('psyche-anchor-coherence');
        expect(rendered.textContent).not.toContain('the private contour of the session');
        expect(screen.queryByTestId('anchor-card-0')).toBeNull();
        expect(screen.queryByTestId('anchor-score')).toBeNull();
    });

    it('declares its protected-local handle-only chrome at mount', async () => {
        await renderLoaded('session-anchor');
        const rendered = screen.getByTestId('psyche-anchor-coherence');
        expect(rendered.className).toContain('mext-privacy-protected-local-handle-only');
        expect(rendered.getAttribute('title')).toContain('protected_local_handle_only');
    });

    it('reads an older close as unwidened rather than as a session that drew nothing', async () => {
        await renderLoaded('session-anchor', { cards: [] });
        expect(screen.getByTestId('psyche-anchor-coherence').getAttribute('data-coherence-state')).toBe(
            'unwidened'
        );
        expect(screen.getByTestId('anchor-cards-absent').textContent).toContain(
            'persisted before the per-card anchor reading existed'
        );
        // No fabricated coherence indicator over cards that are not there.
        expect(screen.queryByTestId('anchor-score')).toBeNull();
    });

    it('renders an honest absence when the session never closed', async () => {
        connectAnchorGateway('session-anchor', { fail: true });
        render(<M4PsycheAnchorCoherencePane />);
        await waitFor(() =>
            expect(screen.getByTestId('psyche-anchor-coherence').getAttribute('data-load-state')).toBe(
                'error'
            )
        );
        expect(screen.getByTestId('anchor-absent').textContent).toContain('No persisted close');
        expect(screen.queryByTestId('anchor-card-0')).toBeNull();
    });

    it('does not read at all without an active session', async () => {
        const invoke = vi.fn();
        setGateway({ invoke } as never);
        useProvenanceStore.setState({
            connection: { ...DEFAULT_CONNECTION_STATUS, connected: true, state: 'connected' }
        });
        render(<M4PsycheAnchorCoherencePane />);
        expect(screen.getByTestId('anchor-no-session').textContent).toContain('No active session');
        expect(invoke).not.toHaveBeenCalled();
    });
});
