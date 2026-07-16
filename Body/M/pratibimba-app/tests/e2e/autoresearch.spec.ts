/**
 * Coordinate: M' M5' (Autoresearch drivable-loop - 28.T28.10)
 * Actualises: the real Chromium + spawned-gateway proof that the designated
 *   Autoresearch tab mounts, consumes S5 state, and discloses governance
 *   without fabricating a recompose-pass ordinal.
 */

import { expect, test } from '@playwright/test';
import { SIDECAR_URL, todayId } from './e2e-env';
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
    await expect(page.getByTestId('autoresearch-capacity-matrix').getByRole('button')).toHaveCount(6);
    await expect(page.getByTestId('autoresearch-empty')).toBeVisible();
    await expect(page.getByTestId('autoresearch-error')).toHaveCount(0);

    // 28.11d/15.6: the shared bridge-readiness badge is mounted inline at the
    // pane's s5'.improve.history binding and renders a valid nine-id readiness
    // in the real app flow (not a jsdom mount) — provenance lives at the datum.
    const readinessBadge = page.locator(`[data-binding="s5'.improve.history"]`);
    await expect(readinessBadge).toBeVisible();
    await expect(readinessBadge).toHaveAttribute(
        'data-readiness',
        /^(bridge_unavailable|profile_missing_field|s2_graph_blocked|s3_subscription_blocked|s5_review_blocked|authority_payload_missing|privacy_blocked|degraded_but_readable|ready_public_current)$/
    );
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

test('Autoresearch pair composition invokes Sophia over a real persisted Q-review queue', async ({ page, request }) => {
    const beginToday = await request.post(`${SIDECAR_URL}/invoke`, {
        data: { cmd: 'begin_today', args: {} }
    });
    expect(beginToday.ok()).toBeTruthy();
    const embedding = Array.from({ length: 3072 }, () => 0.5);
    await gatewayRpc("s5'.improve.q_review.run", {
        corpus_snapshot: {
            day_id: todayId(),
            graph_revision: 7,
            nodes: [
                {
                    coordinate: 'M5-0',
                    namespace: 'bimba',
                    c_4_family: 'M',
                    c_4_ql_position: '5',
                    c_4_lens: 'L5',
                    q_values: { q_5_i0_integration_template: 'canonical return' },
                    review_epochs: { qm_5_i0_review_epoch: 7 },
                    embedding_3072: embedding
                },
                {
                    coordinate: 'M5-1',
                    namespace: 'bimba',
                    c_4_family: 'M',
                    c_4_ql_position: '5',
                    c_4_lens: 'L5',
                    q_values: {},
                    review_epochs: { qm_5_i0_review_epoch: 7 },
                    embedding_3072: embedding
                }
            ]
        },
        last_review_epoch: 7
    });

    await page.goto('/');
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });
    await page.locator('.face-active .flexlayout__tab_button', { hasText: 'Autoresearch' }).click();

    await expect(page.getByTestId('autoresearch-q-review-entry')).toBeVisible({ timeout: 15_000 });
    await page.getByTestId('autoresearch-open-pair-composition').click();
    await page.getByLabel('Rationale').fill('integration gathers crossings and releases a governed return');
    await page.getByLabel('Opening question').fill('Which crossing still lacks a return path?');
    await page.getByTestId('q-pair-compose').click();
    await expect(page.getByLabel('Candidate articulation')).toHaveValue(
        'Like a river lock, integration gathers crossings and releases a governed return.'
    );
});
