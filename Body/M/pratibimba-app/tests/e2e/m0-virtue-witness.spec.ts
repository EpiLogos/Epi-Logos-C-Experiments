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
    await page.keyboard.press('Meta+.');
    await expect(page.getByTestId('shell')).toHaveAttribute('data-face', '0');

    await page.locator('.face-active .flexlayout__tab_button', { hasText: 'Bimba' }).click();
    await expect(page.getByTestId('graph-explorer')).toBeVisible({ timeout: 20_000 });

    const graphExplorer = page.getByTestId('graph-explorer');
    const ready = graphExplorer.getByTestId('m0-virtue-witness-panel');
    const pending = graphExplorer.getByTestId('m0-virtue-witness-pending');
    await expect(ready.or(pending)).toBeVisible({ timeout: 20_000 });

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
        await expect(pending).toHaveAttribute('data-generation', /^\d+$/);
    }
});
