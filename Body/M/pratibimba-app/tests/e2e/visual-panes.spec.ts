/**
 * Coordinate: M' (drivable-loop spec: the cosmic-face visual surfaces)
 * Actualises: the Track-00 gap this spec closes — every prior "done" carrier
 *   tranche proved itself in C/Rust or a jsdom mount and NEVER opened the app,
 *   because the cosmic face (three.js Cosmic Engine + Walk + Bimba + Klein) is
 *   face 0 and the app boots on face 1 (personal), so no e2e spec ever reached
 *   it. This spec drives the real Vite face in real Chromium against the real
 *   spawned gateway and asserts the visual surfaces actually render and behave:
 *     1. the Cosmic Engine mounts a LIVE WebGL surface (not the fallback) — the
 *        exact capability the M1' played-torus (T2.6) will need;
 *     2. the Walk pane walks the REAL S2 graph and the single session-held #
 *        (Inversion_Operator, T2.5) surfaces from the live profile bus and the
 *        invert round-trips X → X′ → X.
 *   A mounted mock cannot pass either: only the spawned `epi gate start`
 *   produces the graph topology and the profile that carries the # handle.
 * Does NOT own: the gateway protocol (S3), the Tauri host (src-tauri).
 */

import { expect, test } from '@playwright/test';

/** The app boots on the personal face (1); the three.js surfaces live on the
 *  cosmic face (0). ⌘. (App.tsx keydown → face.toggle) is the switch. */
async function switchToCosmicFace(page: import('@playwright/test').Page): Promise<void> {
    await expect(page.getByTestId('shell')).toBeVisible();
    // gateway must be live before the cosmic surfaces have anything to draw
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });
    await page.keyboard.press('Meta+.');
    await expect(page.getByTestId('shell')).toHaveAttribute('data-face', '0');
}

