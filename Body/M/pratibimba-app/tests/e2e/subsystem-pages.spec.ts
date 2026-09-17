/**
 * Coordinate: M' (subsystem pages e2e — rerun 52.T5)
 * Actualises: the tranche's behavioural acceptance, in a real browser against
 *   the real spawned substrate — a UF e2e reaches EACH of the six subsystem
 *   pages from Home, asserts each renders its own subsystem's depth surfaces
 *   (not the shell preview), and asserts the seven-field cross-layout identity
 *   survives entry and exit. Also: the Home affordance itself — 0/1 view by
 *   default, the `#0-#5` toggle to the subsystems grid, both views coexisting.
 * Does NOT own: the deep overview pane set (deep-pane-set.spec.ts), the switch
 *   control (layout-switch.spec.ts), or any gathered surface's own behaviour
 *   (each has its own spec).
 */

import { expect, test, type Page } from '@playwright/test';

const IDENTITY_FIELDS = [
    'activityBarMode',
    'coordinate',
    'dayNow',
    'lens',
    'mode',
    'profileGeneration',
    'sessionKey'
] as const;

/** Each page, its Ground testid, and ONE gathered depth surface asserted by
 *  its real root testid after an explicit stratum click. The depth stratum
 *  chosen per page is a genuine instrument of that subsystem — the positive
 *  half of "not the shell preview enlarged". */
const PAGES = [
    { id: 'm0', tab: "M0' Map", stratum: 1, depthTestId: 'graph-explorer' },
    { id: 'm1', tab: "M1' Traversal", stratum: 2, depthTestId: 'spanda-navigator' },
    { id: 'm2', tab: "M2' Matrix", stratum: 1, depthTestId: 'm2-correspondence' },
    { id: 'm3', tab: "M3' Clock", stratum: 1, depthTestId: 'm3-pentadic-inspector' },
    { id: 'm4', tab: "M4' Nara", stratum: 1, depthTestId: 'journal-timeline' },
    { id: 'm5', tab: "M5' Epii", stratum: 2, depthTestId: 'm5-ebm-observatory' }
] as const;

/** The house boot idiom (deep-pane-set.spec.ts) — the TICK wait matters
 *  because `profileGeneration` is one of the seven identity fields. */
async function boot(page: Page): Promise<void> {
    await page.goto('/');
    await expect(page.getByTestId('shell')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('status-gateway')).toContainText('connected', {
        timeout: 20_000
    });
    await expect(page.getByTestId('status-tick')).toHaveText(/\d+/, { timeout: 20_000 });
}

async function ensureFace(page: Page, face: '0' | '1'): Promise<void> {
    const shell = page.getByTestId('shell');
    if ((await shell.getAttribute('data-face')) !== face) {
        await page.keyboard.press('Meta+.');
    }
    await expect(shell).toHaveAttribute('data-face', face, { timeout: 20_000 });
}

/** 52.T3's control — the return trip rides canon's named switch mechanism. */
async function switchLayout(page: Page, layout: 'daily-0-1' | 'ide-deep'): Promise<void> {
    const control = page.locator('.face-active [data-testid="omnipanel-layout-switch"]');
    await expect(control).toBeVisible({ timeout: 20_000 });
    await control.getByTestId(`omnipanel-layout-option-${layout}`).click();
    await expect(page.getByTestId('shell')).toHaveAttribute('data-active-layout', layout, {
        timeout: 30_000
    });
}

interface IdentityReceipt {
    fromLayout: string;
    toLayout: string;
    before: Record<string, unknown>;
    after: Record<string, unknown>;
}

async function expectIdentityIntact(page: Page, from: string, to: string): Promise<void> {
    const raw = await page.getByTestId('shell').getAttribute('data-cross-layout-identity-receipt');
    expect(raw, `no identity receipt for ${from} → ${to}`).toBeTruthy();
    const receipt = JSON.parse(raw as string) as IdentityReceipt;
    expect(receipt.fromLayout).toBe(from);
    expect(receipt.toLayout).toBe(to);
    expect(Object.keys(receipt.before).sort()).toEqual([...IDENTITY_FIELDS]);
    expect(Object.keys(receipt.after).sort()).toEqual([...IDENTITY_FIELDS]);
    for (const field of IDENTITY_FIELDS) {
        expect(receipt.after[field], `${field} drifted across ${from} → ${to}`).toEqual(
            receipt.before[field]
        );
    }
}

/** Home = the Now tab's pane on daily face 1: 0/1 view by default, grid on
 *  toggle. Returns with the grid on screen. */
async function openHomeGrid(page: Page): Promise<void> {
    await ensureFace(page, '1');
    const home = page.locator('.face-active [data-testid="home-pane"]');
    await expect(home).toBeVisible({ timeout: 20_000 });
    if ((await home.getAttribute('data-home-view')) !== 'subsystems-grid') {
        await home.getByTestId('home-view-option-subsystems').click();
    }
    await expect(home.getByTestId('home-subsystems-grid')).toBeVisible({ timeout: 20_000 });
}

