/**
 * Coordinate: M' (drivable-loop spec: session surface)
 * Actualises: gateway state reflected in the face — the test creates a REAL
 *   session record on the spawned gateway over the wire (`sessions.import`,
 *   probed live: sessions.* respond on this gateway per the T5 method audit),
 *   then proves the app lists and binds it. Gateway SessionStore → wire →
 *   SessionsPane → status strip, no fakes anywhere in the loop.
 */

import { expect, test } from '@playwright/test';
import { gatewayRpc } from './gateway-rpc';

test('a real gateway session record surfaces in the sessions pane and binds', async ({ page }) => {
    // create a REAL session record in the spawned gateway's SessionStore
    const sessionKey = `e2e-drivable-loop-${Date.now().toString(36)}`;
    const result = (await gatewayRpc('sessions.import', {
        targetSessionKey: sessionKey,
        sourceSessionKey: 'e2e-origin',
        label: 'e2e drivable loop'
    })) as { ok?: boolean; canonicalKey?: string };
    expect(result?.canonicalKey, 'sessions.import returned no canonicalKey').toBeTruthy();
    const canonicalKey = result.canonicalKey as string;

    await page.goto('/');
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });

    // open the `/` membrane's sessions tab on the active (personal) face
    await page
        .locator('.face-active .flexlayout__border_button', { hasText: 'sessions' })
        .click();
    const sessionButton = page.getByTestId(`session-${canonicalKey}`);
    await expect(sessionButton, 'gateway session record did not surface in the pane').toBeVisible({
        timeout: 15_000
    });

    // bind it and watch the status strip carry the live session key
    await sessionButton.click();
    await expect(page.getByTestId('status-session')).toContainText(canonicalKey);
});
