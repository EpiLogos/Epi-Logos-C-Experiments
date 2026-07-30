/**
 * Coordinate: M' (drivable-loop spec: boot)
 * Actualises: the live-wire proof at UI level — the shell renders, the status
 *   strip reports a REAL gateway connection, and the tick generation ADVANCES
 *   between two samples. A mounted mock cannot pass this: only the spawned
 *   `epi gate start` heartbeat moves the number.
 */

import { expect, test } from '@playwright/test';

test('shell boots, connects to the real gateway, and the tick advances', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('shell')).toBeVisible({ timeout: 20_000 });

    // six status entries render
    await expect(page.getByTestId('status-strip')).toBeVisible();

    // real connection: connect handshake against the spawned gateway
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });

    // live wire: the profile generation arrives and then STRICTLY increases
    const readGeneration = async (): Promise<number> => {
        const text = (await page.getByTestId('status-tick').textContent()) ?? '';
        const match = text.match(/(\d+)/);
        return match ? Number(match[1]) : Number.NaN;
    };
    await expect
        .poll(readGeneration, { timeout: 20_000, message: 'first profile tick never arrived' })
        .toBeGreaterThan(0);
    const first = await readGeneration();
    await expect
        .poll(readGeneration, { timeout: 20_000, message: `tick stuck at generation ${first}` })
        .toBeGreaterThan(first);
});
