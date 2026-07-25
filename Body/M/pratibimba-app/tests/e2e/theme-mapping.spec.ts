/**
 * Coordinate: M' (drivable-loop spec: light/dark theme mapping — 30.T30.4)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): real Chromium / gateway carrier proof
 * Actualises: the UF proof that the theme mapping is WIRED, not merely
 *   correct. A resolver unit test says the law is right; only the live app can
 *   say anything applies it. Four claims, all against the real cascade:
 *     (a) the app boots carrying a resolved theme on the root element;
 *     (b) picking a theme from the REAL command palette moves the rendered
 *         surface — the computed background of the page actually changes;
 *     (c) Cl(4,2) polarity survives the inversion IN THE LIVE CASCADE — the
 *         cool pole stays cool and the warm pole stays warm after the switch;
 *     (d) the nara-domain rule is live and domain-REACTIVE: the same nara
 *         selection resolves to its base off M4 and to itself on M4 as the
 *         user navigates, and the M-tier warm bias reaches a real rendered
 *         breadcrumb colour.
 * Does NOT own: the resolution law (src/ui/themeMapping.ts + its unit test),
 *   the palette values (src/ui/tokens.ts), or coordinate selection.
 * Contract: rerun tranche [[30.T30.4]] over [[30.T30.2]].
 */

import { expect, test } from '@playwright/test';

/** Read a resolved CSS custom property off the live root element. */
async function rootVar(page: import('@playwright/test').Page, name: string): Promise<string> {
    return page.evaluate(
        (property: string) => getComputedStyle(document.documentElement).getPropertyValue(property).trim(),
        name
    );
}

/** `rgb(r, g, b)` / `#rrggbb` → HSL hue in degrees. */
function hueOf(colour: string): number {
    const nums = colour.startsWith('#')
        ? [1, 3, 5].map(i => Number.parseInt(colour.slice(i, i + 2), 16))
        : (colour.match(/\d+(\.\d+)?/g) ?? []).slice(0, 3).map(Number);
    const [r, g, b] = nums.map(v => v / 255);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    if (delta === 0) return 0;
    let h: number;
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    return (h * 60 + 360) % 360;
}

/** Warm = red→yellow arc; cool = everything the violet/indigo pole sits on. */
function isWarm(colour: string): boolean {
    const h = hueOf(colour);
    return h < 75 || h > 330;
}

/** Pick a theme through the real command palette — the user's actual path. */
async function pickTheme(page: import('@playwright/test').Page, commandId: string): Promise<void> {
    await page.keyboard.press('Meta+Shift+P');
    await expect(page.getByTestId('command-palette')).toBeVisible();
    const input = page.getByTestId('palette-input');
    await input.fill('Appearance');
    await expect(page.getByTestId(`palette-item-${commandId}`)).toBeVisible();
    await page.getByTestId(`palette-item-${commandId}`).click();
    await expect(page.getByTestId('command-palette')).toHaveCount(0);
}

