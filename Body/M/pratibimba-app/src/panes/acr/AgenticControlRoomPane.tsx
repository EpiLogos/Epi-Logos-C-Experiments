/**
 * Coordinate: M' M5' chrome (Agentic Control Room deep pane — 28.T28.5 (d))
 * Residency: Body/M/pratibimba-app/src/panes/acr
 * Position (#n): the `agenticControlRoom` surface of [[CHROME-CONTRACT]] §2,
 *   mounted in `personal-deep-main` — the governance half of the `ide-deep`
 *   pane set 52.T4 built. DEEP-ONLY on purpose: the daily shell previews, the
 *   subsystem depth delivers ([[M'-TAURI-PORT-SPEC]] :65), and DR-WC-IS-1 makes
 *   the abbreviated always-on render the OmniPanel's job, not this one's.
 * Actualises: DR-WC-IS-1 RESOLVED — GOVERNANCE PRIMARY. Six sections, and the
 *   composition is the deliverable: the T8 CONTENTS ALREADY EXIST as `/` folds
 *   (27.T27.10 migrated them out of the frozen ACR package), so this pane
 *   composes them in their deep governance reading instead of building a second
 *   set of the same widgets over the same methods.
 *
 *     (1) the Pi-monitor reframe banner (28.5 (c));
 *     (2) the DR-M5-1 roster — Pi + Anima + six Aletheia techne guardians as
 *         executable dispatch targets, the six Psyche aspect registers held
 *         beside them and marked NON-executable, Sophia among them (28.5 (b));
 *     (3) the RunTree for governance audit — the real Pi → Anima → subagent
 *         genealogy (`DispatchGenealogyTree`, which already nests Aletheia
 *         fan-outs in `AletheiaCrystallisationGroup` and renders `VetoBanner`
 *         per node, so 28.5 (e)'s subagent trace + non-blocking veto is carried
 *         rather than re-drawn), with node click-through to the Evidence fold on
 *         `mediatedRunEvidencePacketId`, the 26.T26.7
 *         `agentic-control-room.open-tool-stream` route carrying the same node
 *         into the `/` membrane's TEMPORAL fold (26.7 (a)'s ToolStream is
 *         `ToolStreamPanel` in `omniLogs`, and DR-WC-IS-2 makes the time-ordered
 *         render agentic primary — one dataset, two foldings, not two
 *         instances; the canonical `select-run` key resolves to the STRUCTURAL
 *         fold, which is why that carriage needed a route of its own), and an
 *         HONEST hold on the Backend Studio link until 28.13 lands it;
 *     (4) the review governance queue — `s5'.review.inbox` → the decision
 *         controls, carrying the IOD-17 three-cell parity readout;
 *         28.T28.9 made this the DEEP half of DR-WC-IS-2 for the REVIEW
 *         surface. The rows are `ReviewItemDeep` (28.9 (a)) off the same live
 *         inbox, rendered by the same `ReviewItemDeepView` the `/` membrane's
 *         Review fold renders abbreviated — one component, one producer, two
 *         foldings. This side carries the two inputs the abbreviated side does
 *         not (the live capability matrix and the folded genealogy), which is
 *         why the three-cell parity matrix and the dispatch click-through are
 *         HERE. ONE row identity: `perTabState.review.selectedReviewId`, so a
 *         row chosen in either surface is the one the other renders;
 *     (5) the run-lifecycle controls as an UNWIRED surface (`s5'.epii.runtime_control`
 *         is registered nowhere), stating the reason rather than faking a button;
 *     (6) the full `MediatedRunEvidencePacket` deposit, through the already-live
 *         `EvidenceDepositForm` over `s5'.epii.deposit`;
 *     (7) 28.T28.8 — the DEEP evidence render DR-WC-IS-2 asks for. The frozen
 *         tree had two evidence widgets; this carrier has ONE evidence fold, so
 *         the `/` membrane keeps the abbreviated always-on folding and the FULL
 *         packet audit (IOD-17 three-face parity, the open dispatch-trace
 *         mini-graph with tick + psyche-facet per node, the axiom-translation
 *         seam) lands here, `ide-deep` only. Same producer, same deposits, ONE
 *         record identity: this section reads and writes
 *         `perTabState.evidence.selectedPacketId`, which is what the Evidence
 *         fold selects and what (3)'s evidence click-through already sets — so
 *         a packet chosen in either surface is the one the other renders.
 *
 *   Because this pane already holds the live capability projection, the packets
 *   it composes carry a POPULATED `GateLanding.iod17Parity` (26.10 declared the
 *   field; nothing filled it until 28.T28.8).
 *
 *   MOUNT DISCIPLINE (THE OPENING-TAB LAW, `ui/deepPaneSet.ts`): this pane
 *   writes NO shared singleton state on mount. Its three effects are gateway
 *   READS (capability snapshot, session lineage, review inbox); the only store
 *   writes it can cause are the OmniPanel routing a user click fires. Hence no
 *   `mountPublishes` declaration — and it is still ordered after
 *   `canonUpdateLedger` so the personal deep tabset does not open on a surface
 *   that talks to the gateway three times before anyone asks it to.
 * Public surface: AgenticControlRoomPane.
 * Does NOT own: the genealogy fold or its tree face (`panes/omni/*`), the
 *   deposit form (`panes/omni/evidence/EvidenceDepositForm.tsx`), the capability
 *   snapshot (`panes/omni/omnipanelCapabilities.ts`), the human gate
 *   (`panes/m5ReviewGate.ts`), the pane-set position (`ui/deepPaneSet.ts`), or
 *   the OmniPanel's abbreviated renders (DR-WC-IS-2).
 * Contract: [[CHROME-CONTRACT]] §2 + §5 · [[DR-M5-1]] · [[DR-ACR-1]] ·
 *   rerun tranche [[28.T28.5]].
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { gateway } from '../../bridge/gatewayHolder';
import { SessionClient, type SessionRecord } from '../../bridge/sessionClient';
import { useProvenanceStore, useSessionStore, useTickStore } from '../../state/stores';
import { useProfileTick } from '../../state/useProfileTick';
import { DispatchGenealogyTree } from '../omni/DispatchGenealogyTree';
import { dispatchGenealogyFromSessions } from '../omni/dispatchGenealogyFromSessions';
import { genealogyIndex, type DispatchDeepLink } from '../omni/dispatchGenealogy';
import { EvidenceDepositForm } from '../omni/evidence/EvidenceDepositForm';
import {
    DEPOSIT_LIST_METHOD,
    readEvidenceDeposits,
    type EvidenceDeposit
} from '../omni/evidence/evidenceDeposits';
import {
    evidencePacketsFromDeposits,
    type EvidencePacketContext
} from '../omni/evidence/evidencePacketProducer';
import { EvidencePacketList } from '../omni/EvidencePacketList';
import { EvidencePacketView } from '../omni/EvidencePacketView';
import {
    useOmniPanelSessionStore,
    useOmniPanelTabState
} from '../omni/omnipanelSessionState';
import { fireOmniPanelRoute } from '../omni/omnipanelIntentRouter';
import {
    loadMediationCapabilitySnapshot,
    type MediationCapabilitySnapshot
} from '../omni/omnipanelCapabilities';
import { PSYCHE_FACET_LABEL, psycheFacetClass } from '../omni/psycheFacet';
import { AbortRetryContinueControls } from './AbortRetryContinueControls';
import { PiRuntimeMonitorBanner } from './PiRuntimeMonitorBanner';
import { ReviewDecisionControls } from './ReviewDecisionControls';
import { ReviewItemDeepView } from '../omni/review/ReviewItemDeepView';
import {
    reviewItemDeepById,
    reviewItemsDeep
} from '../omni/review/reviewItemDeep';
import { REVIEW_EVIDENCE_ROUTE } from '../omni/review/reviewPaneSeams';
import { ACR_FOLD_ROUTES, ACR_METHOD_BINDINGS, acrFoldRoute, acrRoster } from './acrGovernance';
import { REVIEW_INBOX_METHOD, parseReviewInbox, type AcrReviewItem } from './acrReviewInbox';

/** Same cadence as the Dispatch fold: live without hammering the gateway. */
const REFETCH_TICKS = 30;

