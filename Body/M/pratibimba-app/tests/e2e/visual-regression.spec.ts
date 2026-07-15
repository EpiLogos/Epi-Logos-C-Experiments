/**
 * Coordinate: M' (drivable-loop spec: 15.T15.12 visual-regression harness)
 * Actualises: the 0/1 toggle + tick-choreography visual-regression suite on
 *   the rerun carrier (fate: face-gap per DR-FACE-7 — no visual-regression
 *   harness existed on the carrier; the frozen epi-theia `acceptance-harness`
 *   is dead plumbing, this suite is its carrier equivalent). Four coverages:
 *     (a) the 0/1 lemniscate face-toggle transition (15.5 / DR-UI-4),
 *     (b) the tick choreography across the engine matrices (15.9),
 *     (c) the integrated 1-2-3 cosmic composition (15.4 + 07),
 *     (d) the integrated 4-5-0 personal composition (15.4 + 08 — honest
 *         current surface; see GAP note on the test).
 *
 * DETERMINISM DESIGN (the actual problem this suite solves):
 *   - The engine's own §8.8 pause/scrub (720-tick ring; `engine.*` commands
 *     via the space / arrow keys — the accessibility surface) freezes the
 *     choreography at a settled frac before any cosmic capture: while paused,
 *     deriveKlein pins foldProgress and resonancePulse is gated on
 *     `oscillator.live`, so the WebGL frame is pixel-static under swiftshader
 *     (playwright.config launchOptions). Keyboard, not mouse: the engine
 *     strip's live readouts reflow at 1 Hz, so a mouse click can land between
 *     a shifted button's mousedown/mouseup and dissolve into the strip DIV
 *     (verified empirically; named as a target-stability finding in the
 *     track-15 write-back).
 *   - Two capture classes, honestly separated:
 *     1. COMMITTED BASELINES (`tests/e2e/fixtures/visual-regression/`) cover
 *        composition CHROME — tabstrips, borders, splitters, pane frames —
 *        with every live-profile-coupled REGION hidden at capture time as a
 *        whole row/panel (all canvas hosts, the engine strip, the status
 *        strip, the vault tree, the now-pane) via `stylePath`
 *        (visual-regression.hide.css: visibility:hidden preserves layout
 *        boxes; mask BOXES were abandoned after a 1px bounding-box-rounding
 *        sliver let live canvas pixels escape at the pane edge). Whole rows,
 *        not single spans: the kernel readouts change text WIDTH every tick,
 *        which shifts siblings in the flex row. The kernel tick content
 *        (tick12, degree720, kairos sky) is REAL and differs across
 *        runs/days by design — committing raw canvas pixels would be a
 *        fraudulent baseline, so those regions are hidden here and proven by
 *        class 2 instead. Hidden-region control inventories are asserted
 *        textually beside the pixel shot.
 *     2. IN-RUN FROZEN-TICK PROOFS: raw canvas captures compared within the
 *        run — pause ⇒ pixel-static across ≥1 live tick; scrub step-back ⇒
 *        different ring record ⇒ visibly different pixels; step-forward back
 *        to the same record ⇒ pixel-static again; resume ⇒ pixels flow. This
 *        is the tick-choreography determinism law, frame-by-frame over the
 *        scrub ring. NOT byte equality, by design: the 4.3 clock-field
 *        overlay is a live-bus WINDOW drawn into the same scene (it rides
 *        `cached.profile`, not the engine frame — pause freezes choreography,
 *        never the bus), and its kairos-degree chords jitter sub-pixel every
 *        generation. A pixel-ratio comparator with a measured noise floor is
 *        the honest assertion.
 *   - DIFF THRESHOLDS (documented; also in playwright.config.ts and the
 *     track-15 write-back):
 *     · committed baselines: per-pixel threshold 0.2 (default YIQ) absorbs
 *       antialias jitter; maxDiffPixels 400 ≈ 0.04% of the fixed 1280×800
 *       viewport — measured cross-run drift on the masked compositions is
 *       0 px on this darwin/swiftshader rig, so 400 is headroom, while the
 *       smallest guarded chrome unit (a border tab / tabstrip button ≥
 *       ~1200 px) cannot hide inside it.
 *     · in-run canvas proofs: FROZEN_MAX_RATIO 0.002 / STEPPED_MIN_RATIO
 *       0.004 (fraction of pixels with any channel delta > 8). Measured on
 *       this rig: frozen pairs 0.00018 (the clock-field window's sub-pixel
 *       breath), adjacent-record step 0.00956 (~50× the floor), return-to-
 *       record 0.00018, resumed ~1.0 — the thresholds sit an order of
 *       magnitude clear on both sides.
 *   - Mid-transition capture: the toggle transition is slowed via an
 *     injected !important duration override, then every `.face-slot`
 *     animation is paused at the SAME fraction (0.5) through WAAPI — same
 *     easing curve, same fraction ⇒ the same visual as 200ms into the real
 *     400ms crossing, without racing a 400ms window.
 *   - SUITE-ORDER STATE (close-gate finding, 2026-07-12): the e2e harness
 *     shares ONE sidecar vault per run, and earlier specs anchor today's day
 *     (journal/day-calendar/integrated-loop `beginToday`), so the personal
 *     face boots ANCHORED in suite order and PRISTINE in isolation. Layout /
 *     tab persistence is NOT a coupling channel here — the sidecar pins
 *     `ui_state_load → null` ("deterministic boots") — but the vault is.
 *     This spec therefore anchors the day itself (`ensureDayAnchored`, the
 *     journal.spec house idiom over the idempotent `begin_today`) so the
 *     personal surface is the SAME state in both orders, masks the now-pane
 *     BODY as lived-vault content (same law as the vault tree), and pins the
 *     target tab explicitly (`ensureTabSelected`) so a future persisted-
 *     layout channel cannot silently rot the captures.
 * Does NOT own: the transition law itself (15.5/DR-UI-4, src/styles.css),
 *   the engine pause/scrub law (src/engine/modulation/engine.ts), the
 *   compositions (App.tsx). FINDING (not fixed here — src/** out of scope):
 *   DR-UI-4 ratifies "lemniscate 0/1 400ms cubic-out"; styles.css carries
 *   `transition: opacity 400ms ease` — duration conforms, easing is `ease`,
 *   not cubic-out. Flagged in the track-15 write-back.
 */

