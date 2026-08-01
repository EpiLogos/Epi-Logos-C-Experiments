/**
 * Coordinate: M' shell (activity-bar mode registry e2e — rerun 52.T6)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): real Chromium activity-bar acceptance boundary
 * Actualises: the tranche's behavioural acceptance — the deep layout offers
 *   the deep-only modes and the daily layout does not; switching layouts
 *   while on a deep-only mode falls back per `resolveModeForLayout` rather
 *   than rendering an empty slot; and `activityBarMode` (a cross-layout
 *   identity field) is handled coherently by that fallback: the CROSSING
 *   preserves it (the seven-field receipt), and the slot's lawful resolution
 *   settles it afterwards.
 * Does NOT own: the registry (`ui/leftSidebarModes.ts` + its unit suite), the
 *   layout switch (52.T3), or the Connections pane behaviour
 *   (semantic-connections.spec.ts).
 */

import { expect, test, type Page } from '@playwright/test';

const IDENTITY_FIELDS = [
    'activityBarMode',
    'coordinate',
    'dayNow',
    'lens',
    'mode',
    'profileGeneration',
    'sessionKey'
] as const;

async function boot(page: Page): Promise<void> {
    await page.goto('/');
    await expect(page.getByTestId('shell')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('status-gateway')).toContainText('connected', {
        timeout: 20_000
    });
    await expect(page.getByTestId('status-tick')).toHaveText(/\d+/, { timeout: 20_000 });
}

async function switchLayout(page: Page, layout: 'daily-0-1' | 'ide-deep'): Promise<void> {
    const control = page.locator('.face-active [data-testid="omnipanel-layout-switch"]');
    await expect(control).toBeVisible({ timeout: 20_000 });
    await control.getByTestId(`omnipanel-layout-option-${layout}`).click();
    await expect(page.getByTestId('shell')).toHaveAttribute('data-active-layout', layout, {
        timeout: 30_000
    });
}

async function runPaletteCommand(page: Page, fill: string, commandId: string): Promise<void> {
    await page.keyboard.press('Meta+Shift+P');
    await expect(page.getByTestId('command-palette')).toBeVisible();
    await page.getByTestId('palette-input').fill(fill);
    await expect(page.getByTestId(`palette-item-${commandId}`)).toBeVisible();
    await page.getByTestId(`palette-item-${commandId}`).click();
}

interface IdentityReceipt {
    fromLayout: string;
    toLayout: string;
    before: Record<string, unknown>;
    after: Record<string, unknown>;
}

async function readReceipt(page: Page): Promise<IdentityReceipt> {
    const raw = await page.getByTestId('shell').getAttribute('data-cross-layout-identity-receipt');
    expect(raw, 'no identity receipt on the shell').toBeTruthy();
    return JSON.parse(raw as string) as IdentityReceipt;
}

test('52.T6: deep-only modes are offered in ide-deep, refused in daily, and activation selects the real rail tab', async ({
    page
}) => {
    await boot(page);
    const shell = page.getByTestId('shell');
    await expect(shell).toHaveAttribute('data-active-layout', 'daily-0-1');
    await expect(shell).toHaveAttribute('data-activity-bar-mode', 'coordinate-tree');

    // In DAILY, running the deep-only mode command is a genuine refusal: the
    // store's guard holds and the mode does not move.
    await runPaletteCommand(page, 'Smart Connections', 'leftSidebar.mode.smart-connections');
    await expect(shell).toHaveAttribute('data-activity-bar-mode', 'coordinate-tree');

    // In DEEP, the same command is genuinely offered: the mode moves AND the
    // left slot answers — the rail's Connections tab is selected, its pane
    // visible (the collapsed rail opening on exactly this explicit gesture).
    await switchLayout(page, 'ide-deep');
    await runPaletteCommand(page, 'Smart Connections', 'leftSidebar.mode.smart-connections');
    await expect(shell).toHaveAttribute('data-activity-bar-mode', 'smart-connections');
    await expect(
        page.locator('.face-active [data-testid="semantic-connections-pane"]')
    ).toBeVisible({ timeout: 20_000 });

    // Backend Studio — the OTHER deep-only mode — is offered too: activation
    // RECORDS the mode and fabricates nothing (its pane is 28.13's `pending`
    // seam; the rail keeps showing what the user had up).
    await runPaletteCommand(page, 'Backend Studio', 'leftSidebar.mode.backend-studio');
    await expect(shell).toHaveAttribute('data-activity-bar-mode', 'backend-studio');
    await expect(
        page.locator('.face-active [data-testid="semantic-connections-pane"]')
    ).toBeVisible();

    // …and in DAILY it is refused exactly like Smart Connections.
    await switchLayout(page, 'daily-0-1');
    await expect(shell).toHaveAttribute('data-activity-bar-mode', 'coordinate-tree');
    await runPaletteCommand(page, 'Backend Studio', 'leftSidebar.mode.backend-studio');
    await expect(shell).toHaveAttribute('data-activity-bar-mode', 'coordinate-tree');
});

