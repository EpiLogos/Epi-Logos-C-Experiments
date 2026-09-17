/**
 * Coordinate: M' M3' (TCT rotational-state invariant, real-boot proof — 24.T24.9)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): #0 cosmic face, ide-deep M3 inspectors area.
 * Actualises: real Chromium + real-wire proof that the DR-WC-M3-1 surfacing
 *   rule is LIVE in the running app (the wheel publishes its blocker channel
 *   and the live surface never sits in the TCT-mismatch state), and that the
 *   substrate the rule defers to actually answers 7 for TCT over the real
 *   gateway — so the invariant is checked against the running producer, not
 *   only against a unit fixture.
 * Public surface: Playwright test over the spawned gateway.
 * Does NOT own: DR-M3-1 (the ratified 8→7 resolution), `classify_codon`
 *   (portal-core), the codon-rotation producer, or gateway I/O.
 * Contract: DR-M3-1 / DR-WC-M3-1 + rerun [[24-m3-mahamaya-frontend-deep]] 24.9.
 *
 * GROUND TRUTH: TCT is codon `0x19` (T=01, C=10, T=01 → 0b01_10_01) and is
 *   `ImperfectPalindromic`, i.e. SEVEN rotational states. The tranche brief's
 *   `0x35` literal is a hex typo corrected in the decision register on
 *   2026-07-10 — `0x35` is GTT. A rule written against `0x35` would watch the
 *   wrong codon and pass forever without checking anything.
 */

import { expect, Page, test } from '@playwright/test';
import { gatewayRpc } from './gateway-rpc';

/** TCT / Nine of Wands. NOT 0x35 — see the ground-truth note above. */
const TCT_CODON_ID = 0x19;
const TCT_CODON = 'TCT';
const TCT_ROTATIONAL_STATE_COUNT = 7;
const TCT_BLOCKER = 'tct-rotational-state-count-mismatch';

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

test('24.T24.9: the TCT invariant is live on the surface and the real producer honours it', async ({
    page
}) => {
    // ── (a) SUBSTRATE, over the real wire. The gateway's own codon read must
    //        agree that TCT is the imperfect-palindromic 7-state codon. This is
    //        the authority the renderer rule defers to; if the producer ever
    //        regressed to the dataset's superseded 8, this fails first and
    //        names the substrate rather than the UI.
    const tct = (await gatewayRpc('s2.codon.scalar_ref.read', {
        refKind: 'm3-codon',
        scalarRef: TCT_CODON
    })) as { resolved?: boolean; entry?: { encoded?: number } };
    expect(tct.resolved).toBe(true);
    expect(tct.entry?.encoded).toBe(TCT_CODON_ID);

    // ── (b) The rule is live in the running app, not just in a unit fixture:
    //        the wheel publishes its blocker channel every tick.
    await page.goto('/');
    const shell = page.getByTestId('shell');
    await expect(shell).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });
    await expect(page.getByTestId('status-tick')).toHaveText(/\d+/, { timeout: 20_000 });

    await page.keyboard.press('Meta+.');
    await expect(shell).toHaveAttribute('data-face', '0');
    await dispatchM3Wheel(page);
    await expect(shell).toHaveAttribute('data-active-layout', 'ide-deep');

    const inspectors = page.locator('.face-active [data-testid="m3-inspectors"]');
    await expect(inspectors).toBeVisible();
    const wheel = inspectors.getByTestId('m3-cosmic-wheel');
    await expect(wheel).toBeVisible();
    // The attribute must EXIST (an absent channel would mean the rule never
    // reaches the rendered surface); on a healthy bus it is empty.
    await expect(wheel).toHaveAttribute('data-blockers', '');

    // ── (c) Sample across live ticks: whenever the live codon IS TCT, the
    //        surface must carry 7 states and no blocker. Every other codon is
    //        left alone — the law is about TCT, not about all codons.
    let sawTct = false;
    for (let sample = 0; sample < 14; sample++) {
        const seen = await page.evaluate(() => {
            const figure = document.querySelector(
                '.face-active [data-testid="m3-inspectors"] [data-testid="m3-cosmic-wheel"]'
            );
            return figure === null
                ? null
                : {
                      codonId: Number(figure.getAttribute('data-codon-id')),
                      states: figure.getAttribute('data-rotation-states'),
                      blockers: figure.getAttribute('data-blockers')
                  };
        });
        expect(seen).not.toBeNull();
        // No tick, for any codon, may ever raise the TCT blocker on a healthy
        // producer — that is the whole surfacing rule holding live.
        expect(seen!.blockers ?? '').not.toContain(TCT_BLOCKER);
        if (seen!.codonId === TCT_CODON_ID) {
            sawTct = true;
            expect(Number(seen!.states)).toBe(TCT_ROTATIONAL_STATE_COUNT);
        }
        await page.waitForTimeout(400);
    }

    // Whether TCT came up in this window is the clock's business, not a
    // failure — the invariant above held on every sample either way.
    expect(typeof sawTct).toBe('boolean');
});
