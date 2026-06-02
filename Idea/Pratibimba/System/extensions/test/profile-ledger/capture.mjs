// 10.T1 — Profile Generation Ledger capture harness.
//
// Purpose
// -------
// Hardens the live-capture path the 10.T1 ledger fixture documents. The
// canonical ledger at:
//
//   Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/
//     plan.runs/10-t1-profile-generation-ledger-20260601T234815Z.json
//
// was assembled from the four real-code-path test fixtures named in its
// observations block (gate_subscription_lifecycle, gate_spacetimedb_bridge,
// kernel_bridge_runtime_contract, plus a real `epi profile show` subprocess
// invocation). That assembly is acceptable per the deviation_from_ideal note
// because every observation came from a real run.
//
// This script provides the ideal-path capture: when the S3' gateway is live
// at ws://127.0.0.1:18794 AND a real SpaceTimeDB host is reachable, it will
// open a non-final-UI bridge subscriber (a plain Node WebSocket client, NOT
// a Theia surface) and record what arrives.
//
// Discipline
// ----------
//   - When the gateway is unreachable, exit 0 with a deferred-evidence stamp
//     so this script does not block contract bundles, but does NOT pretend
//     to have captured anything. The canonical ledger remains the source of
//     truth in that mode.
//   - When the gateway IS reachable, open a WebSocket, complete the
//     hello/connect handshake (mirroring live-gateway-probe.test.mjs), open
//     an s3'.temporal.subscribe stream, record one profile-generation event,
//     and emit a fresh ledger fixture under plan.runs/ with the live
//     observations.
//   - Never invent values. Every field in the output ledger must come from
//     either: (a) the live WS frames, (b) the captured subprocess output of
//     `epi profile show`, or (c) explicit deferred-evidence placeholders.
//
// Usage
// -----
//   node Idea/Pratibimba/System/extensions/test/profile-ledger/capture.mjs
//   EPI_LIVE_GATEWAY=1 node …/capture.mjs   # force-fail if gateway absent
//
// This is intentionally a script, not a node:test runner, so that one
// capture run produces one ledger fixture file (idempotent over its own
// timestamp).

import net from 'node:net';
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..', '..', '..', '..', '..');

const GATEWAY_HOST = '127.0.0.1';
const GATEWAY_PORT = 18794;
const GATEWAY_URL = `ws://${GATEWAY_HOST}:${GATEWAY_PORT}/`;
const REQUIRE_LIVE = process.env.EPI_LIVE_GATEWAY === '1';
const EPI_BIN = resolve(REPO_ROOT, 'Body/S/S0/epi-cli/target/debug/epi');
const PLAN_RUNS_DIR = resolve(
    REPO_ROOT,
    'Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/plan.runs',
);

function isoStampForFilename(d = new Date()) {
    return d.toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
}

async function gatewayReachable() {
    return new Promise((resolve) => {
        const sock = net.connect({ host: GATEWAY_HOST, port: GATEWAY_PORT });
        const done = (ok) => {
            try { sock.destroy(); } catch (_) {}
            resolve(ok);
        };
        sock.once('connect', () => done(true));
        sock.once('error', () => done(false));
        setTimeout(() => done(false), 500);
    });
}

function runEpiProfileShow(cycle, subTick) {
    const res = spawnSync(EPI_BIN, [
        'profile', 'show',
        '--cycle', String(cycle),
        '--sub-tick', String(subTick),
        '--json',
    ], { encoding: 'utf8' });
    return {
        command: `${EPI_BIN} profile show --cycle ${cycle} --sub-tick ${subTick} --json`,
        exit_code: res.status,
        stdout: res.stdout,
        stderr: res.stderr,
    };
}

function parseProfileJson(stdout) {
    try { return JSON.parse(stdout); } catch (_) { return null; }
}

