/**
 * Coordinate: M' `/` membrane (OmniPanel traversal acceptance - 27.T27.13)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): real Chromium / gateway carrier proof
 * Actualises: every declared OmniPanel fold is reachable in both layouts and
 *   the selected fold survives the real cross-layout route.
 * Public surface: Playwright traversal acceptance test.
 * Does NOT own: tab body semantics, profile production, or route targeting.
 * Contract: [[M'-SYSTEM-SPEC]] / [[27-omnipanel-tabs-deep]].
 */

import { expect, Page, test } from '@playwright/test';

const OMNI_TABS = [
    ['Pi', 'pi-chat'],
    ['Sessions', 'sessions'],
    ['Dispatch', 'dispatch-trace'],
    ['Tools', 'tool-stream'],
    ['Evidence', 'evidence'],
    ['Review', 'review'],
    ['Gateway', 'gateway'],
    ['Diagnostics', 'diagnostics'],
    ['Tuning', 'tuning']
] as const;

async function activateEveryOmniTab(page: Page): Promise<void> {
    const shell = page.getByTestId('shell');
    for (const [label, id] of OMNI_TABS) {
        const tab = page.locator('.face-active .flexlayout__border_button', {
            hasText: label
        }).first();
        await expect(tab).toBeVisible();
        const box = await tab.boundingBox();
        expect(box).not.toBeNull();
        await tab.click({
            position: {
                x: Math.min(24, box!.width - 1),
                y: Math.max(1, box!.height - 3)
            }
        });
        await expect(tab).toHaveClass(/--selected/);
        await expect(shell).toHaveAttribute('data-omnipanel-active-tab', id);
    }
}

async function routeToIdeDeep(page: Page): Promise<void> {
    const generationText = await page.getByTestId('status-tick').textContent();
    const generation = Number(generationText?.match(/\d+/)?.[0]);
    expect(Number.isInteger(generation)).toBeTruthy();

    await page.evaluate(async profileGeneration => {
        const registry = await import('/src/commands/registry.ts');
        const crossLayout = await import('/src/commands/crossLayoutIntent.ts');
        await registry.commands.execute(crossLayout.CROSS_LAYOUT_INTENT_COMMAND, {
            coordinate: 'M3-3',
            artifactUri: "Idea/Bimba/Seeds/M/M3'/M3'-SPEC.md",
            reviewId: null,
            dayNow: '20-07-2026',
            sessionKey: 'e2e-omnipanel-traversal',
            profileGeneration,
            privacyClass: 'protected',
            requestedExtensionId: 'm3-mahamaya',
            requestedContributionId: 'codon'
        });
    }, generation);
}

test('27.T27.13: every OmniPanel fold is traversable in both layouts and selection persists', async ({ page }) => {
    await page.goto('/');
    const shell = page.getByTestId('shell');
    await expect(shell).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });
    await expect(page.getByTestId('status-tick')).toHaveText(/\d+/, { timeout: 20_000 });

    await activateEveryOmniTab(page);
    const evidence = page.locator('.face-active .flexlayout__border_button', { hasText: 'Evidence' }).first();
    await evidence.click();
    await expect(shell).toHaveAttribute('data-omnipanel-active-tab', 'evidence');

    await routeToIdeDeep(page);
    await expect(shell).toHaveAttribute('data-active-layout', 'ide-deep');
    await expect(shell).toHaveAttribute('data-omnipanel-active-tab', 'evidence');

    await activateEveryOmniTab(page);
});

/**
 * 27.T27.9 acceptance extension: an OmniPanel-internal CrossLayoutIntent routes
 * to the target fold, the per-tab payload is applied to the live session store,
 * and the membrane reveals — driven through the real registered command in a
 * real browser (UF-class proof).
 */
