/**
 * Coordinate: M' `/` membrane (composition dispatch real-UI proof - 29.T29.11)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Actualises: mounted personal/cosmic lifecycle events in the real Dispatch fold.
 * Does NOT own: event vocabulary or composition lifecycle.
 */

import { expect, test } from '@playwright/test';

test('Dispatch trace renders lifecycle events from both mounted compositions', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('status-gateway')).toContainText('connected', {
        timeout: 20_000
    });

    await page.keyboard.press('Meta+.');
    await expect(page.getByTestId('shell')).toHaveAttribute('data-face', '0');
    await page.keyboard.press('Meta+.');
    await expect(page.getByTestId('shell')).toHaveAttribute('data-face', '1');

    await page.locator('.face-active .flexlayout__border_button', { hasText: 'Dispatch' }).click();
    const trace = page.getByTestId('composition-dispatch-trace');
    await expect(trace).toBeVisible();
    await expect(trace).toContainText('composition.mount');
    await expect(trace).toContainText('jiva-siva.integrated');
    await expect(trace).toContainText('cosmic-engine.integrated');
});