import { fileURLToPath } from 'node:url';
import { expect, Locator, Page, test } from '@playwright/test';
import { todayId } from './e2e-env';

// Fixed viewport: baselines are geometry-coupled; never inherit a default.
test.use({ viewport: { width: 1280, height: 800 } });

/** In-run canvas comparator thresholds — measured floors in the header. */
const FROZEN_MAX_RATIO = 0.002;
const STEPPED_MIN_RATIO = 0.004;

/** Fraction of pixels whose any RGB channel differs by > 8/255 between two
 *  PNG captures — decoded in the live Chromium itself (no node-side PNG
 *  dependency). Alpha ignored: element captures are opaque. */
async function diffRatio(page: Page, a: Buffer, b: Buffer): Promise<number> {
    return page.evaluate(
        async ([b64a, b64b]) => {
            const load = (b64: string) =>
                new Promise<HTMLImageElement>((res, rej) => {
                    const img = new Image();
                    img.onload = () => res(img);
                    img.onerror = rej;
                    img.src = `data:image/png;base64,${b64}`;
                });
            const [ia, ib] = await Promise.all([load(b64a), load(b64b)]);
            if (ia.width !== ib.width || ia.height !== ib.height) {
                return 1;
            }
            const cnv = document.createElement('canvas');
            cnv.width = ia.width;
            cnv.height = ia.height;
            const ctx = cnv.getContext('2d', { willReadFrequently: true });
            if (!ctx) {
                return 1;
            }
            ctx.drawImage(ia, 0, 0);
            const da = ctx.getImageData(0, 0, cnv.width, cnv.height).data;
            ctx.clearRect(0, 0, cnv.width, cnv.height);
            ctx.drawImage(ib, 0, 0);
            const db = ctx.getImageData(0, 0, cnv.width, cnv.height).data;
            let diff = 0;
            for (let i = 0; i < da.length; i += 4) {
                if (
                    Math.abs(da[i] - db[i]) > 8 ||
                    Math.abs(da[i + 1] - db[i + 1]) > 8 ||
                    Math.abs(da[i + 2] - db[i + 2]) > 8
                ) {
                    diff++;
                }
            }
            return diff / (cnv.width * cnv.height);
        },
        [a.toString('base64'), b.toString('base64')] as const
    );
}

