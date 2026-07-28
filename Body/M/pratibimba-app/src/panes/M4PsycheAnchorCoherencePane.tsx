/**
 * Coordinate: M' M4' (tarot psyche-anchor coherence panel — rerun 25.T25.20)
 * Residency: Body/M/pratibimba-app/src/panes/M4PsycheAnchorCoherencePane.tsx
 * Position (#n): #4 — Context; the frame that asks whether the cards a session
 *   opened under are the cards it turned out to live.
 * Actualises: tranche 25.20's coherence indicator and per-card hit list,
 *   carrier-native. Read-only — it never mutates session state, and per the
 *   corrected PRODUCER note it consumes the CONTEMPLATION CLOSE PATH
 *   (`nara.session_close.contemplation.read`); `nara.session.psyche_anchor` has
 *   never existed and must not be built, because Khora owns session lifecycle.
 *
 *   NOT A MODAL and NOT AN 11th MAIN TAB: it mounts on the personal left border
 *   beside the session-close ceremony it reads alongside (the carrier's no-modal
 *   discipline is lint-enforced by 31.T31.8, and an eleventh `personal-main` tab
 *   makes the strip un-clickable at 1280x800).
 *
 *   The retarget of the brief's "session codon trace" section — why the
 *   trajectory is not reconstructed here — is argued once, in the engine module,
 *   and not restated per render.
 * Public surface: M4PsycheAnchorCoherencePane, M4_PSYCHE_ANCHOR_COHERENCE_RPC.
 * Does NOT own: the coherence arithmetic (m4PsycheAnchorCoherence.ts), the
 *   contemplation parse (m4SessionCloseCeremony.ts), the privacy tint register
 *   (ui/privacyChrome.ts), or the anchor draw (S3).
 * Contract: [[M4'-SPEC]] + rerun tranche [[25.T25.20]] (consumes 19.4 + 19.5).
 */

import { useCallback, useEffect, useState } from 'react';
import { gateway } from '../bridge/gatewayHolder';
import { useProvenanceStore, useSessionStore } from '../state/stores';
import { privacyChrome } from '../ui/privacyChrome';
import { psycheAnchorCoherence } from './m4PsycheAnchorCoherence';
import { readNaraContemplationObject, type M4ContemplationRead } from './m4SessionCloseCeremony';

/** The one real read this panel is built from. */
export const M4_PSYCHE_ANCHOR_COHERENCE_RPC = 'nara.session_close.contemplation.read';

type LoadState = 'idle' | 'loading' | 'loaded' | 'error';

const CARD_STATE_GLOSS: Readonly<Record<string, string>> = Object.freeze({
    matched: 'its codon rode the trajectory',
    unmatched: 'its codon never appeared',
    'no-codon': 'drawn without a codon — nothing to read against'
});

export interface M4PsycheAnchorCoherencePaneProps {
    /** Overrides the active session key; the shell's session store is the default. */
    sessionKey?: string | null;
}

export function M4PsycheAnchorCoherencePane({
    sessionKey = null
}: M4PsycheAnchorCoherencePaneProps = {}) {
    const connected = useProvenanceStore(state => state.connection.connected);
    const storeSessionKey = useSessionStore(state => state.sessionKey);
    const activeSession = sessionKey ?? storeSessionKey;

    const [load, setLoad] = useState<LoadState>('idle');
    const [error, setError] = useState('');
    const [contemplation, setContemplation] = useState<M4ContemplationRead | null>(null);
    const [reloads, setReloads] = useState(0);

    useEffect(() => {
        if (!connected || !activeSession) {
            return;
        }
        let disposed = false;
        setLoad('loading');
        gateway()
            .invoke(M4_PSYCHE_ANCHOR_COHERENCE_RPC, { session_id: activeSession, latest: true })
            .then(receipt => {
                if (disposed) {
                    return;
                }
                setContemplation(readNaraContemplationObject(receipt.artifact));
                setLoad('loaded');
            })
            .catch(err => {
                if (disposed) {
                    return;
                }
                // A session that never closed has no anchor reading — an honest
                // absence, not a defect.
                setError(err instanceof Error ? err.message : String(err));
                setContemplation(null);
                setLoad('error');
            });
        return () => {
            disposed = true;
        };
    }, [connected, activeSession, reloads]);

    const refresh = useCallback(() => setReloads(count => count + 1), []);
    const chrome = privacyChrome('protected_local_handle_only');
    const coherence = psycheAnchorCoherence(load === 'loaded' ? contemplation : null);

    return (
        <div
            className={`m4-psyche-anchor-coherence ${chrome.className}`}
            title={chrome.title}
            data-testid="psyche-anchor-coherence"
            data-session-key={activeSession ?? ''}
            data-load-state={load}
            data-coherence-state={coherence.state}
        >
            <header className="pane-toolbar">
                <span>Psyche anchor — cards against trajectory</span>
                <button type="button" data-testid="anchor-refresh" onClick={refresh}>
                    Re-read
                </button>
            </header>

            {!activeSession ? (
                <p className="pane-message" data-testid="anchor-no-session">
                    No active session — an anchor reading needs a session that closed.
                </p>
            ) : null}
            {load === 'error' ? (
                <p className="pane-message" data-testid="anchor-absent">
                    {`No persisted close for this session yet — ${error}`}
                </p>
            ) : null}

            {/* Coherence indicator — the brief's "count of matches / total,
                rendered as percentage", with the substrate's own verdict beside
                it rather than recomputed from the same numbers. */}
            {coherence.state === 'ready' ? (
                <section className="anchor-section" data-testid="anchor-coherence">
                    <h3>Coherence</h3>
                    <p className="anchor-score" data-testid="anchor-score">
                        {`${coherence.matched} of ${coherence.readable} anchor cards matched${
                            coherence.percent === null ? '' : ` · ${coherence.percent}%`
                        }`}
                    </p>
                    <p
                        className="anchor-verdict"
                        data-testid="anchor-verdict"
                        data-verdict={coherence.verdict ? 'coherent' : 'incoherent'}
                    >
                        {coherence.verdict
                            ? 'The anchor held — every drawn codon appeared.'
                            : 'The anchor did not hold — at least one drawn codon never appeared.'}
                    </p>
                </section>
            ) : null}

            {/* Per-card hit list — the question the verdict collapses. */}
            <section className="anchor-section" data-testid="anchor-cards">
                <h3>Anchor cards</h3>
                {coherence.state === 'ready' ? (
                    <ul className="anchor-card-list">
                        {coherence.cards.map((card, index) => (
                            <li
                                key={`${card.card ?? 'no-card'}-${card.codon ?? index}`}
                                className="anchor-card"
                                data-testid={`anchor-card-${index}`}
                                data-card-state={card.state}
                            >
                                <span className="anchor-card-name">
                                    {card.card ?? 'no card'}
                                </span>
                                <span className="anchor-card-codon">{card.codon ?? '—'}</span>
                                <span className="anchor-card-gloss">
                                    {CARD_STATE_GLOSS[card.state]}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="pane-message" data-testid="anchor-cards-absent">
                        {coherence.state === 'unwidened'
                            ? coherence.reason
                            : coherence.state === 'empty'
                              ? 'this close carries no anchor cards'
                              : coherence.reason}
                    </p>
                )}
            </section>
        </div>
    );
}
