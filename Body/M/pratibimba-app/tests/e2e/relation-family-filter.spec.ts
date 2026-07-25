/**
 * Coordinate: M' M0' (drivable-loop spec: relation-family filter — 28.T28.3)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): real Chromium / gateway carrier proof
 * Actualises: the UF half of 28.3(c). The unit tests prove the predicate and
 *   the never-infer classification law; only the running app can prove the
 *   filter is WIRED — that the control exists on the live Bimba surface, that
 *   pressing an option re-queries the graph, and that the surface reports what
 *   it is actually showing.
 *
 *   HONEST LIMIT, stated rather than papered over: this environment's S2 graph
 *   returns 900 :Bimba nodes and ZERO `(a:Bimba)-[r]->(b:Bimba)` edges — I
 *   confirmed that against the ORIGINAL query too, so it predates this tranche
 *   and is not caused by selecting `c_1_relation_family`. With no live edges
 *   there is nothing to narrow, so this spec does NOT claim to prove a
 *   non-trivial partition; asserting `filtered <= total` over 0 edges would
 *   pass while proving nothing. The partition law itself is proven over real
 *   inputs in graphExplorerFilter.test.ts and graphData.test.ts. What is proven
 *   HERE is the wiring: the control is on the live surface, it drives the
 *   pane's state, and the pane re-reports itself.
 * Does NOT own: S2 graph law, the edge classification (m0RelationFamily.ts),
 *   or the force-graph canvas.
 * Contract: [[M0'-SPEC]] + rerun tranche [[28.T28.3]] (DR-IG-1).
 */

import { expect, test } from '@playwright/test';

test('28.T28.3: the relation-family filter is wired to the live Bimba surface', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });

    const shell = page.getByTestId('shell');
    if ((await shell.getAttribute('data-face')) !== '0') {
        await page.keyboard.press('Meta+.');
    }
    await expect(shell).toHaveAttribute('data-face', '0', { timeout: 20_000 });

    await page.locator('.face-active .flexlayout__tab_button', { hasText: 'Bimba' }).click();
    const graph = page.getByTestId('graph-explorer');
    await expect(graph).toBeVisible({ timeout: 20_000 });

    // the control is really on the surface, with the brief's three options
    const filter = page.getByTestId('relation-family-filter');
    await expect(filter).toBeVisible();
    for (const option of ['all', 'structural', 'correspondential']) {
        await expect(page.getByTestId(`relation-family-${option}`)).toBeVisible();
    }
    await expect(graph).toHaveAttribute('data-relation-family-filter', 'all');
    await expect(page.getByTestId('relation-family-all')).toHaveAttribute('aria-pressed', 'true');

    // the unfiltered edge count, read off the live surface
    const detail = page.getByTestId('graph-explorer-detail');
    await expect(detail).toContainText('relations', { timeout: 20_000 });
    const readCount = async (): Promise<number> => {
        const text = (await detail.textContent()) ?? '';
        const match = /(\d+)(?:\s+of\s+(\d+))?\s+relations/.exec(text);
        return match ? Number(match[1]) : -1;
    };
    const total = await readCount();
    expect(total, 'the surface must report a relation count it can filter').toBeGreaterThanOrEqual(0);
    const liveEdges = total > 0;

    // narrowing to a family re-queries and reports a strict subset
    await page.getByTestId('relation-family-structural').click();
    await expect(graph).toHaveAttribute('data-relation-family-filter', 'structural');
    await expect(page.getByTestId('relation-family-structural')).toHaveAttribute('aria-pressed', 'true');
    await expect(detail).toContainText('(structural)', { timeout: 20_000 });
    // Only a graph that HAS edges can demonstrate narrowing. Guarded, and the
    // guard is reported — a silently-skipped assertion is the defect, an
    // openly-skipped one with a stated reason is not.
    if (liveEdges) {
        const structural = await readCount();
        expect(structural, 'a family can never hold MORE edges than the whole graph').toBeLessThanOrEqual(
            total
        );
    } else {
        // eslint-disable-next-line no-console
        console.log(
            '[28.T28.3] S2 returned 0 Bimba→Bimba edges in this environment; ' +
                'narrowing is proven in the unit suite, wiring is proven here.'
        );
    }

    // and returning to `all` restores the full set — the filter is a reading
    // choice, not a destructive one
    await page.getByTestId('relation-family-all').click();
    await expect(graph).toHaveAttribute('data-relation-family-filter', 'all');
    await expect(detail).not.toContainText('(structural)', { timeout: 20_000 });
    expect(await readCount()).toBe(total);
});
