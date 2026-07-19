/**
 * Coordinate: M' M0' (drivable symbolic-question proof, 21.T21.11)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): active-carrier verifier response UI-flow gate.
 * Actualises: live question bus -> console -> persisted gateway response receipt.
 * Public surface: Playwright test for data-testid=m0-symbolic-*.
 * Does NOT own: symbolic parsing, verifier law, or persistence.
 * Contract: [[M0'-SPEC]] + rerun [[21-m0-anuttara-frontend-deep]] 21.11.
 */

import { expect, test } from '@playwright/test';

test('M0 symbolic console persists a response through the real verifier gateway', async ({
    page
}) => {
    await page.goto('/');
    await expect(page.getByTestId('shell')).toBeVisible();
    await expect(page.getByTestId('status-gateway')).toContainText('connected', {
        timeout: 20_000
    });

    const shell = page.getByTestId('shell');
    if ((await shell.getAttribute('data-face')) !== '0') {
        await page.keyboard.press('Meta+.');
    }
    await expect(shell).toHaveAttribute('data-face', '0', { timeout: 20_000 });

    const bimbaTab = page.locator('.face-active .flexlayout__tab_button', { hasText: 'Bimba' });
    await expect(bimbaTab).toBeVisible({ timeout: 20_000 });
    await bimbaTab.click();
    await expect(async () => {
        if (!(await page.getByTestId('graph-explorer').isVisible())) {
            await bimbaTab.click();
        }
        await expect(page.getByTestId('graph-explorer')).toBeVisible({ timeout: 5_000 });
    }).toPass({ timeout: 40_000 });

    const console = page.getByTestId('m0-symbolic-console');
    await expect(console).toBeVisible({ timeout: 20_000 });
    await expect(console.getByTestId('m0-symbolic-question-count')).not.toHaveText('0');

    const actionQuestion = console
        .getByTestId('m0-symbolic-question')
        .filter({ hasText: 'A-T7' })
        .first();
    await expect(actionQuestion).toBeVisible();
    await actionQuestion.click();
    await console
        .getByTestId('m0-symbolic-response')
        .fill('The action is witnessed by this real gateway response.');
    await console.getByTestId('m0-symbolic-submit').click();
    await expect(console.getByTestId('m0-symbolic-status')).toHaveAttribute(
        'data-status',
        'responded'
    );
    await expect(console.getByTestId('m0-symbolic-status')).toContainText(
        /^responded · [0-9a-f-]+$/
    );
    await expect(console.getByTestId('m0-symbolic-parse-summary')).toContainText(
        'R · 2 / 0/1 / A-T7 · T7'
    );
});
