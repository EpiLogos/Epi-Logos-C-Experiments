/**
 * Coordinate: M' M4' (logos-cycle UI-flow proof — 25.T25.13)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): #3 the A-Logos → An-a-Logos progression control
 * Actualises: real Chromium proof that the Logos pane drives the landed
 *   nara.logos.status/advance/regress RPCs over a spawned gateway with an
 *   isolated EPI_NARA_HOME: the six-stage ring starts empty, Advance writes a
 *   forward stage and moves the cursor, and Regress (after INLINE confirmation,
 *   31.T31.8) steps
 *   the cursor back and surfaces the explicit c_4_regression marker.
 * Public surface: Playwright test over the spawned gateway.
 * Does NOT own: the cycle law (epi-cli nara::logos), artifact persistence, or
 *   layout state.
 * Contract: [[M4'-SPEC]] + rerun [[25-m4-nara-frontend-deep]] 25.13.
 */

import { expect, test } from '@playwright/test';

test('25.T25.13: the logos cycle advances forward and regresses with an explicit marker', async ({
    page
}) => {
    // 31.T31.8: regress is guarded by an INLINE confirmation (CCT-8), not by
    // window.confirm — this used to need `page.on('dialog', d => d.accept())`.
    // Assert no native dialog can fire at all.
    const dialogs: string[] = [];
    page.on('dialog', dialog => {
        dialogs.push(dialog.type());
        void dialog.dismiss();
    });

    await page.goto('/');
    await expect(page.getByTestId('shell')).toBeVisible();
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });

    await page.locator('.face-active .flexlayout__tab_button', { hasText: 'Logos' }).click();
    const pane = page.getByTestId('m4-logos-cycle');
    await expect(pane).toBeVisible();
    await expect(pane).toHaveAttribute('data-privacy-class', 'protected-local');
    await expect(pane.getByTestId(/^m4-logos-stage-\d+$/)).toHaveCount(6);

    // Fresh isolated nara home: nothing completed, cursor at the ground, regress
    // has nowhere to go.
    const position = page.getByTestId('m4-logos-position');
    await expect(position).toContainText('0 / 6', { timeout: 20_000 });
    await expect(page.getByTestId('m4-logos-stage-0')).toHaveAttribute('data-state', 'active');
    await expect(page.getByTestId('m4-logos-regress')).toBeDisabled();

    // Advance: A-Logos (0) is written and the cursor moves to Pro-Logos (1).
    await page.getByTestId('m4-logos-advance').click();
    await expect(page.getByTestId('m4-logos-stage-0')).toHaveAttribute('data-state', 'completed');
    await expect(position).toContainText('1 / 6');

    // Advance again: Pro-Logos (1) is written, cursor at Dia-Logos (2).
    await page.getByTestId('m4-logos-advance').click();
    await expect(page.getByTestId('m4-logos-stage-1')).toHaveAttribute('data-state', 'completed');
    await expect(position).toContainText('2 / 6');

    // Regress: the highest completed stage is undone, the cursor steps back, and
    // the backward move is marked explicitly (never read as forward integration).
    await page.getByTestId('m4-logos-regress').click();
    await page.getByTestId('m4-logos-regress-confirm-confirm').click();
    await expect(page.getByTestId('m4-logos-regression')).toBeVisible();
    await expect(page.getByTestId('m4-logos-stage-1')).toHaveAttribute('data-state', 'active');
    await expect(page.getByTestId('m4-logos-stage-0')).toHaveAttribute('data-state', 'completed');
    await expect(position).toContainText('1 / 6');

    expect(dialogs, 'a native dialog fired — CCT-8 forbids blocking modals').toEqual([]);
});
