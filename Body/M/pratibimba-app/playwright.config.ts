/**
 * Coordinate: M' (real-UI verification layer — Track-00 hardening)
 * Residency: Body/M/pratibimba-app
 * Actualises: the drivable-loop gate — Playwright drives the Vite face in
 *   real Chromium against a REAL spawned `epi gate start` (port 18933) and a
 *   real-filesystem vault sidecar (port 18934). macOS constraint: tauri-driver
 *   does not support macOS, so the Tauri shell itself stays covered by
 *   `pnpm smoke`; this layer proves the face's live loops.
 * Does NOT own: the Tauri host (src-tauri), the gateway protocol (S3).
 */

import { defineConfig } from '@playwright/test';
import { E2E_APP_PORT, GATEWAY_URL, SIDECAR_URL } from './tests/e2e/e2e-env';

export default defineConfig({
    testDir: './tests/e2e',
    outputDir: './test-results/artifacts',
    timeout: 60_000,
    expect: { timeout: 10_000 },
    // one worker: the specs share one app origin, one gateway, one vault
    fullyParallel: false,
    workers: 1,
    retries: 0,
    reporter: 'list',
    globalSetup: './tests/e2e/global-setup.ts',
    globalTeardown: './tests/e2e/global-teardown.ts',
    use: {
        baseURL: `http://127.0.0.1:${E2E_APP_PORT}`,
        headless: true,
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        // the Cosmic Engine mounts three.js WebGL even on the hidden face —
        // headless Chromium needs software GL allowed
        launchOptions: { args: ['--enable-unsafe-swiftshader'] }
    },
    projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
    webServer: {
        command: `pnpm exec vite --host 127.0.0.1 --port ${E2E_APP_PORT} --strictPort`,
        port: E2E_APP_PORT,
        reuseExistingServer: false,
        timeout: 60_000,
        env: {
            // browser-mode seams — production paths never see these
            VITE_E2E_TAURI_SHIM: '1',
            VITE_E2E_SIDECAR_URL: SIDECAR_URL,
            VITE_EPI_GATEWAY_URL: GATEWAY_URL
        }
    }
});
