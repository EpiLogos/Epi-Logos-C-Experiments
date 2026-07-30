/**
 * Coordinate: M' M5' chrome (drivable-loop spec: the ACR deep pane — 28.T28.5)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): real Chromium / real spawned gateway carrier proof
 * Actualises: the UF half of 28.T28.5. The tranche's deliverable is not "an
 *   `AgenticControlRoomPane` component exists" — it is that the GOVERNANCE
 *   PRIMARY surface [[CHROME-CONTRACT]] §5 (DR-WC-IS-1) names is reachable, in
 *   depth, through canon's own mechanism. So this spec never renders a
 *   component: it boots the shell, crosses into `ide-deep` through 52.T3's real
 *   `OmniPanelLayoutSwitch`, and asserts the control room in the tabset 52.T4
 *   reserved for it. Four claims:
 *
 *     (a) DEEP-ONLY — the control room is absent from the daily layout on both
 *         faces (no tab, no pane, not in the shell's own `data-layout-pane-set`)
 *         and present after the crossing. That asymmetry is the whole of "it
 *         mounts in the deep pane set"; asserting only the presence would pass
 *         just as well if it had been added to the daily shell by mistake.
 *     (b) it is in `personal-deep-main` and NOT in `cosmic-deep-main` — the
 *         personal deep main strip is asserted to equal `deepPaneMounts
 *         ('personal', 'main')` in declared order, which is that tabset's
 *         identity (the sibling 52.T4 spec proves the two deep strips differ),
 *         and the cosmic strip is asserted not to carry the tab at all.
 *     (c) a real tab click yields the real BODY, and the body carries the
 *         tranche: the Pi-monitor reframe over the preserved widget id (c), the
 *         DR-M5-1 roster with Sophia as a facet and never an actor (b), the
 *         RunTree + review-queue + evidence-deposit governance sections (d).
 *     (d) the two methods the spec named and the substrate does not register are
 *         surfaced HONESTLY in the running app: the abort/retry/continue
 *         controls are disabled with `s5'.epii.runtime_control` and its reason
 *         on screen, the decision seam names `s5'.review.resolve` with the
 *         correction, and the string `s5'.review.transition` appears in the
 *         rendered document ONLY as the corrected spec name — never as a method
 *         anything claims to call.
 *
 *   BUDGET, and the arithmetic. The project default 60s is a ONE-boot budget;
 *   this spec pays for two boot-sized events — the initial boot (20s, the
 *   gateway-check budget) and one real layout transition, a full FlexLayout
 *   remount of BOTH faces (52.T3's `routingRevision` bump) whose strip is polled
 *   at 30s — plus the control-room body behind a real tab click (20s). Worst
 *   case ~75s, hence 90s. Every wait below is on a real SIGNAL (an attribute, a
 *   converged strip, a rendered pane); there is no `waitForTimeout` in this file.
 * Does NOT own: the switch (52.T3 — `layout-switch.spec.ts`), WHICH panes exist
 *   per layout (52.T4 — `deep-pane-set.spec.ts`), the pure governance law
 *   (`src/panes/acr/acrGovernance.test.ts`), or the jsdom render
 *   (`src/panes/acr/AgenticControlRoomPane.test.tsx`).
 * Contract: [[CHROME-CONTRACT]] §2 (`agenticControlRoom`) + §5 (DR-WC-IS-1) ·
 *   [[DR-M5-1]] · [[DR-ACR-1]] · rerun tranche [[28.T28.5]].
 */

import { expect, test, type Page } from '@playwright/test';
import {
    ACR_PANE_TITLE,
    ACR_TAB_LABEL,
    ACR_WIDGET_ID,
    PI_RUNTIME_MONITOR_BANNER
} from '../../src/panes/acr/acrGovernance';
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

/** The tab-button labels of the tabset on the face actually on screen. */
async function activeFaceTabLabels(page: Page): Promise<string[]> {
    return (
        await page
            .locator(
                '.face-active .flexlayout__tabset_tabbar_inner_tab_container_top .flexlayout__tab_button_content'
            )
            .allInnerTexts()
    ).map(label => label.trim());
}

/** A layout transition REMOUNTS the whole FlexLayout tree, so a bare read can
 *  land inside the remount and see an empty strip. Poll on the real signal. */
async function expectTabLabels(page: Page, expected: readonly string[], why: string): Promise<void> {
    await expect.poll(() => activeFaceTabLabels(page), { message: why, timeout: 30_000 }).toEqual([
        ...expected
    ]);
}

/** What the ACTIVE layout mounts, read off the live shell (`App.tsx` walks both
 *  models of the active cell and publishes it — the shell's own answer). */
async function livePaneSet(page: Page): Promise<string[]> {
    const raw = await page.getByTestId('shell').getAttribute('data-layout-pane-set');
    expect(raw, 'the shell published no pane set').toBeTruthy();
    return (raw as string).split(' ').filter(Boolean);
}

