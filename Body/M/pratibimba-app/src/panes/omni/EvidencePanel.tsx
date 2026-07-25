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

import { useMemo, useState } from 'react';
import type { MediatedRunEvidencePacket } from './evidenceShapes';
import { EvidencePacketList } from './EvidencePacketList';
import { EvidencePacketView } from './EvidencePacketView';
import { EvidenceDepositForm } from './evidence/EvidenceDepositForm';
import { privacyClassKind, type PrivacyClassKind } from './PrivacyClassBadge';
import { useOmniPanelSessionStore, useOmniPanelTabState } from './omnipanelSessionState';
import { CROSS_LAYOUT_INTENT_COMMAND } from '../../commands/crossLayoutIntent';
import { commands } from '../../commands/registry';
import { useSessionStore, useTickStore } from '../../state/stores';

const MEDIATOR_FILTERS = ['all', 'pi', 'anima', 'aletheia'] as const;
const PRIVACY_FILTERS: readonly (PrivacyClassKind | 'all')[] = ['all', 'public', 'protected', 'private'];

export function EvidencePanel({
    packets = []
}: {
    /** The deposited packets. Empty until a real feed lands (honest empty). */
    readonly packets?: readonly MediatedRunEvidencePacket[];
}) {
    const tab = useOmniPanelTabState('evidence');
    const patchTab = useOmniPanelSessionStore(s => s.patchTab);
    const selectTab = useOmniPanelSessionStore(s => s.selectTab);
    // 27.T27.5 — the deposit affordance is inline (NOT a modal; 15.2 "the tab
    // IS the surface"). Open state is local to the fold.
    const [depositOpen, setDepositOpen] = useState(false);

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
    /** 26.14 lives on a face pane, not in this membrane, so it routes over the
     *  cross-layout intent spine rather than by activating a sibling fold. */
    const onOpenAxiomTranslation = () => {
        if (!selected) {
            return;
        }
        const session = useSessionStore.getState();
        const privacyClass = session.privacyClass;
        void commands.execute(CROSS_LAYOUT_INTENT_COMMAND, {
            coordinate: selected.coordinate,
            artifactUri: null,
            reviewId: selected.reviewId,
            dayNow: session.dayNow,
            sessionKey: session.sessionKey,
            profileGeneration: useTickStore.getState().generation,
            privacyClass:
                privacyClass === 'public' || privacyClass === 'protected' || privacyClass === 'private'
                    ? privacyClass
                    : null,
            requestedExtensionId: 'm5-epii',
            requestedContributionId: 'axiomTranslation'
        });
    };

    return (
        <section className="evidence-panel" data-testid="evidence-panel">
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
                <EvidenceDepositForm onDeposited={() => setDepositOpen(false)} />
            )}

            <EvidencePacketList packets={visible} selectedId={tab.selectedPacketId} onSelect={onSelect} />

            {selected && (
                <EvidencePacketView
                    packet={selected}
                    onOpenDispatchTrace={onOpenDispatchTrace}
                    onOpenToolStream={onOpenToolStream}
                    onOpenAxiomTranslation={onOpenAxiomTranslation}
                    onOpenContemplation={onOpenContemplation}
                />
            )}
        </section>
    );
}
