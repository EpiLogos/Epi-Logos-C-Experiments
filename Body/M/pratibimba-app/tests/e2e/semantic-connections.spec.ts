/**
 * Coordinate: M' M0'/M5' (semantic-connections real-UI proof - 28.T28.12)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): real Chromium + spawned S1/Hen gateway boundary
 * Actualises: note-scoped semantic query and honest no-index disclosure.
 * Public surface: Playwright semantic-connections flow.
 * Does NOT own: index generation, scoring, or vault mutation.
 * Contract: [[S1-SPEC]] / Track [[28.T28.12]].
 */

import { expect, test } from '@playwright/test';

test('semantic sidebar queries the real S1 gateway and discloses index state', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('status-gateway')).toContainText('connected', {
        timeout: 20_000
    });

    const activeFace = page.locator('.face-active');
    await activeFace.locator('.flexlayout__border_button', { hasText: 'Connections' }).click();
    const pane = activeFace.getByTestId('semantic-connections-pane');
    await expect(pane).toBeVisible();
    await expect(pane).toHaveAttribute(
        'data-view-id',
        'pratibimba.smart-connections-sidebar'
    );

    await pane.getByRole('button', { name: 'Find semantic connections' }).click();
    await expect(pane.getByTestId('semantic-staleness')).toHaveText('no-index', {
        timeout: 20_000
    });
    await expect(pane).toContainText('No indexed neighbours for this note.');
    await expect(pane).toContainText('smart_env index not present');
});