test('28.T28.5: the Pi Runtime Monitor is the governance-primary pane of `personal-deep-main`', async ({
    page
}) => {
    await boot(page);
    const shell = page.getByTestId('shell');

    // ── (a) the daily ground state: the control room is NOWHERE ────────────
    await expect(shell).toHaveAttribute('data-active-layout', 'daily-0-1');
    expect(
        await livePaneSet(page),
        'the control room is DEEP-ONLY — no daily model may mount it'
    ).not.toContain('agenticControlRoom');
    await ensureFace(page, '1');
    await expect.poll(() => activeFaceTabLabels(page), { timeout: 30_000 }).toContain('Now');
    expect(await activeFaceTabLabels(page)).not.toContain(ACR_TAB_LABEL);
    await expect(page.locator('[data-testid="agentic-control-room"]')).toHaveCount(0);

    // ── enter depth through 52.T3's real control ───────────────────────────
    await switchLayout(page, 'ide-deep');
    expect(
        await livePaneSet(page),
        'the deep shell must mount the surface 52.T4 reserved for this tranche'
    ).toContain('agenticControlRoom');

    // ── (b) it is in `personal-deep-main`, and only there ──────────────────
    await ensureFace(page, '1');
    const personalStrip = deepPaneMounts('personal', 'main').map(mount => mount.label);
    expect(personalStrip, 'the declaration must carry the reframed tab').toContain(ACR_TAB_LABEL);
    await expectTabLabels(
        page,
        personalStrip,
        'the personal deep main strip must be DEEP_PANE_SET in declared order, with the control room in it'
    );
    // …and NOT first: the opening tab of each deep tabset mounts on layout
    // entry, on the hidden face too, and this pane reads three gateway seams.
    expect(personalStrip[0]).not.toBe(ACR_TAB_LABEL);

    await ensureFace(page, '0');
    const cosmicStrip = deepPaneMounts('cosmic', 'main').map(mount => mount.label);
    await expectTabLabels(page, cosmicStrip, 'the cosmic deep main strip must not gain the tab');
    expect(cosmicStrip, 'governance depth is the personal face (M5′, :161)').not.toContain(
        ACR_TAB_LABEL
    );

    // ── (c) a real tab click yields the real body ──────────────────────────
    await ensureFace(page, '1');
    await page
        .locator('.face-active .flexlayout__tab_button', { hasText: ACR_TAB_LABEL })
        .first()
        .click();
    const room = page.locator('.face-active [data-testid="agentic-control-room"]');
    await expect(room).toBeVisible({ timeout: 20_000 });

    // (c) the Pi-monitor reframe over the PRESERVED widget id
    const banner = room.locator('[data-testid="pi-runtime-monitor-banner"]');
    await expect(banner).toHaveAttribute('data-widget-id', ACR_WIDGET_ID);
    await expect(room.locator('[data-testid="acr-pane-title"]')).toHaveText(ACR_PANE_TITLE);
    await expect(banner).toContainText(PI_RUNTIME_MONITOR_BANNER);

    // (b) the DR-M5-1 roster: eight executable targets, six non-executable facets
    await expect(room.locator('[data-testid="acr-dispatch-targets"] > li')).toHaveCount(8);
    await expect(room.locator('[data-testid="acr-dispatch-target-pi"]')).toBeVisible();
    await expect(room.locator('[data-testid="acr-dispatch-target-zeithoven"]')).toHaveAttribute(
        'data-mode',
        'crystallisation'
    );
    await expect(room.locator('[data-testid="acr-aspect-registers"] > li')).toHaveCount(6);
    await expect(room.locator('[data-testid="acr-aspect-register-sophia"]')).toHaveAttribute(
        'data-executable',
        'false'
    );
    await expect(
        room.locator('[data-testid="acr-dispatch-target-sophia"]'),
        'Sophia surfaces only as a facet, never an actor row (DR-M5-1)'
    ).toHaveCount(0);

    // (d) the governance sections are really rendered, over live reads
    await expect(room.locator('[data-testid="acr-run-tree"]')).toBeVisible();
    await expect(room.locator('[data-testid="acr-review-queue"]')).toBeVisible();
    await expect(room.locator('[data-testid="evidence-deposit-form"]')).toBeVisible();
    await expect(room.locator('[data-testid="acr-capability-source"]')).not.toBeEmpty();

    // ── (d) the two unimplemented methods, surfaced honestly in a real browser
    const runtime = room.locator('[data-testid="abort-retry-continue-controls"]');
    await expect(runtime).toHaveAttribute('data-wire-state', 'unwired');
    for (const action of ['abort', 'retry', 'continue']) {
        await expect(room.locator(`[data-testid="acr-runtime-${action}"]`)).toBeDisabled();
    }
    await expect(room.locator('[data-testid="acr-runtime-pending-wire"]')).toContainText(
        "s5'.epii.runtime_control"
    );
    await expect(room.locator('[data-testid="acr-runtime-pending-wire"]')).toContainText(
        'No such method exists'
    );
    const register = room.locator('[data-testid="acr-method-register"]');
    await expect(register.locator('[data-testid="acr-seam-review-decision"]')).toHaveAttribute(
        'data-status',
        'live'
    );
    await expect(register).toContainText("s5'.review.resolve");
    await expect(register).toContainText("spec named `s5'.review.transition`");
    // …and it appears ONLY as prose. The `<code>` cells are the METHOD column —
    // what the surface claims to call — so the absent name must not be among
    // them. A prose mention is a correction; a code cell would be a claim.
    const claimedMethods = await register.locator('code').allInnerTexts();
    expect(claimedMethods.map(text => text.trim())).toContain("s5'.review.resolve");
    expect(
        claimedMethods.map(text => text.trim()),
        "the surface must never claim to call a method that is registered nowhere"
    ).not.toContain("s5'.review.transition");
});