test('30.T30.4: the theme mapping is live — the palette moves the rendered surface, polarity survives', async ({
    page
}) => {
    await page.goto('/');
    await expect(page.getByTestId('shell')).toBeVisible();
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });

    // (a) the signal exists on the real root, at the carrier's dark ground
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    const darkGround = await rootVar(page, '--ground');
    const darkAccent = await rootVar(page, '--accent'); // cool pole
    const darkRing = await rootVar(page, '--ring'); // warm pole
    const darkBodyBackground = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);

    // (b) picking Light from the live palette actually repaints the page
    await pickTheme(page, 'theme.light');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

    const lightGround = await rootVar(page, '--ground');
    const lightBodyBackground = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(lightGround, 'the light theme must move --ground').not.toBe(darkGround);
    expect(
        lightBodyBackground,
        'the rendered body background must change — a token that no surface consumes is not a theme'
    ).not.toBe(darkBodyBackground);

    // the light ground really is lighter than the dark ground (not just different)
    const luminance = (colour: string): number => {
        const nums = colour.startsWith('#')
            ? [1, 3, 5].map(i => Number.parseInt(colour.slice(i, i + 2), 16))
            : (colour.match(/\d+(\.\d+)?/g) ?? []).slice(0, 3).map(Number);
        return (nums[0] * 0.2126 + nums[1] * 0.7152 + nums[2] * 0.0722) / 255;
    };
    expect(luminance(lightBodyBackground)).toBeGreaterThan(luminance(darkBodyBackground) + 0.4);

    // (c) polarity preservation in the LIVE cascade: cool stayed cool, warm stayed warm
    const lightAccent = await rootVar(page, '--accent');
    const lightRing = await rootVar(page, '--ring');
    expect(isWarm(darkAccent), 'the accent is the cool pole under dark').toBe(false);
    expect(isWarm(lightAccent), 'the accent crossed polarity under light').toBe(false);
    expect(isWarm(darkRing), 'the ring is the warm pole under dark').toBe(true);
    expect(isWarm(lightRing), 'the ring crossed polarity under light').toBe(true);

    // (e) the DOMINANT surface follows too. Regression: the first cut of this
    // tranche themed only the app's own vocabulary and left the vendored
    // FlexLayout ramp (flexlayout-react/style/dark.css, imported in main.tsx)
    // hard-dark — so under Light the tab strip stayed near-black while the
    // selected tab's label followed --ink into the dark, rendering at 1.33:1.
    // Reading :root vars and document.body could not see it; reading the real
    // tab element can. Assert the pairing a user actually looks at.
    const tabContrast = await page.evaluate(() => {
        const tab = document.querySelector('.flexlayout__tab_button--selected');
        if (!tab) return null;
        const style = getComputedStyle(tab);
        const relative = (colour: string): number => {
            const [r, g, b] = (colour.match(/\d+(\.\d+)?/g) ?? []).slice(0, 3).map(Number);
            const channel = (v: number): number => {
                const s = v / 255;
                return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
            };
            return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
        };
        // walk up for the first non-transparent background actually painted
        let node: Element | null = tab;
        let background = 'rgba(0, 0, 0, 0)';
        while (node) {
            const candidate = getComputedStyle(node).backgroundColor;
            if (candidate && !/rgba\(0, 0, 0, 0\)|transparent/.test(candidate)) {
                background = candidate;
                break;
            }
            node = node.parentElement;
        }
        const a = relative(style.color);
        const b = relative(background);
        const [hi, lo] = a > b ? [a, b] : [b, a];
        return { ratio: (hi + 0.05) / (lo + 0.05), colour: style.color, background };
    });

    expect(tabContrast, 'the shell must render a selected FlexLayout tab to test against').not.toBeNull();
    expect(
        tabContrast!.ratio,
        `selected tab label ${tabContrast!.colour} on ${tabContrast!.background} must stay legible under Light`
    ).toBeGreaterThanOrEqual(4.5);

    // restore the ground so later specs in this shared origin start from dark
    await pickTheme(page, 'theme.dark');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('30.T30.4: the nara-domain rule is live and reacts to the coordinate the user is on', async ({
    page
}) => {
    await page.goto('/');
    await expect(page.getByTestId('shell')).toBeVisible();
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });

    // keep focus off any editable so the coordinate chords reach the shell spine
    await page.getByTestId('status-strip').click();

    // stand on M2 (not the nara domain), then select a nara theme
    await page.keyboard.press('Meta+Shift+Digit2');
    await expect(page.getByTestId('active-coordinate')).toHaveText('M2');

    await pickTheme(page, 'theme.naraDark');
    // off M4 the nara theme degrades to its base — the contract's domain rule,
    // observed on the real root rather than asserted against a pure function
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    const m2Tint = await page
        .getByTestId('coordinate-breadcrumb-family')
        .evaluate(el => getComputedStyle(el).color);

    // walk to M4 — the SAME selection now resolves to nara-dark, live
    await page.getByTestId('status-strip').click();
    await page.keyboard.press('Meta+Shift+Digit4');
    await expect(page.getByTestId('active-coordinate')).toHaveText('M4');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'nara-dark');

    // and the M-tier warm bias reaches a real rendered colour: the M4 segment
    // under nara-dark is warmer than the same segment under plain dark
    const m4NaraTint = await page
        .getByTestId('coordinate-breadcrumb-family')
        .evaluate(el => getComputedStyle(el).color);

    await pickTheme(page, 'theme.dark');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    const m4PlainTint = await page
        .getByTestId('coordinate-breadcrumb-family')
        .evaluate(el => getComputedStyle(el).color);

    expect(
        m4NaraTint,
        'the nara M-tier bias must reach the rendered breadcrumb, not stop at the resolver'
    ).not.toBe(m4PlainTint);
    expect(hueOf(m4NaraTint)).toBeLessThan(hueOf(m4PlainTint)); // leaned toward the earth anchor
    expect(m2Tint, 'M2 off-domain must render its canonical tier colour').not.toBe(m4NaraTint);

    // walking back off M4 restores the base theme — the applier is reactive
    // in both directions, not a one-way latch
    await pickTheme(page, 'theme.naraLight');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'nara-light');
    await page.getByTestId('status-strip').click();
    await page.keyboard.press('Meta+Shift+Digit1');
    await expect(page.getByTestId('active-coordinate')).toHaveText('M1');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

    await pickTheme(page, 'theme.dark');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});
