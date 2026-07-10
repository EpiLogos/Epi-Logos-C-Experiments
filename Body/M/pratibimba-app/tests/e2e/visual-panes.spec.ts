/**
 * Coordinate: M' (drivable-loop spec: the cosmic-face visual surfaces)
 * Actualises: the Track-00 gap this spec closes — every prior "done" carrier
 *   tranche proved itself in C/Rust or a jsdom mount and NEVER opened the app,
 *   because the cosmic face (three.js Cosmic Engine + Walk + Bimba + Klein) is
 *   face 0 and the app boots on face 1 (personal), so no e2e spec ever reached
 *   it. This spec drives the real Vite face in real Chromium against the real
 *   spawned gateway and asserts the visual surfaces actually render and behave:
 *     1. the Cosmic Engine mounts a LIVE WebGL surface (not the fallback) — the
 *        exact capability the M1' played-torus (T2.6) will need;
 *     2. the Walk pane walks the REAL S2 graph and the single session-held #
 *        (Inversion_Operator, T2.5) surfaces from the live profile bus and the
 *        invert round-trips X → X′ → X.
 *   A mounted mock cannot pass either: only the spawned `epi gate start`
 *   produces the graph topology and the profile that carries the # handle.
 * Does NOT own: the gateway protocol (S3), the Tauri host (src-tauri).
 */

import { expect, test } from '@playwright/test';

/** The app boots on the personal face (1); the three.js surfaces live on the
 *  cosmic face (0). ⌘. (App.tsx keydown → face.toggle) is the switch. */
async function switchToCosmicFace(page: import('@playwright/test').Page): Promise<void> {
    await expect(page.getByTestId('shell')).toBeVisible();
    // gateway must be live before the cosmic surfaces have anything to draw
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });
    await page.keyboard.press('Meta+.');
    await expect(page.getByTestId('shell')).toHaveAttribute('data-face', '0');
}

test('cosmic face: the Cosmic Engine mounts a live three.js WebGL surface (played-torus precedent)', async ({
    page
}) => {
    await page.goto('/');
    await switchToCosmicFace(page);

    // the Cosmic Engine renders three.js, NOT the WebGL-unavailable fallback
    const cosmic = page.locator('.face-active [data-testid="cosmic-engine"]');
    await expect(cosmic).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('cosmic-engine-fallback')).toHaveCount(0);

    // three.js appended a real <canvas> with a non-zero drawing surface
    const canvas = cosmic.locator('canvas').first();
    await expect(canvas).toBeVisible();
    const box = await canvas.boundingBox();
    expect(box?.width ?? 0).toBeGreaterThan(0);
    expect(box?.height ?? 0).toBeGreaterThan(0);

    // and the GL context is real and not lost — swiftshader in headless
    // Chromium (playwright.config launchOptions) makes this deterministic
    const glLive = await canvas.evaluate((el: HTMLCanvasElement) => {
        const ctx =
            (el.getContext('webgl2') as WebGLRenderingContext | null) ??
            (el.getContext('webgl') as WebGLRenderingContext | null);
        return ctx !== null && !ctx.isContextLost();
    });
    expect(glLive, 'three.js WebGL context should be live in the e2e face').toBe(true);
});

test('cosmic face: the M1 played-torus renders the ananda vortex live off the bus (T2.6)', async ({
    page
}) => {
    await page.goto('/');
    await switchToCosmicFace(page);

    // activate the Played Torus tab on the cosmic face
    await page
        .locator('.face-active .flexlayout__tab_button', { hasText: 'Played Torus' })
        .click();

    const pane = page.locator('.face-active [data-testid="m1-played-torus"]');
    await expect(pane).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('m1-played-torus-fallback')).toHaveCount(0);

    // ananda_vortex is a NON-optional projection on the live profile
    // (portal-core kernel/profile.rs:579) — against the real spawned gateway
    // the surface must reach ready, never the pending overlay
    await expect(pane).toHaveAttribute('data-vortex-state', 'ready', { timeout: 20_000 });

    // the dual-register cell chrome carries the kernel's raw + digit-root
    // faces (a window onto the Tranche 10.10 writes, not local math)
    const cell = page.getByTestId('m1-played-torus-cell');
    await expect(cell).toContainText(
        /family (bimba|pratibimba|sum|diff-a|diff-b|quintessence)/
    );
    // dual-register faces: raw may be negative (diff-a = −1) or — (rule family)
    await expect(cell).toContainText(/raw (-?\d+|—) · dr (\d+|—)/);

    // three.js mounted a live GL canvas for the K²
    const canvas = pane.locator('canvas').first();
    await expect(canvas).toBeVisible();
    const glLive = await canvas.evaluate((el: HTMLCanvasElement) => {
        const ctx =
            (el.getContext('webgl2') as WebGLRenderingContext | null) ??
            (el.getContext('webgl') as WebGLRenderingContext | null);
        return ctx !== null && !ctx.isContextLost();
    });
    expect(glLive, 'played-torus WebGL context should be live').toBe(true);
});

test('cosmic face: the Walk pane walks the REAL graph and the # invert round-trips X → X′ → X', async ({
    page
}) => {
    await page.goto('/');
    await switchToCosmicFace(page);

    // activate the Walk tab on the cosmic face
    await page
        .locator('.face-active .flexlayout__tab_button', { hasText: 'Walk' })
        .click();

    // the walk auto-arrives at M1 from the REAL gateway (s2.graph.node) — only
    // the spawned gateway's topology produces this node
    const node = page.getByTestId('walk-node');
    await expect(node).toContainText('M1', { timeout: 20_000 });

    // T2.5 substrate-on-the-bus proof: the single session-held # operator handle
    // is carried on the live profile and surfaced at the walked coordinate
    await expect(page.getByTestId('m1-inversion-operator')).toContainText('m1://inversion/operator', {
        timeout: 20_000
    });

    // T2.5 carrier affordance: invert toggles the reciprocal face as a pure
    // involution and round-trips, WITHOUT walking (the graph node stays M1)
    const invertFace = page.getByTestId('m1-invert-face');
    await expect(invertFace).toHaveText('M1');
    await page.getByTestId('m1-invert-current-coordinate').click();
    await expect(invertFace).toHaveText("M1'");
    await page.getByTestId('m1-invert-current-coordinate').click();
    await expect(invertFace).toHaveText('M1');
    await expect(node).toContainText('M1');
});
