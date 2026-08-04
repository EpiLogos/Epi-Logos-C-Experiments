/**
 * Coordinate: M' M4' (drivable-loop spec: Wave-C contribution register — 25.T25.21)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): real Chromium carrier proof
 * Actualises: the UF half of 25.21. The vitest gate reads sources and proves
 *   the register's claims are TEXTUALLY true — the symbol is in the file, the
 *   key is in the model, the label sits beside the key. None of that proves the
 *   surface can actually be REACHED: a tab can be declared, wired and labelled
 *   correctly and still never paint. Track 25 is class UF, and jsdom cannot
 *   close it, so this spec drives every enrolled mechanism in a real browser.
 *
 *   THE WORK-LIST IS DERIVED FROM THE REGISTER, not written out beside it. A
 *   hand-copied list would drift, and worse, it would let a row claim
 *   reachability that no receipt ever exercises. Importing the rows means a new
 *   enrolment is automatically driven, and a row whose mechanism does not work
 *   fails here.
 *
 *   WHAT THIS SPEC DELIBERATELY DOES NOT ASSERT: that a gapped surface renders
 *   in some other form. A gap is a claim of absence, and absence is proven by
 *   the negative sweep at the end — not by hunting for a substitute.
 *
 *   THE SPEC:290 CONSUMER LAYOUT IS DRIVEN, NOT DESCRIBED. The vitest gate
 *   reconciles the register's slot table against the live
 *   `loadPersonalComposition()` in Node. That proves the loader agrees; it does
 *   not prove the grant reaches a mounted composition. So the consumer test
 *   opens the personal composition in a real browser and reads each
 *   `data-<slot>-owner` the engine publishes. The two slots whose specced
 *   occupant is carried elsewhere are then DRIVEN at the mount that carries
 *   them, because a carry nobody exercises is indistinguishable from a loss.
 * Does NOT own: the surfaces' behaviour (each has its own spec), the layout
 *   domain, or the privacy tints (tests/e2e/privacy-chrome.spec.ts).
 * Contract: [[M4'-SPEC]] + rerun tranche [[25.T25.21]].
 */

import { expect, test, type Page } from '@playwright/test';
import {
    INTEGRATED_450_CONSUMER_LAYOUT,
    M4_WAVE_C_CONTRIBUTIONS,
    gappedWaveCContributions,
    presentWaveCContributions
} from '../../src/composition/waveCContributions';

/**
 * Boot onto the personal face WITH A DAY ANCHORED.
 *
 * The anchor is not test scaffolding, it is a precondition of the surfaces
 * themselves: several M4 surfaces are lived-day surfaces and correctly render a
 * "no day anchored" state instead of their body until one exists — the oracle
 * refuses to paint at all (`OraclePane.tsx:101`, "Casts are lived events").
 * Driving them without a day would prove only that the empty state works.
 */
async function bootPersonalFace(page: Page): Promise<void> {
    await page.goto('/');
    // Boot-sized budget: first paint under full-suite load routinely exceeds
    // the 10s project default, and a boot timeout reports RED while proving
    // nothing about the register.
    await expect(page.getByTestId('shell')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('shell')).toHaveAttribute('data-active-layout', 'daily-0-1');
    // The personal face is face 1. The coin toggle is the only way across, and
    // driving it rather than forcing state is the point of a UF receipt.
    if ((await page.getByTestId('shell').getAttribute('data-face')) !== '1') {
        await page.getByTestId('face-toggle').click();
    }
    await expect(page.getByTestId('shell')).toHaveAttribute('data-face', '1');

    const editor = page.locator('.face-active [data-testid="m4-nara-editor"]');
    const beginButton = page.getByTestId('now-begin-today');
    await expect(editor.or(beginButton).first()).toBeVisible({ timeout: 15_000 });
    if (await beginButton.isVisible().catch(() => false)) {
        await beginButton.click().catch(() => undefined);
    }
    await expect(page.getByTestId('status-daynow')).not.toContainText('no day', { timeout: 15_000 });
}

/** Click the tab that the register says carries this surface, by its label. */
async function openTab(page: Page, label: string, region: string): Promise<void> {
    const selector =
        region === 'personal-left-border'
            ? '.face-active .flexlayout__border_button'
            : '.face-active .flexlayout__tab_button';
    const button = page.locator(selector, { hasText: label }).first();
    await expect(button, `no ${region} tab is labelled '${label}'`).toBeVisible({ timeout: 20_000 });
    await button.click();
}

