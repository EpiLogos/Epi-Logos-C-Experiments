/**
 * Coordinate: M' `/` membrane (composition dispatch real-UI proof - 29.T29.11 + 29.T29.15)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Actualises: mounted personal/cosmic lifecycle events in the real Dispatch
 *   fold (29.11), and the composition.pentadic_trace.advance event firing on a
 *   real profile-generation advance over the live gateway (29.15).
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

test('29.T29.15: composition.pentadic_trace.advance fires when the real profile generation advances', async ({
    page
}) => {
    await page.goto('/');
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });

    await page.keyboard.press('Meta+.');
    await expect(page.getByTestId('shell')).toHaveAttribute('data-face', '0');
    await page.keyboard.press('Meta+.');
    await expect(page.getByTestId('shell')).toHaveAttribute('data-face', '1');

    await page.locator('.face-active .flexlayout__border_button', { hasText: 'Dispatch' }).click();
    const trace = page.getByTestId('composition-dispatch-trace');
    await expect(trace).toBeVisible();

    // Prove the mounted compositions observe a GENUINE generation-to-generation
    // advance (not just a first render): read the app's own tick, then wait for
    // it to strictly increase. Only the live gateway heartbeat moves this — a
    // mounted-but-static overlay cannot.
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

    // Now that the profile generation really advanced, the NEW event must be in
    // the Dispatch trace. The 36.x pentadic overlay (engine-pentadic-overlay)
    // is only a render surface and emits NOTHING onto this composition-event
    // ring — so this text can only come from the 29.15 emit on a live trace
    // tick change, driven by the real advance just proven above.
    await expect(trace).toContainText('composition.pentadic_trace.advance', { timeout: 30_000 });
});