/** 26.T26.7 — the crossing that makes 26.7 (a)'s `<ToolStream />` reachable. */
const TEMPORAL_FOLD_ROUTE = acrFoldRoute('temporal-fold');

export function AgenticControlRoomPane() {
    const connected = useProvenanceStore(s => s.connection.connected);
    const tick = useProfileTick();
    const roster = useMemo(acrRoster, []);

    const [snapshot, setSnapshot] = useState<MediationCapabilitySnapshot | null>(null);
    const [snapshotError, setSnapshotError] = useState<string | null>(null);
    const [sessions, setSessions] = useState<SessionRecord[] | null>(null);
    const [genealogyError, setGenealogyError] = useState<string | null>(null);
    const [reviewItems, setReviewItems] = useState<readonly AcrReviewItem[] | null>(null);
    const [reviewError, setReviewError] = useState<string | null>(null);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [collapsedIds, setCollapsedIds] = useState<readonly string[]>([]);
    const [heldBackendLink, setHeldBackendLink] = useState<string | null>(null);
    // 28.T28.8 — the DEEP evidence render (DR-WC-IS-2). The `/` fold stays the
    // abbreviated always-on one; the full MediatedRunEvidencePacket audit is
    // here, in `ide-deep`, over the SAME producer and the SAME selection.
    const [deposits, setDeposits] = useState<readonly EvidenceDeposit[]>([]);
    const [depositError, setDepositError] = useState<string | null>(null);
    const evidenceTab = useOmniPanelTabState('evidence');
    // 28.T28.9 — the review row identity is SHARED with the `/` Review fold, the
    // same way 28.T28.8 shared the packet identity: two foldings of one queue
    // cannot disagree about which row is selected if there is only one place
    // that answer lives. Read on render, written only on a click (the
    // opening-tab law: this pane seizes no shared state on mount).
    const reviewTab = useOmniPanelTabState('review');
    const patchTab = useOmniPanelSessionStore(s => s.patchTab);
    const selectTab = useOmniPanelSessionStore(s => s.selectTab);
    const sessionKey = useSessionStore(s => s.sessionKey);
    const dayNow = useSessionStore(s => s.dayNow);
    const cachedProfile = useTickStore(s => s.profile);

    const refresh = useCallback(() => {
        if (!connected) {
            return;
        }
        loadMediationCapabilitySnapshot(gateway())
            .then(next => {
                setSnapshot(next);
                setSnapshotError(null);
            })
            .catch(err => setSnapshotError(err instanceof Error ? err.message : String(err)));
        new SessionClient(gateway())
            .list()
            .then(next => {
                setSessions(next);
                setGenealogyError(null);
            })
            .catch(err => setGenealogyError(err instanceof Error ? err.message : String(err)));
        gateway()
            .invoke(REVIEW_INBOX_METHOD, { status: 'open' })
            .then(receipt => {
                setReviewItems(parseReviewInbox(receipt.artifact));
                setReviewError(null);
            })
            .catch(err => setReviewError(err instanceof Error ? err.message : String(err)));
        gateway()
            .invoke(DEPOSIT_LIST_METHOD, {})
            .then(receipt => {
                setDeposits(readEvidenceDeposits(receipt.artifact));
                setDepositError(null);
            })
            .catch(err => {
                setDeposits([]);
                setDepositError(err instanceof Error ? err.message : String(err));
            });
    }, [connected]);

    const refetchEpoch = Math.floor((tick.generation ?? 0) / REFETCH_TICKS);
    useEffect(() => {
        refresh();
    }, [refresh, refetchEpoch]);

    const records = useMemo(() => dispatchGenealogyFromSessions(sessions ?? []), [sessions]);
    const index = useMemo(() => genealogyIndex(records), [records]);
    const selectedRecord = selectedNodeId ? (index.get(selectedNodeId) ?? null) : null;

    // 28.T28.9 — the DEEP folding of the governance queue. Same producer the `/`
    // Review fold calls; this surface simply HAS the two inputs the abbreviated
    // one does not (the live capability matrix and the folded genealogy), which
    // is exactly what DR-WC-IS-2 gives the deep half.
    const deepReviewItems = useMemo(
        () =>
            reviewItemsDeep({
                items: reviewItems ?? [],
                deposits,
                genealogy: records,
                snapshot,
                sessionKey
            }),
        [reviewItems, deposits, records, snapshot, sessionKey]
    );
    const selectedReview = reviewItemDeepById(deepReviewItems, reviewTab.selectedReviewId);
    const selectReview = (itemId: string | null) =>
        patchTab('review', { selectedReviewId: itemId });

    // The deep evidence audit reads the SAME shell anchors the `/` fold does; a
    // packet composed without them would anchor evidence to a moment the shell
    // cannot name, so without them there are no packets rather than fake ones.
    const packetContext = useMemo<EvidencePacketContext | null>(() => {
        if (!sessionKey || !dayNow) {
            return null;
        }
        return {
            sessionKey,
            dayNowContext: dayNow,
            profileGeneration: tick.generation ?? 0,
            bridgeReadinessHandle: cachedProfile?.stale
                ? 'degraded_but_readable'
                : 'ready_public_current',
            currentProfile: (cachedProfile?.profile ?? {}) as Readonly<Record<string, unknown>>,
            sessionRuntime: {
                sessionCount: (sessions ?? []).length,
                graphRevision: tick.graphRevision
            },
            // DR-WC-IS-1 makes THIS surface the IOD-17 source of truth, and it
            // already holds the live projection — so the packets it composes
            // carry a three-face readout rather than an unread gate.
            capabilitySnapshot: snapshot
        };
    }, [sessionKey, dayNow, tick.generation, tick.graphRevision, cachedProfile, sessions, snapshot]);

    const packets = useMemo(
        () =>
            packetContext ? evidencePacketsFromDeposits(deposits, records, packetContext) : [],
        [deposits, records, packetContext]
    );
    const selectedPacket =
        packets.find(packet => packet.id === evidenceTab.selectedPacketId) ?? null;

    const onToggleCollapse = (nodeId: string) =>
        setCollapsedIds(previous =>
            previous.includes(nodeId)
                ? previous.filter(entry => entry !== nodeId)
                : [...previous, nodeId]
        );

    const onDeepLink = (link: DispatchDeepLink) => {
        if (link.target === 'omniEvidence') {
            // 28.5 (d): click-through to the Evidence pane on the packet id,
            // through the 27.9 OmniPanel router — the same seam the abbreviated
            // render uses, so both foldings land on ONE evidence surface.
            fireOmniPanelRoute({
                requestedExtensionId: 'omnipanel-shell',
                requestedContributionId: 'dispatch-trace.open-evidence',
                artifactUri: link.evidenceRef
            });
            return;
        }
        // `backendStudio` is §2 `pending` — 28.13 owns it. Routing there would
        // be a deep-link to nothing, so the reference is HELD and disclosed.
        setHeldBackendLink(link.sourceRef);
    };

    return (
        <div className="acr-root" data-testid="agentic-control-room">
            <PiRuntimeMonitorBanner />

            {!connected ? (
                <p className="pane-message" data-testid="acr-disconnected">
                    Gateway disconnected — the control room reads live dispatch, capability, and
                    review state and will not fabricate any of it.
                </p>
            ) : null}

            {/* (2) DR-M5-1 roster collapse. */}
            <section className="acr-roster" data-testid="acr-roster">
                <h4>Dispatch roster</h4>
                <ul className="acr-roster-targets" role="list" data-testid="acr-dispatch-targets">
                    {roster.dispatchTargets.map(target => (
                        <li
                            key={target.actor}
                            role="listitem"
                            data-testid={`acr-dispatch-target-${target.actor}`}
                            data-role={target.role}
                            data-mode={target.mode}
                            data-executable="true"
                        >
                            <strong>{target.actor}</strong>
                            <span className="acr-roster-mode">{target.mode}</span>
                        </li>
                    ))}
                </ul>
                <p className="acr-roster-note" data-testid="acr-aspect-note">
                    Psyche aspect registers — authorial voices composed by Anima, never dispatch
                    targets (DR-M5-1).
                </p>
                <ul className="acr-roster-aspects" role="list" data-testid="acr-aspect-registers">
                    {roster.aspectRegisters.map(aspect => (
                        <li
                            key={aspect.register}
                            role="listitem"
                            className={psycheFacetClass(aspect.facet)}
                            data-testid={`acr-aspect-register-${aspect.register}`}
                            data-executable="false"
                        >
                            <span className="acr-aspect-swatch" aria-hidden="true" />
                            {PSYCHE_FACET_LABEL[aspect.facet]}
                            <span className="acr-aspect-why">{aspect.why}</span>
                        </li>
                    ))}
                </ul>
                <p className="acr-capability-source" data-testid="acr-capability-source">
                    {snapshot
                        ? `capability matrix: ${snapshot.capabilities.length} capabilities via ${snapshot.method}`
                        : (snapshotError ?? 'capability matrix not loaded')}
                </p>
            </section>

            {/* (3) RunTree for governance audit. */}
            <section className="acr-run-tree" data-testid="acr-run-tree">
                <h4>Run tree — Pi → Anima → subagent</h4>
                {genealogyError ? (
                    <p className="pane-message" data-testid="acr-run-tree-error">
                        {genealogyError}
                    </p>
                ) : (
                    <DispatchGenealogyTree
                        records={records}
                        selectedId={selectedNodeId}
                        onSelect={setSelectedNodeId}
                        onDeepLink={onDeepLink}
                        collapsedIds={collapsedIds}
                        onToggleCollapse={onToggleCollapse}
                    />
                )}
                {selectedRecord ? (
                    <p className="acr-run-selected" data-testid="acr-run-selected">
                        {`${selectedRecord.actor.actor} · ${selectedRecord.route.method} · ${selectedRecord.status}`}
                        {/* THE TEMPORAL FOLD IS NOT DUPLICATED HERE. 26.7 (a)
                            lists a ToolStream among the T8 contents, and the
                            carrier already has exactly one: `ToolStreamPanel`
                            in the `omniLogs` fold. DR-WC-IS-2 makes the
                            time-ordered render agentic primary, so a second
                            instance in the governance pane would be two readers
                            of one dataset with two copies of the same tab
                            state. So the selected run is CARRIED there — and
                            26.T26.7 is the tranche that made that carriage
                            true. It fired `agentic-control-room.select-run`,
                            which the 27.9 table resolves to `dispatch-trace`:
                            the STRUCTURAL fold, i.e. a second copy of the tree
                            already on screen, while the time-ordered list the
                            spec names stayed unreachable from this pane. The
                            route below lands on `tool-stream`, and the node id
                            IS that fold's `selectedEventId` — the structural
                            fold here, the temporal fold there, one node
                            identity across both (15.11). */}
                        <button
                            type="button"
                            data-testid="acr-open-tool-stream"
                            data-lands-on={TEMPORAL_FOLD_ROUTE.landsOn}
                            onClick={() =>
                                fireOmniPanelRoute({
                                    requestedExtensionId: TEMPORAL_FOLD_ROUTE.extensionId,
                                    requestedContributionId: TEMPORAL_FOLD_ROUTE.contributionId,
                                    artifactUri: selectedRecord.id
                                })
                            }
                        >
                            open the temporal fold (Tools) →
                        </button>
                    </p>
                ) : null}
                {heldBackendLink ? (
                    <p className="pane-message" data-testid="acr-backend-studio-held">
                        {`source anchor \`${heldBackendLink}\` — Backend Studio is CHROME-CONTRACT §2 \`pending\` (28.T28.13 owns it), so this reference is held rather than deep-linked to a surface that does not exist.`}
                    </p>
                ) : null}
            </section>

            {/* (4) The governance queue + decision controls.
                28.T28.9 — DR-WC-IS-2's DEEP half for the REVIEW surface. The
                rows are `ReviewItemDeep` off the live `s5'.review.inbox`, and
                this fold renders them at `fold="deep"`: the IOD-17 three-cell
                parity matrix the row carries (populated because this pane holds
                the live capability matrix), the dispatch-genealogy click-through
                on a REAL node id, and the evidence click-through on a packet
                that was really composed. The `/` membrane's Review fold renders
                the SAME rows abbreviated. One selection, shared through
                `perTabState.review.selectedReviewId`. */}
            <section className="acr-review-queue" data-testid="acr-review-queue">
                <h4>Review queue</h4>
                {reviewError ? (
                    <p className="pane-message" data-testid="acr-review-error">
                        {reviewError}
                    </p>
                ) : deepReviewItems.length === 0 ? (
                    <p className="pane-message" data-testid="acr-review-empty">
                        {`no open items on ${REVIEW_INBOX_METHOD}`}
                    </p>
                ) : (
                    <ul className="acr-review-list" role="list">
                        {deepReviewItems.map(item => (
                            <li key={item.itemId} role="listitem">
                                <ReviewItemDeepView
                                    item={item}
                                    fold="deep"
                                    selected={reviewTab.selectedReviewId === item.itemId}
                                    onSelect={itemId =>
                                        selectReview(
                                            reviewTab.selectedReviewId === itemId ? null : itemId
                                        )
                                    }
                                    // Inside the governance pane the structural
                                    // fold is RIGHT HERE — selecting the node
                                    // beats throwing the reader into the `/`
                                    // membrane mid-audit. The same identity
                                    // either way (15.11).
                                    onOpenDispatchTree={setSelectedNodeId}
                                    // The evidence audit is also in this pane
                                    // (28.T28.8, section 7) and reads the shared
                                    // `evidence.selectedPacketId` — so selecting
                                    // it lands the packet HERE and in the `/`
                                    // Evidence fold at once.
                                    onOpenEvidence={packetId => {
                                        patchTab('evidence', { selectedPacketId: packetId });
                                        fireOmniPanelRoute({
                                            ...REVIEW_EVIDENCE_ROUTE,
                                            artifactUri: packetId
                                        });
                                    }}
                                />
                            </li>
                        ))}
                    </ul>
                )}
                {selectedReview ? (
                    <ReviewDecisionControls
                        item={selectedReview}
                        snapshot={snapshot}
                        connected={connected}
                        onResolved={() => {
                            selectReview(null);
                            refresh();
                        }}
                    />
                ) : null}
            </section>

            {/* (5) The unwired run-lifecycle seam, stated. */}
            <AbortRetryContinueControls humanRequired={selectedReview?.requiresHuman ?? false} />

            {/* (6) The full MediatedRunEvidencePacket deposition. */}
            <section className="acr-evidence" data-testid="acr-evidence-deposit">
                <h4>Evidence deposit</h4>
                <EvidenceDepositForm
                    initialDraft={
                        selectedReview ? { reviewId: selectedReview.itemId } : undefined
                    }
                    // 28.T28.8 — a deposit filed here is evidence this pane then
                    // AUDITS, so re-read rather than leaving the audit stale
                    // until the next refetch epoch.
                    onDeposited={refresh}
                />
            </section>

            {/* (7) 28.T28.8 — THE DEEP EVIDENCE RENDER (DR-WC-IS-2). The `/`
                membrane keeps the always-on abbreviated fold; the FULL
                MediatedRunEvidencePacket audit — IOD-17 three-face parity, the
                open dispatch-trace mini-graph with tick + psyche-facet per node,
                the axiom-translation seam — is `ide-deep` only, and it is here.
                ONE record identity across both: this list writes, and reads,
                `perTabState.evidence.selectedPacketId`, which is exactly what the
                Evidence fold selects and what the RunTree's evidence
                click-through above already sets. So a packet chosen in either
                surface is the packet the other renders (bidirectional). */}
            <section className="acr-evidence-audit" data-testid="acr-evidence-audit">
                <h4>Evidence audit — full packet render</h4>
                {depositError ? (
                    <p className="pane-message" data-testid="acr-evidence-audit-error">
                        {`${DEPOSIT_LIST_METHOD} unavailable — ${depositError}`}
                    </p>
                ) : null}
                <p className="acr-evidence-audit-note" data-testid="acr-evidence-audit-note">
                    {packetContext === null
                        ? 'No session or day anchor yet — a packet composed now would be anchored to a moment the shell cannot name, so none is.'
                        : `${packets.length} anchored packet${packets.length === 1 ? '' : 's'} · deep governance folding of the record selected in the Evidence fold (DR-WC-IS-2).`}
                </p>
                <EvidencePacketList
                    packets={packets}
                    selectedId={evidenceTab.selectedPacketId}
                    onSelect={packetId => patchTab('evidence', { selectedPacketId: packetId })}
                />
                {selectedPacket ? (
                    <EvidencePacketView
                        packet={selectedPacket}
                        fold="deep"
                        // The structural fold is THIS pane's RunTree: a trace
                        // click selects the node here rather than throwing the
                        // reader into the `/` membrane mid-audit.
                        onOpenDispatchTrace={nodeId => setSelectedNodeId(nodeId)}
                        // The temporal fold is the `/` membrane's (DR-WC-IS-2),
                        // reached on the SAME seam the Evidence fold uses — one
                        // behaviour, not a second routing shape.
                        onOpenToolStream={packetId => {
                            const packet = packets.find(entry => entry.id === packetId) ?? null;
                            patchTab('tool-stream', {
                                selectedEventId: packet?.toolStream[0]?.id ?? null
                            });
                            selectTab('tool-stream');
                        }}
                    />
                ) : null}
            </section>

            {/* The seam register — every method this surface rides, live or not. */}
            <section className="acr-method-register" data-testid="acr-method-register">
                <h4>Substrate seams</h4>
                <ul role="list">
                    {ACR_METHOD_BINDINGS.map(binding => (
                        <li
                            key={binding.id}
                            role="listitem"
                            data-testid={`acr-seam-${binding.id}`}
                            data-status={binding.status}
                        >
                            <code>{binding.method}</code>
                            <span className="acr-seam-status">{binding.status}</span>
                            <span className="acr-seam-purpose">{binding.purpose}</span>
                            {binding.unwiredReason ? (
                                <span className="acr-seam-reason">{binding.unwiredReason}</span>
                            ) : null}
                            {binding.correction ? (
                                <span className="acr-seam-correction">
                                    {`spec named \`${binding.specNamed}\` — ${binding.correction}`}
                                </span>
                            ) : null}
                        </li>
                    ))}
                </ul>
                {/* 26.T26.7 — the fold crossings, held to the same standard. A
                    method register cannot cover them: a crossing rides the 27.9
                    intent table, and this tranche found one that named a fold it
                    did not open. So each row states the fold it activates. */}
                <h4>Fold crossings</h4>
                <ul role="list" data-testid="acr-fold-routes">
                    {ACR_FOLD_ROUTES.map(route => (
                        <li
                            key={route.id}
                            role="listitem"
                            data-testid={`acr-fold-route-${route.id}`}
                            data-lands-on={route.landsOn}
                            data-direction={route.direction}
                        >
                            <code>{route.routeKey}</code>
                            <span className="acr-seam-status">{`${route.direction} → ${route.landsOn}`}</span>
                            <span className="acr-seam-purpose">{route.purpose}</span>
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
}