test('25.T25.21: every enrolled tab surface is reachable by the label the register declares', async ({
    page
}) => {
    await bootPersonalFace(page);

    const tabRows = presentWaveCContributions().filter(row => row.mount.kind === 'flexlayout-tab');
    // If the register ever stops enrolling tab surfaces this assertion fails
    // rather than the loop silently passing over an empty list.
    expect(tabRows.length, 'the register enrolled no tab surfaces at all').toBeGreaterThan(8);

    for (const row of tabRows) {
        if (row.mount.kind !== 'flexlayout-tab') continue;
        await openTab(page, row.mount.tabLabel, row.mount.region);
        const surface = page.getByTestId(row.testid as string);
        await expect(
            surface,
            `${row.viewId}: clicking '${row.mount.tabLabel}' did not paint data-testid="${row.testid}"`
        ).toBeVisible({ timeout: 20_000 });

        // AND IT MUST BE THE SURFACE ROOT, not something inside it.
        //
        // Every source-level assertion passes for a testid that names a CHILD
        // element — the file really does emit it — so the register could claim
        // a refresh button as a whole surface and no gate noticed. An
        // independent verifier proved that: swapping one row's testid for a
        // button inside it left vitest AND this suite fully green. Rootness is
        // a DOM fact, so it is checked here: inside its own tab panel, the
        // named element must have no ancestor that also carries a testid.
        const isRoot = await surface.evaluate(el => {
            const panel = el.closest('.flexlayout__tab');
            if (!panel) return false;
            for (let p = el.parentElement; p && p !== panel; p = p.parentElement) {
                if (p.hasAttribute('data-testid')) return false;
            }
            return true;
        });
        expect(
            isRoot,
            `${row.viewId}: data-testid="${row.testid}" is nested inside another handled element, ` +
                'so it names a part of the surface rather than the surface'
        ).toBe(true);
    }
});

test('25.T25.21: the overlay surface opens through the command the register names', async ({ page }) => {
    await bootPersonalFace(page);

    const overlayRows = presentWaveCContributions().filter(row => row.mount.kind === 'overlay-command');
    expect(overlayRows.length).toBeGreaterThan(0);

    for (const row of overlayRows) {
        if (row.mount.kind !== 'overlay-command') continue;
        // Executed through the real command spine, the same path the palette
        // and the cold-start use — not by mutating component state.
        await page.evaluate(async commandId => {
            const registry = await import('/src/commands/registry.ts');
            await registry.commands.execute(commandId);
        }, row.mount.commandId);
        await expect(
            page.getByTestId(row.testid as string),
            `${row.viewId}: '${row.mount.commandId}' did not open the surface`
        ).toBeVisible({ timeout: 20_000 });
    }
});

test('25.T25.21: the nested day container appears only under its host, on selection', async ({ page }) => {
    await bootPersonalFace(page);

    const container = M4_WAVE_C_CONTRIBUTIONS.find(row => row.viewId === 'm4.nara.dayContainer');
    expect(container?.mount.kind).toBe('nested-section');

    // Before the host is open the section must not be anywhere in the DOM —
    // that is what makes `nested-section` a real relation rather than a label.
    await expect(page.getByTestId('day-container')).toHaveCount(0);

    await openTab(page, 'Calendar', 'personal-left-border');
    await expect(page.getByTestId('day-calendar')).toBeVisible({ timeout: 20_000 });

    const day = page.locator('[data-testid^="cal-day-"]').first();
    // No selectable cell means the calendar did not paint its grid — a real
    // failure of the host, never a reason to pass.
    await expect(day, 'the day calendar painted no selectable day cell').toBeVisible({ timeout: 20_000 });
    await day.click();
    await expect(page.getByTestId('day-container')).toBeVisible({ timeout: 20_000 });
    // The register records this section as STRICTER than its host pane, and
    // this is the only place that claim can be checked against what renders.
    await expect(page.getByTestId('day-container')).toHaveClass(
        /mext-privacy-protected-local-handle-only/
    );
    await expect(page.getByTestId('day-calendar')).toHaveClass(/mext-privacy-protected-local(?!-)/);
});

