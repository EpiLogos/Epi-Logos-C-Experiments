/**
 * Coordinate: M' `/` membrane (Gateway tab — header — Track 27.T27.7)
 * Residency: Body/M/pratibimba-app/src/panes/omni/gateway
 * Position (#n): the Gateway tab's title/status/controls strip.
 * Actualises: the spec's `<GatewayHeader />` (27.7) — gateway WebSocket
 *   connection status (from the shared provenance connection state, surfaced
 *   by the tab body), a "refresh capabilities" affordance that re-invokes the
 *   `s4'.mediation.capabilities.list` loader, and the <KernelBridgeReadinessChip/>
 *   cross-link to the ide-shell bridge-gate readiness. It renders no capability
 *   data itself.
 * Public surface: GatewayHeader.
 * Does NOT own: the capability feed (the tab body owns the loader), readiness
 *   state (readinessStore via the chip), or connection transport.
 */

import { KernelBridgeReadinessChip } from './KernelBridgeReadinessChip';

export function GatewayHeader({
    connected,
    capabilityCount,
    refreshing,
    onRefresh
}: {
    readonly connected: boolean;
    readonly capabilityCount: number | null;
    readonly refreshing: boolean;
    readonly onRefresh: () => void;
}) {
    return (
        <header className="gateway-header" data-testid="gateway-header">
            <div className="gateway-title">
                <strong>Gateway</strong>
                <span className="gateway-subtitle">S4&apos; mediation capabilities</span>
                <span
                    className={`gateway-connection gateway-connection-${connected ? 'connected' : 'disconnected'}`}
                    data-testid="gateway-connection-status"
                    data-connected={connected}
                >
                    {connected ? 'connected' : 'disconnected'}
                </span>
                {capabilityCount !== null && (
                    <span className="gateway-count" data-testid="gateway-capability-count">
                        {capabilityCount} capabilities
                    </span>
                )}
            </div>
            <div className="gateway-controls">
                <button
                    type="button"
                    className="gateway-refresh"
                    data-testid="gateway-refresh"
                    disabled={!connected || refreshing}
                    onClick={onRefresh}
                >
                    {refreshing ? 'refreshing…' : 'refresh capabilities'}
                </button>
                <KernelBridgeReadinessChip />
            </div>
        </header>
    );
}
