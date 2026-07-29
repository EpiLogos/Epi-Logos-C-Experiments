/**
 * Coordinate: M' shell (drivable-loop spec: the deep pane set — 52.T4)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): real Chromium / real spawned gateway carrier proof
 * Actualises: the UF half of 52.T4. [[M5'-SPEC]] :91 specifies `ide-deep` as
 *   "the full 4+2 surface with M0/M5 IDE chrome, six M-extensions, two
 *   integrated plugins, agentic control room". Before this tranche the deep
 *   layout had no pane set: selecting it SUBTRACTED three face-0 daily widgets
 *   and changed nothing else, which is why `layout-switch.spec.ts` (52.T3)
 *   deliberately asserted only the switch.
 *
 *   The tranche is explicit that proving three daily widgets vanished is NOT
 *   the deliverable, so this spec asserts the POSITIVE shape, in four claims a
 *   running browser is the only honest witness for:
 *
 *     (a) entering depth through 52.T3's real OmniPanel control gives the shell
 *         a pane set that IS the declaration — every `DEEP_PANE_SET` mount
 *         present, every `DEEP_PANE_WITHDRAWALS` id absent, and every
 *         `DEEP_PANE_RESERVATIONS` id absent (28.T28.5 / 28.T28.6 / 28.T28.13
 *         still own their surfaces; a reserved seam that quietly mounted would
 *         steal a tranche's deliverable AND trip the §2 validator);
 *     (b) it RENDERS, per face, and renders things the daily layout structurally
 *         cannot: the IDE explorer rail on face 0 — which has no left border at
 *         all in `daily-0-1` — and the deep main tab strip in its declared
 *         order on both faces, with a real body behind a real tab click;
 *     (c) the CHROME-CONTRACT §2 status law holds over what the BROWSER
 *         mounted, not over an AST walk: every mounted id is a `live` §2 row
 *         and no `pending` row appears. `src/ui/deepPaneSet.test.ts` proves the
 *         declaration agrees with §2; this proves the shell agrees with both;
 *     (d) returning through the same control restores the daily pane set
 *         BYTE-IDENTICALLY, with the seven-field cross-layout identity receipt
 *         intact in both directions.
 *
 *   PER-FACE, per [[DR-DEEP-LAYOUT-1]] — hence every assertion is made on both
 *   faces and the two deep tab strips are asserted to be DIFFERENT sets.
 * Does NOT own: the M1 surface's four-cell mode law (52.T2 —
 *   `m1-surface-face-layout.spec.ts`), the bimbaGraph rendering-mode
 *   differential (28.T28.3 — `bimba-graph-rendering-mode.spec.ts`), the switch
 *   itself (52.T3 — `layout-switch.spec.ts`), the subsystem pages (52.T5), or
 *   the activity-bar mode registry (52.T6). This spec is about WHICH PANES
 *   EXIST per layout, and nothing else.
 * Contract: [[CHROME-CONTRACT]] §2 · [[M5'-SPEC]] :91 / :107 (DCC-07) / :161 ·
 *   [[M'-TAURI-PORT-SPEC]] :65 · [[DR-DEEP-LAYOUT-1]] · rerun tranche [[52.T4]].
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import {
    DEEP_PANE_RESERVATIONS,
    DEEP_PANE_SET,
    DEEP_PANE_WITHDRAWALS,
    deepPaneMounts
} from '../../src/ui/deepPaneSet';
import { APP_ROOT } from './e2e-env';

/**
 * BUDGET, and the arithmetic behind it. The project default 60s is a ONE-boot
 * budget; this spec pays for three boot-sized events — the initial boot (20s,
 * the gateway-check budget) and two real layout transitions, each a full
 * FlexLayout remount of BOTH faces (52.T3's `routingRevision` bump) whose strip
 * is polled at 30s. Add the two heaviest body waits (the deep M1 workbench and
 * the full-lattice graph, 30s each) and the worst-case legitimate run is ~110s.
 * Hence 120s — not slack, and not a place a flat sleep hides: every wait below
 * is on a real SIGNAL (an attribute, a converged strip, a rendered pane). The
 * measured run is ~5s.
 */
test.setTimeout(120_000);

const CONTRACT_PATH = join(APP_ROOT, 'CHROME-CONTRACT.md');

