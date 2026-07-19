/**
 * Coordinate: M' M0' (drivable contemplation footer proof, 21.T21.9)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): active-carrier review-submit UI-flow gate.
 * Actualises: live prompt bus -> footer -> persisted S5 review receipt.
 * Public surface: Playwright test for data-testid=m0-contemplation-*.
 * Does NOT own: prompt authority or S5 review governance.
 * Contract: [[M0'-SPEC]] + rerun [[21-m0-anuttara-frontend-deep]] 21.9.
 */

import { expect, test } from '@playwright/test';

test('M0 contemplation footer submits a live prompted tick to S5 review', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('shell')).toBeVisible();
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });

    const shell = page.getByTestId('shell');
    if ((await shell.getAttribute('data-face')) !== '0') {
        await page.keyboard.press('Meta+.');
    }
    await expect(shell).toHaveAttribute('data-face', '0', { timeout: 20_000 });

    const bimbaTab = page.locator('.face-active .flexlayout__tab_button', { hasText: 'Bimba' });
    await expect(bimbaTab).toBeVisible({ timeout: 20_000 });
    await bimbaTab.click();
    await expect(async () => {
        if (!(await page.getByTestId('graph-explorer').isVisible())) {
            await bimbaTab.click();
        }
        await expect(page.getByTestId('graph-explorer')).toBeVisible({ timeout: 5_000 });
    }).toPass({ timeout: 40_000 });

    const footer = page.getByTestId('m0-contemplation-footer');
    await expect(footer).toBeVisible();
    await expect(footer).toHaveAttribute('data-provenance-state', 'canonical', {
        timeout: 20_000
    });
    await expect(footer.getByTestId('m0-contemplation-prompt')).toContainText(
        /Did (your speech|unity-multiplicity|the four causes|the cycle)/
    );

    await footer.getByTestId('m0-contemplation-response').fill(
        'The live review path received this contemplation.'
    );
    await footer.getByTestId('m0-contemplation-submit').click();
    await expect(footer.getByTestId('m0-contemplation-status')).toContainText(
        /Submitted for review:/
    );
    await expect(footer.getByTestId('m0-contemplation-response')).toHaveValue('');
});
