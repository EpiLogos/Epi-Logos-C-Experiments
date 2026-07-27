/**
 * Coordinate: M' M0' (drivable-loop spec: rendering mode — 28.T28.3 a/b/d)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): real Chromium / real spawned gateway carrier proof
 * Actualises: the UF half of 28.3(a)(b)(d). The unit suites prove the mode law,
 *   the projection and the canvas; only the running app can prove that the
 *   SHELL'S OWN LAYOUT drives the mode — that the daily 0/1 surface previews
 *   the anchored coordinate as a solar anchor, that entering the deep layout
 *   turns the same pane into the full lattice over live S2 edges, and that
 *   clicking a neighbour re-anchors through the one shared coordinate store.
 *
 *   The deep layout is entered the only way the carrier currently allows: a
 *   cross-layout intent (Medicine → "Open Kairos"), the same path
 *   pending-layout-claim.spec.ts drives. Track 52.T3 is landing a deliberate
 *   layout switch; when it lands this spec should drive THAT instead — the
 *   assertion (mode follows layout) does not change, only the way in.
 * Does NOT own: the layout switch (Track 52), S2 graph law, or the force-graph
 *   canvas internals.
 * Contract: [[M0'-SPEC]] + [[M5'-SPEC]] §layout + rerun tranche [[28.T28.3]].
 */

import { expect, test } from '@playwright/test';

test('28.T28.3: the active layout drives the Bimba rendering mode, both ways', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });

    const shell = page.getByTestId('shell');
    /** Bimba lives on the cosmic face (0), Medicine on the personal face (1). */
    const ensureFace = async (face: '0' | '1') => {
        if ((await shell.getAttribute('data-face')) !== face) {
            await page.keyboard.press('Meta+.');
        }
        await expect(shell).toHaveAttribute('data-face', face, { timeout: 20_000 });
    };
    await ensureFace('0');
    await expect(shell).toHaveAttribute('data-active-layout', 'daily-0-1');

    const openBimba = async () => {
        await ensureFace('0');
        await page.locator('.face-active .flexlayout__tab_button', { hasText: 'Bimba' }).click();
        await expect(page.getByTestId('graph-explorer')).toBeVisible({ timeout: 20_000 });
    };
    await openBimba();

    // ── daily: the pane previews, and says which mode it is in ──────────────
    const graph = page.getByTestId('graph-explorer');
    await expect(graph).toHaveAttribute('data-rendering-mode', 'solar-anchor');

    // anchor a real coordinate through the 96-node browser (the same shared
    // store every M0' surface publishes into)
    await page.getByTestId('m0-language-subtab-browser').click();
    const browser = page.getByTestId('m0-lazy-browser');
    await expect(browser).toHaveAttribute('data-state', 'canonical', { timeout: 20_000 });
    const firstNode = browser.locator('[data-testid^="m0-lazy-node-"]').first();
    const coordinate = await firstNode.getAttribute('data-coordinate');
    expect(coordinate).toBeTruthy();
    await firstNode.click();
    await expect(page.getByTestId('m0-surface-state')).toHaveAttribute(
        'data-selected-coordinate',
        coordinate!
    );

    // the solar anchor follows the store: it either draws that coordinate, or
    // states honestly that the loaded window does not contain it. Both are
    // real outcomes of a LIMIT-900 read; a silent blank is not.
    const anchoredCanvas = page.getByTestId('bimba-graph-canvas');
    const offWindow = page.getByTestId('bimba-graph-canvas-empty');
    await expect(anchoredCanvas.or(offWindow)).toBeVisible({ timeout: 20_000 });
    if (await anchoredCanvas.isVisible()) {
        await expect(anchoredCanvas).toHaveAttribute('data-rendering-mode', 'solar-anchor');
        await expect(anchoredCanvas).toHaveAttribute('data-anchor-coordinate', coordinate!);
        // ≤6 rendered, and the caption never claims more than it drew
        const rendered = Number(await anchoredCanvas.getAttribute('data-neighbour-count'));
        const total = Number(await anchoredCanvas.getAttribute('data-neighbour-total'));
        expect(rendered).toBeLessThanOrEqual(6);
        expect(rendered).toBeLessThanOrEqual(total);
        // clicking a neighbour re-anchors through the shared store (28.3d)
        const neighbours = page.getByTestId('bimba-graph-neighbour-node');
        if ((await neighbours.count()) > 0) {
            const next = await neighbours.first().getAttribute('data-coordinate');
            await neighbours.first().click();
            await expect(page.getByTestId('m0-surface-state')).toHaveAttribute(
                'data-selected-coordinate',
                next!
            );
            await expect(page.getByTestId('bimba-graph-canvas')).toHaveAttribute(
                'data-anchor-coordinate',
                next!
            );
        }
    } else {
        await expect(offWindow).toContainText('not in the loaded window');
    }

    // ── deep: the same pane becomes the full lattice over live S2 edges ─────
    await ensureFace('1');
    await page.locator('.face-active .flexlayout__tab_button', { hasText: 'Medicine' }).click();
    const openKairos = page.getByRole('button', { name: 'Open Kairos' });
    await expect(openKairos).toBeVisible({ timeout: 20_000 });
    await openKairos.click();
    await expect(shell).toHaveAttribute('data-active-layout', 'ide-deep', { timeout: 20_000 });

    await openBimba();
    await expect(graph).toHaveAttribute('data-rendering-mode', 'full-lattice');
    const lattice = page.getByTestId('bimba-graph-canvas');
    await expect(lattice).toHaveAttribute('data-rendering-mode', 'full-lattice');
    // the live graph really is wired through: nodes AND edges reach the canvas
    // (s2.graph.query returns the caller's own RETURN since row_projection.rs;
    // before that fix this count was structurally 0).
    await expect
        .poll(async () => Number(await lattice.getAttribute('data-node-count')), { timeout: 20_000 })
        .toBeGreaterThan(0);
    expect(Number(await lattice.getAttribute('data-edge-count'))).toBeGreaterThan(0);
});
