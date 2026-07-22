/**
 * Coordinate: M' M3' (9-walk traversal navigator real-boot proof — 24.T24.4)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): #0 cosmic face, ide-deep M3 inspectors area.
 * Actualises: real Chromium proof over the spawned gateway (:18933) that the
 *   `M3WalkNavigator` renders the 9 REAL kernel walk-lanes (labels + step
 *   counts from portal-core WalkType, NOT recon guesses), that the live
 *   per-lane `currentStep` is HONEST-PENDING on the absent Wave-B
 *   `cosmicClock.walks` field, and that dispatching advance against the
 *   unimplemented `s3.world_clock.walk.advance` RPC surfaces the outcome
 *   HONESTLY — never a fake "advanced" success.
 * Public surface: Playwright test over the spawned gateway.
 * Does NOT own: profile production, walk enumeration, gateway method impl.
 * Contract: [[M3'-SPEC]] + rerun [[24-m3-mahamaya-frontend-deep]] 24.4.
 */

import { expect, Page, test } from '@playwright/test';

/** Dispatch the cross-layout intent that mounts the full M3 inspectors area
 *  (ide-deep). Mirrors the helper in m3-renderer-modes.spec.ts. */
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

test('24.T24.4: 9-walk navigator renders real kernel lanes, honest-pending live-state, honest advance', async ({
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
    const nav = inspectors.getByTestId('m3-walk-navigator');
    await expect(nav).toBeVisible();

    // (a) The 9 SEQUENTIAL walk lanes render — from the tested kernel mirror.
    const lanes = nav.getByTestId(/^m3-walk-lane-\d+$/);
    await expect(lanes).toHaveCount(9);

    // (b) The lane labels + step counts are the REAL portal-core WalkType
    //     constants (NOT the recon ARCANA/CHAKRA/AXIS_MUNDI guesses).
    const KERNEL_WALKS: readonly [number, string, string][] = [
        [0, 'degree', '360'],
        [1, 'amino', '24'],
        [2, 'zodiac', '12'],
        [3, 'spanda', '12'],
        [4, 'decan', '36'],
        [5, 'hexagram', '64'],
        [6, 'enneadic', '9'],
        [7, 'seasonal', '4'],
        [8, 'line-change', '384']
    ];
    for (const [id, label, steps] of KERNEL_WALKS) {
        const lane = nav.getByTestId(`m3-walk-lane-${id}`);
        await expect(lane).toHaveAttribute('data-walk-label', label);
        await expect(lane).toHaveAttribute('data-step-count', steps);
    }
    // The recon-spec fake names must NOT appear anywhere in the navigator.
    await expect(nav).not.toContainText('ARCANA');
    await expect(nav).not.toContainText('CHAKRA');
    await expect(nav).not.toContainText('AXIS_MUNDI');

    // (c) Live per-lane currentStep is HONEST-PENDING on the absent Wave-B
    //     field cosmicClock.walks — bridge-readiness badge keyed to the field
    //     (unreported => bridge_unavailable) + per-lane provenance-pending.
    await expect(nav).toHaveAttribute('data-state', 'live-pending');
    const readinessShell = nav.getByTestId('bridge-readiness-shell');
    await expect(readinessShell).toHaveAttribute('data-binding', 'cosmicClock.walks');
    await expect(readinessShell).toHaveAttribute('data-readiness', 'bridge_unavailable');

    for (const [id] of KERNEL_WALKS) {
        const current = nav.getByTestId(`m3-walk-current-step-${id}`);
        await expect(current).toContainText('pending');
        await expect(current.getByTestId('provenance-pending')).toHaveAttribute(
            'title',
            'pending-profile-field:cosmicClock.walks'
        );
        // No fabricated numeric position — every lane says pending, not a step N.
        await expect(nav.getByTestId(`m3-walk-lane-${id}`)).toHaveAttribute(
            'data-live-state',
            'pending'
        );
    }

    // (d) Advance is HONEST: dispatching against the unimplemented RPC must
    //     surface unavailable — never a fake "advanced"/"dispatched" success.
    const status = nav.getByTestId('m3-walk-advance-status');
    await expect(status).toHaveAttribute('data-advance-state', 'idle');
    await nav.getByTestId('m3-walk-advance-0').click();
    await expect(status).toHaveAttribute('data-advance-state', 'unavailable', { timeout: 20_000 });
    await expect(status).toContainText('not yet implemented');
    // Assert the honest negative: the dispatch did NOT report a success.
    await expect(status).not.toHaveAttribute('data-advance-state', 'dispatched');
    await expect(status).not.toContainText('reflects on the next profile tick');

    const screenshot = testInfo.outputPath('m3-walk-navigator.png');
    await page.screenshot({ path: screenshot });
    await testInfo.attach('m3-walk-navigator', { path: screenshot, contentType: 'image/png' });
});
