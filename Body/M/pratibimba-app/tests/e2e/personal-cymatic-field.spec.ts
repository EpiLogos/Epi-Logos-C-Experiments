/**
 * Coordinate: M' M4-5' (personal cymatic field UF proof — Track 25.T25.6)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Actualises: the DR-IG-6 field drawn from the LIVE `nara.field.handle` wire
 *   inside the personal 4-5-0 composition — the renderer handle really
 *   crossed (opaque scheme asserted), the scene declares the fixture's 11
 *   loci (all 12 P/P′ positions; P0/P0′ is ONE axis-point by the corrected
 *   law) and two Hopf-linked tori, and the 25.17 default time axis
 *   (real-time → qTransitHandle) is what the call foregrounded.
 * Does NOT own: the handle law (portal-core) or the composition slot law.
 * Contract: 25-m4-nara-frontend-deep.md Tranche 25.6 · DR-WC-M4-2 · DR-IG-6.
 */

import { expect, test } from '@playwright/test';
import { gatewayRpc } from './gateway-rpc';

test('25.T25.6: the personal cymatic field mounts the LIVE renderer handle in the 4-5-0 composition', async ({
    page
}) => {
    // The arm answers on the real wire before the UI is even asked.
    const probe = (await gatewayRpc('nara.field.handle', {})) as {
        contractVersion: string;
        rendererHandle: string;
    };
    expect(probe.contractVersion).toBe('psychoid-cymatic.handle.v1');
    expect(probe.rendererHandle).toContain('psychoid-cymatic://renderer/dr-ig-6/');

    await page.goto('/');
    const shell = page.getByTestId('shell');
    await expect(shell).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });
    await expect(page.getByTestId('status-tick')).toHaveText(/\d+/, { timeout: 20_000 });

    const engine = page.locator('.face-active [data-testid="personal-recognition-engine"]');
    await expect(engine).toBeVisible({ timeout: 20_000 });
    // 25.6 lifted the one personal blocker binding: no slot reads blocked.
    await expect(engine).toHaveAttribute('data-composition-blocked-slots', '');
    await expect(engine).toHaveAttribute('data-center-composition-owner', 'm4-nara');

    const field = engine.getByTestId('m4-personal-cymatic-field');
    await expect(field).toHaveAttribute('data-state', 'read', { timeout: 20_000 });
    // The handle the surface mounted is the live opaque scheme — and the
    // canvas exists only on the read path, so the draw really happened.
    const mounted = await field.getAttribute('data-renderer-handle');
    expect(mounted).toContain('psychoid-cymatic://renderer/dr-ig-6/option-f/');
    await expect(field.getByTestId('m4-cymatic-canvas')).toBeVisible();
    await expect(field).toHaveAttribute('data-node-count', '11');
    await expect(field).toHaveAttribute('data-tori-count', '2');
    // 25.17 default (real-time) → qTransitHandle foregrounded on the call.
    await expect(field).toHaveAttribute('data-foregrounded', 'qTransitHandle');
});
