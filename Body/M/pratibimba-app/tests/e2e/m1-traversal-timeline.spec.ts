/**
 * Coordinate: M1' traversal timeline e2e (rerun 51.T51.3)
 * Actualises: the tranche's UF acceptance in a real browser against the real
 *   spawned gateway + live graph — "walks ≥2 relation steps and asserts the
 *   timeline records each tick with its position6/helix-face/degree720, and
 *   that a P5 → P0′ crossing is marked."
 *
 *   Both walks are driven, because M1' has two and canon names both: the
 *   COORDINATE walk (`walk-rel-*` against the live S2 topology — the
 *   `coordinate-render-live.spec.ts` idiom) supplies the relation movement,
 *   and the SPANDA walk (`m1.spanda.hold` → `walk_to` → `step`, real gateway
 *   acts) supplies the adjacent tick steps in which a crossing is observable
 *   at all. The Möbius return asserted here is one the transport really
 *   performed: 11 → 0, on a parked anchor, one step.
 * Does NOT own: the crossing law (`src/panes/m1Traversal/traversalTimeline.test.ts`),
 *   the coordinate walk (`coordinate-render-live.spec.ts`), the spanda
 *   transport (`spanda-navigator.spec.ts`), the graph.
 */

import { expect, test, type Page } from '@playwright/test';

async function boot(page: Page): Promise<void> {
    await page.goto('/');
    await expect(page.getByTestId('shell')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });
    await expect(page.getByTestId('status-tick')).toHaveText(/\d+/, { timeout: 20_000 });
}

function timeline(page: Page) {
    return page.locator('.face-active [data-testid="m1-traversal-timeline"]');
}

