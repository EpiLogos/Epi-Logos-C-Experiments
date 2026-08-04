/**
 * Coordinate: M' 4-5-0 (drivable-loop personal slot-ownership proof, 29.T29.3)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): #4 — personal composition UI-flow gate
 * Actualises: the personal composition's declared slot ownership resolving in
 *   the REAL app against a spawned gateway — not a jsdom mount. Track 29 is
 *   UF class precisely because a jsdom proof never opens the app, and the
 *   thing being proven here is that `loadPersonalComposition()` runs at the
 *   mounted engine root and reports real owners.
 * Public surface: Playwright test for the personal-recognition-engine
 *   composition data attributes.
 * Does NOT own: the ownership declaration (`composition/personalComposition.ts`),
 *   the boundary law (`composition/geometricSlotEnforcement.ts`), or any slot
 *   contributor's own surface.
 * Contract: [[M'-SYSTEM-SPEC]] + rerun [[29-integrated-plugins-composition-deep]]
 *   T29.3 (DR-WC-IP-3, ROUTED).
 */

import { expect, test } from '@playwright/test';

test('the personal composition names an owner for every geometric slot in the live app (29.T29.3)', async ({
    page
}) => {
    await page.goto('/');
    await expect(page.getByTestId('shell')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('status-gateway')).toContainText('connected', {
        timeout: 20_000
    });
    // The personal pole is face 1 and the carrier's default face; land on it
    // deterministically rather than assuming persisted layout starts there.
    const shell = page.getByTestId('shell');
    if ((await shell.getAttribute('data-face')) !== '1') {
        await page.keyboard.press('Meta+.');
    }
    await expect(shell).toHaveAttribute('data-face', '1', { timeout: 20_000 });

    const nowTab = page.locator('.face-active .flexlayout__tab_button', { hasText: 'Now' }).first();
    await expect(nowTab).toBeVisible({ timeout: 20_000 });
    await nowTab.click();

    const engine = page.getByTestId('personal-recognition-engine');
    await expect(engine).toBeVisible({ timeout: 20_000 });

    // The composition mounted, and every slot resolved to a NAMED owner — not
    // 'unclaimed' (mounted with nobody on the slot) and not 'unmounted' (the
    // load was refused). Those three are deliberately distinguishable.
    await expect(engine).toHaveAttribute('data-composition-mounted', 'true');
    await expect(engine).toHaveAttribute('data-composition-rejection', '');
    await expect(engine).toHaveAttribute('data-left-composition-owner', 'm4-nara');
    await expect(engine).toHaveAttribute('data-center-composition-owner', 'm4-nara');
    await expect(engine).toHaveAttribute('data-right-composition-owner', 'm5-epii');
    await expect(engine).toHaveAttribute('data-grounding-owner', 'm0-anuttara');
    await expect(engine).toHaveAttribute('data-composition-ambient-owner', 'm4-nara');
    await expect(engine).toHaveAttribute('data-composition-status-owner', 'm4-nara');

    // 25.T25.6 lifted the center-slot blocker by mounting the opaque personal
    // field renderer. A fully inhabited six-slot composition has no blockers.
    await expect(engine).toHaveAttribute('data-composition-blocked-slots', '');
    await expect(page.locator('[data-view-id="m4.nara.personalField"]')).toBeVisible();

    // Each slot whose owner is declared is mounted by a surface that is really
    // on this face: the M0 grounding under-layer and the M5 recognition layer
    // render here, and the ambient control renders in the case that wraps the
    // engine. A named owner over an absent surface would be the declaration
    // describing a composition that is not on screen.
    await expect(page.getByTestId('m0-virtue-witness-panel')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('m5-recognition-layer')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('time-axis-switcher')).toBeVisible({ timeout: 20_000 });
});