test('52.T6: activating the mode whose rail tab is already up is a no-op, never a collapse', async ({
    page
}) => {
    // FlexLayout's SELECT_TAB on a border TOGGLES — re-selecting the selected
    // tab collapses the rail. The reveal must guard that: a user who opened
    // the Connections tab BY CLICK (store still on the backbone) and then
    // activates Smart Connections must keep the pane, not lose it.
    await boot(page);
    const shell = page.getByTestId('shell');
    await switchLayout(page, 'ide-deep');
    await page
        .locator('.face-active .flexlayout__border_button', { hasText: 'Connections' })
        .click();
    await expect(
        page.locator('.face-active [data-testid="semantic-connections-pane"]')
    ).toBeVisible({ timeout: 20_000 });
    await expect(shell).toHaveAttribute('data-activity-bar-mode', 'coordinate-tree');

    await runPaletteCommand(page, 'Smart Connections', 'leftSidebar.mode.smart-connections');
    await expect(shell).toHaveAttribute('data-activity-bar-mode', 'smart-connections');
    await expect(
        page.locator('.face-active [data-testid="semantic-connections-pane"]')
    ).toBeVisible();
});

test('52.T6: a deep-only mode falls back across the crossing — receipt intact, slot never empty', async ({
    page
}) => {
    await boot(page);
    const shell = page.getByTestId('shell');
    await switchLayout(page, 'ide-deep');
    await runPaletteCommand(page, 'Smart Connections', 'leftSidebar.mode.smart-connections');
    await expect(shell).toHaveAttribute('data-activity-bar-mode', 'smart-connections');

    // Cross back to daily. The RECEIPT preserves activityBarMode through the
    // crossing (identity law) …
    await switchLayout(page, 'daily-0-1');
    const receipt = await readReceipt(page);
    expect(receipt.fromLayout).toBe('ide-deep');
    expect(receipt.toLayout).toBe('daily-0-1');
    expect(Object.keys(receipt.before).sort()).toEqual([...IDENTITY_FIELDS]);
    for (const field of IDENTITY_FIELDS) {
        expect(receipt.after[field], `${field} drifted across the crossing`).toEqual(
            receipt.before[field]
        );
    }
    expect(receipt.before.activityBarMode).toBe('smart-connections');

    // … and AFTER the receipt, the slot's own lawful resolution settles the
    // mode to the backbone — never an empty slot: the backbone's tab is right
    // there in the daily rail.
    await expect(shell).toHaveAttribute('data-activity-bar-mode', 'coordinate-tree');
    await expect(
        page.locator('.face-active .flexlayout__border_button', { hasText: 'Coordinates' })
    ).toHaveCount(1);

    // The fallback RECORDS the backbone; it must not REVEAL it. The reveal is
    // scoped to explicit activation (DR-ABAR-1), and the coordinate tree is
    // exactly the surface that must never mount unasked (28.T28.6 law) — so
    // the daily rail's selection is untouched by the crossing's settlement.
    await expect(
        page.locator('.face-active [data-testid="coordinate-tree"]')
    ).toHaveCount(0);

    // The fallback is one-way and honest: re-entering deep does not resurrect
    // the deep-only mode by itself.
    await switchLayout(page, 'ide-deep');
    await expect(shell).toHaveAttribute('data-activity-bar-mode', 'coordinate-tree');
});

test('52.T6: the daily rail genuinely lost the Connections tab; the deep rails genuinely keep it', async ({
    page
}) => {
    await boot(page);
    await expect(
        page.locator('.face-active .flexlayout__border_button', { hasText: 'Connections' })
    ).toHaveCount(0);
    await switchLayout(page, 'ide-deep');
    await expect(
        page.locator('.face-active .flexlayout__border_button', { hasText: 'Connections' })
    ).toHaveCount(1);
    // Both faces' deep rails carry it — the hidden face too.
    await page.keyboard.press('Meta+.');
    await expect(
        page.locator('.face-active .flexlayout__border_button', { hasText: 'Connections' })
    ).toHaveCount(1);
});
