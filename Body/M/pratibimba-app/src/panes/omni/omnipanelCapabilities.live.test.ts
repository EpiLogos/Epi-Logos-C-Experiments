/**
 * Coordinate: M' `/` membrane (live ACR migration wire proof - 27.T27.10)
 * Actualises: a real spawned `epi` gateway round-trip through
 *   `s4'.mediation.capabilities.list`, validated by the production strict
 *   OmniPanel parser. Run with `EPI_LIVE_CAPABILITIES=1`.
 */

import { spawn, type ChildProcess } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { connect } from 'node:net';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import WebSocket from 'ws';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
    parseMediationCapabilitySnapshot,
    S4_MEDIATION_CAPABILITIES_LIST_METHOD,
    S4_MEDIATION_ROUTE_METHOD
} from './omnipanelCapabilities';

const live = process.env.EPI_LIVE_CAPABILITIES === '1';
const PORT = 19100 + (process.pid % 400);
const REPO_ROOT = resolve(__dirname, '../../../../../..');
const EPI_BIN = process.env.EPI_BIN ?? resolve(REPO_ROOT, 'target/debug/epi');

function waitForPort(port: number, timeoutMs: number): Promise<void> {
    const deadline = Date.now() + timeoutMs;
    return new Promise((resolvePort, rejectPort) => {
        const attempt = () => {
            const socket = connect({ host: '127.0.0.1', port }, () => {
                socket.destroy();
                resolvePort();
            });
            socket.on('error', () => {
                socket.destroy();
                if (Date.now() >= deadline) {
                    rejectPort(new Error(`gateway port ${port} did not open`));
                } else {
                    setTimeout(attempt, 100);
                }
            });
        };
        attempt();
    });
}

describe.skipIf(!live)('live OmniPanel capability migration wire', () => {
    let gateway: ChildProcess | null = null;
    let socket: WebSocket | null = null;
    let stateRoot: string | null = null;
    let nextId = 1;
    const pending = new Map<number, (frame: Record<string, unknown>) => void>();

    const request = (method: string): Promise<Record<string, unknown>> =>
        new Promise((resolveRequest, rejectRequest) => {
            const id = nextId++;
            const timeout = setTimeout(() => {
                pending.delete(id);
                rejectRequest(new Error(`${method} timed out`));
            }, 5000);
            pending.set(id, frame => {
                clearTimeout(timeout);
                resolveRequest(frame);
            });
            socket?.send(JSON.stringify({ type: 'req', id, method, params: {} }));
        });

    beforeAll(async () => {
        stateRoot = mkdtempSync(`${tmpdir()}/omnipanel-capabilities-`);
        gateway = spawn(EPI_BIN, ['gate', 'start', '--port', String(PORT)], {
            env: { ...process.env, EPI_GATE_STATE_ROOT: stateRoot },
            stdio: ['ignore', 'pipe', 'pipe']
        });
        await waitForPort(PORT, 20_000);
        socket = new WebSocket(`ws://127.0.0.1:${PORT}`);
        socket.on('message', data => {
            const frame = JSON.parse(String(data)) as Record<string, unknown>;
            const id = typeof frame.id === 'number' ? frame.id : null;
            if (id !== null && pending.has(id)) {
                pending.get(id)?.(frame);
                pending.delete(id);
            }
        });
        await new Promise<void>((resolveOpen, rejectOpen) => {
            socket?.once('open', () => resolveOpen());
            socket?.once('error', rejectOpen);
        });
        const connected = await request('connect');
        expect(connected.error).toBeUndefined();
    }, 25_000);

    afterAll(() => {
        socket?.close();
        if (gateway?.exitCode === null) {
            gateway.kill();
        }
        if (stateRoot !== null) {
            rmSync(stateRoot, { recursive: true, force: true });
        }
    });

    it('strict-parses the real S4 capability projection and preserves classes', async () => {
        const frame = await request(S4_MEDIATION_CAPABILITIES_LIST_METHOD);
        expect(frame.error).toBeUndefined();
        const snapshot = parseMediationCapabilitySnapshot(frame.result);

        expect(snapshot.owner).toBe("S4'");
        expect(snapshot.routesThrough).toBe(S4_MEDIATION_ROUTE_METHOD);
        expect(snapshot.dispatchTools).toContain('dispatch_agent');
        expect(snapshot.aletheiaModeInternalTools).toContain('aletheia_crystallise');
        expect(snapshot.capabilities.find(item => item.name === 'aletheia_crystallise')).toEqual({
            name: 'aletheia_crystallise',
            entitlementClass: 'aletheia-mode-internal'
        });
    });
});
