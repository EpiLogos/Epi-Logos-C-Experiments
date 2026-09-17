/**
 * Coordinate: M' M0' ↔ M5-0' (map / Library seam, 09.T9.9)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): real Chromium + S5 Gnostic acceptance boundary
 * Actualises: a map walk selecting M1, then the Bimba pane revealing the real
 *   direct/resonant Gnostic cluster for that same coordinate.
 * Public surface: Playwright map-walk-to-library test.
 * Does NOT own: Gnostic data, Neo4j, or browser fixtures for Library entries.
 * Contract: [[M0'-SPEC]] + [[M5'-SPEC]] + [[09-integrated-bimba-graph-reconciliation]] 09.T9.9.
 */

import { expect, test } from '@playwright/test';
import { gatewayRpc } from './gateway-rpc';

test('map traversal reveals the real coordinate-scoped Gnostic Library surface', async ({ page }) => {
    const result = (await gatewayRpc("s5'.gnostic.etymology", { coordinate: 'M1' })) as {
        artifact?: { status: string; coordinate: string; count: number };
        status?: string;
        coordinate?: string;
        count?: number;
    };
    const expected = result.artifact ?? result;
    expect(expected.status).toBe('ok');
    expect(expected.coordinate).toBe('M1');

    await page.goto('/');
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });
    await page.keyboard.press('Meta+.');
    await expect(page.getByTestId('shell')).toHaveAttribute('data-face', '0');
    await page.locator('.face-active .flexlayout__tab_button', { hasText: 'Walk' }).click();
    await expect(page.getByTestId('walk-node')).toContainText('M1', { timeout: 20_000 });
    await page.locator('.face-active .flexlayout__tab_button', { hasText: 'Bimba' }).click();

    const library = page.getByTestId('m0-m5-library-seam');
    await expect(library).toBeVisible();
    await expect(library).toHaveAttribute('data-coordinate', 'M1');
    await expect(library).toHaveAttribute(
        'data-state',
        (expected.count ?? 0) > 0 ? 'derived' : 'canonical_absent',
        { timeout: 20_000 }
    );
    await expect(library).toContainText('Library at M1');
});