/** Live-profile / wall-clock / lived-vault regions are HIDDEN (not masked)
 *  at screenshot time: `visibility: hidden` via `stylePath`, injected only
 *  during capture. Region inventory + the mask-box 1px-rounding rationale
 *  live in visual-regression.hide.css; the regions' presence and content
 *  are asserted textually in the tests, and the raw canvas is proven by the
 *  in-run frozen-tick class, which never uses this hiding. */
const HIDE_VOLATILE_CSS = fileURLToPath(
    new URL('./visual-regression.hide.css', import.meta.url)
);

async function bootConnected(page: Page): Promise<void> {
    await page.goto('/');
    await expect(page.getByTestId('shell')).toBeVisible();
    await expect(page.getByTestId('status-gateway')).toContainText('connected', {
        timeout: 20_000
    });
}

/** House idiom (visual-panes.spec): ⌘. is the # inversion toggle. */
async function switchToCosmicFace(page: Page): Promise<void> {
    await page.keyboard.press('Meta+.');
    await expect(page.getByTestId('shell')).toHaveAttribute('data-face', '0');
}

/** Suite-order determinism (see header): anchor today's day so the personal
 *  surface is identical whether an earlier spec already began it (shared
 *  sidecar vault) or this spec runs in isolation. House idiom from
 *  journal.spec: adoption may race the gesture and detach the button
 *  mid-click; the now-pane assertion is the real gate either way.
 *  `begin_today` is idempotent (sidecar + vault.rs both no-op on existing). */
async function ensureDayAnchored(page: Page): Promise<void> {
    const nowPane = page.getByTestId('now-pane');
    const beginButton = page.getByTestId('now-begin-today');
    await expect(nowPane.or(beginButton).first()).toBeVisible({ timeout: 15_000 });
    if (await beginButton.isVisible().catch(() => false)) {
        await beginButton.click().catch(() => undefined);
    }
    await expect(nowPane).toBeVisible({ timeout: 15_000 });
    await expect(nowPane).toHaveAttribute('data-day', todayId());
}

/** Pin the target tab explicitly before asserting/capturing — the sidecar
 *  pins `ui_state_load → null` today (defaults every boot), but the capture
 *  must not rot silently if a persisted-layout channel ever lands in e2e.
 *  Tab headers are static chrome (no 1 Hz reflow), so a mouse click is safe
 *  here, unlike the engine strip. */
async function ensureTabSelected(page: Page, name: string): Promise<void> {
    const button = page
        .locator('.face-active .flexlayout__tab_button', { hasText: name })
        .first();
    await expect(button).toBeVisible();
    if (!/--selected/.test((await button.getAttribute('class')) ?? '')) {
        await button.click();
    }
    await expect(button).toHaveClass(/--selected/);
}

/** The engine matrices are live: engine mounted (not the fallback) and the
 *  pentadic 1-2-3 trace ready — the strongest "all matrices ride one
 *  generation" gate the strip exposes. */
async function engineReady(page: Page): Promise<void> {
    const cosmic = page.locator('.face-active [data-testid="cosmic-engine"]');
    await expect(cosmic).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('cosmic-engine-fallback')).toHaveCount(0);
    await expect(page.getByTestId('engine-pentadic-overlay')).toHaveAttribute(
        'data-state',
        'ready',
        { timeout: 20_000 }
    );
}

/** Freeze the choreography through the engine's §8.8 keyboard surface
 *  (space → `engine.pauseToggle`; focus sits on <body>, passing App.tsx's
 *  editable-target guard). */
