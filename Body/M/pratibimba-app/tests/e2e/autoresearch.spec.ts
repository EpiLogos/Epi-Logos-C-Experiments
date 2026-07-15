/**
 * Coordinate: M' M5' (Autoresearch drivable-loop - 28.T28.10)
 * Actualises: the real Chromium + spawned-gateway proof that the designated
 *   Autoresearch tab mounts, consumes S5 state, and discloses governance
 *   without fabricating a recompose-pass ordinal.
 */

import { expect, test } from '@playwright/test';
import { gatewayRpc } from './gateway-rpc';

test('Autoresearch mounts over the real S5 wire with governed, honest state', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });

    await page
        .locator('.face-active .flexlayout__tab_button', { hasText: 'Autoresearch' })
        .click();

    await expect(page.getByTestId('autoresearch-pane')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('autoresearch-as-concept')).toContainText('forbidden_authority');
    await expect(page.getByTestId('autoresearch-dry-run')).toContainText('dry-run enforced');
    await expect(page.getByTestId('autoresearch-recompose-pass')).toContainText('not projected');
    await expect(page.getByText('Surface', { exact: true })).toHaveAttribute('aria-current', 'step');
    await expect(page.getByTestId('autoresearch-capacity-filter').locator('option')).toHaveCount(7);
    await expect(page.getByTestId('autoresearch-empty')).toBeVisible();
    await expect(page.getByTestId('autoresearch-error')).toHaveCount(0);
});

test('Autoresearch dispatches a linked review through the cross-layout intent spine', async ({ page }) => {
    const reviewResult = await gatewayRpc("s5'.review.submit", {
        source: 'autoresearch',
        title: 'Cross-layout intent proof',
        body: 'Real S5 record for the Autoresearch to Review browser flow.',
        priority: 'normal',
        coordinate_context: { coordinate: "M5-4'" },
        requires_human: true,
        governance_profile: {
            category: 'standard_improvement',
            gate_kind: 'standard',
            governance_level: 'advisory',
            target_subsystem: 'Epii',
            promotion_destination: 'seeds'
        }
    }) as { item: { item_id: string } };
    const reviewId = reviewResult.item.item_id;

    await gatewayRpc("s5'.improve.propose", {
        target_family: 'M5',
        target_coordinate: "M5-4'",
        direction: 'Exercise the active-carrier cross-layout intent dispatcher',
        source_review_item_id: reviewId,
        baseline: { path: 'Idea/Bimba/Seeds/M/M5/M5-SPEC.md' }
    });

    await page.goto('/');
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });
    await page.locator('.face-active .flexlayout__tab_button', { hasText: 'Autoresearch' }).click();

    const candidate = page.locator(
        `[data-testid="autoresearch-candidate"][data-review-id="${reviewId}"]`
    );
    await expect(candidate).toBeVisible({ timeout: 15_000 });
    await candidate.getByTestId('autoresearch-open-review').click();

    await expect(page.getByTestId('review-blocks-pane')).toBeVisible();
    await expect(page.getByTestId('review-request-target')).toContainText(reviewId);
});
