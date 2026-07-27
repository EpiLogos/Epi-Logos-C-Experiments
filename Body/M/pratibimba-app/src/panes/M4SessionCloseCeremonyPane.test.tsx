/**
 * Coordinate: M' M4' (session-close ceremony behavioral gate — 25.T25.19)
 * Residency: Body/M/pratibimba-app/src/panes
 * Actualises: the pane laws only a mounted pane can prove — it reads the THREE
 *   real protected-local RPCs for the active session, renders the four ceremony
 *   sections off what came back, lights exactly the virtues the verifier
 *   witnessed, keeps the full quintessence hash OUT of the DOM entirely, and
 *   renders an honest absence (never a fabricated ceremony) when the session has
 *   no persisted close.
 * Does NOT own: the parse law (m4SessionCloseCeremony.test.ts) or the close.
 */

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setGateway } from '../bridge/gatewayHolder';
import { DEFAULT_CONNECTION_STATUS } from '../bridge/types';
import { useProvenanceStore, useSessionStore, useTickStore } from '../state/stores';
import { M4SessionCloseCeremonyPane, M4_SESSION_CLOSE_CEREMONY_RPCS } from './M4SessionCloseCeremonyPane';

const FULL_HASH = '0123456789abcdef0123456789abcdef';
const WITNESS = [true, true, false, true, false, true, true, false, true];

function closeBundle(sessionId: string) {
    return {
        session_id: sessionId,
        close_ref: 'close-e2e-1',
        m1_closure: { positions_traversed: Array(12).fill(true), generator_step: 7, closed: true },
        audio_octet: { traversed: Array(8).fill(true), octave_returned: true },
        virtue_witness_vector: WITNESS.reduce((mask, bit, i) => (bit ? mask | (1 << i) : mask), 0),
        coherence_score: 0.82,
        provenance: {
            privacy_class: 'protected_local',
            source_method: 'nara.session_close',
            persisted_at: '2026-07-27T10:00:00Z',
            persisted_at_ms: 1_785_000_000_000,
            pasu_scoped: true
        }
    };
}