async function pauseEngine(page: Page): Promise<void> {
    await page.keyboard.press(' ');
    await expect(page.getByTestId('engine-pause')).toContainText('resume');
    await expect(page.getByTestId('engine-scrub')).toBeVisible();
    await page.waitForTimeout(400); // let the settled frame flow through rAF
}

async function readGeneration(page: Page): Promise<number> {
    const text = (await page.getByTestId('engine-generation').textContent()) ?? '';
    const value = Number(text.replace(/[^0-9]/g, ''));
    return Number.isFinite(value) ? value : -1;
}

/** The live three.js drawing surface of the cosmic engine composition. */
function engineCanvas(page: Page): Locator {
    return page
        .locator('.face-active [data-testid="cosmic-engine"] .cosmic-engine-canvas canvas')
        .first();
}

test('(a) 0/1 lemniscate face-toggle: 400ms law + deterministic mid-crossing baseline', async ({
    page
}) => {
    await bootConnected(page);
    await expect(page.getByTestId('shell')).toHaveAttribute('data-face', '1');
    // Suite-order determinism: the personal slot rides the mid-crossing
    // capture, so its day state must be identical in isolation and in suite
    // order (header: SUITE-ORDER STATE).
    await ensureDayAnchored(page);
    await ensureTabSelected(page, 'Now');

    // DR-UI-4 timing law on the real computed style: 400ms (0.4s). Easing is
    // currently `ease` (finding: DR-UI-4 says cubic-out — see header).
    const duration = await page
        .locator('.face-slot')
        .first()
        .evaluate(el => getComputedStyle(el).transitionDuration);
    expect(duration, 'DR-UI-4: lemniscate toggle transition is 400ms').toContain('0.4s');

    // Slow the SAME transition (same properties, same easing) so the
    // mid-crossing can be frozen at an exact fraction without racing 400ms.
    await page.evaluate(() => {
        const style = document.createElement('style');
        style.id = 'e2e-slow-face-transition';
        style.textContent = '.face-slot { transition-duration: 12s !important; }';
        document.head.appendChild(style);
    });

    await page.keyboard.press('Meta+.'); // 1 → 0, transitions start
    await expect(page.getByTestId('shell')).toHaveAttribute('data-face', '0');

    // Freeze every face-slot animation at fraction 0.5 — same easing curve,
    // same fraction ⇒ visually identical to 200ms into the real crossing.
    await expect
        .poll(
            () =>
                page.evaluate(() => {
                    const anims = document
                        .getAnimations()
                        .filter(
                            a =>
                                a.effect instanceof KeyframeEffect &&
                                a.effect.target instanceof Element &&
                                a.effect.target.classList.contains('face-slot')
                        );
                    for (const a of anims) {
                        a.pause();
                        a.currentTime = 6_000; // 0.5 × 12s
                    }
                    return anims.length;
                }),
            { message: 'face-slot transitions should be running', timeout: 5_000 }
        )
        .toBeGreaterThanOrEqual(2);

    // Both faces visibly in flight — the crossfade, not either end state.
    const slots = page.locator('.face-slot');
    for (const slot of await slots.all()) {
        const opacity = Number(await slot.evaluate(el => getComputedStyle(el).opacity));
        expect(opacity).toBeGreaterThan(0.05);
        expect(opacity).toBeLessThan(0.95);
    }

    await expect(page).toHaveScreenshot('face-toggle-mid-crossing.png', {
        animations: 'allow', // the WAAPI pause above IS the freeze
        stylePath: HIDE_VOLATILE_CSS // hits BOTH faces — both visible here
    });

    // Release: finish the crossing, drop the slow-motion override, and the
    // shell settles on the cosmic face with a fully opaque active slot.
    await page.evaluate(() => {
        for (const a of document.getAnimations()) {
            a.finish();
        }
        document.getElementById('e2e-slow-face-transition')?.remove();
    });
    await expect(page.getByTestId('shell')).toHaveAttribute('data-face', '0');
    await expect
        .poll(() =>
            page.locator('.face-slot.face-active').evaluate(el => getComputedStyle(el).opacity)
        )
        .toBe('1');
});

