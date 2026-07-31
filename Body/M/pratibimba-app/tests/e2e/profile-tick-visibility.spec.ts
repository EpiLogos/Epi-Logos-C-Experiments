/**
 * Coordinate: M' shell (profile-tick visibility for new users — Track 32.T32.9).
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): real Chromium / spawned-gateway carrier proof
 * Actualises: the half of tranche 32.9 only a running shell against a real
 *   `epi gate start` can show. jsdom proves the readout law, the store gate and
 *   the hide (`src/ui/profileTickVisibility.test.tsx`) by PUBLISHING frames —
 *   which is a test standing in for the wire. What it cannot show is that the
 *   two numbers in the entry are different real quantities: that `gen` is the
 *   gateway process's own generation and `tick` is what THIS window has seen.
 *   A reload separates them — the window's count restarts at 1, the gateway's
 *   generation carries on — and that separation is the whole reason the tranche
 *   exists. A new user attaching to a gateway that has been up for ten minutes
 *   was previously shown `⟳ 600` and told it was a "tick".
 *
 *   The first-tick transition is SAMPLED, not polled-for. The birth of the clock
 *   lasts exactly one heartbeat (~1 s at the gateway's 1 Hz), so an assertion
 *   that waited on it could legitimately arrive after it had passed; a 50 ms
 *   in-page sampler records the real sequence of states instead and the
 *   assertion is made against what actually happened.
 * Public surface: Playwright acceptance for the 32.9 status-bar profile-tick.
 * Does NOT own: the clock (`src/state/stores.ts`), the readout law
 *   (`src/ui/profileTickVisibility.ts`), the Diagnostics tab contents (15.2).
 * Contract: rerun tranche [[32.T32.9]] · 15.6 clock · 15.10 status discipline.
 */

import { expect, test, type Page } from '@playwright/test';
import { PREFERENCE_KEYS } from '../../src/ui/preferences';
import { STATE_THREAD_COUNT, STATUS_STRIP_THREADS } from '../../src/ui/shellSlotPolicy';

const TICK_PREFERENCE = PREFERENCE_KEYS.profileTickVisible;

async function bootConnected(page: Page): Promise<void> {
    await page.goto('/');
    await expect(page.getByTestId('shell')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });
}

/** The entry's two numbers, read off the live DOM. */
async function reading(page: Page): Promise<{ tick: number; gen: number; state: string }> {
    const entry = page.getByTestId('status-tick');
    const text = (await entry.textContent()) ?? '';
    return {
        tick: Number(text.match(/tick:(\d+)/)?.[1] ?? Number.NaN),
        gen: Number(text.match(/gen:(\d+)/)?.[1] ?? Number.NaN),
        state: (await entry.getAttribute('data-tick-state')) ?? ''
    };
}

test('32.T32.9: the entry counts THIS window and reports the gateway generation, and they are not the same number', async ({
    page
}) => {
    await bootConnected(page);
    await expect.poll(async () => (await reading(page)).tick, { timeout: 20_000 }).toBeGreaterThan(0);

    const first = await reading(page);
    expect(Number.isFinite(first.gen), `entry shows no generation: ${JSON.stringify(first)}`).toBe(
        true
    );

    // both advance off the live heartbeat — a mounted mock moves neither
    await expect
        .poll(async () => (await reading(page)).tick, { timeout: 20_000 })
        .toBeGreaterThan(first.tick);
    const later = await reading(page);
    expect(later.gen).toBeGreaterThan(first.gen);
    // and they advance TOGETHER: one accepted frame is one observed tick
    expect(later.gen - first.gen).toBe(later.tick - first.tick);

    // the separation. A reload is a new window on the same gateway process: the
    // window's count restarts, the gateway's generation does not.
    await bootConnected(page);
    await expect.poll(async () => (await reading(page)).tick, { timeout: 20_000 }).toBeGreaterThan(0);
    const reloaded = await reading(page);
    expect(reloaded.tick).toBeLessThanOrEqual(later.tick);
    expect(
        reloaded.gen,
        'the kernel generation belongs to the gateway process and must survive a reload'
    ).toBeGreaterThanOrEqual(later.gen);
});

