/**
 * Coordinate: M' `/` membrane (Gateway tab body — Track 27.T27.7)
 * Residency: Body/M/pratibimba-app/src/panes/omni
 * Position (#n): the omniGateway fold body (27.7 owns it).
 * Actualises: the Gateway tab — capability list + parity + readiness + try-it.
 *   It consolidates the frozen epi-theia Nodes/Models/Skills/Cron/Config/
 *   Settings panels into ONE tab with a sub-view switcher; only the
 *   `capabilities` facet is live in this tranche, folded straight from the
 *   real `s4'.mediation.capabilities.list` snapshot (omnipanelCapabilities).
 *   Per-capability parity is the gateway-declared allow decision; `standard`
 *   capabilities expose an inline try-it (the `aletheia-mode-internal` privacy
 *   gate keeps it off internal tools). Disconnect or a snapshot parse error
 *   renders the honest `bridge_unavailable` banner naming the method; the six
 *   un-ported facets render their honest feed-gated pending banner. Sub-view
 *   and selection persist in the OmniPanel session store. NO datum is faked.
 * Public surface: GatewayPanel.
 * Does NOT own: the capability feed/parse (omnipanelCapabilities), readiness
 *   law (ui/bridgeReadiness), session authority (S3), or the facet ports.
 */

import { useCallback, useEffect, useState } from 'react';
import { gateway } from '../../bridge/gatewayHolder';
import { useProvenanceStore } from '../../state/stores';
import { ReadinessBanner } from '../../ui/ReadinessBanner';
import {
    S4_MEDIATION_CAPABILITIES_LIST_METHOD,
    loadMediationCapabilitySnapshot,
    type MediationCapabilitySnapshot
} from './omnipanelCapabilities';
import { useOmniPanelSessionStore, useOmniPanelTabState } from './omnipanelSessionState';
import { GatewayHeader } from './gateway/GatewayHeader';
import { GatewaySubViewSwitcher, type GatewaySubView } from './gateway/GatewaySubViewSwitcher';
import { CapabilityListView } from './gateway/CapabilityListView';

export function GatewayPanel() {
    const connected = useProvenanceStore(s => s.connection.connected);
    const tab = useOmniPanelTabState('gateway');
    const patchTab = useOmniPanelSessionStore(s => s.patchTab);
    const [snapshot, setSnapshot] = useState<MediationCapabilitySnapshot | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const refresh = useCallback(() => {
        if (!connected) {
            return;
        }
        setError(null);
        setRefreshing(true);
        loadMediationCapabilitySnapshot(gateway())
            .then(setSnapshot)
            .catch(err => setError(err instanceof Error ? err.message : String(err)))
            .finally(() => setRefreshing(false));
    }, [connected]);

    // One fetch on connect; the header's refresh button re-invokes the loader.
    useEffect(() => {
        refresh();
    }, [refresh]);

    const activeSubView = tab.activeSubView;
    const setSubView = (id: GatewaySubView) => patchTab('gateway', { activeSubView: id });
    const onSelectCapability = (name: string) =>
        patchTab('gateway', { selectedCapabilityName: name });

    return (
        <section className="gateway-panel" data-testid="gateway-panel">
            <GatewayHeader
                connected={connected}
                capabilityCount={connected && snapshot ? snapshot.capabilities.length : null}
                refreshing={refreshing}
                onRefresh={refresh}
            />
            <GatewaySubViewSwitcher activeSubView={activeSubView} onSelect={setSubView} />

            {!connected ? (
                <ReadinessBanner
                    state="bridge_unavailable"
                    reason={`${S4_MEDIATION_CAPABILITIES_LIST_METHOD} unavailable — gateway not connected`}
                    testId="gateway-capabilities-unavailable"
                />
            ) : activeSubView !== 'capabilities' ? (
                // The six ported panels (Nodes/Models/Skills/Cron/Config/Settings)
                // have no carrier port yet — 27.7 lands Capabilities live; their
                // facet panes are feed-gated. Absence is honest, never faked.
                <ReadinessBanner
                    state="degraded_but_readable"
                    reason={`${activeSubView} facet has no carrier port yet — 27.7 lands Capabilities live; facet panes are feed-gated`}
                    testId={`gateway-facet-pending-${activeSubView}`}
                />
            ) : error !== null ? (
                <ReadinessBanner
                    state="bridge_unavailable"
                    reason={`${S4_MEDIATION_CAPABILITIES_LIST_METHOD} unavailable — ${error}`}
                    testId="gateway-capabilities-error"
                />
            ) : snapshot !== null ? (
                <CapabilityListView
                    snapshot={snapshot}
                    selectedCapabilityName={tab.selectedCapabilityName}
                    onSelect={onSelectCapability}
                />
            ) : (
                <p className="pane-message" data-testid="gateway-loading">
                    loading capabilities…
                </p>
            )}
        </section>
    );
}
