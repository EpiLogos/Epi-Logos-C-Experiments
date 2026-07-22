/**
 * Coordinate: M' shared chrome (command routing + catalog validation - 31.T31.13 / 31.T31.2)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): real Chromium / gateway carrier proof
 * Actualises: the global command palette and its command registry route
 *   keyboard input to the live shell without a separate chrome adapter
 *   (31.T31.13), AND that every command the running shell exposes in the
 *   palette is catalogued — no orphan in the live UI (31.T31.2).
 * Public surface: Playwright chrome-command routing + catalog acceptance tests.
 * Does NOT own: command semantics, command registration, or face state.
 * Contract: [[CHROME-CONTRACT]] sections 2, 10, and 11.
 */

import { expect, test } from '@playwright/test';
import { COMMAND_CATALOG } from '../../src/commands/catalog';

const CATALOG_IDS = new Set(COMMAND_CATALOG.map(command => command.id));

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

test('31.T31.2: the live command palette lists only catalogued commands (no orphan in the UI)', async ({
    page
}) => {
    await page.goto('/');
    const shell = page.getByTestId('shell');
    await expect(shell).toBeVisible();
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });

    await page.keyboard.press('Meta+Shift+P');
    await expect(page.getByTestId('command-palette')).toBeVisible();

    // Read every command the running shell actually exposes in the palette.
    const items = page.locator('[data-testid^="palette-item-"]');
    await expect(items.first()).toBeVisible();
    const liveIds = (
        await items.evaluateAll(nodes => nodes.map(node => node.getAttribute('data-testid') ?? ''))
    ).map(testid => testid.replace(/^palette-item-/, ''));

    // sanity: the palette really populated from the live registry
    expect(liveIds.length).toBeGreaterThanOrEqual(15);
    expect(liveIds).toContain('face.toggle');
    expect(liveIds).toContain('engine.pauseToggle');

    // no orphan in the live UI — every palette command is in COMMAND_CATALOG
    const orphans = liveIds.filter(id => !CATALOG_IDS.has(id));
    expect(orphans, 'live palette commands missing from COMMAND_CATALOG').toEqual([]);
});
