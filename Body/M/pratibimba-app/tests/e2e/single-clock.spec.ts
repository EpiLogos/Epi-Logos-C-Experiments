/**
 * Coordinate: M' composition (drivable-loop single-clock proof, 29.T29.4)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): #4 — composition clock UI-flow gate
 * Actualises: the single-clock invariant (DR-WC-IP-4, 15-foundation principle
 *   2) as a BEHAVIOUR in the real app: both composition roots read one profile
 *   subscription, so both agree with the status strip's tick and advance with
 *   it. The lint (`scripts/lint-single-clock.mjs`) proves no second clock can
 *   be opened; this proves the one clock actually drives both faces. Track 29
 *   is UF class — a jsdom mount never opens the app.
 * Public surface: Playwright test over status-tick / personal-recognition-engine
 *   data-generation / engine-generation.
 * Does NOT own: the tick store law (src/state/stores.ts), the subscription
 *   seam (src/composition/profileTickSubscription.ts), the React fan-out
 *   (src/composition/compositionProfileContext.tsx), or either composition.
 * Contract: [[M'-SYSTEM-SPEC]] + rerun [[29-integrated-plugins-composition-deep]]
 *   T29.4 (DR-WC-IP-4, ROUTED).
 */

import { expect, test, type Page } from '@playwright/test';

/**
 * The status strip's GENERATION — the shell's view of the one clock.
 *
 * 32.T32.9 gave the entry two numbers (`tick:n gen:g`: advances this window has
 * observed, and the kernel generation), so the generation is read by NAME.
 * Stripping every non-digit used to be equivalent while the entry printed one
 * number; against two it CONCATENATES them (`tick:5 gen:419` → 5419) and the
 * agreement poll below could never succeed.
 */
async function statusTick(page: Page): Promise<number> {
    const text = (await page.getByTestId('status-tick').textContent()) ?? '';
    const match = text.match(/gen:(\d+)/);
    return match ? Number(match[1]) : -1;
}

async function bootConnected(page: Page): Promise<void> {
    await page.goto('/');
    await expect(page.getByTestId('shell')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('status-gateway')).toContainText('connected', {
        timeout: 20_000
    });
}

async function landOnFace(page: Page, face: '0' | '1'): Promise<void> {
    const shell = page.getByTestId('shell');
    if ((await shell.getAttribute('data-face')) !== face) {
        await page.keyboard.press('Meta+.');
    }
    await expect(shell).toHaveAttribute('data-face', face, { timeout: 20_000 });
}

test('one profile subscription drives both compositions in the live app (29.T29.4)', async ({
    page
}) => {
    await bootConnected(page);

    // ── the personal composition reads the one clock ──────────────────────
    await landOnFace(page, '1');
    const nowTab = page.locator('.face-active .flexlayout__tab_button', { hasText: 'Now' }).first();
    await expect(nowTab).toBeVisible({ timeout: 20_000 });
    await nowTab.click();

    const personal = page.getByTestId('personal-recognition-engine');
    await expect(personal).toBeVisible({ timeout: 20_000 });
    // Wait for a real tick to land rather than asserting against 'none'.
    await expect(personal).toHaveAttribute('data-generation', /^\d+$/, { timeout: 30_000 });

    // The surface's generation IS the shell's generation. Asserting a numeric
    // tolerance between two non-atomic reads of a live clock is a guess about
    // how fast the machine is — the first cut used ±1 and saw 2 under
    // full-suite load. Poll for AGREEMENT instead: two readings of one clock
    // must coincide on some observation, and two independent clocks never
    // would. Load only changes how many observations it takes.
    await expect
        .poll(
            async () => {
                const surface = Number(await personal.getAttribute('data-generation'));
                return surface === (await statusTick(page));
            },
            { timeout: 20_000 }
        )
        .toBe(true);
    const personalGeneration = Number(await personal.getAttribute('data-generation'));

    // …and it ADVANCES with the clock rather than holding a first frame.
    await expect
        .poll(async () => Number(await personal.getAttribute('data-generation')), {
            timeout: 30_000
        })
        .toBeGreaterThan(personalGeneration);

    // ── the cosmic composition reads the SAME clock ───────────────────────
    await landOnFace(page, '0');
    const cosmicGenerationEl = page.locator('.face-active [data-testid="engine-generation"]').first();
    await expect(cosmicGenerationEl).toBeVisible({ timeout: 20_000 });
    await expect(cosmicGenerationEl).toHaveText(/\d+/, { timeout: 30_000 });

    await expect
        .poll(
            async () => {
                const shown = Number(((await cosmicGenerationEl.textContent()) ?? '').replace(/[^0-9]/g, ''));
                return shown === (await statusTick(page));
            },
            { timeout: 20_000 }
        )
        .toBe(true);
    const cosmicGeneration = Number(((await cosmicGenerationEl.textContent()) ?? '').replace(/[^0-9]/g, ''));

    // Both compositions passed the same test against the same strip, and the
    // cosmic generation is at or beyond where the personal face had reached —
    // one monotonic clock, not two independent ones.
    expect(cosmicGeneration).toBeGreaterThanOrEqual(personalGeneration);
});
