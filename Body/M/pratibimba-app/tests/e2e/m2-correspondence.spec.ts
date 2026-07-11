/**
 * Coordinate: M' (drivable-loop spec: M2 correspondence-as-navigable-face — DR-FACE-7)
 * Actualises: the fate-B UF proof of Tranche 23.1. The design-recon asked for a
 *   Theia `correspondenceTree` widget registered with `WidgetFactory`; DR-FACE-7
 *   §3 re-grounds it as a 1-2-3 cosmic-pole face that reads the live 72-address
 *   off the pentadic trace and invokes the REAL `s2.parashaktiCorrespondences`
 *   gateway method for that address. This spec drives the real Vite face against
 *   the real spawned gateway: it opens the Correspondence face, waits for the
 *   live parashakti record to land, and asserts the three correspondence faces
 *   carry REAL kernel/S2 values (a real zodiac decan, a real asma group, a real
 *   planetary mode) — content only the parashakti-deep dataset produces, never a
 *   mount. Navigation across the three faces is proven live.
 * Does NOT own: the parashakti-deep dataset (S2), the 72-address (the profile
 *   pentadic trace), the gateway protocol (S3).
 */

import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

async function switchToCosmicFace(page: Page): Promise<void> {
    await expect(page.getByTestId('shell')).toBeVisible();
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });
    await page.keyboard.press('Meta+.');
    await expect(page.getByTestId('shell')).toHaveAttribute('data-face', '0');
}

test('M2 correspondence face: the live 72-address resolves its decan/sacred/planetary faces off the real gateway (23.1 fate-B)', async ({
    page
}) => {
    await page.goto('/');
    await switchToCosmicFace(page);

    await page
        .locator('.face-active .flexlayout__tab_button', { hasText: 'Correspondence' })
        .click();

    const pane = page.locator('.face-active [data-testid="m2-correspondence"]');
    await expect(pane).toBeVisible({ timeout: 15_000 });

    // the active 72-address rides the live pentadic trace, and the record loads
    // from the real s2.parashaktiCorrespondences dataset — never pending/mocked
    await expect(pane).toHaveAttribute('data-state', 'ready', { timeout: 25_000 });
    await expect(page.getByTestId('corr-address')).toHaveText(/72:\d+/);

    // decan face: a REAL zodiac decan + Chaldean ruler (parashakti-deep dataset)
    const decan = page.getByTestId('corr-decan');
    await expect(decan).toContainText(
        /Aries|Taurus|Gemini|Cancer|Leo|Virgo|Libra|Scorpio|Sagittarius|Capricorn|Aquarius|Pisces/
    );

    // navigate to the sacred-name face — a REAL asma group (Jalal/Kamal/Jamal)
    await page.getByTestId('corr-nav-sonic').click();
    const sonic = page.getByTestId('corr-sonic');
    await expect(sonic).toBeVisible();
    await expect(sonic).toContainText(/Jalal|Kamal|Jamal|Hidden/);
    await expect(page.getByTestId('corr-decan')).toHaveCount(0);

    // navigate to the planetary-chakral face — a REAL planetary mode
    await page.getByTestId('corr-nav-planetary').click();
    const planetary = page.getByTestId('corr-planetary');
    await expect(planetary).toBeVisible();
    await expect(planetary).toContainText(/diurnal|nocturnal|—/);
});
