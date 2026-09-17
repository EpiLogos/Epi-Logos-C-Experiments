/**
 * Coordinate: M' M0-3' (community + clock overlay, 09.T9.6)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): M0-3' real-wire UI-flow verification boundary
 * Actualises: Chromium proof that the time/community rail invokes the real S2
 *   GDS tangent-overlay method and distinguishes its synchronic result from the
 *   kernel-profile world clock and handle-only Graphiti episode disclosure.
 * Public surface: Playwright test for the mounted M0CommunityClockPanel.
 * Does NOT own: S2 GDS computation, profile clock law, or Graphiti episode bodies.
 * Contract: [[M0'-SPEC]] + [[09-integrated-bimba-graph-reconciliation]] 09.T9.6.
 */

import { expect, test } from '@playwright/test';
import { gatewayRpc } from './gateway-rpc';

interface LiveOverlay {
    status: string;
    privacyBoundaryStatus: string;
    reason?: string;
    canonicalWritePerformed: boolean;
}

test('M0-3 community + clock panel renders the real S2 overlay beside the live world clock', async ({
    page
}) => {
    const result = (await gatewayRpc('s2.graph.gds.tangent_overlay', {
        coordinate: 'M1',
        topK: 12
    })) as { artifact?: LiveOverlay } & LiveOverlay;
    const expected = result.artifact ?? result;

    expect(expected.status).toBeTruthy();
    expect(expected.privacyBoundaryStatus).toBe(
        'public-coordinate-topology-only-excludes-protected-local-labels'
    );
    expect(expected.canonicalWritePerformed).toBe(false);

    await page.goto('/');
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });
    await page.keyboard.press('Meta+.');
    await expect(page.getByTestId('shell')).toHaveAttribute('data-face', '0');

    await page.locator('.face-active .flexlayout__tab_button', { hasText: 'Walk' }).click();
    await expect(page.getByTestId('walk-node')).toContainText('M1', { timeout: 20_000 });
    await page.locator('.face-active .flexlayout__tab_button', { hasText: 'Bimba' }).click();

    await page.getByTestId('m0-layer-time-community').click();
    const panel = page.getByTestId('m0-community-clock-panel');
    await expect(panel).toBeVisible();
    await expect(panel).toHaveAttribute('data-coordinate', 'M1');
    await expect(panel).toHaveAttribute('data-overlay-status', expected.status, { timeout: 20_000 });
    await expect(panel.getByTestId('m0-synchronic-community')).toContainText(expected.status);
    await expect(panel.getByTestId('m0-synchronic-community')).toContainText(
        expected.privacyBoundaryStatus
    );
    if (expected.reason) {
        await expect(panel.getByTestId('m0-synchronic-community')).toContainText(expected.reason);
    }

    await expect(panel.getByTestId('m0-diachronic-clock')).toHaveAttribute('data-clock-state', 'derived');
    await expect(panel.getByTestId('m0-world-clock-tick')).toContainText(/tick\s+\d+\s+·\s+\d+°/);
    await expect(panel.getByTestId('m0-graphiti-episodes')).toContainText(
        /No public episode handles emitted|episode:/
    );
});