test('(b) tick choreography: pause/scrub freezes the matrices; same record ⇒ same pixels', async ({
    page
}) => {
    await bootConnected(page);
    await switchToCosmicFace(page);
    await ensureTabSelected(page, 'Cosmic Engine');
    await engineReady(page);

    // Masked-row control inventory (the strip is masked in committed shots,
    // so its chrome is asserted here instead): the §8.8 transport surface.
    for (const control of [
        'engine-lens',
        'engine-ground-gearing',
        'engine-pause',
        'engine-instrument-toggle'
    ]) {
        await expect(page.getByTestId(control)).toBeVisible();
    }

    // Let the 720-tick ring accumulate ≥3 records so step-back has history.
    const firstGen = await readGeneration(page);
    await expect
        .poll(() => readGeneration(page), { timeout: 15_000 })
        .toBeGreaterThanOrEqual(firstGen + 3);

    await pauseEngine(page);

    const canvas = engineCanvas(page);
    await expect(canvas).toBeVisible();

    // Frozen-tick law: the choreography is pixel-static while the kernel
    // keeps ticking underneath (ingestion continues; the cursor stays put).
    // Ratio, not byte equality: the 4.3 clock-field live-bus window breathes
    // sub-pixel inside the same scene (header: measured floor 0.00018).
    const frozenA = await canvas.screenshot();
    await page.waitForTimeout(1_500); // > one live kernel tick recorded
    const frozenB = await canvas.screenshot();
    expect(
        await diffRatio(page, frozenA, frozenB),
        'paused choreography must be pixel-static across a live tick (E5 law: nothing advances under pause)'
    ).toBeLessThan(FROZEN_MAX_RATIO);

    // Scrub determinism, frame-by-frame over the ring: a DIFFERENT record
    // renders visibly different pixels (measured: ~0.0096, 50× the floor)…
    await page.keyboard.press('ArrowLeft'); // engine.stepBack
    await page.waitForTimeout(400);
    const stepped = await canvas.screenshot();
    expect(
        await diffRatio(page, frozenA, stepped),
        'step-back must show the previous tick record, not the frozen one'
    ).toBeGreaterThan(STEPPED_MIN_RATIO);

    // …and returning to the SAME record reproduces the SAME choreography
    // (back inside the live-window noise floor).
    await page.keyboard.press('ArrowRight'); // engine.stepForward
    await page.waitForTimeout(400);
    const returned = await canvas.screenshot();
    expect(
        await diffRatio(page, frozenA, returned),
        'scrub is deterministic: same ring record ⇒ same choreography pixels'
    ).toBeLessThan(FROZEN_MAX_RATIO);

    // Resume: the choreography flows again — pixels leave the frozen frame
    // (measured: ~1.0 after resume).
    await page.keyboard.press(' ');
    await expect(page.getByTestId('engine-scrub')).toHaveCount(0);
    await expect
        .poll(async () => diffRatio(page, frozenA, await canvas.screenshot()), {
            message: 'resumed choreography must diverge from the frozen frame',
            timeout: 10_000
        })
        .toBeGreaterThan(STEPPED_MIN_RATIO);
});

test('(c) integrated 1-2-3 cosmic composition: full-face baseline at a frozen tick', async ({
    page
}) => {
    await bootConnected(page);
    await switchToCosmicFace(page);
    await ensureTabSelected(page, 'Cosmic Engine');
    await engineReady(page);

    // Composition inventory (crisper diagnostics than a pixel diff alone):
    // the eleven cosmic tabs of the 1-2-3 pole, per App.tsx COSMIC_DEFAULT.
    for (const tab of [
        'Cosmic Engine',
        'Spanda',
        'Walk',
        'Bimba',
        'Correspondence',
        'Klein',
        'Played Torus',
        'M1 Surface',
        'Pentadic',
        'M3 Inspectors',
        'M5 EBM'
    ]) {
        await expect(
            page.locator('.face-active .flexlayout__tab_button', { hasText: tab }).first()
        ).toBeVisible();
    }
    // The shared / membrane (OmniPanel border) rides both faces (15.2).
    await expect(page.locator('.face-active .flexlayout__border_right')).toBeVisible();

    // Freeze the choreography (known scrubbed tick) before the page capture —
    // toHaveScreenshot's stability loop needs a static frame to converge on.
    await pauseEngine(page);

    await expect(page).toHaveScreenshot('composition-1-2-3-cosmic.png', {
        stylePath: HIDE_VOLATILE_CSS
    });
});

