/**
 * Coordinate: M' shell (empty-state grammar per extension, real-browser proof —
 *   Track 32.T32.6, UF class)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): #4 — the empty-state context frame, proven where it renders
 * Actualises: the app-flow proof that the registry is not merely declared.
 *   Track 32 is UF class: a jsdom mount can show that a component renders when
 *   handed props, but only the running face can show that a real M-family
 *   surface, in a real empty condition, resolves its empty state THROUGH the
 *   registry against the live readiness store.
 *
 *   The positive rides a condition the app reaches on its own rather than one
 *   this spec induces: on boot no coordinate is selected, so the M0 language
 *   reader is genuinely idle and its registered empty state is what the reader
 *   sees. Nothing is stubbed to make that true.
 *
 *   It also carries the REAL negative that makes the positive mean something:
 *   after the walk publishes a live coordinate to the shared store, the S2 read
 *   lands and the empty state must be GONE. An empty state that rendered
 *   unconditionally would pass a positive-only test and would be wrong.
 * Public surface: Playwright test over the spawned gateway.
 * Does NOT own: the registry (src/ui/emptyStateRegistry.ts), the copy
 *   (src/ui/emptyStateGrammar.ts), the lint
 *   (scripts/lint-empty-state-registry.mjs), the M0 reader.
 * Contract: rerun tranche [[32.T32.6]].
 */

import { expect, test, type Page } from '@playwright/test';

interface CopyBlock {
    readonly extensionId: string;
    readonly viewId: string;
    readonly header: string;
    readonly summary: string;
    readonly hint: string;
    readonly contributors: readonly { readonly bindingKey: string; readonly label: string }[];
}

/** The nine-id taxonomy and the six copy blocks, read from the RUNNING app's
 *  own modules rather than restated here — a second copy could drift. */
async function readAuthority(
    page: Page
): Promise<{ readonly states: readonly string[]; readonly grammar: readonly CopyBlock[] }> {
    return page.evaluate(async () => {
        const readiness = await import('/src/ui/bridgeReadiness.ts');
        const grammar = await import('/src/ui/emptyStateGrammar.ts');
        return {
            states: [...readiness.BRIDGE_READINESS_IDS],
            grammar: grammar.M_EMPTY_STATE_GRAMMAR.map(entry => ({
                extensionId: entry.extensionId,
                viewId: entry.viewId,
                header: entry.header,
                summary: entry.summary,
                hint: entry.hint,
                contributors: entry.contributors.map(contributor => ({
                    bindingKey: contributor.bindingKey,
                    label: contributor.label
                }))
            }))
        };
    });
}

/** Route to a declared M-family contribution through the real cross-layout
 *  intent command — the same path any chrome affordance takes. */
async function dispatchIntent(
    page: Page,
    requestedExtensionId: string,
    requestedContributionId: string
): Promise<void> {
    await page.evaluate(
        async ([extensionId, contributionId]) => {
            const registry = await import('/src/commands/registry.ts');
            const crossLayout = await import('/src/commands/crossLayoutIntent.ts');
            const stores = await import('/src/state/stores.ts');
            const privacyClass = stores.useSessionStore.getState().privacyClass;
            await registry.commands.execute(crossLayout.CROSS_LAYOUT_INTENT_COMMAND, {
                coordinate: stores.useCoordinateStore.getState().selected,
                artifactUri: null,
                reviewId: null,
                dayNow: stores.useSessionStore.getState().dayNow,
                sessionKey: stores.useSessionStore.getState().sessionKey,
                profileGeneration: stores.useTickStore.getState().generation,
                privacyClass:
                    privacyClass === 'public' || privacyClass === 'protected' || privacyClass === 'private'
                        ? privacyClass
                        : null,
                requestedExtensionId: extensionId,
                requestedContributionId: contributionId
            });
        },
        [requestedExtensionId, requestedContributionId]
    );
}

