/**
 * Coordinate: M' shared chrome (command routing + catalog validation - 31.T31.13 / 31.T31.2 / 31.T31.3)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): real Chromium / gateway carrier proof
 * Actualises: the global command palette and its command registry route
 *   keyboard input to the live shell without a separate chrome adapter
 *   (31.T31.13), that every command the running shell exposes in the
 *   palette is catalogued — no orphan in the live UI (31.T31.2), AND the two
 *   remaining 31.T31.3 chord families — cmd-shift-{0..5} Mn family-root nav
 *   (CCT-3) and the cmd-H two-stroke user-highlight prefix (CCT-5).
 * Public surface: Playwright chrome-command routing + catalog acceptance tests.
 * BOOT BUDGET (added while closing 25.T25.21): every test here asserts the
 *   shell is visible before it asserts anything about commands. That assertion
 *   ran on the 10s project default while the gateway check beside it got 20s,
 *   so under full-suite load first paint crossed it and this file reported RED
 *   at BOOT, having tested nothing — while passing 4/4 in isolation. Same
 *   remedy already applied at `visual-regression.spec.ts:164`. The sweep has
 *   since been completed on the Architect's instruction: all 41 specs carrying
 *   the bare `toBeVisible()` on the boot element now use the same boot-sized
 *   budget, so a slow first paint under load can no longer report RED from a
 *   spec that has asserted nothing yet.
 * Does NOT own: command semantics, command registration, or face state.
 * Contract: [[CHROME-CONTRACT]] sections 2, 10, and 11.
 */

import { expect, test } from '@playwright/test';
import { COMMAND_CATALOG } from '../../src/commands/catalog';

const CATALOG_IDS = new Set(COMMAND_CATALOG.map(command => command.id));

test('31.T31.13: palette and shortcut execute the live face-toggle command', async ({ page }) => {
    await page.goto('/');
    const shell = page.getByTestId('shell');
    await expect(shell).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });

    const initialFace = await shell.getAttribute('data-face');
    expect(initialFace === '0' || initialFace === '1').toBe(true);

    await page.keyboard.press('Meta+Shift+P');
    await expect(page.getByTestId('command-palette')).toBeVisible();
    const input = page.getByTestId('palette-input');
    await input.fill('toggle 0/1');
    await expect(page.getByTestId('palette-item-face.toggle')).toBeVisible();
    await input.press('Enter');
    await expect(page.getByTestId('command-palette')).toHaveCount(0);
    await expect(shell).toHaveAttribute('data-face', initialFace === '0' ? '1' : '0');

    await page.keyboard.press('Meta+.');
    await expect(shell).toHaveAttribute('data-face', initialFace);
});

test('31.T31.2: the live command palette lists only catalogued commands (no orphan in the UI)', async ({
    page
}) => {
    await page.goto('/');
    const shell = page.getByTestId('shell');
    await expect(shell).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });

    await page.keyboard.press('Meta+Shift+P');
    await expect(page.getByTestId('command-palette')).toBeVisible();

    // Read every command the running shell actually exposes in the palette.
    const items = page.locator('[data-testid^="palette-item-"]');
    await expect(items.first()).toBeVisible();
    const liveIds = (
        await items.evaluateAll(nodes => nodes.map(node => node.getAttribute('data-testid') ?? ''))
    ).map(testid => testid.replace(/^palette-item-/, ''));

    // sanity: the palette really populated from the live registry
    expect(liveIds.length).toBeGreaterThanOrEqual(15);
    expect(liveIds).toContain('face.toggle');
    expect(liveIds).toContain('engine.pauseToggle');

    // no orphan in the live UI — every palette command is in COMMAND_CATALOG
    const orphans = liveIds.filter(id => !CATALOG_IDS.has(id));
    expect(orphans, 'live palette commands missing from COMMAND_CATALOG').toEqual([]);
});

test('31.T31.3 (CCT-3): cmd-shift-{0..5} moves the observable active-coordinate readout to Mn', async ({
    page
}) => {
    await page.goto('/');
    const shell = page.getByTestId('shell');
    await expect(shell).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });

    // keep focus off any editable so the chords route to the shell spine
    await page.getByTestId('status-strip').click();
    const initialFace = await shell.getAttribute('data-face');
    const readout = page.getByTestId('active-coordinate');

    // Shift+digit yields a symbol in evt.key, so the chord reads evt.code —
    // press the physical DigitN key with Meta+Shift and assert the readout.
    for (let n = 0; n <= 5; n += 1) {
        await page.keyboard.press(`Meta+Shift+Digit${n}`);
        await expect(readout).toHaveText(`M${n}`);
    }

    // family-root select is a pure coordinate move — the face never toggled
    await expect(shell).toHaveAttribute('data-face', initialFace ?? '1');
});

test('31.T31.3 (CCT-5): cmd-H arms and the next user-side letter fires that highlight category', async ({
    page
}) => {
    await page.goto('/');
    const shell = page.getByTestId('shell');
    await expect(shell).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });

    // capture the user-highlight intents the live shell dispatches
    await page.evaluate(() => {
        (window as unknown as { __naraHighlightFired: string[] }).__naraHighlightFired = [];
        window.addEventListener('m4.nara.user-highlight', event => {
            (window as unknown as { __naraHighlightFired: string[] }).__naraHighlightFired.push(
                (event as CustomEvent<{ category: string }>).detail.category
            );
        });
    });

    // focus a neutral, non-editable surface so cmd-H is not guarded out
    await page.getByTestId('status-strip').click();

    // cmd-H arms the prefix; 'o' fires the oracle user-side category
    // (Cmd+H is an OS "hide" on headed macOS — headless Chromium delivers it
    // to the page, where the spine preventDefaults and consumes the chord).
    await page.keyboard.press('Meta+h');
    await page.keyboard.press('o');
    await expect
        .poll(() =>
            page.evaluate(
                () => (window as unknown as { __naraHighlightFired: string[] }).__naraHighlightFired
            )
        )
        .toContain('oracle');

    // a matching letter with no armed prefix must NOT fire (single-shot chord)
    await page.keyboard.press('d');
    const fired = await page.evaluate(
        () => (window as unknown as { __naraHighlightFired: string[] }).__naraHighlightFired
    );
    expect(fired).toEqual(['oracle']);
});
