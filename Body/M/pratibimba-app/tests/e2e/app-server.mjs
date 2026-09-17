/**
 * Coordinate: M' (e2e harness — the app web server Playwright launches)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): #4 — the app origin every spec drives
 * Actualises: Playwright's `webServer` command, with the three fixes the plain
 *   `pnpm exec vite …` form could not carry:
 *
 *   1. IT SWEEPS FIRST. Playwright starts the web server BEFORE `globalSetup`
 *      runs, so global-setup's orphan sweep — which already knew about `vite`
 *      but only ever swept the gateway and sidecar ports — could never save
 *      this one. With `reuseExistingServer: false`, a leftover listener made
 *      the run abort in under a second and the whole `app-ui-flow` stage read
 *      RED for a reason no spec caused. The sweep happens here, in the only
 *      place that is early enough.
 *
 *   2. VITE IS A DIRECT CHILD. `pnpm exec vite` put a package-manager process
 *      between Playwright and the server, so a signal aimed at the web server
 *      could land on the wrapper and leave vite holding the port. Here vite is
 *      spawned straight from `process.execPath`, and SIGTERM/SIGINT are
 *      forwarded to it, so the shutdown Playwright asks for is the shutdown
 *      that happens.
 *
 *   3. THE TESTS DRIVE A FRESH PRODUCTION BUNDLE. Vite's development graph
 *      made Chromium fetch hundreds of source modules independently; a host
 *      network transition could strand any subset as `ERR_NETWORK_CHANGED`
 *      and leave a random spec staring at a white page. The launcher builds
 *      with the exact E2E environment and serves that output through
 *      `vite preview`, removing HMR and the app's source-module request
 *      fan-out. The eight source authorities explicitly imported by E2E specs
 *      are exposed as closed facades onto the running app's own singleton
 *      modules; arbitrary source paths remain unavailable.
 *
 *   Run as `node tests/e2e/app-server.mjs` — deliberately outside Playwright's
 *   TypeScript transform, so its port comes from the environment rather than
 *   from importing `e2e-env.ts`. `playwright.config.ts` passes it from that
 *   one authority.
 * Public surface: the CLI entry point only.
 * Does NOT own: the port number (`e2e-env.ts`), the sweep law
 *   (`port-sweep.mjs`), or the gateway/sidecar (global-setup spawns those).
 */

import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { sweepPort } from './port-sweep.mjs';

const APP_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

const port = Number(process.env.E2E_APP_PORT);
if (!Number.isInteger(port) || port <= 0) {
    console.error('[e2e-app-server] E2E_APP_PORT must be set by playwright.config.ts');
    process.exit(1);
}

// Refuses (throws) when something unrecognised holds the port, which is the
// honest outcome: better a named failure than killing a developer's server.
sweepPort(port, { label: 'e2e-app-server' });

const viteBin = join(APP_ROOT, 'node_modules', 'vite', 'bin', 'vite.js');
if (!existsSync(viteBin)) {
    console.error(`[e2e-app-server] vite not found at ${viteBin} — run pnpm install`);
    process.exit(1);
}

let activeChild = spawn(process.execPath, [viteBin, 'build'], {
    cwd: APP_ROOT,
    stdio: 'inherit'
});

for (const signal of ['SIGTERM', 'SIGINT', 'SIGHUP']) {
    process.on(signal, () => {
        try {
            activeChild?.kill(signal);
        } catch {
            /* already gone */
        }
    });
}

const buildResult = await new Promise(resolve => {
    activeChild.once('error', error => resolve({ error }));
    activeChild.once('exit', (code, signal) => resolve({ code, signal }));
});
if (buildResult.error || buildResult.signal || buildResult.code !== 0) {
    const reason = buildResult.error?.message ?? buildResult.signal ?? `exit ${buildResult.code}`;
    console.error(`[e2e-app-server] production build failed: ${reason}`);
    process.exit(1);
}

activeChild = spawn(
    process.execPath,
    [viteBin, 'preview', '--host', '127.0.0.1', '--port', String(port), '--strictPort'],
    { cwd: APP_ROOT, stdio: 'inherit' }
);
activeChild.once('error', error => {
    console.error(`[e2e-app-server] failed to start production preview: ${error.message}`);
    process.exit(1);
});
activeChild.once('exit', (code, signal) => {
    process.exit(signal ? 1 : (code ?? 0));
});
