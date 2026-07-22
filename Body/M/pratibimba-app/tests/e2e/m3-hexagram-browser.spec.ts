/**
 * Coordinate: M' M3' (64-hexagram King Wen browser real-boot proof — 24.T24.5)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): #0 cosmic face, ide-deep M3 inspectors area.
 * Actualises: real Chromium proof over the spawned gateway (:18933) that the
 *   `M3HexagramBrowser` renders all 64 King Wen cells, lights the cell keyed to
 *   the LIVE bussed `mahamaya.hexagramId`, renders the active hexagram's 6-line
 *   glyph from the LIVE bussed `upperTrigram`/`lowerTrigram` (pure bit
 *   decomposition), and holds the 384-graph line-change DERIVED hexagram as
 *   HONEST-PENDING — never a fabricated local number.
 * Public surface: Playwright test over the spawned gateway.
 * Does NOT own: profile production, the King Wen→line-pattern table (kernel
 *   epi-lib m3 LUTs), the 384 line-change graph resolution, gateway I/O.
 * Contract: [[M3'-SPEC]] + rerun [[24-m3-mahamaya-frontend-deep]] 24.5.
 *
 * GROUND TRUTH (portal-core src/luts/mahamaya.rs): the live mahamaya slice
 *   busses hexagram_id = address64 = floor((degree360 % 360) * 64 / 360), so
 *   the bussed `hexagramId` domain is [0,63] (m3.h "hexagram 0-63"), with
 *   upper = address64>>3, lower = address64&7 → hexagramId === upper*8 + lower.
 *   The pane numbers its grid cells 1..64 and lights `kingWen === hexagramId`;
 *   therefore a cell lights only when hexagramId ∈ [1,63] (hexagramId 0 lights
 *   nothing; cell 64 is never lit). This test reads the LIVE value and asserts
 *   the honest domain + consistency — it hardcodes NO active hexagram.
 */

import { expect, Page, test } from '@playwright/test';

/** Dispatch the cross-layout intent that mounts the full M3 inspectors area
 *  (ide-deep). Mirrors the helper in m3-walk-navigator.spec.ts. */
async function dispatchM3Wheel(page: Page): Promise<void> {
    await page.evaluate(async () => {
        const registry = await import('/src/commands/registry.ts');
        const crossLayout = await import('/src/commands/crossLayoutIntent.ts');
        const stores = await import('/src/state/stores.ts');
        const privacyClass = stores.useSessionStore.getState().privacyClass;
        await registry.commands.execute(crossLayout.CROSS_LAYOUT_INTENT_COMMAND, {
            coordinate: stores.useCoordinateStore.getState().selected,
            artifactUri: null,
            reviewId: null,
            dayNow: stores.useSessionStore.getState().dayNow,
            sessionKey: stores.useSessionStore.getState().sessionKey,
            profileGeneration: stores.useTickStore.getState().generation,
            privacyClass:
                privacyClass === 'public' || privacyClass === 'protected' || privacyClass === 'private'
                    ? privacyClass
                    : null,
            requestedExtensionId: 'm3-mahamaya',
            requestedContributionId: 'wheel'
        });
    });
}

/** One ATOMIC read of the browser's live state — every field comes from the
 *  same synchronous DOM pass, so header/glyph/cells/active-hexagram cannot
 *  drift across the ~1 Hz profile tick that re-derives them together. */
interface BrowserSnapshot {
    present: boolean;
    state: string | null;
    activeHexRaw: string | null;
    litKingWen: number[];
    cellCount: number;
    headerText: string;
    lineSolids: (string | null)[];
    lineChanging: (string | null)[];
    slotsPendingText: string;
    slotsPendingBadgeTitle: string | null;
}

