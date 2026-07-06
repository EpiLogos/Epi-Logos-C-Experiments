/**
 * Coordinate: M' (e2e global teardown)
 * Actualises: no orphans — kills the spawned gateway + sidecar and removes
 *   the temp roots recorded by global-setup. The Track-00 orphan gotcha
 *   (dead runs squatting fixed ports) must not recur here.
 */

import { existsSync, readFileSync, rmSync } from 'node:fs';
import { RUN_STATE_FILE, type E2eRunState } from './e2e-env';

export default async function globalTeardown(): Promise<void> {
    if (!existsSync(RUN_STATE_FILE)) {
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
    for (const dir of [state.vaultRoot, state.gatewayStateRoot, state.naraHome]) {
        if (dir && dir.includes('pratibimba-e2e-')) {
            rmSync(dir, { recursive: true, force: true });
        }
    }
    rmSync(RUN_STATE_FILE, { force: true });
}
