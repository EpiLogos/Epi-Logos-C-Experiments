/**
 * Coordinate: M' `/` membrane (Evidence packet list — Track 27.T27.5)
 * Residency: Body/M/pratibimba-app/src/panes/omni
 * Actualises: the selectable list of MediatedRunEvidencePacket rows (id, title,
 *   mediator, coordinate, privacy badge). Honest empty state when no packets
 *   have been deposited — nothing synthesised.
 * Public surface: EvidencePacketList.
 * Does NOT own: the schema (evidenceShapes.ts), the packet feed.
 */

import type { MediatedRunEvidencePacket } from './evidenceShapes';
import { PrivacyClassBadge } from './PrivacyClassBadge';
import { mediatorLabel } from './EvidencePacketView';

export function EvidencePacketList({
    packets,
    selectedId,
    onSelect
}: {
    readonly packets: readonly MediatedRunEvidencePacket[];
    readonly selectedId?: string | null;
    readonly onSelect?: (packetId: string) => void;
}) {
    if (packets.length === 0) {
        return (
            <div className="evidence-packet-list" data-testid="evidence-packet-list">
                <div className="pane-message" data-testid="evidence-list-empty">
                    no evidence packets — the deposition surface is live; packets appear as runs deposit them
                </div>
            </div>
        );
    }
    return (
        <ul className="evidence-packet-list" data-testid="evidence-packet-list">
            {packets.map(packet => (
                <li
                    key={packet.id}
                    className={`evidence-packet-row${selectedId === packet.id ? ' selected' : ''}`}
                    data-testid="evidence-packet-row"
                    data-packet-id={packet.id}
                    aria-selected={selectedId === packet.id}
                    onClick={() => onSelect?.(packet.id)}
                >
                    <span className="evidence-row-title">{packet.title}</span>
                    <span className="evidence-row-mediator">{mediatorLabel(packet.mediatedBy)}</span>
                    <span className="evidence-row-coordinate">{packet.coordinate}</span>
                    <PrivacyClassBadge privacyClass={packet.privacyClass} />
                </li>
            ))}
        </ul>
    );
}
