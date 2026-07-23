/**
 * Coordinate: M4' personal identity (PASU wizard + cold-start — 25.T25.4 / 32.T32.2)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): real Chromium / gateway carrier proof
 * Actualises: the PASU identity wizard is live on the real app — it opens via the
 *   catalogued `identity.openWizard` command (the 32.4 settings re-entry path that
 *   32.T32.2 also drives on PASU-absence), mounts on the first step, and a typed
 *   value writes through the REAL `nara.pasu.set` RPC (advancing with no error
 *   proves the write landed against the live gateway — no jsdom mock).
 * Public surface: Playwright PASU-wizard acceptance test.
 * Does NOT own: the PASU write law (S0 pasu.rs) or the cold-start branch logic.
 * Contract: [[M4'-SPEC]] + rerun tranches [[25.T25.4]] / [[32.T32.2]] (DR-WC-M4-3).
 */

import { expect, test } from '@playwright/test';

test('25.T25.4 / 32.T32.2: the PASU wizard opens and writes a scalar via the live nara.pasu.set', async ({
    page
}) => {
    await page.goto('/');
    const shell = page.getByTestId('shell');
    await expect(shell).toBeVisible();
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });

    // open the wizard through the catalogued command (settings-32.4 re-entry;
    // 32.T32.2 drives the same open on a first-run PASU-absence)
    await page.keyboard.press('Meta+Shift+P');
    await expect(page.getByTestId('command-palette')).toBeVisible();
    await page.getByTestId('palette-input').fill('PASU setup wizard');
    await expect(page.getByTestId('palette-item-identity.openWizard')).toBeVisible();
    await page.getByTestId('palette-input').press('Enter');

    // mounts on the first step (birth date), seeded from the handle-only record
    const wizard = page.getByTestId('pasu-wizard');
    await expect(wizard).toBeVisible();
    await expect(wizard).toHaveAttribute('data-step-key', 'c_0_birth_date');
    await expect(page.getByTestId('pasu-wizard-label')).toHaveText('Birth date');

    // a typed value writes through the live nara.pasu.set RPC; advancing with no
    // error means the gateway accepted and persisted it
    await page.getByTestId('pasu-wizard-input').fill('1990-03-14');
    await page.getByTestId('pasu-wizard-next').click();

    await expect(wizard).toHaveAttribute('data-step-key', 'c_0_birth_location');
    await expect(page.getByTestId('pasu-wizard-error')).toHaveCount(0);
});
