/**
 * Coordinate: M4' personal composition (time-axis switcher — 25.T25.17)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): real Chromium / gateway carrier proof
 * Actualises: the three-mode time-axis switcher is live on the personal pole —
 *   it renders in the running app, a click changes the foregrounded reading, and
 *   cmd-shift-T cycles the modes through the real composition state (no jsdom
 *   mock). The selection survives a face crossing (session-scope, one substrate).
 * Public surface: Playwright time-axis-switcher acceptance test.
 * Does NOT own: composition persistence storage or the 25.6 personal renderer.
 * Contract: [[M'-SYSTEM-SPEC]] + rerun tranche [[25.T25.17]] (DR-WC-M4-1).
 */

import { expect, test } from '@playwright/test';

test('25.T25.17: the personal time-axis switcher selects a mode and cmd-shift-T cycles it', async ({
    page
}) => {
    await page.goto('/');
    const shell = page.getByTestId('shell');
    await expect(shell).toBeVisible();
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });

    // the switcher lives on the personal (4-5-0) pole — reach face 1
    if ((await shell.getAttribute('data-face')) !== '1') {
        await page.getByTestId('face-toggle').click();
    }
    await expect(shell).toHaveAttribute('data-face', '1');

    const switcher = page.getByTestId('time-axis-switcher');
    await expect(switcher).toBeVisible();

    // a click selects a reading; the switcher reflects it live
    await page.getByTestId('time-axis-mode-natal').click();
    await expect(switcher).toHaveAttribute('data-mode', 'natal');
    await expect(page.getByTestId('time-axis-mode-natal')).toHaveAttribute('data-active', 'true');

    // cmd-shift-T cycles to the next reading (natal → real-time)
    await page.getByTestId('status-strip').click(); // focus off the control
    await page.keyboard.press('Meta+Shift+T');
    await expect(switcher).toHaveAttribute('data-mode', 'real-time');

    // the selection is held on the shared composition state — a face crossing
    // away and back does not reset it (distinct from the 11.12 sense override)
    await page.keyboard.press('Meta+.');
    await expect(shell).toHaveAttribute('data-face', '0');
    await page.keyboard.press('Meta+.');
    await expect(shell).toHaveAttribute('data-face', '1');
    await expect(page.getByTestId('time-axis-switcher')).toHaveAttribute('data-mode', 'real-time');
});
