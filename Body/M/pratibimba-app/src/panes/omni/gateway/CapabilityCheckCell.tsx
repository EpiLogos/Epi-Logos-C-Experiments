/**
 * Coordinate: M' `/` membrane (Gateway tab — capability parity cell — Track 27.T27.7)
 * Residency: Body/M/pratibimba-app/src/panes/omni/gateway
 * Position (#n): the per-capability parity readout inside CapabilityListView.
 * Actualises: the carrier equivalent of the spec's `assertCapabilityParity`
 *   cell (27.7). It runs the ONE carrier parity primitive
 *   `isSnapshotCapabilityAllowed(name, snapshot)` — the gateway-declared
 *   allow decision — and renders ✓ when the capability is present/allowed in
 *   the S4' snapshot, ✗ when it is not. No local capability list is invented;
 *   the snapshot is the sole authority.
 * Public surface: CapabilityCheckCell.
 * Does NOT own: the capability feed (omnipanelCapabilities), entitlement
 *   decisions (S4 at dispatch time), or the row layout (CapabilityListView).
 */

import { isSnapshotCapabilityAllowed, type MediationCapabilitySnapshot } from '../omnipanelCapabilities';

export function CapabilityCheckCell({
    capabilityName,
    snapshot
}: {
    readonly capabilityName: string;
    readonly snapshot: MediationCapabilitySnapshot;
}) {
    const allowed = isSnapshotCapabilityAllowed(capabilityName, snapshot);
    return (
        <span
            className={`capability-check-cell capability-check-${allowed ? 'ok' : 'missing'}`}
            data-testid="capability-check-cell"
            data-allowed={allowed}
            role="img"
            aria-label={allowed ? `${capabilityName} parity OK` : `${capabilityName} parity mismatch`}
            title={allowed ? 'parity OK — declared by the gateway snapshot' : 'parity mismatch — not in the gateway snapshot'}
        >
            {allowed ? '✓' : '✗'}
        </span>
    );
}
