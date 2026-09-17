/**
 * Coordinate: M3-5' double-torus world clock e2e (rerun 51.T51.5)
 * Actualises: the tranche's UF acceptance in a real browser against the real
 *   spawned gateway — "enters the depth mode and asserts both foliations render
 *   from live clock state and that the 0-side dual rendering is present per
 *   §8.13."
 *
 *   The load-bearing assertion is that both families render into ONE chart and
 *   that their leaves CROSS. Two tori drawn side by side would satisfy a naive
 *   "both render" check and fail this one.
 * Does NOT own: the co-foliation law
 *   (`src/panes/m3DoubleTorus/coFoliation.test.ts`), the M3 bus reader, the clock.
 */

import { expect, test, type Page } from '@playwright/test';

const K2_LEAF_COUNT = 24;
const T2_LENS_LEAF_COUNT = 17;

async function boot(page: Page): Promise<void> {
    await page.goto('/');
    await expect(page.getByTestId('shell')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });
    await expect(page.getByTestId('status-tick')).toHaveText(/\d+/, { timeout: 20_000 });
}

function torus(page: Page) {
    return page.locator('.face-active [data-testid="m3-double-torus"]');
}

async function openDepthMode(page: Page): Promise<void> {
    await page.keyboard.press('Meta+Shift+P');
    await page.getByTestId('palette-input').fill('double-torus');
    await page.getByTestId('palette-item-m3.open.doubleTorus').click();
    // canon calls this "a depth mode" in its own words — it must land in the
    // deep layout, not in the daily shell preview.
    await expect(page.getByTestId('shell')).toHaveAttribute('data-active-layout', 'ide-deep', {
        timeout: 30_000
    });
    await expect(torus(page)).toBeVisible({ timeout: 30_000 });
}

test('51.T51.5: the depth mode renders BOTH foliations into one chart, from live clock state', async ({
    page
}) => {
    test.setTimeout(180_000);
    await boot(page);
    await openDepthMode(page);

    await expect(torus(page)).toHaveAttribute('data-depth-mode', 'toroidal-world');

    // live clock state, not a fixture
    const generation = Number(await torus(page).getAttribute('data-generation'));
    expect(generation, 'the depth mode must be reading a real frame').toBeGreaterThan(0);

    // BOTH leaf families are in the SAME svg chart — this is the co-foliation.
    const chart = torus(page).getByTestId('m3-double-torus-chart');
    await expect(chart).toBeVisible();
    await expect(chart.locator('[data-testid^="m3-dt-k2-leaf-"]')).toHaveCount(K2_LEAF_COUNT);
    await expect(chart.locator('[data-testid^="m3-dt-t2-leaf-"]')).toHaveCount(T2_LENS_LEAF_COUNT);

    // …and they CROSS: the crossing count is the product, which is only true if
    // the two families share one chart. Two tori side by side give zero.
    expect(Number(await torus(page).getAttribute('data-crossing-count'))).toBe(
        K2_LEAF_COUNT * T2_LENS_LEAF_COUNT
    );

    // K² is driven by the live degree720 double cover (720 = 2 × 360).
    const degree720 = await torus(page).getByTestId('m3-dt-degree720').textContent();
    expect(degree720, 'K² needs the live double cover').not.toBe('pending');
    const degree = Number(degree720);
    expect(degree).toBeGreaterThanOrEqual(0);
    expect(degree).toBeLessThan(720);

    const k2Leaf = Number(await torus(page).getAttribute('data-k2-leaf'));
    const sheet = Number(await torus(page).getAttribute('data-k2-sheet'));
    expect(sheet, 'the sheet is the half of the double cover').toBe(degree >= 360 ? 1 : 0);
    // leaf = fifths(pitch class) + 12·sheet — the chromatic-fifths reordering
    expect(k2Leaf).toBe(((Math.floor((degree % 360) / 30) * 7) % 12) + 12 * sheet);
    await expect(
        chart.locator(`[data-testid="m3-dt-k2-leaf-${k2Leaf}"]`)
    ).toHaveAttribute('data-active', 'true');
    // exactly one K² leaf is active — a foliation has one live leaf, not many
    await expect(chart.locator('[data-testid^="m3-dt-k2-leaf-"][data-active="true"]')).toHaveCount(1);

    // T²_Mahāmāyā: live when the lens circle is on the wire; otherwise the
    // surface names the gap and marks NO crossing rather than defaulting to 0.
    const rawT2 = await torus(page).getAttribute('data-t2-leaf');
    const activeCrossing = await torus(page).getAttribute('data-active-crossing');
    if (rawT2) {
        const t2Leaf = Number(rawT2);
        expect(t2Leaf).toBeGreaterThanOrEqual(0);
        expect(t2Leaf).toBeLessThan(T2_LENS_LEAF_COUNT);
        await expect(
            chart.locator(`[data-testid="m3-dt-t2-leaf-${t2Leaf}"]`)
        ).toHaveAttribute('data-active', 'true');
        expect(activeCrossing).toBe(`${k2Leaf}x${t2Leaf}`);
        await expect(chart.getByTestId('m3-dt-active-crossing')).toBeVisible();
    } else {
        expect(activeCrossing, 'no lens circle ⇒ no crossing, never a default').toBe('');
        await expect(torus(page).getByTestId('m3-double-torus-pending')).toContainText(
            'lensMode.lens'
        );
        await expect(chart.getByTestId('m3-dt-active-crossing')).toHaveCount(0);
    }
});

test('51.T51.5: the 0-side dual rendering is present, and its two halves share one substrate', async ({
    page
}) => {
    test.setTimeout(180_000);
    await boot(page);
    await openDepthMode(page);

    const dual = torus(page).getByTestId('m3-double-torus-zero-side-dual');
    await expect(dual).toBeVisible();

    const structural = torus(page).getByTestId('m3-dt-zero-side-m0-structural-graph');
    const temporal = torus(page).getByTestId('m3-dt-zero-side-m3-temporal-wheel');
    await expect(structural).toContainText("M0'");
    await expect(structural).toContainText('structural');
    await expect(temporal).toContainText("M3-5'");
    await expect(temporal).toContainText('temporal');

    // §8.13: "both consume the same canonical Neo4j substrate" — the B-8
    // non-fork invariant, asserted as identity rather than as prose.
    const structuralLabel = await structural.getAttribute('data-substrate-label');
    const temporalLabel = await temporal.getAttribute('data-substrate-label');
    expect(structuralLabel).toBe(':Bimba');
    expect(temporalLabel).toBe(structuralLabel);
    expect(await structural.getAttribute('data-substrate-identity')).toBe('coordinate');
    expect(await temporal.getAttribute('data-substrate-identity')).toBe('coordinate');
});
