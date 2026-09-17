/**
 * Coordinate: M' (drivable-loop spec: CU-ledger review surface — 40.T40.5)
 * Actualises: the pane mounts in the real face against a REAL spawned gateway
 *   and tells the truth about the `s5'.canon_update.*` seam: the family is
 *   deliberately CLI-side today (epi bimba + gateway runtime, one substrate;
 *   the ws wire answers `unimplemented` per the T5 method audit), so the
 *   drivable loop proves the honest pending-wire surface — the moment the ws
 *   seam lands, this spec's pending assertion flips to a live-rows assertion.
 */

import { expect, test } from '@playwright/test';

test('the CU ledger pane mounts and renders the honest canon_update wire state', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });

    await page
        .locator('.face-active .flexlayout__tab_button', { hasText: 'CU Ledger' })
        .click();

    const root = page.getByTestId('canon-ledger-root');
    await expect(root).toBeVisible({ timeout: 15_000 });

    // The live gateway serves the family as unimplemented (CLI-side substrate,
    // gate/parity.rs) — the pane must say so rather than fabricate rows.
    await expect(page.getByTestId('canon-ledger-pending-wire')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('canon-ledger-empty')).toBeVisible();
});
