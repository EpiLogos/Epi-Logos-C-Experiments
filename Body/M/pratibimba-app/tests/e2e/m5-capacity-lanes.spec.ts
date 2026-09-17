/**
 * Coordinate: M' M5' (operational-capacity lanes drivable-loop — Track 26.T26.2)
 * Actualises: the real Chromium + spawned-gateway proof (UF class) that the M5'
 *   EBM observatory hosts the six operational-capacity affordance, reads the
 *   real `s5'.improve.history` per-capacity signal without error, discloses the
 *   absent per-capacity harmonic producer honestly, and exposes the Pi-monitor
 *   (ACR) click-through that opens the real dispatch-trace surface. jsdom cannot
 *   close this track — only the surface driven in a real browser can.
 *
 * Selectors are scoped to `.face-active`: the standalone observatory (cosmic
 * 'M5 EBM' tab) is the surface under test; the personal composition also mounts
 * the observatory grid (without the canonical lanes) on the inactive face.
 */

import { expect, test, type Page } from '@playwright/test';

async function bootConnected(page: Page): Promise<void> {
    await page.goto('/');
    await expect(page.getByTestId('shell')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });
}

async function switchToCosmicFace(page: Page): Promise<void> {
    await page.keyboard.press('Meta+.');
    await expect(page.getByTestId('shell')).toHaveAttribute('data-face', '0');
}

async function ensureTabSelected(page: Page, name: string): Promise<void> {
    const button = page.locator('.face-active .flexlayout__tab_button', { hasText: name }).first();
    await expect(button).toBeVisible();
    if (!/--selected/.test((await button.getAttribute('class')) ?? '')) {
        await button.click();
    }
    await expect(button).toHaveClass(/--selected/);
}

test('M5 EBM observatory hosts the six operational-capacity lanes over the real S5 wire', async ({
    page
}) => {
    await bootConnected(page);
    await switchToCosmicFace(page);
    await ensureTabSelected(page, 'M5 EBM');

    const observatory = page.locator('.face-active [data-testid="m5-ebm-observatory"]');
    await expect(observatory).toBeVisible({ timeout: 15_000 });

    // 26.2 — the six operational-capacity affordance renders inside the standalone
    // observatory, all six at once (NOT tabs), driven by the real gateway.
    const lanes = observatory.locator('[data-testid="m5-capacity-lanes"]');
    await expect(lanes).toBeVisible();
    await expect(lanes.locator('[data-testid^="m5-capacity-lane-"]')).toHaveCount(6);

    // The absent per-capacity harmonic producer is disclosed honestly, never faked.
    await expect(lanes.locator('[data-testid="m5-capacity-harmonic-pending"]')).toContainText(
        'not projected'
    );

    // Real per-capacity read succeeded — no load error against the live wire (the
    // read-path proof a jsdom mount cannot give).
    await expect(lanes.locator('[data-testid="m5-capacity-error"]')).toHaveCount(0);
    await expect(lanes.locator('[data-testid="m5-capacity-lane-epii-self-referential"]')).toContainText(
        'dispatch'
    );
});

test('a capacity lane opens the Pi-monitor (ACR) dispatch-trace surface via the cross-layout intent spine', async ({
    page
}) => {
    await bootConnected(page);
    await switchToCosmicFace(page);
    await ensureTabSelected(page, 'M5 EBM');

    const observatory = page.locator('.face-active [data-testid="m5-ebm-observatory"]');
    await expect(observatory.locator('[data-testid="m5-capacity-lanes"]')).toBeVisible({ timeout: 15_000 });

    await observatory
        .locator('[data-testid="m5-capacity-open-pi-monitor-epii-self-referential"]')
        .click();

    // agentic-control-room -> omniDispatchTrace: the real Pi-monitor dispatch
    // surface opens in the OmniPanel border (which rides the cosmic face).
    await expect(page.getByTestId('composition-dispatch-trace')).toBeVisible({ timeout: 15_000 });
});

/**
 * 26.T26.6 — the seam that was declared and consumed but fired by nothing. The
 * intent ledger has aliased `capacity:<id>` onto `autoresearch-pane` and App.tsx
 * has decoded it into `requestedCapacity` for tranches, with no producer at
 * either end of the repo. This drives the whole route in a real browser: lane
 * click → cross-layout dispatch → face change → pane mount → filter pre-seated.
 */
test('a capacity lane opens the Autoresearch pane with its per-capacity filter pre-seated', async ({
    page
}) => {
    await bootConnected(page);
    await switchToCosmicFace(page);
    await ensureTabSelected(page, 'M5 EBM');

    const observatory = page.locator('.face-active [data-testid="m5-ebm-observatory"]');
    await expect(observatory.locator('[data-testid="m5-capacity-lanes"]')).toBeVisible({ timeout: 15_000 });

    await observatory
        .locator('[data-testid="m5-capacity-open-autoresearch-parashakti-graph-relational-ml"]')
        .click();

    // The target row is face 1, so the shell crosses faces and lands the pane.
    await expect(page.getByTestId('shell')).toHaveAttribute('data-face', '1', { timeout: 15_000 });
    const pane = page.locator('.face-active [data-testid="autoresearch-pane"]');
    await expect(pane).toBeVisible({ timeout: 15_000 });

    // …and the capacity travelled: the filter is already narrowed, no click.
    await expect(pane.locator('[data-testid="autoresearch-capacity-filter"]')).toHaveValue(
        'parashakti-graph-relational-ml'
    );
    await expect(pane.locator('[data-testid="autoresearch-error"]')).toHaveCount(0);
});
