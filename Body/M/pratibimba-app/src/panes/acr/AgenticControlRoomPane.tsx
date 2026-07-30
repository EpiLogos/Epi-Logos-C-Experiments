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
 *         `mediatedRunEvidencePacketId`, the canonical 27.9
 *         `agentic-control-room.select-run` route carrying the same node into
 *         the `/` membrane's TEMPORAL fold (28.5 (a)'s ToolStream is
 *         `ToolStreamPanel` in `omniLogs`, and DR-WC-IS-2 makes the time-ordered
 *         render agentic primary — one dataset, two foldings, not two
 *         instances), and an HONEST hold on the Backend Studio link until 28.13
 *         lands it;
 *     (4) the review governance queue — `s5'.review.inbox` → the decision
 *         controls, carrying the IOD-17 three-cell parity readout;
 *     (5) the run-lifecycle controls as an UNWIRED surface (`s5'.epii.runtime_control`
 *         is registered nowhere), stating the reason rather than faking a button;
 *     (6) the full `MediatedRunEvidencePacket` deposit, through the already-live
 *         `EvidenceDepositForm` over `s5'.epii.deposit`.
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
import { useProvenanceStore } from '../../state/stores';
import { useProfileTick } from '../../state/useProfileTick';
import { DispatchGenealogyTree } from '../omni/DispatchGenealogyTree';
import { dispatchGenealogyFromSessions } from '../omni/dispatchGenealogyFromSessions';
import { genealogyIndex, type DispatchDeepLink } from '../omni/dispatchGenealogy';
import { EvidenceDepositForm } from '../omni/evidence/EvidenceDepositForm';
import { fireOmniPanelRoute } from '../omni/omnipanelIntentRouter';
import {
    loadMediationCapabilitySnapshot,
    type MediationCapabilitySnapshot
} from '../omni/omnipanelCapabilities';
import { PSYCHE_FACET_LABEL, psycheFacetClass } from '../omni/psycheFacet';
import { AbortRetryContinueControls } from './AbortRetryContinueControls';
import { PiRuntimeMonitorBanner } from './PiRuntimeMonitorBanner';
import { ReviewDecisionControls } from './ReviewDecisionControls';
import { ACR_METHOD_BINDINGS, acrRoster } from './acrGovernance';
import { REVIEW_INBOX_METHOD, parseReviewInbox, type AcrReviewItem } from './acrReviewInbox';

/** Same cadence as the Dispatch fold: live without hammering the gateway. */
const REFETCH_TICKS = 30;

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
    const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
    const [heldBackendLink, setHeldBackendLink] = useState<string | null>(null);

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
    }, [connected]);

    const refetchEpoch = Math.floor((tick.generation ?? 0) / REFETCH_TICKS);
    useEffect(() => {
        refresh();
    }, [refresh, refetchEpoch]);

    const records = useMemo(() => dispatchGenealogyFromSessions(sessions ?? []), [sessions]);
    const index = useMemo(() => genealogyIndex(records), [records]);
    const selectedRecord = selectedNodeId ? (index.get(selectedNodeId) ?? null) : null;
    const selectedReview = (reviewItems ?? []).find(item => item.itemId === selectedReviewId) ?? null;

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
                        {/* THE TEMPORAL FOLD IS NOT DUPLICATED HERE. 28.5 (a)
                            lists a ToolStream among the T8 contents, and the
                            carrier already has exactly one: `ToolStreamPanel`
                            in the `omniLogs` fold. DR-WC-IS-2 makes the
                            time-ordered render agentic primary, so a second
                            instance in the governance pane would be two readers
                            of one dataset with two copies of the same tab
                            state. The canonical 27.9 route for this surface
                            (`agentic-control-room.select-run`) carries the
                            selected node into the `/` membrane instead — the
                            structural fold here, the temporal fold there, one
                            node identity across both (15.11). */}
                        <button
                            type="button"
                            data-testid="acr-open-in-omni-dispatch"
                            onClick={() =>
                                fireOmniPanelRoute({
                                    requestedExtensionId: 'ide-shell-m0-m5',
                                    requestedContributionId: 'agentic-control-room.select-run',
                                    artifactUri: selectedRecord.id
                                })
                            }
                        >
                            open the temporal fold →
                        </button>
                    </p>
                ) : null}
                {heldBackendLink ? (
                    <p className="pane-message" data-testid="acr-backend-studio-held">
                        {`source anchor \`${heldBackendLink}\` — Backend Studio is CHROME-CONTRACT §2 \`pending\` (28.T28.13 owns it), so this reference is held rather than deep-linked to a surface that does not exist.`}
                    </p>
                ) : null}
            </section>

            {/* (4) The governance queue + decision controls. */}
            <section className="acr-review-queue" data-testid="acr-review-queue">
                <h4>Review queue</h4>
                {reviewError ? (
                    <p className="pane-message" data-testid="acr-review-error">
                        {reviewError}
                    </p>
                ) : (reviewItems?.length ?? 0) === 0 ? (
                    <p className="pane-message" data-testid="acr-review-empty">
                        {`no open items on ${REVIEW_INBOX_METHOD}`}
                    </p>
                ) : (
                    <ul className="acr-review-list" role="list">
                        {(reviewItems ?? []).map(item => (
                            <li key={item.itemId} role="listitem">
                                <button
                                    type="button"
                                    data-testid={`acr-review-item-${item.itemId}`}
                                    data-human-required={item.requiresHuman ? 'true' : 'false'}
                                    aria-pressed={selectedReviewId === item.itemId}
                                    onClick={() =>
                                        setSelectedReviewId(previous =>
                                            previous === item.itemId ? null : item.itemId
                                        )
                                    }
                                >
                                    {`${item.title} · ${item.priority}`}
                                </button>
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
                            setSelectedReviewId(null);
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
                />
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
            </section>
        </div>
    );
}
