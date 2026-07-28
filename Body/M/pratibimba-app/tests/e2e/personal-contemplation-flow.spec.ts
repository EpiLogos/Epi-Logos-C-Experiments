/**
 * Coordinate: M' 4-5-0 (contemplation flow UI-flow proof, 29.T29.9)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): #5 — the contemplation read across the personal composition
 * Actualises: the 4'-5'-0' contemplation directive resolving at the REAL
 *   mounted engine root against a spawned gateway. Track 29 is UF class, and
 *   the thing a jsdom mount cannot show is that the composition really asks the
 *   live gateway for the latest close and reports what came back — including
 *   reporting honestly when nothing has been closed yet.
 * Public surface: Playwright test for the personal-recognition-engine
 *   contemplation data attributes.
 * Does NOT own: the directive itself (`engine/contemplationFlowDirector.ts`),
 *   the persisted-projection reader (`panes/m4SessionCloseCeremony.ts`), or the
 *   three slot renderers.
 * Contract: [[M'-SYSTEM-SPEC]] + rerun [[29-integrated-plugins-composition-deep]]
 *   T29.9 (closes the 19.6 / 19.7 composition path).
 */

import { expect, test } from '@playwright/test';

/** The six spec-ahead asks 29.9 names rather than renders. */
const UNAVAILABLE = [
    'wisdom-delta-byte-tape',
    'gauge-trio-coverage-fractions',
    'four-charge-balance',
    'resonance-72-overlay',
    'mobius-quaternion-arrow',
    'canvas-inscription-write'
].join(',');

test('the personal composition reports its contemplation reading honestly in the live app (29.T29.9)', async ({
    page
}) => {
    await page.goto('/');
    await expect(page.getByTestId('shell')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('status-gateway')).toContainText('connected', {
        timeout: 20_000
    });

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

    // The directive resolved on the live surface. `blocked` is deliberately NOT
    // accepted: it means the carrier's reader refused what the gateway returned,
    // and letting it pass here is how a parse regression would hide behind a
    // green test. A vault with no close reads `awaiting-close`.
    const state = await engine.getAttribute('data-contemplation-state');
    expect(
        ['ready', 'awaiting-close'],
        `contemplation directive refused the live read: ${await engine.getAttribute('title')}`
    ).toContain(state);

    // Whatever the state, the six spec-ahead asks with no wire source are NAMED
    // on the surface rather than rendered as empty readings. This is the whole
    // honesty claim of the tranche and it must survive into the real DOM.
    await expect(engine).toHaveAttribute('data-contemplation-unavailable', UNAVAILABLE);

    if (state === 'ready') {
        // A close exists: all three geometric slots carry their reading, and
        // the source says which wire served it.
        await expect(engine).toHaveAttribute('data-contemplation-slots', "4',5',0'");
        const source = await engine.getAttribute('data-contemplation-source');
        expect(['live', 'persisted']).toContain(source);
        // Lamps are a count of witnessed virtues out of the nine.
        const lamps = Number(await engine.getAttribute('data-contemplation-lamps'));
        expect(Number.isInteger(lamps)).toBe(true);
        expect(lamps).toBeGreaterThanOrEqual(0);
        expect(lamps).toBeLessThanOrEqual(9);
        if (source === 'persisted') {
            // The persisted projection cannot serve these five; the surface
            // says so instead of showing them as absent.
            await expect(engine).toHaveAttribute(
                'data-contemplation-live-only',
                'wisdom-delta,recognition-state,loaded-agents,unsatisfied-constraints,symbolic-round-trips'
            );
        }
    } else {
        // No close in this vault. The honest reading is an empty one: no slot
        // claims to have landed, no lamp is lit, and no source is named. The
        // hover says so in words rather than leaving a blank surface.
        await expect(engine).toHaveAttribute('data-contemplation-slots', '');
        await expect(engine).toHaveAttribute('data-contemplation-lamps', '0');
        await expect(engine).toHaveAttribute('data-contemplation-source', 'none');
        await expect(engine).toHaveAttribute('title', 'no session close has been contemplated yet');
    }

    // The 0'/UNDER-LAYER carrier the directive feeds is really on this face.
    await expect(page.getByTestId('m0-virtue-witness-panel')).toBeVisible({ timeout: 20_000 });
});