async function selectOmniTab(page: Page, label: string): Promise<void> {
    const tab = page.locator('.face-active .flexlayout__border_button', { hasText: label }).first();
    await expect(tab).toBeVisible();
    const box = await tab.boundingBox();
    expect(box).not.toBeNull();
    // Same safe click position as activateEveryOmniTab — the face-toggle chrome
    // overlaps the top-right of the border button and would intercept a
    // center click.
    await tab.click({
        position: { x: Math.min(24, box!.width - 1), y: Math.max(1, box!.height - 3) }
    });
}

async function routeOmniIntent(
    page: Page,
    over: { requestedExtensionId: string; requestedContributionId: string; artifactUri?: string | null }
): Promise<void> {
    const generationText = await page.getByTestId('status-tick').textContent();
    const generation = Number(generationText?.match(/\d+/)?.[0]);
    await page.evaluate(async ({ profileGeneration, over: intentOver }) => {
        const registry = await import('/src/commands/registry.ts');
        const router = await import('/src/panes/omni/omnipanelIntentRouter.ts');
        await registry.commands.execute(router.OMNIPANEL_INTENT_ROUTE_COMMAND, {
            coordinate: null,
            artifactUri: intentOver.artifactUri ?? null,
            reviewId: null,
            dayNow: null,
            sessionKey: 'e2e-omnipanel-intent-route',
            profileGeneration,
            privacyClass: 'protected',
            requestedExtensionId: intentOver.requestedExtensionId,
            requestedContributionId: intentOver.requestedContributionId
        });
    }, { profileGeneration: generation, over });
}

test('27.T27.9: OmniPanel intent → tab activation → per-tab state applied → membrane revealed', async ({ page }) => {
    await page.goto('/');
    const shell = page.getByTestId('shell');
    await expect(shell).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });
    await expect(page.getByTestId('status-tick')).toHaveText(/\d+/, { timeout: 20_000 });

    // Start on a non-target fold so the route is an observable transition.
    await selectOmniTab(page, 'Pi');
    await expect(shell).toHaveAttribute('data-omnipanel-active-tab', 'pi-chat');

    // Route an ide-shell evidence selection into the OmniPanel Evidence fold.
    await routeOmniIntent(page, {
        requestedExtensionId: 'ide-shell-m0-m5',
        requestedContributionId: 'evidence-pane.select-packet',
        artifactUri: 'pkt-e2e-27-9'
    });

    // Tab activated AND the membrane observably revealed — assert the RENDERED
    // outcome, not a store flag: the Evidence border button is selected (the real
    // FlexLayout expand+select) and the Evidence fold body is visible.
    await expect(shell).toHaveAttribute('data-omnipanel-active-tab', 'evidence');
    const evidenceButton = page.locator('.face-active .flexlayout__border_button', { hasText: 'Evidence' }).first();
    await expect(evidenceButton).toHaveClass(/--selected/);
    await expect(page.getByTestId('evidence-panel')).toBeVisible();

    // Per-tab state applied to the live shared session store (the same store the
    // ide-shell evidence-panel and OmniPanel Evidence fold both read).
    const selectedPacketId = await page.evaluate(async () => {
        const session = await import('/src/panes/omni/omnipanelSessionState.ts');
        return session.readOmniPanelSessionState().perTabState.evidence.selectedPacketId;
    });
    expect(selectedPacketId).toBe('pkt-e2e-27-9');

    // A second internal route reaches a different fold and applies its sub-section
    // — proving the table (not a single hard-wired path) with an observable render:
    // the Diagnostics fold body reflects the routed kernel-bridge sub-section.
    await routeOmniIntent(page, {
        requestedExtensionId: 'omnipanel-shell',
        requestedContributionId: 'gateway.open-bridge-readiness'
    });
    await expect(shell).toHaveAttribute('data-omnipanel-active-tab', 'diagnostics');
    const diagnosticsButton = page.locator('.face-active .flexlayout__border_button', { hasText: 'Diagnostics' }).first();
    await expect(diagnosticsButton).toHaveClass(/--selected/);
    await expect(page.getByTestId('diagnostics-body')).toHaveAttribute('data-active-section', 'kernel-bridge');
});
