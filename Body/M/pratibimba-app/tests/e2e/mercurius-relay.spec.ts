/**
 * Coordinate: M' M4' (Mercurius signal-relay UI-flow — rerun 25.T25.16)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): CF(0/1/2/3) kairos-signal chrome, daily-0-1 mount
 * Actualises: real-browser proof that the Mercurius relay chip mounts live in
 *   the daily-0-1 chrome, declares its view id, and reports an HONEST kairos
 *   state — disabled/pending count no phantom delta; a live 10-body vector
 *   carries a real, cache-stamped refresh. Driven only by the profile-tick, so
 *   a mounted mock cannot pass: the state tracks the spawned gateway's wire.
 * Public surface: Playwright mercurius relay flow.
 * Does NOT own: gateway, Kerykeion, or the kairos populator.
 * Contract: [[M4'-SPEC]] + rerun 25.T25.16.
 */

import { expect, test } from '@playwright/test';

test('the Mercurius relay chip mounts live in daily-0-1 and reports an honest kairos state', async ({
    page
}) => {
    await page.goto('/');
    await expect(page.getByTestId('shell')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });

    // The relay chip is daily-0-1 chrome on the cosmic face — toggle to face 0.
    await page.keyboard.press('Meta+.');
    await expect(page.getByTestId('shell')).toHaveAttribute('data-face', '0');

    const chip = page.getByTestId('m4-mercurius-relay');
    await expect(chip).toBeVisible({ timeout: 20_000 });
    await expect(chip).toHaveAttribute('data-view-id', 'm4.nara.mercuriusRelay');
    // Honest state enum — never a fabricated value.
    await expect(chip).toHaveAttribute('data-state', /^(disabled|pending|live)$/);

    const state = await chip.getAttribute('data-state');
    if (state === 'live') {
        // A live sky is the ten mod-10 bodies with a profile-cache-stamped
        // refresh and a real integer delta count.
        await expect(chip).toHaveAttribute('data-planet-count', '10');
        await expect(chip).toHaveAttribute('data-delta-count', /^\d+$/);
        await expect(chip.locator('.mercurius-relay-stamp')).toBeVisible();
    } else {
        // FR-3 default-off or no signal yet: honest-pending / disabled, never a
        // phantom delta.
        await expect(chip).toHaveAttribute('data-delta-count', '0');
    }
});
