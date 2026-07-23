/**
 * Coordinate: M' M5' (Dispatch Trace genealogy — Track 27.T27.3, UF class)
 * Actualises: the real Chromium proof that the Dispatch tab body IS the
 *   Pi -> Anima -> subagent invocation genealogy (the ONE allowed agentic
 *   path), folded from live sessions — NOT a genealogy-blind composition
 *   timeline. Composition observability survives only as a subordinate
 *   <details> section. The jsdom mount (DispatchTracePanel.test.tsx) proves
 *   the wiring; this proves it opens in the real app against the real gateway.
 */

import { expect, test } from '@playwright/test';

test('27.T27.3: the Dispatch tab renders the Pi → subagent genealogy, not a composition timeline', async ({
    page
}) => {
    await page.goto('/');
    const shell = page.getByTestId('shell');
    await expect(shell).toBeVisible();
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });

    const dispatch = page
        .locator('.face-active .flexlayout__border_button', { hasText: 'Dispatch' })
        .first();
    await dispatch.click();
    await expect(shell).toHaveAttribute('data-omnipanel-active-tab', 'dispatch-trace');

    // The body is the genealogy panel — the real Pi -> subagent tree face.
    await expect(page.getByTestId('dispatch-trace-panel')).toBeVisible();
    await expect(page.getByTestId('dispatch-trace-header')).toContainText('Pi → Anima → subagent');
    await expect(page.getByTestId('dispatch-genealogy-tree')).toBeVisible();

    // Composition observability is retained but strictly subordinate — a
    // collapsed <details>, never the dispatch trace itself.
    const subordinate = page.getByTestId('dispatch-composition-observability');
    await expect(subordinate).toBeVisible();
    expect(await subordinate.evaluate(el => el.tagName.toLowerCase())).toBe('details');
});
