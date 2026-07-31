/**
 * Coordinate: M' M5' chrome (drivable-loop spec: the ACR deep pane — 28.T28.5 / 28.T28.8)
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
 *
 *   THE SECOND TEST is 28.T28.8's UF half — DR-WC-IS-2's DEEP evidence render,
 *   which lands in this same pane (§5 gives the full governance/evidence work to
 *   the deep surfaces). THE THIRD is 28.T28.9's review split. THE FOURTH is
 *   26.T26.7's T8 ToolStream crossing — the one T8 content this carrier
 *   composes rather than mounts, and which was therefore reachable from the
 *   governance pane by no path until that tranche. Each carries its own
 *   docblock, claims, and budget.
 * Does NOT own: the switch (52.T3 — `layout-switch.spec.ts`), WHICH panes exist
 *   per layout (52.T4 — `deep-pane-set.spec.ts`), the pure governance law
 *   (`src/panes/acr/acrGovernance.test.ts`), or the jsdom render
 *   (`src/panes/acr/AgenticControlRoomPane.test.tsx`).
 * Contract: [[CHROME-CONTRACT]] §2 (`agenticControlRoom`) + §5 (DR-WC-IS-1) ·
 *   [[DR-M5-1]] · [[DR-ACR-1]] · rerun tranche [[28.T28.5]].
 */

import { expect, test, type Page } from '@playwright/test';
import { gatewayRpc } from './gateway-rpc';
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

    // 26.T26.8 — DR-WC-M5-3's legend clause, in a real browser: seven facets in
    // canonical order in the governance header, each hovering the `## 6. Sattva`
    // section that is its source of record, and NONE of them an actor row.
    const legend = room.locator('[data-testid="acr-psyche-legend"]');
    await expect(legend).toBeVisible();
    await expect(legend.locator('[role="listitem"]')).toHaveCount(7);
    expect(
        await legend.locator('[role="listitem"]').evaluateAll(items =>
            items.map(item => item.getAttribute('data-psyche-facet'))
        ),
        'the legend order DR-WC-M5-3 fixes'
    ).toEqual(['sophia', 'anima', 'logos', 'eros', 'mythos', 'psyche', 'nous']);
    for (const facet of ['sophia', 'nous', 'psyche']) {
        await expect(room.locator(`[data-testid="acr-psyche-legend-${facet}"]`)).toHaveAttribute(
            'title',
            new RegExp(`Body/S/S4/pi-agent/agents/${facet}\\.md#6-sattva$`)
        );
        await expect(
            room.locator(`[data-testid="acr-dispatch-target-${facet}"]`),
            `${facet} is a voice, never a dispatch target`
        ).toHaveCount(0);
    }

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

/**
 * 28.T28.8 — DR-WC-IS-2's DEEP half, driven end to end.
 *
 * The frozen tree had two evidence widgets; this carrier has ONE evidence fold
 * plus the governance-primary deep pane, so the FULL MediatedRunEvidencePacket
 * render lands inside the control room and the `/` membrane keeps the
 * abbreviated one. Proving that needs a REAL packet, and a packet needs an
 * anchored deposit — so this spec files one through the control room's own live
 * `s5'.epii.deposit` form and then audits it, rather than asserting an empty
 * surface exists.
 *
 * Four claims: (1) the audit section is deep-only, like the pane hosting it;
 * (2) a deposit filed here composes a packet the audit lists; (3) selecting it
 * renders `fold="deep"` — the trace OPEN and the IOD-17 three-face readout the
 * producer filled from this pane's live `s4'.mediation.capabilities.list`, the
 * field 26.10 declared and nothing populated before this tranche; (4) the axiom
 * seam is DISABLED on screen and names the target the ledger cannot resolve.
 *
 * BUDGET: the sibling above pays for boot + one layout transition + a tab click
 * (~75s). This one adds the day + session anchoring a packet requires, a real
 * gateway WRITE, and the re-read it triggers, so it takes 180s. Every wait is on
 * a real signal; there is no `waitForTimeout` in this file.
 */
