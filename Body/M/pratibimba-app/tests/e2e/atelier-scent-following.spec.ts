/**
 * Coordinate: M' M5-5' (Atelier scent-following drivable-loop — Track 26.T26.3)
 * Actualises: the real Chromium proof (UF class) that the six scent-following
 *   commands (root → cognate → drift → psychoid → pros-hen → Möbius write-back)
 *   register in the live command registry and surface in the command palette of
 *   the real app — the app-flow proof a jsdom mount cannot give. The bodies (each
 *   riding its real capability route) are proven by the unit contract in
 *   src/commands/atelier.test.ts.
 */

import { expect, test } from '@playwright/test';

test('the six Atelier scent-following commands are live in the real command palette', async ({
    page
}) => {
    await page.goto('/');
    await expect(page.getByTestId('shell')).toBeVisible();
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });

    await page.keyboard.press('Meta+Shift+P');
    await expect(page.getByTestId('command-palette')).toBeVisible();
    await page.getByTestId('palette-input').fill('Atelier');

    // All six scent-following stages are catalogued + registered (the palette
    // renders them whether enabled or not); the real registry produced them.
    for (const id of [
        'atelier.etymologyRoot',
        'atelier.cognateSearch',
        'atelier.semanticDrift',
        'atelier.psychoidTrace',
        'atelier.prosHen',
        'atelier.scentFollow'
    ]) {
        await expect(page.getByTestId(`palette-item-${id}`)).toBeVisible();
    }
});
