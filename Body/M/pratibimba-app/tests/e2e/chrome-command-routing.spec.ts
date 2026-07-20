/**
 * Coordinate: M' shared chrome (command routing validation - 31.T31.13)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): real Chromium / gateway carrier proof
 * Actualises: the global command palette and its command registry route
 *   keyboard input to the live shell without a separate chrome adapter.
 * Public surface: Playwright chrome-command routing acceptance test.
 * Does NOT own: command semantics, command registration, or face state.
 * Contract: [[CHROME-CONTRACT]] sections 2 and 10.
 */

import { expect, test } from '@playwright/test';

test('31.T31.13: palette and shortcut execute the live face-toggle command', async ({ page }) => {
    await page.goto('/');
    const shell = page.getByTestId('shell');
    await expect(shell).toBeVisible();
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });

    const initialFace = await shell.getAttribute('data-face');
    expect(initialFace === '0' || initialFace === '1').toBe(true);

    await page.keyboard.press('Meta+Shift+P');
    await expect(page.getByTestId('command-palette')).toBeVisible();
    const input = page.getByTestId('palette-input');
    await input.fill('toggle 0/1');
    await expect(page.getByTestId('palette-item-face.toggle')).toBeVisible();
    await input.press('Enter');
    await expect(page.getByTestId('command-palette')).toHaveCount(0);
    await expect(shell).toHaveAttribute('data-face', initialFace === '0' ? '1' : '0');

    await page.keyboard.press('Meta+.');
    await expect(shell).toHaveAttribute('data-face', initialFace);
});