test('28.T28.8: the control room renders the FULL packet the `/` fold abbreviates', async ({
    page
}) => {
    test.setTimeout(180_000);

    // A packet is anchored to a SESSION and a DAY; without both the producer
    // composes nothing rather than inventing an anchor. So both are established
    // for real first, in the daily layout that owns those gestures — the same
    // house idiom `evidence-deposition-loop.spec.ts` uses.
    const sessionId = `acr-audit-${Date.now().toString(36)}`;
    await gatewayRpc('sessions.import', {
        targetSessionKey: sessionId,
        sourceSessionKey: 'acr-audit-origin',
        label: 'e2e acr evidence audit'
    });
    await boot(page);

    // (1) the audit is deep-only, exactly like its host pane.
    await expect(page.getByTestId('acr-evidence-audit')).toHaveCount(0);

    await ensureFace(page, '1');
    await page.locator('.face-active .flexlayout__tab_button', { hasText: 'Now' }).first().click();
    const beginToday = page.getByTestId('now-begin-today');
    const nowPane = page.getByTestId('now-pane');
    await expect(nowPane.or(beginToday).first()).toBeVisible({ timeout: 20_000 });
    if (await beginToday.isVisible().catch(() => false)) {
        await beginToday.click().catch(() => undefined);
    }
    await expect(nowPane).toBeVisible({ timeout: 20_000 });
    await expect(nowPane).not.toHaveAttribute('data-day', '', { timeout: 20_000 });

    await page.locator('.face-active .flexlayout__border_button', { hasText: 'Sessions' }).click();
    const session = page.locator(`.face-active [data-testid="session-${sessionId}"]`);
    await expect(session).toBeVisible({ timeout: 20_000 });
    await session.click();
    await expect(page.getByTestId('status-session')).toContainText(sessionId, { timeout: 10_000 });

    // ── into depth, onto the governance-primary pane ───────────────────────
    await switchLayout(page, 'ide-deep');
    await ensureFace(page, '1');
    await page
        .locator('.face-active .flexlayout__tab_button', { hasText: ACR_TAB_LABEL })
        .first()
        .click();
    const room = page.locator('.face-active [data-testid="agentic-control-room"]');
    await expect(room).toBeVisible({ timeout: 20_000 });
    const audit = room.locator('[data-testid="acr-evidence-audit"]');
    await expect(audit).toBeVisible({ timeout: 20_000 });

    // (2) file a real anchored deposit through the live method this pane rides.
    const title = `acr-packet-${sessionId}`;
    for (const [field, value] of Object.entries({
        title,
        candidateId: 'cand-acr-1',
        coordinate: 'M5-4',
        sourceAnchor: 'Idea/Empty/Present/acr-audit.md',
        graphAnchor: 'bimba://M5-4/evidence',
        reviewId: 'rev-acr-1',
        testAnchor: 'tests/e2e/agentic-control-room-deep.spec.ts'
    })) {
        await room.getByTestId(`deposit-field-${field}`).fill(value);
    }
    await room.getByTestId('deposit-submit').click();

    const packetRow = audit.locator('[data-testid="evidence-packet-row"]', { hasText: title });
    await expect(packetRow).toBeVisible({ timeout: 30_000 });

    // (3) THE DEEP FOLD. Selecting the record renders the governance audit.
    await packetRow.click();
    const view = audit.locator('[data-testid="evidence-packet-view"]');
    await expect(view).toHaveAttribute('data-fold', 'deep', { timeout: 20_000 });
    // the dispatch trace is OPEN here — collapsed is the abbreviated folding
    await expect(view.locator('[data-testid="dispatch-mini-graph"]')).toHaveAttribute(
        'data-expanded',
        'true'
    );
    // the IOD-17 three-face readout, populated from the LIVE capability matrix
    const parity = view.locator('[data-testid="evidence-iod17-parity"]');
    await expect(parity).toBeVisible({ timeout: 20_000 });
    for (const face of ['capability-matrix', 'agent-contract', 'widget']) {
        await expect(view.locator(`[data-testid="evidence-iod17-cell-${face}"]`)).toHaveAttribute(
            'data-state',
            'human-required'
        );
    }
    await expect(parity).toHaveAttribute('data-in-parity', 'true');
    await expect(
        view.locator('[data-testid="evidence-iod17-violation"]'),
        'three agreeing faces must not raise the violation banner'
    ).toHaveCount(0);

    // (4) the seam the substrate does not resolve, disabled and named on screen.
    const axiom = view.locator('[data-testid="evidence-axiom-link"]');
    await expect(axiom).toHaveAttribute('data-wire-state', 'unwired');
    await expect(axiom).toContainText('ide-shell-m0-m5/axiom-translation-inspector');
    await expect(view.locator('[data-testid="evidence-axiom-link-button"]')).toBeDisabled();
});