async function readSnapshot(page: Page): Promise<BrowserSnapshot> {
    return page.evaluate(() => {
        const empty = {
            present: false,
            state: null as string | null,
            activeHexRaw: null as string | null,
            litKingWen: [] as number[],
            cellCount: 0,
            headerText: '',
            lineSolids: [null, null, null, null, null, null] as (string | null)[],
            lineChanging: [null, null, null, null, null, null] as (string | null)[],
            slotsPendingText: '',
            slotsPendingBadgeTitle: null as string | null
        };
        const browser = document.querySelector(
            '.face-active [data-testid="m3-inspectors"] [data-testid="m3-hexagram-browser"]'
        );
        if (!browser) {
            return empty;
        }
        const cells = Array.from(
            browser.querySelectorAll('[data-testid^="m3-hexagram-cell-"]')
        );
        const litKingWen = cells
            .filter(c => c.getAttribute('data-active') === 'true')
            .map(c => Number((c.getAttribute('data-testid') ?? '').replace('m3-hexagram-cell-', '')));
        const header = browser.querySelector('[data-testid="m3-hexagram-active"] h4');
        const lineSolids = [0, 1, 2, 3, 4, 5].map(i => {
            const el = browser.querySelector(`[data-testid="m3-hexagram-line-${i}"]`);
            return el ? el.getAttribute('data-solid') : null;
        });
        const lineChanging = [0, 1, 2, 3, 4, 5].map(i => {
            const el = browser.querySelector(`[data-testid="m3-hexagram-line-${i}"]`);
            return el ? el.getAttribute('data-changing') : null;
        });
        const slots = browser.querySelector('[data-testid="m3-hexagram-slots-pending"]');
        const slotsBadge = slots?.querySelector('[data-testid="provenance-pending"]') ?? null;
        return {
            present: true,
            state: browser.getAttribute('data-state'),
            activeHexRaw: browser.getAttribute('data-active-hexagram'),
            litKingWen,
            cellCount: cells.length,
            headerText: header?.textContent ?? '',
            lineSolids,
            lineChanging,
            slotsPendingText: slots?.textContent ?? '',
            slotsPendingBadgeTitle: slotsBadge?.getAttribute('title') ?? null
        };
    });
}

