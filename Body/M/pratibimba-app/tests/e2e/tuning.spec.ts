/**
 * Coordinate: M' M5' (tunability real-UI proof — 38.T06.8)
 * Residency: Body/M/pratibimba-app/tests/e2e.
 * Position (#n): Chromium-to-real-gateway acceptance boundary.
 * Actualises: the carrier tuning fold invokes the real registry, persists a
 *   Tier-1 write, and renders its append-only gateway audit trail.
 * Public surface: Playwright tuning flow.
 * Does NOT own: tunable validation, config persistence, or audit law.
 * Contract: [[M5'-SPEC]] / [[S0-SPEC]] / [[S3-SPEC]] / [[DR-TUNE-1]].
 */

import { expect, test } from '@playwright/test';
import { gatewayRpc } from './gateway-rpc';

test('Tuning persists a developer change through the real gateway and renders its audit trail', async ({ page }) => {
    const key = 'nara.weights.body_natal';
    const before = await gatewayRpc("s5'.tune.registry.get", { key }) as { current: number };
    const next = Math.abs(before.current - 0.55) < 0.0001 ? 0.56 : 0.55;

    await page.goto('/');
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });
    await page.locator('.face-active .flexlayout__border_button', { hasText: 'Tuning' }).click();
    await expect(page.getByTestId('tuning-pane')).toBeVisible();

    await page.getByRole('button', { name: new RegExp(key) }).click();
    const value = page.getByLabel('Value');
    await value.fill(String(next));
    await page.getByRole('button', { name: 'Apply' }).click();
    await expect(page.getByRole('status')).toHaveText('Saved.');

    const audit = await gatewayRpc("s5'.tune.audit.read", { key }) as {
        entries: Array<{ to_value: number; actor: string }>;
    };
    expect(audit.entries).toHaveLength(1);
    expect(audit.entries[0]?.actor).toBe('user');
    expect(audit.entries[0]?.to_value).toBeCloseTo(next, 5);
    await expect(page.getByLabel('Audit trail')).toContainText('by user');
});
