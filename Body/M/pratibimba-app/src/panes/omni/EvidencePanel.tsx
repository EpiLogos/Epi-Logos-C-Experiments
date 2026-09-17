/**
 * Coordinate: M' `/` membrane (Evidence tab body — Track 27.T27.5)
 * Residency: Body/M/pratibimba-app/src/panes/omni
 * Position (#n): the omniEvidence fold body (27.5; 15.2 "the tab IS the surface").
 * Actualises: the deposition fold — the canonical landing surface for
 *   MediatedRunEvidencePacket (26.10 schema, imported not redefined). NO MODAL
 *   (15.2): the tab is the surface. Mediator + privacy-class filters; a
 *   selectable packet list; the full packet view for the selection; cross-fold
 *   deep-links that activate the Dispatch Trace / Tool Stream tabs (15.11).
 *   Selection + filters persist in the OmniPanel session store. Honest empty
 *   state until real packets are deposited — nothing synthesised.
 * Public surface: EvidencePanel.
 * Does NOT own: the schema (evidenceShapes.ts); the deposit path (s5.epii.deposit,
 *   decision register, virtue-witness — feed-gated, land later); intent routing (27.9).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { gateway } from '../../bridge/gatewayHolder';
import { SessionClient, type SessionRecord } from '../../bridge/sessionClient';
import { useProvenanceStore, useSessionStore, useTickStore } from '../../state/stores';
import { useProfileTick } from '../../state/useProfileTick';
import { dispatchGenealogyFromSessions } from './dispatchGenealogyFromSessions';
import type { MediatedRunEvidencePacket } from './evidenceShapes';
import { EvidencePacketList } from './EvidencePacketList';
import { EvidencePacketView } from './EvidencePacketView';
import { EvidenceDepositForm } from './evidence/EvidenceDepositForm';
import {
    DEPOSIT_LIST_METHOD,
    readEvidenceDeposits,
    type EvidenceDeposit
} from './evidence/evidenceDeposits';
import {
    evidencePacketsFromDeposits,
    type EvidencePacketContext
} from './evidence/evidencePacketProducer';
import type { DispatchGenealogyRecord } from './dispatchGenealogy';
import {
    loadMediationCapabilitySnapshot,
    type MediationCapabilitySnapshot
} from './omnipanelCapabilities';
import { privacyClassKind, type PrivacyClassKind } from './PrivacyClassBadge';
import { useOmniPanelSessionStore, useOmniPanelTabState } from './omnipanelSessionState';

const MEDIATOR_FILTERS = ['all', 'pi', 'anima', 'aletheia'] as const;
const PRIVACY_FILTERS: readonly (PrivacyClassKind | 'all')[] = ['all', 'public', 'protected', 'private'];

export function EvidencePanel({
    packets: injectedPackets,
    genealogy = [],
    packetContext
}: {
    /** Overrides the live feed. Left undefined in the app; tests pass fixtures. */
    readonly packets?: readonly MediatedRunEvidencePacket[];
    /** Live run genealogy — the SAME records the Dispatch fold folds. */
    readonly genealogy?: readonly DispatchGenealogyRecord[];
    /** The live shell context a packet is anchored to. Without it no packet can
     *  be composed, because a packet that invented its own session or profile
     *  generation would anchor evidence to a moment that never happened. */
    readonly packetContext?: EvidencePacketContext;
} = {}) {
    const tab = useOmniPanelTabState('evidence');
    const patchTab = useOmniPanelSessionStore(s => s.patchTab);
    const selectTab = useOmniPanelSessionStore(s => s.selectTab);
    // 27.T27.5 — the deposit affordance is inline (NOT a modal; 15.2 "the tab
    // IS the surface"). Open state is local to the fold.
    const [depositOpen, setDepositOpen] = useState(false);

    // 26.T26.4 — the fold's real feed, over the read method 27:52 names for this
    // surface. Deposits are rendered as DEPOSITS, not cast to packets: a deposit
    // carries no dispatch trace, tool stream or gate landing, and inventing them
    // to fill a packet view is the fabrication this plan set exists to stop.
    const connected = useProvenanceStore(state => state.connection.connected);
    const sessionKey = useSessionStore(state => state.sessionKey);
    const dayNow = useSessionStore(state => state.dayNow);
    const tick = useProfileTick();
    const cachedProfile = useTickStore(state => state.profile);
    const [deposits, setDeposits] = useState<readonly EvidenceDeposit[]>([]);
    const [depositError, setDepositError] = useState('');
    const [reloads, setReloads] = useState(0);
    // 28.T28.8 — the capability-matrix face of the IOD-17 gate. Read in the SAME
    // effect as the deposits (one guard, one dependency list): a second effect
    // keyed on its own status is how 28.T28.6 span the gateway in a tight loop.
    const [capabilitySnapshot, setCapabilitySnapshot] = useState<MediationCapabilitySnapshot | null>(
        null
    );

    useEffect(() => {
        if (!connected) {
            return;
        }
        let disposed = false;
        gateway()
            .invoke(DEPOSIT_LIST_METHOD, {})
            .then(receipt => {
                if (disposed) {
                    return;
                }
                setDeposits(readEvidenceDeposits(receipt.artifact));
                setDepositError('');
            })
            .catch(err => {
                if (disposed) {
                    return;
                }
                setDeposits([]);
                setDepositError(err instanceof Error ? err.message : String(err));
            });
        loadMediationCapabilitySnapshot(gateway())
            .then(next => {
                if (!disposed) {
                    setCapabilitySnapshot(next);
                }
            })
            // A matrix this fold cannot read means no IOD-17 readout on the
            // packets it composes — an unanswered face, not a broken fold.
            .catch(() => undefined);
        return () => {
            disposed = true;
        };
    }, [connected, reloads]);

    const refreshDeposits = useCallback(() => setReloads(count => count + 1), []);

    // The run half. Read from the SAME session lineage the Dispatch fold folds
    // (SessionClient -> dispatchGenealogyFromSessions), never a second source
    // that could disagree with the tree the reader sees one tab away.
    const [sessions, setSessions] = useState<SessionRecord[]>([]);
    useEffect(() => {
        if (!connected || genealogy.length > 0) {
            return;
        }
        let disposed = false;
        new SessionClient(gateway())
            .list()
            .then(records => {
                if (!disposed) {
                    setSessions(records);
                }
            })
            // A session list this fold cannot read means no genealogy, which
            // means packets without a recorded dispatch — not a broken fold.
            .catch(() => undefined);
        return () => {
            disposed = true;
        };
    }, [connected, genealogy.length, reloads]);

    const liveGenealogy = useMemo(
        () => (genealogy.length > 0 ? genealogy : dispatchGenealogyFromSessions(sessions)),
        [genealogy, sessions]
    );

    const liveContext = useMemo<EvidencePacketContext | undefined>(() => {
        if (packetContext) {
            return packetContext;
        }
        if (!sessionKey || !dayNow) {
            // No session or no day anchor: a packet composed now would be
            // anchored to a moment the shell cannot name.
            return undefined;
        }
        return {
            sessionKey,
            dayNowContext: dayNow,
            profileGeneration: tick.generation ?? 0,
            // Two of the nine canonical readiness ids: a stale cached profile is
            // still readable, it is just not current, and the packet says which.
            bridgeReadinessHandle: cachedProfile?.stale
                ? 'degraded_but_readable'
                : 'ready_public_current',
            currentProfile: (cachedProfile?.profile ?? {}) as Readonly<Record<string, unknown>>,
            sessionRuntime: { sessionCount: sessions.length, graphRevision: tick.graphRevision },
            capabilitySnapshot
        };
    }, [
        packetContext,
        sessionKey,
        dayNow,
        tick.generation,
        tick.graphRevision,
        cachedProfile,
        sessions.length,
        capabilitySnapshot
    ]);

    // 26.T26.4 — the packet feed. Composed from the anchored deposits and the
    // live run genealogy; a deposit without anchors yields no packet, and
    // without shell context no packet can be anchored at all.
    const packets = useMemo(
        () =>
            injectedPackets ??
            (liveContext ? evidencePacketsFromDeposits(deposits, liveGenealogy, liveContext) : []),
        [injectedPackets, deposits, liveGenealogy, liveContext]
    );

    const mediatorFilter = tab.filters.mediator ?? 'all';
    const privacyFilter = (tab.filters.privacyClass ?? 'all') as PrivacyClassKind | 'all';

    const visible = useMemo(
        () =>
            packets.filter(packet => {
                const mediatorOk = mediatorFilter === 'all' || packet.mediatedBy.kind === mediatorFilter;
                const privacyOk =
                    privacyFilter === 'all' || privacyClassKind(packet.privacyClass) === privacyFilter;
                return mediatorOk && privacyOk;
            }),
        [packets, mediatorFilter, privacyFilter]
    );

    const selected = tab.selectedPacketId
        ? packets.find(packet => packet.id === tab.selectedPacketId) ?? null
        : null;

    const setMediator = (mediator: string) =>
        patchTab('evidence', { filters: { ...tab.filters, mediator: mediator === 'all' ? undefined : mediator } });
    const setPrivacy = (privacyClass: string) =>
        patchTab('evidence', { filters: { ...tab.filters, privacyClass: privacyClass === 'all' ? undefined : privacyClass } });
    const onSelect = (packetId: string) => patchTab('evidence', { selectedPacketId: packetId });
    const onOpenDispatchTrace = (dispatchNodeId: string) => {
        // 15.11: activate the Dispatch Trace tab at this packet's genealogy node.
        patchTab('dispatch-trace', { selectedNodeId: dispatchNodeId });
        selectTab('dispatch-trace');
    };
    // 26.4 cross-link law (15.2): the same record selected in either surface
    // highlights BOTH. Activating a fold without carrying the record would
    // strand the user in an unrelated list — so each of these carries it.
    const onOpenToolStream = (packetId: string) => {
        const packet = packets.find(entry => entry.id === packetId) ?? null;
        const firstEvent = packet?.toolStream[0]?.id ?? null;
        patchTab('tool-stream', { selectedEventId: firstEvent });
        selectTab('tool-stream');
    };
    /** 19.7 close-path: the Review fold IS the contemplation landing surface
     *  (15.2 — no modal), and it reads the object for the selected review. */
    const onOpenContemplation = () => {
        if (selected) {
            patchTab('review', { selectedReviewId: selected.reviewId });
        }
        selectTab('review');
    };
    return (
        <section
            className="evidence-panel"
            data-testid="evidence-panel"
            // Why the packet list is empty is otherwise unknowable from the
            // surface: no anchored deposit, or no shell context to anchor one to.
            data-packet-context={liveContext ? 'ready' : 'absent'}
            data-packet-count={packets.length}
            data-anchored-deposits={deposits.filter(d => d.evidenceAnchors).length}
        >
            <header className="evidence-header" data-testid="evidence-header">
                <div className="evidence-title">
                    <strong>Evidence</strong>
                    <span className="evidence-subtitle">MediatedRunEvidencePacket deposition fold</span>
                    <span className="evidence-count">{packets.length} packets</span>
                    <button
                        type="button"
                        className={`evidence-deposit-new${depositOpen ? ' active' : ''}`}
                        data-testid="evidence-deposit-new"
                        aria-pressed={depositOpen}
                        aria-expanded={depositOpen}
                        onClick={() => setDepositOpen(open => !open)}
                    >
                        {depositOpen ? 'close deposit' : 'deposit new'}
                    </button>
                </div>
                <div className="evidence-controls">
                    <span className="evidence-filters" role="group" aria-label="mediator filter">
                        {MEDIATOR_FILTERS.map(mediator => (
                            <button
                                key={mediator}
                                type="button"
                                className={`evidence-mediator-filter${mediatorFilter === mediator ? ' active' : ''}`}
                                data-testid={`evidence-mediator-filter-${mediator}`}
                                aria-pressed={mediatorFilter === mediator}
                                onClick={() => setMediator(mediator)}
                            >
                                {mediator}
                            </button>
                        ))}
                    </span>
                    <span className="evidence-filters" role="group" aria-label="privacy filter">
                        {PRIVACY_FILTERS.map(privacy => (
                            <button
                                key={privacy}
                                type="button"
                                className={`evidence-privacy-filter${privacyFilter === privacy ? ' active' : ''}`}
                                data-testid={`evidence-privacy-filter-${privacy}`}
                                aria-pressed={privacyFilter === privacy}
                                onClick={() => setPrivacy(privacy)}
                            >
                                {privacy}
                            </button>
                        ))}
                    </span>
                </div>
            </header>

            {depositOpen && (
                <EvidenceDepositForm
                    onDeposited={() => {
                        setDepositOpen(false);
                        // The deposit just landed in the review store; re-read so
                        // the fold shows it rather than waiting for a remount.
                        refreshDeposits();
                    }}
                />
            )}

            {/* The deposition list — real rows from the live read method. */}
            <section className="evidence-deposits" data-testid="evidence-deposits">
                <header className="evidence-deposits-header">
                    <strong>Deposits</strong>
                    <span className="evidence-deposit-count" data-testid="evidence-deposit-count">
                        {deposits.length}
                    </span>
                    <button
                        type="button"
                        data-testid="evidence-deposits-refresh"
                        onClick={refreshDeposits}
                    >
                        re-read
                    </button>
                </header>
                {depositError ? (
                    <p className="pane-message" data-testid="evidence-deposits-error">
                        {`deposit list unavailable — ${depositError}`}
                    </p>
                ) : deposits.length === 0 ? (
                    <p className="pane-message" data-testid="evidence-deposits-empty">
                        nothing deposited yet
                    </p>
                ) : (
                    <ul className="evidence-deposit-list">
                        {deposits.map(deposit => (
                            <li
                                key={deposit.itemId}
                                className="evidence-deposit-row"
                                data-testid={`evidence-deposit-${deposit.itemId}`}
                                data-deposit-type={deposit.depositType}
                                data-status={deposit.status}
                            >
                                <span className="evidence-deposit-title">{deposit.title}</span>
                                <span className="evidence-deposit-source">
                                    {deposit.sourceCoordinate ?? '—'}
                                </span>
                                {deposit.artifactPath ? (
                                    <span className="evidence-deposit-artifact">
                                        {deposit.artifactPath}
                                    </span>
                                ) : null}
                                {deposit.requiresHuman ? (
                                    <span className="evidence-deposit-gate">needs human</span>
                                ) : null}
                            </li>
                        ))}
                    </ul>
                )}
                {/* A deposit is a review item, not a run-evidence packet. Saying
                    so keeps the two counts above from reading as one number. */}
                <p className="evidence-deposits-note" data-testid="evidence-deposits-note">
                    A deposit records that evidence was filed. The full
                    MediatedRunEvidencePacket view below needs a packet producer — no
                    gateway method emits dispatch traces or tool streams yet.
                </p>
            </section>

            <EvidencePacketList packets={visible} selectedId={tab.selectedPacketId} onSelect={onSelect} />

            {selected && (
                <EvidencePacketView
                    packet={selected}
                    // DR-WC-IS-2: the `/` membrane is the ABBREVIATED folding.
                    // The full governance audit of this same record is the
                    // `agenticControlRoom` pane of `ide-deep`, which reads the
                    // selection made here.
                    fold="abbreviated"
                    onOpenDispatchTrace={onOpenDispatchTrace}
                    onOpenToolStream={onOpenToolStream}
                    onOpenContemplation={onOpenContemplation}
                />
            )}
        </section>
    );
}