/**
 * 28.T28.9 — DR-WC-IS-2's REVIEW split, driven end to end.
 *
 * The gap this closes is not cosmetic. Before this tranche NO carrier surface
 * but the deep control room read `s5'.review.inbox`: the always-on Review fold
 * projected genealogy records into generic blocks, so the `/` membrane's
 * "review" was a dispatch history wearing the word. Proving the split therefore
 * needs a REAL review item on the real wire, seen in BOTH surfaces — so this
 * spec submits one through the live `s5'.review.submit` and then reads it twice.
 *
 * Four claims:
 *   (1) the `/` Review fold renders the row LIVE (`data-inbox-source="live"`),
 *       at `fold="abbreviated"`, and carries NO parity matrix — DR-WC-IS-2 gives
 *       the readout to the governance fold, and the surface says so;
 *   (2) crossing INTO the deep pane is DISABLED there and names the target the
 *       ledger cannot promote (`agenticControlRoom`, 52.T3 / 28.T28.14) —
 *       the same honesty 28.T28.8 landed from the evidence side;
 *   (3) the SAME row in the control room renders at `fold="deep"` with the
 *       three-cell IOD-17 matrix populated from that pane's live
 *       `s4'.mediation.capabilities.list` — three `human-required` faces, in
 *       parity, no violation banner;
 *   (4) the human-required banner carries the parity status line (28.9 e).
 *
 * BUDGET: boot (20s) + a border-tab open + ONE real layout transition (a full
 * FlexLayout remount of both faces, polled at 30s) + the control-room body
 * behind a real tab click (20s). Worst case ~100s, hence 150s. Every wait is on
 * a real signal; there is no `waitForTimeout` in this file.
 */