test('(d) integrated 4-5-0 personal composition: honest current surface baseline', async ({
    page
}) => {
    // Track 36.5's dedicated personal composition is the default carrier:
    // M0 grounds the 0/1 hinge, M4 receives the protected composed handle and
    // public trace scalars, and M5 scores the bussed checkpoint context.
    // Missing emissions remain visibly pending; the carrier never fabricates
    // a personal body, quaternion, or checkpoint.
    await bootConnected(page);
    await expect(page.getByTestId('shell')).toHaveAttribute('data-face', '1');

    // Personal-pole inventory, per App.tsx PERSONAL_DEFAULT: border tabs…
    for (const tab of ['Vault', 'Journal', 'Calendar', 'Oracle']) {
        await expect(
            page.locator('.face-active .flexlayout__border_button', { hasText: tab }).first()
        ).toBeVisible();
    }
    // …the main tabset, including the legitimate M4' and review additions.
    for (const tab of ['Now', 'M1 Deep', 'Arena', 'CU Ledger']) {
        await expect(
            page.locator('.face-active .flexlayout__tab_button', { hasText: tab }).first()
        ).toBeVisible();
    }
    // …and the shared / membrane (OmniPanel border) rides both faces (15.2).
    await expect(page.locator('.face-active .flexlayout__border_right')).toBeVisible();

    // The day surface, in the ONE state this spec guarantees in both suite
    // order and isolation: anchored to today (header: SUITE-ORDER STATE).
    // The pane BODY is lived-vault content and rides the mask; its presence,
    // day binding, and selected tab are asserted here.
    await ensureTabSelected(page, 'Now');
    await ensureDayAnchored(page);
    await expect(page.getByTestId('personal-recognition-engine')).toBeVisible();
    await expect(page.getByTestId('personal-recognition-engine')).toHaveAttribute(
        'data-state',
        'pending'
    );
    await expect(page.getByTestId('personal-recognition-m0-ground')).toContainText(
        /0\/1 substrate: (0|1|0\/1)/
    );
    await expect(page.getByTestId('m0-virtue-witness-panel')).toBeVisible();
    await expect(page.getByTestId('m0-virtue-witness-grid')).toHaveAttribute('data-filled', '0');
    await expect(page.getByTestId('m0-virtue-questions')).toContainText('unwitnessed');
    const recognitionLayer = page.getByTestId('m5-recognition-layer');
    await expect(recognitionLayer).toBeVisible();
    await expect(recognitionLayer).toHaveAttribute('data-state', 'pending-handle');
    await expect(page.getByTestId('personal-recognition-m5-score')).toContainText(
        'Möbius return pending canonical close-path evidence'
    );

    await expect(page).toHaveScreenshot('composition-4-5-0-personal.png', {
        stylePath: HIDE_VOLATILE_CSS
    });
});

test('(e) block-host standard: the Review fold renders the fixture blocks to a stable baseline (44.T44.9, feeds G8)', async ({
    page
}) => {
    // The Track-44 surface standard's visual baseline: the omni Review fold
    // hosts the synthetic-fixture blocks (deterministic content by
    // construction) through BlockHost — catalog acceptance chrome, owner
    // attribution, affordance strips. Live-tick chrome rides the mask CSS.
    await bootConnected(page);
    await page
        .locator('.face-active .flexlayout__border_button', { hasText: 'Review' })
        .click();
    const host = page.locator('.face-active [data-testid="block-host"]');
    await expect(host).toBeVisible({ timeout: 15_000 });
    await expect(
        page.locator('.face-active [data-block-type="review-item"]').first()
    ).toBeVisible();
    await expect(host).toHaveScreenshot('block-host-review-fold.png', {
        stylePath: HIDE_VOLATILE_CSS
    });
});
