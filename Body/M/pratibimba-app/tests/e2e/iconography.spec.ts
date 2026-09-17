/**
 * Coordinate: M' Track 30 iconography system (30.T30.9).
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): real Chromium / spawned-gateway carrier proof
 * Actualises: the part of tranche 30.9 that only a running browser can show —
 *   that a glyph PAINTS. The register and the six-letter mapping are proven in
 *   jsdom (src/ui/iconography.test.ts); what jsdom cannot show is whether Vite
 *   really shipped the asset, whether the stylesheet's mask really resolved,
 *   and whether the glyph really inherits the family hue instead of quietly
 *   rendering an invisible zero-sized box. This spec drives the real shell over
 *   a real gateway session and reads the resolved computed style off the live
 *   document.
 * Public surface: Playwright acceptance for the 30.9 family glyph + the
 *   coin-flip chrome toggle after the icon assets moved to `src/assets/icons/`.
 * Does NOT own: the icon register (src/ui/iconography.ts), the family hue
 *   values (src/ui/tokens.ts), or the session surface (Track 25 / SessionsPane).
 * Contract: rerun tranche [[30.T30.9]] + [[30-design-language-layer]].
 */

import { expect, test, type Page } from '@playwright/test';
import { gatewayRpc } from './gateway-rpc';
import { FAMILY_HUES } from '../../src/ui/tokens';

/** `#e0b45f` → `rgb(224, 180, 95)`, the form getComputedStyle returns. */
function hexToRgb(hex: string): string {
    const value = hex.replace('#', '');
    const [r, g, b] = [0, 2, 4].map(offset => parseInt(value.slice(offset, offset + 2), 16));
    return `rgb(${r}, ${g}, ${b})`;
}

async function openShell(page: Page): Promise<void> {
    await page.goto('/');
    await expect(page.getByTestId('shell')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });
}

test('30.T30.9: the family glyph paints on a real coordinate string, tinted by the family hue', async ({
    page
}) => {
    // A REAL gateway session record — the coordinate display only mounts inside
    // a selected session's detail pane, so the glyph is reached the way a user
    // reaches it, not by mounting a component in isolation.
    const sessionKey = `e2e-iconography-${Date.now().toString(36)}`;
    const imported = (await gatewayRpc('sessions.import', {
        targetSessionKey: sessionKey,
        sourceSessionKey: 'e2e-origin',
        label: 'e2e iconography'
    })) as { canonicalKey?: string };
    const canonicalKey = imported?.canonicalKey;
    expect(canonicalKey, 'sessions.import returned no canonicalKey').toBeTruthy();

    await openShell(page);

    // keep focus off any editable so the CCT-3 chord routes to the shell spine,
    // then move the live coordinate to M2 — this is what the display renders
    await page.getByTestId('status-strip').click();
    await page.keyboard.press('Meta+Shift+Digit2');

    await page
        .locator('.face-active .flexlayout__border_button', { hasText: 'sessions' })
        .click();
    const sessionButton = page.getByTestId(`session-${canonicalKey}`);
    await expect(sessionButton).toBeVisible({ timeout: 15_000 });
    await sessionButton.click();

    const coordinate = page
        .getByTestId('active-coordinate-display')
        .getByTestId('coordinate-string');
    await expect(coordinate).toBeVisible({ timeout: 15_000 });
    await expect(coordinate).toHaveAttribute('data-family', 'M');
    // the glyph is decorative, so the visible/copyable text is unchanged by it
    await expect(coordinate).toHaveText('M2');

    const glyph = coordinate.getByTestId('coordinate-family-glyph');
    await expect(glyph).toBeAttached();
    await expect(glyph).toHaveAttribute('data-icon', 'family-m');

    const painted = await glyph.evaluate(node => {
        const style = getComputedStyle(node as Element);
        return {
            maskImage: style.maskImage || style.webkitMaskImage,
            backgroundColor: style.backgroundColor,
            maskRepeat: style.maskRepeat || style.webkitMaskRepeat
        };
    });

    // Vite really emitted the asset and the browser really resolved it — an
    // unshipped or misnamed glyph leaves this `none`.
    expect(painted.maskImage).not.toBe('none');
    expect(painted.maskImage).toContain('svg');
    expect(painted.maskRepeat).toContain('no-repeat');
    // it wears the family hue because it is a mask over currentColor, not a
    // second palette copied beside ui/tokens
    expect(painted.backgroundColor).toBe(hexToRgb(FAMILY_HUES.M));

    // and it occupies real space: `em` sizing resolved against the mono type
    // scale rather than collapsing to a zero-box nobody would ever see
    const box = await glyph.boundingBox();
    expect(box, 'the family glyph has no layout box').not.toBeNull();
    expect(box!.width).toBeGreaterThan(4);
    expect(box!.height).toBeGreaterThan(4);

    // decorative marks must not leak into the accessible name
    await expect(coordinate).toHaveAttribute('aria-label', /subsystem family/);
});

test('30.T30.9: the 0/1 coin-flip chrome toggle still resolves after the icons moved into the set', async ({
    page
}) => {
    await openShell(page);

    // The coin-flip glyph moved from `src/assets/` into the `src/assets/icons/`
    // set and its single stylesheet reference was repointed. This is the live
    // guard on that move: a stale url leaves the toggle a blank square, which
    // typecheck and vitest would both happily pass.
    const toggleIcon = page.getByTestId('face-toggle').locator('.face-toggle-icon');
    await expect(toggleIcon).toBeVisible();

    const painted = await toggleIcon.evaluate(node => {
        const style = getComputedStyle(node as Element);
        return {
            maskImage: style.maskImage || style.webkitMaskImage,
            backgroundColor: style.backgroundColor
        };
    });
    expect(painted.maskImage).not.toBe('none');
    expect(painted.maskImage).toContain('svg');
    expect(painted.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
});