test('28.T28.9: one live review row, two foldings — abbreviated in `/`, full parity in depth', async ({
    page
}) => {
    test.setTimeout(150_000);

    // A REAL item on the REAL wire. `s5'.review.submit` is one of the four arms
    // `Body/S/S5/epii-review-core/src/s5_handlers.rs::S5_REVIEW_METHODS` owns.
    const title = `e2e review split ${Date.now().toString(36)}`;
    const submitted = (await gatewayRpc("s5'.review.submit", {
        source: 'human_gate',
        title,
        body: 'the row both foldings must render',
        priority: 'blocking',
        coordinate_context: { coordinate: 'M5-4' },
        proposed_action: null,
        requires_human: true
    })) as { item?: { item_id?: string } };
    const itemId = submitted?.item?.item_id;
    expect(itemId, "s5'.review.submit must return the stored item id").toBeTruthy();

    await boot(page);
    await ensureFace(page, '1');

    // ── (1) the ABBREVIATED folding, in the always-on `/` membrane ─────────
    // The house idiom: clicking an ALREADY-selected border button collapses the
    // border, so select only when it is not already the open fold.
    const reviewButton = page
        .locator('.face-active .flexlayout__border_button', { hasText: 'Review' })
        .first();
    await expect(reviewButton).toBeVisible({ timeout: 20_000 });
    if (!/--selected/.test((await reviewButton.getAttribute('class')) ?? '')) {
        await reviewButton.click();
    }
    await expect(reviewButton).toHaveClass(/--selected/);
    const inbox = page.locator('.face-active [data-testid="review-inbox"]');
    await expect(inbox).toBeVisible({ timeout: 20_000 });
    await expect(inbox).toHaveAttribute('data-inbox-source', 'live', { timeout: 20_000 });

    const abbreviated = inbox.locator(`[data-testid="review-item-${itemId}"]`);
    await expect(abbreviated).toBeVisible({ timeout: 20_000 });
    await expect(abbreviated).toHaveAttribute('data-fold', 'abbreviated');
    await expect(abbreviated).toHaveAttribute('data-human-required', 'true');
    await expect(
        abbreviated.locator(`[data-testid="review-iod17-${itemId}"]`),
        'the three-cell readout is the governance folding’s (DR-WC-IS-2)'
    ).toHaveCount(0);
    await expect(
        abbreviated.locator(`[data-testid="review-item-parity-status-${itemId}"]`)
    ).toContainText('governance fold');

    // ── (2) the crossing the carrier cannot route, disabled and named ──────
    const crossing = abbreviated.locator(
        `[data-testid="review-open-governance-audit-${itemId}"]`
    );
    await expect(crossing).toHaveAttribute('data-wire-state', 'unwired');
    await expect(crossing).toContainText('agenticControlRoom');
    await expect(
        crossing.locator(`[data-testid="review-open-governance-audit-${itemId}-button"]`)
    ).toBeDisabled();

    // ── into depth, onto the governance-primary pane ───────────────────────
    await switchLayout(page, 'ide-deep');
    await ensureFace(page, '1');
    await page
        .locator('.face-active .flexlayout__tab_button', { hasText: ACR_TAB_LABEL })
        .first()
        .click();
    const room = page.locator('.face-active [data-testid="agentic-control-room"]');
    await expect(room).toBeVisible({ timeout: 20_000 });

    // ── (3) the SAME row, deep — the parity matrix over the live matrix ────
    const deep = room.locator(`[data-testid="review-item-${itemId}"]`);
    await expect(deep).toBeVisible({ timeout: 30_000 });
    await expect(deep).toHaveAttribute('data-fold', 'deep');
    const matrix = deep.locator(`[data-testid="review-iod17-${itemId}"]`);
    await expect(matrix).toBeVisible({ timeout: 20_000 });
    for (const face of ['capability-matrix', 'agent-contract', 'widget']) {
        const cell = deep.locator(`[data-testid="review-iod17-cell-${face}"]`);
        await expect(cell).toHaveAttribute('data-state', 'human-required');
        await expect(cell).toHaveAttribute('data-agrees', 'true');
    }
    await expect(matrix).toHaveAttribute('data-in-parity', 'true');
    await expect(
        deep.locator(`[data-testid="review-iod17-violation-${itemId}"]`),
        'three agreeing faces must not raise the violation banner'
    ).toHaveCount(0);
    await expect(
        deep.locator(`[data-testid="review-open-governance-audit-${itemId}"]`),
        'the deep fold does not offer a crossing to itself'
    ).toHaveCount(0);

    // ── (4) the human-required banner, extended with the parity status line ─
    const gate = deep.locator(`[data-testid="review-item-human-gate-${itemId}"]`);
    await expect(gate).toContainText('Human ratification required');
    await expect(
        deep.locator(`[data-testid="review-item-parity-status-${itemId}"]`)
    ).toContainText('all three faces agree');
});

