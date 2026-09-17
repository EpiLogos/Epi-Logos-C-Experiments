/**
 * Coordinate: M' (e2e harness helper — real-wire gateway RPC)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Actualises: the house minimal real-wire RPC against the spawned e2e
 *   gateway (protocol v3 dialect: `connect` first, then the method — the
 *   same frames the app itself sends). Extracted verbatim from
 *   sessions.spec.ts so every spec that needs to place a REAL record into
 *   the gateway's stores shares the one wire idiom (sessions.spec,
 *   session-continuity.spec).
 * Does NOT own: the gateway protocol (S3 gateway-contract), the app's own
 *   client (src/bridge/gatewayClient.ts).
 */

import WebSocket from 'ws';
import { GATEWAY_URL } from './e2e-env';

export function gatewayRpc(method: string, params: Record<string, unknown>): Promise<unknown> {
    return new Promise((resolve, reject) => {
        const ws = new WebSocket(GATEWAY_URL);
        const timeout = setTimeout(() => {
            ws.close();
            reject(new Error(`gateway rpc ${method}: no response within 10s`));
        }, 10_000);
        ws.on('open', () => {
            ws.send(JSON.stringify({ type: 'req', id: 1, method: 'connect', params: {} }));
        });
        ws.on('message', data => {
            const frame = JSON.parse(String(data));
            if (frame.type !== 'res') {
                return; // tick/profile events — not ours
            }
            if (frame.id === 1) {
                if (frame.error) {
                    clearTimeout(timeout);
                    ws.close();
                    reject(new Error(`connect failed: ${JSON.stringify(frame.error)}`));
                    return;
                }
                ws.send(JSON.stringify({ type: 'req', id: 2, method, params }));
            }
            if (frame.id === 2) {
                clearTimeout(timeout);
                ws.close();
                if (frame.error) {
                    reject(new Error(`${method} failed: ${JSON.stringify(frame.error)}`));
                } else {
                    resolve(frame.result);
                }
            }
        });
        ws.on('error', err => {
            clearTimeout(timeout);
            reject(err);
        });
    });
}
