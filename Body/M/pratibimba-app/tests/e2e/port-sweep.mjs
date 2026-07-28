/**
 * Coordinate: M' (e2e harness — the one orphan-port sweep law)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): #4 — the precondition a fixed-port suite runs inside
 * Actualises: the verify-all orphan-sweep law for the three dedicated e2e
 *   ports. A dead or interrupted run leaves a listener squatting a fixed port,
 *   and the next run then dies for a reason that has nothing to do with the
 *   code under test — the app server aborts in under a second and the whole
 *   `app-ui-flow` stage reads RED. This module is the single implementation:
 *   `global-setup.ts` sweeps the gateway and sidecar with it, `app-server.mjs`
 *   sweeps the app port with it BEFORE Playwright's web server binds, and
 *   `global-teardown.ts` sweeps all three on the way out.
 *
 *   Plain `.mjs` on purpose: the app-server launcher is executed by `node`
 *   directly (it must not depend on Playwright's TypeScript transform), while
 *   `global-setup.ts` reaches it through that transform. One file, both
 *   callers, no second copy free to drift.
 * Public surface: RECOGNISED_E2E_COMMAND, sweepPort, waitForPortToClose.
 * Does NOT own: the port NUMBERS (`e2e-env.ts` is their one authority), the
 *   gateway/sidecar lifecycle (global-setup spawns them), or Playwright's
 *   web-server lifecycle.
 */

import { execFileSync } from 'node:child_process';
import { connect } from 'node:net';

/**
 * A process this harness is allowed to kill. Anything else holding one of our
 * ports is someone else's — a developer's server, an unrelated tool — and the
 * sweep REFUSES rather than guessing. Killing an unrecognised process to make
 * our own suite green would be the worst possible trade.
 */
export const RECOGNISED_E2E_COMMAND = /epi .*gate .*start|e2e-vault-sidecar|vite/;

function listenersOn(port) {
    try {
        return execFileSync('lsof', ['-tiTCP:' + port, '-sTCP:LISTEN'], { encoding: 'utf8' })
            .split('\n')
            .filter(Boolean);
    } catch {
        return []; // lsof exits non-zero when nothing is listening
    }
}

function commandOf(pid) {
    try {
        return execFileSync('ps', ['-o', 'command=', '-p', String(pid)], {
            encoding: 'utf8'
        }).trim();
    } catch {
        return '';
    }
}

function alive(pid) {
    try {
        process.kill(pid, 0);
        return true;
    } catch {
        return false;
    }
}

/**
 * Free `port`, or throw naming who holds it.
 *
 * SIGTERM first, then — and this is the part the original in-line sweep was
 * missing — WAIT for the process to actually go, and escalate to SIGKILL if it
 * will not. A sweep that returns while the old listener is still shutting down
 * hands the next bind an `EADDRINUSE` it cannot explain.
 *
 * @param {number} port
 * @param {{ label?: string, graceMs?: number, log?: (message: string) => void }} [options]
 * @returns {number[]} the pids actually cleared
 */
export function sweepPort(port, options = {}) {
    const label = options.label ?? 'e2e-setup';
    const graceMs = options.graceMs ?? 3_000;
    const log = options.log ?? console.log;
    const cleared = [];

    for (const raw of listenersOn(port)) {
        const pid = Number(raw);
        if (!Number.isInteger(pid) || pid <= 0) continue;
        const command = commandOf(pid);
        if (!command) continue; // vanished between lsof and ps

        if (!RECOGNISED_E2E_COMMAND.test(command)) {
            throw new Error(
                `[${label}] port ${port} is held by an unrecognised process (pid ${pid}: ${command}) — refusing to kill it`
            );
        }

        log(`[${label}] clearing orphan on port ${port}: pid ${pid} (${command})`);
        try {
            process.kill(pid, 'SIGTERM');
        } catch {
            continue; // already gone
        }

        const deadline = Date.now() + graceMs;
        while (alive(pid) && Date.now() < deadline) {
            // a short synchronous wait: this runs before the web server binds,
            // so there is nothing else to yield to
            try {
                execFileSync('sleep', ['0.05']);
            } catch {
                break;
            }
        }
        if (alive(pid)) {
            log(`[${label}] pid ${pid} ignored SIGTERM after ${graceMs}ms — escalating to SIGKILL`);
            try {
                process.kill(pid, 'SIGKILL');
            } catch {
                /* raced us to it */
            }
        }
        cleared.push(pid);
    }

    return cleared;
}

/**
 * Resolve once nothing accepts a connection on `port`.
 * @param {number} port
 * @param {number} timeoutMs
 */
export function waitForPortToClose(port, timeoutMs) {
    return new Promise((resolvePort, rejectPort) => {
        const deadline = Date.now() + timeoutMs;
        const probe = () => {
            const socket = connect({ port, host: '127.0.0.1' }, () => {
                socket.destroy();
                if (Date.now() > deadline) {
                    rejectPort(new Error(`port ${port} did not close within ${timeoutMs}ms`));
                    return;
                }
                setTimeout(probe, 100);
            });
            socket.on('error', () => {
                socket.destroy();
                resolvePort();
            });
        };
        probe();
    });
}
