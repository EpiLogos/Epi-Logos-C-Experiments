/**
 * Coordinate: M' shell (error UX grammar + Diagnostics deep-link, real-browser
 *   proof — Track 32.T32.7, UF class)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): #4 — the context frame of a FAILED call, proven where it renders
 * Actualises: the two things a jsdom mount cannot say about 32.7.
 *
 *   (1) That the deep-link LANDS. A component test can prove a button executes
 *       a command id; only the running shell can prove that id actually brings
 *       the Diagnostics fold up on the active face. A registered command that
 *       no-ops (wrong face, unmounted border node, tab absent from the active
 *       layout) is exactly the registered-but-unfired seam this plan set exists
 *       to stop, and `activateOmnipanelTabByIndex` silently returns in all
 *       three of those cases.
 *
 *   (2) That a REAL substrate refusal reaches the surface. The failure here is
 *       not induced: the app is asked, through its own `vault.open` command, to
 *       open a path the vault does not hold, and the real e2e sidecar's real
 *       `readFileSync` refuses it against a real temp filesystem. Nothing is
 *       stubbed to make the error happen — and retry is proven to RE-ISSUE that
 *       read rather than redraw a cached refusal.
 *
 *   The non-modal assertion is deliberate and not decorative: `pnpm lint:no-modal`
 *   proves no blocking API is CALLED; only the running page can show the shell
 *   is still driveable while an error surface is up.
 *
 * BUDGET: boot assertions carry BOOT_TIMEOUT, not the 10s project default (the
 *   defect 25.T25.21 flagged across 28 specs). There are no fixed sleeps: every
 *   wait is on a real signal — the shell, the gateway status, the editor tab,
 *   the omnipanel active-tab attribute, the routing receiver.
 * Public surface: Playwright error-UX acceptance tests.
 * Does NOT own: the grammar table (src/ui/errorUxGrammar.ts), the surface
 *   (src/ui/InlineErrorSurface.tsx), the Diagnostics tab CONTENTS (15.2), the
 *   empty-state registry (32.6), or the command catalog gate.
 * Contract: rerun tranche [[32.T32.7]] spec lines 209-236.
 */

import { expect, test, type Page } from '@playwright/test';

/** Boot-sized budget — the gateway handshake is slower than a DOM query. */
const BOOT_TIMEOUT = 20_000;

/** A path the e2e vault genuinely does not hold. Under the write scope so the
 *  refusal is a missing FILE, not a scope refusal — the read seam is what is
 *  under test. */
const ABSENT_PATH = 'Idea/Empty/Present/32-t32-7-no-such-note.md';

async function bootConnected(page: Page): Promise<void> {
    await page.goto('/');
    await expect(page.getByTestId('shell')).toBeVisible({ timeout: BOOT_TIMEOUT });
    await expect(page.getByTestId('status-gateway')).toContainText('connected', {
        timeout: BOOT_TIMEOUT
    });
}

/** Drive the shell to a known face and VERIFY it — `⌘.` is the # inversion
 *  toggle, so pressing it blind asserts an outcome only an assumed start gives. */
async function ensureFace(page: Page, face: '0' | '1'): Promise<void> {
    const shell = page.getByTestId('shell');
    await expect(shell).toBeVisible({ timeout: BOOT_TIMEOUT });
    if ((await shell.getAttribute('data-face')) !== face) {
        await page.keyboard.press('Meta+.');
    }
    await expect(shell).toHaveAttribute('data-face', face, { timeout: BOOT_TIMEOUT });
}

/** The four-path table, read from the RUNNING app rather than restated here. */
async function readGrammar(page: Page): Promise<
    readonly {
        readonly id: string;
        readonly status: string;
        readonly deepLinkCommandId: string | null;
        readonly unwiredReason: string | null;
        readonly sites: readonly string[];
    }[]
> {
    return page.evaluate(async () => {
        const grammar = await import('/src/ui/errorUxGrammar.ts');
        return grammar.ERROR_UX_PATHS.map(path => ({
            id: path.id,
            status: path.status,
            deepLinkCommandId: path.deepLinkCommandId,
            unwiredReason: path.unwiredReason,
            sites: [...path.sites]
        }));
    });
}

