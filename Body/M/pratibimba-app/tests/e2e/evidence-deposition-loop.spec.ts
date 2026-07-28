/**
 * Coordinate: M' M5' (Evidence deposition loop — Track 26.T26.4, UF class)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): real Chromium / real spawned gateway carrier proof
 * Actualises: the closed deposition loop the Evidence fold never had. Two
 *   defects kept it empty and only one of them was the missing read method:
 *
 *     1. The WRITE could not succeed. The inline form posted its packet-shaped
 *        draft verbatim to `s5'.epii.deposit`, which deserialises params into
 *        `DepositRequest` — so every submit was refused by serde before it
 *        reached the review store. Its unit test asserted the broken shape
 *        against a permissive mock, so the mock passed and the method never did.
 *     2. The READ did not exist, and now does (`s5'.epii.deposit.list`).
 *
 *   Only the running app against a real gateway can prove the two agree, which
 *   is what this spec does: deposit through the actual form, then find that
 *   deposit in the fold's list. A jsdom mock cannot prove it, because a mock is
 *   exactly what hid the defect.
 * Does NOT own: the deposit contract (S5' epii-agent-core), the review store.
 * Contract: [[M5'-SPEC]] + rerun tranche [[26.T26.4]].
 */

import { expect, test } from '@playwright/test';
import { gatewayRpc } from './gateway-rpc';

test('26.T26.4: a deposit made through the Evidence fold comes back out of it', async ({ page }) => {
    await page.goto('/');
    const shell = page.getByTestId('shell');
    await expect(shell).toBeVisible();
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });

    await page
        .locator('.face-active .flexlayout__border_button', { hasText: 'Evidence' })
        .first()
        .click();
    await expect(shell).toHaveAttribute('data-omnipanel-active-tab', 'evidence');

    const panel = page.getByTestId('evidence-panel');
    await expect(panel).toBeVisible();
    // The fold reads the live list on mount: either rows or an honest empty —
    // never the "unavailable" state, which would mean the read method is gone.
    await expect(page.getByTestId('evidence-deposits')).toBeVisible();
    await expect(page.getByTestId('evidence-deposits-error')).toHaveCount(0);

    const before = Number(await page.getByTestId('evidence-deposit-count').textContent());

    // Deposit through the REAL inline form — not a fabricated store write.
    await page.getByTestId('evidence-deposit-new').click();
    const form = page.getByTestId('evidence-deposit-form');
    await expect(form).toBeVisible();

    const title = `e2e-deposit-${Date.now().toString(36)}`;
    const fields: Record<string, string> = {
        title,
        candidateId: 'cand-e2e-1',
        coordinate: 'M5-4',
        sourceAnchor: 'Idea/Empty/Present/e2e-deposit.md',
        graphAnchor: 'bimba://M5-4/evidence',
        reviewId: 'rev-e2e-1',
        testAnchor: 'tests/e2e/evidence-deposition-loop.spec.ts'
    };
    for (const [field, value] of Object.entries(fields)) {
        await page.getByTestId(`deposit-field-${field}`).fill(value);
    }

    await page.getByTestId('deposit-submit').click();

    // The gateway ACCEPTED it. A refusal keeps the form open carrying its
    // reason, so the form CLOSING is the acceptance signal — the fold closes it
    // from `onDeposited`, which only fires on a resolved deposit. (Asserting on
    // the inline `deposit-ok` receipt cannot work here: it unmounts with the
    // form in the same commit.) Both earlier defects surfaced exactly here —
    // first a serde refusal for the packet-shaped draft, then "unsupported Epii
    // deposit source_agent: epii" once it parsed.
    await expect(page.getByTestId('deposit-refused')).toHaveCount(0, { timeout: 20_000 });
    await expect(form).toHaveCount(0, { timeout: 20_000 });

    // ...and the read sibling now shows the very row the write just created.
    const deposits = page.getByTestId('evidence-deposits');
    await expect(deposits).toContainText(title, { timeout: 20_000 });
    await expect(page.getByTestId('evidence-deposit-count')).not.toHaveText(String(before));

    const row = page.locator('.evidence-deposit-row', { hasText: title }).first();
    await expect(row).toHaveAttribute('data-deposit-type', 'review_item');
    await expect(row).toContainText('M5-4');
    await expect(row).toContainText('Idea/Empty/Present/e2e-deposit.md');
});

