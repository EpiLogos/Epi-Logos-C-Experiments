/**
 * Coordinate: M' M0' chrome (drivable-loop spec: the Coordinate Tree — 28.T28.6)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): real Chromium / real spawned gateway / real Neo4j read
 * Actualises: the UF half of 28.T28.6. The tranche's deliverable is not "a
 *   `CoordinateTreePane` component renders" — it is that the M0' NAVIGATION
 *   BACKBONE [[CHROME-CONTRACT]] §2 designates is reachable in depth through
 *   canon's own mechanism, over the live graph. So this spec renders no
 *   component: it boots the shell, crosses into `ide-deep` through 52.T3's real
 *   `OmniPanelLayoutSwitch`, and drives the tree in the rail 52.T4 reserved for
 *   it. Five claims:
 *
 *     (a) the tree is carried in BOTH layouts — the daily face-1 reading rail
 *         AND both deep explorer rails — which is the conjugate of the control
 *         room's deep-only case and the only reading under which
 *         `LEFT_SIDEBAR_MODES`' cross-layout fallback is true rather than
 *         aspirational. The deep rail is asserted against `deepPaneMounts` in
 *         DECLARED ORDER, and `Coordinates` is asserted NOT to be first.
 *     (b) THE CROSSING DOES NOT MOVE THE COORDINATE. Entering depth mounts every
 *         opening rail tab on the hidden face too; a coordinate tree is exactly
 *         the surface that would seize the shared coordinate on arrival. The
 *         coordinate is read before and after the switch off the shell's own
 *         cross-layout identity receipt — the app's answer, not the spec's.
 *     (c) a real rail click yields the real BODY over the LIVE graph: rows the
 *         canonical Neo4j declared, each carrying its family class and the
 *         receipt privacy class, and an expand arrow that really opens a child
 *         the graph declared (never one derived from the coordinate string).
 *     (d) the active-coordinate highlight is a live publish/subscribe round
 *         trip in a real browser — a row click writes the one shared store and
 *         the row takes the highlight.
 *     (e) the DR-M0-1 separation on screen: reading mode carries no authoring
 *         affordance at all; authoring mode surfaces the governance line and
 *         the per-row propose control, and the pane still declares
 *         `data-mutates-graph-canon="false"`.
 *
 *   BUDGET, and the arithmetic. The project default 60s is a ONE-boot budget;
 *   this spec pays for two boot-sized events — the initial boot (20s, the
 *   gateway-check budget) and one real layout transition, a full FlexLayout
 *   remount of BOTH faces (52.T3's `routingRevision`) whose strips are polled
 *   at 30s — plus a live S2 read behind a real rail click (20s). Worst case
 *   ~75s, hence 90s. Every wait is on a real SIGNAL (an attribute, a converged
 *   strip, a rendered row); there is no `waitForTimeout` in this file.
 * Does NOT own: the switch (52.T3 — `layout-switch.spec.ts`), WHICH panes exist
 *   per layout (52.T4 — `deep-pane-set.spec.ts`), the pure law
 *   (`src/panes/coordinateTree/coordinateTreeModel.test.ts`), or the jsdom
 *   render (`src/panes/coordinateTree/CoordinateTreePane.test.tsx`).
 * Contract: [[CHROME-CONTRACT]] §2 (`coordinateTree`) + §5 + §7 · [[DR-M0-1]] ·
 *   21-m0 SC-5 · 15-foundation principle 1 · rerun tranche [[28.T28.6]].
 */

import { expect, test, type Page } from '@playwright/test';
import {
    COORDINATE_TREE_FAMILY_ROOTS,
    COORDINATE_TREE_TAB_LABEL
} from '../../src/panes/coordinateTree/coordinateTreeModel';
import { deepPaneMounts } from '../../src/ui/deepPaneSet';

test.setTimeout(90_000);

/** The house boot idiom, with the boot-sized budget the gateway check uses. */
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