/** The §2 status of every declared surface id. */
function contractStatuses(): Map<string, string> {
    const lines = readFileSync(CONTRACT_PATH, 'utf8').split('\n');
    const start = lines.findIndex(line => line.startsWith('## 2.'));
    let end = lines.length;
    for (let i = start + 1; i < lines.length; i++) {
        if (lines[i].startsWith('## ')) {
            end = i;
            break;
        }
    }
    const statuses = new Map<string, string>();
    for (const line of lines.slice(start, end)) {
        if (!/^\| `[^`]+` \|/.test(line)) {
            continue;
        }
        const cells = line.split('|').map(cell => cell.trim());
        statuses.set(cells[1].replace(/`/g, ''), cells[4]);
    }
    return statuses;
}

const STATUSES = contractStatuses();

const WITHDRAWN = DEEP_PANE_WITHDRAWALS.map(entry => entry.surfaceId);
const RESERVED = DEEP_PANE_RESERVATIONS.map(entry => entry.surfaceId);

/** The seven fields the identity tuple must carry across any transition. */
const IDENTITY_FIELDS = [
    'activityBarMode',
    'coordinate',
    'dayNow',
    'lens',
    'mode',
    'profileGeneration',
    'sessionKey'
] as const;

/**
 * The house boot idiom, with the boot-sized budget the gateway check uses. The
 * TICK wait is not decoration: `profileGeneration` is one of the seven identity
 * fields and this spec asserts it carries a real integer, so the shell has to
 * have received its first profile tick before the first crossing. Without it the
 * assertion is a race that loses on a cold run — which is exactly how it failed
 * once, in full-suite position, having passed every time in isolation.
 */
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

/**
 * What the ACTIVE layout mounts, read off the live shell. `App.tsx` publishes
 * this by walking both of the active cell's models, so it is the shell's own
 * answer rather than a restatement of the declaration.
 */
async function livePaneSet(page: Page): Promise<string[]> {
    const raw = await page.getByTestId('shell').getAttribute('data-layout-pane-set');
    expect(raw, 'the shell published no pane set').toBeTruthy();
    return (raw as string).split(' ').filter(Boolean);
}

/** The tab-button labels of the tabset on the face actually on screen. The
 *  hidden face stays mounted, so an unscoped locator answers for both. */
async function activeFaceTabLabels(page: Page): Promise<string[]> {
    return (
        await page
            .locator('.face-active .flexlayout__tabset_tabbar_inner_tab_container_top .flexlayout__tab_button_content')
            .allInnerTexts()
    ).map(label => label.trim());
}

/** The left-border tab labels on the face on screen (empty when there is no
 *  left border at all — which is face 0's daily state). */
async function activeFaceLeftBorderLabels(page: Page): Promise<string[]> {
    return (
        await page
            .locator('.face-active .flexlayout__border_left .flexlayout__border_button_content')
            .allInnerTexts()
    ).map(label => label.trim());
}

/**
 * Both readers above are one-shot, and a layout transition REMOUNTS the whole
 * FlexLayout tree (52.T3's `routingRevision`), so a bare read can land inside
 * the remount and see an empty strip. Every strip comparison therefore polls —
 * waiting on the real signal (the strip converging) with a bounded budget,
 * never on a duration.
 */
async function expectTabLabels(page: Page, expected: readonly string[], why: string): Promise<void> {
    await expect
        .poll(() => activeFaceTabLabels(page), { message: why, timeout: 30_000 })
        .toEqual([...expected]);
}

async function expectLeftBorderLabels(
    page: Page,
    expected: readonly string[],
    why: string
): Promise<void> {
    await expect
        .poll(() => activeFaceLeftBorderLabels(page), { message: why, timeout: 30_000 })
        .toEqual([...expected]);
}

interface IdentityReceipt {
    fromLayout: string;
    toLayout: string;
    before: Record<string, unknown>;
    after: Record<string, unknown>;
}

async function expectIdentityIntact(
    page: Page,
    from: string,
    to: string
): Promise<IdentityReceipt> {
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
    return receipt;
}

/** §2's law, applied to what the browser really mounted (claim c). */
function expectContractAgrees(mounted: readonly string[]): void {
    for (const id of mounted) {
        expect(STATUSES.get(id), `mounted surface \`${id}\` has no CHROME-CONTRACT §2 row`).toBeDefined();
        expect(
            STATUSES.get(id),
            `mounted surface \`${id}\` is §2 \`${STATUSES.get(id)}\` — only \`live\` may be in a model`
        ).toBe('live');
    }
    for (const [id, status] of STATUSES) {
        if (status === 'pending') {
            expect(
                mounted.includes(id),
                `\`${id}\` is §2 \`pending\` (doc-ahead, its tranche owns it) but the shell mounted it`
            ).toBe(false);
        }
    }
}

