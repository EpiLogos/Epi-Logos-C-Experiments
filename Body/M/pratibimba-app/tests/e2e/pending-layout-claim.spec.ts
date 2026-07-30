/**
 * Coordinate: M' shell (ide-deep code-pending layout claim - 11.T11.4)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): real Chromium layout-host acceptance boundary
 * Actualises: an ide-deep transition that keeps the unlanded Smart Connections
 *   claim explicit while mounting no fictional receiver. The transition is
 *   driven through 52.T3's real OmniPanel switch; it used to ride a
 *   cross-layout intent whose target had INHERITED `preferredLayout:
 *   'ide-deep'` from a parameter default, which 52.T3 removed.
 * Public surface: Playwright pending-layout-claim spec.
 * Does NOT own: Smart Connections implementation, Track 03 T6.5, or the layout
 *   switch itself (52.T3 — `layout-switch.spec.ts` proves it).
 * Contract: [[M5'-SPEC]] carrier foothold / [[11-theia-shell-surface-hosting]].
 */

import { expect, test } from '@playwright/test';

test('ide-deep tolerates the Smart Connections code-pending claim without a receiver', async ({
    page
}) => {
    await page.goto('/');
    const shell = page.getByTestId('shell');
    await expect(shell).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('status-gateway')).toContainText('connected', {
        timeout: 20_000
    });
    await expect(shell).toHaveAttribute('data-active-layout', 'daily-0-1');
    await expect(shell).not.toHaveAttribute('data-code-pending-layout-claims');

    const layoutControl = page.locator('.face-active [data-testid="omnipanel-layout-switch"]');
    await expect(layoutControl).toBeVisible({ timeout: 15_000 });
    await layoutControl.getByTestId('omnipanel-layout-option-ide-deep').click();

    await expect(shell).toHaveAttribute('data-active-layout', 'ide-deep', { timeout: 20_000 });
    await expect(shell).toHaveAttribute(
        'data-code-pending-layout-claims',
        'pratibimba.smart-connections-sidebar',
        { timeout: 20_000 }
    );
    // the deep layout is a live shell, not an emptied one: a real personal pane
    // still opens in it (this was previously reached via the intent's receiver;
    // it is now reached the way a user would, through the tab strip).
    await page
        .locator('.face-active .flexlayout__tab_button', { hasText: 'Kairos setup' })
        .click();
    await expect(page.getByTestId('kairos-enablement-pane')).toBeVisible({ timeout: 20_000 });
    await expect(
        page.locator('.flexlayout__tab_button', { hasText: 'Smart Connections' })
    ).toHaveCount(0);
});
