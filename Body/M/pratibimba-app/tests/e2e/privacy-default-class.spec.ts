/**
 * Coordinate: M' `/` membrane (privacy-class default — Track 32.T32.8).
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): real Chromium / spawned-gateway carrier proof
 * Actualises: the half of tranche 32.8 that only a running shell can show.
 *   jsdom proves the register, the read-path enforcement, the ceiling and the
 *   crossing gate (`src/ui/privacyDefault.test.ts`, `src/panes/privacyCrossing.test.ts`,
 *   `src/ui/PrivacyOptInSurface.test.tsx`). What it cannot show is that the
 *   default reaches a real user: that Settings → Privacy renders the class as a
 *   WORKING control rather than a disclosure row, that a first run really rests
 *   at `protected_local` with nothing persisted, that changing it persists
 *   under the one preference key, and that the effective-class readout follows
 *   the choice through the 07-T0 ceiling.
 *
 *   The last test is the regression guard for a defect this tranche introduced
 *   and fixed: `SettingsPane` dispatched its control by control KIND, so
 *   `select` was hard-bound to the theme dropdown while exactly one preference
 *   used it. The second `select` would have rendered a THEME picker for the
 *   privacy default class — a control that silently edits the wrong preference
 *   is worse than a missing one, and only a real render shows which control
 *   actually landed in which row.
 * Public surface: Playwright acceptance for the 32.8 default-class control.
 * Does NOT own: the section law (`ui/settingsSections.ts`), the register
 *   (`ui/preferences.ts`), the crossing gate (`panes/privacyCrossing.ts`).
 * Contract: rerun tranche [[32.T32.8]] · [[CHROME-CONTRACT]] §2 `omniSettings`.
 */

import { expect, test, type Page } from '@playwright/test';
import { PREFERENCE_KEYS } from '../../src/ui/preferences';
import { PRIVACY_CLASSES } from '../../src/ui/privacyChrome';
import { DEFAULT_PRIVACY_CLASS } from '../../src/ui/privacyDefault';

async function openPrivacySection(page: Page): Promise<void> {
    await page.goto('/');
    await expect(page.getByTestId('shell')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });
    await page
        .locator('.face-active .flexlayout__border_button', { hasText: 'Settings' })
        .click();
    await expect(page.getByTestId('settings-pane')).toBeVisible({ timeout: 15_000 });
    await page.getByTestId('settings-nav-privacy').click();
    await expect(page.getByTestId('settings-section-privacy')).toBeVisible();
}

test('32.T32.8: a first run rests at protected_local with nothing persisted', async ({ page }) => {
    await openPrivacySection(page);

    const stored = await page.evaluate(
        key => window.localStorage.getItem(key),
        PREFERENCE_KEYS.privacyDefaultClass
    );
    expect(stored, 'a first run must not need a written preference to be protected').toBeNull();

    // the READ PATH supplies it: the control shows the shipped default anyway
    const select = page.getByTestId('settings-privacy-default-class');
    await expect(select).toBeVisible();
    await expect(select).toHaveValue(DEFAULT_PRIVACY_CLASS);
    expect(DEFAULT_PRIVACY_CLASS).toBe('protected_local');
});

test('32.T32.8: the default class is a LIVE control, not a pending disclosure row', async ({
    page
}) => {
    await openPrivacySection(page);

    const row = page.getByTestId(`settings-row-${PREFERENCE_KEYS.privacyDefaultClass}`);
    await expect(row).toBeVisible();
    await expect(row).toHaveAttribute('data-control', 'select');
    // the pending-disclosure spelling of the same key must be gone
    await expect(
        page.getByTestId(`settings-disclosure-${PREFERENCE_KEYS.privacyDefaultClass}`)
    ).toHaveCount(0);

    // all three classes are offered — the vocabulary reaches the user whole
    const options = await page
        .getByTestId('settings-privacy-default-class')
        .locator('option')
        .allTextContents();
    expect(options.map(text => text.trim()).sort()).toEqual([...PRIVACY_CLASSES].sort());
});

test('32.T32.8: choosing a class persists under the one preference key and survives reload', async ({
    page
}) => {
    await openPrivacySection(page);

    await page.getByTestId('settings-privacy-default-class').selectOption('protected_local_handle_only');

    const persisted = await page.evaluate(
        key => window.localStorage.getItem(key),
        PREFERENCE_KEYS.privacyDefaultClass
    );
    expect(persisted && JSON.parse(persisted)).toBe('protected_local_handle_only');

    await openPrivacySection(page);
    await expect(page.getByTestId('settings-privacy-default-class')).toHaveValue(
        'protected_local_handle_only'
    );

    // leave the shell on the shipped ground for the rest of the suite
    await page.getByTestId('settings-privacy-default-class').selectOption(DEFAULT_PRIVACY_CLASS);
    await page.evaluate(key => window.localStorage.removeItem(key), PREFERENCE_KEYS.privacyDefaultClass);
});

test('32.T32.8: the 07-T0 ceiling clamps the choice, and the readout says so', async ({ page }) => {
    await openPrivacySection(page);

    const effective = page.getByTestId('settings-privacy-default-effective');
    await expect(effective).toHaveAttribute('data-effective', 'protected_local');

    // m4-nara's contract class IS `protected_local`, so no user choice can
    // loosen what a Nara write rests at — the preference selects WITHIN the
    // ceiling, it never raises it.
    for (const privacyClass of PRIVACY_CLASSES) {
        await page.getByTestId('settings-privacy-default-class').selectOption(privacyClass);
        await expect(effective).toHaveAttribute('data-effective', 'protected_local');
    }
    await expect(effective).toContainText('per-artifact opt-in');

    await page.getByTestId('settings-privacy-default-class').selectOption(DEFAULT_PRIVACY_CLASS);
    await page.evaluate(key => window.localStorage.removeItem(key), PREFERENCE_KEYS.privacyDefaultClass);
});

test('32.T32.8: the privacy row carries its OWN control, not the theme dropdown', async ({
    page
}) => {
    await openPrivacySection(page);

    const privacyRow = page.getByTestId(`settings-row-${PREFERENCE_KEYS.privacyDefaultClass}`);
    // the regression: control dispatched by KIND put the theme select here
    await expect(privacyRow.getByTestId('settings-theme-select')).toHaveCount(0);
    await expect(privacyRow.getByTestId('settings-privacy-default-class')).toHaveCount(1);

    // and the theme row still carries its own, in its own section
    await page.getByTestId('settings-nav-theming').click();
    const themeRow = page.getByTestId(`settings-row-${PREFERENCE_KEYS.appearanceTheme}`);
    await expect(themeRow.getByTestId('settings-theme-select')).toHaveCount(1);
    await expect(themeRow.getByTestId('settings-privacy-default-class')).toHaveCount(0);
});