test('51.T51.3: the timeline records the walk as a trajectory, and marks the P5 → P0′ return', async ({
    page
}) => {
    test.setTimeout(300_000);
    await boot(page);

    // ── the cosmic face, where both M1' walk surfaces live ───────────────────
    await page.keyboard.press('Meta+.');
    await expect(page.getByTestId('shell')).toHaveAttribute('data-face', '0');

    // ── ≥2 real coordinate-relation steps against the live topology ─────────
    await page.locator('.face-active .flexlayout__tab_button', { hasText: 'Walk' }).click();
    const walk = page.locator('.face-active [data-testid="walk-pane"]');
    await expect(walk).toBeVisible({ timeout: 20_000 });
    await expect(walk.getByTestId('walk-node')).toContainText('M1', { timeout: 20_000 });

    const seed = walk.getByTestId('walk-seed');
    await seed.fill('M0-4');
    await seed.press('Enter');
    await expect(walk.getByTestId('walk-node')).toContainText('M0-4', { timeout: 20_000 });
    await expect(walk.getByTestId('walk-rel-M0-4.(0/1)')).toBeVisible({ timeout: 25_000 });
    await walk.getByTestId('walk-rel-M0-4.(0/1)').click();
    await expect(walk.getByTestId('walk-node')).toContainText('M0-4.(0/1)', { timeout: 20_000 });

    // ── the SPANDA walk: park the anchor, stand on 11, take one step ────────
    // A parked anchor is what makes an adjacent tick step observable; while the
    // transport FLOWS the 1 Hz heartbeat aliases the oscillator and no crossing
    // can honestly be claimed.
    await page.locator('.face-active .flexlayout__tab_button', { hasText: 'Spanda' }).click();
    const spanda = page.locator('.face-active [data-testid="spanda-navigator"]');
    await expect(spanda).toBeVisible({ timeout: 20_000 });
    await spanda.getByTestId('spanda-hold').click();
    await expect(spanda).toHaveAttribute('data-mode', /held|walking/, { timeout: 20_000 });

    await spanda.getByTestId('spanda-stop-11').click();
    await expect(spanda.getByTestId('spanda-readout')).toContainText('tick 11', { timeout: 20_000 });
    // The heartbeat must carry the parked anchor at 11 before the step, or the
    // ledger never sees the FROM side of the crossing.
    await page.waitForTimeout(2000);

    await spanda.getByTestId('spanda-step-forward').click();
    await expect(spanda.getByTestId('spanda-readout')).toContainText('tick 0', { timeout: 20_000 });
    await page.waitForTimeout(2000);

    // ── the timeline surface, opened AFTER all the walking ──────────────────
    // (the recorder is shell-level, so a path travelled while this tab did not
    // exist is still the path it shows — the whole point of 51.T51.3.)
    await page.keyboard.press('Meta+Shift+P');
    await page.getByTestId('palette-input').fill('traversal timeline');
    await page.getByTestId('palette-item-m1.open.traversalTimeline').click();
    await expect(page.getByTestId('shell')).toHaveAttribute('data-active-layout', 'ide-deep', {
        timeout: 30_000
    });
    await expect(timeline(page)).toBeVisible({ timeout: 30_000 });

    // ── the trajectory, not the latest sample ───────────────────────────────
    const sampleCount = Number(await timeline(page).getAttribute('data-sample-count'));
    expect(sampleCount, 'the trajectory must hold more than a single sample').toBeGreaterThan(3);
    const rows = timeline(page).locator('[data-testid^="m1-traversal-sample-"]');
    expect(await rows.count()).toBe(sampleCount);

    // Every recorded sample carries the specced fields, from live state.
    for (let i = 0; i < sampleCount; i += 1) {
        const row = rows.nth(i);
        const tick12 = Number(await row.getAttribute('data-tick12'));
        expect(tick12, `sample ${i} tick12`).toBeGreaterThanOrEqual(0);
        expect(tick12, `sample ${i} tick12`).toBeLessThanOrEqual(11);
        const position6 = Number(await row.getAttribute('data-position6'));
        expect(position6, `sample ${i} position6`).toBeGreaterThanOrEqual(0);
        expect(position6, `sample ${i} position6`).toBeLessThanOrEqual(5);
        expect(await row.getAttribute('data-helix-face'), `sample ${i} helix face`).toMatch(
            /^(bimba|pratibimba)$/
        );
        const degree720 = Number(await row.getAttribute('data-degree720'));
        expect(degree720, `sample ${i} degree720`).toBeGreaterThanOrEqual(0);
        expect(degree720, `sample ${i} degree720`).toBeLessThan(720);
        // the helix SHEET is the 0-5 / 6-11 half-turn the tick really sits on
        expect(await row.getAttribute('data-helix-sheet')).toBe(tick12 >= 6 ? '1' : '0');
    }

    // ── the relation movement of the coordinate walk in progress ────────────
    expect(
        Number(await timeline(page).getAttribute('data-relation-steps')),
        'the two real relation steps must appear as coordinate movement'
    ).toBeGreaterThanOrEqual(2);

    // ── the Möbius return: 11 → 0, walked, marked ───────────────────────────
    expect(
        Number(await timeline(page).getAttribute('data-walked-samples')),
        'the parked transport must have been recorded as walked'
    ).toBeGreaterThanOrEqual(2);
    expect(
        Number(await timeline(page).getAttribute('data-mobius-returns')),
        'the 11 → 0 step the transport really took must be marked'
    ).toBe(1);

    const marked = timeline(page).locator('[data-crossing="mobius-return"]');
    await expect(marked).toHaveCount(1);
    await expect(marked).toContainText('Möbius return P5 → P0′');
    await expect(marked).toHaveAttribute('data-tick12', '0');
    await expect(marked).toHaveAttribute('data-position6', '0');
    await expect(marked).toHaveAttribute('data-helix-sheet', '0');
    await expect(marked).toHaveAttribute('data-mode', /held|walking/);

    // ── release the organism ────────────────────────────────────────────────
    // The gateway is ONE transport shared by every spec in this suite; a spec
    // that parks the anchor and walks away leaves the next spec's organism
    // held (spanda-navigator.spec.ts opens asserting `flowing`).
    await page.locator('.face-active .flexlayout__tab_button', { hasText: 'Spanda' }).click();
    await spanda.getByTestId('spanda-release').click();
    await expect(spanda).toHaveAttribute('data-mode', 'flowing', { timeout: 20_000 });
});
