/**
 * Coordinate: M' shell (ide-deep code-pending layout claim - 11.T11.4)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): real Chromium layout-host acceptance boundary
 * Actualises: an ide-deep transition that keeps the unlanded Smart Connections
 *   claim explicit while mounting no fictional receiver.
 * Public surface: Playwright pending-layout-claim spec.
 * Does NOT own: Smart Connections implementation or Track 03 T6.5.
 * Contract: [[M5'-SPEC]] carrier foothold / [[11-theia-shell-surface-hosting]].
 */

import { expect, test } from '@playwright/test';

test('ide-deep tolerates the Smart Connections code-pending claim without a receiver', async ({
    page
}) => {
    await page.goto('/');
    const shell = page.getByTestId('shell');
    await expect(shell).toBeVisible();
    await expect(page.getByTestId('status-gateway')).toContainText('connected', {
        timeout: 20_000
    });
    await expect(shell).toHaveAttribute('data-active-layout', 'daily-0-1');
    await expect(shell).not.toHaveAttribute('data-code-pending-layout-claims');

    await page.locator('.face-active .flexlayout__tab_button', { hasText: 'Medicine' }).click();
    await page.getByRole('button', { name: 'Open Kairos' }).click();

    await expect(shell).toHaveAttribute('data-active-layout', 'ide-deep');
    await expect(shell).toHaveAttribute(
        'data-code-pending-layout-claims',
        'pratibimba.smart-connections-sidebar'
    );
    await expect(page.getByTestId('kairos-enablement-pane')).toBeVisible();
    await expect(
        page.locator('.flexlayout__tab_button', { hasText: 'Smart Connections' })
    ).toHaveCount(0);
});
