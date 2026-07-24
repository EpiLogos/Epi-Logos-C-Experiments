/**
 * Coordinate: M' (drivable-loop spec: 15.T15.2 session continuity across the 0/1 toggle)
 * Actualises: the ONE 15.2 law that needed proof after the 27.T27.0
 *   integration (fate: carried-by-integration per DR-FACE-7 — UF-prove, no
 *   construction): **sessions persist across the `daily-0-1` ↔ `ide-deep`
 *   transition**, whose carrier form is the ⌘. face toggle (personal face 1
 *   ↔ cosmic face 0). A REAL gateway session record is created over the wire
 *   (`sessions.import`, house idiom via gateway-rpc.ts), bound at the real
 *   surface (SessionsPane click), and then proven to survive BOTH toggle
 *   directions at the real surface — not by store inspection: the two faces
 *   hold two separate flexlayout models with two separate SessionsPane
 *   INSTANCES, so the cosmic face's pane showing the same bound record is a
 *   genuine cross-face continuity observation (the mechanism underneath is
 *   the module-scope zustand session store + the shared OMNI_BORDER manifest,
 *   App.tsx; the observation here is the rendered DOM).
 *
 * CAPABILITY SURFACE — honest reading (never fabricated):
 *   15.2's verification asks that "session id and capability list survive"
 *   the transitions. The Gateway fold (the designated surface for
 *   `s4'.mediation.capabilities.list` + the parity check) is now `landed: true`
 *   in OMNIPANEL_TABS: 27.T27.7 landed the live GatewayPanel, which folds the
 *   real capability snapshot (`loadMediationCapabilitySnapshot`) and parity
 *   (`isSnapshotCapabilityAllowed`) — the pi-permitted matrix stays 12.10's, so
 *   when the method is unavailable GatewayPanel renders its own
 *   bridge_unavailable ReadinessBanner rather than a fabricated list.
 *   So this spec asserts what IS real on both faces and both directions:
 *     (a) the bound session identity (status strip + per-face SessionsPane
 *         bound marker), and
 *     (b) the real capability surface — the 8-fold `/` membrane manifest
 *         rendered as border tabs on BOTH faces (15.2 law landed by 27.T27.0),
 *         and the Gateway fold's live GatewayPanel (27.7) reading identically on
 *         both faces (never the pending pane).
 *   It never asserts a fabricated capability list.
 *
 * SUITE-ORDER DETERMINISM (15.T15.12 law, applied): the e2e harness shares
 *   ONE gateway SessionStore per run, so the session LIST differs between
 *   suite order and isolation — this spec therefore pins its own target
 *   (unique imported key, explicit bind click; the ensureTabSelected analogue
 *   for border tabs pins every tab it reads). No day-coupled state is
 *   asserted, so `ensureDayAnchored` is not needed here — the only
 *   suite-order channel this spec touches is the session list, and the
 *   explicit bind closes it. Passes in FULL-SUITE order and in isolation.
 * Does NOT own: the toggle law (15.5/DR-UI-4), the manifest
 *   (src/panes/omni/omnipanelRuntime.ts), session records (S3 SessionStore).
 */

import { expect, Locator, Page, test } from '@playwright/test';
import { gatewayRpc } from './gateway-rpc';

/** The 8-fold `/` membrane manifest labels (OMNIPANEL_TABS law, asserted
 *  independently of the source constant so the spec pins the LAW). */
const OMNI_FOLD_LABELS = [
    'Pi',
    'Sessions',
    'Dispatch',
    'Tools',
    'Evidence',
    'Review',
    'Gateway',
    'Diagnostics'
] as const;

async function bootConnected(page: Page): Promise<void> {
    await page.goto('/');
    await expect(page.getByTestId('shell')).toBeVisible();
    await expect(page.getByTestId('status-gateway')).toContainText('connected', {
        timeout: 20_000
    });
}

/** ⌘. is the # inversion toggle (house idiom, visual-regression.spec). The
 *  active slot is awaited to full opacity so every subsequent read happens
 *  on a settled face, in both suite order and isolation. */
async function toggleFace(page: Page, expected: '0' | '1'): Promise<void> {
    await page.keyboard.press('Meta+.');
    await expect(page.getByTestId('shell')).toHaveAttribute('data-face', expected);
    await expect
        .poll(() =>
            page.locator('.face-slot.face-active').evaluate(el => getComputedStyle(el).opacity)
        )
        .toBe('1');
}

/** Border-tab analogue of visual-regression's ensureTabSelected: border
 *  buttons TOGGLE on click (a second click closes the border), so the tab
 *  is pinned by selected-class inspection, never a blind click. Scoped to
 *  the active face — the hidden face keeps its own border DOM alive. */
async function ensureBorderTabSelected(page: Page, name: string): Promise<Locator> {
    const button = page
        .locator('.face-active .flexlayout__border_button', { hasText: name })
        .first();
    await expect(button).toBeVisible();
    if (!/--selected/.test((await button.getAttribute('class')) ?? '')) {
        await button.click();
    }
    await expect(button).toHaveClass(/--selected/);
    return button;
}

