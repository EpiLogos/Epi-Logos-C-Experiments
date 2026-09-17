/**
 * Coordinate: M' shell-0 (accessibility contract real-UI proof — 30.T30.5)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): real Chromium, real media-preference emulation
 * Actualises: the contract's central clause proven on the running surface —
 *   under `prefers-reduced-motion: reduce` a DISCRETE transition survives as a
 *   snap (it carries state-change semantics) while CONTINUOUS motion stops,
 *   and the shell stays fully operable either way.
 * Does NOT own: the motion durations (ui/motionTokens.ts) or the contract
 *   constants (ui/accessibility.ts).
 * Contract: [[ACCESSIBILITY-CONTRACT]] §2; DR-WC-DL-4; rerun tranche [[30.T30.5]].
 */

import { expect, test, type Page } from '@playwright/test';
import { REDUCED_MOTION_SNAP_MS } from '../../src/ui/accessibility';

async function faceSlotAnimationMs(page: Page): Promise<number> {
    return page.locator('.face-slot').first().evaluate(node => {
        const duration = getComputedStyle(node as Element).animationDuration;
        // computed style is seconds ("0.1s", "0.4s"); normalise to ms
        return Math.round(parseFloat(duration) * 1000);
    });
}

test('a discrete transition survives reduced motion as a snap, and the shell stays operable', async ({
    page
}) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const shell = page.getByTestId('shell');
    await expect(shell).toBeVisible({ timeout: 20_000 });

    // the preference really reached the page
    expect(
        await page.evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    ).toBe(true);

    // DISCRETE motion is PRESERVED, collapsed to the contract's snap — not
    // removed. A removed transition would take the state-change semantics with
    // it, which is exactly what DR-WC-DL-4 refuses.
    await expect(page.locator('.face-slot').first()).toBeAttached();
    expect(await faceSlotAnimationMs(page)).toBe(REDUCED_MOTION_SNAP_MS);

    // and the state change it carries still happens: the face really inverts
    const before = await shell.getAttribute('data-face');
    await page.keyboard.press('Meta+.');
    await expect(shell).not.toHaveAttribute('data-face', before ?? '', { timeout: 20_000 });
});

test('without the preference the same transition runs its full choreography', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');
    await expect(page.getByTestId('shell')).toBeVisible({ timeout: 20_000 });
    await expect(page.locator('.face-slot').first()).toBeAttached();

    // The media query genuinely switches behaviour: unreduced motion is longer
    // than the snap. (Asserting "different" rather than a literal duration
    // keeps the motion-token owner free to retune it.)
    expect(await faceSlotAnimationMs(page)).toBeGreaterThan(REDUCED_MOTION_SNAP_MS);
});
