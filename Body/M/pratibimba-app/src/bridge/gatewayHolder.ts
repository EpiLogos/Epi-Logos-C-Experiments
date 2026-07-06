/**
 * Coordinate: M' (gateway access seam for panes)
 * Actualises: module-level access to the app's single GatewayClient so panes
 *   invoke without prop-drilling. One socket per app — the holder never
 *   creates clients, it only carries the one App owns.
 */

import { GatewayClient } from './gatewayClient';

let current: GatewayClient | null = null;

export function setGateway(client: GatewayClient | null): void {
    current = client;
}

export function gateway(): GatewayClient {
    if (!current) {
        throw new Error('gateway client not initialised yet');
    }
    return current;
}

export function gatewayReady(): boolean {
    return current !== null && current.connected;
}
