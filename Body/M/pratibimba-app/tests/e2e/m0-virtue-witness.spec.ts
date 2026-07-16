/**
 * Coordinate: M' M0' (drivable-loop Virtue Witness proof, rerun 21.T21.10)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): M0-0' verifier witness UI-flow gate
 * Actualises: the carrier mounts its witness panel against a real spawned
 *   gateway profile and renders either the strict 9-cell projection or its
 *   honest declared-not-emitted state.
 * Public surface: Playwright test for data-testid=m0-virtue-witness-*.
 * Does NOT own: optional projection emission or witness computation.
 * Contract: [[M0'-SPEC]] + rerun [[21-m0-anuttara-frontend-deep]] 21.10.
 */

import { expect, test } from '@playwright/test';

test('M0 Virtue Witness panel follows the real gateway profile (21.T21.10)', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('shell')).toBeVisible();
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });
    // Land on face 0 (where Bimba lives) deterministically — a single toggle
    // assumes a starting face that persisted layout can flip.
    const shell = page.getByTestId('shell');
    if ((await shell.getAttribute('data-face')) !== '0') {
        await page.keyboard.press('Meta+.');
    }
    await expect(shell).toHaveAttribute('data-face', '0', { timeout: 20_000 });

    const bimbaTab = page.locator('.face-active .flexlayout__tab_button', { hasText: 'Bimba' });
    await expect(bimbaTab).toBeVisible({ timeout: 20_000 });
    await bimbaTab.click();
    // graph-explorer only mounts once the pane sees the connected store flag;
    // a freshly spawned gateway can lag the status text, so retry the tab click
    // until the pane is up rather than assuming the first click caught it.
    await expect(async () => {
        if (!(await page.getByTestId('graph-explorer').isVisible())) {
            await bimbaTab.click();
        }
        await expect(page.getByTestId('graph-explorer')).toBeVisible({ timeout: 5_000 });
    }).toPass({ timeout: 40_000 });

    const graphExplorer = page.getByTestId('graph-explorer');
    const ready = graphExplorer.getByTestId('m0-virtue-witness-panel');
    const pending = graphExplorer.getByTestId('m0-virtue-witness-pending');
    const resolved = ready.or(pending);
    await expect(resolved).toBeVisible({ timeout: 20_000 });
    // Connection precedes the first profile tick. Wait until the witness view
    // binds a real generation before choosing its ready/pending branch.
    await expect(resolved).toHaveAttribute('data-generation', /^\d+$/, { timeout: 20_000 });

    if (await ready.isVisible()) {
        await expect(ready.getByTestId('m0-virtue-witness-cell')).toHaveCount(9);
        await expect(ready.getByTestId('m0-virtue-coherence')).toHaveAttribute(
            'data-band',
            /^(green|amber|red)$/
        );
        await expect(ready.getByTestId('m0-virtue-witness-grid')).toHaveAttribute(
            'data-filled',
            /^(?:[0-9])$/
        );
    } else {
        await expect(pending).toContainText('not emitted');
    }
});

test('M0 reading/authoring mode toggle gates routed-write affordances in the live app (21.T21.12)', async ({
    page
}) => {
    await page.goto('/');
    await expect(page.getByTestId('shell')).toBeVisible();
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });
    // Bimba lives on face 0; the toggle's starting face can vary with persisted
    // layout, so land on face 0 deterministically rather than assuming one press.
    const shell = page.getByTestId('shell');
    if ((await shell.getAttribute('data-face')) !== '0') {
        await page.keyboard.press('Meta+.');
    }
    await expect(shell).toHaveAttribute('data-face', '0', { timeout: 20_000 });
    const bimbaTab = page.locator('.face-active .flexlayout__tab_button', { hasText: 'Bimba' });
    await expect(bimbaTab).toBeVisible({ timeout: 20_000 });
    await bimbaTab.click();
    // graph-explorer only mounts once the pane sees the connected store flag;
    // a freshly spawned gateway can lag the status text, so retry the tab click
    // until the pane is up rather than assuming the first click caught it.
    await expect(async () => {
        if (!(await page.getByTestId('graph-explorer').isVisible())) {
            await bimbaTab.click();
        }
        await expect(page.getByTestId('graph-explorer')).toBeVisible({ timeout: 5_000 });
    }).toPass({ timeout: 40_000 });

    const panel = page.getByTestId('m0-mode-actions');
    await expect(panel).toBeVisible({ timeout: 20_000 });

    // Reading mode (default): only the read-side readiness-evidence deposit,
    // no routed-write actions, no DR-M0-1 banner (SC-2 / DR-M0-1 at UI level).
    await expect(panel).toHaveAttribute('data-mode', 'reading');
    await expect(panel.getByTestId('m0-action-deposit-graph-readiness-evidence')).toBeVisible();
    await expect(panel.getByTestId('m0-action-request-anuttara-review')).toHaveCount(0);
    await expect(panel.getByTestId('m0-dr-m0-1-banner')).toHaveCount(0);

    // Authoring mode reveals all three routed actions, both governance deep-links,
    // and the DR-M0-1 provenance banner.
    await panel.getByTestId('m0-mode-switch-authoring').click();
    await expect(panel).toHaveAttribute('data-mode', 'authoring');
    await expect(panel.getByTestId('m0-action-open-language-development-route')).toBeVisible();
    await expect(panel.getByTestId('m0-action-request-anuttara-review')).toBeVisible();
    await expect(panel.getByTestId('m0-deeplink-canonStudio')).toBeVisible();
    await expect(panel.getByTestId('m0-deeplink-logosAtelier')).toBeVisible();
    await expect(panel.getByTestId('m0-dr-m0-1-banner')).toHaveAttribute(
        'data-provenance-state',
        'derived'
    );
});
