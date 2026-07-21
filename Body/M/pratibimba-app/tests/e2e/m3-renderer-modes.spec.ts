/**
 * Coordinate: M' M3' (renderer/depth identity proof, rerun 24.T24.2/17/18)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): #0 cosmic face compact/full renderer boundary
 * Actualises: real Chromium proof that badge, mini-view, and full modes retain
 *   one authority-provided M3 surface while daily/deep routing changes mounts,
 *   including the pentadic hinge, Level-0 Fibonacci Ground, and 385-node
 *   cosmic-clock depth projections.
 * Public surface: Playwright test over the spawned gateway.
 * Does NOT own: profile production, wheel geometry, routing law, or layout state.
 * Contract: [[M3'-SPEC]] + rerun [[24-m3-mahamaya-frontend-deep]] 24.2/17-19.
 */

import { expect, Locator, Page, test } from '@playwright/test';

const IDENTITY_ATTRIBUTES = [
    'data-codon-id',
    'data-rotation',
    'data-rotation-states',
    'data-hexagram-id',
    'data-tarot-minor-id'
] as const;

async function dispatchM3Intent(page: Page, contributionId: 'wheel' | 'cosmicClock'): Promise<void> {
    await page.evaluate(async requestedContributionId => {
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
            requestedContributionId
        });
    }, contributionId);
}

async function expectSameSurface(left: Locator, right: Locator): Promise<void> {
    await expect
        .poll(async () => {
            const [leftIdentity, rightIdentity] = await Promise.all(
                [left, right].map(async wheel =>
                    Promise.all(IDENTITY_ATTRIBUTES.map(attribute => wheel.getAttribute(attribute)))
                )
            );
            return JSON.stringify(leftIdentity) === JSON.stringify(rightIdentity);
        })
        .toBe(true);
}

