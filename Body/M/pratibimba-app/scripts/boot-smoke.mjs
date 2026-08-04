#!/usr/bin/env node
/**
 * Coordinate: M' (Sprint-1 boot smoke, plan T1.9)
 * Residency: Body/M/pratibimba-app/scripts
 * Position (#n): shell verification boundary
 * Actualises: the behavioral launch gate the cycle-3 test corpus never had —
 *   spawns a REAL `epi gate start` on a test port, connects the REAL ported
 *   GatewayClient wire protocol, and fails unless a live profile tick arrives
 *   and advances. No manifest/string assertions.
 * Public surface: `pnpm smoke` / EPI_BIN override.
 * Does NOT own: gateway behavior, Cargo output placement, or profile clocks.
 * Contract: [[CHROME-CONTRACT]] / root [[AGENTS]] verification law.
 * Run: pnpm smoke   (EPI_BIN overrides the gateway binary)
 */

import { spawn } from 'node:child_process';
import { connect } from 'node:net';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import WebSocket from 'ws';

const PORT = 18797;
const appRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const repoRoot = resolve(appRoot, '..', '..', '..');
const EPI_BIN = process.env.EPI_BIN ?? join(repoRoot, 'target', 'debug', 'epi');

const stateRoot = mkdtempSync(join(tmpdir(), 'pratibimba-smoke-gate-'));
const failures = [];
let gateway = null;

function log(step, ok, detail) {
    const mark = ok ? 'ok ' : 'FAIL';
    console.log(`[boot-smoke] ${mark} ${step}${detail ? ` — ${detail}` : ''}`);
    if (!ok) {
        failures.push(step);
    }
}

function waitForPort(port, timeoutMs) {
    const deadline = Date.now() + timeoutMs;
    return new Promise((resolvePort, rejectPort) => {
        const attempt = () => {
            const socket = connect({ port, host: '127.0.0.1' }, () => {
                socket.destroy();
                resolvePort();
            });
            socket.on('error', () => {
                socket.destroy();
                if (Date.now() > deadline) {
                    rejectPort(new Error(`port ${port} did not open within ${timeoutMs}ms`));
                } else {
                    setTimeout(attempt, 400);
                }
            });
        };
        attempt();
    });
}

async function main() {
    console.log(`[boot-smoke] gateway binary: ${EPI_BIN}`);
    gateway = spawn(EPI_BIN, ['gate', 'start', '--port', String(PORT)], {
        env: { ...process.env, EPI_GATE_STATE_ROOT: stateRoot },
        stdio: ['ignore', 'pipe', 'pipe']
    });
    gateway.stderr.on('data', chunk => process.stderr.write(`[gateway] ${chunk}`));
    gateway.on('exit', code => {
        if (failures.length === 0 && code !== null && code !== 0) {
            log('gateway process stayed alive', false, `exited early with code ${code}`);
        }
    });

    await waitForPort(PORT, 20000);
    log('gateway port opens after supervise-style spawn', true, `127.0.0.1:${PORT}`);

    const ws = new WebSocket(`ws://127.0.0.1:${PORT}`);
    const generations = [];
    let connectResolved = false;
    let healthResolved = false;

    const done = new Promise((resolveDone, rejectDone) => {
        const timeout = setTimeout(
            () => rejectDone(new Error('no advancing profile tick and health response within 20s')),
            20000
        );
        const maybeResolve = () => {
            if (healthResolved && generations.length >= 3) {
                clearTimeout(timeout);
                resolveDone();
            }
        };
        ws.on('open', () => {
            log('websocket connects', true);
            ws.send(JSON.stringify({ type: 'req', id: 1, method: 'connect', params: {} }));
        });
        ws.on('message', data => {
            let frame;
            try {
                frame = JSON.parse(String(data));
            } catch {
                return;
            }
            if (frame.type === 'res' && frame.id === 1 && !connectResolved) {
                connectResolved = true;
                log('connect handshake accepted', !frame.error, JSON.stringify(frame.error ?? frame.result?.protocol ?? 'ok'));
                ws.send(JSON.stringify({ type: 'req', id: 2, method: 'health', params: {} }));
            }
            if (frame.type === 'res' && frame.id === 2 && !healthResolved) {
                healthResolved = true;
                log('health round-trips post-connect', !frame.error, JSON.stringify(frame.error ?? 'ok'));
                maybeResolve();
            }
            const eventName = frame.event ?? frame.method ?? null;
            if (eventName === 'profile.update' || eventName === 'profile' || eventName === 'tick') {
                const generation = frame.payload?.generation;
                if (typeof generation === 'number') {
                    generations.push(generation);
                    if (generations.length === 1) {
                        const tick12 = frame.payload?.harmonicProfile?.tick12 ?? frame.payload?.tick?.tick12;
                        log('live profile tick arrives', true, `generation ${generation}, tick12 ${tick12}`);
                    }
                    if (generations.length >= 3) {
                        maybeResolve();
                    }
                }
            }
        });
        ws.on('error', err => {
            clearTimeout(timeout);
            rejectDone(err);
        });
    });

    await done;
    const monotonic = generations.every((g, i) => i === 0 || g > generations[i - 1]);
    log('tick generation advances monotonically', monotonic, generations.slice(0, 5).join(' → '));
    log('connect handshake completed', connectResolved);
    log('health response received', healthResolved);
    ws.close();
}

main()
    .catch(err => {
        log('boot smoke', false, err.message);
    })
    .finally(() => {
        if (gateway && gateway.exitCode === null) {
            gateway.kill();
        }
        rmSync(stateRoot, { recursive: true, force: true });
        if (failures.length > 0) {
            console.error(`[boot-smoke] FAILED: ${failures.join('; ')}`);
            process.exit(1);
        }
        console.log('[boot-smoke] PASS — the organism boots and its heart beats.');
        process.exit(0);
    });
