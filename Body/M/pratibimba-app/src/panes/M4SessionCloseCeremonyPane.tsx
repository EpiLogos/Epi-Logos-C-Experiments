/**
 * Coordinate: M' M4' (session-close ceremony — rerun 25.T25.19)
 * Residency: Body/M/pratibimba-app/src/panes/M4SessionCloseCeremonyPane.tsx
 * Position (#n): #5 — Integration; the Möbius turn a session takes to become
 *   witnessed rather than merely finished
 * Actualises: tranche 25.19's four ceremony sections, carrier-native. The pane
 *   is PURELY CEREMONIAL — it reads, it never writes, and it never advances a
 *   session; the close itself is S0's (`nara.session_close`).
 *
 *   TWO RETARGETS from the brief, both forced by carrier law and stated rather
 *   than smuggled. (1) NOT A MODAL. The brief says "modal-class, mounts over
 *   current view"; the carrier's no-modal discipline (31.T31.8, lint-enforced)
 *   makes the TAB the surface — the ceremony is a personal-face pane the reader
 *   opens, and it can be left open across closes. (2) NOT EVENT-MOUNTED. The
 *   brief mounts it on an `m5.session.contemplation.complete` observability
 *   event; EVENT_NAMES (gateway-contract protocol.rs) carries agent/chat/tick/
 *   health/heartbeat and no such event exists, so the pane reads the LATEST
 *   persisted close for the active session and refreshes on demand. Inventing a
 *   subscription to an event no gateway emits would render a ceremony that
 *   never fires.
 *
 *   Reads, all protected-local and loopback-only: `nara.session_close.read`
 *   (the aggregate bundle — parsed by the EXISTING M1 reader, not a second
 *   parser), `nara.session_close.contemplation.read` (the 4'-5'-0' triplet),
 *   and `nara.pasu.show` (the quintessence reflection, handle-only).
 * Public surface: M4SessionCloseCeremonyPane, M4_SESSION_CLOSE_CEREMONY_RPCS.
 * Does NOT own: the close (S0 `nara.session_close`), the bundle parse
 *   (m1SessionCloseReader.ts), the contemplation parse + seed law
 *   (m4SessionCloseCeremony.ts), the virtue labels (m0VirtueWitness.ts), or the
 *   privacy tint register (ui/privacyChrome.ts).
 * Contract: [[M4'-SPEC]] + rerun tranche [[25.T25.19]] (consumes 19.6 + 19.7).
 */

import { useCallback, useEffect, useState } from 'react';
import { gateway } from '../bridge/gatewayHolder';
import { useProvenanceStore, useSessionStore, useTickStore } from '../state/stores';
import { privacyChrome } from '../ui/privacyChrome';
import { M0_VIRTUE_LABELS } from './m0VirtueWitness';
import { readM1SessionCloseBundle, type M1SessionCloseRead } from './m1SessionCloseReader';
import {
    contemplationSeedsFromProfile,
    readNaraContemplationObject,
    readQuintessenceHandle,
    type M4ContemplationRead,
    type M4QuintessenceHandleRead
} from './m4SessionCloseCeremony';

/** The three real reads this ceremony is built from. */
export const M4_SESSION_CLOSE_CEREMONY_RPCS = Object.freeze({
    bundle: 'nara.session_close.read',
    contemplation: 'nara.session_close.contemplation.read',
    pasu: 'nara.pasu.show'
} as const);

type LoadState = 'idle' | 'loading' | 'loaded' | 'error';

export interface M4SessionCloseCeremonyPaneProps {
    /** Overrides the active session key; the shell's session store is the default. */
    sessionKey?: string | null;
}

function tick12OfProfile(cached: unknown): number | null {
    const profile = (cached as { profile?: { harmonicProfile?: { tick12?: unknown } } } | null)?.profile;
    const root = profile?.harmonicProfile ?? (profile as { tick12?: unknown } | undefined);
    const tick12 = root?.tick12;
    return typeof tick12 === 'number' && Number.isFinite(tick12) ? tick12 : null;
}

