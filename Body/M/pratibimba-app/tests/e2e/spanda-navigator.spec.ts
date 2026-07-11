/**
 * Coordinate: M' M1-3' (drivable-loop spec: the spanda walk navigator)
 * Actualises: 22.T22.1's UF proof — the navigator face drives the REAL
 *   engine-walk through the real UI against the real spawned gateway:
 *   hold freezes the organism (tick constant while generations advance on
 *   the status strip), walking lands on the asked stop, the involutions
 *   answer by name, release flows again. A jsdom mount cannot pass this:
 *   only the live gateway carries the anchor and honours the walk.
 * Does NOT own: the walk methods (02.T2.13), the wire block (02.T2.14).
 */

import { expect, test } from '@playwright/test';

async function openNavigator(page: import('@playwright/test').Page): Promise<void> {
    await page.goto('/');
    await expect(page.getByTestId('shell')).toBeVisible();
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });
    await page.keyboard.press('Meta+.');
    await expect(page.getByTestId('shell')).toHaveAttribute('data-face', '0');
    // House idiom (visual-panes.spec): the tab BUTTON node scoped to the
    // active face — getByText also matches flexlayout's off-screen
    // measuring copy of the tabstrip.
    await page.locator('.face-active .flexlayout__tab_button', { hasText: 'Spanda' }).click();
    await expect(page.getByTestId('spanda-navigator')).toBeVisible({ timeout: 15_000 });
}

test('the navigator holds, walks, reflects, and releases the live organism', async ({ page }) => {
    await openNavigator(page);

    // The anchor rides the bus — the face renders transport, not the
    // honest-absence message.
    await expect(page.getByTestId('spanda-transport-pending')).toHaveCount(0);
    await expect(page.getByTestId('spanda-navigator')).toHaveAttribute('data-mode', 'flowing');

    // Hold: the organism freezes while the portal keeps pulsing — the
    // active stop stays put across ≥2 heartbeat samples.
    await page.getByTestId('spanda-hold').click();
    await expect(page.getByTestId('spanda-navigator')).toHaveAttribute('data-mode', 'held', {
        timeout: 5_000
    });
    const heldStop = await page
        .locator('[data-testid^="spanda-stop-"][data-active="true"]')
        .getAttribute('data-testid');
    await page.waitForTimeout(2_200); // > two heartbeat samples
    await expect(page.locator(`[data-testid="${heldStop}"]`)).toHaveAttribute(
        'data-active',
        'true'
    );

    // Walk to a chosen stop: it lands and rides the stream.
    const heldIndex = Number(heldStop?.replace('spanda-stop-', '') ?? '0');
    const target = (heldIndex + 3) % 12;
    await page.getByTestId(`spanda-stop-${target}`).click();
    await expect(page.getByTestId(`spanda-stop-${target}`)).toHaveAttribute('data-active', 'true', {
        timeout: 5_000
    });

    // The reflection involution answers by name: 11−n.
    await page.getByTestId('spanda-reflect').click();
    await expect(page.getByTestId(`spanda-stop-${11 - target}`)).toHaveAttribute(
        'data-active',
        'true',
        { timeout: 5_000 }
    );

    // The half-turn involution: n+6 mod 12.
    await page.getByTestId('spanda-half-turn').click();
    await expect(page.getByTestId(`spanda-stop-${(11 - target + 6) % 12}`)).toHaveAttribute(
        'data-active',
        'true',
        { timeout: 5_000 }
    );

    // Release: the flow resumes — the active stop moves again.
    await page.getByTestId('spanda-release').click();
    await expect(page.getByTestId('spanda-navigator')).toHaveAttribute('data-mode', 'flowing', {
        timeout: 5_000
    });
    const releasedStop = await page
        .locator('[data-testid^="spanda-stop-"][data-active="true"]')
        .getAttribute('data-testid');
    await expect
        .poll(
            async () =>
                page
                    .locator('[data-testid^="spanda-stop-"][data-active="true"]')
                    .getAttribute('data-testid'),
            { timeout: 6_000 }
        )
        .not.toBe(releasedStop);
});