/** 52.T3's control — canon's named switch mechanism, on the face on screen. */
async function switchLayout(page: Page, layout: 'daily-0-1' | 'ide-deep'): Promise<void> {
    const control = page.locator('.face-active [data-testid="omnipanel-layout-switch"]');
    await expect(control).toBeVisible({ timeout: 20_000 });
    await control.getByTestId(`omnipanel-layout-option-${layout}`).click();
    await expect(page.getByTestId('shell')).toHaveAttribute('data-active-layout', layout, {
        timeout: 30_000
    });
}

/** The left-border tab labels on the face on screen. */
async function leftBorderLabels(page: Page): Promise<string[]> {
    return (
        await page
            .locator('.face-active .flexlayout__border_left .flexlayout__border_button_content')
            .allInnerTexts()
    ).map(label => label.trim());
}

/** A layout transition REMOUNTS the whole FlexLayout tree, so a bare read can
 *  land inside the remount and see an empty rail. Poll on the real signal. */
async function expectLeftBorder(page: Page, expected: readonly string[], why: string): Promise<void> {
    await expect
        .poll(() => leftBorderLabels(page), { message: why, timeout: 30_000 })
        .toEqual([...expected]);
}

async function livePaneSet(page: Page): Promise<string[]> {
    const raw = await page.getByTestId('shell').getAttribute('data-layout-pane-set');
    expect(raw, 'the shell published no pane set').toBeTruthy();
    return (raw as string).split(' ').filter(Boolean);
}

/** The shell's OWN before/after answer for the crossing (52.T3's receipt). */
async function identityReceipt(page: Page): Promise<{
    before: Record<string, unknown>;
    after: Record<string, unknown>;
}> {
    const raw = await page.getByTestId('shell').getAttribute('data-cross-layout-identity-receipt');
    expect(raw, 'the shell published no cross-layout identity receipt').toBeTruthy();
    return JSON.parse(raw as string);
}

/** Open the rail tab by label. It is NOT index 0, so this selects rather than
 *  toggling the border collapsed — which would prove nothing either way. */
async function openRailTab(page: Page, label: string): Promise<void> {
    await page
        .locator('.face-active .flexlayout__border_left .flexlayout__border_button', {
            hasText: label
        })
        .first()
        .click();
}