test('cosmic face: the Cosmic Engine mounts a live three.js WebGL surface (played-torus precedent)', async ({
    page
}) => {
    await page.goto('/');
    await switchToCosmicFace(page);

    // the Cosmic Engine renders three.js, NOT the WebGL-unavailable fallback
    const cosmic = page.locator('.face-active [data-testid="cosmic-engine"]');
    await expect(cosmic).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('cosmic-engine-fallback')).toHaveCount(0);

    // three.js appended a real <canvas> with a non-zero drawing surface
    const canvas = cosmic.locator('canvas').first();
    await expect(canvas).toBeVisible();
    const box = await canvas.boundingBox();
    expect(box?.width ?? 0).toBeGreaterThan(0);
    expect(box?.height ?? 0).toBeGreaterThan(0);

    // and the GL context is real and not lost — swiftshader in headless
    // Chromium (playwright.config launchOptions) makes this deterministic
    const glLive = await canvas.evaluate((el: HTMLCanvasElement) => {
        const ctx =
            (el.getContext('webgl2') as WebGLRenderingContext | null) ??
            (el.getContext('webgl') as WebGLRenderingContext | null);
        return ctx !== null && !ctx.isContextLost();
    });
    expect(glLive, 'three.js WebGL context should be live in the e2e face').toBe(true);

    // 36.4: the pentadic 1-2-3 overlay rides the SAME live profile — ready
    // (one trace generation across M1/M2/M3 slots), never pending or stale
    const overlay = page.getByTestId('engine-pentadic-overlay');
    await expect(overlay).toHaveAttribute('data-state', 'ready', { timeout: 20_000 });
    await expect(overlay).toContainText(/M1 \d+°→\d+/);
    await expect(overlay).toContainText(/M2 72:\d+ phase \d\/9/);
    await expect(overlay).toContainText(/M3 DET \d+ clock \d+ [A-Z]{3}/);
    await expect(overlay).toContainText(/loss [01]/);

    // 07.T7.8: the M1 topology producer owns the `(p,q)` torus-knot phase.
    // This real gateway currently omits the optional topology projection, so
    // the carrier must remain explicitly pending rather than manufacture a
    // phase from the tick. Unit coverage exercises the exact portal-core shape
    // when the projection becomes available on this stream.
    await expect(cosmic).toHaveAttribute('data-torus-knot-phase-p', 'pending-m1-topology');
    await expect(cosmic).toHaveAttribute('data-torus-knot-phase-q', 'pending-m1-topology');

    // 07.T7.6: coupling-flow has no renderer-local physics lane. The current
    // spawned gateway does not project this optional boundary on the normal
    // profile stream, so the real surface must remain explicitly pending;
    // unit coverage proves that the exact portal-core boundary opens the
    // disclosure when the projection arrives.
    const coupling = page.getByTestId('engine-coupling-flow-overlay');
    await expect(coupling).toHaveAttribute('data-state', 'pending-coupling-flow-alignment', {
        timeout: 20_000
    });
    await expect(coupling).toContainText('pending-coupling-flow-alignment');
    await expect(page.getByTestId('engine-coupling-symbolic')).toHaveCount(0);

    // 4.3: the clock-field overlay reads the live bus — the hop edge (384
    // line-change) is always derivable from the bussed hexagram/line; aspect
    // edges appear when the kairos planet degrees ride the profile
    const clockField = page.getByTestId('engine-clock-field');
    await expect(clockField).toHaveAttribute('data-hop', /\d+>\d+/, { timeout: 20_000 });
    await expect(clockField).toContainText(/hop \d+→\d+/);

    // lens digit polish: the ground-gearing readout CONSUMES the kernel's
    // Fibonacci-Ground Pisano digit off the live profile (phase_space.rs
    // pisano60_digit, degree360/6) — phase-space always rides a live tick (the
    // pentadic overlay above already proves it ready), so the digit is present
    // and honest (data-pisano-digit is a real 0-9, never fabricated).
    const ground = page.getByTestId('engine-ground-gearing');
    await expect(ground).toHaveAttribute('data-pisano-digit', /^[0-9]$/, { timeout: 20_000 });
    await expect(ground).toContainText('φ');

    // kairos tier strip (DR-FIB-3 carrier endpoint): the strip is ALWAYS in one
    // honest state — a resolved tier badge (realtime|kairotic) when a live sky
    // rides the bus, else the "kairos pending" indicator. Never both, never a
    // fabricated or dead decay window. (e2e kairos-cache freshness is not
    // guaranteed, so the tier badge is asserted by CONTRACT when present.)
    const kairosMode = page.getByTestId('engine-kairos-mode');
    if ((await kairosMode.count()) > 0) {
        await expect(kairosMode).toHaveAttribute('data-mode', /^(realtime|kairotic)$/);
        await expect(kairosMode).toContainText(/realtime sky|kairotic · decays \d/);
    } else {
        await expect(
            page.locator('.face-active .engine-degradation', { hasText: 'kairos pending' })
        ).toBeVisible();
    }

    // environment strip (P6.2 ambient epi-genetic transform, DR-ENV-1/8): ALWAYS
    // in one honest state — a present badge (calm|active) when the S3 heartbeat
    // serves the ambient env quaternion (a natal chart + live sky ride the bus),
    // else the "environment pending" indicator. Never both, never a fabricated
    // wind. (e2e natal-cache/sky freshness is not guaranteed, so the badge is
    // asserted by CONTRACT when present; the identity rotation reads 'calm'.)
    const envMode = page.getByTestId('engine-environment');
    if ((await envMode.count()) > 0) {
        await expect(envMode).toHaveAttribute('data-state', /^(calm|active)$/);
        await expect(envMode).toContainText(/calm · no ambient wind|ambient wind \d/);
    } else {
        await expect(page.getByTestId('engine-environment-pending')).toBeVisible();
    }
});

test('cosmic face: the M1 played-torus renders the ananda vortex live off the bus (T2.6)', async ({
    page
}) => {
    await page.goto('/');
    await switchToCosmicFace(page);

    // activate the Played Torus tab on the cosmic face
    await page
        .locator('.face-active .flexlayout__tab_button', { hasText: 'Played Torus' })
        .click();

    const pane = page.locator('.face-active [data-testid="m1-played-torus"]');
    await expect(pane).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('m1-played-torus-fallback')).toHaveCount(0);

    // ananda_vortex is a NON-optional projection on the live profile
    // (portal-core kernel/profile.rs:579) — against the real spawned gateway
    // the surface must reach ready, never the pending overlay
    await expect(pane).toHaveAttribute('data-vortex-state', 'ready', { timeout: 20_000 });

    // the dual-register cell chrome carries the kernel's raw + digit-root
    // faces (a window onto the Tranche 10.10 writes, not local math)
    const cell = page.getByTestId('m1-played-torus-cell');
    await expect(cell).toContainText(
        /family (bimba|pratibimba|sum|diff-a|diff-b|quintessence)/
    );
    // dual-register faces: raw may be negative (diff-a = −1) or — (rule family)
    await expect(cell).toContainText(/raw (-?\d+|—) · dr (\d+|—)/);

    // three.js mounted a live GL canvas for the K²
    const canvas = pane.locator('canvas').first();
    await expect(canvas).toBeVisible();
    const glLive = await canvas.evaluate((el: HTMLCanvasElement) => {
        const ctx =
            (el.getContext('webgl2') as WebGLRenderingContext | null) ??
            (el.getContext('webgl') as WebGLRenderingContext | null);
        return ctx !== null && !ctx.isContextLost();
    });
    expect(glLive, 'played-torus WebGL context should be live').toBe(true);
});

