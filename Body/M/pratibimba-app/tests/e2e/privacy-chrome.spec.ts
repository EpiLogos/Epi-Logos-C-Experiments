/**
 * Coordinate: M' M4' (drivable-loop spec: privacy-class chrome — 25.T25.18)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): real Chromium / gateway carrier proof
 * Actualises: the UF half of 25.18. The contract test proves the RULES exist
 *   and that every declared surface names its tint in source; only the running
 *   app proves the tint reaches a rendered pixel and that the indicator stays
 *   off the status bar. Four claims against the live cascade:
 *     (a) an M4' protected-local surface renders a real 3px left border in the
 *         earth tint — computed, not asserted from the stylesheet;
 *     (b) its title carries the full PRIVACY_CLASS string;
 *     (c) a handle-only surface renders the DIFFERENT (slate) tint, so the
 *         register actually distinguishes classes rather than painting one
 *         colour everywhere;
 *     (d) the status bar still shows exactly six state threads and none of them
 *         is a privacy entry (15.10 discipline, DR-WC-M4-5's whole point).
 *
 *   DR-WC-M4-5 is ROUTED, not ratified: this proves the BORDER-COLOUR option
 *   the 25.18 brief specifies works, not that the visual register is settled.
 * Does NOT own: the privacy law (S0), the tint values (styles.css), or the
 *   transform lifecycle.
 * Contract: [[M4'-SPEC]] + rerun tranche [[25.T25.18]]; [[DR-WC-M4-5]] (ROUTED).
 */

import { expect, test } from '@playwright/test';

/** The hexes the 25.18 brief specifies, as Chromium reports them. */
const EARTH = 'rgb(138, 115, 85)'; // #8a7355 — protected_local
const SLATE = 'rgb(107, 117, 136)'; // #6b7588 — protected_local_handle_only

test('25.T25.18: privacy-class chrome renders on the surface, never in the status bar', async ({
    page
}) => {
    await page.goto('/');
    await expect(page.getByTestId('shell')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });

    const activeFace = page.locator('.face-active');
    await activeFace.locator('.flexlayout__tab_button', { hasText: 'Transform' }).click();
    const pane = activeFace.getByTestId('transform-containers-pane');
    await expect(pane).toBeVisible();

    // (a) the protected-local tint is really painted
    const tint = await pane.evaluate(el => {
        const style = getComputedStyle(el);
        return {
            width: style.borderLeftWidth,
            style: style.borderLeftStyle,
            colour: style.borderLeftColor,
            classes: el.className
        };
    });
    expect(tint.classes).toContain('mext-privacy-protected-local');
    expect(tint.width, 'the brief specifies a 3px border-left').toBe('3px');
    expect(tint.style).toBe('solid');
    expect(tint.colour, 'protected-local wears the warm earth tint').toBe(EARTH);

    // (b) the title carries the full PRIVACY_CLASS string
    await expect(pane).toHaveAttribute('title', /^protected_local — /);

    // (c) a handle-only surface wears a DIFFERENT tint — the register really
    // distinguishes classes rather than painting one colour on everything.
    // UNCONDITIONAL: the first cut guarded this behind `if (count > 0)` and the
    // trace proved the body never executed, so the claim rode on nothing. The
    // Coordinate fold (25.14, spec-assigned handle-only) is opened on purpose.
    await activeFace.locator('.flexlayout__tab_button', { hasText: 'Coordinate' }).click();
    const coordinatePane = activeFace.getByTestId('pratibimba-coordinate-pane');
    await expect(coordinatePane).toBeVisible();
    await expect(coordinatePane).toHaveClass(/mext-privacy-protected-local-handle-only/);
    const handleTint = await coordinatePane.evaluate(el => getComputedStyle(el).borderLeftColor);
    expect(handleTint, 'handle-only wears the slate tint').toBe(SLATE);
    expect(handleTint, 'the two classes must not paint the same colour').not.toBe(tint.colour);
    await expect(coordinatePane).toHaveAttribute('title', /^protected_local_handle_only — /);

    // (d) 15.10 discipline: six state threads, no privacy entry among them
    const statusStrip = page.getByTestId('status-strip');
    await expect(statusStrip).toBeVisible();
    const statusPrivacy = await statusStrip.evaluate(
        el => el.querySelectorAll('[class*="mext-privacy-"]').length
    );
    expect(statusPrivacy, 'a privacy tint leaked into the status bar — 15.10 admits six entries').toBe(
        0
    );
});