test('24.T24.5: 64-hexagram browser lights the live King Wen cell, renders the bussed glyph, holds derived honest-pending', async ({
    page
}, testInfo) => {
    await page.goto('/');
    const shell = page.getByTestId('shell');
    await expect(shell).toBeVisible();
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });
    await expect(page.getByTestId('status-tick')).toHaveText(/\d+/, { timeout: 20_000 });

    await page.keyboard.press('Meta+.');
    await expect(shell).toHaveAttribute('data-face', '0');

    await dispatchM3Wheel(page);
    await expect(shell).toHaveAttribute('data-active-layout', 'ide-deep');

    const inspectors = page.locator('.face-active [data-testid="m3-inspectors"]');
    await expect(inspectors).toBeVisible();

    // The browser is a summonable surface — mount it via its toggle chip.
    await inspectors.getByTestId('m3-summon-hexagram-browser').click();
    const browser = inspectors.getByTestId('m3-hexagram-browser');
    await expect(browser).toBeVisible();

    // ── (a) The live gateway busses mahamaya.hexagramId every tick, so the
    //        browser reaches READY (not pending-mahamaya) with a real active
    //        hexagram keyed to a cell in [1,63]. Capture ONE atomic snapshot in
    //        that state — the ~1 Hz tick re-derives header/glyph/cells together,
    //        so every field of the captured snapshot is mutually consistent.
    let snap!: BrowserSnapshot;
    await expect(async () => {
        snap = await readSnapshot(page);
        expect(snap.present).toBe(true);
        // Prefer the READY branch (the gateway busses hexagramId live). If the
        // harness ever booted without a mahamaya projection the pane would show
        // data-state="pending-mahamaya"; requiring ready here fails loud rather
        // than silently passing a pending UI.
        expect(snap.state).toBe('ready');
        const activeHex = Number(snap.activeHexRaw);
        // Honest live domain is [0,63] (address64); gate on a CELL-representable
        // value [1,63] so we observe REAL cell lighting. We never assert a
        // specific hexagram — only whatever the live bus carries this tick.
        expect(Number.isInteger(activeHex)).toBe(true);
        expect(activeHex).toBeGreaterThanOrEqual(1);
        expect(activeHex).toBeLessThanOrEqual(63);
    }).toPass({ timeout: 30_000 });

    const activeHex = Number(snap.activeHexRaw);

    // (a.1) All 64 King Wen cells render.
    expect(snap.cellCount).toBe(64);
    await expect(browser.getByTestId(/^m3-hexagram-cell-\d+$/)).toHaveCount(64);
    await expect(browser.getByTestId('m3-hexagram-cell-1')).toBeVisible();
    await expect(browser.getByTestId('m3-hexagram-cell-64')).toBeVisible();

    // (a.2) Exactly the live active hexagram's cell is lit — one cell, and it is
    //        cell `activeHex`. No fabricated / hardcoded guess: activeHex is
    //        whatever the live gateway bussed this tick.
    expect(snap.litKingWen).toEqual([activeHex]);

    // (a.3) The honest domain contract: bussed hexagramId is in [0,63]
    //        (m3.h "hexagram 0-63" — address64), NOT King Wen 1..64. We assert
    //        the full domain bound so a producer regression outside it fails.
    expect(activeHex).toBeGreaterThanOrEqual(0);
    expect(activeHex).toBeLessThanOrEqual(63);

    // ── (b) The active glyph's 6 lines render EXACTLY the bit decomposition of
    //        the live bussed upper/lower trigrams. Producer law:
    //        upper = hexagramId>>3, lower = hexagramId&7; glyph is
    //        [lower bit0,1,2 | upper bit0,1,2] bottom-to-top (line index 0..5),
    //        solid iff bit === 1. We parse the header's own upper/lower and
    //        cross-check both against hexagramId and against the rendered lines.
    const headerMatch = snap.headerText.match(/upper\s+(\d+)\s*\/\s*lower\s+(\d+)/);
    expect(headerMatch).not.toBeNull();
    const upper = Number(headerMatch![1]);
    const lower = Number(headerMatch![2]);
    // Trigram values are 0..7 and recompose the hexagram address exactly.
    expect(upper).toBeGreaterThanOrEqual(0);
    expect(upper).toBeLessThanOrEqual(7);
    expect(lower).toBeGreaterThanOrEqual(0);
    expect(lower).toBeLessThanOrEqual(7);
    expect(upper * 8 + lower).toBe(activeHex);

    // Six line elements, each solid/broken matching the live bit pattern.
    const expectedSolids = [
        (lower >> 0) & 1,
        (lower >> 1) & 1,
        (lower >> 2) & 1,
        (upper >> 0) & 1,
        (upper >> 1) & 1,
        (upper >> 2) & 1
    ].map(bit => (bit === 1 ? 'true' : 'false'));
    expect(snap.lineSolids).toEqual(expectedSolids);

    // The non-active cells honestly declare their line pattern kernel-owned.
    expect(snap.slotsPendingText).toContain('pending-king-wen-line-pattern');
    expect(snap.slotsPendingBadgeTitle).toBe('pending-king-wen-line-pattern');

    // No changing lines yet → no derived panel yet.
    expect(snap.lineChanging).toEqual(['false', 'false', 'false', 'false', 'false', 'false']);
    await expect(browser.getByTestId('m3-hexagram-derived-pending')).toHaveCount(0);

    // ── (c) Toggling a changing line flips that line and surfaces the derived
    //        (384-graph) hexagram as HONEST-PENDING — never a fabricated local
    //        number. NOTE: the pane resets the changing set whenever the live
    //        hexagramId ticks over, so we drive the toggle + honesty read inside
    //        a single retrying block; each iteration re-toggles if a tick reset
    //        it, then reads the derived panel atomically.
    const line2 = browser.getByTestId('m3-hexagram-line-2');
    await expect(async () => {
        if ((await line2.getAttribute('data-changing')) !== 'true') {
            await line2.click();
        }
        // Read the derived panel + the flipped line + the live header trigrams
        // in ONE synchronous pass, so the flip check compares against THIS
        // tick's base bit (not a stale snapshot from a different hexagram).
        const derived = await browser.evaluate(el => {
            const line = el.querySelector('[data-testid="m3-hexagram-line-2"]');
            const panel = el.querySelector('[data-testid="m3-hexagram-derived-pending"]');
            const badge = panel?.querySelector('[data-testid="provenance-pending"]') ?? null;
            const header = el.querySelector('[data-testid="m3-hexagram-active"] h4');
            return {
                changing: line?.getAttribute('data-changing') ?? null,
                solid: line?.getAttribute('data-solid') ?? null,
                text: panel ? panel.textContent ?? '' : null,
                badgeTitle: badge?.getAttribute('title') ?? null,
                headerText: header?.textContent ?? ''
            };
        });
        // The clicked line is now marked changing.
        expect(derived.changing).toBe('true');
        // The glyph actually flipped: line index 2 is lower-trigram bit 2, so
        // its base bit is (lower>>2)&1; while changing it must render base^1.
        const hm = derived.headerText.match(/lower\s+(\d+)/);
        expect(hm).not.toBeNull();
        const baseBitLine2 = (Number(hm![1]) >> 2) & 1;
        expect(derived.solid).toBe(baseBitLine2 === 1 ? 'false' : 'true');
        // The derived panel exists and is provenance-pending on the 384 graph.
        expect(derived.text).not.toBeNull();
        expect(derived.badgeTitle).toBe('pending-line-change-graph');
        expect(derived.text!).toContain('pending-line-change-graph');
        // HONESTY: the slot after "derived hexagramId:" is the pending token,
        // NOT a resolved number — the 384 line-change graph is kernel-owned.
        expect(derived.text!).toMatch(/derived hexagramId:\s*pending-line-change-graph/);
        expect(derived.text!).not.toMatch(/derived hexagramId:\s*\d/);
    }).toPass({ timeout: 30_000 });

    const screenshot = testInfo.outputPath('m3-hexagram-browser.png');
    await page.screenshot({ path: screenshot });
    await testInfo.attach('m3-hexagram-browser', { path: screenshot, contentType: 'image/png' });
});
