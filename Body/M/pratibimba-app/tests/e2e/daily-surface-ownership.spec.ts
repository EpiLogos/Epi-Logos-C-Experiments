/**
 * Coordinate: M' M5-3' (daily surface ownership UI-flow — rerun 11.T11.3)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): 0/1 daily shell no-ORPHAN gate
 * Actualises: real-browser proof that the active daily receivers are mounted:
 *   live status and cymatic engine, vault-backed Library shelf overlay,
 *   journal timeline, and S2-backed Atelier cluster lens. It also proves the
 *   retired active-run widget is not advertised as a mounted daily receiver.
 * Public surface: Playwright daily ownership flow.
 * Does NOT own: gateway, vault, S2 graph, or legacy Theia packages.
 * Contract: [[M'-PORTAL-SPEC]] + rerun 11.T11.3.
 */

import { expect, test, type Locator } from '@playwright/test';

async function expandVaultPath(activeFace: Locator, segments: string[]) {
    let path = '';
    for (const segment of segments) {
        path = path ? `${path}/${segment}` : segment;
        await activeFace.getByTestId(`vault-dir-${path}`).click();
    }
}

test('every retained daily claim reaches its active receiver and the stale agent widget stays retired', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('shell')).toBeVisible();
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });

    await expect(page.getByTestId('status-strip')).toHaveAttribute(
        'data-daily-claims',
        'pratibimba.daily.status-display'
    );
    await expect(page.getByTestId('shell').getByText('Agent Check-In', { exact: true })).toHaveCount(0);

    const activePersonalFace = page.locator('.face-active');
    await activePersonalFace.locator('.flexlayout__border_button', { hasText: 'Journal' }).click();
    await expect(activePersonalFace.getByTestId('journal-timeline')).toBeVisible();

    await activePersonalFace.locator('.flexlayout__border_button', { hasText: 'Vault' }).click();
    const tree = activePersonalFace.getByTestId('vault-tree');
    await expect(tree).toBeVisible();
    await expect(tree).toHaveAttribute('data-projection-lens', 'pratibimba.daily.library-projection');
    await expandVaultPath(activePersonalFace, ['Bimba', 'World', 'Types', 'Coordinates', 'S', 'S1']);
    await expect(
        activePersonalFace.getByTestId('library-shelf-Bimba/World/Types/Coordinates/S/S1/S1.md')
    ).toHaveText('S1');

    await page.keyboard.press('Meta+.');
    await expect(page.getByTestId('shell')).toHaveAttribute('data-face', '0');
    await expect(page.getByTestId('cosmic-engine')).toBeVisible({ timeout: 20_000 });

    await page.locator('.face-active .flexlayout__tab_button', { hasText: 'Bimba' }).click();
    const graph = page.getByTestId('graph-explorer');
    await expect(graph).toBeVisible({ timeout: 20_000 });
    await expect(graph).toHaveAttribute(
        'data-projection-lens',
        'pratibimba.daily.atelier-cluster-lens'
    );
    await expect(graph).toHaveAttribute('data-atelier-clusters', /^\d+$/, { timeout: 20_000 });
    await expect(page.getByTestId('graph-status')).toContainText(/\d+ etymology clusters/);
});