test('32.T32.7: a real substrate refusal renders the inline error surface, and its Diagnostics deep-link LANDS', async ({
    page
}) => {
    await bootConnected(page);

    const grammar = await readGrammar(page);
    expect(grammar).toHaveLength(4);
    const runtimePath = grammar.find(path => path.id === 'runtime-bridge-call')!;
    expect(runtimePath.status).toBe('live');
    const diagnosticsCommand = runtimePath.deepLinkCommandId!;
    expect(diagnosticsCommand).toBeTruthy();

    // The ONE path the carrier cannot wire is DECLARED, not silently dropped.
    const preflight = grammar.find(path => path.id === 'contract-preflight')!;
    expect(preflight.status).toBe('unwired');
    expect(preflight.deepLinkCommandId).toBeNull();
    expect(preflight.unwiredReason ?? '').not.toBe('');

    // Ask the app, through its OWN command, to open a note the vault does not
    // hold. The refusal comes from the real sidecar's real filesystem read.
    await page.evaluate(async path => {
        const registry = await import('/src/commands/registry.ts');
        await registry.commands.execute('vault.open', path);
    }, ABSENT_PATH);

    const shell = page.getByTestId('shell');
    await expect(shell).toHaveAttribute('data-face', '1', { timeout: BOOT_TIMEOUT });

    const surface = page.getByTestId('editor-error');
    await expect(surface).toBeVisible({ timeout: BOOT_TIMEOUT });
    await expect(surface).toHaveAttribute('data-error-path', 'runtime-bridge-call');
    await expect(surface).toHaveAttribute('data-surface', `vault.editor:${ABSENT_PATH}`);
    await expect(surface).toHaveAttribute('role', 'alert');
    await expect(page.getByTestId('editor-error-message')).toContainText(
        `cannot open ${ABSENT_PATH}`
    );

    // NON-MODAL, measured rather than asserted from the code: nothing was
    // hoisted to a dialog, and the shell is still driveable with the error up.
    expect(await page.locator('[role="dialog"]').count()).toBe(0);
    expect(await page.locator('[aria-modal="true"]').count()).toBe(0);
    await page.keyboard.press('Meta+.');
    await expect(shell).toHaveAttribute('data-face', '0', { timeout: BOOT_TIMEOUT });
    await page.keyboard.press('Meta+.');
    await expect(shell).toHaveAttribute('data-face', '1', { timeout: BOOT_TIMEOUT });
    // …and the surface survived the round trip, because it was never a layer.
    await expect(surface).toBeVisible();

    // RETRY re-issues the real read. The file still does not exist, so the
    // honest outcome is the same refusal — but it is a NEW one: the read effect
    // is keyed on the attempt, so a stale surface could not come back after the
    // error was cleared.
    await page.getByTestId('editor-error-retry').click();
    await expect(page.getByTestId('editor-error')).toBeVisible({ timeout: BOOT_TIMEOUT });
    await expect(page.getByTestId('editor-error-message')).toContainText(
        `cannot open ${ABSENT_PATH}`
    );

    // THE DEEP-LINK LANDS: the button carries the real id, and clicking it
    // brings the Diagnostics fold up on the active face.
    const deepLink = page.getByTestId('editor-error-diagnostics');
    await expect(deepLink).toHaveAttribute('data-command', diagnosticsCommand);
    await deepLink.click();
    await expect(shell).toHaveAttribute('data-omnipanel-active-tab', 'diagnostics', {
        timeout: BOOT_TIMEOUT
    });
    await expect(page.getByTestId('diagnostics-panel').first()).toBeVisible({
        timeout: BOOT_TIMEOUT
    });
});

test('32.T32.7: the empty-state recovery affordance 32.6 registered really opens Diagnostics', async ({
    page
}) => {
    await bootConnected(page);
    await ensureFace(page, '0');

    // Route to the M0 language reader through the real cross-layout intent —
    // no coordinate is selected at boot, so the reader is genuinely empty and
    // its registered empty state is the reader's real state.
    await page.evaluate(async () => {
        const registry = await import('/src/commands/registry.ts');
        const crossLayout = await import('/src/commands/crossLayoutIntent.ts');
        const stores = await import('/src/state/stores.ts');
        await registry.commands.execute(crossLayout.CROSS_LAYOUT_INTENT_COMMAND, {
            coordinate: null,
            artifactUri: null,
            reviewId: null,
            dayNow: stores.useSessionStore.getState().dayNow,
            sessionKey: stores.useSessionStore.getState().sessionKey,
            profileGeneration: stores.useTickStore.getState().generation,
            privacyClass: null,
            requestedExtensionId: 'm0-anuttara',
            requestedContributionId: 'language'
        });
    });

    const receiver = page.getByTestId('cross-layout-intent-receiver');
    await expect(receiver).toHaveAttribute('data-requested-extension-id', 'm0-anuttara', {
        timeout: BOOT_TIMEOUT
    });
    await expect(receiver).toHaveClass(/face-active/, { timeout: BOOT_TIMEOUT });

    const empty = page
        .locator('.face-active [data-testid="mext-empty-state"][data-extension="m0-anuttara"]')
        .first();
    await expect(empty).toBeVisible({ timeout: BOOT_TIMEOUT });

    // 32.6 registered this button against the readiness taxonomy's own recovery
    // and never proved it fires. That proof is 32.7's contribution.
    const recovery = empty.getByTestId('mext-empty-state-recovery');
    await expect(recovery).toBeVisible();
    await expect(recovery).toHaveAttribute('data-command', 'omnipanel.tab.activate.7');
    await recovery.click();

    await expect(page.getByTestId('shell')).toHaveAttribute(
        'data-omnipanel-active-tab',
        'diagnostics',
        { timeout: BOOT_TIMEOUT }
    );
    await expect(page.getByTestId('diagnostics-panel').first()).toBeVisible({
        timeout: BOOT_TIMEOUT
    });
});
