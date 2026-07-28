// @vitest-environment node
/**
 * Coordinate: M' (e2e harness — orphan-port sweep behaviour)
 * Residency: Body/M/pratibimba-app/scripts
 * Position (#n): #4 — the precondition a fixed-port suite runs inside
 * Actualises: behavioural proof of `tests/e2e/port-sweep.mjs` against REAL
 *   processes holding REAL ports. This is the regression gate for a defect
 *   that cost whole `app-ui-flow` runs: a leftover listener on the dedicated
 *   app port made Playwright abort in under a second (`reuseExistingServer` is
 *   false), and the stage read RED for a reason no spec caused.
 *
 *   Both directions are proven, because a sweep that is too eager is worse
 *   than one that is too shy: a recognised orphan is really killed and its
 *   port really freed, and an unrecognised holder is really left alive.
 * Does NOT own: the port numbers (`tests/e2e/e2e-env.ts`), Playwright's
 *   web-server lifecycle, or the gateway/sidecar spawn (global-setup).
 * Contract: verify-all orphan-sweep law (Track 00).
 */

import { afterEach, describe, expect, it } from 'vitest';
import { spawn } from 'node:child_process';
import { createServer, connect } from 'node:net';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { RECOGNISED_E2E_COMMAND, sweepPort } from '../tests/e2e/port-sweep.mjs';

const FIXTURES = join(dirname(fileURLToPath(import.meta.url)), '__fixtures__');
const spawned = [];

afterEach(() => {
    for (const child of spawned.splice(0)) {
        try {
            child.kill('SIGKILL');
        } catch {
            /* already gone */
        }
    }
});

/** An actually-free port, taken by binding and releasing one. */
function freePort() {
    return new Promise(resolve => {
        const probe = createServer();
        probe.listen(0, '127.0.0.1', () => {
            const { port } = probe.address();
            probe.close(() => resolve(port));
        });
    });
}

function portIsOpen(port) {
    return new Promise(resolve => {
        const socket = connect({ port, host: '127.0.0.1' }, () => {
            socket.destroy();
            resolve(true);
        });
        socket.on('error', () => {
            socket.destroy();
            resolve(false);
        });
    });
}

async function waitFor(predicate, timeoutMs = 5_000) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
        if (await predicate()) return true;
        await new Promise(r => setTimeout(r, 50));
    }
    return false;
}

async function startProbe(fixture, port) {
    const child = spawn(process.execPath, [join(FIXTURES, fixture), String(port)], {
        stdio: 'ignore'
    });
    spawned.push(child);
    // `process.kill(pid, 0)` is NOT a liveness probe for a direct child: a
    // terminated child stays in the process table as a zombie until reaped, so
    // that check reports it alive after it has died. The child's own exit event
    // is the authority, and awaiting it also reaps the entry.
    child.exited = new Promise(resolve => child.once('exit', () => resolve(true)));
    const opened = await waitFor(() => portIsOpen(port));
    expect(opened, `${fixture} never bound port ${port}`).toBe(true);
    return child;
}

function exitedWithin(child, timeoutMs) {
    return Promise.race([
        child.exited,
        new Promise(resolve => setTimeout(() => resolve(false), timeoutMs))
    ]);
}

describe('e2e orphan-port sweep', () => {
    it('frees a port held by a recognisable harness process', async () => {
        const port = await freePort();
        const child = await startProbe('vite-listener-probe.mjs', port);

        const cleared = sweepPort(port, { label: 'test', log: () => {} });

        expect(cleared).toContain(child.pid);
        expect(await waitFor(async () => !(await portIsOpen(port)))).toBe(true);
        expect(await exitedWithin(child, 5_000), 'the swept process never exited').toBe(true);
    });

    it('refuses an unrecognised holder and leaves it running', async () => {
        const port = await freePort();
        const child = await startProbe('stranger-listener-probe.mjs', port);

        // someone else's server on our port is a named failure, never a kill
        expect(() => sweepPort(port, { label: 'test', log: () => {} })).toThrow(
            /unrecognised process/
        );
        expect(
            await exitedWithin(child, 300),
            'the sweep killed a process it did not recognise'
        ).toBe(false);
        expect(await portIsOpen(port)).toBe(true);
    });

    it('is a no-op on a free port', async () => {
        const port = await freePort();
        expect(sweepPort(port, { label: 'test', log: () => {} })).toEqual([]);
    });

    it('recognises the three harness commands and nothing else', () => {
        expect(RECOGNISED_E2E_COMMAND.test('/path/to/epi gate start --port 18933')).toBe(true);
        expect(RECOGNISED_E2E_COMMAND.test('node scripts/e2e-vault-sidecar.mjs')).toBe(true);
        expect(RECOGNISED_E2E_COMMAND.test('node node_modules/vite/bin/vite.js --port 14621')).toBe(
            true
        );
        expect(RECOGNISED_E2E_COMMAND.test('/usr/bin/postgres -D /var/db')).toBe(false);
        expect(RECOGNISED_E2E_COMMAND.test('node my-own-dev-server.js')).toBe(false);
    });
});
