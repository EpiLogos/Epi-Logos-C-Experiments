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
 *   this spec induces: the e2e sidecar pins `ui_state_load → null` (deterministic
 *   boots), so no coordinate is selected at boot, the M0 language reader is
 *   genuinely idle, and its registered empty state is what the reader sees.
 *   Nothing is stubbed to make that true.
 *
 *   It also carries the REAL negative that makes the positive mean something:
 *   after the walk publishes a live coordinate to the shared store, the S2 read
 *   lands and the empty state must be GONE. An empty state that rendered
 *   unconditionally would pass a positive-only test and would be wrong.
 *
 * BOOT/ROUTING BUDGET (added after the independent gate refused the first
 *   close): this file passed 2/2 in isolation and under a standalone
 *   `pnpm test:e2e`, and reported a 1.0m TEST TIMEOUT under the full repo gate,
 *   where app-ui-flow competes with the other suites for the machine. Three
 *   causes, all in the spec rather than in the registry:
 *   (a) the boot assertions ran on the 10s project default while the gateway
 *       check beside them got 20s — the same defect already fixed at
 *       `visual-regression.spec.ts:164` and `chrome-command-routing.spec.ts`
 *       (25.T25.21 flagged 28 further specs carrying it);
 *   (b) `⌘.` was pressed as a TOGGLE and face 0 asserted as an absolute, which
 *       holds only while boot face is 1 — an assumption, not a measurement. It
 *       is now read back and driven to the wanted face, then verified;
 *   (c) each of the six routed dispatches was followed by a flat 750ms sleep,
 *       which is simultaneously dead time and no guarantee. It now waits on the
 *       REAL routing signal (`cross-layout-intent-receiver` carrying the
 *       requested extension/contribution) and on the face the target ledger
 *       DECLARES — which is also what proves the sweep is looking at the right
 *       face rather than assuming it.
 *   The sweep and the negative are untouched: they are the acceptance.
 * Public surface: Playwright empty-state registry acceptance tests.
 * Does NOT own: the registry (src/ui/emptyStateRegistry.ts), the copy
 *   (src/ui/emptyStateGrammar.ts), the lint
 *   (scripts/lint-empty-state-registry.mjs), the M0 reader, face/layout law.
 * Contract: rerun tranche [[32.T32.6]].
 */

import { expect, test, type Page } from '@playwright/test';

/** Boot-sized budget — see BOOT/ROUTING BUDGET in the header. */
const BOOT_TIMEOUT = 20_000;

interface CopyBlock {
    readonly extensionId: string;
    readonly viewId: string;
    readonly header: string;
    readonly summary: string;
    readonly hint: string;
    readonly contributors: readonly { readonly bindingKey: string; readonly label: string }[];
    /** The face the target ledger DECLARES for this contribution. */
    readonly face: number | null;
}

/** The nine-id taxonomy, the six copy blocks, and each block's declared face —
 *  read from the RUNNING app's own modules rather than restated here, since a
 *  second copy could drift from the registry this spec exists to check. */
async function readAuthority(
    page: Page
): Promise<{ readonly states: readonly string[]; readonly grammar: readonly CopyBlock[] }> {
    return page.evaluate(async () => {
        const readiness = await import('/src/ui/bridgeReadiness.ts');
        const grammar = await import('/src/ui/emptyStateGrammar.ts');
        const crossLayout = await import('/src/commands/crossLayoutIntent.ts');
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
                })),
                face:
                    crossLayout.CROSS_LAYOUT_INTENT_TARGETS.find(
                        target =>
                            target.extensionId === entry.extensionId &&
                            target.contributionId === entry.viewId
                    )?.face ?? null
            }))
        };
    });
}

async function bootConnected(page: Page): Promise<void> {
    await page.goto('/');
    await expect(page.getByTestId('shell')).toBeVisible({ timeout: BOOT_TIMEOUT });
    await expect(page.getByTestId('status-gateway')).toContainText('connected', {
        timeout: BOOT_TIMEOUT
    });
}

/** Drive the shell to a known face and VERIFY it. `⌘.` is the # inversion
 *  toggle, so pressing it unconditionally asserts an outcome that only holds
 *  from an assumed starting face; the live attribute is read back first. */