function contemplationObject(sessionId: string) {
    return {
        session_id: sessionId,
        close_ref: 'close-e2e-1',
        contemplation_ref: 'contemplation-e2e-1',
        triplet: {
            llm: {
                position: "4'",
                loaded_agent_count: 4,
                psyche_anchor_coherent: true,
                matched_anchor_codon_count: 1
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

function connectCeremonyGateway(sessionId: string, fail = false) {
    const invoke = vi.fn(async (method: string) => {
        if (fail) {
            throw new Error('no persisted close bundle for session');
        }
        if (method === M4_SESSION_CLOSE_CEREMONY_RPCS.bundle) {
            return { artifact: closeBundle(sessionId) };
        }
        if (method === M4_SESSION_CLOSE_CEREMONY_RPCS.contemplation) {
            return { artifact: contemplationObject(sessionId) };
        }
        return {
            artifact: { c_5_quintessence_hash: FULL_HASH, c_5_quintessence_clock: '187.5' }
        };
    });
    setGateway({ invoke } as never);
    useProvenanceStore.setState({
        connection: { ...DEFAULT_CONNECTION_STATUS, connected: true, state: 'connected' }
    });
    useSessionStore.setState({ sessionKey: sessionId });
    useTickStore.setState({
        profile: {
            profile: {
                harmonicProfile: {
                    tick12: 3,
                    contemplationPromptLut: Array.from({ length: 12 }, (_, i) => `prompt ${i}`)
                }
            }
        }
    } as never);
    return invoke;
}

describe('25.T25.19 — the session-close ceremony pane', () => {
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

    it('reads all three protected-local surfaces for the active session', async () => {
        const invoke = connectCeremonyGateway('session-alpha');
        render(<M4SessionCloseCeremonyPane />);
        await waitFor(() =>
            expect(screen.getByTestId('session-close-ceremony').getAttribute('data-load-state')).toBe(
                'loaded'
            )
        );
        expect(invoke).toHaveBeenCalledWith(M4_SESSION_CLOSE_CEREMONY_RPCS.bundle, {
            session_id: 'session-alpha',
            latest: true
        });
        expect(invoke).toHaveBeenCalledWith(M4_SESSION_CLOSE_CEREMONY_RPCS.contemplation, {
            session_id: 'session-alpha',
            latest: true
        });
        expect(invoke).toHaveBeenCalledWith(M4_SESSION_CLOSE_CEREMONY_RPCS.pasu, {});
    });

    it('renders the four sections off the real payload', async () => {
        connectCeremonyGateway('session-alpha');
        render(<M4SessionCloseCeremonyPane />);

        await waitFor(() => expect(screen.getByTestId('ceremony-contemplation-ref')).toBeTruthy());
        // (a) the delta's handle and the triplet, not a fabricated hex strip
        expect(screen.getByTestId('ceremony-contemplation-ref').textContent).toBe(
            'contemplation-e2e-1'
        );
        expect(screen.getByTestId('ceremony-triplet-verifier').textContent).toContain('arch-9 whole');
        // (b) the Möbius section carries the handle and the M1 closure
        expect(screen.getByTestId('ceremony-quintessence-handle').textContent).toContain('01234567');
        expect(screen.getByTestId('ceremony-closure').textContent).toContain('closed');
        // (c) the four Arch seeds, from the live LUT
        expect(screen.getByTestId('ceremony-seed-speech').getAttribute('data-archetype')).toBe('3');
        expect(screen.getByTestId('ceremony-seed-completion').textContent).toContain('prompt 9');
        // (d) nine lamps, lit exactly where the verifier witnessed
        const lamps = Array.from({ length: 9 }, (_, i) =>
            screen.getByTestId(`ceremony-lamp-${i}`).getAttribute('data-lit')
        );
        expect(lamps).toEqual(WITNESS.map(bit => String(bit)));
    });

    it('never lets the full quintessence hash into the DOM', async () => {
        connectCeremonyGateway('session-alpha');
        const { container } = render(<M4SessionCloseCeremonyPane />);
        await waitFor(() => expect(screen.getByTestId('ceremony-quintessence-handle')).toBeTruthy());
        expect(container.innerHTML).not.toContain(FULL_HASH);
        expect(container.innerHTML).toContain('01234567');
    });

    it('renders an honest absence when the session never closed', async () => {
        connectCeremonyGateway('session-alpha', true);
        render(<M4SessionCloseCeremonyPane />);
        await waitFor(() => expect(screen.getByTestId('ceremony-absent')).toBeTruthy());
        expect(screen.getByTestId('ceremony-absent').textContent).toContain('No persisted close');
        // and the ceremony sections stay empty rather than inventing a close
        expect(screen.getByTestId('ceremony-contemplation-blocked')).toBeTruthy();
        expect(screen.getByTestId('ceremony-virtues-absent')).toBeTruthy();
    });

    it('re-reads on demand — the ceremony can be replayed for a later close', async () => {
        const invoke = connectCeremonyGateway('session-alpha');
        render(<M4SessionCloseCeremonyPane />);
        await waitFor(() => expect(invoke).toHaveBeenCalledTimes(3));
        fireEvent.click(screen.getByTestId('ceremony-refresh'));
        await waitFor(() => expect(invoke).toHaveBeenCalledTimes(6));
    });

    it('says so plainly when there is no active session', async () => {
        setGateway({ invoke: vi.fn() } as never);
        useProvenanceStore.setState({
            connection: { ...DEFAULT_CONNECTION_STATUS, connected: true, state: 'connected' }
        });
        render(<M4SessionCloseCeremonyPane />);
        expect(screen.getByTestId('ceremony-no-session')).toBeTruthy();
    });
});