/** The real capability surface, read on the ACTIVE face: all eight folds of
 *  the `/` membrane present as border tabs, and the Gateway fold (the
 *  designated capability-list surface) rendering the live GatewayPanel (27.7 —
 *  folded from s4'.mediation.capabilities.list; never the pending pane, never a
 *  fabricated list) — identical on both faces by 15.2 law. */
async function assertCapabilitySurface(page: Page): Promise<void> {
    for (const label of OMNI_FOLD_LABELS) {
        await expect(
            page
                .locator('.face-active .flexlayout__border_right .flexlayout__border_button', {
                    hasText: label
                })
                .first(),
            `OmniPanel fold "${label}" must ride the active face's / membrane (15.2)`
        ).toBeVisible();
    }
    await ensureBorderTabSelected(page, 'Gateway');
    // 27.T27.7 landed: the Gateway fold now renders the LIVE GatewayPanel — the
    // capability surface folded from s4'.mediation.capabilities.list — and no
    // longer the honest pending body. It reads identically on both faces (15.2).
    // The live capability list itself is never fabricated: when the method is
    // unavailable GatewayPanel renders its own bridge_unavailable ReadinessBanner
    // (still the gateway-panel surface, never the pending pane).
    const gatewayFold = page.locator('.face-active [data-testid="gateway-panel"]');
    await expect(
        gatewayFold,
        'the Gateway fold renders the live GatewayPanel capability surface (27.7)'
    ).toBeVisible();
    await expect(
        page.locator('.face-active [data-testid="omni-pending-pane"][data-tab="gateway"]'),
        'the Gateway fold no longer renders the pending pane now that 27.7 has landed'
    ).toHaveCount(0);
}

/** The bound-session reading at the real surface of the ACTIVE face: this
 *  face's own SessionsPane instance shows the record carrying the bound
 *  marker (`session-bound` class + ◈ prefix). */
async function assertSessionBoundOnActiveFace(page: Page, canonicalKey: string): Promise<void> {
    await ensureBorderTabSelected(page, 'Sessions');
    const sessionButton = page.locator(
        `.face-active [data-testid="session-${canonicalKey}"]`
    );
    await expect(
        sessionButton,
        'the gateway session record must surface in this face\'s own sessions pane'
    ).toBeVisible({ timeout: 15_000 });
    await expect(sessionButton).toHaveClass(/session-bound/);
    await expect(sessionButton).toContainText('◈');
}

test('15.2: session identity + the real capability surface survive the 0/1 face toggle, both directions', async ({
    page
}) => {
    // a REAL session record in the spawned gateway's SessionStore, unique to
    // this run (suite-order determinism: the target is pinned, never ambient)
    const sessionKey = `e2e-continuity-${Date.now().toString(36)}`;
    const result = (await gatewayRpc('sessions.import', {
        targetSessionKey: sessionKey,
        sourceSessionKey: 'e2e-origin',
        label: 'e2e session continuity'
    })) as { ok?: boolean; canonicalKey?: string };
    expect(result?.canonicalKey, 'sessions.import returned no canonicalKey').toBeTruthy();
    const canonicalKey = result.canonicalKey as string;

    await bootConnected(page);
    await expect(page.getByTestId('shell')).toHaveAttribute('data-face', '1');

    // ---- personal face (the daily-0-1 pole): bind at the real surface ----
    await ensureBorderTabSelected(page, 'Sessions');
    const personalButton = page.locator(`.face-active [data-testid="session-${canonicalKey}"]`);
    await expect(personalButton).toBeVisible({ timeout: 15_000 });
    await personalButton.click();
    await expect(personalButton).toHaveClass(/session-bound/);
    await expect(page.getByTestId('status-session')).toContainText(canonicalKey);

    // the capability surface as it really exists, pre-toggle
    await assertCapabilitySurface(page);

    // the exact visible identity string this spec holds constant through
    // every transition (◈-prefixed session key in the status strip)
    const identityBefore = (await page.getByTestId('status-session').textContent()) ?? '';
    expect(identityBefore).toContain(canonicalKey);

    // ---- toggle 1 → 0 (the ide-deep / cosmic pole) ----
    await toggleFace(page, '0');
    await expect(
        page.getByTestId('status-session'),
        'session identity must survive the 1 → 0 crossing unchanged'
    ).toHaveText(identityBefore);
    // the cosmic face's OWN SessionsPane instance reads the same binding —
    // cross-face continuity observed at the rendered surface
    await assertSessionBoundOnActiveFace(page, canonicalKey);
    await assertCapabilitySurface(page);

    // ---- toggle back 0 → 1 ----
    await toggleFace(page, '1');
    await expect(
        page.getByTestId('status-session'),
        'session identity must survive the 0 → 1 return unchanged'
    ).toHaveText(identityBefore);
    await assertSessionBoundOnActiveFace(page, canonicalKey);
    await assertCapabilitySurface(page);
});