async function ensureFace(page: Page, face: '0' | '1'): Promise<void> {
    const shell = page.getByTestId('shell');
    await expect(shell).toBeVisible({ timeout: BOOT_TIMEOUT });
    if ((await shell.getAttribute('data-face')) !== face) {
        await page.keyboard.press('Meta+.');
    }
    await expect(shell).toHaveAttribute('data-face', face, { timeout: BOOT_TIMEOUT });
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

/**
 * Dispatch, then wait on the REAL routing signal rather than a sleep: the
 * receiving host publishes the requested extension/contribution, and the ledger
 * says which face owns it. Asserting that face is what makes the `.face-active`
 * sweep below a measurement instead of an assumption.
 */
async function routeTo(page: Page, entry: CopyBlock): Promise<void> {
    await dispatchIntent(page, entry.extensionId, entry.viewId);
    if (entry.face !== null) {
        await expect(page.getByTestId('shell')).toHaveAttribute('data-face', String(entry.face), {
            timeout: BOOT_TIMEOUT
        });
    }
    // House idiom (medicine-view.spec.ts:38): the receiving FACE SLOT carries
    // the testid, and only one slot carries it at a time.
    const receiver = page.getByTestId('cross-layout-intent-receiver');
    await expect(receiver).toHaveAttribute('data-requested-extension-id', entry.extensionId, {
        timeout: BOOT_TIMEOUT
    });
    await expect(receiver).toHaveAttribute('data-requested-contribution-id', entry.viewId, {
        timeout: BOOT_TIMEOUT
    });
    // The routed host IS the active face — read back, not assumed. This is what
    // makes the `.face-active` sweep below a measurement of the right surface.
    await expect(receiver).toHaveClass(/face-active/, { timeout: BOOT_TIMEOUT });
}

test('32.T32.6: an empty M-family surface renders its REGISTERED empty state in the running app', async ({
    page
}) => {
    await bootConnected(page);

    const { states, grammar } = await readAuthority(page);
    expect(grammar).toHaveLength(6);
    const m0 = grammar.find(entry => entry.extensionId === 'm0-anuttara');
    expect(m0).toBeTruthy();

    await ensureFace(page, '0');
    await routeTo(page, m0!);

    // No coordinate is selected yet, so the M0 language reader is genuinely
    // idle — the empty state is the reader's real state, not an induced one.
    const empty = page
        .locator('.face-active [data-testid="mext-empty-state"][data-extension="m0-anuttara"]')
        .first();
    await expect(empty).toBeVisible({ timeout: BOOT_TIMEOUT });
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
    await expect(page.getByTestId('walk-node')).toContainText('M1', { timeout: BOOT_TIMEOUT });
    await routeTo(page, m0!);
    await expect(
        page.locator('.face-active [data-testid="mext-empty-state"][data-extension="m0-anuttara"]')
    ).toHaveCount(0, { timeout: BOOT_TIMEOUT });
});

test('32.T32.6: every empty state the live face renders is a registered one, in the one shape', async ({
    page
}) => {
    // Six routed dispatches, each a real face/layout transition against the
    // shared gateway. That is legitimately more work than the 60s per-test
    // default assumes under full-gate load; precedent m2-correspondence.spec.ts:171.
    test.setTimeout(120_000);

    await bootConnected(page);

    const { states, grammar } = await readAuthority(page);
    const registered = new Map(grammar.map(entry => [`${entry.extensionId} ${entry.viewId}`, entry]));

    await ensureFace(page, '0');

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
    const m0 = grammar.find(entry => entry.extensionId === 'm0-anuttara')!;
    await routeTo(page, m0);
    await expect(
        page.locator('.face-active [data-testid="mext-empty-state"][data-extension="m0-anuttara"]')
    ).toBeVisible({ timeout: BOOT_TIMEOUT });
    let seen = await sweep();
    expect(seen).toBeGreaterThan(0);

    // Then walk the other declared M-family contributions the empty states key
    // to. A healthy carrier with live data legitimately renders none of them —
    // that is the point of an empty state — but any that DO render obey the
    // same law, on the face the ledger says owns them.
    for (const entry of grammar.filter(block => block.extensionId !== 'm0-anuttara')) {
        await routeTo(page, entry);
        seen += await sweep();
    }
    expect(seen).toBeGreaterThan(0);
});
