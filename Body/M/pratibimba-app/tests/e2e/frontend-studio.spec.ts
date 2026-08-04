/**
 * Coordinate: M5-3' Frontend Studio e2e (rerun 51.T51.2)
 * Actualises: the tranche's UF acceptance, in a real browser against the real
 *   spawned substrate — "a UF e2e opens the studio and asserts the rendered
 *   inventory matches the app's actual registered panes and composition
 *   slots, including after a slot is added."
 *
 *   The match is checked against the SHELL's own readout, not against a list
 *   this file keeps: `data-layout-pane-set` is the 52.T4 walk of the active
 *   layout's models, so asserting the studio's inventory contains it proves
 *   the studio is reading the same models the shell mounted. The "after a slot
 *   is added" half opens a subsystem page — a real dynamic `addNode` into the
 *   deep model — and asserts the studio's registered set GREW to include it
 *   and that the factory really rendered it.
 * Does NOT own: the registry law (`src/panes/frontendStudio/paneRegistry.test.ts`),
 *   the subsystem pages (`subsystem-pages.spec.ts`).
 */

import { expect, test, type Page } from '@playwright/test';

/** The house boot idiom (deep-pane-set.spec.ts). */
async function boot(page: Page): Promise<void> {
    await page.goto('/');
    await expect(page.getByTestId('shell')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });
    await expect(page.getByTestId('status-tick')).toHaveText(/\d+/, { timeout: 20_000 });
}

async function openStudio(page: Page): Promise<void> {
    await page.keyboard.press('Meta+Shift+P');
    await page.getByTestId('palette-input').fill('Frontend Studio');
    await page.getByTestId('palette-item-studio.open.frontend').click();
    await expect(page.getByTestId('shell')).toHaveAttribute('data-active-layout', 'ide-deep', {
        timeout: 30_000
    });
    await expect(page.locator('.face-active [data-testid="frontend-studio"]')).toBeVisible({
        timeout: 30_000
    });
}

function studio(page: Page) {
    return page.locator('.face-active [data-testid="frontend-studio"]');
}

async function attr(page: Page, name: string): Promise<string[]> {
    const raw = (await studio(page).getAttribute(name)) ?? '';
    return raw.split(' ').filter(Boolean);
}

test('51.T51.2: the studio inventory IS the shell’s real pane set, not a restatement of it', async ({
    page
}) => {
    test.setTimeout(180_000);
    await boot(page);
    await openStudio(page);

    // The shell's own 52.T4 readout of the ACTIVE layout's models. Every one
    // of those component keys must appear in the studio's registered set —
    // which is the four-cell walk, so it is a superset by construction. If the
    // studio were a hand-written list, a surface added to a model since that
    // list was written would be missing here.
    const shellPaneSet = ((await page.getByTestId('shell').getAttribute('data-layout-pane-set')) ?? '')
        .split(' ')
        .filter(Boolean);
    expect(shellPaneSet.length, 'the shell must expose a real pane set').toBeGreaterThan(3);

    const registered = await attr(page, 'data-registered-components');
    for (const component of shellPaneSet) {
        expect(registered, `the studio does not see mounted pane \`${component}\``).toContain(
            component
        );
    }

    // …and the studio must be reporting itself: it is a pane, it rendered.
    expect(registered).toContain('frontendStudio');
    const rendered = await attr(page, 'data-rendered-components');
    expect(rendered).toContain('frontendStudio');

    // Every registered component has a row, and the studio's own row records
    // at least one real factory render.
    for (const component of registered) {
        await expect(studio(page).getByTestId(`frontend-studio-pane-${component}`)).toBeVisible();
    }
    const ownRow = studio(page).getByTestId('frontend-studio-pane-frontendStudio');
    expect(Number(await ownRow.getAttribute('data-renders'))).toBeGreaterThan(0);
});

test('51.T51.2: adding a pane to the live model moves the studio inventory', async ({ page }) => {
    test.setTimeout(180_000);
    await boot(page);
    await openStudio(page);

    const before = await attr(page, 'data-registered-components');
    expect(before).not.toContain('m3SubsystemPage');
    const revisionBefore = Number(await studio(page).getAttribute('data-pane-registry-revision'));

    // A REAL dynamic mount: `subsystem.open.m3` runs `Actions.addNode` against
    // the same deep model the studio is walking.
    await page.keyboard.press('Meta+Shift+P');
    await page.getByTestId('palette-input').fill("Open M3' Clock");
    await page.getByTestId('palette-item-subsystem.open.m3').click();
    await expect(page.locator('.face-active [data-testid="subsystem-page-m3"]')).toBeVisible({
        timeout: 30_000
    });

    // Back to the studio tab — it must now carry the new pane, as MOUNTED and
    // as RENDERED, with its declaring module named.
    await page.locator('.face-active .flexlayout__tab_button', { hasText: 'Frontend Studio' }).click();
    await expect(studio(page)).toBeVisible({ timeout: 30_000 });

    const after = await attr(page, 'data-registered-components');
    expect(after, 'the studio did not see the newly mounted pane').toContain('m3SubsystemPage');
    expect(await attr(page, 'data-rendered-components')).toContain('m3SubsystemPage');
    expect(
        Number(await studio(page).getAttribute('data-pane-registry-revision'))
    ).toBeGreaterThan(revisionBefore);

    const row = studio(page).getByTestId('frontend-studio-pane-m3SubsystemPage');
    await expect(row).toContainText('ui/subsystemPages.ts');
    expect(Number(await row.getAttribute('data-mount-count'))).toBeGreaterThan(0);
});

test('51.T51.2: composition slots and integrated plugins are read from the real load law', async ({
    page
}) => {
    test.setTimeout(180_000);
    await boot(page);
    await openStudio(page);

    // The header readout: filled slots, with their real owners.
    const filled = await attr(page, 'data-filled-composition-slots');
    expect(filled).toContain('surface=m1-paramasiva-played-torus');
    expect(filled).toContain('texture=m2-parashakti');
    expect(filled).toContain('cell-state=m3-mahamaya');

    await studio(page).getByTestId('frontend-studio-section-slots').click();
    await expect(studio(page)).toHaveAttribute('data-studio-section', 'slots');
    await expect(
        studio(page).getByTestId('frontend-studio-slot-surface')
    ).toHaveAttribute('data-slot-owner', 'm1-paramasiva-played-torus');
    // 25.T25.6 made the center slot inhabitable through its opaque renderer
    // handle. The studio must report the mounted surface, not the retired
    // implementation blocker.
    const centerComposition = studio(page).getByTestId('frontend-studio-slot-center-composition');
    await expect(centerComposition).toHaveAttribute('data-slot-owner', 'm4-nara');
    await expect(centerComposition).toContainText('psychoid-renderer-handle');
    await expect(centerComposition).not.toContainText('pending-psychoid-cymatic-solver');

    await studio(page).getByTestId('frontend-studio-section-plugins').click();
    await expect(studio(page)).toHaveAttribute('data-studio-section', 'plugins');
    for (const compositionId of ['cosmic-engine.integrated', 'jiva-siva.integrated']) {
        await expect(
            studio(page).getByTestId(`frontend-studio-plugin-${compositionId}`)
        ).toHaveAttribute('data-plugin-mounted', 'true');
    }
});
