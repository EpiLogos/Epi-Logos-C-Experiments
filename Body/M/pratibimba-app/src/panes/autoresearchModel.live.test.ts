/** Real spawned-gateway proof for the M5' Autoresearch wire - 28.T28.10. */

import { spawn, type ChildProcess } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { connect } from 'node:net';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import WebSocket from 'ws';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { IMPROVE_HISTORY_METHOD, IMPROVE_STATUS_METHOD, parseImproveHistory, parseImproveStatus } from './autoresearchModel';

const live = process.env.EPI_LIVE_AUTORESEARCH === '1';
const PORT = 19500 + (process.pid % 300);
const REPO_ROOT = resolve(__dirname, '../../../../..');
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
                if (Date.now() >= deadline) rejectPort(new Error(`gateway port ${port} did not open`));
                else setTimeout(attempt, 100);
            });
        };
        attempt();
    });
}

describe.skipIf(!live)('live Autoresearch status/history wire', () => {
    let child: ChildProcess | null = null;
    let socket: WebSocket | null = null;
    let stateRoot: string | null = null;
    let nextId = 1;
    const pending = new Map<number, (frame: Record<string, unknown>) => void>();

    const request = (method: string, params: Record<string, unknown> = {}) =>
        new Promise<Record<string, unknown>>((resolveRequest, rejectRequest) => {
            const id = nextId++;
            const timeout = setTimeout(() => rejectRequest(new Error(`${method} timed out`)), 5000);
            pending.set(id, frame => {
                clearTimeout(timeout);
                resolveRequest(frame);
            });
            socket?.send(JSON.stringify({ type: 'req', id, method, params }));
        });

    beforeAll(async () => {
        stateRoot = mkdtempSync(`${tmpdir()}/autoresearch-live-`);
        child = spawn(EPI_BIN, ['gate', 'start', '--port', String(PORT)], {
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
            socket?.once('open', resolveOpen);
            socket?.once('error', rejectOpen);
        });
        expect((await request('connect')).error).toBeUndefined();
    }, 25_000);

    afterAll(() => {
        socket?.close();
        if (child?.exitCode === null) child.kill();
        if (stateRoot) rmSync(stateRoot, { recursive: true, force: true });
    });

    it('parses the living gateway status and history projections', async () => {
        const statusFrame = await request(IMPROVE_STATUS_METHOD);
        const historyFrame = await request(IMPROVE_HISTORY_METHOD, { limit: 20 });
        expect(statusFrame.error).toBeUndefined();
        expect(historyFrame.error).toBeUndefined();
        const status = parseImproveStatus(statusFrame.result);
        const history = parseImproveHistory(historyFrame.result);
        expect(status.loopState).toBe('idle');
        expect(status.totalRuns).toBe(0);
        expect(history).toEqual([]);
    });
});
