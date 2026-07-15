/**
 * Coordinate: M' M4' (Medicine real-UI proof - 25.T25.10)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): real Chromium + spawned-gateway acceptance boundary
 * Actualises: canonical snapshot projection, mounted three-panel view, and
 *   the Medicine-to-Kairos cross-layout route.
 * Public surface: Playwright medicine-view spec.
 * Does NOT own: Medicine LUTs, medical authority, or NOW mutation law.
 * Contract: [[M4'-SPEC]] / Track [[25.T25.10]].
 */

import { expect, test } from '@playwright/test';
import { gatewayRpc } from './gateway-rpc';

test('Medicine renders canonical evidence and crosses to Kairos on the real wire', async ({ page }) => {
    const projected = await gatewayRpc('nara.medicine.snapshot', { sunDegree: 15 }) as {
        chakras: unknown[];
        activeDecan: { decanIdx: number; herbs: Array<{ botanical: string }> };
    };
    expect(projected.chakras).toHaveLength(8);
    expect(projected.activeDecan.decanIdx).toBe(1);
    expect(projected.activeDecan.herbs[0].botanical).toBe('Urtica dioica');

    await page.goto('/');
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });
    await page.locator('.face-active .flexlayout__tab_button', { hasText: 'Medicine' }).click();

    await expect(page.getByTestId('medicine-pane')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Chakra ladder' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Active decan' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Herbal evidence' })).toBeVisible();
    await expect(page.getByText(/Never a prescription/)).toBeVisible();
    await expect(page.getByTestId('medicine-active-decan')).toBeVisible({ timeout: 20_000 });

    await page.getByRole('button', { name: 'Open Kairos' }).click();
    await expect(page.getByTestId('kairos-enablement-pane')).toBeVisible();
});