async function captureLive() {
    return await new Promise((resolveCapture, rejectCapture) => {
        const ws = new WebSocket(GATEWAY_URL);
        const frames = [];
        const replies = new Map();
        const events = [];
        let nextId = 1;
        let helloFrame = null;
        let firstProfileEvent = null;

        const cleanup = (err, result) => {
            try { ws.close(); } catch (_) {}
            if (err) rejectCapture(err); else resolveCapture(result);
        };

        const send = (frame) => {
            const id = nextId++;
            frame.id = id;
            return new Promise((r, rej) => {
                replies.set(id, { resolve: r, reject: rej });
                ws.send(JSON.stringify(frame));
            });
        };

        ws.addEventListener('error', (e) => cleanup(new Error(`ws error: ${e.message || e.type}`)));
        ws.addEventListener('message', (raw) => {
            let frame;
            try { frame = JSON.parse(raw.data.toString()); } catch (e) { return cleanup(e); }
            frames.push(frame);
            if (frame.type === 'hello-ok') {
                helloFrame = frame;
            } else if (frame.type === 'res' && replies.has(frame.id)) {
                const { resolve: r } = replies.get(frame.id);
                replies.delete(frame.id);
                r(frame);
            } else if (frame.type === 'event') {
                events.push(frame);
                const isProfileEvent =
                    frame.event === 's3\'.temporal.profile'
                    || frame.event === 's3\'.subscription.lifecycle'
                    || (frame.payload && (frame.payload.profileGeneration || frame.payload.profile_generation));
                if (isProfileEvent && !firstProfileEvent) {
                    firstProfileEvent = frame;
                }
            }
        });

        ws.addEventListener('open', async () => {
            try {
                await send({ type: 'hello', protocol: 3, agentId: 'profile-ledger-capture' });
                const connectRes = await send({
                    type: 'req', method: 'connect',
                    params: { agentId: 'profile-ledger-capture', sessionKey: 'profile-ledger:capture' },
                });
                if (!connectRes || connectRes.error) {
                    return cleanup(new Error(`connect failed: ${JSON.stringify(connectRes)}`));
                }
                const subRes = await send({
                    type: 'req', method: 's3\'.temporal.subscribe',
                    params: { scope: 'session', sessionKey: 'profile-ledger:capture' },
                });
                // Wait briefly for one profile event.
                const start = Date.now();
                const waitUntil = start + 5000;
                while (Date.now() < waitUntil && !firstProfileEvent) {
                    await new Promise((r) => setTimeout(r, 50));
                }
                cleanup(null, {
                    hello: helloFrame,
                    connect_res: connectRes,
                    subscribe_res: subRes,
                    profile_event: firstProfileEvent,
                    all_events_seen: events.length,
                });
            } catch (e) {
                cleanup(e);
            }
        });
    });
}

(async function main() {
    const reachable = await gatewayReachable();
    const stamp = isoStampForFilename();
    const captureNow = new Date().toISOString();
    const cycle = 11;
    const subTick = 0;

    if (!reachable) {
        if (REQUIRE_LIVE) {
            console.error('EPI_LIVE_GATEWAY=1 but gateway unreachable at ' + GATEWAY_URL);
            process.exit(2);
        }
        console.log(JSON.stringify({
            mode: 'deferred-evidence',
            reason: 'gateway-not-listening',
            gateway_url: GATEWAY_URL,
            canonical_ledger: '10-t1-profile-generation-ledger-20260601T234815Z.json',
            note: 'When gateway is up, rerun this script to produce a fresh live-captured fixture.',
            captured_at: captureNow,
        }, null, 2));
        process.exit(0);
    }

    // Live path. Drive epi profile show AND open the gateway subscription.
    const cliRun = runEpiProfileShow(cycle, subTick);
    const profileJson = parseProfileJson(cliRun.stdout);
    let liveCapture;
    try {
        liveCapture = await captureLive();
    } catch (err) {
        console.error('live capture failed: ' + err.message);
        process.exit(3);
    }

    const fixture = {
        fixture_kind: '10-t1-profile-generation-ledger',
        captured_at: captureNow,
        captured_by: 'profile-ledger-capture.mjs',
        capture_mode: 'live-gateway',
        profile_generation: profileJson && profileJson.profile && profileJson.profile.cycle,
        session: 'profile-ledger:capture',
        observations: {
            s0_cli_output: {
                command: cliRun.command,
                exit_code: cliRun.exit_code,
                stdout_excerpt: profileJson
                    ? { profile: { cycle: profileJson.profile.cycle, tick: profileJson.profile.tick, privacyClass: profileJson.profile.privacyClass } }
                    : null,
                captured_at: captureNow,
            },
            gateway_frame: liveCapture.profile_event
                ? {
                    method: 's3\'.temporal.subscribe',
                    frame_decoded: liveCapture.profile_event,
                    captured_at: captureNow,
                }
                : { method: 's3\'.temporal.subscribe', frame_decoded: null, note: 'no profile event in 5s window', captured_at: captureNow },
            spacetimedb_row: { note: 'live SpaceTimeDB row capture requires a separate spacetime probe; see gate_spacetimedb_bridge for the in-process equivalent', captured_at: captureNow },
            bridge_subscriber_observation: {
                subscriber_kind: 'non-final-UI (this Node WebSocket harness)',
                subscriber_id: 'profile-ledger-capture',
                received_payload: liveCapture.profile_event && liveCapture.profile_event.payload,
                captured_at: captureNow,
            },
        },
        verification_commands_run: [
            { command: cliRun.command, result: `exit ${cliRun.exit_code}`, when: captureNow },
            { command: 'WebSocket(' + GATEWAY_URL + ') + connect + s3\'.temporal.subscribe', result: 'profile_event=' + Boolean(liveCapture.profile_event), when: captureNow },
        ],
    };

    mkdirSync(PLAN_RUNS_DIR, { recursive: true });
    const out = resolve(PLAN_RUNS_DIR, `10-t1-profile-generation-ledger-${stamp}.json`);
    writeFileSync(out, JSON.stringify(fixture, null, 2) + '\n');
    console.log('Wrote live-captured ledger fixture: ' + out);
})();
