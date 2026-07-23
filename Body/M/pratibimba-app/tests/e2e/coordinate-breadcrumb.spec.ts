/**
 * Coordinate: M' shared chrome (coordinate-path breadcrumb — 31.T31.6)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): real Chromium / gateway carrier proof
 * Actualises: the top breadcrumb is a live projection of the coordinate spine —
 *   it names the active coordinate family → archetype off the real store, tracks
 *   coordinate moves as they happen, and each segment click retargets the live
 *   coordinate through the real cross-layout intent command (no jsdom mock).
 * Public surface: Playwright coordinate-breadcrumb acceptance test.
 * Does NOT own: coordinate selection, the intent target ledger, or colour tokens.
 * Contract: [[CHROME-CONTRACT]] + rerun tranche [[31.T31.6]].
 */

import { expect, test } from '@playwright/test';

test('31.T31.6: the top breadcrumb projects the live coordinate and each segment retargets it', async ({
    page
}) => {
    await page.goto('/');
    const shell = page.getByTestId('shell');
    await expect(shell).toBeVisible();
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });

    // keep focus off any editable so the CCT-3 chords route to the shell spine
    await page.getByTestId('status-strip').click();

    // move the live active coordinate to M2 (Parashakti) and read the breadcrumb
    await page.keyboard.press('Meta+Shift+Digit2');
    await expect(page.getByTestId('active-coordinate')).toHaveText('M2');
    const breadcrumb = page.getByTestId('coordinate-breadcrumb');
    await expect(breadcrumb).toBeVisible();
    await expect(breadcrumb).toHaveAttribute('data-active-coordinate', 'M2');
    await expect(page.getByTestId('coordinate-breadcrumb-family')).toHaveText('M');
    await expect(page.getByTestId('coordinate-breadcrumb-archetype')).toHaveText('Parashakti');

    // the breadcrumb tracks a live coordinate move (real reactivity, not a snapshot)
    await page.keyboard.press('Meta+Shift+Digit5');
    await expect(page.getByTestId('active-coordinate')).toHaveText('M5');
    await expect(breadcrumb).toHaveAttribute('data-active-coordinate', 'M5');
    await expect(page.getByTestId('coordinate-breadcrumb-archetype')).toHaveText('Epii');

    // clicking a segment retargets the live coordinate over the real intent spine
    await page.getByTestId('coordinate-breadcrumb-family').click();
    await expect(page.getByTestId('active-coordinate')).toHaveText('M');
});