test('25.T25.21: the daily-only surface obeys the layout gate the register records', async ({ page }) => {
    await page.goto('/');
    const shell = page.getByTestId('shell');
    await expect(shell).toBeVisible({ timeout: 20_000 });
    await expect(shell).toHaveAttribute('data-active-layout', 'daily-0-1');

    // DERIVED, not hardcoded. This assertion used to name one view id, and
    // 52.T4 made twelve rows daily-only when the deep layout began withdrawing
    // the shell previews — so a hardcoded list turned into a stale claim that
    // failed for a reason having nothing to do with what it tested. The register
    // is the source; the browser's job is to hold it to its word.
    const dailyOnly = M4_WAVE_C_CONTRIBUTIONS.filter(row => row.layoutLaw === 'daily-only');
    expect(dailyOnly.length, 'the register claims no daily-only surfaces at all').toBeGreaterThan(0);
    const withdrawn = dailyOnly.filter(row => row.testid !== null);

    // The Mercurius chip's gate is `face === 0 && activeLayout === 'daily-0-1'`,
    // so the cosmic face in the daily layout is exactly where it must appear.
    if ((await shell.getAttribute('data-face')) !== '0') {
        await page.getByTestId('face-toggle').click();
    }
    await expect(shell).toHaveAttribute('data-face', '0');
    await expect(page.getByTestId('m4-mercurius-relay')).toBeVisible({ timeout: 20_000 });

    // Cross into the deep layout through the REAL switch. 52.T3 landed
    // `layout.switch.ide-deep` and deliberately removed the cross-layout-intent
    // side channel this test used to ride ("the side channel that stood in for
    // it is gone"), so driving the intent would now prove nothing.
    await page.evaluate(async () => {
        const registry = await import('/src/commands/registry.ts');
        await registry.commands.execute('layout.switch.ide-deep');
    });
    await expect(shell).toHaveAttribute('data-active-layout', 'ide-deep', { timeout: 20_000 });

    // The claim under test: every surface the register calls daily-only really
    // is gone from the deep layout. A row that survives here is a row whose
    // layout law is a guess.
    for (const row of withdrawn) {
        await expect(
            page.getByTestId(row.testid as string),
            `${row.viewId} is declared daily-only but still renders under ide-deep`
        ).toHaveCount(0);
    }
});

/** Drive whatever mechanism a row declares, and wait for its handle to paint. */
async function driveRow(page: Page, viewId: string): Promise<void> {
    const row = M4_WAVE_C_CONTRIBUTIONS.find(entry => entry.viewId === viewId);
    if (!row) throw new Error(`${viewId} is not enrolled in the register`);
    const mount = row.mount;
    if (mount.kind === 'flexlayout-tab') {
        await openTab(page, mount.tabLabel, mount.region);
    } else if (mount.kind === 'nested-section') {
        const host = M4_WAVE_C_CONTRIBUTIONS.find(
            entry => entry.mount.kind === 'flexlayout-tab' && entry.mount.component === mount.hostComponent
        );
        if (!host || host.mount.kind !== 'flexlayout-tab') {
            throw new Error(`${viewId} nests in '${mount.hostComponent}', which is not an enrolled tab`);
        }
        await openTab(page, host.mount.tabLabel, host.mount.region);
        const day = page.locator('[data-testid^="cal-day-"]').first();
        await expect(day, `${viewId}: its host painted no selectable day`).toBeVisible({ timeout: 20_000 });
        await day.click();
    } else {
        throw new Error(`${viewId}: no drive mechanism for mount kind '${mount.kind}'`);
    }
    await expect(
        page.getByTestId(row.testid as string),
        `${viewId}: driving its declared mount did not paint data-testid="${row.testid}"`
    ).toBeVisible({ timeout: 20_000 });
}

