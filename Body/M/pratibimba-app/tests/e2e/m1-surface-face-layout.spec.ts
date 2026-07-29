/**
 * Coordinate: M' M1' (drivable-loop spec: face × layout orthogonality — 52.T2)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): real Chromium / real spawned gateway carrier proof
 * Actualises: the UF half of 52.T2's DCC-07 repair. The unit suite pins the
 *   resolver's four-cell truth table; only the running shell can prove that the
 *   M1 surface reads the SHELL'S OWN `activeLayout` rather than inferring it
 *   from which face is mounted. The headline case is the one the pre-52.T2 code
 *   got wrong and this spec would have failed against: at boot the shell is on
 *   face 1 in the `daily-0-1` layout, and the M1 mount answered
 *   `standalone-ide-deep` / `ide-deep` — compressing the full eight-slot M1'
 *   workbench into the daily shell, which [[M5'-SPEC]] :161 forbids and DCC-07
 *   ([[M5'-SPEC]] :107) holds as a distinct authority class.
 *
 *   The deep layout is entered the only way the carrier currently allows: a
 *   cross-layout intent (Medicine → "Open Kairos"), the same path
 *   `bimba-graph-rendering-mode.spec.ts` and `pending-layout-claim.spec.ts`
 *   drive. Track 52.T3 is landing a deliberate layout switch; when it lands this
 *   spec should drive THAT instead — the assertion (the M1 mode follows BOTH
 *   axes) does not change, only the way in.
 * Does NOT own: the layout switch (52.T3), the deep pane set (52.T4), the
 *   M1 bodies' own contents, or the tick-store law (DR-WC-M1-1).
 * Contract: [[M5'-SPEC]] :107 (DCC-07) / :161 · [[DR-M1-FACE-LAYOUT-1]] ·
 *   rerun tranche [[52.T2]].
 */

import { expect, test } from '@playwright/test';

type Page = import('@playwright/test').Page;

/** The house boot idiom: the shell mounts, then the REAL gateway connects.
 *  Boot gets the boot-sized budget the gateway check beside it uses. */
async function boot(page: Page): Promise<void> {
    await page.goto('/');
    await expect(page.getByTestId('shell')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId('status-gateway')).toContainText('connected', {
        timeout: 20_000
    });
}

async function ensureFace(page: Page, face: '0' | '1'): Promise<void> {
    const shell = page.getByTestId('shell');
    if ((await shell.getAttribute('data-face')) !== face) {
        await page.keyboard.press('Meta+.');
    }
    await expect(shell).toHaveAttribute('data-face', face, { timeout: 20_000 });
}

/** House idiom (visual-panes.spec): the tab BUTTON scoped to the active face —
 *  a bare text match also hits flexlayout's off-screen measuring tabstrip. */
async function openTab(page: Page, name: string): Promise<void> {
    await page.locator('.face-active .flexlayout__tab_button', { hasText: name }).first().click();
}

/** BOTH faces stay mounted (one `face-active`, one `face-hidden`), so every
 *  assertion here is scoped to the face actually on screen — otherwise the
 *  hidden face's still-selected tab answers for it. */
function onActiveFace(page: Page, testId: string) {
    return page.locator(`.face-active [data-testid="${testId}"]`);
}

test('52.T2: the M1 surface reads the shell layout, not the mounted face', async ({ page }) => {
    await boot(page);
    const shell = page.getByTestId('shell');

    // ── (face 1, daily-0-1) — the boot state, and the case the old code got
    //    wrong. Personal face + daily layout must PREVIEW, not deliver depth.
    await ensureFace(page, '1');
    await expect(shell).toHaveAttribute('data-active-layout', 'daily-0-1');
    await openTab(page, 'M1 Deep');

    const preview = onActiveFace(page, 'm1-body-compact-track-08');
    await expect(preview).toBeVisible({ timeout: 15_000 });
    // the surface reports the SHELL's layout — pre-52.T2 this read 'ide-deep'
    // because the face implied it
    await expect(preview).toHaveAttribute('data-layout-id', 'daily-0-1');
    await expect(preview).toHaveAttribute('data-m1-surface-mode', 'compact-track-08');
    // and the eight-slot workbench is genuinely absent from the daily shell
    await expect(onActiveFace(page, 'm1-body-standalone-ide-deep')).toHaveCount(0);
    await expect(onActiveFace(page, 'm1-slot-spanda-navigator')).toHaveCount(0);
    await expect(onActiveFace(page, 'm1-slot-vortex-browser')).toHaveCount(0);
    // the preview is a real preview: the shared-state strip still rides the
    // one singleton, so this is depth withheld, not a surface blanked
    await expect(onActiveFace(page, 'm1-shared-state')).toBeVisible();
    await expect(onActiveFace(page, 'm1-walk-strip')).toBeVisible();

    // ── enter the deep layout (52.T3 will replace this way in) ─────────────
    await openTab(page, 'Medicine');
    const openKairos = page.getByRole('button', { name: 'Open Kairos' });
    await expect(openKairos).toBeVisible({ timeout: 20_000 });
    await openKairos.click();
    await expect(shell).toHaveAttribute('data-active-layout', 'ide-deep', { timeout: 20_000 });

    // ── (face 1, ide-deep) — BOTH gates open: the workbench appears, and the
    //    face never moved. Only the layout axis changed.
    await ensureFace(page, '1');
    await openTab(page, 'M1 Deep');
    const workbench = onActiveFace(page, 'm1-body-standalone-ide-deep');
    await expect(workbench).toBeVisible({ timeout: 15_000 });
    await expect(workbench).toHaveAttribute('data-layout-id', 'ide-deep');
    await expect(workbench).toHaveAttribute('data-m1-surface-mode', 'standalone-ide-deep');
    await expect(onActiveFace(page, 'm1-slot-spanda-navigator')).toBeVisible();
    await expect(onActiveFace(page, 'm1-slot-vortex-browser')).toBeVisible();
    await expect(onActiveFace(page, 'm1-body-compact-track-08')).toHaveCount(0);
    await expect(shell).toHaveAttribute('data-face', '1');

    // ── (face 0, ide-deep) — the OTHER orthogonality direction: the cosmic
    //    mount is a composition role, so the deep layout does not turn it into
    //    the workbench; but it does now report the real layout, which the old
    //    face-derived code hardcoded to 'daily-0-1'.
    await ensureFace(page, '0');
    await openTab(page, 'M1 Surface');
    const composed = onActiveFace(page, 'm1-body-composed-cosmic-1-2-3');
    await expect(composed).toBeVisible({ timeout: 15_000 });
    await expect(composed).toHaveAttribute('data-layout-id', 'ide-deep');
    await expect(composed).toHaveAttribute('data-m1-surface-mode', 'composed-cosmic-1-2-3');
    await expect(onActiveFace(page, 'm1-cosmic-crosspole')).toBeVisible();
    await expect(onActiveFace(page, 'm1-body-standalone-ide-deep')).toHaveCount(0);
});
