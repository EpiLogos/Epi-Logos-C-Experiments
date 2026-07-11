#!/usr/bin/env node
/**
 * Coordinate: M1-3' (spanda walk live-wire smoke — 02.T2.13 / DR-M1-5)
 * Actualises: the engine-walk round-trip against a REAL spawned gateway:
 *   flowing ticks → m1.spanda.hold → tick12 CONSTANT across advancing
 *   generations (the organism held, the portal still pulsing) →
 *   walk_to lands on the asked step → step{reflect} applies the NAMED
 *   reflection involution (11−n) → release → the flow resumes.
 * Run: node scripts/spanda-walk-smoke.mjs   (EPI_BIN overrides the binary)
 */

import { spawn } from 'node:child_process';
import { connect } from 'node:net';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import WebSocket from 'ws';

const PORT = 18798;
const appRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const repoRoot = resolve(appRoot, '..', '..', '..');
const EPI_BIN =
    process.env.EPI_BIN ?? join(repoRoot, 'Body', 'S', 'S0', 'epi-cli', 'target', 'debug', 'epi');

const stateRoot = mkdtempSync(join(tmpdir(), 'pratibimba-spanda-walk-'));
const failures = [];
let gateway = null;

function log(step, ok, detail) {
    console.log(`[spanda-walk] ${ok ? 'ok ' : 'FAIL'} ${step}${detail ? ` — ${detail}` : ''}`);
    if (!ok) failures.push(step);
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
    console.log(`[spanda-walk] gateway binary: ${EPI_BIN}`);
    gateway = spawn(EPI_BIN, ['gate', 'start', '--port', String(PORT)], {
        env: { ...process.env, EPI_GATE_STATE_ROOT: stateRoot },
        stdio: ['ignore', 'pipe', 'pipe']
    });
    await waitForPort(PORT, 20000);
    log('gateway spawns', true, `127.0.0.1:${PORT}`);

    const ws = new WebSocket(`ws://127.0.0.1:${PORT}`);
    let nextId = 1;
    const pending = new Map();
    const updates = []; // { generation, tick12 }

    const transportEvents = []; // { act, mode, atMs }
    let firstSpandaBlock = null;

    ws.on('message', data => {
        let frame;
        try {
            frame = JSON.parse(String(data));
        } catch {
            return;
        }
        if (frame.type === 'res' && pending.has(frame.id)) {
            pending.get(frame.id)(frame);
            pending.delete(frame.id);
        }
        const eventName = frame.event ?? frame.method ?? null;
        if (eventName === 'profile.update') {
            const generation = frame.payload?.generation;
            const tick12 = frame.payload?.harmonicProfile?.tick12 ?? frame.payload?.tick?.tick12;
            if (typeof generation === 'number' && typeof tick12 === 'number') {
                updates.push({ generation, tick12, atMs: Date.now() });
            }
            // 02.T2.14 — the anchor block rides every heartbeat sample.
            if (!firstSpandaBlock && frame.payload?.spanda) {
                firstSpandaBlock = frame.payload.spanda;
            }
        }
        if (eventName === 'portal.spanda_transport') {
            transportEvents.push({
                act: frame.payload?.act,
                mode: frame.payload?.mode,
                atMs: Date.now()
            });
        }
    });

    const rpc = (method, params = {}) =>
        new Promise((res, rej) => {
            const id = nextId++;
            const timer = setTimeout(() => rej(new Error(`${method} timed out`)), 10000);
            pending.set(id, frame => {
                clearTimeout(timer);
                res(frame);
            });
            ws.send(JSON.stringify({ type: 'req', id, method, params }));
        });

    const updatesAfter = (count, timeoutMs = 8000) =>
        new Promise((res, rej) => {
            const target = updates.length + count;
            const deadline = Date.now() + timeoutMs;
            const poll = () => {
                if (updates.length >= target) return res(updates.slice(-count));
                if (Date.now() > deadline) return rej(new Error(`no ${count} further updates`));
                setTimeout(poll, 100);
            };
            poll();
        });

    await new Promise((res, rej) => {
        ws.on('open', res);
        ws.on('error', rej);
    });
    const hello = await rpc('connect');
    log('connect handshake', !hello.error);

    // 1 — the organism flows before any act.
    const flowing = await updatesAfter(2);
    log('flowing ticks arrive', flowing.length === 2,
        flowing.map(u => `g${u.generation}:t${u.tick12}`).join(' '));

    // 1b — 02.T2.14: the anchor block rides profile.update (plain numbers,
    //      never phase samples; slerpFraction is never on the wire).
    log('profile.update carries the spanda anchor block',
        !!firstSpandaBlock && typeof firstSpandaBlock.rateHz === 'number'
            && typeof firstSpandaBlock.phase0 === 'number' && !!firstSpandaBlock.mode
            && !('slerpFraction' in (firstSpandaBlock ?? {})),
        firstSpandaBlock ? `mode=${firstSpandaBlock.mode} rateHz=${firstSpandaBlock.rateHz}` : 'absent');

    // 2 — hold: the walk family freezes the ONE anchor.
    const lastUpdateBeforeHold = updates[updates.length - 1];
    const held = await rpc('m1.spanda.hold');
    const heldTick = held.result?.spanda?.tick12;
    log('m1.spanda.hold responds held', held.result?.spanda?.mode === 'held', `tick12=${heldTick}`);

    // 2b — 02.T2.14: the transport act pushes IMMEDIATELY — the event lands
    //      between heartbeat samples, not at the next one.
    await new Promise(res => setTimeout(res, 150));
    const holdEvent = transportEvents.find(e => e.act === 'm1.spanda.hold');
    const betweenHeartbeats = holdEvent
        && (updates[updates.length - 1] === lastUpdateBeforeHold
            || holdEvent.atMs - lastUpdateBeforeHold.atMs < 1_000);
    log('portal.spanda_transport pushes between heartbeats',
        !!holdEvent && holdEvent.mode === 'held' && !!betweenHeartbeats,
        holdEvent ? `act=${holdEvent.act} +${holdEvent.atMs - lastUpdateBeforeHold.atMs}ms after last sample` : 'no event');

    // 3 — generations advance while tick12 stays constant: the organism is
    //     held, the portal keeps pulsing (DR-M1-5 core invariant, on the wire).
    const heldUpdates = await updatesAfter(2);
    const generationsAdvance = heldUpdates[1].generation > heldUpdates[0].generation;
    const tickConstant = heldUpdates.every(u => u.tick12 === heldTick);
    log('held: generations advance, tick12 constant', generationsAdvance && tickConstant,
        heldUpdates.map(u => `g${u.generation}:t${u.tick12}`).join(' '));

    // 4 — walk_to lands on the asked step.
    const target = (heldTick + 3) % 12;
    const walked = await rpc('m1.spanda.walk_to', { tick: target });
    log('walk_to lands', walked.result?.spanda?.tick12 === target,
        `asked ${target}, got ${walked.result?.spanda?.tick12}`);
    const walkedUpdate = await updatesAfter(1);
    log('walked step rides the stream', walkedUpdate[0].tick12 === target,
        `g${walkedUpdate[0].generation}:t${walkedUpdate[0].tick12}`);

    // 5 — step{reflect} applies the NAMED reflection involution (11−n).
    const reflected = await rpc('m1.spanda.step', { reflect: true });
    log('step{reflect} is the 11−n involution', reflected.result?.spanda?.tick12 === (11 - target),
        `expected ${11 - target}, got ${reflected.result?.spanda?.tick12}`);

    // 6 — half_turn is the OTHER involution (n+6 mod 12).
    const swapped = await rpc('m1.spanda.half_turn');
    const afterReflect = 11 - target;
    log('half_turn is the n+6 pole-swap', swapped.result?.spanda?.tick12 === (afterReflect + 6) % 12,
        `expected ${(afterReflect + 6) % 12}, got ${swapped.result?.spanda?.tick12}`);

    // 7 — release: the flow resumes from the walked phase.
    const released = await rpc('m1.spanda.release');
    log('release resumes flowing', released.result?.spanda?.mode === 'flowing');
    const resumed = await updatesAfter(2);
    const ticksMove = resumed[0].tick12 !== resumed[1].tick12;
    log('released: tick12 flows again', ticksMove,
        resumed.map(u => `g${u.generation}:t${u.tick12}`).join(' '));

    ws.close();
    if (failures.length > 0) {
        console.log(`[spanda-walk] REFUSED — ${failures.length} failing step(s)`);
        process.exitCode = 1;
    } else {
        console.log('[spanda-walk] PASS — the organism holds, walks, and flows again.');
    }
}

main()
    .catch(err => {
        log('unhandled failure', false, err.message);
        process.exitCode = 1;
    })
    .finally(() => {
        if (gateway) gateway.kill('SIGTERM');
        rmSync(stateRoot, { recursive: true, force: true });
    });
