/**
 * Coordinate: M' M4' (transform-container real-UI proof - 25.T25.11)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): real Chromium + spawned-gateway lifecycle boundary
 * Actualises: governed start, advance, and confirmed regression in the active carrier.
 * Public surface: Playwright transform-container flow.
 * Does NOT own: canonical stages, persistence law, or gateway dispatch.
 * Contract: [[M4'-SPEC]] / Track [[25.T25.11]].
 */

import { expect, test } from '@playwright/test';

test('transform container follows the governed gateway lifecycle', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('status-gateway')).toContainText('connected', {
        timeout: 20_000
    });

    const activeFace = page.locator('.face-active');
    await activeFace.locator('.flexlayout__tab_button', { hasText: 'Transform' }).click();

    const pane = activeFace.getByTestId('transform-containers-pane');
    await expect(pane).toBeVisible();
    await expect(pane).toHaveAttribute('data-privacy-class', 'protected-local');

    await pane.getByRole('button', { name: 'Start Bohm Dialogue' }).click();
    await expect(pane.getByTestId('transform-position')).toHaveText('1 / 5', {
        timeout: 20_000
    });
    await expect(pane.getByTestId('m4-transform-badge')).toHaveText('nigredo');

    await pane.getByRole('button', { name: 'Advance' }).click();
    await expect(pane.getByTestId('transform-position')).toHaveText('2 / 5');
    await expect(pane.getByTestId('m4-transform-badge')).toHaveText('separatio');

    // 31.T31.8: the backstep is confirmed INLINE now. This used to need
    // `page.once('dialog', d => d.accept())` — that line was the proof a
    // blocking native dialog really fired here in production (CCT-8).
    await pane.getByRole('button', { name: 'Back' }).click();
    await pane.getByTestId('transform-backstep-confirm-confirm').click();
    await expect(pane.getByTestId('transform-position')).toHaveText('1 / 5');
    await expect(pane.getByTestId('m4-transform-badge')).toHaveText('nigredo');
});