test('32.T32.9: the birth of the clock is visible — pre-tick shimmer, then "Profile-tick 1 — system alive."', async ({
    page
}) => {
    await page.goto('/');
    await expect(page.getByTestId('shell')).toBeVisible({ timeout: 20_000 });

    // sample the entry every 50ms until it settles, so a one-heartbeat state
    // cannot slip between assertions
    const observed = await page.evaluate(
        () =>
            new Promise<{ states: string[]; announcements: string[] }>(resolve => {
                const states: string[] = [];
                const announcements: string[] = [];
                const started = Date.now();
                const timer = setInterval(() => {
                    const entry = document.querySelector('[data-testid="status-tick"]');
                    const state = entry?.getAttribute('data-tick-state') ?? null;
                    if (state && states[states.length - 1] !== state) {
                        states.push(state);
                        const announcement = entry?.querySelector(
                            '[data-testid="status-tick-announcement"]'
                        );
                        if (announcement?.textContent) {
                            announcements.push(announcement.textContent);
                        }
                    }
                    if (states.includes('steady') || Date.now() - started > 25_000) {
                        clearInterval(timer);
                        resolve({ states, announcements });
                    }
                }, 50);
            })
    );

    // the shell paints the entry BEFORE the first frame — that is the state the
    // new-user problem lives in, and it says so rather than showing a number
    expect(observed.states[0]).toBe('pre-tick');
    expect(observed.states).toContain('first-tick');
    expect(observed.states[observed.states.length - 1]).toBe('steady');
    expect(observed.announcements).toContain('Profile-tick 1 — system alive.');
});

test('32.T32.9: clicking the entry opens Diagnostics ON the profile-tick history', async ({
    page
}) => {
    await bootConnected(page);
    await expect.poll(async () => (await reading(page)).tick, { timeout: 20_000 }).toBeGreaterThan(0);

    await page.getByTestId('status-tick-open-history').click();

    const body = page.getByTestId('diagnostics-body');
    await expect(body).toBeVisible({ timeout: 15_000 });
    // "focused on profile-tick history" — the fold's own profile sub-section,
    // not merely the Diagnostics tab on whatever it last showed
    await expect(body).toHaveAttribute('data-active-section', 'profile');
    await expect(page.getByTestId('matheme-profile-generation')).toBeVisible();
    await expect(page.getByTestId('profile-tick-subscription-state')).toBeVisible();

    // the history is real: it holds generations the live wire delivered
    await expect
        .poll(async () => page.getByTestId('matheme-generation-history-item').count(), {
            timeout: 20_000
        })
        .toBeGreaterThan(0);
});

test('32.T32.9: the Motion preference hides the ENTRY and never the contract', async ({ page }) => {
    await bootConnected(page);
    await expect(page.getByTestId('status-tick')).toHaveCount(1);
    expect(await page.locator('[data-testid="status-strip"] > span').count()).toBe(
        STATE_THREAD_COUNT
    );

    await page.locator('.face-active .flexlayout__border_button', { hasText: 'Settings' }).click();
    await expect(page.getByTestId('settings-pane')).toBeVisible({ timeout: 15_000 });
    await page.getByTestId('settings-nav-motion').click();

    // it is a working control in Motion, not the pending disclosure row it was
    const row = page.getByTestId(`settings-row-${TICK_PREFERENCE}`);
    await expect(row).toHaveAttribute('data-control', 'toggle');
    await expect(page.getByTestId(`settings-disclosure-${TICK_PREFERENCE}`)).toHaveCount(0);

    await page.getByTestId('settings-profile-tick-visible').click();

    // the entry stops painting IMMEDIATELY — the strip and the settings fold are
    // different subtrees, so a storage-only write would have left it standing
    await expect(page.getByTestId('status-tick')).toHaveCount(0);
    expect(await page.locator('[data-testid="status-strip"] > span').count()).toBe(
        STATE_THREAD_COUNT - 1
    );
    // 15.10: hidden is not removed. The other five threads are all still there,
    // and the contract still declares six.
    for (const thread of STATUS_STRIP_THREADS) {
        if (thread.testId === 'status-tick') continue;
        await expect(page.getByTestId(thread.testId)).toHaveCount(1);
    }
    expect(STATUS_STRIP_THREADS).toHaveLength(STATE_THREAD_COUNT);

    // the clock never stopped: the Diagnostics history kept filling while the
    // entry was hidden
    await page.getByTestId('settings-profile-tick-visible').click();
    await expect(page.getByTestId('status-tick')).toHaveCount(1);
    await expect.poll(async () => (await reading(page)).tick, { timeout: 20_000 }).toBeGreaterThan(1);

    // leave the shell on the shipped ground for the rest of the suite
    await page.evaluate(key => window.localStorage.removeItem(key), TICK_PREFERENCE);
});