test('52.T4: the deep layout is its own rendered pane set, per face, and daily comes back whole', async ({
    page
}) => {
    await boot(page);
    const shell = page.getByTestId('shell');

    // seed a real coordinate so "identity intact" is not seven nulls
    await page.getByTestId('status-strip').click();
    await page.keyboard.press('Meta+Shift+Digit3');
    await expect(page.getByTestId('active-coordinate')).toHaveText('M3');

    // ── the daily ground state, captured for the return trip ───────────────
    await expect(shell).toHaveAttribute('data-active-layout', 'daily-0-1');
    const dailyPaneSet = await livePaneSet(page);
    expectContractAgrees(dailyPaneSet);
    // the daily layout carries every withdrawal — that is what makes the deep
    // absence below a real difference rather than a surface that never existed
    for (const id of WITHDRAWN) {
        expect(dailyPaneSet, `daily must carry \`${id}\` for its withdrawal to mean anything`).toContain(id);
    }
    await ensureFace(page, '0');
    await expect
        .poll(() => activeFaceTabLabels(page), { timeout: 30_000 })
        .toContain('Cosmic Engine');
    const dailyCosmicTabs = await activeFaceTabLabels(page);
    // face 0 has NO left border in the daily layout — the baseline for (b)
    await expectLeftBorderLabels(page, [], 'face 0 has no left border in the daily layout');
    await ensureFace(page, '1');
    await expect.poll(() => activeFaceTabLabels(page), { timeout: 30_000 }).toContain('Now');
    const dailyPersonalTabs = await activeFaceTabLabels(page);
    const dailyPersonalRail = await activeFaceLeftBorderLabels(page);
    expect(dailyPersonalRail).toEqual(
        expect.arrayContaining(['Vault', 'Journal', 'Calendar', 'Oracle'])
    );

    // ── enter depth through 52.T3's real control ───────────────────────────
    await switchLayout(page, 'ide-deep');
    const intoDeep = await expectIdentityIntact(page, 'daily-0-1', 'ide-deep');
    // the seven are intact AND carry real values — not seven honest nulls
    expect(intoDeep.after.coordinate).toBe('M3');
    expect(Number.isInteger(intoDeep.after.profileGeneration)).toBe(true);

    // ── (a) the shell's pane set IS the declaration ────────────────────────
    const deepPaneSet = await livePaneSet(page);
    for (const mount of DEEP_PANE_SET) {
        expect(
            deepPaneSet,
            `\`${mount.surfaceId}\` is declared in DEEP_PANE_SET but the deep shell did not mount it`
        ).toContain(mount.surfaceId);
    }
    for (const id of WITHDRAWN) {
        expect(
            deepPaneSet,
            `\`${id}\` is declared withdrawn ("do not merge them") but the deep shell mounted it`
        ).not.toContain(id);
    }
    for (const id of RESERVED) {
        expect(
            deepPaneSet,
            `\`${id}\` is RESERVED for its 28.x tranche — mounting it here steals that deliverable`
        ).not.toContain(id);
    }
    // and it is genuinely a DIFFERENT pane set, not the daily one relabelled
    expect(deepPaneSet.join(' ')).not.toEqual(dailyPaneSet.join(' '));

    // ── (c) §2 agrees with what the browser mounted ────────────────────────
    expectContractAgrees(deepPaneSet);

    // ── THE OPENING-TAB LAW (`ui/deepPaneSet.ts`) ──────────────────────────
    // BOTH faces' deep models render on entry, and FlexLayout mounts the
    // SELECTED tab of each tabset — so each model's FIRST declared mount comes
    // up with no gesture asking for it, on the hidden face too. An opening tab
    // that seizes shared singleton state therefore corrupts the shell just by
    // being first. This regressed exactly once and was caught by a SIBLING spec,
    // not by this one: `m1SurfaceDeep` embeds `WalkPane`, whose mount effect
    // auto-arrives at seed `M1` and publishes it into the ONE shared coordinate
    // store, so opening on it silently re-pointed every M0'/M1' subscriber.
    // `canonUpdateLedger` opens instead. The DETERMINISTIC gate is the unit one
    // (`DeepPaneMount.mountPublishes` + `deepPaneSet.test.ts`), because this
    // read only catches the seizure when the substrate answers before it runs —
    // which is precisely why the bug survived a solo run of the sibling spec.
    // It is kept as the behavioural half: the store, not the declaration.
    await expect(page.getByTestId('active-coordinate')).toHaveText('M3');

    // ── (b) it renders — face 1: the deep main strip in declared order ─────
    await ensureFace(page, '1');
    const deepPersonalExpected = deepPaneMounts('personal', 'main').map(mount => mount.label);
    await expectTabLabels(
        page,
        deepPersonalExpected,
        'the personal deep main strip must be DEEP_PANE_SET in declared order'
    );
    expect(deepPersonalExpected).not.toContain('Now');
    // the IDE explorer rail replaced the daily lived-reading rail
    await expectLeftBorderLabels(
        page,
        ['Vault', 'Connections'],
        'the deep left slot is the IDE explorer rail, not the daily reading rail'
    );
    // the strip is not scenery: a real click on a deep main tab yields depth the
    // daily layout structurally withholds (DR-M1-FACE-LAYOUT-1 gates the
    // eight-slot workbench on face 1 AND `ide-deep`; before 52.T4 the layout
    // gate had no pane set to open in).
    await page
        .locator('.face-active .flexlayout__tab_button', { hasText: 'M1 Deep' })
        .first()
        .click();
    await expect(page.locator('.face-active [data-testid="m1-body-standalone-ide-deep"]')).toBeVisible({
        timeout: 30_000
    });
    // …and a real click on a deep RAIL tab yields a real body. `Connections` is
    // index 1, never the selected one, so this selects rather than toggling the
    // border collapsed — which is what a click on the already-selected `Vault`
    // would do, and which would prove nothing either way.
    await page.locator('.face-active .flexlayout__border_left .flexlayout__border_button', {
        hasText: 'Connections'
    }).first().click();
    await expect(
        page.locator('.face-active [data-testid="semantic-connections-pane"]')
    ).toBeVisible({ timeout: 20_000 });

    // ── (b) face 0: an explorer rail where the daily layout has none ───────
    await ensureFace(page, '0');
    const deepCosmicExpected = deepPaneMounts('cosmic', 'main').map(mount => mount.label);
    await expectTabLabels(
        page,
        deepCosmicExpected,
        'the cosmic deep main strip must be DEEP_PANE_SET in declared order'
    );
    expect(deepCosmicExpected).not.toContain('Cosmic Engine');
    // this is the first-ever face-0 left border: [] in daily, the rail in deep
    await expectLeftBorderLabels(
        page,
        ['Vault', 'Connections'],
        'face 0 gains an explorer rail in depth that it structurally lacks in daily'
    );
    // the two deep models are different pane sets (DR-DEEP-LAYOUT-1, per-face)
    expect(deepCosmicExpected).not.toEqual(deepPersonalExpected);
    // …and its first tab really renders: the M0 chrome :161 names
    await page.locator('.face-active .flexlayout__tab_button', { hasText: 'Bimba' }).first().click();
    await expect(page.locator('.face-active [data-testid="graph-explorer"]')).toBeVisible({
        timeout: 30_000
    });

    // ── (d) the return trip, through the same control ──────────────────────
    await ensureFace(page, '1');
    await switchLayout(page, 'daily-0-1');
    const backToDaily = await expectIdentityIntact(page, 'ide-deep', 'daily-0-1');
    // Substance, but NOT a frozen value: `bimbaGraph` publishes its own live
    // selection into the one shared coordinate store, so working inside the deep
    // layout legitimately moves the coordinate. The invariant DCC-07 asks for is
    // that the CROSSING does not move it — which is what the receipt above
    // asserts, before/after, on both transitions. Re-asserting the seeded 'M3'
    // here would be asserting that the deep surfaces did nothing.
    expect(backToDaily.after.coordinate, 'the crossing carried a real coordinate').toBeTruthy();
    expect(
        (await livePaneSet(page)).join(' '),
        'the daily pane set must come back exactly as it was left'
    ).toEqual(dailyPaneSet.join(' '));
    await expectTabLabels(page, dailyPersonalTabs, 'the daily personal strip must return whole');
    await expectLeftBorderLabels(page, dailyPersonalRail, 'the daily reading rail must return whole');
    await ensureFace(page, '0');
    await expectTabLabels(page, dailyCosmicTabs, 'the daily cosmic strip must return whole');
    await expectLeftBorderLabels(page, [], 'face 0 must lose the explorer rail again');
});
