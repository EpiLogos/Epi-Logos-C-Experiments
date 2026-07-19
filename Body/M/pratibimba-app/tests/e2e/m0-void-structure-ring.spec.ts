/**
 * Coordinate: M' M0' #0-4 (real 16-fold Void-Structure UI-flow gate)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): active-carrier Holographic Matrix proof
 * Actualises: real gateway profile -> branch mount -> SVG lens -> shared selection.
 * Public surface: Playwright test for data-testid=m0-void-structure-*.
 * Does NOT own: profile projection or renderer-local lens fixtures.
 * Contract: [[M0'-SPEC]] + rerun [[21-m0-anuttara-frontend-deep]] 21.15.
 */

import { expect, test } from '@playwright/test';

test('the #0-4 branch renders the live sixteen-lens ring and publishes lens selection', async ({
    page
}) => {
    await page.goto('/');
    await expect(page.getByTestId('status-gateway')).toContainText('connected', {
        timeout: 20_000
    });

    const shell = page.getByTestId('shell');
    if ((await shell.getAttribute('data-face')) !== '0') {
        await page.keyboard.press('Meta+.');
    }
    await expect(shell).toHaveAttribute('data-face', '0', { timeout: 20_000 });

    await page.locator('.face-active .flexlayout__tab_button', { hasText: 'Bimba' }).click();
    await page.getByTestId('m0-language-subtab-browser').click();

    const browser = page.getByTestId('m0-lazy-browser');
    await expect(browser).toHaveAttribute('data-state', 'canonical', { timeout: 20_000 });
    await browser.getByTestId('m0-lazy-branch-0-4').click();

    const ring = browser.getByTestId('m0-void-structure-ring');
    await expect(ring).toBeVisible();
    await expect(ring).toHaveAttribute('data-state', 'canonical');
    await expect(ring.locator('[data-lens-coordinate]')).toHaveCount(16);

    const lens = ring.getByRole('button', {
        name: '#0-4-13 Quadrant provenance canonical'
    });
    await lens.click();
    await expect(page.getByTestId('m0-surface-state')).toHaveAttribute(
        'data-selected-coordinate',
        '#0-4-13'
    );
});
