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

import { useMemo } from 'react';
import type { MediatedRunEvidencePacket } from './evidenceShapes';
import { EvidencePacketList } from './EvidencePacketList';
import { EvidencePacketView } from './EvidencePacketView';
import { privacyClassKind, type PrivacyClassKind } from './PrivacyClassBadge';
import { useOmniPanelSessionStore, useOmniPanelTabState } from './omnipanelSessionState';

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
    const onOpenToolStream = () => selectTab('tool-stream');

    return (
        <section className="evidence-panel" data-testid="evidence-panel">
            <header className="evidence-header" data-testid="evidence-header">
                <div className="evidence-title">
                    <strong>Evidence</strong>
                    <span className="evidence-subtitle">MediatedRunEvidencePacket deposition fold</span>
                    <span className="evidence-count">{packets.length} packets</span>
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

            <EvidencePacketList packets={visible} selectedId={tab.selectedPacketId} onSelect={onSelect} />

            {selected && (
                <EvidencePacketView
                    packet={selected}
                    onOpenDispatchTrace={onOpenDispatchTrace}
                    onOpenToolStream={onOpenToolStream}
                />
            )}
        </section>
    );
}
