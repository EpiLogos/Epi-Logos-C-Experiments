/**
 * Coordinate: M' `/` membrane (drivable-loop spec: the layout switch — 52.T3)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): real Chromium / real spawned gateway carrier proof
 * Actualises: the UF half of 52.T3. [[M5'-SPEC]] :159 names the omni panel as
 *   "the canonical switch mechanism"; before this tranche no switch existed and
 *   `ide-deep` was reachable only as a SIDE EFFECT of a cross-layout intent
 *   whose target happened to default there. Three claims, and only a running
 *   browser can carry any of them:
 *
 *     (a) the switch is a REAL CONTROL in the OmniPanel and it moves the shell
 *         in BOTH directions — daily → deep and deep → daily — through clicks
 *         on that control, not through an intent side channel;
 *     (b) `epi-logos.layout.active` PERSISTS ACROSS RELOAD — the choice is a
 *         preference the shell resumes into, not session-local state;
 *     (c) every transition mints the seven-field cross-layout identity receipt
 *         with all seven fields intact. The switch is the exact place that
 *         invariant earns its keep: `createCrossLayoutIdentityReceipt` THROWS
 *         on drift, so a rendered receipt is itself the proof that nothing was
 *         dropped — and this spec additionally pins the field set (exactly
 *         seven, no more) and pins that the populated ones really carry their
 *         live values rather than seven honest nulls.
 *
 *   SCOPE. `ide-deep` has no pane set yet — 52.T4 builds `ideDeepDefault()`.
 *   Today the deep layout only WITHDRAWS the three face-0 daily widgets. So
 *   this spec asserts the SWITCH (layout id changes, persists, receipt minted)
 *   and the one observable consequence the carrier really has; it deliberately
 *   does not assert a deep pane set that does not exist.
 * Does NOT own: the deep pane set (52.T4), the subsystem pages (52.T5), the
 *   activity-bar registry (52.T6), or the identity tuple's law
 *   (`src/state/crossLayoutIdentity.ts`).
 * Contract: [[M5'-SPEC]] :91 / :107 (DCC-07) / :159 · [[CHROME-CONTRACT]] §2
 *   row `layout-switch` + §11 · rerun tranche [[52.T3]].
 */

import { expect, test, type Page } from '@playwright/test';
import { PREFERENCE_KEYS } from '../../src/ui/preferences';
import { todayId } from './e2e-env';

/** The seven fields `readCrossLayoutIdentity()` returns — the tuple DCC-07
 *  requires to survive any layout transition. Sorted for set comparison. */
const IDENTITY_FIELDS = [
    'activityBarMode',
    'coordinate',
    'dayNow',
    'lens',
    'mode',
    'profileGeneration',
    'sessionKey'
] as const;

interface IdentityTuple {
    coordinate: string | null;
    lens: number | null;
    mode: number | null;
    profileGeneration: number | null;
    sessionKey: string | null;
    dayNow: string | null;
    activityBarMode: string;
}

interface IdentityReceipt {
    fromLayout: string;
    toLayout: string;
    before: IdentityTuple;
    after: IdentityTuple;
}

/**
 * The house boot idiom, with the boot-sized budget. A reload is a SECOND boot
 * — the shell remounts, the gateway reconnects — so it gets the same budget
 * rather than the 10s project default, which is a first-paint budget.
 */
async function boot(page: Page): Promise<void> {
    await expect(page.getByTestId('shell')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('status-gateway')).toContainText('connected', {
        timeout: 20_000
    });
    await expect(page.getByTestId('status-tick')).toHaveText(/\d+/, { timeout: 20_000 });
}

/** The control on the face actually on screen — both faces carry the shared
 *  `/` membrane, so an unscoped locator also finds the hidden face's copy. */
function layoutSwitch(page: Page) {
    return page.locator('.face-active [data-testid="omnipanel-layout-switch"]');
}

async function readReceipt(page: Page): Promise<IdentityReceipt> {
    const raw = await page.getByTestId('shell').getAttribute('data-cross-layout-identity-receipt');
    expect(raw, 'the shell exposed no cross-layout identity receipt for this transition').toBeTruthy();
    return JSON.parse(raw as string) as IdentityReceipt;
}

/** All seven, and only seven, and unchanged across the crossing. */
function expectSevenFieldsIntact(receipt: IdentityReceipt, from: string, to: string): void {
    expect(receipt.fromLayout).toBe(from);
    expect(receipt.toLayout).toBe(to);
    expect(Object.keys(receipt.before).sort(), 'the identity tuple must be exactly the seven').toEqual([
        ...IDENTITY_FIELDS
    ]);
    expect(Object.keys(receipt.after).sort(), 'the identity tuple must be exactly the seven').toEqual([
        ...IDENTITY_FIELDS
    ]);
    for (const field of IDENTITY_FIELDS) {
        expect(receipt.after[field], `${field} changed across ${from} → ${to}`).toEqual(
            receipt.before[field]
        );
    }
}

