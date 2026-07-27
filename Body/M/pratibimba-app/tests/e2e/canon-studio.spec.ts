/**
 * Coordinate: M' M0' (Canon Studio real-UI proof — 28.T28.4)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): real Chromium + spawned S1/Hen gateway boundary
 * Actualises: the Canon Studio deepening driven as a user drives it — a
 *   canonical note opened from the vault tree renders inline bimba marks and
 *   the S1 typology fold; a Present-scoped note takes a typed coordinate as a
 *   live decoration and a typed `[[` as a live S1 semantic query.
 * Does NOT own: semantic indexing, typology law, or vault write scope.
 * Contract: [[S1-SPEC]]; rerun tranche [[28.T28.4]]; CHROME-CONTRACT §2/§4.
 */

import { expect, test, type Page } from '@playwright/test';

const S1_NOTE = 'Bimba/World/Types/Coordinates/S/S1/S1.md';

async function openVaultTree(page: Page) {
    await page.goto('/');
    const shell = page.getByTestId('shell');
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });

    // The vault tree lives on the personal face (1); the shell wears the
    // active face, and `cmd-.` is the inversion the user has.
    if ((await shell.getAttribute('data-face')) !== '1') {
        await page.keyboard.press('Meta+.');
    }
    await expect(shell).toHaveAttribute('data-face', '1', { timeout: 20_000 });

    const activeFace = page.locator('.face-active');
    const tree = activeFace.getByTestId('vault-tree');
    // Clicking a SELECTED FlexLayout border button collapses the border, so a
    // single blind click can close what it meant to open. Click only while the
    // tree is hidden, and retry — the toggle converges either way.
    await expect(async () => {
        if (!(await tree.isVisible())) {
            await activeFace.locator('.flexlayout__border_button', { hasText: 'Vault' }).click();
        }
        await expect(tree).toBeVisible({ timeout: 3_000 });
    }).toPass({ timeout: 30_000 });
    return activeFace;
}

/** Walk the tree down to a file, expanding each ancestor as a user would. */
async function openNote(page: Page, path: string) {
    const activeFace = await openVaultTree(page);
    const segments = path.split('/');
    let prefix = '';
    for (const segment of segments.slice(0, -1)) {
        prefix = prefix ? `${prefix}/${segment}` : segment;
        await activeFace.getByTestId(`vault-dir-${prefix}`).click();
    }
    await activeFace.getByTestId(`vault-file-${path}`).click();
    return activeFace;
}

test('a canonical note opens as the Canon Studio read half with live bimba marks and S1 typology', async ({
    page
}) => {
    const activeFace = await openNote(page, S1_NOTE);

    const pane = activeFace.getByTestId(`editor-${S1_NOTE}`);
    await expect(pane).toBeVisible({ timeout: 20_000 });
    await expect(pane).toHaveAttribute('data-view-id', 'pratibimba.canon-studio');

    // Canon outside Empty/Present is read — the governance flow, worn.
    await expect(pane.getByTestId('editor-readonly-banner')).toContainText('S1 scope');
    await expect(pane.getByTestId('editor-open-atelier')).toBeVisible();
    await expect(pane.getByTestId('editor-open-pasu-wizard')).toHaveCount(0);

    // Inline decoration over the real document body.
    await expect(pane.locator('.cm-content .bimba-wikilink').first()).toBeVisible({
        timeout: 20_000
    });

    // The frontmatter fold discloses S1's own typology reading, never its own.
    await pane.getByRole('button', { name: /frontmatter/ }).click();
    const typology = pane.getByTestId('editor-typology');
    await expect(typology).toBeVisible();
    await expect(typology).toContainText('key-shape validation is S1 law');
    await expect
        .poll(async () => (await typology.textContent()) ?? '', { timeout: 20_000 })
        .not.toContain('reading S1 typology…');
});

test('a Present-scoped note takes a typed coordinate as a mark and a typed [[ as a live S1 query', async ({
    page
}) => {
    // The note is named, not "the first one found": other specs create day
    // folders and daily notes in the shared vault, so a positional pick is
    // order-dependent. `Empty/Present/e2e/now.md` is seeded by global-setup.
    const PRESENT_NOTE = 'Empty/Present/e2e/now.md';
    await openNote(page, PRESENT_NOTE);

    // Scope every assertion to THIS editor's pane — `editor-save-state` is not
    // a unique testid (NaraCanvasEditor renders its own banner), so an
    // unscoped lookup is a strict-mode violation whenever the NOW canvas is
    // also open.
    const pane = page.locator('.face-active').getByTestId(`editor-${PRESENT_NOTE}`);
    await expect(pane).toBeVisible({ timeout: 20_000 });
    const editor = pane.locator('.cm-content');
    await expect(editor).toBeVisible({ timeout: 20_000 });
    await expect(pane.getByTestId('editor-save-state')).toBeVisible();

    // Typing a coordinate decorates it live — the scan runs on doc change.
    await editor.click();
    await page.keyboard.type("\nS4-5' reaches M0.\n");
    await expect(editor.locator('.ql-coordinate').first()).toBeVisible({ timeout: 10_000 });
    const marks = await editor.locator('.ql-coordinate').allTextContents();
    expect(marks.some(mark => mark.startsWith('S4-5'))).toBe(true);
    expect(marks).toContain('M0');

    // Typing `[[` asks the live S1 semantic surface for this note's neighbours.
    // The e2e vault carries no smart_env index, so the honest answer is a
    // no-index disclosure — which is itself proof the gateway was asked.
    await page.keyboard.type('see [[');
    const state = pane.getByTestId('editor-completion-state');
    await expect(state).toBeVisible({ timeout: 20_000 });
    await expect(state).toContainText('no-index');
});
