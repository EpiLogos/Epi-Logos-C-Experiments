/**
 * Coordinate: M' M5-5' (Atelier scent-following drivable-loop — Track 26.T26.3
 *   + 28.T28.7)
 * Actualises: the real Chromium proof (UF class) that the six scent-following
 *   commands (root → cognate → drift → psychoid → pros-hen → Möbius write-back)
 *   register in the live command registry and surface in the command palette of
 *   the real app — the app-flow proof a jsdom mount cannot give. The bodies (each
 *   riding its real capability route) are proven by the unit contract in
 *   src/commands/atelier.test.ts.
 *
 *   28.T28.7 adds the SURFACE half, driven as a user drives it: a note opened
 *   from the real vault tree, "Open in Logos Atelier" clicked, and the scent
 *   trail assessed where the CrossLayoutIntent actually lands. It proves the
 *   three things a unit mount cannot — that the intent really carries into the
 *   deep layout, that the blocked psychoid stage prints its method and reason
 *   on the live surface, and that the governed write-back button names Canon
 *   Studio with `mutatesGraphCanon: false` beside it.
 */

import { expect, test, type Page } from '@playwright/test';

/** A shallow canonical note — enough tree walk to be real, no more. */
const NOTE = 'Bimba/World/Types/Psychoids/Psychoids.md';

async function openNote(page: Page, path: string) {
    await page.goto('/');
    await expect(page.getByTestId('shell')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });

    const shell = page.getByTestId('shell');
    if ((await shell.getAttribute('data-face')) !== '1') {
        await page.keyboard.press('Meta+.');
    }
    await expect(shell).toHaveAttribute('data-face', '1', { timeout: 20_000 });

    const activeFace = page.locator('.face-active');
    const tree = activeFace.getByTestId('vault-tree');
    // Clicking a SELECTED border button collapses it, so click only while the
    // tree is hidden and let the toggle converge.
    await expect(async () => {
        if (!(await tree.isVisible())) {
            await activeFace.locator('.flexlayout__border_button', { hasText: 'Vault' }).click();
        }
        await expect(tree).toBeVisible({ timeout: 3_000 });
    }).toPass({ timeout: 30_000 });

    const segments = path.split('/');
    let prefix = '';
    for (const segment of segments.slice(0, -1)) {
        prefix = prefix ? `${prefix}/${segment}` : segment;
        await activeFace.getByTestId(`vault-dir-${prefix}`).click();
    }
    await activeFace.getByTestId(`vault-file-${path}`).click();
    return activeFace;
}

test('the six Atelier scent-following commands are live in the real command palette', async ({
    page
}) => {
    await page.goto('/');
    await expect(page.getByTestId('shell')).toBeVisible({ timeout: 20_000 });
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

test('“Open in Logos Atelier” carries the note into the deep scent trail, gaps and all', async ({
    page
}) => {
    const editorFace = await openNote(page, NOTE);
    const pane = editorFace.getByTestId(`editor-${NOTE}`);
    await expect(pane).toBeVisible({ timeout: 20_000 });

    // The governed hand-off the Canon Studio read half owns (28.T28.4 (e)).
    await pane.getByTestId('editor-open-atelier').click();

    // The intent carries to face 0 in `ide-deep`, where the Atelier lens lives.
    const shell = page.getByTestId('shell');
    await expect(shell).toHaveAttribute('data-face', '0', { timeout: 20_000 });
    const atelierFace = page.locator('.face-active');
    const trail = atelierFace.getByTestId('atelier-scent-trail');
    await expect(trail).toBeVisible({ timeout: 20_000 });

    // (d) the governance invariant is worn, not documented elsewhere.
    await expect(trail).toHaveAttribute('data-mutates-graph-canon', 'false');
    await expect(trail).toHaveAttribute('data-artifact-uri', NOTE);

    // (b) the one stage the substrate cannot serve says so, by name.
    const psychoid = atelierFace.getByTestId('atelier-stage-psychoid');
    await expect(psychoid).toHaveAttribute('data-dispatched', 'false');
    await expect(atelierFace.getByTestId('atelier-stage-blocked-psychoid')).toContainText(
        "s0'.anuttara.trace"
    );
    // …while the stages that ARE dispatched carry their real method names.
    await expect(atelierFace.getByTestId('atelier-stage-root')).toHaveAttribute(
        'data-method',
        "s5'.gnostic.etymology"
    );

    // (e) the six subagents surface as lineage — evidence, never an invocation.
    await expect(atelierFace.locator('[data-testid^="atelier-lineage-"]')).toHaveCount(6);

    // (d) the Möbius button names the governed receiver it routes to. Whether
    // it is ENABLED depends on live session/day state this spec does not
    // establish, so the enablement rule is proven where it is decided — the
    // unit contract in src/commands/atelier.test.ts.
    await expect(atelierFace.getByTestId('atelier-crystallise')).toHaveAttribute(
        'data-target',
        'ide-shell-m0-m5/canon-studio'
    );

    // (e) the 26.14 cross-link has no intent target, so it refuses and says why.
    await expect(atelierFace.getByTestId('atelier-axiom-crosslink')).toBeDisabled();
    await expect(atelierFace.getByTestId('atelier-axiom-crosslink-seam')).toContainText(
        'piAxiomTranslation'
    );
});
