/**
 * Coordinate: M' M0-0' (real residual-node browser UI-flow gate, 21.T21.14)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): active-carrier M0 residual graph browser proof
 * Actualises: Chromium -> s2.graph.list -> live Neo4j residual counts and
 *   shared-coordinate selection without a renderer-local dataset.
 * Public surface: Playwright test for data-testid=m0-lazy-*.
 * Does NOT own: S2 residual membership or graph data.
 * Contract: [[M0'-SPEC]] + rerun [[21-m0-anuttara-frontend-deep]] 21.14.
 */

import { expect, test } from '@playwright/test';

test('M0 lazy browser pages the live 96-of-108 residual set and selects a node', async ({
    page
}) => {
    await page.goto('/');
    await expect(page.getByTestId('status-gateway')).toContainText('connected', {
        timeout: 20_000
    });

    const shell = page.getByTestId('shell');
    if ((await shell.getAttribute('data-face')) !== '0') {
        await page.keyboard.press('Meta+.');
    }
    await expect(shell).toHaveAttribute('data-face', '0', { timeout: 20_000 });

    const bimbaTab = page.locator('.face-active .flexlayout__tab_button', { hasText: 'Bimba' });
    await bimbaTab.click();
    await expect(page.getByTestId('graph-explorer')).toBeVisible({ timeout: 20_000 });

    await page.getByTestId('m0-language-subtab-browser').click();
    const browser = page.getByTestId('m0-lazy-browser');
    await expect(browser).toHaveAttribute('data-state', 'canonical', { timeout: 20_000 });
    await expect(browser.getByTestId('m0-lazy-counts')).toContainText('96 of 108');

    await browser.getByTestId('m0-lazy-branch-0-3').click();
    await expect(browser).toHaveAttribute('data-offset', '0');
    await browser.getByTestId('m0-lazy-next').click();
    await expect(browser).toHaveAttribute('data-offset', '20');

    const firstNode = browser.locator('[data-testid^="m0-lazy-node-"]').first();
    const coordinate = await firstNode.getAttribute('data-coordinate');
    expect(coordinate).toBeTruthy();
    await firstNode.click();
    await expect(browser.getByTestId('m0-lazy-detail')).toContainText(coordinate!);
    await expect(page.getByTestId('m0-surface-state')).toHaveAttribute(
        'data-selected-coordinate',
        coordinate!
    );
});
