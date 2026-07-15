/**
 * Coordinate: M' M4' (Kairos onboarding real-UI proof - 32.T32.10)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): real Chromium + spawned-gateway acceptance boundary
 * Actualises: probe-first informed opt-in and the machine-honest active or
 *   graceful-unavailable outcome without exposing PASU data.
 * Public surface: Playwright kairos-enablement spec.
 * Does NOT own: Kerykeion installation, Kairos computation, or preferences.
 * Contract: [[M4'-SPEC]] / Track [[32.T32.10]].
 */

import { expect, test } from '@playwright/test';
import { gatewayRpc } from './gateway-rpc';

test('Kairos onboarding probes the real local dependency before opt-in', async ({ page }) => {
    const probe = await gatewayRpc('nara.kairos.probe_kerykeion', {}) as {
        dependency: string;
        available: boolean;
        pythonAvailable: boolean;
        version: string | null;
        reason: string | null;
    };
    expect(probe.dependency).toBe('kerykeion');
    expect(typeof probe.available).toBe('boolean');
    expect(typeof probe.pythonAvailable).toBe('boolean');
    expect(JSON.stringify(probe)).not.toContain('birth_');
    expect(JSON.stringify(probe)).not.toContain('PASU');

    await page.goto('/');
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });
    await page.locator('.face-active .flexlayout__tab_button', { hasText: 'Kairos setup' }).click();

    await expect(page.getByTestId('kairos-enablement-pane')).toBeVisible();
    await expect(page.getByTestId('kairos-card')).toContainText('What kairos is');
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page.getByTestId('kairos-card')).toContainText('birth data (PASU.md) stays local');
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('button', { name: 'Enable kairos' }).click();

    const relay = page.getByTestId('kairos-relay');
    await expect(relay).toHaveAttribute('data-state', /^(enabled|unavailable|refresh-failed)$/, {
        timeout: 20_000
    });
    const state = await relay.getAttribute('data-state');
    if (probe.available) {
        expect(state).toBe('enabled');
        await expect(relay).toContainText('Kairos active - refreshed');
    } else {
        expect(state).toBe('unavailable');
        await expect(relay).toContainText('pip3 install kerykeion');
        await expect.poll(() => page.evaluate(() => localStorage.getItem('epi-logos.privacy.kairos-enabled')))
            .toBe('false');
    }
});