// UNRESOLVED, and marked rather than deleted or forced green. The producer is
// proven at every other level — the S5 contract carries `evidence_anchors`, the
// live gateway round-trips them (gate_s5_epii_deposit_list.rs:
// `evidence_anchors_survive_the_deposit_round_trip`), and the composition is
// unit-covered. In the BROWSER path the panel reports
// `data-packet-context="ready"` and the deposit lands in the list, but
// `data-anchored-deposits` reads 0 — so the anchors the form sends are not
// coming back through the fold's own read, for a reason not yet established.
// Diagnosing that is the remaining work; a passing packet assertion before it is
// understood would be the fabricated evidence this plan set exists to stop.
test.fixme('26.T26.4: an anchored deposit becomes a real packet whose close-path lands', async ({
    page
}) => {
    // The packet PRODUCER end-to-end. Before it, the fold had no packet at all,
    // so its close-paths could only have been exercised by fabricating one —
    // the exact banned evidence class. Now the claim half (the deposit's
    // anchors) and the run half (the live session genealogy) compose one.
    const sessionId = `e2e-packet-${Date.now().toString(36)}`;
    // A real session for the shell to adopt (same house idiom as
    // m4-session-close-ceremony.spec.ts).
    await gatewayRpc('sessions.import', {
        targetSessionKey: sessionId,
        sourceSessionKey: 'e2e-packet-origin',
        label: 'e2e evidence packet'
    });
    await page.goto('/');
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });

    // A packet is anchored to a session AND a day. Without both, the producer
    // composes nothing rather than inventing an anchor — so establish both for
    // real: begin today (the day-now anchor), then adopt a session.
    await page.locator('.face-active .flexlayout__tab_button', { hasText: 'Now' }).first().click();
    const beginToday = page.getByTestId('now-begin-today');
    const nowPane = page.getByTestId('now-pane');
    await expect(nowPane.or(beginToday).first()).toBeVisible({ timeout: 20_000 });
    if (await beginToday.isVisible().catch(() => false)) {
        await beginToday.click().catch(() => undefined);
    }
    // The day must really be anchored, not merely rendered: `dayNow` reaches the
    // session store only via the explicit begin-today gesture (or a day folder
    // that already exists), and a fresh e2e vault has neither until now.
    await expect(nowPane).toBeVisible({ timeout: 20_000 });
    await expect(nowPane).not.toHaveAttribute('data-day', '', { timeout: 20_000 });

    // Adopt a session by NAME, and assert the shell actually took it. The first
    // draft clicked whichever row happened to be first and only checked that the
    // status strip was non-empty — which passes on a placeholder, so it proved
    // nothing and the packet context stayed absent.
    await page.locator('.face-active .flexlayout__border_button', { hasText: 'Sessions' }).click();
    const session = page.locator(`.face-active [data-testid="session-${sessionId}"]`);
    await expect(session).toBeVisible({ timeout: 20_000 });
    await session.click();
    await expect(page.getByTestId('status-session')).toContainText(sessionId, { timeout: 10_000 });

    await page
        .locator('.face-active .flexlayout__border_button', { hasText: 'Evidence' })
        .first()
        .click();
    await expect(page.getByTestId('evidence-panel')).toBeVisible();

    await page.getByTestId('evidence-deposit-new').click();
    const title = `e2e-packet-${sessionId}`;
    for (const [field, value] of Object.entries({
        title,
        candidateId: 'cand-packet-1',
        coordinate: 'M5-4',
        sourceAnchor: 'Idea/Empty/Present/e2e-packet.md',
        graphAnchor: 'bimba://M5-4/evidence',
        reviewId: 'rev-packet-1',
        testAnchor: 'tests/e2e/evidence-deposition-loop.spec.ts'
    })) {
        await page.getByTestId(`deposit-field-${field}`).fill(value);
    }
    await page.getByTestId('deposit-submit').click();
    await expect(page.getByTestId('evidence-deposit-form')).toHaveCount(0, { timeout: 20_000 });

    // The deposit half landed (localises a failure below to the producer).
    await expect(page.getByTestId('evidence-deposits')).toContainText(title, { timeout: 20_000 });

    // Localise: is there a shell context, and did the anchors survive the read?
    const panel = page.getByTestId('evidence-panel');
    await expect(panel).toHaveAttribute('data-packet-context', 'ready', { timeout: 20_000 });
    await expect(panel).not.toHaveAttribute('data-anchored-deposits', '0', { timeout: 20_000 });

    // THE PACKET. Anchored deposits compose one; un-anchored ones do not.
    const packetRow = page.locator('[data-testid="evidence-packet-row"]', { hasText: title }).first();
    await expect(packetRow).toBeVisible({ timeout: 20_000 });
    await packetRow.click();

    const view = page.getByTestId('evidence-packet-view');
    await expect(view).toBeVisible();
    // The review item id IS the packet id and its own S5 ref — a real reference,
    // not a synthesised one.
    await expect(page.getByTestId('evidence-s5-refs')).not.toHaveText('');
    // The deposit is a real human-required gate landing, pending until resolved.
    await expect(page.getByTestId('evidence-gate-landings')).toContainText('human-required');

    // A CLOSE-PATH, exercised against a real packet for the first time: the
    // tool-stream link carries THIS packet's id and activates that fold.
    await page.getByTestId('evidence-open-tools').click();
    await expect(page.getByTestId('shell')).toHaveAttribute(
        'data-omnipanel-active-tab',
        'tool-stream'
    );
});
