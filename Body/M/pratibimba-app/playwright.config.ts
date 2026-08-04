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
import { sweepPort } from './tests/e2e/port-sweep.mjs';

// ORPHAN SWEEP — this has to happen at config load, and nowhere later.
//
// Playwright PROBES the web-server port and, with `reuseExistingServer: false`,
// aborts before it ever runs the web-server command. So a sweep inside the
// launcher cannot help, and neither can `globalSetup`: the web server is a
// plugin whose setup runs ahead of it. Config evaluation is the only hook that
// precedes the probe.
//
// A leftover listener here is not hypothetical — it aborted an `app-ui-flow`
// stage in under a second and read as a whole-suite RED that no spec caused.
//
// Guarded to the RUNNER process: worker processes re-evaluate this file, and a
// sweep running there would kill the very server the run is using. The sweep
// itself refuses to kill anything it does not recognise as ours.
if (process.env.TEST_WORKER_INDEX === undefined) {
    sweepPort(E2E_APP_PORT, { label: 'e2e-config' });
}

export default defineConfig({
    testDir: './tests/e2e',
    outputDir: './test-results/artifacts',
    timeout: 60_000,
    // 15.T15.12 visual-regression baselines live under the e2e tree per the
    // tranche's fixtures/visual-regression convention; {platform} suffix kept
    // because font raster + swiftshader output are platform truths (darwin
    // baselines are the committed set; other platforms regenerate with
    // --update-snapshots).
    snapshotPathTemplate: '{testDir}/fixtures/visual-regression/{arg}-{platform}{ext}',
    expect: {
        timeout: 10_000,
        // Documented diff threshold (15.T15.12; rationale also at the top of
        // tests/e2e/visual-regression.spec.ts and in the track-15 write-back):
        // per-pixel threshold 0.2 (Playwright's default YIQ distance) absorbs
        // sub-quantum antialias jitter; maxDiffPixels 500 ≈ 0.05% of the
        // 1280×800 frame — measured cross-run drift on the masked
        // compositions is 0 px on the darwin/swiftshader rig, so 400 is
        // headroom, while the smallest guarded chrome unit (a strip toggle /
        // border tab, ≥ ~1200 px) exceeds it several-fold and cannot hide.
        toHaveScreenshot: { threshold: 0.2, maxDiffPixels: 500 }
    },
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
        // `tests/e2e/app-server.mjs` sweeps a leftover listener off the app
        // port BEFORE binding (Playwright starts the web server ahead of
        // globalSetup, so global-setup's sweep is too late for this one) and
        // builds with this exact E2E environment, serves the production bundle
        // without the dev/HMR module graph, and keeps vite as a directly-
        // signalable child rather than a grandchild behind `pnpm exec`.
        command: 'node tests/e2e/app-server.mjs',
        port: E2E_APP_PORT,
        reuseExistingServer: false,
        timeout: 120_000,
        env: {
            // the launcher runs outside the TS transform, so the one port
            // authority reaches it through the environment
            E2E_APP_PORT: String(E2E_APP_PORT),
            // browser-mode seams — production paths never see these
            VITE_E2E_TAURI_SHIM: '1',
            VITE_E2E_SIDECAR_URL: SIDECAR_URL,
            VITE_EPI_GATEWAY_URL: GATEWAY_URL
        }
    }
});
