/**
 * Coordinate: M' M4' (Nara tuning real-filesystem flow, rerun 11.T11.12)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): M4-0' day canvas chrome
 * Actualises: browser tuning gesture -> scoped vault IPC -> real session NOW bytes.
 * Public surface: Playwright UI-flow proof for NaraTuningBar.
 * Does NOT own: NOW schema, vault law, or Janus weighting defaults.
 * Contract: [[M4'-SPEC]]; [[2026-06-04-prospective-retrospective-canvas-spec]] §2.5.
 */

import { expect, test } from '@playwright/test';
import { SIDECAR_URL, todayId } from './e2e-env';

test('Nara tuning writes canonical keys into the real latest session NOW', async ({ page, request }) => {
    const dayId = todayId();
    const sessionPath = `Empty/Present/${dayId}/20260716-120000-e2e-tuning/now.md`;
    const seeded = `---\ncoordinate: ""\nc_4_artifact_role: now\nc_3_tranche_mode: quiet:90m\nc_3_response_orbit: next-morning\nc_3_klein_weighting:\n  prospective: 0.4\n  retrospective: 0.6\n---\n# NOW\n\nReal tuning body.\n`;

    const begin = await request.post(`${SIDECAR_URL}/invoke`, { data: { cmd: 'begin_today', args: {} } });
    expect(begin.ok()).toBeTruthy();
    const write = await request.post(`${SIDECAR_URL}/invoke`, {
        data: { cmd: 'vault_write', args: { path: sessionPath, content: seeded } }
    });
    expect(write.ok()).toBeTruthy();

    await page.goto('/');
    const bar = page.getByTestId('nara-tuning-bar');
    await expect(bar).toHaveAttribute('data-status', 'ready', { timeout: 15_000 });
    await bar.getByRole('button', { name: 'rhythm' }).click();
    await expect(bar).toHaveAttribute('data-status', 'saved', { timeout: 15_000 });

    const raw = await request.get(`${SIDECAR_URL}/raw?path=${encodeURIComponent(sessionPath)}`);
    expect(raw.ok()).toBeTruthy();
    const bytes = await raw.text();
    expect(bytes).toContain('c_3_tranche_mode: rhythm');
    expect(bytes).toContain('c_3_response_orbit: next-morning');
    expect(bytes).toContain('prospective: 0.4');
    expect(bytes).toContain('Real tuning body.');
});
