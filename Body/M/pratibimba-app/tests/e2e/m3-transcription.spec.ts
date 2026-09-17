/**
 * Coordinate: M' M3' (transcription readback proof, rerun 24.T24.20)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): #5 lens -> codon -> binary interactive surface
 * Actualises: real Chromium proof that the M3TranscriptionEngine renders the
 *   lens->codon->binary readback verbatim from the kernelBridge.m3.lensCodonBinary
 *   gateway projection (per-degree binary, four charges, charge quaternion,
 *   canonical-B element, codon class, six line-change hops), with honest pending
 *   badges for the not-yet-supplied RNA-codon-family and chromosome-graph fields.
 *   The superseded Frame/Operator 18-aperture branch (aperture id 17 no-frame
 *   graph) is deliberately NOT rebuilt per the rerun carrier retarget.
 * Public surface: Playwright test over the spawned gateway.
 * Does NOT own: projection production (portal-core::lens_codon_binary_projection),
 *   wheel geometry, routing law, or layout state.
 * Contract: [[M3'-SPEC]] + rerun [[24-m3-mahamaya-frontend-deep]] 24.20.
 */

import { expect, Page, test } from '@playwright/test';

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

test('24.T24.20: transcription engine renders the live lens->codon->binary readback from the gateway', async ({
    page
}, testInfo) => {
    await page.goto('/');
    const shell = page.getByTestId('shell');
    await expect(shell).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });
    await expect(page.getByTestId('status-tick')).toHaveText(/\d+/, { timeout: 20_000 });

    // Route to ide-deep so the full M3 inspectors surface (with transcription) mounts.
    await dispatchM3Intent(page, 'wheel');
    await expect(shell).toHaveAttribute('data-active-layout', 'ide-deep');

    const inspectors = page.locator('.face-active [data-testid="m3-inspectors"]');
    const engine = inspectors.getByTestId('m3-transcription-engine');

    // The default primary Fibonacci Ground lens (id 16) fetches a real projection
    // from kernelBridge.m3.lensCodonBinary and reaches the ready state.
    await expect(engine).toHaveAttribute('data-state', 'ready', { timeout: 20_000 });
    await expect(engine).toHaveAttribute('data-active-lens-id', '16');
    await expect(engine).toHaveAttribute('data-projection-lens-id', '16');

    const degreeCount = Number(await engine.getAttribute('data-degree-count'));
    expect(degreeCount).toBeGreaterThan(0);

    // First per-degree row carries a real binary readback (only 0/1 bits), the four
    // charges, the charge quaternion, the codon class, and the six line-change hops.
    const firstBits = engine.getByTestId('m3-transcription-bits-0');
    await expect(firstBits).toBeVisible();
    await expect(firstBits).toHaveText(/^[01\s]+$/);
    await expect(engine.getByTestId('m3-transcription-charges-0')).toBeVisible();
    await expect(engine.getByTestId('m3-transcription-quaternion-0')).toBeVisible();
    await expect(engine.getByTestId('m3-transcription-class-0')).toBeVisible();
    await expect(engine.getByTestId('m3-transcription-hops-0')).toBeVisible();

    // The row count matches the projection's declared degree count (verbatim readback,
    // no local fabrication).
    await expect(engine.getByTestId(/^m3-transcription-row-\d+$/)).toHaveCount(degreeCount);

    // Honest pending badges for the fields the profile does not yet supply.
    await expect(
        engine.getByTestId('m3-transcription-rna-family-pending').getByTestId('provenance-pending')
    ).toHaveAttribute('title', 'pending-rna-codon-family');
    await expect(
        engine.getByTestId('m3-transcription-chromosome-pending').getByTestId('provenance-pending')
    ).toHaveAttribute('title', 'pending-chromosome-graph');

    const shot = testInfo.outputPath('m3-transcription-readback.png');
    await page.screenshot({ path: shot });
    await testInfo.attach('m3-transcription-readback', { path: shot, contentType: 'image/png' });
});