test('52.T3: the OmniPanel control switches layouts both ways, persists, and receipts identity', async ({
    page
}) => {
    await page.goto('/');
    await boot(page);
    const shell = page.getByTestId('shell');

    // ── seed real identity, so "all seven intact" is not seven nulls ────────
    // A coordinate through the live CCT-3 chord, and today's day through the
    // journal's own idempotent affordance (the cross-layout-state-identity
    // house idiom). profileGeneration and activityBarMode are already live.
    await page.getByTestId('status-strip').click();
    await page.keyboard.press('Meta+Shift+Digit3');
    await expect(page.getByTestId('active-coordinate')).toHaveText('M3');

    const day = todayId();
    const beginToday = page.getByTestId('now-begin-today');
    if (await beginToday.isVisible().catch(() => false)) {
        await beginToday.click().catch(() => undefined);
    }
    await expect(page.getByTestId('status-daynow')).toContainText(day, { timeout: 15_000 });

    // ── (a) the control is real chrome inside the OmniPanel ────────────────
    await expect(shell).toHaveAttribute('data-active-layout', 'daily-0-1');
    const control = layoutSwitch(page);
    await expect(control).toBeVisible({ timeout: 15_000 });
    await expect(control).toHaveAttribute('data-active-layout', 'daily-0-1');
    await expect(control.getByTestId('omnipanel-layout-option-daily-0-1')).toHaveAttribute(
        'aria-pressed',
        'true'
    );
    await expect(control.getByTestId('omnipanel-layout-option-ide-deep')).toHaveAttribute(
        'aria-pressed',
        'false'
    );

    // ── daily → deep, through the real control ─────────────────────────────
    await control.getByTestId('omnipanel-layout-option-ide-deep').click();
    await expect(shell).toHaveAttribute('data-active-layout', 'ide-deep', { timeout: 20_000 });
    await expect(layoutSwitch(page)).toHaveAttribute('data-active-layout', 'ide-deep');
    await expect(
        layoutSwitch(page).getByTestId('omnipanel-layout-option-ide-deep')
    ).toHaveAttribute('aria-pressed', 'true');

    // ── (c) the transition minted a receipt, seven fields intact ───────────
    const intoDeep = await readReceipt(page);
    expectSevenFieldsIntact(intoDeep, 'daily-0-1', 'ide-deep');
    // and the populated fields really carry their live values
    expect(intoDeep.after.coordinate).toBe('M3');
    expect(intoDeep.after.dayNow).toBe(day);
    expect(Number.isInteger(intoDeep.after.profileGeneration)).toBe(true);
    expect(intoDeep.after.activityBarMode.length).toBeGreaterThan(0);

    // the one consequence the deep layout really has today (52.T4 builds the
    // rest): face 0's three daily widgets are withdrawn.
    await page.keyboard.press('Meta+.');
    await expect(shell).toHaveAttribute('data-face', '0', { timeout: 20_000 });
    await expect(page.getByTestId('m3-daily-wheel-mini-view')).toHaveCount(0);
    await expect(page.getByTestId('m0-coordinate-summary-card')).toHaveCount(0);
    await page.keyboard.press('Meta+.');
    await expect(shell).toHaveAttribute('data-face', '1', { timeout: 20_000 });

    // ── (b) the choice is persisted under the declared preference key ──────
    expect(
        await page.evaluate(key => localStorage.getItem(key), PREFERENCE_KEYS.layoutActive)
    ).toContain('ide-deep');

    // …and survives a real reload: the shell RESUMES into the deep layout.
    await page.reload();
    await boot(page);
    await expect(shell).toHaveAttribute('data-active-layout', 'ide-deep', { timeout: 20_000 });
    await expect(layoutSwitch(page)).toHaveAttribute('data-active-layout', 'ide-deep');
    // a fresh boot carries no receipt — the next one is genuinely this run's
    expect(await shell.getAttribute('data-cross-layout-identity-receipt')).toBeNull();

    // ── deep → daily, through the real control (the second direction) ──────
    await layoutSwitch(page).getByTestId('omnipanel-layout-option-daily-0-1').click();
    await expect(shell).toHaveAttribute('data-active-layout', 'daily-0-1', { timeout: 20_000 });
    const backToDaily = await readReceipt(page);
    expectSevenFieldsIntact(backToDaily, 'ide-deep', 'daily-0-1');
    expect(
        await page.evaluate(key => localStorage.getItem(key), PREFERENCE_KEYS.layoutActive)
    ).toContain('daily-0-1');
});

test('52.T3: the toggle command is the same switch — no second layout authority', async ({
    page
}) => {
    await page.goto('/');
    await boot(page);
    const shell = page.getByTestId('shell');
    await expect(shell).toHaveAttribute('data-active-layout', 'daily-0-1');

    // The palette is the global command membrane; the OmniPanel control fires
    // the SAME registered commands. Driving the toggle from the palette must
    // move the control's own pressed state, or the control is a second
    // authority rendering its own idea of the layout.
    await page.keyboard.press('Meta+Shift+P');
    await expect(page.getByTestId('command-palette')).toBeVisible();
    await page.getByTestId('palette-input').fill('Toggle daily');
    await expect(page.getByTestId('palette-item-layout.toggle')).toBeVisible();
    await page.getByTestId('palette-item-layout.toggle').click();
    await expect(page.getByTestId('command-palette')).toHaveCount(0);

    await expect(shell).toHaveAttribute('data-active-layout', 'ide-deep', { timeout: 20_000 });
    await expect(
        layoutSwitch(page).getByTestId('omnipanel-layout-option-ide-deep')
    ).toHaveAttribute('aria-pressed', 'true');
    const receipt = await readReceipt(page);
    expectSevenFieldsIntact(receipt, 'daily-0-1', 'ide-deep');
});