test('52.T5: Home defaults to the 0/1 view and the #0-#5 toggle reveals the grid — both views coexist', async ({
    page
}) => {
    await boot(page);
    await ensureFace(page, '1');
    const home = page.locator('.face-active [data-testid="home-pane"]');
    await expect(home).toBeVisible({ timeout: 20_000 });

    // Default: the 0/1 lived view, with the ambient time-axis control.
    await expect(home).toHaveAttribute('data-home-view', 'zero-one');
    await expect(home.getByTestId('time-axis-switcher')).toBeVisible();

    // Toggle to the subsystems grid: six entry tiles, one per M0'-M5'. The
    // ambient time-axis control stays MOUNTED in the grid view — both views
    // coexist, and the ⌘⇧T chord it owns must not die while the grid is up.
    await home.getByTestId('home-view-option-subsystems').click();
    await expect(home.getByTestId('home-subsystems-grid')).toBeVisible();
    await expect(home.getByTestId('time-axis-switcher')).toBeVisible();
    for (const pageDef of PAGES) {
        await expect(home.getByTestId(`home-subsystem-tile-${pageDef.id}`)).toBeVisible();
    }

    // Both views coexist: the toggle returns, nothing was replaced.
    await home.getByTestId('home-view-option-zero-one').click();
    await expect(home).toHaveAttribute('data-home-view', 'zero-one');
    await expect(home.getByTestId('time-axis-switcher')).toBeVisible();
});

test('52.T5: each of the six subsystem pages is reached from Home, renders its own depth, and identity survives entry and exit', async ({
    page
}) => {
    test.setTimeout(300_000);
    await boot(page);
    await ensureFace(page, '1');

    // Seed a real coordinate so the identity tuple is non-trivial.
    await page.getByTestId('status-strip').click();
    await page.keyboard.press('Meta+Shift+Digit3');
    await expect(page.getByTestId('active-coordinate')).toHaveText('M3');

    const shell = page.getByTestId('shell');
    for (const pageDef of PAGES) {
        // ── entry: Home grid tile → deep layout + the page's workspace ─────
        await expect(shell).toHaveAttribute('data-active-layout', 'daily-0-1');
        await openHomeGrid(page);
        await page
            .locator('.face-active [data-testid="home-pane"]')
            .getByTestId(`home-subsystem-tile-${pageDef.id}`)
            .click();
        await expect(shell).toHaveAttribute('data-active-layout', 'ide-deep', {
            timeout: 30_000
        });
        const workspace = page.locator(
            `.face-active [data-testid="subsystem-page-${pageDef.id}"]`
        );
        await expect(workspace).toBeVisible({ timeout: 30_000 });
        await expectIdentityIntact(page, 'daily-0-1', 'ide-deep');

        // ── the page is a workspace, not the shell preview enlarged ────────
        // It opens on Ground (identity + strata index + honest unbuilt list),
        // and the shell preview surfaces — the Home pane AND the two
        // integrated preview engines themselves — are nowhere inside it.
        await expect(workspace).toHaveAttribute('data-subsystem-stratum', '0');
        await expect(workspace.getByTestId(`subsystem-ground-${pageDef.id}`)).toBeVisible();
        await expect(workspace.locator('[data-testid="home-pane"]')).toHaveCount(0);
        await expect(
            workspace.locator('[data-testid="personal-recognition-engine"]')
        ).toHaveCount(0);
        await expect(workspace.locator('[data-testid="cosmic-engine"]')).toHaveCount(0);

        // ── an explicit stratum click mounts the subsystem's OWN depth ─────
        await workspace.getByTestId(`subsystem-stratum-${pageDef.id}-${pageDef.stratum}`).click();
        await expect(workspace).toHaveAttribute(
            'data-subsystem-stratum',
            String(pageDef.stratum)
        );
        await expect(workspace.getByTestId(pageDef.depthTestId)).toBeVisible({
            timeout: 30_000
        });

        // ── exit: the return trip restores daily with identity intact ──────
        await switchLayout(page, 'daily-0-1');
        await expectIdentityIntact(page, 'ide-deep', 'daily-0-1');
        await expect(
            page.locator('.face-active [data-testid="home-pane"]')
        ).toBeVisible({ timeout: 30_000 });
    }
});

test('52.T5: a page re-opens idempotently and the palette reaches it without the grid', async ({
    page
}) => {
    await boot(page);
    await ensureFace(page, '1');

    // Open M3' from the grid, return to daily, then reach it via the palette:
    // same tab, selected again — never a duplicate.
    await openHomeGrid(page);
    await page
        .locator('.face-active [data-testid="home-pane"]')
        .getByTestId('home-subsystem-tile-m3')
        .click();
    await expect(
        page.locator('.face-active [data-testid="subsystem-page-m3"]')
    ).toBeVisible({ timeout: 30_000 });
    await switchLayout(page, 'daily-0-1');

    await page.keyboard.press('Meta+Shift+P');
    await page.getByTestId('palette-input').fill("Open M3' Clock");
    await page.getByTestId('palette-item-subsystem.open.m3').click();
    await expect(page.getByTestId('shell')).toHaveAttribute('data-active-layout', 'ide-deep', {
        timeout: 30_000
    });
    // Idempotency is structural, and this render IS its proof: the open seam
    // re-selects the node id it finds, and FlexLayout REFUSES a second node
    // with the same id — a broken guard would throw on `addNode` and nothing
    // would render. (A DOM strip count is not used: the tab BUTTON is culled
    // from the strip when the 10-tab tabset overflows, while the selected
    // pane keeps rendering.)
    await expect(
        page.locator('.face-active [data-testid="subsystem-page-m3"]')
    ).toBeVisible({ timeout: 30_000 });
    await expect(page.locator('[data-testid="subsystem-page-m3"]')).toHaveCount(1);
});
