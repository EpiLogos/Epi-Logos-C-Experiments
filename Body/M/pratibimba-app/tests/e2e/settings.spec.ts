/**
 * Coordinate: M' `/` membrane (Settings fold — Track 32.T32.4).
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): real Chromium / spawned-gateway carrier proof
 * Actualises: the half of tranche 32.4 that only a running shell can show —
 *   that Settings is REACHABLE as a fold on the `/` border (not a dialog), that
 *   a control in it moves the real application, and that the disclosure rows
 *   reach the user as text rather than as switches. The section law and the
 *   probe-gated kairos path are proven in jsdom (`src/ui/settingsSections.test.ts`,
 *   `src/panes/omni/SettingsPane.test.tsx`); what jsdom cannot show is the
 *   fold materialising in the real FlexLayout border and the theme write
 *   travelling all the way to the document root.
 * Public surface: Playwright acceptance for the Settings fold.
 * Does NOT own: the preference register, the theme resolution law (30.4), or
 *   the walkthrough (32.T32.3).
 * Contract: rerun tranche [[32.T32.4]] · [[CHROME-CONTRACT]] §2 `omniSettings`.
 */

import { expect, test, type Page } from '@playwright/test';
import { SETTINGS_SECTIONS } from '../../src/ui/settingsSections';
import { PREFERENCE_KEYS, SPECIFIED_PREFERENCES } from '../../src/ui/preferences';

async function openSettingsFold(page: Page): Promise<void> {
    await page.goto('/');
    await expect(page.getByTestId('shell')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });
    // the `/` membrane really carries a Settings tab — this is the "a fold, not
    // a dialog" claim, checked against the live FlexLayout border
    await page
        .locator('.face-active .flexlayout__border_button', { hasText: 'Settings' })
        .click();
    await expect(page.getByTestId('settings-pane')).toBeVisible({ timeout: 15_000 });
}

test('32.T32.4: Settings is a reachable fold carrying all six sections and their scopes', async ({
    page
}) => {
    await openSettingsFold(page);

    for (const section of SETTINGS_SECTIONS) {
        const node = page.getByTestId(`settings-section-${section.id}`);
        await expect(node, `${section.id} did not render`).toBeVisible();
        await expect(node).toHaveAttribute('data-scope', section.scope);
    }

    // WC-OB-21: exactly one of the six is workspace-scoped
    await expect(page.locator('[data-testid^="settings-section-"][data-scope="workspace"]')).toHaveCount(
        1
    );

    // no blocking layer was opened to get here (CCT-8) — the fold IS the surface
    await expect(page.getByTestId('shell')).toBeVisible();
});

test('32.T32.4: the theme control moves the real document, not just a store', async ({ page }) => {
    await openSettingsFold(page);

    const root = page.locator('html');
    await expect(root).toHaveAttribute('data-theme', 'dark');

    // Selecting in Settings must travel Settings → themeStore → applyTheme →
    // the document root. A settings page whose control stopped at the store
    // would pass every jsdom assertion and change nothing a user can see.
    await page.getByTestId('settings-theme-select').selectOption('light');
    await expect(root).toHaveAttribute('data-theme', 'light');

    // and it persists under the one preference key, not a private one
    const persisted = await page.evaluate(
        key => window.localStorage.getItem(key),
        PREFERENCE_KEYS.appearanceTheme
    );
    expect(persisted).toBe('light');

    // leave the shell on the ground every visual baseline was authored against
    await page.getByTestId('settings-theme-select').selectOption('dark');
    await expect(root).toHaveAttribute('data-theme', 'dark');
});

test('32.T32.4: a not-yet-live preference reaches the user as a reason, never as a dead switch', async ({
    page
}) => {
    await openSettingsFold(page);

    for (const specified of SPECIFIED_PREFERENCES) {
        const row = page.getByTestId(`settings-disclosure-${specified.key}`);
        await expect(row, `${specified.key} is not disclosed`).toBeAttached();
        await expect(row).toHaveAttribute('data-status', specified.status);
        await expect(row).toContainText(specified.note.slice(0, 40));
        // nothing to click: a switch that moves nothing would be a lie about
        // what the app does
        expect(await row.locator('button, input, select').count()).toBe(0);
    }

    // the platform's reduced-motion answer is reported rather than overridden
    await expect(page.getByTestId('settings-reduced-motion')).toContainText('offers no override');
});

test('32.T32.4: the section nav narrows the fold and survives a face toggle', async ({ page }) => {
    await openSettingsFold(page);
    // Both faces are mounted at once, so every assertion here is scoped to the
    // ACTIVE face — a bare test-id would happily match the hidden face's copy,
    // which is visible to the DOM and unreachable to a user.
    const activeSections = page.locator('.face-active [data-testid^="settings-section-"]');
    await expect(activeSections).toHaveCount(6);

    await page.locator('.face-active').getByTestId('settings-nav-privacy').click();
    await expect(activeSections).toHaveCount(1);
    await expect(page.locator('.face-active').getByTestId('settings-section-privacy')).toBeVisible();

    // The selection lives in the OmniPanel fold state, not in component state,
    // so it survives the 0/1 fold. FlexLayout's border SELECTION is per-face
    // model, so the tab is re-opened on the newly active face — what is being
    // proven is that the narrowed section came back, not that the tab did.
    await page.getByTestId('face-toggle').click();
    await page
        .locator('.face-active .flexlayout__border_button', { hasText: 'Settings' })
        .click();
    await expect(page.locator('.face-active').getByTestId('settings-section-privacy')).toBeVisible();
    await expect(activeSections).toHaveCount(1);

    await page.locator('.face-active').getByTestId('settings-nav-all').click();
    await expect(activeSections).toHaveCount(6);
});

test('32.T32.4: the Diagnostics action really replays the walkthrough', async ({ page }) => {
    await openSettingsFold(page);

    await page.getByTestId('settings-action-epi-logos.help.openWalkthrough').click();

    // the command spine really carried it: the walkthrough is on screen
    await expect(page.getByTestId('walkthrough-card')).toBeVisible({ timeout: 10_000 });
});
