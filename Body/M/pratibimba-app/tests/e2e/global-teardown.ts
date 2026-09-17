/**
 * Coordinate: M' (e2e global teardown)
 * Actualises: no orphans — kills the spawned gateway + sidecar and removes
 *   the temp roots recorded by global-setup. The Track-00 orphan gotcha
 *   (dead runs squatting fixed ports) must not recur here.
 */

import { existsSync, readFileSync, rmSync } from 'node:fs';
import {
    E2E_APP_PORT,
    E2E_GATEWAY_PORT,
    E2E_SIDECAR_PORT,
    RUN_STATE_FILE,
    type E2eRunState
} from './e2e-env';
import { sweepPort } from './port-sweep.mjs';

/** Belt-and-braces on the way out. The pid kills below cover the processes
 *  this run recorded; the sweep additionally covers the app server, whose
 *  lifecycle belongs to Playwright and which is exactly the one that was
 *  observed surviving a run and poisoning the next. A sweep here costs
 *  nothing when everything already exited cleanly. */
function sweepE2ePorts(): void {
    for (const port of [E2E_APP_PORT, E2E_GATEWAY_PORT, E2E_SIDECAR_PORT]) {
        try {
            sweepPort(port, { label: 'e2e-teardown' });
        } catch (error) {
            // an unrecognised holder is not ours to kill, and teardown must
            // never fail a run that already finished
            console.warn(error instanceof Error ? error.message : String(error));
        }
    }
}

export default async function globalTeardown(): Promise<void> {
    if (!existsSync(RUN_STATE_FILE)) {
        sweepE2ePorts();
        return;
    }
    const state = JSON.parse(readFileSync(RUN_STATE_FILE, 'utf8')) as E2eRunState;
    for (const pid of [state.gatewayPid, state.sidecarPid]) {
        if (pid > 0) {
            try {
                process.kill(pid, 'SIGTERM');
            } catch {
                /* already gone */
            }
        }
    }
    for (const dir of [state.vaultRoot, state.gatewayStateRoot, state.gatewayHome, state.naraHome]) {
        if (dir && dir.includes('pratibimba-e2e-')) {
            rmSync(dir, { recursive: true, force: true });
        }
    }
    rmSync(RUN_STATE_FILE, { force: true });
    sweepE2ePorts();
}
