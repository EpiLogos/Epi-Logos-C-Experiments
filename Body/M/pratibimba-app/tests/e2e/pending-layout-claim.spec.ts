/**
 * Coordinate: M' shell (ide-deep smart-connections layout claim — 11.T11.4, landed by 52.T6)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): real Chromium layout-host acceptance boundary
 * Actualises: the LANDED disposition of the one active layout claim. This spec
 *   spent its code-pending life asserting the claim stayed explicit while no
 *   fictional receiver mounted; 52.T6 wired the mode-switched rail the claim
 *   always named ("smart-connections-sidebar"), so the assertion flips: the
 *   claim resolves on its REAL receiver (`semanticConnections` in the deep
 *   rails), the shell carries NO code-pending marker in either layout, and a
 *   landed-claim shell whose receiver vanished would throw at render
 *   (`ui/layoutClaims.ts` fails closed — the unit suite proves that half).
 * Public surface: Playwright landed-layout-claim spec.
 * Does NOT own: Smart Connections implementation (28.T28.12), the mode
 *   registry wiring (activity-bar-modes.spec.ts), or the layout switch (52.T3).
 * Contract: [[M5'-SPEC]] carrier foothold / [[DR-ABAR-1]].
 */

import { expect, test } from '@playwright/test';

test('the Smart Connections claim is LANDED: no code-pending marker, and the real receiver lives in the deep rail', async ({
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

    // 52.T6 settlement: the daily face-1 rail no longer carries Connections —
    // the surface is `ide-deep`-only now.
    await expect(
        page.locator('.face-active .flexlayout__border_button', { hasText: 'Connections' })
    ).toHaveCount(0);

    const layoutControl = page.locator('.face-active [data-testid="omnipanel-layout-switch"]');
    await expect(layoutControl).toBeVisible({ timeout: 15_000 });
    await layoutControl.getByTestId('omnipanel-layout-option-ide-deep').click();

    await expect(shell).toHaveAttribute('data-active-layout', 'ide-deep', { timeout: 20_000 });
    // Landed means landed: no code-pending marker in the deep layout either —
    // and the shell rendering at all proves the fail-closed receiver lookup
    // found `semanticConnections` in the live pane set.
    await expect(shell).not.toHaveAttribute('data-code-pending-layout-claims');
    await expect(
        page.locator('.face-active .flexlayout__border_button', { hasText: 'Connections' })
    ).toHaveCount(1);

    // The deep layout is a live shell, not an emptied one: a real personal
    // pane still opens in it.
    await page
        .locator('.face-active .flexlayout__tab_button', { hasText: 'Kairos setup' })
        .click();
    await expect(page.getByTestId('kairos-enablement-pane')).toBeVisible({ timeout: 20_000 });
});