/**
 * 26.T26.7 — the T8 `<ToolStream />`, reachable at last.
 *
 * 26.7 (a) lists a ToolStream among the deep control room's T8 contents, and
 * this carrier composes it as the ONE `tool-stream` fold instead of a second
 * instance over the same dataset. That composition is a CLAIM about a crossing,
 * and the crossing did not hold: the pane's button said "open the temporal fold"
 * and fired `agentic-control-room.select-run`, which the 27.9 table resolves to
 * `dispatch-trace` — the structural fold the pane already renders. So the
 * time-ordered list was reachable from the governance surface by no path, and
 * the compositional argument that justified not duplicating it was untrue.
 *
 * The unit suites pin the route and the payload; only a real browser can prove
 * the whole seam — that the click really opens the Tools border fold on the
 * active face and that the fold really lands on the SAME node, which is what
 * "one dataset, two foldings" (15.11) means. Three claims:
 *   (1) the crossing opens the Tools fold (`revealBorderTab` → `omni-tool-stream`
 *       on the deep face's model), and the governance pane is still the only
 *       place the tree is rendered — no second ToolStream inside it;
 *   (2) the row the temporal fold selects is the node id the RunTree selected,
 *       read off the DOM of both surfaces, not off a fixture;
 *   (3) the fold's detail names that run — i.e. the node really resolved through
 *       `genealogyIndex`, rather than a payload landing on an unknown id.
 *
 * BUDGET: boot (20s) + one real layout transition (a full FlexLayout remount of
 * both faces, polled at 30s) + the control-room body behind a tab click (20s) +
 * the border fold. Worst case ~90s, hence 120s. Every wait is on a real signal.
 */
test('26.T26.7: the control room’s temporal crossing lands the SAME run in the Tools fold', async ({
    page
}) => {
    test.setTimeout(120_000);

    // A genealogy needs a session lineage; the fold synthesises nothing, so one
    // real session is imported rather than hoping the boot left one behind.
    const sessionKey = `agent:pi:subagent:moirai-${Date.now().toString(36)}`;
    await gatewayRpc('sessions.import', {
        targetSessionKey: sessionKey,
        sourceSessionKey: 'agent:pi',
        label: 'e2e acr temporal crossing'
    });

    await boot(page);
    await switchLayout(page, 'ide-deep');
    await ensureFace(page, '1');
    await page
        .locator('.face-active .flexlayout__tab_button', { hasText: ACR_TAB_LABEL })
        .first()
        .click();
    const room = page.locator('.face-active [data-testid="agentic-control-room"]');
    await expect(room).toBeVisible({ timeout: 20_000 });

    // (1) the governance pane hosts the STRUCTURAL fold and only that one.
    await expect(
        room.locator('[data-testid="tool-stream-panel"]'),
        'a second ToolStream in the governance pane would be two readers of one dataset'
    ).toHaveCount(0);

    const node = room.locator('[data-testid="dispatch-tree-node"]').first();
    await expect(node).toBeVisible({ timeout: 30_000 });
    const nodeId = await node.getAttribute('data-node-id');
    expect(nodeId, 'the RunTree node carries the genealogy identity').toBeTruthy();
    await node.locator('[data-testid="dispatch-tree-node-row"]').first().click();

    const crossing = room.locator('[data-testid="acr-open-tool-stream"]');
    await expect(crossing).toBeVisible({ timeout: 20_000 });
    // the affordance states the fold it opens, and it is the TIME-ORDERED one
    await expect(crossing).toHaveAttribute('data-lands-on', 'tool-stream');
    await crossing.click();

    // (1) the Tools border fold really opened on the face on screen
    const toolsButton = page
        .locator('.face-active .flexlayout__border_button', { hasText: 'Tools' })
        .first();
    await expect(toolsButton).toHaveClass(/--selected/, { timeout: 20_000 });
    const stream = page.locator('.face-active [data-testid="tool-stream-panel"]');
    await expect(stream).toBeVisible({ timeout: 20_000 });

    // (2) the SAME node, selected in the temporal folding
    const row = stream.locator(`[data-testid="dispatch-stream-row"][data-node-id="${nodeId}"]`);
    await expect(row.first()).toHaveAttribute('aria-selected', 'true', { timeout: 20_000 });

    // (3) …and it resolved: the fold's detail is that run, not an empty payload
    const detail = stream.locator('[data-testid="tool-stream-detail"]');
    await expect(detail).toBeVisible({ timeout: 20_000 });
    await expect(detail).toContainText(await node.locator('.dispatch-node-method').first().innerText());
});