test('32.T32.6: an empty M-family surface renders its REGISTERED empty state in the running app', async ({
    page
}) => {
    await page.goto('/');
    const shell = page.getByTestId('shell');
    await expect(shell).toBeVisible();
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });

    const { states, grammar } = await readAuthority(page);
    expect(grammar).toHaveLength(6);
    const m0 = grammar.find(entry => entry.extensionId === 'm0-anuttara');
    expect(m0).toBeTruthy();

    await page.keyboard.press('Meta+.');
    await expect(shell).toHaveAttribute('data-face', '0');
    await dispatchIntent(page, 'm0-anuttara', 'language');

    // No coordinate is selected yet, so the M0 language reader is genuinely
    // idle — the empty state is the reader's real state, not an induced one.
    const empty = page
        .locator('.face-active [data-testid="mext-empty-state"][data-extension="m0-anuttara"]')
        .first();
    await expect(empty).toBeVisible({ timeout: 20_000 });
    await expect(empty).toHaveAttribute('data-view', 'language');

    // The 32.6 shape: header + summary + missing-contributors + reasons table.
    await expect(empty.getByTestId('mext-empty-state-title')).toHaveText(m0!.header);
    await expect(empty.getByTestId('mext-empty-state-summary')).toHaveText(m0!.summary);
    await expect(empty.getByTestId('mext-empty-state-missing')).toBeVisible();
    await expect(empty.getByTestId('mext-empty-state-reasons')).toBeVisible();

    // The shared 30.6 <EmptyState> primitive is LIVE inside it — before this
    // tranche it had no production call site anywhere in the carrier.
    const primitive = empty.getByTestId('empty-state');
    await expect(primitive).toBeVisible();
    await expect(primitive).toHaveAttribute('aria-label', `Nothing here yet. ${m0!.hint}`);

    // Every reasons row names a real binding, a real nine-id state and an owner.
    const rows = empty.getByTestId('mext-empty-state-reason');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);
    const declaredBindings = new Set(m0!.contributors.map(contributor => contributor.bindingKey));
    for (let index = 0; index < rowCount; index += 1) {
        const row = rows.nth(index);
        expect(declaredBindings.has((await row.getAttribute('data-binding')) ?? '')).toBe(true);
        expect(states).toContain((await row.getAttribute('data-readiness')) ?? '');
        await expect(row).toContainText(/track \S+/);
    }

    // THE NEGATIVE: give the reader a real coordinate and the empty state must
    // go. The walk publishes a live node from the spawned gateway to the shared
    // coordinate store, and the S2 read that follows is real data.
    await page.locator('.face-active .flexlayout__tab_button', { hasText: 'Walk' }).click();
    await expect(page.getByTestId('walk-node')).toContainText('M1', { timeout: 20_000 });
    await dispatchIntent(page, 'm0-anuttara', 'language');
    await expect(
        page.locator('.face-active [data-testid="mext-empty-state"][data-extension="m0-anuttara"]')
    ).toHaveCount(0, { timeout: 20_000 });
});

test('32.T32.6: every empty state the live face renders is a registered one, in the one shape', async ({
    page
}) => {
    await page.goto('/');
    await expect(page.getByTestId('shell')).toBeVisible();
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });

    const { states, grammar } = await readAuthority(page);
    const registered = new Map(grammar.map(entry => [`${entry.extensionId} ${entry.viewId}`, entry]));

    await page.keyboard.press('Meta+.');
    await expect(page.getByTestId('shell')).toHaveAttribute('data-face', '0');

    /** Hold every empty state currently on the active face to the registry. */
    const sweep = async (): Promise<number> => {
        const nodes = page.locator('.face-active [data-testid="mext-empty-state"]');
        const count = await nodes.count();
        for (let index = 0; index < count; index += 1) {
            const node = nodes.nth(index);
            const key = `${await node.getAttribute('data-extension')} ${await node.getAttribute('data-view')}`;
            const block = registered.get(key);
            // An unregistered surface renders the named-gap fallback; the lint
            // makes that unreachable and this holds the running app to it.
            expect(block, `unregistered empty state on the live face: ${key}`).toBeTruthy();
            await expect(node.getByTestId('mext-empty-state-title')).toHaveText(block!.header);
            await expect(node.getByTestId('empty-state')).toHaveAttribute(
                'aria-label',
                `Nothing here yet. ${block!.hint}`
            );
            expect(['true', 'false']).toContain(await node.getAttribute('data-activated'));
            const rows = node.getByTestId('mext-empty-state-reason');
            for (let row = 0; row < (await rows.count()); row += 1) {
                expect(states).toContain((await rows.nth(row).getAttribute('data-readiness')) ?? '');
            }
        }
        expect(
            await page.getByTestId('mext-empty-state-unregistered').count(),
            'a surface rendered the unregistered-gap fallback'
        ).toBe(0);
        return count;
    };

    // Anchor on a surface that is EMPTY for real: no coordinate is selected on
    // boot, so the M0 language reader is idle. Waiting for it makes the sweep
    // non-vacuous by construction rather than by luck.
    await dispatchIntent(page, 'm0-anuttara', 'language');
    await expect(
        page.locator('.face-active [data-testid="mext-empty-state"][data-extension="m0-anuttara"]')
    ).toBeVisible({ timeout: 20_000 });
    let seen = await sweep();
    expect(seen).toBeGreaterThan(0);

    // Then walk the other declared M-family contributions the empty states key
    // to. A healthy carrier with live data legitimately renders none of them —
    // that is the point of an empty state — but any that DO render obey the
    // same law.
    for (const entry of grammar.filter(block => block.extensionId !== 'm0-anuttara')) {
        await dispatchIntent(page, entry.extensionId, entry.viewId);
        // Give the routed surface a commit; whatever is mounted at that point
        // is what a reader arriving at the contribution would see.
        await page.waitForTimeout(750);
        seen += await sweep();
    }
    expect(seen).toBeGreaterThan(0);
});