export function M4SessionCloseCeremonyPane({
    sessionKey = null
}: M4SessionCloseCeremonyPaneProps = {}) {
    const connected = useProvenanceStore(state => state.connection.connected);
    const storeSessionKey = useSessionStore(state => state.sessionKey);
    const cachedProfile = useTickStore(state => state.profile);
    const activeSession = sessionKey ?? storeSessionKey;

    const [load, setLoad] = useState<LoadState>('idle');
    const [error, setError] = useState('');
    const [bundle, setBundle] = useState<M1SessionCloseRead | null>(null);
    const [contemplation, setContemplation] = useState<M4ContemplationRead | null>(null);
    const [quintessence, setQuintessence] = useState<M4QuintessenceHandleRead | null>(null);
    const [reloads, setReloads] = useState(0);
    // 25.T25.5 (15-foundation principle 2): the quintessence read refetches
    // when the CLOCK moves a tick12 stop, so a wisdom-delta-shifted clock
    // position surfaces without a manual reload. Whole-stop key — the same
    // cancel-livelock law as 25.7: a per-generation dep would supersede the
    // in-flight read every second.
    const tick12 = tick12OfProfile(cachedProfile);
    useEffect(() => {
        if (tick12 !== null) {
            setReloads(count => count + 1);
        }
    }, [tick12]);

    const seeds = contemplationSeedsFromProfile(cachedProfile);

    useEffect(() => {
        if (!connected || !activeSession) {
            return;
        }
        let disposed = false;
        setLoad('loading');
        const params = { session_id: activeSession, latest: true };
        Promise.all([
            gateway().invoke(M4_SESSION_CLOSE_CEREMONY_RPCS.bundle, params),
            gateway().invoke(M4_SESSION_CLOSE_CEREMONY_RPCS.contemplation, params),
            gateway().invoke(M4_SESSION_CLOSE_CEREMONY_RPCS.pasu, {})
        ])
            .then(([bundleReceipt, contemplationReceipt, pasuReceipt]) => {
                if (disposed) {
                    return;
                }
                setBundle(readM1SessionCloseBundle(bundleReceipt.artifact));
                setContemplation(readNaraContemplationObject(contemplationReceipt.artifact));
                setQuintessence(readQuintessenceHandle(pasuReceipt.artifact));
                setLoad('loaded');
            })
            .catch(err => {
                if (disposed) {
                    return;
                }
                // A session that never closed has no bundle — that is an honest
                // absence, not a defect, and it reads as one.
                setError(err instanceof Error ? err.message : String(err));
                setBundle(null);
                setContemplation(null);
                setQuintessence(null);
                setLoad('error');
            });
        return () => {
            disposed = true;
        };
    }, [connected, activeSession, reloads]);

    const refresh = useCallback(() => setReloads(count => count + 1), []);

    const chrome = privacyChrome('protected_local_handle_only');
    const witnessBits =
        contemplation?.state === 'ready'
            ? contemplation.verifier.witnessBits
            : bundle?.state === 'ready'
              ? bundle.witnessBits
              : null;

    return (
        <div
            className={`m4-session-close-ceremony ${chrome.className}`}
            title={chrome.title}
            data-testid="session-close-ceremony"
            data-session-key={activeSession ?? ''}
            data-load-state={load}
        >
            <header className="pane-toolbar">
                <span>Session close — the Möbius turn</span>
                <button type="button" data-testid="ceremony-refresh" onClick={refresh}>
                    Re-read
                </button>
            </header>

            {!activeSession ? (
                <p className="pane-message" data-testid="ceremony-no-session">
                    No active session — a ceremony needs a session that closed.
                </p>
            ) : null}
            {load === 'error' ? (
                <p className="pane-message" data-testid="ceremony-absent">
                    {`No persisted close for this session yet — ${error}`}
                </p>
            ) : null}

            {/* (a) the wisdom delta, as the substrate actually carries it */}
            <section className="ceremony-section" data-testid="ceremony-wisdom-delta">
                <h3>Wisdom delta</h3>
                {contemplation?.state === 'ready' ? (
                    <>
                        <p className="ceremony-handle" data-testid="ceremony-contemplation-ref">
                            {contemplation.contemplationRef}
                        </p>
                        <dl className="ceremony-triplet" data-testid="ceremony-triplet">
                            <dt>{`LLM ${contemplation.llm.position}`}</dt>
                            <dd data-testid="ceremony-triplet-llm">
                                {`${contemplation.llm.loadedAgentCount} agents · psyche-anchor ${
                                    contemplation.llm.psycheAnchorCoherent ? 'coherent' : 'incoherent'
                                } · ${contemplation.llm.matchedAnchorCodonCount} matched codons`}
                            </dd>
                            <dt>{`EBM ${contemplation.ebm.position}`}</dt>
                            <dd data-testid="ceremony-triplet-ebm">
                                {`gradient ${contemplation.ebm.gradientMagnitude} · gauge trio ${
                                    contemplation.ebm.gaugeTrioCoherent ? 'coherent' : 'incoherent'
                                } · ${contemplation.ebm.coherenceSquares
                                    .map(square => `${square.label} ${square.score}`)
                                    .join(' · ')}`}
                            </dd>
                            <dt>{`Verifier ${contemplation.verifier.position}`}</dt>
                            <dd data-testid="ceremony-triplet-verifier">
                                {`coherence ${contemplation.verifier.coherenceScore} · arch-9 ${
                                    contemplation.verifier.arch9Wholeness ? 'whole' : 'unwhole'
                                } · syntax layers ${
                                    contemplation.verifier.syntaxLayersWitnessed
                                        ? 'witnessed'
                                        : 'unwitnessed'
                                }`}
                            </dd>
                        </dl>
                        {/* The composed delta TEXT is deliberately not persisted:
                            the projection reduces bodies to counts. Saying so is
                            the honest alternative to a fabricated hex strip. */}
                        <p className="ceremony-note" data-testid="ceremony-delta-note">
                            The composed 4′-5′-0′ delta text stays at the close-time RPC; the
                            persisted projection carries its handle and reduced readings only.
                        </p>
                    </>
                ) : (
                    <p className="pane-message" data-testid="ceremony-contemplation-blocked">
                        {contemplation?.state === 'blocked'
                            ? contemplation.reason
                            : 'awaiting a persisted contemplation object'}
                    </p>
                )}
            </section>

            {/* (b) the Möbius return — handle-form quintessence only */}
            <section className="ceremony-section" data-testid="ceremony-mobius">
                <h3>Möbius return</h3>
                {quintessence?.state === 'ready' ? (
                    <p className="ceremony-handle" data-testid="ceremony-quintessence-handle">
                        {`quintessence ${quintessence.handle}…${
                            quintessence.clock ? ` · clock ${quintessence.clock}` : ''
                        }`}
                    </p>
                ) : (
                    <p className="pane-message" data-testid="ceremony-quintessence-absent">
                        {quintessence?.state === 'absent'
                            ? quintessence.reason
                            : 'awaiting the PASU quintessence reflection'}
                    </p>
                )}
                <p className="ceremony-note" data-testid="ceremony-xor-note">
                    The byte-level XOR fold needs the kernel’s 8-byte wisdom delta
                    (M4_Epii_Integration.wisdom_delta); it is not projected onto any gateway
                    surface, so no fold is animated here.
                </p>
                {bundle?.state === 'ready' ? (
                    <p data-testid="ceremony-closure">
                        {`M1 orbit ${bundle.m1Closed ? 'closed' : 'open'} (+${
                            bundle.m1GeneratorStep
                        }) · octave ${bundle.audioReturned ? 'returned' : 'unreturned'}`}
                    </p>
                ) : null}
            </section>

            {/* (c) four contemplation seeds — Arch 3/5/7/9 */}
            <section className="ceremony-section" data-testid="ceremony-seeds">
                <h3>Contemplation seeds</h3>
                <ul className="ceremony-seed-list">
                    {seeds.map(seed => (
                        <li
                            key={seed.archetype}
                            className="ceremony-seed"
                            data-testid={`ceremony-seed-${seed.register}`}
                            data-archetype={seed.archetype}
                            data-state={seed.state}
                        >
                            <span className="ceremony-seed-register">{`Arch ${seed.archetype} · ${seed.register}`}</span>
                            <span className="ceremony-seed-prompt">
                                {seed.prompt ??
                                    (seed.state === 'blocked'
                                        ? 'no prompt LUT on this profile'
                                        : 'this slot carries no prompt')}
                            </span>
                        </li>
                    ))}
                </ul>
            </section>

            {/* (d) nine virtue lamps */}
            <section className="ceremony-section" data-testid="ceremony-virtues">
                <h3>Virtue witness</h3>
                {witnessBits ? (
                    <ul className="ceremony-lamps" data-testid="ceremony-lamps">
                        {M0_VIRTUE_LABELS.map((label, index) => (
                            <li
                                key={label}
                                className="ceremony-lamp"
                                data-testid={`ceremony-lamp-${index}`}
                                data-lit={witnessBits[index] ? 'true' : 'false'}
                                title={label}
                            >
                                {label}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="pane-message" data-testid="ceremony-virtues-absent">
                        awaiting a witnessed close
                    </p>
                )}
                {bundle?.state === 'blocked' ? (
                    <p className="pane-message" data-testid="ceremony-bundle-blocked">
                        {bundle.reason}
                    </p>
                ) : null}
            </section>
        </div>
    );
}