/**
 * 26.T26.9 — Aletheia subagent surfacing, in the running app.
 *
 * The tranche's risk is precisely the one a unit render cannot rule out: a
 * lineage list that renders from the roster CONSTANT and reads as live. So this
 * spec imports ONE real subagent session through the gateway and then asserts
 * the ASYMMETRY — the imported subagent reads `data-observed="true"` and the
 * other five read `false`, in a real browser over a real `sessions.list`. A
 * surface backed by a constant would show six `true`s (or six `false`s) and
 * fail. Three claims:
 *   (1) the six surface with their OWN contributions — the badge that used to
 *       be a bare lowercase id now carries CF binding and trace kind;
 *   (2) `observed` comes from the wire: exactly the imported one is true;
 *   (3) the RunTree node for that subagent expands into `<AletheiaSubagentTrace/>`,
 *       and the absent facet-return feed is named on the surface rather than
 *       leaving an affordance that looks live and can never fire.
 *
 * BUDGET: boot (20s) + one real layout transition (30s) + the control-room body
 * behind a tab click (20s) + the lineage section off `sessions.list` (20s).
 * Worst case ~90s, hence 120s. Every wait is on a real signal.
 */
test('26.T26.9: the Aletheia lineage is read off the live session lineage, not the roster', async ({
    page
}) => {
    test.setTimeout(120_000);

    // A real Aletheia subagent session. `sessions.import` is `store.ensure`, so
    // a fixed key is idempotent across runs; the id after `:subagent:` is what
    // `dispatchGenealogyFromSessions` resolves the guardian identity from.
    await gatewayRpc('sessions.import', {
        targetSessionKey: 'agent:pi:subagent:anansi',
        sourceSessionKey: 'agent:pi',
        label: 'e2e aletheia lineage'
    });

    await boot(page);
    await switchLayout(page, 'ide-deep');
    await ensureFace(page, '1');
    await page
        .locator('.face-active .flexlayout__tab_button', { hasText: ACR_TAB_LABEL })
        .first()
        .click();
    const room = page.locator('.face-active [data-testid="agentic-control-room"]');
    await expect(room).toBeVisible({ timeout: 20_000 });

    const lineage = room.locator('[data-testid="acr-aletheia-lineage"]');
    await expect(lineage).toBeVisible({ timeout: 20_000 });

    // (1) six rows, each carrying its own contribution
    await expect(room.locator('[data-testid^="acr-aletheia-"][data-observed]')).toHaveCount(6, {
        timeout: 20_000
    });
    await expect(room.locator('[data-testid="acr-aletheia-anansi"]')).toContainText(
        'citation trail'
    );
    await expect(room.locator('[data-testid="acr-aletheia-mercurius"]')).toContainText(
        'kairos signal'
    );

    // (2) THE ASYMMETRY. Only the session that really exists is observed.
    await expect(room.locator('[data-testid="acr-aletheia-anansi"]')).toHaveAttribute(
        'data-observed',
        'true',
        { timeout: 20_000 }
    );
    for (const absent of ['janus', 'moirai', 'agora', 'zeithoven']) {
        await expect(
            room.locator(`[data-testid="acr-aletheia-${absent}"]`),
            `${absent} has no session — a roster-backed render would claim otherwise`
        ).toHaveAttribute('data-observed', 'false');
    }

    // (3) the RunTree node expands into the sub-trace, and the absent feed is named
    const trace = room.locator('[data-testid="aletheia-subagent-trace-anansi"]');
    await expect(trace).toBeVisible({ timeout: 20_000 });
    await expect(trace).toHaveAttribute('data-cf', 'CF0');
    await expect(trace).toContainText('source-to-source provenance graph');
    await expect(room.locator('[data-testid="acr-aletheia-seam-facet-return-feed"]')).toHaveAttribute(
        'data-available',
        'false'
    );
    await expect(room.locator('[data-testid="aletheia-no-return-anansi"]')).toContainText(
        'no facet return on this dispatch'
    );
});
