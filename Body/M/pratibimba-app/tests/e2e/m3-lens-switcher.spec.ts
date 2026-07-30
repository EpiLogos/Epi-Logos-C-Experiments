/**
 * Coordinate: M' M3' (16+1 functional lens switcher proof, rerun 24.T24.3)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): #2 the M3 lens-aperture control surface
 * Actualises: real Chromium proof that the landed `m3-functional-lens` switcher
 *   in M3InspectorsPane (a) offers exactly the 16 derived apertures + the
 *   primary Fibonacci Ground (id 16) and no 18-fold / Frame / Operator lens,
 *   (b) defaults to Ground id 16 so the operative basis is visible first, and
 *   (c) resolves a selected derived aperture (Hourly, id 7) through Ground 16
 *   over the real kernelBridge.m3.lensCodonBinary(lensId) gateway projection.
 *   The parser (src/bridge/types.test.ts), the substrate
 *   (portal-core::lens_codon_binary), and the spawned-gateway ids-7/16/17 edge
 *   (epi-cli/tests/gate_m3_lens_codon_binary.rs) are proven elsewhere; this is
 *   the switcher's own UI-flow class-proof.
 * Public surface: Playwright test over the spawned gateway.
 * Does NOT own: projection production, the 16-division table, Fibonacci/Pisano
 *   law, wheel geometry, or layout routing law.
 * Contract: [[M3'-SPEC]] + rerun [[24-m3-mahamaya-frontend-deep]] 24.3.
 */

import { expect, Page, test } from '@playwright/test';

/** House idiom (m3-transcription.spec / m3-renderer-modes.spec): route the M3
 *  wheel intent so the ide-deep inspectors surface — which hosts the functional
 *  lens switcher — mounts on the active face. */
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

test('24.T24.3: the functional lens switcher defaults to Ground 16 and resolves a derived aperture through it', async ({
    page
}) => {
    await page.goto('/');
    const shell = page.getByTestId('shell');
    await expect(shell).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });
    await expect(page.getByTestId('status-tick')).toHaveText(/\d+/, { timeout: 20_000 });

    await dispatchM3Intent(page, 'wheel');
    await expect(shell).toHaveAttribute('data-active-layout', 'ide-deep');

    const inspectors = page.locator('.face-active [data-testid="m3-inspectors"]');
    const select = inspectors.getByTestId('m3-functional-lens-select');
    const readout = inspectors.getByTestId('m3-functional-lens-readout');
    await expect(select).toBeVisible({ timeout: 20_000 });

    // Namespace discipline: exactly the 16 derived apertures + one primary
    // Ground — no 18-fold, Frame, or Operator lens. (Reject-17 is proven at the
    // parser and spawned-gateway layers; the control structurally cannot emit
    // 17, and this asserts the 16+1 cardinality it does offer.)
    await expect(select.locator('option')).toHaveCount(17);

    // Default: Ground id 16 is selected so the operative basis is visible before
    // any derived aperture, and its readout resolves from the real projection.
    await expect(select).toHaveValue('16');
    await expect(readout).toContainText('Fibonacci Ground · primary', { timeout: 20_000 });
    await expect(readout).toContainText('positions');

    // Select a derived aperture (Hourly, id 7 — the same id the spawned-gateway
    // edge test exercises) and prove it resolves THROUGH Ground 16.
    await select.selectOption('7');
    await expect(select).toHaveValue('7');
    await expect(readout).toContainText('Hourly', { timeout: 20_000 });
    await expect(readout).toContainText('derived through Ground 16');
    await expect(readout).toContainText('boundaries');

    // Return to Ground: the switcher is bidirectional and the primary basis
    // resolves again from the live projection.
    await select.selectOption('16');
    await expect(select).toHaveValue('16');
    await expect(readout).toContainText('Fibonacci Ground · primary', { timeout: 20_000 });
});