test('24.T24.17: badge, mini-view, and full wheel preserve one live M3 surface', async ({
    page
}, testInfo) => {
    await page.goto('/');
    const shell = page.getByTestId('shell');
    await expect(shell).toBeVisible();
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });
    await expect(page.getByTestId('status-tick')).toHaveText(/\d+/, { timeout: 20_000 });

    await page.keyboard.press('Meta+.');
    await expect(shell).toHaveAttribute('data-face', '0');

    const badge = page.getByTestId('m3-codon-chip').getByTestId('m3-cosmic-wheel');
    const mini = page.getByTestId('m3-daily-wheel-mini-view').getByTestId('m3-cosmic-wheel');
    await expect(badge).toHaveAttribute('data-mode', 'badge');
    await expect(mini).toHaveAttribute('data-mode', 'mini-view');
    await expect(mini.getByTestId(/^m3-wheel-cell-\d+$/)).toHaveCount(64);
    await expect(mini.getByTestId(/^m3-fibonacci-wedge-\d+$/)).toHaveCount(60);
    await expect(mini.getByTestId(/^m3-fibonacci-backbone-\d+$/)).toHaveCount(24);
    await expectSameSurface(badge, mini);
    const hingeBadge = page
        .getByTestId('m3-daily-wheel-mini-view')
        .getByTestId('m3-pentadic-hinge-badge');
    await expect(hingeBadge).toHaveAttribute('data-trace-state', 'ready', {
        timeout: 20_000
    });
    await expect(hingeBadge).toContainText('0/1→5');
    // The hinge badge and the mini-view wheel ride ONE live surface, so they
    // report the SAME generation at any instant — but that generation ticks
    // ~1 Hz, so a frozen snapshot of one value compared against a poll of the
    // other races the counter (mini captured at gen N, hinge polled at N+k).
    // Read both in a single synchronous browser evaluate — no tick can land
    // between two synchronous getAttribute reads — and poll until they agree.
    await expect
        .poll(() =>
            page.evaluate(() => {
                const scope = document.querySelector(
                    '[data-testid="m3-daily-wheel-mini-view"]'
                );
                const hinge = scope?.querySelector(
                    '[data-testid="m3-pentadic-hinge-badge"]'
                );
                const wheel = scope?.querySelector('[data-testid="m3-cosmic-wheel"]');
                const hingeGeneration = hinge?.getAttribute('data-generation') ?? null;
                const wheelGeneration = wheel?.getAttribute('data-generation') ?? null;
                return hingeGeneration !== null && hingeGeneration === wheelGeneration;
            })
        )
        .toBe(true);

    const dailyScreenshot = testInfo.outputPath('daily-m3-renderer-modes.png');
    await page.screenshot({ path: dailyScreenshot });
    await testInfo.attach('daily-m3-renderer-modes', {
        path: dailyScreenshot,
        contentType: 'image/png'
    });

    await dispatchM3Intent(page, 'wheel');
    await expect(shell).toHaveAttribute('data-active-layout', 'ide-deep');
    await expect(page.getByTestId('m3-daily-wheel-mini-view')).toHaveCount(0);
    const full = page
        .locator('.face-active [data-testid="m3-inspectors"]')
        .getByTestId('m3-cosmic-wheel');
    await expect(full).toHaveAttribute('data-mode', 'full');
    await expect(full.getByTestId(/^m3-wheel-cell-\d+$/)).toHaveCount(64);
    await expect(full.getByTestId(/^m3-fibonacci-wedge-\d+$/)).toHaveCount(60);
    await expect(full.getByTestId(/^m3-fibonacci-cardinal-\d+$/)).toHaveCount(4);
    await expect(full.getByTestId(/^m3-fibonacci-zodiacal-\d+$/)).toHaveCount(8);
    await expect(full.getByTestId(/^m3-fibonacci-backbone-\d+$/)).toHaveCount(24);
    await expect(full.getByTestId('m3-fibonacci-live-sun')).toHaveAttribute(
        'data-position',
        /^\d+$/
    );
    await expect(
        full
            .getByTestId('m3-fibonacci-natal-pending')
            .getByTestId('provenance-pending')
    ).toHaveAttribute(
        'title',
        'pending-profile-field:quintessence.natalFibonacciPosition'
    );
    const clockDepth = full.getByTestId('m3-cosmic-clock-depth-overlay');
    await expect(clockDepth).toHaveAttribute('data-node-count', '385');
    await expect(clockDepth).toHaveAttribute('data-mode', 'flat-clock-debug');
    await expect(clockDepth.getByTestId(/^m3-clock-degree-\d+$/)).toHaveCount(360);
    await expect(clockDepth.getByTestId(/^m3-clock-amino-\d+$/)).toHaveCount(24);
    await expect(clockDepth.getByTestId('m3-clock-axis-mundi')).toHaveCount(1);
    await expect(
        full.getByTestId('m3-clock-aspect-pending').getByTestId('provenance-pending')
    ).toHaveAttribute('title', 'pending-profile-field:cosmicClock.aspectEdges');
    await expect(
        full.getByTestId('m3-clock-hop-pending').getByTestId('provenance-pending')
    ).toHaveAttribute('title', 'pending-profile-field:cosmicClock.hopEdges');
    await page.getByTestId('m3-depth-toroidal-world').click();
    await expect(clockDepth).toHaveAttribute('data-mode', 'toroidal-world');
    await page.getByTestId('m3-depth-hopf-identity').click();
    await expect(clockDepth).toHaveAttribute('data-mode', 'hopf-identity');
    await expectSameSurface(badge, full);
    const relationInspector = page
        .locator('.face-active [data-testid="m3-inspectors"]')
        .getByTestId('m3-pentadic-relation-inspector');
    await expect(relationInspector).toHaveAttribute('data-trace-state', 'ready', {
        timeout: 20_000
    });
    await expect(relationInspector.getByTestId('m3-pentadic-maxwell')).toContainText(
        '15 = 10 + 4 + 1'
    );
    await expect(relationInspector.getByTestId('m3-pentadic-fifteens')).toContainText(
        '24x15=360'
    );
    await expect(relationInspector.getByTestId('m3-pentadic-fifteens')).toContainText(
        '360+24=384'
    );
    await expect(relationInspector.getByTestId('m3-pentadic-hinge')).toContainText(
        'whole 0→5 · natural 1→6'
    );

    const deepScreenshot = testInfo.outputPath('deep-m3-renderer-mode.png');
    await page.screenshot({ path: deepScreenshot });
    await testInfo.attach('deep-m3-renderer-mode', {
        path: deepScreenshot,
        contentType: 'image/png'
    });

    await dispatchM3Intent(page, 'cosmicClock');
    await expect(shell).toHaveAttribute('data-active-layout', 'daily-0-1');
    await expect(mini).toHaveAttribute('data-mode', 'mini-view');
    await expectSameSurface(badge, mini);

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(mini).toBeVisible();
    const miniBounds = await page.getByTestId('m3-daily-wheel-mini-view').boundingBox();
    expect(miniBounds).not.toBeNull();
    expect(miniBounds?.x).toBeGreaterThanOrEqual(0);
    expect((miniBounds?.x ?? 0) + (miniBounds?.width ?? 0)).toBeLessThanOrEqual(390);
    expect(miniBounds?.y).toBeGreaterThanOrEqual(0);
    expect((miniBounds?.y ?? 0) + (miniBounds?.height ?? 0)).toBeLessThanOrEqual(844);

    const mobileScreenshot = testInfo.outputPath('mobile-m3-renderer-modes.png');
    await page.screenshot({ path: mobileScreenshot });
    await testInfo.attach('mobile-m3-renderer-modes', {
        path: mobileScreenshot,
        contentType: 'image/png'
    });
});
