/**
 * Coordinate: M' (drivable-loop spec: no-modal discipline — 31.T31.8, CCT-8)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): real Chromium / gateway carrier proof
 * Actualises: the UF half of 31.8. The lint proves no forbidden CALL is in the
 *   source; only the running app can prove the resulting BEHAVIOUR — that the
 *   confirmation a user actually meets is part of the surface rather than a
 *   layer that seizes it. Four claims against the live app:
 *     (a) no native dialog fires anywhere in the governed flow — Chromium
 *         reports every one of them through the `dialog` event, so a single
 *         surviving `window.confirm` would be caught here even if someone
 *         reintroduced it through a path the lint's regex missed;
 *     (b) the confirmation renders IN FLOW — not fixed, not covering the
 *         viewport, not a backdrop;
 *     (c) the shell stays live while the question stands (the palette still
 *         opens) — that is what "non-blocking" means operationally;
 *     (d) cancelling leaves the stage untouched.
 * Does NOT own: the rule content (scripts/lint-no-modal-discipline.mjs), the
 *   transform lifecycle (25.T25.11 owns that flow).
 * Contract: [[CHROME-CONTRACT]] + rerun tranche [[31.T31.8]] (CC-08 / CCT-8).
 */

import { expect, test } from '@playwright/test';

test('31.T31.8: a governed confirmation is inline and non-blocking — no native dialog fires', async ({
    page
}) => {
    // Chromium surfaces every alert/confirm/prompt here. Record, never handle:
    // an unhandled dialog also stalls the page, so a regression fails loudly.
    const dialogs: string[] = [];
    page.on('dialog', dialog => {
        dialogs.push(`${dialog.type()}: ${dialog.message()}`);
        void dialog.dismiss();
    });

    await page.goto('/');
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });

    const activeFace = page.locator('.face-active');
    await activeFace.locator('.flexlayout__tab_button', { hasText: 'Transform' }).click();
    const pane = activeFace.getByTestId('transform-containers-pane');
    await expect(pane).toBeVisible();

    await pane.getByRole('button', { name: 'Start Bohm Dialogue' }).click();
    await expect(pane.getByTestId('transform-position')).toHaveText('1 / 5', { timeout: 20_000 });
    await pane.getByRole('button', { name: 'Advance' }).click();
    await expect(pane.getByTestId('transform-position')).toHaveText('2 / 5');

    // arm the backstep — the moment that used to raise window.confirm
    await pane.getByRole('button', { name: 'Back' }).click();
    const confirm = pane.getByTestId('transform-backstep-confirm');
    await expect(confirm).toBeVisible();
    await expect(confirm).toHaveText(/Return to the previous transform stage\?/);

    // (a) nothing native was raised
    expect(dialogs, 'a native dialog fired — CCT-8 forbids blocking modals').toEqual([]);

    // (b) it renders in flow: not fixed/absolute, and not covering the viewport
    const geometry = await confirm.evaluate(el => {
        const style = getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return {
            position: style.position,
            area: (rect.width * rect.height) / (window.innerWidth * window.innerHeight)
        };
    });
    expect(['static', 'relative'], `inline confirm must not float (${geometry.position})`).toContain(
        geometry.position
    );
    expect(geometry.area, 'inline confirm must not blanket the viewport').toBeLessThan(0.25);

    // there is no backdrop/scrim element accompanying it
    await expect(page.locator('[aria-modal="true"], dialog[open], .modal-backdrop')).toHaveCount(0);

    // (c) the shell is still live while the question stands — open the palette,
    // which a blocking modal would have made unreachable, then close it
    await page.keyboard.press('Meta+Shift+P');
    await expect(page.getByTestId('command-palette')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('command-palette')).toHaveCount(0);
    await expect(confirm, 'the pending question survives unrelated shell activity').toBeVisible();

    // (d) cancelling dismisses the question and leaves the stage where it was
    await pane.getByTestId('transform-backstep-confirm-cancel').click();
    await expect(confirm).toHaveCount(0);
    await expect(pane.getByTestId('transform-position')).toHaveText('2 / 5');

    // and confirming does perform the real gateway-backed regression
    await pane.getByRole('button', { name: 'Back' }).click();
    await pane.getByTestId('transform-backstep-confirm-confirm').click();
    await expect(pane.getByTestId('transform-position')).toHaveText('1 / 5');

    expect(dialogs, 'a native dialog fired during the confirmed backstep').toEqual([]);
});