test('cosmic face: the M3 pentadic inspector renders the two fifteens off the live bus (36.3)', async ({
    page
}) => {
    await page.goto('/');
    await switchToCosmicFace(page);

    await page
        .locator('.face-active .flexlayout__tab_button', { hasText: 'Pentadic' })
        .click();

    const pane = page.locator('.face-active [data-testid="m3-pentadic-inspector"]');
    await expect(pane).toBeVisible({ timeout: 15_000 });

    // the trace rides every live profile frame (Track 36/10.P5) — ready, never pending
    await expect(pane).toHaveAttribute('data-trace-state', 'ready', { timeout: 20_000 });

    // Maxwell witness citation + the kernel-sourced identities and live fields
    await expect(page.getByTestId('m3-pentadic-maxwell')).toContainText('15 = 10 + 4 + 1');
    await expect(page.getByTestId('m3-pentadic-fifteens')).toContainText('15 + 15');
    await expect(page.getByTestId('m3-pentadic-fifteens')).toContainText('24x15=360');
    await expect(page.getByTestId('m3-pentadic-fifteens')).toContainText('360+24=384');
    await expect(page.getByTestId('m3-pentadic-trace')).toContainText(/72-idx \d+/);
    await expect(page.getByTestId('m3-pentadic-trace')).toContainText(/64-addr \d+/);
    await expect(page.getByTestId('m3-pentadic-hinge')).toContainText('whole 0→5 · natural 1→6');
});

test('cosmic face: the M3 inspectors summon live off the bus and the depth views switch (4.2)', async ({
    page
}) => {
    await page.goto('/');
    await switchToCosmicFace(page);

    await page
        .locator('.face-active .flexlayout__tab_button', { hasText: 'M3 Inspectors' })
        .click();

    const pane = page.locator('.face-active [data-testid="m3-inspectors"]');
    await expect(pane).toBeVisible({ timeout: 15_000 });
    // mahamaya rides every live profile — ready, never the pending body
    await expect(pane).toHaveAttribute('data-state', 'ready', { timeout: 20_000 });

    await page.getByTestId('m3-summon-third-spanda').click();
    const thirdSpanda = page.getByTestId('m3-spanda-runtime');
    await expect(thirdSpanda).toContainText(/M1 \d+° · Hopf fiber \d+ · advance \d+/);
    await expect(thirdSpanda).toContainText(/M2 72:\d+ · Shem choir \d+ · phase \d\/9/);
    await expect(thirdSpanda).toContainText(/M3 DET \d+ · clock \d+ · [A-Z]{3} · rotation \d+°\/[78] · round-trip loss [01]/);
    await expect(thirdSpanda).toContainText('9-address source block · 8 collision pairs · 64 non-exact round trips');
    const m2Axes = page.getByTestId('m3-spanda-m2-axes');
    for (const axis of ['MEF', 'Tattva', 'Decan', 'Shem', 'Maqam', 'DET']) {
        await expect(m2Axes).toContainText(axis);
    }

    // summon two inspectors and assert LIVE kernel values (no local tables)
    await page.getByTestId('m3-summon-dna-rna-phase').click();
    await expect(page.getByTestId('m3-dna-rna')).toContainText(/phase (dna|rna)/i);
    await expect(page.getByTestId('m3-dna-rna')).toContainText(/line-op \d+/);

    await page.getByTestId('m3-summon-suit-integral').click();
    await expect(page.getByTestId('m3-suit-integral')).toContainText('84 + 96 + 88 + 92 = 360');
    await expect(page.getByTestId('m3-suit-integral')).toContainText(/active suit \d/);

    // the four depth views switch and read bus-backed values
    await page.getByTestId('m3-depth-lens-annulus').click();
    await expect(page.getByTestId('m3-depth-readout')).toContainText(/lens \d+ · mode \d+ · 472:\d+/);

    // 37.T37.8 correction: the +1 is the PRIMARY functional lens, not a
    // decorative ring beside the sixteen. The pane requests it from the real
    // gateway by default, then proves a derived aperture carries its Ground
    // address rather than operating independently.
    const functionalLens = page.getByTestId('m3-functional-lens-select');
    await expect(functionalLens).toHaveValue('16');
    await expect(page.getByTestId('m3-functional-lens-readout')).toContainText(
        'Fibonacci Ground · primary · 60 positions',
        { timeout: 20_000 }
    );
    await functionalLens.selectOption('7');
    await expect(page.getByTestId('m3-functional-lens-readout')).toContainText(
        'Hourly · derived through Ground 16 · 24 boundaries',
        { timeout: 20_000 }
    );
    await expect(page.getByTestId('m3-functional-lens-readout')).toContainText(/fib \d+ · digit \d/);

    await page.getByTestId('m3-depth-toroidal-world').click();
    await expect(page.getByTestId('m3-depth-readout')).toContainText(/degree720 \d+ · sheet [01]/);
    await page.getByTestId('m3-depth-hopf-identity').click();
    await expect(page.getByTestId('m3-depth-readout')).toContainText(/identity returns at 720°/);
});