test('28.T28.6: the Coordinate Tree is the M0′ navigation backbone of both deep rails', async ({
    page
}) => {
    await boot(page);
    const shell = page.getByTestId('shell');

    // ── (a) the daily ground state: carried in the face-1 reading rail ─────
    await expect(shell).toHaveAttribute('data-active-layout', 'daily-0-1');
    expect(
        await livePaneSet(page),
        'the tree is NOT deep-only — LEFT_SIDEBAR_MODES makes it available in both layouts'
    ).toContain('coordinateTree');
    await ensureFace(page, '1');
    await expect
        .poll(() => leftBorderLabels(page), { timeout: 30_000 })
        .toContain(COORDINATE_TREE_TAB_LABEL);

    // ── enter depth through 52.T3's real control ───────────────────────────
    await switchLayout(page, 'ide-deep');
    expect(
        await livePaneSet(page),
        'the deep shell must mount the surface 52.T4 reserved for this tranche'
    ).toContain('coordinateTree');

    // ── (b) the crossing did not move the coordinate ───────────────────────
    // This is 52.T4's defect stated as an invariant: mounting the deep rail
    // mounts every opening tab on the HIDDEN face too, and this pane publishes
    // only from a click. The shell's own receipt is the witness.
    const receipt = await identityReceipt(page);
    expect(
        receipt.after.coordinate,
        'entering depth moved the shared coordinate — the coordinate tree seized it on mount'
    ).toEqual(receipt.before.coordinate);

    // ── (a′) the deep rail, in declared order, on BOTH faces ───────────────
    await ensureFace(page, '1');
    const personalRail = deepPaneMounts('personal', 'left').map(mount => mount.label);
    expect(personalRail, 'the declaration must carry the tree').toContain(COORDINATE_TREE_TAB_LABEL);
    // …and NOT first: the opening tab of a rail mounts on layout entry, on the
    // hidden face too, and this pane reads S2 the moment it mounts.
    expect(personalRail[0]).not.toBe(COORDINATE_TREE_TAB_LABEL);
    await expectLeftBorder(
        page,
        personalRail,
        'the personal deep rail must be DEEP_PANE_SET in declared order, with the tree in it'
    );

    await ensureFace(page, '0');
    const cosmicRail = deepPaneMounts('cosmic', 'left').map(mount => mount.label);
    await expectLeftBorder(
        page,
        cosmicRail,
        'face 0 gains the same explorer rail in depth, tree included'
    );
    expect(cosmicRail).toContain(COORDINATE_TREE_TAB_LABEL);

    // ── (c) a real rail click yields the real body, over the LIVE graph ────
    await ensureFace(page, '1');
    await openRailTab(page, COORDINATE_TREE_TAB_LABEL);
    const tree = page.locator('.face-active [data-testid="coordinate-tree"]');
    await expect(tree).toBeVisible({ timeout: 20_000 });
    // The canonical graph really answered — not an empty state, not a refusal.
    await expect(tree).toHaveAttribute('data-status', 'ready', { timeout: 20_000 });
    const rows = tree.locator('[data-testid="coordinate-tree-rows"]');
    await expect(rows).toBeVisible();

    // (a) the six family roots are READ from the graph, each classed by family
    for (const family of COORDINATE_TREE_FAMILY_ROOTS) {
        const row = tree.locator(`[data-testid="coordinate-tree-node-${family}"]`);
        await expect(row).toBeVisible({ timeout: 20_000 });
        await expect(row).toHaveClass(new RegExp(`coordinate-family-${family}\\b`));
        // (e) the receipt privacy class rides every row — the only per-read
        // verdict this stack carries (`coordinateTreeSeams.ts`).
        await expect(row).toHaveClass(/coordinate-privacy-/);
    }

    // (d of the tranche) an expand arrow really opens a child the GRAPH declared
    const mRow = tree.locator('[data-testid="coordinate-tree-node-M"]');
    await expect(mRow).toHaveAttribute('data-expanded', 'false');
    await tree.locator('[data-testid="coordinate-tree-arrow-M"]').click();
    await expect(mRow).toHaveAttribute('data-expanded', 'true', { timeout: 20_000 });
    const children = tree.locator('[data-coordinate^="M"][data-depth="1"]');
    await expect(children.first()).toBeVisible({ timeout: 20_000 });
    expect(
        await children.count(),
        'the graph declared containment under the M family; the tree must render it'
    ).toBeGreaterThan(0);

    // ── (d) the active-coordinate highlight, publish and subscribe, live ───
    const firstChild = children.first();
    const coordinate = (await firstChild.getAttribute('data-coordinate')) as string;
    expect(coordinate).toBeTruthy();
    await firstChild.locator('.coordinate-tree-label').click();
    await expect(tree).toHaveAttribute('data-active-coordinate', coordinate, { timeout: 20_000 });
    await expect(firstChild).toHaveClass(/active-coordinate/);
    await expect(firstChild.locator('.coordinate-tree-label')).toHaveAttribute('aria-current', 'true');

    // ── (e) CRUD vs governance, on screen ──────────────────────────────────
    await expect(tree).toHaveAttribute('data-surface-mode', 'reading');
    await expect(tree).toHaveAttribute('data-mutates-graph-canon', 'false');
    await expect(
        tree.locator('[data-testid="coordinate-tree-propose-M"]'),
        'reading mode offers no authoring affordance at all'
    ).toHaveCount(0);

    await tree.locator('[data-testid="coordinate-tree-mode-authoring"]').click();
    await expect(tree).toHaveAttribute('data-surface-mode', 'authoring', { timeout: 20_000 });
    await expect(tree.locator('[data-testid="coordinate-tree-governance"]')).toContainText(
        'never mutates canon'
    );
    await expect(tree.locator('[data-testid="coordinate-tree-propose-M"]')).toBeVisible();
    // …and the surface still declares it mutates nothing while offering it.
    await expect(tree).toHaveAttribute('data-mutates-graph-canon', 'false');
});
