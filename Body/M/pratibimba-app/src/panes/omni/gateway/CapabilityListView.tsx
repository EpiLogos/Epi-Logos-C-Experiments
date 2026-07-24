/**
 * Coordinate: M' `/` membrane (Gateway tab — capability list — Track 27.T27.7)
 * Residency: Body/M/pratibimba-app/src/panes/omni/gateway
 * Position (#n): the default `capabilities` sub-view body.
 * Actualises: the live capability list for the Gateway tab, rendered straight
 *   from the strict `s4'.mediation.capabilities.list` snapshot (27.7; the
 *   feed EXISTS — omnipanelCapabilities). Each row shows the capability name,
 *   its entitlement-class badge, a <CapabilityCheckCell/> parity readout, and —
 *   for `standard` capabilities only (the `aletheia-mode-internal` privacy
 *   gate) — an inline <TryItAffordance/>. Selecting a row raises the selection
 *   so the tab body persists `selectedCapabilityName`. No capability is
 *   invented: the view can only render what the snapshot declares.
 * Public surface: CapabilityListView.
 * Does NOT own: the snapshot fetch/parse (omnipanelCapabilities + the tab
 *   body), state persistence (omnipanelSessionState), or gateway transport.
 */

import type { MediationCapabilitySnapshot } from '../omnipanelCapabilities';
import { CapabilityCheckCell } from './CapabilityCheckCell';
import { TryItAffordance } from './TryItAffordance';

export function CapabilityListView({
    snapshot,
    selectedCapabilityName,
    onSelect
}: {
    readonly snapshot: MediationCapabilitySnapshot;
    readonly selectedCapabilityName: string | null;
    readonly onSelect: (name: string) => void;
}) {
    return (
        <div className="capability-list-view" data-testid="capability-list-view" role="list">
            <div className="capability-list-count" data-testid="capability-list-count">
                {snapshot.capabilities.length} capabilities · routes through {snapshot.routesThrough}
            </div>
            {snapshot.capabilities.map(capability => {
                const selected = selectedCapabilityName === capability.name;
                return (
                    <div
                        key={capability.name}
                        role="listitem"
                        className={`capability-row${selected ? ' selected' : ''}`}
                        data-testid="capability-row"
                        data-capability={capability.name}
                        data-entitlement={capability.entitlementClass}
                        aria-selected={selected}
                        tabIndex={0}
                        onClick={() => onSelect(capability.name)}
                        onKeyDown={event => {
                            if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                onSelect(capability.name);
                            }
                        }}
                    >
                        <span className="capability-name" data-testid="capability-name">
                            {capability.name}
                        </span>
                        <span
                            className={`capability-entitlement capability-entitlement-${capability.entitlementClass}`}
                            data-testid="capability-entitlement"
                        >
                            {capability.entitlementClass}
                        </span>
                        <CapabilityCheckCell capabilityName={capability.name} snapshot={snapshot} />
                        {capability.entitlementClass === 'standard' && (
                            <TryItAffordance capabilityName={capability.name} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