test('cosmic face: the Bases pane evaluates live S1 MOC membership through the vault sidecar (48.T48.4)', async ({
    page
}) => {
    await page.goto('/');
    await switchToCosmicFace(page);

    await page
        .locator('.face-active .flexlayout__tab_button', { hasText: 'Bases' })
        .click();

    const pane = page.locator('.face-active [data-testid="moc-base-ready"]');
    await expect(pane).toBeVisible({ timeout: 20_000 });

    const membership = page.getByTestId('moc-base-section-what-belongs-here');
    await expect(membership).toContainText('1 rows');
    await expect(membership).toContainText('S1');
    await expect(membership).toContainText('definition');
    await expect(membership).toContainText('Bimba/World/Types/Coordinates/S/S1/S1.md');

    const gaps = page.getByTestId('moc-base-section-open-gaps');
    await expect(gaps).toContainText('0 rows');

    const pipeline = page.getByTestId('moc-base-section-crystallisation-pipeline');
    await expect(pipeline).toContainText('1 rows');
    await expect(pipeline).toContainText('3 views');
    await expect(pipeline).toContainText('Bimba/World/Types/Crystallisation-Pipeline.base');
});

test('cosmic face: BasesView reads snapshot and graph sources and cross-filters shared coordinate context (48.T48.6)', async ({
    page
}) => {
    await page.goto('/');
    await switchToCosmicFace(page);

    await page
        .locator('.face-active .flexlayout__tab_button', { hasText: 'Bases' })
        .click();

    const ready = page.getByTestId('bases-projection-ready');
    await expect(ready).toBeVisible({ timeout: 20_000 });
    await expect(ready).toHaveAttribute('data-source', 'static');

    const primary = page.locator('.face-active .bases-primary-panel');
    await expect(primary.getByTestId('bases-row-M2-1')).toBeVisible();
    await primary.getByTestId('bases-row-M2-1').click();

    const context = page.getByTestId('bases-context-panel');
    await expect(context.locator('header code')).toHaveText('M2-1');
    await expect(context.getByTestId('bases-view-list')).toHaveAttribute('data-row-count', /[1-9][0-9]*/);
    await expect(context).toContainText('M2-1-0');

    await ready.getByRole('button', { name: 'live' }).click();
    await expect(page.getByTestId('bases-projection-ready')).toHaveAttribute('data-source', 'dynamic', {
        timeout: 20_000
    });
    await expect(primary.locator('header code')).toHaveText('s2.graph.query');
    await expect(primary.getByTestId('bases-row-M2-1')).toBeVisible();

    await ready.getByLabel('view').selectOption('cards');
    await expect(primary.getByTestId('bases-view-cards')).toBeVisible();
    await expect(primary.getByText('M2-1', { exact: true }).first()).toBeVisible();
});

test('cosmic face: the Walk pane walks the REAL graph and the # invert round-trips X → X′ → X', async ({
    page
}) => {
    await page.goto('/');
    await switchToCosmicFace(page);

    // activate the Walk tab on the cosmic face
    await page
        .locator('.face-active .flexlayout__tab_button', { hasText: 'Walk' })
        .click();

    // the walk auto-arrives at M1 from the REAL gateway (s2.graph.node) — only
    // the spawned gateway's topology produces this node
    const node = page.getByTestId('walk-node');
    await expect(node).toContainText('M1', { timeout: 20_000 });

    // T2.5 substrate-on-the-bus proof: the single session-held # operator handle
    // is carried on the live profile and surfaced at the walked coordinate
    await expect(page.getByTestId('m1-inversion-operator')).toContainText('m1://inversion/operator', {
        timeout: 20_000
    });

    // T2.5 carrier affordance: invert toggles the reciprocal face as a pure
    // involution and round-trips, WITHOUT walking (the graph node stays M1)
    const invertFace = page.getByTestId('m1-invert-face');
    await expect(invertFace).toHaveText('M1');
    await page.getByTestId('m1-invert-current-coordinate').click();
    await expect(invertFace).toHaveText("M1'");
    await page.getByTestId('m1-invert-current-coordinate').click();
    await expect(invertFace).toHaveText('M1');
    await expect(node).toContainText('M1');
});
