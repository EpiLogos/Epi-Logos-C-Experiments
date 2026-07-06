/**
 * Coordinate: M' (e2e harness constants)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Actualises: the one place the drivable-loop harness names its ports and
 *   state file — config, global setup/teardown, and specs all import from
 *   here so the wiring cannot drift.
 * Does NOT own: the app's production ports (vite 14620, gateway 18794).
 */

import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Dedicated e2e ports — never the production 14620/18794 pair, so a running
 *  dev instance and the e2e run cannot poison each other. */
export const E2E_APP_PORT = 14621;
export const E2E_GATEWAY_PORT = 18933;
export const E2E_SIDECAR_PORT = 18934;

export const APP_ROOT = resolve(fileURLToPath(new URL('../..', import.meta.url)));
export const REPO_ROOT = resolve(APP_ROOT, '..', '..', '..');

export const EPI_BIN =
    process.env.EPI_BIN ?? join(REPO_ROOT, 'Body', 'S', 'S0', 'epi-cli', 'target', 'debug', 'epi');

/** Written by global-setup, read by teardown + specs (pids, temp roots). */
export const RUN_STATE_FILE = join(APP_ROOT, 'test-results', 'e2e-run.json');

export const SIDECAR_URL = `http://127.0.0.1:${E2E_SIDECAR_PORT}`;
export const GATEWAY_URL = `ws://127.0.0.1:${E2E_GATEWAY_PORT}`;

export interface E2eRunState {
    gatewayPid: number;
    sidecarPid: number;
    vaultRoot: string;
    gatewayStateRoot: string;
    /** Isolated $HOME for the real epi oracle casts (fresh per run — the
     *  hygiene ledger and kairos cache never touch the developer's home). */
    naraHome: string;
}

/** Month-first day id — mirrors src-tauri/src/vault.rs begin_today (%m-%d-%Y,
 *  Architect correction 2026-07-02) and src/App.tsx todayId(). */
export function todayId(now = new Date()): string {
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    return `${mm}-${dd}-${now.getFullYear()}`;
}