test('25.T25.21: the integrated 4-5-0 consumer grants every slot the owner the register records', async ({
    page
}) => {
    await bootPersonalFace(page);
    // The carrier's real consumer is the personal recognition engine, which runs
    // `loadPersonalComposition()` and publishes each granted owner. The vitest
    // gate reconciles the register against that loader in Node; only a browser
    // can show the grant actually reaching the DOM of a mounted composition.
    await openTab(page, 'Now', 'personal-main');
    const engine = page.locator('.face-active [data-testid="personal-recognition-engine"]');
    await expect(engine, 'the personal composition did not mount').toBeVisible({ timeout: 20_000 });

    for (const slot of INTEGRATED_450_CONSUMER_LAYOUT) {
        await expect(
            engine,
            `${slot.slot}: the mounted composition does not grant it to ${slot.carrierOwner}`
        ).toHaveAttribute(slot.ownerAttribute, slot.carrierOwner);
    }

    // A blocked slot paints nothing. This remains a live invariant even though
    // 25.T25.6 lifted the last current blocker; the center slot is now proven
    // separately as an as-specced, mounted surface.
    const blocked = INTEGRATED_450_CONSUMER_LAYOUT.filter(slot => slot.fate === 'blocked');
    for (const slot of blocked) {
        await expect(
            page.locator(`[data-view-id="${slot.specViewId}"]`),
            `${slot.slot} is on screen, but the register calls it blocked`
        ).toHaveCount(0);
    }

    const center = INTEGRATED_450_CONSUMER_LAYOUT.find(slot => slot.slot === 'center-composition');
    expect(center?.fate).toBe('as-specced');
    await expect(page.locator('[data-view-id="m4.nara.personalField"]')).toBeVisible();
});

test('25.T25.21: each carried-elsewhere slot really reaches the user where the register says', async ({
    page
}) => {
    await bootPersonalFace(page);
    // Two of SPEC:290's three specced occupants are not in their specced slot.
    // Recording that and stopping would read as a loss; this drives the mount
    // that carries the function instead, so the carry is proven, not asserted.
    const carried = INTEGRATED_450_CONSUMER_LAYOUT.filter(slot => slot.fate === 'carried-elsewhere');
    expect(carried.length, 'no carry would make this assertion vacuous').toBeGreaterThan(0);
    for (const slot of carried) {
        await driveRow(page, slot.carriedAt as string);
    }
});

test('25.T25.21: every routed selection handler lands on the surface that declares it', async ({
    page
}) => {
    await bootPersonalFace(page);
    // The frozen contract routed all 23 handlers to one constant path. Here each
    // routed row names a registered cross-layout target, and the only way to
    // know the route works is to dispatch it through the real intent spine and
    // watch the surface paint.
    const routed = M4_WAVE_C_CONTRIBUTIONS.filter(
        row => row.selectionHandler?.intentTarget != null && row.testid !== null
    );
    expect(routed.length, 'the register routed nothing at all').toBeGreaterThan(3);

    for (const row of routed) {
        const target = row.selectionHandler!.intentTarget!;
        await page.evaluate(async ({ extensionId, contributionId }) => {
            const registry = await import('/src/commands/registry.ts');
            const crossLayout = await import('/src/commands/crossLayoutIntent.ts');
            await registry.commands.execute(crossLayout.CROSS_LAYOUT_INTENT_COMMAND, {
                coordinate: null,
                artifactUri: null,
                reviewId: null,
                dayNow: null,
                sessionKey: null,
                profileGeneration: 0,
                privacyClass: null,
                requestedExtensionId: extensionId,
                requestedContributionId: contributionId
            });
        }, target);
        await expect(
            page.getByTestId(row.testid as string),
            `${row.viewId}: dispatching ${target.extensionId}/${target.contributionId} did not paint data-testid="${row.testid}"`
        ).toBeVisible({ timeout: 20_000 });
    }
});

test('25.T25.21: every declared gap really renders nothing, in both layouts', async ({ page }) => {
    await bootPersonalFace(page);

    // A gap is a claim of absence. Absence is checked by VIEW ID, not by a
    // made-up test handle: asserting that an invented handle is missing proves
    // nothing at all, whereas the carrier's own convention is that a Wave-C
    // surface stamps `data-view-id` with the id it serves. So if a gapped id
    // ever appears there, the register is under-reporting delivered work — the
    // failure mode that lets a pending tranche look closed.
    const gapped = gappedWaveCContributions();
    expect(gapped.length).toBeGreaterThan(0);

    for (const row of gapped) {
        await expect(
            page.locator(`[data-view-id="${row.viewId}"]`),
            `${row.viewId} is on screen, but the register calls it a gap owed by ${row.gap!.ownerTranche}`
        ).toHaveCount(0);
    }

    // The converse, on the same page: an id the register calls PRESENT and that
    // stamps a view id must really stamp it. Without this the sweep above would
    // pass just as well if `data-view-id` had been removed from the carrier
    // entirely, which would make every absence assertion vacuous.
    await openTab(page, 'Logos', 'personal-main');
    await expect(page.locator('[data-view-id="m4.nara.logosCycle"]')).toHaveCount(1);
});
