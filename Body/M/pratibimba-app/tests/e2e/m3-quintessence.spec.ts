/**
 * Coordinate: M' M3' (drivable-loop Quintessence proof, rerun 24.T24.11)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): M3' cosmic-wheel centre UI-flow gate
 * Actualises: the real gateway profile drives either the authority-provided
 *   four-petal indicator or its honest pending charge-quaternion state.
 * Public surface: Playwright test for the M3 Quintessence indicator.
 * Does NOT own: optional charge-quaternion emission or its invariant.
 * Contract: [[M3'-SPEC]] §8.4/§9 + rerun
 *   [[24-m3-mahamaya-frontend-deep]] 24.11.
 */

import { expect, test } from '@playwright/test';

test('M3 Quintessence centre follows the real gateway charge-quaternion authority (24.T24.11)', async ({
    page
}) => {
    await page.goto('/');
    await expect(page.getByTestId('shell')).toBeVisible();
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });
    await page.keyboard.press('Meta+.');
    await expect(page.getByTestId('shell')).toHaveAttribute('data-face', '0');

    await page
        .locator('.face-active .flexlayout__tab_button', { hasText: 'M3 Inspectors' })
        .click();
    const wheel = page.locator('.face-active [data-testid="m3-cosmic-wheel"]');
    await expect(wheel).toBeVisible({ timeout: 20_000 });

    const indicator = wheel.getByTestId('m3-wheel-quintessence');
    await expect(indicator).toBeVisible();
    const state = await indicator.getAttribute('data-state');
    if (state === 'ready') {
        await expect(indicator.getByTestId('m3-quintessence-petal')).toHaveCount(4);
        await expect(indicator.getByTestId('m3-quintessence-core')).toHaveAttribute(
            'data-balance',
            /^(?:0(?:\.\d+)?|1)$/
        );
    } else {
        expect(state).toBe('pending-charge-quaternion');
        await expect(page.getByTestId('m3-wheel-quintessence-pending')).toContainText(
            'pending-quintessence-indicator'
        );
    }
});
