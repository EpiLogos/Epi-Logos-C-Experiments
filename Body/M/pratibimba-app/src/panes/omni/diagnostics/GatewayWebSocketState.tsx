/**
 * Coordinate: M' `/` membrane (gateway WebSocket state — Track 27.T27.8)
 * Residency: Body/M/pratibimba-app/src/panes/omni/diagnostics
 * Position (#n): the Diagnostics fold's connection readout (27.8).
 * Actualises: the spec's <GatewayWebSocketState /> — the live
 *   KernelBridgeConnectionStatus from useProvenanceStore rendered verbatim:
 *   connected flag, connection state, subscription mode/profile, the reason
 *   string, and the profile generation the connection last carried. This is the
 *   telemetry fold's honest window onto a disconnected gateway (it never blanks
 *   the panel — it SHOWS the disconnect).
 * Public surface: GatewayWebSocketState.
 * Does NOT own: the connection transport (bridge/gatewayClient), the provenance
 *   store law (state/stores), the supervisor thread.
 */

import { useProvenanceStore } from '../../../state/stores';

export function GatewayWebSocketState() {
    const connection = useProvenanceStore(s => s.connection);

    return (
        <section className="gateway-ws-state" data-testid="gateway-ws-state">
            <h4 className="diagnostics-section-title">Gateway WebSocket</h4>
            <dl className="gateway-ws-fields">
                <dt>connected</dt>
                <dd data-testid="gateway-ws-connected">{connection.connected ? 'yes' : 'no'}</dd>
                <dt>state</dt>
                <dd data-testid="gateway-ws-connection-state">{connection.state}</dd>
                <dt>mode</dt>
                <dd data-testid="gateway-ws-mode">{connection.mode}</dd>
                <dt>subscription</dt>
                <dd data-testid="gateway-ws-subscription-mode">{connection.subscriptionMode}</dd>
                <dt>reason</dt>
                <dd data-testid="gateway-ws-reason">{connection.reason || '—'}</dd>
                <dt>profile generation</dt>
                <dd data-testid="gateway-ws-generation">
                    {connection.profileGeneration === null ? '—' : connection.profileGeneration}
                </dd>
            </dl>
        </section>
    );
}
